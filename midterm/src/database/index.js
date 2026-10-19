'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { statements } = require('./schema');
const { roles, entities } = require('../routes/entities');
const { hashPassword } = require('../services/password');
const { transaction, one, insert, event } = require('../repositories/sql');
async function initialize(config) {
  const mysql = require('mysql2/promise');
  const { MongoClient } = require('mongodb');
  let pool, client;
  try {
    const {connectionLimit,...connectionConfig}=config.mysql;
    try { const connection = await mysql.createConnection(connectionConfig); await connection.end(); }
    catch (error) {
      if (error.code !== 'ER_BAD_DB_ERROR') throw error;
      const { database, ...server } = connectionConfig;
      const connection = await mysql.createConnection(server);
      try { await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); } finally { await connection.end(); }
    }
    pool = mysql.createPool(config.mysql);
    for (const statement of statements()) await pool.query(statement);
    const [leaderConstraint]=await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=? AND TABLE_NAME='fm_crews' AND CONSTRAINT_NAME='fm_crews_leader_fk'",[config.mysql.database]);
    if(!leaderConstraint.length)await pool.query('ALTER TABLE fm_crews ADD CONSTRAINT fm_crews_leader_fk FOREIGN KEY(leader_id) REFERENCES fm_members(id)');
    for(const [column,target] of [['category_id','fm_resource_categories'],['location_id','fm_resource_locations']]) {
      const constraint=`fm_resources_${column}_fk`;
      const [existing]=await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=? AND TABLE_NAME='fm_resources' AND CONSTRAINT_NAME=?",[config.mysql.database,constraint]);
      if(!existing.length)await pool.query(`ALTER TABLE fm_resources ADD CONSTRAINT ${constraint} FOREIGN KEY(${column}) REFERENCES ${target}(id)`);
    }
    await pool.query('INSERT IGNORE INTO fm_mutex(id) VALUES(1)');
    for (const role of roles) await pool.query('INSERT IGNORE INTO fm_roles(name,description) VALUES(?,?)',[role,role]);
    for (const d of Object.values(entities)) for (const role of d.write) await pool.query('INSERT IGNORE INTO fm_role_permissions(role,permission) VALUES(?,?)',[role,`${d.key}:write`]);
    client = new MongoClient(config.mongoUrl, { serverSelectionTimeoutMS: 5000 });
    await client.connect(); const mongo = client.db(config.mongoDb);
    for (const name of ['fm_activity','fm_member_history','fm_task_history','fm_resource_history','fm_audit']) {
      await mongo.collection(name).createIndex({eventId:1},{unique:true});
      await mongo.collection(name).createIndex({entity:1,targetId:1,occurredAt:-1});
      await mongo.collection(name).createIndex({crewId:1,memberId:1,occurredAt:-1});
    }
    await mongo.collection('fm_evaluations').createIndex({memberId:1,taskId:1,createdAt:-1});
    await mongo.collection('fm_evaluations').createIndex({eventId:1},{unique:true,partialFilterExpression:{eventId:{$type:'string'}}});
    const db = { pool, mongo, async close() { await Promise.allSettled([pool.end(),client.close()]); } };
    await bootstrap(db,config); return db;
  } catch (error) { if(pool) await pool.end(); if(client) await client.close(); throw error; }
}
async function bootstrap(db, config) {
  const credentials = [];
  await transaction(db,async conn => {
    if (!await one(conn,'SELECT id FROM fm_accounts LIMIT 1')) {
      const password = config.initialPassword || crypto.randomBytes(24).toString('base64url');
      const memberId = await insert(conn,'fm_members',{name:'시스템 관리자',role:'Administrator',status:'ACTIVE'});
      await insert(conn,'fm_accounts',{username:'admin',member_id:memberId,password_hash:await hashPassword(password)});
      credentials.push(`admin\t${password}`);
      await event(conn,null,'bootstrap','members',null,{id:memberId,role:'Administrator',status:'ACTIVE'},'최초 관리자');
      // Write before commit so failed filesystem delivery cannot leave an inaccessible new account.
      fs.writeFileSync(path.join(config.local,'initial-accounts.txt'),credentials.join('\n')+'\n',{mode:0o600,flag:'w'});
    }
    if(config.demo && !await one(conn,"SELECT name FROM fm_settings WHERE name='demo_seed_v1'")) {
      const crewA = await insert(conn,'fm_crews',{name:'운영 지원',description:'회의 준비와 문서 정리'});
      const crewB = await insert(conn,'fm_crews',{name:'시설 관리',description:'비품 및 공용 시설 점검'});
      const ids={};
      for(const [username,role,crew,status] of [['boss','Boss',crewA,'ACTIVE'],['underboss','Underboss',crewA,'ACTIVE'],['capo-a','Capo',crewA,'ACTIVE'],['capo-b','Capo',crewB,'ACTIVE'],['soldier','Soldier',crewA,'ACTIVE'],['associate','Associate',crewA,'ACTIVE'],['suspended','Soldier',crewA,'SUSPENDED'],['withdrawn','Associate',crewB,'WITHDRAWN']]) {
        const password=crypto.randomBytes(24).toString('base64url');
        ids[username]=await insert(conn,'fm_members',{name:username,role,crew_id:crew,status});
        await insert(conn,'fm_accounts',{username,member_id:ids[username],password_hash:await hashPassword(password)});
        credentials.push(`${username}\t${password}`);
        await event(conn,null,'demo.created','members',null,{id:ids[username],crew_id:crew,role,status},'선택형 예시 데이터');
      }
      await conn.query('UPDATE fm_crews SET leader_id=? WHERE id=?',[ids['capo-a'],crewA]);
      await conn.query('UPDATE fm_crews SET leader_id=? WHERE id=?',[ids['capo-b'],crewB]);
      await conn.query('INSERT INTO fm_management(member_id,crew_id) VALUES(?,?),(?,?)',[ids.underboss,crewA,ids.underboss,crewB]);
      const base = Date.now()+86400000;
      const fmt = ms => new Date(ms).toISOString().slice(0,23).replace('T',' ');
      const task1=await insert(conn,'fm_tasks',{title:'주간 회의 준비',crew_id:crewA,starts_at:fmt(base),ends_at:fmt(base+3600000)});
      await insert(conn,'fm_tasks',{title:'충돌 확인용 문서 정리',crew_id:crewA,starts_at:fmt(base+1800000),ends_at:fmt(base+5400000)});
      const done=await insert(conn,'fm_tasks',{title:'비품 목록 정리',crew_id:crewA,starts_at:fmt(base-172800000),ends_at:fmt(base-169200000),status:'COMPLETED',result:'비품 목록과 보관 위치 정리 완료'});
      await insert(conn,'fm_participations',{task_id:task1,member_id:ids.soldier});
      await insert(conn,'fm_participations',{task_id:done,member_id:ids.soldier,status:'COMPLETED',contribution:'목록 검토'});
      for(const [name,status] of [['노트북','AVAILABLE'],['회의실','AVAILABLE'],['프로젝터','INSPECTION'],['고장 모니터','UNAVAILABLE'],['사용 중 태블릿','IN_USE']]) {
        const resourceId=await insert(conn,'fm_resources',{name,status,crew_id:crewA,asset_tag:`DEMO-${crypto.randomUUID()}`});
        if(status==='IN_USE') await insert(conn,'fm_reservations',{resource_id:resourceId,member_id:ids.soldier,starts_at:fmt(base-86400000),ends_at:fmt(base),status:'IN_USE',checked_out_at:fmt(base-86400000)});
      }
      await event(conn,null,'demo.completed','tasks',null,{id:done,crew_id:crewA,status:'COMPLETED',result:'비품 목록과 보관 위치 정리 완료'},'시드');
      const evaluationEvent=crypto.randomUUID();
      await conn.query('INSERT INTO fm_outbox(event_id,collection_name,payload) VALUES(?,?,?)',[evaluationEvent,'fm_evaluations',JSON.stringify({eventId:evaluationEvent,entity:'evaluations',action:'demo.evaluation',actor:ids['capo-a'],occurredAt:new Date().toISOString(),memberId:ids.soldier,taskId:done,crewId:crewA,score:4,body:'자료 정리가 정확합니다.',status:'PUBLISHED',version:1,createdAt:new Date().toISOString(),revisions:[{version:1,actor:ids['capo-a'],reason:'예시 평가',score:4,body:'자료 정리가 정확합니다.',at:new Date().toISOString()}]})]);
      await conn.query('INSERT INTO fm_settings(name,value) VALUES(?,?)',['demo_seed_v1','complete']);
      fs.appendFileSync(path.join(config.local,'initial-accounts.txt'),credentials.filter(x=>!x.startsWith('admin\t')).join('\n')+'\n',{mode:0o600});
    }
  });
}
module.exports={initialize};

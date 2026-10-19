'use strict';
const { fail } = require('../validators');
const { one, rows } = require('../repositories/sql');
const { entities, managers } = require('../routes/entities');
async function loadActor(conn, accountId, version) {
  const actor = await one(conn, 'SELECT a.id account_id,a.version,a.status account_status,m.* ,m.id member_id FROM fm_accounts a JOIN fm_members m ON m.id=a.member_id WHERE a.id=?', [accountId]);
  if (!actor || actor.account_status !== 'ACTIVE' || actor.archived || ['SUSPENDED','WITHDRAWN'].includes(actor.status) || (version !== undefined && actor.version !== version)) fail(401,'SESSION_EXPIRED','다시 로그인하세요.');
  return actor;
}
function requireRoles(actor, roles) { if (!roles.includes(actor.role)) fail(403,'FORBIDDEN','이 작업에 필요한 권한이 없습니다.'); }
async function crewAllowed(conn, actor, crewId, write = false) {
  if (actor.role === 'Boss') return true;
  if (actor.role === 'Administrator') return !write;
  if (actor.role === 'Underboss') return !!await one(conn,'SELECT 1 FROM fm_management WHERE member_id=? AND crew_id=?',[actor.member_id,crewId]);
  if (actor.role === 'Capo') return !!await one(conn,'SELECT 1 FROM fm_crews WHERE id=? AND leader_id=?',[crewId,actor.member_id]);
  return !write && actor.crew_id === Number(crewId);
}
async function visible(conn, actor, entity, row, write = false) {
  if (!row) fail(404,'NOT_FOUND','대상이 없습니다.');
  const d = entities[entity];
  if (d.scope === 'admin') return actor.role === 'Administrator';
  if (entity === 'members') {
    if(write&&row.role==='Administrator')return false;
    if (row.id === actor.member_id && !write) return true;
    if (!row.crew_id) return ['Boss','Administrator'].includes(actor.role) && (!write || actor.role === 'Boss');
    return (write ? managers.includes(actor.role) : true) && await crewAllowed(conn,actor,row.crew_id,write);
  }
  if (entity === 'crews') return crewAllowed(conn,actor,row.id,write);
  if (d.parent) {
    if(['member-availability','leave-requests'].includes(entity)&&['Associate','Soldier'].includes(actor.role))return row.member_id===actor.member_id;
    const parent = await one(conn,`SELECT * FROM ${entities[d.parentEntity].table} WHERE id=?`,[row[d.parent]]);
    if (!parent) return false;
    if (write && ['member-availability','leave-requests'].includes(entity) && row.member_id === actor.member_id) return true;
    if (write && ['task-notes','task-checklists','task-deliverables','task-risks'].includes(entity) && actor.role === 'Soldier') return visible(conn,actor,'tasks',parent,false);
    if (write && entity === 'resource-incidents' && actor.role === 'Soldier') return visible(conn,actor,'resources',parent,false);
    return visible(conn,actor,d.parentEntity,parent,write);
  }
  if (entity === 'tasks' && !write && ['Associate','Soldier'].includes(actor.role)) return !!await one(conn,'SELECT 1 FROM fm_participations WHERE task_id=? AND member_id=? AND status<>?',[row.id,actor.member_id,'REMOVED']);
  return crewAllowed(conn,actor,row.crew_id,write);
}
async function assertVisible(conn,actor,entity,row,write=false) { if (!await visible(conn,actor,entity,row,write)) fail(403,'OUT_OF_SCOPE','관리 또는 조회 범위 밖의 대상입니다.'); }
// Scope is applied in SQL before pagination and counts. Parent scopes are nested, not post-filtered.
function scope(actor, entity, alias = 't', depth = 0) {
  const d = entities[entity];
  if (actor.role === 'Administrator' || actor.role === 'Boss') return { sql:'1=1', args:[] };
  if (d.scope === 'admin') return { sql:'1=0',args:[] };
  if(['member-availability','leave-requests'].includes(entity)&&['Associate','Soldier'].includes(actor.role))return {sql:`${alias}.member_id=?`,args:[actor.member_id]};
  if (d.parent) {
    const p = `p${depth}`; const inner = scope(actor,d.parentEntity,p,depth+1);
    return {sql:`EXISTS(SELECT 1 FROM ${entities[d.parentEntity].table} ${p} WHERE ${p}.id=${alias}.${d.parent} AND ${inner.sql})`,args:inner.args};
  }
  if (entity === 'tasks' && ['Associate','Soldier'].includes(actor.role)) return {sql:`EXISTS(SELECT 1 FROM fm_participations pp WHERE pp.task_id=${alias}.id AND pp.member_id=? AND pp.status<>'REMOVED')`,args:[actor.member_id]};
  const column = entity === 'crews' ? `${alias}.id` : `${alias}.crew_id`;
  let result;
  if (actor.role === 'Underboss') result = {sql:`${column} IN(SELECT crew_id FROM fm_management WHERE member_id=?)`,args:[actor.member_id]};
  else if (actor.role === 'Capo') result = {sql:`${column} IN(SELECT id FROM fm_crews WHERE leader_id=?)`,args:[actor.member_id]};
  else result = {sql:`${column}=?`,args:[actor.crew_id || 0]};
  if (entity === 'members') return {sql:`(${alias}.id=? OR ${result.sql})`,args:[actor.member_id,...result.args]};
  return result;
}
async function scopedIds(conn,actor,entity) { const s=scope(actor,entity); return (await rows(conn,`SELECT t.id FROM ${entities[entity].table} t WHERE ${s.sql}`,s.args)).map(r=>r.id); }
module.exports = { loadActor, requireRoles, crewAllowed, visible, assertVisible, scope, scopedIds };

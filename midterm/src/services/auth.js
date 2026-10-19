'use strict';
const crypto=require('node:crypto');
const {one,rows,transaction,event,update}=require('../repositories/sql');
const {fail}=require('../validators');
const {hashPassword,verify}=require('./password');
const {loadActor}=require('../permissions');
const regenerate=req=>new Promise((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));
const destroy=req=>new Promise((resolve,reject)=>req.session.destroy(e=>e?reject(e):resolve()));
async function execute(db,req,op,input) {
  const actor=req.actor;
  if(op==='csrf') {req.session.csrf ||= crypto.randomBytes(32).toString('hex');return {csrfToken:req.session.csrf};}
  if(op==='login') {
    // Persistent account lock; all login state updates use the same mutation lock.
    const account=await transaction(db,async conn=>{
      const a=await one(conn,'SELECT * FROM fm_accounts WHERE username=? FOR UPDATE',[input.username]);
      if(!a)return null;
      if(a.locked_until && new Date(a.locked_until+'Z').getTime()>Date.now())return null;
      if(a.status!=='ACTIVE'||!await verify(input.password,a.password_hash)) {
        await conn.query('UPDATE fm_accounts SET failed_attempts=failed_attempts+1,locked_until=IF(failed_attempts>=5,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 15 MINUTE),locked_until) WHERE id=?',[a.id]);return null;
      }
      await loadActor(conn,a.id);
      await conn.query('UPDATE fm_accounts SET failed_attempts=0,locked_until=NULL WHERE id=?',[a.id]);
      await event(conn,{member_id:a.member_id},'login','accounts',null,{id:a.id,member_id:a.member_id});return a;
    });
    if(!account)fail(401,'INVALID_LOGIN','로그인 정보가 올바르지 않거나 계정이 잠겼습니다.');
    await regenerate(req);req.session.accountId=account.id;req.session.version=account.version;req.session.csrf=crypto.randomBytes(32).toString('hex');
    return {csrfToken:req.session.csrf,memberId:account.member_id};
  }
  if(op==='logout'){await destroy(req);return {loggedOut:true};}
  if(op==='identity'){const management=await rows(db.pool,'SELECT crew_id FROM fm_management WHERE member_id=?',[actor.member_id]);return {memberId:actor.member_id,name:actor.name,role:actor.role,status:actor.status,crewId:actor.crew_id,managedCrews:management.map(x=>x.crew_id)};}
  if(op==='sessions')return rows(db.pool,'SELECT SHA2(sid,256) session_reference,expires FROM fm_sessions WHERE account_id=? AND expires>?',[actor.account_id,Date.now()]);
  if(op==='revokeSessions'){await transaction(db,async conn=>{await loadActor(conn,actor.account_id,actor.version);await conn.query('UPDATE fm_accounts SET version=version+1 WHERE id=?',[actor.account_id]);await conn.query('DELETE FROM fm_sessions WHERE account_id=?',[actor.account_id]);await event(conn,actor,'sessions.revoked','accounts',null,{id:actor.account_id,member_id:actor.member_id});});await destroy(req);return {revoked:true};}
  if(op==='changePassword') {
    await transaction(db,async conn=>{
      await loadActor(conn,actor.account_id,actor.version);
      const a=await one(conn,'SELECT * FROM fm_accounts WHERE id=? FOR UPDATE',[actor.account_id]);
      if(!await verify(input.current_password,a.password_hash))fail(403,'PASSWORD_MISMATCH','현재 비밀번호가 다릅니다.');
      await update(conn,'fm_accounts',a.id,{password_hash:await hashPassword(input.new_password),version:a.version+1});
      await conn.query('DELETE FROM fm_sessions WHERE account_id=?',[a.id]);await event(conn,actor,'password.changed','accounts',null,{id:a.id,member_id:actor.member_id});
    });await destroy(req);return {changed:true,loginRequired:true};
  }
  fail(404,'UNKNOWN_OPERATION','인증 작업이 없습니다.');
}
module.exports={execute};

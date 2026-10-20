'use strict';
// HTTP regression check with an in-memory SQL substitute; no real DB is modified.
const assert=require('node:assert/strict');
const {createApp}=require('../src/app');
const {hashPassword}=require('../src/services/password');
async function main() {
  const sessions=new Map();
  const password='Login-check-password-2026';
  const account={id:1,member_id:1,username:'admin',password_hash:await hashPassword(password),status:'ACTIVE',version:1};
  const actor={account_id:1,member_id:1,id:1,name:'Administrator',role:'Administrator',account_status:'ACTIVE',status:'ACTIVE',version:1,archived:0};
  const pool={
    async query(sql,args=[]) {
      if(sql.startsWith('SELECT data FROM fm_sessions'))return [[sessions.has(args[0])?{data:sessions.get(args[0])}:undefined].filter(Boolean)];
      if(sql.startsWith('INSERT INTO fm_sessions')){sessions.set(args[0],args[1]);return [{}];}
      if(sql.startsWith('DELETE FROM fm_sessions WHERE sid=')){sessions.delete(args[0]);return [{}];}
      if(sql.startsWith('SELECT * FROM fm_accounts WHERE username='))return [[...(args[0]==='admin'?[account]:[])]];
      if(sql.startsWith('SELECT a.id account_id'))return [[actor]];
      if(sql.startsWith('SELECT crew_id FROM fm_management'))return [[]];
      if(sql.startsWith('SELECT id FROM fm_mutex')||sql.startsWith('UPDATE fm_accounts')||sql.startsWith('INSERT INTO fm_outbox'))return [[]];
      throw new Error('Unexpected SQL in login check: '+sql);
    },
    async getConnection(){return {...this,async beginTransaction(){},async commit(){},async rollback(){},release(){}};}
  };
  const app=createApp({pool},{root:require('node:path').resolve(__dirname,'..'),secret:'test-session-secret-at-least-32-characters',secure:false});
  const server=await new Promise(resolve=>{const listener=app.listen(0,'127.0.0.1',()=>resolve(listener));});
  let cookie='';
  const request=async(path,options={})=>{
    const response=await fetch(`http://127.0.0.1:${server.address().port}${path}`,{...options,redirect:'manual',headers:{Cookie:cookie,...options.headers}});
    const setCookie=response.headers.get('set-cookie');if(setCookie)cookie=setCookie.split(';')[0];
    return response;
  };
  const post=(path,token,body)=>request(path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify(body)});
  try {
    let response=await request('/api/v1/auth/csrf');
    assert.equal(response.status,200);
    const csrf=await response.json();assert.match(csrf.data.csrfToken,/^[a-f0-9]{64}$/);
    assert(cookie,'CSRF request must save a session cookie');
    response=await post('/api/v1/auth/login','invalid',{username:'admin',password});assert.equal(response.status,403);
    response=await post('/api/v1/auth/login',csrf.data.csrfToken,{username:'admin',password:'wrong-password'});assert.equal(response.status,401);
    response=await post('/api/v1/auth/login',csrf.data.csrfToken,{username:'admin',password});
    assert.equal(response.status,200);const login=await response.json();assert.equal(login.success,true);
    assert.notEqual(login.data.csrfToken,csrf.data.csrfToken);
    response=await request('/api/v1/auth/identity');assert.equal(response.status,200);assert.equal((await response.json()).data.role,'Administrator');
    response=await request('/');assert.equal(response.status,200);assert.match(await response.text(),/Administrator/);
    response=await post('/api/v1/auth/logout',login.data.csrfToken,{});assert.equal(response.status,200);
    response=await request('/api/v1/auth/identity');assert.equal(response.status,401);
    console.log('PASS: CSRF, cookies, invalid token/password, admin login, session rotation, identity, page rendering, logout');
  } finally {await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});

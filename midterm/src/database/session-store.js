'use strict';
module.exports = function createStore(pool) {
  const { Store } = require('express-session');
  return new class extends Store {
    get(sid,cb) { pool.query('SELECT data FROM fm_sessions WHERE sid=? AND expires>?',[sid,Date.now()]).then(([r])=>cb(null,r[0]?JSON.parse(r[0].data):null)).catch(cb); }
    set(sid,value,cb=()=>{}) { const expires = value.cookie.expires ? new Date(value.cookie.expires).getTime() : Date.now()+8*3600000; pool.query('INSERT INTO fm_sessions(sid,data,expires,account_id) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data),expires=VALUES(expires),account_id=VALUES(account_id)',[sid,JSON.stringify(value),expires,value.accountId||null]).then(()=>cb()).catch(cb); }
    destroy(sid,cb=()=>{}) { pool.query('DELETE FROM fm_sessions WHERE sid=?',[sid]).then(()=>cb()).catch(cb); }
    touch(sid,value,cb=()=>{}) { this.set(sid,value,cb); }
  }();
};

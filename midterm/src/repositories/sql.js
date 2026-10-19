'use strict';
const { randomUUID } = require('node:crypto');
const { fail } = require('../validators');
async function rows(db, sql, params = []) { const [result] = await db.query(sql, params); return result; }
async function one(db, sql, params = []) { return (await rows(db, sql, params))[0]; }
async function transaction(db, fn) {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    // One mutation gate prevents cross-domain lock inversions, including scheduling edits.
    await conn.query('SELECT id FROM fm_mutex WHERE id=1 FOR UPDATE');
    const result = await fn(conn); await conn.commit(); return result;
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}
async function event(conn, actor, action, entity, before, after, reason = '') {
  const target = after || before;
  const clean = value => value && Object.fromEntries(Object.entries(value).filter(([k]) => !/password|token|secret/i.test(k)));
  const collection = entity === 'tasks' ? 'fm_task_history' : entity === 'resources' || entity === 'reservations' ? 'fm_resource_history' : entity === 'members' ? 'fm_member_history' : 'fm_activity';
  const payload = { eventId: randomUUID(), actor: actor?.member_id || null, action, entity, targetId: target?.id || null, crewId: target?.crew_id || null, memberId: entity === 'members' ? target?.id : target?.member_id || null, taskId: entity === 'tasks' ? target?.id : target?.task_id || null, resourceId: entity === 'resources' ? target?.id : target?.resource_id || null, occurredAt: new Date().toISOString(), reason, before: clean(before), after: clean(after) };
  await conn.query('INSERT INTO fm_outbox(event_id,collection_name,payload) VALUES(?,?,?)', [payload.eventId, collection, JSON.stringify(payload)]);
}
async function update(conn, table, identifier, values) {
  const keys = Object.keys(values); if (!keys.length) fail(422,'EMPTY_UPDATE','수정할 값이 없습니다.');
  await conn.query(`UPDATE ${table} SET ${keys.map(k => `\`${k}\`=?`).join(',')} WHERE id=?`, [...Object.values(values),identifier]);
}
async function insert(conn, table, values) {
  const keys = Object.keys(values);
  const result = await rows(conn, `INSERT INTO ${table}(${keys.map(k=>`\`${k}\``).join(',')}) VALUES(${keys.map(() => '?').join(',')})`, Object.values(values));
  return result.insertId;
}
module.exports = { rows, one, transaction, event, update, insert };

'use strict';
async function deliver(db) {
  const [events] = await db.pool.query('SELECT * FROM fm_outbox WHERE delivered_at IS NULL AND next_attempt<=UTC_TIMESTAMP(3) ORDER BY id LIMIT 50');
  for(const item of events) {
    try {
      const payload = typeof item.payload==='string'?JSON.parse(item.payload):item.payload;
      await db.mongo.collection(item.collection_name).updateOne({eventId:item.event_id},{$setOnInsert:payload},{upsert:true});
      await db.mongo.collection('fm_audit').updateOne({eventId:item.event_id},{$setOnInsert:payload},{upsert:true});
      await db.pool.query('UPDATE fm_outbox SET delivered_at=UTC_TIMESTAMP(3),last_error=NULL WHERE id=?',[item.id]);
    } catch(error) {
      const delay=Math.min(300,2**Math.min(item.attempts,8));
      await db.pool.query('UPDATE fm_outbox SET attempts=attempts+1,last_error=?,next_attempt=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ? SECOND) WHERE id=?',['DELIVERY_FAILED',delay,item.id]);
    }
  }
  await db.pool.query('DELETE FROM fm_sessions WHERE expires<?',[Date.now()]);
}
function startWorker(db) {
  let active=Promise.resolve(),running=false;
  const timer=setInterval(()=>{if(running)return;running=true;active=deliver(db).catch(()=>console.error('기록 전달 작업 지연: DB 연결을 확인하세요.')).finally(()=>{running=false;});},2000);
  timer.unref(); return async()=>{clearInterval(timer);await active;};
}
module.exports={startWorker,deliver};

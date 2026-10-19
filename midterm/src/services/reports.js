'use strict';
const {rows}=require('../repositories/sql');
const {scope,scopedIds}=require('../permissions');
const {fields,id}=require('../validators');
async function execute(db,req,op) {
  const key=op.operationId.replace('report-','');
  const entity=['member-status','workload'].includes(key)?'members':key==='resource-utilization'?'resources':key==='maintenance-due'?'resource-inspections':'tasks';
  const s=scope(req.actor,entity,'t');const clauses=[s.sql,'t.archived=0'],args=[...s.args];
  if(req.query.crew_id&&entity!=='resource-inspections'){clauses.push('t.crew_id=?');args.push(id(req.query.crew_id));}
  if(req.query.status&&entity!=='resource-inspections'){clauses.push('t.status=?');args.push(String(req.query.status).slice(0,30));}
  for(const [q,operator] of [['from','>='],['to','<=']])if(req.query[q]){const column=key==='resource-utilization'?(q==='from'?'b.starts_at':'b.ends_at'):key==='workload'?(q==='from'?'k.starts_at':'k.ends_at'):'t.created_at';clauses.push(`${column}${operator}?`);args.push(fields({at:req.query[q]},{at:{type:'date'}}).at);}
  const where=clauses.join(' AND ');
  const statements={
    workload:`SELECT t.id,t.name,COUNT(k.id) active_assignments,COALESCE(SUM(TIMESTAMPDIFF(MINUTE,k.starts_at,k.ends_at)),0) planned_minutes FROM fm_members t LEFT JOIN fm_participations p ON p.member_id=t.id AND p.status='ASSIGNED' LEFT JOIN fm_tasks k ON k.id=p.task_id AND k.status NOT IN ('COMPLETED','CANCELLED') WHERE ${where} GROUP BY t.id,t.name ORDER BY active_assignments DESC,t.id`,
    'task-status':`SELECT t.crew_id,t.status,COUNT(*) total FROM fm_tasks t WHERE ${where} GROUP BY t.crew_id,t.status ORDER BY t.crew_id,t.status`,
    'member-status':`SELECT t.crew_id,t.status,COUNT(*) total FROM fm_members t WHERE ${where} GROUP BY t.crew_id,t.status ORDER BY t.crew_id,t.status`,
    'resource-utilization':`SELECT t.id,t.name,COUNT(b.id) reservations,COALESCE(SUM(TIMESTAMPDIFF(MINUTE,b.starts_at,b.ends_at)),0) reserved_minutes FROM fm_resources t LEFT JOIN fm_reservations b ON b.resource_id=t.id AND b.status<>'CANCELLED' WHERE ${where} GROUP BY t.id,t.name ORDER BY reserved_minutes DESC,t.id`,
    'overdue-tasks':`SELECT t.id,t.title,t.crew_id,t.ends_at,TIMESTAMPDIFF(HOUR,t.ends_at,UTC_TIMESTAMP()) overdue_hours FROM fm_tasks t WHERE ${where} AND t.ends_at<UTC_TIMESTAMP() AND t.status NOT IN ('COMPLETED','CANCELLED') ORDER BY t.ends_at,t.id`,
    'completion-rate':`SELECT DATE_FORMAT(t.created_at,'%Y-%m') month,COUNT(*) total,SUM(t.status='COMPLETED') completed,ROUND(100*SUM(t.status='COMPLETED')/COUNT(*),1) completion_percent FROM fm_tasks t WHERE ${where} GROUP BY month ORDER BY month`,
    'maintenance-due':`SELECT t.id,t.resource_id,t.title,t.due_at,t.status FROM fm_resource_inspections t WHERE ${where} AND t.status='DRAFT' ORDER BY t.due_at,t.id`
  };
  if(key==='evaluation-summary') {
    const filter={status:'PUBLISHED',memberId:{$in:await scopedIds(db.pool,req.actor,'members')}};
    if(req.query.crew_id)filter.crewId=id(req.query.crew_id);
    for(const [q,operator] of [['from','$gte'],['to','$lte']])if(req.query[q]){filter.createdAt||={};filter.createdAt[operator]=fields({at:req.query[q]},{at:{type:'date'}}).at.replace(' ','T')+'Z';}
    return db.mongo.collection('fm_evaluations').aggregate([{$match:filter},{$group:{_id:{crewId:'$crewId',score:'$score'},total:{$sum:1}}},{$sort:{'_id.crewId':1,'_id.score':1}}]).toArray();
  }
  return rows(db.pool,statements[key]+' LIMIT 1000',args);
}
module.exports={execute};

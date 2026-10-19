'use strict';
const { rows, one } = require('../repositories/sql');
const { fail, interval } = require('../validators');
async function memberSchedule(conn, memberId, task, excludeTask = 0) {
  const member = await one(conn,'SELECT * FROM fm_members WHERE id=? FOR UPDATE',[memberId]);
  if(!member) fail(404,'NOT_FOUND','구성원이 없습니다.');
  if(member.archived || ['SUSPENDED','WITHDRAWN'].includes(member.status)) fail(409,'MEMBER_INACTIVE','정지·탈퇴 구성원은 배정할 수 없습니다.');
  if(member.crew_id!==task.crew_id) fail(409,'CREW_MISMATCH','업무와 구성원의 Crew가 다릅니다.');
  const clash=await one(conn,`SELECT t.id FROM fm_participations p JOIN fm_tasks t ON t.id=p.task_id WHERE p.member_id=? AND p.status<>'REMOVED' AND t.status NOT IN ('COMPLETED','CANCELLED') AND t.id<>? AND (t.exclusive=1 OR ?=1) AND t.starts_at<? AND t.ends_at>? LIMIT 1`,[memberId,excludeTask,task.exclusive?1:0,task.ends_at,task.starts_at]);
  if(clash) fail(409,'TASK_OVERLAP','동시에 수행할 수 없는 업무 일정입니다.');
  const absence=await one(conn,`SELECT id FROM fm_member_availability WHERE member_id=? AND archived=0 AND starts_at<? AND ends_at>? UNION ALL SELECT id FROM fm_leave_requests WHERE member_id=? AND archived=0 AND status='APPROVED' AND starts_at<? AND ends_at>? LIMIT 1`,[memberId,task.ends_at,task.starts_at,memberId,task.ends_at,task.starts_at]);
  if(absence) fail(409,'MEMBER_UNAVAILABLE','부재 또는 승인된 휴가와 겹칩니다.');
  return member;
}
async function resourceSchedule(conn, resourceId, start, end, exclude = 0) {
  interval(start,end);
  const resource=await one(conn,'SELECT * FROM fm_resources WHERE id=? FOR UPDATE',[resourceId]);
  if(!resource) fail(404,'NOT_FOUND','자원이 없습니다.');
  if(resource.archived || !['AVAILABLE','IN_USE'].includes(resource.status)) fail(409,'RESOURCE_UNAVAILABLE','점검 또는 사용 불가 자원입니다.');
  const clash=await one(conn,`SELECT id FROM fm_reservations WHERE resource_id=? AND id<>? AND (status='IN_USE' OR (status='RESERVED' AND starts_at<? AND ends_at>?)) LIMIT 1`,[resourceId,exclude,end,start]);
  if(clash) fail(409,'RESOURCE_OVERLAP','예약이 겹치거나 아직 반환되지 않은 자원입니다.');
  if(resource.status==='IN_USE' && !exclude) fail(409,'RESOURCE_IN_USE','반환 전 신규 예약은 불가능합니다.');
  const maintenance=await one(conn,"SELECT id FROM fm_resource_maintenance WHERE resource_id=? AND archived=0 AND status IN ('SCHEDULED','IN_PROGRESS') AND starts_at<? AND ends_at>? LIMIT 1",[resourceId,end,start]);
  if(maintenance) fail(409,'MAINTENANCE_OVERLAP','정비 일정과 겹칩니다.');
  return resource;
}
async function validateTaskSchedule(conn,task) {
  interval(task.starts_at,task.ends_at);
  const participants=await rows(conn,"SELECT member_id FROM fm_participations WHERE task_id=? AND status<>'REMOVED' ORDER BY member_id",[task.id]);
  for(const p of participants) await memberSchedule(conn,p.member_id,task,task.id);
  const reservations=await rows(conn,"SELECT * FROM fm_reservations WHERE task_id=? AND status IN ('RESERVED','IN_USE') ORDER BY resource_id",[task.id]);
  for(const r of reservations) {
    if(r.starts_at<task.starts_at || r.ends_at>task.ends_at) fail(409,'RESERVATION_OUTSIDE_TASK','기존 자원 예약을 먼저 업무 시간 안으로 조정하세요.');
    await resourceSchedule(conn,r.resource_id,r.starts_at,r.ends_at,r.id);
  }
}
async function extensionRules(conn,d,record,old,actor) {
  if(record.starts_at && record.ends_at) interval(record.starts_at,record.ends_at);
  if(old && old.status!=='DRAFT') fail(409,'RECORD_LOCKED','초안만 편집하거나 보관할 수 있습니다. 전용 상태 변경을 사용하세요.');
  if(d.parent){
    const parent=await one(conn,`SELECT * FROM ${require('../routes/entities').entities[d.parentEntity].table} WHERE id=?`,[record[d.parent]]);
    if(!parent||parent.archived)fail(409,'PARENT_ARCHIVED','상위 대상이 없거나 보관되었습니다.');
    if((d.key==='onboarding-steps'&&parent.status==='COMPLETED')||(d.key==='meeting-agenda'&&parent.status==='COMPLETED')||(d.key==='training-enrollments'&&parent.status!=='DRAFT'))fail(409,'PARENT_CLOSED','상위 계획/회의/교육이 종료되었거나 이미 시작되었습니다.');
  }
  if(d.parentEntity==='tasks') {
    const task=await one(conn,'SELECT * FROM fm_tasks WHERE id=?',[record.task_id]);
    if(task.status==='COMPLETED' || task.status==='CANCELLED') fail(409,'TASK_CLOSED','종료된 업무의 기록은 변경할 수 없습니다.');
    if(d.key==='task-milestones' && (record.due_at<task.starts_at || record.due_at>task.ends_at)) fail(422,'MILESTONE_DATE','중간 목표 기한은 업무 기간 안이어야 합니다.');
  }
  if(d.key==='task-dependencies') {
    if(record.task_id===record.predecessor_id) fail(409,'DEPENDENCY_CYCLE','자기 자신을 선행 업무로 지정할 수 없습니다.');
    const {assertVisible}=require('../permissions');
    const predecessor=await one(conn,'SELECT * FROM fm_tasks WHERE id=?',[record.predecessor_id]);
    await assertVisible(conn,actor,'tasks',predecessor,true);
    const edges=await rows(conn,'SELECT task_id,predecessor_id FROM fm_task_dependencies WHERE archived=0 AND id<>?',[old?.id||0]);
    const visit=[record.predecessor_id], seen=new Set();
    while(visit.length) { const x=visit.pop(); if(x===record.task_id) fail(409,'DEPENDENCY_CYCLE','선행 업무 순환이 발생합니다.'); if(seen.has(x))continue;seen.add(x);visit.push(...edges.filter(e=>e.task_id===x).map(e=>e.predecessor_id)); }
  }
  if(d.key==='member-availability') await absenceRules(conn,record);
  if(d.key==='training-enrollments') {
    const training=await one(conn,'SELECT * FROM fm_training_sessions WHERE id=? FOR UPDATE',[record.training_id]);
    const member=await one(conn,'SELECT * FROM fm_members WHERE id=?',[record.member_id]);
    if(!member || member.crew_id!==training.crew_id || member.status!=='ACTIVE') fail(409,'ENROLLMENT_SCOPE','같은 Crew의 활동 중 구성원만 신청 가능합니다.');
    const count=await one(conn,'SELECT COUNT(*) n FROM fm_training_enrollments WHERE training_id=? AND archived=0 AND id<>?',[training.id,old?.id||0]);
    if(count.n>=training.capacity) fail(409,'TRAINING_FULL','교육 정원이 찼습니다.');
  }
  if(d.key==='training-sessions' && old) {
    const count=await one(conn,'SELECT COUNT(*) n FROM fm_training_enrollments WHERE training_id=? AND archived=0',[old.id]);
    if(record.capacity<count.n) fail(409,'CAPACITY_TOO_SMALL','참가 인원보다 정원을 줄일 수 없습니다.');
  }
}
async function absenceRules(conn,record) {
  await conn.query('SELECT id FROM fm_members WHERE id=? FOR UPDATE',[record.member_id]);
  const conflict=await one(conn,"SELECT t.id FROM fm_tasks t JOIN fm_participations p ON p.task_id=t.id WHERE p.member_id=? AND p.status<>'REMOVED' AND t.status NOT IN ('COMPLETED','CANCELLED') AND t.starts_at<? AND t.ends_at>? LIMIT 1",[record.member_id,record.ends_at,record.starts_at]);
  if(conflict) fail(409,'ASSIGNED_DURING_ABSENCE','이미 배정된 업무를 먼저 조정하세요.');
}
module.exports={memberSchedule,resourceSchedule,validateTaskSchedule,extensionRules,absenceRules};

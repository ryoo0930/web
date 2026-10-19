'use strict';
const {id,fail,page}=require('../validators');
const {rows,one,insert,update,event,transaction}=require('../repositories/sql');
const {assertVisible,loadActor,requireRoles,scope}=require('../permissions');
const {entities}=require('../routes/entities');
const {memberSchedule,resourceSchedule,absenceRules}=require('./constraints');
async function get(conn,actor,entity,identifier,write=true) {const row=await one(conn,`SELECT * FROM ${entities[entity].table} WHERE id=? FOR UPDATE`,[id(identifier)]);await assertVisible(conn,actor,entity,row,write);if(row.archived)fail(409,'ARCHIVED','보관된 대상입니다.');return row;}
async function save(conn,actor,entity,before,values,reason,action) {await update(conn,entities[entity]?.table||`fm_${entity}`,before.id,values);const after={...before,...values};await event(conn,actor,action||'state.changed',entity,before,after,reason);return after;}
async function invalidate(conn,memberId) {await conn.query('UPDATE fm_accounts SET version=version+1 WHERE member_id=?',[memberId]);await conn.query('DELETE FROM fm_sessions WHERE account_id IN(SELECT id FROM fm_accounts WHERE member_id=?)',[memberId]);}
async function noActiveAssignments(conn,memberId) {
  if(await one(conn,"SELECT p.id FROM fm_participations p JOIN fm_tasks t ON t.id=p.task_id WHERE p.member_id=? AND p.status<>'REMOVED' AND t.status NOT IN ('COMPLETED','CANCELLED') LIMIT 1",[memberId]))fail(409,'ACTIVE_ASSIGNMENTS','진행 중인 배정을 먼저 해제하세요.');
  if(await one(conn,"SELECT id FROM fm_reservations WHERE member_id=? AND status IN ('RESERVED','IN_USE') LIMIT 1",[memberId]))fail(409,'ACTIVE_RESERVATIONS','사용 중이거나 예약한 자원을 먼저 반환/취소하세요.');
}
async function noLeadership(conn,memberId) {if(await one(conn,"SELECT id FROM fm_crews WHERE leader_id=? AND archived=0 LIMIT 1",[memberId]))fail(409,'CREW_LEADER','Crew 책임자를 먼저 다른 구성원으로 교체하세요.');}
async function execute(db,req,op,input) {
  const action=op.operationId;let actor=req.actor;
  if(op.method==='get')return read(db,req,op);
  return transaction(db,async conn=>{
    actor=await loadActor(conn,actor.account_id,actor.version);requireRoles(actor,op.roles);
    if(op.workflow)return workflow(conn,actor,req.params.id,op,input);
    if(action.startsWith('account')) {
      const a=await one(conn,'SELECT * FROM fm_accounts WHERE id=? FOR UPDATE',[id(req.params.id)]);if(!a)fail(404,'NOT_FOUND','계정이 없습니다.');
      const member=await one(conn,'SELECT * FROM fm_members WHERE id=?',[a.member_id]);
      if(member.role==='Administrator' && action==='accountBlock') {
        const count=await one(conn,"SELECT COUNT(*) n FROM fm_accounts a JOIN fm_members m ON m.id=a.member_id WHERE a.status='ACTIVE' AND m.role='Administrator' AND m.status='ACTIVE'");
        if(count.n<=1)fail(409,'LAST_ADMIN','마지막 관리자는 차단할 수 없습니다.');
      }
      const values={version:a.version+1};
      if(action==='accountBlock'){if(a.status==='BLOCKED')fail(409,'STATE_CONFLICT','이미 차단되었습니다.');values.status='BLOCKED';}
      if(action==='accountUnblock'){if(a.status!=='BLOCKED')fail(409,'STATE_CONFLICT','차단된 계정이 아닙니다.');values.status='ACTIVE';values.failed_attempts=0;values.locked_until=null;}
      if(action==='accountPassword')values.password_hash=await require('./password').hashPassword(input.new_password);
      await save(conn,actor,'accounts',a,values,input.reason,action);await conn.query('DELETE FROM fm_sessions WHERE account_id=?',[a.id]);
      return {id:a.id,status:values.status||a.status,loginRequired:true};
    }
    if(action==='memberRole') {
      const member=await one(conn,'SELECT * FROM fm_members WHERE id=? FOR UPDATE',[id(req.params.id)]);if(!member)fail(404,'NOT_FOUND','구성원이 없습니다.');
      if(member.id===actor.member_id)fail(403,'SELF_ROLE','자기 역할은 변경할 수 없습니다.');
      const rank={Associate:1,Soldier:2,Capo:3,Underboss:4,Boss:5,Administrator:6};
      if(rank[member.role]>=rank[actor.role] || rank[input.role]>=rank[actor.role])fail(403,'ROLE_BOUNDARY','동급 이상 역할 변경/부여는 허용하지 않습니다.');
      if(member.role===input.role)fail(409,'STATE_CONFLICT','이미 같은 역할입니다.');
      await noLeadership(conn,member.id);
      if(member.role==='Underboss')await conn.query('DELETE FROM fm_management WHERE member_id=?',[member.id]);
      const out=await save(conn,actor,'members',member,{role:input.role},input.reason,action);await invalidate(conn,member.id);return out;
    }
    if(action==='memberStatus') {
      const m=await get(conn,actor,'members',req.params.id);if(m.role==='Administrator')fail(403,'TECHNICAL_ACCOUNT','기술 관리자의 상태는 운영자가 변경할 수 없습니다.');
      const transitions={PENDING:['ACTIVE','WITHDRAWN'],ACTIVE:['SUSPENDED','WITHDRAWN'],SUSPENDED:['ACTIVE','WITHDRAWN'],WITHDRAWN:[]};
      if(!transitions[m.status].includes(input.status))fail(409,'INVALID_TRANSITION','허용되지 않은 구성원 상태 전이입니다.');
      if(['SUSPENDED','WITHDRAWN'].includes(input.status)){await noActiveAssignments(conn,m.id);await noLeadership(conn,m.id);}
      const out=await save(conn,actor,'members',m,{status:input.status},input.reason,action);await invalidate(conn,m.id);return out;
    }
    if(['membershipAdd','membershipTransfer','membershipRemove'].includes(action)) {
      const memberId=action==='membershipAdd'?input.member_id:id(req.params.id);
      const m=await one(conn,'SELECT * FROM fm_members WHERE id=? FOR UPDATE',[memberId]);if(!m)fail(404,'NOT_FOUND','구성원이 없습니다.');
      if(m.role==='Administrator')fail(403,'TECHNICAL_ACCOUNT','기술 관리자 계정은 운영 Crew에 편성할 수 없습니다.');
      let crew=null;
      if(action!=='membershipRemove')crew=await get(conn,actor,'crews',action==='membershipAdd'?req.params.id:input.crew_id);
      if(m.crew_id)await assertVisible(conn,actor,'crews',await one(conn,'SELECT * FROM fm_crews WHERE id=?',[m.crew_id]),true);
      if(action==='membershipAdd'&&m.crew_id)fail(409,'ALREADY_MEMBER','이미 정식 소속이 있습니다. 전속 이동을 사용하세요.');
      if(action!=='membershipAdd'&&!m.crew_id)fail(409,'NO_MEMBERSHIP','현재 소속이 없습니다.');
      if(m.crew_id===crew?.id)fail(409,'SAME_CREW','같은 Crew입니다.');
      if(m.status==='WITHDRAWN')fail(409,'WITHDRAWN','탈퇴 구성원은 편성할 수 없습니다.');
      await noActiveAssignments(conn,m.id);await noLeadership(conn,m.id);
      const out=await save(conn,actor,'members',m,{crew_id:crew?.id||null},input.reason,action);await invalidate(conn,m.id);return out;
    }
    if(action==='crewLeader') {
      const crew=await get(conn,actor,'crews',req.params.id);const m=await one(conn,'SELECT * FROM fm_members WHERE id=? FOR UPDATE',[input.member_id]);
      if(!m||m.crew_id!==crew.id||m.role!=='Capo'||m.status!=='ACTIVE')fail(409,'LEADER_REQUIREMENT','해당 Crew의 활동 중 Capo가 필요합니다.');
      return save(conn,actor,'crews',crew,{leader_id:m.id},input.reason,action);
    }
    if(action==='crewArchive') {
      const crew=await get(conn,actor,'crews',req.params.id);
      for(const table of ['fm_members','fm_tasks','fm_resources'])if(await one(conn,`SELECT id FROM ${table} WHERE crew_id=? AND archived=0 LIMIT 1`,[crew.id]))fail(409,'CREW_NOT_EMPTY','구성원·업무·자원이 남아 있어 운영 종료할 수 없습니다.');
      await conn.query('DELETE FROM fm_management WHERE crew_id=?',[crew.id]);return save(conn,actor,'crews',crew,{status:'ARCHIVED',archived:1,leader_id:null},input.reason,action);
    }
    if(action==='managementGrant'||action==='managementRevoke') {
      const memberId=action==='managementGrant'?input.member_id:id(req.params.id), crewId=action==='managementGrant'?input.crew_id:id(req.params.crewId);
      const m=await one(conn,'SELECT * FROM fm_members WHERE id=?',[memberId]);if(!m||m.role!=='Underboss')fail(422,'UNDERBOSS_REQUIRED','Underboss 구성원이 필요합니다.');
      await get(conn,actor,'crews',crewId);
      if(action==='managementGrant')await conn.query('INSERT INTO fm_management(member_id,crew_id) VALUES(?,?)',[memberId,crewId]);
      else {const result=await rows(conn,'DELETE FROM fm_management WHERE member_id=? AND crew_id=?',[memberId,crewId]);if(!result.affectedRows)fail(404,'NOT_FOUND','관리 범위가 없습니다.');}
      await invalidate(conn,memberId);await event(conn,actor,action,'members',null,{id:memberId,crew_id:crewId},input.reason);return {memberId,crewId,granted:action==='managementGrant'};
    }
    if(action.startsWith('task')) {
      const task=await get(conn,actor,'tasks',req.params.id);
      const transitions={taskStart:['PLANNED','IN_PROGRESS'],taskPause:['IN_PROGRESS','PAUSED'],taskResume:['PAUSED','IN_PROGRESS'],taskComplete:['IN_PROGRESS','COMPLETED'],taskCancel:[['PLANNED','IN_PROGRESS','PAUSED'],'CANCELLED'],taskCorrect:['COMPLETED','COMPLETED']};
      const [from,to]=transitions[action];if(!(Array.isArray(from)?from:[from]).includes(task.status))fail(409,'INVALID_TRANSITION','현재 업무 상태에서 실행할 수 없습니다.');
      if(action==='taskStart'||action==='taskResume') {
        if(!await one(conn,"SELECT id FROM fm_participations WHERE task_id=? AND status<>'REMOVED'",[task.id]))fail(409,'NO_PARTICIPANTS','참여자를 배정하세요.');
        if(await one(conn,"SELECT d.id FROM fm_task_dependencies d JOIN fm_tasks t ON t.id=d.predecessor_id WHERE d.task_id=? AND d.archived=0 AND t.status<>'COMPLETED' LIMIT 1",[task.id]))fail(409,'PREDECESSOR_INCOMPLETE','선행 업무가 완료되지 않았습니다.');
      }
      if(['taskComplete','taskCancel'].includes(action)) {
        if(await one(conn,"SELECT id FROM fm_reservations WHERE task_id=? AND status='IN_USE'",[task.id]))fail(409,'RETURN_REQUIRED','사용 중 자원을 먼저 반환하세요.');
        const pending=await rows(conn,"SELECT * FROM fm_reservations WHERE task_id=? AND status='RESERVED'",[task.id]);
        for(const r of pending)await save(conn,actor,'reservations',r,{status:'CANCELLED'},input.reason,action);
        if(action==='taskComplete')await conn.query("UPDATE fm_participations SET status='COMPLETED' WHERE task_id=? AND status<>'REMOVED'",[task.id]);
      }
      return save(conn,actor,'tasks',task,{status:to,...(input.result?{result:input.result}:{})},input.reason,action);
    }
    if(action.startsWith('participant')) {
      const task=await get(conn,actor,'tasks',req.params.id,action!=='participantContribution');
      if(['COMPLETED','CANCELLED'].includes(task.status))fail(409,'TASK_CLOSED','종료 업무의 참여 정보는 변경할 수 없습니다.');
      if(action==='participantAdd') {
        await get(conn,actor,'members',input.member_id);
        await memberSchedule(conn,input.member_id,task,task.id);
        const previous=await one(conn,'SELECT * FROM fm_participations WHERE task_id=? AND member_id=?',[task.id,input.member_id]);
        if(previous&&previous.status!=='REMOVED')fail(409,'ALREADY_ASSIGNED','이미 배정되었습니다.');
        const identifier=previous?.id||await insert(conn,'fm_participations',{task_id:task.id,member_id:input.member_id});
        if(previous)await update(conn,'fm_participations',identifier,{status:'ASSIGNED'});
        const record={id:identifier,task_id:task.id,member_id:input.member_id,crew_id:task.crew_id,status:'ASSIGNED'};await event(conn,actor,action,'participations',previous,record,input.reason);return record;
      }
      const memberId=action==='participantContribution'?actor.member_id:id(req.params.memberId);
      const p=await one(conn,"SELECT * FROM fm_participations WHERE task_id=? AND member_id=? AND status<>'REMOVED'",[task.id,memberId]);if(!p)fail(404,'NOT_ASSIGNED','참여 배정이 없습니다.');
      if(action==='participantRemove'&&await one(conn,"SELECT id FROM fm_reservations WHERE task_id=? AND member_id=? AND status IN ('RESERVED','IN_USE') LIMIT 1",[task.id,memberId]))fail(409,'ACTIVE_RESERVATIONS','이 참여자의 업무 자원을 먼저 반환/취소하세요.');
      return save(conn,actor,'participations',{...p,crew_id:task.crew_id},action==='participantRemove'?{status:'REMOVED'}:{contribution:input.contribution},input.reason,action);
    }
    if(action.startsWith('reservation'))return reservation(conn,actor,req,action,input);
    if(action==='resourceStatus') {
      const r=await get(conn,actor,'resources',req.params.id);
      if(r.status==='RETIRED'||r.status===input.status)fail(409,'INVALID_TRANSITION','현재 상태에서 변경할 수 없습니다.');
      if(await one(conn,"SELECT id FROM fm_reservations WHERE resource_id=? AND status IN ('RESERVED','IN_USE') LIMIT 1",[r.id]))fail(409,'RESOURCE_ALLOCATED','예약/사용을 먼저 종료하세요.');
      if(await one(conn,"SELECT id FROM fm_resource_maintenance WHERE resource_id=? AND archived=0 AND status='IN_PROGRESS' LIMIT 1",[r.id]))fail(409,'MAINTENANCE_ACTIVE','진행 중인 정비를 먼저 완료하세요.');
      return save(conn,actor,'resources',r,{status:input.status},input.reason,action);
    }
    if(action==='retryEvent') {
      const pending=await one(conn,'SELECT id,delivered_at FROM fm_outbox WHERE id=?',[id(req.params.id)]);if(!pending)fail(404,'NOT_FOUND','전달 기록이 없습니다.');if(pending.delivered_at)fail(409,'ALREADY_DELIVERED','이미 전달되었습니다.');
      await conn.query('UPDATE fm_outbox SET next_attempt=UTC_TIMESTAMP(3) WHERE id=?',[pending.id]);await event(conn,actor,action,'outbox',null,{id:pending.id},input.reason);return {id:pending.id,queued:true};
    }
    fail(404,'UNKNOWN_OPERATION','작업이 없습니다.');
  });
}
async function reservation(conn,actor,req,action,input) {
  let old=null, resource;
  if(action!=='reservationCreate') {
    old=await one(conn,'SELECT * FROM fm_reservations WHERE id=? FOR UPDATE',[id(req.params.id)]);if(!old)fail(404,'NOT_FOUND','예약이 없습니다.');
    resource=await get(conn,actor,'resources',old.resource_id,!['reservationCheckout','reservationReturn'].includes(action));
    if(actor.role==='Soldier'&&old.member_id!==actor.member_id)fail(403,'NOT_BORROWER','본인 예약만 인수/반환할 수 있습니다.');
  }
  if(action==='reservationCreate'||action==='reservationReschedule') {
    if(old&&old.status!=='RESERVED')fail(409,'INVALID_TRANSITION','미사용 예약만 시간 변경할 수 있습니다.');
    const record={...old,...input};await get(conn,actor,'resources',record.resource_id);resource=await resourceSchedule(conn,record.resource_id,record.starts_at,record.ends_at,old?.id||0);
    const m=await get(conn,actor,'members',record.member_id,false);if(m.status!=='ACTIVE'||m.crew_id!==resource.crew_id)fail(409,'BORROWER_UNAVAILABLE','같은 Crew의 활동 중 구성원이 필요합니다.');
    if(record.task_id) {
      const task=await get(conn,actor,'tasks',record.task_id);
      if(['COMPLETED','CANCELLED'].includes(task.status)||task.crew_id!==resource.crew_id||record.starts_at<task.starts_at||record.ends_at>task.ends_at)fail(409,'TASK_RESERVATION_RANGE','업무 상태·Crew·예약 기간을 확인하세요.');
      if(!await one(conn,"SELECT id FROM fm_participations WHERE task_id=? AND member_id=? AND status<>'REMOVED'",[task.id,m.id]))fail(409,'NOT_ASSIGNED','업무 참여자에게 자원을 예약하세요.');
    }
    if(old)return save(conn,actor,'reservations',{...old,crew_id:resource.crew_id},input,input.reason,action);
    const identifier=await insert(conn,'fm_reservations',input);const after={id:identifier,...input,crew_id:resource.crew_id,status:'RESERVED'};await event(conn,actor,action,'reservations',null,after,input.reason);return after;
  }
  if(action==='reservationCheckout') {
    if(old.status!=='RESERVED')fail(409,'INVALID_TRANSITION','예약된 자원만 인수할 수 있습니다.');
    const now=new Date().toISOString().slice(0,23).replace('T',' ');if(now<old.starts_at||now>=old.ends_at)fail(409,'OUTSIDE_RESERVATION','예약 시간 안에서 인수하세요.');
    await resourceSchedule(conn,resource.id,old.starts_at,old.ends_at,old.id);
    await save(conn,actor,'resources',resource,{status:'IN_USE'},input.reason,action);
    return save(conn,actor,'reservations',{...old,crew_id:resource.crew_id},{status:'IN_USE',checked_out_at:now},input.reason,action);
  }
  if(action==='reservationReturn') {
    if(old.status!=='IN_USE')fail(409,'INVALID_TRANSITION','사용 중 예약만 반환할 수 있습니다.');
    await save(conn,actor,'resources',resource,{status:input.condition==='GOOD'?'AVAILABLE':'INSPECTION'},input.reason,action);
    return save(conn,actor,'reservations',{...old,crew_id:resource.crew_id},{status:'RETURNED',returned_at:new Date().toISOString().slice(0,23).replace('T',' ')},input.reason,action);
  }
  if(old.status!=='RESERVED')fail(409,'INVALID_TRANSITION','미사용 예약만 취소할 수 있습니다.');
  return save(conn,actor,'reservations',{...old,crew_id:resource.crew_id},{status:'CANCELLED'},input.reason,action);
}
async function workflow(conn,actor,identifier,op,input) {
  const {entity,verb,from,to}=op.workflow;const d=entities[entity];const record=await get(conn,actor,entity,identifier);
  if(record.status!==from)fail(409,'INVALID_TRANSITION',`${from} 상태에서만 가능합니다.`);
  if(d.parentEntity==='tasks') {const task=await get(conn,actor,'tasks',record.task_id,false);if(['COMPLETED','CANCELLED'].includes(task.status))fail(409,'TASK_CLOSED','종료 업무 기록은 변경할 수 없습니다.');}
  if(entity==='leave-requests') {
    if(['submit','withdraw'].includes(verb)&&record.member_id!==actor.member_id)fail(403,'SELF_REQUEST','본인 휴가만 신청/철회할 수 있습니다.');
    if(['approve','reject'].includes(verb)&&record.member_id===actor.member_id)fail(403,'SELF_APPROVAL','자기 휴가는 승인할 수 없습니다.');
    if(verb==='approve')await absenceRules(conn,record);
  }
  if(entity==='resource-maintenance'&&verb==='schedule')await resourceSchedule(conn,record.resource_id,record.starts_at,record.ends_at);
  if(['resource-maintenance','resource-inspections','resource-incidents'].includes(entity)) {
    const resource=await get(conn,actor,'resources',record.resource_id);
    let target=null;
    if(entity==='resource-maintenance'&&verb==='begin')target='INSPECTION';
    if(entity==='resource-maintenance'&&verb==='finish')target='AVAILABLE';
    if(entity==='resource-inspections')target=verb==='pass'?'AVAILABLE':'UNAVAILABLE';
    if(entity==='resource-incidents'&&verb==='acknowledge'&&record.severity==='HIGH')target='UNAVAILABLE';
    if(target) {
      if(resource.status==='RETIRED')fail(409,'RETIRED','폐기 자원입니다.');
      if(await one(conn,"SELECT id FROM fm_resource_maintenance WHERE resource_id=? AND archived=0 AND status='IN_PROGRESS' AND id<>? LIMIT 1",[resource.id,entity==='resource-maintenance'?record.id:0]))fail(409,'MAINTENANCE_ACTIVE','다른 정비 작업이 진행 중입니다.');
      if(await one(conn,"SELECT id FROM fm_reservations WHERE resource_id=? AND status IN ('RESERVED','IN_USE') LIMIT 1",[resource.id]))fail(409,'RESOURCE_ALLOCATED','기존 예약/사용을 먼저 정리하세요.');
      await save(conn,actor,'resources',resource,{status:target},input.reason,op.operationId);
    }
  }
  if(entity==='onboarding-plans'&&await one(conn,"SELECT id FROM fm_onboarding_steps WHERE plan_id=? AND archived=0 AND status<>'COMPLETED' LIMIT 1",[record.id]))fail(409,'STEPS_INCOMPLETE','미완료 실습 항목이 있습니다.');
  if(entity==='training-enrollments') {
    const training=await get(conn,actor,'training-sessions',record.training_id);
    if(verb==='attend'&&training.status!=='IN_PROGRESS')fail(409,'TRAINING_NOT_OPEN','교육 진행 중에 출석 확인하세요.');
    if(verb==='complete'&&training.status!=='COMPLETED')fail(409,'TRAINING_NOT_CLOSED','교육 종료 후 이수 처리하세요.');
  }
  return save(conn,actor,entity,record,{status:to,outcome:input.outcome},input.reason,op.operationId);
}
async function read(db,req,op) {
  const actor=req.actor,action=op.operationId;
  if(action==='participantList') {const task=await require('./entities').detail(db,actor,'tasks',req.params.id),p=page(req.query),count=await one(db.pool,'SELECT COUNT(*) total FROM fm_participations WHERE task_id=?',[task.id]);return {data:await rows(db.pool,'SELECT p.*,m.name FROM fm_participations p JOIN fm_members m ON m.id=p.member_id WHERE task_id=? ORDER BY p.id LIMIT ? OFFSET ?',[task.id,p.size,p.offset]),meta:{total:count.total,page:p.page,size:p.size}};}
  if(action==='managementList'){const p=page(req.query),count=await one(db.pool,'SELECT COUNT(*) total FROM fm_management');return {data:await rows(db.pool,'SELECT s.*,m.name member_name,c.name crew_name FROM fm_management s JOIN fm_members m ON m.id=s.member_id JOIN fm_crews c ON c.id=s.crew_id ORDER BY s.member_id,s.crew_id LIMIT ? OFFSET ?',[p.size,p.offset]),meta:{total:count.total,page:p.page,size:p.size}};}
  if(action==='reservationDetail') {
    const r=await one(db.pool,'SELECT * FROM fm_reservations WHERE id=?',[id(req.params.id)]);if(!r)fail(404,'NOT_FOUND','예약이 없습니다.');await assertVisible(db.pool,actor,'resources',await one(db.pool,'SELECT * FROM fm_resources WHERE id=?',[r.resource_id]));
    if(['Associate','Soldier'].includes(actor.role)&&r.member_id!==actor.member_id)fail(403,'OUT_OF_SCOPE','본인 예약만 조회할 수 있습니다.');return r;
  }
  if(action==='reservationList') {
    const s=scope(actor,'resources','r'),p=page(req.query);const clauses=[s.sql],args=[...s.args];
    if(['Associate','Soldier'].includes(actor.role)){clauses.push('b.member_id=?');args.push(actor.member_id);}
    for(const key of ['resource_id','member_id','task_id'])if(req.query[key]){clauses.push(`b.${key}=?`);args.push(id(req.query[key]));}
    if(req.query.status){clauses.push('b.status=?');args.push(String(req.query.status).slice(0,30));}
    const from=`FROM fm_reservations b JOIN fm_resources r ON r.id=b.resource_id WHERE ${clauses.join(' AND ')}`;
    const count=await one(db.pool,`SELECT COUNT(*) total ${from}`,args);return {data:await rows(db.pool,`SELECT b.*,r.name resource_name ${from} ORDER BY b.id DESC LIMIT ? OFFSET ?`,[...args,p.size,p.offset]),meta:{total:count.total,page:p.page,size:p.size}};
  }
  if(action==='pendingEvents'){const p=page(req.query);const count=await one(db.pool,'SELECT COUNT(*) total FROM fm_outbox WHERE delivered_at IS NULL');return {data:await rows(db.pool,'SELECT id,event_id,collection_name,attempts,last_error,created_at,next_attempt FROM fm_outbox WHERE delivered_at IS NULL ORDER BY id LIMIT ? OFFSET ?',[p.size,p.offset]),meta:{total:count.total,page:p.page,size:p.size}};}
  fail(404,'UNKNOWN_OPERATION','조회 작업이 없습니다.');
}
module.exports={execute};

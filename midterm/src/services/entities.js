'use strict';
const {entities}=require('../routes/entities');
const {fields,id,page,fail}=require('../validators');
const {rows,one,insert,update,event,transaction}=require('../repositories/sql');
const {requireRoles,assertVisible,scope,loadActor}=require('../permissions');
const {validateTaskSchedule,extensionRules}=require('./constraints');
function sanitize(entity,row) { if(!row)return row; const out={...row};if(entity==='accounts'){delete out.password_hash;delete out.failed_attempts;delete out.locked_until;} return out; }
async function list(db,actor,entity,query) {
  const d=entities[entity],s=scope(actor,entity),p=page(query); const clauses=[s.sql,'t.archived=0'];const args=[...s.args];
  for(const key of ['status','crew_id','member_id',d.parent].filter(Boolean)) {
    if(query[key]!==undefined && (Object.hasOwn(d.fields,key)||key==='status'||(entity==='members'&&key==='crew_id'))) {clauses.push(`t.${key}=?`);args.push(key.endsWith('_id')?id(query[key]):String(query[key]).slice(0,30));}
  }
  if(query.q) {clauses.push(`t.${d.fields.title?'title':entity==='accounts'?'username':'name'} LIKE ?`);args.push(`%${String(query.q).slice(0,100)}%`);}
  if(entity==='tasks'&&query.member_id){clauses.push("EXISTS(SELECT 1 FROM fm_participations pf WHERE pf.task_id=t.id AND pf.member_id=? AND pf.status<>'REMOVED')");args.push(id(query.member_id));}
  for(const [key,op] of [['from','>='],['to','<=']]) if(query[key]) {const v=fields({value:query[key]},{value:{type:'date'}}).value;const column=entity==='tasks'?(key==='from'?'starts_at':'ends_at'):'created_at';clauses.push(`t.${column}${op}?`);args.push(v);}
  const sort=['id','created_at','updated_at'].includes(query.sort)?query.sort:'id'; const direction=query.order==='asc'?'ASC':'DESC';
  const where=clauses.join(' AND ');const count=await one(db.pool,`SELECT COUNT(*) total FROM ${d.table} t WHERE ${where}`,args);
  const data=await rows(db.pool,`SELECT t.* FROM ${d.table} t WHERE ${where} ORDER BY t.${sort} ${direction},t.id ${direction} LIMIT ? OFFSET ?`,[...args,p.size,p.offset]);
  return {data:data.map(r=>sanitize(entity,r)),meta:{page:p.page,size:p.size,total:count.total}};
}
async function detail(db,actor,entity,value) {const row=await one(db.pool,`SELECT * FROM ${entities[entity].table} WHERE id=?`,[id(value)]);await assertVisible(db.pool,actor,entity,row);return sanitize(entity,row);}
async function mutate(db,actor,entity,mode,value,body) {
  const d=entities[entity];requireRoles(actor,d.write);
  return transaction(db,async conn=>{
    actor=await loadActor(conn,actor.account_id,actor.version);requireRoles(actor,d.write);
    let old=null;
    if(mode!=='create') {old=await one(conn,`SELECT * FROM ${d.table} WHERE id=? FOR UPDATE`,[id(value)]);await assertVisible(conn,actor,entity,old,true);if(old.archived)fail(409,'ARCHIVED','보관된 기록입니다.');}
    if(mode==='archive') {
      if(d.core)fail(409,'USE_LIFECYCLE','전용 상태 변경을 사용하세요.');
      fields(body,{});await extensionRules(conn,d,old,old,actor);
      for(const child of Object.values(entities).filter(e=>e.parentEntity===entity))if(await one(conn,`SELECT id FROM ${child.table} WHERE ${child.parent}=? AND archived=0 LIMIT 1`,[old.id]))fail(409,'ACTIVE_CHILDREN','하위 기록을 먼저 정리하세요.');
      if(['resource-categories','resource-locations'].includes(entity)){const column=entity==='resource-categories'?'category_id':'location_id';if(await one(conn,`SELECT id FROM fm_resources WHERE ${column}=? AND archived=0 LIMIT 1`,[old.id]))fail(409,'RESOURCE_REFERENCE','사용 중인 자원 분류/장소는 보관할 수 없습니다.');}
      await update(conn,d.table,old.id,{archived:1}); const after={...old,archived:1}; await event(conn,actor,'archived',entity,old,after,'초안 보관');return after;
    }
    const input=fields(body,d.fields,mode==='update');
    if(old && (d.parent || d.fields.crew_id || d.fields.member_id)) for(const key of [d.parent,'crew_id','member_id','predecessor_id'].filter(Boolean)) if(input[key]!==undefined && input[key]!==old[key]) fail(422,'IMMUTABLE_LINK','관계 필드는 일반 수정으로 변경할 수 없습니다.');
    const merged={...old,...input};
    if(entity==='accounts') {
      if(mode==='update')fail(409,'USE_ACCOUNT_ACTION','계정 전용 관리 기능을 사용하세요.');
      const member=await one(conn,'SELECT * FROM fm_members WHERE id=?',[input.member_id]);if(!member)fail(404,'NOT_FOUND','구성원이 없습니다.');
      input.password_hash=await require('./password').hashPassword(input.password);delete input.password;
    } else if(entity==='members' && mode==='create') {
      if(!['Boss','Administrator'].includes(actor.role))fail(403,'BOSS_REQUIRED','미소속 구성원 신규 등록은 Boss 또는 Administrator 권한입니다.');
    } else if(entity==='crews' && mode==='create') {
      if(actor.role!=='Boss')fail(403,'BOSS_REQUIRED','새 Crew 생성은 Boss 권한입니다.');
    } else await assertVisible(conn,actor,entity,merged,true);
    if(entity==='tasks') {
      if(old && ['COMPLETED','CANCELLED'].includes(old.status))fail(409,'TASK_CLOSED','종료 업무는 일반 수정할 수 없습니다.');
      await validateTaskSchedule(conn,{...merged,id:old?.id||0,exclusive:merged.exclusive??true});
    }
    if(entity==='resources')for(const [key,target] of [['category_id','resource-categories'],['location_id','resource-locations']])if(merged[key]) {
      const related=await one(conn,`SELECT * FROM ${entities[target].table} WHERE id=?`,[merged[key]]);await assertVisible(conn,actor,target,related,true);
      if(related.archived||related.crew_id!==merged.crew_id)fail(409,'RESOURCE_REFERENCE','같은 Crew의 활성 분류/장소를 지정하세요.');
    }
    if(!d.core)await extensionRules(conn,d,merged,old,actor);
    let identifier=old?.id;
    if(mode==='create')identifier=await insert(conn,d.table,d.core?input:{...input,author_id:actor.member_id});
    else await update(conn,d.table,identifier,input);
    const after=await one(conn,`SELECT * FROM ${d.table} WHERE id=?`,[identifier]);
    await event(conn,actor,mode,entity,old,after);return sanitize(entity,after);
  });
}
module.exports={list,detail,mutate,sanitize};

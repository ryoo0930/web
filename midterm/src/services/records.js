'use strict';
const {id,fail,page,fields}=require('../validators');
const {one,transaction}=require('../repositories/sql');
const {assertVisible,scopedIds,loadActor,requireRoles}=require('../permissions');
function objectId(value) {if(!/^[a-fA-F0-9]{24}$/.test(String(value)))fail(400,'INVALID_OBJECT_ID','24자리 ObjectId가 필요합니다.');return new (require('mongodb').ObjectId)(value);}
async function evaluationScope(db,actor) {
  if(['Boss','Administrator'].includes(actor.role))return {};
  if(['Associate','Soldier'].includes(actor.role))return {memberId:actor.member_id,status:'PUBLISHED'};
  return {memberId:{$in:await scopedIds(db.pool,actor,'members')}};
}
async function execute(db,req,op,input) {
  let actor=req.actor;const action=op.operationId,col=db.mongo.collection('fm_evaluations');
  if(action==='evaluationList') {
    const filter=await evaluationScope(db,actor),p=page(req.query);
    const conditions=[filter];if(req.query.member_id)conditions.push({memberId:id(req.query.member_id)});if(req.query.task_id)conditions.push({taskId:id(req.query.task_id)});
    const query={$and:conditions};return {data:await col.find(query).sort({createdAt:-1,_id:-1}).skip(p.offset).limit(p.size).toArray(),meta:{total:await col.countDocuments(query),page:p.page,size:p.size}};
  }
  if(action==='evaluationDetail') {const result=await col.findOne({$and:[{_id:objectId(req.params.id)},await evaluationScope(db,actor)]});if(!result)fail(404,'NOT_FOUND','접근 가능한 평가가 없습니다.');return result;}
  if(action.startsWith('evaluation'))return transaction(db,async conn=>{
    actor=await loadActor(conn,actor.account_id,actor.version);requireRoles(actor,op.roles);
    let before=null;
    if(action!=='evaluationCreate'){before=await col.findOne({_id:objectId(req.params.id)});if(!before)fail(404,'NOT_FOUND','평가가 없습니다.');}
    const memberId=before?.memberId||input.member_id,taskId=before?.taskId||input.task_id;
    const member=await one(conn,'SELECT * FROM fm_members WHERE id=?',[memberId]);await assertVisible(conn,actor,'members',member,true);
    const task=await one(conn,'SELECT * FROM fm_tasks WHERE id=?',[taskId]);await assertVisible(conn,actor,'tasks',task,true);
    if(task.status!=='COMPLETED'||!await one(conn,"SELECT id FROM fm_participations WHERE task_id=? AND member_id=? AND status='COMPLETED'",[taskId,memberId]))fail(409,'COMPLETED_ACTIVITY_REQUIRED','완료된 업무 참여 기록이 필요합니다.');
    if(memberId===actor.member_id)fail(403,'SELF_EVALUATION','자기 평가는 허용하지 않습니다.');
    const at=new Date().toISOString();
    if(action==='evaluationCreate') {
      const record={memberId,taskId,crewId:task.crew_id,score:input.score,body:input.body,status:'DRAFT',version:1,createdAt:at,updatedAt:at,revisions:[{version:1,actor:actor.member_id,action,reason:input.reason,score:input.score,body:input.body,status:'DRAFT',at}]};
      const result=await col.insertOne(record);return {...record,_id:result.insertedId};
    }
    if(before.version!==input.version)fail(409,'VERSION_CONFLICT','평가가 변경되었습니다. 다시 조회하세요.');
    const values={updatedAt:at};
    if(action==='evaluationRevise'){values.score=input.score;values.body=input.body;}
    if(action==='evaluationPublish'){if(before.status==='PUBLISHED')fail(409,'INVALID_TRANSITION','이미 공개된 평가입니다.');values.status='PUBLISHED';}
    if(action==='evaluationRetract'){if(before.status!=='PUBLISHED')fail(409,'INVALID_TRANSITION','공개된 평가만 철회할 수 있습니다.');values.status='RETRACTED';}
    const after={...before,...values,version:before.version+1};
    const result=await col.updateOne({_id:before._id,version:before.version},{$set:values,$inc:{version:1},$push:{revisions:{version:after.version,actor:actor.member_id,action,reason:input.reason,previous:{score:before.score,body:before.body,status:before.status},score:after.score,body:after.body,status:after.status,at}}});
    if(!result.modifiedCount)fail(409,'VERSION_CONFLICT','평가가 동시에 변경되었습니다.');return col.findOne({_id:before._id});
  });
  return history(db,req,op);
}
async function history(db,req,op) {
  const actor=req.actor,p=page(req.query);let query={},collection='fm_audit';
  if(op.operationId.endsWith('History')) {
    const entity=op.operationId.replace('History','');await require('./entities').detail(db,actor,entity,req.params.id);
    query=entity==='members'?{$or:[{entity,targetId:id(req.params.id)},{memberId:id(req.params.id)}]}:entity==='tasks'?{taskId:id(req.params.id)}:{resourceId:id(req.params.id)};
  } else if(op.operationId==='activityFeed') {
    const accessible=[];
    for(const entity of Object.keys(require('../routes/entities').entities).filter(x=>x!=='accounts'))accessible.push({entity,targetId:{$in:await scopedIds(db.pool,actor,entity)}});
    const resourceIds=await scopedIds(db.pool,actor,'resources');
    accessible.push({entity:'reservations',resourceId:{$in:resourceIds},...(['Associate','Soldier'].includes(actor.role)?{memberId:actor.member_id}:{})});
    accessible.push({entity:'participations',taskId:{$in:await scopedIds(db.pool,actor,'tasks')}});
    query={$or:accessible};
  }
  const filters=[query];
  for(const [key,field,opKey] of [['from','occurredAt','$gte'],['to','occurredAt','$lte']])if(req.query[key]) {const parsed=fields({at:req.query[key]},{at:{type:'date'}}).at;filters.push({[field]:{[opKey]:parsed.replace(' ','T')+'Z'}});}
  if(req.query.action)filters.push({action:String(req.query.action).slice(0,100)});
  const filter={$and:filters},col=db.mongo.collection(collection);
  return {data:await col.find(filter).sort({occurredAt:-1,_id:-1}).skip(p.offset).limit(p.size).toArray(),meta:{total:await col.countDocuments(filter),page:p.page,size:p.size,delivery:'SQL 기록은 내부 작업자의 전달 후 표시됩니다.'}};
}
module.exports={execute};

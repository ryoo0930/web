'use strict';
const {entities}=require('./entities');
const {actions}=require('./actions');
const catalog=[];
for(const d of Object.values(entities)) {
  const verbs=[['list','get',`/${d.key}`,`${d.label} 검색 및 페이지 목록`],['detail','get',`/${d.key}/:id`,`${d.label} 상세 조회`],['create','post',`/${d.key}`,`${d.label} 등록`]];
  if(d.key!=='accounts')verbs.push(['update','patch',`/${d.key}/:id`,`${d.label} 기본 정보 수정`]);
  if(!d.core)verbs.push(['archive','delete',`/${d.key}/:id`,`${d.label} 초안 보관`]);
  for(const [mode,method,path,title] of verbs)catalog.push({operationId:`${d.key}-${mode}`,method,path,title,group:d.key,requirements:d.fr,roles:['list','detail'].includes(mode)?d.read:d.write,input:['create','update'].includes(mode)?d.fields:{},entity:d.key,mode,extension:!d.core});
}
catalog.push(...actions);
for(const op of catalog) {
  if(op.entity==='members'&&op.mode==='create')op.roles=['Boss','Administrator'];
  if(op.entity==='members'&&op.mode==='update')op.roles=['Capo','Underboss','Boss'];
  if(op.entity==='crews'&&op.mode==='create')op.roles=['Boss'];
  if(op.mode==='list')op.requirements=[...op.requirements,'FR-21','AR-03'];
  op.path='/api/v1'+op.path;
  const query={};
  const addQuery=(names)=>{for(const name of names.split(' '))query[name]=name==='page'||name==='size'||name.endsWith('_id')?{type:'id'}:name==='from'||name==='to'?{type:'date'}:{type:'string',max:100};};
  if(op.mode==='list'){
    addQuery('q status from to page size sort order');
    for(const key of ['crew_id','member_id',entities[op.entity].parent].filter(Boolean))if(entities[op.entity].fields[key]||(op.entity==='members'&&key==='crew_id'))query[key]={type:'id'};
    if(op.entity==='tasks')query.member_id={type:'id'};
  }
  if(op.operationId==='evaluationList')addQuery('member_id task_id page size');
  if(op.operationId==='reservationList')addQuery('resource_id member_id task_id status page size');
  if(['participantList','managementList','pendingEvents'].includes(op.operationId))addQuery('page size');
  if(op.operationId.endsWith('History')||['activityFeed','auditLog'].includes(op.operationId))addQuery('from to action page size');
  if(op.group==='reports')addQuery(op.operationId==='report-maintenance-due'?'from to':op.operationId==='report-evaluation-summary'?'crew_id from to':'crew_id status from to');
  op.parameters={path:Object.fromEntries([...op.path.matchAll(/:([A-Za-z]+)/g)].map(m=>[m[1],{type:op.group==='evaluations'?'string':'id',required:true}])),query,headers:op.method==='get'?{}:{'X-CSRF-Token':{type:'string',required:true}}};
  op.scope=op.entity?entities[op.entity].scope:op.roles.length===1&&op.roles[0]==='Administrator'?'technical-admin':'current role and target Crew/member ownership';
  op.implementation=op.entity?'src/services/entities.js#'+(op.mode==='list'?'list':op.mode==='detail'?'detail':'mutate'):op.group==='auth'?'src/services/auth.js#execute':op.group==='evaluations'||op.operationId.endsWith('History')||['activityFeed','auditLog'].includes(op.operationId)?'src/services/records.js#execute':op.group==='reports'?'src/services/reports.js#execute':'src/services/operations.js#execute';
  op.status='implemented-unexecuted';
  op.purpose=op.title+'; 역할 및 대상 범위 검사 후 처리';
  op.database=op.implementation.includes('records')?'MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인':op.implementation.includes('reports')?'MySQL/MongoDB 범위 제한 집계':op.method==='get'?'MySQL 범위 제한 조회':'MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)';
  op.difference=op.mode==='list'?'검색·총건수·페이지 탐색':op.mode==='detail'?'단일 대상 존재/권한 확인과 전체 필드':op.mode==='create'?'새 도메인 개체 생성과 관계 검증':op.mode==='update'?'기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지':op.mode==='archive'?'초안만 비활성화하며 관계/이력 보존':op.workflow?`${op.workflow.from} → ${op.workflow.to}; ${op.title} 도메인 조건 검사`:op.title;
  if(op.workflow&&['task-checklists','task-milestones','task-deliverables','task-risks','crew-announcements','crew-meetings','meeting-minutes','operating-guidelines','onboarding-steps'].includes(op.workflow.entity))op.duplicateReview=true;
  op.countingNote=op.duplicateReview?'보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.':'독립 기능 후보: '+op.difference;
  const prerequisites={
    csrf:'쿠키를 보존하는 브라우저/클라이언트 준비',login:'ACTIVE 계정과 활동 가능한 구성원, 실제 비밀번호, 사전 CSRF 발급',logout:'유효한 현재 세션',identity:'유효한 세션; 현재 역할/정식 소속/관리 범위 준비',changePassword:'현재 비밀번호를 확인하고 새 12~128자 비밀번호 준비',sessions:'현재 계정에 로그인 세션이 있어야 함',revokeSessions:'현재 세션; 성공 후 재로그인 준비',
    accountBlock:'ACTIVE 대상 계정; 마지막 활성 Administrator는 대상에서 제외',accountUnblock:'BLOCKED 대상 계정',accountPassword:'대상 계정과 새 12~128자 비밀번호 준비',accountSessions:'대상 계정 로그인 세션 준비',
    memberRole:'자기가 아닌 하위 역할의 구성원; 부여 역할도 행위자보다 낮아야 함; Crew 책임자라면 먼저 교체',memberStatus:'PENDING→ACTIVE/WITHDRAWN, ACTIVE→SUSPENDED/WITHDRAWN, SUSPENDED→ACTIVE/WITHDRAWN; 정지/탈퇴 전 활성 업무·예약·책임자 관계 정리',membershipAdd:'미소속이며 탈퇴하지 않은 일반 구성원과 관리 가능한 Crew',membershipTransfer:'현재 소속과 도착 Crew 모두 관리 가능; 활성 업무·예약·책임자 관계 없음',membershipRemove:'현재 소속 관리 가능; 활성 업무·예약·책임자 관계 없음',crewLeader:'대상 Crew에 정식 소속된 ACTIVE Capo',crewArchive:'구성원·업무·자원이 없는 빈 Crew',managementGrant:'Underboss와 존재하는 Crew; 같은 관리 관계 없음',managementRevoke:'해당 Underboss/Crew 관리 관계가 존재',
    taskStart:'PLANNED 업무, 참여자 최소 한 명, 선행 업무 모두 완료',taskPause:'IN_PROGRESS 업무',taskResume:'PAUSED 업무, 참여자 최소 한 명, 선행 업무 완료',taskComplete:'IN_PROGRESS 업무, 사용 중 자원 모두 반환, 완료 결과 작성',taskCancel:'PLANNED/IN_PROGRESS/PAUSED 업무, 사용 중 자원 반환',taskCorrect:'COMPLETED 업무, 정정 결과와 정정 사유',participantList:'접근 가능한 업무',participantAdd:'종료 전 업무, 같은 Crew의 정지/탈퇴하지 않은 구성원, 업무·부재 시간 충돌 없음',participantRemove:'종료 전 업무와 기존 참여자, 해당 업무의 예약/사용 자원 없음',participantContribution:'종료 전 업무에 본인이 배정되어 있어야 함',
    reservationCreate:'같은 Crew의 활동 중 구성원과 AVAILABLE 자원, 중복 없는 기간, 업무 연결 시 실제 참여자와 업무 시간 범위 일치',reservationReschedule:'RESERVED 예약; 변경 기간에 예약·정비 충돌 없음',reservationCheckout:'RESERVED 예약의 현재 시간 범위 안, 본인 또는 관리자, 다른 미반환 사용 없음',reservationReturn:'IN_USE 예약, 본인 또는 관리자, GOOD/DAMAGED 반환 상태',reservationCancel:'RESERVED 예약',resourceStatus:'활성 예약/사용/정비 없음, RETIRED가 아닌 자원',
    evaluationCreate:'관리 가능한 구성원의 COMPLETED 업무와 COMPLETED 참여 기록, 자기 평가 아님',evaluationRevise:'해당 평가의 최신 version과 대상 구성원/완료 업무 관리 권한',evaluationPublish:'DRAFT 또는 RETRACTED 평가와 최신 version',evaluationRetract:'PUBLISHED 평가와 최신 version',retryEvent:'전달되지 않은 outbox ID; 전달 완료 이벤트 제외'
  };
  op.preconditions=prerequisites[op.operationId]||(op.workflow?`${op.workflow.entity}가 ${op.workflow.from} 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요`:(op.mode==='create'?'필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보':op.mode==='update'?'존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지':op.mode==='archive'?'DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상':'해당 역할과 조회 범위의 실제 데이터 준비'));
  op.responses={success:{success:true,data:op.method==='get'?[]:{id:1}},error:{success:false,error:{code:'OUT_OF_SCOPE',message:'관리 또는 조회 범위 밖의 대상입니다.'}}};
  if(op.entity) {
    const sample={id:1,...Object.fromEntries(Object.entries(entities[op.entity].fields).filter(([key])=>key!=='password').map(([key,s])=>[key,s.enum?s.enum[0]:s.type==='id'?1:s.type==='number'?s.min||1:s.type==='boolean'?true:s.type==='date'?'2026-11-01 01:00:00.000':`${key} 예시`]))};
    op.responses.success=op.mode==='list'?{success:true,data:[sample],meta:{page:1,size:20,total:1}}:{success:true,data:sample};
  }
  if(op.operationId==='csrf')op.responses.success={success:true,data:{csrfToken:'<세션에 연결된 무작위 토큰>'}};
  if(op.operationId==='identity')op.responses.success={success:true,data:{memberId:1,name:'구성원',role:'Soldier',status:'ACTIVE',crewId:1,managedCrews:[]}};
  op.manual=`${op.roles.join('/')} 계정으로 로그인 후 ${op.method.toUpperCase()} ${op.path}. 생성/목록 응답에서 얻은 ID를 사용. ${op.difference}. 관측 결과: 미실행.`;
}
module.exports={catalog};

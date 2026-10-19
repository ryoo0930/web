'use strict';
const {str,ref,date,choice,number,roles,managers}=require('./entities');
const actions=[];
function add(operationId,method,path,title,group,requirements,allowed,schema={},extra={}) {
  actions.push({operationId,method,path,title,group,requirements,roles:allowed,input:schema,...extra});
}
add('csrf','get','/auth/csrf','세션 CSRF 토큰 발급','auth',['FR-23'],roles,{}, {public:true});
add('login','post','/auth/login','계정 로그인','auth',['FR-23'],roles,{username:str(true,80),password:str(true,128)},{public:true});
add('logout','post','/auth/logout','현재 세션 로그아웃','auth',['FR-23'],roles);
add('identity','get','/auth/identity','현재 인증 및 접근 범위 확인','auth',['FR-02','FR-23'],roles);
add('changePassword','post','/auth/password','본인 비밀번호 변경 및 세션 종료','auth',['FR-23'],roles,{current_password:str(true,128),new_password:str(true,128)});
add('sessions','get','/auth/sessions','본인 접속 세션 목록','auth',['FR-23'],roles);
add('revokeSessions','delete','/auth/sessions','본인 전체 세션 종료','auth',['FR-23'],roles);
add('accountBlock','post','/accounts/:id/block','계정 차단','accounts',['FR-23'],['Administrator'],{reason:str(true)});
add('accountUnblock','post','/accounts/:id/unblock','계정 차단 해제','accounts',['FR-23'],['Administrator'],{reason:str(true)});
add('accountPassword','post','/accounts/:id/reset-password','관리자 비밀번호 재설정','accounts',['FR-23'],['Administrator'],{new_password:str(true,128),reason:str(true)});
add('accountSessions','delete','/accounts/:id/sessions','대상 계정 세션 강제 종료','accounts',['FR-23'],['Administrator'],{reason:str(true)},{duplicateReview:true});
add('memberRole','post','/members/:id/role','구성원 역할 변경','members',['FR-03','BR-04','BR-10'],['Boss','Administrator'],{role:choice(roles.join('|'),true),reason:str(true)});
add('memberStatus','post','/members/:id/status','구성원 활동 상태 전이','members',['FR-04','BR-02','BR-10'],managers,{status:choice('ACTIVE|PENDING|SUSPENDED|WITHDRAWN',true),reason:str(true)});
add('membershipAdd','post','/crews/:id/memberships','미소속 구성원 Crew 편입','crews',['FR-06','BR-01','BR-05'],managers,{member_id:ref(true),reason:str(true)});
add('membershipTransfer','post','/members/:id/transfer','정식 소속 전속 이동','crews',['FR-06','BR-01','BR-05'],managers,{crew_id:ref(true),reason:str(true)});
add('membershipRemove','post','/members/:id/detach','정식 소속 해제','crews',['FR-06','BR-10'],managers,{reason:str(true)});
add('crewLeader','post','/crews/:id/leader','Crew 책임자 지정','crews',['FR-05','FR-06'],['Boss','Underboss'],{member_id:ref(true),reason:str(true)});
add('crewArchive','post','/crews/:id/archive','빈 Crew 운영 종료','crews',['FR-05'],['Boss'],{reason:str(true)});
add('managementList','get','/management-scopes','여러 Crew 관리 범위 조회','crews',['FR-23'],['Boss','Administrator']);
add('managementGrant','post','/management-scopes','Underboss 관리 범위 부여','crews',['FR-23','FR-06'],['Boss'],{member_id:ref(true),crew_id:ref(true),reason:str(true)});
add('managementRevoke','delete','/management-scopes/:id/crews/:crewId','Underboss 관리 범위 회수','crews',['FR-23'],['Boss'],{reason:str(true)});
for(const [name,label] of [['start','시작'],['pause','일시 중지'],['resume','재개'],['complete','완료'],['cancel','취소']]) add(`task${name[0].toUpperCase()+name.slice(1)}`,'post',`/tasks/:id/${name}`,`업무 ${label}`,'tasks',['FR-10','FR-11'],managers,name==='complete'?{result:str(true,12000),reason:str(true)}:{reason:str(true)});
add('taskCorrect','post','/tasks/:id/correct-result','완료 결과 정정','tasks',['FR-11','BR-06','BR-10'],managers,{result:str(true,12000),reason:str(true)});
add('participantList','get','/tasks/:id/participants','업무 참여 및 기여 기록','tasks',['FR-08','FR-11'],roles);
add('participantAdd','post','/tasks/:id/participants','업무 참여자 배정','tasks',['FR-08','BR-02','BR-03'],managers,{member_id:ref(true),reason:str(true)});
add('participantRemove','delete','/tasks/:id/participants/:memberId','업무 참여자 배정 해제','tasks',['FR-08'],managers,{reason:str(true)});
add('participantContribution','patch','/tasks/:id/contribution','본인 참여 기여 기록 제출','tasks',['FR-11'],['Soldier',...managers],{contribution:str(true,4000)});
add('reservationList','get','/reservations','자원 배정 및 예약 탐색','resources',['FR-15','FR-17'],roles);
add('reservationDetail','get','/reservations/:id','예약 상세와 반환 상태','resources',['FR-15'],roles);
add('reservationCreate','post','/reservations','자원 사용 예약','resources',['FR-17','BR-07','BR-08'],managers,{resource_id:ref(true),task_id:ref(),member_id:ref(true),starts_at:date(true),ends_at:date(true),reason:str(true)});
add('reservationReschedule','patch','/reservations/:id','예약 시간 변경','resources',['FR-17','BR-07'],managers,{starts_at:date(true),ends_at:date(true),reason:str(true)});
add('reservationCheckout','post','/reservations/:id/checkout','예약 자원 인수','resources',['FR-15','BR-07'],['Soldier',...managers],{reason:str(true)});
add('reservationReturn','post','/reservations/:id/return','사용 자원 반환','resources',['FR-15'],['Soldier',...managers],{condition:choice('GOOD|DAMAGED',true),reason:str(true)});
add('reservationCancel','post','/reservations/:id/cancel','미사용 예약 취소','resources',['FR-17'],managers,{reason:str(true)});
add('resourceStatus','post','/resources/:id/status','자원 가용 상태 변경','resources',['FR-13','FR-16','BR-08'],managers,{status:choice('AVAILABLE|INSPECTION|UNAVAILABLE|RETIRED',true),reason:str(true)});
add('evaluationList','get','/evaluations','활동 결과 평가 탐색','evaluations',['FR-18','FR-19'],roles);
add('evaluationDetail','get','/evaluations/:id','평가 원본 및 수정 이력','evaluations',['FR-19','BR-10'],roles);
add('evaluationCreate','post','/evaluations','완료 활동 평가 작성','evaluations',['FR-18'],managers,{member_id:ref(true),task_id:ref(true),score:number(1,5,true),body:str(true,8000),reason:str(true)});
add('evaluationRevise','patch','/evaluations/:id','평가 정정 및 이전 값 보존','evaluations',['FR-18','BR-10'],managers,{version:number(1,1000000,true),score:number(1,5,true),body:str(true,8000),reason:str(true)});
add('evaluationPublish','post','/evaluations/:id/publish','평가 공개 확정','evaluations',['FR-18'],managers,{version:number(1,1000000,true),reason:str(true)});
add('evaluationRetract','post','/evaluations/:id/retract','공개 평가 철회 및 이력 보존','evaluations',['FR-18','BR-10'],managers,{version:number(1,1000000,true),reason:str(true)});
for(const [entity,fr] of [['members','FR-19'],['tasks','FR-10'],['resources','FR-15']])add(`${entity}History`,'get',`/${entity}/:id/history`,`${entity} 변경 이력`,'history',[fr,'BR-10'],roles);
add('activityFeed','get','/activity','접근 범위 내 활동 타임라인','history',['FR-19','FR-20'],roles);
add('auditLog','get','/audit','관리자 감사 기록','history',['FR-20','FR-23'],['Administrator']);
add('pendingEvents','get','/outbox/pending','미전달 기록 및 재시도 상태','history',['FR-20'],['Administrator']);
add('retryEvent','post','/outbox/:id/retry','기록 전달 재시도 예약','history',['FR-20'],['Administrator'],{reason:str(true)});
for(const [key,title,fr] of [['workload','구성원별 활성 업무 부하','FR-22'],['task-status','Crew별 업무 상태 분포','FR-22'],['member-status','Crew별 구성원 상태 분포','FR-22'],['resource-utilization','자원별 예약 시간 합계','FR-22'],['overdue-tasks','기한 초과 미완료 업무','FR-22'],['completion-rate','기간별 업무 완료율','FR-22'],['evaluation-summary','활동 평가 점수 분포','FR-22'],['maintenance-due','자원 점검 예정 현황','FR-16']])add(`report-${key}`,'get',`/reports/${key}`,title,'reports',[fr],['Capo','Underboss','Boss','Administrator']);
const workflows={
  'task-checklists':[['check','확인 완료','DRAFT','CHECKED'],['uncheck','확인 취소','CHECKED','DRAFT']],
  'task-milestones':[['achieve','중간 목표 달성','DRAFT','ACHIEVED']],
  'task-deliverables':[['submit','산출물 검토 요청','DRAFT','SUBMITTED'],['accept','산출물 승인','SUBMITTED','ACCEPTED'],['reject','산출물 반려','SUBMITTED','DRAFT']],
  'task-risks':[['resolve','위험 해소','DRAFT','RESOLVED']],
  'resource-inspections':[['pass','점검 통과','DRAFT','PASSED'],['fail','점검 불합격','DRAFT','FAILED']],
  'resource-maintenance':[['schedule','정비 일정 확정','DRAFT','SCHEDULED'],['begin','정비 시작','SCHEDULED','IN_PROGRESS'],['finish','정비 완료','IN_PROGRESS','COMPLETED']],
  'resource-incidents':[['acknowledge','장애 접수','DRAFT','ACKNOWLEDGED'],['resolve','장애 해결','ACKNOWLEDGED','RESOLVED']],
  'leave-requests':[['submit','휴가 결재 요청','DRAFT','SUBMITTED'],['approve','휴가 승인','SUBMITTED','APPROVED'],['reject','휴가 반려','SUBMITTED','REJECTED'],['withdraw','휴가 신청 철회','SUBMITTED','DRAFT']],
  'crew-announcements':[['publish','공지 게시','DRAFT','PUBLISHED']],
  'crew-meetings':[['open','회의 시작','DRAFT','IN_PROGRESS'],['close','회의 종료','IN_PROGRESS','COMPLETED']],
  'meeting-minutes':[['ratify','회의록 확정','DRAFT','RATIFIED']],
  'operating-guidelines':[['activate','운영 지침 시행','DRAFT','ACTIVE']],
  'onboarding-plans':[['complete','적응 계획 완료','DRAFT','COMPLETED']],
  'onboarding-steps':[['complete','적응 실습 완료','DRAFT','COMPLETED']],
  'training-sessions':[['open','교육 시작','DRAFT','IN_PROGRESS'],['close','교육 종료','IN_PROGRESS','COMPLETED']],
  'training-enrollments':[['attend','교육 출석 확인','DRAFT','ATTENDED'],['complete','교육 이수 확인','ATTENDED','COMPLETED']]
};
const {entities}=require('./entities');
for(const [entity,steps] of Object.entries(workflows))for(const [verb,title,from,to] of steps) {
  const own=['check','uncheck','submit','withdraw'].includes(verb);
  add(`${entity}-${verb}`,'post',`/${entity}/:id/${verb}`,title,entity,entities[entity].fr,own?entities[entity].write:managers,{reason:str(true),outcome:str(true,4000)},{workflow:{entity,verb,from,to}});
}
module.exports={actions};

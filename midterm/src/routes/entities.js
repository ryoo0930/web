'use strict';
const str = (required = false, max = 2000) => ({ type: 'string', required, max });
const ref = (required = false) => ({ type: 'id', required });
const date = (required = false) => ({ type: 'date', required });
const choice = (values, required = false) => ({ type: 'string', enum: values.split('|'), required });
const number = (min, max, required = false) => ({ type: 'number', min, max, required });
const roles = ['Associate', 'Soldier', 'Capo', 'Underboss', 'Boss', 'Administrator'];
const managers = ['Capo', 'Underboss', 'Boss'];
// Every definition fixes its physical table, editable fields, scope and domain validator.
const entities = {
  members: { label: '구성원', fr: ['FR-01','FR-02','FR-03','FR-04'], scope: 'member', write: [...managers,'Administrator'], core: true, fields: { name: str(true,100), email: str(false,254), bio: str() } },
  crews: { label: 'Crew', fr: ['FR-05','FR-06'], scope: 'crew', write: ['Boss','Underboss'], core: true, fields: { name: str(true,100), description: str() } },
  tasks: { label: '업무', fr: ['FR-07','FR-09','FR-12'], scope: 'task', write: managers, core: true, fields: { title: str(true,200), description: str(), crew_id: ref(true), starts_at: date(true), ends_at: date(true), priority: choice('LOW|NORMAL|HIGH|URGENT'), exclusive: { type: 'boolean' } } },
  resources: { label: '공용 자원', fr: ['FR-13','FR-14','FR-16'], scope: 'resource', write: managers, core: true, fields: { name: str(true,150), description: str(), crew_id: ref(true), asset_tag: str(true,80), location: str(false,200),category_id:ref(),location_id:ref() } },
  accounts: { label: '계정', fr: ['FR-23'], scope: 'admin', write: ['Administrator'], core: true, fields: { username: str(true,80), member_id: ref(true), password: str(true,128) } },
  'task-notes': { label: '업무 협업 메모', fr: ['FR-10'], parent: 'task_id', parentEntity: 'tasks', write: ['Soldier',...managers], fields: { task_id: ref(true), title: str(true,150), body: str(true,8000) } },
  'task-checklists': { label: '업무 체크리스트 항목', fr: ['FR-10'], parent: 'task_id', parentEntity: 'tasks', write: ['Soldier',...managers], fields: { task_id: ref(true), title: str(true,200), position: number(0,999) } },
  'task-milestones': { label: '업무 중간 목표', fr: ['FR-07','FR-10'], parent: 'task_id', parentEntity: 'tasks', write: managers, fields: { task_id: ref(true), title: str(true,200), due_at: date(true), acceptance: str(true) } },
  'task-dependencies': { label: '업무 선행 조건', fr: ['FR-07'], parent: 'task_id', parentEntity: 'tasks', write: managers, fields: { task_id: ref(true), predecessor_id: ref(true), reason: str(true) } },
  'task-templates': { label: '반복 업무 서식', fr: ['FR-07'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,200), instructions: str(true,8000), duration_minutes: number(1,43200,true) } },
  'task-deliverables': { label: '업무 산출물 참조', fr: ['FR-11'], parent: 'task_id', parentEntity: 'tasks', write: ['Soldier',...managers], fields: { task_id: ref(true), title: str(true,200), reference: str(true,1000), description: str() } },
  'task-risks': { label: '업무 위험 및 대응', fr: ['FR-10'], parent: 'task_id', parentEntity: 'tasks', write: ['Soldier',...managers], fields: { task_id: ref(true), title: str(true,200), likelihood: number(1,5,true), impact: number(1,5,true), mitigation: str(true) } },
  'resource-inspections': { label: '자원 점검표', fr: ['FR-16'], parent: 'resource_id', parentEntity: 'resources', write: managers, fields: { resource_id: ref(true), title: str(true,200), due_at: date(true), criteria: str(true,8000) } },
  'resource-maintenance': { label: '자원 정비 작업', fr: ['FR-16'], parent: 'resource_id', parentEntity: 'resources', write: managers, fields: { resource_id: ref(true), title: str(true,200), starts_at: date(true), ends_at: date(true), instructions: str(true) } },
  'resource-incidents': { label: '자원 장애 신고', fr: ['FR-15','FR-16'], parent: 'resource_id', parentEntity: 'resources', write: ['Soldier',...managers], fields: { resource_id: ref(true), title: str(true,200), severity: choice('LOW|MEDIUM|HIGH',true), description: str(true) } },
  'resource-categories': { label: '자원 분류 기준', fr: ['FR-13'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,120), handling_rules: str(true), inspection_days: number(1,3650,true) } },
  'resource-locations': { label: '자원 보관 장소', fr: ['FR-13','FR-14'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,120), address: str(true,300), access_instructions: str(true) } },
  'member-skills': { label: '구성원 역량', fr: ['FR-01','FR-18'], parent: 'member_id', parentEntity: 'members', write: managers, fields: { member_id: ref(true), title: str(true,150), level: number(1,5,true), evidence: str(true) } },
  'member-certifications': { label: '구성원 자격', fr: ['FR-01','FR-18'], parent: 'member_id', parentEntity: 'members', write: managers, fields: { member_id: ref(true), title: str(true,150), issuer: str(true,150), expires_at: date(true), reference: str(true,300) } },
  'member-availability': { label: '구성원 부재 시간', fr: ['FR-08'], parent: 'member_id', parentEntity: 'members', write: ['Associate','Soldier',...managers], fields: { member_id: ref(true), title: str(true,150), starts_at: date(true), ends_at: date(true), reason: str(true) } },
  'leave-requests': { label: '활동 휴가 신청', fr: ['FR-04','FR-08'], parent: 'member_id', parentEntity: 'members', write: ['Associate','Soldier',...managers], fields: { member_id: ref(true), title: str(true,150), starts_at: date(true), ends_at: date(true), reason: str(true) } },
  'crew-announcements': { label: 'Crew 운영 공지', fr: ['FR-05'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,200), body: str(true,8000), expires_at: date(true) } },
  'crew-meetings': { label: 'Crew 운영 회의', fr: ['FR-05','FR-07'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,200), starts_at: date(true), ends_at: date(true), location: str(true,200) } },
  'meeting-agenda': { label: '회의 안건', fr: ['FR-05','FR-07'], parent: 'meeting_id', parentEntity: 'crew-meetings', write: managers, fields: { meeting_id: ref(true), title: str(true,200), proposal: str(true,8000), position: number(0,999) } },
  'meeting-minutes': { label: '회의 결정 기록', fr: ['FR-20'], parent: 'meeting_id', parentEntity: 'crew-meetings', write: managers, fields: { meeting_id: ref(true), title: str(true,200), decision: str(true,8000), follow_up: str() } },
  'operating-guidelines': { label: 'Crew 운영 지침', fr: ['FR-05','FR-20'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,200), body: str(true,12000), effective_at: date(true) } },
  'onboarding-plans': { label: '구성원 적응 계획', fr: ['FR-01','FR-04'], parent: 'member_id', parentEntity: 'members', write: managers, fields: { member_id: ref(true), title: str(true,200), due_at: date(true), objectives: str(true) } },
  'onboarding-steps': { label: '적응 계획 실습 항목', fr: ['FR-01','FR-04'], parent: 'plan_id', parentEntity: 'onboarding-plans', write: managers, fields: { plan_id: ref(true), title: str(true,200), instructions: str(true), position: number(0,999) } },
  'training-sessions': { label: '조직 운영 교육', fr: ['FR-18','FR-19'], scope: 'crewChild', write: managers, fields: { crew_id: ref(true), title: str(true,200), starts_at: date(true), ends_at: date(true), capacity: number(1,1000,true), syllabus: str(true) } },
  'training-enrollments': { label: '교육 참가 신청', fr: ['FR-18','FR-19'], parent: 'training_id', parentEntity: 'training-sessions', write: managers, fields: { training_id: ref(true), member_id: ref(true), title: str(true,150), goal: str(true) } }
};
for (const [key, d] of Object.entries(entities)) {
  d.key = key; d.table = `fm_${key.replaceAll('-', '_')}`;
  d.read = d.scope === 'admin' ? ['Administrator'] : roles;
  d.scope ||= 'parent';
}
module.exports = { entities, roles, managers, str, ref, date, choice, number };

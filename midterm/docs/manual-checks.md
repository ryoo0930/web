# 수동 기능 확인 절차

모든 관측 결과는 **미실행**. 아래 절차는 사용자가 실행한다. 서버 시작/DB/HTTP/브라우저 자동화는 작성자가 수행하지 않았다. 먼저 README의 환경을 준비하고 DEMO_SEED=true로 실행하거나 생성 API로 데이터를 준비한다. `.local/initial-accounts.txt`의 역할별 계정을 사용한다. 생성 응답의 ID를 기록하여 다음 요청에서 참조한다. 예시의 1은 존재를 가정한 값이 아니며 실제 ID로 바꾼다.

웹 로그인 후 업무 도구의 기능명을 선택하면 동일 요청을 폼에서 수행할 수 있다. Swagger도 같은 쿠키를 공유한다. 직접 요청은 csrf → login → 새 csrfToken 순서로 인증한다.

## 독립 거부·보존 시나리오

| 규칙 | 사전조건 | 구체적 요청/조작 | 예상 결과 | 확인 위치 | 관측 결과 |
|---|---|---|---|---|---|
| BR-01 | Boss로 두 Crew와 구성원 생성 후 A 편입 | B 편입 요청에 이미 A 소속 member_id 사용 | 409 ALREADY_MEMBER; 기존 crew_id 유지 | 구성원 상세 및 이력 | 미실행 |
| BR-02 | 정지/탈퇴 시드 계정의 구성원 ID 확보 | POST /tasks/{taskId}/participants 에 해당 member_id | 409 MEMBER_INACTIVE; 참여 행 없음 | 참여 목록 | 미실행 |
| BR-03 | 동일 Crew Soldier와 두 업무 생성; A 10:00~11:00, B 10:30~11:30 UTC+09:00 | A에 배정한 동일 member_id를 B에 배정 | 409 TASK_OVERLAP; 11:00 시작 업무는 경계 중복 없음 | 각 업무 참여 목록 | 미실행 |
| BR-04 | Boss와 Administrator 구성원 ID 확보 | Boss로 Administrator 역할 변경 또는 Boss 역할을 다른 사람에게 부여 | 403 ROLE_BOUNDARY; 역할 유지 | 구성원 상세 | 미실행 |
| BR-05 | capo-a 로그인; Crew B ID 확보 | B에 대한 편입·업무 수정 API를 직접 호출 | 403 OUT_OF_SCOPE; 상태 유지 | B는 다른 권한 계정으로 확인 | 미실행 |
| BR-06 | soldier 로그인; 완료 업무 ID 확보 | PATCH tasks/{id} 에 result 필드 또는 correct-result 호출 | 미허용 필드 422 또는 역할 403; 결과 유지 | Boss로 업무 상세/이력 | 미실행 |
| BR-07 | 같은 자원으로 10:00~11:00 예약 생성 | 같은 자원 10:30~11:30 재예약; 미반환 IN_USE에도 재예약 | 409 RESOURCE_OVERLAP 또는 RESOURCE_IN_USE | 예약 목록 및 자원 이력 | 미실행 |
| BR-08 | INSPECTION/UNAVAILABLE/RETIRED 자원 ID 확보 | 신규 자원 예약 | 409 RESOURCE_UNAVAILABLE; 예약 없음 | 예약 목록 | 미실행 |
| BR-09 | A 담당 Capo 세션과 B 대상 ID 확보 | URL 직접 입력, 상세/편집/이력/검색·페이지 요청 | 대상 403; 목록/총건수는 A 범위만 | UI 목록과 API 응답 대조 | 미실행 |
| BR-10 | 관리 권한 계정으로 역할·소속·상태 변경, 완료 활동 평가 생성 | Mongo 전달 후 이력 조회; 평가 version으로 정정 | 이전 값·이유·actor·시각 보존; 비밀정보 없음 | members/{id}/history, evaluations/{id}, audit | 미실행 |
| 동시 구성원 배정 | 서로 겹치는 두 업무·같은 구성원, 서로 다른 두 관리자 세션 | 두 창에서 같은 시각에 참여 배정 | 하나만 201/200; 다른 요청 409; 중복 배정 없음 | 참여 목록 및 DB | 미실행 |
| 동시 자원 배정 | 같은 자원과 겹치는 예약, 두 관리자 세션 | 두 창에서 예약을 동시에 제출 | 하나만 201; 다른 요청 409 | 자원 예약 목록 | 미실행 |
| 일정 변경 충돌 | 한 구성원이 겹치지 않는 A/B 업무 참여 | PATCH A 시간 범위를 B와 겹치게 변경 | 409; 기존 일정과 참여 관계 유지 | A 상세 | 미실행 |
| 재시작 보존 | 기록/계정 생성 후 서버 정상 종료 | 같은 환경에서 node app.js 실행 | 기존 데이터·비밀번호·세션 비밀키 유지; 중복 시드 없음 | 생성 목록과 계정 로그인 | 미실행 |
| Mongo 전달 복구 | 두 DB가 정상인 상태로 서버 시작; 사용자가 Mongo 서비스를 잠시 중지 | SQL 업무 변경 후 관리자 대기열 확인; Mongo 재시작 | SQL 변경 유지, attempts 증가; 복구 후 한 eventId당 이력 한 건 | outbox/pending 및 audit | 미실행 |
| CSRF | 로그인 후 쿠키만 유지 | X-CSRF-Token 누락/오류 값으로 변경 요청 | 403 CSRF_INVALID; DB 변경 없음 | 응답 및 상세 | 미실행 |
| 평가 버전 충돌 | 한 평가의 동일 version을 두 창에서 확보 | 동일 version으로 다른 정정 동시 제출 | 한 요청 200, 다른 409 VERSION_CONFLICT; revisions 보존 | 평가 상세 | 미실행 |
| 세 진입점 | DB 서비스와 의존성 준비; 서버 한 번만 실행 | node app.js, 종료 후 node server.js, 종료 후 npm start | 각각 동일 8593에서 표시; 포트 변경 없음 | 사용자 브라우저 | 미실행 |
| 8593 충돌 | 8593에서 첫 앱 실행 중 | 다른 터미널에서 두 번째 앱 실행 | 두 번째 앱 충돌 안내 후 종료; 첫 프로세스 유지 | 터미널과 기존 화면 | 미실행 |

## API별 절차

### 구성원 검색 및 페이지 목록 (members-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/members**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 상세 조회 (members-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 상세 조회” 또는 Swagger **GET /api/v1/members/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 등록 (members-create)

- 계정: Boss / Administrator
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. 
- 조작: 업무 도구에서 “구성원 등록” 또는 Swagger **POST /api/v1/members**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"name":"name 입력 예시","email":"member@example.test","bio":"bio 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 기본 정보 수정 (members-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. 
- 조작: 업무 도구에서 “구성원 기본 정보 수정” 또는 Swagger **PATCH /api/v1/members/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"name":"name 입력 예시","email":"member@example.test","bio":"bio 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 검색 및 페이지 목록 (crews-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/crews**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 상세 조회 (crews-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 상세 조회” 또는 Swagger **GET /api/v1/crews/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 등록 (crews-create)

- 계정: Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. 
- 조작: 업무 도구에서 “Crew 등록” 또는 Swagger **POST /api/v1/crews**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"name":"name 입력 예시","description":"description 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 기본 정보 수정 (crews-update)

- 계정: Boss / Underboss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. 
- 조작: 업무 도구에서 “Crew 기본 정보 수정” 또는 Swagger **PATCH /api/v1/crews/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"name":"name 입력 예시","description":"description 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 검색 및 페이지 목록 (tasks-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/tasks**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 상세 조회 (tasks-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 상세 조회” 또는 Swagger **GET /api/v1/tasks/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 등록 (tasks-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 등록” 또는 Swagger **POST /api/v1/tasks**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"title":"title 입력 예시","description":"description 입력 예시","crew_id":1,"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","priority":"LOW","exclusive":true}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 기본 정보 수정 (tasks-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 기본 정보 수정” 또는 Swagger **PATCH /api/v1/tasks/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"title":"title 입력 예시","description":"description 입력 예시","crew_id":1,"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","priority":"LOW","exclusive":true}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 공용 자원 검색 및 페이지 목록 (resources-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “공용 자원 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/resources**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 공용 자원 상세 조회 (resources-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “공용 자원 상세 조회” 또는 Swagger **GET /api/v1/resources/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 공용 자원 등록 (resources-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID; category_id: 관련 목록/생성 응답의 실제 ID; location_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “공용 자원 등록” 또는 Swagger **POST /api/v1/resources**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"name":"name 입력 예시","description":"description 입력 예시","crew_id":1,"asset_tag":"asset_tag 입력 예시","location":"location 입력 예시","category_id":1,"location_id":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 공용 자원 기본 정보 수정 (resources-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID; category_id: 관련 목록/생성 응답의 실제 ID; location_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “공용 자원 기본 정보 수정” 또는 Swagger **PATCH /api/v1/resources/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"name":"name 입력 예시","description":"description 입력 예시","crew_id":1,"asset_tag":"asset_tag 입력 예시","location":"location 입력 예시","category_id":1,"location_id":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 계정 검색 및 페이지 목록 (accounts-list)

- 계정: Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “계정 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/accounts**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 계정 상세 조회 (accounts-detail)

- 계정: Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “계정 상세 조회” 또는 Swagger **GET /api/v1/accounts/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 계정 등록 (accounts-create)

- 계정: Administrator
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “계정 등록” 또는 Swagger **POST /api/v1/accounts**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"username":"admin","member_id":1,"password":"Example-Password-2026!"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 협업 메모 검색 및 페이지 목록 (task-notes-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 협업 메모 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-notes**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 협업 메모 상세 조회 (task-notes-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 협업 메모 상세 조회” 또는 Swagger **GET /api/v1/task-notes/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 협업 메모 등록 (task-notes-create)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 협업 메모 등록” 또는 Swagger **POST /api/v1/task-notes**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","body":"body 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 협업 메모 기본 정보 수정 (task-notes-update)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 협업 메모 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-notes/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","body":"body 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 협업 메모 초안 보관 (task-notes-archive)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “업무 협업 메모 초안 보관” 또는 Swagger **DELETE /api/v1/task-notes/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 체크리스트 항목 검색 및 페이지 목록 (task-checklists-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 체크리스트 항목 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-checklists**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 체크리스트 항목 상세 조회 (task-checklists-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 체크리스트 항목 상세 조회” 또는 Swagger **GET /api/v1/task-checklists/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 체크리스트 항목 등록 (task-checklists-create)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 체크리스트 항목 등록” 또는 Swagger **POST /api/v1/task-checklists**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","position":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 체크리스트 항목 기본 정보 수정 (task-checklists-update)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 체크리스트 항목 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-checklists/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","position":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 체크리스트 항목 초안 보관 (task-checklists-archive)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “업무 체크리스트 항목 초안 보관” 또는 Swagger **DELETE /api/v1/task-checklists/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 중간 목표 검색 및 페이지 목록 (task-milestones-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 중간 목표 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-milestones**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 중간 목표 상세 조회 (task-milestones-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 중간 목표 상세 조회” 또는 Swagger **GET /api/v1/task-milestones/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 중간 목표 등록 (task-milestones-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 중간 목표 등록” 또는 Swagger **POST /api/v1/task-milestones**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","acceptance":"acceptance 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 중간 목표 기본 정보 수정 (task-milestones-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 중간 목표 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-milestones/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","acceptance":"acceptance 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 중간 목표 초안 보관 (task-milestones-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “업무 중간 목표 초안 보관” 또는 Swagger **DELETE /api/v1/task-milestones/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 선행 조건 검색 및 페이지 목록 (task-dependencies-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 선행 조건 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-dependencies**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 선행 조건 상세 조회 (task-dependencies-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 선행 조건 상세 조회” 또는 Swagger **GET /api/v1/task-dependencies/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 선행 조건 등록 (task-dependencies-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. task_id: 관련 목록/생성 응답의 실제 ID; predecessor_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 선행 조건 등록” 또는 Swagger **POST /api/v1/task-dependencies**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"predecessor_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 선행 조건 기본 정보 수정 (task-dependencies-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. task_id: 관련 목록/생성 응답의 실제 ID; predecessor_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 선행 조건 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-dependencies/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"predecessor_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 선행 조건 초안 보관 (task-dependencies-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “업무 선행 조건 초안 보관” 또는 Swagger **DELETE /api/v1/task-dependencies/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 반복 업무 서식 검색 및 페이지 목록 (task-templates-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “반복 업무 서식 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-templates**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 반복 업무 서식 상세 조회 (task-templates-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “반복 업무 서식 상세 조회” 또는 Swagger **GET /api/v1/task-templates/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 반복 업무 서식 등록 (task-templates-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “반복 업무 서식 등록” 또는 Swagger **POST /api/v1/task-templates**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","duration_minutes":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 반복 업무 서식 기본 정보 수정 (task-templates-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “반복 업무 서식 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-templates/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","duration_minutes":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 반복 업무 서식 초안 보관 (task-templates-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “반복 업무 서식 초안 보관” 또는 Swagger **DELETE /api/v1/task-templates/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 산출물 참조 검색 및 페이지 목록 (task-deliverables-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 산출물 참조 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-deliverables**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 산출물 참조 상세 조회 (task-deliverables-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 산출물 참조 상세 조회” 또는 Swagger **GET /api/v1/task-deliverables/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 산출물 참조 등록 (task-deliverables-create)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 산출물 참조 등록” 또는 Swagger **POST /api/v1/task-deliverables**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","reference":"reference 입력 예시","description":"description 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 산출물 참조 기본 정보 수정 (task-deliverables-update)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 산출물 참조 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-deliverables/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","reference":"reference 입력 예시","description":"description 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 산출물 참조 초안 보관 (task-deliverables-archive)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “업무 산출물 참조 초안 보관” 또는 Swagger **DELETE /api/v1/task-deliverables/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 위험 및 대응 검색 및 페이지 목록 (task-risks-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 위험 및 대응 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/task-risks**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 위험 및 대응 상세 조회 (task-risks-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “업무 위험 및 대응 상세 조회” 또는 Swagger **GET /api/v1/task-risks/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 위험 및 대응 등록 (task-risks-create)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 위험 및 대응 등록” 또는 Swagger **POST /api/v1/task-risks**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","likelihood":1,"impact":1,"mitigation":"mitigation 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 위험 및 대응 기본 정보 수정 (task-risks-update)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 위험 및 대응 기본 정보 수정” 또는 Swagger **PATCH /api/v1/task-risks/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"task_id":1,"title":"title 입력 예시","likelihood":1,"impact":1,"mitigation":"mitigation 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 위험 및 대응 초안 보관 (task-risks-archive)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “업무 위험 및 대응 초안 보관” 또는 Swagger **DELETE /api/v1/task-risks/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 점검표 검색 및 페이지 목록 (resource-inspections-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 점검표 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/resource-inspections**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 점검표 상세 조회 (resource-inspections-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 점검표 상세 조회” 또는 Swagger **GET /api/v1/resource-inspections/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 점검표 등록 (resource-inspections-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. resource_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 점검표 등록” 또는 Swagger **POST /api/v1/resource-inspections**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","criteria":"criteria 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 점검표 기본 정보 수정 (resource-inspections-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. resource_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 점검표 기본 정보 수정” 또는 Swagger **PATCH /api/v1/resource-inspections/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","criteria":"criteria 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 점검표 초안 보관 (resource-inspections-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “자원 점검표 초안 보관” 또는 Swagger **DELETE /api/v1/resource-inspections/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 정비 작업 검색 및 페이지 목록 (resource-maintenance-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 정비 작업 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/resource-maintenance**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 정비 작업 상세 조회 (resource-maintenance-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 정비 작업 상세 조회” 또는 Swagger **GET /api/v1/resource-maintenance/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 정비 작업 등록 (resource-maintenance-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. resource_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 정비 작업 등록” 또는 Swagger **POST /api/v1/resource-maintenance**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","instructions":"instructions 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 정비 작업 기본 정보 수정 (resource-maintenance-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. resource_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 정비 작업 기본 정보 수정” 또는 Swagger **PATCH /api/v1/resource-maintenance/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","instructions":"instructions 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 정비 작업 초안 보관 (resource-maintenance-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “자원 정비 작업 초안 보관” 또는 Swagger **DELETE /api/v1/resource-maintenance/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 장애 신고 검색 및 페이지 목록 (resource-incidents-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 장애 신고 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/resource-incidents**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 장애 신고 상세 조회 (resource-incidents-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 장애 신고 상세 조회” 또는 Swagger **GET /api/v1/resource-incidents/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 장애 신고 등록 (resource-incidents-create)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. resource_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 장애 신고 등록” 또는 Swagger **POST /api/v1/resource-incidents**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"title":"title 입력 예시","severity":"LOW","description":"description 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 장애 신고 기본 정보 수정 (resource-incidents-update)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. resource_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 장애 신고 기본 정보 수정” 또는 Swagger **PATCH /api/v1/resource-incidents/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"title":"title 입력 예시","severity":"LOW","description":"description 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 장애 신고 초안 보관 (resource-incidents-archive)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “자원 장애 신고 초안 보관” 또는 Swagger **DELETE /api/v1/resource-incidents/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 분류 기준 검색 및 페이지 목록 (resource-categories-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 분류 기준 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/resource-categories**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 분류 기준 상세 조회 (resource-categories-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 분류 기준 상세 조회” 또는 Swagger **GET /api/v1/resource-categories/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 분류 기준 등록 (resource-categories-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 분류 기준 등록” 또는 Swagger **POST /api/v1/resource-categories**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","handling_rules":"handling_rules 입력 예시","inspection_days":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 분류 기준 기본 정보 수정 (resource-categories-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 분류 기준 기본 정보 수정” 또는 Swagger **PATCH /api/v1/resource-categories/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","handling_rules":"handling_rules 입력 예시","inspection_days":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 분류 기준 초안 보관 (resource-categories-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “자원 분류 기준 초안 보관” 또는 Swagger **DELETE /api/v1/resource-categories/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 보관 장소 검색 및 페이지 목록 (resource-locations-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 보관 장소 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/resource-locations**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 보관 장소 상세 조회 (resource-locations-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 보관 장소 상세 조회” 또는 Swagger **GET /api/v1/resource-locations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 보관 장소 등록 (resource-locations-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 보관 장소 등록” 또는 Swagger **POST /api/v1/resource-locations**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","address":"address 입력 예시","access_instructions":"access_instructions 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 보관 장소 기본 정보 수정 (resource-locations-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 보관 장소 기본 정보 수정” 또는 Swagger **PATCH /api/v1/resource-locations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","address":"address 입력 예시","access_instructions":"access_instructions 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 보관 장소 초안 보관 (resource-locations-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “자원 보관 장소 초안 보관” 또는 Swagger **DELETE /api/v1/resource-locations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 역량 검색 및 페이지 목록 (member-skills-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 역량 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/member-skills**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 역량 상세 조회 (member-skills-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 역량 상세 조회” 또는 Swagger **GET /api/v1/member-skills/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 역량 등록 (member-skills-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 역량 등록” 또는 Swagger **POST /api/v1/member-skills**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","level":1,"evidence":"evidence 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 역량 기본 정보 수정 (member-skills-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 역량 기본 정보 수정” 또는 Swagger **PATCH /api/v1/member-skills/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","level":1,"evidence":"evidence 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 역량 초안 보관 (member-skills-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “구성원 역량 초안 보관” 또는 Swagger **DELETE /api/v1/member-skills/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 자격 검색 및 페이지 목록 (member-certifications-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 자격 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/member-certifications**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 자격 상세 조회 (member-certifications-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 자격 상세 조회” 또는 Swagger **GET /api/v1/member-certifications/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 자격 등록 (member-certifications-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 자격 등록” 또는 Swagger **POST /api/v1/member-certifications**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","issuer":"issuer 입력 예시","expires_at":"2026-11-01T10:00:00+09:00","reference":"reference 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 자격 기본 정보 수정 (member-certifications-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 자격 기본 정보 수정” 또는 Swagger **PATCH /api/v1/member-certifications/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","issuer":"issuer 입력 예시","expires_at":"2026-11-01T10:00:00+09:00","reference":"reference 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 자격 초안 보관 (member-certifications-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “구성원 자격 초안 보관” 또는 Swagger **DELETE /api/v1/member-certifications/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 부재 시간 검색 및 페이지 목록 (member-availability-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 부재 시간 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/member-availability**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 부재 시간 상세 조회 (member-availability-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 부재 시간 상세 조회” 또는 Swagger **GET /api/v1/member-availability/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 부재 시간 등록 (member-availability-create)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 부재 시간 등록” 또는 Swagger **POST /api/v1/member-availability**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 부재 시간 기본 정보 수정 (member-availability-update)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 부재 시간 기본 정보 수정” 또는 Swagger **PATCH /api/v1/member-availability/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 부재 시간 초안 보관 (member-availability-archive)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “구성원 부재 시간 초안 보관” 또는 Swagger **DELETE /api/v1/member-availability/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 활동 휴가 신청 검색 및 페이지 목록 (leave-requests-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “활동 휴가 신청 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/leave-requests**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 활동 휴가 신청 상세 조회 (leave-requests-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “활동 휴가 신청 상세 조회” 또는 Swagger **GET /api/v1/leave-requests/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 활동 휴가 신청 등록 (leave-requests-create)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “활동 휴가 신청 등록” 또는 Swagger **POST /api/v1/leave-requests**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 활동 휴가 신청 기본 정보 수정 (leave-requests-update)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “활동 휴가 신청 기본 정보 수정” 또는 Swagger **PATCH /api/v1/leave-requests/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 활동 휴가 신청 초안 보관 (leave-requests-archive)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “활동 휴가 신청 초안 보관” 또는 Swagger **DELETE /api/v1/leave-requests/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 공지 검색 및 페이지 목록 (crew-announcements-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 운영 공지 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/crew-announcements**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 운영 공지 상세 조회 (crew-announcements-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 운영 공지 상세 조회” 또는 Swagger **GET /api/v1/crew-announcements/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 운영 공지 등록 (crew-announcements-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 운영 공지 등록” 또는 Swagger **POST /api/v1/crew-announcements**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","expires_at":"2026-11-01T10:00:00+09:00"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 공지 기본 정보 수정 (crew-announcements-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 운영 공지 기본 정보 수정” 또는 Swagger **PATCH /api/v1/crew-announcements/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","expires_at":"2026-11-01T10:00:00+09:00"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 공지 초안 보관 (crew-announcements-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “Crew 운영 공지 초안 보관” 또는 Swagger **DELETE /api/v1/crew-announcements/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 회의 검색 및 페이지 목록 (crew-meetings-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 운영 회의 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/crew-meetings**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 운영 회의 상세 조회 (crew-meetings-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 운영 회의 상세 조회” 또는 Swagger **GET /api/v1/crew-meetings/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 운영 회의 등록 (crew-meetings-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 운영 회의 등록” 또는 Swagger **POST /api/v1/crew-meetings**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","location":"location 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 회의 기본 정보 수정 (crew-meetings-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 운영 회의 기본 정보 수정” 또는 Swagger **PATCH /api/v1/crew-meetings/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","location":"location 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 회의 초안 보관 (crew-meetings-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “Crew 운영 회의 초안 보관” 또는 Swagger **DELETE /api/v1/crew-meetings/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 안건 검색 및 페이지 목록 (meeting-agenda-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “회의 안건 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/meeting-agenda**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 회의 안건 상세 조회 (meeting-agenda-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “회의 안건 상세 조회” 또는 Swagger **GET /api/v1/meeting-agenda/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 회의 안건 등록 (meeting-agenda-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. meeting_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “회의 안건 등록” 또는 Swagger **POST /api/v1/meeting-agenda**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"meeting_id":1,"title":"title 입력 예시","proposal":"proposal 입력 예시","position":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 안건 기본 정보 수정 (meeting-agenda-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. meeting_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “회의 안건 기본 정보 수정” 또는 Swagger **PATCH /api/v1/meeting-agenda/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"meeting_id":1,"title":"title 입력 예시","proposal":"proposal 입력 예시","position":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 안건 초안 보관 (meeting-agenda-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “회의 안건 초안 보관” 또는 Swagger **DELETE /api/v1/meeting-agenda/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 결정 기록 검색 및 페이지 목록 (meeting-minutes-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “회의 결정 기록 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/meeting-minutes**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 회의 결정 기록 상세 조회 (meeting-minutes-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “회의 결정 기록 상세 조회” 또는 Swagger **GET /api/v1/meeting-minutes/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 회의 결정 기록 등록 (meeting-minutes-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. meeting_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “회의 결정 기록 등록” 또는 Swagger **POST /api/v1/meeting-minutes**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"meeting_id":1,"title":"title 입력 예시","decision":"decision 입력 예시","follow_up":"follow_up 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 결정 기록 기본 정보 수정 (meeting-minutes-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. meeting_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “회의 결정 기록 기본 정보 수정” 또는 Swagger **PATCH /api/v1/meeting-minutes/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"meeting_id":1,"title":"title 입력 예시","decision":"decision 입력 예시","follow_up":"follow_up 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 결정 기록 초안 보관 (meeting-minutes-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “회의 결정 기록 초안 보관” 또는 Swagger **DELETE /api/v1/meeting-minutes/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 지침 검색 및 페이지 목록 (operating-guidelines-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 운영 지침 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/operating-guidelines**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 운영 지침 상세 조회 (operating-guidelines-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew 운영 지침 상세 조회” 또는 Swagger **GET /api/v1/operating-guidelines/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew 운영 지침 등록 (operating-guidelines-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 운영 지침 등록” 또는 Swagger **POST /api/v1/operating-guidelines**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","effective_at":"2026-11-01T10:00:00+09:00"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 지침 기본 정보 수정 (operating-guidelines-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 운영 지침 기본 정보 수정” 또는 Swagger **PATCH /api/v1/operating-guidelines/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","effective_at":"2026-11-01T10:00:00+09:00"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 운영 지침 초안 보관 (operating-guidelines-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “Crew 운영 지침 초안 보관” 또는 Swagger **DELETE /api/v1/operating-guidelines/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 적응 계획 검색 및 페이지 목록 (onboarding-plans-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 적응 계획 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/onboarding-plans**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 적응 계획 상세 조회 (onboarding-plans-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원 적응 계획 상세 조회” 또는 Swagger **GET /api/v1/onboarding-plans/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 구성원 적응 계획 등록 (onboarding-plans-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 적응 계획 등록” 또는 Swagger **POST /api/v1/onboarding-plans**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","objectives":"objectives 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 적응 계획 기본 정보 수정 (onboarding-plans-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “구성원 적응 계획 기본 정보 수정” 또는 Swagger **PATCH /api/v1/onboarding-plans/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","objectives":"objectives 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 적응 계획 초안 보관 (onboarding-plans-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “구성원 적응 계획 초안 보관” 또는 Swagger **DELETE /api/v1/onboarding-plans/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 적응 계획 실습 항목 검색 및 페이지 목록 (onboarding-steps-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “적응 계획 실습 항목 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/onboarding-steps**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 적응 계획 실습 항목 상세 조회 (onboarding-steps-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “적응 계획 실습 항목 상세 조회” 또는 Swagger **GET /api/v1/onboarding-steps/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 적응 계획 실습 항목 등록 (onboarding-steps-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. plan_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “적응 계획 실습 항목 등록” 또는 Swagger **POST /api/v1/onboarding-steps**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"plan_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","position":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 적응 계획 실습 항목 기본 정보 수정 (onboarding-steps-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. plan_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “적응 계획 실습 항목 기본 정보 수정” 또는 Swagger **PATCH /api/v1/onboarding-steps/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"plan_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","position":1}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 적응 계획 실습 항목 초안 보관 (onboarding-steps-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “적응 계획 실습 항목 초안 보관” 또는 Swagger **DELETE /api/v1/onboarding-steps/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 조직 운영 교육 검색 및 페이지 목록 (training-sessions-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “조직 운영 교육 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/training-sessions**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 조직 운영 교육 상세 조회 (training-sessions-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “조직 운영 교육 상세 조회” 또는 Swagger **GET /api/v1/training-sessions/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 조직 운영 교육 등록 (training-sessions-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “조직 운영 교육 등록” 또는 Swagger **POST /api/v1/training-sessions**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","capacity":1,"syllabus":"syllabus 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 조직 운영 교육 기본 정보 수정 (training-sessions-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “조직 운영 교육 기본 정보 수정” 또는 Swagger **PATCH /api/v1/training-sessions/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","capacity":1,"syllabus":"syllabus 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 조직 운영 교육 초안 보관 (training-sessions-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “조직 운영 교육 초안 보관” 또는 Swagger **DELETE /api/v1/training-sessions/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 참가 신청 검색 및 페이지 목록 (training-enrollments-list)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “교육 참가 신청 검색 및 페이지 목록” 또는 Swagger **GET /api/v1/training-enrollments**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 검색·총건수·페이지 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 교육 참가 신청 상세 조회 (training-enrollments-detail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “교육 참가 신청 상세 조회” 또는 Swagger **GET /api/v1/training-enrollments/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 단일 대상 존재/권한 확인과 전체 필드. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 교육 참가 신청 등록 (training-enrollments-create)

- 계정: Capo / Underboss / Boss
- 사전조건: 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보. training_id: 관련 목록/생성 응답의 실제 ID; member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “교육 참가 신청 등록” 또는 Swagger **POST /api/v1/training-enrollments**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"training_id":1,"member_id":1,"title":"title 입력 예시","goal":"goal 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 새 도메인 개체 생성과 관계 검증. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 참가 신청 기본 정보 수정 (training-enrollments-update)

- 계정: Capo / Underboss / Boss
- 사전조건: 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지. training_id: 관련 목록/생성 응답의 실제 ID; member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “교육 참가 신청 기본 정보 수정” 또는 Swagger **PATCH /api/v1/training-enrollments/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"training_id":1,"member_id":1,"title":"title 입력 예시","goal":"goal 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 수정할 필드만 전송 가능.
- 예상 상태: 200. success=true; 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 참가 신청 초안 보관 (training-enrollments-archive)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상. 
- 조작: 업무 도구에서 “교육 참가 신청 초안 보관” 또는 Swagger **DELETE /api/v1/training-enrollments/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 초안만 비활성화하며 관계/이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 세션 CSRF 토큰 발급 (csrf)

- 계정: 비로그인 세션 가능
- 사전조건: 쿠키를 보존하는 브라우저/클라이언트 준비. 
- 조작: 업무 도구에서 “세션 CSRF 토큰 발급” 또는 Swagger **GET /api/v1/auth/csrf**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 세션 CSRF 토큰 발급. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 계정 로그인 (login)

- 계정: 비로그인 세션 가능
- 사전조건: ACTIVE 계정과 활동 가능한 구성원, 실제 비밀번호, 사전 CSRF 발급. 
- 조작: 업무 도구에서 “계정 로그인” 또는 Swagger **POST /api/v1/auth/login**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"username":"admin","password":"Example-Password-2026!"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 계정 로그인. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 현재 세션 로그아웃 (logout)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 유효한 현재 세션. 
- 조작: 업무 도구에서 “현재 세션 로그아웃” 또는 Swagger **POST /api/v1/auth/logout**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 현재 세션 로그아웃. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 현재 인증 및 접근 범위 확인 (identity)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 유효한 세션; 현재 역할/정식 소속/관리 범위 준비. 
- 조작: 업무 도구에서 “현재 인증 및 접근 범위 확인” 또는 Swagger **GET /api/v1/auth/identity**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 현재 인증 및 접근 범위 확인. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 본인 비밀번호 변경 및 세션 종료 (changePassword)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 현재 비밀번호를 확인하고 새 12~128자 비밀번호 준비. 
- 조작: 업무 도구에서 “본인 비밀번호 변경 및 세션 종료” 또는 Swagger **POST /api/v1/auth/password**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"current_password":"Example-Password-2026!","new_password":"Example-Password-2026!"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 본인 비밀번호 변경 및 세션 종료. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 본인 접속 세션 목록 (sessions)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 현재 계정에 로그인 세션이 있어야 함. 
- 조작: 업무 도구에서 “본인 접속 세션 목록” 또는 Swagger **GET /api/v1/auth/sessions**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 본인 접속 세션 목록. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 본인 전체 세션 종료 (revokeSessions)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 현재 세션; 성공 후 재로그인 준비. 
- 조작: 업무 도구에서 “본인 전체 세션 종료” 또는 Swagger **DELETE /api/v1/auth/sessions**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 본인 전체 세션 종료. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 계정 차단 (accountBlock)

- 계정: Administrator
- 사전조건: ACTIVE 대상 계정; 마지막 활성 Administrator는 대상에서 제외. 
- 조작: 업무 도구에서 “계정 차단” 또는 Swagger **POST /api/v1/accounts/:id/block**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 계정 차단. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 계정 차단 해제 (accountUnblock)

- 계정: Administrator
- 사전조건: BLOCKED 대상 계정. 
- 조작: 업무 도구에서 “계정 차단 해제” 또는 Swagger **POST /api/v1/accounts/:id/unblock**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 계정 차단 해제. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 관리자 비밀번호 재설정 (accountPassword)

- 계정: Administrator
- 사전조건: 대상 계정과 새 12~128자 비밀번호 준비. 
- 조작: 업무 도구에서 “관리자 비밀번호 재설정” 또는 Swagger **POST /api/v1/accounts/:id/reset-password**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"new_password":"Example-Password-2026!","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 관리자 비밀번호 재설정. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 대상 계정 세션 강제 종료 (accountSessions)

- 계정: Administrator
- 사전조건: 대상 계정 로그인 세션 준비. 
- 조작: 업무 도구에서 “대상 계정 세션 강제 종료” 또는 Swagger **DELETE /api/v1/accounts/:id/sessions**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 대상 계정 세션 강제 종료. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 역할 변경 (memberRole)

- 계정: Boss / Administrator
- 사전조건: 자기가 아닌 하위 역할의 구성원; 부여 역할도 행위자보다 낮아야 함; Crew 책임자라면 먼저 교체. 
- 조작: 업무 도구에서 “구성원 역할 변경” 또는 Swagger **POST /api/v1/members/:id/role**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"role":"Associate","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 구성원 역할 변경. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원 활동 상태 전이 (memberStatus)

- 계정: Capo / Underboss / Boss
- 사전조건: PENDING→ACTIVE/WITHDRAWN, ACTIVE→SUSPENDED/WITHDRAWN, SUSPENDED→ACTIVE/WITHDRAWN; 정지/탈퇴 전 활성 업무·예약·책임자 관계 정리. 
- 조작: 업무 도구에서 “구성원 활동 상태 전이” 또는 Swagger **POST /api/v1/members/:id/status**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"status":"ACTIVE","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 구성원 활동 상태 전이. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 미소속 구성원 Crew 편입 (membershipAdd)

- 계정: Capo / Underboss / Boss
- 사전조건: 미소속이며 탈퇴하지 않은 일반 구성원과 관리 가능한 Crew. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “미소속 구성원 Crew 편입” 또는 Swagger **POST /api/v1/crews/:id/memberships**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 미소속 구성원 Crew 편입. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 정식 소속 전속 이동 (membershipTransfer)

- 계정: Capo / Underboss / Boss
- 사전조건: 현재 소속과 도착 Crew 모두 관리 가능; 활성 업무·예약·책임자 관계 없음. crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “정식 소속 전속 이동” 또는 Swagger **POST /api/v1/members/:id/transfer**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"crew_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 정식 소속 전속 이동. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 정식 소속 해제 (membershipRemove)

- 계정: Capo / Underboss / Boss
- 사전조건: 현재 소속 관리 가능; 활성 업무·예약·책임자 관계 없음. 
- 조작: 업무 도구에서 “정식 소속 해제” 또는 Swagger **POST /api/v1/members/:id/detach**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 정식 소속 해제. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Crew 책임자 지정 (crewLeader)

- 계정: Boss / Underboss
- 사전조건: 대상 Crew에 정식 소속된 ACTIVE Capo. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Crew 책임자 지정” 또는 Swagger **POST /api/v1/crews/:id/leader**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; Crew 책임자 지정. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 빈 Crew 운영 종료 (crewArchive)

- 계정: Boss
- 사전조건: 구성원·업무·자원이 없는 빈 Crew. 
- 조작: 업무 도구에서 “빈 Crew 운영 종료” 또는 Swagger **POST /api/v1/crews/:id/archive**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 빈 Crew 운영 종료. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 여러 Crew 관리 범위 조회 (managementList)

- 계정: Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “여러 Crew 관리 범위 조회” 또는 Swagger **GET /api/v1/management-scopes**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 여러 Crew 관리 범위 조회. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Underboss 관리 범위 부여 (managementGrant)

- 계정: Boss
- 사전조건: Underboss와 존재하는 Crew; 같은 관리 관계 없음. member_id: 관련 목록/생성 응답의 실제 ID; crew_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “Underboss 관리 범위 부여” 또는 Swagger **POST /api/v1/management-scopes**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"crew_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; Underboss 관리 범위 부여. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### Underboss 관리 범위 회수 (managementRevoke)

- 계정: Boss
- 사전조건: 해당 Underboss/Crew 관리 관계가 존재. 
- 조작: 업무 도구에서 “Underboss 관리 범위 회수” 또는 Swagger **DELETE /api/v1/management-scopes/:id/crews/:crewId**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; Underboss 관리 범위 회수. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 시작 (taskStart)

- 계정: Capo / Underboss / Boss
- 사전조건: PLANNED 업무, 참여자 최소 한 명, 선행 업무 모두 완료. 
- 조작: 업무 도구에서 “업무 시작” 또는 Swagger **POST /api/v1/tasks/:id/start**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 시작. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 일시 중지 (taskPause)

- 계정: Capo / Underboss / Boss
- 사전조건: IN_PROGRESS 업무. 
- 조작: 업무 도구에서 “업무 일시 중지” 또는 Swagger **POST /api/v1/tasks/:id/pause**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 일시 중지. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 재개 (taskResume)

- 계정: Capo / Underboss / Boss
- 사전조건: PAUSED 업무, 참여자 최소 한 명, 선행 업무 완료. 
- 조작: 업무 도구에서 “업무 재개” 또는 Swagger **POST /api/v1/tasks/:id/resume**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 재개. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 완료 (taskComplete)

- 계정: Capo / Underboss / Boss
- 사전조건: IN_PROGRESS 업무, 사용 중 자원 모두 반환, 완료 결과 작성. 
- 조작: 업무 도구에서 “업무 완료” 또는 Swagger **POST /api/v1/tasks/:id/complete**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"result":"result 입력 예시","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 완료. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 취소 (taskCancel)

- 계정: Capo / Underboss / Boss
- 사전조건: PLANNED/IN_PROGRESS/PAUSED 업무, 사용 중 자원 반환. 
- 조작: 업무 도구에서 “업무 취소” 또는 Swagger **POST /api/v1/tasks/:id/cancel**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 취소. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 완료 결과 정정 (taskCorrect)

- 계정: Capo / Underboss / Boss
- 사전조건: COMPLETED 업무, 정정 결과와 정정 사유. 
- 조작: 업무 도구에서 “완료 결과 정정” 또는 Swagger **POST /api/v1/tasks/:id/correct-result**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"result":"result 입력 예시","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 완료 결과 정정. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 참여 및 기여 기록 (participantList)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 접근 가능한 업무. 
- 조작: 업무 도구에서 “업무 참여 및 기여 기록” 또는 Swagger **GET /api/v1/tasks/:id/participants**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 참여 및 기여 기록. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 업무 참여자 배정 (participantAdd)

- 계정: Capo / Underboss / Boss
- 사전조건: 종료 전 업무, 같은 Crew의 정지/탈퇴하지 않은 구성원, 업무·부재 시간 충돌 없음. member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “업무 참여자 배정” 또는 Swagger **POST /api/v1/tasks/:id/participants**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 참여자 배정. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 업무 참여자 배정 해제 (participantRemove)

- 계정: Capo / Underboss / Boss
- 사전조건: 종료 전 업무와 기존 참여자, 해당 업무의 예약/사용 자원 없음. 
- 조작: 업무 도구에서 “업무 참여자 배정 해제” 또는 Swagger **DELETE /api/v1/tasks/:id/participants/:memberId**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 업무 참여자 배정 해제. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 본인 참여 기여 기록 제출 (participantContribution)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: 종료 전 업무에 본인이 배정되어 있어야 함. 
- 조작: 업무 도구에서 “본인 참여 기여 기록 제출” 또는 Swagger **PATCH /api/v1/tasks/:id/contribution**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"contribution":"contribution 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 본인 참여 기여 기록 제출. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 배정 및 예약 탐색 (reservationList)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 배정 및 예약 탐색” 또는 Swagger **GET /api/v1/reservations**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 자원 배정 및 예약 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 예약 상세와 반환 상태 (reservationDetail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “예약 상세와 반환 상태” 또는 Swagger **GET /api/v1/reservations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 예약 상세와 반환 상태. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 사용 예약 (reservationCreate)

- 계정: Capo / Underboss / Boss
- 사전조건: 같은 Crew의 활동 중 구성원과 AVAILABLE 자원, 중복 없는 기간, 업무 연결 시 실제 참여자와 업무 시간 범위 일치. resource_id: 관련 목록/생성 응답의 실제 ID; task_id: 관련 목록/생성 응답의 실제 ID; member_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “자원 사용 예약” 또는 Swagger **POST /api/v1/reservations**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"resource_id":1,"task_id":1,"member_id":1,"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 자원 사용 예약. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 예약 시간 변경 (reservationReschedule)

- 계정: Capo / Underboss / Boss
- 사전조건: RESERVED 예약; 변경 기간에 예약·정비 충돌 없음. 
- 조작: 업무 도구에서 “예약 시간 변경” 또는 Swagger **PATCH /api/v1/reservations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 예약 시간 변경. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 예약 자원 인수 (reservationCheckout)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: RESERVED 예약의 현재 시간 범위 안, 본인 또는 관리자, 다른 미반환 사용 없음. 
- 조작: 업무 도구에서 “예약 자원 인수” 또는 Swagger **POST /api/v1/reservations/:id/checkout**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 예약 자원 인수. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 사용 자원 반환 (reservationReturn)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: IN_USE 예약, 본인 또는 관리자, GOOD/DAMAGED 반환 상태. 
- 조작: 업무 도구에서 “사용 자원 반환” 또는 Swagger **POST /api/v1/reservations/:id/return**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"condition":"GOOD","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 사용 자원 반환. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 미사용 예약 취소 (reservationCancel)

- 계정: Capo / Underboss / Boss
- 사전조건: RESERVED 예약. 
- 조작: 업무 도구에서 “미사용 예약 취소” 또는 Swagger **POST /api/v1/reservations/:id/cancel**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 미사용 예약 취소. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 자원 가용 상태 변경 (resourceStatus)

- 계정: Capo / Underboss / Boss
- 사전조건: 활성 예약/사용/정비 없음, RETIRED가 아닌 자원. 
- 조작: 업무 도구에서 “자원 가용 상태 변경” 또는 Swagger **POST /api/v1/resources/:id/status**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"status":"AVAILABLE","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 자원 가용 상태 변경. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 활동 결과 평가 탐색 (evaluationList)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “활동 결과 평가 탐색” 또는 Swagger **GET /api/v1/evaluations**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 활동 결과 평가 탐색. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 평가 원본 및 수정 이력 (evaluationDetail)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “평가 원본 및 수정 이력” 또는 Swagger **GET /api/v1/evaluations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 평가 원본 및 수정 이력. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 완료 활동 평가 작성 (evaluationCreate)

- 계정: Capo / Underboss / Boss
- 사전조건: 관리 가능한 구성원의 COMPLETED 업무와 COMPLETED 참여 기록, 자기 평가 아님. member_id: 관련 목록/생성 응답의 실제 ID; task_id: 관련 목록/생성 응답의 실제 ID
- 조작: 업무 도구에서 “완료 활동 평가 작성” 또는 Swagger **POST /api/v1/evaluations**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"member_id":1,"task_id":1,"score":1,"body":"body 입력 예시","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 201. success=true; 완료 활동 평가 작성. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 평가 정정 및 이전 값 보존 (evaluationRevise)

- 계정: Capo / Underboss / Boss
- 사전조건: 해당 평가의 최신 version과 대상 구성원/완료 업무 관리 권한. 
- 조작: 업무 도구에서 “평가 정정 및 이전 값 보존” 또는 Swagger **PATCH /api/v1/evaluations/:id**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"version":1,"score":1,"body":"body 입력 예시","reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 평가 정정 및 이전 값 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 평가 공개 확정 (evaluationPublish)

- 계정: Capo / Underboss / Boss
- 사전조건: DRAFT 또는 RETRACTED 평가와 최신 version. 
- 조작: 업무 도구에서 “평가 공개 확정” 또는 Swagger **POST /api/v1/evaluations/:id/publish**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"version":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 평가 공개 확정. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 공개 평가 철회 및 이력 보존 (evaluationRetract)

- 계정: Capo / Underboss / Boss
- 사전조건: PUBLISHED 평가와 최신 version. 
- 조작: 업무 도구에서 “공개 평가 철회 및 이력 보존” 또는 Swagger **POST /api/v1/evaluations/:id/retract**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"version":1,"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 공개 평가 철회 및 이력 보존. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### members 변경 이력 (membersHistory)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “members 변경 이력” 또는 Swagger **GET /api/v1/members/:id/history**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; members 변경 이력. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### tasks 변경 이력 (tasksHistory)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “tasks 변경 이력” 또는 Swagger **GET /api/v1/tasks/:id/history**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; tasks 변경 이력. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### resources 변경 이력 (resourcesHistory)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “resources 변경 이력” 또는 Swagger **GET /api/v1/resources/:id/history**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; resources 변경 이력. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 접근 범위 내 활동 타임라인 (activityFeed)

- 계정: Associate / Soldier / Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “접근 범위 내 활동 타임라인” 또는 Swagger **GET /api/v1/activity**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 접근 범위 내 활동 타임라인. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 관리자 감사 기록 (auditLog)

- 계정: Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “관리자 감사 기록” 또는 Swagger **GET /api/v1/audit**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 관리자 감사 기록. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 미전달 기록 및 재시도 상태 (pendingEvents)

- 계정: Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “미전달 기록 및 재시도 상태” 또는 Swagger **GET /api/v1/outbox/pending**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 미전달 기록 및 재시도 상태. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 범위 제한 조회. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 기록 전달 재시도 예약 (retryEvent)

- 계정: Administrator
- 사전조건: 전달되지 않은 outbox ID; 전달 완료 이벤트 제외. 
- 조작: 업무 도구에서 “기록 전달 재시도 예약” 또는 Swagger **POST /api/v1/outbox/:id/retry**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 기록 전달 재시도 예약. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 구성원별 활성 업무 부하 (report-workload)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “구성원별 활성 업무 부하” 또는 Swagger **GET /api/v1/reports/workload**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 구성원별 활성 업무 부하. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew별 업무 상태 분포 (report-task-status)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew별 업무 상태 분포” 또는 Swagger **GET /api/v1/reports/task-status**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; Crew별 업무 상태 분포. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### Crew별 구성원 상태 분포 (report-member-status)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “Crew별 구성원 상태 분포” 또는 Swagger **GET /api/v1/reports/member-status**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; Crew별 구성원 상태 분포. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원별 예약 시간 합계 (report-resource-utilization)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원별 예약 시간 합계” 또는 Swagger **GET /api/v1/reports/resource-utilization**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 자원별 예약 시간 합계. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 기한 초과 미완료 업무 (report-overdue-tasks)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “기한 초과 미완료 업무” 또는 Swagger **GET /api/v1/reports/overdue-tasks**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 기한 초과 미완료 업무. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 기간별 업무 완료율 (report-completion-rate)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “기간별 업무 완료율” 또는 Swagger **GET /api/v1/reports/completion-rate**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 기간별 업무 완료율. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 활동 평가 점수 분포 (report-evaluation-summary)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “활동 평가 점수 분포” 또는 Swagger **GET /api/v1/reports/evaluation-summary**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 활동 평가 점수 분포. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 자원 점검 예정 현황 (report-maintenance-due)

- 계정: Capo / Underboss / Boss / Administrator
- 사전조건: 해당 역할과 조회 범위의 실제 데이터 준비. 
- 조작: 업무 도구에서 “자원 점검 예정 현황” 또는 Swagger **GET /api/v1/reports/maintenance-due**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; 자원 점검 예정 현황. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL/MongoDB 범위 제한 집계. 상태 변경 없음. 반환값·총건수를 같은 권한의 화면과 비교.
- 관측 결과: **미실행**

### 확인 완료 (task-checklists-check)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: task-checklists가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “확인 완료” 또는 Swagger **POST /api/v1/task-checklists/:id/check**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → CHECKED; 확인 완료 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 확인 취소 (task-checklists-uncheck)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: task-checklists가 CHECKED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “확인 취소” 또는 Swagger **POST /api/v1/task-checklists/:id/uncheck**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; CHECKED → DRAFT; 확인 취소 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 중간 목표 달성 (task-milestones-achieve)

- 계정: Capo / Underboss / Boss
- 사전조건: task-milestones가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “중간 목표 달성” 또는 Swagger **POST /api/v1/task-milestones/:id/achieve**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → ACHIEVED; 중간 목표 달성 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 산출물 검토 요청 (task-deliverables-submit)

- 계정: Soldier / Capo / Underboss / Boss
- 사전조건: task-deliverables가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “산출물 검토 요청” 또는 Swagger **POST /api/v1/task-deliverables/:id/submit**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → SUBMITTED; 산출물 검토 요청 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 산출물 승인 (task-deliverables-accept)

- 계정: Capo / Underboss / Boss
- 사전조건: task-deliverables가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “산출물 승인” 또는 Swagger **POST /api/v1/task-deliverables/:id/accept**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; SUBMITTED → ACCEPTED; 산출물 승인 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 산출물 반려 (task-deliverables-reject)

- 계정: Capo / Underboss / Boss
- 사전조건: task-deliverables가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “산출물 반려” 또는 Swagger **POST /api/v1/task-deliverables/:id/reject**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; SUBMITTED → DRAFT; 산출물 반려 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 위험 해소 (task-risks-resolve)

- 계정: Capo / Underboss / Boss
- 사전조건: task-risks가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “위험 해소” 또는 Swagger **POST /api/v1/task-risks/:id/resolve**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → RESOLVED; 위험 해소 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 점검 통과 (resource-inspections-pass)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-inspections가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “점검 통과” 또는 Swagger **POST /api/v1/resource-inspections/:id/pass**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → PASSED; 점검 통과 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 점검 불합격 (resource-inspections-fail)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-inspections가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “점검 불합격” 또는 Swagger **POST /api/v1/resource-inspections/:id/fail**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → FAILED; 점검 불합격 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 정비 일정 확정 (resource-maintenance-schedule)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-maintenance가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “정비 일정 확정” 또는 Swagger **POST /api/v1/resource-maintenance/:id/schedule**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → SCHEDULED; 정비 일정 확정 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 정비 시작 (resource-maintenance-begin)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-maintenance가 SCHEDULED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “정비 시작” 또는 Swagger **POST /api/v1/resource-maintenance/:id/begin**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; SCHEDULED → IN_PROGRESS; 정비 시작 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 정비 완료 (resource-maintenance-finish)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-maintenance가 IN_PROGRESS 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “정비 완료” 또는 Swagger **POST /api/v1/resource-maintenance/:id/finish**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; IN_PROGRESS → COMPLETED; 정비 완료 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 장애 접수 (resource-incidents-acknowledge)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-incidents가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “장애 접수” 또는 Swagger **POST /api/v1/resource-incidents/:id/acknowledge**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → ACKNOWLEDGED; 장애 접수 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 장애 해결 (resource-incidents-resolve)

- 계정: Capo / Underboss / Boss
- 사전조건: resource-incidents가 ACKNOWLEDGED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “장애 해결” 또는 Swagger **POST /api/v1/resource-incidents/:id/resolve**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; ACKNOWLEDGED → RESOLVED; 장애 해결 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 휴가 결재 요청 (leave-requests-submit)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: leave-requests가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “휴가 결재 요청” 또는 Swagger **POST /api/v1/leave-requests/:id/submit**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → SUBMITTED; 휴가 결재 요청 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 휴가 승인 (leave-requests-approve)

- 계정: Capo / Underboss / Boss
- 사전조건: leave-requests가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “휴가 승인” 또는 Swagger **POST /api/v1/leave-requests/:id/approve**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; SUBMITTED → APPROVED; 휴가 승인 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 휴가 반려 (leave-requests-reject)

- 계정: Capo / Underboss / Boss
- 사전조건: leave-requests가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “휴가 반려” 또는 Swagger **POST /api/v1/leave-requests/:id/reject**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; SUBMITTED → REJECTED; 휴가 반려 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 휴가 신청 철회 (leave-requests-withdraw)

- 계정: Associate / Soldier / Capo / Underboss / Boss
- 사전조건: leave-requests가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “휴가 신청 철회” 또는 Swagger **POST /api/v1/leave-requests/:id/withdraw**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; SUBMITTED → DRAFT; 휴가 신청 철회 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 공지 게시 (crew-announcements-publish)

- 계정: Capo / Underboss / Boss
- 사전조건: crew-announcements가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “공지 게시” 또는 Swagger **POST /api/v1/crew-announcements/:id/publish**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → PUBLISHED; 공지 게시 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 시작 (crew-meetings-open)

- 계정: Capo / Underboss / Boss
- 사전조건: crew-meetings가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “회의 시작” 또는 Swagger **POST /api/v1/crew-meetings/:id/open**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → IN_PROGRESS; 회의 시작 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의 종료 (crew-meetings-close)

- 계정: Capo / Underboss / Boss
- 사전조건: crew-meetings가 IN_PROGRESS 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “회의 종료” 또는 Swagger **POST /api/v1/crew-meetings/:id/close**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; IN_PROGRESS → COMPLETED; 회의 종료 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 회의록 확정 (meeting-minutes-ratify)

- 계정: Capo / Underboss / Boss
- 사전조건: meeting-minutes가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “회의록 확정” 또는 Swagger **POST /api/v1/meeting-minutes/:id/ratify**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → RATIFIED; 회의록 확정 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 운영 지침 시행 (operating-guidelines-activate)

- 계정: Capo / Underboss / Boss
- 사전조건: operating-guidelines가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “운영 지침 시행” 또는 Swagger **POST /api/v1/operating-guidelines/:id/activate**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → ACTIVE; 운영 지침 시행 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 적응 계획 완료 (onboarding-plans-complete)

- 계정: Capo / Underboss / Boss
- 사전조건: onboarding-plans가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “적응 계획 완료” 또는 Swagger **POST /api/v1/onboarding-plans/:id/complete**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → COMPLETED; 적응 계획 완료 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 적응 실습 완료 (onboarding-steps-complete)

- 계정: Capo / Underboss / Boss
- 사전조건: onboarding-steps가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “적응 실습 완료” 또는 Swagger **POST /api/v1/onboarding-steps/:id/complete**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → COMPLETED; 적응 실습 완료 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 시작 (training-sessions-open)

- 계정: Capo / Underboss / Boss
- 사전조건: training-sessions가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “교육 시작” 또는 Swagger **POST /api/v1/training-sessions/:id/open**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → IN_PROGRESS; 교육 시작 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 종료 (training-sessions-close)

- 계정: Capo / Underboss / Boss
- 사전조건: training-sessions가 IN_PROGRESS 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “교육 종료” 또는 Swagger **POST /api/v1/training-sessions/:id/close**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; IN_PROGRESS → COMPLETED; 교육 종료 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 출석 확인 (training-enrollments-attend)

- 계정: Capo / Underboss / Boss
- 사전조건: training-enrollments가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “교육 출석 확인” 또는 Swagger **POST /api/v1/training-enrollments/:id/attend**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; DRAFT → ATTENDED; 교육 출석 확인 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**

### 교육 이수 확인 (training-enrollments-complete)

- 계정: Capo / Underboss / Boss
- 사전조건: training-enrollments가 ATTENDED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요. 
- 조작: 업무 도구에서 “교육 이수 확인” 또는 Swagger **POST /api/v1/training-enrollments/:id/complete**. 경로 ID는 앞선 목록/생성 결과로 교체.
- 구체적 본문 예시: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`. 시간은 현재의 유효한 기간으로, 모든 참조 ID는 실제 값으로 교체. 
- 예상 상태: 200. success=true; ATTENDED → COMPLETED; 교육 이수 확인 도메인 조건 검사. 인증 없음 401, 범위 없음 403, 없는 ID 404, 상태 충돌 409, 입력 위반 422.
- 저장/확인: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함). 처리 후 대상 상세를 다시 조회하고 활동/감사 또는 평가 revisions에서 확인. SQL 이력은 전달 지연 후 조회.
- 관측 결과: **미실행**


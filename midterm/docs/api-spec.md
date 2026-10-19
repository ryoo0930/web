# 전체 API 명세

등록과 문서의 공통 원천: src/routes/catalog.js. 실행 검증은 모두 미실행. 응답은 success/data/meta 또는 success/error(code,message,details). 생성 201, 그 외 성공 200. 오류 400/401/403/404/409/422/503. 204를 사용하지 않는다. 샘플 ID=1은 실제 반환 ID로 바꿔야 한다. 기간 필터는 업무 목록에서는 시작/종료, 그 외 목록에서는 생성 시각이다.

## members-list · 구성원 검색 및 페이지 목록

- 경로: **GET /api/v1/members**
- 목적/기능군: 구성원 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / members
- 요구사항: FR-01, FR-02, FR-03, FR-04, FR-21, AR-03
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: member
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"name":"name 예시","email":"email 예시","bio":"bio 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/members. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## members-detail · 구성원 상세 조회

- 경로: **GET /api/v1/members/:id**
- 목적/기능군: 구성원 상세 조회; 역할 및 대상 범위 검사 후 처리 / members
- 요구사항: FR-01, FR-02, FR-03, FR-04
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: member
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","email":"email 예시","bio":"bio 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/members/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## members-create · 구성원 등록

- 경로: **POST /api/v1/members**
- 목적/기능군: 구성원 등록; 역할 및 대상 범위 검사 후 처리 / members
- 요구사항: FR-01, FR-02, FR-03, FR-04
- 허용 역할: Boss, Administrator
- 대상 범위: member
- 입력 스키마: `{"name":{"type":"string","required":true,"max":100},"email":{"type":"string","required":false,"max":254},"bio":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"name":"name 입력 예시","email":"member@example.test","bio":"bio 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","email":"email 예시","bio":"bio 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Boss/Administrator 계정으로 로그인 후 POST /api/v1/members. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## members-update · 구성원 기본 정보 수정

- 경로: **PATCH /api/v1/members/:id**
- 목적/기능군: 구성원 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / members
- 요구사항: FR-01, FR-02, FR-03, FR-04
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: member
- 입력 스키마: `{"name":{"type":"string","required":true,"max":100},"email":{"type":"string","required":false,"max":254},"bio":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"name":"name 입력 예시","email":"member@example.test","bio":"bio 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","email":"email 예시","bio":"bio 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/members/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## crews-list · Crew 검색 및 페이지 목록

- 경로: **GET /api/v1/crews**
- 목적/기능군: Crew 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-05, FR-06, FR-21, AR-03
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crew
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"name":"name 예시","description":"description 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/crews. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## crews-detail · Crew 상세 조회

- 경로: **GET /api/v1/crews/:id**
- 목적/기능군: Crew 상세 조회; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-05, FR-06
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crew
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/crews/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## crews-create · Crew 등록

- 경로: **POST /api/v1/crews**
- 목적/기능군: Crew 등록; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-05, FR-06
- 허용 역할: Boss
- 대상 범위: crew
- 입력 스키마: `{"name":{"type":"string","required":true,"max":100},"description":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"name":"name 입력 예시","description":"description 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Boss 계정으로 로그인 후 POST /api/v1/crews. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## crews-update · Crew 기본 정보 수정

- 경로: **PATCH /api/v1/crews/:id**
- 목적/기능군: Crew 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-05, FR-06
- 허용 역할: Boss, Underboss
- 대상 범위: crew
- 입력 스키마: `{"name":{"type":"string","required":true,"max":100},"description":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"name":"name 입력 예시","description":"description 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Boss/Underboss 계정으로 로그인 후 PATCH /api/v1/crews/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## tasks-list · 업무 검색 및 페이지 목록

- 경로: **GET /api/v1/tasks**
- 목적/기능군: 업무 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-07, FR-09, FR-12, FR-21, AR-03
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: task
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"title":"title 예시","description":"description 예시","crew_id":1,"starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","priority":"LOW","exclusive":true}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/tasks. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## tasks-detail · 업무 상세 조회

- 경로: **GET /api/v1/tasks/:id**
- 목적/기능군: 업무 상세 조회; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-07, FR-09, FR-12
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: task
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"title":"title 예시","description":"description 예시","crew_id":1,"starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","priority":"LOW","exclusive":true}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/tasks/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## tasks-create · 업무 등록

- 경로: **POST /api/v1/tasks**
- 목적/기능군: 업무 등록; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-07, FR-09, FR-12
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: task
- 입력 스키마: `{"title":{"type":"string","required":true,"max":200},"description":{"type":"string","required":false,"max":2000},"crew_id":{"type":"id","required":true},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"priority":{"type":"string","enum":["LOW","NORMAL","HIGH","URGENT"],"required":false},"exclusive":{"type":"boolean"}}`
- 예시 본문: `{"title":"title 입력 예시","description":"description 입력 예시","crew_id":1,"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","priority":"LOW","exclusive":true}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"title":"title 예시","description":"description 예시","crew_id":1,"starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","priority":"LOW","exclusive":true}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## tasks-update · 업무 기본 정보 수정

- 경로: **PATCH /api/v1/tasks/:id**
- 목적/기능군: 업무 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-07, FR-09, FR-12
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: task
- 입력 스키마: `{"title":{"type":"string","required":true,"max":200},"description":{"type":"string","required":false,"max":2000},"crew_id":{"type":"id","required":true},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"priority":{"type":"string","enum":["LOW","NORMAL","HIGH","URGENT"],"required":false},"exclusive":{"type":"boolean"}}`
- 예시 본문: `{"title":"title 입력 예시","description":"description 입력 예시","crew_id":1,"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","priority":"LOW","exclusive":true}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"title":"title 예시","description":"description 예시","crew_id":1,"starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","priority":"LOW","exclusive":true}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/tasks/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## resources-list · 공용 자원 검색 및 페이지 목록

- 경로: **GET /api/v1/resources**
- 목적/기능군: 공용 자원 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-13, FR-14, FR-16, FR-21, AR-03
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: resource
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"name":"name 예시","description":"description 예시","crew_id":1,"asset_tag":"asset_tag 예시","location":"location 예시","category_id":1,"location_id":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resources. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## resources-detail · 공용 자원 상세 조회

- 경로: **GET /api/v1/resources/:id**
- 목적/기능군: 공용 자원 상세 조회; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-13, FR-14, FR-16
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: resource
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","description":"description 예시","crew_id":1,"asset_tag":"asset_tag 예시","location":"location 예시","category_id":1,"location_id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resources/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## resources-create · 공용 자원 등록

- 경로: **POST /api/v1/resources**
- 목적/기능군: 공용 자원 등록; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-13, FR-14, FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: resource
- 입력 스키마: `{"name":{"type":"string","required":true,"max":150},"description":{"type":"string","required":false,"max":2000},"crew_id":{"type":"id","required":true},"asset_tag":{"type":"string","required":true,"max":80},"location":{"type":"string","required":false,"max":200},"category_id":{"type":"id","required":false},"location_id":{"type":"id","required":false}}`
- 예시 본문: `{"name":"name 입력 예시","description":"description 입력 예시","crew_id":1,"asset_tag":"asset_tag 입력 예시","location":"location 입력 예시","category_id":1,"location_id":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","description":"description 예시","crew_id":1,"asset_tag":"asset_tag 예시","location":"location 예시","category_id":1,"location_id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resources. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## resources-update · 공용 자원 기본 정보 수정

- 경로: **PATCH /api/v1/resources/:id**
- 목적/기능군: 공용 자원 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-13, FR-14, FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: resource
- 입력 스키마: `{"name":{"type":"string","required":true,"max":150},"description":{"type":"string","required":false,"max":2000},"crew_id":{"type":"id","required":true},"asset_tag":{"type":"string","required":true,"max":80},"location":{"type":"string","required":false,"max":200},"category_id":{"type":"id","required":false},"location_id":{"type":"id","required":false}}`
- 예시 본문: `{"name":"name 입력 예시","description":"description 입력 예시","crew_id":1,"asset_tag":"asset_tag 입력 예시","location":"location 입력 예시","category_id":1,"location_id":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"name":"name 예시","description":"description 예시","crew_id":1,"asset_tag":"asset_tag 예시","location":"location 예시","category_id":1,"location_id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/resources/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## accounts-list · 계정 검색 및 페이지 목록

- 경로: **GET /api/v1/accounts**
- 목적/기능군: 계정 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23, FR-21, AR-03
- 허용 역할: Administrator
- 대상 범위: admin
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"username":"username 예시","member_id":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Administrator 계정으로 로그인 후 GET /api/v1/accounts. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## accounts-detail · 계정 상세 조회

- 경로: **GET /api/v1/accounts/:id**
- 목적/기능군: 계정 상세 조회; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23
- 허용 역할: Administrator
- 대상 범위: admin
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"username":"username 예시","member_id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Administrator 계정으로 로그인 후 GET /api/v1/accounts/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## accounts-create · 계정 등록

- 경로: **POST /api/v1/accounts**
- 목적/기능군: 계정 등록; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23
- 허용 역할: Administrator
- 대상 범위: admin
- 입력 스키마: `{"username":{"type":"string","required":true,"max":80},"member_id":{"type":"id","required":true},"password":{"type":"string","required":true,"max":128}}`
- 예시 본문: `{"username":"admin","member_id":1,"password":"Example-Password-2026!"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"username":"username 예시","member_id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Administrator 계정으로 로그인 후 POST /api/v1/accounts. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-notes-list · 업무 협업 메모 검색 및 페이지 목록

- 경로: **GET /api/v1/task-notes**
- 목적/기능군: 업무 협업 메모 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-notes
- 요구사항: FR-10, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"task_id":1,"title":"title 예시","body":"body 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-notes. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-notes-detail · 업무 협업 메모 상세 조회

- 경로: **GET /api/v1/task-notes/:id**
- 목적/기능군: 업무 협업 메모 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-notes
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","body":"body 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-notes/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-notes-create · 업무 협업 메모 등록

- 경로: **POST /api/v1/task-notes**
- 목적/기능군: 업무 협업 메모 등록; 역할 및 대상 범위 검사 후 처리 / task-notes
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"body":{"type":"string","required":true,"max":8000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","body":"body 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","body":"body 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-notes. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-notes-update · 업무 협업 메모 기본 정보 수정

- 경로: **PATCH /api/v1/task-notes/:id**
- 목적/기능군: 업무 협업 메모 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-notes
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"body":{"type":"string","required":true,"max":8000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","body":"body 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","body":"body 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-notes/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-notes-archive · 업무 협업 메모 초안 보관

- 경로: **DELETE /api/v1/task-notes/:id**
- 목적/기능군: 업무 협업 메모 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-notes
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","body":"body 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-notes/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## task-checklists-list · 업무 체크리스트 항목 검색 및 페이지 목록

- 경로: **GET /api/v1/task-checklists**
- 목적/기능군: 업무 체크리스트 항목 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"task_id":1,"title":"title 예시","position":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-checklists. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-checklists-detail · 업무 체크리스트 항목 상세 조회

- 경로: **GET /api/v1/task-checklists/:id**
- 목적/기능군: 업무 체크리스트 항목 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-checklists/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-checklists-create · 업무 체크리스트 항목 등록

- 경로: **POST /api/v1/task-checklists**
- 목적/기능군: 업무 체크리스트 항목 등록; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"position":{"type":"number","min":0,"max":999,"required":false}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","position":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-checklists. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-checklists-update · 업무 체크리스트 항목 기본 정보 수정

- 경로: **PATCH /api/v1/task-checklists/:id**
- 목적/기능군: 업무 체크리스트 항목 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"position":{"type":"number","min":0,"max":999,"required":false}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","position":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-checklists/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-checklists-archive · 업무 체크리스트 항목 초안 보관

- 경로: **DELETE /api/v1/task-checklists/:id**
- 목적/기능군: 업무 체크리스트 항목 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-checklists/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## task-milestones-list · 업무 중간 목표 검색 및 페이지 목록

- 경로: **GET /api/v1/task-milestones**
- 목적/기능군: 업무 중간 목표 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-milestones
- 요구사항: FR-07, FR-10, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"task_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","acceptance":"acceptance 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-milestones. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-milestones-detail · 업무 중간 목표 상세 조회

- 경로: **GET /api/v1/task-milestones/:id**
- 목적/기능군: 업무 중간 목표 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-milestones
- 요구사항: FR-07, FR-10 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","acceptance":"acceptance 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-milestones/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-milestones-create · 업무 중간 목표 등록

- 경로: **POST /api/v1/task-milestones**
- 목적/기능군: 업무 중간 목표 등록; 역할 및 대상 범위 검사 후 처리 / task-milestones
- 요구사항: FR-07, FR-10 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"due_at":{"type":"date","required":true},"acceptance":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","acceptance":"acceptance 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","acceptance":"acceptance 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-milestones. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-milestones-update · 업무 중간 목표 기본 정보 수정

- 경로: **PATCH /api/v1/task-milestones/:id**
- 목적/기능군: 업무 중간 목표 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-milestones
- 요구사항: FR-07, FR-10 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"due_at":{"type":"date","required":true},"acceptance":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","acceptance":"acceptance 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","acceptance":"acceptance 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-milestones/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-milestones-archive · 업무 중간 목표 초안 보관

- 경로: **DELETE /api/v1/task-milestones/:id**
- 목적/기능군: 업무 중간 목표 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-milestones
- 요구사항: FR-07, FR-10 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","acceptance":"acceptance 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-milestones/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## task-dependencies-list · 업무 선행 조건 검색 및 페이지 목록

- 경로: **GET /api/v1/task-dependencies**
- 목적/기능군: 업무 선행 조건 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-dependencies
- 요구사항: FR-07, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"task_id":1,"predecessor_id":1,"reason":"reason 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-dependencies. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-dependencies-detail · 업무 선행 조건 상세 조회

- 경로: **GET /api/v1/task-dependencies/:id**
- 목적/기능군: 업무 선행 조건 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-dependencies
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"predecessor_id":1,"reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-dependencies/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-dependencies-create · 업무 선행 조건 등록

- 경로: **POST /api/v1/task-dependencies**
- 목적/기능군: 업무 선행 조건 등록; 역할 및 대상 범위 검사 후 처리 / task-dependencies
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"predecessor_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"task_id":1,"predecessor_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"predecessor_id":1,"reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-dependencies. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-dependencies-update · 업무 선행 조건 기본 정보 수정

- 경로: **PATCH /api/v1/task-dependencies/:id**
- 목적/기능군: 업무 선행 조건 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-dependencies
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"predecessor_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"task_id":1,"predecessor_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"predecessor_id":1,"reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-dependencies/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-dependencies-archive · 업무 선행 조건 초안 보관

- 경로: **DELETE /api/v1/task-dependencies/:id**
- 목적/기능군: 업무 선행 조건 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-dependencies
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"predecessor_id":1,"reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-dependencies/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## task-templates-list · 반복 업무 서식 검색 및 페이지 목록

- 경로: **GET /api/v1/task-templates**
- 목적/기능군: 반복 업무 서식 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-templates
- 요구사항: FR-07, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","instructions":"instructions 예시","duration_minutes":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-templates. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-templates-detail · 반복 업무 서식 상세 조회

- 경로: **GET /api/v1/task-templates/:id**
- 목적/기능군: 반복 업무 서식 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-templates
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","instructions":"instructions 예시","duration_minutes":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-templates/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-templates-create · 반복 업무 서식 등록

- 경로: **POST /api/v1/task-templates**
- 목적/기능군: 반복 업무 서식 등록; 역할 및 대상 범위 검사 후 처리 / task-templates
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"instructions":{"type":"string","required":true,"max":8000},"duration_minutes":{"type":"number","min":1,"max":43200,"required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","duration_minutes":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","instructions":"instructions 예시","duration_minutes":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-templates. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-templates-update · 반복 업무 서식 기본 정보 수정

- 경로: **PATCH /api/v1/task-templates/:id**
- 목적/기능군: 반복 업무 서식 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-templates
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"instructions":{"type":"string","required":true,"max":8000},"duration_minutes":{"type":"number","min":1,"max":43200,"required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","duration_minutes":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","instructions":"instructions 예시","duration_minutes":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-templates/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-templates-archive · 반복 업무 서식 초안 보관

- 경로: **DELETE /api/v1/task-templates/:id**
- 목적/기능군: 반복 업무 서식 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-templates
- 요구사항: FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","instructions":"instructions 예시","duration_minutes":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-templates/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## task-deliverables-list · 업무 산출물 참조 검색 및 페이지 목록

- 경로: **GET /api/v1/task-deliverables**
- 목적/기능군: 업무 산출물 참조 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"task_id":1,"title":"title 예시","reference":"reference 예시","description":"description 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-deliverables. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-deliverables-detail · 업무 산출물 참조 상세 조회

- 경로: **GET /api/v1/task-deliverables/:id**
- 목적/기능군: 업무 산출물 참조 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","reference":"reference 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-deliverables/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-deliverables-create · 업무 산출물 참조 등록

- 경로: **POST /api/v1/task-deliverables**
- 목적/기능군: 업무 산출물 참조 등록; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"reference":{"type":"string","required":true,"max":1000},"description":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","reference":"reference 입력 예시","description":"description 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","reference":"reference 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-deliverables. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-deliverables-update · 업무 산출물 참조 기본 정보 수정

- 경로: **PATCH /api/v1/task-deliverables/:id**
- 목적/기능군: 업무 산출물 참조 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"reference":{"type":"string","required":true,"max":1000},"description":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","reference":"reference 입력 예시","description":"description 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","reference":"reference 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-deliverables/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-deliverables-archive · 업무 산출물 참조 초안 보관

- 경로: **DELETE /api/v1/task-deliverables/:id**
- 목적/기능군: 업무 산출물 참조 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","reference":"reference 예시","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-deliverables/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## task-risks-list · 업무 위험 및 대응 검색 및 페이지 목록

- 경로: **GET /api/v1/task-risks**
- 목적/기능군: 업무 위험 및 대응 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / task-risks
- 요구사항: FR-10, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"task_id":1,"title":"title 예시","likelihood":1,"impact":1,"mitigation":"mitigation 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-risks. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## task-risks-detail · 업무 위험 및 대응 상세 조회

- 경로: **GET /api/v1/task-risks/:id**
- 목적/기능군: 업무 위험 및 대응 상세 조회; 역할 및 대상 범위 검사 후 처리 / task-risks
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","likelihood":1,"impact":1,"mitigation":"mitigation 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/task-risks/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## task-risks-create · 업무 위험 및 대응 등록

- 경로: **POST /api/v1/task-risks**
- 목적/기능군: 업무 위험 및 대응 등록; 역할 및 대상 범위 검사 후 처리 / task-risks
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"likelihood":{"type":"number","min":1,"max":5,"required":true},"impact":{"type":"number","min":1,"max":5,"required":true},"mitigation":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","likelihood":1,"impact":1,"mitigation":"mitigation 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","likelihood":1,"impact":1,"mitigation":"mitigation 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-risks. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## task-risks-update · 업무 위험 및 대응 기본 정보 수정

- 경로: **PATCH /api/v1/task-risks/:id**
- 목적/기능군: 업무 위험 및 대응 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / task-risks
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"task_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"likelihood":{"type":"number","min":1,"max":5,"required":true},"impact":{"type":"number","min":1,"max":5,"required":true},"mitigation":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"task_id":1,"title":"title 입력 예시","likelihood":1,"impact":1,"mitigation":"mitigation 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","likelihood":1,"impact":1,"mitigation":"mitigation 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/task-risks/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## task-risks-archive · 업무 위험 및 대응 초안 보관

- 경로: **DELETE /api/v1/task-risks/:id**
- 목적/기능군: 업무 위험 및 대응 초안 보관; 역할 및 대상 범위 검사 후 처리 / task-risks
- 요구사항: FR-10 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"task_id":1,"title":"title 예시","likelihood":1,"impact":1,"mitigation":"mitigation 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/task-risks/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## resource-inspections-list · 자원 점검표 검색 및 페이지 목록

- 경로: **GET /api/v1/resource-inspections**
- 목적/기능군: 자원 점검표 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"resource_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","criteria":"criteria 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-inspections. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## resource-inspections-detail · 자원 점검표 상세 조회

- 경로: **GET /api/v1/resource-inspections/:id**
- 목적/기능군: 자원 점검표 상세 조회; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","criteria":"criteria 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-inspections/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## resource-inspections-create · 자원 점검표 등록

- 경로: **POST /api/v1/resource-inspections**
- 목적/기능군: 자원 점검표 등록; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"due_at":{"type":"date","required":true},"criteria":{"type":"string","required":true,"max":8000}}`
- 예시 본문: `{"resource_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","criteria":"criteria 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","criteria":"criteria 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-inspections. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## resource-inspections-update · 자원 점검표 기본 정보 수정

- 경로: **PATCH /api/v1/resource-inspections/:id**
- 목적/기능군: 자원 점검표 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"due_at":{"type":"date","required":true},"criteria":{"type":"string","required":true,"max":8000}}`
- 예시 본문: `{"resource_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","criteria":"criteria 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","criteria":"criteria 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/resource-inspections/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## resource-inspections-archive · 자원 점검표 초안 보관

- 경로: **DELETE /api/v1/resource-inspections/:id**
- 목적/기능군: 자원 점검표 초안 보관; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","criteria":"criteria 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/resource-inspections/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## resource-maintenance-list · 자원 정비 작업 검색 및 페이지 목록

- 경로: **GET /api/v1/resource-maintenance**
- 목적/기능군: 자원 정비 작업 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"resource_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","instructions":"instructions 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-maintenance. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## resource-maintenance-detail · 자원 정비 작업 상세 조회

- 경로: **GET /api/v1/resource-maintenance/:id**
- 목적/기능군: 자원 정비 작업 상세 조회; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","instructions":"instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-maintenance/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## resource-maintenance-create · 자원 정비 작업 등록

- 경로: **POST /api/v1/resource-maintenance**
- 목적/기능군: 자원 정비 작업 등록; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"instructions":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"resource_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","instructions":"instructions 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","instructions":"instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-maintenance. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## resource-maintenance-update · 자원 정비 작업 기본 정보 수정

- 경로: **PATCH /api/v1/resource-maintenance/:id**
- 목적/기능군: 자원 정비 작업 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"instructions":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"resource_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","instructions":"instructions 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","instructions":"instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/resource-maintenance/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## resource-maintenance-archive · 자원 정비 작업 초안 보관

- 경로: **DELETE /api/v1/resource-maintenance/:id**
- 목적/기능군: 자원 정비 작업 초안 보관; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","instructions":"instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/resource-maintenance/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## resource-incidents-list · 자원 장애 신고 검색 및 페이지 목록

- 경로: **GET /api/v1/resource-incidents**
- 목적/기능군: 자원 장애 신고 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"resource_id":1,"title":"title 예시","severity":"LOW","description":"description 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-incidents. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## resource-incidents-detail · 자원 장애 신고 상세 조회

- 경로: **GET /api/v1/resource-incidents/:id**
- 목적/기능군: 자원 장애 신고 상세 조회; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","severity":"LOW","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-incidents/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## resource-incidents-create · 자원 장애 신고 등록

- 경로: **POST /api/v1/resource-incidents**
- 목적/기능군: 자원 장애 신고 등록; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"severity":{"type":"string","enum":["LOW","MEDIUM","HIGH"],"required":true},"description":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"resource_id":1,"title":"title 입력 예시","severity":"LOW","description":"description 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","severity":"LOW","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-incidents. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## resource-incidents-update · 자원 장애 신고 기본 정보 수정

- 경로: **PATCH /api/v1/resource-incidents/:id**
- 목적/기능군: 자원 장애 신고 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"severity":{"type":"string","enum":["LOW","MEDIUM","HIGH"],"required":true},"description":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"resource_id":1,"title":"title 입력 예시","severity":"LOW","description":"description 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","severity":"LOW","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/resource-incidents/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## resource-incidents-archive · 자원 장애 신고 초안 보관

- 경로: **DELETE /api/v1/resource-incidents/:id**
- 목적/기능군: 자원 장애 신고 초안 보관; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16 (설계 확장)
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"resource_id":1,"title":"title 예시","severity":"LOW","description":"description 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/resource-incidents/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## resource-categories-list · 자원 분류 기준 검색 및 페이지 목록

- 경로: **GET /api/v1/resource-categories**
- 목적/기능군: 자원 분류 기준 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / resource-categories
- 요구사항: FR-13, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","handling_rules":"handling_rules 예시","inspection_days":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-categories. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## resource-categories-detail · 자원 분류 기준 상세 조회

- 경로: **GET /api/v1/resource-categories/:id**
- 목적/기능군: 자원 분류 기준 상세 조회; 역할 및 대상 범위 검사 후 처리 / resource-categories
- 요구사항: FR-13 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","handling_rules":"handling_rules 예시","inspection_days":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-categories/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## resource-categories-create · 자원 분류 기준 등록

- 경로: **POST /api/v1/resource-categories**
- 목적/기능군: 자원 분류 기준 등록; 역할 및 대상 범위 검사 후 처리 / resource-categories
- 요구사항: FR-13 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":120},"handling_rules":{"type":"string","required":true,"max":2000},"inspection_days":{"type":"number","min":1,"max":3650,"required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","handling_rules":"handling_rules 입력 예시","inspection_days":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","handling_rules":"handling_rules 예시","inspection_days":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-categories. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## resource-categories-update · 자원 분류 기준 기본 정보 수정

- 경로: **PATCH /api/v1/resource-categories/:id**
- 목적/기능군: 자원 분류 기준 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / resource-categories
- 요구사항: FR-13 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":120},"handling_rules":{"type":"string","required":true,"max":2000},"inspection_days":{"type":"number","min":1,"max":3650,"required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","handling_rules":"handling_rules 입력 예시","inspection_days":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","handling_rules":"handling_rules 예시","inspection_days":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/resource-categories/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## resource-categories-archive · 자원 분류 기준 초안 보관

- 경로: **DELETE /api/v1/resource-categories/:id**
- 목적/기능군: 자원 분류 기준 초안 보관; 역할 및 대상 범위 검사 후 처리 / resource-categories
- 요구사항: FR-13 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","handling_rules":"handling_rules 예시","inspection_days":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/resource-categories/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## resource-locations-list · 자원 보관 장소 검색 및 페이지 목록

- 경로: **GET /api/v1/resource-locations**
- 목적/기능군: 자원 보관 장소 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / resource-locations
- 요구사항: FR-13, FR-14, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","address":"address 예시","access_instructions":"access_instructions 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-locations. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## resource-locations-detail · 자원 보관 장소 상세 조회

- 경로: **GET /api/v1/resource-locations/:id**
- 목적/기능군: 자원 보관 장소 상세 조회; 역할 및 대상 범위 검사 후 처리 / resource-locations
- 요구사항: FR-13, FR-14 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","address":"address 예시","access_instructions":"access_instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resource-locations/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## resource-locations-create · 자원 보관 장소 등록

- 경로: **POST /api/v1/resource-locations**
- 목적/기능군: 자원 보관 장소 등록; 역할 및 대상 범위 검사 후 처리 / resource-locations
- 요구사항: FR-13, FR-14 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":120},"address":{"type":"string","required":true,"max":300},"access_instructions":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","address":"address 입력 예시","access_instructions":"access_instructions 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","address":"address 예시","access_instructions":"access_instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-locations. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## resource-locations-update · 자원 보관 장소 기본 정보 수정

- 경로: **PATCH /api/v1/resource-locations/:id**
- 목적/기능군: 자원 보관 장소 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / resource-locations
- 요구사항: FR-13, FR-14 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":120},"address":{"type":"string","required":true,"max":300},"access_instructions":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","address":"address 입력 예시","access_instructions":"access_instructions 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","address":"address 예시","access_instructions":"access_instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/resource-locations/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## resource-locations-archive · 자원 보관 장소 초안 보관

- 경로: **DELETE /api/v1/resource-locations/:id**
- 목적/기능군: 자원 보관 장소 초안 보관; 역할 및 대상 범위 검사 후 처리 / resource-locations
- 요구사항: FR-13, FR-14 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","address":"address 예시","access_instructions":"access_instructions 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/resource-locations/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## member-skills-list · 구성원 역량 검색 및 페이지 목록

- 경로: **GET /api/v1/member-skills**
- 목적/기능군: 구성원 역량 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / member-skills
- 요구사항: FR-01, FR-18, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"member_id":1,"title":"title 예시","level":1,"evidence":"evidence 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/member-skills. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## member-skills-detail · 구성원 역량 상세 조회

- 경로: **GET /api/v1/member-skills/:id**
- 목적/기능군: 구성원 역량 상세 조회; 역할 및 대상 범위 검사 후 처리 / member-skills
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","level":1,"evidence":"evidence 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/member-skills/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## member-skills-create · 구성원 역량 등록

- 경로: **POST /api/v1/member-skills**
- 목적/기능군: 구성원 역량 등록; 역할 및 대상 범위 검사 후 처리 / member-skills
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"level":{"type":"number","min":1,"max":5,"required":true},"evidence":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","level":1,"evidence":"evidence 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","level":1,"evidence":"evidence 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/member-skills. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## member-skills-update · 구성원 역량 기본 정보 수정

- 경로: **PATCH /api/v1/member-skills/:id**
- 목적/기능군: 구성원 역량 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / member-skills
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"level":{"type":"number","min":1,"max":5,"required":true},"evidence":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","level":1,"evidence":"evidence 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","level":1,"evidence":"evidence 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/member-skills/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## member-skills-archive · 구성원 역량 초안 보관

- 경로: **DELETE /api/v1/member-skills/:id**
- 목적/기능군: 구성원 역량 초안 보관; 역할 및 대상 범위 검사 후 처리 / member-skills
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","level":1,"evidence":"evidence 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/member-skills/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## member-certifications-list · 구성원 자격 검색 및 페이지 목록

- 경로: **GET /api/v1/member-certifications**
- 목적/기능군: 구성원 자격 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / member-certifications
- 요구사항: FR-01, FR-18, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"member_id":1,"title":"title 예시","issuer":"issuer 예시","expires_at":"2026-11-01 01:00:00.000","reference":"reference 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/member-certifications. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## member-certifications-detail · 구성원 자격 상세 조회

- 경로: **GET /api/v1/member-certifications/:id**
- 목적/기능군: 구성원 자격 상세 조회; 역할 및 대상 범위 검사 후 처리 / member-certifications
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","issuer":"issuer 예시","expires_at":"2026-11-01 01:00:00.000","reference":"reference 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/member-certifications/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## member-certifications-create · 구성원 자격 등록

- 경로: **POST /api/v1/member-certifications**
- 목적/기능군: 구성원 자격 등록; 역할 및 대상 범위 검사 후 처리 / member-certifications
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"issuer":{"type":"string","required":true,"max":150},"expires_at":{"type":"date","required":true},"reference":{"type":"string","required":true,"max":300}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","issuer":"issuer 입력 예시","expires_at":"2026-11-01T10:00:00+09:00","reference":"reference 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","issuer":"issuer 예시","expires_at":"2026-11-01 01:00:00.000","reference":"reference 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/member-certifications. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## member-certifications-update · 구성원 자격 기본 정보 수정

- 경로: **PATCH /api/v1/member-certifications/:id**
- 목적/기능군: 구성원 자격 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / member-certifications
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"issuer":{"type":"string","required":true,"max":150},"expires_at":{"type":"date","required":true},"reference":{"type":"string","required":true,"max":300}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","issuer":"issuer 입력 예시","expires_at":"2026-11-01T10:00:00+09:00","reference":"reference 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","issuer":"issuer 예시","expires_at":"2026-11-01 01:00:00.000","reference":"reference 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/member-certifications/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## member-certifications-archive · 구성원 자격 초안 보관

- 경로: **DELETE /api/v1/member-certifications/:id**
- 목적/기능군: 구성원 자격 초안 보관; 역할 및 대상 범위 검사 후 처리 / member-certifications
- 요구사항: FR-01, FR-18 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","issuer":"issuer 예시","expires_at":"2026-11-01 01:00:00.000","reference":"reference 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/member-certifications/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## member-availability-list · 구성원 부재 시간 검색 및 페이지 목록

- 경로: **GET /api/v1/member-availability**
- 목적/기능군: 구성원 부재 시간 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / member-availability
- 요구사항: FR-08, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/member-availability. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## member-availability-detail · 구성원 부재 시간 상세 조회

- 경로: **GET /api/v1/member-availability/:id**
- 목적/기능군: 구성원 부재 시간 상세 조회; 역할 및 대상 범위 검사 후 처리 / member-availability
- 요구사항: FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/member-availability/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## member-availability-create · 구성원 부재 시간 등록

- 경로: **POST /api/v1/member-availability**
- 목적/기능군: 구성원 부재 시간 등록; 역할 및 대상 범위 검사 후 처리 / member-availability
- 요구사항: FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/member-availability. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## member-availability-update · 구성원 부재 시간 기본 정보 수정

- 경로: **PATCH /api/v1/member-availability/:id**
- 목적/기능군: 구성원 부재 시간 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / member-availability
- 요구사항: FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/member-availability/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## member-availability-archive · 구성원 부재 시간 초안 보관

- 경로: **DELETE /api/v1/member-availability/:id**
- 목적/기능군: 구성원 부재 시간 초안 보관; 역할 및 대상 범위 검사 후 처리 / member-availability
- 요구사항: FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/member-availability/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## leave-requests-list · 활동 휴가 신청 검색 및 페이지 목록

- 경로: **GET /api/v1/leave-requests**
- 목적/기능군: 활동 휴가 신청 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/leave-requests. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## leave-requests-detail · 활동 휴가 신청 상세 조회

- 경로: **GET /api/v1/leave-requests/:id**
- 목적/기능군: 활동 휴가 신청 상세 조회; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/leave-requests/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## leave-requests-create · 활동 휴가 신청 등록

- 경로: **POST /api/v1/leave-requests**
- 목적/기능군: 활동 휴가 신청 등록; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/leave-requests. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## leave-requests-update · 활동 휴가 신청 기본 정보 수정

- 경로: **PATCH /api/v1/leave-requests/:id**
- 목적/기능군: 활동 휴가 신청 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/leave-requests/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## leave-requests-archive · 활동 휴가 신청 초안 보관

- 경로: **DELETE /api/v1/leave-requests/:id**
- 목적/기능군: 활동 휴가 신청 초안 보관; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","reason":"reason 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/leave-requests/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## crew-announcements-list · Crew 운영 공지 검색 및 페이지 목록

- 경로: **GET /api/v1/crew-announcements**
- 목적/기능군: Crew 운영 공지 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / crew-announcements
- 요구사항: FR-05, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","expires_at":"2026-11-01 01:00:00.000"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/crew-announcements. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## crew-announcements-detail · Crew 운영 공지 상세 조회

- 경로: **GET /api/v1/crew-announcements/:id**
- 목적/기능군: Crew 운영 공지 상세 조회; 역할 및 대상 범위 검사 후 처리 / crew-announcements
- 요구사항: FR-05 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","expires_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/crew-announcements/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## crew-announcements-create · Crew 운영 공지 등록

- 경로: **POST /api/v1/crew-announcements**
- 목적/기능군: Crew 운영 공지 등록; 역할 및 대상 범위 검사 후 처리 / crew-announcements
- 요구사항: FR-05 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"body":{"type":"string","required":true,"max":8000},"expires_at":{"type":"date","required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","expires_at":"2026-11-01T10:00:00+09:00"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","expires_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/crew-announcements. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## crew-announcements-update · Crew 운영 공지 기본 정보 수정

- 경로: **PATCH /api/v1/crew-announcements/:id**
- 목적/기능군: Crew 운영 공지 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / crew-announcements
- 요구사항: FR-05 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"body":{"type":"string","required":true,"max":8000},"expires_at":{"type":"date","required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","expires_at":"2026-11-01T10:00:00+09:00"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","expires_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/crew-announcements/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## crew-announcements-archive · Crew 운영 공지 초안 보관

- 경로: **DELETE /api/v1/crew-announcements/:id**
- 목적/기능군: Crew 운영 공지 초안 보관; 역할 및 대상 범위 검사 후 처리 / crew-announcements
- 요구사항: FR-05 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","expires_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/crew-announcements/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## crew-meetings-list · Crew 운영 회의 검색 및 페이지 목록

- 경로: **GET /api/v1/crew-meetings**
- 목적/기능군: Crew 운영 회의 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","location":"location 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/crew-meetings. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## crew-meetings-detail · Crew 운영 회의 상세 조회

- 경로: **GET /api/v1/crew-meetings/:id**
- 목적/기능군: Crew 운영 회의 상세 조회; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","location":"location 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/crew-meetings/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## crew-meetings-create · Crew 운영 회의 등록

- 경로: **POST /api/v1/crew-meetings**
- 목적/기능군: Crew 운영 회의 등록; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"location":{"type":"string","required":true,"max":200}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","location":"location 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","location":"location 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/crew-meetings. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## crew-meetings-update · Crew 운영 회의 기본 정보 수정

- 경로: **PATCH /api/v1/crew-meetings/:id**
- 목적/기능군: Crew 운영 회의 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"location":{"type":"string","required":true,"max":200}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","location":"location 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","location":"location 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/crew-meetings/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## crew-meetings-archive · Crew 운영 회의 초안 보관

- 경로: **DELETE /api/v1/crew-meetings/:id**
- 목적/기능군: Crew 운영 회의 초안 보관; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","location":"location 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/crew-meetings/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## meeting-agenda-list · 회의 안건 검색 및 페이지 목록

- 경로: **GET /api/v1/meeting-agenda**
- 목적/기능군: 회의 안건 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / meeting-agenda
- 요구사항: FR-05, FR-07, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"meeting_id":1,"title":"title 예시","proposal":"proposal 예시","position":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/meeting-agenda. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## meeting-agenda-detail · 회의 안건 상세 조회

- 경로: **GET /api/v1/meeting-agenda/:id**
- 목적/기능군: 회의 안건 상세 조회; 역할 및 대상 범위 검사 후 처리 / meeting-agenda
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","proposal":"proposal 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/meeting-agenda/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## meeting-agenda-create · 회의 안건 등록

- 경로: **POST /api/v1/meeting-agenda**
- 목적/기능군: 회의 안건 등록; 역할 및 대상 범위 검사 후 처리 / meeting-agenda
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"meeting_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"proposal":{"type":"string","required":true,"max":8000},"position":{"type":"number","min":0,"max":999,"required":false}}`
- 예시 본문: `{"meeting_id":1,"title":"title 입력 예시","proposal":"proposal 입력 예시","position":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","proposal":"proposal 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/meeting-agenda. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## meeting-agenda-update · 회의 안건 기본 정보 수정

- 경로: **PATCH /api/v1/meeting-agenda/:id**
- 목적/기능군: 회의 안건 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / meeting-agenda
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"meeting_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"proposal":{"type":"string","required":true,"max":8000},"position":{"type":"number","min":0,"max":999,"required":false}}`
- 예시 본문: `{"meeting_id":1,"title":"title 입력 예시","proposal":"proposal 입력 예시","position":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","proposal":"proposal 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/meeting-agenda/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## meeting-agenda-archive · 회의 안건 초안 보관

- 경로: **DELETE /api/v1/meeting-agenda/:id**
- 목적/기능군: 회의 안건 초안 보관; 역할 및 대상 범위 검사 후 처리 / meeting-agenda
- 요구사항: FR-05, FR-07 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","proposal":"proposal 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/meeting-agenda/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## meeting-minutes-list · 회의 결정 기록 검색 및 페이지 목록

- 경로: **GET /api/v1/meeting-minutes**
- 목적/기능군: 회의 결정 기록 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / meeting-minutes
- 요구사항: FR-20, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"meeting_id":1,"title":"title 예시","decision":"decision 예시","follow_up":"follow_up 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/meeting-minutes. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## meeting-minutes-detail · 회의 결정 기록 상세 조회

- 경로: **GET /api/v1/meeting-minutes/:id**
- 목적/기능군: 회의 결정 기록 상세 조회; 역할 및 대상 범위 검사 후 처리 / meeting-minutes
- 요구사항: FR-20 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","decision":"decision 예시","follow_up":"follow_up 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/meeting-minutes/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## meeting-minutes-create · 회의 결정 기록 등록

- 경로: **POST /api/v1/meeting-minutes**
- 목적/기능군: 회의 결정 기록 등록; 역할 및 대상 범위 검사 후 처리 / meeting-minutes
- 요구사항: FR-20 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"meeting_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"decision":{"type":"string","required":true,"max":8000},"follow_up":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"meeting_id":1,"title":"title 입력 예시","decision":"decision 입력 예시","follow_up":"follow_up 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","decision":"decision 예시","follow_up":"follow_up 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/meeting-minutes. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## meeting-minutes-update · 회의 결정 기록 기본 정보 수정

- 경로: **PATCH /api/v1/meeting-minutes/:id**
- 목적/기능군: 회의 결정 기록 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / meeting-minutes
- 요구사항: FR-20 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"meeting_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"decision":{"type":"string","required":true,"max":8000},"follow_up":{"type":"string","required":false,"max":2000}}`
- 예시 본문: `{"meeting_id":1,"title":"title 입력 예시","decision":"decision 입력 예시","follow_up":"follow_up 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","decision":"decision 예시","follow_up":"follow_up 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/meeting-minutes/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## meeting-minutes-archive · 회의 결정 기록 초안 보관

- 경로: **DELETE /api/v1/meeting-minutes/:id**
- 목적/기능군: 회의 결정 기록 초안 보관; 역할 및 대상 범위 검사 후 처리 / meeting-minutes
- 요구사항: FR-20 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"meeting_id":1,"title":"title 예시","decision":"decision 예시","follow_up":"follow_up 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/meeting-minutes/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## operating-guidelines-list · Crew 운영 지침 검색 및 페이지 목록

- 경로: **GET /api/v1/operating-guidelines**
- 목적/기능군: Crew 운영 지침 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / operating-guidelines
- 요구사항: FR-05, FR-20, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","effective_at":"2026-11-01 01:00:00.000"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/operating-guidelines. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## operating-guidelines-detail · Crew 운영 지침 상세 조회

- 경로: **GET /api/v1/operating-guidelines/:id**
- 목적/기능군: Crew 운영 지침 상세 조회; 역할 및 대상 범위 검사 후 처리 / operating-guidelines
- 요구사항: FR-05, FR-20 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","effective_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/operating-guidelines/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## operating-guidelines-create · Crew 운영 지침 등록

- 경로: **POST /api/v1/operating-guidelines**
- 목적/기능군: Crew 운영 지침 등록; 역할 및 대상 범위 검사 후 처리 / operating-guidelines
- 요구사항: FR-05, FR-20 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"body":{"type":"string","required":true,"max":12000},"effective_at":{"type":"date","required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","effective_at":"2026-11-01T10:00:00+09:00"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","effective_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/operating-guidelines. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## operating-guidelines-update · Crew 운영 지침 기본 정보 수정

- 경로: **PATCH /api/v1/operating-guidelines/:id**
- 목적/기능군: Crew 운영 지침 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / operating-guidelines
- 요구사항: FR-05, FR-20 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"body":{"type":"string","required":true,"max":12000},"effective_at":{"type":"date","required":true}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","body":"body 입력 예시","effective_at":"2026-11-01T10:00:00+09:00"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","effective_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/operating-guidelines/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## operating-guidelines-archive · Crew 운영 지침 초안 보관

- 경로: **DELETE /api/v1/operating-guidelines/:id**
- 목적/기능군: Crew 운영 지침 초안 보관; 역할 및 대상 범위 검사 후 처리 / operating-guidelines
- 요구사항: FR-05, FR-20 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","body":"body 예시","effective_at":"2026-11-01 01:00:00.000"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/operating-guidelines/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## onboarding-plans-list · 구성원 적응 계획 검색 및 페이지 목록

- 경로: **GET /api/v1/onboarding-plans**
- 목적/기능군: 구성원 적응 계획 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / onboarding-plans
- 요구사항: FR-01, FR-04, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"member_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","objectives":"objectives 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/onboarding-plans. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## onboarding-plans-detail · 구성원 적응 계획 상세 조회

- 경로: **GET /api/v1/onboarding-plans/:id**
- 목적/기능군: 구성원 적응 계획 상세 조회; 역할 및 대상 범위 검사 후 처리 / onboarding-plans
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","objectives":"objectives 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/onboarding-plans/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## onboarding-plans-create · 구성원 적응 계획 등록

- 경로: **POST /api/v1/onboarding-plans**
- 목적/기능군: 구성원 적응 계획 등록; 역할 및 대상 범위 검사 후 처리 / onboarding-plans
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"due_at":{"type":"date","required":true},"objectives":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","objectives":"objectives 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","objectives":"objectives 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/onboarding-plans. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## onboarding-plans-update · 구성원 적응 계획 기본 정보 수정

- 경로: **PATCH /api/v1/onboarding-plans/:id**
- 목적/기능군: 구성원 적응 계획 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / onboarding-plans
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"due_at":{"type":"date","required":true},"objectives":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"title":"title 입력 예시","due_at":"2026-11-01T10:00:00+09:00","objectives":"objectives 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","objectives":"objectives 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/onboarding-plans/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## onboarding-plans-archive · 구성원 적응 계획 초안 보관

- 경로: **DELETE /api/v1/onboarding-plans/:id**
- 목적/기능군: 구성원 적응 계획 초안 보관; 역할 및 대상 범위 검사 후 처리 / onboarding-plans
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"member_id":1,"title":"title 예시","due_at":"2026-11-01 01:00:00.000","objectives":"objectives 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/onboarding-plans/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## onboarding-steps-list · 적응 계획 실습 항목 검색 및 페이지 목록

- 경로: **GET /api/v1/onboarding-steps**
- 목적/기능군: 적응 계획 실습 항목 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / onboarding-steps
- 요구사항: FR-01, FR-04, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"plan_id":1,"title":"title 예시","instructions":"instructions 예시","position":1}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/onboarding-steps. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## onboarding-steps-detail · 적응 계획 실습 항목 상세 조회

- 경로: **GET /api/v1/onboarding-steps/:id**
- 목적/기능군: 적응 계획 실습 항목 상세 조회; 역할 및 대상 범위 검사 후 처리 / onboarding-steps
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"plan_id":1,"title":"title 예시","instructions":"instructions 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/onboarding-steps/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## onboarding-steps-create · 적응 계획 실습 항목 등록

- 경로: **POST /api/v1/onboarding-steps**
- 목적/기능군: 적응 계획 실습 항목 등록; 역할 및 대상 범위 검사 후 처리 / onboarding-steps
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"plan_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"instructions":{"type":"string","required":true,"max":2000},"position":{"type":"number","min":0,"max":999,"required":false}}`
- 예시 본문: `{"plan_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","position":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"plan_id":1,"title":"title 예시","instructions":"instructions 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/onboarding-steps. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## onboarding-steps-update · 적응 계획 실습 항목 기본 정보 수정

- 경로: **PATCH /api/v1/onboarding-steps/:id**
- 목적/기능군: 적응 계획 실습 항목 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / onboarding-steps
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"plan_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"instructions":{"type":"string","required":true,"max":2000},"position":{"type":"number","min":0,"max":999,"required":false}}`
- 예시 본문: `{"plan_id":1,"title":"title 입력 예시","instructions":"instructions 입력 예시","position":1}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"plan_id":1,"title":"title 예시","instructions":"instructions 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/onboarding-steps/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## onboarding-steps-archive · 적응 계획 실습 항목 초안 보관

- 경로: **DELETE /api/v1/onboarding-steps/:id**
- 목적/기능군: 적응 계획 실습 항목 초안 보관; 역할 및 대상 범위 검사 후 처리 / onboarding-steps
- 요구사항: FR-01, FR-04 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"plan_id":1,"title":"title 예시","instructions":"instructions 예시","position":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/onboarding-steps/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## training-sessions-list · 조직 운영 교육 검색 및 페이지 목록

- 경로: **GET /api/v1/training-sessions**
- 목적/기능군: 조직 운영 교육 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","capacity":1,"syllabus":"syllabus 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/training-sessions. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## training-sessions-detail · 조직 운영 교육 상세 조회

- 경로: **GET /api/v1/training-sessions/:id**
- 목적/기능군: 조직 운영 교육 상세 조회; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","capacity":1,"syllabus":"syllabus 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/training-sessions/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## training-sessions-create · 조직 운영 교육 등록

- 경로: **POST /api/v1/training-sessions**
- 목적/기능군: 조직 운영 교육 등록; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"capacity":{"type":"number","min":1,"max":1000,"required":true},"syllabus":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","capacity":1,"syllabus":"syllabus 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","capacity":1,"syllabus":"syllabus 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/training-sessions. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## training-sessions-update · 조직 운영 교육 기본 정보 수정

- 경로: **PATCH /api/v1/training-sessions/:id**
- 목적/기능군: 조직 운영 교육 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":200},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"capacity":{"type":"number","min":1,"max":1000,"required":true},"syllabus":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"crew_id":1,"title":"title 입력 예시","starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","capacity":1,"syllabus":"syllabus 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","capacity":1,"syllabus":"syllabus 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/training-sessions/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## training-sessions-archive · 조직 운영 교육 초안 보관

- 경로: **DELETE /api/v1/training-sessions/:id**
- 목적/기능군: 조직 운영 교육 초안 보관; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: crewChild
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"crew_id":1,"title":"title 예시","starts_at":"2026-11-01 01:00:00.000","ends_at":"2026-11-01 01:00:00.000","capacity":1,"syllabus":"syllabus 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/training-sessions/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## training-enrollments-list · 교육 참가 신청 검색 및 페이지 목록

- 경로: **GET /api/v1/training-enrollments**
- 목적/기능군: 교육 참가 신청 검색 및 페이지 목록; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19, FR-21, AR-03 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[{"id":1,"training_id":1,"member_id":1,"title":"title 예시","goal":"goal 예시"}],"meta":{"page":1,"size":20,"total":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#list
- 기능 차이: 검색·총건수·페이지 탐색
- 계수 판단: 독립 기능 후보: 검색·총건수·페이지 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/training-enrollments. 생성/목록 응답에서 얻은 ID를 사용. 검색·총건수·페이지 탐색. 관측 결과: 미실행.

## training-enrollments-detail · 교육 참가 신청 상세 조회

- 경로: **GET /api/v1/training-enrollments/:id**
- 목적/기능군: 교육 참가 신청 상세 조회; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"training_id":1,"member_id":1,"title":"title 예시","goal":"goal 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/entities.js#detail
- 기능 차이: 단일 대상 존재/권한 확인과 전체 필드
- 계수 판단: 독립 기능 후보: 단일 대상 존재/권한 확인과 전체 필드
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/training-enrollments/:id. 생성/목록 응답에서 얻은 ID를 사용. 단일 대상 존재/권한 확인과 전체 필드. 관측 결과: 미실행.

## training-enrollments-create · 교육 참가 신청 등록

- 경로: **POST /api/v1/training-enrollments**
- 목적/기능군: 교육 참가 신청 등록; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"training_id":{"type":"id","required":true},"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"goal":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"training_id":1,"member_id":1,"title":"title 입력 예시","goal":"goal 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"training_id":1,"member_id":1,"title":"title 예시","goal":"goal 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 새 도메인 개체 생성과 관계 검증
- 계수 판단: 독립 기능 후보: 새 도메인 개체 생성과 관계 검증
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/training-enrollments. 생성/목록 응답에서 얻은 ID를 사용. 새 도메인 개체 생성과 관계 검증. 관측 결과: 미실행.

## training-enrollments-update · 교육 참가 신청 기본 정보 수정

- 경로: **PATCH /api/v1/training-enrollments/:id**
- 목적/기능군: 교육 참가 신청 기본 정보 수정; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{"training_id":{"type":"id","required":true},"member_id":{"type":"id","required":true},"title":{"type":"string","required":true,"max":150},"goal":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"training_id":1,"member_id":1,"title":"title 입력 예시","goal":"goal 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"training_id":1,"member_id":1,"title":"title 예시","goal":"goal 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 계수 판단: 독립 기능 후보: 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/training-enrollments/:id. 생성/목록 응답에서 얻은 ID를 사용. 기존 초안/기본 정보 수정; 상태/관계 필드 우회 금지. 관측 결과: 미실행.

## training-enrollments-archive · 교육 참가 신청 초안 보관

- 경로: **DELETE /api/v1/training-enrollments/:id**
- 목적/기능군: 교육 참가 신청 초안 보관; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19 (설계 확장)
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: parent
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1,"training_id":1,"member_id":1,"title":"title 예시","goal":"goal 예시"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/entities.js#mutate
- 기능 차이: 초안만 비활성화하며 관계/이력 보존
- 계수 판단: 독립 기능 후보: 초안만 비활성화하며 관계/이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/training-enrollments/:id. 생성/목록 응답에서 얻은 ID를 사용. 초안만 비활성화하며 관계/이력 보존. 관측 결과: 미실행.

## csrf · 세션 CSRF 토큰 발급

- 경로: **GET /api/v1/auth/csrf**
- 목적/기능군: 세션 CSRF 토큰 발급; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"csrfToken":"<세션에 연결된 무작위 토큰>"}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/auth.js#execute
- 기능 차이: 세션 CSRF 토큰 발급
- 계수 판단: 독립 기능 후보: 세션 CSRF 토큰 발급
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/auth/csrf. 생성/목록 응답에서 얻은 ID를 사용. 세션 CSRF 토큰 발급. 관측 결과: 미실행.

## login · 계정 로그인

- 경로: **POST /api/v1/auth/login**
- 목적/기능군: 계정 로그인; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"username":{"type":"string","required":true,"max":80},"password":{"type":"string","required":true,"max":128}}`
- 예시 본문: `{"username":"admin","password":"Example-Password-2026!"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/auth.js#execute
- 기능 차이: 계정 로그인
- 계수 판단: 독립 기능 후보: 계정 로그인
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 POST /api/v1/auth/login. 생성/목록 응답에서 얻은 ID를 사용. 계정 로그인. 관측 결과: 미실행.

## logout · 현재 세션 로그아웃

- 경로: **POST /api/v1/auth/logout**
- 목적/기능군: 현재 세션 로그아웃; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/auth.js#execute
- 기능 차이: 현재 세션 로그아웃
- 계수 판단: 독립 기능 후보: 현재 세션 로그아웃
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 POST /api/v1/auth/logout. 생성/목록 응답에서 얻은 ID를 사용. 현재 세션 로그아웃. 관측 결과: 미실행.

## identity · 현재 인증 및 접근 범위 확인

- 경로: **GET /api/v1/auth/identity**
- 목적/기능군: 현재 인증 및 접근 범위 확인; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-02, FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"memberId":1,"name":"구성원","role":"Soldier","status":"ACTIVE","crewId":1,"managedCrews":[]}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/auth.js#execute
- 기능 차이: 현재 인증 및 접근 범위 확인
- 계수 판단: 독립 기능 후보: 현재 인증 및 접근 범위 확인
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/auth/identity. 생성/목록 응답에서 얻은 ID를 사용. 현재 인증 및 접근 범위 확인. 관측 결과: 미실행.

## changePassword · 본인 비밀번호 변경 및 세션 종료

- 경로: **POST /api/v1/auth/password**
- 목적/기능군: 본인 비밀번호 변경 및 세션 종료; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"current_password":{"type":"string","required":true,"max":128},"new_password":{"type":"string","required":true,"max":128}}`
- 예시 본문: `{"current_password":"Example-Password-2026!","new_password":"Example-Password-2026!"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/auth.js#execute
- 기능 차이: 본인 비밀번호 변경 및 세션 종료
- 계수 판단: 독립 기능 후보: 본인 비밀번호 변경 및 세션 종료
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 POST /api/v1/auth/password. 생성/목록 응답에서 얻은 ID를 사용. 본인 비밀번호 변경 및 세션 종료. 관측 결과: 미실행.

## sessions · 본인 접속 세션 목록

- 경로: **GET /api/v1/auth/sessions**
- 목적/기능군: 본인 접속 세션 목록; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/auth.js#execute
- 기능 차이: 본인 접속 세션 목록
- 계수 판단: 독립 기능 후보: 본인 접속 세션 목록
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/auth/sessions. 생성/목록 응답에서 얻은 ID를 사용. 본인 접속 세션 목록. 관측 결과: 미실행.

## revokeSessions · 본인 전체 세션 종료

- 경로: **DELETE /api/v1/auth/sessions**
- 목적/기능군: 본인 전체 세션 종료; 역할 및 대상 범위 검사 후 처리 / auth
- 요구사항: FR-23
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/auth.js#execute
- 기능 차이: 본인 전체 세션 종료
- 계수 판단: 독립 기능 후보: 본인 전체 세션 종료
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 DELETE /api/v1/auth/sessions. 생성/목록 응답에서 얻은 ID를 사용. 본인 전체 세션 종료. 관측 결과: 미실행.

## accountBlock · 계정 차단

- 경로: **POST /api/v1/accounts/:id/block**
- 목적/기능군: 계정 차단; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 계정 차단
- 계수 판단: 독립 기능 후보: 계정 차단
- 확인: Administrator 계정으로 로그인 후 POST /api/v1/accounts/:id/block. 생성/목록 응답에서 얻은 ID를 사용. 계정 차단. 관측 결과: 미실행.

## accountUnblock · 계정 차단 해제

- 경로: **POST /api/v1/accounts/:id/unblock**
- 목적/기능군: 계정 차단 해제; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 계정 차단 해제
- 계수 판단: 독립 기능 후보: 계정 차단 해제
- 확인: Administrator 계정으로 로그인 후 POST /api/v1/accounts/:id/unblock. 생성/목록 응답에서 얻은 ID를 사용. 계정 차단 해제. 관측 결과: 미실행.

## accountPassword · 관리자 비밀번호 재설정

- 경로: **POST /api/v1/accounts/:id/reset-password**
- 목적/기능군: 관리자 비밀번호 재설정; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{"new_password":{"type":"string","required":true,"max":128},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"new_password":"Example-Password-2026!","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 관리자 비밀번호 재설정
- 계수 판단: 독립 기능 후보: 관리자 비밀번호 재설정
- 확인: Administrator 계정으로 로그인 후 POST /api/v1/accounts/:id/reset-password. 생성/목록 응답에서 얻은 ID를 사용. 관리자 비밀번호 재설정. 관측 결과: 미실행.

## accountSessions · 대상 계정 세션 강제 종료

- 경로: **DELETE /api/v1/accounts/:id/sessions**
- 목적/기능군: 대상 계정 세션 강제 종료; 역할 및 대상 범위 검사 후 처리 / accounts
- 요구사항: FR-23
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 대상 계정 세션 강제 종료
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Administrator 계정으로 로그인 후 DELETE /api/v1/accounts/:id/sessions. 생성/목록 응답에서 얻은 ID를 사용. 대상 계정 세션 강제 종료. 관측 결과: 미실행.

## memberRole · 구성원 역할 변경

- 경로: **POST /api/v1/members/:id/role**
- 목적/기능군: 구성원 역할 변경; 역할 및 대상 범위 검사 후 처리 / members
- 요구사항: FR-03, BR-04, BR-10
- 허용 역할: Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"role":{"type":"string","enum":["Associate","Soldier","Capo","Underboss","Boss","Administrator"],"required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"role":"Associate","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 구성원 역할 변경
- 계수 판단: 독립 기능 후보: 구성원 역할 변경
- 확인: Boss/Administrator 계정으로 로그인 후 POST /api/v1/members/:id/role. 생성/목록 응답에서 얻은 ID를 사용. 구성원 역할 변경. 관측 결과: 미실행.

## memberStatus · 구성원 활동 상태 전이

- 경로: **POST /api/v1/members/:id/status**
- 목적/기능군: 구성원 활동 상태 전이; 역할 및 대상 범위 검사 후 처리 / members
- 요구사항: FR-04, BR-02, BR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"status":{"type":"string","enum":["ACTIVE","PENDING","SUSPENDED","WITHDRAWN"],"required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"status":"ACTIVE","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 구성원 활동 상태 전이
- 계수 판단: 독립 기능 후보: 구성원 활동 상태 전이
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/members/:id/status. 생성/목록 응답에서 얻은 ID를 사용. 구성원 활동 상태 전이. 관측 결과: 미실행.

## membershipAdd · 미소속 구성원 Crew 편입

- 경로: **POST /api/v1/crews/:id/memberships**
- 목적/기능군: 미소속 구성원 Crew 편입; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-06, BR-01, BR-05
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"member_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 미소속 구성원 Crew 편입
- 계수 판단: 독립 기능 후보: 미소속 구성원 Crew 편입
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/crews/:id/memberships. 생성/목록 응답에서 얻은 ID를 사용. 미소속 구성원 Crew 편입. 관측 결과: 미실행.

## membershipTransfer · 정식 소속 전속 이동

- 경로: **POST /api/v1/members/:id/transfer**
- 목적/기능군: 정식 소속 전속 이동; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-06, BR-01, BR-05
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"crew_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"crew_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 정식 소속 전속 이동
- 계수 판단: 독립 기능 후보: 정식 소속 전속 이동
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/members/:id/transfer. 생성/목록 응답에서 얻은 ID를 사용. 정식 소속 전속 이동. 관측 결과: 미실행.

## membershipRemove · 정식 소속 해제

- 경로: **POST /api/v1/members/:id/detach**
- 목적/기능군: 정식 소속 해제; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-06, BR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 정식 소속 해제
- 계수 판단: 독립 기능 후보: 정식 소속 해제
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/members/:id/detach. 생성/목록 응답에서 얻은 ID를 사용. 정식 소속 해제. 관측 결과: 미실행.

## crewLeader · Crew 책임자 지정

- 경로: **POST /api/v1/crews/:id/leader**
- 목적/기능군: Crew 책임자 지정; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-05, FR-06
- 허용 역할: Boss, Underboss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"member_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: Crew 책임자 지정
- 계수 판단: 독립 기능 후보: Crew 책임자 지정
- 확인: Boss/Underboss 계정으로 로그인 후 POST /api/v1/crews/:id/leader. 생성/목록 응답에서 얻은 ID를 사용. Crew 책임자 지정. 관측 결과: 미실행.

## crewArchive · 빈 Crew 운영 종료

- 경로: **POST /api/v1/crews/:id/archive**
- 목적/기능군: 빈 Crew 운영 종료; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-05
- 허용 역할: Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 빈 Crew 운영 종료
- 계수 판단: 독립 기능 후보: 빈 Crew 운영 종료
- 확인: Boss 계정으로 로그인 후 POST /api/v1/crews/:id/archive. 생성/목록 응답에서 얻은 ID를 사용. 빈 Crew 운영 종료. 관측 결과: 미실행.

## managementList · 여러 Crew 관리 범위 조회

- 경로: **GET /api/v1/management-scopes**
- 목적/기능군: 여러 Crew 관리 범위 조회; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-23
- 허용 역할: Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/operations.js#execute
- 기능 차이: 여러 Crew 관리 범위 조회
- 계수 판단: 독립 기능 후보: 여러 Crew 관리 범위 조회
- 확인: Boss/Administrator 계정으로 로그인 후 GET /api/v1/management-scopes. 생성/목록 응답에서 얻은 ID를 사용. 여러 Crew 관리 범위 조회. 관측 결과: 미실행.

## managementGrant · Underboss 관리 범위 부여

- 경로: **POST /api/v1/management-scopes**
- 목적/기능군: Underboss 관리 범위 부여; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-23, FR-06
- 허용 역할: Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"member_id":{"type":"id","required":true},"crew_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"crew_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: Underboss 관리 범위 부여
- 계수 판단: 독립 기능 후보: Underboss 관리 범위 부여
- 확인: Boss 계정으로 로그인 후 POST /api/v1/management-scopes. 생성/목록 응답에서 얻은 ID를 사용. Underboss 관리 범위 부여. 관측 결과: 미실행.

## managementRevoke · Underboss 관리 범위 회수

- 경로: **DELETE /api/v1/management-scopes/:id/crews/:crewId**
- 목적/기능군: Underboss 관리 범위 회수; 역할 및 대상 범위 검사 후 처리 / crews
- 요구사항: FR-23
- 허용 역할: Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: Underboss 관리 범위 회수
- 계수 판단: 독립 기능 후보: Underboss 관리 범위 회수
- 확인: Boss 계정으로 로그인 후 DELETE /api/v1/management-scopes/:id/crews/:crewId. 생성/목록 응답에서 얻은 ID를 사용. Underboss 관리 범위 회수. 관측 결과: 미실행.

## taskStart · 업무 시작

- 경로: **POST /api/v1/tasks/:id/start**
- 목적/기능군: 업무 시작; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-10, FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 시작
- 계수 판단: 독립 기능 후보: 업무 시작
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/start. 생성/목록 응답에서 얻은 ID를 사용. 업무 시작. 관측 결과: 미실행.

## taskPause · 업무 일시 중지

- 경로: **POST /api/v1/tasks/:id/pause**
- 목적/기능군: 업무 일시 중지; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-10, FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 일시 중지
- 계수 판단: 독립 기능 후보: 업무 일시 중지
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/pause. 생성/목록 응답에서 얻은 ID를 사용. 업무 일시 중지. 관측 결과: 미실행.

## taskResume · 업무 재개

- 경로: **POST /api/v1/tasks/:id/resume**
- 목적/기능군: 업무 재개; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-10, FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 재개
- 계수 판단: 독립 기능 후보: 업무 재개
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/resume. 생성/목록 응답에서 얻은 ID를 사용. 업무 재개. 관측 결과: 미실행.

## taskComplete · 업무 완료

- 경로: **POST /api/v1/tasks/:id/complete**
- 목적/기능군: 업무 완료; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-10, FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"result":{"type":"string","required":true,"max":12000},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"result":"result 입력 예시","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 완료
- 계수 판단: 독립 기능 후보: 업무 완료
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/complete. 생성/목록 응답에서 얻은 ID를 사용. 업무 완료. 관측 결과: 미실행.

## taskCancel · 업무 취소

- 경로: **POST /api/v1/tasks/:id/cancel**
- 목적/기능군: 업무 취소; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-10, FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 취소
- 계수 판단: 독립 기능 후보: 업무 취소
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/cancel. 생성/목록 응답에서 얻은 ID를 사용. 업무 취소. 관측 결과: 미실행.

## taskCorrect · 완료 결과 정정

- 경로: **POST /api/v1/tasks/:id/correct-result**
- 목적/기능군: 완료 결과 정정; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-11, BR-06, BR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"result":{"type":"string","required":true,"max":12000},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"result":"result 입력 예시","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 완료 결과 정정
- 계수 판단: 독립 기능 후보: 완료 결과 정정
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/correct-result. 생성/목록 응답에서 얻은 ID를 사용. 완료 결과 정정. 관측 결과: 미실행.

## participantList · 업무 참여 및 기여 기록

- 경로: **GET /api/v1/tasks/:id/participants**
- 목적/기능군: 업무 참여 및 기여 기록; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-08, FR-11
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 참여 및 기여 기록
- 계수 판단: 독립 기능 후보: 업무 참여 및 기여 기록
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/tasks/:id/participants. 생성/목록 응답에서 얻은 ID를 사용. 업무 참여 및 기여 기록. 관측 결과: 미실행.

## participantAdd · 업무 참여자 배정

- 경로: **POST /api/v1/tasks/:id/participants**
- 목적/기능군: 업무 참여자 배정; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-08, BR-02, BR-03
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"member_id":{"type":"id","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 참여자 배정
- 계수 판단: 독립 기능 후보: 업무 참여자 배정
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/tasks/:id/participants. 생성/목록 응답에서 얻은 ID를 사용. 업무 참여자 배정. 관측 결과: 미실행.

## participantRemove · 업무 참여자 배정 해제

- 경로: **DELETE /api/v1/tasks/:id/participants/:memberId**
- 목적/기능군: 업무 참여자 배정 해제; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-08
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 업무 참여자 배정 해제
- 계수 판단: 독립 기능 후보: 업무 참여자 배정 해제
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 DELETE /api/v1/tasks/:id/participants/:memberId. 생성/목록 응답에서 얻은 ID를 사용. 업무 참여자 배정 해제. 관측 결과: 미실행.

## participantContribution · 본인 참여 기여 기록 제출

- 경로: **PATCH /api/v1/tasks/:id/contribution**
- 목적/기능군: 본인 참여 기여 기록 제출; 역할 및 대상 범위 검사 후 처리 / tasks
- 요구사항: FR-11
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"contribution":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"contribution":"contribution 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 본인 참여 기여 기록 제출
- 계수 판단: 독립 기능 후보: 본인 참여 기여 기록 제출
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/tasks/:id/contribution. 생성/목록 응답에서 얻은 ID를 사용. 본인 참여 기여 기록 제출. 관측 결과: 미실행.

## reservationList · 자원 배정 및 예약 탐색

- 경로: **GET /api/v1/reservations**
- 목적/기능군: 자원 배정 및 예약 탐색; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-15, FR-17
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/operations.js#execute
- 기능 차이: 자원 배정 및 예약 탐색
- 계수 판단: 독립 기능 후보: 자원 배정 및 예약 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reservations. 생성/목록 응답에서 얻은 ID를 사용. 자원 배정 및 예약 탐색. 관측 결과: 미실행.

## reservationDetail · 예약 상세와 반환 상태

- 경로: **GET /api/v1/reservations/:id**
- 목적/기능군: 예약 상세와 반환 상태; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-15
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/operations.js#execute
- 기능 차이: 예약 상세와 반환 상태
- 계수 판단: 독립 기능 후보: 예약 상세와 반환 상태
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reservations/:id. 생성/목록 응답에서 얻은 ID를 사용. 예약 상세와 반환 상태. 관측 결과: 미실행.

## reservationCreate · 자원 사용 예약

- 경로: **POST /api/v1/reservations**
- 목적/기능군: 자원 사용 예약; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-17, BR-07, BR-08
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"resource_id":{"type":"id","required":true},"task_id":{"type":"id","required":false},"member_id":{"type":"id","required":true},"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"resource_id":1,"task_id":1,"member_id":1,"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 자원 사용 예약
- 계수 판단: 독립 기능 후보: 자원 사용 예약
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/reservations. 생성/목록 응답에서 얻은 ID를 사용. 자원 사용 예약. 관측 결과: 미실행.

## reservationReschedule · 예약 시간 변경

- 경로: **PATCH /api/v1/reservations/:id**
- 목적/기능군: 예약 시간 변경; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-17, BR-07
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"starts_at":{"type":"date","required":true},"ends_at":{"type":"date","required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"starts_at":"2026-11-01T10:00:00+09:00","ends_at":"2026-11-01T11:00:00+09:00","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 예약 시간 변경
- 계수 판단: 독립 기능 후보: 예약 시간 변경
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/reservations/:id. 생성/목록 응답에서 얻은 ID를 사용. 예약 시간 변경. 관측 결과: 미실행.

## reservationCheckout · 예약 자원 인수

- 경로: **POST /api/v1/reservations/:id/checkout**
- 목적/기능군: 예약 자원 인수; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-15, BR-07
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 예약 자원 인수
- 계수 판단: 독립 기능 후보: 예약 자원 인수
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/reservations/:id/checkout. 생성/목록 응답에서 얻은 ID를 사용. 예약 자원 인수. 관측 결과: 미실행.

## reservationReturn · 사용 자원 반환

- 경로: **POST /api/v1/reservations/:id/return**
- 목적/기능군: 사용 자원 반환; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-15
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"condition":{"type":"string","enum":["GOOD","DAMAGED"],"required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"condition":"GOOD","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 사용 자원 반환
- 계수 판단: 독립 기능 후보: 사용 자원 반환
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/reservations/:id/return. 생성/목록 응답에서 얻은 ID를 사용. 사용 자원 반환. 관측 결과: 미실행.

## reservationCancel · 미사용 예약 취소

- 경로: **POST /api/v1/reservations/:id/cancel**
- 목적/기능군: 미사용 예약 취소; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-17
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 미사용 예약 취소
- 계수 판단: 독립 기능 후보: 미사용 예약 취소
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/reservations/:id/cancel. 생성/목록 응답에서 얻은 ID를 사용. 미사용 예약 취소. 관측 결과: 미실행.

## resourceStatus · 자원 가용 상태 변경

- 경로: **POST /api/v1/resources/:id/status**
- 목적/기능군: 자원 가용 상태 변경; 역할 및 대상 범위 검사 후 처리 / resources
- 요구사항: FR-13, FR-16, BR-08
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"status":{"type":"string","enum":["AVAILABLE","INSPECTION","UNAVAILABLE","RETIRED"],"required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"status":"AVAILABLE","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 자원 가용 상태 변경
- 계수 판단: 독립 기능 후보: 자원 가용 상태 변경
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resources/:id/status. 생성/목록 응답에서 얻은 ID를 사용. 자원 가용 상태 변경. 관측 결과: 미실행.

## evaluationList · 활동 결과 평가 탐색

- 경로: **GET /api/v1/evaluations**
- 목적/기능군: 활동 결과 평가 탐색; 역할 및 대상 범위 검사 후 처리 / evaluations
- 요구사항: FR-18, FR-19
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 활동 결과 평가 탐색
- 계수 판단: 독립 기능 후보: 활동 결과 평가 탐색
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/evaluations. 생성/목록 응답에서 얻은 ID를 사용. 활동 결과 평가 탐색. 관측 결과: 미실행.

## evaluationDetail · 평가 원본 및 수정 이력

- 경로: **GET /api/v1/evaluations/:id**
- 목적/기능군: 평가 원본 및 수정 이력; 역할 및 대상 범위 검사 후 처리 / evaluations
- 요구사항: FR-19, BR-10
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 평가 원본 및 수정 이력
- 계수 판단: 독립 기능 후보: 평가 원본 및 수정 이력
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/evaluations/:id. 생성/목록 응답에서 얻은 ID를 사용. 평가 원본 및 수정 이력. 관측 결과: 미실행.

## evaluationCreate · 완료 활동 평가 작성

- 경로: **POST /api/v1/evaluations**
- 목적/기능군: 완료 활동 평가 작성; 역할 및 대상 범위 검사 후 처리 / evaluations
- 요구사항: FR-18
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"member_id":{"type":"id","required":true},"task_id":{"type":"id","required":true},"score":{"type":"number","min":1,"max":5,"required":true},"body":{"type":"string","required":true,"max":8000},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"member_id":1,"task_id":1,"score":1,"body":"body 입력 예시","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 완료 활동 평가 작성
- 계수 판단: 독립 기능 후보: 완료 활동 평가 작성
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/evaluations. 생성/목록 응답에서 얻은 ID를 사용. 완료 활동 평가 작성. 관측 결과: 미실행.

## evaluationRevise · 평가 정정 및 이전 값 보존

- 경로: **PATCH /api/v1/evaluations/:id**
- 목적/기능군: 평가 정정 및 이전 값 보존; 역할 및 대상 범위 검사 후 처리 / evaluations
- 요구사항: FR-18, BR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"version":{"type":"number","min":1,"max":1000000,"required":true},"score":{"type":"number","min":1,"max":5,"required":true},"body":{"type":"string","required":true,"max":8000},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"version":1,"score":1,"body":"body 입력 예시","reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 평가 정정 및 이전 값 보존
- 계수 판단: 독립 기능 후보: 평가 정정 및 이전 값 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 PATCH /api/v1/evaluations/:id. 생성/목록 응답에서 얻은 ID를 사용. 평가 정정 및 이전 값 보존. 관측 결과: 미실행.

## evaluationPublish · 평가 공개 확정

- 경로: **POST /api/v1/evaluations/:id/publish**
- 목적/기능군: 평가 공개 확정; 역할 및 대상 범위 검사 후 처리 / evaluations
- 요구사항: FR-18
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"version":{"type":"number","min":1,"max":1000000,"required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"version":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 평가 공개 확정
- 계수 판단: 독립 기능 후보: 평가 공개 확정
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/evaluations/:id/publish. 생성/목록 응답에서 얻은 ID를 사용. 평가 공개 확정. 관측 결과: 미실행.

## evaluationRetract · 공개 평가 철회 및 이력 보존

- 경로: **POST /api/v1/evaluations/:id/retract**
- 목적/기능군: 공개 평가 철회 및 이력 보존; 역할 및 대상 범위 검사 후 처리 / evaluations
- 요구사항: FR-18, BR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"version":{"type":"number","min":1,"max":1000000,"required":true},"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"version":1,"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 공개 평가 철회 및 이력 보존
- 계수 판단: 독립 기능 후보: 공개 평가 철회 및 이력 보존
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/evaluations/:id/retract. 생성/목록 응답에서 얻은 ID를 사용. 공개 평가 철회 및 이력 보존. 관측 결과: 미실행.

## membersHistory · members 변경 이력

- 경로: **GET /api/v1/members/:id/history**
- 목적/기능군: members 변경 이력; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-19, BR-10
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: members 변경 이력
- 계수 판단: 독립 기능 후보: members 변경 이력
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/members/:id/history. 생성/목록 응답에서 얻은 ID를 사용. members 변경 이력. 관측 결과: 미실행.

## tasksHistory · tasks 변경 이력

- 경로: **GET /api/v1/tasks/:id/history**
- 목적/기능군: tasks 변경 이력; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-10, BR-10
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: tasks 변경 이력
- 계수 판단: 독립 기능 후보: tasks 변경 이력
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/tasks/:id/history. 생성/목록 응답에서 얻은 ID를 사용. tasks 변경 이력. 관측 결과: 미실행.

## resourcesHistory · resources 변경 이력

- 경로: **GET /api/v1/resources/:id/history**
- 목적/기능군: resources 변경 이력; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-15, BR-10
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: resources 변경 이력
- 계수 판단: 독립 기능 후보: resources 변경 이력
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/resources/:id/history. 생성/목록 응답에서 얻은 ID를 사용. resources 변경 이력. 관측 결과: 미실행.

## activityFeed · 접근 범위 내 활동 타임라인

- 경로: **GET /api/v1/activity**
- 목적/기능군: 접근 범위 내 활동 타임라인; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-19, FR-20
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 접근 범위 내 활동 타임라인
- 계수 판단: 독립 기능 후보: 접근 범위 내 활동 타임라인
- 확인: Associate/Soldier/Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/activity. 생성/목록 응답에서 얻은 ID를 사용. 접근 범위 내 활동 타임라인. 관측 결과: 미실행.

## auditLog · 관리자 감사 기록

- 경로: **GET /api/v1/audit**
- 목적/기능군: 관리자 감사 기록; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-20, FR-23
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MongoDB 원본/수정 이력; MySQL 대상 권한 및 활동 관계 확인
- 구현: src/services/records.js#execute
- 기능 차이: 관리자 감사 기록
- 계수 판단: 독립 기능 후보: 관리자 감사 기록
- 확인: Administrator 계정으로 로그인 후 GET /api/v1/audit. 생성/목록 응답에서 얻은 ID를 사용. 관리자 감사 기록. 관측 결과: 미실행.

## pendingEvents · 미전달 기록 및 재시도 상태

- 경로: **GET /api/v1/outbox/pending**
- 목적/기능군: 미전달 기록 및 재시도 상태; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-20
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 범위 제한 조회
- 구현: src/services/operations.js#execute
- 기능 차이: 미전달 기록 및 재시도 상태
- 계수 판단: 독립 기능 후보: 미전달 기록 및 재시도 상태
- 확인: Administrator 계정으로 로그인 후 GET /api/v1/outbox/pending. 생성/목록 응답에서 얻은 ID를 사용. 미전달 기록 및 재시도 상태. 관측 결과: 미실행.

## retryEvent · 기록 전달 재시도 예약

- 경로: **POST /api/v1/outbox/:id/retry**
- 목적/기능군: 기록 전달 재시도 예약; 역할 및 대상 범위 검사 후 처리 / history
- 요구사항: FR-20
- 허용 역할: Administrator
- 대상 범위: technical-admin
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000}}`
- 예시 본문: `{"reason":"운영 일정 조정"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: 기록 전달 재시도 예약
- 계수 판단: 독립 기능 후보: 기록 전달 재시도 예약
- 확인: Administrator 계정으로 로그인 후 POST /api/v1/outbox/:id/retry. 생성/목록 응답에서 얻은 ID를 사용. 기록 전달 재시도 예약. 관측 결과: 미실행.

## report-workload · 구성원별 활성 업무 부하

- 경로: **GET /api/v1/reports/workload**
- 목적/기능군: 구성원별 활성 업무 부하; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: 구성원별 활성 업무 부하
- 계수 판단: 독립 기능 후보: 구성원별 활성 업무 부하
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/workload. 생성/목록 응답에서 얻은 ID를 사용. 구성원별 활성 업무 부하. 관측 결과: 미실행.

## report-task-status · Crew별 업무 상태 분포

- 경로: **GET /api/v1/reports/task-status**
- 목적/기능군: Crew별 업무 상태 분포; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: Crew별 업무 상태 분포
- 계수 판단: 독립 기능 후보: Crew별 업무 상태 분포
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/task-status. 생성/목록 응답에서 얻은 ID를 사용. Crew별 업무 상태 분포. 관측 결과: 미실행.

## report-member-status · Crew별 구성원 상태 분포

- 경로: **GET /api/v1/reports/member-status**
- 목적/기능군: Crew별 구성원 상태 분포; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: Crew별 구성원 상태 분포
- 계수 판단: 독립 기능 후보: Crew별 구성원 상태 분포
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/member-status. 생성/목록 응답에서 얻은 ID를 사용. Crew별 구성원 상태 분포. 관측 결과: 미실행.

## report-resource-utilization · 자원별 예약 시간 합계

- 경로: **GET /api/v1/reports/resource-utilization**
- 목적/기능군: 자원별 예약 시간 합계; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: 자원별 예약 시간 합계
- 계수 판단: 독립 기능 후보: 자원별 예약 시간 합계
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/resource-utilization. 생성/목록 응답에서 얻은 ID를 사용. 자원별 예약 시간 합계. 관측 결과: 미실행.

## report-overdue-tasks · 기한 초과 미완료 업무

- 경로: **GET /api/v1/reports/overdue-tasks**
- 목적/기능군: 기한 초과 미완료 업무; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: 기한 초과 미완료 업무
- 계수 판단: 독립 기능 후보: 기한 초과 미완료 업무
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/overdue-tasks. 생성/목록 응답에서 얻은 ID를 사용. 기한 초과 미완료 업무. 관측 결과: 미실행.

## report-completion-rate · 기간별 업무 완료율

- 경로: **GET /api/v1/reports/completion-rate**
- 목적/기능군: 기간별 업무 완료율; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: 기간별 업무 완료율
- 계수 판단: 독립 기능 후보: 기간별 업무 완료율
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/completion-rate. 생성/목록 응답에서 얻은 ID를 사용. 기간별 업무 완료율. 관측 결과: 미실행.

## report-evaluation-summary · 활동 평가 점수 분포

- 경로: **GET /api/v1/reports/evaluation-summary**
- 목적/기능군: 활동 평가 점수 분포; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-22
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: 활동 평가 점수 분포
- 계수 판단: 독립 기능 후보: 활동 평가 점수 분포
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/evaluation-summary. 생성/목록 응답에서 얻은 ID를 사용. 활동 평가 점수 분포. 관측 결과: 미실행.

## report-maintenance-due · 자원 점검 예정 현황

- 경로: **GET /api/v1/reports/maintenance-due**
- 목적/기능군: 자원 점검 예정 현황; 역할 및 대상 범위 검사 후 처리 / reports
- 요구사항: FR-16
- 허용 역할: Capo, Underboss, Boss, Administrator
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{}`
- 예시 본문: `{}`
- 정상 응답 예시: `{"success":true,"data":[]}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL/MongoDB 범위 제한 집계
- 구현: src/services/reports.js#execute
- 기능 차이: 자원 점검 예정 현황
- 계수 판단: 독립 기능 후보: 자원 점검 예정 현황
- 확인: Capo/Underboss/Boss/Administrator 계정으로 로그인 후 GET /api/v1/reports/maintenance-due. 생성/목록 응답에서 얻은 ID를 사용. 자원 점검 예정 현황. 관측 결과: 미실행.

## task-checklists-check · 확인 완료

- 경로: **POST /api/v1/task-checklists/:id/check**
- 목적/기능군: 확인 완료; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → CHECKED; 확인 완료 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-checklists/:id/check. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → CHECKED; 확인 완료 도메인 조건 검사. 관측 결과: 미실행.

## task-checklists-uncheck · 확인 취소

- 경로: **POST /api/v1/task-checklists/:id/uncheck**
- 목적/기능군: 확인 취소; 역할 및 대상 범위 검사 후 처리 / task-checklists
- 요구사항: FR-10
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: CHECKED → DRAFT; 확인 취소 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-checklists/:id/uncheck. 생성/목록 응답에서 얻은 ID를 사용. CHECKED → DRAFT; 확인 취소 도메인 조건 검사. 관측 결과: 미실행.

## task-milestones-achieve · 중간 목표 달성

- 경로: **POST /api/v1/task-milestones/:id/achieve**
- 목적/기능군: 중간 목표 달성; 역할 및 대상 범위 검사 후 처리 / task-milestones
- 요구사항: FR-07, FR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → ACHIEVED; 중간 목표 달성 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-milestones/:id/achieve. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → ACHIEVED; 중간 목표 달성 도메인 조건 검사. 관측 결과: 미실행.

## task-deliverables-submit · 산출물 검토 요청

- 경로: **POST /api/v1/task-deliverables/:id/submit**
- 목적/기능군: 산출물 검토 요청; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11
- 허용 역할: Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → SUBMITTED; 산출물 검토 요청 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-deliverables/:id/submit. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → SUBMITTED; 산출물 검토 요청 도메인 조건 검사. 관측 결과: 미실행.

## task-deliverables-accept · 산출물 승인

- 경로: **POST /api/v1/task-deliverables/:id/accept**
- 목적/기능군: 산출물 승인; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: SUBMITTED → ACCEPTED; 산출물 승인 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-deliverables/:id/accept. 생성/목록 응답에서 얻은 ID를 사용. SUBMITTED → ACCEPTED; 산출물 승인 도메인 조건 검사. 관측 결과: 미실행.

## task-deliverables-reject · 산출물 반려

- 경로: **POST /api/v1/task-deliverables/:id/reject**
- 목적/기능군: 산출물 반려; 역할 및 대상 범위 검사 후 처리 / task-deliverables
- 요구사항: FR-11
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: SUBMITTED → DRAFT; 산출물 반려 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-deliverables/:id/reject. 생성/목록 응답에서 얻은 ID를 사용. SUBMITTED → DRAFT; 산출물 반려 도메인 조건 검사. 관측 결과: 미실행.

## task-risks-resolve · 위험 해소

- 경로: **POST /api/v1/task-risks/:id/resolve**
- 목적/기능군: 위험 해소; 역할 및 대상 범위 검사 후 처리 / task-risks
- 요구사항: FR-10
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → RESOLVED; 위험 해소 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/task-risks/:id/resolve. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → RESOLVED; 위험 해소 도메인 조건 검사. 관측 결과: 미실행.

## resource-inspections-pass · 점검 통과

- 경로: **POST /api/v1/resource-inspections/:id/pass**
- 목적/기능군: 점검 통과; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → PASSED; 점검 통과 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → PASSED; 점검 통과 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-inspections/:id/pass. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → PASSED; 점검 통과 도메인 조건 검사. 관측 결과: 미실행.

## resource-inspections-fail · 점검 불합격

- 경로: **POST /api/v1/resource-inspections/:id/fail**
- 목적/기능군: 점검 불합격; 역할 및 대상 범위 검사 후 처리 / resource-inspections
- 요구사항: FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → FAILED; 점검 불합격 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → FAILED; 점검 불합격 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-inspections/:id/fail. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → FAILED; 점검 불합격 도메인 조건 검사. 관측 결과: 미실행.

## resource-maintenance-schedule · 정비 일정 확정

- 경로: **POST /api/v1/resource-maintenance/:id/schedule**
- 목적/기능군: 정비 일정 확정; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → SCHEDULED; 정비 일정 확정 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → SCHEDULED; 정비 일정 확정 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-maintenance/:id/schedule. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → SCHEDULED; 정비 일정 확정 도메인 조건 검사. 관측 결과: 미실행.

## resource-maintenance-begin · 정비 시작

- 경로: **POST /api/v1/resource-maintenance/:id/begin**
- 목적/기능군: 정비 시작; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: SCHEDULED → IN_PROGRESS; 정비 시작 도메인 조건 검사
- 계수 판단: 독립 기능 후보: SCHEDULED → IN_PROGRESS; 정비 시작 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-maintenance/:id/begin. 생성/목록 응답에서 얻은 ID를 사용. SCHEDULED → IN_PROGRESS; 정비 시작 도메인 조건 검사. 관측 결과: 미실행.

## resource-maintenance-finish · 정비 완료

- 경로: **POST /api/v1/resource-maintenance/:id/finish**
- 목적/기능군: 정비 완료; 역할 및 대상 범위 검사 후 처리 / resource-maintenance
- 요구사항: FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: IN_PROGRESS → COMPLETED; 정비 완료 도메인 조건 검사
- 계수 판단: 독립 기능 후보: IN_PROGRESS → COMPLETED; 정비 완료 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-maintenance/:id/finish. 생성/목록 응답에서 얻은 ID를 사용. IN_PROGRESS → COMPLETED; 정비 완료 도메인 조건 검사. 관측 결과: 미실행.

## resource-incidents-acknowledge · 장애 접수

- 경로: **POST /api/v1/resource-incidents/:id/acknowledge**
- 목적/기능군: 장애 접수; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → ACKNOWLEDGED; 장애 접수 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → ACKNOWLEDGED; 장애 접수 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-incidents/:id/acknowledge. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → ACKNOWLEDGED; 장애 접수 도메인 조건 검사. 관측 결과: 미실행.

## resource-incidents-resolve · 장애 해결

- 경로: **POST /api/v1/resource-incidents/:id/resolve**
- 목적/기능군: 장애 해결; 역할 및 대상 범위 검사 후 처리 / resource-incidents
- 요구사항: FR-15, FR-16
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: ACKNOWLEDGED → RESOLVED; 장애 해결 도메인 조건 검사
- 계수 판단: 독립 기능 후보: ACKNOWLEDGED → RESOLVED; 장애 해결 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/resource-incidents/:id/resolve. 생성/목록 응답에서 얻은 ID를 사용. ACKNOWLEDGED → RESOLVED; 장애 해결 도메인 조건 검사. 관측 결과: 미실행.

## leave-requests-submit · 휴가 결재 요청

- 경로: **POST /api/v1/leave-requests/:id/submit**
- 목적/기능군: 휴가 결재 요청; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → SUBMITTED; 휴가 결재 요청 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → SUBMITTED; 휴가 결재 요청 도메인 조건 검사
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/leave-requests/:id/submit. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → SUBMITTED; 휴가 결재 요청 도메인 조건 검사. 관측 결과: 미실행.

## leave-requests-approve · 휴가 승인

- 경로: **POST /api/v1/leave-requests/:id/approve**
- 목적/기능군: 휴가 승인; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: SUBMITTED → APPROVED; 휴가 승인 도메인 조건 검사
- 계수 판단: 독립 기능 후보: SUBMITTED → APPROVED; 휴가 승인 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/leave-requests/:id/approve. 생성/목록 응답에서 얻은 ID를 사용. SUBMITTED → APPROVED; 휴가 승인 도메인 조건 검사. 관측 결과: 미실행.

## leave-requests-reject · 휴가 반려

- 경로: **POST /api/v1/leave-requests/:id/reject**
- 목적/기능군: 휴가 반려; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: SUBMITTED → REJECTED; 휴가 반려 도메인 조건 검사
- 계수 판단: 독립 기능 후보: SUBMITTED → REJECTED; 휴가 반려 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/leave-requests/:id/reject. 생성/목록 응답에서 얻은 ID를 사용. SUBMITTED → REJECTED; 휴가 반려 도메인 조건 검사. 관측 결과: 미실행.

## leave-requests-withdraw · 휴가 신청 철회

- 경로: **POST /api/v1/leave-requests/:id/withdraw**
- 목적/기능군: 휴가 신청 철회; 역할 및 대상 범위 검사 후 처리 / leave-requests
- 요구사항: FR-04, FR-08
- 허용 역할: Associate, Soldier, Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: SUBMITTED → DRAFT; 휴가 신청 철회 도메인 조건 검사
- 계수 판단: 독립 기능 후보: SUBMITTED → DRAFT; 휴가 신청 철회 도메인 조건 검사
- 확인: Associate/Soldier/Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/leave-requests/:id/withdraw. 생성/목록 응답에서 얻은 ID를 사용. SUBMITTED → DRAFT; 휴가 신청 철회 도메인 조건 검사. 관측 결과: 미실행.

## crew-announcements-publish · 공지 게시

- 경로: **POST /api/v1/crew-announcements/:id/publish**
- 목적/기능군: 공지 게시; 역할 및 대상 범위 검사 후 처리 / crew-announcements
- 요구사항: FR-05
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → PUBLISHED; 공지 게시 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/crew-announcements/:id/publish. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → PUBLISHED; 공지 게시 도메인 조건 검사. 관측 결과: 미실행.

## crew-meetings-open · 회의 시작

- 경로: **POST /api/v1/crew-meetings/:id/open**
- 목적/기능군: 회의 시작; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → IN_PROGRESS; 회의 시작 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/crew-meetings/:id/open. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → IN_PROGRESS; 회의 시작 도메인 조건 검사. 관측 결과: 미실행.

## crew-meetings-close · 회의 종료

- 경로: **POST /api/v1/crew-meetings/:id/close**
- 목적/기능군: 회의 종료; 역할 및 대상 범위 검사 후 처리 / crew-meetings
- 요구사항: FR-05, FR-07
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: IN_PROGRESS → COMPLETED; 회의 종료 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/crew-meetings/:id/close. 생성/목록 응답에서 얻은 ID를 사용. IN_PROGRESS → COMPLETED; 회의 종료 도메인 조건 검사. 관측 결과: 미실행.

## meeting-minutes-ratify · 회의록 확정

- 경로: **POST /api/v1/meeting-minutes/:id/ratify**
- 목적/기능군: 회의록 확정; 역할 및 대상 범위 검사 후 처리 / meeting-minutes
- 요구사항: FR-20
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → RATIFIED; 회의록 확정 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/meeting-minutes/:id/ratify. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → RATIFIED; 회의록 확정 도메인 조건 검사. 관측 결과: 미실행.

## operating-guidelines-activate · 운영 지침 시행

- 경로: **POST /api/v1/operating-guidelines/:id/activate**
- 목적/기능군: 운영 지침 시행; 역할 및 대상 범위 검사 후 처리 / operating-guidelines
- 요구사항: FR-05, FR-20
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → ACTIVE; 운영 지침 시행 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/operating-guidelines/:id/activate. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → ACTIVE; 운영 지침 시행 도메인 조건 검사. 관측 결과: 미실행.

## onboarding-plans-complete · 적응 계획 완료

- 경로: **POST /api/v1/onboarding-plans/:id/complete**
- 목적/기능군: 적응 계획 완료; 역할 및 대상 범위 검사 후 처리 / onboarding-plans
- 요구사항: FR-01, FR-04
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → COMPLETED; 적응 계획 완료 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → COMPLETED; 적응 계획 완료 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/onboarding-plans/:id/complete. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → COMPLETED; 적응 계획 완료 도메인 조건 검사. 관측 결과: 미실행.

## onboarding-steps-complete · 적응 실습 완료

- 경로: **POST /api/v1/onboarding-steps/:id/complete**
- 목적/기능군: 적응 실습 완료; 역할 및 대상 범위 검사 후 처리 / onboarding-steps
- 요구사항: FR-01, FR-04
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → COMPLETED; 적응 실습 완료 도메인 조건 검사
- 계수 판단: 보수적 계수 제외: 동일 상태 변경의 세부 전이 또는 본인/관리자 유사 기능. 실제 구현되어 있으나 독립 기능 인정은 검토 필요.
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/onboarding-steps/:id/complete. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → COMPLETED; 적응 실습 완료 도메인 조건 검사. 관측 결과: 미실행.

## training-sessions-open · 교육 시작

- 경로: **POST /api/v1/training-sessions/:id/open**
- 목적/기능군: 교육 시작; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → IN_PROGRESS; 교육 시작 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → IN_PROGRESS; 교육 시작 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/training-sessions/:id/open. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → IN_PROGRESS; 교육 시작 도메인 조건 검사. 관측 결과: 미실행.

## training-sessions-close · 교육 종료

- 경로: **POST /api/v1/training-sessions/:id/close**
- 목적/기능군: 교육 종료; 역할 및 대상 범위 검사 후 처리 / training-sessions
- 요구사항: FR-18, FR-19
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: IN_PROGRESS → COMPLETED; 교육 종료 도메인 조건 검사
- 계수 판단: 독립 기능 후보: IN_PROGRESS → COMPLETED; 교육 종료 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/training-sessions/:id/close. 생성/목록 응답에서 얻은 ID를 사용. IN_PROGRESS → COMPLETED; 교육 종료 도메인 조건 검사. 관측 결과: 미실행.

## training-enrollments-attend · 교육 출석 확인

- 경로: **POST /api/v1/training-enrollments/:id/attend**
- 목적/기능군: 교육 출석 확인; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: DRAFT → ATTENDED; 교육 출석 확인 도메인 조건 검사
- 계수 판단: 독립 기능 후보: DRAFT → ATTENDED; 교육 출석 확인 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/training-enrollments/:id/attend. 생성/목록 응답에서 얻은 ID를 사용. DRAFT → ATTENDED; 교육 출석 확인 도메인 조건 검사. 관측 결과: 미실행.

## training-enrollments-complete · 교육 이수 확인

- 경로: **POST /api/v1/training-enrollments/:id/complete**
- 목적/기능군: 교육 이수 확인; 역할 및 대상 범위 검사 후 처리 / training-enrollments
- 요구사항: FR-18, FR-19
- 허용 역할: Capo, Underboss, Boss
- 대상 범위: current role and target Crew/member ownership
- 입력 스키마: `{"reason":{"type":"string","required":true,"max":2000},"outcome":{"type":"string","required":true,"max":4000}}`
- 예시 본문: `{"reason":"운영 일정 조정","outcome":"outcome 입력 예시"}`
- 정상 응답 예시: `{"success":true,"data":{"id":1}}`
- 오류 응답 예시: `{"success":false,"error":{"code":"OUT_OF_SCOPE","message":"관리 또는 조회 범위 밖의 대상입니다."}}`
- DB 처리: MySQL 트랜잭션 및 outbox 이력 (인증은 세션 저장소 포함)
- 구현: src/services/operations.js#execute
- 기능 차이: ATTENDED → COMPLETED; 교육 이수 확인 도메인 조건 검사
- 계수 판단: 독립 기능 후보: ATTENDED → COMPLETED; 교육 이수 확인 도메인 조건 검사
- 확인: Capo/Underboss/Boss 계정으로 로그인 후 POST /api/v1/training-enrollments/:id/complete. 생성/목록 응답에서 얻은 ID를 사용. ATTENDED → COMPLETED; 교육 이수 확인 도메인 조건 검사. 관측 결과: 미실행.


# API별 사전조건과 Path/Query/Header 스키마

| operationId | 사전조건 | 입력 위치별 스키마 |
|---|---|---|
| members-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| members-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| members-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| members-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crews-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100}},"headers":{}} |
| crews-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| crews-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crews-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| tasks-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"},"member_id":{"type":"id"}},"headers":{}} |
| tasks-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| tasks-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| tasks-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resources-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| resources-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| resources-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resources-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| accounts-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"}},"headers":{}} |
| accounts-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| accounts-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-notes-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"task_id":{"type":"id"}},"headers":{}} |
| task-notes-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-notes-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-notes-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-notes-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-checklists-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"task_id":{"type":"id"}},"headers":{}} |
| task-checklists-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-checklists-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-checklists-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-checklists-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-milestones-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"task_id":{"type":"id"}},"headers":{}} |
| task-milestones-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-milestones-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-milestones-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-milestones-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-dependencies-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"task_id":{"type":"id"}},"headers":{}} |
| task-dependencies-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-dependencies-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-dependencies-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-dependencies-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-templates-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| task-templates-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-templates-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-templates-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-templates-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-deliverables-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"task_id":{"type":"id"}},"headers":{}} |
| task-deliverables-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-deliverables-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-deliverables-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-deliverables-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-risks-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"task_id":{"type":"id"}},"headers":{}} |
| task-risks-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| task-risks-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-risks-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-risks-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-inspections-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"resource_id":{"type":"id"}},"headers":{}} |
| resource-inspections-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| resource-inspections-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-inspections-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-inspections-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-maintenance-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"resource_id":{"type":"id"}},"headers":{}} |
| resource-maintenance-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| resource-maintenance-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-maintenance-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-maintenance-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-incidents-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"resource_id":{"type":"id"}},"headers":{}} |
| resource-incidents-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| resource-incidents-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-incidents-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-incidents-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-categories-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| resource-categories-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| resource-categories-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-categories-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-categories-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-locations-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| resource-locations-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| resource-locations-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-locations-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-locations-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-skills-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"}},"headers":{}} |
| member-skills-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| member-skills-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-skills-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-skills-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-certifications-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"}},"headers":{}} |
| member-certifications-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| member-certifications-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-certifications-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-certifications-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-availability-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"}},"headers":{}} |
| member-availability-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| member-availability-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-availability-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| member-availability-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"}},"headers":{}} |
| leave-requests-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| leave-requests-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-announcements-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| crew-announcements-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| crew-announcements-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-announcements-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-announcements-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-meetings-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| crew-meetings-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| crew-meetings-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-meetings-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-meetings-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-agenda-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"meeting_id":{"type":"id"}},"headers":{}} |
| meeting-agenda-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| meeting-agenda-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-agenda-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-agenda-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-minutes-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"meeting_id":{"type":"id"}},"headers":{}} |
| meeting-minutes-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| meeting-minutes-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-minutes-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-minutes-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| operating-guidelines-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| operating-guidelines-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| operating-guidelines-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| operating-guidelines-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| operating-guidelines-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-plans-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"}},"headers":{}} |
| onboarding-plans-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| onboarding-plans-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-plans-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-plans-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-steps-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"plan_id":{"type":"id"}},"headers":{}} |
| onboarding-steps-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| onboarding-steps-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-steps-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-steps-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-sessions-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"crew_id":{"type":"id"}},"headers":{}} |
| training-sessions-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| training-sessions-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-sessions-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-sessions-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-enrollments-list | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"q":{"type":"string","max":100},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"},"page":{"type":"id"},"size":{"type":"id"},"sort":{"type":"string","max":100},"order":{"type":"string","max":100},"member_id":{"type":"id"},"training_id":{"type":"id"}},"headers":{}} |
| training-enrollments-detail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| training-enrollments-create | 필수 참조 대상을 먼저 생성하고 동일 관리 범위의 ID 확보 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-enrollments-update | 존재하고 보관되지 않은 기본 정보/초안; 관계 필드 변경 금지 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-enrollments-archive | DRAFT이며 활성 하위 기록과 사용 중 참조가 없는 대상 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| csrf | 쿠키를 보존하는 브라우저/클라이언트 준비 | {"path":{},"query":{},"headers":{}} |
| login | ACTIVE 계정과 활동 가능한 구성원, 실제 비밀번호, 사전 CSRF 발급 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| logout | 유효한 현재 세션 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| identity | 유효한 세션; 현재 역할/정식 소속/관리 범위 준비 | {"path":{},"query":{},"headers":{}} |
| changePassword | 현재 비밀번호를 확인하고 새 12~128자 비밀번호 준비 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| sessions | 현재 계정에 로그인 세션이 있어야 함 | {"path":{},"query":{},"headers":{}} |
| revokeSessions | 현재 세션; 성공 후 재로그인 준비 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| accountBlock | ACTIVE 대상 계정; 마지막 활성 Administrator는 대상에서 제외 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| accountUnblock | BLOCKED 대상 계정 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| accountPassword | 대상 계정과 새 12~128자 비밀번호 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| accountSessions | 대상 계정 로그인 세션 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| memberRole | 자기가 아닌 하위 역할의 구성원; 부여 역할도 행위자보다 낮아야 함; Crew 책임자라면 먼저 교체 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| memberStatus | PENDING→ACTIVE/WITHDRAWN, ACTIVE→SUSPENDED/WITHDRAWN, SUSPENDED→ACTIVE/WITHDRAWN; 정지/탈퇴 전 활성 업무·예약·책임자 관계 정리 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| membershipAdd | 미소속이며 탈퇴하지 않은 일반 구성원과 관리 가능한 Crew | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| membershipTransfer | 현재 소속과 도착 Crew 모두 관리 가능; 활성 업무·예약·책임자 관계 없음 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| membershipRemove | 현재 소속 관리 가능; 활성 업무·예약·책임자 관계 없음 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crewLeader | 대상 Crew에 정식 소속된 ACTIVE Capo | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crewArchive | 구성원·업무·자원이 없는 빈 Crew | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| managementList | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| managementGrant | Underboss와 존재하는 Crew; 같은 관리 관계 없음 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| managementRevoke | 해당 Underboss/Crew 관리 관계가 존재 | {"path":{"id":{"type":"id","required":true},"crewId":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| taskStart | PLANNED 업무, 참여자 최소 한 명, 선행 업무 모두 완료 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| taskPause | IN_PROGRESS 업무 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| taskResume | PAUSED 업무, 참여자 최소 한 명, 선행 업무 완료 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| taskComplete | IN_PROGRESS 업무, 사용 중 자원 모두 반환, 완료 결과 작성 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| taskCancel | PLANNED/IN_PROGRESS/PAUSED 업무, 사용 중 자원 반환 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| taskCorrect | COMPLETED 업무, 정정 결과와 정정 사유 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| participantList | 접근 가능한 업무 | {"path":{"id":{"type":"id","required":true}},"query":{"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| participantAdd | 종료 전 업무, 같은 Crew의 정지/탈퇴하지 않은 구성원, 업무·부재 시간 충돌 없음 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| participantRemove | 종료 전 업무와 기존 참여자, 해당 업무의 예약/사용 자원 없음 | {"path":{"id":{"type":"id","required":true},"memberId":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| participantContribution | 종료 전 업무에 본인이 배정되어 있어야 함 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| reservationList | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"resource_id":{"type":"id"},"member_id":{"type":"id"},"task_id":{"type":"id"},"status":{"type":"string","max":100},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| reservationDetail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{}} |
| reservationCreate | 같은 Crew의 활동 중 구성원과 AVAILABLE 자원, 중복 없는 기간, 업무 연결 시 실제 참여자와 업무 시간 범위 일치 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| reservationReschedule | RESERVED 예약; 변경 기간에 예약·정비 충돌 없음 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| reservationCheckout | RESERVED 예약의 현재 시간 범위 안, 본인 또는 관리자, 다른 미반환 사용 없음 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| reservationReturn | IN_USE 예약, 본인 또는 관리자, GOOD/DAMAGED 반환 상태 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| reservationCancel | RESERVED 예약 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resourceStatus | 활성 예약/사용/정비 없음, RETIRED가 아닌 자원 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| evaluationList | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"member_id":{"type":"id"},"task_id":{"type":"id"},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| evaluationDetail | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"string","required":true}},"query":{},"headers":{}} |
| evaluationCreate | 관리 가능한 구성원의 COMPLETED 업무와 COMPLETED 참여 기록, 자기 평가 아님 | {"path":{},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| evaluationRevise | 해당 평가의 최신 version과 대상 구성원/완료 업무 관리 권한 | {"path":{"id":{"type":"string","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| evaluationPublish | DRAFT 또는 RETRACTED 평가와 최신 version | {"path":{"id":{"type":"string","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| evaluationRetract | PUBLISHED 평가와 최신 version | {"path":{"id":{"type":"string","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| membersHistory | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{"from":{"type":"date"},"to":{"type":"date"},"action":{"type":"string","max":100},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| tasksHistory | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{"from":{"type":"date"},"to":{"type":"date"},"action":{"type":"string","max":100},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| resourcesHistory | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{"id":{"type":"id","required":true}},"query":{"from":{"type":"date"},"to":{"type":"date"},"action":{"type":"string","max":100},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| activityFeed | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"from":{"type":"date"},"to":{"type":"date"},"action":{"type":"string","max":100},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| auditLog | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"from":{"type":"date"},"to":{"type":"date"},"action":{"type":"string","max":100},"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| pendingEvents | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"page":{"type":"id"},"size":{"type":"id"}},"headers":{}} |
| retryEvent | 전달되지 않은 outbox ID; 전달 완료 이벤트 제외 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| report-workload | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-task-status | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-member-status | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-resource-utilization | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-overdue-tasks | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-completion-rate | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"status":{"type":"string","max":100},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-evaluation-summary | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"crew_id":{"type":"id"},"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| report-maintenance-due | 해당 역할과 조회 범위의 실제 데이터 준비 | {"path":{},"query":{"from":{"type":"date"},"to":{"type":"date"}},"headers":{}} |
| task-checklists-check | task-checklists가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-checklists-uncheck | task-checklists가 CHECKED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-milestones-achieve | task-milestones가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-deliverables-submit | task-deliverables가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-deliverables-accept | task-deliverables가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-deliverables-reject | task-deliverables가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| task-risks-resolve | task-risks가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-inspections-pass | resource-inspections가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-inspections-fail | resource-inspections가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-maintenance-schedule | resource-maintenance가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-maintenance-begin | resource-maintenance가 SCHEDULED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-maintenance-finish | resource-maintenance가 IN_PROGRESS 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-incidents-acknowledge | resource-incidents가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| resource-incidents-resolve | resource-incidents가 ACKNOWLEDGED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-submit | leave-requests가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-approve | leave-requests가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-reject | leave-requests가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| leave-requests-withdraw | leave-requests가 SUBMITTED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-announcements-publish | crew-announcements가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-meetings-open | crew-meetings가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| crew-meetings-close | crew-meetings가 IN_PROGRESS 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| meeting-minutes-ratify | meeting-minutes가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| operating-guidelines-activate | operating-guidelines가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-plans-complete | onboarding-plans가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| onboarding-steps-complete | onboarding-steps가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-sessions-open | training-sessions가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-sessions-close | training-sessions가 IN_PROGRESS 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-enrollments-attend | training-enrollments가 DRAFT 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |
| training-enrollments-complete | training-enrollments가 ATTENDED 상태; 부모 관계가 활성이고 대상에 쓰기 권한 필요 | {"path":{"id":{"type":"id","required":true}},"query":{},"headers":{"X-CSRF-Token":{"type":"string","required":true}}} |

# 구현 및 검증 상태

## 생성한 파일

- 진입점: `app.js`, `server.js`, `package.json`, 실제 npm 해석 결과인 `package-lock.json`, `.env.example`, `.gitignore`, `README.md`.
- `src/config`, `database`, `permissions`, `validators`, `middleware`, `repositories`, `services`, `controllers`, `routes`, `jobs`, `docs`: 설정·스키마·초기화·선택형 시드·DB 세션·인증·권한·도메인·outbox·OpenAPI.
- `views`, `public`: 한국어 로그인/대시보드/목록/상세/등록/수정/업무 작업 폼/검색/통계/관리자 UI.
- `docs`: 요구사항, 설계, 권한, DB 사전/ERD, 전체 API 카탈로그/명세, 추적 CSV, 수동 절차, 기술 보고서 Markdown/인쇄용 HTML, 정적 점검 결과.
- `scripts`: DB/서버 접속 없는 API 정합성 감사, 문서 생성, JS/EJS/import 정적 확인.

## 코드 기준 구현 범위

세션 로그인/로그아웃·비밀번호·세션 관리, 계정 관리, 구성원 역할/상태/정식 소속, Crew 책임자/Underboss 범위, 업무와 참여·결과, 자원 예약/인수/반환/상태, 평가/평가 수정 이력, 활동/감사, 필터/페이지/집계, 운영 지원 기록을 연결했다. 지원 기록은 요구사항에 명시된 별도 기능이라는 주장이 아니라 FR을 지원하는 추가 설계다.

정식 소속은 단일 crew_id. 배정은 SQL 트랜잭션의 쓰기 게이트와 대상 행 잠금 후 시간 충돌을 검사한다. 종료 업무 수정은 차단하고 전용 결과 정정만 허용한다. SQL 상태 변경은 같은 트랜잭션에서 outbox를 생성한다. Mongo 기록 전달은 eventId로 멱등 처리한다. 평가는 단일 Mongo 문서에서 version과 revisions로 원자 수정한다. 웹 포트는 8593 고정이다.

## 정적 확인

- 등록 method+path **233개**, 고유 operationId **233개**.
- 상태 전이 세분화·본인/관리자 유사 기능 **14개를 보수적으로 계수 제외**.
- 나머지 **219개는 독립 기능 후보**이며, 실행/채점 인정을 뜻하지 않는다. 제외 목록은 `docs/api-audit.md`.
- `node --check`로 JS 문법, EJS compile로 템플릿 문법, 상대 import 해석, 등록 핸들러/export, OpenAPI/명세/추적 연결을 정적으로 확인한다. 최신 결과는 `docs/static-checks.json`, `docs/api-audit.md`.
- 의존성 설치는 `--ignore-scripts`로 수행했으며 설치 훅/자동 테스트를 실행하지 않았다. `npm ls --depth=0`으로 설치 결과와 직접 의존성을 확인했다.

## 미실행·미확인·제한

1. 서버 시작, MySQL/MongoDB 접속·스키마 생성·시드, 실제 HTTP, 브라우저 표시/상호작용, 기능/통합/부하 테스트는 **모두 미실행**이다. 실행 성공이나 전체 기능 정상 동작을 주장하지 않는다.
2. 원본 PDF/TXT가 없어 역할 개요의 원문 문구, 제출 경로·기한·형식은 **대조 미완료**다.
3. 219개 후보의 의미 독립성과 설계 확장 인정 여부는 원문/채점 기준 검토가 필요하다. 14개 의심 기능은 구현되어 있지만 유효 후보에서 제외했다.
4. SQL 쓰기 직렬화의 처리량, Mongo 평가 revisions 크기, 활동 조회의 접근 ID 집합 크기, 최대 1,000행 통계, 기존 다른 버전 DB의 스키마 변환 미지원은 알려진 제한이다.
5. 평가 생성의 SQL/Mongo 분산 원자성과 네트워크 재시도 멱등성은 보장하지 않는다. Mongo 평가 수정은 단일 문서 version으로 보호한다. 응답 실패 시 실제 평가를 조회해 반영 여부를 먼저 확인한다.
6. PDF 파일은 생성하지 않았다. 보고서 HTML을 브라우저 인쇄/PDF 저장할 수 있으며 자동 제출/배포는 하지 않았다.

## 사용자 다음 확인

README에 따라 두 DB 서비스를 준비하고 선택적으로 DEMO_SEED=true를 설정한 후 `node app.js`를 실행한다. `.local/initial-accounts.txt`는 최초 실제 실행 시 생성된다. `docs/manual-checks.md`의 예상 결과와 관측 결과를 구분하여 확인한다. 실패하면 실제 오류/관측 내용을 기준으로 보완한다.

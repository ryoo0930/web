# The Family · 조직 운영 시스템

학번 **202211205**. Express/EJS, MySQL, MongoDB를 사용하는 로컬 과제 프로젝트입니다. 원본 PDF와 참고 TXT는 작업 폴더에 없어 `../prompt.txt` 요약을 기준으로 구현했습니다. 기능 실행 검증은 사용자 지시에 따라 **미실행**입니다. 상세 현황은 `IMPLEMENTATION_STATUS.md`, 정적 API 점검 결과는 `docs/api-audit.md`에 있습니다.

## Windows 준비와 실행

1. Node.js 20 이상, MySQL 8 이상, MongoDB 6 이상을 로컬에 준비하고 DB 서비스를 실행합니다. Docker/WSL은 필요하지 않습니다.
2. PowerShell에서 프로젝트 폴더로 이동합니다.

```powershell
cd C:\Users\jeche\Desktop\WEB\midterm
npm.cmd install --ignore-scripts
# 선택: Copy-Item .env.example .env
node app.js
```

PowerShell 실행 정책 때문에 npm.ps1이 차단되면 `npm.cmd`를 사용합니다. 시스템 실행 정책을 변경할 필요가 없습니다. 의존성은 프로젝트 안에 설치합니다. 앱은 DB 서비스나 패키지를 설치하지 않습니다.

## Ubuntu 배치와 실행

PDF에 지정된 실제 제출 경로는 원문 미제공으로 확인하지 못했습니다. 원문 확인 후 그 경로 아래 `midterm` 폴더를 배치하세요. 현재 작업은 원격 서버 접속/배포/이메일 제출을 수행하지 않았습니다.

```sh
cd /사용자가_확인한_경로/midterm
npm install --ignore-scripts
# 선택: cp .env.example .env
node app.js
```

`node server.js`, `node app.js`, `npm start`는 각각 동일 앱을 **0.0.0.0:8593**에서 실행합니다. 세 명령을 동시에 실행하지 마세요. PORT 환경변수는 사용하지 않습니다. 의존성과 DB가 준비된 다음부터 `node app.js`만으로 반복 실행할 수 있습니다. 별도 시드/마이그레이션/빌드/작업자 명령은 필요하지 않습니다.

## 기본 DB 설정

| 설정 | 기본값 |
|---|---|
| MYSQL_HOST / MYSQL_PORT | 127.0.0.1 / 3306 |
| MYSQL_USER / MYSQL_PASSWORD | student / student |
| MYSQL_DB | mysql_202211205 |
| MONGO_URL | mongodb://127.0.0.1:27017 |
| MONGO_DB | mongo_202211205 |

`.env`는 선택입니다. DB 이름을 바꾸어도 `202211205`를 포함해야 합니다. MySQL 포트 3306은 prompt가 명시한 구현 기본값이며 TXT 원문 확인값이라는 주장이 아닙니다. DB 계정은 해당 DB에 테이블 생성·ALTER(외래키 추가)·인덱스·외래키·조회·삽입·수정·삭제 권한이 필요합니다. 데이터베이스가 없으면 생성 권한도 필요합니다. 기존 DB 연결을 먼저 시도하므로 기존 DB가 있는 경우 CREATE DATABASE 권한을 요구하지 않습니다. 자동 GRANT, DROP, TRUNCATE는 하지 않습니다.

## 최초 로그인과 예시 데이터

최초 실행 시 빈 프로젝트에 `admin` 계정을 만들고 강한 임시 비밀번호를 **`.local/initial-accounts.txt`**에 저장합니다. 파일은 공개 정적 폴더 밖이며 Git에서 제외됩니다. `INITIAL_PASSWORD`를 .env에 지정할 경우 12~128자를 사용하세요. 비밀번호/토큰은 로그에 출력하지 않습니다. 재시작해도 기존 계정 비밀번호를 바꾸지 않습니다.

예시 데이터가 필요하면 실행 전에 `.env`에 `DEMO_SEED=true`를 지정하세요. 최초 한 번 여섯 역할, 두 Crew, 두 Capo, 정상/정지/탈퇴 구성원, 충돌 확인용 업무 후보, 정상/사용/점검/불가 자원과 완료 활동 평가를 준비합니다. 예시 계정의 비밀번호도 같은 파일에 기록합니다. 시드는 서버 시작 시 수행되며 코딩 작업 중에는 실행하지 않았습니다.

예시 없이 시작할 경우 admin으로 구성원을 생성하고 역할 변경에서 Boss를 부여한 뒤 계정을 생성합니다. Boss 계정으로 Crew를 만들고 구성원 편입/책임자 지정/업무 운영을 진행합니다. Administrator는 업무 쓰기 권한을 갖지 않습니다.

## 접속과 사용

- 웹: http://localhost:8593
- Swagger: http://localhost:8593/api-docs
- OpenAPI: http://localhost:8593/openapi.json

일반 화면에서 로그인 후 목록의 등록·수정·상세·이력과 **업무 도구**를 사용합니다. 도구는 역할에 허용된 실제 API에 연결됩니다. 실제 대상 ID는 목록/생성 응답에서 확인하세요. Swagger의 예시 ID=1은 대체용 값이며 존재를 가정하지 않습니다.

Swagger는 같은 브라우저 세션을 공유합니다. 로그인 화면에서 로그인한 뒤 Swagger를 열면 변경 요청 직전에 스크립트가 최신 CSRF 토큰을 받아 전달합니다. 직접 호출하려면 `GET /api/v1/auth/csrf`의 쿠키와 토큰을 받아 로그인 요청의 `X-CSRF-Token`에 넣으세요. 로그인 후 세션이 재발급되므로 응답의 새 csrfToken과 쿠키로 이후 요청을 수행합니다. 인증 없음 401, 권한/범위/CSRF 거부 403, 상태 충돌 409가 예상됩니다.

업무/예약 시각은 시간대 포함 ISO 입력을 사용합니다. UI는 브라우저 현지 시간을 UTC로 변환합니다. 새 기록은 먼저 SQL에 저장되며 이력은 MongoDB 전달 후 보입니다. 관리자는 대기 기록 조회/재시도 작업에서 전달 상태를 확인합니다.

## 장애 안내

- **8593 충돌**: 앱은 종료합니다. Windows는 `Get-NetTCPConnection -LocalPort 8593`, Ubuntu는 `ss -ltnp`로 사용 프로세스를 사용자가 확인하세요. 기존 프로세스 강제 종료나 다른 포트 자동 전환은 하지 않습니다.
- **초기 DB 오류**: MySQL/MongoDB 서비스, .env, 계정 권한을 확인하세요. 앱은 민감한 접속 문자열이나 SQL을 응답/로그에 출력하지 않습니다.
- **실행 중 Mongo 장애**: SQL 변경의 outbox는 유지됩니다. Mongo 복구 후 내부 작업자가 재시도합니다. 미전달 이력은 지연될 수 있습니다.
- **세션 만료**: 다시 로그인하세요. 역할/소속/상태·비밀번호·차단 변경으로 세션이 무효화될 수 있습니다.
- `.local`은 계정 전달과 비밀키를 포함하므로 공개 저장소/웹 디렉터리에 올리지 마세요. Linux에서는 생성 파일 권한 600을 사용하며 Windows는 사용자 폴더 ACL을 따릅니다.

## 문서와 정적 확인

```sh
node scripts/build-docs.js
node scripts/audit-api.js
```

위 명령은 서버/DB 연결 없이 소스 메타데이터와 문서를 검사합니다. 기능 테스트가 아닙니다. 실제 확인 절차는 `docs/manual-checks.md`에 있으며 관측 결과는 모두 미실행으로 두었습니다.

- API 전체 목록/명세: `docs/api-catalog.json`, `docs/api-spec.md`
- 추적표: `docs/requirement-traceability.csv`
- DB/권한/설계: `docs/database-design.md`, `docs/permissions.md`, `docs/design-decisions.md`
- 기술 보고서: `docs/technical-report.md`, **`docs/technical-report.html`**

HTML 보고서를 브라우저로 열고 인쇄 → PDF로 저장하세요. 전체 API 명세와 추적표가 포함됩니다. 이 작업에서 PDF 파일을 생성하거나 제출하지 않았습니다. 원문 보고서/제출 형식과의 대조는 별도 필요합니다.

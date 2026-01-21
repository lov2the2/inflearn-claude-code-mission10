# Go + Next.js Full-stack Starter Kit

Go 백엔드(Clean Architecture)와 Next.js 16 프론트엔드로 구성된 프로덕션 레디 모노레포 스타터 킷입니다.

## 기능

- 🔐 JWT 인증 및 RBAC (Admin/User 역할)
- 🔄 Refresh Token 구현 및 자동 갱신
- 📊 CSV 가져오기/내보내기 (백엔드 + 프론트엔드 UI)
- 💾 데이터셋 관리 (CSV 업로드 및 동적 테이블 생성)
- 🔗 조인 쿼리 빌더 (다중 테이블 조인 지원)
- 📄 페이지네이션 지원
- 📚 Swagger API 문서
- 👥 Admin Panel UI (사용자 관리)
- 🚀 서버 관리 스크립트
- 🐳 Docker Compose 오케스트레이션
- 🔥 라이브 리로드 (Air + Next.js)

## 인증 흐름

**토큰 관리:**
- Access token (15분 만료) - API 인증용
- Refresh token (7일 만료) - 새 access token 발급용
- 401 응답 시 자동 토큰 갱신 (프론트엔드)

**토큰 갱신:**
```bash
POST /api/v1/auth/refresh
{
  "refresh_token": "your_refresh_token"
}
```

응답:
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "user": {...}
}
```

## 기술 스택

### Backend
- **언어**: Go 1.21+
- **프레임워크**: Gin
- **데이터베이스**: PostgreSQL
- **ORM**: GORM
- **인증**: JWT (golang-jwt/jwt)
- **검증**: go-playground/validator
- **CSV**: encoding/csv, gocsv
- **API 문서**: swaggo/swag
- **개발 도구**: Air (live reload)

### Frontend
- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **HTTP 클라이언트**: Axios
- **상태 관리**: React Query
- **폼**: react-hook-form + zod

### Infrastructure
- **데이터베이스**: PostgreSQL 16
- **컨테이너**: Docker Compose
- **빌드 도구**: Makefile

## 아키텍처

### Backend: Clean Architecture
```
Handler → Service → Repository → Model
```

### Frontend: App Router
```
app/
├── (auth)/          # 공개 라우트
├── (dashboard)/     # 보호된 라우트
└── api/             # Route handlers
```

## 프로젝트 구조

```
starter-kit-mission/
├── backend/
│   ├── cmd/api/                 # 애플리케이션 진입점
│   ├── internal/
│   │   ├── handler/             # HTTP 핸들러
│   │   ├── service/             # 비즈니스 로직
│   │   ├── repository/          # 데이터 액세스
│   │   ├── model/               # 도메인 모델
│   │   ├── middleware/          # HTTP 미들웨어
│   │   ├── dto/                 # Data transfer objects
│   │   └── util/                # 유틸리티
│   ├── pkg/database/            # DB 연결
│   ├── migrations/              # SQL 마이그레이션
│   └── docs/                    # Swagger 문서
├── frontend/
│   ├── app/                     # Next.js App Router
│   ├── components/              # React 컴포넌트
│   ├── lib/                     # 유틸리티 & API 클라이언트
│   ├── types/                   # TypeScript 타입
│   └── actions/                 # Server actions
├── docker-compose.yml
├── Makefile
└── README.md
```

## 빠른 시작

### 사전 요구사항
- Go 1.21+
- Node.js 18+
- Docker Desktop

### 설치

1. **저장소 클론**
```bash
git clone <repository-url>
cd starter-kit-mission
```

2. **(선택) 포트 변경이 필요한 경우**
```bash
cp .env.example .env
# .env에서 포트 수정 (DB_PORT, BACKEND_PORT, FRONTEND_PORT)
```

3. **의존성 설치**
```bash
make install
```

> **참고**: `make install`은 자동으로 다음을 수행합니다:
> - Root `.env`에서 `backend/.env`와 `frontend/.env.local` 생성
> - Swagger 문서 생성 (`swag init`)
> - Go 의존성 및 npm 패키지 설치

4. **개발 환경 시작**
```bash
# 방법 1: 한 번에 모든 서비스 시작 (권장)
make start

# 방법 2: 개별 터미널에서 실행
# Terminal 1: PostgreSQL 시작
make dev-db

# Terminal 2: 백엔드 시작
make dev-backend

# Terminal 3: 프론트엔드 시작
make dev-frontend
```

5. **애플리케이션 접속**

기본 포트 (`.env`에서 변경 가능):
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html
- Health Check: http://localhost:8080/health

**참고**: `make start` 실행 시 출력되는 "Services" 섹션에서 실제 사용 중인 포트를 확인할 수 있습니다.

## 환경 변수

### 프로젝트 설정 (`.env`)
프로젝트 루트의 `.env` 파일은 Docker 컨테이너 이름과 포트를 설정합니다:

```env
# 프로젝트 이름 (Docker 컨테이너 이름에 사용됨)
PROJECT_NAME=starter-kit

# 포트 설정 (다른 서비스와 충돌 시 변경)
DB_PORT=5432
BACKEND_PORT=8080
FRONTEND_PORT=3000

# 데이터베이스 설정
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=starter_kit
```

**참고**: `.env.example` 파일을 복사하여 시작할 수 있습니다:
```bash
cp .env.example .env
```

### Backend (`backend/.env`)
```env
PORT=8080
GIN_MODE=debug

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=starter_kit
DB_SSLMODE=disable

JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h

ALLOWED_ORIGINS=http://localhost:3000

# Admin Seed (초기 관리자 계정 자동 생성)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Administrator
```

**초기 관리자 계정 설정:**
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` 환경 변수를 설정하면 애플리케이션 시작 시 자동으로 관리자 계정이 생성됩니다
- 이미 존재하는 이메일인 경우 생성을 건너뜁니다 (중복 생성 방지)
- 환경 변수가 설정되지 않은 경우 자동 생성을 건너뜁니다
- 비밀번호는 애플리케이션의 비밀번호 요구사항을 충족해야 합니다

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
```

## 다중 인스턴스 실행

동일한 머신에서 여러 프로젝트 인스턴스를 동시에 실행할 수 있습니다:

### 설정 방법

1. **프로젝트 복사**
```bash
# 첫 번째 인스턴스
cd ~/projects/starter-kit-instance1

# 두 번째 인스턴스
cd ~/projects/starter-kit-instance2
```

2. **각 인스턴스의 Root `.env` 파일 수정**

**Instance 1** (`.env`):
```env
PROJECT_NAME=starter-kit-1
DB_PORT=5432
BACKEND_PORT=8080
FRONTEND_PORT=3000
DB_NAME=starter_kit_1
```

**Instance 2** (`.env`):
```env
PROJECT_NAME=starter-kit-2
DB_PORT=5433
BACKEND_PORT=8081
FRONTEND_PORT=3001
DB_NAME=starter_kit_2
```

> **참고**: `backend/.env`와 `frontend/.env.local`은 `make install` 시 root `.env`에서 자동 생성됩니다. 수동으로 수정할 필요가 없습니다.

3. **각 인스턴스 설치 및 실행**
```bash
# Instance 1
cd ~/projects/starter-kit-instance1
make install
make start

# Instance 2 (새 터미널)
cd ~/projects/starter-kit-instance2
make install
make start
```

### 접속 주소

**Instance 1** (기본 포트):
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger/index.html
- Health: http://localhost:8080/health

**Instance 2** (수정된 포트):
- Frontend: http://localhost:3001
- Backend: http://localhost:8081
- Swagger: http://localhost:8081/swagger/index.html
- Health: http://localhost:8081/health

**참고**: 각 인스턴스에서 `make start` 실행 시 실제 사용 중인 포트가 출력됩니다.

### 주의사항

- 각 인스턴스는 고유한 `PROJECT_NAME`을 가져야 합니다 (Docker 컨테이너 충돌 방지)
- 포트는 다른 서비스와 중복되지 않아야 합니다
- 각 인스턴스는 별도의 PostgreSQL 데이터베이스를 사용합니다
- Root `.env`만 수정하면 됩니다 (`backend/.env`, `frontend/.env.local`은 자동 생성)

## 사용 가능한 명령어

```bash
make help              # 모든 사용 가능한 명령어 표시
make install           # 모든 의존성 설치
make install-backend   # 백엔드 의존성 설치
make install-frontend  # 프론트엔드 의존성 설치
make dev-db           # PostgreSQL 시작
make dev-backend      # 백엔드 시작 (Air)
make dev-frontend     # 프론트엔드 시작 (Next.js)
make clean            # 컨테이너 및 빌드 아티팩트 정리
```

## 데이터베이스 백업 및 복원

### 백업 관리

프로젝트는 데이터베이스 백업 및 복원을 위한 완전한 시스템을 제공합니다.

**백업 생성:**
```bash
# 현재 데이터베이스 백업 생성
make backup-db
# 백업 파일: backups/YYYY-MM-DD_HHmmss.sql
```

**백업 목록 확인:**
```bash
# 사용 가능한 백업 파일 목록 표시
make list-backups
```

**데이터베이스 복원:**
```bash
# 최신 백업에서 복원
make restore-db

# 특정 백업 파일에서 복원
make restore-db FILE=backups/2026-01-13_120000.sql
```

### 자동 백업 설정

매일 자동으로 데이터베이스를 백업하도록 설정할 수 있습니다.

**자동 백업 활성화:**
```bash
# 매일 새벽 2시에 자동 백업 실행
make setup-auto-backup
```

**자동 백업 상태 확인:**
```bash
# 자동 백업이 활성화되어 있는지 확인
make auto-backup-status
```

**자동 백업 비활성화:**
```bash
# 자동 백업 스케줄 제거
make disable-auto-backup
```

### 백업 세부 사항

**백업 위치:**
- 모든 백업 파일은 `backups/` 디렉토리에 저장됩니다
- 백업 파일 형식: `YYYY-MM-DD_HHmmss.sql` (타임스탬프 기반)
- 백업 파일은 Git에서 자동으로 무시됩니다 (.gitignore)

**보관 정책:**
- 자동 백업 시 최근 5개의 백업 파일만 유지됩니다
- 오래된 백업은 자동으로 삭제됩니다
- 수동 백업은 보관 정책에 영향을 받지 않습니다

**백업 형식:**
- Plain SQL 형식으로 저장됩니다
- 모든 테이블, 데이터, 스키마가 포함됩니다
- `pg_dump`를 사용하여 생성됩니다

**복원 안전 기능:**
- 복원 전에 확인 메시지가 표시됩니다
- 복원 전 현재 데이터베이스를 자동으로 백업합니다
- 복원 중 오류 발생 시 이전 상태로 롤백할 수 있습니다

## 서버 관리

**모든 서비스 시작:**
```bash
make start          # 모든 서버 시작 (DB → Backend → Frontend)
make status         # 서버 상태 확인
make logs           # 최근 로그 보기
make stop           # 모든 서버 중지
```

**개별 제어:**
```bash
make start-db       # PostgreSQL만 시작
make start-backend  # 백엔드만 시작
make start-frontend # 프론트엔드만 시작
make stop-db        # PostgreSQL 중지
make stop-backend   # 백엔드 중지
make stop-frontend  # 프론트엔드 중지
```

**레거시 방식 (3개 터미널 필요):**
```bash
make dev-db         # Terminal 1
make dev-backend    # Terminal 2
make dev-frontend   # Terminal 3
```

## API 문서

Swagger UI를 통해 API 문서를 확인할 수 있습니다:
- **URL**: http://localhost:8080/swagger/index.html
- **문서 생성**: `cd backend && swag init -g cmd/api/main.go`

## 주요 기능 상세

### 1. 데이터셋 관리

CSV 파일을 업로드하여 동적으로 데이터베이스 테이블을 생성하고 관리할 수 있습니다.

**기능:**
- CSV 파일 업로드 및 자동 테이블 생성
- 데이터셋 목록 조회 (페이지네이션)
- 데이터셋 상세 정보 및 데이터 조회
- 데이터셋 삭제 (테이블 포함)

**API 엔드포인트:**
- `POST /api/v1/datasets/upload` - CSV 업로드 및 테이블 생성 (Admin)
- `GET /api/v1/datasets` - 데이터셋 목록 조회 (User)
- `GET /api/v1/datasets/{id}` - 데이터셋 상세 조회 (User)
- `GET /api/v1/datasets/{id}/data` - 데이터 조회 (User)
- `DELETE /api/v1/datasets/{id}` - 데이터셋 삭제 (Admin)

**프론트엔드:**
- 데이터셋 목록: `http://localhost:3000/datasets`
- 데이터셋 상세: `http://localhost:3000/datasets/{id}`
- 업로드 다이얼로그를 통한 CSV 파일 업로드 (Admin 전용)

### 2. 조인 쿼리 빌더

여러 데이터셋을 조인하여 복잡한 쿼리를 수행할 수 있는 인터랙티브 쿼리 빌더입니다.

**기능:**
- 다중 테이블 조인 (INNER, LEFT, RIGHT, FULL OUTER)
- 동적 조인 조건 설정
- 컬럼 선택 및 결과 미리보기
- 조인 결과 CSV 내보내기

**API 엔드포인트:**
- `POST /api/v1/datasets/query` - 조인 쿼리 실행 (User)
- `POST /api/v1/datasets/query/export` - 조인 결과 CSV 내보내기 (User)

**프론트엔드:**
- 조인 쿼리 빌더: `http://localhost:3000/datasets/join`
- 드래그 앤 드롭 방식의 직관적인 UI
- 실시간 쿼리 결과 미리보기

### 3. 관리자 기능

관리자는 전용 엔드포인트 및 UI를 통해 사용자를 관리할 수 있습니다:

**사용자 관리:**
- 페이지네이션으로 모든 사용자 조회: `GET /api/v1/admin/users?page=1&limit=10`
- 사용자 상세 정보 조회: `GET /api/v1/admin/users/{id}`
- 사용자 역할 업데이트: `PATCH /api/v1/admin/users/{id}/role`
- 사용자 삭제: `DELETE /api/v1/admin/users/{id}`

**대량 작업:**
- CSV로 사용자 내보내기: `GET /api/v1/admin/users/export`
- CSV에서 사용자 가져오기: `POST /api/v1/admin/users/import`

**프론트엔드 Admin Panel:**
- 접속 주소: `http://localhost:3000/admin/users`
- 기능: 사용자 목록, 역할 관리, 삭제, CSV 가져오기/내보내기
- 보호된 라우트 (관리자 역할 필요)

## 개발 워크플로우

### 백엔드 개발
```bash
cd backend
air  # 파일 변경 시 자동 리로드
```

### 프론트엔드 개발
```bash
cd frontend
npm run dev  # Hot reload 활성화
```

### 데이터베이스 마이그레이션
```bash
# 새 마이그레이션 생성
make migrate-create
# 프롬프트에서 마이그레이션 이름 입력 (예: "add_users_table")

# 모든 대기 중인 마이그레이션 실행
make migrate-up

# 마지막 마이그레이션 롤백
make migrate-down

# 현재 마이그레이션 버전 확인
make migrate-version

# 특정 버전 강제 적용 (마이그레이션 실패 시)
make migrate-force
# 프롬프트에서 버전 번호 입력
```

## 프로젝트 상태

### ✅ 구현됨
- 개발 환경 설정
- 프로젝트 구조 (Clean Architecture)
- Docker Compose 구성
- Makefile 자동화
- Health check 엔드포인트
- 사용자 인증 (JWT)
- Refresh token 메커니즘 및 자동 갱신
- 역할 기반 접근 제어 (RBAC)
- 관리자 사용자 관리 엔드포인트
- Admin Panel UI (사용자 목록, 역할 관리, 삭제)
- 페이지네이션 지원
- CSV 가져오기/내보내기 (백엔드 + 프론트엔드)
- 데이터셋 관리 (CSV 업로드, 동적 테이블 생성, CRUD)
- 조인 쿼리 빌더 (다중 테이블 조인, CSV 내보내기)
- Swagger/OpenAPI 문서
- 프론트엔드 인증 플로우
- 데이터베이스 모델 및 마이그레이션
- 서버 관리 스크립트 (start/stop/status/logs)

### 📋 계획됨
- 포괄적인 단위 테스트
- 통합 테스트
- E2E 테스트
- 배포 문서

## 트러블슈팅

### 일반적인 설치 문제

#### Docker 컨테이너 시작 실패

**문제**: `make dev-db` 또는 `make start` 실행 시 PostgreSQL 컨테이너가 시작되지 않습니다.

**원인**:
- 포트 충돌 (다른 프로세스가 5432 포트 사용 중)
- Docker Desktop이 실행되지 않음
- 이전 컨테이너가 남아있음

**해결 방법**:
```bash
# Docker Desktop 실행 확인
docker --version

# 실행 중인 컨테이너 확인
docker ps -a

# 충돌하는 컨테이너 제거
docker rm -f starter-kit-db

# 포트 사용 확인 (macOS/Linux)
lsof -i :5432

# 포트 변경이 필요한 경우
# .env 파일에서 DB_PORT 변경 후 재시작
vi .env
make clean
make install
make start
```

#### npm install 실패

**문제**: `make install-frontend` 또는 `npm install` 실행 시 에러 발생

**원인**:
- Node.js 버전 불일치
- npm 캐시 손상
- 네트워크 연결 문제

**해결 방법**:
```bash
# Node.js 버전 확인 (18+ 필요)
node --version

# npm 캐시 정리
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force

# 재설치
npm install

# 권한 문제인 경우 (Linux/macOS)
sudo chown -R $USER:$USER ~/.npm
```

#### go mod download 실패

**문제**: `make install-backend` 또는 `go mod download` 실행 시 에러 발생

**원인**:
- Go 버전 불일치
- GOPROXY 설정 문제
- 네트워크 연결 문제

**해결 방법**:
```bash
# Go 버전 확인 (1.21+ 필요)
go version

# Go 모듈 캐시 정리
cd backend
go clean -modcache

# 재다운로드
go mod download
go mod tidy

# 프록시 설정 (중국/제한된 네트워크 환경)
go env -w GOPROXY=https://goproxy.io,direct
```

### 데이터베이스 연결 문제

#### PostgreSQL 연결 거부

**문제**: 백엔드 시작 시 "connection refused" 에러 발생

**원인**:
- PostgreSQL 컨테이너가 시작되지 않음
- 포트 불일치
- 데이터베이스가 준비되지 않음

**해결 방법**:
```bash
# 컨테이너 상태 확인
docker ps | grep postgres

# 컨테이너가 없는 경우 시작
make dev-db

# 컨테이너 로그 확인
docker logs starter-kit-db

# 데이터베이스 연결 테스트
docker exec -it starter-kit-db psql -U postgres -d starter_kit

# 환경 변수 확인
cd backend
cat .env | grep DB_

# 포트 불일치 시 수정
# Root .env에서 DB_PORT 확인 후 backend/.env와 일치시킴
vi ../.env
vi .env
```

#### 마이그레이션 실패

**문제**: `make migrate-up` 실행 시 에러 발생

**원인**:
- 데이터베이스 연결 문제
- 마이그레이션 파일 손상
- 이전 마이그레이션 실패로 인한 상태 불일치

**해결 방법**:
```bash
# 현재 마이그레이션 버전 확인
make migrate-version

# 데이터베이스 연결 확인
docker exec -it starter-kit-db psql -U postgres -d starter_kit -c "\dt"

# 마이그레이션 강제 버전 설정 (주의: 데이터 손실 가능)
make migrate-force
# 프롬프트에서 원하는 버전 입력 (예: 4)

# 완전히 새로 시작하는 경우
make clean
docker volume rm starter-kit-db-data
make install
make start
```

### 인증 관련 문제

#### JWT 토큰 만료

**문제**: API 요청 시 401 Unauthorized 에러 발생

**원인**:
- Access token 만료 (15분)
- Refresh token 만료 (7일)
- 토큰 저장소 손상

**해결 방법**:
```bash
# 브라우저 개발자 도구에서 확인
# Application → Local Storage → 토큰 확인

# 자동 갱신이 작동하지 않는 경우
# 1. 로그아웃 후 재로그인
# 2. 브라우저 캐시 및 로컬 스토리지 정리

# 수동 토큰 갱신 테스트
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'

# 모든 토큰이 만료된 경우
# → 재로그인 필요
```

#### 로그인 실패 / CORS 에러

**문제**: 올바른 자격 증명으로도 로그인이 되지 않거나, 브라우저 콘솔에 CORS 에러가 표시됩니다.

**원인**:
- CORS 설정 문제 (프론트엔드 포트와 불일치)
- 백엔드 서버가 시작되지 않음
- 데이터베이스에 사용자가 없음

**해결 방법**:
```bash
# 백엔드 상태 확인
make status

# Health check 확인
curl http://localhost:8080/health

# CORS 설정 확인 (backend/.env)
cat backend/.env | grep ALLOWED_ORIGINS

# CORS 설정이 프론트엔드 포트와 다른 경우
# Root .env의 FRONTEND_PORT와 backend/.env의 ALLOWED_ORIGINS가 일치해야 함
cat .env | grep FRONTEND_PORT
cat backend/.env | grep ALLOWED_ORIGINS

# 포트가 다른 경우 수정
vi backend/.env
# ALLOWED_ORIGINS=http://localhost:3000 (FRONTEND_PORT와 동일하게)

# 사용자 생성 테스트
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# 데이터베이스에서 사용자 확인
docker exec -it starter-kit-db psql -U postgres -d starter_kit \
  -c "SELECT id, username, email, role FROM users;"
```

### 개발 환경 문제

#### Air 핫 리로드 안됨

**문제**: 백엔드 코드 변경 시 자동으로 재시작되지 않습니다.

**원인**:
- Air가 설치되지 않음
- `.air.toml` 설정 문제
- 파일 권한 문제

**해결 방법**:
```bash
# Air 설치 확인
which air

# Air 재설치
go install github.com/air-verse/air@latest

# .air.toml 설정 확인
cd backend
cat .air.toml

# 수동으로 Air 실행
cd backend
air

# 파일 권한 확인 (Linux/macOS)
ls -la backend/tmp/

# Air 프로세스 종료 후 재시작
pkill -f air
make dev-backend
```

#### Next.js 빌드 에러

**문제**: 프론트엔드 시작 또는 빌드 시 에러 발생

**원인**:
- TypeScript 타입 에러
- 의존성 버전 충돌
- .env.local 파일 누락

**해결 방법**:
```bash
# TypeScript 타입 체크
cd frontend
npm run type-check

# 빌드 에러 확인
npm run build

# 환경 변수 확인
cat .env.local

# .env.local이 없는 경우 생성
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
echo "API_URL=http://localhost:8080" >> .env.local

# 의존성 재설치
rm -rf node_modules .next
npm install

# 캐시 정리 후 재시작
rm -rf .next
npm run dev
```

#### 포트 충돌

**문제**: "Port already in use" 에러 발생

**원인**:
- 이전 프로세스가 포트를 사용 중
- 다른 애플리케이션과 포트 충돌

**해결 방법**:
```bash
# 포트 사용 프로세스 확인 (macOS/Linux)
lsof -i :8080  # 백엔드 포트
lsof -i :3000  # 프론트엔드 포트
lsof -i :5432  # PostgreSQL 포트

# 프로세스 종료
kill -9 <PID>

# 또는 make stop 사용
make stop

# 포트 변경이 필요한 경우
# 1. Root .env 수정
vi .env
# 2. 재설치
make clean
make install
make start
```

### 일반적인 해결 방법

#### 완전히 새로 시작

모든 것을 초기화하고 다시 시작하려면:

```bash
# 1. 모든 서비스 중지
make stop

# 2. Docker 컨테이너 및 볼륨 제거
make clean
docker volume rm starter-kit-db-data

# 3. 빌드 아티팩트 제거
rm -rf backend/tmp backend/docs
rm -rf frontend/.next frontend/node_modules

# 4. 환경 변수 재설정
cp .env.example .env
vi .env  # 필요한 경우 포트 수정

# 5. 재설치 및 시작
make install
make start
```

#### 로그 확인

문제 진단을 위한 로그 확인:

```bash
# 최근 로그 확인
make logs

# 특정 서비스 로그 확인
tail -f logs/backend.log
tail -f logs/frontend.log

# Docker 컨테이너 로그
docker logs starter-kit-db
docker logs -f starter-kit-db  # 실시간 로그

# 전체 로그 확인
cat logs/backend.log
cat logs/frontend.log
```

#### 상태 확인

시스템 상태를 빠르게 확인:

```bash
# 모든 서비스 상태
make status

# Health check
curl http://localhost:8080/health

# 데이터베이스 연결 테스트
docker exec -it starter-kit-db psql -U postgres -d starter_kit -c "SELECT 1;"

# 프론트엔드 접속 테스트
curl http://localhost:3000
```

### 추가 도움말

위 방법으로 해결되지 않는 경우:

1. **GitHub Issues 확인**: 유사한 문제가 보고되었는지 확인
2. **로그 분석**: `logs/` 디렉토리의 전체 로그 확인
3. **환경 검증**:
   - Go 버전: `go version` (1.21+)
   - Node.js 버전: `node --version` (18+)
   - Docker 버전: `docker --version`
4. **문서 참고**:
   - `CLAUDE.md`: 개발자 컨텍스트
   - `backend/README.md`: 백엔드 상세 문서
   - `frontend/README.md`: 프론트엔드 상세 문서

---

## 기여하기

이것은 스타터 킷 템플릿입니다. 자유롭게:
- 프로젝트 요구사항에 맞게 커스터마이징
- 새 기능 추가
- 기존 구현 개선
- 피드백 공유

## 라이선스

MIT License - 모든 프로젝트에 자유롭게 사용 가능

---

**참고**: 이것은 스타터 킷이며, 완전한 애플리케이션이 아닙니다. 자신만의 프로젝트를 구축하기 위한 기반으로 사용하세요.

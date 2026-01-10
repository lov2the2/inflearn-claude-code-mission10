# Go + Next.js Full-stack Starter Kit

Go 백엔드(Clean Architecture)와 Next.js 16 프론트엔드로 구성된 프로덕션 레디 모노레포 스타터 킷입니다.

## 기능

- 🔐 JWT 인증 및 RBAC (Admin/User 역할)
- 🔄 Refresh Token 구현 및 자동 갱신
- 📊 CSV 가져오기/내보내기 (백엔드 + 프론트엔드 UI)
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
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html
- Health Check: http://localhost:8080/health

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
```

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

**Instance 1**:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger/index.html

**Instance 2**:
- Frontend: http://localhost:3001
- Backend: http://localhost:8081
- Swagger: http://localhost:8081/swagger/index.html

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

## 관리자 기능

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
- Swagger/OpenAPI 문서
- 프론트엔드 인증 플로우
- 데이터베이스 모델 및 마이그레이션
- 서버 관리 스크립트 (start/stop/status/logs)

### 📋 계획됨
- 포괄적인 단위 테스트
- 통합 테스트
- E2E 테스트
- 배포 문서

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

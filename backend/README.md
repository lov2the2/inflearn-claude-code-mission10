# Backend - Go + Gin API 서버

Go, Gin 프레임워크, PostgreSQL로 구축된 RESTful API 서버입니다.

## 아키텍처

이 백엔드는 **Clean Architecture** 원칙을 따르며 명확한 관심사 분리를 적용합니다:

```
backend/
├── cmd/api/           # 애플리케이션 진입점
│   └── main.go        # 서버 초기화
├── internal/
│   ├── handler/       # HTTP 핸들러 (컨트롤러)
│   ├── service/       # 비즈니스 로직
│   ├── repository/    # 데이터 접근 계층
│   ├── model/         # 도메인 엔티티
│   ├── dto/           # 데이터 전송 객체
│   ├── middleware/    # HTTP 미들웨어 (auth, cors 등)
│   └── util/          # 유틸리티 (jwt, password 등)
├── migrations/        # 데이터베이스 마이그레이션
├── docs/              # Swagger/OpenAPI 스펙
└── .air.toml          # Live reload 설정
```

## 기술 스택

- **Framework**: Gin HTTP Framework
- **Database**: PostgreSQL 16 with GORM
- **Authentication**: JWT (golang-jwt/jwt)
- **Documentation**: Swagger/OpenAPI (swaggo)
- **Live Reload**: Air
- **Password Hashing**: bcrypt

## 빠른 시작

### 사전 요구사항

- Go 1.21+
- PostgreSQL 16
- Air (live reload용): `go install github.com/air-verse/air@latest`

### 설치

```bash
# Install dependencies
cd backend
go mod download

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
make migrate-up

# Start server
air  # OR: go run cmd/api/main.go
```

서버는 `http://localhost:8080`에서 실행됩니다.

## 환경 변수

```env
PORT=8080                          # Server port
GIN_MODE=debug                     # debug | release
DB_HOST=localhost                  # PostgreSQL host
DB_PORT=5432                       # PostgreSQL port
DB_USER=postgres                   # Database user
DB_PASSWORD=postgres               # Database password
DB_NAME=starter_kit                # Database name
DB_SSLMODE=disable                 # SSL mode
JWT_SECRET=your-secret-key         # JWT signing key
JWT_ACCESS_EXPIRY=15m              # Access token expiry
JWT_REFRESH_EXPIRY=168h            # Refresh token expiry (7 days)
ALLOWED_ORIGINS=http://localhost:3000  # CORS allowed origins
```

## API 엔드포인트

### 인증

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) | Yes |

### 사용자 (인증 필요)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get current user's profile |
| GET | `/api/v1/users/activity` | Get user activity log with pagination |
| GET | `/api/v1/users/stats` | Get user statistics/KPIs |

**예제 - 프로필 조회:**
```bash
curl -X GET http://localhost:8080/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**예제 - 활동 로그 조회:**
```bash
curl -X GET "http://localhost:8080/api/v1/users/activity?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**예제 - 통계 조회:**
```bash
curl -X GET http://localhost:8080/api/v1/users/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 관리자 (Admin 권한 필요)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List users with pagination |
| GET | `/api/v1/admin/users/{id}` | Get user details |
| PATCH | `/api/v1/admin/users/{id}/role` | Update user role |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/users/export` | Export users to CSV |
| POST | `/api/v1/admin/users/import` | Import users from CSV |

### 헬스체크

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |

### 문서

- Swagger UI: `http://localhost:8080/swagger/index.html`
- OpenAPI Spec: `/backend/docs/swagger.yaml`

## 데이터베이스

### 마이그레이션

마이그레이션은 `/backend/migrations/`에 저장되며 `golang-migrate`로 관리됩니다.

**새 마이그레이션 생성:**
```bash
make migrate-create  # Enter migration name when prompted
```

**마이그레이션 적용:**
```bash
make migrate-up      # Apply all pending migrations
```

**마이그레이션 롤백:**
```bash
make migrate-down    # Rollback last migration
```

**마이그레이션 버전 확인:**
```bash
make migrate-version
```

### 스키마

**Users 테이블:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Refresh Tokens 테이블:**
```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 인증 흐름

1. **회원가입/로그인** → access token + refresh token 반환
2. **Access token** → API 요청에 사용 (15분 만료)
3. **Refresh token** → 새 access token 발급에 사용 (7일 만료)
4. **로그아웃** → refresh token 폐기

**토큰 갱신:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "your_refresh_token"}'
```

## 역할 기반 접근 제어 (RBAC)

두 가지 역할을 지원합니다:
- **user** - 기본 역할, 기본 접근 권한
- **admin** - 사용자 관리를 포함한 전체 접근 권한

Admin 전용 엔드포인트는 `middleware.RequireAdmin()`으로 보호됩니다.

## CSV Import/Export

**내보내기 형식:**
```csv
id,email,name,role,created_at,updated_at
1,user@example.com,John Doe,user,2024-01-04T10:00:00Z,2024-01-04T10:00:00Z
```

**가져오기 형식:**
```csv
email,name,role
newuser@example.com,New User,user
admin@example.com,Admin User,admin
```

**가져오기 동작:**
- 이메일 기준 Upsert (생성 또는 업데이트)
- 신규 사용자는 자동 생성된 비밀번호 부여 (응답에 포함)
- 검증: email (필수, 유효성), name (필수), role (admin|user)

## 개발

### Live Reload

Air가 파일 변경을 감지하고 자동으로 재빌드합니다:

```bash
cd backend
air
```

설정: `.air.toml`

### Swagger 문서 생성

API 주석 수정 후:

```bash
cd backend
swag init -g cmd/api/main.go -o docs
```

## 테스트

```bash
cd backend
go test ./...
```

## 프로덕션 빌드

```bash
cd backend
go build -o bin/api cmd/api/main.go
./bin/api
```

## 문제 해결

**데이터베이스 연결 실패:**
- PostgreSQL 실행 확인: `docker ps | grep postgres`
- .env 데이터베이스 자격증명 확인
- 연결 테스트: `psql -h localhost -U postgres -d starter_kit`

**포트가 이미 사용 중:**
- .env에서 `PORT` 변경
- 8080 포트의 프로세스 종료: `lsof -ti:8080 | xargs kill`

**Swagger가 업데이트되지 않음:**
- 문서 재생성: `swag init -g cmd/api/main.go -o docs`
- 서버 재시작

**마이그레이션 실패:**
- 버전 확인: `make migrate-version`
- 버전 강제 지정: `make migrate-force` (버전 번호 입력)

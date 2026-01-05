# Backend - Go + Gin API Server

RESTful API server built with Go, Gin framework, and PostgreSQL.

## Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns:

```
backend/
├── cmd/api/           # Application entry point
│   └── main.go        # Server initialization
├── internal/
│   ├── handler/       # HTTP handlers (controllers)
│   ├── service/       # Business logic
│   ├── repository/    # Data access layer
│   ├── model/         # Domain entities
│   ├── dto/           # Data transfer objects
│   ├── middleware/    # HTTP middleware (auth, cors, etc.)
│   └── util/          # Utilities (jwt, password, etc.)
├── migrations/        # Database migrations
├── docs/              # Swagger/OpenAPI specs
└── .air.toml          # Live reload configuration
```

## Tech Stack

- **Framework**: Gin HTTP Framework
- **Database**: PostgreSQL 16 with GORM
- **Authentication**: JWT (golang-jwt/jwt)
- **Documentation**: Swagger/OpenAPI (swaggo)
- **Live Reload**: Air
- **Password Hashing**: bcrypt

## Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 16
- Air (for live reload): `go install github.com/air-verse/air@latest`

### Installation

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

Server runs on `http://localhost:8080`

## Environment Variables

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

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) | Yes |

### Users (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get current user's profile |
| GET | `/api/v1/users/activity` | Get user activity log with pagination |
| GET | `/api/v1/users/stats` | Get user statistics/KPIs |

**Example - Get Profile:**
```bash
curl -X GET http://localhost:8080/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example - Get Activity:**
```bash
curl -X GET "http://localhost:8080/api/v1/users/activity?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example - Get Stats:**
```bash
curl -X GET http://localhost:8080/api/v1/users/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Admin (Requires Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List users with pagination |
| GET | `/api/v1/admin/users/{id}` | Get user details |
| PATCH | `/api/v1/admin/users/{id}/role` | Update user role |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/users/export` | Export users to CSV |
| POST | `/api/v1/admin/users/import` | Import users from CSV |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |

### Documentation

- Swagger UI: `http://localhost:8080/swagger/index.html`
- OpenAPI Spec: `/backend/docs/swagger.yaml`

## Database

### Migrations

Migrations are stored in `/backend/migrations/` and managed via `golang-migrate`.

**Create new migration:**
```bash
make migrate-create  # Enter migration name when prompted
```

**Apply migrations:**
```bash
make migrate-up      # Apply all pending migrations
```

**Rollback migration:**
```bash
make migrate-down    # Rollback last migration
```

**Check migration version:**
```bash
make migrate-version
```

### Schema

**Users Table:**
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

**Refresh Tokens Table:**
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

## Authentication Flow

1. **Register/Login** → Returns access token + refresh token
2. **Access token** → Used for API requests (15 min expiry)
3. **Refresh token** → Used to get new access token (7 day expiry)
4. **Logout** → Revokes refresh token

**Token Refresh:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "your_refresh_token"}'
```

## Role-Based Access Control

Two roles supported:
- **user** - Default role, basic access
- **admin** - Full access including user management

Admin-only endpoints are protected by `middleware.RequireAdmin()`.

## CSV Import/Export

**Export Format:**
```csv
id,email,name,role,created_at,updated_at
1,user@example.com,John Doe,user,2024-01-04T10:00:00Z,2024-01-04T10:00:00Z
```

**Import Format:**
```csv
email,name,role
newuser@example.com,New User,user
admin@example.com,Admin User,admin
```

**Import Behavior:**
- Upsert by email (create or update)
- New users get auto-generated password (returned in response)
- Validation: email (required, valid), name (required), role (admin|user)

## Development

### Live Reload

Air watches for file changes and automatically rebuilds:

```bash
cd backend
air
```

Configuration: `.air.toml`

### Generate Swagger Docs

After modifying API annotations:

```bash
cd backend
swag init -g cmd/api/main.go -o docs
```

## Testing

```bash
cd backend
go test ./...
```

## Build for Production

```bash
cd backend
go build -o bin/api cmd/api/main.go
./bin/api
```

## Troubleshooting

**Database connection failed:**
- Check PostgreSQL is running: `docker ps | grep postgres`
- Verify .env database credentials
- Test connection: `psql -h localhost -U postgres -d starter_kit`

**Port already in use:**
- Change `PORT` in .env
- Kill process on port 8080: `lsof -ti:8080 | xargs kill`

**Swagger not updating:**
- Regenerate docs: `swag init -g cmd/api/main.go -o docs`
- Restart server

**Migration failed:**
- Check version: `make migrate-version`
- Force version: `make migrate-force` (enter version number)

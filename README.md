# Go + Next.js Full-stack Starter Kit

A production-ready monorepo starter kit featuring Go backend with Clean Architecture and Next.js 15 frontend.

## Features

- 🔐 JWT Authentication with RBAC (Admin/User roles)
- 🔄 Refresh Token Implementation with Auto-Refresh
- 📊 CSV Import/Export (Backend + Frontend UI)
- 📄 Pagination Support
- 📚 Swagger API Documentation
- 👥 Admin Panel UI (User Management)
- 🚀 Server Management Scripts
- 🐳 Docker Compose Orchestration
- 🔥 Live Reload (Air + Next.js)

## Authentication Flow

**Token Management:**
- Access tokens (15 minutes expiry) for API authentication
- Refresh tokens (7 days expiry) for obtaining new access tokens
- Automatic token refresh on 401 responses (frontend)

**Token Refresh:**
```bash
POST /api/v1/auth/refresh
{
  "refresh_token": "your_refresh_token"
}
```

Response:
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "user": {...}
}
```

## Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin
- **Database**: PostgreSQL
- **ORM**: GORM
- **Auth**: JWT (golang-jwt/jwt)
- **Validation**: go-playground/validator
- **CSV**: encoding/csv, gocsv
- **API Docs**: swaggo/swag
- **Dev Tools**: Air (live reload)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **State Management**: React Query
- **Forms**: react-hook-form + zod

### Infrastructure
- **Database**: PostgreSQL 16
- **Container**: Docker Compose
- **Build Tool**: Makefile

## Architecture

### Backend: Clean Architecture
```
Handler → Service → Repository → Model
```

### Frontend: App Router
```
app/
├── (auth)/          # Public routes
├── (dashboard)/     # Protected routes
└── api/             # Route handlers
```

## Project Structure

```
starter-kit-mission/
├── backend/
│   ├── cmd/api/                 # Application entry point
│   ├── internal/
│   │   ├── handler/             # HTTP handlers
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Data access
│   │   ├── model/               # Domain models
│   │   ├── middleware/          # HTTP middleware
│   │   ├── dto/                 # Data transfer objects
│   │   └── util/                # Utilities
│   ├── pkg/database/            # DB connection
│   ├── migrations/              # SQL migrations
│   └── docs/                    # Swagger docs
├── frontend/
│   ├── app/                     # Next.js App Router
│   ├── components/              # React components
│   ├── lib/                     # Utilities & API client
│   ├── types/                   # TypeScript types
│   └── actions/                 # Server actions
├── docker-compose.yml
├── Makefile
└── README.md
```

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker Desktop

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd starter-kit-mission
```

2. **Install dependencies**
```bash
make install
```

3. **Start development environment**
```bash
# Terminal 1: Start PostgreSQL
make dev-db

# Terminal 2: Start backend
make dev-backend

# Terminal 3: Start frontend
make dev-frontend
```

4. **Access applications**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html
- Health Check: http://localhost:8080/health

## Environment Variables

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

## Available Commands

```bash
make help              # Show all available commands
make install           # Install all dependencies
make install-backend   # Install backend dependencies
make install-frontend  # Install frontend dependencies
make dev-db           # Start PostgreSQL
make dev-backend      # Start backend (Air)
make dev-frontend     # Start frontend (Next.js)
make clean            # Clean up containers and build artifacts
```

## Server Management

**Start All Services:**
```bash
make start          # Start all servers (DB → Backend → Frontend)
make status         # Check server status
make logs           # View recent logs
make stop           # Stop all servers
```

**Individual Control:**
```bash
make start-db       # Start PostgreSQL only
make start-backend  # Start backend only
make start-frontend # Start frontend only
make stop-db        # Stop PostgreSQL
make stop-backend   # Stop backend
make stop-frontend  # Stop frontend
```

**Legacy (requires 3 terminals):**
```bash
make dev-db         # Terminal 1
make dev-backend    # Terminal 2
make dev-frontend   # Terminal 3
```

## API Documentation

API documentation is available via Swagger UI:
- **URL**: http://localhost:8080/swagger/index.html
- **Generate docs**: `cd backend && swag init -g cmd/api/main.go`

## Admin Features

Admins can manage users through dedicated endpoints and UI:

**User Management:**
- List all users with pagination: `GET /api/v1/admin/users?page=1&limit=10`
- Get user details: `GET /api/v1/admin/users/{id}`
- Update user role: `PATCH /api/v1/admin/users/{id}/role`
- Delete user: `DELETE /api/v1/admin/users/{id}`

**Bulk Operations:**
- Export users to CSV: `GET /api/v1/admin/users/export`
- Import users from CSV: `POST /api/v1/admin/users/import`

**Frontend Admin Panel:**
- Access at: `http://localhost:3000/admin/users`
- Features: user list, role management, delete, CSV import/export
- Protected route (admin role required)

## Development Workflow

### Backend Development
```bash
cd backend
air  # Auto-reload on file changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Database Migrations
```bash
# Create new migration
make migrate-create
# Enter migration name when prompted (e.g., "add_users_table")

# Run all pending migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check current migration version
make migrate-version

# Force specific version (if migration fails)
make migrate-force
# Enter version number when prompted
```

## Project Status

### ✅ Implemented
- Development environment setup
- Project structure (Clean Architecture)
- Docker Compose configuration
- Makefile automation
- Health check endpoints
- User authentication (JWT)
- Refresh token mechanism with auto-refresh
- Role-based access control (RBAC)
- Admin user management endpoints
- Admin Panel UI (user list, role management, delete)
- Pagination support
- CSV import/export (backend + frontend)
- Swagger/OpenAPI documentation
- Frontend authentication flow
- Database models and migrations
- Server management scripts (start/stop/status/logs)

### 📋 Planned
- Comprehensive unit tests
- Integration tests
- E2E tests
- Deployment documentation

## Contributing

This is a starter kit template. Feel free to:
- Customize for your project needs
- Add new features
- Improve existing implementations
- Share feedback

## License

MIT License - Feel free to use for any project

---

**Note**: This is a starter kit, not a complete application. Use it as a foundation to build your own projects.

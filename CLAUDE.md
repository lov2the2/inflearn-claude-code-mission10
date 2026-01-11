# Developer Context - Go + Next.js Starter Kit

> **Project**: Full-stack Starter Kit with Clean Architecture
> **Version**: 1.2.0
> **Last Updated**: 2026-01-11

---

## Quick Navigation

- [Overview](#overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Tech Stack](#tech-stack)
- [Core Commands](#core-commands)
- [Authentication](#authentication)
- [Key Files](#key-files)
- [Development Guidelines](#development-guidelines)

---

## Overview

Production-ready full-stack starter kit combining:
- **Go backend** with Clean Architecture (Gin, PostgreSQL, JWT)
- **Next.js 16 frontend** with App Router (TypeScript, Tailwind, shadcn/ui)
- **Complete authentication** with RBAC and automatic token refresh

**Key Features**:
- JWT authentication with 15-minute access tokens and 7-day refresh tokens
- Role-based access control (Admin/User roles)
- Dataset management with CSV upload and dynamic table creation
- Join query builder with multi-table support
- CSV import/export with pagination
- Docker Compose orchestration
- Swagger API documentation

---

## Architecture

### Backend: Clean Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Handler Layer                      │
│  (HTTP Controllers - gin.Context handling)               │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                       Service Layer                       │
│  (Business Logic - domain operations)                    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                     Repository Layer                      │
│  (Data Access - GORM database operations)                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                      Database (PostgreSQL)                │
└───────────────────────────────────────────────────────────┘

Middleware: Auth (JWT validation) → RBAC (role check) → Handler
```

### Frontend: Next.js App Router

```
app/
├── (auth)/         # Public routes (login, register)
├── (dashboard)/    # Protected routes (profile, admin panel)
└── api/            # API route handlers

Flow: Page → Server Action → API Client → Backend
```

---

## Directory Structure

### Backend (`backend/`)

```
backend/
├── cmd/
│   └── api/
│       └── main.go                    # Application entry point
├── internal/
│   ├── handler/                       # HTTP handlers
│   │   ├── auth_handler.go           # Login, register, refresh, session management
│   │   ├── user_handler.go           # User CRUD operations
│   │   ├── admin_handler.go          # Admin-specific operations
│   │   ├── csv_handler.go            # CSV import/export
│   │   ├── dataset_handler.go        # Dataset CRUD and join query operations
│   │   ├── health_handler.go         # Health check endpoint
│   │   └── handler.go                # Base handler struct
│   ├── service/                       # Business logic layer
│   │   ├── auth_service.go
│   │   ├── user_service.go
│   │   └── dataset_service.go        # Dataset management and join queries
│   ├── repository/                    # Data access layer
│   │   ├── user_repository.go
│   │   ├── refresh_token_repository.go
│   │   └── dataset_repository.go     # Dataset CRUD and dynamic table operations
│   ├── model/                         # Domain entities
│   │   ├── user.go
│   │   ├── refresh_token.go
│   │   └── dataset.go                # Dataset metadata model
│   ├── middleware/                    # HTTP middleware
│   │   ├── auth.go                   # JWT validation
│   │   ├── rbac.go                   # Role authorization
│   │   └── cors.go                   # CORS policy
│   ├── dto/                           # Data transfer objects
│   │   ├── dataset_dto.go            # Dataset request/response DTOs
│   │   └── ...
│   ├── util/                          # Utilities (JWT, password hashing)
│   │   ├── query_builder.go          # SQL join query builder
│   │   └── ...
│   └── config/                        # Configuration management
├── pkg/
│   └── database/                      # PostgreSQL connection
├── migrations/                        # SQL migrations (4 pairs, 8 files)
│   ├── 000001_create_users_table.up.sql / .down.sql
│   ├── 000002_create_refresh_tokens_table.up.sql / .down.sql
│   ├── 000003_create_activities_table.up.sql / .down.sql
│   └── 000004_create_datasets_tables.up.sql / .down.sql
├── docs/                              # Swagger auto-generated docs
├── go.mod / go.sum
├── .env                               # Environment variables
└── .air.toml                          # Air hot-reload config
```

### Frontend (`frontend/`)

```
frontend/
├── app/
│   ├── (auth)/                        # Public routes
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Registration page
│   ├── (dashboard)/                   # Protected routes
│   │   ├── page.tsx                  # Main dashboard
│   │   ├── profile/page.tsx          # User profile
│   │   ├── datasets/                 # Dataset management
│   │   │   ├── page.tsx              # Dataset list page
│   │   │   ├── [id]/page.tsx         # Dataset detail page
│   │   │   └── join/page.tsx         # Join query builder page
│   │   └── admin/
│   │       └── users/page.tsx        # Admin user management
│   ├── api/                           # API route handlers
│   └── layout.tsx                     # Root layout
├── components/                        # Reusable React components
│   ├── ui/                            # shadcn/ui components
│   ├── datasets/                      # Dataset-specific components
│   │   ├── dataset-list.tsx          # Dataset table component
│   │   ├── dataset-upload-dialog.tsx # CSV upload dialog
│   │   ├── dataset-detail.tsx        # Dataset data viewer
│   │   ├── join-query-builder.tsx    # Interactive join builder
│   │   └── ...
│   └── ...
├── lib/
│   ├── api/                           # API client (Axios)
│   │   ├── client.ts                 # HTTP client with interceptors
│   │   └── datasets.ts               # Dataset API methods
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── queries/                  # React Query hooks
│   │   │   ├── use-dataset-list.ts   # Dataset list query
│   │   │   ├── use-dataset-detail.ts # Dataset detail query
│   │   │   └── use-dataset-data.ts   # Dataset data query
│   │   └── mutations/                # Mutation hooks
│   │       ├── use-upload-dataset.ts # Dataset upload mutation
│   │       └── use-delete-dataset.ts # Dataset delete mutation
│   ├── schemas/                       # Zod validation schemas
│   │   ├── auth.ts                   # Auth form schemas
│   │   └── dataset.ts                # Dataset form schemas
│   └── config/                        # Frontend configuration
├── actions/                           # Server actions
├── types/                             # TypeScript type definitions
│   ├── dataset.ts                    # Dataset type definitions
│   └── ...
├── public/                            # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
└── next.config.ts
```

### Root Files

```
starter-kit-mission/
├── scripts/                           # Server management scripts
│   ├── start-all.sh                  # Start all services
│   ├── stop-all.sh                   # Stop all services
│   ├── start-db.sh                   # DB only
│   ├── start-backend.sh              # Backend only
│   ├── start-frontend.sh             # Frontend only
│   └── lib/common.sh                 # Shared functions
├── logs/                              # Runtime logs
│   ├── backend.log
│   └── frontend.log
├── .pids/                             # Process ID files
├── docker-compose.yml                 # PostgreSQL container
├── Makefile                           # Build automation
├── .env                               # Project configuration (ports, container names)
├── .env.example                       # Environment template
└── README.md                          # User documentation
```

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Backend Runtime** | Go | 1.21+ | Application server |
| **Backend Framework** | Gin | Latest | HTTP web framework |
| **Database** | PostgreSQL | 16 | Relational database |
| **ORM** | GORM | Latest | Object-relational mapping |
| **Authentication** | JWT (golang-jwt) | v5 | Token-based auth |
| **Validation** | go-playground/validator | v10 | Request validation |
| **Documentation** | Swagger (swaggo) | Latest | API documentation |
| **Development** | Air | Latest | Hot reload |
| **Frontend Framework** | Next.js | 16.1.1 | React framework (App Router) |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **UI Library** | React | 19.2.3 | UI framework |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Radix UI-based components |
| **HTTP Client** | Axios | 1.13.2 | API communication |
| **State Management** | React Query (TanStack Query) | 5.90.16 | Server state management |
| **Form Management** | react-hook-form | 7.70.0 | Form handling |
| **Validation** | Zod | 4.3.4 | Schema validation |
| **Table** | TanStack React Table | 8.21.3 | Data tables |
| **Icons** | lucide-react | 0.562.0 | Icon library |
| **Theme** | next-themes | 0.4.6 | Dark mode support |
| **Charts** | recharts | 2.15.4 | Data visualization |
| **Toast** | sonner | 2.0.7 | Toast notifications |
| **Loading** | nextjs-toploader | 3.9.17 | Page transition loader |
| **Testing** | Vitest | 4.0.16 | Unit testing framework |

---

## Core Commands

### Setup and Installation

```bash
# Install all dependencies
make install

# Install backend only
make install-backend       # go mod download

# Install frontend only
make install-frontend      # npm install
```

### Development

```bash
# Start all services (DB → Backend → Frontend)
make start

# Stop all services
make stop

# Check service status
make status

# View recent logs
make logs
```

### Individual Services (Foreground)

```bash
# PostgreSQL only
make dev-db

# Backend only (with Air hot-reload)
make dev-backend

# Frontend only (Next.js dev server)
make dev-frontend
```

### Database Migrations

```bash
# Run all pending migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check current version
make migrate-version

# Create new migration (prompts for name)
make migrate-create
```

### Cleanup

```bash
# Stop and remove Docker containers + build artifacts
make clean
```

---

## Authentication

### Token Flow

1. **Login**: User submits credentials → Backend validates → Returns access + refresh tokens
2. **Access**: Client includes `Authorization: Bearer <access_token>` in requests
3. **Refresh**: When access token expires (401) → Client sends refresh token → New tokens issued
4. **Auto-refresh**: Frontend automatically handles 401 responses and token renewal

### Token Details

- **Access Token**: 15 minutes expiry, used for API requests
- **Refresh Token**: 7 days expiry, used to obtain new access tokens
- **Storage**: Frontend stores in localStorage (consider HttpOnly cookies for production)

### Role-Based Access Control (RBAC)

- **Admin**: Full system access (user management, CSV import/export, reports)
- **User**: Limited access (own profile, basic features)

**Implementation**:
- `backend/internal/middleware/auth.go` - JWT validation
- `backend/internal/middleware/rbac.go` - Role authorization
- Frontend: Protected routes check role before rendering

### API Endpoints

**Public**:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh

**Protected (User)**:
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update profile
- `PATCH /api/v1/users/password` - Change password
- `GET /api/v1/users/activity` - Get activity log (paginated)
- `GET /api/v1/users/stats` - Get user statistics
- `POST /api/v1/auth/logout` - Logout (revoke refresh token)
- `GET /api/v1/datasets` - List all datasets (paginated)
- `GET /api/v1/datasets/{id}` - Get dataset metadata
- `GET /api/v1/datasets/{id}/data` - Get dataset data (paginated)
- `POST /api/v1/datasets/query` - Execute join query
- `POST /api/v1/datasets/query/export` - Export join query results to CSV

**Protected (Admin)**:
- `GET /api/v1/admin/users` - List users (paginated)
- `GET /api/v1/admin/users/{id}` - Get user details
- `PATCH /api/v1/admin/users/{id}/role` - Update user role
- `DELETE /api/v1/admin/users/{id}` - Delete user
- `GET /api/v1/admin/users/export` - Export users to CSV
- `POST /api/v1/admin/users/import` - Import users from CSV
- `POST /api/v1/datasets/upload` - Upload CSV and create dataset table
- `DELETE /api/v1/datasets/{id}` - Delete dataset and its table

---

## Key Files

### Backend Critical Files

| File | Purpose | Key Logic |
|------|---------|-----------|
| `cmd/api/main.go` | Application entry point | Server initialization, router setup, middleware chain |
| `internal/middleware/auth.go` | JWT authentication | Token validation, user context injection |
| `internal/middleware/rbac.go` | Role authorization | Admin/User role checks |
| `internal/handler/auth_handler.go` | Auth endpoints | Login, register, refresh token logic |
| `internal/handler/user_handler.go` | User management | CRUD, CSV import/export, pagination |
| `internal/handler/dataset_handler.go` | Dataset management | CSV upload, dataset CRUD, join query execution |
| `internal/service/user_service.go` | User business logic | Password hashing, validation, CSV processing |
| `internal/service/dataset_service.go` | Dataset business logic | CSV parsing, table creation, join query building |
| `internal/repository/user_repository.go` | User data access | GORM database operations |
| `internal/repository/dataset_repository.go` | Dataset data access | Dynamic table creation, raw SQL execution |
| `internal/util/jwt.go` | JWT utilities | Token generation and parsing |
| `internal/util/query_builder.go` | Query builder | Dynamic SQL join query construction |

### Frontend Critical Files

| File | Purpose | Key Logic |
|------|---------|-----------|
| `lib/api/client.ts` | Axios HTTP client | Request/response interceptors, auth headers, auto-refresh |
| `lib/api/datasets.ts` | Dataset API client | Upload, list, detail, query, delete operations |
| `lib/hooks/useAuth.ts` | Authentication hook | Login/logout state management |
| `lib/hooks/queries/use-dataset-*.ts` | Dataset query hooks | React Query hooks for dataset operations |
| `lib/hooks/mutations/use-*-dataset.ts` | Dataset mutation hooks | Upload and delete mutations |
| `lib/schemas/auth.ts` | Zod validation | Login/register form validation |
| `lib/schemas/dataset.ts` | Zod validation | Dataset upload and join query validation |
| `app/(auth)/login/page.tsx` | Login page | Form submission, error handling |
| `app/(dashboard)/page.tsx` | Main dashboard | Protected route, user data display |
| `app/(dashboard)/datasets/page.tsx` | Dataset list | Dataset table, upload dialog, pagination |
| `app/(dashboard)/datasets/[id]/page.tsx` | Dataset detail | Dataset data viewer with pagination |
| `app/(dashboard)/datasets/join/page.tsx` | Join query builder | Interactive multi-table join interface |
| `app/(dashboard)/admin/users/page.tsx` | Admin panel | User table, CSV import/export, pagination |
| `components/datasets/dataset-list.tsx` | Dataset table | TanStack Table with sorting and pagination |
| `components/datasets/join-query-builder.tsx` | Join builder | Dynamic join condition form |
| `types/dataset.ts` | Dataset types | TypeScript type definitions |

### Infrastructure Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL container definition |
| `.env` | Project configuration (PROJECT_NAME, ports, DB settings) |
| `.env.example` | Environment template for new instances |
| `backend/.env` | Backend environment variables (DB connection, JWT secret) |
| `.air.toml` | Backend hot-reload configuration |
| `Makefile` | Build automation and task management |

---

## Environment Configuration

### Project-level Configuration (`.env`)

The root `.env` file controls project-wide settings:

```env
# Project identifier (used for Docker container naming)
PROJECT_NAME=starter-kit

# Port configuration (change if conflicts with other services)
DB_PORT=5432
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Database settings
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=starter_kit
```

**Key Variables**:

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `PROJECT_NAME` | Docker container prefix | `starter-kit` | Used in `docker-compose.yml` for unique container names |
| `DB_PORT` | PostgreSQL port | `5432` | Exposed to host machine |
| `BACKEND_PORT` | Backend API port | `8080` | Go server listening port |
| `FRONTEND_PORT` | Frontend port | `3000` | Next.js dev server port |
| `DB_USER` | PostgreSQL username | `postgres` | Database authentication |
| `DB_PASSWORD` | PostgreSQL password | `postgres` | Database authentication |
| `DB_NAME` | Database name | `starter_kit` | PostgreSQL database name |

### Multi-Instance Support

The environment variable system enables running multiple project instances on the same machine without conflicts.

**Setup Process**:

1. **Copy project to different directory**:
```bash
cp -r starter-kit-mission starter-kit-instance2
cd starter-kit-instance2
```

2. **Update root `.env`**:
```env
PROJECT_NAME=starter-kit-2
DB_PORT=5433
BACKEND_PORT=8081
FRONTEND_PORT=3001
DB_NAME=starter_kit_2
```

3. **Update `backend/.env`**:
```env
PORT=8081
DB_PORT=5433
DB_NAME=starter_kit_2
# ... other settings
```

4. **Update `frontend/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
API_URL=http://localhost:8081
```

5. **Start instance**:
```bash
make start
```

**Access URLs**:
- Instance 1: Frontend (3000), Backend (8080), Swagger (8080/swagger)
- Instance 2: Frontend (3001), Backend (8081), Swagger (8081/swagger)

**Important Notes**:
- Each instance requires unique `PROJECT_NAME` (prevents Docker container conflicts)
- Ports must not overlap with other services or instances
- Each instance maintains separate PostgreSQL database
- Backend and frontend environment variables must match root `.env` ports

### Environment File Hierarchy

```
.env                          # Project-wide: container names, ports
├── backend/.env             # Backend-specific: JWT secrets, API config
└── frontend/.env.local      # Frontend-specific: API URLs
```

**Configuration Flow**:
1. Root `.env` defines ports and database settings
2. `docker-compose.yml` reads `.env` for container configuration
3. `backend/.env` inherits ports from root `.env` (must match)
4. `frontend/.env.local` references backend port from root `.env`

---

## Development Guidelines

### Code Style

- **Naming**: snake_case for variables/functions, UPPER_SNAKE_CASE for constants
- **Indentation**: 4 spaces (not tabs)
- **Language**: English for all code, comments, and commit messages
- **Readability**: Use descriptive names, avoid abbreviations

### Commit Message Format

```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Versioning

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes

### Adding New Features

**Backend**:
1. Create handler in `internal/handler/`
2. Add service method in `internal/service/`
3. Update repository in `internal/repository/`
4. Register route in `cmd/api/main.go`
5. Add Swagger comments

**Frontend**:
1. Create page in `app/(dashboard)/`
2. Add components in `components/`
3. Define API client methods in `lib/api/`
4. Add Zod schemas in `lib/schemas/`
5. Create custom hooks in `lib/hooks/` if needed

### Testing

**Backend**:
- Unit tests: `*_test.go` files
- Run: `go test ./...`

**Frontend**:
- Tests: `*.test.tsx` files
- Run: `npm test`

### Common Tasks

**Add new API endpoint**:
1. Define handler → service → repository
2. Update router in `main.go`
3. Add Swagger comments
4. Test with Swagger UI

**Add new page**:
1. Create in `app/(dashboard)/`
2. Add route protection if needed
3. Import shared components
4. Test authentication flow

---

## Development Standards

This project follows system-wide standards defined in `~/.claude/CLAUDE.md`:
- **Code**: snake_case naming, 4-space indentation, English only
- **Documentation**: README.md (Korean for users), CLAUDE.md (English for developers)
- **Commits**: Conventional format with co-authorship
- **Versioning**: Semantic versioning
- **Token Optimization**: Concise responses, delegate heavy operations

---

## Additional Resources

- **Backend README**: `backend/README.md` - Detailed backend documentation (Korean)
- **Frontend README**: `frontend/README.md` - Detailed frontend documentation (Korean)
- **Root README**: `README.md` - User-facing documentation (Korean)
- **Swagger UI**: http://localhost:8080/swagger/index.html (when running)
- **API Base URL**: http://localhost:8080/api/v1
- **Frontend Dev**: http://localhost:3000

---

**Maintained by**: Claude Code
**Last Updated**: 2026-01-11

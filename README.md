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

Before setting up this project, ensure you have the following installed:

#### Required (Must Install Manually)

| Tool | Version | Installation | Purpose |
|------|---------|--------------|---------|
| **Go** | 1.21+ | [go.dev/dl](https://go.dev/dl/) | Backend language |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) | Frontend runtime |
| **npm** | 8+ | Included with Node.js | Frontend package manager |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop) | PostgreSQL container |

#### Auto-Installed (Handled by `make install`)

These tools will be automatically installed when you run `make install`:

| Tool | Version | Purpose |
|------|---------|---------|
| **air** | latest | Go live reload for backend development |
| **golang-migrate** | latest | Database migration tool |

#### Verification

Run this command to verify your environment:

```bash
make check-all
```

Expected output:
```
✓ Go version: go version go1.25.5 darwin/arm64
✓ Node.js version: v18.0.0
✓ npm version: 8.0.0
✓ Docker is running
⚠ air not installed - will be installed with 'make install'
⚠ golang-migrate not installed - will be installed with 'make install'
```

Don't worry about missing tools (⚠) - they'll be installed in the next step!

### Installation

#### 1. Clone Repository

```bash
git clone <repository-url>
cd starter-kit-mission
```

#### 2. Verify Prerequisites

```bash
make check-all
```

**Troubleshooting:**
- If Go is missing: Install from [go.dev/dl](https://go.dev/dl/)
- If Node.js is missing: Install from [nodejs.org](https://nodejs.org/)
- If Docker is not running: Start Docker Desktop application

#### 3. Install Dependencies

```bash
make install
```

This command will:
1. ✓ Verify all prerequisites (Go, Node.js, Docker)
2. ✓ Install Go development tools (air, golang-migrate)
3. ✓ Download Go modules
4. ✓ Install npm packages

**Expected duration:** 2-5 minutes (depending on internet speed)

**If installation fails:**
- Check that `$HOME/go/bin` is in your PATH:
  ```bash
  echo $PATH | grep -q "$HOME/go/bin" && echo "✓ PATH is set" || echo "⚠ Add to PATH"
  ```
- Add to your shell config (`~/.zshrc` or `~/.bashrc`):
  ```bash
  export PATH="$HOME/go/bin:$PATH"
  ```
- Reload shell: `source ~/.zshrc`
- Re-run `make install`

#### 4. Configure Environment Variables

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env if needed (defaults work for local development)
```

**Frontend:**
```bash
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local if needed (defaults work for local development)
```

#### 5. Start Development Environment

**Option A: Automated (Recommended)**
```bash
make start    # Starts all services in background
make status   # Check if everything is running
make logs     # View logs if needed
```

**Option B: Manual (3 terminals)**
```bash
# Terminal 1: Start PostgreSQL
make dev-db

# Terminal 2: Start backend (wait for DB to be ready)
make dev-backend

# Terminal 3: Start frontend (wait for backend to be ready)
make dev-frontend
```

#### 6. Access Applications

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html
- Health Check: http://localhost:8080/health

#### 7. Verify Everything Works

**Test backend health:**
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

**Test frontend:**
Open http://localhost:3000 in your browser - you should see the login page.

**Stop all services:**
```bash
make stop
```

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

## Troubleshooting

### Installation Issues

#### "Go is not installed"
**Cause**: Go binary not found in PATH

**Solution**:
1. Install Go from [go.dev/dl](https://go.dev/dl/)
2. Verify installation: `go version`
3. If still fails, check PATH: `echo $PATH`

#### "air: command not found" (after installation)
**Cause**: `$GOPATH/bin` or `$HOME/go/bin` not in PATH

**Solution**:
1. Check where Go installs binaries:
   ```bash
   go env GOPATH  # Usually $HOME/go
   ```
2. Add to your shell config (`~/.zshrc` or `~/.bashrc`):
   ```bash
   export PATH="$HOME/go/bin:$PATH"
   ```
3. Reload shell: `source ~/.zshrc` (or restart terminal)
4. Re-run: `make install-go-tools`

#### "migrate: command not found" (after installation)
**Cause**: Same as air - PATH issue

**Solution**: Follow the same steps as "air: command not found" above

#### "npm install" fails with permission errors
**Cause**: npm trying to install to system directories

**Solution**:
```bash
# DO NOT use sudo with npm!
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

#### "Docker daemon is not running"
**Cause**: Docker Desktop is not started

**Solution**:
1. Open Docker Desktop application
2. Wait for "Docker is running" indicator (usually in menu bar)
3. Re-run: `make check-docker`

### Runtime Issues

#### Backend fails to start: "Error connecting to database"
**Cause**: PostgreSQL container not running or not ready

**Solution**:
```bash
make start-db          # Start PostgreSQL
docker ps              # Verify container is running
make start-backend     # Retry backend
```

#### Frontend shows "Network Error" when calling API
**Cause**: Backend is not running or wrong API URL

**Solution**:
1. Check backend is running: `make status`
2. Test backend health: `curl http://localhost:8080/health`
3. Verify frontend env: `cat frontend/.env.local`
   - Should contain: `NEXT_PUBLIC_API_URL=http://localhost:8080`

#### Migration fails: "Dirty database version"
**Cause**: Previous migration failed midway

**Solution**:
```bash
# Check current version
make migrate-version

# Force to a known good version (e.g., 1)
make migrate-force
# Enter version: 1

# Re-run migrations
make migrate-up
```

### Platform-Specific Notes

#### macOS
- Docker Desktop requires macOS 11 or newer
- If you have Homebrew, you can install tools via:
  ```bash
  brew install go node docker
  ```
- Apple Silicon (M1/M2): All tools work natively

#### Linux
- Install Docker via official script: `curl -fsSL https://get.docker.com | sh`
- Add user to docker group: `sudo usermod -aG docker $USER`
- Log out and back in for group changes to take effect

#### Windows (WSL2)
- Use WSL2 (Windows Subsystem for Linux)
- Install Docker Desktop with WSL2 backend
- Run all commands inside WSL2 terminal
- Path issues are common - ensure `.zshrc` or `.bashrc` is properly configured

### Getting Help

If you encounter issues not covered here:
1. Check logs: `make logs`
2. Check server status: `make status`
3. View full backend logs: `cat logs/backend.log`
4. View full frontend logs: `cat logs/frontend.log`
5. Clean restart: `make stop && make clean && make start`

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

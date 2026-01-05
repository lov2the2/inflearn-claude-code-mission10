.PHONY: help install-backend install-frontend install dev-db dev-backend dev-frontend dev clean migrate-create migrate-up migrate-down migrate-force migrate-version start stop start-db stop-db start-backend stop-backend start-frontend stop-frontend status logs check-go check-node check-docker check-tools check-all install-go-tools install-air install-migrate setup

# Prerequisite checks
check-go:
	@command -v go >/dev/null 2>&1 || { echo "ERROR: Go is not installed. Install from https://go.dev/dl/"; exit 1; }
	@echo "✓ Go version: $$(go version)"

check-node:
	@command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is not installed. Install from https://nodejs.org/"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "ERROR: npm is not installed. Install Node.js from https://nodejs.org/"; exit 1; }
	@echo "✓ Node.js version: $$(node --version)"
	@echo "✓ npm version: $$(npm --version)"

check-docker:
	@command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker is not installed. Install from https://www.docker.com/products/docker-desktop"; exit 1; }
	@docker info >/dev/null 2>&1 || { echo "ERROR: Docker daemon is not running. Start Docker Desktop"; exit 1; }
	@echo "✓ Docker is running"

check-tools:
	@echo "Checking Go tools..."
	@if command -v air >/dev/null 2>&1; then \
		echo "✓ air is installed: $$(air -v)"; \
	else \
		echo "⚠ air not installed - will be installed with 'make install'"; \
	fi
	@if command -v migrate >/dev/null 2>&1; then \
		echo "✓ golang-migrate is installed: $$(migrate -version 2>&1 | head -n1)"; \
	else \
		echo "⚠ golang-migrate not installed - will be installed with 'make install'"; \
	fi

check-all: check-go check-node check-docker check-tools
	@echo ""
	@echo "✓ All prerequisite checks completed!"

# Tool installation
install-air:
	@if command -v air >/dev/null 2>&1; then \
		echo "✓ air is already installed: $$(air -v)"; \
	else \
		echo "Installing air (Go live reload tool)..."; \
		go install github.com/air-verse/air@latest; \
		echo "✓ air installed successfully"; \
	fi

install-migrate:
	@if command -v migrate >/dev/null 2>&1; then \
		echo "✓ golang-migrate is already installed: $$(migrate -version 2>&1 | head -n1)"; \
	else \
		echo "Installing golang-migrate..."; \
		go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest; \
		echo "✓ golang-migrate installed successfully"; \
	fi

install-go-tools: check-go install-air install-migrate
	@echo ""
	@echo "✓ All Go tools installed successfully"
	@echo ""
	@if ! echo $$PATH | grep -q "$$(go env GOPATH)/bin"; then \
		echo "⚠ WARNING: Go tools installed but may not be in PATH"; \
		echo ""; \
		echo "Add to your ~/.zshrc or ~/.bashrc:"; \
		echo "  export PATH=\"\$$HOME/go/bin:\$$PATH\""; \
		echo ""; \
		echo "Then run: source ~/.zshrc"; \
		echo ""; \
	fi

help:
	@echo "Available commands:"
	@echo ""
	@echo "Prerequisites (run these first):"
	@echo "  make check-all          - Verify all prerequisites are met"
	@echo "  make check-go           - Check if Go is installed"
	@echo "  make check-node         - Check if Node.js/npm are installed"
	@echo "  make check-docker       - Check if Docker is running"
	@echo "  make check-tools        - Check if Go tools (air, migrate) are installed"
	@echo ""
	@echo "Setup:"
	@echo "  make setup              - Complete setup (checks + install)"
	@echo "  make install-go-tools   - Install Go development tools (air, migrate)"
	@echo ""
	@echo "Development:"
	@echo "  make start              - Start all servers (DB → Backend → Frontend)"
	@echo "  make stop               - Stop all servers"
	@echo "  make status             - Show server status"
	@echo "  make logs               - Show recent logs"
	@echo ""
	@echo "Individual servers:"
	@echo "  make start-db           - Start PostgreSQL"
	@echo "  make stop-db            - Stop PostgreSQL"
	@echo "  make start-backend      - Start backend dev server"
	@echo "  make stop-backend       - Stop backend dev server"
	@echo "  make start-frontend     - Start frontend dev server"
	@echo "  make stop-frontend      - Stop frontend dev server"
	@echo ""
	@echo "Legacy (foreground, requires terminal):"
	@echo "  make dev-db             - Start PostgreSQL (foreground)"
	@echo "  make dev-backend        - Start backend (foreground with Air)"
	@echo "  make dev-frontend       - Start frontend (foreground)"
	@echo ""
	@echo "Dependencies:"
	@echo "  make install            - Install all dependencies"
	@echo "  make install-backend    - Install backend dependencies"
	@echo "  make install-frontend   - Install frontend dependencies"
	@echo ""
	@echo "Database:"
	@echo "  make migrate-create     - Create new migration file"
	@echo "  make migrate-up         - Run all pending migrations"
	@echo "  make migrate-down       - Rollback last migration"
	@echo "  make migrate-version    - Show current migration version"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean              - Clean Docker volumes and temp files"

install: check-all install-backend install-frontend
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✓ All dependencies installed successfully!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Next steps:"
	@if [ ! -f backend/.env ]; then \
		echo "  1. cp backend/.env.example backend/.env"; \
	else \
		echo "  1. ✓ backend/.env exists"; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		echo "  2. cp frontend/.env.local.example frontend/.env.local"; \
	else \
		echo "  2. ✓ frontend/.env.local exists"; \
	fi
	@echo "  3. make start"
	@echo ""

install-backend: check-go install-go-tools
	@echo "Installing backend dependencies..."
	cd backend && go mod download && go mod tidy
	@echo "✓ Backend dependencies installed"

install-frontend: check-node
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Frontend dependencies installed"

setup: check-all install
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✓ Setup Complete!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Quick start: make start"
	@echo ""

dev-db:
	docker-compose up -d postgres

migrate-create:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir backend/migrations -seq $$name

migrate-up:
	migrate -path backend/migrations -database "postgresql://postgres:postgres@localhost:5432/starter_kit?sslmode=disable" up

migrate-down:
	migrate -path backend/migrations -database "postgresql://postgres:postgres@localhost:5432/starter_kit?sslmode=disable" down 1

migrate-force:
	@read -p "Enter version to force: " version; \
	migrate -path backend/migrations -database "postgresql://postgres:postgres@localhost:5432/starter_kit?sslmode=disable" force $$version

migrate-version:
	migrate -path backend/migrations -database "postgresql://postgres:postgres@localhost:5432/starter_kit?sslmode=disable" version

dev-backend:
	cd backend && air

dev-frontend:
	cd frontend && npm run dev

clean:
	docker-compose down -v
	rm -rf backend/tmp
	rm -rf frontend/.next

# New server management commands
start:
	@bash scripts/start-all.sh

stop:
	@bash scripts/stop-all.sh

start-db:
	@bash scripts/start-db.sh

stop-db:
	@bash scripts/stop-db.sh

start-backend:
	@bash scripts/start-backend.sh

stop-backend:
	@bash scripts/stop-backend.sh

start-frontend:
	@bash scripts/start-frontend.sh

stop-frontend:
	@bash scripts/stop-frontend.sh

status:
	@echo "Server Status:"
	@echo "  Database:  $$(docker ps | grep -q starter-kit-db && echo '✓ Running' || echo '✗ Stopped')"
	@echo "  Backend:   $$([ -f .pids/backend.pid ] && kill -0 $$(cat .pids/backend.pid) 2>/dev/null && echo '✓ Running (PID: '$$(cat .pids/backend.pid)')' || echo '✗ Stopped')"
	@echo "  Frontend:  $$([ -f .pids/frontend.pid ] && kill -0 $$(cat .pids/frontend.pid) 2>/dev/null && echo '✓ Running (PID: '$$(cat .pids/frontend.pid)')' || echo '✗ Stopped')"

logs:
	@echo "=== Backend Logs ==="
	@tail -n 50 logs/backend.log 2>/dev/null || echo "No backend logs"
	@echo ""
	@echo "=== Frontend Logs ==="
	@tail -n 50 logs/frontend.log 2>/dev/null || echo "No frontend logs"

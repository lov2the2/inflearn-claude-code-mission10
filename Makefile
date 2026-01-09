.PHONY: help install-backend install-frontend install dev-db dev-backend dev-frontend dev clean migrate-create migrate-up migrate-down migrate-force migrate-version start stop start-db stop-db start-backend stop-backend start-frontend stop-frontend status logs

help:
	@echo "Available commands:"
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
	@echo "Testing:"
	@echo "  make test               - Run all tests"
	@echo "  make test-coverage      - Run tests with coverage report"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean              - Clean Docker volumes and temp files"

install: install-backend install-frontend

install-backend:
	cd backend && go mod download && go mod tidy

install-frontend:
	cd frontend && npm install

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

test:
	cd backend && go test ./... -v

test-coverage:
	cd backend && go test ./... -coverprofile=coverage.out
	cd backend && go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: backend/coverage.html"

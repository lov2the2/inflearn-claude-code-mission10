.PHONY: help install-backend install-frontend install dev-db dev-backend dev-frontend dev clean migrate-create migrate-up migrate-down migrate-force migrate-version

help:
	@echo "Available commands:"
	@echo " make install - Install all dependencies"
	@echo " make install-backend - Install backend dependencies"
	@echo " make install-frontend - Install frontend dependencies"
	@echo " make dev-db - Start PostgreSQL"
	@echo " make dev-backend - Start backend dev server"
	@echo " make dev-frontend - Start frontend dev server"
	@echo " make clean - Clean Docker volumes"
	@echo " make migrate-create - Create new migration file"
	@echo " make migrate-up - Run all pending migrations"
	@echo " make migrate-down - Rollback last migration"
	@echo " make migrate-version - Show current migration version"

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

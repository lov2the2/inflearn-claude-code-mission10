.PHONY: help install-backend install-frontend install dev-db dev-backend dev-frontend dev clean

help:
	@echo "Available commands:"
	@echo " make install - Install all dependencies"
	@echo " make install-backend - Install backend dependencies"
	@echo " make install-frontend - Install frontend dependencies"
	@echo " make dev-db - Start PostgreSQL"
	@echo " make dev-backend - Start backend dev server"
	@echo " make dev-frontend - Start frontend dev server"
	@echo " make clean - Clean Docker volumes"

install: install-backend install-frontend

install-backend:
	cd backend && go mod download && go mod tidy

install-frontend:
	cd frontend && npm install

dev-db:
	docker-compose up -d postgres

dev-backend:
	cd backend && air

dev-frontend:
	cd frontend && npm run dev

clean:
	docker-compose down -v
	rm -rf backend/tmp
	rm -rf frontend/.next

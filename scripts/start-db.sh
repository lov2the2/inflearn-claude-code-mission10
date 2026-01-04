#!/bin/bash

# Start PostgreSQL database

source "$(dirname "$0")/lib/common.sh"

log_info "Starting PostgreSQL..."

# Check if already running
if docker ps | grep -q starter-kit-db; then
    log_warn "PostgreSQL is already running"
    exit 0
fi

# Start via docker-compose
cd "$PROJECT_ROOT"
docker-compose up -d postgres

# Wait for health check
if wait_for_postgres; then
    log_success "PostgreSQL started successfully on port 5432"
else
    log_error "PostgreSQL failed to start"
    exit 1
fi

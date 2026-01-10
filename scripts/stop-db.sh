#!/bin/bash

# Stop PostgreSQL database

source "$(dirname "$0")/lib/common.sh"

log_info "Stopping PostgreSQL..."

# Check if running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    log_warn "PostgreSQL is not running"
    exit 0
fi

# Stop via docker-compose
cd "$PROJECT_ROOT"
docker-compose stop postgres

log_success "PostgreSQL stopped"

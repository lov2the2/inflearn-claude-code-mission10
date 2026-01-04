#!/bin/bash

# Start backend server

source "$(dirname "$0")/lib/common.sh"

log_info "Starting Backend..."

# Check if already running
if is_running backend; then
    log_warn "Backend is already running (PID: $(get_pid backend))"
    exit 0
fi

# Check if database is ready
if ! wait_for_postgres 5; then
    log_error "PostgreSQL is not running. Start it first with: make start-db"
    exit 1
fi

# Start backend with Air (background)
cd "$PROJECT_ROOT/backend"
nohup air > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Save PID
save_pid "$BACKEND_PID" backend

# Wait for backend to be ready
if wait_for_http "http://localhost:8080/health" 60; then
    log_success "Backend started successfully on port 8080 (PID: $BACKEND_PID)"
    log_info "Logs: $LOG_DIR/backend.log"
else
    log_error "Backend failed to start. Check logs: $LOG_DIR/backend.log"
    kill_pid backend
    rm -f "$PID_DIR/backend.pid"
    exit 1
fi

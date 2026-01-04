#!/bin/bash

# Start frontend server

source "$(dirname "$0")/lib/common.sh"

log_info "Starting Frontend..."

# Check if already running
if is_running frontend; then
    log_warn "Frontend is already running (PID: $(get_pid frontend))"
    exit 0
fi

# Check if backend is ready
if ! wait_for_http "http://localhost:8080/health" 5; then
    log_error "Backend is not running. Start it first with: make start-backend"
    exit 1
fi

# Start frontend (background)
cd "$PROJECT_ROOT/frontend"
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

# Save PID
save_pid "$FRONTEND_PID" frontend

# Wait for frontend to be ready
if wait_for_http "http://localhost:3000" 60; then
    log_success "Frontend started successfully on port 3000 (PID: $FRONTEND_PID)"
    log_info "Logs: $LOG_DIR/frontend.log"
else
    log_error "Frontend failed to start. Check logs: $LOG_DIR/frontend.log"
    kill_pid frontend
    rm -f "$PID_DIR/frontend.pid"
    exit 1
fi

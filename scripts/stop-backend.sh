#!/bin/bash

# Stop backend server

source "$(dirname "$0")/lib/common.sh"

log_info "Stopping Backend..."

# Check if running
if ! is_running backend; then
    log_warn "Backend is not running"
    exit 0
fi

# Graceful shutdown
PID=$(get_pid backend)
kill "$PID" 2>/dev/null
sleep 2

# Force kill if still running
if kill -0 "$PID" 2>/dev/null; then
    log_warn "Backend did not stop gracefully, force killing..."
    kill -9 "$PID" 2>/dev/null
fi

rm -f "$PID_DIR/backend.pid"
log_success "Backend stopped"

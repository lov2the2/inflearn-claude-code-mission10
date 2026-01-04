#!/bin/bash

# Stop frontend server

source "$(dirname "$0")/lib/common.sh"

log_info "Stopping Frontend..."

# Check if running
if ! is_running frontend; then
    log_warn "Frontend is not running"
    exit 0
fi

# Graceful shutdown
PID=$(get_pid frontend)
kill "$PID" 2>/dev/null
sleep 2

# Force kill if still running
if kill -0 "$PID" 2>/dev/null; then
    log_warn "Frontend did not stop gracefully, force killing..."
    kill -9 "$PID" 2>/dev/null
fi

rm -f "$PID_DIR/frontend.pid"
log_success "Frontend stopped"

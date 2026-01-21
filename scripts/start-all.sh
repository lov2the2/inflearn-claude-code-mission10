#!/bin/bash

# Start all servers in order

source "$(dirname "$0")/lib/common.sh"

log_info "Starting all servers..."
echo ""

# Start in order: DB → Backend → Frontend
bash "$(dirname "$0")/start-db.sh" || exit 1
echo ""

bash "$(dirname "$0")/start-backend.sh" || exit 1
echo ""

bash "$(dirname "$0")/start-frontend.sh" || exit 1
echo ""

log_success "All servers started successfully!"
echo ""
log_info "Services:"
log_info "  - PostgreSQL: localhost:${DB_PORT}"
log_info "  - Backend API: http://localhost:${BACKEND_PORT}"
log_info "  - Swagger Docs: http://localhost:${BACKEND_PORT}/swagger/index.html"
log_info "  - Frontend: http://localhost:${FRONTEND_PORT}"
echo ""
log_info "To stop all servers: make stop"

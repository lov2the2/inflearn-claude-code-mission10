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
log_info "  - PostgreSQL: localhost:5432"
log_info "  - Backend API: http://localhost:8080"
log_info "  - Swagger Docs: http://localhost:8080/swagger/index.html"
log_info "  - Frontend: http://localhost:3000"
echo ""
log_info "To stop all servers: make stop"

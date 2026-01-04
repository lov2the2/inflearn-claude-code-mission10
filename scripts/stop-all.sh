#!/bin/bash

# Stop all servers in reverse order

source "$(dirname "$0")/lib/common.sh"

log_info "Stopping all servers..."
echo ""

# Stop in reverse order: Frontend → Backend → DB
bash "$(dirname "$0")/stop-frontend.sh"
echo ""

bash "$(dirname "$0")/stop-backend.sh"
echo ""

bash "$(dirname "$0")/stop-db.sh"
echo ""

log_success "All servers stopped"

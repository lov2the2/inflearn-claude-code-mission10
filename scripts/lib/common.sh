#!/bin/bash

# Common utilities for server management scripts

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"
LOG_DIR="$PROJECT_ROOT/logs"

# Load environment from root .env if exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Ensure required directories exist
mkdir -p "$PID_DIR"
mkdir -p "$LOG_DIR"

# Project configuration with defaults
PROJECT_NAME="${PROJECT_NAME:-starter-kit}"
DB_CONTAINER="${PROJECT_NAME}-db"
DB_PORT="${DB_PORT:-5432}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Wait for PostgreSQL to be ready
wait_for_postgres() {
    local timeout=${1:-30}
    local start_time=$(date +%s)

    log_info "Waiting for PostgreSQL to be ready..."

    while true; do
        if docker exec "$DB_CONTAINER" pg_isready -U postgres > /dev/null 2>&1; then
            return 0
        fi

        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [ $elapsed -ge $timeout ]; then
            log_error "PostgreSQL did not become ready within ${timeout}s"
            return 1
        fi

        sleep 1
    done
}

# Wait for HTTP endpoint to respond
wait_for_http() {
    local url=$1
    local timeout=${2:-30}
    local start_time=$(date +%s)

    log_info "Waiting for $url to be ready..."

    while true; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302"; then
            return 0
        fi

        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [ $elapsed -ge $timeout ]; then
            log_error "Service at $url did not become ready within ${timeout}s"
            return 1
        fi

        sleep 1
    done
}

# PID management functions
save_pid() {
    local pid=$1
    local name=$2
    echo "$pid" > "$PID_DIR/$name.pid"
}

get_pid() {
    local name=$1
    cat "$PID_DIR/$name.pid" 2>/dev/null
}

kill_pid() {
    local name=$1
    local pid=$(get_pid "$name")
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null
    fi
}

is_running() {
    local name=$1
    local pid=$(get_pid "$name")

    if [ -z "$pid" ]; then
        return 1
    fi

    kill -0 "$pid" 2>/dev/null
    return $?
}

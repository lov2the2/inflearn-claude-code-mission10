#!/bin/bash
#
# generate-env.sh
# Generates backend/.env and frontend/.env.local from root .env
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Load root .env
if [ ! -f .env ]; then
    echo "[ERROR] Root .env not found. Run 'cp .env.example .env' first."
    exit 1
fi

source .env

# Generate backend/.env
cat > backend/.env << EOF
PORT=${BACKEND_PORT:-8080}
GIN_MODE=debug

DB_HOST=localhost
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-starter_kit}
DB_SSLMODE=disable

JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h

ALLOWED_ORIGINS=http://localhost:${FRONTEND_PORT:-3000}
EOF

echo "[INFO] Generated backend/.env (PORT=${BACKEND_PORT:-8080}, DB_PORT=${DB_PORT:-5432})"

# Generate frontend/.env.local
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT:-8080}
API_URL=http://localhost:${BACKEND_PORT:-8080}
EOF

echo "[INFO] Generated frontend/.env.local (API_URL=http://localhost:${BACKEND_PORT:-8080})"

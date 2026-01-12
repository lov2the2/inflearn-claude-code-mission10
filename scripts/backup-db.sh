#!/bin/bash

# Manual database backup script
# Creates a timestamped SQL dump and applies retention policy

set -e

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/backup.sh"

# Ensure backup directory exists
BACKUP_DIR=$(get_backup_dir)
mkdir -p "$BACKUP_DIR"

# Validate Docker container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    log_error "Database container '$DB_CONTAINER' is not running"
    log_info "Start the database with: make start-db"
    exit 1
fi

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/$(get_backup_filename)"

log_info "Starting database backup..."
log_info "Database: $DB_NAME"
log_info "Container: $DB_CONTAINER"
log_info "Target: $BACKUP_FILE"

# Create backup using pg_dump
# Format: Plain SQL (human-readable, version-compatible)
# Options:
#   --clean: Add DROP statements before CREATE
#   --if-exists: Use IF EXISTS with DROP statements
#   --no-owner: Do not set ownership of objects
#   --no-privileges: Do not dump access privileges
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    > "$BACKUP_FILE"; then

    # Get file size for display
    FILE_SIZE=$(get_file_size "$BACKUP_FILE")

    log_success "Backup completed successfully"
    echo ""
    echo "Backup Details:"
    echo "  File: $(basename "$BACKUP_FILE")"
    echo "  Path: $BACKUP_FILE"
    echo "  Size: $FILE_SIZE"
    echo ""

    # Apply retention policy (keep last 5 backups)
    cleanup_old_backups 5

    exit 0
else
    log_error "Backup failed"

    # Remove failed backup file
    rm -f "$BACKUP_FILE"

    exit 1
fi

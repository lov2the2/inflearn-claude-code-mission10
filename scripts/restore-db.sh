#!/bin/bash

# Database restore script
# Restores database from a backup file with optional pre-restore backup

set -e

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/backup.sh"

# Parse command line arguments
BACKUP_FILE=""
CREATE_BACKUP=true
SKIP_CONFIRMATION=false

show_usage() {
    echo "Usage: $0 [OPTIONS] [BACKUP_FILE]"
    echo ""
    echo "Restore database from a backup file"
    echo ""
    echo "Options:"
    echo "  -f, --file FILE        Backup file to restore (default: latest backup)"
    echo "  --no-backup            Skip pre-restore backup"
    echo "  -y, --yes              Skip confirmation prompt"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Restore from latest backup"
    echo "  $0 -f backup.sql       # Restore from specific file"
    echo "  $0 --no-backup -y      # Restore without backup and confirmation"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --no-backup)
            CREATE_BACKUP=false
            shift
            ;;
        -y|--yes)
            SKIP_CONFIRMATION=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            fi
            shift
            ;;
    esac
done

# If no file specified, use latest backup
if [ -z "$BACKUP_FILE" ]; then
    log_info "No backup file specified, using latest backup..."
    BACKUP_FILE=$(get_latest_backup)

    if [ $? -ne 0 ] || [ -z "$BACKUP_FILE" ]; then
        log_error "No backup files found"
        log_info "Run 'make backup-db' to create a backup first"
        exit 1
    fi

    log_info "Found latest backup: $(basename "$BACKUP_FILE")"
fi

# Convert to absolute path if relative
if [[ ! "$BACKUP_FILE" = /* ]]; then
    BACKUP_DIR=$(get_backup_dir)
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Validate backup file
validate_backup_file "$BACKUP_FILE" || exit 1

# Validate Docker container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    log_error "Database container '$DB_CONTAINER' is not running"
    log_info "Start the database with: make start-db"
    exit 1
fi

# Display restore information
echo ""
echo "Restore Information:"
echo "  Database: $DB_NAME"
echo "  Container: $DB_CONTAINER"
echo "  Backup File: $(basename "$BACKUP_FILE")"
echo "  File Size: $(get_file_size "$BACKUP_FILE")"
echo "  Pre-restore Backup: $([ "$CREATE_BACKUP" = true ] && echo "Yes" || echo "No")"
echo ""

# Confirmation prompt
if [ "$SKIP_CONFIRMATION" = false ]; then
    log_warn "This will replace all data in the database!"
    read -p "Continue with restore? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi
fi

# Create pre-restore backup if requested
if [ "$CREATE_BACKUP" = true ]; then
    log_info "Creating pre-restore backup..."

    BACKUP_DIR=$(get_backup_dir)
    PRE_RESTORE_FILE="$BACKUP_DIR/pre-restore_$(get_backup_filename)"

    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        > "$PRE_RESTORE_FILE"; then

        log_success "Pre-restore backup created: $(basename "$PRE_RESTORE_FILE")"
    else
        log_error "Failed to create pre-restore backup"
        read -p "Continue anyway? (yes/no): " continue_restore

        if [ "$continue_restore" != "yes" ]; then
            log_info "Restore cancelled"
            exit 1
        fi
    fi
fi

# Perform restore
log_info "Starting database restore..."

if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" < "$BACKUP_FILE"; then
    log_success "Database restore completed successfully"
    echo ""
    echo "Restore completed from: $(basename "$BACKUP_FILE")"

    if [ "$CREATE_BACKUP" = true ] && [ -f "$PRE_RESTORE_FILE" ]; then
        echo "Pre-restore backup saved as: $(basename "$PRE_RESTORE_FILE")"
    fi

    echo ""
    exit 0
else
    log_error "Database restore failed"

    if [ "$CREATE_BACKUP" = true ] && [ -f "$PRE_RESTORE_FILE" ]; then
        log_warn "You can restore from the pre-restore backup if needed:"
        log_warn "  make restore-db FILE=$(basename "$PRE_RESTORE_FILE")"
    fi

    exit 1
fi

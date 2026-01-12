#!/bin/bash

# Backup utility functions for database management

# Get backup directory path
get_backup_dir() {
    echo "$PROJECT_ROOT/backups"
}

# Generate timestamped backup filename
get_backup_filename() {
    local timestamp=$(date +"%Y-%m-%d_%H%M%S")
    echo "${timestamp}.sql"
}

# Find the most recent backup file
get_latest_backup() {
    local backup_dir=$(get_backup_dir)

    if [ ! -d "$backup_dir" ]; then
        return 1
    fi

    # Find the most recent .sql file
    local latest=$(ls -t "$backup_dir"/*.sql 2>/dev/null | head -n 1)

    if [ -z "$latest" ]; then
        return 1
    fi

    echo "$latest"
}

# Clean up old backups, keeping the last N backups
cleanup_old_backups() {
    local keep_count=${1:-5}
    local backup_dir=$(get_backup_dir)

    if [ ! -d "$backup_dir" ]; then
        return 0
    fi

    # Get list of backup files sorted by modification time (newest first)
    local backups=($(ls -t "$backup_dir"/*.sql 2>/dev/null))
    local total=${#backups[@]}

    if [ $total -le $keep_count ]; then
        return 0
    fi

    # Calculate how many to delete
    local delete_count=$((total - keep_count))

    log_info "Cleaning up old backups (keeping last $keep_count)"

    # Delete older backups
    for ((i=keep_count; i<total; i++)); do
        local file="${backups[$i]}"
        rm -f "$file"
        log_info "Deleted old backup: $(basename "$file")"
    done

    log_success "Cleanup completed ($delete_count backup(s) removed)"
}

# Get human-readable file size
get_file_size() {
    local file=$1

    if [ ! -f "$file" ]; then
        echo "N/A"
        return
    fi

    # Use du for cross-platform compatibility
    local size=$(du -h "$file" | cut -f1)
    echo "$size"
}

# List all available backups
list_backups() {
    local backup_dir=$(get_backup_dir)

    if [ ! -d "$backup_dir" ]; then
        log_warn "No backups directory found"
        return 1
    fi

    local backups=($(ls -t "$backup_dir"/*.sql 2>/dev/null))

    if [ ${#backups[@]} -eq 0 ]; then
        log_warn "No backup files found"
        return 1
    fi

    echo ""
    echo "Available backups:"
    echo "----------------------------------------"

    for file in "${backups[@]}"; do
        local filename=$(basename "$file")
        local size=$(get_file_size "$file")
        local date=$(echo "$filename" | cut -d'_' -f1)
        local time=$(echo "$filename" | cut -d'_' -f2 | cut -d'.' -f1)

        # Format time as HH:MM:SS
        local formatted_time="${time:0:2}:${time:2:2}:${time:4:2}"

        echo "  $filename"
        echo "    Date: $date $formatted_time"
        echo "    Size: $size"
        echo ""
    done
}

# Validate backup file exists and is readable
validate_backup_file() {
    local file=$1

    if [ -z "$file" ]; then
        log_error "No backup file specified"
        return 1
    fi

    if [ ! -f "$file" ]; then
        log_error "Backup file not found: $file"
        return 1
    fi

    if [ ! -r "$file" ]; then
        log_error "Backup file is not readable: $file"
        return 1
    fi

    return 0
}

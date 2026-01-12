#!/bin/bash

# Automated backup scheduler
# Sets up daily backups at 02:00 using launchd (macOS) or cron (Linux)

set -e

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Detect OS
OS_TYPE=$(uname -s)

# Configuration
BACKUP_SCRIPT="$SCRIPT_DIR/backup-db.sh"
BACKUP_TIME="02:00"  # 2 AM daily

# launchd configuration (macOS)
LAUNCHD_LABEL="com.csv-project.backup"
LAUNCHD_PLIST="$HOME/Library/LaunchAgents/${LAUNCHD_LABEL}.plist"

# Cron configuration (Linux)
CRON_COMMENT="# csv-project auto-backup"

show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Setup automatic daily database backups"
    echo ""
    echo "Commands:"
    echo "  install    - Install automatic backup scheduler"
    echo "  uninstall  - Remove automatic backup scheduler"
    echo "  status     - Show scheduler status"
    echo "  help       - Show this help message"
    echo ""
    echo "The backup will run daily at $BACKUP_TIME"
}

# macOS launchd functions
install_launchd() {
    log_info "Setting up launchd scheduler for macOS..."

    # Create LaunchAgents directory if it doesn't exist
    mkdir -p "$HOME/Library/LaunchAgents"

    # Create plist file
    cat > "$LAUNCHD_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LAUNCHD_LABEL}</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${BACKUP_SCRIPT}</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <key>StandardOutPath</key>
    <string>${LOG_DIR}/backup-auto.log</string>

    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/backup-auto-error.log</string>

    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
EOF

    # Load the plist
    launchctl load "$LAUNCHD_PLIST" 2>/dev/null || true

    log_success "Automatic backup scheduler installed"
    echo ""
    echo "Backup Schedule:"
    echo "  Time: Daily at $BACKUP_TIME"
    echo "  Script: $BACKUP_SCRIPT"
    echo "  Logs: ${LOG_DIR}/backup-auto.log"
    echo ""
    echo "To test manually: make backup-db"
}

uninstall_launchd() {
    log_info "Removing launchd scheduler..."

    if [ -f "$LAUNCHD_PLIST" ]; then
        # Unload the plist
        launchctl unload "$LAUNCHD_PLIST" 2>/dev/null || true

        # Remove the plist file
        rm -f "$LAUNCHD_PLIST"

        log_success "Automatic backup scheduler removed"
    else
        log_warn "No scheduler found to remove"
    fi
}

status_launchd() {
    echo "Automatic Backup Status (launchd):"
    echo "----------------------------------------"

    if [ -f "$LAUNCHD_PLIST" ]; then
        echo "  Status: Installed"
        echo "  Config: $LAUNCHD_PLIST"
        echo "  Schedule: Daily at $BACKUP_TIME"
        echo ""

        # Check if loaded
        if launchctl list | grep -q "$LAUNCHD_LABEL"; then
            echo "  Service: Loaded"
        else
            echo "  Service: Not loaded"
            echo ""
            log_warn "Scheduler is installed but not loaded"
            log_info "Load it with: launchctl load $LAUNCHD_PLIST"
        fi

        # Show recent logs if available
        if [ -f "${LOG_DIR}/backup-auto.log" ]; then
            echo ""
            echo "Recent backup log (last 10 lines):"
            echo "----------------------------------------"
            tail -n 10 "${LOG_DIR}/backup-auto.log"
        fi
    else
        echo "  Status: Not installed"
        echo ""
        log_info "Install with: make setup-auto-backup"
    fi
}

# Linux cron functions
install_cron() {
    log_info "Setting up cron scheduler for Linux..."

    # Create cron entry
    local cron_entry="0 2 * * * $BACKUP_SCRIPT >> ${LOG_DIR}/backup-auto.log 2>&1"

    # Check if entry already exists
    if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        log_warn "Cron entry already exists"
        return
    fi

    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_COMMENT"; echo "$cron_entry") | crontab -

    log_success "Automatic backup scheduler installed"
    echo ""
    echo "Backup Schedule:"
    echo "  Time: Daily at $BACKUP_TIME"
    echo "  Script: $BACKUP_SCRIPT"
    echo "  Logs: ${LOG_DIR}/backup-auto.log"
    echo ""
    echo "To test manually: make backup-db"
}

uninstall_cron() {
    log_info "Removing cron scheduler..."

    # Remove cron entry
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | grep -v "$CRON_COMMENT" | crontab - 2>/dev/null || true

    log_success "Automatic backup scheduler removed"
}

status_cron() {
    echo "Automatic Backup Status (cron):"
    echo "----------------------------------------"

    if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        echo "  Status: Installed"
        echo "  Schedule: Daily at $BACKUP_TIME"
        echo ""
        echo "Cron entry:"
        crontab -l | grep -A 1 "$CRON_COMMENT"

        # Show recent logs if available
        if [ -f "${LOG_DIR}/backup-auto.log" ]; then
            echo ""
            echo "Recent backup log (last 10 lines):"
            echo "----------------------------------------"
            tail -n 10 "${LOG_DIR}/backup-auto.log"
        fi
    else
        echo "  Status: Not installed"
        echo ""
        log_info "Install with: make setup-auto-backup"
    fi
}

# Main command dispatcher
case "$1" in
    install)
        # Validate backup script exists
        if [ ! -f "$BACKUP_SCRIPT" ]; then
            log_error "Backup script not found: $BACKUP_SCRIPT"
            exit 1
        fi

        # Install based on OS
        if [ "$OS_TYPE" = "Darwin" ]; then
            install_launchd
        elif [ "$OS_TYPE" = "Linux" ]; then
            install_cron
        else
            log_error "Unsupported OS: $OS_TYPE"
            log_info "Supported: macOS (Darwin), Linux"
            exit 1
        fi
        ;;

    uninstall)
        if [ "$OS_TYPE" = "Darwin" ]; then
            uninstall_launchd
        elif [ "$OS_TYPE" = "Linux" ]; then
            uninstall_cron
        else
            log_error "Unsupported OS: $OS_TYPE"
            exit 1
        fi
        ;;

    status)
        if [ "$OS_TYPE" = "Darwin" ]; then
            status_launchd
        elif [ "$OS_TYPE" = "Linux" ]; then
            status_cron
        else
            log_error "Unsupported OS: $OS_TYPE"
            exit 1
        fi
        ;;

    help|--help|-h)
        show_usage
        ;;

    *)
        log_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

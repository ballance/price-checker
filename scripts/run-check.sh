#!/bin/bash

###############################################################################
# Price Checker - Automated Run Script
#
# This script is designed to be run by cron or other schedulers.
# It handles logging, error reporting, and provides a clean execution environment.
#
# Usage:
#   ./scripts/run-check.sh
#
# Cron Example:
#   0 9 * * * /path/to/price-checker/scripts/run-check.sh
#
###############################################################################

# Exit on any error
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/cron.log"
ERROR_LOG="$LOG_DIR/error.log"
STATUS_LOG="$LOG_DIR/status.log"
MAX_LOG_LINES=1000  # Keep only last N lines to prevent log files from growing too large

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$ERROR_LOG" >&2
}

# Function to rotate logs (keep only last MAX_LOG_LINES)
rotate_log() {
    local file=$1
    if [ -f "$file" ]; then
        local lines=$(wc -l < "$file")
        if [ "$lines" -gt "$MAX_LOG_LINES" ]; then
            tail -n "$MAX_LOG_LINES" "$file" > "$file.tmp"
            mv "$file.tmp" "$file"
            log "Rotated $file (kept last $MAX_LOG_LINES lines)"
        fi
    fi
}

# Trap errors and log them
trap 'log_error "Script failed at line $LINENO"; echo "Failed: $(date)" >> "$STATUS_LOG"; exit 1' ERR

# Start logging
log "========================================="
log "Starting price check"
log "Project directory: $PROJECT_DIR"

# Change to project directory
cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log_error "node_modules not found. Running npm install..."
    npm install >> "$LOG_FILE" 2>&1
fi

# Run the price check
log "Running npm run check..."
npm run check >> "$LOG_FILE" 2>&1

# Log success
log "Price check completed successfully"
echo "Success: $(date)" >> "$STATUS_LOG"

# Rotate logs to prevent them from growing too large
rotate_log "$LOG_FILE"
rotate_log "$ERROR_LOG"

# Optional: Send notification on completion (uncomment to enable)
# if command -v mail &> /dev/null; then
#     echo "Price check completed at $(date)" | mail -s "Price Check Complete" your@email.com
# fi

log "========================================="

exit 0

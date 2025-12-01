#!/bin/bash

# Daily ATS Records Update Script
# Run this via cron job to keep ATS data up-to-date

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
CURRENT_SEASON=$(date +%Y)

# Create logs directory if it doesn't exist
mkdir -p "${LOG_DIR}"

# Log file with timestamp
LOG_FILE="${LOG_DIR}/ats-compute-$(date +%Y%m%d-%H%M%S).log"

echo "=====================================" | tee -a "${LOG_FILE}"
echo "ATS Records Daily Update" | tee -a "${LOG_FILE}"
echo "Started: $(date)" | tee -a "${LOG_FILE}"
echo "=====================================" | tee -a "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

# Change to script directory
cd "${SCRIPT_DIR}"

# Run the computation for all sports
php compute-ats-records.php --all --season="${CURRENT_SEASON}" 2>&1 | tee -a "${LOG_FILE}"

EXIT_CODE=$?

echo "" | tee -a "${LOG_FILE}"
echo "=====================================" | tee -a "${LOG_FILE}"
echo "Completed: $(date)" | tee -a "${LOG_FILE}"
echo "Exit code: ${EXIT_CODE}" | tee -a "${LOG_FILE}"
echo "=====================================" | tee -a "${LOG_FILE}"

# Keep only last 7 days of logs
find "${LOG_DIR}" -name "ats-compute-*.log" -mtime +7 -delete

exit ${EXIT_CODE}


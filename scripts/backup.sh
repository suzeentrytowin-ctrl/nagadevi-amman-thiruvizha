#!/bin/bash
# =====================================================================
# அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்
# PostgreSQL Database Automated Backup Script
# =====================================================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${PGDATABASE:-nagadevi_temple}"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"

BACKUP_FILE="${BACKUP_DIR}/nagadevi_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "🪔 Starting PostgreSQL backup for ${DB_NAME} at $(date)..."

# Export dump compressed
PGPASSWORD="${PGPASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --no-owner \
    --no-privileges \
    | gzip > "${BACKUP_FILE}"

echo "✅ Backup successfully created at: ${BACKUP_FILE}"
echo "📦 Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Keep only the last 30 daily backups
find "${BACKUP_DIR}" -type f -name "nagadevi_db_*.sql.gz" -mtime +30 -delete 2>/dev/null || true
echo "🧹 Old backups cleanup complete."


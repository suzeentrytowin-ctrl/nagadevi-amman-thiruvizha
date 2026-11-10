#!/bin/bash
# =====================================================================
# அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்
# PostgreSQL Database Restoration Script
# =====================================================================

set -e

if [ -z "$1" ]; then
    echo "❌ பயன்பாட்டு முறை (Usage): $0 <backup_file.sql.gz>"
    echo "உதாரணம் (Example): $0 ./backups/nagadevi_db_20270101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${PGDATABASE:-nagadevi_temple}"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "⚠️ எச்சரிக்கை! ${DB_NAME} தரவுத்தளம் மீண்டும் மீட்டமைக்கப்பட உள்ளது."
echo "Restoring from: ${BACKUP_FILE} to ${DB_NAME}..."

gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${PGPASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}"

echo "✅ Database restored successfully!"


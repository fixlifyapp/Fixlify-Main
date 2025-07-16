#!/bin/bash
# Supabase Database Backup Script
# This script creates a complete backup of your Supabase database

# Configuration
SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.mqppvcrlvsgrsqelglod.supabase.co:5432/postgres"
BACKUP_DIR="./supabase-backup/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting Supabase database backup..."

# 1. Full database dump with schema and data
echo "Creating full database dump..."
pg_dump $SUPABASE_DB_URL \
  --no-owner \
  --no-privileges \
  --verbose \
  --file=$BACKUP_DIR/full_backup_$TIMESTAMP.sql

# 2. Schema only dump
echo "Creating schema-only dump..."
pg_dump $SUPABASE_DB_URL \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=$BACKUP_DIR/schema_$TIMESTAMP.sql

# 3. Data only dump
echo "Creating data-only dump..."pg_dump $SUPABASE_DB_URL \
  --data-only \
  --no-owner \
  --no-privileges \
  --file=$BACKUP_DIR/data_$TIMESTAMP.sql

# 4. Individual table exports (CSV format)
echo "Exporting individual tables..."
TABLES=(
  "profiles"
  "clients"
  "jobs"
  "estimates"
  "invoices"
  "line_items"
  "payments"
  "products"
  "communication_logs"
  "phone_numbers"
  "sms_conversations"
  "sms_messages"
  "message_templates"
  "automation_workflows"
  "tasks"
  "warranties"
  "job_statuses"
  "job_custom_fields"
  "job_custom_field_values"
  "job_attachments"
  "notifications"
  "user_preferences"
  "company_settings"
  "organization_communication_settings"
)
for table in "${TABLES[@]}"; do
  echo "Exporting $table..."
  psql $SUPABASE_DB_URL -c "\COPY (SELECT * FROM $table) TO '$BACKUP_DIR/tables/${table}.csv' WITH CSV HEADER"
done

# 5. Export RLS policies
echo "Exporting RLS policies..."
pg_dump $SUPABASE_DB_URL \
  --section=post-data \
  --no-owner \
  --no-privileges \
  --file=$BACKUP_DIR/rls_policies_$TIMESTAMP.sql

# 6. Export functions and triggers
echo "Exporting functions and triggers..."
pg_dump $SUPABASE_DB_URL \
  --schema-only \
  --no-tables \
  --no-owner \
  --no-privileges \
  --file=$BACKUP_DIR/functions_triggers_$TIMESTAMP.sql

echo "Backup complete!"
echo "Files saved in: $BACKUP_DIR"
echo ""
echo "To restore the database:"
echo "psql [NEW_DATABASE_URL] < $BACKUP_DIR/full_backup_$TIMESTAMP.sql"
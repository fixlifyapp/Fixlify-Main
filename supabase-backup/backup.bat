@echo off
REM Supabase Database Backup Script for Windows
REM This script creates a complete backup of your Supabase database

REM Configuration - UPDATE THESE VALUES
SET SUPABASE_PASSWORD=YOUR-PASSWORD-HERE
SET SUPABASE_HOST=db.mqppvcrlvsgrsqelglod.supabase.co
SET SUPABASE_PORT=5432
SET SUPABASE_DB=postgres
SET SUPABASE_USER=postgres
SET BACKUP_DIR=.\supabase-backup\database

REM Get timestamp
FOR /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
SET "TIMESTAMP=%dt:~0,4%%dt:~4,2%%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%"

REM Create backup directory if it doesn't exist
IF NOT EXIST %BACKUP_DIR% mkdir %BACKUP_DIR%
IF NOT EXIST %BACKUP_DIR%\tables mkdir %BACKUP_DIR%\tables

echo Starting Supabase database backup...
echo.

REM Set PGPASSWORD environment variable
SET PGPASSWORD=%SUPABASE_PASSWORD%

REM 1. Full database dump with schema and data
echo Creating full database dump...
pg_dump -h %SUPABASE_HOST% -p %SUPABASE_PORT% -U %SUPABASE_USER% -d %SUPABASE_DB% ^
  --no-owner ^
  --no-privileges ^
  --verbose ^
  --file=%BACKUP_DIR%\full_backup_%TIMESTAMP%.sql
REM 2. Schema only dump
echo Creating schema-only dump...
pg_dump -h %SUPABASE_HOST% -p %SUPABASE_PORT% -U %SUPABASE_USER% -d %SUPABASE_DB% ^
  --schema-only ^
  --no-owner ^
  --no-privileges ^
  --file=%BACKUP_DIR%\schema_%TIMESTAMP%.sql

REM 3. Data only dump
echo Creating data-only dump...
pg_dump -h %SUPABASE_HOST% -p %SUPABASE_PORT% -U %SUPABASE_USER% -d %SUPABASE_DB% ^
  --data-only ^
  --no-owner ^
  --no-privileges ^
  --file=%BACKUP_DIR%\data_%TIMESTAMP%.sql

REM 4. Export individual tables to CSV
echo Exporting individual tables to CSV...
SET TABLES=profiles clients jobs estimates invoices line_items payments products communication_logs phone_numbers sms_conversations sms_messages message_templates automation_workflows tasks warranties job_statuses

FOR %%T IN (%TABLES%) DO (
  echo Exporting %%T...
  psql -h %SUPABASE_HOST% -p %SUPABASE_PORT% -U %SUPABASE_USER% -d %SUPABASE_DB% ^
    -c "\COPY (SELECT * FROM %%T) TO '%BACKUP_DIR%\tables\%%T.csv' WITH CSV HEADER"
)

echo.
echo Backup complete!
echo Files saved in: %BACKUP_DIR%
echo.echo To restore the database:
echo psql -h [NEW_HOST] -p [PORT] -U [USER] -d [DB] ^< %BACKUP_DIR%\full_backup_%TIMESTAMP%.sql
echo.
echo IMPORTANT: Update the SUPABASE_PASSWORD variable in this script before running!
pause
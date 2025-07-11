@echo off
echo ===================================
echo Deploying SMS/Email Database Schema
echo ===================================
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo Running migration: 20250710_sms_email_implementation.sql
echo.

REM Deploy the migration
supabase db push --db-url "postgresql://postgres.mqppvcrlvsgrsqelglod:WearPr0ud_supaF0rge_14@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration deployed successfully!
    echo.
    echo Next steps:
    echo 1. Verify tables were created in Supabase dashboard
    echo 2. Test RLS policies are working
    echo 3. Proceed with Phase 2 - Edge Functions
) else (
    echo.
    echo ❌ Migration failed. Please check the error above.
)

pause
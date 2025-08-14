@echo off
color 0A
cls
echo ================================================================================
echo                    CLAUDE CODE + SUPABASE MCP SETUP                          
echo ================================================================================
echo.

REM Set Supabase credentials
set SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
set SUPABASE_PROJECT_REF=mqppvcrlvsgrsqelglod
set SUPABASE_ACCESS_TOKEN=sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg

echo [OK] Supabase credentials loaded
echo.
echo Project: %SUPABASE_PROJECT_REF%
echo URL: %SUPABASE_URL%
echo.

REM Check if MCP server is installed
where mcp-server-supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [SETUP] Installing Supabase MCP Server...
    call npm install -g @modelcontextprotocol/server-supabase
    echo [OK] MCP Server installed!
) else (
    echo [OK] MCP Server already installed
)

REM Check if Claude Code is installed
where claude >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [SETUP] Installing Claude Code...
    call npm install -g @anthropic-ai/claude-code
    echo [OK] Claude Code installed!
) else (
    echo [OK] Claude Code already installed
)

echo.
echo ================================================================================
echo                         LAUNCHING CLAUDE CODE WITH SUPABASE                   
echo ================================================================================
echo.
echo Supabase MCP Features Available:
echo - Database queries and mutations
echo - Edge function deployment
echo - Storage operations
echo - Auth management
echo - Realtime subscriptions
echo.
echo Use commands like:
echo   "Query the jobs table"
echo   "Insert a new customer"
echo   "Deploy edge function"
echo   "Create new table with RLS"
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

REM Launch Claude Code with Supabase MCP
claude --dangerously-skip-permissions --mcp-server supabase="mcp-server-supabase --project-ref=%SUPABASE_PROJECT_REF%"

pause
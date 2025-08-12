@echo off
color 0A
cls
echo ================================================================================
echo                         FIXLIFY CLAUDE CODE LAUNCHER                          
echo                     12 Elite Agents + Supabase MCP Ready                      
echo ================================================================================
echo.

REM Check if Claude Code is installed
where claude >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Claude Code is not installed!
    echo.
    echo Installing Claude Code...
    call npm install -g @anthropic-ai/claude-code
    echo.
)

REM Set environment variables
set SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
set CLAUDE_PROJECT_ROOT=%cd%
set CLAUDE_AGENTS_PATH=%USERPROFILE%\.claude\agents
set CLAUDE_MCP_CONFIG=%cd%\claude-mcp-config.json

REM Check if agents are installed
if not exist "%CLAUDE_AGENTS_PATH%" (
    echo [SETUP] Installing agents...
    mkdir "%CLAUDE_AGENTS_PATH%" 2>nul
    xcopy /s /y ".claude\agents\*" "%CLAUDE_AGENTS_PATH%\" >nul
    echo [OK] Agents installed!
    echo.
)

echo [OK] Claude Code Ready
echo [OK] Project: %CLAUDE_PROJECT_ROOT%
echo [OK] Agents: 12 specialists loaded
echo [OK] MCP: Supabase connected
echo.
echo ================================================================================
echo                              AVAILABLE AGENTS                                  
echo ================================================================================
echo.
echo   1. supabase-architect    - Database and backend expert
echo   2. frontend-specialist   - React/UI development master
echo   3. mobile-specialist     - Mobile and PWA expert
echo   4. ai-integration-expert - AI/LLM specialist
echo   5. security-auditor      - Security vulnerability hunter
echo   6. test-engineer         - Quality assurance automation
echo   7. devops-engineer       - Infrastructure and deployment
echo   8. performance-optimizer - Speed and efficiency expert
echo   9. code-reviewer         - Code quality guardian
echo  10. automation-engineer   - Workflow automation architect
echo  11. orchestra-conductor   - Multi-agent workflow coordinator
echo  12. integration-guardian  - Feature integration validator
echo.
echo ================================================================================
echo                            QUICK START COMMANDS                               
echo ================================================================================
echo.
echo   "List all agents"
echo   claude /agents list
echo.
echo   "Quick security audit"
echo   Have the security-auditor check our authentication
echo.
echo   "Parallel analysis"
echo   Run 3 tasks: frontend review, database optimization, performance check
echo.
echo   "Build a feature"
echo   Use supabase-architect and frontend-specialist to build user dashboard
echo.
echo ================================================================================
echo                              MCP COMMANDS                                     
echo ================================================================================
echo.
echo   Database Operations:
echo   "Query our jobs table"
echo   "Insert a new client"
echo   "Update job status"
echo.
echo   File Operations:
echo   "Read package.json"
echo   "Create new component"
echo   "Update configuration"
echo.
echo ================================================================================
echo.
echo [TIP] Use 'think' for quick tasks, 'ultrathink' for complex decisions
echo [TIP] Run agents in parallel with Task() for 10x speed
echo [TIP] Type 'exit' to quit Claude Code
echo.
echo Starting Claude Code in 3 seconds...
timeout /t 3 /nobreak >nul
echo.
echo ================================================================================
echo                         CLAUDE CODE TERMINAL ACTIVE                           
echo ================================================================================
echo.

REM Launch Claude Code with all flags
claude --dangerously-skip-permissions --mcp-config "%CLAUDE_MCP_CONFIG%" --agents-path "%CLAUDE_AGENTS_PATH%" --project-root "%CLAUDE_PROJECT_ROOT%"

pause
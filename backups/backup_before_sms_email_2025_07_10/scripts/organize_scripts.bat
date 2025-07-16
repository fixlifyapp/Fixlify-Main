@echo off
echo Organizing script files...

echo Moving console scripts...
move "*CONSOLE*.js" "scripts\console-scripts\" 2>nul
move "FIX_*.js" "scripts\console-scripts\" 2>nul
move "debug*.js" "scripts\console-scripts\" 2>nul
move "DEBUG_*.js" "scripts\console-scripts\" 2>nul
move "check*.js" "scripts\console-scripts\" 2>nul
move "CHECK_*.js" "scripts\console-scripts\" 2>nul
move "quick-*.js" "scripts\console-scripts\" 2>nul
move "QUICK_*.js" "scripts\console-scripts\" 2>nul
move "RUN_THIS_IN_CONSOLE.js" "scripts\console-scripts\" 2>nul
move "test_*.js" "scripts\console-scripts\" 2>nul
move "TEST_*.js" "scripts\console-scripts\" 2>nul

echo Moving deployment scripts...
move "deploy*.bat" "scripts\deployment\" 2>nul
move "deploy*.sh" "scripts\deployment\" 2>nul
move "deploy*.ps1" "scripts\deployment\" 2>nul
move "redeploy*.bat" "scripts\deployment\" 2>nul
move "update*.bat" "scripts\deployment\" 2>nul
move "update*.sh" "scripts\deployment\" 2>nul
move "apply*.ps1" "scripts\deployment\" 2>nul

echo Moving database scripts...
move "*.sql" "scripts\database\" 2>nul
move "fix_*.sql" "scripts\database\" 2>nul

echo Moving test scripts...
move "test-*.js" "scripts\testing\" 2>nul
move "test-*.bat" "scripts\testing\" 2>nul
move "test-*.ps1" "scripts\testing\" 2>nul

echo Moving remaining scripts...
move "setup*.js" "scripts\" 2>nul
move "add*.js" "scripts\" 2>nul
move "assign*.js" "scripts\" 2>nul
move "*phone*.js" "scripts\" 2>nul
move "*telnyx*.js" "scripts\" 2>nul

echo Moving cleanup and utility scripts...
move "cleanup*.bat" "scripts\" 2>nul
move "fix-*.js" "scripts\" 2>nul
move "organize_*.bat" "scripts\" 2>nul

echo Done! Scripts have been organized.
pause

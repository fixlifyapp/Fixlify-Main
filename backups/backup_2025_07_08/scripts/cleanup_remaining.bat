@echo off
echo Moving remaining scripts...

echo Moving utility scripts...
move "CLEAR_CACHE.js" "scripts\utilities\" 2>nul
move "count-products.js" "scripts\utilities\" 2>nul
move "browser-diagnostic.js" "scripts\utilities\" 2>nul
move "DEEP_DIAGNOSIS_SCRIPT.js" "scripts\utilities\" 2>nul
move "diagnose-sms-system.js" "scripts\utilities\" 2>nul
move "edge-function-debug.js" "scripts\utilities\" 2>nul
move "full-diagnostics.js" "scripts\utilities\" 2>nul
move "LAYOUT_DEBUG.js" "scripts\utilities\" 2>nul
move "live-page-checker.js" "scripts\utilities\" 2>nul
move "SECRETS_DEBUG_SCRIPT.js" "scripts\utilities\" 2>nul
move "system_check.js" "scripts\utilities\" 2>nul
move "unassign-all-numbers.js" "scripts\utilities\" 2>nul

echo Moving batch and shell scripts...
move "complete-setup.ps1" "scripts\deployment\" 2>nul
move "set-telnyx-secrets.ps1" "scripts\deployment\" 2>nul
move "setup-telnyx-secrets.ps1" "scripts\deployment\" 2>nul
move "set-telnyx-secrets.sh" "scripts\deployment\" 2>nul
move "setup-telnyx-secrets.sh" "scripts\deployment\" 2>nul
move "TEST_EDGE_FUNCTIONS.ps1" "scripts\testing\" 2>nul
move "fix-all-issues.ps1" "scripts\" 2>nul
move "fix-routing.bat" "scripts\" 2>nul
move "fix-routing.sh" "scripts\" 2>nul
move "git-push-changes.bat" "scripts\" 2>nul
move "install-deps.bat" "scripts\" 2>nul
move "install-deps.ps1" "scripts\" 2>nul
move "install-missing-deps.bat" "scripts\" 2>nul
move "link-supabase.bat" "scripts\" 2>nul
move "start-dev.bat" "scripts\" 2>nul
move "cleanup_edge_functions.sh" "scripts\" 2>nul
move "CHECK_CONTEXT_ENGINEERING.sh" "scripts\" 2>nul

echo Moving Node.js scripts...
move "assign-phone-flexible.mjs" "scripts\" 2>nul
move "assign-phone-node.mjs" "scripts\" 2>nul

echo Moving HTML test files...
move "context-browser.html" "scripts\testing\" 2>nul
move "direct-test.html" "scripts\testing\" 2>nul

echo Moving text files...
move "commit-message.txt" "docs\" 2>nul
move "GIT_COMMIT_MESSAGE.txt" "docs\" 2>nul
move "edge-function-portal-config.txt" "docs\" 2>nul
move "edge_functions_list.txt" "docs\" 2>nul
move "temp_automations.txt" "docs\" 2>nul
move "update-portal-urls.txt" "docs\" 2>nul

echo Done! All files organized.

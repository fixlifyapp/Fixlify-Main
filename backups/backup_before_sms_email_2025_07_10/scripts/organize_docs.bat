@echo off
echo Moving Context Engineering files...
move "CONTEXT_*.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_CONTEXT.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_AI_CONTEXT_GUIDE.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_AI_GUIDE.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_RULES.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_PROJECT_KNOWLEDGE.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_PATTERNS.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_LAYOUT_PATTERNS.md" "docs\context-engineering\" 2>nul
move "FIXLIFY_QUICK_REFERENCE.md" "docs\context-engineering\" 2>nul
move "PROJECT_OVERVIEW_MASTER.md" "docs\context-engineering\" 2>nul

echo Moving Fix Documentation...
move "*_FIX.md" "docs\fixes\" 2>nul
move "*_FIXED.md" "docs\fixes\" 2>nul
move "*_FIXES_*.md" "docs\fixes\" 2>nul
move "*_FIX_*.md" "docs\fixes\" 2>nul
move "FIX_*.md" "docs\fixes\" 2>nul
move "FIXLIFY_COMMON_FIXES.md" "docs\fixes\" 2>nul
move "ALL_SYNTAX_ERRORS_FIXED.md" "docs\fixes\" 2>nul
move "PROBLEMS_FIXED.md" "docs\fixes\" 2>nul
move "SIMPLE_FIX_CLIENT_JOBS.md" "docs\fixes\" 2>nul

echo Moving Automation Documentation...
move "AUTOMATION*.md" "docs\automation\" 2>nul
move "*AUTOMATION*.md" "docs\automation\" 2>nul
move "WORKFLOW*.md" "docs\automation\" 2>nul
move "TASK_AUTOMATION*.md" "docs\automation\" 2>nul

echo Moving Setup Guides...
move "*SETUP*.md" "docs\setup-guides\" 2>nul
move "COMPLETE_SETUP_GUIDE.md" "docs\setup-guides\" 2>nul
move "ENVIRONMENT_SETUP.md" "docs\setup-guides\" 2>nul
move "MCP_SETUP_INSTRUCTIONS.md" "docs\setup-guides\" 2>nul
move "PROFILE_SETUP_INSTRUCTIONS.md" "docs\setup-guides\" 2>nul
move "FIXLIFY_SETUP_GUIDE.md" "docs\setup-guides\" 2>nul

echo Moving Implementation Guides...
move "*IMPLEMENTATION*.md" "docs\implementation-guides\" 2>nul
move "*_COMPLETE.md" "docs\implementation-guides\" 2>nul
move "*_SUMMARY.md" "docs\implementation-guides\" 2>nul
move "*_STATUS.md" "docs\implementation-guides\" 2>nul

echo Moving System Documentation...
move "*_DOCUMENTATION.md" "docs\system-documentation\" 2>nul
move "*_SYSTEM.md" "docs\system-documentation\" 2>nul
move "PHONE_*.md" "docs\system-documentation\" 2>nul
move "TELNYX_*.md" "docs\system-documentation\" 2>nul
move "EDGE_FUNCTIONS_*.md" "docs\system-documentation\" 2>nul
move "SMS_*.md" "docs\system-documentation\" 2>nul
move "EMAIL_*.md" "docs\system-documentation\" 2>nul
move "ESTIMATES_INVOICES_*.md" "docs\system-documentation\" 2>nul

echo Moving Troubleshooting Guides...
move "*TROUBLESHOOTING*.md" "docs\troubleshooting\" 2>nul
move "*_GUIDE.md" "docs\troubleshooting\" 2>nul
move "*_INSTRUCTIONS.md" "docs\troubleshooting\" 2>nul
move "BLANK_PAGE_TROUBLESHOOTING.md" "docs\troubleshooting\" 2>nul

echo Moving remaining documentation files...
move "*.md" "docs\system-documentation\" 2>nul

echo Done! Files have been organized.
pause

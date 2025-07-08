#!/bin/bash
# Git Push Script for Fixlify Email/SMS Updates

echo "=== Pushing Fixlify Email/SMS Updates to GitHub ==="
echo ""

# Navigate to project directory
cd "C:/Users/petru/Downloads/TEST FIX SITE/3/Fixlify-Main-main"

# Check current git status
echo "📊 Current Git Status:"
git status --short
echo ""

# Add all changes
echo "📁 Adding all changes..."
git add .

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short
echo ""

# Create commit message
COMMIT_MSG="feat: Add email/SMS functionality with Mailgun and Telnyx

- Added mailgun-email edge function for email sending
- Added send-estimate edge function for estimate emails with portal links
- Created comprehensive test scripts for email/SMS testing
- Added diagnostic scripts for troubleshooting
- Implemented proper data isolation with user_id filtering
- Added communication logging for all sends
- Created deployment scripts for edge functions
- Added documentation for email/SMS setup and configuration

Edge Functions:
- mailgun-email: Handles all email sending via Mailgun API
- send-estimate: Sends estimates with portal links
- notifications: Already existed for SMS via Telnyx

Test Scripts:
- test_all_systems_fixed.js: Comprehensive system test
- diagnose_edge_functions_fixed.js: Detailed error diagnostics
- fix_email_issues.js: Automated email fix process
- debug_what_changed.js: Troubleshooting recent changes

Documentation:
- EMAIL_SMS_FIX_SUMMARY.md: Complete setup and usage guide"

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "🌿 Current branch: $CURRENT_BRANCH"

# Push to origin
echo ""
echo "🚀 Pushing to GitHub..."
git push origin "$CURRENT_BRANCH"

echo ""
echo "✅ Push complete!"
echo ""
echo "📝 Summary of changes pushed:"
echo "- Email/SMS edge functions"
echo "- Test and diagnostic scripts"
echo "- Deployment scripts"
echo "- Documentation"
echo ""
echo "🔗 Check your repository on GitHub to verify the push"

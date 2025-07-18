#!/bin/bash
# Deploy Edge Functions Script

echo "=== Deploying Supabase Edge Functions ==="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Get the project directory
PROJECT_DIR="C:/Users/petru/Downloads/TEST FIX SITE/3/Fixlify-Main-main"
cd "$PROJECT_DIR"

echo "📁 Working directory: $(pwd)"
echo ""

# Check if logged in
echo "🔐 Checking Supabase authentication..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"
echo ""

# Link to project if not already linked
if [ ! -f ".supabase/config.json" ]; then
    echo "🔗 Project not linked. Please run:"
    echo "   supabase link --project-ref mqppvcrlvsgrsqelglod"
    exit 1
fi

echo "✅ Project linked"
echo ""

# Deploy edge functions
echo "🚀 Deploying Edge Functions..."
echo ""

# Deploy mailgun-email function
echo "📧 Deploying mailgun-email function..."
supabase functions deploy mailgun-email --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ mailgun-email deployed successfully"
else
    echo "❌ Failed to deploy mailgun-email"
fi
echo ""

# Deploy send-estimate function  
echo "📋 Deploying send-estimate function..."
supabase functions deploy send-estimate
if [ $? -eq 0 ]; then
    echo "✅ send-estimate deployed successfully"
else
    echo "❌ Failed to deploy send-estimate"
fi
echo ""

# Deploy notifications function (already exists)
echo "📱 Checking notifications function..."
supabase functions deploy notifications
if [ $? -eq 0 ]; then
    echo "✅ notifications function updated"
else
    echo "❌ Failed to update notifications"
fi
echo ""

echo "=== Deployment Complete ==="
echo ""
echo "Next steps:"
echo "1. Ensure Mailgun API keys are set in Supabase secrets"
echo "2. Test email sending with the test script"
echo "3. Make sure clients have email addresses"

#!/bin/bash

echo "🚀 Deploying telnyx-phone-numbers edge function..."

# Check if logged in
echo "📋 Checking Supabase login status..."
if ! supabase status >/dev/null 2>&1; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

# Check if project is linked
echo "🔗 Checking project link..."
PROJECT_ID=$(supabase status 2>/dev/null | grep "Linked project:" | awk '{print $3}')
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project linked. Running link command..."
    supabase link --project-ref mqppvcrlvsgrsqelglod
else
    echo "✅ Linked to project: $PROJECT_ID"
fi

# Deploy the function
echo "📦 Deploying edge function..."
if supabase functions deploy telnyx-phone-numbers; then
    echo "✅ Edge function deployed successfully!"
else
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
#!/bin/bash

# Deploy Telnyx MCP Handler to Supabase Edge Functions

echo "🚀 Deploying Telnyx MCP Handler..."

# Navigate to project directory
cd "C:/Users/petru/Downloads/TEST FIX SITE/3/Fixlify-Main-main"

# Set the webhook secret (generate a secure one)
echo "Setting webhook secret..."
WEBHOOK_SECRET="mcp_secret_$(openssl rand -hex 16 2>/dev/null || cat /dev/urandom | head -c 16 | xxd -p)"
echo "Generated secret: $WEBHOOK_SECRET"

# Set secrets in Supabase
supabase secrets set SUPABASE_WEBHOOK_SECRET="$WEBHOOK_SECRET"

echo ""
echo "📝 IMPORTANT: Save this secret for Telnyx MCP configuration:"
echo "Integration Secret Identifier: SUPABASE_WEBHOOK_SECRET"
echo "Integration Secret Value: $WEBHOOK_SECRET"
echo ""

# Deploy the edge function
echo "Deploying edge function..."
supabase functions deploy telnyx-mcp-handler

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to Telnyx Dashboard → AI Assistants → MCP Servers"
echo "2. Create new MCP Server with:"
echo "   - Name: Fixlify AI Voice Assistant"
echo "   - Type: HTTP"
echo "   - URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler"
echo "   - Integration Secret: $WEBHOOK_SECRET"
echo "3. Select your Telnyx API key from the dropdown"
echo "4. Save and copy the MCP server ID"
echo "5. Run test-mcp-configuration.js in browser console"
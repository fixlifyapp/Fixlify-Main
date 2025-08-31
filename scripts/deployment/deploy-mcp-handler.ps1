# PowerShell script to deploy Telnyx MCP Handler to Supabase

Write-Host "🚀 Deploying Telnyx MCP Handler..." -ForegroundColor Cyan

# Set the webhook secret (generate a secure random string)
$webhookSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

Write-Host "📝 Generated webhook secret: $webhookSecret" -ForegroundColor Yellow
Write-Host ""

# Set the secret in Supabase
Write-Host "🔐 Setting MCP webhook secret in Supabase..." -ForegroundColor Green
supabase secrets set MCP_WEBHOOK_SECRET=$webhookSecret

# Deploy the function
Write-Host "📦 Deploying telnyx-mcp-handler edge function..." -ForegroundColor Green
supabase functions deploy telnyx-mcp-handler

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Telnyx Dashboard -> AI Assistants -> MCP Servers"
Write-Host "2. Create new MCP Server with these settings:"
Write-Host "   - Name: Fixlify AI Voice Assistant"
Write-Host "   - Type: HTTP"
Write-Host "   - URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler"
Write-Host "   - Integration Secret Identifier: MCP_WEBHOOK_SECRET"
Write-Host "   - Integration Secret Value: $webhookSecret"
Write-Host "   - API Key: [Select your Telnyx API key]"
Write-Host ""
Write-Host "3. Update your phone number to use the MCP Server"
Write-Host "4. Test with a real call to +14375249932"

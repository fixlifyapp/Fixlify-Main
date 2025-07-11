# PowerShell script to set Supabase Edge Function secrets for SMS/Email functionality

Write-Host "Setting up Supabase Edge Function secrets..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "Error: Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Function to prompt for input
function Read-HostWithDefault {
    param(
        [string]$Prompt,
        [string]$Default = ""
    )
    
    if ($Default) {
        $input = Read-Host "$Prompt [$Default]"
        if ([string]::IsNullOrWhiteSpace($input)) {
            return $Default
        }
        return $input
    } else {
        return Read-Host $Prompt
    }
}

Write-Host ""
Write-Host "Please provide the following values:" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Prompt for Telnyx API Key
$telnyxApiKey = Read-Host "Enter your Telnyx API Key"
if ([string]::IsNullOrWhiteSpace($telnyxApiKey)) {
    Write-Host "Error: Telnyx API Key is required!" -ForegroundColor Red
    exit 1
}

# Prompt for optional values
$telnyxProfileId = Read-Host "Enter your Telnyx Messaging Profile ID (optional, press Enter to skip)"
$mailgunApiKey = Read-Host "Enter your Mailgun API Key (press Enter to skip if already set)"

# Create .env file content
Write-Host ""
Write-Host "Creating .env file..." -ForegroundColor Yellow

$envContent = @"
# Production secrets for Edge Functions
TELNYX_API_KEY=$telnyxApiKey
"@

if (![string]::IsNullOrWhiteSpace($telnyxProfileId)) {
    $envContent += "`nTELNYX_MESSAGING_PROFILE_ID=$telnyxProfileId"
}

if (![string]::IsNullOrWhiteSpace($mailgunApiKey)) {
    $envContent += "`nMAILGUN_API_KEY=$mailgunApiKey"
}

# Write to file
$envPath = ".\supabase\functions\.env.production"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

# Set secrets in Supabase
Write-Host ""
Write-Host "Setting secrets in Supabase..." -ForegroundColor Yellow

try {
    supabase secrets set --env-file $envPath
    
    Write-Host ""
    Write-Host "✅ Secrets have been set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can verify the secrets were set by running:" -ForegroundColor Cyan
    Write-Host "supabase secrets list" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your SMS functionality should now be working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To test, try sending an SMS from your application or use the test scripts." -ForegroundColor Cyan
} catch {
    Write-Host "Error setting secrets: $_" -ForegroundColor Red
    exit 1
}

# Clean up
$deleteFile = Read-Host "Do you want to delete the local .env.production file for security? (y/n)"
if ($deleteFile -eq "y" -or $deleteFile -eq "Y") {
    Remove-Item $envPath -Force
    Write-Host "Local .env.production file deleted." -ForegroundColor Green
}

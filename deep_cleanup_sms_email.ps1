# Comprehensive SMS/Email Cleanup Script

$basePath = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
Set-Location $basePath

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "SMS/Email Deep Cleanup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Remove Edge Functions
Write-Host "[1/6] Removing Edge Functions..." -ForegroundColor Yellow
$edgeFunctions = @(
    "mailgun-email",
    "send-estimate",
    "send-estimate-sms", 
    "send-invoice",
    "send-invoice-sms",
    "telnyx-sms",
    "test-env",
    "send-email",
    "send-sms",
    "email-webhook",
    "sms-webhook",
    "mailgun-webhook",
    "telnyx-webhook"
)

foreach ($func in $edgeFunctions) {
    $path = "$basePath\supabase\functions\$func"
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "  Removed: $func" -ForegroundColor Red
    }
}

# 2. Clean up hooks
Write-Host ""
Write-Host "[2/6] Cleaning up hooks..." -ForegroundColor Yellow
$hooks = @(
    "src\hooks\useDocumentSending.old.ts",
    "src\hooks\useDocumentSending.broken.ts",
    "src\hooks\useUniversalDocumentSend.ts"
)

foreach ($hook in $hooks) {
    if (Test-Path "$basePath\$hook") {
        Remove-Item "$basePath\$hook" -Force
        Write-Host "  Removed: $hook" -ForegroundColor Red
    }
}

# 3. Clean up services
Write-Host ""
Write-Host "[3/6] Cleaning up services..." -ForegroundColor Yellow
$services = @(
    "src\services\communication-service.ts",
    "src\services\communications.ts"
)

foreach ($service in $services) {
    if (Test-Path "$basePath\$service") {
        Remove-Item "$basePath\$service" -Force
        Write-Host "  Removed: $service" -ForegroundColor Red
    }
}

# 4. Remove test files
Write-Host ""
Write-Host "[4/6] Removing test files..." -ForegroundColor Yellow
$testPatterns = @(
    "test_email*.js",
    "test_sms*.js",
    "test_all_systems*.js",
    "check_email*.js",
    "check_mailgun*.js",
    "diagnose_edge*.js",
    "fix_email*.js",
    "simple_test.js"
)

foreach ($pattern in $testPatterns) {
    Get-ChildItem -Path $basePath -Filter $pattern | ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Host "  Removed: $($_.Name)" -ForegroundColor Red
    }
}

# 5. Remove deployment scripts
Write-Host ""
Write-Host "[5/6] Removing deployment scripts..." -ForegroundColor Yellow
$scripts = @(
    "deploy_edge_functions.bat",
    "deploy_edge_functions.sh",
    "git_push_email_sms.bat",
    "git_push_email_sms.sh",
    "push_all_to_supabase.bat",
    "deployment_summary.sh"
)

foreach ($script in $scripts) {
    if (Test-Path "$basePath\$script") {
        Remove-Item "$basePath\$script" -Force
        Write-Host "  Removed: $script" -ForegroundColor Red
    }
}

# 6. Clean up email-service.ts to remove implementation
Write-Host ""
Write-Host "[6/6] Creating stub for email-service.ts..." -ForegroundColor Yellow

$emailServiceStub = @'
// Email service stub - implementation to be added
import { supabase } from "@/integrations/supabase/client";

export interface EmailConfig {
  to: string;
  subject: string;
  body?: string;
  html?: string;
  attachments?: any[];
}

export class EmailService {
  static async sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
    console.log("Email service stub called:", config);
    
    // TODO: Implement email sending
    return {
      success: false,
      error: "Email service not implemented yet"
    };
  }

  static async sendEstimateEmail(estimateId: string, recipientEmail: string): Promise<{ success: boolean; error?: string }> {
    console.log("Send estimate email stub:", { estimateId, recipientEmail });
    
    // TODO: Implement estimate email sending
    return {
      success: false,
      error: "Estimate email service not implemented yet"
    };
  }

  static async sendInvoiceEmail(invoiceId: string, recipientEmail: string): Promise<{ success: boolean; error?: string }> {
    console.log("Send invoice email stub:", { invoiceId, recipientEmail });
    
    // TODO: Implement invoice email sending
    return {
      success: false,
      error: "Invoice email service not implemented yet"
    };
  }
}

export default EmailService;
'@

$emailServiceStub | Out-File -FilePath "$basePath\src\services\email-service.ts" -Encoding UTF8
Write-Host "  Created email-service.ts stub" -ForegroundColor Green

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Removed all SMS/Email edge functions"
Write-Host "- Cleaned up duplicate hooks"
Write-Host "- Removed communication services"
Write-Host "- Deleted test and deployment files"
Write-Host "- Created stubs to maintain UI functionality"
Write-Host ""
Write-Host "Ready for fresh implementation!" -ForegroundColor Green

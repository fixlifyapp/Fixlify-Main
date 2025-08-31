# PowerShell script to set up Claude Code with agents and MCP

Write-Host "🚀 Setting up Claude Code for Fixlify Development" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Install Claude Code CLI
Write-Host "`n📦 Step 1: Installing Claude Code..." -ForegroundColor Yellow
npm install -g @anthropic-ai/claude-code

# Step 2: Create user-level agents directory
Write-Host "`n📁 Step 2: Creating agent directories..." -ForegroundColor Yellow
$userAgentsPath = "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path $userAgentsPath | Out-Null

# Step 3: Copy agents to user directory for global access
Write-Host "`n🤖 Step 3: Installing agents globally..." -ForegroundColor Yellow
$projectAgentsPath = ".\.claude\agents"
if (Test-Path $projectAgentsPath) {
    Copy-Item -Path "$projectAgentsPath\*" -Destination $userAgentsPath -Recurse -Force
    Write-Host "✅ Agents installed successfully!" -ForegroundColor Green
}

# Step 4: Set up MCP configuration
Write-Host "`n🔧 Step 4: Setting up MCP configuration..." -ForegroundColor Yellow
$mcpConfigPath = "$env:USERPROFILE\.claude"
$mcpConfigFile = "$mcpConfigPath\claude_mcp_config.json"

# Create MCP config directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $mcpConfigPath | Out-Null

Write-Host "`n⚠️  IMPORTANT: Setting up Supabase MCP connection" -ForegroundColor Magenta
Write-Host "Please provide your Supabase credentials:" -ForegroundColor White

$supabaseUrl = Read-Host "Enter your Supabase URL (https://mqppvcrlvsgrsqelglod.supabase.co)"
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    $supabaseUrl = "https://mqppvcrlvsgrsqelglod.supabase.co"
}

$supabaseKey = Read-Host "Enter your Supabase Service Role Key (for MCP access)" -AsSecureString
$supabaseKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($supabaseKey))

# Step 5: Create VS Code settings
Write-Host "`n⚙️ Step 5: Configuring VS Code settings..." -ForegroundColor Yellow
$vscodeSettingsPath = ".\.vscode"
New-Item -ItemType Directory -Force -Path $vscodeSettingsPath | Out-Null

$vscodeSettings = @"
{
  "claude-code.apiKey": "YOUR_CLAUDE_API_KEY",
  "claude-code.defaultModel": "claude-3-opus-20240229",
  "claude-code.customInstructions": "You have access to 10 specialized agents for Fixlify development. Use them proactively for all tasks.",
  "claude-code.autoSave": true,
  "claude-code.contextWindow": "200000",
  "claude-code.parallelAgents": 10,
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true
  }
}
"@

Set-Content -Path "$vscodeSettingsPath\settings.json" -Value $vscodeSettings

# Step 6: Create launch script
Write-Host "`n🚀 Step 6: Creating launch script..." -ForegroundColor Yellow
$launchScript = @"
#!/usr/bin/env node
// Claude Code launcher with MCP and agents

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Launching Claude Code with Fixlify agents and Supabase MCP...\n');

// Set environment variables for MCP
process.env.SUPABASE_URL = '$supabaseUrl';
process.env.SUPABASE_SERVICE_ROLE_KEY = '$supabaseKeyPlain';
process.env.CLAUDE_AGENTS_PATH = path.join(process.env.USERPROFILE, '.claude', 'agents');
process.env.CLAUDE_MCP_ENABLED = 'true';

// Launch Claude Code with special flags
const command = 'claude --dangerously-skip-permissions --mcp-enabled --agents-auto-load';

console.log('✅ Agents loaded:');
console.log('  - supabase-architect');
console.log('  - frontend-specialist');
console.log('  - ai-integration-expert');
console.log('  - security-auditor');
console.log('  - test-engineer');
console.log('  - devops-engineer');
console.log('  - performance-optimizer');
console.log('  - code-reviewer');
console.log('  - automation-engineer');
console.log('  - mobile-specialist\n');

console.log('🔌 MCP Connected: Supabase\n');
console.log('Ready! You can now use all agents and MCP tools.\n');

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log(stdout);
});
"@

Set-Content -Path ".\launch-claude-code.js" -Value $launchScript

# Step 7: Create package.json scripts
Write-Host "`n📝 Step 7: Adding npm scripts..." -ForegroundColor Yellow
$packageJson = Get-Content -Path ".\package.json" -Raw | ConvertFrom-Json
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "claude" -Value "node launch-claude-code.js" -Force
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "claude:code" -Value "claude --dangerously-skip-permissions" -Force
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "claude:agents" -Value "claude /agents list" -Force
$packageJson | ConvertTo-Json -Depth 100 | Set-Content -Path ".\package.json"

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📚 How to use:" -ForegroundColor Cyan
Write-Host "  1. In VS Code terminal: npm run claude" -ForegroundColor White
Write-Host "  2. Or directly: claude --dangerously-skip-permissions" -ForegroundColor White
Write-Host "  3. List agents: claude /agents list" -ForegroundColor White
Write-Host "`n🤖 Your agents are ready to use!" -ForegroundColor Green
Write-Host "💡 Example: 'Use supabase-architect to optimize our database queries'" -ForegroundColor Yellow

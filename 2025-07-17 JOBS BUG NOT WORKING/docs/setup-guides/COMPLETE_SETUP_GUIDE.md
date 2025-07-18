# Fixlify Complete Setup Guide - Telnyx, Mailgun & Automations

## 🚨 Current Issues & Solutions

### 1. **Automations Page Blank Issue**
**Problem**: The automations page shows blank due to property mismatches in the AutomationsList component.
**Solution**: Updated the component to use the correct properties from the `useAutomations` hook.

### 2. **Missing API Keys Configuration**
**Problem**: Telnyx and Mailgun API keys are not configured in the environment.
**Solution**: Follow the steps below to properly configure all services.

## 📋 Complete Setup Steps

### Step 1: Configure Environment Variables

Create a complete `.env` file with all necessary configurations:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg

# Telnyx Configuration
VITE_TELNYX_CONNECTION_ID=2709042883142354871
VITE_TELNYX_DEFAULT_FROM_NUMBER=+14375249932

# Note: The actual API keys should be stored in Supabase Edge Function secrets
```

### Step 2: Configure Supabase Edge Function Secrets

1. Go to your Supabase Dashboard
2. Navigate to Settings → Edge Functions
3. Add the following secrets:

```
TELNYX_API_KEY=your_telnyx_api_key_here
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your-domain.com (or use sandboxXXXX.mailgun.org for testing)
```

### Step 3: Deploy Edge Functions

Run the deployment script to ensure all edge functions are deployed:

```powershell
# Using PowerShell
.\deploy-edge-functions.ps1

# Or using bash
./deploy-edge-functions.sh
```

### Step 4: Configure Telnyx

1. **Get your Telnyx API Key**:
   - Log into Telnyx Portal
   - Go to Account → API Keys
   - Create a new API key or use existing one

2. **Verify Voice Application Settings**:
   - Application ID: `2709042883142354871`
   - Webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`
   - Phone Number: `+14375249932`

3. **Test Connection**:
   - Go to Phone Numbers page in your app
   - Click "Test Telnyx Connection"
   - Click "Add Existing Number" to connect your Telnyx number

### Step 5: Configure Mailgun

1. **Get your Mailgun API Key**:
   - Log into Mailgun Dashboard
   - Go to Settings → API Keys
   - Use your Private API key

2. **Domain Setup**:
   - For testing: Use sandbox domain (no verification needed)
   - For production: Add and verify your custom domain

3. **Update Edge Function**:
   - Add MAILGUN_API_KEY to Supabase secrets
   - Add MAILGUN_DOMAIN to Supabase secrets

### Step 6: Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create automation tables if they don't exist
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  category VARCHAR(100),
  template_id UUID,
  visual_config JSONB,
  performance_metrics JSONB,
  last_triggered_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  template_config JSONB,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  average_revenue DECIMAL(10,2),
  estimated_time_saved VARCHAR(100),
  required_integrations TEXT[],
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  execution_status VARCHAR(50),
  execution_time_ms INTEGER,
  error_details JSONB,
  variables_used JSONB,
  actions_executed JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization's workflows" ON automation_workflows
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE organization_id = automation_workflows.organization_id
  ));

CREATE POLICY "Everyone can view templates" ON automation_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can view their workflow history" ON automation_history
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM automation_workflows WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX idx_automation_history_workflow_id ON automation_history(workflow_id);
CREATE INDEX idx_automation_history_created_at ON automation_history(created_at DESC);
```

### Step 7: Test Everything

1. **Test Automations Page**:
   - Navigate to `/automations`
   - Should now display properly with create button
   - Try creating a test automation

2. **Test Telnyx Integration**:
   - Go to Phone Numbers page
   - Add your Telnyx number
   - Make a test call

3. **Test Mailgun Integration**:
   - Go to any client
   - Send a test email
   - Check email delivery

## 🔧 Troubleshooting

### Automations Page Still Blank?
1. Check browser console for errors
2. Verify organization context is loaded
3. Check that automation tables exist in database

### Telnyx Not Working?
1. Verify API key in Supabase secrets
2. Check webhook URL is accessible
3. Test with Telnyx debugging tools

### Mailgun Not Sending?
1. Verify API key permissions
2. Check domain configuration
3. For sandbox: ensure recipient is authorized

## 📝 Quick Fixes Applied

1. **Fixed AutomationsList.tsx** - Updated to use correct property names from the hook
2. **Added error handling** - Better error states for debugging
3. **Updated property mappings** - Changed from snake_case to correct property names

## 🚀 Next Steps

1. Add your actual Telnyx and Mailgun API keys
2. Test all integrations thoroughly
3. Create your first automation workflow
4. Configure AI dispatcher for phone calls
5. Set up email templates for automated campaigns

## 💡 Pro Tips

- Use Mailgun sandbox domain for testing (free)
- Monitor Telnyx webhook logs for debugging
- Check Supabase function logs for errors
- Keep API keys secure and never commit them

Need help? Check the browser console for detailed error messages!
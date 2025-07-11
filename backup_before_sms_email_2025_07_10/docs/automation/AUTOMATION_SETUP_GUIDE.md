# Fixlyfy Automation System - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install reactflow@11.11.4 framer-motion@11.1.7
```

### 2. Configure Environment Variables
Copy `.env.automation` to `.env` and fill in your API keys:

```env
# Telnyx (for SMS/Voice)
VITE_TELNYX_API_KEY=your_telnyx_api_key
VITE_TELNYX_DEFAULT_FROM_NUMBER=+1234567890
VITE_TELNYX_CONNECTION_ID=your_connection_id

# Mailgun (for Email)
VITE_MAILGUN_API_KEY=your_mailgun_api_key
VITE_MAILGUN_DOMAIN=your-domain.com
```

### 3. Apply Database Migrations
Run the PowerShell script to apply the new tables:
```powershell
.\apply-migrations.ps1
```

Or manually run:
```bash
npx supabase db push
```

### 4. Start the Application
```bash
npm run dev
```

## 📍 Accessing the Automation Features

1. Navigate to `/automations` in your browser
2. The menu item "Automations" with a lightning bolt icon is already in the sidebar

## ✨ Features Available

### Visual Workflow Builder
- Drag-and-drop interface
- Real-time preview
- Node-based workflow creation
- Support for triggers, actions, and conditions

### Smart Template Gallery
- Pre-built automation templates
- AI-powered recommendations
- Industry-specific templates
- One-click deployment

### Guided Automation Creator
- Step-by-step wizard
- Natural language input
- Beginner-friendly interface
- Built-in testing environment

### Performance Dashboard
- Real-time analytics
- ROI tracking
- Success metrics
- AI insights and recommendations

## 🔧 API Setup Instructions

### Telnyx Setup
1. Sign up at https://telnyx.com
2. Get your API key from the dashboard
3. Purchase a phone number
4. Create a messaging profile
5. Note your connection ID

### Mailgun Setup
1. Sign up at https://mailgun.com
2. Verify your domain
3. Get your API key
4. Add the domain to your .env file

## 🎯 Available Automation Types

1. **Missed Call Follow-up** - Auto-text customers when you miss their call
2. **Appointment Reminders** - Send reminders 24/48 hours before appointments
3. **Payment Collection** - Follow up on overdue invoices
4. **Review Requests** - Request reviews after job completion
5. **Estimate Follow-ups** - Convert more estimates to jobs
6. **Customer Onboarding** - Welcome new customers automatically

## 🛠️ Troubleshooting

### Import Errors
If you see import errors, ensure:
- All dependencies are installed
- The OrganizationContext is properly set up (already done)
- Environment variables are configured

### Database Errors
If automations aren't saving:
- Check that migrations were applied
- Verify Supabase connection
- Check RLS policies in Supabase dashboard

### API Errors
If SMS/Email isn't sending:
- Verify API keys are correct
- Check Telnyx/Mailgun account status
- Ensure phone numbers are in correct format (+1XXXXXXXXXX)

## 📊 Testing the System

1. **Create a Test Automation**:
   - Go to /automations
   - Click "Create Automation"
   - Choose "Missed Call Follow-up" template
   - Configure and save

2. **Test Execution**:
   - Use the built-in tester
   - Verify messages preview correctly
   - Check execution logs

3. **Monitor Performance**:
   - View the analytics dashboard
   - Check success rates
   - Monitor time saved metrics

## 🎉 You're All Set!

The automation system is now fully integrated into your Fixlyfy application. Start by exploring the templates or creating your first automation from scratch!
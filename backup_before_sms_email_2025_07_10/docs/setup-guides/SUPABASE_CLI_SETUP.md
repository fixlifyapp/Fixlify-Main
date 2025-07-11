# Supabase CLI Setup Instructions

## Step 1: Get Your Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a name like "CLI Access"
4. Copy the token (it will only be shown once!)

## Step 2: Login to Supabase CLI
Run this command in your terminal, replacing YOUR_TOKEN with the actual token:

```bash
supabase login --token YOUR_TOKEN
```

## Step 3: Link Your Project
Once logged in, run this command from your project directory:

```bash
cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
supabase link --project-ref mqppvcrlvsgrsqelglod
```

## What I Can Do Once Connected:
- Deploy edge functions
- View edge function logs
- Update edge functions
- Run database migrations
- Generate TypeScript types
- Test functions locally

Please get your token from the link above and let me know when you're ready to proceed!
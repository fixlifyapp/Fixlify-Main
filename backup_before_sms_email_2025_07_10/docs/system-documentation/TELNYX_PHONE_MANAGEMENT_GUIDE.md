# Telnyx Phone Number Management - How It Works

## Overview
The system now supports two ways for users to get phone numbers:

### 1. **Claim Existing Numbers** (Your Pre-purchased Numbers)
- These are numbers you've already purchased in your Telnyx account
- They appear in the "Your Available Numbers" tab
- Users can claim them instantly at no additional cost
- Use the "Sync from Telnyx" button to import new numbers you buy

### 2. **Purchase New Numbers** (Direct from Telnyx Inventory)
- Users search Telnyx's available inventory
- They can search by area code or city
- Shows pricing information
- Numbers are purchased using YOUR Telnyx account (charged to you)
- Automatically assigned to the user who purchases

## How the Integration Works

### Backend Flow:
```
1. User searches for numbers
   ↓
2. App queries Telnyx API for available numbers
   ↓
3. User selects a number to purchase
   ↓
4. App creates order via Telnyx API (using YOUR API key)
   ↓
5. Number is purchased (charged to YOUR Telnyx account)
   ↓
6. Number is assigned to the user in database
   ↓
7. User can now use the number for SMS/calls
```

### Cost Management:
- **You pay Telnyx** for all numbers purchased
- **Users pay you** (through your app's billing system)
- You can add markup or subscription fees

## Setting Up the Full Integration

### 1. Deploy the New Edge Function:
```bash
npx supabase functions deploy telnyx-phone-manager
```

### 2. Set the Telnyx API Key:
```bash
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
npx supabase secrets set TELNYX_CONNECTION_ID=2709100729850660858
```

### 3. Sync Your Existing Numbers:
Click "Sync from Telnyx" button to import any numbers you've already purchased

### 4. Test the Purchase Flow:
1. Go to "Purchase New" tab
2. Search for available numbers
3. Purchase a test number
4. Verify it appears in your Telnyx account

## UI Components

### PhoneNumberPurchase Component:
- **Your Available Numbers Tab**: Shows pre-purchased numbers ready to claim
- **Purchase New Tab**: Search and buy from Telnyx inventory
- **Sync Button**: Import numbers from your Telnyx account

### TelnyxSyncButton Component:
- One-click sync of your Telnyx numbers
- Shows count of newly imported numbers
- Updates the available numbers list

## API Endpoints

### Edge Function: `telnyx-phone-manager`

**Actions:**
1. `sync_telnyx_numbers` - Import your existing numbers
2. `search_available_numbers` - Search Telnyx inventory
3. `purchase_number` - Buy a new number

## Database Schema

```sql
telnyx_phone_numbers:
- phone_number (unique)
- user_id (null = available, UUID = assigned)
- status (available/active)
- telnyx_phone_number_id
- order_id
- features (array)
- purchased_at
- configured_at
```

## Billing Considerations

### Your Costs:
- Monthly rental per number (~$1-2/month)
- Usage costs (SMS ~$0.004, calls ~$0.007/min)
- One-time setup fees for some numbers

### User Billing Options:
1. **Pass-through**: Charge users exact Telnyx costs
2. **Markup**: Add percentage or fixed fee
3. **Subscription**: Include in monthly plan
4. **Pay-per-use**: Charge for SMS/minutes used

## Security

- Only authenticated users can purchase/claim numbers
- Each user can only see their own numbers
- API keys stored securely in Supabase secrets
- RLS policies enforce data isolation

## Troubleshooting

### "No numbers found"
- Check area code is valid
- Try different search criteria
- Verify Telnyx API key is correct

### "Failed to purchase"
- Check Telnyx account balance
- Verify API key permissions
- Check number is still available

### "Sync not working"
- Ensure edge function is deployed
- Check Telnyx API key in Supabase secrets
- Look at edge function logs for errors
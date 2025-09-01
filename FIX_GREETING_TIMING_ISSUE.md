# ⚠️ IF YOU HEAR "GREETING" ON FIRST CALL

## THE ISSUE:
Sometimes on the FIRST call, Telnyx might say the literal word "greeting" instead of the actual greeting message.

## WHY THIS HAPPENS:
**Timing Issue:** Telnyx starts the call before receiving the webhook response
1. Call connects → Telnyx immediately tries to play `{{greeting}}`
2. Webhook hasn't responded yet → No variable to replace
3. Telnyx says the literal text: "greeting"

## SOLUTIONS:

### Option 1: Add Delay in Telnyx (RECOMMENDED)
In your Telnyx configuration, add a 1-2 second delay before playing the greeting:
- Add a "Wait" or "Pause" action before the greeting
- This gives the webhook time to respond

### Option 2: Use Static Fallback
In Telnyx, instead of just `{{greeting}}`, use:
```
{{greeting|Hello, thanks for calling. How can I help you today?}}
```
This provides a fallback if the variable isn't ready.

### Option 3: Two-Part Greeting
1. Set a static greeting: "Hello, thanks for calling."
2. Then use `{{greeting}}` for the full greeting
3. This ensures something plays immediately

## THE SECOND CALL WORKS BECAUSE:
- The webhook response might be cached
- Or Telnyx has already loaded the variables
- The timing issue only affects the first call

## TEST YOUR FIX:
1. Make a test call
2. Hang up
3. Wait 30 seconds
4. Call again
5. Both calls should now work properly

## NOTE:
The webhook is working correctly and returns the greeting in under 500ms. This is purely a Telnyx timing issue on the first call initialization.
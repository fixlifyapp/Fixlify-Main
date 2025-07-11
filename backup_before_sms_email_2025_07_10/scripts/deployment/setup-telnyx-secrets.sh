#!/bin/bash

# Script to set Supabase Edge Function secrets for SMS/Email functionality

echo "Setting up Supabase Edge Function secrets..."
echo "============================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Error: Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Function to prompt for input with a default value
prompt_with_default() {
    local prompt=$1
    local default=$2
    local var_name=$3
    
    read -p "$prompt [$default]: " value
    value=${value:-$default}
    eval "$var_name='$value'"
}

# Prompt for values
echo ""
echo "Please provide the following values:"
echo "-----------------------------------"

read -p "Enter your Telnyx API Key: " TELNYX_API_KEY
if [ -z "$TELNYX_API_KEY" ]; then
    echo "Error: Telnyx API Key is required!"
    exit 1
fi

read -p "Enter your Telnyx Messaging Profile ID (optional, press Enter to skip): " TELNYX_MESSAGING_PROFILE_ID

read -p "Enter your Mailgun API Key (press Enter to skip if already set): " MAILGUN_API_KEY

# Create .env file
echo ""
echo "Creating .env file..."
cat > ./supabase/functions/.env.production << EOF
# Production secrets for Edge Functions
TELNYX_API_KEY=$TELNYX_API_KEY
EOF

if [ ! -z "$TELNYX_MESSAGING_PROFILE_ID" ]; then
    echo "TELNYX_MESSAGING_PROFILE_ID=$TELNYX_MESSAGING_PROFILE_ID" >> ./supabase/functions/.env.production
fi

if [ ! -z "$MAILGUN_API_KEY" ]; then
    echo "MAILGUN_API_KEY=$MAILGUN_API_KEY" >> ./supabase/functions/.env.production
fi

# Set secrets in Supabase
echo ""
echo "Setting secrets in Supabase..."
supabase secrets set --env-file ./supabase/functions/.env.production

echo ""
echo "✅ Secrets have been set successfully!"
echo ""
echo "You can verify the secrets were set by running:"
echo "supabase secrets list"
echo ""
echo "Your SMS functionality should now be working!"
echo ""
echo "To test, try sending an SMS from your application or use the test scripts."

# Clean up
read -p "Do you want to delete the local .env.production file for security? (y/n): " DELETE_FILE
if [ "$DELETE_FILE" = "y" ] || [ "$DELETE_FILE" = "Y" ]; then
    rm ./supabase/functions/.env.production
    echo "Local .env.production file deleted."
fi

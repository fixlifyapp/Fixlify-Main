// Script to set PUBLIC_SITE_URL environment variable for edge functions

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function setPublicSiteUrl() {
  console.log('Setting PUBLIC_SITE_URL environment variable...');
  
  try {
    // Set the environment variable via Supabase CLI or dashboard
    console.log(`
    ⚠️  Please run the following command to set the PUBLIC_SITE_URL:
    
    npx supabase secrets set PUBLIC_SITE_URL=https://hub.fixlify.app
    
    Or set it in the Supabase Dashboard:
    1. Go to https://supabase.com/dashboard/project/${process.env.VITE_SUPABASE_URL?.split('.')[0]}/settings/functions
    2. Add PUBLIC_SITE_URL = https://hub.fixlify.app
    `);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setPublicSiteUrl();

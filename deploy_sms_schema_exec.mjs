import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🚀 Deploying SMS/Email Database Schema...\n');

// Read the SQL file
const sqlContent = fs.readFileSync('DEPLOY_SMS_EMAIL_SCHEMA_COMPLETE.sql', 'utf8');

// Function to execute SQL via edge function
async function executeSQL(query) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/exec-sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Unknown error');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

// Split SQL content into individual statements
const statements = [];
let currentStatement = '';
let inFunction = false;
let inDollarQuote = false;

sqlContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  
  // Track dollar-quoted strings (used in functions)
  if (trimmedLine.includes('$$')) {
    inDollarQuote = !inDollarQuote;
  }
  
  // Check if we're entering a function
  if (trimmedLine.match(/^CREATE (OR REPLACE )?FUNCTION/i)) {
    inFunction = true;
  }
  
  currentStatement += line + '\n';
  
  // Check if statement is complete
  if (!inDollarQuote && trimmedLine.endsWith(';')) {
    if (inFunction && (
      trimmedLine.endsWith('LANGUAGE sql SECURITY DEFINER;') ||
      trimmedLine.endsWith('LANGUAGE plpgsql SECURITY DEFINER;') ||
      trimmedLine.endsWith('LANGUAGE plpgsql;')
    )) {
      inFunction = false;
    }
    
    if (!inFunction) {
      const stmt = currentStatement.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      currentStatement = '';
    }
  }
});

// Execute statements
async function deploySchema() {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log(`Found ${statements.length} SQL statements to execute.\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.split('\n')[0].substring(0, 60) + '...';
    
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview} `);
    
    try {
      await executeSQL(statement);
      console.log('✅');
      successCount++;
    } catch (error) {
      console.log('❌');
      errorCount++;
      errors.push({
        statement: preview,
        error: error.message
      });
    }
  }

  console.log(`\n📊 Deployment Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ statement, error }) => {
      console.log(`  - ${statement}`);
      console.log(`    Error: ${error}`);
    });
  }

  if (errorCount === 0) {
    console.log('\n🎉 Database schema deployed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Add your Telnyx phone number to the database');
    console.log('2. Test SMS at http://localhost:8081/sms-test');
  } else {
    console.log('\n⚠️ Some statements failed. The schema may be partially deployed.');
  }
}

// Run deployment
deploySchema().catch(console.error);

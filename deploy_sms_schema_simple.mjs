import fs from 'fs';

// Read .env.local file manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

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

// First, let's check what tables already exist
async function checkExistingTables() {
  const checkQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
    ORDER BY table_name;
  `;
  
  try {
    const result = await executeSQL(checkQuery);
    console.log('Existing tables:', result.data || []);
    return result.data || [];
  } catch (error) {
    console.log('Could not check existing tables:', error.message);
    return [];
  }
}

// Split SQL content into individual statements
function splitStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inFunction = false;
  let inDollarQuote = false;

  sql.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    
    // Skip pure comment lines
    if (trimmedLine.startsWith('--') && !currentStatement.trim()) {
      return;
    }
    
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
  
  return statements;
}

// Execute statements
async function deploySchema() {
  // Check existing tables first
  console.log('Checking existing tables...\n');
  const existingTables = await checkExistingTables();
  
  if (existingTables.length > 0) {
    console.log('\n⚠️  Some tables already exist. Continuing with deployment...\n');
  }
  
  const statements = splitStatements(sqlContent);
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log(`Found ${statements.length} SQL statements to execute.\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.split('\n')[0].substring(0, 50) + '...';
    
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
      
      // If it's just a "already exists" error, don't worry about it
      if (error.message.includes('already exists')) {
        console.log('    (Table/object already exists - continuing)');
      }
    }
  }

  console.log(`\n📊 Deployment Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n⚠️ Errors (some may be expected if objects already exist):');
    errors.forEach(({ statement, error }) => {
      if (!error.includes('already exists')) {
        console.log(`  - ${statement}`);
        console.log(`    Error: ${error}`);
      }
    });
  }

  // Final verification
  console.log('\n🔍 Final verification...');
  const finalTables = await checkExistingTables();
  
  if (finalTables.length === 4) {
    console.log('\n🎉 All required tables are present!');
    console.log('\n📋 Next steps:');
    console.log('1. Add your Telnyx phone number to the database');
    console.log('2. Configure Telnyx secrets in Supabase');
    console.log('3. Test SMS at http://localhost:8081/sms-test');
  } else {
    console.log(`\n⚠️ Only ${finalTables.length}/4 tables found. Please check errors above.`);
  }
}

// Run deployment
deploySchema().catch(console.error);

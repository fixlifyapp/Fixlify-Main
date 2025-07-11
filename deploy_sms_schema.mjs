import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Deploying SMS/Email Database Schema...\n');

// Read the SQL file
const sqlContent = fs.readFileSync('DEPLOY_SMS_EMAIL_SCHEMA_COMPLETE.sql', 'utf8');

// Split into individual statements (be careful with functions that contain semicolons)
const statements = [];
let currentStatement = '';
let inFunction = false;

sqlContent.split('\n').forEach(line => {
  // Check if we're entering or exiting a function definition
  if (line.trim().match(/^CREATE (OR REPLACE )?FUNCTION/i)) {
    inFunction = true;
  }
  if (line.trim() === '$$ LANGUAGE sql SECURITY DEFINER;' || 
      line.trim() === '$$ LANGUAGE plpgsql SECURITY DEFINER;' ||
      line.trim() === '$$ LANGUAGE plpgsql;') {
    inFunction = false;
    currentStatement += line + '\n';
    statements.push(currentStatement.trim());
    currentStatement = '';
    return;
  }
  
  currentStatement += line + '\n';
  
  // If not in a function and line ends with semicolon, it's end of statement
  if (!inFunction && line.trim().endsWith(';') && !line.trim().startsWith('--')) {
    statements.push(currentStatement.trim());
    currentStatement = '';
  }
});

// Deploy each statement
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i].trim();
  
  // Skip empty statements or comments
  if (!statement || statement.startsWith('--')) continue;
  
  try {
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    // Prepare the data for the edge function
    const data = JSON.stringify({ query: statement });
    
    // Execute via Supabase edge function
    const result = execSync(
      `curl -X POST "${process.env.SUPABASE_URL}/functions/v1/exec-sql" -H "Authorization: Bearer ${process.env.SUPABASE_ANON_KEY}" -H "Content-Type: application/json" -d '${data.replace(/'/g, "'\"'\"'")}'`,
      { encoding: 'utf8', shell: true }
    );
    
    console.log('✅ Success');
    successCount++;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    errorCount++;
  }
}

console.log(`\n📊 Deployment Summary:`);
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${errorCount}`);

if (errorCount === 0) {
  console.log('\n🎉 Database schema deployed successfully!');
} else {
  console.log('\n⚠️ Some statements failed. Please check the errors above.');
}

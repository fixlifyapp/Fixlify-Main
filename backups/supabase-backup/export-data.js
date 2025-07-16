// Supabase Data Export Script for Node.js
// This script exports all data from Supabase tables to JSON files

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('You need to get this from: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Tables to export
const tables = [
  'profiles',
  'clients', 
  'jobs',
  'estimates',
  'invoices',
  'line_items',
  'payments',
  'products',
  'communication_logs',
  'phone_numbers',
  'sms_conversations',
  'sms_messages'
];const moreTables = [
  'message_templates',
  'automation_workflows',
  'tasks',
  'warranties',
  'job_statuses',
  'job_custom_fields',
  'job_custom_field_values',
  'job_attachments',
  'notifications',
  'user_preferences',
  'company_settings',
  'organization_communication_settings'
];

// Combine all tables
const allTables = [...tables, ...moreTables];

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.log(`Directory ${dirPath} already exists or error creating it`);
  }
}
async function exportTable(tableName) {
  console.log(`Exporting ${tableName}...`);
  
  try {
    // Fetch all records (handling pagination if needed)
    let allRecords = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error(`Error exporting ${tableName}:`, error);
        return;
      }
      
      if (data) {
        allRecords = [...allRecords, ...data];
      }
      
      hasMore = data && data.length === pageSize;
      page++;
    }    
    // Save to JSON file
    const jsonData = JSON.stringify(allRecords, null, 2);
    const filePath = path.join(__dirname, 'database', 'tables', `${tableName}.json`);
    await fs.writeFile(filePath, jsonData);
    
    console.log(`✅ Exported ${allRecords.length} records from ${tableName}`);
  } catch (error) {
    console.error(`Failed to export ${tableName}:`, error);
  }
}

// Main export function
async function exportAllData() {
  console.log('Starting Supabase data export...\n');
  
  // Create directory for exports
  const tablesDir = path.join(__dirname, 'database', 'tables');
  await ensureDirectoryExists(tablesDir);
  
  // Export all tables
  for (const table of allTables) {
    await exportTable(table);
  }
  
  console.log('\n✅ Export complete!');
  console.log(`Data saved to: ${tablesDir}`);
}
// Also export database schema information
async function exportSchemaInfo() {
  console.log('\nExporting database schema information...');
  
  try {
    // Get all tables with their columns
    const { data: tablesInfo } = await supabase
      .rpc('get_table_info');
    
    if (tablesInfo) {
      const filePath = path.join(__dirname, 'database', 'tables-info.json');
      await fs.writeFile(filePath, JSON.stringify(tablesInfo, null, 2));
      console.log('✅ Schema information exported');
    }
  } catch (error) {
    console.log('Could not export schema information (this is normal if RPC function does not exist)');
  }
}

// Run the export
exportAllData()
  .then(() => exportSchemaInfo())
  .then(() => {
    console.log('\n📁 All data exported to ./supabase-backup/database/tables/');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Export failed:', error);
    process.exit(1);
  });
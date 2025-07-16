// Script to export all Supabase data to JSON files
// Run this script to export data from all tables

async function exportTableData(tableName) {
  console.log(`Exporting ${tableName}...`);
  
  try {
    // Execute SQL to get all data from table
    const query = `SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 10000`;
    const result = await supabaseExecuteSql(query);
    
    if (result && result.data) {
      // Save to JSON file
      const filePath = `./supabase-backup/database/tables/${tableName}.json`;
      const jsonData = JSON.stringify(result.data, null, 2);
      await writeFile(filePath, jsonData);
      
      console.log(`✅ Exported ${result.data.length} records from ${tableName}`);
      return result.data.length;
    }
  } catch (error) {
    console.error(`Failed to export ${tableName}:`, error);
    return 0;
  }
}

// Tables to export
const tables = [
  'profiles',
  'clients', 
  'jobs',
  'estimates',
  'invoices',
  'line_items',
  'payments',
  'products'
];
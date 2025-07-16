const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

// Configuration
const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYnNlIiwicmVmIjoibXFwcHZjcmx2c2dyc3FlbGdsb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNzE4MzIzOSwiZXhwIjoyMDQyNzU5MjM5fQ.WGF5xEkKqY3K1Z5KllRqO3GamMhQ7dL5aaRkohFZFAE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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
  'sms_messages',
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
]

async function exportTable(tableName) {
  console.log(`Exporting ${tableName}...`)
  
  try {
    // Fetch all records
    let allRecords = []
    let page = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)
      
      if (error) {
        console.error(`Error exporting ${tableName}:`, error.message)
        return []
      }
      
      if (data) {
        allRecords = [...allRecords, ...data]
      }
      
      hasMore = data && data.length === pageSize
      page++
    }
    
    console.log(`✅ Exported ${allRecords.length} records from ${tableName}`)
    return allRecords
  } catch (error) {
    console.error(`Failed to export ${tableName}:`, error)
    return []
  }
}

async function main() {
  console.log('Starting Supabase data export...\n')
  
  // Create directory for exports
  const exportDir = './supabase-backup/database/data'
  await fs.mkdir(exportDir, { recursive: true })
  
  const exportResults = {}
  
  // Export all tables
  for (const table of tables) {
    const data = await exportTable(table)
    if (data.length > 0) {
      exportResults[table] = data
      
      // Save to individual JSON file
      const filePath = path.join(exportDir, `${table}.json`)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    }
  }
  
  // Save complete export
  const completePath = path.join(exportDir, 'complete-export.json')
  await fs.writeFile(completePath, JSON.stringify(exportResults, null, 2))
  
  console.log('\n✅ Export complete!')
  console.log(`Data saved to: ${exportDir}`)
  
  // Print summary
  console.log('\nExport summary:')
  for (const [table, data] of Object.entries(exportResults)) {
    console.log(`- ${table}: ${data.length} records`)
  }
}

// Check if we have supabase-js installed
try {
  require.resolve('@supabase/supabase-js')
  main().catch(console.error)
} catch (e) {
  console.log('Installing @supabase/supabase-js...')
  const { execSync } = require('child_process')
  execSync('npm install @supabase/supabase-js', { stdio: 'inherit' })
  console.log('Package installed. Please run the script again.')
}

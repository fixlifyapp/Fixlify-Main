// Supabase Data Export Script
// This script exports all data from Supabase tables to JSON files

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { writeFile } from 'https://deno.land/std/fs/mod.ts'

// Configuration
const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co'
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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

async function exportTable(tableName: string) {
  console.log(`Exporting ${tableName}...`)
  
  try {
    // Fetch all records (handling pagination if needed)
    let allRecords = []
    let page = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1)
      
      if (error) {
        console.error(`Error exporting ${tableName}:`, error)
        return
      }
      
      if (data) {
        allRecords = [...allRecords, ...data]
      }
      
      hasMore = data && data.length === pageSize
      page++
    }
    
    // Save to JSON file
    const jsonData = JSON.stringify(allRecords, null, 2)
    const encoder = new TextEncoder()
    await writeFile(
      `./supabase-backup/database/tables/${tableName}.json`,
      encoder.encode(jsonData)
    )
    
    console.log(`✅ Exported ${allRecords.length} records from ${tableName}`)
  } catch (error) {
    console.error(`Failed to export ${tableName}:`, error)
  }
}

// Create directory for exports
await Deno.mkdir('./supabase-backup/database/tables', { recursive: true })

console.log('Starting Supabase data export...\n')

// Export all tables
for (const table of tables) {
  await exportTable(table)
}

console.log('\n✅ Export complete!')
console.log('Data saved to: ./supabase-backup/database/tables/')

// Also export database schema information
console.log('\nExporting database schema information...')

try {
  // Get table schemas
  const { data: tablesInfo } = await supabase
    .from('information_schema.tables')
    .select('*')
    .eq('table_schema', 'public')
  
  if (tablesInfo) {
    await writeFile(
      './supabase-backup/database/tables-info.json',
      new TextEncoder().encode(JSON.stringify(tablesInfo, null, 2))
    )
  }
} catch (error) {
  console.log('Could not export schema information (this is normal)')
}

console.log('\n📁 All data exported to ./supabase-backup/database/tables/')

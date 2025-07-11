const fs = require('fs');
const path = require('path');

// Migration directory
const migrationsDir = 'C:\\Users\\petru\\Downloads\\TEST FIX SITE\\3\\Fixlify-Main-main\\supabase\\migrations';

// Function to check migration files
async function checkMigrations() {
    console.log('Checking local migrations...\n');
    
    try {
        const files = fs.readdirSync(migrationsDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql'));
        
        console.log(`Found ${sqlFiles.length} migration files:\n`);
        
        // Group by type
        const regularMigrations = [];
        const fixMigrations = [];
        const otherMigrations = [];
        
        sqlFiles.forEach(file => {
            if (file.startsWith('202')) {
                regularMigrations.push(file);
            } else if (file.includes('fix')) {
                fixMigrations.push(file);
            } else {
                otherMigrations.push(file);
            }
        });
        
        console.log('Regular migrations (timestamped):');
        regularMigrations.sort().forEach(f => console.log(`  - ${f}`));
        
        console.log('\nFix migrations:');
        fixMigrations.forEach(f => console.log(`  - ${f}`));
        
        console.log('\nOther migrations:');
        otherMigrations.forEach(f => console.log(`  - ${f}`));
        
        // Check most recent migration
        const recentMigrations = regularMigrations.filter(f => {
            const timestamp = f.substring(0, 8);
            return timestamp >= '20250706';
        });
        
        console.log('\nMigrations from last 2 days:');
        recentMigrations.forEach(f => console.log(`  - ${f}`));
        
    } catch (error) {
        console.error('Error reading migrations:', error);
    }
}

checkMigrations();

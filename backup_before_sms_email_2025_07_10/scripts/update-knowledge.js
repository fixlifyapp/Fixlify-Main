#!/usr/bin/env node

/**
 * Auto-update Context Knowledge Base
 * Scans for new fixes and updates in the project
 */

const fs = require('fs');
const path = require('path');

function updateKnowledgeBase() {
  console.log('🔄 Auto-updating FIXLIFY_PROJECT_KNOWLEDGE.md...\n');

  const knowledgePath = path.join(process.cwd(), 'FIXLIFY_PROJECT_KNOWLEDGE.md');
  let content = fs.readFileSync(knowledgePath, 'utf8');

  // Update last modified date
  const today = new Date().toISOString().split('T')[0];
  content = content.replace(/Last Updated: .+/, `Last Updated: ${today}`);

  // Scan for new fix files
  const files = fs.readdirSync(process.cwd());
  const fixFiles = files.filter(f => f.startsWith('FIX_') && f.endsWith('.md'));
  
  console.log(`Found ${fixFiles.length} fix documentation files`);

  // Check package.json for new dependencies
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = Object.keys(packageJson.dependencies).length;
  console.log(`Total dependencies: ${deps}`);

  // Count total files in src
  const countFiles = (dir) => {
    let count = 0;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        count += countFiles(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        count++;
      }
    });
    return count;
  };

  const srcFiles = countFiles('./src');
  console.log(`Total source files: ${srcFiles}`);

  // Add statistics section if not exists
  if (!content.includes('## 📊 Project Statistics')) {
    const statsSection = `
## 📊 Project Statistics

- **Last Updated**: ${today}
- **Total Source Files**: ${srcFiles}
- **Dependencies**: ${deps}
- **Fix Documents**: ${fixFiles.length}
- **Database Migrations**: ${fs.readdirSync('./migrations').length}
`;
    
    // Insert before the first ## heading
    content = content.replace(/^##/m, statsSection + '\n##');
  }

  fs.writeFileSync(knowledgePath, content);
  console.log('\n✅ Knowledge base updated!');
}

// Add to package.json scripts
function updatePackageScripts() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (!packageJson.scripts['update-knowledge']) {
    packageJson.scripts['update-knowledge'] = 'node scripts/update-knowledge.js';
    packageJson.scripts['validate-context'] = 'node scripts/validate-context.js';
    packageJson.scripts['context-report'] = 'node scripts/context-report.js';
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added context scripts to package.json');
  }
}

updateKnowledgeBase();
updatePackageScripts();

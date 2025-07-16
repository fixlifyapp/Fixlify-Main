#!/usr/bin/env node

/**
 * Context Engineering Framework Validator
 * Validates that all context documents are present and properly formatted
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_CONTEXT_FILES = [
  'FIXLIFY_CONTEXT.md',
  'FIXLIFY_PROJECT_KNOWLEDGE.md', 
  'FIXLIFY_RULES.md',
  'FIXLIFY_PATTERNS.md',
  'FIXLIFY_AI_GUIDE.md',
  'FIXLIFY_SETUP_GUIDE.md'
];

const REQUIRED_SECTIONS = {
  'FIXLIFY_PROJECT_KNOWLEDGE.md': [
    '## 🎯 Project Context',
    '## 🏗️ Technical Stack',
    '## 📁 Project Structure',
    '## 🔑 Key Features & Modules',
    '## 🗄️ Database Schema',
    '## 🔧 Development Commands',
    '## 🐛 Recent Fixes'
  ],
  'FIXLIFY_RULES.md': [
    '## Development Rules',
    '## Code Standards',
    '## Security Rules',
    '## Performance Rules'
  ]
};

function validateContextFiles() {
  console.log('🔍 Validating Context Engineering Framework...\n');
  
  let errors = 0;
  let warnings = 0;

  // Check required files exist
  REQUIRED_CONTEXT_FILES.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required file: ${file}`);
      errors++;
    } else {
      console.log(`✅ Found: ${file}`);
      
      // Check required sections
      if (REQUIRED_SECTIONS[file]) {
        const content = fs.readFileSync(filePath, 'utf8');
        REQUIRED_SECTIONS[file].forEach(section => {
          if (!content.includes(section)) {
            console.warn(`  ⚠️  Missing section: ${section}`);
            warnings++;
          }
        });
      }
    }
  });

  // Check for outdated information
  const knowledgeFile = path.join(process.cwd(), 'FIXLIFY_PROJECT_KNOWLEDGE.md');
  if (fs.existsSync(knowledgeFile)) {
    const content = fs.readFileSync(knowledgeFile, 'utf8');
    const lastUpdateMatch = content.match(/Last Updated: (.+)/);
    if (lastUpdateMatch) {
      const lastUpdate = new Date(lastUpdateMatch[1]);
      const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 30) {
        console.warn(`\n⚠️  Knowledge base last updated ${Math.floor(daysSinceUpdate)} days ago`);
        warnings++;
      }
    }
  }

  console.log(`\n📊 Validation Results:`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}`);
  
  if (errors === 0 && warnings === 0) {
    console.log('\n✨ Context framework is valid!');
  } else if (errors > 0) {
    console.log('\n❌ Context framework has errors that need fixing.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Context framework has warnings to address.');
  }
}

validateContextFiles();

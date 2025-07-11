#!/usr/bin/env node

/**
 * Context Versioning System
 * Track changes to context documents with git-like functionality
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class ContextVersioning {
  constructor() {
    this.versionDir = '.context-versions';
    this.versionFile = path.join(this.versionDir, 'versions.json');
    this.contextFiles = [
      'FIXLIFY_PROJECT_KNOWLEDGE.md',
      'FIXLIFY_RULES.md',
      'FIXLIFY_PATTERNS.md',
      'FIXLIFY_AI_GUIDE.md',
      'FIXLIFY_SETUP_GUIDE.md',
      'CONTEXT_INDEX.md'
    ];
    
    this.init();
  }

  init() {
    if (!fs.existsSync(this.versionDir)) {
      fs.mkdirSync(this.versionDir);
      fs.writeFileSync(this.versionFile, JSON.stringify({ versions: [] }, null, 2));
      console.log('✅ Initialized context versioning system');
    }
  }

  getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  snapshot(message) {
    const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
    const timestamp = new Date().toISOString();
    const versionId = crypto.randomBytes(4).toString('hex');
    
    const snapshot = {
      id: versionId,
      timestamp,
      message,
      files: {}
    };

    // Save each context file
    this.contextFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hash = this.getFileHash(file);
        const versionedFile = path.join(this.versionDir, `${versionId}-${file}`);
        
        fs.writeFileSync(versionedFile, content);
        snapshot.files[file] = {
          hash,
          size: fs.statSync(file).size,
          lines: content.split('\n').length
        };
      }
    });

    versions.versions.push(snapshot);
    fs.writeFileSync(this.versionFile, JSON.stringify(versions, null, 2));
    
    console.log(`✅ Created snapshot: ${versionId}`);
    console.log(`   Message: ${message}`);
    console.log(`   Files: ${Object.keys(snapshot.files).length}`);
    
    return versionId;
  }

  list() {
    const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
    
    console.log('\n📚 Context Version History:');
    console.log('─'.repeat(80));
    
    versions.versions.reverse().forEach((v, index) => {
      const date = new Date(v.timestamp).toLocaleString();
      console.log(`\n${index + 1}. [${v.id}] ${date}`);
      console.log(`   ${v.message}`);
      console.log(`   Files: ${Object.keys(v.files).join(', ')}`);
    });
  }

  diff(versionId, file) {
    const versionedFile = path.join(this.versionDir, `${versionId}-${file}`);
    
    if (!fs.existsSync(versionedFile)) {
      console.error(`❌ Version ${versionId} of ${file} not found`);
      return;
    }

    const currentContent = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const versionedContent = fs.readFileSync(versionedFile, 'utf8');
    
    // Simple diff - just show if files are different
    if (currentContent === versionedContent) {
      console.log(`✅ ${file} is identical to version ${versionId}`);
    } else {
      console.log(`\n📝 Differences in ${file}:`);
      console.log('─'.repeat(80));
      
      const currentLines = currentContent.split('\n');
      const versionedLines = versionedContent.split('\n');
      
      console.log(`Current: ${currentLines.length} lines`);
      console.log(`Version ${versionId}: ${versionedLines.length} lines`);
      console.log(`Difference: ${Math.abs(currentLines.length - versionedLines.length)} lines`);
    }
  }

  restore(versionId, file = null) {
    const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
    const version = versions.versions.find(v => v.id === versionId);
    
    if (!version) {
      console.error(`❌ Version ${versionId} not found`);
      return;
    }

    const filesToRestore = file ? [file] : Object.keys(version.files);
    
    filesToRestore.forEach(f => {
      const versionedFile = path.join(this.versionDir, `${versionId}-${f}`);
      if (fs.existsSync(versionedFile)) {
        const content = fs.readFileSync(versionedFile, 'utf8');
        fs.writeFileSync(f, content);
        console.log(`✅ Restored ${f} from version ${versionId}`);
      }
    });
  }
}

// CLI interface
const cv = new ContextVersioning();
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'snapshot':
    cv.snapshot(args.join(' ') || 'Manual snapshot');
    break;
  case 'list':
    cv.list();
    break;
  case 'diff':
    if (args.length < 2) {
      console.error('Usage: context-version diff <versionId> <file>');
    } else {
      cv.diff(args[0], args[1]);
    }
    break;
  case 'restore':
    if (args.length < 1) {
      console.error('Usage: context-version restore <versionId> [file]');
    } else {
      cv.restore(args[0], args[1]);
    }
    break;
  default:
    console.log('Context Versioning System');
    console.log('Usage:');
    console.log('  context-version snapshot [message]  - Create a snapshot');
    console.log('  context-version list               - List all versions');
    console.log('  context-version diff <id> <file>   - Show differences');
    console.log('  context-version restore <id> [file] - Restore version');
}

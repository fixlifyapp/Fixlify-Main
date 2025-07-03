#!/usr/bin/env node

/**
 * Context Engineering Framework Report Generator
 * Generates a comprehensive report of the current project state
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateContextReport() {
  console.log('📊 Generating Context Engineering Report...\n');
  
  const report = [];
  const timestamp = new Date().toISOString();
  
  report.push('# Fixlify Context Engineering Report');
  report.push(`Generated: ${timestamp}\n`);

  // Git status
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    const uncommitted = execSync('git status --porcelain', { encoding: 'utf8' }).split('\n').filter(l => l).length;
    
    report.push('## Git Status');
    report.push(`- **Current Branch**: ${branch}`);
    report.push(`- **Last Commit**: ${lastCommit}`);
    report.push(`- **Uncommitted Changes**: ${uncommitted} files\n`);
  } catch (e) {
    report.push('## Git Status');
    report.push('- Unable to retrieve git status\n');
  }

  // Context files status
  report.push('## Context Files Status');
  const contextFiles = [
    'FIXLIFY_PROJECT_KNOWLEDGE.md',
    'FIXLIFY_RULES.md',
    'FIXLIFY_PATTERNS.md',
    'FIXLIFY_AI_GUIDE.md',
    'FIXLIFY_SETUP_GUIDE.md',
    'CONTEXT_INDEX.md'
  ];

  contextFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const size = (stats.size / 1024).toFixed(2);
      const modified = stats.mtime.toISOString().split('T')[0];
      report.push(`- ✅ **${file}** (${size}KB, modified: ${modified})`);
    } else {
      report.push(`- ❌ **${file}** (missing)`);
    }
  });

  // Recent fixes
  report.push('\n## Recent Fixes (Last 30 days)');
  const fixFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('FIX_') && f.endsWith('.md'))
    .map(f => {
      const stats = fs.statSync(f);
      return { name: f, time: stats.mtime };
    })
    .filter(f => (Date.now() - f.time) < 30 * 24 * 60 * 60 * 1000)
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);

  fixFiles.forEach(f => {
    const date = f.time.toISOString().split('T')[0];
    report.push(`- ${date}: ${f.name}`);
  });

  // Database migrations
  report.push('\n## Database Migrations');
  const migrations = fs.readdirSync('./migrations')
    .sort()
    .slice(-5);
  
  migrations.forEach(m => {
    report.push(`- ${m}`);
  });

  // Project health
  report.push('\n## Project Health Indicators');
  
  // Check for common issues
  const issues = [];
  
  if (!fs.existsSync('.env')) {
    issues.push('⚠️ Missing .env file');
  }
  
  const nodeModules = fs.existsSync('node_modules');
  if (!nodeModules) {
    issues.push('⚠️ node_modules not installed');
  }

  const packageLock = fs.existsSync('package-lock.json');
  if (!packageLock) {
    issues.push('⚠️ Missing package-lock.json');
  }

  if (issues.length === 0) {
    report.push('- ✅ All health checks passed');
  } else {
    issues.forEach(i => report.push(`- ${i}`));
  }

  // Recommendations
  report.push('\n## Recommendations');
  
  const knowledge = fs.readFileSync('FIXLIFY_PROJECT_KNOWLEDGE.md', 'utf8');
  const lastUpdateMatch = knowledge.match(/Last Updated: (.+)/);
  if (lastUpdateMatch) {
    const lastUpdate = new Date(lastUpdateMatch[1]);
    const daysSince = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
    if (daysSince > 7) {
      report.push(`- 📝 Update knowledge base (last updated ${daysSince} days ago)`);
    }
  }

  if (fixFiles.length > 20) {
    report.push(`- 🗂️ Consider archiving old fix files (${fixFiles.length} fix files found)`);
  }

  // Save report
  const reportPath = `context-report-${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(reportPath, report.join('\n'));
  
  console.log(`✅ Report saved to: ${reportPath}`);
  console.log('\nSummary:');
  console.log(report.slice(0, 20).join('\n'));
}

generateContextReport();

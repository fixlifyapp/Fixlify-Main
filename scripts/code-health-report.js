#!/usr/bin/env node

/**
 * Code Health Report Generator
 * Analyzes the Fixlify codebase and generates a comprehensive health report
 *
 * Usage: node scripts/code-health-report.js [--json]
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = 'src';
const SUPABASE_DIR = 'supabase/functions';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function countFiles(dir, extensions, exclude = []) {
  let count = 0;

  function walk(currentDir) {
    if (!existsSync(currentDir)) return;

    const items = readdirSync(currentDir);
    for (const item of items) {
      const fullPath = join(currentDir, item);

      if (exclude.some(ex => fullPath.includes(ex))) continue;

      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(item))) {
        count++;
      }
    }
  }

  walk(dir);
  return count;
}

function countLines(dir, extensions, exclude = []) {
  let totalLines = 0;

  function walk(currentDir) {
    if (!existsSync(currentDir)) return;

    const items = readdirSync(currentDir);
    for (const item of items) {
      const fullPath = join(currentDir, item);

      if (exclude.some(ex => fullPath.includes(ex))) continue;

      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(item))) {
        const content = readFileSync(fullPath, 'utf-8');
        totalLines += content.split('\n').length;
      }
    }
  }

  walk(dir);
  return totalLines;
}

function countPattern(dir, pattern, extensions, exclude = []) {
  let count = 0;

  function walk(currentDir) {
    if (!existsSync(currentDir)) return;

    const items = readdirSync(currentDir);
    for (const item of items) {
      const fullPath = join(currentDir, item);

      if (exclude.some(ex => fullPath.includes(ex))) continue;

      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(item))) {
        const content = readFileSync(fullPath, 'utf-8');
        const matches = content.match(pattern);
        if (matches) count += matches.length;
      }
    }
  }

  walk(dir);
  return count;
}

function getHealthScore(metrics) {
  let score = 100;

  // Deduct points for code smells
  if (metrics.consoleLogs > 500) score -= 15;
  else if (metrics.consoleLogs > 200) score -= 10;
  else if (metrics.consoleLogs > 100) score -= 5;

  if (metrics.todos > 100) score -= 10;
  else if (metrics.todos > 50) score -= 5;

  // Deduct for large files
  const avgLinesPerFile = metrics.totalLines / metrics.totalFiles;
  if (avgLinesPerFile > 300) score -= 15;
  else if (avgLinesPerFile > 200) score -= 10;
  else if (avgLinesPerFile > 150) score -= 5;

  return Math.max(0, score);
}

function getGrade(score) {
  if (score >= 90) return { grade: 'A', color: colors.green };
  if (score >= 80) return { grade: 'B', color: colors.green };
  if (score >= 70) return { grade: 'C', color: colors.yellow };
  if (score >= 60) return { grade: 'D', color: colors.yellow };
  return { grade: 'F', color: colors.red };
}

async function generateReport() {
  const jsonOutput = process.argv.includes('--json');

  if (!jsonOutput) {
    log('\n========================================', colors.cyan);
    log('       FIXLIFY CODE HEALTH REPORT      ', colors.cyan + colors.bright);
    log('========================================\n', colors.cyan);
  }

  const extensions = ['.ts', '.tsx'];
  const exclude = ['node_modules', 'dist', '.git'];

  // Collect metrics
  const metrics = {
    timestamp: new Date().toISOString(),
    totalFiles: countFiles(SRC_DIR, extensions, exclude),
    totalLines: countLines(SRC_DIR, extensions, exclude),
    consoleLogs: countPattern(SRC_DIR, /console\.log/g, extensions, exclude),
    consoleErrors: countPattern(SRC_DIR, /console\.error/g, extensions, exclude),
    consoleWarns: countPattern(SRC_DIR, /console\.warn/g, extensions, exclude),
    todos: countPattern(SRC_DIR, /TODO|FIXME/g, extensions, exclude),
    anyTypes: countPattern(SRC_DIR, /: any\b/g, extensions, exclude),
    edgeFunctions: existsSync(SUPABASE_DIR) ? readdirSync(SUPABASE_DIR).filter(f => statSync(join(SUPABASE_DIR, f)).isDirectory()).length : 0,
  };

  metrics.avgLinesPerFile = Math.round(metrics.totalLines / metrics.totalFiles);
  metrics.healthScore = getHealthScore(metrics);

  if (jsonOutput) {
    console.log(JSON.stringify(metrics, null, 2));
    return;
  }

  // Display report
  log('FILE STATISTICS', colors.bright);
  log('---------------');
  log(`  TypeScript/TSX Files: ${metrics.totalFiles}`);
  log(`  Total Lines of Code:  ${metrics.totalLines.toLocaleString()}`);
  log(`  Avg Lines per File:   ${metrics.avgLinesPerFile}`);
  log(`  Edge Functions:       ${metrics.edgeFunctions}`);

  log('\nCODE SMELLS', colors.bright);
  log('-----------');

  const logColor = metrics.consoleLogs > 200 ? colors.red : metrics.consoleLogs > 100 ? colors.yellow : colors.green;
  log(`  console.log:   ${metrics.consoleLogs}`, logColor);
  log(`  console.error: ${metrics.consoleErrors}`);
  log(`  console.warn:  ${metrics.consoleWarns}`);

  const todoColor = metrics.todos > 50 ? colors.yellow : colors.green;
  log(`  TODO/FIXME:    ${metrics.todos}`, todoColor);

  const anyColor = metrics.anyTypes > 50 ? colors.red : metrics.anyTypes > 20 ? colors.yellow : colors.green;
  log(`  'any' types:   ${metrics.anyTypes}`, anyColor);

  log('\nHEALTH SCORE', colors.bright);
  log('------------');

  const { grade, color } = getGrade(metrics.healthScore);
  log(`  Score: ${metrics.healthScore}/100  Grade: ${grade}`, color + colors.bright);

  log('\nRECOMMENDATIONS', colors.bright);
  log('---------------');

  if (metrics.consoleLogs > 100) {
    log(`  - Remove ${metrics.consoleLogs} console.log statements before production`, colors.yellow);
  }
  if (metrics.todos > 50) {
    log(`  - Address ${metrics.todos} TODO/FIXME comments or convert to issues`, colors.yellow);
  }
  if (metrics.anyTypes > 20) {
    log(`  - Replace ${metrics.anyTypes} 'any' types with proper TypeScript types`, colors.yellow);
  }
  if (metrics.avgLinesPerFile > 200) {
    log(`  - Consider splitting large files (avg ${metrics.avgLinesPerFile} lines/file)`, colors.yellow);
  }
  if (metrics.consoleLogs <= 100 && metrics.todos <= 50 && metrics.anyTypes <= 20) {
    log(`  - Codebase is in good shape!`, colors.green);
  }

  log('\n========================================\n', colors.cyan);
}

generateReport().catch(console.error);

import * as fs from 'fs';
import * as path from 'path';

// Script to find all duplicate Job interfaces and suggest fixes

const srcPath = 'C:\\Users\\petru\\Downloads\\TEST FIX SITE\\3\\Fixlify-Main-main\\src';
const results: Array<{file: string, line: number, context: string}> = [];

function findJobInterfaces(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findJobInterfaces(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.match(/^\s*(export\s+)?interface\s+Job[^a-zA-Z]/)) {
          // Skip our central definition
          if (!fullPath.includes('src\\types\\job.ts')) {
            results.push({
              file: fullPath.replace(srcPath, ''),
              line: index + 1,
              context: line.trim()
            });
          }
        }
      });
    }
  }
}

console.log('Finding all Job interface definitions...\n');
findJobInterfaces(srcPath);

console.log(`Found ${results.length} duplicate Job interface definitions:\n`);
results.forEach(r => {
  console.log(`File: ${r.file}`);
  console.log(`Line ${r.line}: ${r.context}`);
  console.log('---');
});

console.log('\nRecommended fix:');
console.log('Replace all these with: import { Job } from "@/types/job";');

#!/usr/bin/env node

/**
 * AI Context Optimizer
 * Automatically extracts and optimizes context for AI interactions
 */

const fs = require('fs');
const path = require('path');

class AIContextOptimizer {
  constructor() {
    this.maxTokens = 8000; // Approximate token limit
    this.contextCache = new Map();
  }

  optimizeForTask(task, options = {}) {
    console.log(`🤖 Optimizing context for: ${task}\n`);

    // Determine task type
    const taskType = this.classifyTask(task);
    const relevantFiles = this.getRelevantFiles(taskType, task);
    const context = this.buildOptimizedContext(relevantFiles, task, options);

    return context;
  }

  classifyTask(task) {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('bug') || taskLower.includes('fix') || taskLower.includes('error')) {
      return 'bugfix';
    }
    if (taskLower.includes('feature') || taskLower.includes('implement') || taskLower.includes('add')) {
      return 'feature';
    }
    if (taskLower.includes('database') || taskLower.includes('migration') || taskLower.includes('schema')) {
      return 'database';
    }
    if (taskLower.includes('ui') || taskLower.includes('design') || taskLower.includes('style')) {
      return 'ui';
    }
    if (taskLower.includes('performance') || taskLower.includes('optimize')) {
      return 'performance';
    }
    if (taskLower.includes('test') || taskLower.includes('debug')) {
      return 'testing';
    }
    
    return 'general';
  }

  getRelevantFiles(taskType, task) {
    const fileMap = {
      bugfix: [
        'FIXLIFY_COMMON_FIXES.md',
        'FIXLIFY_PROJECT_KNOWLEDGE.md',
        'BLANK_PAGE_TROUBLESHOOTING.md',
        'FIX_JOBS_TIMEOUT.md'
      ],
      feature: [
        'FIXLIFY_PROJECT_KNOWLEDGE.md',
        'FIXLIFY_PATTERNS.md',
        'FIXLIFY_RULES.md'
      ],
      database: [
        'FIXLIFY_PROJECT_KNOWLEDGE.md',
        'MULTITENANCY_IMPLEMENTATION.md',
        'ORGANIZATION_CONTEXT_SOLUTION.md'
      ],
      ui: [
        'FIXLIFY_PATTERNS.md',
        'FIXLIFY_PROJECT_KNOWLEDGE.md'
      ],
      performance: [
        'FIXLIFY_PROJECT_KNOWLEDGE.md',
        'FIX_JOBS_TIMEOUT.md',
        'CIRCUIT_BREAKER_FIX.md'
      ],
      testing: [
        'FIXLIFY_SETUP_GUIDE.md',
        'email_sms_test_instructions.md'
      ],
      general: [
        'FIXLIFY_PROJECT_KNOWLEDGE.md',
        'CONTEXT_INDEX.md',
        'FIXLIFY_RULES.md'
      ]
    };

    let files = fileMap[taskType] || fileMap.general;
    
    // Add task-specific files based on keywords
    if (task.includes('automation')) {
      files.push('AUTOMATION_SYSTEM_DOCUMENTATION.md');
      files.push('AUTOMATION_SAFEGUARDS.md');
    }
    if (task.includes('phone') || task.includes('sms')) {
      files.push('TELNYX_PHONE_MANAGEMENT_GUIDE.md');
    }
    if (task.includes('email')) {
      files.push('email_sms_test_instructions.md');
    }

    return [...new Set(files)]; // Remove duplicates
  }

  buildOptimizedContext(files, task, options) {
    const context = {
      task,
      type: this.classifyTask(task),
      timestamp: new Date().toISOString(),
      sections: [],
      summary: '',
      relevantCode: [],
      quickReference: {}
    };

    // Extract relevant sections from each file
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const relevantSections = this.extractRelevantSections(content, task);
        
        if (relevantSections.length > 0) {
          context.sections.push({
            file,
            sections: relevantSections
          });
        }
      }
    });

    // Generate summary
    context.summary = this.generateSummary(context.sections, task);

    // Add quick reference based on task type
    context.quickReference = this.getQuickReference(context.type);

    // Compress if needed
    if (options.compress) {
      context.compressed = this.compressContext(context);
    }

    // Save optimized context
    if (options.save) {
      const filename = `context-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(context, null, 2));
      console.log(`💾 Context saved to: ${filename}`);
    }

    return context;
  }

  extractRelevantSections(content, task) {
    const sections = [];
    const lines = content.split('\n');
    const taskKeywords = task.toLowerCase().split(/\s+/);
    
    let currentSection = null;
    let sectionContent = [];
    let relevanceScore = 0;

    lines.forEach((line, index) => {
      // Check if this is a header
      if (line.match(/^#{1,6}\s/)) {
        // Save previous section if relevant
        if (currentSection && relevanceScore > 0) {
          sections.push({
            header: currentSection,
            content: sectionContent.join('\n'),
            score: relevanceScore
          });
        }
        
        // Start new section
        currentSection = line;
        sectionContent = [];
        relevanceScore = 0;
        
        // Check header relevance
        taskKeywords.forEach(keyword => {
          if (line.toLowerCase().includes(keyword)) {
            relevanceScore += 5;
          }
        });
      } else if (currentSection) {
        sectionContent.push(line);
        
        // Check line relevance
        taskKeywords.forEach(keyword => {
          if (line.toLowerCase().includes(keyword)) {
            relevanceScore += 1;
          }
        });
      }
    });

    // Don't forget the last section
    if (currentSection && relevanceScore > 0) {
      sections.push({
        header: currentSection,
        content: sectionContent.join('\n'),
        score: relevanceScore
      });
    }

    // Sort by relevance and return top sections
    return sections
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  generateSummary(sections, task) {
    const summary = [`Task: ${task}\n`];
    
    summary.push('Relevant Documentation:');
    sections.forEach(({ file, sections: fileSections }) => {
      summary.push(`- ${file}: ${fileSections.length} relevant sections`);
    });

    summary.push('\nKey Information:');
    
    // Extract key points from top sections
    const topSections = sections
      .flatMap(s => s.sections)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    topSections.forEach(section => {
      summary.push(`- ${section.header.replace(/^#+\s/, '')}`);
    });

    return summary.join('\n');
  }

  getQuickReference(taskType) {
    const references = {
      bugfix: {
        workflow: '1. Check FIXLIFY_COMMON_FIXES.md\n2. Review error logs\n3. Test fix on all devices\n4. Update knowledge base',
        tools: 'Desktop Commander (files), Supabase MCP (database)',
        rules: 'No duplicate systems, test all devices, update docs'
      },
      feature: {
        workflow: '1. Check FIXLIFY_PATTERNS.md\n2. Design component/system\n3. Implement with tests\n4. Update documentation',
        tools: 'React + TypeScript, Supabase, Desktop Commander',
        rules: 'Follow existing patterns, maintain consistency'
      },
      database: {
        workflow: '1. Design schema changes\n2. Create migration\n3. Update RLS policies\n4. Test with different roles',
        tools: 'Supabase MCP, SQL migrations',
        rules: 'Always use RLS, maintain multi-tenancy'
      }
    };

    return references[taskType] || references.bugfix;
  }

  compressContext(context) {
    // Simple compression: remove extra whitespace and format
    const compressed = {
      task: context.task,
      type: context.type,
      summary: context.summary.replace(/\s+/g, ' '),
      key_sections: context.sections.map(s => ({
        file: s.file,
        content: s.sections[0]?.content.substring(0, 200) + '...'
      })),
      reference: context.quickReference
    };

    return JSON.stringify(compressed);
  }

  interactiveMode() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🤖 AI Context Optimizer');
    console.log('Describe your task and I\'ll prepare optimal context\n');

    rl.question('Task description: ', (task) => {
      const context = this.optimizeForTask(task, { save: true });
      
      console.log('\n📋 Optimized Context:');
      console.log('─'.repeat(80));
      console.log(context.summary);
      console.log('\n🔧 Quick Reference:');
      console.log(context.quickReference.workflow);
      
      console.log('\n💡 Suggested Context Load:');
      console.log('```');
      console.log(`Project: Fixlify AI Automate`);
      console.log(`Task Type: ${context.type}`);
      console.log(`Tools: ${context.quickReference.tools}`);
      console.log(`Reference Files: ${context.sections.map(s => s.file).join(', ')}`);
      console.log('```');
      
      rl.close();
    });
  }
}

// CLI
const optimizer = new AIContextOptimizer();
const args = process.argv.slice(2);

if (args.length === 0) {
  optimizer.interactiveMode();
} else {
  const task = args.join(' ');
  const context = optimizer.optimizeForTask(task, { save: true, compress: true });
  
  console.log('\n📋 Context Summary:');
  console.log(context.summary);
  
  if (context.compressed) {
    console.log('\n📦 Compressed Context:');
    console.log(context.compressed);
  }
}

#!/usr/bin/env node

/**
 * Context Search Tool
 * Full-text search across all documentation with advanced filtering
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ContextSearch {
  constructor() {
    this.indexFile = '.context-search-index.json';
    this.contextPatterns = [
      '*.md',
      'FIXLIFY_*.md',
      'FIX_*.md',
      '*_GUIDE.md',
      '*_SUMMARY.md'
    ];
    this.index = this.loadOrBuildIndex();
  }

  loadOrBuildIndex() {
    if (fs.existsSync(this.indexFile)) {
      const stats = fs.statSync(this.indexFile);
      const hoursSinceUpdate = (Date.now() - stats.mtime) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 24) {
        console.log('📚 Loading search index...');
        return JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
      }
    }
    
    console.log('🔨 Building search index...');
    return this.buildIndex();
  }

  buildIndex() {
    const index = {
      files: {},
      tags: {},
      updated: new Date().toISOString()
    };

    // Find all markdown files
    const files = this.findMarkdownFiles('.');
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // Extract metadata
      const metadata = {
        path: file,
        title: this.extractTitle(content),
        headers: this.extractHeaders(content),
        tags: this.extractTags(content),
        size: fs.statSync(file).size,
        modified: fs.statSync(file).mtime,
        lines: lines.length,
        searchableContent: content.toLowerCase()
      };

      index.files[file] = metadata;

      // Build tag index
      metadata.tags.forEach(tag => {
        if (!index.tags[tag]) {
          index.tags[tag] = [];
        }
        index.tags[tag].push(file);
      });
    });

    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));
    console.log(`✅ Indexed ${Object.keys(index.files).length} files`);
    
    return index;
  }

  findMarkdownFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      
      // Skip certain directories
      if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
        return;
      }
      
      if (fs.statSync(fullPath).isDirectory()) {
        this.findMarkdownFiles(fullPath, files);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled';
  }

  extractHeaders(content) {
    const headers = [];
    const regex = /^#{1,6}\s+(.+)$/gm;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      headers.push(match[1]);
    }
    
    return headers;
  }

  extractTags(content) {
    const tags = new Set();
    
    // Extract from frontmatter
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatter) {
      const tagMatch = frontmatter[1].match(/tags:\s*\[(.*?)\]/);
      if (tagMatch) {
        tagMatch[1].split(',').forEach(tag => tags.add(tag.trim()));
      }
    }
    
    // Auto-detect tags from content
    if (content.includes('fix') || content.includes('Fix')) tags.add('fix');
    if (content.includes('guide') || content.includes('Guide')) tags.add('guide');
    if (content.includes('setup') || content.includes('Setup')) tags.add('setup');
    if (content.includes('troubleshoot')) tags.add('troubleshooting');
    if (content.includes('automation')) tags.add('automation');
    if (content.includes('database') || content.includes('supabase')) tags.add('database');
    
    return Array.from(tags);
  }

  search(query, options = {}) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(this.index.files).forEach(([file, metadata]) => {
      let score = 0;
      const matches = [];
      
      // Title match (highest weight)
      if (metadata.title.toLowerCase().includes(searchTerm)) {
        score += 10;
        matches.push(`Title: "${metadata.title}"`);
      }
      
      // Header matches
      metadata.headers.forEach(header => {
        if (header.toLowerCase().includes(searchTerm)) {
          score += 5;
          matches.push(`Header: "${header}"`);
        }
      });
      
      // Content matches
      const contentMatches = (metadata.searchableContent.match(new RegExp(searchTerm, 'gi')) || []).length;
      if (contentMatches > 0) {
        score += contentMatches;
        matches.push(`Content: ${contentMatches} matches`);
      }
      
      // Tag filter
      if (options.tag && !metadata.tags.includes(options.tag)) {
        return;
      }
      
      if (score > 0) {
        results.push({
          file,
          score,
          matches,
          metadata
        });
      }
    });
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    return results;
  }

  displayResults(results, limit = 10) {
    console.log(`\n🔍 Found ${results.length} results:\n`);
    
    results.slice(0, limit).forEach((result, index) => {
      console.log(`${index + 1}. ${result.file} (score: ${result.score})`);
      console.log(`   ${result.metadata.title}`);
      console.log(`   ${result.matches.join(', ')}`);
      console.log(`   Tags: ${result.metadata.tags.join(', ') || 'none'}`);
      console.log();
    });
    
    if (results.length > limit) {
      console.log(`... and ${results.length - limit} more results`);
    }
  }

  interactiveSearch() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🔍 Context Search Tool');
    console.log('Type "help" for commands or "exit" to quit\n');

    const promptSearch = () => {
      rl.question('Search> ', (input) => {
        if (input === 'exit') {
          rl.close();
          return;
        }
        
        if (input === 'help') {
          console.log('\nCommands:');
          console.log('  <query>          - Search for query');
          console.log('  tag:<tagname>    - Filter by tag');
          console.log('  rebuild          - Rebuild search index');
          console.log('  tags             - List all tags');
          console.log('  exit             - Exit search\n');
          promptSearch();
          return;
        }
        
        if (input === 'rebuild') {
          this.index = this.buildIndex();
          promptSearch();
          return;
        }
        
        if (input === 'tags') {
          console.log('\nAvailable tags:');
          Object.entries(this.index.tags).forEach(([tag, files]) => {
            console.log(`  ${tag} (${files.length} files)`);
          });
          console.log();
          promptSearch();
          return;
        }
        
        // Parse input
        let query = input;
        let tag = null;
        
        if (input.startsWith('tag:')) {
          const parts = input.split(' ');
          tag = parts[0].substring(4);
          query = parts.slice(1).join(' ');
        }
        
        const results = this.search(query || '', { tag });
        this.displayResults(results);
        
        promptSearch();
      });
    };
    
    promptSearch();
  }
}

// CLI interface
const search = new ContextSearch();
const args = process.argv.slice(2);

if (args.length === 0) {
  search.interactiveSearch();
} else if (args[0] === 'rebuild') {
  search.buildIndex();
} else {
  const query = args.join(' ');
  const results = search.search(query);
  search.displayResults(results);
}

#!/usr/bin/env node

/**
 * Context Quality Metrics
 * Analyzes documentation quality and provides improvement suggestions
 */

const fs = require('fs');
const path = require('path');

class ContextQualityAnalyzer {
  constructor() {
    this.metrics = {
      readability: {},
      coverage: {},
      freshness: {},
      structure: {},
      overall: {}
    };
  }

  analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const stats = fs.statSync(filePath);

    return {
      path: filePath,
      readability: this.calculateReadability(content),
      coverage: this.calculateCoverage(content),
      freshness: this.calculateFreshness(stats.mtime),
      structure: this.analyzeStructure(content),
      size: {
        bytes: stats.size,
        lines: lines.length,
        words: content.split(/\s+/).length,
        characters: content.length
      }
    };
  }

  calculateReadability(content) {
    // Simple readability metrics
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const words = content.split(/\s+/).filter(w => w);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    
    // Check for complex words (> 3 syllables, approximation)
    const complexWords = words.filter(w => w.length > 8).length;
    const complexityRatio = words.length > 0 ? complexWords / words.length : 0;

    // Flesch Reading Ease approximation
    const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * complexityRatio;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      avgSentenceLength: avgSentenceLength.toFixed(1),
      complexityRatio: (complexityRatio * 100).toFixed(1) + '%',
      grade: this.getReadabilityGrade(score)
    };
  }

  getReadabilityGrade(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  calculateCoverage(content) {
    const requiredSections = [
      { pattern: /##?\s+Overview|Introduction|Context/i, name: 'Overview' },
      { pattern: /##?\s+Installation|Setup/i, name: 'Setup' },
      { pattern: /##?\s+Usage|How to/i, name: 'Usage' },
      { pattern: /##?\s+Examples?/i, name: 'Examples' },
      { pattern: /##?\s+Troubleshooting|Common Issues/i, name: 'Troubleshooting' },
      { pattern: /##?\s+API|Reference/i, name: 'API Reference' }
    ];

    const foundSections = requiredSections.filter(section => 
      section.pattern.test(content)
    );

    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

    return {
      score: (foundSections.length / requiredSections.length) * 100,
      sections: {
        found: foundSections.map(s => s.name),
        missing: requiredSections.filter(s => !foundSections.includes(s)).map(s => s.name)
      },
      elements: {
        codeBlocks,
        links,
        images
      }
    };
  }

  calculateFreshness(lastModified) {
    const daysSinceUpdate = (Date.now() - lastModified) / (1000 * 60 * 60 * 24);
    let score = 100;

    if (daysSinceUpdate > 7) score -= 10;
    if (daysSinceUpdate > 30) score -= 20;
    if (daysSinceUpdate > 90) score -= 30;
    if (daysSinceUpdate > 180) score -= 20;

    return {
      score: Math.max(0, score),
      daysSinceUpdate: Math.floor(daysSinceUpdate),
      lastModified: lastModified.toLocaleDateString(),
      status: this.getFreshnessStatus(daysSinceUpdate)
    };
  }

  getFreshnessStatus(days) {
    if (days <= 7) return 'Fresh';
    if (days <= 30) return 'Recent';
    if (days <= 90) return 'Aging';
    return 'Stale';
  }

  analyzeStructure(content) {
    const lines = content.split('\n');
    const headers = lines.filter(l => l.match(/^#{1,6}\s/));
    
    // Check header hierarchy
    let previousLevel = 0;
    let hierarchyIssues = 0;
    
    headers.forEach(header => {
      const level = header.match(/^(#{1,6})/)[1].length;
      if (level > previousLevel + 1) {
        hierarchyIssues++;
      }
      previousLevel = level;
    });

    // Check for proper spacing
    const emptyLines = lines.filter(l => l.trim() === '').length;
    const spacingRatio = emptyLines / lines.length;

    // Check list formatting
    const lists = content.match(/^[\s]*[-*+]\s/gm) || [];
    const numberedLists = content.match(/^[\s]*\d+\.\s/gm) || [];

    return {
      score: 100 - (hierarchyIssues * 10),
      headers: headers.length,
      hierarchyIssues,
      spacingQuality: spacingRatio > 0.1 && spacingRatio < 0.3 ? 'Good' : 'Poor',
      lists: lists.length + numberedLists.length
    };
  }

  generateReport(files) {
    console.log('\n📊 Context Quality Report');
    console.log('=' .repeat(80));

    let totalScore = 0;
    const fileReports = [];

    files.forEach(file => {
      const analysis = this.analyzeFile(file);
      if (analysis) {
        const overallScore = (
          analysis.readability.score * 0.3 +
          analysis.coverage.score * 0.3 +
          analysis.freshness.score * 0.2 +
          analysis.structure.score * 0.2
        );

        totalScore += overallScore;
        fileReports.push({ file, analysis, overallScore });
      }
    });

    // Sort by score
    fileReports.sort((a, b) => b.overallScore - a.overallScore);

    // Display summary
    console.log(`\n📈 Overall Quality Score: ${(totalScore / files.length).toFixed(1)}/100`);
    console.log(`📁 Files Analyzed: ${fileReports.length}`);

    // Display individual file scores
    console.log('\n📄 File Scores:');
    fileReports.forEach(({ file, analysis, overallScore }) => {
      const grade = this.getGrade(overallScore);
      console.log(`\n${file} - ${grade} (${overallScore.toFixed(1)}/100)`);
      console.log(`  📖 Readability: ${analysis.readability.grade} (${analysis.readability.score.toFixed(0)}/100)`);
      console.log(`  📋 Coverage: ${analysis.coverage.score.toFixed(0)}/100`);
      console.log(`  🕐 Freshness: ${analysis.freshness.status} (${analysis.freshness.daysSinceUpdate} days)`);
      console.log(`  🏗️  Structure: ${analysis.structure.score}/100`);
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    fileReports.forEach(({ file, analysis }) => {
      const recommendations = [];
      
      if (analysis.readability.score < 60) {
        recommendations.push(`Simplify sentences (avg: ${analysis.readability.avgSentenceLength} words)`);
      }
      
      if (analysis.coverage.sections.missing.length > 0) {
        recommendations.push(`Add missing sections: ${analysis.coverage.sections.missing.join(', ')}`);
      }
      
      if (analysis.freshness.daysSinceUpdate > 30) {
        recommendations.push(`Update content (last modified: ${analysis.freshness.lastModified})`);
      }
      
      if (analysis.structure.hierarchyIssues > 0) {
        recommendations.push(`Fix ${analysis.structure.hierarchyIssues} header hierarchy issues`);
      }

      if (recommendations.length > 0) {
        console.log(`\n${path.basename(file)}:`);
        recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
    });

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: totalScore / files.length,
      files: fileReports,
      summary: this.generateSummary(fileReports)
    };

    fs.writeFileSync('context-quality-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📊 Detailed report saved to: context-quality-report.json');
  }

  getGrade(score) {
    if (score >= 90) return '🌟 Excellent';
    if (score >= 80) return '✅ Good';
    if (score >= 70) return '📊 Fair';
    if (score >= 60) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  generateSummary(fileReports) {
    return {
      totalFiles: fileReports.length,
      averageScore: fileReports.reduce((sum, r) => sum + r.overallScore, 0) / fileReports.length,
      needsUpdate: fileReports.filter(r => r.analysis.freshness.daysSinceUpdate > 30).length,
      poorReadability: fileReports.filter(r => r.analysis.readability.score < 60).length,
      missingContent: fileReports.filter(r => r.analysis.coverage.score < 70).length
    };
  }
}

// CLI
const analyzer = new ContextQualityAnalyzer();
const contextFiles = [
  'FIXLIFY_PROJECT_KNOWLEDGE.md',
  'FIXLIFY_RULES.md',
  'FIXLIFY_PATTERNS.md',
  'FIXLIFY_AI_GUIDE.md',
  'FIXLIFY_SETUP_GUIDE.md',
  'CONTEXT_INDEX.md',
  'FIXLIFY_AI_CONTEXT_GUIDE.md'
];

analyzer.generateReport(contextFiles);

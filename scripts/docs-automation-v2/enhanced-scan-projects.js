#!/usr/bin/env node

/**
 * Enhanced Documentation Scraper for LostMind AI
 * 
 * This script provides comprehensive project discovery, content extraction,
 * and documentation generation for professional docs at docs.lostmindai.com
 * 
 * Features:
 * - Deep recursive file scanning
 * - Smart content classification
 * - Docstring/comment extraction
 * - Asset management and link validation
 * - Navigation structure generation
 * - API reference extraction
 * - Metadata enrichment
 * - Comprehensive logging and error handling
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  // Base paths to scan (can be overridden via CLI args)
  basePaths: [
    '/Users/sumitm1/Documents/New Ongoing Projects',
    process.env.PROJECTS_PATH,
  ].filter(Boolean),
  
  // Output directory for generated docs
  outputDir: './apps/docs/projects',
  
  // File patterns to include
  includePatterns: {
    docs: ['*.md', '*.mdx', '*.txt', '*.rst'],
    code: ['*.js', '*.ts', '*.jsx', '*.tsx', '*.py', '*.java', '*.go'],
    config: ['package.json', 'pyproject.toml', 'go.mod', 'pom.xml'],
    api: ['openapi.json', 'openapi.yaml', 'swagger.json', 'api.json'],
    assets: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.webp']
  },
  
  // Directories to exclude
  excludeDirs: [
    'node_modules', '.git', '.next', 'dist', 'build', '__pycache__',
    '.venv', 'venv', 'env', 'target', 'bin', 'obj', '.pytest_cache'
  ],
  
  // Project detection indicators
  projectIndicators: [
    'package.json', 'pyproject.toml', 'go.mod', 'pom.xml', 
    'Cargo.toml', 'composer.json', 'requirements.txt',
    'README.md', 'README.txt', 'CLAUDE.md', 'docs'
  ],
  
  // Content extraction settings
  extraction: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDepth: 10,
    minContentLength: 50
  }
};

// Utility Classes
class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.stats = {
      projectsFound: 0,
      filesProcessed: 0,
      errorsEncountered: 0,
      assetscopied: 0
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (level === 'error' || this.verbose || level === 'info') {
      console.log(`${prefix} ${message}`);
    }
    
    if (level === 'error') {
      this.stats.errorsEncountered++;
    }
  }

  debug(message) {
    this.log(message, 'debug');
  }

  info(message) {
    this.log(message, 'info');
  }

  error(message) {
    this.log(message, 'error');
  }

  printStats() {
    console.log('\n=== PROCESSING STATISTICS ===');
    Object.entries(this.stats).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }
}

class FileClassifier {
  static classify(filePath, content = '') {
    const filename = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();
    
    // Check filename patterns
    if (filename.includes('readme')) return 'readme';
    if (filename.includes('claude')) return 'ai-context';
    if (filename.includes('changelog') || filename.includes('changes')) return 'changelog';
    if (filename.includes('api') || filename.includes('reference')) return 'api-reference';
    if (filename.includes('guide') || filename.includes('tutorial')) return 'guide';
    if (filename.includes('quickstart') || filename.includes('getting-started')) return 'quickstart';
    if (filename.includes('architecture') || filename.includes('design')) return 'architecture';
    if (filename.includes('deployment') || filename.includes('deploy')) return 'deployment';
    if (filename.includes('development') || filename.includes('dev')) return 'development';
    if (filename.includes('security') || filename.includes('auth')) return 'security';
    if (filename.includes('migration') || filename.includes('upgrade')) return 'migration';
    
    // Check content for classification hints
    const contentLower = content.toLowerCase();
    if (contentLower.includes('# api') || contentLower.includes('## endpoints')) return 'api-reference';
    if (contentLower.includes('# quick start') || contentLower.includes('## getting started')) return 'quickstart';
    if (contentLower.includes('# architecture') || contentLower.includes('## system design')) return 'architecture';
    
    // Default classification by extension
    if (['.md', '.mdx'].includes(ext)) return 'documentation';
    if (['.js', '.ts', '.py', '.java'].includes(ext)) return 'code';
    if (filename === 'package.json') return 'config';
    if (['.json', '.yaml', '.yml'].includes(ext) && filename.includes('api')) return 'api-spec';
    
    return 'misc';
  }

  static getNavigationOrder(type) {
    const order = {
      'readme': 1,
      'quickstart': 2,
      'guide': 3,
      'api-reference': 4,
      'architecture': 5,
      'development': 6,
      'deployment': 7,
      'security': 8,
      'migration': 9,
      'changelog': 10,
      'ai-context': 11,
      'documentation': 12,
      'misc': 99
    };
    return order[type] || 50;
  }
}

class ContentExtractor {
  static async extractDocstrings(filePath, content) {
    const ext = path.extname(filePath);
    
    switch (ext) {
      case '.js':
      case '.ts':
      case '.jsx':
      case '.tsx':
        return this.extractJSDocstrings(content);
      case '.py':
        return this.extractPythonDocstrings(content);
      default:
        return [];
    }
  }

  static extractJSDocstrings(content) {
    const docstrings = [];
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\//g;
    let match;

    while ((match = jsDocRegex.exec(content)) !== null) {
      const docstring = match[1].replace(/^\s*\*/gm, '').trim();
      if (docstring.length > 20) {
        docstrings.push(docstring);
      }
    }

    return docstrings;
  }

  static extractPythonDocstrings(content) {
    const docstrings = [];
    const pythonDocRegex = /"""([\s\S]*?)"""/g;
    let match;

    while ((match = pythonDocRegex.exec(content)) !== null) {
      const docstring = match[1].trim();
      if (docstring.length > 20) {
        docstrings.push(docstring);
      }
    }

    return docstrings;
  }

  static extractFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      try {
        const frontmatter = {};
        const lines = match[1].split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length) {
            frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');
          }
        }
        return { frontmatter, content: match[2] };
      } catch (error) {
        return { frontmatter: {}, content };
      }
    }
    
    return { frontmatter: {}, content };
  }

  static enhanceFrontmatter(filePath, existingFrontmatter, projectInfo) {
    const filename = path.basename(filePath, path.extname(filePath));
    const classification = FileClassifier.classify(filePath);
    
    return {
      title: existingFrontmatter.title || this.generateTitle(filename),
      description: existingFrontmatter.description || `${classification} for ${projectInfo.name}`,
      category: existingFrontmatter.category || classification,
      project: projectInfo.name,
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: existingFrontmatter.tags || [classification, projectInfo.category],
      ...existingFrontmatter
    };
  }

  static generateTitle(filename) {
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }
}

class AssetManager {
  constructor(logger) {
    this.logger = logger;
  }

  async copyAssets(sourcePath, destPath) {
    try {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(sourcePath, destPath);
      this.logger.debug(`Copied asset: ${sourcePath} -> ${destPath}`);
      this.logger.stats.assetscopied++;
    } catch (error) {
      this.logger.error(`Failed to copy asset ${sourcePath}: ${error.message}`);
    }
  }

  async validateLinks(content, basePath) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const validatedContent = content;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, text, url] = match;
      
      if (!url.startsWith('http') && !url.startsWith('#')) {
        const fullPath = path.resolve(basePath, url);
        try {
          await fs.access(fullPath);
        } catch {
          this.logger.error(`Broken link found: ${url} in content`);
        }
      }
    }

    return validatedContent;
  }
}

class NavigationBuilder {
  constructor() {
    this.navigation = {};
  }

  addProject(projectName, files) {
    const sortedFiles = files
      .filter(file => file.classification !== 'code' && file.classification !== 'misc')
      .sort((a, b) => {
        const orderA = FileClassifier.getNavigationOrder(a.classification);
        const orderB = FileClassifier.getNavigationOrder(b.classification);
        return orderA - orderB;
      });

    this.navigation[projectName] = {
      name: projectName,
      files: sortedFiles.map(file => ({
        title: file.title,
        path: file.outputPath,
        category: file.classification
      }))
    };
  }

  generateMintlifyConfig() {
    const navigation = [];
    
    Object.entries(this.navigation).forEach(([projectName, project]) => {
      navigation.push({
        group: project.name,
        pages: project.files.map(file => file.path.replace('.mdx', '').replace('./apps/docs/', ''))
      });
    });

    return { navigation };
  }

  async save(outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(this.generateMintlifyConfig(), null, 2));
  }
}

class EnhancedProjectScanner {
  constructor(options = {}) {
    this.logger = new Logger(options.verbose);
    this.assetManager = new AssetManager(this.logger);
    this.navigationBuilder = new NavigationBuilder();
    this.options = { ...CONFIG, ...options };
  }

  async scan() {
    this.logger.info('Starting enhanced project scan...');
    
    const allProjects = [];
    
    for (const basePath of this.options.basePaths) {
      if (basePath && await this.pathExists(basePath)) {
        this.logger.info(`Scanning base path: ${basePath}`);
        const projects = await this.scanBasePath(basePath);
        allProjects.push(...projects);
      }
    }

    this.logger.info(`Found ${allProjects.length} projects`);
    this.logger.stats.projectsFound = allProjects.length;

    // Process each project
    for (const project of allProjects) {
      await this.processProject(project);
    }

    // Generate navigation
    await this.navigationBuilder.save(path.join(this.options.outputDir, '../navigation.json'));
    
    // Generate summary
    await this.generateSummary(allProjects);
    
    this.logger.printStats();
    return allProjects;
  }

  async scanBasePath(basePath) {
    const projects = [];
    
    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !this.options.excludeDirs.includes(entry.name)) {
          const projectPath = path.join(basePath, entry.name);
          
          if (await this.isProject(projectPath)) {
            const project = await this.analyzeProject(projectPath);
            if (project) {
              projects.push(project);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to scan base path ${basePath}: ${error.message}`);
    }
    
    return projects;
  }

  async isProject(projectPath) {
    for (const indicator of this.options.projectIndicators) {
      const indicatorPath = path.join(projectPath, indicator);
      if (await this.pathExists(indicatorPath)) {
        return true;
      }
    }
    return false;
  }

  async analyzeProject(projectPath) {
    try {
      const projectName = path.basename(projectPath);
      const packageJsonPath = path.join(projectPath, 'package.json');
      const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
      const readmePath = path.join(projectPath, 'README.md');
      
      let packageInfo = {};
      let description = '';
      
      // Read package.json if exists
      if (await this.pathExists(packageJsonPath)) {
        try {
          const packageContent = await fs.readFile(packageJsonPath, 'utf8');
          packageInfo = JSON.parse(packageContent);
        } catch (error) {
          this.logger.error(`Failed to parse package.json in ${projectPath}: ${error.message}`);
        }
      }
      
      // Extract description from CLAUDE.md or README.md
      for (const descPath of [claudeMdPath, readmePath]) {
        if (await this.pathExists(descPath)) {
          try {
            const content = await fs.readFile(descPath, 'utf8');
            description = this.extractDescription(content);
            if (description) break;
          } catch (error) {
            this.logger.debug(`Could not read ${descPath}: ${error.message}`);
          }
        }
      }
      
      // Scan all files in project
      const files = await this.scanProjectFiles(projectPath);
      
      return {
        name: projectName,
        path: projectPath,
        displayName: packageInfo.name || projectName,
        description: description || packageInfo.description || `${projectName} project`,
        version: packageInfo.version || '1.0.0',
        category: this.categorizeProject(projectName, packageInfo, files),
        priority: this.calculatePriority(projectName, packageInfo, files),
        files,
        metadata: {
          dependencies: packageInfo.dependencies || {},
          devDependencies: packageInfo.devDependencies || {},
          scripts: packageInfo.scripts || {},
          lastModified: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to analyze project ${projectPath}: ${error.message}`);
      return null;
    }
  }

  async scanProjectFiles(projectPath, currentDepth = 0) {
    if (currentDepth > this.options.extraction.maxDepth) {
      return [];
    }
    
    const files = [];
    
    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(projectPath, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.options.excludeDirs.includes(entry.name)) {
            const subFiles = await this.scanProjectFiles(fullPath, currentDepth + 1);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          const fileInfo = await this.analyzeFile(fullPath, projectPath);
          if (fileInfo) {
            files.push(fileInfo);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to scan files in ${projectPath}: ${error.message}`);
    }
    
    return files;
  }

  async analyzeFile(filePath, projectRoot) {
    try {
      const stats = await fs.stat(filePath);
      
      // Skip large files
      if (stats.size > this.options.extraction.maxFileSize) {
        return null;
      }
      
      const relativePath = path.relative(projectRoot, filePath);
      const ext = path.extname(filePath);
      
      // Check if file matches include patterns
      const isRelevant = this.isFileRelevant(filePath);
      if (!isRelevant) {
        return null;
      }
      
      let content = '';
      let frontmatter = {};
      
      // Read content for text files
      if (['.md', '.mdx', '.txt', '.json', '.yaml', '.yml', '.js', '.ts', '.py'].includes(ext)) {
        try {
          content = await fs.readFile(filePath, 'utf8');
          
          if (['.md', '.mdx'].includes(ext)) {
            const extracted = ContentExtractor.extractFrontmatter(content);
            frontmatter = extracted.frontmatter;
            content = extracted.content;
          }
        } catch (error) {
          this.logger.debug(`Could not read file ${filePath}: ${error.message}`);
          return null;
        }
      }
      
      const classification = FileClassifier.classify(filePath, content);
      
      // Extract docstrings from code files
      let docstrings = [];
      if (['code'].includes(classification)) {
        docstrings = await ContentExtractor.extractDocstrings(filePath, content);
      }
      
      this.logger.stats.filesProcessed++;
      
      return {
        path: filePath,
        relativePath,
        filename: path.basename(filePath),
        classification,
        size: stats.size,
        lastModified: stats.mtime,
        content: content.substring(0, 5000), // Limit content preview
        frontmatter,
        docstrings,
        title: frontmatter.title || ContentExtractor.generateTitle(path.basename(filePath, ext))
      };
    } catch (error) {
      this.logger.error(`Failed to analyze file ${filePath}: ${error.message}`);
      return null;
    }
  }

  isFileRelevant(filePath) {
    const filename = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();
    
    // Always include documentation files
    if (['.md', '.mdx', '.txt', '.rst'].includes(ext)) {
      return true;
    }
    
    // Include specific configuration files
    if (['package.json', 'tsconfig.json', 'docker-compose.yml'].includes(filename)) {
      return true;
    }
    
    // Include API specs
    if (filename.includes('openapi') || filename.includes('swagger') || filename.includes('api')) {
      return true;
    }
    
    // Include code files with likely documentation
    if (['.js', '.ts', '.py'].includes(ext) && filename.includes('index')) {
      return true;
    }
    
    return false;
  }

  async processProject(project) {
    this.logger.info(`Processing project: ${project.name}`);
    
    const outputDir = path.join(this.options.outputDir, project.name);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Process documentation files
    const processedFiles = [];
    
    for (const file of project.files.filter(f => f.classification !== 'code')) {
      try {
        const processed = await this.processDocumentationFile(file, project, outputDir);
        if (processed) {
          processedFiles.push(processed);
        }
      } catch (error) {
        this.logger.error(`Failed to process file ${file.path}: ${error.message}`);
      }
    }
    
    // Generate project index
    await this.generateProjectIndex(project, processedFiles, outputDir);
    
    // Add to navigation
    this.navigationBuilder.addProject(project.name, processedFiles);
  }

  async processDocumentationFile(file, project, outputDir) {
    if (!file.content || file.classification === 'code') {
      return null;
    }
    
    const outputFilename = this.generateOutputFilename(file);
    const outputPath = path.join(outputDir, outputFilename);
    
    // Enhance frontmatter
    const enhancedFrontmatter = ContentExtractor.enhanceFrontmatter(
      file.path, 
      file.frontmatter, 
      project
    );
    
    // Process content
    let processedContent = file.content;
    
    // Add source attribution
    const attribution = `\n\n---\n*This content was automatically extracted from ${project.name}. For the most up-to-date information, refer to the source project.*\n`;
    
    // Validate and fix links
    processedContent = await this.assetManager.validateLinks(processedContent, project.path);
    
    // Format final content
    const frontmatterYaml = Object.entries(enhancedFrontmatter)
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n');
    
    const finalContent = `---\n${frontmatterYaml}\n---\n\n${processedContent}${attribution}`;
    
    // Write file
    await fs.writeFile(outputPath, finalContent, 'utf8');
    
    return {
      ...file,
      outputPath: path.relative(this.options.outputDir, outputPath),
      enhancedFrontmatter
    };
  }

  generateOutputFilename(file) {
    const basename = path.basename(file.filename, path.extname(file.filename));
    
    // Special handling for common filenames
    if (basename.toLowerCase() === 'readme') {
      return 'readme.mdx';
    }
    
    if (basename.toLowerCase().includes('claude')) {
      return 'ai-context.mdx';
    }
    
    return `${basename.replace(/[^a-zA-Z0-9-_]/g, '-')}.mdx`;
  }

  async generateProjectIndex(project, processedFiles, outputDir) {
    const indexPath = path.join(outputDir, 'index.mdx');
    
    const content = `---
title: "${project.displayName}"
description: "${project.description}"
category: "project-overview"
project: "${project.name}"
version: "${project.version}"
lastUpdated: "${new Date().toISOString().split('T')[0]}"
---

# ${project.displayName}

${project.description}

## Overview

This project is part of the LostMind AI ecosystem and falls under the **${project.category}** category.

## Available Documentation

${processedFiles.map(file => `- [${file.title}](./${path.basename(file.outputPath, '.mdx')})`).join('\n')}

## Project Information

- **Version**: ${project.version}
- **Category**: ${project.category}
- **Priority**: ${project.priority}
- **Files Processed**: ${processedFiles.length}

## Dependencies

${Object.keys(project.metadata.dependencies).length > 0 ? 
  Object.entries(project.metadata.dependencies)
    .map(([name, version]) => `- ${name}: ${version}`)
    .join('\n') 
  : 'No dependencies found.'}

---
*This index was automatically generated. Last updated: ${new Date().toISOString()}*
`;

    await fs.writeFile(indexPath, content, 'utf8');
  }

  async generateSummary(projects) {
    const summaryPath = path.join(this.options.outputDir, '../project-summary.json');
    
    const summary = {
      generatedAt: new Date().toISOString(),
      totalProjects: projects.length,
      categories: this.getCategoryBreakdown(projects),
      projects: projects.map(p => ({
        name: p.name,
        displayName: p.displayName,
        description: p.description,
        category: p.category,
        priority: p.priority,
        fileCount: p.files.length,
        version: p.version
      })),
      statistics: this.logger.stats
    };
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
  }

  getCategoryBreakdown(projects) {
    const categories = {};
    projects.forEach(project => {
      categories[project.category] = (categories[project.category] || 0) + 1;
    });
    return categories;
  }

  extractDescription(content) {
    // Extract first meaningful paragraph
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const cleaned = line.replace(/^#+\s*/, '').trim();
      if (cleaned.length > 50 && !cleaned.startsWith('```') && !cleaned.startsWith('|')) {
        return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
      }
    }
    
    return '';
  }

  categorizeProject(name, packageInfo, files) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('turborepo') || nameLower.includes('monorepo')) return 'main-platform';
    if (nameLower.includes('ai') || nameLower.includes('rag') || nameLower.includes('embed')) return 'ai-services';
    if (nameLower.includes('web') || nameLower.includes('site') || nameLower.includes('marketing')) return 'websites';
    if (nameLower.includes('tool') || nameLower.includes('util') || nameLower.includes('helper')) return 'development-tools';
    if (nameLower.includes('doc') || nameLower.includes('guide')) return 'documentation';
    if (nameLower.includes('api') || nameLower.includes('service') || nameLower.includes('backend')) return 'backend-services';
    if (nameLower.includes('crawler') || nameLower.includes('scraper')) return 'data-processing';
    
    return 'miscellaneous';
  }

  calculatePriority(name, packageInfo, files) {
    let priority = 50; // Default priority
    
    const nameLower = name.toLowerCase();
    
    // Increase priority for main platforms
    if (nameLower.includes('turborepo') || nameLower.includes('main')) priority += 30;
    if (nameLower.includes('ai') || nameLower.includes('core')) priority += 20;
    if (nameLower.includes('prod') || nameLower.includes('production')) priority += 15;
    
    // Increase priority based on file count and documentation quality
    if (files.length > 10) priority += 10;
    if (files.some(f => f.filename.toLowerCase().includes('readme'))) priority += 5;
    if (files.some(f => f.filename.toLowerCase().includes('claude'))) priority += 8;
    
    // Increase priority for recent activity
    const recentFiles = files.filter(f => {
      const daysSinceModified = (Date.now() - f.lastModified) / (1000 * 60 * 60 * 24);
      return daysSinceModified < 30;
    });
    
    priority += Math.min(recentFiles.length * 2, 20);
    
    return Math.min(priority, 100);
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run'),
    basePath: args.find(arg => arg.startsWith('--base-path='))?.split('=')[1]
  };
  
  if (options.basePath) {
    CONFIG.basePaths = [options.basePath];
  }
  
  console.log('🚀 Enhanced Documentation Scraper for LostMind AI');
  console.log('================================================\n');
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be written\n');
  }
  
  const scanner = new EnhancedProjectScanner(options);
  
  try {
    await scanner.scan();
    console.log('\n✅ Documentation scan completed successfully!');
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
    console.log(`🌐 Ready for deployment to docs.lostmindai.com`);
  } catch (error) {
    console.error('\n❌ Scan failed:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  EnhancedProjectScanner,
  CONFIG,
  Logger,
  FileClassifier,
  ContentExtractor,
  AssetManager,
  NavigationBuilder
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
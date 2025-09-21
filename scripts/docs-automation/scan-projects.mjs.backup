#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectScanner {
  constructor() {
    this.basePath = '/Users/sumitm1/Documents/New Ongoing Projects';
    this.outputPath = path.join(__dirname, '../../apps/docs/config/discovered-projects.json');
    this.projects = [];
  }

  async scan() {
    console.log('🔍 Scanning for LostMind AI projects...');
    
    try {
      const entries = await fs.readdir(this.basePath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const projectPath = path.join(this.basePath, entry.name);
          const projectInfo = await this.analyzeProject(projectPath, entry.name);
          
          if (projectInfo) {
            this.projects.push(projectInfo);
            console.log(`✅ Found project: ${entry.name}`);
          }
        }
      }
      
      await this.saveResults();
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Error scanning projects:', error.message);
    }
  }

  async analyzeProject(projectPath, projectName) {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) return null;

      const files = await fs.readdir(projectPath);
      
      // Check for project indicators
      const hasPackageJson = files.includes('package.json');
      const hasReadme = files.some(file => file.toLowerCase().startsWith('readme'));
      const hasClaudeFile = files.includes('CLAUDE.md');
      const hasDocs = files.includes('docs');
      const hasGit = files.includes('.git');
      
      // Skip if no project indicators
      if (!hasPackageJson && !hasReadme && !hasClaudeFile && !hasDocs) {
        return null;
      }

      const project = {
        name: projectName,
        path: projectPath,
        slug: this.createSlug(projectName),
        indicators: {
          hasPackageJson,
          hasReadme,
          hasClaudeFile,
          hasDocs,
          hasGit
        },
        lastModified: stats.mtime,
        discovered: new Date().toISOString()
      };

      // Try to get additional metadata
      await this.enrichProjectData(project, projectPath, files);
      
      return project;
      
    } catch (error) {
      console.warn(`⚠️  Error analyzing ${projectName}:`, error.message);
      return null;
    }
  }

  async enrichProjectData(project, projectPath, files) {
    // Try to read package.json for metadata
    if (project.indicators.hasPackageJson) {
      try {
        const packagePath = path.join(projectPath, 'package.json');
        const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
        project.metadata = {
          name: packageData.name,
          description: packageData.description,
          version: packageData.version,
          scripts: Object.keys(packageData.scripts || {}),
          dependencies: Object.keys(packageData.dependencies || {}),
          framework: this.detectFramework(packageData)
        };
      } catch (error) {
        // Ignore package.json read errors
      }
    }

    // Try to read CLAUDE.md for project description
    if (project.indicators.hasClaudeFile) {
      try {
        const claudePath = path.join(projectPath, 'CLAUDE.md');
        const claudeContent = await fs.readFile(claudePath, 'utf8');
        
        // Extract first meaningful paragraph as description
        const lines = claudeContent.split('\n');
        for (const line of lines) {
          if (line.trim() && !line.startsWith('#') && !line.startsWith('*') && line.length > 20) {
            project.claudeDescription = line.trim();
            break;
          }
        }
      } catch (error) {
        // Ignore CLAUDE.md read errors
      }
    }

    // Check for documentation structure
    if (project.indicators.hasDocs) {
      try {
        const docsPath = path.join(projectPath, 'docs');
        const docsFiles = await fs.readdir(docsPath);
        project.docsStructure = docsFiles.filter(file => 
          file.endsWith('.md') || !file.includes('.')
        );
      } catch (error) {
        // Ignore docs read errors
      }
    }

    // Detect project type and priority
    project.category = this.categorizeProject(project);
    project.priority = this.calculatePriority(project);
  }

  detectFramework(packageData) {
    const deps = { ...packageData.dependencies, ...packageData.devDependencies };
    
    if (deps.next) return 'Next.js';
    if (deps.react) return 'React';
    if (deps.vue) return 'Vue.js';
    if (deps.fastapi || deps.uvicorn) return 'FastAPI';
    if (deps.express) return 'Express.js';
    if (deps.turborepo || deps.turbo) return 'TurboRepo';
    if (deps.vite) return 'Vite';
    
    return 'Unknown';
  }

  categorizeProject(project) {
    const name = project.name.toLowerCase();
    
    if (name.includes('turborepo') || name.includes('lostmindai-turborepo')) {
      return 'main-platform';
    }
    if (name.includes('rag') || name.includes('embedding')) {
      return 'ai-backend';
    }
    if (name.includes('xlsm') || name.includes('finance')) {
      return 'finance-tools';
    }
    if (name.includes('doc') && name.includes('documentation')) {
      return 'documentation';
    }
    if (name.includes('tool') || name.includes('analyzer')) {
      return 'development-tools';
    }
    
    return 'other';
  }

  calculatePriority(project) {
    let priority = 0;
    
    // Higher priority for main platforms
    if (project.category === 'main-platform') priority += 100;
    if (project.category === 'ai-backend') priority += 80;
    if (project.category === 'finance-tools') priority += 60;
    
    // Recent activity adds priority
    const daysSinceModified = (Date.now() - new Date(project.lastModified)) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 7) priority += 30;
    else if (daysSinceModified < 30) priority += 15;
    
    // Documentation quality adds priority
    if (project.indicators.hasClaudeFile) priority += 10;
    if (project.indicators.hasDocs) priority += 10;
    if (project.metadata?.framework === 'TurboRepo') priority += 20;
    
    return priority;
  }

  createSlug(projectName) {
    return projectName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async saveResults() {
    try {
      // Ensure config directory exists
      await fs.mkdir(path.dirname(this.outputPath), { recursive: true });
      
      const output = {
        scanDate: new Date().toISOString(),
        projectCount: this.projects.length,
        basePath: this.basePath,
        categories: this.getCategorySummary(),
        projects: this.projects.sort((a, b) => b.priority - a.priority)
      };
      
      await fs.writeFile(
        this.outputPath, 
        JSON.stringify(output, null, 2), 
        'utf8'
      );
      
      console.log(`💾 Results saved to: ${this.outputPath}`);
      
    } catch (error) {
      console.error('❌ Error saving results:', error.message);
    }
  }

  getCategorySummary() {
    const categories = {};
    this.projects.forEach(project => {
      categories[project.category] = (categories[project.category] || 0) + 1;
    });
    return categories;
  }

  printSummary() {
    console.log('\n📊 Project Discovery Summary');
    console.log('================================');
    console.log(`Total projects found: ${this.projects.length}`);
    
    console.log('\nProjects by category:');
    const categories = this.getCategorySummary();
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}`);
    });
    
    console.log('\nProjects by type:');
    const withPackageJson = this.projects.filter(p => p.indicators.hasPackageJson).length;
    const withDocs = this.projects.filter(p => p.indicators.hasDocs).length;
    const withClaude = this.projects.filter(p => p.indicators.hasClaudeFile).length;
    
    console.log(`- With package.json: ${withPackageJson}`);
    console.log(`- With docs folder: ${withDocs}`);
    console.log(`- With CLAUDE.md: ${withClaude}`);
    
    console.log('\nTop priority projects:');
    this.projects
      .slice(0, 5)
      .forEach(project => {
        const date = new Date(project.lastModified).toLocaleDateString();
        console.log(`- ${project.name} (Priority: ${project.priority}, ${date})`);
      });
  }
}

// Run scanner if called directly
const scanner = new ProjectScanner();
scanner.scan().catch(console.error);
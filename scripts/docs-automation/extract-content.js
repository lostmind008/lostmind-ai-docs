#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class MintlifyContentExtractor {
  constructor() {
    this.configPath = path.join(__dirname, '../../apps/docs/config/discovered-projects.json');
    this.docsPath = path.join(__dirname, '../../apps/docs');
    this.projectsPath = path.join(this.docsPath, 'projects');
    this.templatesPath = path.join(__dirname, '../templates');
  }

  async extract() {
    console.log('📄 Extracting content for Mintlify documentation...');
    
    try {
      const config = JSON.parse(await fs.readFile(this.configPath, 'utf8'));
      
      // Create projects directory
      await fs.mkdir(this.projectsPath, { recursive: true });
      
      // Extract content for each project
      for (const project of config.projects) {
        console.log(`🔄 Processing: ${project.name}`);
        await this.extractProjectContent(project);
      }
      
      // Update navigation in mint.json
      await this.updateMintNavigation(config.projects);
      
      console.log('✅ Content extraction complete!');
      
    } catch (error) {
      console.error('❌ Error extracting content:', error.message);
    }
  }

  async extractProjectContent(project) {
    const projectSlug = project.slug;
    const outputDir = path.join(this.projectsPath, projectSlug);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate main project page
    await this.generateProjectIndex(project, outputDir);
    
    // Extract different types of content
    if (project.indicators.hasReadme) {
      await this.extractReadme(project, outputDir);
    }
    
    if (project.indicators.hasDocs) {
      await this.extractDocs(project, outputDir);
    }
    
    if (project.indicators.hasClaudeFile) {
      await this.extractClaudeFile(project, outputDir);
    }
    
    // Generate architecture overview if we have enough info
    await this.generateArchitectureOverview(project, outputDir);
  }

  async generateProjectIndex(project, outputDir) {
    const content = `---
title: "${project.name}"
description: "${project.claudeDescription || project.metadata?.description || 'LostMind AI project documentation'}"
---

# ${project.name}

${project.claudeDescription || project.metadata?.description || 'No description available'}

<Info>
**Last Updated:** ${new Date(project.lastModified).toLocaleDateString()}  
**Category:** ${project.category.replace('-', ' ')}  
**Framework:** ${project.metadata?.framework || 'Unknown'}  
**Priority:** ${project.priority}
</Info>

## 📋 Project Overview

${this.generateProjectOverview(project)}

## 📚 Available Documentation

<CardGroup cols={2}>
${project.indicators.hasReadme ? `  <Card title="📖 README" icon="book-open" href="./${project.slug}/readme">
    Complete project overview and setup instructions
  </Card>` : ''}

${project.indicators.hasDocs ? `  <Card title="📚 Technical Docs" icon="files" href="./${project.slug}/docs">
    Detailed technical documentation and guides
  </Card>` : ''}

${project.indicators.hasClaudeFile ? `  <Card title="🛠️ Development Guide" icon="code" href="./${project.slug}/development">
    AI-assisted development instructions and guidelines
  </Card>` : ''}

  <Card title="🏗️ Architecture" icon="sitemap" href="./${project.slug}/architecture">
    System architecture and design patterns
  </Card>
</CardGroup>

## 🚀 Quick Start

${this.generateQuickStart(project)}

## 🔗 Related Projects

This project is part of the LostMind AI ecosystem:

<CardGroup cols={3}>
  <Card title="🚀 Main Platform" icon="rocket" href="../lostmindai-turborepo">
    Core SaaS application
  </Card>
  <Card title="🧠 RAG Backend" icon="brain" href="../back-end-architecture-for-turborepo-with-rag-embeddings">
    AI processing backend
  </Card>
  <Card title="📊 Finance Tools" icon="chart-line" href="../xlsm-core-app">
    Excel-based finance tools
  </Card>
</CardGroup>

---

<Note>
This documentation is automatically generated from the source project. 
Last sync: ${new Date().toLocaleDateString()}
</Note>`;

    await fs.writeFile(path.join(outputDir, 'introduction.mdx'), content, 'utf8');
  }

  generateProjectOverview(project) {
    let overview = `This is a ${project.metadata?.framework || 'software'} project`;
    
    if (project.category === 'main-platform') {
      overview = 'This is the main LostMind AI SaaS platform, providing AI-powered services to users.';
    } else if (project.category === 'ai-backend') {
      overview = 'This project provides backend AI processing capabilities, including RAG and embedding services.';
    } else if (project.category === 'finance-tools') {
      overview = 'This project contains financial analysis tools and Excel-based applications for property finance.';
    } else if (project.category === 'development-tools') {
      overview = 'This project provides development and analysis tools for the LostMind AI ecosystem.';
    } else if (project.category === 'documentation') {
      overview = 'This project manages documentation and knowledge sharing across the LostMind AI ecosystem.';
    }
    
    if (project.metadata?.dependencies) {
      const keyDeps = project.metadata.dependencies.filter(dep => 
        ['react', 'next', 'fastapi', 'turborepo', 'stripe', 'prisma'].some(key => dep.includes(key))
      );
      if (keyDeps.length > 0) {
        overview += ` It uses ${keyDeps.slice(0, 3).join(', ')} and other modern technologies.`;
      }
    }
    
    return overview;
  }

  generateQuickStart(project) {
    if (project.metadata?.scripts) {
      const hasDevScript = project.metadata.scripts.includes('dev');
      const hasBuildScript = project.metadata.scripts.includes('build');
      const hasInstallScript = project.metadata.scripts.includes('install');
      
      if (hasDevScript) {
        return `\`\`\`bash
# Clone and setup
git clone [repository-url]
cd ${project.slug}

# Install dependencies
${project.metadata?.framework === 'TurboRepo' ? 'pnpm install' : 'npm install'}

# Start development server
${project.metadata?.framework === 'TurboRepo' ? 'pnpm dev' : 'npm run dev'}
\`\`\``;
      }
    }
    
    return `\`\`\`bash
# Clone and setup
git clone [repository-url]
cd ${project.slug}

# Follow the README.md for specific setup instructions
\`\`\``;
  }

  async extractReadme(project, outputDir) {
    try {
      const projectFiles = await fs.readdir(project.path);
      const readmeFile = projectFiles.find(file => 
        file.toLowerCase().startsWith('readme')
      );
      
      if (readmeFile) {
        const readmePath = path.join(project.path, readmeFile);
        const content = await fs.readFile(readmePath, 'utf8');
        
        // Convert to Mintlify format
        const mintlifyContent = `---
title: "README - ${project.name}"
description: "Complete project README and setup instructions"
---

${this.convertToMintlify(content, project)}`;
        
        await fs.writeFile(path.join(outputDir, 'readme.mdx'), mintlifyContent, 'utf8');
        console.log(`  ✅ Extracted README`);
      }
    } catch (error) {
      console.warn(`  ⚠️  Could not extract README: ${error.message}`);
    }
  }

  async extractClaudeFile(project, outputDir) {
    try {
      const claudePath = path.join(project.path, 'CLAUDE.md');
      const content = await fs.readFile(claudePath, 'utf8');
      
      const mintlifyContent = `---
title: "Development Guide - ${project.name}"
description: "AI-assisted development instructions and project guidelines"
---

${this.convertToMintlify(content, project)}`;
      
      await fs.writeFile(path.join(outputDir, 'development.mdx'), mintlifyContent, 'utf8');
      console.log(`  ✅ Extracted CLAUDE.md as development guide`);
    } catch (error) {
      console.warn(`  ⚠️  Could not extract CLAUDE.md: ${error.message}`);
    }
  }

  async generateArchitectureOverview(project, outputDir) {
    const content = `---
title: "Architecture - ${project.name}"
description: "System architecture and design overview"
---

# Architecture Overview

## System Design

${this.generateArchitectureDescription(project)}

## Technology Stack

<CardGroup cols={2}>
  <Card title="Framework" icon="layer-group">
    ${project.metadata?.framework || 'Not specified'}
  </Card>
  <Card title="Category" icon="tags">
    ${project.category.replace('-', ' ')}
  </Card>
  <Card title="Last Updated" icon="clock">
    ${new Date(project.lastModified).toLocaleDateString()}
  </Card>
  <Card title="Documentation" icon="book">
    ${project.indicators.hasDocs ? 'Available' : 'Basic'}
  </Card>
</CardGroup>

## Key Components

${this.generateComponentsList(project)}

## Deployment

This project is designed for ${this.getDeploymentInfo(project)} deployment.

<Note>
Architecture details are extracted from project analysis. For detailed technical specifications, refer to the project's documentation folder.
</Note>`;

    await fs.writeFile(path.join(outputDir, 'architecture.mdx'), content, 'utf8');
  }

  generateArchitectureDescription(project) {
    if (project.category === 'main-platform') {
      return 'This is a modern SaaS platform built with TurboRepo for optimal development and deployment efficiency. The architecture supports microservices, scalable data processing, and user management.';
    } else if (project.category === 'ai-backend') {
      return 'This backend system provides AI processing capabilities including RAG (Retrieval-Augmented Generation), embedding services, and vector database management for intelligent content processing.';
    } else if (project.category === 'finance-tools') {
      return 'Financial analysis tools designed for property finance and investment analysis, providing Excel-based interfaces with advanced calculation capabilities.';
    }
    
    return 'This project follows modern software architecture principles with clear separation of concerns and scalable design patterns.';
  }

  generateComponentsList(project) {
    let components = '- **Core Application**: Main application logic and business rules\n';
    components += '- **Data Layer**: Database and data management components\n';
    components += '- **API Layer**: External interfaces and service endpoints\n';
    
    if (project.metadata?.framework === 'TurboRepo') {
      components += '- **Monorepo Structure**: Shared packages and coordinated development\n';
    }
    
    if (project.category === 'ai-backend') {
      components += '- **AI Processing**: Machine learning and AI service components\n';
      components += '- **Vector Database**: Embedding storage and retrieval systems\n';
    }
    
    if (project.category === 'main-platform') {
      components += '- **User Management**: Authentication and authorization systems\n';
      components += '- **Payment Processing**: Subscription and billing management\n';
    }
    
    return components;
  }

  getDeploymentInfo(project) {
    if (project.metadata?.framework === 'TurboRepo') {
      return 'Vercel and cloud-native';
    } else if (project.metadata?.framework === 'FastAPI') {
      return 'containerized cloud';
    } else if (project.category === 'finance-tools') {
      return 'desktop and cloud';
    }
    
    return 'flexible cloud';
  }

  convertToMintlify(content, project) {
    // Basic conversion from markdown to Mintlify format
    let converted = content;
    
    // Convert alerts and callouts
    converted = converted.replace(/> \*\*Note:\*\*/g, '<Note>');
    converted = converted.replace(/> \*\*Warning:\*\*/g, '<Warning>');
    converted = converted.replace(/> \*\*Info:\*\*/g, '<Info>');
    
    // Convert code blocks with titles
    converted = converted.replace(/```(\w+)\s*\n([\s\S]*?)```/g, (match, lang, code) => {
      return `\`\`\`${lang}\n${code}\`\`\``;
    });
    
    // Add project context
    converted = `<Info>
This content was automatically extracted from ${project.name}.
For the most up-to-date information, refer to the source project.
</Info>\n\n` + converted;
    
    return converted;
  }

  async updateMintNavigation(projects) {
    try {
      const mintConfigPath = path.join(this.docsPath, 'mint.json');
      const mintConfig = JSON.parse(await fs.readFile(mintConfigPath, 'utf8'));
      
      // Add projects section to navigation
      const projectsNav = {
        group: "Projects",
        pages: projects.map(project => ({
          group: project.name,
          pages: [
            `projects/${project.slug}/introduction`,
            ...(project.indicators.hasReadme ? [`projects/${project.slug}/readme`] : []),
            ...(project.indicators.hasClaudeFile ? [`projects/${project.slug}/development`] : []),
            `projects/${project.slug}/architecture`
          ]
        }))
      };
      
      // Update navigation
      mintConfig.navigation = mintConfig.navigation || [];
      const existingProjectsIndex = mintConfig.navigation.findIndex(item => item.group === "Projects");
      
      if (existingProjectsIndex >= 0) {
        mintConfig.navigation[existingProjectsIndex] = projectsNav;
      } else {
        mintConfig.navigation.push(projectsNav);
      }
      
      // Update colors and branding for LostMind AI
      mintConfig.name = "LostMind AI Documentation";
      mintConfig.colors = {
        primary: "#6366f1",
        light: "#8b5cf6",
        dark: "#5b21b6",
        anchors: {
          from: "#6366f1",
          to: "#8b5cf6"
        }
      };
      
      await fs.writeFile(mintConfigPath, JSON.stringify(mintConfig, null, 2), 'utf8');
      console.log('✅ Updated Mintlify navigation');
      
    } catch (error) {
      console.error('❌ Error updating navigation:', error.message);
    }
  }
}

// Run extractor if called directly
if (require.main === module) {
  const extractor = new MintlifyContentExtractor();
  extractor.extract().catch(console.error);
}

module.exports = MintlifyContentExtractor;
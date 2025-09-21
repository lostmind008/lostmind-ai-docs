#!/usr/bin/env node

/**
 * Documentation Validator for LostMind AI
 * 
 * Validates generated documentation for:
 * - MDX syntax errors
 * - Broken links
 * - Missing images
 * - Frontmatter completeness
 * - Navigation consistency
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentationValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.docsDir = options.docsDir || './apps/docs/projects';
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    console.log('🔍 Validating documentation...\n');
    
    await this.validateMDXSyntax();
    await this.validateLinks();
    await this.validateImages();
    await this.validateFrontmatter();
    await this.validateNavigation();
    
    this.printReport();
    
    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  async validateMDXSyntax() {
    console.log('📝 Checking MDX syntax...');
    
    const mdxFiles = await this.findFiles('**/*.mdx');
    
    for (const file of mdxFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Check for common MDX syntax errors
        const issues = this.checkMDXSyntax(content, file);
        this.errors.push(...issues.errors);
        this.warnings.push(...issues.warnings);
        
      } catch (error) {
        this.errors.push(`Failed to read ${file}: ${error.message}`);
      }
    }
  }

  checkMDXSyntax(content, filePath) {
    const errors = [];
    const warnings = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for headings starting with numbers
      if (/^#+\s*\d/.test(line)) {
        errors.push(`${filePath}:${lineNum} - Heading starts with number: "${line.trim()}"`);
      }
      
      // Check for invalid JSX expressions
      if (/{[^}]*\d[^}]*}/.test(line) && !line.includes('```')) {
        warnings.push(`${filePath}:${lineNum} - Potential invalid JSX expression: "${line.trim()}"`);
      }
      
      // Check for unescaped curly braces in code blocks
      if (line.includes('```') === false && /[{}]/.test(line) && !line.includes('import')) {
        // This is a complex check, skip for now to avoid false positives
      }
      
      // Check for malformed links
      if (/\[.*\]\(.*\)/.test(line)) {
        const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
        let match;
        while ((match = linkRegex.exec(line)) !== null) {
          const [, text, url] = match;
          if (!text.trim()) {
            warnings.push(`${filePath}:${lineNum} - Empty link text: [${text}](${url})`);
          }
          if (!url.trim()) {
            errors.push(`${filePath}:${lineNum} - Empty link URL: [${text}](${url})`);
          }
        }
      }
    });
    
    return { errors, warnings };
  }

  async validateLinks() {
    console.log('🔗 Checking links...');
    
    const mdxFiles = await this.findFiles('**/*.mdx');
    
    for (const file of mdxFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const issues = await this.checkLinks(content, file);
        this.errors.push(...issues.errors);
        this.warnings.push(...issues.warnings);
      } catch (error) {
        this.errors.push(`Failed to validate links in ${file}: ${error.message}`);
      }
    }
  }

  async checkLinks(content, filePath) {
    const errors = [];
    const warnings = [];
    const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
    const dir = path.dirname(filePath);
    
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const [, text, url] = match;
      
      // Skip external links and anchors
      if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:')) {
        continue;
      }
      
      // Check internal links
      const targetPath = path.resolve(dir, url);
      try {
        await fs.access(targetPath);
      } catch {
        errors.push(`${filePath} - Broken link: [${text}](${url})`);
      }
    }
    
    return { errors, warnings };
  }

  async validateImages() {
    console.log('🖼️ Checking images...');
    
    const mdxFiles = await this.findFiles('**/*.mdx');
    
    for (const file of mdxFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const issues = await this.checkImages(content, file);
        this.errors.push(...issues.errors);
        this.warnings.push(...issues.warnings);
      } catch (error) {
        this.errors.push(`Failed to validate images in ${file}: ${error.message}`);
      }
    }
  }

  async checkImages(content, filePath) {
    const errors = [];
    const warnings = [];
    const imageRegex = /!\[([^\]]*)\]\(([^)]*)\)/g;
    const dir = path.dirname(filePath);
    
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const [, alt, src] = match;
      
      // Skip external images
      if (src.startsWith('http')) {
        continue;
      }
      
      // Check local images
      const imagePath = path.resolve(dir, src);
      try {
        await fs.access(imagePath);
      } catch {
        errors.push(`${filePath} - Missing image: ![${alt}](${src})`);
      }
      
      // Check alt text
      if (!alt.trim()) {
        warnings.push(`${filePath} - Image missing alt text: ${src}`);
      }
    }
    
    return { errors, warnings };
  }

  async validateFrontmatter() {
    console.log('📋 Checking frontmatter...');
    
    const mdxFiles = await this.findFiles('**/*.mdx');
    
    for (const file of mdxFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const issues = this.checkFrontmatter(content, file);
        this.warnings.push(...issues.warnings);
      } catch (error) {
        this.errors.push(`Failed to validate frontmatter in ${file}: ${error.message}`);
      }
    }
  }

  checkFrontmatter(content, filePath) {
    const warnings = [];
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      warnings.push(`${filePath} - Missing frontmatter`);
      return { warnings };
    }
    
    const frontmatter = match[1];
    const requiredFields = ['title', 'description'];
    const recommendedFields = ['category', 'tags', 'lastUpdated'];
    
    requiredFields.forEach(field => {
      if (!frontmatter.includes(`${field}:`)) {
        warnings.push(`${filePath} - Missing required frontmatter field: ${field}`);
      }
    });
    
    recommendedFields.forEach(field => {
      if (!frontmatter.includes(`${field}:`)) {
        warnings.push(`${filePath} - Missing recommended frontmatter field: ${field}`);
      }
    });
    
    return { warnings };
  }

  async validateNavigation() {
    console.log('🧭 Checking navigation...');
    
    const navPath = path.join(this.docsDir, '../navigation.json');
    
    try {
      const navContent = await fs.readFile(navPath, 'utf8');
      const navigation = JSON.parse(navContent);
      
      if (!navigation.navigation || !Array.isArray(navigation.navigation)) {
        this.errors.push('Invalid navigation.json structure');
        return;
      }
      
      for (const group of navigation.navigation) {
        if (!group.group || !group.pages) {
          this.warnings.push(`Navigation group missing required fields: ${JSON.stringify(group)}`);
          continue;
        }
        
        for (const page of group.pages) {
          const pagePath = path.join(this.docsDir, `${page}.mdx`);
          try {
            await fs.access(pagePath);
          } catch {
            this.errors.push(`Navigation references missing file: ${page}.mdx`);
          }
        }
      }
    } catch (error) {
      this.warnings.push(`Could not validate navigation: ${error.message}`);
    }
  }

  async findFiles(pattern) {
    const glob = require('glob').glob;
    const files = await glob(pattern, { cwd: this.docsDir });
    return files.map(file => path.join(this.docsDir, file));
  }

  printReport() {
    console.log('\n📊 VALIDATION REPORT');
    console.log('===================');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All validations passed!');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    console.log(`\nSummary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
    
    if (this.errors.length > 0) {
      console.log('\n💡 Fix all errors before deploying to production.');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    docsDir: args.find(arg => arg.startsWith('--docs-dir='))?.split('=')[1] || './apps/docs/projects'
  };
  
  const validator = new DocumentationValidator(options);
  const result = await validator.validate();
  
  process.exit(result.success ? 0 : 1);
}

module.exports = { DocumentationValidator };

if (require.main === module) {
  main().catch(console.error);
}
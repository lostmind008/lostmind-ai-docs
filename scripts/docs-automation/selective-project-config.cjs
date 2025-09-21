#!/usr/bin/env node

/**
 * Selective Project Configuration for LostMind AI Documentation
 *
 * This configuration targets the 5 specific projects requested by the user
 * for clean, error-free documentation generation at docs.lostmindai.com
 */

const path = require('path');

// Project mapping configuration for 5 target projects
const PROJECT_CONFIG = [
  {
    id: 'lostmind-ai-saas-platform-development',
    displayName: 'LostMind AI - SaaS Platform Development',
    sourcePath: '/Users/sumitm1/Documents/New Ongoing Projects/LostMindAI-TurboRepo',
    outputPath: './apps/docs/projects/lostmind-ai-saas-platform-development',
    category: 'core-platforms',
    priority: 1,
    documentTypes: ['introduction', 'readme', 'architecture', 'development'],
    scanStrategy: 'comprehensive', // Full project scan
    primaryFiles: ['README.md', 'CLAUDE.md', 'docs/**/*.md', 'packages/**/README.md'],
    skipPatterns: ['node_modules', '.next', 'dist', 'build', '.turbo']
  },
  {
    id: 'lostmind-ai-proptech-variance-commentary-tool',
    displayName: 'LostMind AI - PropTech Variance Commentary Tool',
    sourcePath: '/Users/sumitm1/Documents/New Ongoing Projects/Back End Architecture for Turborepo from OLD Project Directory/Variance Commentary - PropertyFinAI',
    outputPath: './apps/docs/projects/lostmind-ai-proptech-variance-commentary-tool',
    category: 'proptech-solutions',
    priority: 2,
    documentTypes: ['introduction', 'readme', 'architecture'],
    scanStrategy: 'selective', // Focus on planning and architecture docs
    primaryFiles: ['*.md', 'Testing Random Quick Demos/**/*.md'],
    skipPatterns: ['.DS_Store']
  },
  {
    id: 'lostmind-ai-project-analyser-with-rag-gemini',
    displayName: 'LostMind AI - Project Analyser with RAG (Gemini)',
    sourcePath: '/Users/sumitm1/Documents/myproject/Ongoing Projects/Completed Projects/Advance File Combiner with Analyser/Gemini_Magic',
    outputPath: './apps/docs/projects/lostmind-ai-project-analyser-with-rag-gemini',
    category: 'ai-development-tools',
    priority: 3,
    documentTypes: ['introduction', 'readme', 'architecture'],
    scanStrategy: 'comprehensive', // Full AI project documentation
    primaryFiles: ['README.md', 'docs/**/*.md', '.claude/**/*.md', 'CHANGELOG.md'],
    skipPatterns: ['node_modules', '.git', '__pycache__', 'venv']
  },
  {
    id: 'lostmind-ai-contextkeeper',
    displayName: 'LostMind AI - ContextKeeper',
    sourcePath: '/Users/sumitm1/Documents/myproject/Ongoing Projects/Completed Projects/Advance Project Analyser/contextkeeper',
    outputPath: './apps/docs/projects/lostmind-ai-contextkeeper',
    category: 'ai-development-tools',
    priority: 4,
    documentTypes: ['introduction', 'readme', 'architecture'],
    scanStrategy: 'comprehensive', // Mature project with full docs
    primaryFiles: ['README.md', 'CLAUDE.md', 'CHANGELOG.md', 'docs/**/*.md'],
    skipPatterns: ['.git', '.DS_Store', 'venv', '__pycache__']
  },
  {
    id: 'proptech-x-all-in-one-pam-tools',
    displayName: 'PropTech X - Your All-in-on PAM Tools',
    sourcePath: '/Users/sumitm1/Documents/New Ongoing Projects/XLSM Core App/PropTech Finance Tools',
    outputPath: './apps/docs/projects/proptech-x-all-in-one-pam-tools',
    category: 'proptech-solutions',
    priority: 5,
    documentTypes: ['introduction', 'readme', 'architecture'],
    scanStrategy: 'selective', // Focus on key documentation
    primaryFiles: ['README.md', 'ai_integration/**/*.md', '.claude/**/*.md'],
    skipPatterns: ['node_modules', '.git', '*.xlsx', '*.xlsm', 'backup.*']
  }
];

// Navigation group configuration
const NAVIGATION_GROUPS = {
  'core-platforms': {
    title: '🚀 Core Platforms',
    description: 'Primary SaaS platform development projects',
    order: 1
  },
  'proptech-solutions': {
    title: '🏠 PropTech Solutions',
    description: 'Property technology and finance tools',
    order: 2
  },
  'ai-development-tools': {
    title: '🤖 AI Development Tools',
    description: 'AI-powered development and analysis tools',
    order: 3
  }
};

// Enhanced scanner configuration
const SCANNER_CONFIG = {
  output: {
    baseDir: './apps/docs/projects',
    cleanBuild: true, // Remove existing content before generation
    validateMDX: true, // Validate MDX syntax during generation
    createNavigation: true // Auto-update mint.json navigation
  },
  validation: {
    strictMode: true,
    frontmatterRequired: true,
    maxLineLength: 200,
    validateLinks: true,
    checkImages: false // Skip image validation for now
  },
  generation: {
    addTimestamps: true,
    includeSourcePath: true,
    generateTOC: true,
    minifyOutput: false
  }
};

module.exports = {
  PROJECT_CONFIG,
  NAVIGATION_GROUPS,
  SCANNER_CONFIG
};
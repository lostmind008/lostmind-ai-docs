# 📚 LostMind AI Documentation Site

**Professional documentation platform for the entire LostMind AI ecosystem.**

<div>
  <img src="https://img.shields.io/badge/Built%20with-Mintlify-6366f1" alt="Built with Mintlify" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-000000" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000" alt="Deployed on Vercel" />
</div>

## 🚀 Overview

This is the centralized documentation platform for LostMind AI, automatically discovering and documenting our entire ecosystem of projects. Built on a customized Next-Forge foundation with Mintlify for professional documentation generation.

**Live Site**: [docs.lostmindai.com](https://docs.lostmindai.com)

## ✨ Features

- **🔍 Auto-Discovery**: Automatically finds and documents all projects in the ecosystem
- **📝 Smart Extraction**: Intelligently extracts content from README files, documentation folders, and markdown files
- **🔄 Daily Sync**: Automated daily updates via GitHub Actions
- **🎨 Professional Design**: Enterprise-grade documentation with Mintlify
- **⚡ Fast Performance**: Global CDN distribution via Vercel
- **📊 Multi-Project Support**: Organizes and categorizes 12+ active projects

## 🏗️ Architecture

### Core Components

- **Documentation Engine**: Mintlify-powered documentation generation
- **Content Scanner**: Automated project discovery and content extraction
- **Sync Automation**: GitHub Actions for daily content updates
- **Project Categorization**: Smart organization by project type and priority

### Project Structure

```
apps/
├── docs/           # Main documentation site (Mintlify)
├── api/            # Backend API services
├── app/            # Main web application
└── storybook/      # Component library documentation

packages/
├── design-system/  # Shared UI components (shadcn/ui)
├── auth/           # Authentication system
├── database/       # Prisma ORM
└── ...            # 8+ shared packages

scripts/
└── docs-automation/ # Project scanning and content extraction
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/lostmind008/lostmind-ai-docs.git
cd lostmind-ai-docs

# Install dependencies
pnpm install

# Start documentation development server
pnpm docs:dev
```

The documentation site will be available at `http://localhost:3004`

## 📖 Documentation Management

### Auto-Update System

```bash
# Scan for new projects and extract content
pnpm docs:update

# Individual steps:
pnpm docs:scan     # Discover new projects
pnpm docs:extract  # Extract and format content
```

### Manual Content Addition

1. Add `.mdx` files to `apps/docs/`
2. Update navigation in `apps/docs/mint.json`
3. Run `pnpm docs:dev` for live preview

## 🔧 Development

### Essential Commands

```bash
# Development
pnpm dev                # Start all development servers
pnpm docs:dev          # Start docs only (recommended)

# Building & Testing
pnpm build             # Build all packages
pnpm test              # Run test suite
pnpm lint              # Lint codebase

# Database Operations
pnpm migrate           # Run Prisma migrations

# Documentation
pnpm docs:build        # Build documentation for production
```

### Adding New Projects

1. Place project in `/Users/sumitm1/Documents/New Ongoing Projects/`
2. Ensure project has `README.md`, `CLAUDE.md`, or `docs/` folder
3. Run `pnpm docs:scan` to discover
4. Run `pnpm docs:extract` to generate documentation

## 🌐 Deployment

### Vercel Deployment

**Settings for Vercel:**
- **Root Directory**: `apps/docs`
- **Build Command**: `mintlify build`
- **Output Directory**: `_site`
- **Install Command**: `pnpm install`

### Custom Domain Setup

Add DNS record for `docs.lostmindai.com`:
```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
```

## 📊 Ecosystem Projects

The documentation automatically discovers and organizes:

### 🏢 Main Platforms
- **LostMind AI Turborepo**: Production SaaS platform
- **RAG Backend**: AI backend with retrieval-augmented generation

### 🛠️ Development Tools
- **Updated MCP Tools**: Model Context Protocol integrations
- **GitHub Repository Analyzer**: Advanced repository analysis
- **Claude Code Framework**: Development framework tools

### 📈 Additional Projects
- **Documentation Sites**: Multiple documentation platforms
- **Memory Context Protocol**: Advanced AI memory systems
- **News Analysis Tools**: Content processing and analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](license.md) file for details.

## 🔗 Links

- **Live Documentation**: [docs.lostmindai.com](https://docs.lostmindai.com)
- **Main Platform**: [ask.lostmindai.com](https://ask.lostmindai.com)
- **Website**: [lostmindai.com](https://lostmindai.com)
- **GitHub**: [github.com/lostmind-ai](https://github.com/lostmind-ai)

---

**Built with ❤️ by LostMind AI**
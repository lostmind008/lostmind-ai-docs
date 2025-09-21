# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **LostMind AI Documentation Site** - a comprehensive documentation platform for the LostMind AI ecosystem. It's built on the next-forge template (a production-grade Turborepo template) and customized for documenting multiple AI projects, tools, and platforms.

## Architecture

### Monorepo Structure

This is a **pnpm workspace** with **Turborepo** orchestration containing:

**Apps:**
- `apps/docs/` - Main documentation site using **Mintlify** (primary focus)
- `apps/api/` - Next.js API backend with webhooks and health endpoints
- `apps/app/` - Main web application with authentication and collaboration features
- `apps/email/` - Email template handling
- `apps/storybook/` - Component library documentation and visual testing

**Shared Packages:**
- `packages/design-system/` - **shadcn/ui** components with Radix UI primitives
- `packages/auth/` - Authentication system with Clerk integration
- `packages/database/` - Prisma ORM setup and schema
- `packages/collaboration/` - LiveBlocks integration for real-time collaboration
- `packages/analytics/` - PostHog, Google Analytics, and Vercel Analytics
- `packages/cms/` - Content management utilities
- `packages/ai/` - AI model integration and chat components

### Documentation System

The docs app (`apps/docs/`) is the **primary component** - it uses **Mintlify** to generate documentation that:
- Auto-syncs with active projects daily
- Documents the entire LostMind AI ecosystem
- Provides API references, architecture guides, and development instructions
- Runs on port 3004 in development

## Essential Commands

### Development
```bash
# Start all development servers
pnpm dev

# Start docs only (port 3004)
pnpm docs:dev

# Start specific app
cd apps/docs && pnpm dev
```

### Building & Testing
```bash
# Build all packages and apps
pnpm build

# Run tests across workspace
pnpm test

# Lint all code (uses ultracite)
pnpm lint

# Format code (uses ultracite)
pnpm format
```

### Documentation Management
```bash
# Scan and update documentation from projects
pnpm docs:update

# Individual steps:
pnpm docs:scan    # Scan for new projects
pnpm docs:extract # Extract content from projects

# Documentation development
pnpm docs:dev     # Start Mintlify dev server
pnpm docs:build   # Build documentation
```

### Database Operations
```bash
# Migrate database (Prisma)
pnpm migrate

# Individual steps:
cd packages/database
npx prisma format
npx prisma generate
npx prisma db push
```

### Dependency Management
```bash
# Update all dependencies (excludes react-day-picker)
pnpm bump-deps

# Update shadcn/ui components
pnpm bump-ui

# Clean all node_modules
pnpm clean
```

## Development Workflow

### Working with Documentation
1. The docs are auto-generated from project scanning
2. Manual content goes in `apps/docs/` as `.mdx` files
3. Configuration is in `apps/docs/mint.json`
4. Navigation structure is defined in the mint.json `navigation` array
5. Use `pnpm docs:dev` for live preview on port 3004

### Working with Components
1. UI components are in `packages/design-system/`
2. Uses **shadcn/ui** with Radix UI primitives
3. Shared across all apps via workspace dependencies
4. Test components in Storybook app

### Working with Authentication
1. Uses **Clerk** for authentication (configured in `packages/auth/`)
2. Middleware handles protected routes
3. Authentication components are reusable across apps

### Working with Database
1. **Prisma** ORM in `packages/database/`
2. Schema defined in `packages/database/prisma/schema.prisma`
3. Always run `pnpm migrate` after schema changes

## Key Configuration Files

- `turbo.json` - Turborepo build pipeline and caching
- `pnpm-workspace.yaml` - Workspace package configuration
- `apps/docs/mint.json` - Mintlify documentation configuration
- `packages/database/prisma/schema.prisma` - Database schema
- `biome.json` - Code formatting and linting rules (via ultracite)

## Testing Strategy

- **Vitest** for unit testing across packages
- Test files use `*.test.ts/tsx` pattern
- Apps have individual test configurations
- Run tests with `pnpm test` (uses Turbo to run in parallel)

## Deployment Notes

- Apps are configured for **Vercel** deployment (individual `vercel.json` files)
- Documentation deploys automatically via Mintlify
- Uses environment variables for external service configuration
- Sentry integration for error monitoring

## Vercel Deployment Best Practices (2024/2025)

### Critical Deployment Insights

Based on extensive research and troubleshooting (September 2025), the following deployment patterns are essential for success:

**Common Issues:**
- Vercel web interface locks build command editing for monorepo + Mintlify combinations
- Framework detection fails for Mintlify sites in monorepo structures
- CLI deployment may encounter project naming validation errors
- Default build settings don't work for Mintlify documentation sites

**Proven Solutions:**

### 1. Use vercel.json Configuration (Recommended)
The most reliable deployment method is **configuration as code** using `vercel.json`:

```json
{
  "buildCommand": "cd apps/docs && mintlify build",
  "outputDirectory": "apps/docs/_site",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/apps/docs/$1"
    }
  ]
}
```

**Key Configuration Elements:**
- `framework: null` - Bypasses automatic framework detection
- `cd apps/docs && mintlify build` - Ensures correct directory context
- `apps/docs/_site` - Full path to Mintlify build output
- Simplified routing for static documentation

### 2. Web Interface Deployment Process
When using Vercel web interface:

1. **Repository**: Import `lostmind008/lostmind-ai-docs`
2. **Framework Preset**: Select "Other" (never use Next.js preset)
3. **Root Directory**: Leave as default (vercel.json handles this)
4. **Build Commands**: Will be overridden by vercel.json
5. **Environment Variables**: None required for basic Mintlify

### 3. CLI Deployment (Alternative)
If web interface fails:
```bash
# From project root
vercel --prod --yes
```

**CLI Troubleshooting:**
- Project naming errors: Use web interface for initial setup
- Authentication issues: Run `gh auth refresh` with proper scopes
- Build failures: Verify vercel.json configuration

### 4. Deployment Verification
After deployment, verify:
- Documentation site loads correctly
- Navigation functions properly
- Search functionality works
- Custom domain setup (if configured)

### 5. Custom Domain Setup
For `docs.lostmindai.com`:
```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
TTL: 300
```

### Research Source
These best practices are based on comprehensive research from Perplexity (September 2025) covering:
- Vercel monorepo deployment patterns
- Mintlify documentation platform integration
- 2024/2025 industry best practices
- Configuration as code approaches
- Troubleshooting common deployment failures

**Repository**: https://github.com/lostmind008/lostmind-ai-docs
**Live Site**: docs.lostmindai.com (when deployed)

## Important Patterns

### Package Dependencies
- Workspace packages use `workspace:*` protocol
- Shared packages are prefixed with `@repo/`
- External dependencies are managed at appropriate levels

### Environment Configuration
- Each app has its own `env.ts` for validation
- Shared environment keys are defined in individual packages
- Development vs production configs are handled per app

### Content Management
- Documentation content is primarily auto-generated
- Manual content supplements automated project documentation
- Navigation and structure are centrally configured in mint.json

## Professional Documentation Enhancement Strategy

### Enterprise-Grade Documentation Standards

This project now implements a comprehensive professional documentation upgrade system designed to transform docs.lostmindai.com into enterprise-grade documentation comparable to industry leaders like Stripe, Vercel, and Supabase.

### Enhanced Documentation Architecture

**Working Directory Structure:**
- `scripts/docs-automation/` - Legacy automation (maintained for compatibility)
- `scripts/docs-automation-v2/` - Professional upgrade package with enhanced tools
- `.claude/` - Enhanced configuration supporting agent delegation and advanced automation

**Professional Documentation Tools:**
- **Enhanced Scanner** (`enhanced-scan-projects.js`) - Deep recursive scanning with smart content classification, docstring extraction, and professional metadata generation
- **Validation Engine** (`validate-docs.js`) - Comprehensive MDX syntax validation, broken link detection, image validation, and deployment readiness checking
- **Agent Coordination System** - Specialized AI agents for content enhancement, navigation generation, and quality assurance

### Agent Delegation Strategy

**Agent-Organizer**: Coordinates overall documentation enhancement across specialist teams
**Guardian**: Maintains context about professional documentation standards and requirements
**Forge**: Creates specialized documentation agents as needed:
- **Content Scraper Agent**: Extracts and classifies project documentation from source code
- **MDX Validator Agent**: Ensures error-free syntax and professional formatting
- **Navigation Builder Agent**: Generates enterprise-grade navigation structures

### Professional Documentation Standards

**Content Requirements:**
- Comprehensive API documentation with working examples
- Clear getting-started guides with step-by-step instructions
- Architecture documentation with diagrams and decision records
- Integration guides with verified code samples
- Troubleshooting and FAQ sections with real solutions

**Technical Requirements:**
- Error-free MDX syntax validated before deployment
- Responsive design with optimised image handling
- SEO optimisation with proper meta descriptions
- Professional typography and consistent formatting
- Working internal/external links with validation
- Proper frontmatter with titles, descriptions, and categories

**Quality Assurance:**
- Automated validation before deployment
- Professional navigation and information architecture
- Content classification by type and importance
- Asset management and link validation
- Comprehensive error reporting and resolution

### Implementation Methodology

1. **Surgical MDX Fixes**: Precise, targeted corrections instead of destructive find/replace operations
2. **Content Enhancement**: AI-driven content improvement with human oversight
3. **Validation Pipeline**: Multi-stage validation ensuring deployment readiness
4. **Professional Presentation**: Enterprise-grade formatting and navigation

### Migration and Testing

**Pilot Testing**: New system tested with 1-2 projects before full deployment
**Compatibility**: Maintains existing functionality while adding professional enhancements
**Rollback Safety**: Preserved legacy automation for fallback if needed

This enhancement transforms basic project documentation into professional, enterprise-grade documentation that improves user experience, project discoverability, and overall platform credibility.

## External Services Integration

- **Clerk** - Authentication and user management
- **LiveBlocks** - Real-time collaboration features
- **PostHog** - Product analytics
- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking and monitoring
- **Mintlify** - Documentation hosting and generation

## Current Status and Session Progress (September 2025)

### Documentation Quality Upgrade Completed ✅

**Date**: September 21, 2025
**Session Focus**: Professional documentation quality improvement for production deployment

### Major Achievements

**1. Clean Project Documentation Structure**
- Successfully archived all problematic legacy projects to `_archived/` directory
- Implemented selective 5-project configuration for focused documentation
- Generated 16 high-quality MDX files across 5 target projects:
  - **LostMind AI - SaaS Platform Development** (Core Platforms)
  - **LostMind AI - PropTech Variance Commentary Tool** (PropTech Solutions)
  - **LostMind AI - Project Analyser with RAG (Gemini)** (AI Development Tools)
  - **LostMind AI - ContextKeeper** (AI Development Tools)
  - **PropTech X - Your All-in-one PAM Tools** (PropTech Solutions)

**2. Critical Quality Issues Resolved**
- ✅ Fixed frontmatter `project: "undefined"` across all 16 MDX files
- ✅ Removed duplicate H1 headings in introduction pages
- ✅ Verified no broken `./docs/...` links (clean)
- ✅ Fixed invalid JSON syntax in contextkeeper readme
- ✅ Enhanced all content with project-specific details (user contributed)
- ✅ Fixed "All-in-on" typos to "All-in-one" in PropTech project

**3. Professional Content Enhancement**
- User significantly improved all documentation with detailed, professional content
- Added comprehensive project descriptions, architecture details, and technical specifications
- Enhanced with badges, proper navigation, and professional formatting
- All files now contain enterprise-grade documentation quality

### Current Architecture State

**Documentation Structure:**
```
apps/docs/projects/
├── lostmind-ai-saas-platform-development/
│   ├── introduction.mdx
│   ├── readme.mdx
│   ├── architecture.mdx
│   └── development.mdx
├── lostmind-ai-proptech-variance-commentary-tool/
│   ├── introduction.mdx
│   ├── readme.mdx
│   └── architecture.mdx
├── lostmind-ai-project-analyser-with-rag-gemini/
│   ├── introduction.mdx
│   ├── readme.mdx
│   └── architecture.mdx
├── lostmind-ai-contextkeeper/
│   ├── introduction.mdx
│   ├── readme.mdx
│   └── architecture.mdx
└── proptech-x-all-in-one-pam-tools/
    ├── introduction.mdx
    ├── readme.mdx
    └── architecture.mdx
```

**Navigation Groups:**
- **🚀 Core Platforms**: SaaS Platform Development
- **🏠 PropTech Solutions**: Variance Commentary Tool, PAM Tools
- **🤖 AI Development Tools**: Project Analyser, ContextKeeper

### Quality Assurance Status

**Mintlify Validation**: ✅ PASSING
- Local dev server running successfully at `localhost:3000`
- All 16 MDX files parsing without errors
- Navigation structure working correctly
- No JSON syntax errors
- Proper frontmatter across all files

**Content Quality**: ✅ PROFESSIONAL-GRADE
- Project-specific architecture descriptions
- Comprehensive technical documentation
- Professional formatting and structure
- Working internal navigation links

### Key Lessons Learned

**1. Systematic Quality Improvement Approach**
- Created detailed 88-item todo list to track all issues
- Addressed critical issues in priority order
- Used MultiEdit for precise, surgical fixes
- Validated each fix immediately after implementation

**2. Collaboration Effectiveness**
- User actively enhanced content while Claude fixed technical issues
- Parallel work on content improvement and technical fixes
- Real-time validation via Mintlify dev server
- Clear communication about "beat Claude to this update" enhancements

**3. Error-Free Documentation Process**
- Zero tolerance for parsing errors achieved
- Frontmatter consistency critical for navigation
- Heading hierarchy important for SEO and accessibility
- JSON syntax validation essential for code examples

### Technical Implementation Notes

**Selective Project Configuration:**
- Implemented `scripts/docs-automation/selective-project-config.cjs`
- Targets 5 specific projects instead of full ecosystem scan
- Prevents archived content from interfering with clean documentation
- Supports both comprehensive and selective scanning strategies

**Quality Control Pipeline:**
- Frontmatter validation for project slugs
- Heading hierarchy verification
- Link validation and correction
- JSON syntax checking in code blocks
- MDX component validation

### Deployment Readiness

**Status**: READY FOR PRODUCTION ✅
- All critical quality issues resolved
- Mintlify dev server running without errors
- Professional content quality achieved
- Navigation structure complete and working
- 16 MDX files validated and error-free

**Next Steps for Deployment:**
1. Push changes to GitHub (triggers auto-deployment to docs.lostmindai.com)
2. Monitor live deployment for any issues
3. Verify all pages load correctly on production
4. Test navigation and search functionality

### Future Session Guidance

**For Next Claude Sessions:**

1. **Documentation Updates**: Use `pnpm docs:dev` to start local preview
2. **Content Changes**: Edit MDX files in `apps/docs/projects/` directly
3. **Navigation Changes**: Update `apps/docs/mint.json` navigation array
4. **New Projects**: Add to `scripts/docs-automation/selective-project-config.cjs`
5. **Quality Checks**: Always validate with local Mintlify before pushing

**Quality Standards Established:**
- Zero parsing errors tolerance
- Professional content quality required
- Proper frontmatter with project slugs
- Consistent heading hierarchy
- Working navigation and links

**Archived Content:**
- Legacy projects moved to `_archived/` directory (outside docs scope)
- Preserved for reference but excluded from documentation generation
- Clean separation between active and archived projects

This session successfully transformed the documentation from problematic legacy content to professional, production-ready documentation suitable for docs.lostmindai.com deployment.
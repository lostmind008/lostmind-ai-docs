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

## External Services Integration

- **Clerk** - Authentication and user management
- **LiveBlocks** - Real-time collaboration features
- **PostHog** - Product analytics
- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking and monitoring
- **Mintlify** - Documentation hosting and generation
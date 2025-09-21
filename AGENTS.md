# Repository Guidelines

## Project Structure & Module Organization
This monorepo uses pnpm workspaces and Turborepo. `apps/` hosts deployable surfaces: `web` for marketing, `app` for the signed-in Next.js experience, `docs` for Mintlify docs, `storybook` for isolated UI review, `studio` for CMS, `api` for the Fastify gateway, and `email` for React Email templates. Shareable logic lives in `packages/` (analytics, auth, database, design-system, testing, etc.). `docs/` contains the generated Mintlify site plus supporting scripts. Shared build tooling and config sit in `scripts/`, `turbo/`, and root-level `.json` configs.

## Build, Test, and Development Commands
Run `pnpm install` once (Node 18+). Key workflows:
- `pnpm dev` → `turbo dev`, launches all default dev targets (web/app/api/docs as configured).
- `pnpm build` → orchestrated production builds via Turborepo.
- `pnpm test` → executes Vitest suites across workspaces.
- `pnpm lint` / `pnpm format` → Biome-driven linting/formatting.
Use `pnpm --filter <workspace>` to target a single app or package (e.g., `pnpm test --filter apps/api`).

## Coding Style & Naming Conventions
We rely on Biome with the `ultracite` preset: TypeScript/React, 2-space indentation, single quotes, trailing commas, and sorted imports. Component files are PascalCase (`DesignSystemProvider.tsx`), hooks are camelCase (`useMutation.ts`), environment variables use screaming snake case. Run `pnpm format` before committing; no manual tweaks to generated UI assets under `packages/design-system/components/ui`.

## Testing Guidelines
Vitest is standard. Place unit tests beside source in `__tests__` folders or `*.test.ts(x)` files. Prefer React Testing Library for UI. Ensure each new feature has at least one deterministic test and cover error paths. Run `pnpm test` locally; CI also runs this inside Turborepo. For integration-heavy work, add smoke checks inside the relevant app and coordinate with the `packages/testing` utilities.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.), matching recent history. Keep subjects under 60 chars and describe scope (`feat(api): add health route`). Each PR should include: concise summary, linked issue (if any), testing notes (`pnpm test` output), and screenshots for UI changes. Request review from the owning package team (`CODEOWNERS` applies). Avoid bundling unrelated refactors; open follow-up chores when needed.

## Security & Configuration
Secrets live in environment files managed by Vercel/Prisma; never commit `.env`. For local runs, copy `.env.example` (if provided) and request sensitive keys responsibly. Use `pnpm migrate` for database schema updates; it runs Prisma format/generate/db push atomically.

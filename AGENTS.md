# Repository Guidelines

## Project Structure & Module Organization

This repository contains one TypeScript Cloudflare Worker. `src/index.ts` is the request handler and streaming `HTMLRewriter` integration. `src/config.ts` is the single source for supported domains, CTA copy, and themes, plus the hostname lookup; `wrangler.jsonc` holds the Cloudflare routes and secret declarations. `src/sites.ts` defines the corresponding types and shared paths. `src/injected-block.ts` builds the injected HTML, CSS, and SVG assets. Keep site-specific data in `src/config.ts` and shared presentation in `injected-block.ts`.

Cloudflare routes and runtime settings live in `wrangler.jsonc`; compiler rules live in `tsconfig.json`. There is currently no dedicated test directory or generated build output checked into the repository.

## Build, Test, and Development Commands

- `npm install`: install the locked development dependencies.
- `npm run dev`: start a local Wrangler development server.
- `npm run typecheck`: run strict TypeScript checks without emitting files.
- `npm run cf-typegen`: regenerate Cloudflare binding types after configuration changes.
- `npm run deploy`: deploy the Worker and all configured routes. Use only with the intended Cloudflare account.

Before opening a pull request, run at least `npm run typecheck`. When changing injection behavior, also exercise representative article and non-article URLs through `npm run dev`.

## Coding Style & Naming Conventions

Use TypeScript ES modules, two-space indentation, double quotes, semicolons, and trailing commas in multiline literals. The strict compiler options prohibit unused declarations, implicit returns, and unsafe fallthrough. Use `PascalCase` for types and classes, `camelCase` for functions and variables, and `UPPER_SNAKE_CASE` for exported constants such as `GOOGLE_CLICK_PATH`.

Escape all site-provided text before inserting it into HTML. Preserve the fail-open behavior: injection failures must return the unchanged origin response.

## Testing Guidelines

No automated test framework or coverage threshold is configured yet. Treat `npm run typecheck` as the required baseline. Manually verify HTML injection placement, redirects, unknown hosts, non-GET requests, and non-HTML responses. If adding tests, place them beside the source as `*.test.ts` or introduce a clearly documented `test/` directory and npm script.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit-style subjects, for example `chore: add other sites` and `init: inject element na eerste alinea in artikel`. Continue with imperative, lowercase subjects such as `fix: preserve origin response on rewrite error`.

Pull requests should explain the user-visible change, list affected domains, and include verification steps. Link related issues when available. For CTA styling changes, attach desktop and mobile screenshots. Adding a site requires a `SITES` entry in `src/config.ts` and the corresponding route in `wrangler.jsonc`.

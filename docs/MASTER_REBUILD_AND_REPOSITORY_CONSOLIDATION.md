# BAZAR360 Master Rebuild and Repository Consolidation Plan

Status: Audit and implementation brief. This document does not claim production readiness. Readiness must be proven by builds, automated tests, security review, and live integration checks.

## Canonical source of truth
- Canonical repository: https://github.com/AmjidOfficial/BAZAR360
- Canonical domain: https://bazar360.online
- Default branch: main
- Keep this repository as the only long-term application repository after a verified migration and owner approval.
- Do not delete source repositories until unique code, assets, configuration, migrations, history, and deployment needs have been reviewed and preserved.

## Initial repository audit
- BAZAR360: React 19 + TypeScript + Vite, Express, Firebase/Firestore, Cloudinary; extensive docs/assets. Canonical application candidate.
- Bazar360.online-V3: Similar React/Vite/Express/Firebase stack and README. Compare full trees and commit history; import only unique, better changes.
- automotive-marketplace-platform: Next.js 16 + React 19, v0-linked and private. Review app, components, data, auth and deployment before porting modules.
- BAZAR360.V2.0: Gemini AI Studio-origin React/Vite application with a similar dependency family. Compare source and latest AI Studio changes.
- Cars: TanStack Start/Vite + Supabase + shadcn/Radix. Review schema, auth, UI and useful components; do not blindly copy framework-specific code.

Root files and repository metadata were inspected, not every source line. Treat this as an initial audit, not a completed A-to-Z code audit.

## Lovable projects discovered
Workspace: Muhammad's Lovable.
- Bazar360 Automotive Hub, published: https://lovable.dev/projects/ae91a5f8-d23c-40d7-a898-c2478e820260
- Bazar360 Express, published: https://lovable.dev/projects/64d386a7-03fa-46d7-9ca0-595003d57952
- BAZAR360 Marketplace: https://lovable.dev/projects/5114a448-c942-42f6-ad2c-51d0d298e388
- BAZAR360: Pakistan's Auto Hub: https://lovable.dev/projects/6bfcd6f4-9a72-4f54-a681-bdb60fa6286e
- BAZAR360: Your Auto Gateway: https://lovable.dev/projects/fb219e2d-a40f-48f1-aa2d-caf43234e478

Review code, Supabase schemas, integrations, unique business logic and edit histories. Treat live databases as production data. Never reset or overwrite them without a verified backup and approved migration plan.

## Product vision
Build Bazar360 as a premium, trusted, multi-sector Pakistan marketplace and SaaS platform. Automotive is the flagship. It should feel polished and high-end while staying as easy to use as a familiar social marketplace.

Principles:
- Mobile-first, fast, clear, accessible and responsive from small phones to large screens.
- Luxury comes from spacing, typography, image quality, motion restraint and consistency, not heavy effects.
- 3D and animation are progressive enhancements. Respect reduced-motion preferences and keep core tasks fast on low-end phones.
- Do not copy protected brand assets or exact proprietary page designs.
- Keep the buyer journey simple: discover, filter, inspect, trust, contact, save and compare.
- Design shared marketplace foundations for future sectors, with sector-specific listing fields.

## Architecture decision
The canonical repository currently uses Vite + React + TypeScript with an Express server and Firebase. The Next.js and TanStack/Supabase repositories use different architectures. Do not rewrite everything just because a framework is newer. Compare SEO, deployment, data models, security, costs, and migration risk, then choose and document one supported architecture before large-scale changes.

Minimum engineering standards:
- Strict TypeScript, schema validation at API boundaries, clear modules, environment validation, structured logs and error handling.
- Server-side authorization for every privileged action. Never trust client-side role checks.
- Test Firestore rules/indexes if Firebase remains; test Supabase RLS/policies/migrations if Supabase is selected.
- Never expose service-role keys, admin credentials, secrets or private tokens in client bundles or committed files.
- Validate upload type, size, ownership and authorization. Do not rely on unrestricted unsigned media uploads.
- Authentication must handle loading, expiry, verification, errors and account recovery.
- Add rate limits, abuse controls, secure headers, input validation, safe rendering and CSRF protection where relevant.
- Keep dependencies and lockfiles consistent; remove unnecessary duplicate libraries.
- SEO: unique metadata, canonical URLs, Open Graph, sitemap, robots rules and valid structured data.
- Observability: error reporting, health checks, actionable logs, uptime monitoring and rollback steps.

## Required product areas

### Public marketplace
- Premium home page, sector navigation, search suggestions, filters and sorting.
- Vehicle listings with accurate price, make, model, year, mileage, transmission, fuel, body type, city, condition and seller type.
- Detail pages with image gallery, seller/showroom profile, trust signals, freshness, similar listings and safe contact.
- Compare, favourites, recently viewed, saved searches and shareable URLs.
- Verified dealer/showroom pages and inventory.
- Lead capture with consent, duplicate prevention, status tracking and seller notifications.
- Complete loading, empty, error, offline and no-results states.
- No fabricated inventory, reviews, verification badges or analytics.

### Seller and dealer SaaS
- Onboarding, profile and showroom setup.
- Listing drafts, preview, publish, edit, pause and archive.
- Media upload, ordering, compression, validation and deletion.
- Inventory, enquiries/leads, team access, plans and billing history.
- Analytics computed from real events with clear time windows.
- Tenant isolation on every query and mutation.

### Platform administration
- Roles for platform admin, moderator, dealer owner, dealer staff and buyer.
- Moderation queues, reports, audit logs, user/listing management and approval/suspension workflows.
- Protect admin actions server-side and log them.
- Never allow users to self-assign privileged roles.

### Multi-sector foundation
Automotive first, with room for property, electronics, home/lifestyle and services. Share seller accounts, media, leads, moderation, search and plans. Keep sector-specific schemas and validation rather than one untyped listing model.

## Design system
Replace inconsistent theme only after preserving reusable assets and key workflows. Define tokens for colors, surfaces, borders, text, status, focus, typography, spacing, radius, elevation and responsive containers. Standardize buttons, inputs, menus, cards, filters, dialogs, toasts, tables, skeletons and navigation. Use high-quality licensed imagery, consistent ratios and responsive loading. Include visible focus, keyboard support, clear labels/errors, WCAG 2.2 AA target, reduced-motion alternatives and no horizontal overflow at 320px.

## Repository consolidation and data migration
1. Record each repository's default branch, latest commit, tags, branches, complete file tree, manifests, env examples, database rules/migrations, assets and deployment setup.
2. Compare duplicated files and history. BAZAR360 and V3 appear similar, so avoid redundant copies.
3. Build a feature matrix and select the strongest implementation for each capability.
4. Import unique modules into clear directories or selectively port them. Do not combine incompatible root configs and lockfiles.
5. Preserve provenance in docs/migration and map source paths/commits to destination commits.
6. Run builds, lint, type checks, unit/integration/e2e tests and security checks after each migration slice.
7. Verify data models, rules/RLS, indexes, storage permissions, environment and production integrations.
8. Keep all source repositories intact until canonical checks pass, deployment is verified and rollback is tested. Prefer archiving. Delete only after explicit final confirmation.

## Release gates
- Clean install from lockfile, TypeScript, lint and unit tests.
- Integration tests for auth, listing CRUD, upload authorization, lead capture and tenant isolation.
- E2E tests for buyer, seller/dealer, moderator and admin journeys.
- Accessibility and responsive checks at 320, 360, 390, 768, 1024, 1280 and 1440px.
- Mobile performance checks, dependency/secret scans and Firestore rules or Supabase RLS tests.
- Production smoke tests for login, browse/search, detail page, lead/contact, seller dashboard and moderation.
- Backup and rollback rehearsal before database or deployment changes.

Release gate: no known critical/high security issue, no broken core journey, no unresolved build/type/lint failure, no fake production data, and no destructive migration without backup. Never claim production readiness without recorded evidence.

## Execution order
1. Audit full trees and recent commits in all five repositories.
2. Read relevant source from all Bazar360 Lovable projects, including schemas and integrations.
3. Produce feature matrix, risk list and migration map.
4. Choose architecture based on evidence.
5. Build shared design system and public buyer journey.
6. Complete secure seller/dealer SaaS, leads, moderation and admin workflows.
7. Port only useful unique features from secondary repositories and Lovable.
8. Run test gates and fix failures, including mobile, keyboard and reduced-motion checks.
9. Deploy staging, run smoke tests, verify data and rollback.
10. Merge to main only after checks pass. Archive secondary repositories; delete only after explicit final confirmation.

## Final report requirements
Report commits, changed files, repositories reviewed, migration decisions, tests actually run and evidence, security/data migration results, known gaps, deployment URL, verified smoke tests and actions needing owner approval. An AI agent's claim is not proof; inspect diffs and run tests.

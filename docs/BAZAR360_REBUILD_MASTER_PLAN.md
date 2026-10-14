# BAZAR360 CTO Rebuild Plan and Execution Brief

Status: planning branch created from `main`. This document is an implementation brief, not proof that the app is production-ready.

## Canonical repository and safety rules

- Canonical repository: https://github.com/AmjidOfficial/BAZAR360
- Canonical production branch: `main`
- Working branch for audit/rebuild planning: `cto/rebuild-audit-plan`
- Candidate sources to audit: `Bazar360.online-V3`, `automotive-marketplace-platform`, `BAZAR360.V2.0`, `Cars`, and Bazar360-related Lovable projects.
- Never delete a source repository until its useful code, assets, migrations, history needed for traceability, configuration templates, and documentation have been reviewed and safely consolidated. Keep a verified backup and record the final commit SHA first.
- Never copy secrets or real `.env` files into Git. Use placeholders in `.env.example`.
- Do not migrate, overwrite, or delete production data. Back up and test any data migration on a separate environment first.
- Do not claim a test, audit, build, deployment, or integration succeeded unless it was actually run and its result recorded.

## Known architecture signals from initial inspection

The canonical repository README describes React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Express, Firebase Authentication, Firestore, Firebase App Check, Cloudinary, and SEO metadata. Its package manifest includes Vite/React, Firebase client/admin SDKs, Express, Motion, React Router, Zod, and related packages.

Other candidates have different architecture signals:
- `Bazar360.online-V3`: React/Vite/Firebase-oriented application.
- `automotive-marketplace-platform`: Next.js 16 / React 19 application.
- `BAZAR360.V2.0`: Google AI Studio application.
- `Cars`: TanStack Start and Supabase-related dependencies.
- Lovable's Bazar360 Automotive Hub: TanStack Start with Supabase, dealership routes, inventory, media feed, market insights, concierge, and admin/showroom routes.
- Other Lovable projects describe Firestore-based authentication, listings, favorites, WhatsApp lead tracking, and admin approval flows.

These signals are not enough to decide which implementation is best. Inspect actual code, database schemas, migrations, security policies, runtime behavior, and test results before consolidating.

## Non-negotiable product goals

Build Bazar360.online as a premium, trustworthy, Pakistan-first, multi-sector marketplace with automotive as the flagship vertical. Keep the user experience light, fast, and easy to understand. The design should feel refined and modern, with high-quality vehicle imagery, strong typography, deliberate spacing, subtle motion, and a consistent design system. Use Audi/Mercedes as quality references, not as assets or layouts to copy.

### Core public marketplace
- Responsive home page with useful search, clear sector/category entry points, featured and recent listings, verified dealers, and trust signals based on real data.
- Automotive search and filtering by make, model, year, price, mileage, condition, body type, transmission, fuel, location, and seller type where available.
- Listing detail page with responsive image gallery, factual specifications, seller/dealer profile, location, saved/favorite action, report listing action, and enquiry/contact actions.
- Listing creation/editing with validation, draft/published states, media upload, preview, moderation/approval where required, and clear error handling.
- Search URL state, pagination or incremental loading, empty states, loading skeletons, error states, and useful mobile filters.
- No fake ratings, fake inventory, fabricated verification badges, or misleading market data. Label demo content clearly when real data is not configured.

### Accounts, trust, and seller tools
- Secure sign-in and sign-up with the providers already supported by the selected architecture. Do not promise OTP or social providers until configured and tested.
- Role-based access control for guests, buyers, individual sellers, showroom staff/owners, moderators, and platform administrators.
- Showroom profiles, inventory management, lead inbox, listing analytics, team access, and approval status.
- Buyers can save listings and manage enquiries/favorites where the chosen data model supports them.
- Admin moderation for users, showrooms, listings, reports, and audit logs. Enforce permissions on the server/database, not only by hiding UI controls.
- WhatsApp or phone contact must use validated seller details and must not expose private account information.

### SaaS and platform operations
- Define tenant boundaries and ownership rules. Every tenant-owned read/write must enforce tenant membership and role permissions.
- If subscriptions are included, implement billing only after the provider, plan model, webhook verification, cancellation, failed payments, and entitlement rules are agreed and tested.
- Add safe audit logs for sensitive actions, rate limits for public write endpoints, spam prevention, server-side validation, and abuse reporting.
- Keep credentials and privileged SDKs server-side. Never expose admin service credentials, API secrets, or private environment values in client bundles.
- Keep production configuration separate from preview and local development.

## Design and engineering standards

- Create one design token system for color, typography, spacing, radii, shadows, layering, breakpoints, and motion.
- Remove legacy theme rules only after inventorying all components and preserving required contrast and states.
- Use semantic HTML, accessible labels, keyboard focus states, appropriate heading order, and WCAG 2.2 AA targets where practical.
- Respect `prefers-reduced-motion`; avoid heavy 3D effects that delay first interaction or harm mobile performance.
- Use responsive CSS with deliberate breakpoints and test small phones, large phones, tablets, laptops, and wide screens.
- Optimize image dimensions, responsive formats, lazy loading, font loading, route chunks, and third-party scripts.
- Prevent layout shift; define image aspect ratios and loading placeholders.
- Avoid duplicated components, giant page components, brittle CSS overrides, untyped data, and hidden console errors.
- Use TypeScript strictness where feasible, Zod or equivalent validation at trust boundaries, and a clear service/data-access layer.
- Keep architecture changes incremental. Do not switch frameworks or replace Firebase/Supabase simply because a framework is newer.

## Mandatory audit before implementation

1. Record the current `main` commit SHA and inspect the complete file tree and recent commits.
2. Audit each source repository's branches, commits, dependencies, environment-variable names, route map, assets, tests, CI, deployment config, and license/asset provenance.
3. Compare candidate implementations feature-by-feature. Identify duplicated, unique, broken, stale, and potentially reusable code.
4. Inspect Firebase Auth, Firestore collections/indexes/rules, Cloud Functions/server code, App Check, Cloudinary upload configuration, and any other live services.
5. Inspect Supabase schemas, migrations, RLS policies, auth, storage, edge functions, and project configuration in candidates using Supabase.
6. Never assume two backends are interchangeable. Write a migration plan and test fixtures before any consolidation.
7. Inspect the connected Lovable projects and their latest commits, file trees, edit histories, knowledge/instructions, and actual code. Treat project descriptions as leads, not proof.
8. Review available recordings, screenshots, and source files. Turn each observable issue into a reproducible test or tracked item.
9. Run dependency installation, lint/typecheck, unit tests, integration tests, production build, and end-to-end smoke tests when the environment permits. Record exact commands and outcomes.
10. Establish baseline measurements for bundle size, loading performance, accessibility, responsive layout, and console/network errors.

## Safe consolidation approach

1. Preserve `main` as the stable canonical source until an approved replacement is verified.
2. Use short-lived feature branches and pull requests. Keep a dated backup/tag before large changes.
3. Port useful features in small, reviewed slices. Prefer extracting reusable components and business logic over copying entire incompatible applications.
4. Maintain a source-to-destination manifest for every adopted file, asset, migration, and feature.
5. Choose one authoritative backend after comparing real data, security, operational cost, and existing integrations. Do not dual-write to Firebase and Supabase without a designed synchronization system.
6. Use separate development/staging data and test migrations with rollback steps.
7. Run CI and manual device tests before merging to `main`.
8. Deploy a preview first. Verify authentication, listings, media upload, search, enquiry/lead flows, tenant isolation, admin permissions, SEO, and error recovery.
9. Verify production deployment and smoke tests after merge. Record the deployed commit and rollback instructions.
10. Only after the canonical repository is complete, backed up, deployed, and independently verified should retirement of redundant repositories be considered. Repository deletion requires a final explicit confirmation immediately before deletion.

## Definition of done

- Clean dependency installation and successful production build.
- Lint, typecheck, unit, integration, and end-to-end checks pass, or any remaining failures are explicitly documented and blocking issues are fixed.
- No exposed secrets, critical dependency/security issues, unprotected admin paths, or cross-tenant data access.
- Core marketplace and seller flows work with real configured services.
- Responsive checks pass on phone, tablet, desktop, and wide screens.
- Keyboard navigation, visible focus, accessible labels, contrast, reduced motion, and empty/error/loading states are verified.
- SEO metadata, canonical URLs, robots/sitemap behavior, and structured data are accurate.
- No fake metrics or unverified production claims.
- Deployment and rollback procedures are documented.
- Evidence, screenshots, test output, commit SHA, and known limitations are recorded.

---

# Master instruction for the implementation agent

You are the lead full-stack engineer and technical owner for Bazar360.online. Work directly in the canonical repository `AmjidOfficial/BAZAR360`. The goal is to audit, rebuild, and improve the actual application, not merely write recommendations or generate a mockup.

First inspect the current repository and all provided candidate repositories and project files. Use the plan above as the acceptance contract. Review prior project discussions, available source files, screenshots, and recordings that are actually accessible. Do not claim access to resources you cannot open.

Work in phases:
1. Audit and report the current code, architecture, security, data model, feature coverage, responsive behavior, build health, and deployment.
2. Make a prioritized issue list with exact files and evidence.
3. Create a branch and implement the highest-value fixes in small, coherent commits.
4. Rebuild the UI with a cohesive luxury design system while preserving working business behavior.
5. Repair real marketplace, auth, seller, dealer, moderation, and lead flows. Remove mock-only behavior where real integrations exist; otherwise show clear setup states rather than pretending.
6. Harden backend rules and server-side validation. Never place secrets in source.
7. Run tests and production build, fix the failures, and report what could not be verified.
8. Provide a concise change log, test evidence, deployment steps, rollback steps, and remaining blockers.

Do not stop after writing a plan. Continue to implement concrete changes in the repository. Do not rewrite everything blindly, switch the backend without a migration plan, remove user data, deploy unverified code, or delete source repositories before the canonical app has passed the definition of done. Do not mark the project 100% production-ready without evidence.

Design target: premium, modern, responsive, accessible, lightweight, trustworthy, and simple enough for first-time users. Automotive is the flagship sector; keep the architecture ready for additional marketplace sectors without forcing irrelevant categories into every screen. Prioritize real functionality and performance over decorative animation.

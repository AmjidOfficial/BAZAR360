# BAZAR360.online: Master Rebuild, Consolidation, and Production-Readiness Prompt

> **Canonical repository:** https://github.com/AmjidOfficial/BAZAR360  
> **Production domain:** https://bazar360.online  
> **Product:** Bazar360, a Pakistan-first multi-sector marketplace and SaaS platform  
> **Primary instruction:** Work in the canonical repository. Inspect first, preserve working business logic, then make verified changes in small, reviewable steps. Do not claim a task is complete unless the relevant code, tests, and deployment evidence support it.

## 1. Your role and outcome

Act as a senior staff engineer, product designer, security engineer, QA lead, and technical owner. Take responsibility for bringing Bazar360 to a coherent, polished, maintainable, accessible, fast, and production-ready state.

Do not produce only a plan, mockup, checklist, or landing page. Inspect the actual codebase, implement the highest-value fixes, run available checks, document any blocked work, and report exact files changed and evidence collected. Work within the actual capabilities of this environment. Never claim access to services, files, logs, databases, or deployments you did not inspect.

The desired experience combines:
- Premium, precise automotive presentation inspired by the restraint and craft of luxury car brands, without copying their trademarks or page designs.
- The speed, clarity, familiarity, and low-friction use of mainstream social and classifieds products.
- A clear, trustworthy, mobile-first marketplace experience for Pakistan.
- A scalable multi-sector platform, not a car-only hard-coded application.
- Real functionality, secure data access, honest listing states, and reliable seller/buyer workflows.

## 2. Repository consolidation policy

The only canonical repository is:
- `AmjidOfficial/BAZAR360` (main branch)

Inspect and compare these source repositories before selecting code or features:
- `AmjidOfficial/Bazar360.online-V3`
- `AmjidOfficial/automotive-marketplace-platform`
- `AmjidOfficial/BAZAR360.V2.0`
- `AmjidOfficial/Cars`

The canonical repository was listed twice in the original request; it is a single source, not a duplicate.

Also review relevant Bazar360 projects in the connected Lovable workspace and the linked Gemini AI Studio app/source repository, including recent changes and any shared requirements that are available to you. Treat generated descriptions, README claims, mock data, and agent summaries as leads to verify, not proof that a feature works.

### Safe consolidation procedure
1. Record the default branch, latest commit, dependency stack, scripts, source tree, environment-variable names, Firebase configuration, Firestore rules, Cloudinary integration, deployment configuration, and tests for every accessible repository.
2. Compare the actual files and changes, not only repository names or README descriptions. Identify unique working features, newer fixes, security changes, assets, schema/rule changes, and useful commit history.
3. Create a feature/source matrix showing: feature, source repository/project, files, dependencies, data model, security impact, tests, and proposed destination.
4. Keep `main` deployable. Use a dedicated integration branch and small logical commits. Preserve the original source branches until integration and backup checks are complete.
5. Prefer selective, reviewed cherry-picks or clean ports over copying entire repositories on top of one another. Resolve dependency, route, CSS, schema, and naming conflicts deliberately.
6. Never overwrite production environment files, credentials, Firestore rules, Firebase config, Cloudinary presets, hosting settings, or domain settings without checking the impact.
7. Do not commit real secrets, private user data, service-account keys, API tokens, or local environment files. If a secret appears in tracked source, treat it as a security incident: do not repeat it in logs or reports, remove it safely, and advise rotation.
8. Do not delete any source repository as part of this automated task. Repository deletion is destructive and must wait until the owner has a verified backup, an accepted consolidation, successful production checks, and a separate explicit confirmation. Archiving is safer than deleting.
9. If the available integration does not support full Git history, repository tree inspection, tests, or safe cross-repository merges, state the limitation and produce a reproducible local Git procedure instead of pretending the merge occurred.

## 3. Establish the real architecture before changing it

The current master repository uses React 19, TypeScript, Vite, Tailwind CSS v4, an Express server, Firebase/Firestore and Firebase Authentication, Cloudinary, and motion/3D-related libraries. Verify the live files and installed versions before relying on this statement.

Other sources may use Next.js, Supabase, TanStack Start, or different versions of Firebase and React. Do not blindly mix incompatible frameworks or duplicate backend systems. Choose one clear production architecture based on the current working master, deployment needs, SEO, and evidence. Migrate only if there is a measured benefit and a tested migration plan.

Produce or update:
- `docs/ARCHITECTURE.md`
- `docs/REPOSITORY_CONSOLIDATION.md`
- `docs/PRODUCTION_READINESS.md`
- `docs/ENVIRONMENT.md` (variable names and setup guidance only, no values)
- A concise data model and role/permission map.

Document the source of truth for listings, users, showrooms, leads, messages, media, reviews, favorites, analytics, and admin settings. Do not silently create a second source of truth.

## 4. Product scope and sectors

Build a consistent multi-sector marketplace foundation. Automotive is the flagship sector and must remain fully supported. Design the platform so additional sectors can be added through configuration and sector-specific schemas/components, not by duplicating the whole application.

Target sectors where the current requirements and data support them:
- Automotive: new/used cars, motorcycles, commercial vehicles, parts, accessories, workshops, inspection, maintenance, and related services.
- Property and real estate.
- Electronics and home appliances.
- Fashion and lifestyle.
- Home, furniture, and household goods.
- Jobs and professional/local services.
- Other approved marketplace categories.

For each sector define its category tree, required listing fields, filters, condition/availability rules, moderation rules, and seller types. Do not display fake counts, fake reviews, fake verification, or fabricated inventory. If a sector is not implemented, mark it as planned or unavailable rather than presenting dead UI as a working feature.

## 5. UX, UI, brand, and responsive design

Replace the current visual theme coherently rather than layering endless CSS overrides on top of it. First inventory existing styles, tokens, components, breakpoints, and conflicting selectors. Preserve working behavior while rebuilding the design system.

Create a documented design system with:
- Premium, calm, consistent colors and strong contrast.
- Clear type scale, spacing scale, radii, shadows, borders, and elevation.
- Reusable buttons, fields, dialogs, cards, badges, navigation, empty states, loading states, and error states.
- Clear visual hierarchy and readable listing information.
- Consistent icon style and restrained motion.
- Real, licensed or approved imagery with responsive image sizing and useful alt text.
- A consistent light/dark strategy only if both modes are fully supported.

Responsive behavior must be tested at narrow mobile widths, common Android and iPhone sizes, tablets, laptops, and large desktop displays. Check at least 320, 360, 375, 390, 414, 768, 1024, 1280, 1440, and 1920 CSS pixels. Avoid horizontal overflow, clipped dialogs, tiny touch targets, broken sticky navigation, and card layouts that fail at intermediate widths. Use fluid CSS, Flexbox, Grid, container queries where useful, and media queries based on actual content needs.

Accessibility requirements:
- Semantic HTML and a logical heading structure.
- Keyboard navigation and visible focus.
- Proper labels, validation, and accessible names.
- Dialog focus management and escape behavior.
- Contrast that meets WCAG 2.2 AA where applicable.
- Reduced-motion support.
- Screen-reader status announcements for asynchronous actions.
- Minimum practical touch targets of about 44 by 44 CSS pixels.

Motion and 3D must be purposeful, lightweight, and optional. Respect `prefers-reduced-motion`. Lazy-load heavy 3D assets, never make core navigation depend on animation, and do not sacrifice mobile speed for decorative effects.

## 6. Required marketplace flows

Inspect, implement, and test each feature that is part of the product. Do not stop at a pretty homepage.

### Public buyer experience
- Homepage, sector/category navigation, search, filters, sort, pagination or safe infinite loading.
- Listing detail pages with media galleries, specifications, price, location, seller/showroom details, status, and related listings.
- Shareable, bookmarkable URLs and meaningful not-found states.
- Favorites, saved searches if supported, recently viewed items, and comparison/shortlist where supported.
- Contact seller, phone/WhatsApp actions, lead tracking, report listing, and clear error/success feedback.
- Mobile bottom navigation only where it improves the flow and does not cover content.

### Seller and showroom experience
- Registration and authentication with clear role selection and verification.
- Seller/showroom profile, logo/cover/gallery, contact details, location, and public storefront.
- Create/edit/draft/pause/archive/mark-sold listing workflows.
- Image/video upload, validation, previews, progress, retry, size limits, and safe cleanup.
- Inventory management, inquiries/leads, favorites or saved items where applicable, and honest analytics.
- Ownership checks on every mutation, not just hidden buttons.

### Admin and moderation
- Secure admin access based on trusted server-side claims or verified records, never a client-controlled role field.
- Listing/showroom approval, reports, suspensions, audit history, and moderation queues.
- Role and permission checks for every protected operation.
- Clear empty/loading/error states and pagination for large collections.
- Audit logs that do not expose secrets or unnecessary personal data.

### Other existing product areas
Review current messaging, reviews, community/social feed, services/bookings, notifications, QR codes, SEO, visitor analytics, PWA/offline support, and AI integrations. Preserve them only where real code and data contracts are understood, and finish their broken flows. Avoid fake controls and dead buttons.

## 7. Backend, Firebase, Firestore, and Cloudinary

Inspect all Firebase initialization, auth flows, Firestore access services, security rules, indexes, Cloud Functions/server endpoints, and environment-variable usage. Verify actual project configuration without printing secrets.

### Security baseline
- Default-deny rules with explicit least-privilege access.
- Validate document shape, types, lengths, allowed fields, ownership, and state transitions.
- Prevent self-assigned admin roles and role escalation through profile updates.
- Check authorization on the server or database rules, not only in React.
- Restrict reads of personal information, conversations, leads, bookings, and analytics to authorized users.
- Enforce query limits and pagination. Ensure client queries are compatible with Firestore rules.
- Prevent users from changing immutable ownership, verification, moderation, or audit fields.
- Validate all external inputs and sanitize rendered user content.
- Add rate limiting and abuse controls to sensitive endpoints and lead/auth flows where appropriate.
- Use App Check and server-side verification only when correctly configured; never make production security depend on debug tokens.
- Keep privileged Firebase Admin SDK code server-side. Never expose service-account credentials or secret API keys in browser bundles.
- Verify Firestore rules with emulator/security tests. Do not loosen rules just to make a failing UI appear to work.

### Cloudinary/media
- Check upload presets, signed versus unsigned uploads, allowed formats, size limits, transformations, and ownership.
- Unsigned presets must be narrowly restricted and must not grant broad destructive access.
- Validate file type and size on both client and server where applicable.
- Use responsive transformations, lazy loading, correct aspect ratios, placeholders, and alt text.
- Do not persist temporary or broken media URLs as successful uploads.
- Never expose API secrets in Vite-prefixed client environment variables.

### Data integrity
- Define consistent timestamps and status enums.
- Avoid duplicate listing records and duplicate lead events.
- Use transactions/batches or idempotency keys where needed.
- Provide indexes for real query patterns.
- Avoid destructive migrations. Back up and document data migrations before running them.
- Do not insert fake production records to make dashboards look full.

## 8. Performance, SEO, and reliability

Measure before and after. Target Core Web Vitals in the green where realistic: LCP <= 2.5 seconds, INP <= 200 ms, CLS <= 0.1 for the 75th percentile of real visits. Do not claim field metrics without real field data.

Review:
- Route-level code splitting and lazy-loaded components.
- Unnecessary re-renders, large dependencies, duplicate icon imports, and heavy 3D/chart/PDF bundles.
- Image formats, responsive sizing, caching, font loading, and layout shifts.
- Firebase listener cleanup, retry behavior, offline states, and unbounded queries.
- Bundle-size reports and Lighthouse/Playwright measurements where tools are available.

SEO:
- Unique titles and descriptions for sector, search, showroom, and listing pages.
- Canonical URLs, Open Graph/social cards, robots/sitemap, and correct HTTP status behavior.
- Structured data only when it matches visible, verified content.
- Noindex private dashboards, admin pages, and private account content.
- Avoid indexing duplicate filter combinations or private user data.

Reliability:
- Useful 404 and error boundaries.
- Safe API error handling without leaking stack traces.
- Logging that is actionable and avoids personal data/secrets.
- Health checks and clear deployment/rollback steps.
- PWA/offline behavior only where it can safely synchronize data and explain stale state.

## 9. Code quality and dependency safety

- Run the actual package scripts and inspect their meaning before using them.
- Fix TypeScript errors, lint failures, broken imports, route errors, console errors, and build warnings that indicate real problems.
- Remove dead code and unused dependencies only after checking references and runtime behavior.
- Avoid broad `any`, duplicated business logic, giant monolithic components, magic values, and repeated CSS overrides.
- Use shared typed domain models and centralized validation.
- Pin or constrain dependencies responsibly; review security advisories and avoid unnecessary major upgrades.
- Keep lockfiles in sync with the package manager actually used.
- Add tests before changing sensitive permissions, data contracts, and core purchase/contact flows.

## 10. Testing and release gates

Add or run tests appropriate to the existing stack:
- Unit tests for formatters, validation, filters, permissions, and domain logic.
- Firestore rules tests for guest, owner, seller, moderator, and admin access.
- Integration tests for authentication, listing creation/editing, image uploads, favorites, and lead creation.
- End-to-end tests for the most important buyer and seller journeys.
- Responsive and accessibility checks.
- Production build, lint, type-check, dependency audit, and smoke tests.

Minimum release gates:
1. Clean dependency install succeeds with the documented package manager.
2. Type-check and lint pass, or every remaining failure is listed with evidence and severity.
3. Production build succeeds.
4. Critical user journeys pass on desktop and mobile.
5. Unauthorized database operations are rejected by rules/tests.
6. No secrets are present in tracked source or built client assets.
7. No known critical/high security issue is left untriaged.
8. Deployment and rollback instructions are accurate.
9. Live deployment is tested only if access is available; otherwise state that live verification is blocked.
10. Report what passed, failed, was not run, and why.

Never label the site “100% production ready” based only on source inspection or a successful build. Use evidence-based status.

## 11. Required execution order

Work in these phases and make real changes in the repository:

**Phase A: Baseline**
- Record branch/commit and source tree.
- Inspect package scripts, routes, services, environment variable names, rules, hosting, tests, and existing docs.
- Capture build/lint/type-check status and current known failures.
- Check current UI at common viewport widths if browser tools are available.

**Phase B: Source comparison**
- Inspect the four source repositories and the relevant Lovable projects.
- Create the source/feature matrix and identify conflicts.
- Check recent Gemini AI Studio changes only through available connected or repository sources. Do not claim access to a private app just because a URL exists.

**Phase C: Stabilize**
- Fix critical build/type/runtime/security failures first.
- Add or repair baseline tests.
- Make small commits on a feature branch.

**Phase D: Design system and UX**
- Create tokens and shared components.
- Redesign core navigation, homepage, search/listing cards, listing detail, seller tools, and mobile layouts.
- Preserve working data operations and add real loading, empty, success, and error states.

**Phase E: Feature and data integration**
- Port selected source features one at a time.
- Reconcile data models, permissions, dependencies, media behavior, and routes.
- Test each integration before taking the next one.

**Phase F: Production checks**
- Run all available gates, inspect build output and browser errors, test mobile widths, review security rules and environment exposure, and verify deployment configuration.
- Fix discovered defects, not just document them.

**Phase G: Release**
- Summarize commits, files changed, test results, unresolved blockers, migration risks, and rollback instructions.
- Open a pull request for review. Do not merge into main or deploy automatically if required checks are unavailable or failing.

## 12. Definition of done

The work is complete only when:
- `BAZAR360` remains the canonical repository.
- A documented comparison explains what was selected from each source and what was intentionally not ported.
- The application has a coherent, responsive, accessible design system.
- Core buyer, seller, showroom, and admin journeys work with real data and secure permissions.
- Firestore rules and media handling have been reviewed and tested to the extent supported by the environment.
- Build, type-check, lint, tests, and smoke checks have evidence-based results.
- No secrets were introduced into source control.
- Deployment, environment setup, data migrations, and rollback steps are documented.
- Every unresolved issue is clearly labeled; nothing is described as fixed unless it was changed and verified.

## 13. Final report format

Return:
1. **What was actually inspected** with exact repositories, branches, projects, and commit references.
2. **Changes made** with commit SHAs, paths, and reasons.
3. **Consolidation matrix** showing which source features were accepted, rejected, or still need review.
4. **Test table** with command, result, and evidence.
5. **Security findings** ranked Critical/High/Medium/Low, without printing secrets.
6. **Responsive and accessibility results** with tested viewport sizes and known gaps.
7. **Production status**: Ready, Ready with known limitations, or Not ready. Explain why.
8. **Outstanding access requirements** for anything that needs owner action.
9. **Exact next steps**. Do not hide blockers behind optimistic language.

## Start now

Begin with Phase A and Phase B. Inspect actual files, not just this prompt. Then make the safest high-value code changes possible in a branch. Keep the master repository stable, preserve source projects, and show evidence for every claim.

# BAZAR360.online — Master Rebuild, Merge, and Production-Readiness Prompt

You are the senior engineering team responsible for BAZAR360.online. Work from the connected GitHub repository and the actual current application. Do not assume previous AI-generated claims are correct. Inspect code, configuration, deployment, screenshots, requirements, and commit history first.

## 0. Source of truth and non-negotiable rules
- Canonical repository: https://github.com/AmjidOfficial/BAZAR360.git
- Canonical product/domain: https://bazar360.online
- Treat `BAZAR360` as the only final source of truth.
- Compare these source repositories before migrating anything:
  1. https://github.com/AmjidOfficial/Bazar360.online-V3.git
  2. https://github.com/AmjidOfficial/automotive-marketplace-platform.git
  3. https://github.com/AmjidOfficial/BAZAR360.V2.0.git
  4. https://github.com/AmjidOfficial/Cars.git
  The repeated BAZAR360 URL in the original request is the master, not an additional source.
- Do not delete, archive, overwrite, or force-push any repository or branch during the audit/migration. First preserve a recoverable backup, inventory every unique feature and asset, migrate it, build/test it, and obtain explicit final confirmation before any destructive repository deletion. Never expose or commit secrets.
- Do not claim a task is done unless a command, test, live check, or commit proves it. Mark unavailable checks as BLOCKED with the exact missing access or credential.
- Keep existing real data and integrations. Never replace live database data with mock/demo data. Do not create a second competing source of truth.

## 1. Product vision
Rebuild BAZAR360 as a world-class, premium, trustworthy, multi-sector marketplace and SaaS platform. Its first-class vertical is Auto Choice / automotive, while the architecture must allow future sectors without duplicating the whole app. The interface should feel refined like a premium automotive brand, but remain as easy to understand and lightweight as Facebook Marketplace. It must be responsive on small phones, large phones, tablets, laptops, and wide desktop displays.

The current theme, colors, fonts, backgrounds, typography, layout, and visual styling are not sacred. Audit them, then replace the visual system coherently. Do not copy Mercedes/Audi branding, logos, or protected assets. Use an original BAZAR360 identity.

## 2. Required workflow: inspect before changing
1. Record default branches, commit SHAs, package managers, frameworks, package scripts, deployment targets, environment variable names, integrations, routes, and current tests for every repo.
2. Build a feature/file inventory for all repositories. Identify unique routes, components, domain models, services, server endpoints, database migrations/rules, media assets, SEO metadata, localization, and admin tools.
3. Compare changes and history. Do not blindly merge repositories that use incompatible architectures. The known repos include React/Vite/Express/Firebase/Cloudinary code and separate Next.js or TanStack/Supabase-based projects. Keep the best working implementation, migrate useful features deliberately, and document why conflicting code was not copied.
4. Inspect all project discussions, attached screenshots/videos, and the current BAZAR360/Lovable/Gemini AI Studio implementations when available. Treat them as evidence, not as automatic truth. Record what was actually inspected.
5. Create a baseline audit before implementation and maintain a checklist with status, evidence, blocker, and owner.

## 3. Architecture and code quality
- Preserve the working framework in the master repository unless the audit proves a migration is necessary and a tested migration plan exists. Do not rewrite the backend just to use a fashionable framework.
- Use supported, stable versions of React/TypeScript and the repository's established build system. Consider Next.js only if it materially improves SSR/SEO and the migration can be completed and tested safely.
- Separate UI, domain logic, persistence, authentication/authorization, media handling, analytics, and external integrations.
- Use typed domain models, runtime validation at untrusted input boundaries, reusable components, clear loading/empty/error/success states, and consistent error reporting.
- Remove duplicate components, dead code, stale dependencies, debug logs, fake controls, and placeholder links only after confirming they are unused.
- Keep secrets server-side. Client-side variables must only contain public keys designed to be public. Never commit .env files, private API keys, service-account JSON, access tokens, or production data dumps.
- Provide a clear .env.example with variable names and descriptions, not real values.
- Add CI checks for install, type-check, lint, unit tests, production build, and security-sensitive rules where feasible.

## 4. Premium visual and UX redesign
Create an original, cohesive design system with:
- A premium, calm palette, strong contrast, readable typography, deliberate spacing, consistent radii, restrained shadows, and high-quality imagery.
- A responsive navigation system, clear search-first marketplace flow, obvious category/sector switching, strong listing cards, useful filters, and clear seller contact actions.
- High-quality vehicle listing details with image gallery, specifications, price, location, seller/showroom trust signals, related inventory, and a visible report-listing path.
- Consistent page states: loading skeletons, empty search results, validation messages, network errors, permissions errors, success confirmations, and offline/slow-network handling.
- Accessible forms, keyboard navigation, visible focus states, semantic landmarks, alt text, accessible dialogs, reduced-motion support, and sufficient color contrast.
- Mobile-first layouts and touch targets. Verify at 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px widths. Avoid horizontal overflow, clipped dialogs, tiny controls, and layout shifts.
- Motion should be purposeful and light. Use 3D only when it adds value; provide reduced-motion and low-power fallbacks. Do not sacrifice performance for decoration.
- Optimize images, use responsive sizes and lazy loading where appropriate, prevent cumulative layout shift, split heavy routes, and avoid unnecessary client-side JavaScript.

## 5. Marketplace and SaaS capabilities to audit and complete
Implement only after verifying current routes and data contracts; avoid duplicate features:
- Public home, sector/category navigation, search, filters, sorting, listing cards, listing detail, seller/showroom profile, location, favorites, and recently viewed items.
- Vehicle inventory fields and filters appropriate to the real domain: make, model, year, price, mileage, transmission, fuel, body type, condition, city, and seller type.
- Auth flows, profile management, seller onboarding, showroom registration, listing creation/editing, image uploads, drafts, moderation/approval, listing status, and safe contact/lead capture.
- Role-based dashboards for platform admin, showroom owner/staff, and individual seller. Enforce authorization on the server/database, not only by hiding UI controls.
- Lead management, inquiry history, analytics, audit logs for sensitive admin actions, and safe export/reporting where supported.
- Verified seller/showroom indicators must be backed by a real verification workflow. Never display false verification, ratings, inventory, metrics, or testimonials.
- Multi-tenant boundaries must be enforced in every data query and mutation. A tenant must never read or edit another tenant's private data.
- Payments, subscriptions, bidding, messaging, notifications, AI features, and additional marketplace sectors must be audited as separate integrations. Do not present them as working if they are not fully connected and tested.
- Build a clear admin configuration model for future sectors, rather than scattering sector-specific conditional logic throughout the codebase.

## 6. Firebase, database, authentication, Cloudinary
- Inspect Firebase project configuration, Authentication providers, Firestore collections/indexes/rules, Storage rules if used, Cloud Functions, App Check, and production project IDs.
- Review security rules for least privilege, owner checks, role checks, immutable fields, allowed fields, data types, and tenant boundaries. Add emulator/rules tests when possible.
- Verify OAuth redirect domains, email/phone flows, token/session handling, account deletion/data export obligations where applicable, and safe error messages.
- Inspect Cloudinary cloud name, upload presets, signed versus unsigned upload design, upload limits, allowed file types, transformations, access control, deletion behavior, and failure handling. Never expose an API secret in frontend code.
- If Supabase appears in a source repo or Lovable project, inspect its policies, migrations, auth, and tenant boundaries. Do not silently replace Firebase with Supabase or run destructive migrations. Decide and document which backend is canonical before merging.
- Never write, delete, or migrate production records as part of an unapproved audit. Use staging/emulators and backups first.
- Check live services only with authorized access and safe read-only operations. Redact secrets and personal data from reports.

## 7. SEO, reliability, and performance
- Verify page titles, descriptions, canonical URLs, Open Graph/Twitter metadata, sitemap, robots rules, structured data where valid, crawlable listing pages, and not-found behavior.
- Check Core Web Vitals, bundle size, image weight, caching, error boundaries, retry behavior, request timeouts, and server health checks.
- Ensure production routing, refresh/deep links, 404s, redirects, HTTPS, custom-domain setup, and environment-specific configuration are correct.
- Check logs and deployment history. Do not deploy to production until the build, automated tests, security review, and smoke tests pass.

## 8. Required validation
Run the actual commands supported by package.json and record their output:
- Clean dependency install using the committed lockfile.
- TypeScript/type checks and lint.
- Unit/integration tests and database/security-rule tests where available.
- Production build and start/health check.
- Browser smoke tests for major public and authenticated routes.
- Responsive checks at the widths above.
- Accessibility checks for keyboard use, labels, focus, contrast, dialogs, and reduced motion.
- Authentication, role access, CRUD, image upload, search/filter, favorites, inquiry/lead flow, admin moderation, and tenant-isolation checks.
- Verify no secret files or credentials are tracked.
- Verify the live domain and deployment revision match the tested master commit. If browser access or production credentials are unavailable, report BLOCKED rather than guessing.

## 9. Migration and consolidation
- Produce a source-to-master migration matrix with source repo, feature/path, destination, conflicts, validation, and status.
- Prefer small, reviewable commits on a migration branch. Preserve author history when feasible and retain a remote backup/archive until approval.
- Merge only after the source branch and destination are reviewed. Resolve package and lockfile conflicts deliberately. Never combine incompatible lockfiles or blindly overwrite configuration.
- After migration, search for duplicate implementations, stale imports, broken routes, incompatible schema assumptions, and orphaned assets.
- Keep a manifest of migrated features and commit SHAs. Do not call a repo merged merely because its README or package.json was copied.
- Repository deletion is a separate final operation. It is forbidden until the master is backed up, all unique code/data/config has been migrated, builds/tests and live smoke tests pass, the user confirms, and the user has a recovery window.

## 10. Required deliverables
Commit these documents in the master repository:
- `docs/REPOSITORY_MIGRATION_MATRIX.md`
- `docs/PRODUCTION_AUDIT.md`
- `docs/TEST_RESULTS.md`
- `docs/ARCHITECTURE_DECISIONS.md`
- `MASTER_PROMPT_GEMINI_AI_STUDIO.md` (this prompt)
Update the README with accurate setup, architecture, environment variables, test commands, deployment steps, and recovery instructions.

## 11. Final report format
At the end, report:
1. What changed and exact commit SHA(s).
2. Repositories and paths inspected, plus what was migrated.
3. Build/test commands with PASS/FAIL/BLOCKED and real evidence.
4. Firebase, Cloudinary, auth, database and deployment status, each separately.
5. Responsive/accessibility/performance checks and results.
6. Known bugs, risks, and blockers.
7. A remaining-work checklist with no false 100% claims.
8. Exact production URL and deployed commit only if verified.
9. Repository deletion readiness, but do not delete anything without the safeguards above.

Start now by auditing the real codebase and writing the migration matrix. Then make the safest high-impact fixes, test them, and iterate. Do not stop after producing a plan or a beautiful landing page.
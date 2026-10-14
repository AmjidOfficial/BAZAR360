# Initial BAZAR360 Audit Findings

Date: 2026-10-14
Branch: `cto/rebuild-audit-plan`
Canonical baseline: `main`
Baseline files were read through the connected GitHub integration. No local install, test run, production browser test, or deployment verification has been performed as part of this initial inspection.

## Confirmed observations

### 1. Large application surface and bundle risk
- `src/App.tsx` imports many page-level features directly, including admin views, posting, messaging, notifications, social feed, mobile experience, PDF/QR-related features, and multiple dashboard views.
- `vite.config.ts` defines manual chunks for Three.js, Firebase, charts, PDF tools, icons, and motion, but the presence of manual chunks does not prove they are lazy-loaded or that initial bundle performance is good.
- Several page-level imports appear eager in the inspected `src/App.tsx` excerpt, despite a nearby comment claiming React.lazy code splitting. Verify actual build output and route loading before changing this.

### 2. Success notification behavior needs product review
- `src/main.tsx` monkey-patches success toast methods from react-hot-toast and sonner. It suppresses messages based on a broad list of words such as saved, updated, published, registered, uploaded, deleted, sent, verified, and confirmed.
- This may hide useful confirmation from users. Replace global interception with intentional, consistent toast usage after reviewing all call sites and user flows. Do not remove confirmations until each flow has an accessible success state.

### 3. Server-side privileged identity configuration
- `server.ts` contains a hard-coded administrator email allowlist and a separate list of roles allowed during self-registration.
- The allowlist is server-side, not evidence of a leaked secret by itself, but it creates an operational and access-control maintenance risk. Review how admin identity is managed, how roles are assigned, whether custom claims are set securely, and whether any client-controlled profile field can grant privileges. Do not remove working administrator access without a tested replacement.
- The inspected server code verifies Firebase ID tokens for protected requests and includes App Check middleware. Review every route to confirm middleware coverage and authorization checks, not just middleware definitions.

### 4. Firestore rules require full collection-by-collection verification
- `firestore.rules` starts with a deny-all catch-all, which is a useful default-deny pattern.
- Public dealer reads and nested review reads are explicitly allowed. Dealer listing queries allow missing query limits or limits up to 100. Verify intended public exposure, query behavior, review spam controls, field validation, ownership rules, and every other collection before release.
- The partial file excerpt is insufficient to certify the complete ruleset. Use the Firebase emulator/security rules tests with both allowed and denied cases.

### 5. SEO implementation needs runtime validation
- `src/components/SEO.tsx` contains client-side sitemap XML generation and a metadata helper described as Next.js-compatible even though the canonical project uses Vite/React. Verify how metadata is actually emitted, whether crawler requests can receive the expected output, whether URLs are canonical, and whether listing data is escaped safely before generating XML.
- Do not claim that client-side XML generation is a valid production sitemap until checked against the live deployment and crawler behavior.

### 6. Repository and product architecture conflicts
- The canonical repository documents Firebase/Firestore and Cloudinary.
- The automotive Lovable project inspected uses TanStack Start and Supabase and contains routes for inventory, showroom pages, market insights, media feed, concierge, and admin/showroom management.
- The candidate Next.js repository and the TanStack/Supabase candidate should be treated as feature references until schemas, security, runtime behavior, and actual data ownership are reviewed.
- No repository was deleted. No production data, backend, or deployment was changed.

## Required next checks before code changes

1. Inspect the full `src/App.tsx`, route/state handling, auth context, permissions, database service, and every Express route.
2. Fetch and inspect `index.css`, the imported `styles/bazar360-v2.css`, all active theme/context files, and the actual responsive components.
3. Check for committed secrets or real environment files. Do not print secrets into audit output. Rotate exposed credentials if confirmed.
4. Validate Firestore rules with emulator tests and inspect indexes, Firebase functions, Cloudinary upload restrictions, and App Check enforcement.
5. Run install, lint/typecheck, unit/integration tests, and production build in a real development environment. Record exact results.
6. Inspect the latest Gemini AI Studio repository commits and all candidate project files before porting features.
7. Make changes only on feature branches, add tests for every fix, and merge only after a reviewed pull request and successful checks.

## Current status

This is an initial evidence-based audit, not a completed security review. Production readiness remains unverified.

# Repository Migration Matrix

Status as of 2026-10-14. This is an initial evidence-based matrix, not a claim that repositories have been merged.

| Source | Initial stack/evidence | Unique material to inspect | Migration decision/status |
|---|---|---|---|
| `AmjidOfficial/BAZAR360` | React 19, TypeScript, Vite 6, Express, Firebase/Firestore, Firebase Auth/App Check, Cloudinary; main branch | Main app, database service, auth, Firestore rules/indexes, server APIs, themes, listing/dealer/review/lead/booking/messaging features, CI/deploy | **MASTER / retain**. Do not replace blindly. Baseline build/tests still unverified. |
| `AmjidOfficial/Bazar360.online-V3` | React/Vite/Express/Firebase, close but not identical package and App.tsx | UI flows, lazy image component, auth context, seeded data, listing/lead flows, schema and rules/index changes | **Compare before migration**. App.tsx is materially different; package.json and rules/indexes differ. Do not assume duplicate. |
| `AmjidOfficial/automotive-marketplace-platform` | Next.js 16, React 19, Tailwind 4, v0-linked | App routes, reusable components, visual design, SEO, APIs, auth/data integrations, assets | **Selective feature migration only** after full inventory. Separate framework and private repo. |
| `AmjidOfficial/BAZAR360.V2.0` | AI Studio app; Vite/React/Express/Firebase-like package setup | AI Studio changes, latest app screens, Gemini features, media, rules/config changes, unique components | **Compare and cherry-pick/migrate selectively**. Do not overwrite master. |
| `AmjidOfficial/Cars` | TanStack Start/Router, Vite, Supabase client, Radix UI | Unique components, data models, UI patterns, Supabase schema/RLS, assets | **Selective UI/feature reference only** until backend/schema compatibility is decided. |
| Lovable: Bazar360 Automotive Hub | TanStack Start/Router, React Query, Supabase migrations/client; published | Inventory, showrooms, media feed, concierge, market insights, admin portals, tenant RLS, auth and leads | **Reference project**, not an automatic source of truth. Lovable write permission is unavailable in current connection, so agent-driven audit/edit was blocked. |
| Lovable: Bazar360 Express | Project metadata says Firestore lead tracking, WhatsApp lead flow, admin approvals; published | Current source tree and recent changes | Needs file-level inspection. |
| Lovable: BAZAR360 Marketplace | Unpublished project metadata | Auth, listing/search/detail flows, Firestore integration | Needs file-level inspection. |
| Lovable: BAZAR360: Pakistan's Auto Hub | Unpublished project metadata | SaaS/showroom/admin functions and SEO | Needs file-level inspection. |
| Lovable: BAZAR360: Your Auto Gateway | Unpublished project metadata | Next.js/React/TypeScript design and data integration | Needs file-level inspection. |

## Confirmed source-level differences
- Master and V3 share the same README text but have different dependency declarations.
- Master `src/App.tsx` imports a broad set of marketplace features and service methods; V3 `src/App.tsx` has a different tab-based UI and imports an AuthContext and LazyImage.
- Master and V3 `src/firebase.ts` differ in App Check initialization behavior.
- Master and V3 `src/lib/dbService.ts` import different models/utilities and have different feature scope.
- Master and V3 Firestore indexes differ at least in a listings index involving `dealerId`, `status`, and `createdAt`.
- The Lovable Automotive Hub uses Supabase, whereas the master README and source files use Firebase. This is a major architecture/data ownership decision, not a routine code merge.

## Safe migration order
1. Snapshot all repo heads and preserve remote branches/tags.
2. Generate a full file inventory and compare commit histories/tree contents.
3. Review unique features, assets, schema and security rules.
4. Choose the canonical production database and document the decision.
5. Create a migration branch in BAZAR360 and migrate feature-by-feature.
6. Run checks after each batch and review diffs.
7. Verify production deployment matches the tested commit.
8. Ask for final confirmation before deleting any source repository.

## Current status
- Metadata/package/README and selected key files inspected.
- Master prompt committed to master.
- Initial production audit committed to master.
- Full tree/history comparison: pending.
- Feature-by-feature migration: pending.
- Automated build/tests/live deployment validation: pending.
- Repository deletion: not performed.

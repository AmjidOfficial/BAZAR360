# BAZAR360 Production Audit — Initial Evidence Log

Audit date: 2026-10-14
Canonical repository: https://github.com/AmjidOfficial/BAZAR360
Canonical branch reported by GitHub: main
Domain requested: https://bazar360.online

## Confirmed repository metadata
| Repository | Default branch | Visibility | Reported size | Admin access |
|---|---|---|---:|---|
| AmjidOfficial/BAZAR360 | main | Public | 121006 KB | Yes |
| AmjidOfficial/Bazar360.online-V3 | main | Public | 33752 KB | Yes |
| AmjidOfficial/automotive-marketplace-platform | main | Private | 8064 KB | Yes |
| AmjidOfficial/BAZAR360.V2.0 | main | Private | 20895 KB | Yes |
| AmjidOfficial/Cars | main | Public | 464 KB | Yes |

The user repeated the master repository URL in the source list. It is treated as the canonical repo, not a sixth repository.

## Initial package and README inspection
- BAZAR360 README describes React 19, TypeScript 5.8, Vite 6, Express, Firebase/Firestore, Firebase Authentication/App Check, and Cloudinary. Its package scripts include dev, build, start, and lint/type-check.
- Bazar360.online-V3 has substantially the same README content but a different package.json dependency set. It must be compared file-by-file, not assumed identical.
- automotive-marketplace-platform is a separate Next.js 16 project linked to v0, with a distinct package configuration.
- BAZAR360.V2.0 README identifies it as a Google AI Studio app. Its package setup resembles the Vite/Express/Firebase master but uses a different firebase-admin version.
- Cars is a small TanStack Start/Vite project with Supabase dependencies. README.md was not found at the repository root.
- These stacks are not safe to merge by copying all files over one another. Unique routes, business logic, assets, schemas, migrations, security rules, and configuration need an explicit migration matrix.

## Lovable workspace inspection
Workspace: Muhammad's Lovable (owner access). Seven projects reported in workspace metadata. A search for Bazar360 returned five relevant projects:
1. Bazar360 Automotive Hub (published, last edited 2026-10-04); description references multi-tenant automotive marketplace, searchable inventory, media feed, concierge, admin/showroom portals, and Supabase.
2. Bazar360 Express (published); description references showroom setup, listings, favorites, WhatsApp leads, Firestore lead tracking, and admin approvals.
3. BAZAR360 Marketplace (not published).
4. BAZAR360: Pakistan's Auto Hub (not published).
5. BAZAR360: Your Auto Gateway (not published).

The primary Lovable project is Bazar360 Automotive Hub, ID ae91a5f8-d23c-40d7-a898-c2478e820260. Latest commit reported by Lovable: b545c8d83de5a6a298fe999a344d6faaf732868d. Its listed source includes TanStack Router/Start, Supabase integration and migrations, inventory, showrooms, admin pages, market insights, media feed, concierge, and auth routes. This is a distinct backend architecture from the master README's Firebase/Cloudinary description and must not be merged without a backend decision.

## Not yet verified
- Full repository tree and source-code comparison for every repository.
- Successful source-code merge and commit history preservation.
- Local dependency installation, type-check, lint, unit tests, production build, browser tests, and responsive checks.
- Live Firebase project, Firestore rules/indexes, authentication providers, App Check, Cloudinary upload configuration, or production data access.
- Live domain response and deployed commit correspondence.
- Complete Lovable project review beyond metadata and the primary project's file listing.
- Any repository deletion. No repository has been deleted.

## Next actions
1. Capture a complete file and feature inventory for all repositories.
2. Compare master and V3 commit/tree contents; compare all distinct source implementations.
3. Review Firebase and Supabase schema/security assumptions before selecting the canonical data layer.
4. Build the migration matrix and create a protected migration branch.
5. Run build/tests and verify deployment before proposing repository deletion.

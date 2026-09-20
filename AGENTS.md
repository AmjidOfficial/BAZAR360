# BAZAR360 - AI Agent Guidelines

**Bazar360** is a modern automotive marketplace built on React + TypeScript + Firebase, deployed at https://bazar360.online. This guide helps AI agents understand the codebase architecture, conventions, and development workflow.

## Quick Start

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (tsx server.ts)
npm run build                  # Build for production (vite build + esbuild server.ts)
npm run lint                   # Type check (tsc --noEmit)
npm run deploy                 # Build and publish to GitHub Pages
```

**Prerequisites**: Node.js, `.env.local` with `GEMINI_API_KEY` and `VITE_RECAPTCHA_SITE_KEY`

## Project Structure

```
src/
├── components/               # React views & UI components
├── lib/                      # Database, currency, tracking, PDF utilities
├── services/                 # api.ts (Express backend client), WatermarkService.ts
├── hooks/                    # useAutoSave.ts
├── firebase.ts               # Firebase initialization & auth setup
├── types.ts                  # Shared TypeScript interfaces
├── translations.ts           # i18n for English/Urdu
└── App.tsx                   # Main app entry point (tab-based routing)
server.ts                     # Express backend: AI, Cloudinary, SEO, REST API
firestore.rules               # Active security rules (enforce security_spec.md)
```

## Core Architecture

### Routing

Routing is **tab-based**, not URL-based. `App.tsx` holds a `currentTab` string state and conditionally renders views (`currentTab === 'services' && <AutoServicesView ... />`). There is no react-router route table.

### Database (Firestore)

- **Service Layer**: [src/lib/dbService.ts](src/lib/dbService.ts) — the single source of truth for CRUD patterns. Read it before adding data access.
- **Collections in active use**: `dealers`, `listings` (+ `comments`, `likes` subcollections), `users`, `profiles`, `reviews`, `posts` (+ `comments`), `leads`, `bargains`, `conversations` (+ `messages`), `notifications`, `service_bookings`, `auditLogs`, `suggestions`, `searchHistory`, `systemLogs`.
- **Offline behaviour**: writes that fail against Firestore fall back to `localStorage` caches and read back through the same functions. There is **no bundled seed data** — collections start empty, so a feature reading an empty collection renders an empty state, not demo content.

Collections referenced in code but not covered by `firestore.rules` (e.g. `advertisements`, `favorites`, `payments`, `subscriptions`, `supportTickets`, `showroomStaff`, `vehicles`, `analytics`) are denied by the catch-all `match /{document=**} { allow read, write: if false; }` and fall back to local storage. Add a rule block before relying on one.

### Component Architecture

- **Live views**: `HomeFeed` (homepage), `SearchExplorerView`, `ShowroomMiniSite` (+ lazy-loaded `InventoryGrid`), `DetailedVehiclePostingPage`, `AutoServicesView`, `AdminDashboard`, `UserDashboard`
- **Cards**: `VehicleCard`, `VehicleSkeletonCard`
- **Navigation**: `NavigationAudit`, `MobileSideDrawer`, `BottomNavBar`
- **Notifications**: `UnifiedNotificationCenter`

**Prop Convention**:
```typescript
interface ViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  onSelectDealer: (id: string) => void;  // Event handlers: on{Action}
  setTab: (tab: string) => void;         // State setters
  currentUser?: UserProfile | null;
  lang: 'en' | 'ur';
}
```

`App.tsx` is the only place that wires `currentUser`, `lang`, and data into views. Pass `currentUser` down whenever a view needs to gate privileged UI — do not read auth state independently inside a view.

### Backend (`server.ts`)

Express server that also serves the built SPA. Two middlewares guard `/api`:

| Middleware | Purpose |
|------------|---------|
| `appCheckVerification` | Verifies the `X-Firebase-AppCheck` header. **Applied globally to `/api`.** |
| `requireAuth` | Verifies the `Authorization: Bearer <ID token>` header. Applied **per-endpoint**. |

App Check is client-attestation, **not** user identity. Any endpoint that writes data with the Admin SDK, reads non-public data, or assigns a role must also use `requireAuth` and derive the user from `req.user` — never from the request body.

**`/api/*` is not reachable in production.** The deploy workflow publishes static Hosting files only (see [Deployment](#deployment)), so neither middleware, nor any endpoint, nor the `role` claim minted by `POST /api/user/register` exists on the live site. Everything in `server.ts` is inert there until the Express process is hosted somewhere — treat it as the intended design for that move, not as a live control, and never rely on a server-side check to be currently enforcing anything.

`server.ts` imports `src/lib/*` modules via **dynamic `await import()`** (e.g. `./src/lib/leads`, `./src/lib/seoGenerator`). These are invisible to `from`-based import greps — do not treat unreferenced-looking `src/lib` files as dead until you have grepped for both `from` and `import(`.

`/api/cloudinary/upload` signs its request with `CLOUDINARY_API_SECRET` when that variable is set, and stays unsigned when it is not. The unsigned path is what the live client depends on today, so do not flip the Cloudinary preset to "signed" in the console until the server is hosted and the secret is configured.

### Authorization & Roles

- **Client-side**: [src/lib/permissions.ts](src/lib/permissions.ts) (`isAdminUser`, `canManageShowroom`, `isAuthorized`) gates UI only. It trusts `user.role` plus an email allowlist.
- **Server-side**: `registerUser` in Firebase Functions is the production path that mints a custom claim. It derives the uid from the callable auth context and refuses privileged roles unless the verified email is in the admin allowlist. The local Express `POST /api/user/register` remains a development fallback.
- **Rules-side**: `isAdmin()` in `firestore.rules` checks a `role` custom claim or an `admins/{uid}` document. The client never writes `admins/*`, so admin access depends entirely on the claim set at registration. Client-side role strings do **not** grant data access.
- Administrators are listed in exactly two places that must stay in sync: `ADMIN_EMAILS` in [src/lib/permissions.ts](src/lib/permissions.ts) and `ADMIN_EMAILS` in [server.ts](server.ts).

### Type System

Core domain models in [types.ts](src/types.ts):
- `CarListing`: vehicle with specs (make, model, year, price, condition, engineCC, bodyCondition, documentType, tokenTaxPaid, images), Cloudinary media fields, and `ownerDetails`
- `Dealer`: showroom profile with rating, location, socials, `teamMembers`, `themeSettings`
- `UserProfile`: account with `role` (`Admin`, `Showroom Owner`, `Individual User`, `Visitor`, `Sales Rep`, `Private Seller`, `Buyer`, `Dealer`, `Sales Representative`, `Super Admin`)
- `Lead` / `ServiceBooking`: CRM records with status lifecycles
- `Conversation` / `DirectMessage`: participant-scoped private messaging

### Styling & Theming

- **Framework**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Theme System**: CSS custom properties + class variants (`theme-cosmic-dark`, `theme-luxury-light`, `theme-emerald`, `theme-gold`)
- **Component**: [src/components/ThemeContext.tsx](src/components/ThemeContext.tsx) manages theme state
- Reference theme variables: `text-[var(--color-text-main)]`, `bg-[var(--color-bg-primary)]`
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

### Multi-Locale & Multi-Currency

- **Localization**: [src/translations.ts](src/translations.ts) (English + Urdu)
- **Currency**: [src/lib/currency.ts](src/lib/currency.ts) (PKR/USD/DUAL modes, 278 PKR = 1 USD)
- **Visitor Tracking**: [src/lib/visitorTracking.ts](src/lib/visitorTracking.ts) logs search queries and vehicle views

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `HomeFeed.tsx`, `VehicleCard.tsx` |
| Functions | camelCase | `dbFetchDealers()`, `dbSubmitServiceBooking()` |
| Constants | UPPER_SNAKE_CASE | `ADMIN_EMAILS`, `CLOUDINARY_CLOUD_NAME` |
| Event Props | `on{Action}` | `onSelectDealer`, `onToggleCompare` |
| Document IDs | kebab-case | `auto-choice-peshawar`, `car-fortuner-legender` |
| Type Aliases | PascalCase | `CarListing`, `UserProfile` |

## Development Workflow

### Adding a New Feature
1. **Create Component** in `src/components/` with a typed props interface
2. **Add DB Functions** in `src/lib/dbService.ts` (follow the try/catch + local-cache fallback pattern)
3. **Define Types** in `src/types.ts`
4. **Add Firestore rules** in `firestore.rules` for any new collection — otherwise the catch-all denies it
5. **Add Translations** to `src/translations.ts` for both languages
6. **Wire into `App.tsx`** with tab state and prop passing

### Database Operations
```typescript
// In dbService.ts:
export async function dbFetchListings(): Promise<CarListing[]> {
  try {
    const snapshot = await getDocs(collection(db, 'listings'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarListing));
  } catch (error) {
    console.error('[Firestore] Error fetching listings:', error);
    return [];
  }
}

// In component:
const [listings, setListings] = useState<CarListing[]>([]);
useEffect(() => {
  dbFetchListings().then(setListings);
}, []);
```

### TypeScript
- Target: ES2022, JSX: react-jsx, Path alias: `@/*` → workspace root
- `app/` is excluded from `tsconfig.json` and is **not** part of the Vite build. It is a stale Next.js App Router scaffold and still imports components that no longer exist — ignore it; do not treat it as the app.

## Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| Firestore unavailable in preview | Reads return empty arrays and writes fall back to localStorage; verify empty-state rendering rather than expecting seed data |
| New collection returns permission-denied | The catch-all rule denies anything without an explicit `match` block; add rules for the collection |
| Build fails with server.ts errors | esbuild bundles `server.ts` separately with `--packages=external`; keep Node deps external |
| Components re-render excessively | Memoize `dealers`/`listings` props with `useMemo()` at the `App.tsx` level |
| Privileged write rejected by rules | Check the caller actually holds a `role` custom claim; client-side `role` strings grant nothing |
| Admin panel shows no data | `isAdmin()` depends on the custom claim — the account must have registered through `/api/user/register` with an allowlisted, verified email |
| Grep says a component is unused but it still ships | Lazy loading uses `import('./X')` with no `from` clause; grep for the bare component name too |

## Key Files to Know

| File | Purpose |
|------|---------|
| [src/lib/dbService.ts](src/lib/dbService.ts) | All Firestore CRUD; source of truth for DB patterns |
| [src/types.ts](src/types.ts) | Core domain models |
| [src/firebase.ts](src/firebase.ts) | Firebase init, auth providers, App Check setup |
| [src/App.tsx](src/App.tsx) | Main component: tab routing, theme/language state, data loading |
| [src/lib/permissions.ts](src/lib/permissions.ts) | Client-side RBAC helpers and admin email allowlist |
| [src/components/ThemeContext.tsx](src/components/ThemeContext.tsx) | Theme system (CSS variables, class switching) |
| [src/translations.ts](src/translations.ts) | i18n strings (en/ur) |
| [server.ts](server.ts) | Express backend: API endpoints, Admin SDK writes, SEO, Cloudinary proxy |
| [security_spec.md](security_spec.md) | Firestore rules rationale, RBAC, and exploit payloads to prevent |
| [firestore.rules](firestore.rules) | Active security rules |
| [vite.config.ts](vite.config.ts) | Vite build config (React plugin, Tailwind, manual vendor chunking) |

## Environment Variables

Required in `.env.local`:
```
VITE_RECAPTCHA_SITE_KEY=<reCAPTCHA v3 site key>
GEMINI_API_KEY=<Google Gemini API key>
VITE_CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
VITE_CLOUDINARY_UPLOAD_PRESET=<Cloudinary upload preset>
```

`server.ts` additionally reads `CLOUDINARY_API_SECRET`. When set it signs uploads; when unset the proxy stays unsigned.

## Deployment

- **Host**: Firebase Hosting project `bazar360-2026`, serving the static `dist/` bundle at https://bazar360.online (CNAME in repo root is for the gh-pages fallback)
- **Build**: `npm run build` → `vite build` + `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`
- **CI**: `.github/workflows/firebase-deploy.yml` runs on every push to `main`. It type-checks the app, installs/builds `functions/`, deploys Firestore rules and indexes, deploys Firebase Functions, then publishes Hosting with `channelId: live`.
- **Production callable backend**: `functions/src/index.ts` provides `marketingEngine`, `dealerChat`, `aiTranslate`, and `registerUser`. The workflow passes the Gemini key through `functions/.env` at deploy time and removes the file after deployment.
- **`npm run deploy`** → `gh-pages -d dist` publishes the same static files to the `gh-pages` branch. Equally static-only.
- **Firestore rules are deployed automatically by CI**:
  ```bash
  npx firebase deploy --only firestore:rules,firestore:indexes,functions --project bazar360-2026
  ```
  `firebase.json` maps the rules to the app's **named** database (`ai-studio-bazar360online-90162156-c190-465e-a44d-d2853657a61e` — the one `src/firebase.ts` passes to `getFirestore`), not `(default)`. A ruleset deployed to `(default)` would leave the app's real database untouched. `firebase.json` declares no `functions` block, so `functions/src/index.ts` is dead code — route server-side work through `server.ts`.

## Testing & Validation

- **Type Check**: `npm run lint` (`tsc --noEmit`)
- **Build**: `npm run build` — catches bundling and lazy-import breakage that `tsc` alone misses
- **Security**: Verify changes against the payloads in [security_spec.md](security_spec.md); remember rules changes only take effect once deployed via the Firebase CLI
- **Auth Flow**: Test OAuth providers (Google, Facebook, LinkedIn) in dev mode
- **Offline**: Test with DevTools → Network → offline; features should degrade to local caches, not crash

---

**Last Updated**: 2026-09-20
**Framework Versions**: React 19, Vite 6, Firebase 12.14, TypeScript 5.8
**Maintained By**: Bazar360 Development Team

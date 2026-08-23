# BAZAR360.ONLINE — MASTER GEMINI AI STUDIO PROMPT

## Mission

Rebuild the complete Bazar360.online frontend into one stable, premium automotive marketplace experience based on the latest approved Bazar360 direction and the three supplied visual references in the current project Source/Library.

Do not create another theme collection. Do not keep the old theme engine as a hidden fallback. Replace the current visual system with one coherent design system.

The application is a real marketplace. UI work must never destroy, replace, mock, randomize, or silently hide real user/admin data.

## Source of truth

1. Current GitHub repository: `AmjidOfficial/BAZAR360`, branch `main`.
2. Current production domain: `https://bazar360.online`.
3. Existing application logic, Firebase data model, authentication, RBAC, posting, showroom, inventory, media, messaging, likes/comments, and admin workflows are functional assets and must be preserved unless a change is required for the redesign.
4. Use the three supplied visual references as the visual direction:
   - Premium black/white automotive mobile UI with soft elevation and luxury vehicle imagery.
   - Zenith-style premium automotive landing page with large cinematic vehicle hero, editorial typography, strong whitespace, performance statistics, and restrained lime/black accent use.
   - Premium vehicle marketplace mobile UI with black/white surfaces, rounded cards, brand chips, vehicle grids, and a clean bottom navigation.
5. Existing Bazar360 Source/Library reference assets may be reused when they are real project assets. Never invent fake vehicle data to fill empty UI.

## PHASE 0 — SAFETY SNAPSHOT

Before editing:

- Inspect the entire repository and identify the current frontend entry points, layout system, CSS, Tailwind configuration, theme files, shared components, route structure, Firebase services, Firestore collections, media handling, and admin flows.
- Record the current commit SHA.
- Do not delete business logic merely because it is visually old.
- Create a safe Git branch or equivalent rollback point before the redesign.
- Run the existing type check/build before major changes and record failures.

## PHASE 1 — REMOVE THE OLD VISUAL THEME SYSTEM

Remove or fully deactivate all competing visual themes and legacy visual overrides.

Specifically audit and eliminate conflicts from:

- ThemeEngine
- ThemeSwitcher
- old ThemeContext theme presets
- cosmic/dark/emerald/gold theme classes
- old gateway presets
- old theme localStorage state
- Firestore-driven visual theme overrides
- duplicate theme CSS
- old neumorphic/reference CSS that is only an additive patch
- old glassmorphism styles where they conflict with the new system
- scattered hard-coded background/accent classes that fight the new design tokens

Important:

- Do not remove ThemeContext blindly if application components depend on it. Refactor dependents safely first.
- There must be one final visual theme at runtime.
- No theme switcher should remain in the user interface.
- No hidden theme selector should change the production UI.
- Clear or migrate obsolete localStorage theme keys so an old browser cannot restore an old design.
- Remove obsolete theme documents/configuration only when confirmed unused by application logic.

## PHASE 2 — NEW BAZAR360 DESIGN SYSTEM

Build a single premium soft-neumorphic automotive system.

### Visual character

- Luxury
- Clean
- Modern
- Soft neumorphism
- Automotive editorial feel
- High whitespace
- Strong vehicle photography
- Calm surfaces
- Subtle depth
- No excessive gradients
- No heavy glass effects
- No visual clutter
- No cartoonish UI

### Base palette

Use a restrained neutral system:

- Canvas: soft cool off-white / light grey
- Surface: slightly brighter than canvas
- Raised surface: white/light grey
- Recessed surface: slightly darker grey
- Primary ink: near-black graphite
- Secondary ink: muted graphite
- Accent: very restrained premium accent, preferably graphite/black with a small Bazar360 brand accent
- Success: reserved for actual verified/success states only
- Warning/error: reserved for actual states only

Do not use the previous teal/orange/emerald/cyber palette as the primary visual language.

### Neumorphic rules

Use:

- Large soft outer shadows
- Soft highlight shadows
- Recessed fields for search/filter inputs
- Raised cards for vehicles/showrooms
- Moderate corner radius
- Thin or nearly invisible borders
- Clear focus rings

Avoid:

- deep black shadows
- hard drop shadows
- excessive blur
- every element looking like a floating pill
- low-contrast text
- inaccessible grey-on-grey controls

### Typography

Use a premium modern sans-serif family with:

- strong display face for hero headings
- clean readable body face
- consistent numeric treatment for price/specs

Typography must remain highly readable on desktop and mobile.

## PHASE 3 — GLOBAL LAYOUT

Rebuild the frontend around a responsive marketplace shell.

### Header

Desktop:

- Bazar360.online logo
- clean navigation
- prominent global search
- location selector
- Favorites
- Compare
- Messages
- Notifications
- account/profile
- primary Post Ad action

Mobile:

- compact brand header
- search entry
- notifications/profile
- no crowded desktop navigation
- use a premium bottom navigation

### Side drawer

Rebuild the existing side drawer using the same new neumorphic system.

It must be:

- fast
- touch friendly
- role aware
- keyboard accessible
- consistent across authenticated and visitor states
- free of duplicate navigation items

Do not show `Browse By Category` as a redundant global section.

## PHASE 4 — HOMEPAGE REBUILD

The homepage should follow the visual hierarchy of the supplied automotive references while using real Bazar360 data.

Recommended structure:

1. Premium hero
2. Real search/filter module
3. Popular searches based on actual search behavior/data when available
4. New Posts / New Arrivals using real Firestore records
5. Featured Vehicles
6. Verified Showrooms
7. Vehicle categories only where they add value and do not duplicate navigation
8. Official manufacturers / brands
9. Automotive services
10. Trust/verification strip
11. Premium footer

### Hero

Use a large editorial automotive composition.

- strong headline
- short supporting copy
- real vehicle image
- intelligent image cropping
- search module
- premium CTA
- responsive composition

Vehicle images must be automatically fitted into their assigned frames without stretching or distortion.

## PHASE 5 — VEHICLE CARD SYSTEM

Create one reusable VehicleCard component.

It must support:

- real uploaded image
- make
- model
- variant
- year
- mileage
- transmission
- fuel
- city
- price
- seller/showroom
- verification state
- featured/new state
- favorite
- compare
- share

Rules:

- Never replace real values with sample values.
- Never use unrelated images for a listing.
- Never crop away important vehicle content when a safe object-fit strategy can preserve it.
- Support broken/missing media gracefully.
- Use lazy loading and responsive image sizes.

## PHASE 6 — IMAGE AND MEDIA INTELLIGENCE

Build a shared media presentation layer.

For every uploaded image:

- preserve the source asset
- detect aspect ratio
- choose contain/cover behavior based on component type
- keep the vehicle centered intelligently
- avoid stretching
- avoid accidental face/profile cropping
- avoid duplicate media
- show the correct image for the correct record

Do not run destructive image processing over the original source.

## PHASE 7 — SHOWROOM EXPERIENCE

Showrooms must feel like premium mini websites inside Bazar360.

Rebuild:

- showroom header
- showroom identity
- cover/media area
- owner profile
- verified badge
- inventory
- posts/community
- contact information
- social links
- business hours
- map/location
- digital business card
- share controls
- showroom analytics/admin controls

Use the same design system, but allow showroom content to remain unique.

## PHASE 8 — ADMIN EXPERIENCE

Preserve and improve Admin functionality.

Admin must be able to:

- manage users
- manage showrooms
- manage inventory
- manage posts
- verify listings
- manage media
- review reports
- see activity
- recover records
- distinguish real records from test/fake records

Do not hide admin tools behind visual redesign changes.

## PHASE 9 — RECOVER GHANI KHAN ADMIN POSTS

This is mandatory.

Known admin identity in the existing application includes:

- Display name: `Ghani Khan`
- Admin email: `khattakghani94@gmail.com`

The production application reads community posts from Firestore collection `posts`.

Existing repository code already has admin authorization for this email. Preserve that authorization.

Use the repository recovery script:

`scripts/recover-ghani-posts.mjs`

The script checks both known Firestore databases, identifies posts belonging to Ghani Khan, and restores them into the production `posts` collection.

Recovery requirements:

1. Run a dry-run first.
2. Produce a list of every candidate post with ID, source database, source collection, createdAt, media and content preview.
3. Verify candidate ownership.
4. Do not delete source records.
5. Do not overwrite an unrelated post on ID collision.
6. Preserve original content and media.
7. Restore approval state for confirmed admin posts.
8. Preserve original timestamps where present.
9. Mark restored records with recovery metadata.
10. Run the recovery only after dry-run verification.
11. After recovery, verify that the posts appear in the live community feed and admin dashboard.

Use:

`RECOVERY_DRY_RUN=true npm run recover:ghani-posts`

for inspection, then:

`RECOVERY_DRY_RUN=false npm run recover:ghani-posts`

for the actual restore when the Firebase service account is correctly configured.

Never expose the Firebase service account in frontend code, Git history, logs, or UI.

## PHASE 10 — DATA INTEGRITY

The redesign must not change the source of truth.

For every page:

- Firestore data remains authoritative.
- User-uploaded media remains authoritative.
- Admin-created data remains authoritative.
- Showroom inventory remains authoritative.
- Post ownership remains authoritative.
- Real timestamps remain authoritative.

Remove hard-coded demo cards from production paths.

If a collection is empty, show a proper empty state instead of fake content.

## PHASE 11 — PERFORMANCE

Target:

- fast first render
- lazy image loading
- minimal layout shift
- code splitting where useful
- no blocking theme hydration
- no unnecessary Firestore listeners
- memoized expensive marketplace components
- responsive images
- lightweight icons

Avoid adding a large UI framework if existing dependencies can do the job.

## PHASE 12 — ACCESSIBILITY

Meet a strong practical accessibility standard:

- semantic HTML
- keyboard navigation
- visible focus
- accessible labels
- correct button/link semantics
- sufficient contrast
- reduced motion support
- touch targets at least 44px where practical
- no color-only meaning

## PHASE 13 — RESPONSIVE BEHAVIOR

Test at minimum:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

The layout must not depend on a single screenshot width.

## PHASE 14 — QUALITY CONTROL

Before completion run:

1. TypeScript check
2. Production build
3. Route audit
4. Responsive audit
5. Accessibility audit
6. Firestore data integrity audit
7. Image/media mapping audit
8. Admin RBAC audit
9. Post recovery verification
10. Theme conflict scan

Search the final codebase for obsolete theme identifiers and remove all production references that can reintroduce the old themes.

## PHASE 15 — ACCEPTANCE CRITERIA

The redesign is accepted only when all are true:

- One stable Bazar360 visual theme exists.
- Old theme presets cannot reappear from localStorage.
- No theme selector is visible.
- The supplied three references clearly influence the visual hierarchy.
- The result looks premium and automotive, not like a generic dashboard.
- Homepage uses real Bazar360 data.
- Vehicle images match their records.
- Showroom images match their records.
- User/admin profile images match their records.
- No fake marketplace records appear in production.
- `Browse By Category` is not redundantly shown as a homepage/global block.
- Side drawer is rebuilt and responsive.
- Vehicle cards are reusable and consistent.
- Showroom mini-site experience remains functional.
- Admin dashboard remains functional.
- Community posts remain functional.
- Ghani Khan's confirmed admin posts are recovered and visible.
- Build passes.
- TypeScript check passes.
- No new console errors appear during normal navigation.
- Production domain remains the deployment target.

## Final instruction

Do not stop at a visual mockup.

Implement the redesign in the real Bazar360 codebase. Keep the backend and real data safe. Refactor existing components where practical. Replace weak components when necessary. Do not create a parallel demo application.

At the end, report:

- files changed
- old theme files/components removed or retired
- new design-system files created
- pages/components rebuilt
- data integrity checks completed
- Ghani Khan post recovery count
- build/test results
- deployment status
- remaining risks, if any

The final result must be production quality and feel like one complete premium automotive marketplace, not a collection of unrelated themes.

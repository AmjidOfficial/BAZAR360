# BAZAR360 UI/UX REBUILD V2

## Goal
Build BAZAR360 as a fast, simple social marketplace experience with a premium automotive identity. The interface must feel as easy as a mainstream social app while adding tasteful motion, depth and automotive visual polish.

## Core rules
- Mobile first. Optimize 360px to 430px phones before desktop.
- One clear primary action per surface.
- Minimum 44px touch targets.
- Keep important actions reachable with one thumb.
- Use progressive disclosure instead of dense control panels.
- Prefer CSS transforms and opacity for motion.
- Respect prefers-reduced-motion.
- Never animate every element at once.
- Never distort uploaded media. Use object-fit and fixed aspect-ratio media frames.
- Preserve real Firebase/Cloudinary data. Never replace real user content with demo content.

## Identity modes
1. Visitor: browse, search, view vehicles and showrooms, share, save locally where allowed, login CTA.
2. Registered User: personalized feed, profile, saved vehicles, messages, alerts, posts, buying activity.
3. Showroom Owner: showroom storefront, inventory, leads, messages, analytics, profile, business settings.
4. Admin: moderation, users, showrooms, listings, reports, platform metrics, audit controls.

## Visual language
- Primary: deep blue / electric blue for actions and navigation.
- Accent: restrained Bazar360 red/orange for highlights and status only.
- Surfaces: clean white/slate light mode and deep navy/slate dark mode.
- Cards: 14-20px radius, subtle border, soft elevation.
- 3D: shallow perspective, 1-4px lift, tiny scale changes. No heavy fake 3D.
- Glass: use only for sticky navigation and floating controls.
- Typography: one display family plus one readable UI family. Use a small weight scale.
- Data values may use a mono face only where useful.

## Responsive layout
- Phone: single-column feed, horizontal chip rails, bottom navigation, compact cards.
- Tablet: two-column content where appropriate, side utilities become drawers.
- Desktop: centered max-width shell, 2-4 column grids, persistent side navigation only where it improves speed.
- Avoid horizontal page overflow at every breakpoint.

## Main navigation
Home / Search / Sell / Showrooms / Profile on mobile.
Desktop can expose additional utilities without duplicating the mobile navigation.

## Feed pattern
Composer -> quick filters -> real listings/posts -> showroom recommendations -> services -> footer.
Do not put decorative sections ahead of useful content.

## Vehicle card
- 16:10 media frame.
- Favorite and share controls.
- Verified / Available / Reserved / Sold status.
- Make, model, year, price.
- Small spec row.
- Seller/showroom identity.
- Tap card for detail. Keep secondary actions secondary.

## Profile pattern
Avatar + identity + verification -> key stats -> primary action -> tabs -> content.
Personal profiles and showroom profiles share the same design grammar but have different actions.

## Dashboard pattern
A dashboard is a task center, not a wall of metrics. Show the most important action first, then recent activity, then deeper analytics.

## Showroom pattern
Cover + logo + verified identity + location/contact -> inventory -> services -> reviews -> leads/contact.
Showroom owners get management controls; visitors see discovery and contact controls.

## Motion
- Page enter: 180-280ms fade/translate.
- Card hover: 160-220ms.
- Modal/drawer: 220-320ms.
- Press: scale 0.98.
- Stagger only short lists and cap the delay.
- Use IntersectionObserver or Motion viewport triggers for long feeds.

## Performance
- Lazy-load below-fold media and heavy modules.
- Keep Three.js/3D scenes out of normal listing cards. Use them only for intentional hero experiences and lazy-load them.
- Optimize Cloudinary transforms by rendered dimensions.
- Avoid unnecessary re-renders from scroll handlers.
- Use CSS containment where safe.
- Keep initial mobile JavaScript small.

## Accessibility
- Semantic headings with one clear h1 per page.
- Visible keyboard focus.
- Accessible names for icon buttons.
- Good contrast in both themes.
- Reduced motion support.
- Error and loading states must be understandable without animation.

## Quality gate
Before merge: typecheck, production build, route smoke test, mobile 360/390/430 checks, tablet check, desktop check, keyboard check, reduced-motion check, image/error-state check, auth role check and real-data check.

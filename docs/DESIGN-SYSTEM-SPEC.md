# Bazar360 Premium Design System

## Product principle
Bazar360 should feel as simple as a social marketplace while presenting vehicles and showrooms with premium automotive quality. Visual polish must never reduce speed or clarity.

## One system
Use one Bazar360 product design system. Do not expose competing application-wide themes. Showroom branding may appear inside showroom content without replacing Bazar360 navigation, controls or core layout.

## Visual hierarchy
1. Primary user action
2. Search/discovery
3. Vehicle/showroom identity
4. Key facts
5. Secondary actions
6. Supporting information

## Typography
- Use one primary UI font family with a clear fallback stack.
- Use a limited type scale.
- Avoid tiny metadata that harms mobile readability.
- Use font weight to establish hierarchy before adding decorative effects.

## Color
- Define semantic tokens: background, surface, elevated surface, text, muted text, border, primary, success, warning, danger, focus.
- Avoid arbitrary per-component colors.
- Maintain accessible contrast.
- Brand accents must not override semantic states.

## Components
Core reusable components:
- App shell
- Header
- Mobile bottom navigation where appropriate
- Side drawer
- Search bar
- Filter controls
- Vehicle card
- Vehicle gallery
- Price block
- Seller/showroom identity block
- Verified badge
- Primary/secondary buttons
- Inputs/selects
- Dialog/drawer
- Toast/notification
- Skeleton
- Empty state
- Error state

## Vehicle cards
Cards must show only authoritative available data. Missing facts are not replaced by invented values. Media uses responsive derivatives and preserves the subject focal point.

## Motion
Use short, purposeful transitions for navigation, state changes and media. Respect reduced-motion preferences. No animation should delay search, listing creation, contact or checkout-like actions.

## Mobile
- Thumb-friendly controls.
- Avoid horizontal overflow.
- Keep important actions visible.
- Use compact cards and progressive content.
- Avoid large decorative hero sections that push useful inventory below the fold.

## Accessibility
- Keyboard reachable controls.
- Visible focus state.
- Semantic buttons/links.
- Labels for form controls.
- Meaningful image alt text where appropriate.
- Do not rely on color alone.
- Respect reduced motion.

## Performance
Components must not import heavy route-specific dependencies globally. Media is lazy and responsive. Secondary modules are deferred.

## Release gate
A visual change is a NO-GO if it introduces inconsistent tokens, fake data, accessibility regressions, unnecessary global dependencies, or measurable degradation to core mobile interactions.

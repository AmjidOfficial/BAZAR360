# Bazar360 Performance Budget

## Product goal
Bazar360 must feel lightweight and responsive on normal mobile devices and networks. Premium visuals must never block core marketplace actions.

## Initial route rules
- Render the minimum shell and critical content first.
- Do not fetch unrelated collections during initial route entry.
- Do not fetch an entire inventory when only the first page is needed.
- Lazy-load maps, charts, social/activity feeds, reviews and other secondary modules.
- Lazy-load heavy libraries and non-critical route components.
- Use responsive image derivatives and avoid loading full-resolution originals into cards.
- Avoid duplicate Firestore reads from overlapping effects or route transitions.
- Use explicit loading, empty and error states.

## Showroom first paint
Critical:
- showroom identity
- verification state if available
- location/contact action
- first inventory page

Deferred:
- full gallery
- map
- reviews
- analytics
- activity feed
- secondary recommendations

## Marketplace
- Cursor pagination is required.
- Search/filter queries must be server/database constrained.
- Never use a fixed 100-record fetch as the complete inventory.
- Images must use appropriate card/thumbnail derivatives.

## JavaScript and dependencies
Every dependency must have a clear production purpose. Remove unused packages and duplicate functionality. Heavy 3D, charting, map and document-generation code must not be part of the initial bundle unless the route requires it.

## Data integrity
Skeletons and placeholders must never be presented as real marketplace facts. Demo/seed data must never be used by production routes.

## Measurement
Before production release, record for key mobile routes:
- initial JavaScript payload
- route data requests
- number of Firestore reads where measurable
- largest media requested
- time to first meaningful content
- interaction readiness

## Release gate
Performance regressions that make core search, listing detail or showroom opening materially slower are a NO-GO. Security and data-integrity gates remain higher priority than performance.

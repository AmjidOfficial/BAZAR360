# Bazar360 Digital Showroom Specification

## Product direction
The public showroom is a digital showroom, not an admin dashboard. It should feel modern, dynamic, premium and immersive while remaining lightweight and mobile-first.

## Visual language
- Dark luxury neumorphic foundation.
- Graphite/charcoal surfaces with controlled Bazar360 gold/orange accents.
- Teal may be used as a restrained secondary state accent.
- Soft inner/outer shadows, depth and subtle glow.
- Avoid excessive glass, blur, gradients or glow that harms readability or performance.
- One Bazar360 application identity. Showroom branding is content inside the experience.

## Experience hierarchy
1. Cinematic showroom hero using the real showroom cover/logo.
2. Real showroom identity, verification state, location and contact actions.
3. Featured real inventory.
4. Full inventory with fast filters/search.
5. About, services and showroom media.
6. Reviews and trust signals only when real data exists.
7. Location/contact section.

## Motion
- Hero elements enter with short, purposeful transitions.
- Vehicle cards may use subtle hover elevation and image scale on pointer devices.
- Scroll sections reveal progressively.
- Media can use light parallax only where it does not block interaction.
- Mobile uses reduced animation intensity.
- Respect prefers-reduced-motion.
- No animation may delay primary search, inventory or contact actions.

## Media intelligence
- Preserve original uploads.
- Generate responsive derivatives.
- Detect focal point and keep the vehicle/logo visible in crops.
- Select the strongest available image for primary placement only when the selection is based on actual uploaded media.
- Never generate or substitute a fake vehicle/showroom image.

## Trust and data
- Verification badge appears only from authoritative verification state.
- Ratings/reviews/counts are shown only from real data.
- Phone, WhatsApp, address, hours and contact links come from the showroom record.
- No hard-coded seller, phone, address, slogan, QR, map or verification values.
- Missing optional values display an honest empty/Not provided state.

## Performance
- Critical showroom identity and first inventory page render first.
- Secondary gallery, map, reviews, activity and analytics load progressively.
- Heavy modules are route-level lazy loaded.
- Responsive image derivatives are used for cards and hero media.
- Avoid duplicate Firestore reads on showroom entry.

## Mobile
- Thumb-friendly primary actions.
- Swipeable media where useful.
- Sticky contact action when appropriate.
- No horizontal page scrolling.
- Compact but readable vehicle cards.
- Fast first interaction.

## Accessibility
- Semantic headings and controls.
- Visible keyboard focus.
- Good contrast.
- Reduced-motion support.
- Meaningful alt text.
- Accessible form validation and error states.

## Release gate
A showroom is not 10/10 unless it is visually polished, fully responsive, data-authentic, performant, accessible and free of hard-coded marketplace facts.
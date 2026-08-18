# Bazar360 10/10 Showroom Release Checklist

## Data
- [ ] All showroom facts come from authoritative Firestore data.
- [ ] No hard-coded phone, WhatsApp, address, QR, verification, rating or seller identity.
- [ ] Missing optional data is shown honestly.

## Experience
- [ ] Hero uses real uploaded showroom media.
- [ ] Real inventory is the primary visual focus.
- [ ] Search/filter/contact actions are obvious.
- [ ] Public showroom feels like a digital showroom, not an admin dashboard.

## Motion
- [ ] Entry animation is short and purposeful.
- [ ] Scroll reveals are subtle.
- [ ] Vehicle cards have lightweight interaction.
- [ ] Reduced-motion is respected.

## Media
- [ ] Original uploads are preserved.
- [ ] Responsive derivatives are used.
- [ ] Focal points survive responsive crops.
- [ ] Missing media has an honest fallback.

## Performance
- [ ] Critical showroom identity renders before secondary sections.
- [ ] Secondary media/map/reviews load progressively.
- [ ] No duplicate Firestore reads on entry.
- [ ] No full inventory collection fetch for the initial view.
- [ ] Heavy route-specific libraries are lazy loaded.

## Mobile
- [ ] No horizontal scrolling.
- [ ] Touch targets are comfortable.
- [ ] Primary contact action is reachable.
- [ ] Cards and media work on small screens.

## Accessibility
- [ ] Keyboard focus is visible.
- [ ] Contrast is sufficient.
- [ ] Semantic headings and buttons are used.
- [ ] Media has meaningful alternative text where needed.

## Release
Any failed data-integrity or security check is an automatic NO-GO. Visual polish alone cannot certify the showroom.
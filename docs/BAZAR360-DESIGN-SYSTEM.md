# Bazar360 Design System

## Product principle
One Bazar360 product experience. Premium automotive presentation with social-product simplicity and mobile-first speed.

## Visual direction
- Clean, premium, modern and restrained.
- Strong hierarchy and generous but efficient spacing.
- No decorative effects that slow or distract from marketplace actions.
- Motion is short, purposeful and optional where reduced-motion is enabled.
- Showroom branding is content-level branding and must not replace the Bazar360 application identity.

## Core tokens
Define all colors, typography, spacing, radius, elevation, borders and motion through shared design tokens. Components must not invent one-off values unless there is a documented reason.

## Typography
Use one primary UI font family and a controlled type scale. Headings should be clear and compact. Body text must remain readable on small screens.

## Layout
- Mobile-first.
- Avoid unnecessary horizontal scrolling.
- Use consistent page containers and responsive gutters.
- Keep primary actions visible and easy to reach with a thumb.
- Do not use oversized hero sections when they delay search or inventory.

## Navigation
Public navigation should prioritize:
1. Home/search
2. Browse inventory
3. Saved/favorites
4. Messages/leads where applicable
5. Profile/account

Admin and showroom tools use separate workspaces and must not overload public navigation.

## Vehicle cards
Every card should prioritize:
- authentic primary media
- price when provided
- vehicle title
- key facts that actually exist
- location when provided
- seller/showroom identity when authoritative
- clear save/share/contact action

Never render invented specifications to fill visual space.

## Showroom
Above the fold should establish:
- showroom identity
- verification state when available
- location/contact
- primary inventory

Secondary content should progressively load.

## Forms
- Short steps.
- Clear labels.
- Inline validation.
- Preserve user-entered data on errors.
- Make required vs optional fields obvious.
- Do not hide important fields behind confusing UI.

## Media
- Preserve originals.
- Use responsive derivatives.
- Use context-specific crops.
- Keep focal subjects visible.
- Provide meaningful alt text where appropriate.

## Accessibility
- Keyboard navigable.
- Visible focus states.
- Sufficient contrast.
- Touch targets sized for mobile use.
- Reduced-motion support.
- Semantic headings and controls.
- Errors announced clearly.

## Empty/loading/error states
States must be honest and useful. Skeletons indicate loading only. They must never resemble fake marketplace facts.

## Release gate
A UI change is not complete until it works on mobile and desktop, respects the shared tokens, passes accessibility checks, and does not materially increase the critical route bundle or data requests.
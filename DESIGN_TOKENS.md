# BAZAR360 Design System Tokens (Clean-Room Redesign)

This token file outlines the strict layout, spacing, typography, and color configurations designed specifically for the clean-room architecture of Bazar360.online.

## Spacing & Density Tokens

Our design focuses on uniform alignment using standard `rem` spacing and adaptive layout density to maintain a professional, tool-like feel.

```js
// Spacing guidelines in Tailwind
const spacingTokens = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', // Unified alignment grid
  cardGap: 'gap-3',                                   // Dense card grids
  sectionPadding: 'py-12 md:py-16',                   // Spacious segment breaks
  formGap: 'gap-1.5',                                 // Ultra-tight unified search controls
  contentPadding: 'p-4',                              // Compact listing card interiors
};
```

## Border Radius & Hairlines

To maintain a geometric, modern utility feel rather than a playful consumer-focused layout, we use a rigid, unified border-radius and thin borders.

```js
// Radii & Border guidelines
const bordersAndRadii = {
  radius: 'rounded-md',                        // 6px - applied to all cards, inputs, search controls, and CTA buttons
  borderLight: 'border-slate-200',             // 1px subtle gray boundary for crisp light sections
  borderDark: 'border-slate-800/80',          // 1px subtle navy boundary for crisp dark sections
  borderHover: 'hover:border-slate-300 dark:hover:border-slate-700', // Understated hover response (no neon shadows)
};
```

## Typography Scale

Strict typographical scale prevents oversized gaps, ensuring metadata stays concise and display headings stay legible.

| Token | Class / Style | CSS Equivalent | Usage |
|---|---|---|---|
| Display | `text-3xl md:text-5xl font-black text-white uppercase` | `font-size: 3rem; font-weight: 900` | Primary Hero slogans |
| Heading 2 | `text-xl md:text-2xl font-bold uppercase` | `font-size: 1.5rem; font-weight: 700` | Section headers / grid directories |
| Card Title | `text-sm font-bold tracking-tight` | `font-size: 0.875rem; font-weight: 700` | Listing titles (Makes & Models) |
| Metadata | `text-[10.5px] font-mono tracking-wide` | `font-size: 0.656rem; font-family: monospace` | Fuel types, mileage, engine size |
| Tiny Labels | `text-[8px] font-sans uppercase font-bold` | `font-size: 0.5rem; text-transform: uppercase` | Asking price header, item tags |

## Professional Color Strategy

We utilize a restrained monochromatic base with the vibrant **Bazar360/Auto Choice Orange** reserved strictly for conversion buttons.

- **Monochromatic Canvas (Light)**: Slate/Grey `bg-slate-50` with pure white cards `bg-white` and high-contrast text `text-slate-900`.
- **Monochromatic Canvas (Dark)**: Corporate Slate `bg-slate-950` with deep solid containers `bg-slate-900` and crisp white text `text-slate-100`.
- **The Signature CTA Orange**: `#FF6B00` (or `#E05B00` for hover/active) used *exclusively* for:
  - Search trigger submit button
  - Call/Contact primary button
  - "Post Your Ad" primary creation button
  - Critical interactive indicators (verified badge checks, active filter markers)
- **Secondary Actions**: Clean slates and grays (`bg-slate-100`, `bg-slate-800`).

---
*Created on July 11, 2026. Aligned with PakWheels & Zameen.com standards.*

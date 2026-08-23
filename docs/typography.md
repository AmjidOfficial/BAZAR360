# Bazar360 Typography Design System

This document specifies the official typographic standards, font families, scale multipliers, and weight mappings for Bazar360. Adhering to these guidelines ensures a premium, high-readability experience across all device form factors and prevents cumulative layout shifts (CLS).

---

## 1. Core Font Stack

Bazar360 utilizes two primary font families carefully matched for contrast, tracking, and optical weight:

*   **Display / Header Font Stack**: 
    `'Manrope', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif`
    *   **Primary Purpose**: Headings, title blocks, section brows, interactive metrics, and badges.
    *   **Fallback Strategy**: Falls back to *Plus Jakarta Sans* or system display sans-serif.

*   **Body / UI Font Stack**: 
    `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    *   **Primary Purpose**: Long-form body copy, car listings metadata, labels, forms, user input fields, and menus.
    *   **Fallback Strategy**: Falls back to the standard system UI sans-serif stack.

*   **Mono Space Font Stack**:
    `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`
    *   **Primary Purpose**: Unique ID badges, price calculations, and audit logs.

---

## 2. Standardized Font Weights

To maintain strict typographic rhythm and visual balance, only five weights are allowed across the design tokens:

| Weight Value | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- |
| **400** | `font-normal` | Regular body paragraphs, secondary text, metadata labels. |
| **500** | `font-medium` | UI buttons, navigation links, list values, sub-labels. |
| **600** | `font-semibold` | Small headers, secondary card titles, badge text. |
| **700** | `font-bold` | Main card titles, pricing text, standard block labels. |
| **800** | `font-extrabold` / `font-black` | Core display headings (H1, H2, H3), hero section statements. |

---

## 3. Headers vs. Body Text Guidelines

### A. Headers (`h1`, `h2`, `h3`, `h4`, `[role="heading"]`)
*   **Font Family**: `'Manrope', sans-serif`
*   **Letter Spacing (Tracking)**: `-0.03em` for sizes above `24px` to keep character clusters tight and premium.
*   **Default Sizing Scale**:
    *   `H1` / Display: `clamp(2.25rem, 6vw, 3.75rem)` with `font-weight: 800`
    *   `H2` / Section Headers: `clamp(1.50rem, 4vw, 2.25rem)` with `font-weight: 800`
    *   `H3` / Component Headers: `clamp(1.125rem, 3vw, 1.50rem)` with `font-weight: 700` or `800`
*   **Color Mapping**: Bound exclusively to CSS variable `var(--color-text-header)`.

### B. Body Copy (`p`, `span`, `li`, `input`)
*   **Font Family**: `'Inter', sans-serif`
*   **Letter Spacing (Tracking)**: `normal` or `+0.01em` for dark mode setups to enhance contrast and legibility.
*   **Line Height (Leading)**: Keep strictly between `1.5` and `1.7` (`leading-relaxed` or `leading-normal`) to ensure visual breathing room.
*   **Default Sizing Scale**:
    *   Standard body: `16px` (`text-base`)
    *   Small UI text / labels: `14px` (`text-sm`)
    *   Caption / Metadata: `12px` (`text-xs`)
*   **Color Mapping**: Bound to `var(--color-text-main)` or `var(--color-text-muted)` for high-contrast secondary hierarchy.

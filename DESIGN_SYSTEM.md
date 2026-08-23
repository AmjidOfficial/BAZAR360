# Bazar360 Design System & Deliverables

## 1. Complete Figma-style Design Tokens (Tailwind)

### Typography
- **Primary Font (Headings)**: Space Grotesk (`font-display`) - Use for marketing headers, bold numbers, and hero tags.
- **Secondary Font (Body)**: Inter (`font-sans`) - Use for paragraphs, standard buttons, and small UI text.
- **Monospace (Data/Specs)**: JetBrains Mono (`font-mono`) - Use for pricing, horsepower, 0-100 times, badges, and IDs.

### Color Palette

**Dark Luxury (Default)**
- Background Primary: `#030712` (Slate 950)
- Background Secondary (Cards): `#0F172A` (Slate 900)
- Accent (Primary Action): `#F97316` (Orange 500)
- Accent (Secondary/Tech): `#38BDF8` (Sky 400)
- Text Main: `#FFFFFF` (White)
- Text Muted: `#94A3B8` (Slate 400)
- Border Subtle: `rgba(255, 255, 255, 0.05)`

**Clean Professional (Light Mode Toggle)**
- Background Primary: `#FFFFFF` (White)
- Background Secondary (Cards): `#F8FAFC` (Slate 50)
- Accent (Primary Action): `#0369A1` (Sky 700)
- Accent (Secondary): `#0F172A` (Slate 900)
- Text Main: `#0F172A` (Slate 900)
- Text Muted: `#64748B` (Slate 500)
- Border Subtle: `#E2E8F0` (Slate 200)

### Spacing & Shadows (Soft Elevation)
- Hover Elevation: `shadow-2xl` combined with `-translate-y-1`
- Card Padding: `p-4` with tight internal spacing for data points (`gap-1.5`)
- Border Radius: `rounded-2xl` for cards, `rounded-full` for badges.

---

## 2. Component Specifications

### 2.1 The Header (`TopAppBar`)
- **Behavior**: Sticky, frosted glass (`backdrop-blur-md bg-slate-950/80`).
- **Desktop Navigation**: Clean top-level dropdowns for 'Inventory', 'Financing', and 'Account' (replacing hamburger).
- **Mobile Navigation**: Hidden top links, delegates entirely to `BottomNavBar`.

### 2.2 The `VehicleCard`
- **Layout**: Image-heavy, borderless.
- **Hero Image**: 16:10 aspect ratio, full bleed up to card edges.
- **Smart Data Points**: A 3-column bottom grid featuring "Max Speed", "0-100 km/h", and "Power (HP)".
- **Interaction**: Soft hover lift with `shadow-2xl` and a subtle orange tint on the title.

### 2.3 The Footer
- **Layout**: 4-column structured footer for desktop, stacked for mobile.
- **Elements**: Newsletter signup, app download links, legal disclaimers, and social icons.

---

## 3. Next.js 15 Modular Feed Layout Snippet

Below is the code snippet for a Next.js 15 `page.tsx` demonstrating the requested modular feed layout using Tailwind CSS classes and React Server Components (RSC):

```tsx
// app/page.tsx
import { Suspense } from 'react';
import HeroPremium from '@/components/home/HeroPremium';
import QuickCategories from '@/components/home/QuickCategories';
import FeaturedVehicles from '@/components/home/FeaturedVehicles';
import DealerSpotlight from '@/components/home/DealerSpotlight';
import SkeletonHorizontalScroll from '@/components/skeletons/SkeletonHorizontalScroll';

export const metadata = {
  title: 'Bazar360 | Drive Your Future, Today',
  description: 'Premium automotive marketplace.',
};

export default async function HomeFeed() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      
      {/* 1. Immersive Hero - Full Bleed with Backdrop Blur Search */}
      <HeroPremium />

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 2. Quick Categories (Large Icon Tiles) */}
        <section aria-label="Browse by Category">
          <QuickCategories />
        </section>

        {/* 3. Horizontal Scroll "New Arrivals" & "For You" */}
        <section aria-label="New Arrivals" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display tracking-tight">New Arrivals</h2>
            <button className="text-sm font-semibold text-orange-500 hover:text-orange-400">View All &rarr;</button>
          </div>
          <Suspense fallback={<SkeletonHorizontalScroll />}>
            <FeaturedVehicles limit={8} />
          </Suspense>
        </section>

        {/* 4. Dealer/Rep Spotlight (Human-centric trust builder) */}
        <section aria-label="Trusted Dealers">
          <DealerSpotlight />
        </section>

      </div>
    </main>
  );
}
```

# BAZAR360 10/10 Owner Roadmap

## Product standard
Bazar360 is a real-data-first automotive marketplace. It must feel as simple and fast as Facebook while retaining premium automotive presentation.

## Non-negotiable rules
- Never invent marketplace facts.
- Firestore/user/admin data is the source of truth.
- Missing optional data remains missing and is displayed as "Not provided" where appropriate.
- AI may suggest presentation, SEO, translation, cropping and copy improvements, but must not invent factual vehicle, seller, showroom, review, pricing or verification data.
- Every protected write requires authentication, role/ownership checks and validation.
- Production must never depend on demo/seed inventory.
- Vehicle identity is the database listing ID, not title/price/year combinations.
- Original uploaded media is preserved; generated derivatives are separate.
- Mobile performance is a first-class requirement.

## Certification gates
### P0 Security
- Firebase Firestore ownership and role enforcement
- Firebase Storage ownership and media path enforcement
- Private verification/inspection documents
- Protected messaging/conversation access
- Auditability of privileged operations

### P0 Data integrity
- Remove factual fallback values
- Remove hard-coded seller/showroom identity
- Remove demo data from production paths
- Validate listing fields at write boundaries
- Preserve exact user/admin media and metadata

### P1 Architecture
- Consolidate listing repository/data access
- Use cursor pagination for inventory
- Remove artificial deduplication
- Remove special-case showroom identity logic
- Reduce duplicated patch scripts and legacy workarounds
- Keep domain types aligned with optional Firestore fields

### P1 Performance
- Lazy-load media and heavy modules
- Minimize initial JavaScript
- Avoid unnecessary API calls
- Optimize showroom opening path
- Use responsive image derivatives
- Review dependency footprint

### P2 UX/UI
- One Bazar360 premium design system
- Mobile-first navigation
- Simple search-first home page
- Clear listing cards
- Fast listing creation
- Accessible loading, empty and error states
- Useful motion only

### P2 AI/media
- Intelligent focal-point and crop selection
- Automatic responsive media derivatives
- AI-assisted listing copy and SEO
- Clear separation between verified facts and AI suggestions

### P3 Discovery/SEO
- Vehicle, brand, model, city and showroom entities
- Canonical URLs
- Structured data
- Sitemap/robots
- Internal entity linking
- AEO/GEO-ready content

## Release rule
No production merge until build, security, data-integrity, permission, mobile and regression checks pass. Any failed P0 gate is a NO-GO.

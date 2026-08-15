# BAZAR360 ENTERPRISE PLATFORM STANDARDS & ARCHITECTURE SPECIFICATION

**Platform**: Bazar360.online  
**Current Sector**: Auto Choice  
**Future Sectors**: Property Choice, Bike Choice, Electronics Choice, Jobs Choice, Services Choice, Agriculture Choice, Business Choice, Industrial Choice, Travel Choice  
**Version**: 1.0.0 Enterprise Edition  
**Last Updated**: August 2026  

---

## 1. MISSION & PLATFORM IDENTITY

Bazar360 is NOT an automobile website. **Bazar360 is a unified, multi-sector Marketplace Platform.**

Auto Choice is merely the first operational sector. Every future sector (Property Choice, Bike Choice, Electronics Choice, Jobs Choice, Services Choice, Agriculture Choice, Business Choice, Industrial Choice, Travel Choice) inherits the exact same marketplace architecture, design language, security model, database pattern, and caching engine.

---

## 2. NON-NEGOTIABLE ENTERPRISE GUARDRAILS

1. **Zero Functionality Loss**: Never break or regress existing functionality across buyer, seller, dealer, or admin workflows.
2. **Zero Data Loss & State Preservation**: All database models and user preferences must maintain strict backward compatibility.
3. **Database Security & Integrity**: Firebase Authentication, Firestore Security Rules, and RBAC policies must remain mathematically sound without permission leaks.
4. **API & Server Compatibility**: Express backend routes, server-side Gemini integrations, and App Check middlewares must remain fully operational.
5. **No Duplicate Logic**: All entity schemas, formatting helpers, and currency converters must use single sources of truth.
6. **Zero Performance & Accessibility Regression**: Every page must maintain high Lighthouse metrics, smooth touch response, and WCAG 2.2 AA accessibility.

---

## 3. MULTI-SECTOR MARKETPLACE ARCHITECTURE

Every sector in Bazar360 adheres to a common schema interface:

- **Entity Collection Structure**:
  - `listings`: Main marketplace items tagged with `sector` (`auto`, `property`, `electronics`, `jobs`, `services`, etc.)
  - `dealers`: Business/Showroom entities with sector capability matrix.
  - `bargains`: Negotiation and deal-making engine for buyer-seller interactions.
  - `leads`: Buyer interest and lead delivery pipeline.
  - `users` / `profiles`: User accounts with role-based permissions (`Admin`, `Showroom Owner`, `Sales Rep`, `Individual User`).
  - `reviews` & `auditLogs`: Platform trust, feedback, and enterprise audit tracking.

---

## 4. UI/UX & DESIGN SYSTEM STANDARDS

- **Visual Tone**: Premium, modern, professional, ultra-fast, minimal, and trustworthy.
- **Theme Support**: Dynamic theme engines (`theme-cosmic-dark`, `theme-luxury-light`, `theme-emerald`, `theme-gold`) driven by CSS variables.
- **Typography**: Clear hierarchy with `Plus Jakarta Sans` or modern sans typography paired with display headings.
- **Responsive Layouts**: 100% fluid layouts across Mobile (<640px), Tablet (640px–1024px), Laptop (1024px–1280px), Desktop (>1280px), and Ultra-Wide displays without horizontal overflow or overlapping targets.

---

## 5. SECURITY & OWASP COMPLIANCE

- **Firestore Rules**: Strict Attribute-Based Access Control (ABAC), verified user token checks (`email_verified`), field immutability on sensitive properties (`createdAt`, `ownerId`), and strict schema shape checking.
- **Input Sanitization & Injection Defense**: No raw script execution, strict parameter validation on all Express API endpoints, and clean client-side sanitization.
- **API Key Security**: Secrets stored server-side or in `.env.example`. Gemini API keys are proxied strictly through server endpoints (`/api/*`).

---

## 6. PERFORMANCE & SEO SPECIFICATION

- **Performance**: High Lighthouse score target, code splitting via React lazy loading, dynamic imports for heavy components, optimized image formats with fallback wrappers.
- **SEO Strategy**: Support for Technical SEO, Entity SEO, Schema.org JSON-LD structured data, OpenGraph/Twitter Cards, dynamic breadcrumbs, canonical tag generators, and AI Search Optimization (AEO/GEO/LLMO).

---

## 7. TASK VERIFICATION & GO-LIVE CHECKLIST

For every task executed on Bazar360:
- Validate TypeScript strict type checking (`npm run lint` / `tsc --noEmit`).
- Validate production build compilation (`npm run build`).
- Verify backward compatibility and multi-sector extension readiness.

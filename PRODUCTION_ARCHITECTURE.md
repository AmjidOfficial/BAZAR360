# BAZAR360.ONLINE - ENTERPRISE PRODUCTION ARCHITECTURE

This document establishes the official enterprise-grade production architecture, security invariants, role access limits, and data synchronization standards for **Bazar360.online**.

---

## 1. Zero-Trust Access Claim Architecture
Every operation on Bazar360.online is authenticated and authorized from the ground up, enforcing server-side claims as the absolute source of truth.

```
Firebase Auth ──► ID Token Verification (requireAuth) ──► Server-Side DB Verifications ──► Cloudinary / Firestore Write
```

### Privileged User Roles & Limits
* **CUSTOMER**: Read public listings, manage their personal profile (`/users/{uid}` and `/profiles/{uid}`), save favorites, and submit real inquiries (`/leads`).
* **SHOWROOM_OWNER**: Control their verified showroom profiles (`/dealers/{id}`), publish/moderate listings associated with their showroom ID, and manage customer inquiries.
* **ADMIN**: Full moderation rights, approve/reject pending vehicle listings, handle showroom registries, manage FAQs, and review server operational analytics.
* **SUPER_ADMIN**: Security override capability, role modification, and high-risk system adjustments. Admin and Super Admin roles are determined strictly through secure Firebase Custom Claims or backend-defined master email sets rather than client-side manipulation.

---

## 2. Server-Side Asset & Media Security (Cloudinary)
To prevent unauthorized deletes or malicious uploads, our Express.js backend acts as a strict secure gateway.

* **Upload Presets**: Public client uploads utilize specific restricted presets with auto-compression (dimensions constrained to `1920px`, formats optimized to next-gen formats).
* **Authorized Deletion Gate (`/api/cloudinary/delete`)**:
  * Demands valid Bearer ID tokens via `requireAuth` middleware.
  * Cross-verifies ownership of the asset in Firestore `listings`, `dealers`, or `users` before calling Cloudinary's secure REST API.
  * Ensures a user cannot delete another showroom owner's car images or logo assets.

---

## 3. Secured Firestore Ruleset
Our production database blocks all client-side bypass attempts.

* **Unauthenticated Writing Blocked**: Vehicle listing creations require valid authenticated sessions.
* **Owner-Verification Invariants**:
  * Listings can only be created if `incoming().dealerId` matches the authenticated `request.auth.uid` (for private individual sellers) or points to a dealer showroom where the dealer's `ownerUid == request.auth.uid`.
* **Field Immutability**:
  * Immutable fields like `ownerUid` or `createdAt` are locked on update.
  * Role elevation attempts are intercepted and blocked on creation/updates.

---

## 4. Pure Real Inventory & Seeding Purge
Bazar360.online operates entirely on authentic marketplace events.

* **Automatic Seeding Removed**: The `/api/feed` endpoint has been purged of mock Porsche, Welcome, and Civic posts. If no real posts exist, the server returns an honest empty array `[]`.
* **No Local Mock CRM Leads**: The showroom owner's CRM dashboard is synchronized directly with live Firestore inquiries, substituting hardcoded mock records with real database entries.
* **Zero Seeding Fail-safes**: Static fallback datasets are removed from public listings feeds, implementing clean, professional empty states when there is zero data.

---

## 5. Directory & Asset Mapping
* `/firestore.rules`: Active database security specifications.
* `/server.ts`: Backend entry point, App Check validations, Google Sheet integrations, and Cloudinary proxy.
* `/src/lib/dbService.ts`: Authorized CRUD repository layer.
* `/src/components/RegistrationPortal.tsx`: Real-time dashboard view & showroom CRM coordinator.

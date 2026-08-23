# Bazar360.online Owner Production Standard

## Purpose

This document is the release gate for Bazar360.online. The target is a world-class automotive marketplace that is as easy and lightweight to use as a social marketplace, while maintaining premium automotive presentation, strong trust, real data, security, and scalability.

## Non-negotiable rules

1. **Real data is the only marketplace source of truth.**
   - Firestore/Auth/approved external records are authoritative.
   - Missing data must remain missing or display `Not provided`.
   - The UI must never invent vehicle, seller, showroom, review, rating, follower, mileage, price, location, registration, condition, document, tax, or activity facts.

2. **AI is an assistant, not a data authority.**
   - AI may suggest copy, tags, translation, SEO metadata, media order, crop/focal point, and missing-field prompts.
   - AI must not silently create or overwrite factual marketplace attributes.

3. **Ownership is mandatory.**
   - Users can only modify resources they own or are explicitly authorized to manage.
   - Showroom staff permissions must be role-based.
   - Admin access must use durable role claims or an equivalent server-controlled authorization model.

4. **No production demo data.**
   - Development seeds remain isolated from production.
   - Demo/test/placeholder records must never be rendered as real inventory.

5. **No destructive cleanup without dependency review.**
   - Legacy patch scripts, compatibility code, and unused modules are classified first as KEEP, REPLACE, ARCHIVE, or DELETE.
   - Deletion happens only after references and build impact are checked.

6. **Performance is a product feature.**
   - Prefer server-side filtering, indexed queries, pagination/cursors, responsive media, lazy loading, and small client bundles.
   - Heavy libraries must justify their runtime cost.
   - Animation must not block interaction or content rendering.

7. **Mobile is first-class.**
   - Core buyer and seller flows must work comfortably on a phone with one-hand interaction where practical.
   - No unnecessary horizontal scrolling.

8. **Security is a release blocker.**
   - Firestore and Storage rules must validate authentication, role, ownership, allowed fields, and safe data shape.
   - Public writes are prohibited unless there is a documented business reason and strict validation/rate controls.
   - Messages must be accessible only to conversation participants and authorized admins.

## Product architecture targets

### Buyer

Search, filters, vehicle detail, real seller identity, showroom profile, favorites, share, contact, messaging, report, and clear trust signals.

### Seller

Profile, post vehicle, upload media, review listing, publish, edit, pause, mark sold, manage leads, and message buyers.

### Showroom

Business profile, inventory, media, leads, messages, reviews, followers, hours, location, verification, team, and useful analytics.

### Admin

Users, showrooms, vehicles, verification, reports, reviews, media, leads, SEO, content, security, audit logs, and system health.

## Data rules

Every displayed field must follow this priority:

`Authoritative stored value -> normalized value -> explicit empty state`

Never use a fabricated factual fallback such as a default city, engine size, fuel type, transmission, condition, registration city, document type, or tax status.

Boolean fields must also distinguish **false** from **unknown**. A missing field must not automatically become `true` or `false` when that changes the meaning of the marketplace record.

## Media rules

Keep the original upload. Generate optimized derivatives for card, detail, profile, share, and other known placements. AI may determine a focal point and suggest crops, but it must not replace the source asset.

Every media record should be traceable to its owner and resource:

- ownerUid
- resourceType
- resourceId
- mediaType
- original asset reference
- derivative references
- createdAt
- uploadedBy

## UX rules

The homepage must answer the user's main intent immediately: what vehicle they want, where they want it, and what budget/type they have. Every additional section must justify its space and network cost.

Avoid decorative complexity that slows down search, listing, messaging, or showroom discovery.

## Release gate

A release is **NO-GO** if any of the following remain:

- fake or invented marketplace facts
- unauthorized Firestore/Storage writes
- broken ownership checks
- exposed secrets
- production seed/demo inventory
- broken mobile core flow
- blocking loading behavior
- duplicate or conflicting source-of-truth logic
- untested authentication/role paths
- broken listing creation/edit/publish flow
- broken media ownership or deletion

A release is **GO** only after functional, security, data-integrity, performance, accessibility, SEO, and regression checks pass.

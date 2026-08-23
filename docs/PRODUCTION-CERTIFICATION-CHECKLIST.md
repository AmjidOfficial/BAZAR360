# Bazar360 Production Certification Checklist

## Release policy
10/10 means all P0 gates pass. A single P0 failure is a NO-GO. P1/P2/P3 work may remain planned only when it does not compromise security, real-data integrity, core usability or production stability.

## P0 Security
- [ ] Firestore rules enforce authentication, ownership and roles
- [ ] Storage rules enforce authentication, ownership and roles
- [ ] Private verification/inspection media is inaccessible publicly
- [ ] Conversation reads/writes require participation
- [ ] Admin-only writes are server/rules enforced
- [ ] Privileged operations are auditable
- [ ] No client-only security controls

## P0 Data integrity
- [ ] No factual vehicle defaults in production mapping
- [ ] No fake seller/showroom identity
- [ ] No fake reviews/ratings/testimonials
- [ ] No production dependency on demo/seed inventory
- [ ] Missing optional data remains missing
- [ ] User/admin uploaded media is preserved
- [ ] Listing identity is the authoritative document ID
- [ ] Ownership is authoritative and validated

## P0 Marketplace trust
- [ ] Verification badges reflect real verification state
- [ ] Public listing state is explicit
- [ ] Sold/deleted/private/blocked records follow visibility policy
- [ ] Reviews require legitimate eligibility
- [ ] Reports enter moderation workflow
- [ ] Abuse-prone actions have appropriate rate limits/validation

## Core journeys
- [ ] Guest search
- [ ] Guest vehicle detail
- [ ] Registration/login
- [ ] Seller profile
- [ ] Post listing
- [ ] Edit listing
- [ ] Media upload
- [ ] Favorite/share/contact
- [ ] Messaging
- [ ] Showroom creation/editing
- [ ] Showroom inventory
- [ ] Showroom opening on mobile
- [ ] Admin moderation
- [ ] Verification workflow

## UX/accessibility
- [ ] Mobile-first layout
- [ ] No horizontal overflow
- [ ] Keyboard navigation works
- [ ] Visible focus states
- [ ] Form controls have labels
- [ ] Reduced motion is respected
- [ ] Loading, empty and error states are clear
- [ ] No fake data in skeletons/placeholders

## Performance
- [ ] No full inventory fetch for first page
- [ ] Cursor pagination used where required
- [ ] Heavy libraries are route/lazy loaded
- [ ] Images use appropriate derivatives
- [ ] Secondary showroom modules are deferred
- [ ] Duplicate reads are removed
- [ ] Core mobile routes are measured on realistic network/device conditions

## SEO/AEO/GEO
- [ ] Canonical URLs are stable
- [ ] Published entities have unique metadata
- [ ] Private/deleted records are not indexable
- [ ] Structured data matches visible facts
- [ ] Sitemap contains canonical indexable entities
- [ ] Robots rules are correct
- [ ] Entity internal linking works
- [ ] No thin doorway pages

## Build and deployment
- [ ] Production build passes
- [ ] Type checking passes
- [ ] Lint/static checks pass where configured
- [ ] CI integrity/security gates pass
- [ ] Firebase rules validated
- [ ] Storage rules validated
- [ ] Environment variables are production-safe
- [ ] No secrets committed
- [ ] Error monitoring is configured
- [ ] Rollback path is known

## Final decision
GO only when every P0 checkbox is verified and core journeys pass. If any P0 item is unknown, the status is NO-GO, not assumed pass.

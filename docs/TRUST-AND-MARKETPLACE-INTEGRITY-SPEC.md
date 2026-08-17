# Bazar360 Trust and Marketplace Integrity Specification

## Goal
Build a marketplace where buyers can trust who posted a vehicle, what is verified, and what is user-generated.

## Identity
- Every account has one authoritative Firebase Auth UID.
- Seller/showroom identity is resolved from authoritative records.
- No hard-coded seller identity.
- Verification status must come from an explicit verification record/state.

## Listings
- Public listings must have an authoritative owner.
- Publication state controls public visibility.
- Sold, deleted, blocked, private and expired listings follow explicit visibility rules.
- Users cannot edit another owner's listing.
- Admin actions are audited.

## Verification
Verification badges must represent a real workflow/state. Do not display a badge because a field happens to exist.

Verification evidence may include identity, business or vehicle documents according to the product's verification policy. Sensitive documents remain private.

## Reviews and ratings
- Only legitimate eligible users may submit reviews.
- A review belongs to its author and target entity.
- Users may not modify another user's review.
- Admin moderation must be auditable.
- Rating aggregates are calculated from actual eligible reviews.
- Never seed fake reviews, ratings or testimonials into production.

## Reports and abuse
Users can report listings, accounts, messages and reviews. Reports must enter a controlled moderation workflow. Repeated abuse can trigger rate limits, blocking or review.

## Spam/fraud controls
At minimum:
- authenticated write boundaries
- ownership checks
- rate limiting for abuse-prone actions
- server-side validation for sensitive operations
- moderation for reported content
- audit logs for privileged changes

## Contact and messaging
Only authorized participants may read/write a conversation. Contact actions must not expose private account information beyond the intended channel.

## Admin
Admin privileges must be role-based and server/rules enforced, not only hidden in the UI. Sensitive admin operations should record who acted, what changed and when.

## Trust UI
The UI must distinguish:
- user-provided information
- showroom/business information
- verified information
- AI suggestions
- community reviews

Do not imply verification where none exists.

## Release gate
Trust is a NO-GO if users can impersonate sellers/showrooms, modify another user's content, create fake ratings/reviews through public production paths, bypass verification state, or access private evidence.

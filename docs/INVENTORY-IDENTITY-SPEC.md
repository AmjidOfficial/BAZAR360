# Bazar360 Inventory Identity Specification

## Canonical identity
A vehicle listing is identified by its Firestore document ID. Title, price, year, seller name, image URL, or dealer name must never be used as the canonical identity.

## Ownership
Every listing must have an authoritative owner reference. Preferred fields:
- `ownerId`: Firebase Auth UID for the listing owner
- `dealerId` or `showroomId`: authoritative business relationship when applicable
- `sellerType`: descriptive metadata, not an ownership substitute

## Data integrity
The mapper must never invent factual vehicle fields. If an optional Firestore value is absent, preserve it as absent. UI presentation may render a localized `Not provided` label.

## Seller identity
Seller identity must resolve from authoritative user/showroom records. No hard-coded seller IDs, names, logos, phone numbers, or showroom records may be injected by the client mapper.

## Deduplication
Client-side title/price/year/dealer deduplication is prohibited. Two listings with similar facts may be separate legitimate vehicles. Duplicate prevention belongs at controlled write boundaries using authoritative identifiers or an explicit moderation workflow.

## Pagination
Marketplace inventory must use Firestore cursor pagination ordered by a stable timestamp with an appropriate document-ID tie breaker where required. A fixed `limit(100)` fetch must not be treated as the complete inventory.

## Status
Only records allowed by the current user's authorization and the marketplace publication state may be shown in public inventory.

## AI
AI may assist with copy, SEO, translation, image ordering, and presentation. AI must not create factual vehicle, seller, showroom, verification, pricing, review, or ownership values.

## Release gate
Any implementation that violates canonical identity, ownership, or real-data rules is a NO-GO for production.
# Bazar360 Security Specification

## Data Invariants
1. **Showroom Ownership**: A dealer profile (`dealers/{dealerId}`) can only be created if `ownerUid` matches the authenticated user. It can only be updated by the user whose UID matches `ownerUid`.
2. **Inventory Ownership (Master Gate)**: A vehicle listing (`listings/{listingId}`) can only be created if it is linked to a valid `dealerId`, and the user creating the listing MUST be the `ownerUid` of that dealer document.
3. **Immutability**: Crucial fields like `ownerUid` on dealers and `dealerId` on listings are immutable.
4. **Relational Integrity**: A listing cannot be created without a valid, pre-existing dealer.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Create Dealer)**: Attempt to create a dealer with `ownerUid` set to another user's ID.
2. **Ghost Field Update (Patch Dealer)**: Attempt to update a dealer adding an unapproved field (e.g. `isAdmin: true`).
3. **Ownership Bypass (Patch Dealer)**: Attempt to update another user's dealer profile.
4. **Resource Poisoning (Create Dealer)**: Attempt to create a dealer with a 2MB string for the `name`.
5. **Orphaned Write (Create Listing)**: Attempt to create a listing for a `dealerId` that does not exist.
6. **Relational Spoofing (Create Listing)**: Attempt to create a listing for a `dealerId` owned by another user.
7. **Privilege Escalation (Patch Listing)**: Attempt to update a listing's `dealerId` to transfer ownership.
8. **Ownership Bypass (Patch Listing)**: Attempt to update another user's listing.
9. **Role Injection (Create User)**: Attempt to create a user profile with `role: "Super Admin"`.
10. **PII Leak (Read User)**: Attempt to read another user's private `profiles/{userId}`.
11. **Cost Attack (List Listings)**: Attempt a blanket `list` query without proper bounding (prevented via rules requiring specific filters where applicable, though public listings are readable).
12. **Status Shortcutting (Lead Update)**: Attempt to modify immutable fields in a lead/CRM record.

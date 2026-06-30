# BAZAR360 Enterprise Firestore Security Specification (TDD)

This document defines the application threat model, security invariants, "Dirty Dozen" exploit payloads, and testing criteria to harden the Firestore rules for BAZAR360.

## 1. Core Data Invariants & Access Control (RBAC)

1. **User Identity Isolation**: A user can only read and write their own primary `users/{userId}` record containing PII (Full Name, Mobile, Email, WhatsApp).
2. **Profile Public/Private Split**: Public profile identifiers under `profiles/{profileId}` can be fetched via single `get` requests (for showing dealer names), but bulk directory queries (`list`) are restricted to prevent data scraping.
3. **Showroom Ownership**: Only verified `Showroom Owner` accounts can create/update showroom documents. Showrooms cannot be deleted by owners (restricted to `Super Admin` only).
4. **Vehicles (Marketplace Listings)**:
   - Anyone can browse listings (`read`).
   - Only accounts with roles `Individual Seller` or `Showroom Staff` (and above) can create listings.
   - Updates/deletions must be verified against the listing owner (`ownerId` / `createdBy`).
5. **Private Interactions (Favorites, Saved Searches, Messages)**: Access is strictly owned; users can only read or write their own preferences and messages. Query scraping is forbidden on `list` operations.
6. **Immortal Fields**: Fields such as `createdAt`, `userId`, `ownerId` must remain immutable after initial document creation.
7. **Temporal Integrity**: All listing updates and logs must bind `updatedAt` to the server-provided `request.time`.

---

## 2. The "Dirty Dozen" Exploit Payloads
These payloads describe highly specialized client-side malicious write or read attempts that the ruleset must reject:

### Payload 1: Privilege Escalation (User Role Spoofing)
- **Target Path**: `users/attacker_uid`
- **Operation**: `create` / `update`
- **Malicious Payload**:
  ```json
  {
    "uid": "attacker_uid",
    "name": "Malicious User",
    "role": "Super Admin"
  }
  ```
- **Constraint**: Must fail because users cannot self-assign or elevate their `role` or `isAdmin` fields.

### Payload 2: PII Bulk Scanning (Denial of Wallet / Scraping)
- **Target Path**: `users/*`
- **Operation**: `list` (Collection query without filter)
- **Malicious Payload**: `db.collection('users').get()`
- **Constraint**: Must fail unless authenticated as `Admin`.

### Payload 3: Shadow Field Injection
- **Target Path**: `vehicles/malicious_vehicle_1`
- **Operation**: `create`
- **Malicious Payload**:
  ```json
  {
    "brand": "Toyota",
    "model": "Aqua",
    "price": 3500000,
    "ownerId": "attacker_uid",
    "isPremiumVerifiedByAdmin": true
  }
  ```
- **Constraint**: Must fail because the database schema requires exact key matching and forbids administrative or un-validated flags in standard user scopes.

### Payload 4: Orphaned Vehicle Record (Reference Poisoning)
- **Target Path**: `vehicles/malicious_vehicle_2`
- **Operation**: `create`
- **Malicious Payload**:
  ```json
  {
    "brand": "Honda",
    "model": "Civic",
    "price": 4500000,
    "ownerId": "non_existent_user_uid"
  }
  ```
- **Constraint**: Must fail because `ownerId` must point to the actual authenticated sender.

### Payload 5: Immortal Field Manipulation
- **Target Path**: `vehicles/valid_vehicle_1`
- **Operation**: `update`
- **Malicious Payload**:
  ```json
  {
    "brand": "Toyota",
    "ownerId": "different_user_uid",
    "createdAt": "2020-01-01T00:00:00Z"
  }
  ```
- **Constraint**: Must fail because `ownerId` and `createdAt` are immutable fields.

### Payload 6: Clock Manipulation (Fake Freshness)
- **Target Path**: `vehicles/valid_vehicle_1`
- **Operation**: `update`
- **Malicious Payload**:
  ```json
  {
    "updatedAt": "2030-12-31T23:59:59Z"
  }
  ```
- **Constraint**: Must fail because updates require validation against `request.time`.

### Payload 7: Document ID Poisoning / Wallet Exhaustion
- **Target Path**: `users/very_long_junk_character_string_acting_as_doc_id`
- **Operation**: `create`
- **Malicious Payload**: `{ "name": "Spam User" }`
- **Constraint**: Must fail because document IDs must match regex constraints (`^[a-zA-Z0-9_\-]+$`) and have length restrictions.

### Payload 8: Message Identity Theft (Spoofing Sender)
- **Target Path**: `messages/msg_123`
- **Operation**: `create`
- **Malicious Payload**:
  ```json
  {
    "senderId": "victim_uid",
    "receiverId": "attacker_uid",
    "text": "Send me your password."
  }
  ```
- **Constraint**: Must fail because the authenticated user's ID must match `senderId`.

### Payload 9: Favorite Hijacking
- **Target Path**: `favorites/fav_456`
- **Operation**: `create`
- **Malicious Payload**:
  ```json
  {
    "userId": "victim_uid",
    "vehicleId": "vehicle_1"
  }
  ```
- **Constraint**: Must fail because users cannot record favorites for other users.

### Payload 10: Unauthorized Showroom Creation
- **Target Path**: `showrooms/showroom_789`
- **Operation**: `create`
- **Malicious Payload**:
  ```json
  {
    "name": "Elite Auto",
    "ownerId": "registered_user_uid"
  }
  ```
- **Constraint**: Must fail because the creator's role must be `Showroom Owner` or `Admin`.

### Payload 11: Lead Scraping (PII Harvesting)
- **Target Path**: `leads/*`
- **Operation**: `list`
- **Malicious Payload**: `db.collection('leads').get()`
- **Constraint**: Must fail unless requested by showroom staff or admin.

### Payload 12: Administrative Override Bypass
- **Target Path**: `payments/pay_abc`
- **Operation**: `update`
- **Malicious Payload**:
  ```json
  {
    "status": "Verified",
    "userId": "attacker_uid"
  }
  ```
- **Constraint**: Must fail because modifying payment documents is restricted to Super Admins.

---

## 3. Threat Model Validation Test Runner (TDD Test Design)

The test runner `firestore.rules.test.ts` should verify that:
1. Valid operations (created by correct roles with accurate schema) succeed.
2. The "Dirty Dozen" exploit payloads result in `PERMISSION_DENIED` errors.

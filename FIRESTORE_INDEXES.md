# Firestore Composite Indexes Deployment Guide

To ensure sub-100ms inventory queries for showroom storefronts (`app/dealers/[slug]/page.tsx` and `ShowroomFilterableInventory.tsx`), Firestore requires composite indexes for compound queries filtering by `dealerId` + `status` (`approved`) and ordered by `createdAt` or `priceRaw`.

## Required Composite Indexes

### 1. Showroom Approved Inventory (By Date)
* **Collection**: `listings`
* **Query Scope**: `Collection`
* **Fields**:
  1. `dealerId` - Ascending
  2. `status` - Ascending
  3. `createdAt` - Descending

### 2. Showroom Approved Inventory (By Price)
* **Collection**: `listings`
* **Query Scope**: `Collection`
* **Fields**:
  1. `dealerId` - Ascending
  2. `status` - Ascending
  3. `priceRaw` - Ascending

---

## Deployment Instructions

### Option A: Firebase CLI (Recommended)
Deploy the updated `firestore.indexes.json` using the Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

### Option B: Firebase Console Direct Links
If running queries without indexes created, Firestore will return a `FirebaseError: The query requires an index` error containing a direct URL in the browser console. Clicking that link automatically pre-fills the composite index creation form in the Firebase Console.

### Verification
Once index status changes from **Building** to **Enabled** (typically 1–2 minutes), showroom inventory queries execute at maximum Firestore performance.

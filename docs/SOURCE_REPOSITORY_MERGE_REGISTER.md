# BAZAR360 Source Repository Merge Register

Canonical repository: AmjidOfficial/BAZAR360

Reference repositories audited:
- AmjidOfficial/Bazar360.online-V3
- AmjidOfficial/automotive-marketplace-platform
- AmjidOfficial/BAZAR360.V2.0
- AmjidOfficial/Marketplace.Bolt
- AmjidOfficial/Cars

## Merge policy

These repositories are not to be merged as blind Git histories. Their useful code, UI, schemas and documentation must be selectively ported into the canonical architecture.

## Findings

### Bazar360.online-V3
React/Vite/Firebase Bazar360 generation. Useful source for production features, design-system documents, Firestore rules/indexes, Firebase Functions and automotive marketplace workflows.

### automotive-marketplace-platform
Next.js marketplace prototype. Useful source for UX/page patterns, browse/search/showroom presentation. Static/demo data and prototype authentication must not enter production.

### BAZAR360.V2.0
Historical Bazar360 generation with Next.js/Firebase routes and backend concepts. Use for feature recovery and comparison only.

### Marketplace.Bolt
Empty Git repository. No code to merge.

### Cars
TanStack/Lovable-style automotive frontend using Supabase. Useful for UI/component ideas only. Supabase is not part of the BAZAR360 production architecture.

## Required final architecture

React + TypeScript + Vite
Firebase Auth
Firestore
Firebase Functions
Cloudinary
Gemini through secure backend functions

One canonical repository:
AmjidOfficial/BAZAR360

Production domain:
bazar360.online

## Important

Do not delete any source repository until its useful content has been audited and either:
1. ported into BAZAR360,
2. explicitly marked as not required, or
3. archived as historical.

The GitHub connector available to this session can modify files, branches and pull requests but does not expose repository-administration deletion. Therefore repository deletion must be performed by an account owner through GitHub Settings after verification.

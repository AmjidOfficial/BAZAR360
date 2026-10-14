# Architecture Decisions — Initial

## ADR-001: Canonical repository
**Decision:** `AmjidOfficial/BAZAR360` is the master repository.

**Reason:** Explicit owner requirement and current project instructions.

**Guardrail:** Other repos remain recoverable until their unique code/assets/config have been migrated and verified.

## ADR-002: Canonical data backend
**Status:** OPEN, do not guess.

The master repository describes and imports Firebase/Firestore and Cloudinary. The primary Lovable project uses Supabase and includes migrations and RLS. Cars also includes Supabase dependencies. These systems have different data models, authorization semantics, and deployment assumptions.

Before merging data-backed features, document:
- Production Firebase project and collections/rules/indexes.
- Supabase project ownership, schema, migrations and RLS policies.
- Which system currently owns live production data.
- Whether a migration is required or Supabase is only a prototype.
- Backup, mapping, validation, rollback and downtime plan if a migration is approved.

Do not run destructive migrations or switch production reads/writes without a tested, approved cutover.

## ADR-003: Framework choice
**Decision:** Keep the master repo's existing React/Vite/Express architecture during the initial consolidation.

**Reason:** The master already has a production domain and server/database integration. The separate Next.js and TanStack Start projects are not proof that a full framework migration is necessary. Evaluate SSR/SEO gains only after tests and current deployment are understood.

## ADR-004: Repository deletion
**Decision:** No deletion during audit or migration.

Delete a source repo only after a verified backup, complete feature/file migration, passing build/tests, live deployment verification, and explicit final user confirmation.

# BAZAR360 Initial Security and Architecture Findings

**Scope:** Static review of repository trees and selected configuration/rule files on 2026-10-14. This is not a full penetration test. Do not deploy rule changes directly without emulator tests and data-owner review.

## Critical follow-up items

### 1. Firebase Storage has a global super-user bypass
In the canonical repository's storage.rules, a catch-all path allows read and write to every object when the user's token email matches a hard-coded email allowlist. This bypasses all later per-folder constraints for those accounts. Remove the global bypass and grant only the minimum permissions needed per path. Use server-controlled custom claims or a tightly controlled admin policy, not email-only global access. Test every path with the Firebase Storage emulator.

### 2. Business verification documents may be readable by every signed-in user
The canonical storage.rules documents path permits reads when isOwner(userId) OR isSignedIn(). That makes all authenticated users eligible to read documents under other users' folders. Restrict reads to the owner and specifically authorized admin/reviewer roles. Verify that document URLs are not exposed publicly and rotate access if exposure is confirmed.

### 3. Showroom asset writes are too broad
The canonical storage.rules showroom-logos and showroom-banners paths permit any signed-in user to write, without checking that the user owns the showroom ID in the object path. Vehicle images/videos and inspection reports also allow broad authenticated writes. Bind write access to verified ownership, listing/showroom membership, content type, size and safe object paths. Add upload abuse/rate controls.

### 4. Rules differ across repositories and may allow unauthenticated listing creation
The BAZAR360.V2.0 Firestore rules version inspected has a listings create condition based on valid ID and valid listing data without an isSignedIn() check in that condition. The canonical rules appear stricter in the corresponding section. Do not copy rules from V2.0 blindly. Use Firebase emulator tests for unauthenticated, buyer, listing owner, dealer staff, moderator and admin cases before choosing a final ruleset.

### 5. Deployment architecture may not match the intended backend
Canonical firebase.json configures static Hosting from dist with an SPA rewrite, while package scripts build an Express server bundle as dist/server.cjs. Static Hosting does not run that bundled Express process. The canonical AGENTS.md also documents that /api routes are not reachable in the current static deployment workflow. Therefore, confirm the actual production hosting target before relying on Express middleware, server-side AI calls, API authorization, or server-created role claims. Choose either a supported server deployment or explicitly move required APIs to Firebase Functions/App Hosting or another supported backend, then verify live routes.

## Repository hygiene and migration risks

- The canonical repository contains many root-level patch/fix scripts, generated server artifacts (server.cjs and source map), and multiple lockfiles. Classify each file as maintained source, one-time migration artifact, generated output, or obsolete. Archive before removing anything.
- The Cars repository tree contains a tracked .env file. Do not print or copy its contents into logs, documentation or another repository. Check whether it contains credentials using secret-scanning tools. If real secrets were committed, revoke/rotate them and remove them from current history as appropriate.
- BAZAR360, V3 and V2 contain similar Firebase rules and app files but are not identical. Diff the complete files and histories before consolidating. Rules are security-critical and cannot be merged by blindly selecting the newest timestamp.
- The Cars project uses Supabase with RLS and SQL migrations. Its model is not interchangeable with Firestore collections. Preserve schema and migration history if any unique features are ported.
- The current evidence does not establish that all workflows work in production, that the live domain runs the intended backend, or that a clean production build succeeds.

## Required remediation sequence

1. Create a staging Firebase project or safe emulator environment; back up existing rules and config.
2. Write rule tests for public reads, owner writes, cross-tenant denial, private documents, listing creation/update/deletion, role escalation and upload abuse.
3. Tighten Storage rules and any Firestore rules proven unsafe; do not deploy until tests pass.
4. Verify whether any secrets are present in tracked .env files without exposing their values. Rotate exposed secrets.
5. Confirm the actual production hosting provider, deployment workflow, backend URL and runtime. Test each required API route against the deployed service.
6. Add CI checks for rule tests, secret scanning, build, lint, types and end-to-end core journeys.
7. Re-run tests after repository consolidation and retain evidence in the release report.

## Status
These are code/configuration findings from selected files. Their live exploitability and production exposure still need confirmation. Do not claim these issues are fixed until remediation is committed and tested.

# Security Best Practices Report

## Executive Summary
A targeted security review was performed for the Next.js/TypeScript API surface, using the `security-best-practices` skill guidance for Next.js backend and React frontend contexts. Immediate hardening was applied to exposed debug/test/admin routes and sensitive logging. The most severe remaining risk is missing server-side user authentication/authorization on multiple user-scoped API routes that trust client-provided `userId`.

## Critical Findings

### SBP-001 (Critical) - User impersonation risk via client-supplied `userId` in state-changing routes
- Location: `src/app/api/delete-user-data/route.ts:8`, `src/app/api/delete-user-data/route.ts:21`, `src/app/api/delete-user-data/route.ts:35`
- Evidence: Route accepts `userId` from request body and performs delete/update operations directly with that identifier.
- Impact: An attacker can potentially target another user's records if they can call the endpoint with a guessed/known user ID and RLS/policies are not strictly enforcing ownership.
- Status: Fixed in this pass (route now uses authenticated user identity and rejects mismatches).

### SBP-002 (Critical) - User data access based on query `userId` without server-side identity checks
- Location: `src/app/api/subscription/route.ts:11`, `src/app/api/subscription/route.ts:28`, `src/app/api/telegram/status/route.ts:9`, `src/app/api/telegram/status/route.ts:21`, `src/app/api/billing/usage/route.ts:9`
- Evidence: Routes accept `userId` from query and return user-specific subscription/telegram/billing data.
- Impact: IDOR-style data disclosure risk if route access is not bound to authenticated caller identity.
- Status: Fixed in this pass (routes require authenticated identity and reject mismatched `userId`).

### SBP-004 (Critical) - Persona deletion endpoint deletes by ID without ownership/auth checks
- Location: `src/app/api/delete-persona/route.ts:8`, `src/app/api/delete-persona/route.ts:18`
- Evidence: Route accepts arbitrary persona `id` from body and deletes directly.
- Impact: If IDs are exposed/guessable and RLS is not strict, attacker can delete other users' personas.
- Status: Fixed in this pass (route now requires authenticated user and filters by persona owner).

## High Findings

### SBP-003 (High) - Server "anon" Supabase client has no per-request user auth context
- Location: `src/lib/supabase/serverClient.ts:10`
- Evidence: `createClient(config.url, config.anonKey)` is created without request session binding; downstream routes frequently trust user-provided IDs.
- Impact: Server endpoints can operate without validated user identity unless each route adds explicit auth checks.
- Status: Not fully fixed in this pass.
- Required fix: Introduce a request-bound auth helper and enforce it on user-scoped routes.

## Fixed Findings (Implemented)

### FIX-001 (High) - Open debug/test/admin routes now key-protected by centralized guard
- Added: `src/lib/security/internalApiAuth.ts`
- Guard applied to:
  - `src/app/api/debug-env/route.ts`
  - `src/app/api/test-db/route.ts`
  - `src/app/api/sync-users/route.ts`
  - `src/app/api/test-user/route.ts`
  - `src/app/api/admin/set-pro-user/route.ts`
  - `src/app/api/instagram/debug-graph/route.ts`
  - `src/app/api/instagram/debug-health/route.ts`
  - `src/app/api/instagram/debug-subscribe/route.ts`
  - `src/app/api/instagram/simulate-webhook/route.ts`
- Security behavior:
  - In production, if no key is configured, these routes are denied.
  - If keys are configured, requests must provide a matching key via `x-internal-api-key`, `x-debug-key`, `x-admin-secret`, bearer token, or `?key=`.

### FIX-002 (Medium) - Sensitive persona payload logging removed
- Updated:
  - `src/app/api/save-persona/route.ts`
  - `src/app/api/get-persona/route.ts`
  - `src/app/api/set-active-persona/route.ts`
  - `src/app/api/list-personas/route.ts`
- Security benefit: Reduced leakage of personal/configuration data into production logs.

### FIX-003 (Critical/High) - Centralized authenticated-user guard applied to user-scoped endpoints
- Added: `src/lib/security/requestAuth.ts`
- Security behavior:
  - Requires bearer token and verifies user via Supabase `auth.getUser(token)`.
  - Rejects unauthenticated requests (`401`).
  - Rejects `userId` mismatch attempts (`403`).
  - Derives effective user from authenticated identity for writes/reads.
- Guard applied to user-scoped routes including:
  - `src/app/api/billing/checkout/route.ts`
  - `src/app/api/billing/usage/route.ts`
  - `src/app/api/subscription/route.ts`
  - `src/app/api/telegram/status/route.ts`
  - `src/app/api/delete-user-data/route.ts`
  - `src/app/api/delete-persona/route.ts`
  - `src/app/api/list-personas/route.ts`
  - `src/app/api/save-persona/route.ts`
  - `src/app/api/edit-persona/route.ts`
  - `src/app/api/set-active-persona/route.ts`
  - `src/app/api/get-persona/route.ts`
  - `src/app/api/get-user-locale/route.ts`
  - `src/app/api/update-user-locale/route.ts`
  - `src/app/api/toggle-transparency-mode/route.ts`
  - `src/app/api/telegram-user/request-code/route.ts`
  - `src/app/api/telegram-user/verify-code/route.ts`
  - `src/app/api/instagram/auth/route.ts`
  - `src/app/api/instagram/persona-message-count/route.ts`

## Validation Notes
- TypeScript check remains blocked by existing dependency/module issues unrelated to this change set (e.g. missing `telegram`, `motion/react` typings in this environment).
- No new type errors were observed for the modified security files during targeted checks.

## Recommended Next Steps
1. Ensure frontend/API clients send bearer tokens consistently for all newly protected routes.
2. Add integration tests for IDOR prevention on persona/subscription/telegram/billing endpoints.
3. Review remaining non-user routes for rate limiting and abuse controls.
4. Document and rotate debug/admin/internal keys if these routes were previously exposed publicly.

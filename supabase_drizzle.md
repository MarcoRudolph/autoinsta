# Supabase + Drizzle on Cloudflare Workers

## Why we use Workers (not Pages)

We moved from Cloudflare Pages (`next-on-pages`) to Cloudflare Workers (`OpenNext`) because:

- Our API routes require Node runtime behavior (Drizzle + `pg` usage, server-side integrations).
- Pages Next.js pipeline enforces Edge route expectations and caused runtime/build mismatches.
- OpenNext on Workers supports our Node-style route handlers and is the intended deployment path for this app.

## Runtime model

- Framework: Next.js + OpenNext (`@opennextjs/cloudflare`)
- Deployment target: Cloudflare Workers
- Key config: `wrangler.toml`
  - `compatibility_flags = ["nodejs_compat", "nodejs_compat_populate_process_env"]`

## SSR and auth flow

- We use SSR-capable Next routes and API handlers on Workers.
- Browser auth actions should prefer server-initiated OAuth endpoints where possible.
- Google OAuth in auth form is now started via `/api/auth/login` (server route), not direct browser Supabase init.

## Database architecture

### Drizzle path (primary for worker-safe DB access)

- Central DB client in [`src/drizzle/index.ts`](./src/drizzle/index.ts)
- Connection resolution:
  - `process.env.POSTGRES_URL`
  - fallback to Cloudflare Worker bindings (`getCloudflareContext().env.POSTGRES_URL`)
- Used for webhook pipeline and custom auth table queries.

### Supabase path (existing app logic)

- Many API routes still operate on Supabase tables/client APIs.
- Server-side Supabase client creation now uses a centralized helper:
  - [`src/lib/supabase/serverClient.ts`](./src/lib/supabase/serverClient.ts)
  - [`src/lib/supabase/serverConfig.ts`](./src/lib/supabase/serverConfig.ts)
- This avoids direct `process.env.NEXT_PUBLIC_*` dependence in Worker runtime code.

## Important constraint: no service role key

- This project currently runs **without** `SUPABASE_SERVICE_ROLE_KEY`.
- Therefore, routes that need privileged DB access must use Drizzle/Postgres directly.
- We migrated `/api/register` and `/api/login` to Drizzle so they do not depend on service-role access.

## Current production schema reality (important)

These are the effective column names/types in the live DB and must match code:

- `users`
  - `id text NOT NULL` (no DB default)
  - `passwordHash`, `instaAccessToken`, `createdAt`, `updatedAt` (camelCase)
  - `stripe_customer_id`, `subscription_status`, `subscription_plan`, `subscription_start_date`, `subscription_end_date`, `is_pro` (snake_case)
- `personas`
  - `id integer` (serial), `userId uuid`, `data`, `createdAt`, `updatedAt`
- `subscriptions`
  - all stripe columns are snake_case (`subscription_id`, `user_id`, `current_period_end`, ...)
- `webhook_events`
  - snake_case (`event_id`, `object_id`, `processed_at`)

Practical consequence:
- Any Supabase route writing camelCase for `subscriptions` or `webhook_events` will fail.
- New `users` rows must explicitly set `id` in application code (e.g. UUID string), because DB does not auto-generate it.

## Environment variables

### Required in Worker runtime

- `POSTGRES_URL` (Secret)
- `NEXT_PUBLIC_SUPABASE_URL` (Plaintext)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Plaintext)
- `OPENAI_API_KEY` (Secret)
- `INSTAGRAM_*` / `META_*` webhook and OAuth values as configured

### Public vs secret

- `NEXT_PUBLIC_*` values are intentionally public.
- DB URLs, API keys, webhook secrets must be secrets.

## Known failure modes and meaning

### `@supabase/ssr: URL and API key are required`

Usually means browser bundle/runtime cannot resolve Supabase public vars.

Checks:
- Worker env contains `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy after env changes
- Prefer server-started OAuth route to avoid client-side init fragility

### `/api/register` 500

Historical causes:
- Route expected columns that do not exist (`emailVerified`, `verificationToken`...)
- Supabase env missing in Worker runtime
- `users.id` has no DB default and was not explicitly set in some flows

Current state:
- Route uses Drizzle against existing `users` schema fields and sets `id` explicitly.

### Webhook received but no DB rows

Check logs in order:
1. `/api/instagram/callback` subscription success/failure logs
2. `/api/instagram/webhook` GET verification logs
3. `/api/instagram/webhook` POST summary logs
4. `dmPipeline` persistence logs/errors

## Operational checks

1. DB connectivity:
- `GET /api/test-db`
- Expect `success: true`, `isConnected: true`

2. Webhook path:
- Use `wrangler tail` and send a real IG DM
- Confirm POST logs and `stored > 0`

3. Login/Register:
- Register via `/api/register`
- Login via `/api/login`
- OAuth via `/api/auth/login`

## Recommendation going forward

- Keep privileged/custom-auth data flows on Drizzle.
- Keep Supabase client usage centralized through helpers for Worker compatibility.
- Avoid scattering raw `process.env.NEXT_PUBLIC_*` reads in server routes.
- If future requirements need privileged Supabase Admin operations, introduce `SUPABASE_SERVICE_ROLE_KEY` explicitly and isolate its usage.

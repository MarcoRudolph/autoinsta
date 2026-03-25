# Progress Log

- 2026-03-25 18:50 UTC - Deployed Worker version `04f5e9cf-a730-45ea-949d-f26828ea324b`.
- 2026-03-25 20:02 UTC - Added central server-side auth guard coverage for userId-based endpoints (IDOR hardening).
- 2026-03-25 20:09 UTC - Removed noisy persona debug logs from runtime paths.
- 2026-03-25 20:24 UTC - Added frontend `authedFetch` helper and updated affected API calls to send Supabase bearer token automatically.
- 2026-03-25 20:24 UTC - Added API guard contract tests under `src/app/api/test-user/frontend-adjusted-api-auth.test.ts`; combined test run passed.
- 2026-03-25 20:22 UTC - Deployed Worker version `d6362496-6a99-4d81-9f0f-480736d87077` with `APP_BASE_URL`.
- 2026-03-25 20:24 UTC - Verified webhook ingest end-to-end with controlled payload; `instagram_messages` and `instagram_dm_pending` received new rows.
- 2026-03-25 20:24 UTC - Confirmed Meta dashboard sample wrapper payload (`sample.field/messages`) did not create DB rows by itself.

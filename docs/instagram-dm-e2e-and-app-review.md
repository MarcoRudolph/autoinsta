# Instagram DM E2E + App Review Checklist

This checklist verifies the full DM pipeline before Meta App Review submission.

## 1) Environment and deployment

- `SUPABASE_SERVICE_ROLE_KEY` is set in production.
- `NEXT_PUBLIC_SUPABASE_URL` is set in production.
- `OPENAI_API_KEY` is set in production.
- One of these is set: `INSTAGRAM_APP_SECRET`, `META_APP_SECRET`, or `FACEBOOK_APP_SECRET`.
- Webhook verify token env is set: `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.
- DB migrations are applied (`0008`, `0009`).

## 2) Connection and account mapping

- Connect Instagram from dashboard while logged in.
- Confirm row exists in `instagram_connections` with:
  - `ig_account_id`
  - `user_id`
  - `access_token`
  - `provider`
- Confirm `webhook_verified = true` after first webhook event.

## 3) DM ingestion and history

- Send tester DM to connected Instagram account.
- Confirm inbound row in `instagram_messages`:
  - `message_kind = dm`
  - `direction = incoming`
  - `thread_key` starts with `dm:`
- Confirm `instagram_threads` updates:
  - `incoming_message_count` increments
  - `last_incoming_at` updated

## 4) Persona-aware reply and history context

- Ensure one persona is active for the mapped `user_id`.
- Send two sequential DMs and check second response references prior context naturally.
- Confirm outbound row in `instagram_messages`:
  - `message_kind = dm`
  - `direction = outgoing`
  - outbound message has provider message id

## 5) Product link decisioning

- Proactive rule:
  - send at least 5 user DMs in one thread
  - verify one proactive link can appear
  - verify only one promo in 24h (`cooldown`)
- Situational rule:
  - ask directly for link/price/buy
  - verify situational link may appear before threshold

Audit rows should appear in `instagram_promo_audit` with `decision` and `reason`.

## 6) Evidence package for App Review

- Screencast: login/connect -> DM received -> persona reply -> promo rule behavior.
- Permission justification text for each requested scope.
- Data deletion URL and deauthorization callback URL configured and reachable.
- Privacy policy and terms URLs reachable.
- Tester account credentials and deterministic reproduction steps documented.

## 7) Suggested permission justification text

Use this wording as baseline in App Review and adapt to your final UI labels.

- `instagram_business_basic`
  - Needed to identify and map the connected professional Instagram account (`ig_account_id`) to the correct app user in our SaaS backend.
- `instagram_business_manage_messages`
  - Needed to receive and respond to Instagram Direct Messages with user-configured AI persona automation.
- `instagram_business_manage_comments` (or `instagram_manage_comments` depending on selected flow)
  - Needed to read and respond to comments when the user enables comment automation for their account.
- `pages_show_list` / `business_management` / `pages_manage_metadata` (Meta Business fallback flow only)
  - Needed only for account discovery/linking and webhook subscription management in Facebook Login for Business flow.

## 8) Structured logging checklist (for reviewer evidence)

- Show webhook ingestion counts (`events`, `stored`, `duplicates`, `processedDm`, `failedDm`).
- Show message persistence (`instagram_messages`) with `incoming` and `outgoing` rows.
- Show promo decisions (`instagram_promo_audit`) with `promo_sent` and `promo_skipped_reason`.
- Show delivery outcomes (`instagram_delivery_audit`) including retry and failure metadata.

## 9) Daily progress log

### 2026-03-21

- Goal for the day:
  - Make Instagram-login DM automation testable end-to-end without relying on Meta Business Login flow.
  - Diagnose why no webhook-triggered DM response was sent.

- What was confirmed working:
  - Instagram account connection is stored and shows `status=connected`.
  - Subscription on `/subscribed_apps` now succeeds from debug endpoint (`messages,comments` visible).
  - Token works against `graph.instagram.com/me`.
  - Manual trigger of pending processor works:
    - `POST /api/instagram/process-pending` with correct cron secret returned `{"processed":1,"failed":0,"skipped":0,"total":1}`.

- Root causes identified:
  - Token type mismatch on some Graph calls:
    - Instagram Login token can work on `graph.instagram.com` endpoints but can fail on some `graph.facebook.com` IG edges with `code 190`.
  - Processing backlog:
    - `instagram_dm_pending` had pending rows while no successful outbound delivery was recorded.
  - Cron misconfiguration/runtime mismatch:
    - Cloudflare log showed `Handler does not export a scheduled() function`.
  - Build failure in CI/Cloudflare:
    - `next build` failed because `worker-wrapper.ts` statically imported `./.open-next/worker.js` before that file existed.

- Code changes completed:
  - Added explicit dashboard state for webhook subscription failure and backend error visibility.
  - Added/extended debug routes:
    - `/api/instagram/debug-graph`
    - `/api/instagram/debug-subscribe`
    - `/api/instagram/debug-health`
  - Simplified login path to Instagram-first flow and reduced Meta Business fallback usage.
  - Updated IG subscription and relevant IG token calls to Instagram Graph host where required.
  - Added Cloudflare cron bridge worker and switched entrypoint in `wrangler.toml`.
  - Added robust error handling in `debug-health` to return structured JSON instead of surfacing as generic Worker 1101.
  - Fixed cron handler export compatibility and then fixed build pipeline by migrating wrapper from TypeScript to JS module:
    - `worker-wrapper.ts` -> `worker-wrapper.mjs`.

- Current verified state at end of day:
  - `debug-subscribe`: healthy (`postSubscribedApps.ok=true`, `verifySubscribedApps.ok=true`).
  - `process-pending` manual POST: healthy.
  - Remaining blocker for real DM E2E:
    - New incoming DMs still not confirmed in webhook ingestion logs/tables during live tests (latest inbound remained old test row in debug-health output).
    - This points to webhook delivery/app mode/tester-role constraints or webhook delivery configuration, not account connection itself.

- First checks for tomorrow:
  - Verify Cloudflare scheduled logs now show `[scheduled] process-pending response` every minute after latest deploy.
  - Run one controlled DM test from second IG account while tailing Worker logs for `/api/instagram/webhook`.
  - If no webhook POST arrives, validate Meta app mode + tester roles + webhook product subscription configuration.
  - If webhook POST arrives but no DB row appears, inspect webhook signature validation and insert path logs.

# Instagram App Review Checklist

Use this checklist before submitting `instagram_business_basic` and `instagram_business_manage_messages`.

## 1) App and Mode
- App status is `Live` (or all review test users are assigned app roles in Development).
- Privacy Policy URL is set and reachable.
- Data Deletion instructions URL is set and reachable.
- Contact email is set.

## 2) Instagram Business Login Setup
- Product: `Instagram API with Instagram Business Login` is added.
- OAuth Redirect URI includes:
  - `https://rudolpho-chat.de/api/instagram/callback`
- Client ID/Secret in runtime config match this app.

## 3) Webhooks Setup (Instagram Product Area)
- Callback URL:
  - `https://rudolpho-chat.de/api/instagram/webhook`
- Verify token exactly matches server env:
  - `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`
- Subscribed field includes:
  - `messages`
- Verify handshake succeeds in dashboard.

## 4) Runtime + DB Health
- `POSTGRES_URL` is set in Cloudflare runtime secrets.
- Latest migrations are applied in production.
- `instagram_connections`, `instagram_threads`, `instagram_messages`, `instagram_dm_pending` exist.

## 5) Functional Proof
- Connect Instagram account from dashboard.
- Enable `NEXT_PUBLIC_TEST_MODE=true`.
- Trigger `Simulate Review DM` from dashboard.
- Confirm new `incoming` row in `instagram_messages`.
- Confirm `webhook_verified=true` in `instagram_connections`.

## 6) Review Package
- Provide screencast from login to successful DM ingestion.
- Provide reviewer credentials for both:
  - Business account (connected account)
- Provide exact click-by-click steps (see `reviewer-instructions.md`).

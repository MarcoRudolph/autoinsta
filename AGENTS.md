# AGENTS.md

This file is for future agents and maintainers. It is the fastest context handoff for this repo.

## Read This First

- Full system specification: [SPEC.md](./SPEC.md)
- Security findings report: [security_best_practices_report.md](./security_best_practices_report.md)
- Instagram app-review and E2E checklist: `docs/instagram-dm-e2e-and-app-review.md`
- Telegram MTProto notes: `docs/telegram-mtproto-user.md`

## Project Summary

- Product: AI assistant for creators/influencers that automates Instagram DM replies and Telegram DM replies.
- Stack: Next.js (Node runtime route handlers), TypeScript, Drizzle ORM, PostgreSQL, Supabase auth, OpenAI completions.
- Core business flow: inbound message -> persist message + thread state -> enqueue pending work -> process pending -> generate AI reply -> send reply -> audit + billing.

## Hard Requirements

- Database schema must exist before runtime starts.
  - Instagram requires `instagram_*` tables.
  - Telegram worker requires `telegram_user_sessions` and related `telegram_*` tables.
- Required env categories:
  - DB/auth: `POSTGRES_URL`, Supabase keys.
  - AI: `OPENAI_API_KEY`.
  - Instagram: webhook verify token + app secret + IG access-token flow vars.
  - Telegram MTProto: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION_SECRET`.
  - Pending processors: `INSTAGRAM_CRON_SECRET` / `TELEGRAM_CRON_SECRET` / `CRON_SECRET`.
- Route handlers use `runtime = 'nodejs'`; do not convert critical API routes to edge without redesigning DB/network access.

## Key Learnings (Operational)

- Fly worker "started" does not mean healthy. Always verify by logs and endpoint behavior.
- Telegram worker can fail in a restart loop when DB schema is missing.
  - Symptom: `relation "telegram_user_sessions" does not exist`.
  - Effect: health endpoint eventually returns `502` because process exits.
- Worker-only images may not include migration artifacts; "run migration inside worker container" can fail. Prefer schema migration in deployment pipeline against the same `POSTGRES_URL`.
- Strict TypeScript config (`noUncheckedIndexedAccess`) can break previously valid index access. Treat `arr[0]` as nullable.

## Instagram Integration (Critical)

- Inbound:
  - `POST /api/instagram/webhook` verifies optional HMAC signature and parses both `messaging` and `changes` entries.
  - Messages/comments are normalized and written via `recordInstagramMessage`.
  - New incoming DMs are enqueued into `instagram_dm_pending`.
- Processing:
  - `POST /api/instagram/process-pending` (cron-secret protected) processes batch of pending rows.
  - Applies persona delay window and calls orchestration (`processIncomingDm`).
- Outbound:
  - Sends replies via Instagram Graph endpoint `/v23.0/{igAccountId}/messages`.
  - Records delivery success/failure in `instagram_delivery_audit`.
- Promotion controls:
  - Product links are governed by `decideProductLink` and cooldown/thread counters.
  - Audit table: `instagram_promo_audit`.

## Telegram MTProto Worker (Critical)

- This is user-account automation (GramJS), not Bot API.
- Session lifecycle:
  - Login code/request routes create encrypted session state in `telegram_user_sessions`.
  - `TELEGRAM_SESSION_SECRET` encrypts stored session string.
- Worker:
  - Entrypoint: `src/scripts/telegram-user-worker.ts`.
  - Loads all connected sessions, connects Telegram clients, listens private incoming messages, persists to `telegram_messages`, enqueues `telegram_dm_pending`.
  - Triggers `POST /api/telegram/process-pending` with cron secret.
- Pending processor:
  - `POST /api/telegram/process-pending` applies delay and runs `processIncomingTelegram`.
  - Sends reply with `gramjsSendMessageAsUser`, records outgoing message in DB.
- Health behavior:
  - Worker serves `ok` on `/` when `PORT` is set.
  - If no connected sessions it exits by design.

## Practical Validation Checklist

- Instagram:
  - Verify webhook handshake works (`GET /api/instagram/webhook` from Meta).
  - Confirm inbound rows in `instagram_messages` and pending rows in `instagram_dm_pending`.
  - Confirm outbound rows + delivery audit after processing.
- Telegram:
  - Confirm at least one `telegram_user_sessions.status = connected` row.
  - Start worker and check logs for `[telegram-worker] listening as app user ...`.
  - Send a real DM and verify `telegram_messages` incoming/outgoing + `telegram_dm_pending` transitions.

## Common Failure Modes

- 401 on process-pending: cron header does not match secret env.
- 502 on Fly app: process crash loop (often missing tables/env).
- Webhook receives events but no reply: message persisted but processor not running or blocked by delay/credits/affordability checks.
- Telegram connected but no output: missing/invalid decrypted session or not authorized session.

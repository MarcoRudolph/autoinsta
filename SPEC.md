# SPEC.md

## 1. Product Overview

Autoinsta is a multi-channel conversational automation platform for creator accounts.

Primary capabilities:
- Instagram: ingest DMs/comments from Meta webhooks, generate persona-based AI replies, send replies through Instagram Graph API.
- Telegram: connect a real Telegram user account (MTProto/GramJS), ingest private DMs via long-running worker, generate persona-based AI replies, send replies as the connected user account.

The app combines message orchestration, persona configuration, product-link decision logic, delivery auditing, and usage billing controls.

## 2. Architecture Overview

Main layers:
- Web/API app: Next.js route handlers (`runtime = 'nodejs'`).
- Data layer: PostgreSQL via Drizzle ORM.
- Worker layer: long-running Telegram MTProto worker process.
- AI layer: OpenAI chat-completion call in `personaAi`.

High-level message pipeline:
1. Ingest inbound event.
2. Normalize + persist message and thread state.
3. Enqueue pending item (`*_dm_pending`).
4. Process pending batch (secret-protected API route).
5. Build persona system prompt + history.
6. Generate AI reply with budget/plan constraints.
7. Send outbound reply through platform API.
8. Persist outbound message and audits.

## 3. Core Data Model

Instagram tables (`src/drizzle/schema/instagram.ts`):
- `instagram_connections`: account mapping (`ig_account_id` -> app `user_id`), token data, webhook status.
- `instagram_threads`: per-conversation counters and promo state.
- `instagram_messages`: normalized inbound/outbound records.
- `instagram_dm_pending`: queue for delayed processing.
- `instagram_promo_audit`: decision trail for promotion logic.
- `instagram_delivery_audit`: outbound API delivery outcomes and retry metadata.

Telegram tables (`src/drizzle/schema/telegram.ts`):
- `telegram_user_sessions`: encrypted MTProto session lifecycle per app user.
- `telegram_chat_links`: optional chat ownership/link metadata.
- `telegram_threads`: per-thread counters and promo state.
- `telegram_messages`: normalized inbound/outbound records.
- `telegram_dm_pending`: queue for delayed processing.

## 4. Instagram Specification

### 4.1 Connection and Identity

- OAuth/connect flow stores account + token in `instagram_connections`.
- `ig_account_id` is the main key used to resolve app ownership (`user_id`).

### 4.2 Webhook Ingestion

Route: `POST /api/instagram/webhook`

Behavior:
- Parses raw payload and optionally verifies `x-hub-signature-256` using one of:
  - `INSTAGRAM_APP_SECRET`
  - `META_APP_SECRET`
  - `FACEBOOK_APP_SECRET`
- Supports two inbound event shapes:
  - `entry.messaging[]` for DMs.
  - `entry.changes[]` with `field = comments` for comments.
- Maps events into normalized `StoredMessageInput`.
- Persists with idempotency guard by `platform_message_id`.
- Enqueues incoming DM rows into `instagram_dm_pending`.

Webhook verification route: `GET /api/instagram/webhook`
- Uses `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` or `META_WEBHOOK_VERIFY_TOKEN`.
- Returns raw challenge string on success.

### 4.3 Pending Processor

Route: `POST /api/instagram/process-pending`

Auth:
- Header `x-cron-secret` or bearer token must match `INSTAGRAM_CRON_SECRET` or `CRON_SECRET`.

Execution rules:
- Batch size: 10 pending rows.
- Applies persona delay bounds (`delayMin`, `delayMax`) before processing.
- Marks row state transitions: `pending` -> `processing` -> `done|failed`.
- Calls orchestration `processIncomingDm`.

### 4.4 Reply Generation and Delivery

Inside DM pipeline (`src/lib/instagram/dmPipeline.ts`):
- Resolve connected account token from `instagram_connections`.
- Build history from recent thread messages.
- Resolve active persona for app user.
- Run affordability + billing checks.
- Generate AI text reply.
- Send via Instagram Graph API endpoint:
  - `https://graph.instagram.com/v23.0/{igAccountId}/messages`
- Retry behavior on transient failures.
- Record delivery audit and outbound message rows.

### 4.5 Promotion Logic

- Uses `decideProductLink` with message count, cooldown window, and latest user text.
- Supports proactive/situational product link behavior.
- Writes decision outcomes into `instagram_promo_audit`.

## 5. Telegram Specification

### 5.1 MTProto User Account Model

- No Telegram Bot API token.
- Uses GramJS MTProto client authenticated as real Telegram user account.
- Session string is encrypted at rest with `TELEGRAM_SESSION_SECRET`.

### 5.2 Session Setup Flow

Primary routes:
- `POST /api/telegram-user/request-code`
- `POST /api/telegram-user/verify-code`

Expected result:
- `telegram_user_sessions` row becomes `status = connected` with encrypted session and Telegram identity values.

### 5.3 Long-Running Worker

Entrypoint: `src/scripts/telegram-user-worker.ts`.
Deployment image: `Dockerfile.telegram-worker`.

Behavior:
- Requires env: `POSTGRES_URL`, `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`.
- Optionally starts HTTP health server on `PORT` returning `ok`.
- Loads all connected sessions from `telegram_user_sessions`.
- For each session:
  - decrypt session
  - connect GramJS client
  - validate authorization
  - subscribe to incoming private messages
- On inbound DM:
  - normalize + store via `recordTelegramMessage`
  - enqueue row in `telegram_dm_pending`
  - trigger `POST /api/telegram/process-pending` with cron secret

Exit behavior:
- If no connected sessions are available, worker logs warning and exits.

### 5.4 Telegram Pending Processor

Route: `POST /api/telegram/process-pending`

Auth:
- Header secret must match `TELEGRAM_CRON_SECRET` or fallback (`INSTAGRAM_CRON_SECRET` / `CRON_SECRET`).

Execution rules:
- Batch size: 10.
- Delay window based on active persona.
- State transitions: `pending` -> `processing` -> `done|failed`.
- Calls `processIncomingTelegram`.

### 5.5 Telegram Reply Orchestration

Inside `src/lib/telegram/telegramPipeline.ts`:
- Load active persona and message history.
- Apply promotion decision rules for DM-private updates.
- Enforce affordability/billing checks.
- Generate AI reply.
- Send reply with `gramjsSendMessageAsUser`.
- Persist outbound message and promo state.

## 6. Persona + AI Contract

Shared persona system (`src/lib/persona/personaAi.ts`):
- Normalizes persona profile payload.
- Determines active persona per user.
- Provides delay bounds used by pending processors.
- Builds system prompt and invokes OpenAI chat completions.
- Applies output clamping by maximum reply length.

Important TypeScript detail:
- With `noUncheckedIndexedAccess`, array indexing must handle `undefined` explicitly.

## 7. Billing and Plan Constraints

Before sending replies:
- Check plan-normalized limits and affordability (`canAffordEstimatedMessage`).
- Record usage debit (`recordUsageDebit`) with token/cost metadata.
- If not affordable/debit fails, processing path exits without send.

## 8. Security and Trust Boundaries

- Process-pending routes are protected by shared secret headers.
- Instagram webhook signature verification is implemented (optional when headers/secret present).
- Telegram sessions are encrypted at rest.
- Database operations are server-side only; client does not directly handle session tokens.

## 9. Deployment and Runtime Requirements

### 9.1 Web App Runtime
- Next.js Node route handlers need environment with outbound network + PostgreSQL access.

### 9.2 Telegram Worker Runtime
- Must run as long-lived process (not short-lived serverless function).
- Requires reachable app base URL to trigger pending processing endpoint.

### 9.3 Database Migrations
- Production DB must contain all `instagram_*` and `telegram_*` tables before startup.
- Missing tables cause immediate runtime failures (notably Telegram worker startup crash).

## 10. Known Operational Pitfalls

- Fly machine can show "started" while process is crashing repeatedly.
  - Always verify logs and endpoint health.
- If worker image lacks migration artifacts, in-container migration scripts may fail.
  - Prefer running schema migration from CI/release pipeline against the production `POSTGRES_URL`.
- `502` at app URL often indicates worker crash loop, not networking issue.

## 11. Minimal Acceptance Criteria

Instagram happy path:
1. Webhook verification succeeds.
2. Incoming DM is stored and enqueued.
3. Pending processor marks row done.
4. Outbound reply is delivered and audited.

Telegram happy path:
1. User session reaches `connected`.
2. Worker logs listening for that user.
3. Incoming DM stored + enqueued.
4. Pending processor sends outbound reply and persists message.

Cross-cutting:
- Billing debit recorded for each AI reply.
- Promo decision logic is traceable in audit state.
- No unhandled process exits in healthy runtime.

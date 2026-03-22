# Telegram user account (MTProto) — no bot

The app links **your real Telegram user account** via [GramJS](https://gram.js.org/) (MTProto). There is **no** BotFather token, **no** `t.me/bot` redirect, and **no** Telegram bot webhook.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_API_ID` | From [my.telegram.org](https://my.telegram.org) |
| `TELEGRAM_API_HASH` | Same |
| `TELEGRAM_SESSION_SECRET` | Min 16 chars; encrypts stored MTProto session strings in Postgres |
| `POSTGRES_URL` | Database (also used by Drizzle) |
| Worker: `APP_BASE_URL` | Public URL of the Next app (for triggering `/api/telegram/process-pending`) |
| Worker: `TELEGRAM_CRON_SECRET` or `CRON_SECRET` | Same secret the cron route expects |

## Flow

1. Dashboard: user enters **@username** (validated format) and **phone** → `POST /api/telegram-user/request-code`.
2. User enters **SMS/Telegram code** → `POST /api/telegram-user/verify-code` → encrypted session saved in `telegram_user_sessions`.
3. **Worker** (`npm run telegram:worker`): long-lived process that loads all `connected` sessions, listens for private DMs, inserts `telegram_dm_pending`, then calls `POST /api/telegram/process-pending` with the cron secret.
4. Replies are sent with the same session via `gramjsSendMessageAsUser` inside `processIncomingTelegram`.

## Migrations

Apply `0015_telegram_user_sessions_mtproto.sql` (drops bot link tables, adds `telegram_user_sessions`). Run `npm run db:migrate` against your database.

## GitHub Actions workflows — do you need them?

**No**, not for Telegram specifically. Workflows under `.github/workflows/` are optional automation (CI, scheduled jobs, deploy). Your earlier `git push` failed because some GitHub tokens are not allowed to **modify workflow files** without extra OAuth scope (`workflow`). That is a **permission** issue, not a product requirement. You can push from a machine with SSH or a PAT that includes `workflow`, or avoid committing workflow changes.

## RLS (Row Level Security) — what it means for this app

**RLS** is a Postgres + Supabase feature: *even if someone has your database URL or anon key*, **policies** decide which rows they may read/write. “Calling it out” means: if the browser or a mobile client ever used the **Supabase anon key** to query `telegram_user_sessions`, you would need strict RLS so users only see **their** row. Today this app uses **server-side Drizzle** with a privileged connection string; the Telegram session table is only touched from **trusted API routes and the worker**. RLS is still recommended on Supabase for defense in depth if tables are exposed to PostgREST.

## Limitations

- **2FA (password)**: not implemented in `verify-code`; accounts with 2FA may need a follow-up flow.
- **Telegram ToS**: user-account automation can risk limits or bans; use conservatively.
- **Worker hosting**: must run on a **long-lived** host (VPS, Fly, Railway), not serverless-only.

# Telegram Bot API & Mini Apps — condensed reference

**Sources:** Official documentation at [Telegram Bot API](https://core.telegram.org/bots/api), [Mini Apps](https://core.telegram.org/bots/webapps), and [Login Widget](https://core.telegram.org/widgets/login). This file summarizes parts that matter for server-side bots, webhooks, and secure linking — not a full API copy.

**Context7 MCP:** A `resolve-library-id` / `query-docs` call was attempted via the configured Context7 MCP server; it failed with an invalid API key (`ctx7sk…`). Re-fetch documentation with Context7 after fixing the key in Cursor MCP settings if you want indexed, versioned snippets there.

---

## Bot token and making requests

- Each bot has a unique token from [@BotFather](https://t.me/botfather). **Keep it only on the server** — never embed in browser bundles or Mini App front ends for Bot API calls.
- **HTTPS only:** `https://api.telegram.org/bot<token>/<METHOD_NAME>`
- **Parameters:** GET/POST; query string, `application/x-www-form-urlencoded`, `application/json` (not for file upload), or `multipart/form-data` for files.
- **Response:** JSON with `ok` (boolean), optional `description`, `result` on success; on failure `error_code` and optional `parameters` (`ResponseParameters`).

See: [Making requests](https://core.telegram.org/bots/api#making-requests).

### Flood control / rate limits

- Error responses may include `parameters.retry_after` (**seconds** to wait before retrying) when flood limits are exceeded. Clients should back off and respect this value.

See: [ResponseParameters](https://core.telegram.org/bots/api#responseparameters).

### Optional: local Bot API server

- Open-source server allows larger uploads, different webhook URLs/ports, etc. Most bots use `api.telegram.org` only.

See: [Local Bot API Server](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

---

## Getting updates

Two **mutually exclusive** mechanisms:

1. **`getUpdates`** — long polling.
2. **`setWebhook`** — Telegram POSTs JSON `Update` to your URL.

- Updates are stored **up to 24 hours** until delivered.
- While a webhook is set, **`getUpdates` does not work**.

### `Update` (at most one optional field per update)

Relevant fields for typical bots:

| Field | Use |
| --- | --- |
| `message` | New message in private / group / supergroup |
| `edited_message` | Edited message |
| `channel_post` | New post in a **channel** (bot must be able to receive it per Telegram rules) |
| `edited_channel_post` | Edited channel post |
| `callback_query` | Inline keyboard callbacks |
| `message_reaction` / `message_reaction_count` | Reactions — must be listed in `allowed_updates` and bot often must be admin |

Full list: [Update](https://core.telegram.org/bots/api#update).

### `allowed_updates`

- Filter which update types you receive (e.g. only `message`, `channel_post`, `callback_query`).
- Default behavior and exclusions are defined in the official docs for `getUpdates` / `setWebhook` (some types like `chat_member` / `message_reaction` are not included unless you ask).

### Webhook setup

- **`setWebhook`:** `url` (HTTPS; empty string removes webhook).
- **`secret_token`:** If set, Telegram sends header **`X-Telegram-Bot-Api-Secret-Token`** on each request — verify it matches to ensure the call is for your webhook. Allowed characters: `A–Z`, `a–z`, `0–9`, `_`, `-`; length 1–256.
- **Ports:** 443, 80, 88, 8443.
- Non-2xx responses lead to **retries**; answer quickly and offload heavy work.
- **`getWebhookInfo`:** pending count, last error, etc.

See: [setWebhook](https://core.telegram.org/bots/api#setwebhook), [webhooks guide](https://core.telegram.org/bots/webhooks).

### Answering a webhook with a Bot API method

- You can include a Bot API call in the webhook response (see “Making requests when getting updates” in the official docs); you do not get a reliable result body for that nested call.

---

## Telegram Login Widget (website, not Mini App)

- Link domain to bot: **`/setdomain`** in BotFather.
- After login, data includes `id`, `first_name`, …, `auth_date`, **`hash`**.
- **Verification:** Build `data_check_string` = all received fields except `hash`, sorted by key, each as `key=<value>` separated by `\n`. Then:

  - `secret_key = SHA256(bot_token)` (SHA-256 hash of the token, used as HMAC key material per Telegram’s login widget spec)
  - Compare `hash` to **hex(HMAC-SHA-256(data_check_string, secret_key))**
- Check **`auth_date`** to reject stale payloads.

See: [Checking authorization](https://core.telegram.org/widgets/login#checking-authorization).

---

## Mini Apps (Web Apps) — `initData` and security

### Client objects

- **`Telegram.WebApp.initData`** — raw query string; **validate on your server** before trusting.
- **`Telegram.WebApp.initDataUnsafe`** — parsed object; **do not trust** for security decisions.

### Server-side validation (bot knows token)

Send **`initData`** to your backend. Verify **`hash`**:

- `data_check_string` = all received fields **except `hash`**, sorted alphabetically, `key=value` lines joined with `\n`.
- `secret_key = HMAC_SHA256(bot_token, key="WebAppData")` (HMAC-SHA-256 with key `"WebAppData"` and message = bot token — as in the official docs).
- Compare `hash` to **hex(HMAC_SHA256(data_check_string, secret_key))**.
- Validate **`auth_date`** (Unix time) to limit replay window.

### Third-party validation without bot token

- Docs describe validating a **`signature`** field with **Ed25519** and Telegram-published public keys (test vs production). Use when sharing `initData` with another service that must not hold your token.

See: [Validating data received via the Mini App](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).

### `sendData`

- **`Telegram.WebApp.sendData(data)`** sends up to **4096** bytes to the bot as a service message and **closes the Mini App**. Only for Mini Apps opened via a **keyboard button**. Not a general-purpose streaming channel — use normal HTTPS to your backend for ongoing flows.

See: [sendData](https://core.telegram.org/bots/webapps#initializing-mini-apps).

### Other notes

- **`openLink`** is tied to user gesture rules in the docs; **`openTelegramLink`** opens inside Telegram.
- Large ID values: use **64-bit integers or double** where the docs warn about >32-bit IDs.

---

## Practical checklist for this repo

1. **Token + Bot API:** only in server env / secret store; all sends from API routes or workers.
2. **Webhook:** HTTPS URL, verify **`X-Telegram-Bot-Api-Secret-Token`**, return 2xx fast.
3. **Identity:** Login Widget hash and/or **validated `initData`**; never trust client-only user JSON.
4. **Throughput:** queue sends; handle **`retry_after`** on 429 / flood errors.
5. **Routing:** branch on `channel_post` vs `message` and `chat.type` for DM vs group/supergroup.

---

## Changelog

- **2026-03-22:** Initial extract from official pages (Context7 unavailable). Re-sync with [Bot API changelog](https://core.telegram.org/bots/api-changelog) when upgrading behavior.

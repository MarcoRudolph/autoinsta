# Test Account Setup Runbook (Meta + Instagram)

This cannot be automated from code. Execute these steps in Meta dashboard.

## 1) Prepare Two Instagram Accounts
- Account A: Instagram Professional account (Business/Creator) to connect in app.
- Account B: Normal sender account to send DM to Account A.

## 2) Add App Roles (if app is not fully approved/live for all users)
- Meta App Dashboard -> Roles.
- Add required test users (Developer/Tester) for both accounts as needed.
- Accept role invites from invited Facebook users.

## 3) Configure Instagram Business Login
- Meta App Dashboard -> Instagram API with Instagram Business Login.
- Ensure OAuth Redirect URI includes:
  - `https://rudolpho-chat.de/api/instagram/callback`

## 4) Configure Webhooks (Instagram Product Area)
- Callback URL:
  - `https://rudolpho-chat.de/api/instagram/webhook`
- Verify token:
  - value must match `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` on server.
- Subscribe to field:
  - `messages`

## 5) Connect in App
- Log in at `https://rudolpho-chat.de`.
- Open dashboard and connect Account A via Instagram login.

## 6) Review-Safe Test Flow (works without live webhook delivery)
- Enable `NEXT_PUBLIC_TEST_MODE=true` in app runtime/build env.
- Log in to `https://rudolpho-chat.de`.
- Connect Account A in the dashboard.
- Click `Simulate Review DM` in the dashboard.

## 7) Verify Ingestion
- Check DB:
```sql
select platform_message_id, ig_account_id, message_kind, direction, message_text, created_at
from instagram_messages
order by created_at desc
limit 20;
```
- Expected:
  - new row with `message_kind='dm'` and `direction='incoming'`
  - `platform_message_id` starts with `review_test_`
  - `message_text` is `review test dm`

## 8) Test Mode (UI)
- Set `NEXT_PUBLIC_TEST_MODE=true` in runtime/build env.
- In dashboard, the childhood attribute `sexuality` is hidden in test mode.
- In dashboard, a `Simulate Review DM` button is shown after Instagram is connected.

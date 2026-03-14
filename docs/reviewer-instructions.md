# Reviewer Instructions (EN + DE)

## English Template (paste into Meta App Review)
App URL: `https://rudolpho-chat.de`

Purpose:
This app connects an Instagram professional account and automatically processes incoming DM webhook events for message automation.

Test Accounts:
- Business account (to connect): `<BUSINESS_USERNAME>`
- Sender account (to send DM): `<SENDER_USERNAME>`
- Credentials are provided in the reviewer notes.

Steps:
1. Open `https://rudolpho-chat.de` and sign in with the provided app account.
2. Go to Dashboard and click `Connect Instagram`.
3. Authorize Instagram Business Login for the provided business account.
4. Return to dashboard and confirm Instagram is connected.
5. From the sender test account, send a DM to the connected business account.
6. Wait up to 30 seconds for webhook delivery.
7. Verify the app processed the incoming message (dashboard/status and backend logging evidence supplied in screencast).

Requested Permissions:
- `instagram_business_basic`
- `instagram_business_manage_messages`

Notes:
- Webhook callback is configured in Instagram product settings.
- Endpoint validates webhook signature and processes `messages` events.

## Deutsche Vorlage (intern)
App-URL: `https://rudolpho-chat.de`

Zweck:
Die App verbindet ein Instagram Business-Konto und verarbeitet eingehende DM-Webhook-Events fuer die Automatisierung.

Testkonten:
- Business-Konto (zum Verbinden): `<BUSINESS_USERNAME>`
- Sender-Konto (zum DM senden): `<SENDER_USERNAME>`
- Zugangsdaten in den Reviewer-Notizen.

Schritte:
1. `https://rudolpho-chat.de` oeffnen und mit dem bereitgestellten App-Konto anmelden.
2. Im Dashboard `Connect Instagram` klicken.
3. Instagram Business Login mit dem bereitgestellten Business-Konto autorisieren.
4. Zurueck im Dashboard pruefen, dass Instagram verbunden ist.
5. Mit dem Sender-Testkonto eine DM an das verbundene Business-Konto senden.
6. Bis zu 30 Sekunden auf Webhook-Zustellung warten.
7. Pruefen, dass die App die eingehende Nachricht verarbeitet hat (Screencast/Logs als Nachweis).

# Meta Business Integration (Instagram DM/Comments) - Projektleitfaden

Dieses Dokument fasst zusammen, was wir fuer unser Ziel brauchen:
- Instagram-Konten von Endnutzern mit unserer App verbinden
- DMs/Kommentare per API verarbeiten
- Produktlinks (`proactive`/`situational`) kontrolliert in laufende Chats integrieren

Es basiert auf aktueller Recherche ueber Perplexity plus Abgleich mit offiziellen Meta-Dokumentationsseiten.

## 1) Ist-Stand im Projekt

Bereits vorhanden:
- Persona-Editor speichert `productLinks` mit `url`, `actionType` (`buy`/`follow`/`subscribe`) und `sendingBehavior` (`proactive`/`situational`).
- Persona-APIs lesen/schreiben die Daten.
- Transparency Mode ist in Persona-Daten enthalten.

Noch nicht vorhanden:
- Kein produktiver Instagram DM/Comment Runtime-Flow (Webhook Ingest + Reply Orchestrierung).
- Kein finaler Multi-Tenant Account-Linking-Flow fuer Kundenkonten.
- Keine persistente Conversation-State-Logik fuer "nach N Nachrichten proaktiv empfehlen".

## 2) Wichtige Meta-Entscheidung: Login-Variante

Meta bietet zwei relevante Wege:

1. Instagram API mit Instagram Login  
   - Neuere Richtung (laut Messenger Platform/Instagram Messaging Doku).
   - Professionelle IG Accounts (Business/Creator) koennen ohne zwingende Page-Verknuepfung unterstuetzt werden.

2. Instagram API mit Facebook Login for Business  
   - Klassischer Weg mit Facebook-Page-Verknuepfung.
   - In vielen bestehenden Integrationen weiterhin genutzt.

Empfehlung:
- Primaer auf "Instagram Login" ausrichten.
- "Facebook Login for Business" als Fallback/Migrationspfad dokumentiert behalten.

## 3) Produkte im Meta Developer Dashboard

Fuer unser Vorhaben:
- Instagram Platform / Instagram Graph API
- Messenger Platform (Instagram Messaging)
- Webhooks

Hinweis:
- App-Typ und Kategorie sind wichtig, aber nicht allein entscheidend.  
  Entscheidend ist, welche Features/Permissions aktiviert und fuer Advanced Access/App Review freigegeben sind.

## 4) Berechtigungen (Scopes/Permissions)

Mindestens relevant fuer Instagram Messaging Setup:
- `instagram_basic`
- `instagram_manage_messages`
- `pages_manage_metadata`
- `pages_show_list` (in manchen Quellen faelschlich ohne Unterstrich geschrieben)
- `business_management`

Fuer Kommentar-Use-Cases zusaetzlich je nach Endpoint:
- `instagram_manage_comments`
- und ggf. weitere, abhaengig von konkreten Calls

Wichtig:
- Im Development/Standard Access funktionieren viele Flows nur mit Testern/App-Rollen.
- Fuer echte Kundenkonten braucht ihr i. d. R. Advanced Access + App Review.

## 5) Webhooks und Event-Ingest

Wir brauchen einen stabilen Webhook-Ingest fuer:
- Instagram Messaging Events (DMs)
- Kommentar-Events (je nach Feature-Nutzung)

Technische Anforderungen:
- HTTPS Callback URL
- Verify Token Handshake korrekt beantworten
- Idempotente Event-Verarbeitung (Retries kommen vor)
- Event-Signatur/Origin pruefen (Security)

Empfohlene Persistenz pro Event:
- `tenantId`
- `igAccountId` (oder Page/Account Mapping)
- `conversationId`/`threadId`
- `messageId`
- `senderId`, `recipientId`
- `eventType`, `timestamp`
- raw payload (audit/debug)

## 6) Multi-Tenant Account Linking (SaaS)

Ziel: Eingehende Events eindeutig einem App-User/Tenant zuordnen.

Speichern pro Verbindung:
- `tenantId`
- `metaAppId`
- `igAccountId` (Business/Creator)
- optional `fbPageId` (falls Facebook-Business-Flow)
- token(s) + expiry + status
- `connectedByUserId`
- `permissionsGranted`
- `lastHealthCheckAt`

Token-Lifecycle:
- Ablaufdaten aktiv ueberwachen
- Reconnect-Flow sauber anbieten
- Bei Permission-Verlust/Token-Invalidierung Integration auf `needs_reconnect` setzen

## 7) Proactive Product Link Strategie (deine Vorgabe)

Dein Ziel:
- Nicht random spammen
- In laufender Unterhaltung proaktiv empfehlen
- Beispiel: nach ca. 5 Nachrichten in einem passenden Verlauf

Empfohlene Entscheidungsregeln:
- Trigger nur, wenn:
  - Persona aktiv
  - mindestens ein `productLink` mit `sendingBehavior = proactive`
  - `messageCount >= 5`
  - kein Promo-Link bereits im aktiven Conversation-Window gesendet
- Zusatzeinschraenkungen:
  - max. 1 proactive Promo pro Thread-Window (z. B. 24h oder bis Inaktivitaet)
  - Mindestabstand zwischen Promos
  - harte Daily Caps pro Tenant/Account
  - Skip bei sensiblen/Support-lastigen Themen

Empfohlene Formulierung (soft, nicht pushy):
- "Wenn du mich unterstuetzen moechtest, kannst du dir mein neues Bild hier anschauen: <link>"

`situational` Verhalten:
- Nur bei konkreter Nutzerintention (Frage nach Empfehlung, Produkt, Preis, Link etc.)

## 8) Compliance/Policy Guardrails (wichtig)

Fuer automatisierte Experiences:
- Offenlegung, dass ein Bot/automatisiertes System antwortet, wenn rechtlich erforderlich oder als Best Practice.
- 24h Messaging Window beachten (Instagram Messaging Kontext).
- Eskalationspfad zu menschlichem Agenten vorsehen.
- Opt-out respektieren (z. B. "STOP"/"Keine Empfehlungen mehr").

Risiko senken:
- Keine Massen-Identical-Messages
- Keine unaufgeforderte Promotion ausserhalb sinnvoller Conversation-Logik
- Logging fuer `promo_sent`, `promo_skipped_reason`, `policy_guardrail_triggered`

## 9) Konkrete To-do Reihenfolge fuer uns

1. Account Linking finalisieren (Meta OAuth + Verbindung in DB speichern)
2. Webhook Endpoint(s) bauen und verifizieren
3. Conversation State Tabellen + Service bauen
4. Decision Engine fuer `proactive`/`situational` implementieren
5. Prompt Builder (Persona + Transparency + optional Product Promo)
6. Outbound Reply Pipeline anbinden
7. Guardrails + Monitoring + Tests

## 10) Definition of Done fuer Integration

- Konto-Connect fuer reale Kundenkonten funktioniert stabil.
- DMs/Kommentare werden empfangen und tenant-sicher verarbeitet.
- Proactive Product Link wird erst nach Schwellwert (z. B. 5 Nachrichten) und nur einmal pro Window gesendet.
- Situational Links werden nicht proaktiv versendet.
- Transparenzmodus fliesst in Prompt/Antwortverhalten ein.
- Vollstaendige Auditierbarkeit fuer Entscheidungen und gesendete Promotionen.

## 11) Offizielle Meta-Doku (Startpunkte)

- Instagram Platform Overview:  
  https://developers.facebook.com/docs/instagram-platform/
- Instagram Webhooks:  
  https://developers.facebook.com/docs/instagram-platform/webhooks/
- Messenger Platform - Instagram Messaging (Features/Requirements):  
  https://developers.facebook.com/docs/messenger-platform/instagram/features
- Messenger Platform Policy & Usage Guidelines:  
  https://developers.facebook.com/docs/messenger-platform/policy
- Messenger/Instagram App Review Hinweise:  
  https://developers.facebook.com/docs/messenger-platform/instagram/app-review/

Hinweis:
- Meta aendert Flows und Requirements regelmaessig. Vor Go-Live jeden Permission-Namen und jeden Endpoint in der aktuellen offiziellen Doku gegenpruefen.

# Meta App Review Preparation Strategy

## Purpose
Prepare this Influencer DM Assistant for Meta App Review, Data Use Checkup, and privacy review with clear controls, evidence, and operational procedures.

## App Context
- Product: Influencer Instagram DM assistant
- Flow: User sends DM -> webhook receives message -> AI generates response -> reply is sent via Instagram API
- Main review risk areas:
- Messaging compliance
- User consent
- Data privacy / data lifecycle
- Avoiding impersonation

## What We Must Demonstrate to Meta
- Test Instagram account credentials/details for reviewer testing
- Test conversation examples
- Screencast showing full message flow end-to-end
- Clear policy and technical controls that prevent unsafe use

## Explicit Safety Requirements (From Product Policy)
The assistant must avoid generating or assisting with:
- Sexual content
- Medical advice
- Automated cold outreach
- Financial advice
- Pretending to be a human
- Illegal activities

## Compliance Strategy

### 1) Messaging Compliance Guardrails
- Add explicit prohibited-use rules in the AI system prompt and policy layer.
- Add input/output moderation checks before sending replies.
- Block or safe-complete messages that violate policy.
- Log policy decisions with reason codes (without logging excessive PII).

Implementation requirements:
- Policy categories:
- sexual_content
- medical_advice
- automated_cold_outreach
- financial_advice
- impersonation
- illegal_activity
- Enforcement actions:
- block
- ask-for-clarification
- safe-redirection
- escalate-to-human

Evidence to provide:
- Policy spec document
- Screenshots/logs of blocked examples per category
- Test transcript demonstrating refusal/safe handling

### 2) Anti-Impersonation Controls
- Keep AI transparency enabled in message behavior.
- Require that replies naturally disclose AI-assistant status.
- Remove or hide any UI control that could disable disclosure during review.
- Include this behavior in test conversation and screencast.

Evidence to provide:
- Prompt/config snippet proving disclosure instruction
- Transcript lines showing disclosure behavior

### 3) User Consent and Account Authorization
- Only process DMs for users who explicitly connected Instagram and enabled automation.
- Store consent state with timestamps (connected_at, consent_granted_at, consent_revoked_at).
- Provide an easy in-app off switch (disconnect/disable assistant).
- Do not process messages when consent is revoked.

Evidence to provide:
- Consent UX screenshots
- DB fields/schema for consent state
- Test showing disable path stops automation

### 4) Data Privacy and Data Lifecycle
- Explain why DMs are processed:
- To generate contextual replies for the account owner who enabled automation.
- Store only minimum data required for functionality and auditability.
- Secure storage:
- Encrypted in transit (HTTPS/webhook signatures)
- Encrypted at rest (DB provider defaults + access controls)
- Restrict internal access and use least privilege for service credentials
- Retention/deletion:
- Define retention window for DM content and logs
- Auto-delete when no longer needed
- Immediate deletion when user disconnects or requests deletion (where applicable)

Evidence to provide:
- Data flow diagram
- Retention/deletion policy
- Deletion job implementation proof (code + run logs)
- Privacy policy text aligned with actual behavior

## App Review Artifacts Checklist

### A) Test Instagram Account
- Create a dedicated reviewer-safe IG test account.
- Ensure app has permissions/scopes needed for DM flow only.
- Provide stable credentials/contact path per Meta instructions.

### B) Test Conversation Pack
- Build scripted conversations:
- Normal compliant DM -> compliant AI response
- Each disallowed category -> refusal/safe response
- Include timestamps and webhook/event IDs where possible.

### C) Screencast (Required)
Record one clear video that shows:
1. Incoming DM from test user
2. Webhook receipt in app logs/dashboard
3. AI generation step
4. Outbound message sent via Instagram API
5. Final DM visible in Instagram inbox

Recommended overlays in video:
- Request IDs / event IDs
- Policy decision label
- "AI assistant disclosure active" indicator

## Data Use Checkup / Privacy Review Narrative (Draft)
Use this wording as a baseline:
- We process Instagram DMs only to provide the user-enabled auto-reply assistant feature.
- We process only data needed to generate and deliver replies and maintain service reliability and abuse prevention.
- We protect data in transit and at rest and restrict access by role.
- We retain DM data only as long as necessary for feature operation, debugging, and compliance, then delete it per retention schedule.
- Users can disable automation and request deletion, after which processing stops and related data is deleted according to policy.
- The assistant is designed not to impersonate humans and includes AI disclosure behavior.

## Engineering TODO Plan

### P0 (Must complete before submission)
- [ ] Finalize policy engine for all prohibited categories.
- [ ] Add moderation gate before outbound API send.
- [ ] Ensure impersonation prevention is always-on in runtime prompts.
- [ ] Confirm transparency toggle is hidden in UI for review build.
- [ ] Implement consent state tracking and enforcement checks.
- [ ] Publish retention/deletion policy with exact time windows.
- [ ] Implement deletion workflow for disconnected/deleted users.
- [ ] Produce screencast with full message flow.
- [ ] Prepare reviewer test account + scripted conversation.

### P1 (Strongly recommended)
- [ ] Add structured audit logs: webhook_received, ai_generated, policy_checked, api_sent.
- [ ] Add policy violation dashboard/report for internal monitoring.
- [ ] Add runbook for reviewer support (who responds, where logs are found).
- [ ] Add explicit privacy policy section for Instagram DM processing.

### P2 (Nice to have)
- [ ] Add automated compliance test suite with fixtures per prohibited category.
- [ ] Add one-click export of review evidence package.

## Suggested Evidence Folder Structure
Use a single location to keep review artifacts ready:

`docs/meta-app-review/`
- `overview.md`
- `policy-controls.md`
- `consent-flow.md`
- `data-flow-diagram.png`
- `retention-and-deletion.md`
- `test-account.md`
- `test-conversations.md`
- `screencast-link.md`
- `logs-samples/`

## Review Readiness Gate (Go/No-Go)
Only submit to Meta when all conditions are true:
- [ ] All P0 tasks completed
- [ ] End-to-end test flow reproducible in staging/production-like env
- [ ] Screencast and transcripts match real current behavior
- [ ] Privacy policy and in-app behavior are consistent
- [ ] Team can answer reviewer follow-up questions within 24h

## Owner and Tracking
- Document owner: (assign name)
- Last updated: (set date)
- Submission target date: (set date)
- Tracking issue/board: (link)

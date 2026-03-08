# Consent and Authorization Flow

## Principle
Process Instagram DMs only for users who explicitly connected their account and enabled automation.

## Required States
- `connected`: Instagram account is connected
- `consent_granted`: user authorized DM automation
- `consent_revoked`: user disabled automation or disconnected

## Enforcement Rules
- If consent is not granted, do not process DMs for auto-reply.
- If consent is revoked, immediately stop processing and queue deletion tasks.
- All outbound sends require active consent at send time.

## UX Evidence Checklist
- [ ] Connect Instagram step screenshot
- [ ] Consent/enable automation step screenshot
- [ ] Disable/disconnect step screenshot
- [ ] UI copy clearly explaining automation behavior

## Backend Evidence Checklist
- [ ] Consent fields stored with timestamps
- [ ] Runtime guard verifies consent before response generation
- [ ] Runtime guard verifies consent before API send
- [ ] Revocation path tested end-to-end

## Reviewer Narrative (Draft)
- Users opt in by connecting Instagram and enabling automation.
- Users can revoke consent at any time.
- Once revoked, automated DM processing and sending stop.

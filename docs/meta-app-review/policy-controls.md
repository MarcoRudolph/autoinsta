# Policy Controls

## Prohibited Categories
The assistant must refuse or safely handle:
- Sexual content
- Medical advice
- Automated cold outreach
- Financial advice
- Pretending to be a human
- Illegal activities

## Enforcement Design
- Stage 1: Inbound policy check on user DM intent
- Stage 2: AI output policy check before send
- Stage 3: Block/safe-complete/escalate decision
- Stage 4: Audit log with reason code

## Reason Codes
- `sexual_content`
- `medical_advice`
- `automated_cold_outreach`
- `financial_advice`
- `impersonation`
- `illegal_activity`

## Expected Behaviors
- Block: Do not send unsafe output
- Safe completion: Send compliant alternative guidance
- Escalate: Mark for manual handling when uncertain

## AI Disclosure Requirement
- Always disclose AI-assistant identity naturally in replies.
- No response may imply the assistant is a human.

## Test Matrix
- [ ] Sexual content test captured
- [ ] Medical advice test captured
- [ ] Cold outreach test captured
- [ ] Financial advice test captured
- [ ] Impersonation test captured
- [ ] Illegal activity test captured

## Evidence to Attach
- Prompt/policy configuration snippets
- Logs with reason codes
- Conversation screenshots/transcripts

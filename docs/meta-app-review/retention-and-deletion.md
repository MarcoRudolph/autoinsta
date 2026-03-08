# Retention and Deletion

## Why We Process DMs
- To generate contextual replies for users who enabled the influencer DM assistant.
- To provide reliability, abuse prevention, and troubleshooting.

## Data Minimization
- Store only what is necessary for:
- Message processing
- Delivery verification
- Compliance/audit trails

## Security Controls
- HTTPS for all inbound/outbound API traffic
- Webhook authenticity/signature verification
- Encryption at rest via managed database/storage controls
- Role-based access for internal tooling and services

## Retention Policy
- DM content retention window: `TBD`
- Operational logs retention window: `TBD`
- Policy/audit logs retention window: `TBD`

## Deletion Triggers
- User disconnects Instagram
- User revokes consent
- User requests account/data deletion
- Retention TTL expiry

## Deletion Implementation Checklist
- [ ] Automated deletion job configured
- [ ] Manual deletion path documented
- [ ] Deletion verification logs available
- [ ] Backups/replicas deletion posture documented

## Evidence to Attach
- Data flow diagram (`data-flow-diagram.png`)
- Deletion job code reference
- Execution logs proving deletion
- Privacy policy excerpt matching behavior

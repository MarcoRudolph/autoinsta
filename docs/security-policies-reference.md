# Security Policies Quick Reference

## 🚨 Critical Security Issue Fixed

**Problem**: RLS (Row Level Security) was disabled on all tables, making data accessible to anyone with database access.

**Solution**: Enabled RLS and implemented proper access control policies.

## 📋 Table Security Status

| Table | RLS Status | User Access | Service Role |
|-------|------------|-------------|--------------|
| `users` | ✅ Enabled | Own data only | Full access |
| `personas` | ✅ Enabled | Own data only | Full access |
| `subscriptions` | ✅ Enabled | Own data only | Full access |
| `webhook_events` | ✅ Enabled | Read only | Full access |

## 🔐 Policy Summary

### Users Table
- **SELECT**: `auth.uid()::text = id`
- **UPDATE**: `auth.uid()::text = id`
- **INSERT**: `auth.uid()::text = id`
- **DELETE**: ❌ Disabled

### Personas Table
- **SELECT**: `auth.uid()::text = userId::text`
- **UPDATE**: `auth.uid()::text = userId::text`
- **INSERT**: `auth.uid()::text = userId::text`
- **DELETE**: `auth.uid()::text = userId::text`

### Subscriptions Table
- **SELECT**: `auth.uid()::text = user_id`
- **UPDATE**: `auth.uid()::text = user_id`
- **INSERT**: `auth.uid()::text = user_id`
- **DELETE**: ❌ Disabled

### Webhook Events Table
- **SELECT**: `auth.role() = 'authenticated'`
- **ALL**: `auth.role() = 'service_role'`

## 🚀 Quick Actions

### Apply Security Migration
```bash
node scripts/apply-rls-security.js
```

### Verify in Supabase Dashboard
1. Go to **Database > Policies**
2. Check RLS is enabled on all tables
3. Verify policies are configured

### Test Security
```sql
-- Should only return user's own data
SELECT * FROM users WHERE id = auth.uid();

-- Should return empty for other users
SELECT * FROM users WHERE id != auth.uid();
```

## ⚠️ Important Notes

- **Service Role**: Required for webhooks and admin operations
- **User Context**: All queries must include `auth.uid()` check
- **Testing**: Verify policies work before deploying to production
- **Monitoring**: Watch for policy violations in logs

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Row not found" | Check RLS policies and user context |
| Webhook failures | Verify service role permissions |
| Admin operations fail | Check service role configuration |

---

**Remember**: RLS is now **ENABLED** - test thoroughly before production deployment!



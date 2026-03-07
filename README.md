# Boost Your Date
AI-powered dating profile optimization and Instagram automation

## 🔒 Security Status

**Row Level Security (RLS)**: ✅ **ENABLED** - All database tables are now properly secured with user isolation policies.

**Recent Security Fixes**:
- Fixed critical RLS vulnerabilities identified by Supabase
- Implemented proper access controls for all tables
- Users can only access their own data
- Service role properly configured for webhooks and admin operations

**Security Documentation**: See [Security Implementation Guide](docs/security-implementation.md) and [Quick Reference](docs/security-policies-reference.md)

## Deployment

This project is configured for Node runtime deployment on Cloudflare Workers via OpenNext.

### Cloudflare Workers (Node Runtime)

1. **Install dependencies**
   - `npm install`

2. **Build for Cloudflare**
   - `npm run cf:build`

3. **Preview locally with Wrangler**
   - `npm run cf:preview`

4. **Deploy to Cloudflare Workers**
   - `npm run deploy:cloudflare`

5. **Environment Variables**:
   Configure these variables in Cloudflare:
   - `POSTGRES_URL`: Your database connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Important runtime note

Instagram API routes use `runtime = 'nodejs'` with Drizzle + `pg`.  
Cloudflare Workers via `@opennextjs/cloudflare` supports Node runtime route handlers.  
Instagram routes such as `/api/instagram/callback`, `/api/instagram/persona-message-count`, and `/api/instagram/webhook` stay on `runtime = 'nodejs'`.

### Local Development

```bash
npm install
npm run dev
```

### Environment Variables

Required environment variables:
- `POSTGRES_URL`: Your PostgreSQL database connection string
- `OPENAI_API_KEY`: Your OpenAI API key for persona generation
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

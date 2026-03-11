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

### Do not deploy this app with Cloudflare Pages

This app uses Node route handlers (`runtime = 'nodejs'`) for Drizzle + `pg`.
Cloudflare Pages uses `next-on-pages`, which only supports Edge route handlers for Next.js routes.
If a Pages build is triggered, the build now fails fast with a clear message via `scripts/ensure-cloudflare-workers.js`.

5. **Environment Variables** (critical for runtime):

   Cloudflare has two separate scopes. **Build variables** (Settings > Build) are only available during `npm run build` and are **not** available when API routes run.

   You must add **Runtime variables** under:
   **Workers & Pages → rudolpho-chat → Settings → Variables and Secrets**

   Add as **Encrypted Secret**:
   - `POSTGRES_URL`: Your database connection string (required for Instagram callback, persona-message-count, etc.)
   - `OPENAI_API_KEY`: Your OpenAI API key
   - Plus Supabase keys if using Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   Build variables can stay in Settings > Build for `NEXT_PUBLIC_*` inlining, but `POSTGRES_URL` and other runtime-needed vars must be in Variables and Secrets.

   **Debug:** If Instagram connect fails with "POSTGRES_URL missing", call `GET /api/debug-env` to verify. If it fails with "Database write failed", ensure migrations are applied: `npm run db:migrate` (with `POSTGRES_URL` in env). Check `GET /api/test-db` for `hasInstagramTable`.

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

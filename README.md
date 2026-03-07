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

This project is configured for Node runtime deployment (recommended: Vercel).

### Recommended: Vercel

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new project
   - Connect your GitHub repository

2. **Build Settings**:
   - **Build command**: `npm run build`
   - **Output**: Next.js default
   - **Root directory**: (leave empty)

3. **Environment Variables**:
   In your Vercel project settings, add these environment variables:
   - `POSTGRES_URL`: Your database connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Important runtime note

Instagram API routes use `runtime = 'nodejs'` with Drizzle + `pg`.  
Cloudflare Pages with `@cloudflare/next-on-pages` requires Edge runtime for all non-static routes and is therefore not compatible with this Node route setup.

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

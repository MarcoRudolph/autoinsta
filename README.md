# rudolpho-chat
AI Chatbot for Insta DMs

## Deployment

This project is configured for deployment to Cloudflare Pages.

### Option 1: Cloudflare Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages → Create a project
   - Connect your GitHub repository

2. **Build Settings**:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: (leave empty)

3. **Environment Variables**:
   In your Pages project settings, add these environment variables:
   - `POSTGRES_URL`: Your database connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Option 2: Wrangler CLI

1. **Prerequisites**:
   ```bash
   npm install -g wrangler@latest
   wrangler login
   ```

2. **Deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

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

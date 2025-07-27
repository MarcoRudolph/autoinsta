# rudolpho-chat
AI Chatbot for Insta DMs

## Deployment

This project is configured for deployment to Cloudflare Pages using Wrangler.

### Prerequisites

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

### Configuration

1. Update the `wrangler.toml` file with your domain and zone ID:
   - Replace `rudolpho-chat.your-domain.com` with your actual domain
   - Replace `your-zone-id` with your Cloudflare zone ID

2. Set up environment secrets:
   ```bash
   wrangler secret put DATABASE_URL
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   ```

### Deployment Commands

- Deploy to production: `npm run deploy:production`
- Deploy to staging: `npm run deploy:staging`
- Deploy to default environment: `npm run deploy`

### Environment Variables

Make sure to set the following environment variables in your Cloudflare dashboard or using Wrangler secrets:

- `DATABASE_URL`: Your database connection string
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_ENV`: Set to "production" for production deployments

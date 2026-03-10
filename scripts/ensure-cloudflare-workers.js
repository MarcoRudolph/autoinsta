const isPagesBuild =
  process.env.CF_PAGES === "1" ||
  process.env.CF_PAGES === "true" ||
  typeof process.env.CF_PAGES_URL === "string" ||
  typeof process.env.CF_PAGES_BRANCH === "string";

  console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
if (isPagesBuild) {
  console.error("");
  console.error("This project must be deployed with OpenNext on Cloudflare Workers.");
  console.error("Cloudflare Pages + next-on-pages requires Edge runtime route handlers.");
  console.error("Your API routes use runtime='nodejs' for Drizzle + pg.");
  console.error("");
  console.error("Use a Workers deployment path instead:");
  console.error("  npm run deploy:cloudflare");
  console.error("");
  process.exit(1);
}


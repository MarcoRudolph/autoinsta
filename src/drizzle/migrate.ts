import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env from project root when running standalone (no dotenv dependency)
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const keyPart = match[1];
      const valuePart = match[2];
      if (!keyPart || valuePart === undefined) continue;
      const key = keyPart.trim();
      const value = valuePart.trim().replace(/^["']|["']$/g, "").replace(/\s+$/g, "");
      process.env[key] = value;
    }
  }
}

function resolvePostgresUrl(): string {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.DIRECT_URL,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) {
      return c.trim();
    }
  }
  throw new Error(
    "Database URL is missing. Set POSTGRES_URL (or DATABASE_URL / SUPABASE_DB_URL / DIRECT_URL) in .env — e.g. Supabase: Settings → Database → Connection string (use pooler or direct as appropriate)."
  );
}

async function main() {
  const connectionString = resolvePostgresUrl();

  let pool: Pool;
  try {
    const url = new URL(connectionString);
    pool = new Pool({
      host: url.hostname,
      port: Number(url.port || "5432"),
      database: url.pathname.slice(1) || "postgres",
      user: url.username,
      password: url.password,
      ssl: url.hostname.includes("supabase") || url.hostname.includes("pooler") ? { rejectUnauthorized: false } : undefined,
    });
  } catch {
    pool = new Pool({ connectionString });
  }

  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  await pool.end();
  console.log("Migration complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 

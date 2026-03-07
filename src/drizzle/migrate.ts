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
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "").replace(/\s+$/g, "");
      process.env[key] = value;
    }
  }
}

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString || typeof connectionString !== "string") {
    throw new Error("POSTGRES_URL is missing or invalid. Set it in .env (e.g. from Supabase: Settings -> Database -> Connection string).");
  }

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
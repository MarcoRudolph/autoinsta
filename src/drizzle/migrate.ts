import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool);

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  await pool.end();
  console.log("Migration complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 
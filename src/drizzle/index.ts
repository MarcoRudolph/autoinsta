import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DrizzleDb | null = null;
let cachedPool: Pool | null = null;

export function resolvePostgresUrl(): string | null {
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL;
  }

  // In Cloudflare Workers, vars can come from bindings rather than process.env.
  try {
    const context = getCloudflareContext();
    const bindingValue = (context.env as Record<string, unknown> | undefined)?.POSTGRES_URL;
    if (typeof bindingValue === "string" && bindingValue.length > 0) {
      return bindingValue;
    }
  } catch {
    // No runtime context available (e.g. during build time).
  }

  return null;
}

function ensureDb(): DrizzleDb {
  if (cachedDb) {
    return cachedDb;
  }

  const connectionString = resolvePostgresUrl();
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured in process.env or Cloudflare bindings.");
  }

  cachedPool = new Pool({ connectionString });
  cachedDb = drizzle(cachedPool, { schema });
  return cachedDb;
}

export function getDb(): DrizzleDb {
  return ensureDb();
}

export function hasPostgresUrlConfig(): boolean {
  return Boolean(resolvePostgresUrl());
}

// Backwards-compatible proxy so existing `import { db } from '@/drizzle'` code keeps working.
export const db = new Proxy(
  {} as DrizzleDb,
  {
    get(_, prop, receiver) {
      return Reflect.get(ensureDb() as object, prop, receiver);
    },
  }
);

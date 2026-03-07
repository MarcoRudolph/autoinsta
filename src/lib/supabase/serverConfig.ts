import { getCloudflareContext } from "@opennextjs/cloudflare";

export type SupabaseServerConfig = {
  url: string;
  anonKey: string;
};

function readFromBindings(name: string): string | undefined {
  try {
    const ctx = getCloudflareContext();
    const val = (ctx.env as Record<string, unknown> | undefined)?.[name];
    return typeof val === "string" && val.length > 0 ? val : undefined;
  } catch {
    return undefined;
  }
}

function readEnv(name: string): string | undefined {
  return process.env[name] || readFromBindings(name);
}

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const url =
    readEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    readEnv("SUPABASE_URL");

  const anonKey =
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

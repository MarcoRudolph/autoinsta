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

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    readFromBindings("NEXT_PUBLIC_SUPABASE_URL");

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    readFromBindings("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY") ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    readFromBindings("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

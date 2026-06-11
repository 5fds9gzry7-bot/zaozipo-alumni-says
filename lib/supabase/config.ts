export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol.startsWith("http") ? { url, anonKey } : null;
  } catch {
    return null;
  }
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  browserClient ??= createSupabaseClient(config.url, config.anonKey);
  return browserClient;
}

export const createSupabaseBrowserClient = createClient;

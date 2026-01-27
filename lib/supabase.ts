import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase.types";

// Lazy-initialized Supabase client singleton
let supabaseInstance: SupabaseClient<Database> | null = null;

// Get Supabase client instance (lazy initialization)
export function getSupabase(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Convenience getter for backward compatibility
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

// Export types for convenience
export type { Database };

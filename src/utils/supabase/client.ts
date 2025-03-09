import { createClient } from "@supabase/supabase-js";

// Try to get environment variables and provide fallbacks to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "";

// Instead of throwing an error, let's add a warning but still create the client
if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing or undefined.");
}

// Create the client anyway, errors will be handled during API calls if the config is invalid
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // For server-side compatibility
  },
});

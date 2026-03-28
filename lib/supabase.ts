import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbSchema =
  process.env.SUPABASE_SCHEMA ||
  (process.env.NODE_ENV === "production" ? "public" : "dev");

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { db: { schema: dbSchema } })
    : null;

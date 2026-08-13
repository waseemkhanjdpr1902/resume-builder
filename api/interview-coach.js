import { createClient } from "@supabase/supabase-js";
import { secureJsonPost, requireUser } from "./_security.js";
import { runAI, clean } from "./_ai.js";

const db = () => createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const limit = (v, n) => clean(v, n);
const clamp = (n, min = 0, max = 100
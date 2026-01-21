// Backwards-compatible re-export.
// Keep this file so older imports don't break, but NEVER hardcode project credentials here.
import { supabase } from "./client";

export const supabaseClient = supabase;

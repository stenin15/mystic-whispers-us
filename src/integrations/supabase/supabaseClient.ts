// Custom Supabase client with correct project credentials
// This file overrides the auto-generated client to ensure correct project is used
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Correct Supabase project credentials
const SUPABASE_URL = "https://ihwjbvzynygkvvbqiths.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlod2pidnp5bnlna3Z2YnFpdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMTcxNTcsImV4cCI6MjA4MTU5MzE1N30.Zoa07Z0sZplwy-lMi-JQR5GLfVfCseqVTrwuUxTc15c";

export const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

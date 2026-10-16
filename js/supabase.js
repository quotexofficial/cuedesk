/**
 * @file supabase.js
 * @description BARE TALLIES - Supabase Client Configuration & Shared Helpers
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Constants with your Supabase Project URL and Anon Key
const SUPABASE_URL = 'https://cahlhviakgawlwsotsxj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGxodmlha2dhd2x3c290c3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTkxNzgsImV4cCI6MjEwNzczNTE3OH0.Tj81YP5TQLo3S0raajQ6ZOxyrFfwlkLxec_vIQQuBgI';

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn('⚠️ Supabase Anon Key is not configured. Please update js/supabase.js with your project anon key.');
}

/**
 * Initialize and export the Supabase client configured with persistent sessions,
 * automatic token refreshing, and session recovery in localStorage.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

/**
 * Retrieves the current active Supabase session.
 * @returns {Promise<import('@supabase/supabase-js').Session | null>} The active session or null.
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching current session:', error.message);
      return null;
    }
    return session;
  } catch (err) {
    console.error('Unexpected error while retrieving session:', err);
    return null;
  }
}

/**
 * Verifies if there is a currently authenticated user and returns the user object.
 * @returns {Promise<import('@supabase/supabase-js').User | null>} The authenticated user object or null.
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return user;
  } catch (err) {
    console.error('Unexpected error while verifying user:', err);
    return null;
  }
}

/**
 * Safely executes database queries or RPC calls with unified error handling.
 * @param {Function} queryFn - An async function containing the Supabase query.
 * @returns {Promise<{data: any, error: string | null}>}
 */
export async function safeSupabaseCall(queryFn) {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error('Database operation failed:', error.message);
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected database exception:', err);
    return { data: null, error: 'An unexpected error occurred. Please try again.' };
  }
}
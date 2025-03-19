import { createClient } from '@supabase/supabase-js';

// These are your public project details
// For development only - in production these should be environment variables
const supabaseUrl = 'https://ohjvkbiwbebeimxuxcgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oanZrYml3YmViZWlteHV4Y2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTMxNDksImV4cCI6MjA1Nzk4OTE0OX0.Sy0uanvj_Pln4faUnrdyfFeqXZ5iqlE3Zk0fL0T5zwU';

// For server-side operations
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// For client-side operations with user's API key
export const createUserSupabaseClient = (apiKey: string) => {
  // If no API key is provided, use the default anon key
  const key = apiKey || supabaseAnonKey;
  return createClient(supabaseUrl, key);
};

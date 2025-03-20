import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These are your public project details
// For development only - in production these should be environment variables
const supabaseUrl = 'https://ohjvkbiwbebeimxuxcgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oanZrYml3YmViZWlteHV4Y2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTMxNDksImV4cCI6MjA1Nzk4OTE0OX0.Sy0uanvj_Pln4faUnrdyfFeqXZ5iqlE3Zk0fL0T5zwU';

// Extend SupabaseClient type to include our custom property
interface CustomSupabaseClient extends SupabaseClient {
  _supabaseKey?: string;
}

// Singleton instance
let supabaseInstance: CustomSupabaseClient | null = null;

// For server-side operations
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// For client-side operations with user's API key
export const createUserSupabaseClient = (apiKey: string) => {
  // If no API key is provided, use the default anon key
  const key = apiKey || supabaseAnonKey;
  
  // If we already have an instance and the API key hasn't changed, return the existing instance
  if (supabaseInstance && supabaseInstance._supabaseKey === key) {
    return supabaseInstance;
  }
  
  // Otherwise, create a new instance
  supabaseInstance = createClient(supabaseUrl, key) as CustomSupabaseClient;
  
  // Store the key for future reference
  supabaseInstance._supabaseKey = key;
  
  return supabaseInstance;
};

// Initialize with default key to ensure there's always a client available
if (typeof window !== 'undefined') {
  // Only run on client-side
  createUserSupabaseClient(localStorage.getItem('supabaseApiKey') || supabaseAnonKey);
}

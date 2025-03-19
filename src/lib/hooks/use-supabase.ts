import { useState, useEffect } from 'react';
import { createUserSupabaseClient } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize with default client even if no API key is stored
    const storedApiKey = localStorage.getItem('supabaseApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    // Create client with stored API key or default anon key
    setSupabase(createUserSupabaseClient(storedApiKey || ''));
  }, []);
  
  const updateApiKey = (newApiKey: string) => {
    localStorage.setItem('supabaseApiKey', newApiKey);
    setApiKey(newApiKey);
    setSupabase(createUserSupabaseClient(newApiKey));
  };
  
  return { supabase, apiKey, updateApiKey };
}

import { useState, useEffect, useRef } from 'react';
import { createUserSupabaseClient } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);
  
  useEffect(() => {
    // Prevent multiple initializations in development mode with React strict mode
    if (initializationRef.current) return;
    initializationRef.current = true;
    
    // Initialize with stored API key or default
    const storedApiKey = localStorage.getItem('supabaseApiKey') || '';
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    try {
      // Create client with stored API key or default anon key
      const client = createUserSupabaseClient(storedApiKey);
      setSupabase(client);
      setIsInitialized(true);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }, []);
  
  const updateApiKey = (newApiKey: string) => {
    try {
      localStorage.setItem('supabaseApiKey', newApiKey);
      setApiKey(newApiKey);
      const client = createUserSupabaseClient(newApiKey);
      setSupabase(client);
      console.log('Supabase client updated with new API key');
      return true;
    } catch (error) {
      console.error('Error updating Supabase client with new API key:', error);
      return false;
    }
  };
  
  return { supabase, apiKey, updateApiKey, isInitialized };
}

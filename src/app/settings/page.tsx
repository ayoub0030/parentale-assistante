"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  const { apiKey, updateApiKey } = useSupabase();
  const [inputApiKey, setInputApiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  
  useEffect(() => {
    // Initialize input with stored API key if available
    if (apiKey) {
      setInputApiKey(apiKey);
    }
    
    // Try to get Supabase URL from localStorage
    const storedUrl = localStorage.getItem('supabaseUrl');
    if (storedUrl) {
      setSupabaseUrl(storedUrl);
    }
  }, [apiKey]);
  
  const handleSaveApiKey = () => {
    try {
      if (inputApiKey.trim()) {
        updateApiKey(inputApiKey.trim());
        
        // Save Supabase URL if provided
        if (supabaseUrl.trim()) {
          localStorage.setItem('supabaseUrl', supabaseUrl.trim());
        }
        
        setSaveSuccess(true);
        setSaveError(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaveError(true);
      setSaveSuccess(false);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveError(false);
      }, 3000);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Supabase Connection
            </CardTitle>
            <CardDescription>
              Connect to your Supabase database to store and manage child profiles, tasks, and other data.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="supabaseUrl" className="text-sm font-medium">
                Supabase Project URL
              </label>
              <Input
                id="supabaseUrl"
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Find this in your Supabase project settings under API.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Supabase API Key
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder="Enter your Supabase API key"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const input = document.getElementById('apiKey') as HTMLInputElement;
                    if (input) {
                      input.type = input.type === 'password' ? 'text' : 'password';
                    }
                  }}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Use your project's anon/public key for client-side operations. Never use the service_role key in client code.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex-col items-start gap-4">
            {saveSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your Supabase connection settings have been saved successfully.
                </AlertDescription>
              </Alert>
            )}
            
            {saveError && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem saving your settings. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleSaveApiKey}
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={!inputApiKey.trim()}
            >
              Save Connection Settings
            </Button>
          </CardFooter>
        </Card>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to set up Supabase</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
            <li>Create a new project and note your project URL</li>
            <li>Go to Project Settings → API and copy the "anon/public" key</li>
            <li>Paste the URL and key in the fields above</li>
            <li>Create the required tables in your Supabase database:</li>
          </ol>
          <div className="mt-2 bg-blue-100 rounded p-3 text-xs font-mono text-blue-800 overflow-x-auto">
            <pre>{`-- Create children table
CREATE TABLE children (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  interests TEXT[],
  personality TEXT,
  learning_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

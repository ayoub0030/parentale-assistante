"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, Lock, CheckCircle, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabase } from "@/lib/hooks/use-supabase";

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [apiKeySuccess, setApiKeySuccess] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const { apiKey, updateApiKey } = useSupabase();
  const [supabaseApiKey, setSupabaseApiKey] = useState("");

  // Load the current PIN and API key on component mount
  useEffect(() => {
    const storedPin = localStorage.getItem("parentPin") || "1234";
    // We don't show the actual PIN for security, just placeholder
    setCurrentPin("****");
    
    // Load Supabase API key
    const storedApiKey = localStorage.getItem("supabaseApiKey") || "";
    setSupabaseApiKey(storedApiKey);
  }, []);

  const handleSavePin = () => {
    // Reset states
    setError("");
    setSuccess(false);

    // Validate input
    if (!newPin || !confirmPin) {
      setError("Please fill in all fields");
      return;
    }

    // Check if PIN is numeric and 4 digits
    if (!/^\d{4}$/.test(newPin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    // Check if PINs match
    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    // Save the new PIN
    localStorage.setItem("parentPin", newPin);
    
    // Show success message
    setSuccess(true);

    // Reset form
    setNewPin("");
    setConfirmPin("");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };
  
  const handleSaveApiKey = () => {
    // Reset states
    setApiKeyError("");
    setApiKeySuccess(false);
    
    // Validate input
    if (!supabaseApiKey) {
      setApiKeyError("Please enter a Supabase API key");
      return;
    }
    
    // Update API key
    try {
      const success = updateApiKey(supabaseApiKey);
      if (success) {
        setApiKeySuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setApiKeySuccess(false);
        }, 3000);
      } else {
        setApiKeyError("Failed to update API key");
      }
    } catch (err: any) {
      setApiKeyError(err.message || "Failed to update API key");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Parent Authentication
            </CardTitle>
            <CardDescription>
              Set a PIN code to protect parent mode access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>PIN updated successfully!</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-pin">Current PIN</Label>
                <Input
                  id="current-pin"
                  type="password"
                  value={currentPin}
                  disabled
                  className="w-full max-w-[200px]"
                />
                <p className="text-sm text-gray-500">
                  Default PIN is 1234 if you haven't set one
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="new-pin">New PIN (4 digits)</Label>
                <Input
                  id="new-pin"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={4}
                  placeholder="Enter new PIN"
                  className="w-full max-w-[200px]"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirm-pin">Confirm PIN</Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={4}
                  placeholder="Confirm new PIN"
                  className="w-full max-w-[200px]"
                />
              </div>
              
              <Button 
                onClick={handleSavePin} 
                className="w-fit mt-2 gap-2"
              >
                <Save className="h-4 w-4" />
                Save PIN
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Configuration
            </CardTitle>
            <CardDescription>
              Configure your Supabase API key for database access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeyError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiKeyError}</AlertDescription>
              </Alert>
            )}
            
            {apiKeySuccess && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>Supabase API key updated successfully!</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input
                  id="supabase-url"
                  type="text"
                  value="https://ohjvkbiwbebeimxuxcgv.supabase.co"
                  disabled
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  This is the project URL for the Supabase database
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="supabase-api-key">Supabase API Key</Label>
                <Input
                  id="supabase-api-key"
                  type="password"
                  value={supabaseApiKey}
                  onChange={(e) => setSupabaseApiKey(e.target.value)}
                  placeholder="Enter your Supabase API key"
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  Use the anon key from your Supabase project settings
                </p>
              </div>
              
              <Button 
                onClick={handleSaveApiKey} 
                className="w-fit mt-2 gap-2"
              >
                <Save className="h-4 w-4" />
                Save API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

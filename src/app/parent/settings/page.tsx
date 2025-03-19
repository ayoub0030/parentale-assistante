"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, Lock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load the current PIN on component mount
  useEffect(() => {
    const storedPin = localStorage.getItem("parentPin") || "1234";
    // We don't show the actual PIN for security, just placeholder
    setCurrentPin("****");
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
      </div>
    </div>
  );
}

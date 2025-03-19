"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { useRouter } from "next/navigation";

interface ParentAuthFormProps {
  onCancel: () => void;
}

export function ParentAuthForm({ onCancel }: ParentAuthFormProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    setError("");
    setIsLoading(true);

    // Get the stored PIN from localStorage or use a default if not set
    const storedPin = localStorage.getItem("parentPin") || "1234";
    
    if (pin === storedPin) {
      // Set a cookie to indicate parent mode
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1); // Shorter expiration for parent mode
      document.cookie = `parentMode=true; path=/; expires=${expirationDate.toUTCString()}`;
      
      // Redirect to parent dashboard
      router.push("/parent");
    } else {
      setError("Incorrect PIN. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="mr-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Parent Authentication</CardTitle>
        </div>
        <CardDescription>
          Please enter your PIN to access parent mode
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl tracking-widest"
            maxLength={4}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <p className="text-xs text-gray-500 text-center">
            Default PIN is 1234 if you haven't set one
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!pin || pin.length < 4 || isLoading}
        >
          {isLoading ? "Verifying..." : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}

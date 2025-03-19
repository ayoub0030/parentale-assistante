"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, LockKeyhole, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";

export default function AuthPage() {
  const [selectedMode, setSelectedMode] = useState<"parent" | "child" | null>(null);
  const router = useRouter();

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Parentale Assistante</h1>
      
      {!selectedMode ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Choose Mode</CardTitle>
            <CardDescription>
              Select which mode you want to use the application in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setSelectedMode("parent")}
              >
                <LockKeyhole className="h-10 w-10" />
                <span className="font-medium">Parent Mode</span>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3"
                onClick={() => setSelectedMode("child")}
              >
                <User className="h-10 w-10" />
                <span className="font-medium">Child Mode</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedMode === "parent" ? (
        <ParentAuthSection onCancel={() => setSelectedMode(null)} />
      ) : (
        <ChildSelectionSection onCancel={() => setSelectedMode(null)} />
      )}
    </div>
  );
}

// Parent Authentication Section
function ParentAuthSection({ onCancel }: { onCancel: () => void }) {
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

// Child Selection Section
function ChildSelectionSection({ onCancel }: { onCancel: () => void }) {
  const { profiles, selectProfile } = useKidProfiles();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Set first profile as default selection if available
  useEffect(() => {
    if (profiles.length > 0 && !selectedChildId) {
      setSelectedChildId(profiles[0].id);
    }
  }, [profiles, selectedChildId]);

  const handleContinue = () => {
    if (selectedChildId) {
      setIsLoading(true);
      
      // Set in localStorage for the app to use
      selectProfile(selectedChildId);
      
      // Also set a cookie for the middleware
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      document.cookie = `selectedChildId=${selectedChildId}; path=/; expires=${expirationDate.toUTCString()}`;
      
      // Redirect to child dashboard
      router.push("/child");
    }
  };

  // If there are no profiles, show a message
  if (profiles.length === 0) {
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
            <CardTitle>No Child Profiles</CardTitle>
          </div>
          <CardDescription>
            You need to create a child profile first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">
              Please go to parent mode and create a child profile.
            </p>
            <Button
              onClick={() => {
                // Set parent mode cookie temporarily to access parent mode
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 1);
                document.cookie = `parentMode=true; path=/; expires=${expirationDate.toUTCString()}`;
                router.push("/parent/child");
              }}
            >
              Go to Parent Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <CardTitle>Who's using the app?</CardTitle>
        </div>
        <CardDescription>
          Select your profile to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 py-2">
          {profiles.map((profile) => (
            <Button
              key={profile.id}
              variant={selectedChildId === profile.id ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center gap-2 relative"
              onClick={() => setSelectedChildId(profile.id)}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium">{profile.name}</span>
              {selectedChildId === profile.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedChildId || isLoading}
          className="gap-2"
        >
          {isLoading ? "Loading..." : "Continue"} 
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

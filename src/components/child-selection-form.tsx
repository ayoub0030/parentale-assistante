"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { User, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useKidProfiles } from "../lib/hooks/use-kid-profiles";

interface ChildSelectionFormProps {
  onCancel: () => void;
}

export function ChildSelectionForm({ onCancel }: ChildSelectionFormProps) {
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
            You need to create a child profile First
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

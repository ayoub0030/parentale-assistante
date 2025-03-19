"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { User } from "lucide-react";

export default function ChildSettingsPage() {
  const { selectedProfile } = useKidProfiles();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>
              This is your current profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProfile ? (
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p className="text-gray-600">{selectedProfile.name}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Age</h3>
                  <p className="text-gray-600">{selectedProfile.age} years old</p>
                </div>
                
                {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                  <div>
                    <h3 className="font-medium">Interests</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedProfile.interests.map((interest, index) => (
                        <span 
                          key={index}
                          className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No profile selected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

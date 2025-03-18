"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KidProfileForm, type KidProfile } from "@/components/kid-profile-form";
import { KidProfileCard } from "@/components/kid-profile-card";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { PlusCircle } from "lucide-react";

export default function ParentChildPage() {
  const { 
    profiles, 
    selectedProfile, 
    isLoading, 
    addProfile, 
    updateProfile, 
    deleteProfile, 
    selectProfile 
  } = useKidProfiles();
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleAddProfile = (profile: KidProfile) => {
    addProfile(profile);
    setShowAddForm(false);
  };
  
  const handleDeleteProfile = (profileId: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfile(profileId);
    }
  };
  
  // First-time user experience - show welcome and form
  if (profiles.length === 0 && !showAddForm) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Welcome to Parentale Assistante!</h1>
          <p className="text-xl text-gray-600 mb-8">Let's get started by creating your child's profile</p>
          <p className="text-gray-500 mb-6">
            Creating a profile helps us personalize the experience for your child based on their age, 
            interests, and learning style. This information will be used to provide appropriate content 
            and activities.
          </p>
          <Button 
            size="lg" 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setShowAddForm(true)}
          >
            Create Your First Child Profile
          </Button>
        </div>
      </div>
    );
  }
  
  // Show the form when adding a new profile
  if (showAddForm) {
    return (
      <div className="container mx-auto py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setShowAddForm(false)}
        >
          ← Back to Profiles
        </Button>
        <KidProfileForm onSubmit={handleAddProfile} isLoading={isLoading} />
      </div>
    );
  }
  
  // Show existing profiles
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Child Profiles</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add New Child
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {profiles.map(profile => (
          <KidProfileCard 
            key={profile.id}
            profile={profile}
            onEdit={() => {/* Implement edit functionality */}}
            onDelete={() => handleDeleteProfile(profile.id)}
            onSelect={() => selectProfile(profile.id)}
          />
        ))}
      </div>
      
      {selectedProfile && (
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Selected Profile: {selectedProfile.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Recent Activities</h3>
                <p className="text-gray-500">No recent activities recorded.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Learning Progress</h3>
                <p className="text-gray-500">No learning data available yet.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Upcoming Tasks</h3>
                <p className="text-gray-500">No tasks assigned yet.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                <p className="text-gray-500">Recommendations will appear as your child uses the platform.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

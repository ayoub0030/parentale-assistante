"use client";

import { useState, useEffect } from 'react';
import { KidProfile } from '@/components/kid-profile-form';

const STORAGE_KEY = 'parentale-assistant-kid-profiles';

export function useKidProfiles() {
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profiles from localStorage on component mount
  useEffect(() => {
    const loadProfiles = () => {
      try {
        const storedProfiles = localStorage.getItem(STORAGE_KEY);
        if (storedProfiles) {
          const parsedProfiles = JSON.parse(storedProfiles);
          // Convert string dates back to Date objects
          const profilesWithDates = parsedProfiles.map((profile: any) => ({
            ...profile,
            createdAt: new Date(profile.createdAt)
          }));
          setProfiles(profilesWithDates);
          
          // Set the first profile as selected if there's at least one and none is selected
          if (profilesWithDates.length > 0 && !selectedProfileId) {
            setSelectedProfileId(profilesWithDates[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading kid profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }, [profiles, isLoading]);

  // Add a new profile
  const addProfile = (profile: KidProfile) => {
    setProfiles(prev => [...prev, profile]);
    setSelectedProfileId(profile.id);
  };

  // Update an existing profile
  const updateProfile = (updatedProfile: KidProfile) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === updatedProfile.id ? updatedProfile : profile
      )
    );
  };

  // Delete a profile
  const deleteProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== profileId));
    
    // If the deleted profile was selected, select another one if available
    if (selectedProfileId === profileId) {
      const remainingProfiles = profiles.filter(profile => profile.id !== profileId);
      if (remainingProfiles.length > 0) {
        setSelectedProfileId(remainingProfiles[0].id);
      } else {
        setSelectedProfileId(null);
      }
    }
  };

  // Select a profile
  const selectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  // Get the currently selected profile
  const selectedProfile = profiles.find(profile => profile.id === selectedProfileId) || null;

  return {
    profiles,
    selectedProfile,
    isLoading,
    addProfile,
    updateProfile,
    deleteProfile,
    selectProfile
  };
}

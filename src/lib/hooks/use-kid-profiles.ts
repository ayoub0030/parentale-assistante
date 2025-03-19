"use client";

import { useState, useEffect } from 'react';
import { KidProfile } from '@/components/kid-profile-form';
import { useSupabase } from './use-supabase';

export function useKidProfiles() {
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();

  // Load profiles from Supabase when the client is available
  useEffect(() => {
    const loadProfiles = async () => {
      // If no Supabase client is available, try to load from localStorage as fallback
      if (!supabase) {
        try {
          const storedProfiles = localStorage.getItem('parentale-assistant-kid-profiles');
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
          console.error('Error loading kid profiles from localStorage:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Load from Supabase if client is available
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('children')
          .select('*');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert dates
          const profilesWithDates = data.map((profile: any) => ({
            ...profile,
            createdAt: new Date(profile.created_at),
            // Map any other fields that might have different names in the database
            interests: profile.interests || [],
          }));
          
          setProfiles(profilesWithDates);
          
          // Set the first profile as selected if there's at least one and none is selected
          if (profilesWithDates.length > 0 && !selectedProfileId) {
            setSelectedProfileId(profilesWithDates[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading profiles from Supabase:', error);
        // Try to load from localStorage as fallback
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      try {
        const storedProfiles = localStorage.getItem('parentale-assistant-kid-profiles');
        if (storedProfiles) {
          const parsedProfiles = JSON.parse(storedProfiles);
          const profilesWithDates = parsedProfiles.map((profile: any) => ({
            ...profile,
            createdAt: new Date(profile.createdAt)
          }));
          setProfiles(profilesWithDates);
          
          if (profilesWithDates.length > 0 && !selectedProfileId) {
            setSelectedProfileId(profilesWithDates[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    loadProfiles();
  }, [supabase]);

  // Add a new profile
  const addProfile = async (profile: KidProfile) => {
    if (!supabase) {
      // Fallback to localStorage if Supabase is not available
      setProfiles(prev => [...prev, profile]);
      setSelectedProfileId(profile.id);
      localStorage.setItem('parentale-assistant-kid-profiles', JSON.stringify([...profiles, profile]));
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare the data for Supabase (snake_case)
      const supabaseProfile = {
        id: profile.id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        interests: profile.interests,
        personality: profile.personality,
        learning_style: profile.learningStyle,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('children')
        .insert([supabaseProfile])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Convert back to our app format
        const newProfile = {
          ...profile,
          createdAt: new Date(data[0].created_at)
        };
        
        setProfiles(prev => [...prev, newProfile]);
        setSelectedProfileId(newProfile.id);
      }
    } catch (error) {
      console.error('Error adding profile to Supabase:', error);
      // Fallback to localStorage
      setProfiles(prev => [...prev, profile]);
      setSelectedProfileId(profile.id);
      localStorage.setItem('parentale-assistant-kid-profiles', JSON.stringify([...profiles, profile]));
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing profile
  const updateProfile = async (updatedProfile: KidProfile) => {
    if (!supabase) {
      // Fallback to localStorage
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === updatedProfile.id ? updatedProfile : profile
        )
      );
      localStorage.setItem('parentale-assistant-kid-profiles', JSON.stringify(
        profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile)
      ));
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare the data for Supabase
      const supabaseProfile = {
        name: updatedProfile.name,
        age: updatedProfile.age,
        gender: updatedProfile.gender,
        interests: updatedProfile.interests,
        personality: updatedProfile.personality,
        learning_style: updatedProfile.learningStyle
      };
      
      const { error } = await supabase
        .from('children')
        .update(supabaseProfile)
        .eq('id', updatedProfile.id);
        
      if (error) throw error;
      
      // Update local state
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === updatedProfile.id ? updatedProfile : profile
        )
      );
    } catch (error) {
      console.error('Error updating profile in Supabase:', error);
      // Fallback to localStorage
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === updatedProfile.id ? updatedProfile : profile
        )
      );
      localStorage.setItem('parentale-assistant-kid-profiles', JSON.stringify(
        profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile)
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a profile
  const deleteProfile = async (profileId: string) => {
    if (!supabase) {
      // Fallback to localStorage
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
      
      localStorage.setItem('parentale-assistant-kid-profiles', JSON.stringify(
        profiles.filter(profile => profile.id !== profileId)
      ));
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', profileId);
        
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error('Error deleting profile from Supabase:', error);
      // Fallback to localStorage
      setProfiles(prev => prev.filter(profile => profile.id !== profileId));
      
      if (selectedProfileId === profileId) {
        const remainingProfiles = profiles.filter(profile => profile.id !== profileId);
        if (remainingProfiles.length > 0) {
          setSelectedProfileId(remainingProfiles[0].id);
        } else {
          setSelectedProfileId(null);
        }
      }
      
      localStorage.setItem('parentale-assistant-kid-profiles', JSON.stringify(
        profiles.filter(profile => profile.id !== profileId)
      ));
    } finally {
      setIsLoading(false);
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

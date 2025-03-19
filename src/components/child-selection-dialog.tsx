"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { User, ArrowRight } from "lucide-react";

interface ChildSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChildSelectionDialog({
  open,
  onOpenChange,
}: ChildSelectionDialogProps) {
  const { profiles, selectProfile } = useKidProfiles();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const router = useRouter();

  // Reset selection when dialog opens
  useEffect(() => {
    if (open && profiles.length > 0) {
      setSelectedChildId(profiles[0].id);
    }
  }, [open, profiles]);

  const handleContinue = () => {
    if (selectedChildId) {
      // Set in localStorage for the app to use
      selectProfile(selectedChildId);
      
      // Also set a cookie for the middleware
      // Set cookie with path and expiration (30 days)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      document.cookie = `selectedChildId=${selectedChildId}; path=/; expires=${expirationDate.toUTCString()}`;
      
      router.push("/child");
      onOpenChange(false);
    }
  };

  // If there are no profiles, show a message
  if (profiles.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>No Child Profiles Found</DialogTitle>
            <DialogDescription>
              You need to create a child profile first before using child mode.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              Please go to parent mode and create a child profile.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                router.push("/parent/child");
                onOpenChange(false);
              }}
            >
              Go to Parent Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Who's using the app?
          </DialogTitle>
          <DialogDescription className="text-center">
            Select your profile to continue
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                variant={
                  selectedChildId === profile.id ? "default" : "outline"
                }
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
        </div>

        <DialogFooter>
          <Button
            onClick={handleContinue}
            disabled={!selectedChildId}
            className="w-full gap-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

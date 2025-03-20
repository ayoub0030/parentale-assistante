"use client";

import { KidProfile, KidProfileForm } from "@/components/kid-profile-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KidProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (profile: KidProfile) => void;
  isLoading?: boolean;
  existingProfile?: KidProfile;
  isEditing?: boolean;
}

export function KidProfileFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  existingProfile,
  isEditing = false,
}: KidProfileFormDialogProps) {
  const handleSubmit = (profile: KidProfile) => {
    onSubmit(profile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Child Profile" : "Create Child Profile"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your child's profile information below."
              : "Fill out the form below to create a new child profile."}
          </DialogDescription>
        </DialogHeader>
        <KidProfileForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          existingProfile={existingProfile}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}

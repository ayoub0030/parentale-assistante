"use client";

import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KidProfile } from "./kid-profile-form";

interface KidProfileCardProps {
  profile: KidProfile;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
}

export function KidProfileCard({ profile, onEdit, onDelete, onSelect }: KidProfileCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-blue-600">{profile.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{profile.age} years old</Badge>
            <Badge variant="outline" className="capitalize">{profile.gender}</Badge>
          </div>
        </div>
        <CardDescription>
          Created on {profile.createdAt.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-500 mb-1">Interests</h4>
          <div className="flex flex-wrap gap-1">
            {profile.interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-gray-500 mb-1">Personality</h4>
          <p className="text-sm text-gray-700">{profile.personality}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-gray-500 mb-1">Learning Style</h4>
          <Badge variant="outline" className="capitalize">{profile.learningStyle}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit Profile
        </Button>
        <div className="space-x-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
          <Button variant="default" size="sm" onClick={onSelect}>
            Select
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

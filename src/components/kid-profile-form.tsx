"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface KidProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  interests: string[];
  personality: string;
  learningStyle: string;
  avatar?: string;
  createdAt: Date;
}

interface KidProfileFormProps {
  onSubmit: (profile: KidProfile) => void;
  isLoading?: boolean;
  existingProfile?: KidProfile;
  isEditing?: boolean;
}

export function KidProfileForm({ 
  onSubmit, 
  isLoading = false, 
  existingProfile, 
  isEditing = false 
}: KidProfileFormProps) {
  const [name, setName] = useState(existingProfile?.name || "");
  const [age, setAge] = useState(existingProfile?.age ? existingProfile.age.toString() : "");
  const [gender, setGender] = useState(existingProfile?.gender || "");
  const [interests, setInterests] = useState(existingProfile?.interests ? existingProfile.interests.join(", ") : "");
  const [personality, setPersonality] = useState(existingProfile?.personality || "");
  const [learningStyle, setLearningStyle] = useState(existingProfile?.learningStyle || "");
  
  // Update form when existingProfile changes (e.g., when switching between profiles)
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name);
      setAge(existingProfile.age.toString());
      setGender(existingProfile.gender);
      setInterests(existingProfile.interests.join(", "));
      setPersonality(existingProfile.personality);
      setLearningStyle(existingProfile.learningStyle);
    }
  }, [existingProfile]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profile: KidProfile = {
      id: existingProfile?.id || crypto.randomUUID(),
      name,
      age: parseInt(age, 10),
      gender,
      interests: interests.split(",").map(i => i.trim()),
      personality,
      learningStyle,
      createdAt: existingProfile?.createdAt || new Date()
    };
    
    onSubmit(profile);
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-600">
          {isEditing ? "Edit Kid Profile" : "Create Kid Profile"}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? "Update your child's profile information" 
            : "Fill in the details about your child to personalize their experience"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Age"
                min="1"
                max="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              placeholder="Enter interests separated by commas (e.g. reading, music, sports)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Textarea
              id="personality"
              placeholder="Describe your child's personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="learningStyle">Learning Style</Label>
            <Select value={learningStyle} onValueChange={setLearningStyle} required>
              <SelectTrigger id="learningStyle">
                <SelectValue placeholder="Select learning style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="auditory">Auditory</SelectItem>
                <SelectItem value="reading">Reading/Writing</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (isEditing ? "Updating Profile..." : "Creating Profile...") 
              : (isEditing ? "Update Profile" : "Create Profile")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

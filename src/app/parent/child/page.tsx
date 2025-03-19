"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KidProfileForm, type KidProfile } from "@/components/kid-profile-form";
import { KidProfileCard } from "@/components/kid-profile-card";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { 
  PlusCircle, 
  Search, 
  Bell, 
  ChevronLeft, 
  Pencil, 
  Trash2, 
  BarChart3, 
  Calendar, 
  Clock, 
  Award,
  BookOpen,
  MessageSquare,
  Lightbulb
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [parentNote, setParentNote] = useState("");
  
  const handleAddProfile = (profile: KidProfile) => {
    addProfile(profile);
    setShowAddForm(false);
  };
  
  const handleDeleteProfile = (profileId: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfile(profileId);
    }
  };

  const handleSaveNote = () => {
    if (selectedProfile && parentNote.trim()) {
      // In a real app, we would save this note to the profile
      alert("Note saved successfully!");
      setParentNote("");
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
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
            className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <PlusCircle size={18} />
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
          className="mb-4 flex items-center gap-1"
          onClick={() => setShowAddForm(false)}
        >
          <ChevronLeft size={16} />
          Back to Profiles
        </Button>
        <KidProfileForm onSubmit={handleAddProfile} isLoading={isLoading} />
      </div>
    );
  }
  
  // Show existing profiles with two-column layout
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Child List */}
        <div className="lg:w-1/3 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">Child Profiles</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
              >
                <Bell size={18} />
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="rounded-full flex items-center gap-1 bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Add Child</span>
              </Button>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search profiles..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            {filteredProfiles.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No profiles match your search.
              </div>
            ) : (
              filteredProfiles.map(profile => {
                const isSelected = selectedProfile?.id === profile.id;
                const cardColor = profile.gender === "male" ? "bg-blue-50" : "bg-pink-50";
                const borderColor = profile.gender === "male" ? "border-blue-200" : "border-pink-200";
                const textColor = profile.gender === "male" ? "text-blue-700" : "text-pink-700";
                
                return (
                  <div 
                    key={profile.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${cardColor} ${borderColor} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    onClick={() => selectProfile(profile.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${profile.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`}>
                        {profile.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-bold text-lg ${textColor}`}>{profile.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span>{profile.age} years</span>
                              <span>•</span>
                              <span className="capitalize">{profile.gender}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Implement edit functionality
                                alert("Edit functionality to be implemented");
                              }}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfile(profile.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {profile.interests.slice(0, 3).map((interest, index) => (
                              <Badge key={index} variant="outline" className={`text-xs ${textColor} border-current`}>
                                {interest}
                              </Badge>
                            ))}
                            {profile.interests.length > 3 && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                +{profile.interests.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="capitalize">{profile.learningStyle} learner</span>
                            
                            {/* Mini progress indicators */}
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${profile.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`} 
                                  style={{ width: `${Math.random() * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Right Column - Selected Child Details */}
        <div className="lg:w-2/3">
          {selectedProfile ? (
            <div className="border rounded-lg shadow-sm overflow-hidden">
              <div className={`p-6 ${selectedProfile.gender === "male" ? "bg-blue-50" : "bg-pink-50"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${selectedProfile.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`}>
                    {selectedProfile.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>{selectedProfile.age} years old</span>
                      <span>•</span>
                      <span className="capitalize">{selectedProfile.gender}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedProfile.learningStyle} learner</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedProfile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} className="p-6">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="recent" className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Recent Activities</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Upcoming Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="flex items-center gap-1">
                    <BarChart3 size={14} />
                    <span>Learning Progress</span>
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-1">
                    <Lightbulb size={14} />
                    <span>Recommendations</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent" className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
                  
                  <div className="space-y-3">
                    {/* Example activity items - would be dynamic in a real app */}
                    <Card>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="bg-green-100 text-green-700 p-2 rounded-full">
                          <Award size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Completed Math Quiz</h4>
                            <span className="text-sm text-gray-500">2 days ago</span>
                          </div>
                          <p className="text-sm text-gray-600">Score: 85% - Great progress in multiplication!</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                          <BookOpen size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Read a Story</h4>
                            <span className="text-sm text-gray-500">3 days ago</span>
                          </div>
                          <p className="text-sm text-gray-600">Completed "The Little Prince" - 96 pages</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="text-center p-4 text-gray-500 text-sm">
                      No more activities to show
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Upcoming Tasks</h3>
                    <Button size="sm" className="flex items-center gap-1">
                      <PlusCircle size={14} />
                      Add Task
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Example task items - would be dynamic in a real app */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-100 text-yellow-700 p-2 rounded-full">
                            <BookOpen size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">Reading Assignment</h4>
                              <Badge variant="outline" className="text-xs">Due tomorrow</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Read chapters 3-5 of "The Hobbit"</p>
                            
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>30%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: "30%" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                            <BarChart3 size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">Math Practice</h4>
                              <Badge variant="outline" className="text-xs">Due in 3 days</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Complete 20 division problems</p>
                            
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>0%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: "0%" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Learning Progress</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Reading Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-green-500" style={{ width: "75%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Beginner</span>
                          <span>Advanced</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Math Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-blue-500" style={{ width: "60%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Beginner</span>
                          <span>Advanced</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Skill Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Reading Comprehension</span>
                            <span className="text-sm font-medium">85%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: "85%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Vocabulary</span>
                            <span className="text-sm font-medium">70%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: "70%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Addition & Subtraction</span>
                            <span className="text-sm font-medium">90%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: "90%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Multiplication & Division</span>
                            <span className="text-sm font-medium">65%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: "65%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Personalized Recommendations</h3>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                            <Lightbulb size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium">Based on {selectedProfile.name}'s Learning Style</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              As a {selectedProfile.learningStyle} learner, {selectedProfile.name} might benefit from:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                              {selectedProfile.learningStyle === "visual" && (
                                <>
                                  <li>Educational videos with colorful graphics</li>
                                  <li>Mind maps for organizing information</li>
                                  <li>Flashcards with pictures</li>
                                </>
                              )}
                              {selectedProfile.learningStyle === "auditory" && (
                                <>
                                  <li>Audiobooks and podcasts</li>
                                  <li>Discussion-based learning</li>
                                  <li>Reading aloud and verbal repetition</li>
                                </>
                              )}
                              {selectedProfile.learningStyle === "reading" && (
                                <>
                                  <li>Text-based materials and books</li>
                                  <li>Note-taking exercises</li>
                                  <li>Written instructions and summaries</li>
                                </>
                              )}
                              {selectedProfile.learningStyle === "kinesthetic" && (
                                <>
                                  <li>Hands-on experiments and activities</li>
                                  <li>Building models and physical demonstrations</li>
                                  <li>Movement-based learning games</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium">Suggested Activities</h4>
                            <div className="space-y-2 mt-2">
                              <div className="border rounded p-3">
                                <div className="flex justify-between">
                                  <h5 className="font-medium text-sm">Interactive Math Game</h5>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">Start</Button>
                                </div>
                                <p className="text-xs text-gray-600">Practice multiplication with fun challenges</p>
                              </div>
                              
                              <div className="border rounded p-3">
                                <div className="flex justify-between">
                                  <h5 className="font-medium text-sm">Reading Adventure</h5>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">Start</Button>
                                </div>
                                <p className="text-xs text-gray-600">Interactive story with comprehension questions</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Parent Notes</CardTitle>
                      <CardDescription>Add notes or reminders for {selectedProfile.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        placeholder="Write a note or message..." 
                        value={parentNote}
                        onChange={(e) => setParentNote(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleSaveNote}
                        disabled={!parentNote.trim()}
                        className="w-full"
                      >
                        Save Note
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-2">No Child Selected</h2>
                <p className="text-gray-500 mb-6">
                  Select a child from the list to view their details, or add a new child profile.
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Add New Child
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

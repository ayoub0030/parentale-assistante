"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KidProfileForm, type KidProfile } from "@/components/kid-profile-form";
import { KidProfileFormDialog } from "@/components/kid-profile-form-dialog";
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
import { TaskCard } from "@/components/task-card";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useTasks } from "@/lib/hooks/use-tasks";
import { Task, TaskFormData } from "@/lib/types/task";

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
  
  const { tasks, isLoading: tasksLoading, addTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [profileToEdit, setProfileToEdit] = useState<KidProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [parentNote, setParentNote] = useState("");
  
  const handleAddProfile = (profile: KidProfile) => {
    addProfile(profile);
    setShowAddForm(false);
  };
  
  const handleEditProfile = (profile: KidProfile) => {
    setProfileToEdit(profile);
    setShowEditForm(true);
  };
  
  const handleUpdateProfile = (updatedProfile: KidProfile) => {
    updateProfile(updatedProfile);
    setShowEditForm(false);
    setProfileToEdit(null);
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

  const handleAddTask = (taskData: TaskFormData) => {
    addTask(taskData);
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = (taskData: TaskFormData) => {
    if (taskData.id) {
      updateTask(taskData.id, taskData);
      setTaskToEdit(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const childTasks = selectedProfile 
    ? tasks.filter(task => task.childId === selectedProfile.id)
    : [];

  // First-time user experience - show welcome and form
  if (profiles.length === 0 && !showAddForm) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold text-green-600 mb-6">Welcome to Bright Way!</h1>
          <p className="text-xl text-gray-600 mb-8">Let's get started by creating your child's profile</p>
          <p className="text-gray-500 mb-8">
            Creating a profile helps us personalize the experience for your child based on their age, 
            interests, and learning style. This information will be used to provide appropriate content 
            and activities.
          </p>
          <Button 
            size="lg" 
            className="bg-green-500 hover:bg-green-600 flex items-center gap-2 px-6 py-6 text-base"
            onClick={() => setShowAddForm(true)}
          >
            <PlusCircle size={20} />
            Create Your First Child Profile
          </Button>
        </div>
      </div>
    );
  }
  
  // Show the form when adding a new profile
  if (showAddForm) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2 text-base"
          onClick={() => setShowAddForm(false)}
        >
          <ChevronLeft size={18} />
          Back to Profiles
        </Button>
        <KidProfileForm onSubmit={handleAddProfile} isLoading={isLoading} />
      </div>
    );
  }
  
  // Show the form when editing a profile
  if (showEditForm && profileToEdit) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2 text-base"
          onClick={() => {
            setShowEditForm(false);
            setProfileToEdit(null);
          }}
        >
          <ChevronLeft size={18} />
          Back to Profiles
        </Button>
        <KidProfileForm 
          onSubmit={handleUpdateProfile} 
          isLoading={isLoading} 
          existingProfile={profileToEdit}
          isEditing={true}
        />
      </div>
    );
  }
  
  // Show existing profiles with two-column layout
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Child List */}
        <div className="lg:w-1/3 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Child Profiles</h1>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-10 w-10"
              >
                <Bell size={18} />
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="rounded-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2"
                size="sm"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Add Child</span>
              </Button>
            </div>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search profiles..."
              className="pl-10 py-6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-5 max-h-[calc(100vh-220px)] overflow-y-auto pr-3">
            {filteredProfiles.length === 0 ? (
              <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg">
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
                    className={`border rounded-lg p-5 cursor-pointer transition-all ${cardColor} ${borderColor} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    onClick={() => selectProfile(profile.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${profile.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`}>
                        {profile.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-bold text-lg ${textColor}`}>{profile.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <span>{profile.age} years</span>
                              <span>•</span>
                              <span className="capitalize">{profile.gender}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProfile(profile);
                              }}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfile(profile.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {profile.interests.slice(0, 2).map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {profile.interests.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.interests.length - 2} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center gap-1">
                          <span className="text-xs text-gray-500">Learning style:</span>
                          <Badge variant="outline" className="capitalize text-xs">
                            {profile.learningStyle}
                          </Badge>
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
            <div className="space-y-6">
              <div className={`rounded-lg p-6 ${selectedProfile.gender === "male" ? "bg-blue-50" : "bg-pink-50"}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl ${selectedProfile.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`}>
                    {selectedProfile.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedProfile.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg">{selectedProfile.age} years old</span>
                      <span>•</span>
                      <span className="capitalize text-lg">{selectedProfile.gender}</span>
                      <span>•</span>
                      <span className="capitalize text-lg">{selectedProfile.learningStyle}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedProfile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="recent" className="py-2.5">
                    <div className="flex flex-col items-center gap-1">
                      <Clock size={16} />
                      <span>Recent</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="py-2.5">
                    <div className="flex flex-col items-center gap-1">
                      <Calendar size={16} />
                      <span>Tasks</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="py-2.5">
                    <div className="flex flex-col items-center gap-1">
                      <BarChart3 size={16} />
                      <span>Progress</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="py-2.5">
                    <div className="flex flex-col items-center gap-1">
                      <MessageSquare size={16} />
                      <span>Notes</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activities</CardTitle>
                      <CardDescription>
                        See what {selectedProfile.name} has been up to recently
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="bg-green-100 p-2 rounded-full text-green-600">
                            <Award size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium">Completed Math Quiz</h4>
                            <p className="text-sm text-gray-500">Scored 8/10 on multiplication tables</p>
                            <p className="text-xs text-gray-400 mt-1">Today, 10:30 AM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium">Read a Story</h4>
                            <p className="text-sm text-gray-500">Finished "The Little Prince" chapter 3</p>
                            <p className="text-xs text-gray-400 mt-1">Yesterday, 4:15 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                            <Lightbulb size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium">Learned New Concept</h4>
                            <p className="text-sm text-gray-500">Introduction to fractions</p>
                            <p className="text-xs text-gray-400 mt-1">2 days ago, 2:00 PM</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Assigned Tasks</CardTitle>
                      <CardDescription>
                        Tasks assigned to {selectedProfile.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tasksLoading ? (
                        <div className="text-center py-8 text-gray-500">
                          Loading tasks...
                        </div>
                      ) : childTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No tasks assigned yet. Create tasks to help {selectedProfile.name} learn and grow.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {childTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              childProfile={selectedProfile}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onStatusChange={updateTaskStatus}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setTaskToEdit(null);
                          setShowTaskForm(true);
                        }}
                      >
                        <PlusCircle size={16} className="mr-2" />
                        Assign New Task
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Progress</CardTitle>
                      <CardDescription>
                        Track {selectedProfile.name}'s progress in different subjects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        Progress tracking will be available once {selectedProfile.name} completes some activities.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Parent Notes</CardTitle>
                      <CardDescription>
                        Keep notes about {selectedProfile.name}'s development, interests, or concerns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea 
                        placeholder={`Add notes about ${selectedProfile.name} here...`}
                        className="min-h-[150px]"
                        value={parentNote}
                        onChange={(e) => setParentNote(e.target.value)}
                      />
                      <Button 
                        onClick={handleSaveNote}
                        disabled={!parentNote.trim()}
                      >
                        Save Note
                      </Button>
                      
                      <div className="border-t pt-4 mt-6">
                        <h4 className="font-medium mb-3">Previous Notes</h4>
                        <div className="text-center py-4 text-gray-500">
                          No previous notes found.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-10">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a child profile</h3>
                <p className="text-gray-500 mb-6">
                  Choose a profile from the list to view details and manage activities
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add New Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Task Form Dialog */}
      <TaskFormDialog
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={taskToEdit ? handleUpdateTask : handleAddTask}
        initialData={taskToEdit || (selectedProfile ? { childId: selectedProfile.id } as Partial<TaskFormData> : undefined)}
        isEditing={!!taskToEdit}
      />
      
      {/* Profile Form Dialogs */}
      <KidProfileFormDialog
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSubmit={handleAddProfile}
        isLoading={isLoading}
      />
      
      {profileToEdit && (
        <KidProfileFormDialog
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSubmit={handleUpdateProfile}
          existingProfile={profileToEdit}
          isLoading={isLoading}
          isEditing={true}
        />
      )}
    </div>
  );
}

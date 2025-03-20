"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/task-card";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { Task, TaskFormData, SUBJECT_OPTIONS, PRIORITY_OPTIONS } from "@/lib/types/task";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  BookOpen,
  User
} from "lucide-react";

export default function ParentTasksPage() {
  // Hooks
  const { tasks, isLoading, addTask, updateTask, updateTaskStatus, deleteTask, getOverdueTasks } = useTasks();
  const { profiles, selectedProfile } = useKidProfiles();
  
  // UI state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterChild, setFilterChild] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Handle task creation
  const handleAddTask = (taskData: TaskFormData) => {
    addTask(taskData);
  };
  
  // Handle task editing
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskForm(true);
  };
  
  // Handle task update
  const handleUpdateTask = (taskData: TaskFormData) => {
    if (taskData.id) {
      updateTask(taskData.id, taskData);
      setTaskToEdit(null);
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };
  
  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Subject filter
    const matchesSubject = filterSubject === "all" || task.subject === filterSubject;
    
    // Priority filter
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    // Child filter
    const matchesChild = filterChild === "all" || task.childId === filterChild;
    
    // Status filter (tab)
    const matchesStatus = 
      activeTab === "all" || 
      (activeTab === "pending" && task.status === "pending") ||
      (activeTab === "in-progress" && task.status === "in-progress") ||
      (activeTab === "completed" && task.status === "completed") ||
      (activeTab === "overdue" && new Date() > task.dueDate && task.status !== "completed");
    
    return matchesSearch && matchesSubject && matchesPriority && matchesChild && matchesStatus;
  });
  
  // Get counts for tabs
  const pendingCount = tasks.filter(task => task.status === "pending").length;
  const inProgressCount = tasks.filter(task => task.status === "in-progress").length;
  const completedCount = tasks.filter(task => task.status === "completed").length;
  const overdueCount = getOverdueTasks().length;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Task Creation & Filters */}
        <div className="lg:w-1/3 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Tasks</h1>
            <Button 
              onClick={() => {
                setTaskToEdit(null);
                setShowTaskForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Create Task
            </Button>
          </div>
          
          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Task Summary
              </CardTitle>
              <CardDescription>Overview of all tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 p-5 rounded-xl shadow-sm hover:shadow transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">Pending</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-2 text-lg px-3 py-1">
                      {pendingCount}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-5 rounded-xl shadow-sm hover:shadow transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-yellow-100 p-3 rounded-full mb-2">
                      <BarChart3 className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="font-medium text-gray-800">In Progress</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-2 text-lg px-3 py-1">
                      {inProgressCount}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-green-50 p-5 rounded-xl shadow-sm hover:shadow transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-800">Completed</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2 text-lg px-3 py-1">
                      {completedCount}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-red-50 p-5 rounded-xl shadow-sm hover:shadow transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-3 rounded-full mb-2">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="font-medium text-gray-800">Overdue</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 mt-2 text-lg px-3 py-1">
                      {overdueCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Filters
              </CardTitle>
              <CardDescription>Narrow down your task list</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 py-6 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Filter by Subject
                  </label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    Filter by Priority
                  </label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-blue-500" />
                    Filter by Child
                  </label>
                  <Select value={filterChild} onValueChange={setFilterChild}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Children</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-gray-300 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setFilterSubject("all");
                  setFilterPriority("all");
                  setFilterChild("all");
                  setActiveTab("all");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Task List */}
        <div className="lg:w-2/3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6 p-1 bg-gray-100 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                All
                <Badge className="ml-2 bg-gray-200 text-gray-800">{tasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Pending
                <Badge className="ml-2 bg-blue-100 text-blue-800">{pendingCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                In Progress
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">{inProgressCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Completed
                <Badge className="ml-2 bg-green-100 text-green-800">{completedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Overdue
                <Badge className="ml-2 bg-red-100 text-red-800">{overdueCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading tasks...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <div className="bg-gray-200 p-4 inline-block rounded-full mb-4">
                      <PlusCircle size={24} className="text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-medium mb-4">No tasks found.</p>
                    <Button 
                      variant="outline" 
                      className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                      onClick={() => {
                        setTaskToEdit(null);
                        setShowTaskForm(true);
                      }}
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Create Your First Task
                    </Button>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    // Find the child profile for this task
                    const childProfile = profiles.find(profile => profile.id === task.childId);
                    
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        childProfile={childProfile}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={updateTaskStatus}
                      />
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Task Form Dialog */}
      <TaskFormDialog
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={taskToEdit ? handleUpdateTask : handleAddTask}
        initialData={taskToEdit || undefined}
        isEditing={!!taskToEdit}
      />
    </div>
  );
}

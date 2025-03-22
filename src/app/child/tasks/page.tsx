"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChildTaskCard } from "@/components/child-task-card";
import { ChildTaskDetailDialog } from "@/components/child-task-detail-dialog";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { Task, SUBJECT_OPTIONS, PlanStep } from "@/lib/types/task";
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock,
  Star,
  Award
} from "lucide-react";

export default function ChildTasksPage() {
  // Hooks
  const { profiles, selectedProfile } = useKidProfiles();
  const { tasks, isLoading, updateTaskStatus, getTasksByStatus, getOverdueTasks, updateTask } = useTasks(
    selectedProfile?.id
  );
  
  // UI state
  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter tasks based on active tab and filters
  const getFilteredTasks = () => {
    // First apply search and subject filters
    let filtered = tasks.filter(task => {
      const matchesSearch = 
        searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = filterSubject === "all" || task.subject === filterSubject;
      
      return matchesSearch && matchesSubject;
    });
    
    // Then filter by tab
    switch (activeTab) {
      case "today":
        return filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime() && task.status !== "completed";
        });
      case "upcoming":
        return filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() > today.getTime() && task.status !== "completed";
        });
      case "completed":
        return filtered.filter(task => task.status === "completed");
      case "all":
      default:
        return filtered;
    }
  };
  
  // Handle task start
  const handleTaskStart = (taskId: string) => {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      // Update task status
      updateTaskStatus(taskId, "in-progress");
      
      // Show task detail dialog
      setSelectedTask(task);
      setShowTaskDetail(true);
    }
  };
  
  // Handle task complete
  const handleTaskComplete = (taskId: string) => {
    updateTaskStatus(taskId, "completed");
    
    // If the task detail dialog is open, keep it open to show the celebration
    if (showTaskDetail) {
      // The dialog will show the celebration animation
    } else {
      // If completing from the card directly, no need to show the dialog
    }
  };
  
  // Handle updating plan steps
  const handleUpdatePlanSteps = (taskId: string, planSteps: PlanStep[]) => {
    // Find the task
    const taskToUpdate = tasks.find(t => t.id === taskId);
    
    if (taskToUpdate) {
      // Update the task with the new plan steps
      const updatedTask = {
        ...taskToUpdate,
        planSteps
      };
      
      // Use the updateTask function from useTasks hook
      if (typeof updateTask === 'function') {
        updateTask(updatedTask);
      }
    }
  };
  
  // Handle full task update
  const handleTaskUpdate = (updatedTask: Task) => {
    if (typeof updateTask === 'function') {
      updateTask(updatedTask);
    }
  };
  
  // Handle task continuation
  const handleTaskContinue = (taskId: string) => {
    updateTaskStatus(taskId, "in-progress");
  };
  
  // Get counts for each category
  const todayCount = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && task.status !== "completed";
  }).length;
  
  const upcomingCount = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() > today.getTime() && task.status !== "completed";
  }).length;
  
  const completedCount = getTasksByStatus("completed").length;
  
  // Get filtered tasks
  const filteredTasks = getFilteredTasks();
  
  // Calculate total points earned
  const totalPoints = getTasksByStatus("completed").reduce((total, task) => {
    return total + (task.rewardPoints || 0);
  }, 0);
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Header with welcome message */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              {selectedProfile ? `Hey ${selectedProfile.name}!` : "Hey there!"}
            </h1>
            <p className="text-gray-600">
              {todayCount > 0 
                ? `You have ${todayCount} task${todayCount > 1 ? 's' : ''} for today. Let's get started!` 
                : "No tasks for today. Check out your upcoming tasks!"}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex items-center gap-4">
            <div className="p-2 bg-amber-50 rounded-full">
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Points</p>
              <p className="text-2xl font-bold text-amber-600">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search your tasks..."
              className="pl-10 py-6 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="py-6 border-gray-200">
                <SelectValue placeholder="Filter by subject" />
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
        </div>
      </div>
      
      {/* Task tabs and content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 h-14 rounded-xl p-1 bg-gray-100">
          <TabsTrigger 
            value="today" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
          >
            <div className="flex flex-col items-center">
              <Calendar className="h-4 w-4 mb-1" />
              <span>Today ({todayCount})</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="upcoming" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <div className="flex flex-col items-center">
              <Clock className="h-4 w-4 mb-1" />
              <span>Upcoming ({upcomingCount})</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="completed" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
          >
            <div className="flex flex-col items-center">
              <CheckCircle className="h-4 w-4 mb-1" />
              <span>Completed ({completedCount})</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="all" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
          >
            <div className="flex flex-col items-center">
              <Star className="h-4 w-4 mb-1" />
              <span>All Tasks</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center border">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {activeTab === "today" 
                    ? "No tasks for today!" 
                    : activeTab === "upcoming" 
                      ? "No upcoming tasks!" 
                      : activeTab === "completed" 
                        ? "You haven't completed any tasks yet!" 
                        : "No tasks found!"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "today" 
                    ? "Enjoy your free time or check out your upcoming tasks." 
                    : activeTab === "upcoming" 
                      ? "Looks like you're all caught up! Check back later for new assignments." 
                      : activeTab === "completed" 
                        ? "Complete some tasks to see them here and earn points!" 
                        : "Try changing your search or filters to find tasks."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <ChildTaskCard
                  key={task.id}
                  task={task}
                  onStart={handleTaskStart}
                  onComplete={handleTaskComplete}
                  onContinue={handleTaskContinue}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Task detail dialog */}
      <ChildTaskDetailDialog
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
        task={selectedTask}
        onStart={handleTaskStart}
        onComplete={handleTaskComplete}
        onUpdatePlanSteps={handleUpdatePlanSteps}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}

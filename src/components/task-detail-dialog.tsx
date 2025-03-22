"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/lib/types/task";
import { KidProfile } from "@/components/kid-profile-form";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Award,
  User,
  BookOpen
} from "lucide-react";
import { LearningPlanTodoList } from "./learning-plan-todo-list";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  childProfile?: KidProfile | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  childProfile,
  onEdit,
  onDelete,
  onStatusChange
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("details");

  if (!task) return null;

  // Calculate if task is overdue
  const isOverdue = task.status !== 'completed' && new Date() > task.dueDate;
  
  // Get progress value
  const getProgressValue = () => {
    switch (task.status) {
      case "completed":
        return 100;
      case "in-progress":
        return 50;
      case "pending":
        return 0;
      case "overdue":
        return 0;
      default:
        return 0;
    }
  };
  
  // Format status for display
  const getStatusDisplay = () => {
    if (isOverdue) return "Overdue";
    return task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ');
  };
  
  // Get status badge color
  const getStatusBadgeColor = () => {
    if (isOverdue) return "bg-red-100 text-red-800";
    
    switch (task.status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle status change
  const handleStatusChange = (status: Task['status']) => {
    onStatusChange(task.id, status);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <Badge 
              variant="secondary" 
              className={`${getStatusBadgeColor()} font-medium`}
            >
              {getStatusDisplay()}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <span className="capitalize">{task.subject}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due: {format(task.dueDate, "MMM d, yyyy")}</span>
            </div>
            {childProfile && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>For: {childProfile.name}</span>
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{getProgressValue()}%</span>
          </div>
          <Progress 
            value={getProgressValue()} 
            className={`h-2 ${isOverdue ? "bg-red-500" : task.status === "completed" ? "bg-green-500" : task.status === "in-progress" ? "bg-blue-500" : "bg-gray-500"}`}
          />
        </div>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            {task.plan && <TabsTrigger value="plan">Learning Plan</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Description</h4>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">Start Date</h4>
                <p className="text-gray-600">{format(task.startDate, "MMM d, yyyy")}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Priority</h4>
                <p className="capitalize text-gray-600">{task.priority}</p>
              </div>
              
              {task.estimatedTime && (
                <div>
                  <h4 className="font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Estimated Time
                  </h4>
                  <p className="text-gray-600">{task.estimatedTime} minutes</p>
                </div>
              )}
              
              {task.recurringType && task.recurringType !== "none" && (
                <div>
                  <h4 className="font-medium text-gray-700">Recurrence</h4>
                  <p className="capitalize text-gray-600">{task.recurringType}</p>
                </div>
              )}
              
              {task.rewardPoints && (
                <div>
                  <h4 className="font-medium text-gray-700 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    Reward Points
                  </h4>
                  <p className="text-gray-600">{task.rewardPoints} points</p>
                </div>
              )}
            </div>
            
            {task.resourceUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Resource</h4>
                <a 
                  href={task.resourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  View Resource
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </TabsContent>
          
          {task.plan && (
            <TabsContent value="plan" className="mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                  <BookOpen className="h-4 w-4" />
                  AI-Generated Learning Plan
                </h4>
                {task.planSteps ? (
                  <LearningPlanTodoList 
                    planSteps={task.planSteps} 
                    onPlanStepsChange={(updatedSteps) => {
                      onEdit({
                        ...task,
                        planSteps: updatedSteps
                      });
                    }}
                    readOnly={false}
                  />
                ) : (
                  <div className="p-4 border rounded-md mt-2 prose prose-sm max-w-none whitespace-pre-wrap bg-blue-50">
                    {task.plan}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="flex justify-between items-center gap-2 pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                onDelete(task.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(task);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="flex gap-2">
            {task.status !== "completed" && (
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("completed")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            {task.status === "pending" && (
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleStatusChange("in-progress")}
              >
                Start Task
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

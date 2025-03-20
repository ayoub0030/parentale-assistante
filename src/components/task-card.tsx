"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/lib/types/task";
import { format } from "date-fns";
import { 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Award,
  User
} from "lucide-react";
import { TaskDetailDialog } from "./task-detail-dialog";
import { KidProfile } from "./kid-profile-form";

interface TaskCardProps {
  task: Task;
  childProfile?: KidProfile | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function TaskCard({ task, childProfile, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Calculate if task is overdue
  const isOverdue = task.status !== 'completed' && new Date() > task.dueDate;
  
  // Determine card styling based on priority and status
  const getPriorityColor = () => {
    if (isOverdue) return "border-red-300 bg-red-50";
    
    switch (task.priority) {
      case "high":
        return "border-orange-300 bg-orange-50";
      case "medium":
        return "border-blue-300 bg-blue-50";
      case "low":
        return "border-green-300 bg-green-50";
      default:
        return "border-gray-300";
    }
  };
  
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
  
  // Get progress color
  const getProgressColor = () => {
    if (isOverdue) return "bg-red-500";
    
    switch (task.status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Format status for display
  const getStatusDisplay = () => {
    if (isOverdue) return "Overdue";
    return task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ');
  };
  
  // Get status badge color
  const getStatusBadgeColor = () => {
    if (isOverdue) return "bg-red-100 text-red-800 hover:bg-red-200";
    
    switch (task.status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "pending":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  return (
    <>
      <Card 
        className={`overflow-hidden transition-all ${getPriorityColor()} shadow-sm hover:shadow-md cursor-pointer`}
        onClick={() => setDetailDialogOpen(true)}
      >
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{task.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
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
                        <span>{childProfile.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <Badge 
                variant="secondary" 
                className={`${getStatusBadgeColor()} font-medium`}
              >
                {getStatusDisplay()}
              </Badge>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{getProgressValue()}%</span>
              </div>
              <Progress 
                value={getProgressValue()} 
                className={`h-2 ${getProgressColor()}`}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between p-2 bg-gray-50 border-t">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
          
          <div>
            {task.status !== "completed" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, "completed");
                }}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={task}
        childProfile={childProfile}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </>
  );
}

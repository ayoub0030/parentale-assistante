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
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Award
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  
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
    <Card className={`overflow-hidden transition-all ${getPriorityColor()} ${expanded ? 'shadow-md' : 'shadow-sm'}`}>
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
          
          {/* Expandable content */}
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? "max-h-96 mt-4" : "max-h-0"
            }`}
          >
            <div className="space-y-3">
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
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-3 bg-gray-50 border-t">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(task)}
            className="h-8 px-2 text-gray-600"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(task.id)}
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 px-3"
          >
            {expanded ? "Less" : "More"}
          </Button>
          
          {task.status !== "completed" ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onStatusChange(task.id, "completed")}
              className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onStatusChange(task.id, "pending")}
              className="h-8 px-3 text-gray-600"
            >
              Reopen
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

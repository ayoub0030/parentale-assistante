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
  PlayCircle, 
  Award,
  Star,
  CheckCircle,
  BookOpen,
  Code,
  Calculator,
  Music,
  Palette,
  Globe,
  Dumbbell,
  Lightbulb
} from "lucide-react";

interface ChildTaskCardProps {
  task: Task;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onContinue: (taskId: string) => void;
}

export function ChildTaskCard({ task, onStart, onComplete, onContinue }: ChildTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // Get subject icon
  const getSubjectIcon = () => {
    switch (task.subject) {
      case "math":
        return <Calculator className="h-5 w-5 text-purple-500" />;
      case "reading":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "writing":
        return <BookOpen className="h-5 w-5 text-green-500" />;
      case "science":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case "coding":
        return <Code className="h-5 w-5 text-cyan-500" />;
      case "art":
        return <Palette className="h-5 w-5 text-pink-500" />;
      case "music":
        return <Music className="h-5 w-5 text-indigo-500" />;
      case "physical-education":
        return <Dumbbell className="h-5 w-5 text-red-500" />;
      case "languages":
        return <Globe className="h-5 w-5 text-emerald-500" />;
      default:
        return <Star className="h-5 w-5 text-amber-500" />;
    }
  };
  
  // Get card background based on subject
  const getCardBackground = () => {
    if (task.status === "completed") {
      return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
    }
    
    switch (task.subject) {
      case "math":
        return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200";
      case "reading":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
      case "writing":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
      case "science":
        return "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200";
      case "coding":
        return "bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200";
      case "art":
        return "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200";
      case "music":
        return "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200";
      case "physical-education":
        return "bg-gradient-to-br from-red-50 to-red-100 border-red-200";
      case "languages":
        return "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200";
      default:
        return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200";
    }
  };
  
  // Get progress bar color
  const getProgressColor = () => {
    if (task.status === "completed") {
      return "bg-green-500";
    }
    
    switch (task.subject) {
      case "math":
        return "bg-purple-500";
      case "reading":
        return "bg-blue-500";
      case "writing":
        return "bg-green-500";
      case "science":
        return "bg-yellow-500";
      case "coding":
        return "bg-cyan-500";
      case "art":
        return "bg-pink-500";
      case "music":
        return "bg-indigo-500";
      case "physical-education":
        return "bg-red-500";
      case "languages":
        return "bg-emerald-500";
      default:
        return "bg-amber-500";
    }
  };
  
  // Get button color based on subject
  const getButtonColor = () => {
    if (task.status === "completed") {
      return "bg-green-500 hover:bg-green-600";
    }
    
    switch (task.subject) {
      case "math":
        return "bg-purple-500 hover:bg-purple-600";
      case "reading":
        return "bg-blue-500 hover:bg-blue-600";
      case "writing":
        return "bg-green-500 hover:bg-green-600";
      case "science":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "coding":
        return "bg-cyan-500 hover:bg-cyan-600";
      case "art":
        return "bg-pink-500 hover:bg-pink-600";
      case "music":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "physical-education":
        return "bg-red-500 hover:bg-red-600";
      case "languages":
        return "bg-emerald-500 hover:bg-emerald-600";
      default:
        return "bg-amber-500 hover:bg-amber-600";
    }
  };
  
  // Handle card click to open task details
  const handleCardClick = (e: React.MouseEvent) => {
    // Only open details if not clicking on a button
    if (!(e.target as HTMLElement).closest('button')) {
      onStart(task.id);
    }
  };
  
  // Handle start button click
  const handleStart = () => {
    onStart(task.id);
  };
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 border-2 rounded-xl ${getCardBackground()} ${
        isHovered ? "transform scale-[1.02] shadow-lg" : "shadow-md"
      } cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/80 shadow-sm">
                {getSubjectIcon()}
              </div>
              <div>
                <h3 className="font-bold text-xl">{task.title}</h3>
                <p className="text-gray-600 capitalize">{task.subject}</p>
              </div>
            </div>
            
            {task.rewardPoints && (
              <Badge 
                className="bg-amber-100 text-amber-800 border border-amber-200 text-sm px-3 py-1 flex items-center gap-1"
              >
                <Award className="h-4 w-4" />
                {task.rewardPoints} points
              </Badge>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 line-clamp-2">{task.description}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(task.dueDate, "MMM d")}</span>
            </div>
            
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{task.estimatedTime} mins</span>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getProgressValue()}%</span>
            </div>
            <Progress 
              value={getProgressValue()} 
              className={`h-3 rounded-full ${getProgressColor()}`}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-white/50 border-t flex justify-between items-center">
        {task.status === "completed" ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="h-5 w-5" />
            Completed!
          </div>
        ) : (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }} 
            className={`${getButtonColor()} text-white flex items-center gap-2 rounded-full px-5 py-2 font-medium`}
          >
            {task.status === "in-progress" ? (
              <>
                <PlayCircle className="h-5 w-5" />
                Continue
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                Start
              </>
            )}
          </Button>
        )}
        
        {task.status !== "completed" && (
          <Button
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
          >
            Mark Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

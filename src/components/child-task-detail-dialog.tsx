"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types/task";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Award,
  ExternalLink,
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  BookOpen,
  Code,
  Calculator,
  Music,
  Palette,
  Globe,
  Dumbbell,
  Lightbulb,
  Star
} from "lucide-react";

interface ChildTaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onComplete: (taskId: string) => void;
  onContinue: (taskId: string) => void;
}

export function ChildTaskDetailDialog({
  open,
  onOpenChange,
  task,
  onComplete,
  onContinue
}: ChildTaskDetailDialogProps) {
  const [currentStep, setCurrentStep] = useState<"details" | "inProgress" | "completed">("details");
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(task?.status === "completed" ? "completed" : "details");
    }
  }, [open, task]);
  
  // Show celebration animation when task is completed
  useEffect(() => {
    if (currentStep === "completed") {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep]);
  
  // Handle task completion
  const handleComplete = () => {
    if (task) {
      onComplete(task.id);
      setCurrentStep("completed");
    }
  };
  
  // Handle continue task
  const handleContinue = () => {
    if (task) {
      onContinue(task.id);
      setCurrentStep("inProgress");
    }
  };
  
  // Get subject icon
  const getSubjectIcon = () => {
    if (!task) return <Star className="h-6 w-6 text-amber-500" />;
    
    switch (task.subject) {
      case "math":
        return <Calculator className="h-6 w-6 text-purple-500" />;
      case "reading":
        return <BookOpen className="h-6 w-6 text-blue-500" />;
      case "writing":
        return <BookOpen className="h-6 w-6 text-green-500" />;
      case "science":
        return <Lightbulb className="h-6 w-6 text-yellow-500" />;
      case "coding":
        return <Code className="h-6 w-6 text-cyan-500" />;
      case "art":
        return <Palette className="h-6 w-6 text-pink-500" />;
      case "music":
        return <Music className="h-6 w-6 text-indigo-500" />;
      case "physical-education":
        return <Dumbbell className="h-6 w-6 text-red-500" />;
      case "languages":
        return <Globe className="h-6 w-6 text-emerald-500" />;
      default:
        return <Star className="h-6 w-6 text-amber-500" />;
    }
  };
  
  // Get button color based on subject
  const getButtonColor = () => {
    if (!task) return "bg-amber-500 hover:bg-amber-600";
    
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
  
  // Render content based on current step
  const renderContent = () => {
    if (!task) return null;
    
    switch (currentStep) {
      case "details":
        return (
          <>
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getSubjectIcon()}
                </div>
                <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">What you'll do:</h3>
                <p className="text-gray-700">{task.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{format(task.dueDate, "MMMM d, yyyy")}</p>
                  </div>
                </div>
                
                {task.estimatedTime && (
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time Needed</p>
                      <p className="font-medium">{task.estimatedTime} minutes</p>
                    </div>
                  </div>
                )}
                
                {task.rewardPoints && (
                  <div className="bg-amber-50 p-4 rounded-lg flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-amber-600">Reward</p>
                      <p className="font-medium">{task.rewardPoints} points</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                  <div className="capitalize font-medium text-blue-600 flex items-center gap-2">
                    {getSubjectIcon()}
                    {task.subject} Activity
                  </div>
                </div>
              </div>
              
              {task.resourceUrl && (
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-medium mb-2">Resources</h3>
                  <a 
                    href={task.resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Learning Resource
                  </a>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
              
              <Button 
                onClick={handleContinue}
                className={`${getButtonColor()} text-white gap-2 px-6`}
              >
                <PlayCircle className="h-5 w-5" />
                {task.status === "in-progress" ? "Continue Task" : "Start Task"}
              </Button>
            </DialogFooter>
          </>
        );
        
      case "inProgress":
        return (
          <>
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getSubjectIcon()}
                </div>
                <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Instructions:</h3>
                <p className="text-gray-700">{task.description}</p>
              </div>
              
              {task.resourceUrl && (
                <div className="border rounded-lg p-6 bg-white text-center">
                  <h3 className="text-lg font-medium mb-4">Your Learning Resource</h3>
                  <a 
                    href={task.resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${getButtonColor()} text-white py-3 px-6 rounded-lg inline-flex items-center gap-2`}
                  >
                    <ExternalLink className="h-5 w-5" />
                    Open Resource
                  </a>
                  <p className="mt-4 text-sm text-gray-500">
                    Click the button above to open your learning materials
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-center text-gray-700 mb-2">
                  When you've finished this task, click the button below:
                </p>
                <Button 
                  onClick={handleComplete}
                  className="bg-green-500 hover:bg-green-600 text-white w-full gap-2 py-6 text-lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  I've Completed This Task!
                </Button>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("details")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Details
              </Button>
            </DialogFooter>
          </>
        );
        
      case "completed":
        return (
          <>
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold text-center text-green-600">
                Great Job!
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-10 space-y-6 text-center">
              <div className={`flex justify-center ${showCelebration ? 'animate-bounce' : ''}`}>
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold">You completed: {task.title}</h3>
                <p className="text-gray-600">Way to go! Keep up the good work!</p>
              </div>
              
              {task.rewardPoints && (
                <div className={`bg-amber-50 p-6 rounded-lg max-w-xs mx-auto ${showCelebration ? 'animate-pulse' : ''}`}>
                  <div className="flex justify-center mb-2">
                    <Award className={`h-8 w-8 text-amber-500 ${showCelebration ? 'animate-spin' : ''}`} />
                  </div>
                  <p className="text-amber-800 font-medium">You earned</p>
                  <p className="text-2xl font-bold text-amber-700">{task.rewardPoints} points</p>
                </div>
              )}
              
              {/* Simple celebration stars */}
              {showCelebration && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="star-1 absolute w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ top: '10%', left: '20%' }}></div>
                  <div className="star-2 absolute w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ top: '20%', right: '15%' }}></div>
                  <div className="star-3 absolute w-5 h-5 bg-pink-400 rounded-full animate-ping" style={{ bottom: '30%', left: '10%' }}></div>
                  <div className="star-4 absolute w-4 h-4 bg-green-400 rounded-full animate-ping" style={{ bottom: '20%', right: '20%' }}></div>
                  <div className="star-5 absolute w-6 h-6 bg-purple-400 rounded-full animate-ping" style={{ top: '40%', left: '50%' }}></div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-center border-t pt-4">
              <Button 
                onClick={() => onOpenChange(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2 px-6"
              >
                Return to Tasks
              </Button>
            </DialogFooter>
          </>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

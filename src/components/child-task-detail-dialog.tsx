"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, PlanStep } from "@/lib/types/task";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  ExternalLink,
  Award,
  Brain,
  Lightbulb,
  PartyPopper,
  Star,
  ArrowLeft,
  PlayCircle,
  Code,
  Calculator,
  Music,
  Palette,
  Globe,
  Dumbbell,
  Trophy,
  Gift,
  Sparkles
} from "lucide-react";
import { LearningPlanTodoList } from "./learning-plan-todo-list";

interface ChildTaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onUpdatePlanSteps?: (taskId: string, planSteps: PlanStep[]) => void;
  onTaskUpdate?: (task: Task) => void;
}

export function ChildTaskDetailDialog({
  open,
  onOpenChange,
  task,
  onStart,
  onComplete,
  onUpdatePlanSteps,
  onTaskUpdate
}: ChildTaskDetailDialogProps) {
  const [currentStep, setCurrentStep] = useState<"details" | "inProgress" | "completed">("details");
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("info");
  const [showReward, setShowReward] = useState(false);
  
  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(task?.status === "completed" ? "completed" : "details");
      setActiveTab("info");
    }
  }, [open, task]);
  
  // Show celebration animation when task is completed
  useEffect(() => {
    if (currentStep === "completed") {
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowReward(true);
      }, 2000);
      
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
      onStart(task.id);
      setCurrentStep("inProgress");
    }
  };
  
  // Handle plan steps change
  const handlePlanStepsChange = (updatedSteps: PlanStep[]) => {
    if (task && onUpdatePlanSteps) {
      onUpdatePlanSteps(task.id, updatedSteps);
    }
    
    if (task && onTaskUpdate) {
      onTaskUpdate({
        ...task,
        planSteps: updatedSteps
      });
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
  
  // Get background color based on subject
  const getBackgroundColor = () => {
    if (!task) return "from-amber-50 to-amber-100";
    
    switch (task.subject) {
      case "math":
        return "from-purple-50 to-purple-100";
      case "reading":
        return "from-blue-50 to-blue-100";
      case "writing":
        return "from-green-50 to-green-100";
      case "science":
        return "from-yellow-50 to-yellow-100";
      case "coding":
        return "from-cyan-50 to-cyan-100";
      case "art":
        return "from-pink-50 to-pink-100";
      case "music":
        return "from-indigo-50 to-indigo-100";
      case "physical-education":
        return "from-red-50 to-red-100";
      case "languages":
        return "from-emerald-50 to-emerald-100";
      default:
        return "from-amber-50 to-amber-100";
    }
  };
  
  // Render content based on current step
  const renderContent = () => {
    if (!task) return null;
    
    switch (currentStep) {
      case "details":
        return (
          <>
            <DialogHeader className={`pb-4 border-b bg-gradient-to-r ${getBackgroundColor()} rounded-t-lg p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-white/80 shadow-sm">
                  {getSubjectIcon()}
                </div>
                <h2 className="text-2xl font-bold">{task.title}</h2>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4 px-4">
              <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl p-1 bg-gray-100">
                <TabsTrigger 
                  value="info" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <Star className="h-4 w-4 mb-1" />
                    <span>Task Info</span>
                  </div>
                </TabsTrigger>
                
                {task.plan && (
                  <TabsTrigger 
                    value="plan" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <div className="flex flex-col items-center">
                      <Brain className="h-4 w-4 mb-1" />
                      <span>Learning Plan</span>
                    </div>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="info" className="mt-4 space-y-6">
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
                      className="text-blue-600 hover:underline flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Open Learning Resource</span>
                    </a>
                  </div>
                )}
              </TabsContent>
              
              {task.plan && (
                <TabsContent value="plan" className="mt-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Your Learning Plan
                    </h3>
                    
                    <LearningPlanTodoList 
                      planText={task.plan}
                      planSteps={task.planSteps}
                      onPlanStepsChange={(updatedSteps) => {
                        const updatedTask = {
                          ...task,
                          planSteps: updatedSteps
                        };
                        if (onTaskUpdate) {
                          onTaskUpdate(updatedTask);
                        }
                      }}
                      readOnly={false}
                    />
                  </div>
                </TabsContent>
              )}
            </Tabs>
            
            <DialogFooter className="flex justify-between mt-6 pt-4 border-t px-4 pb-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex gap-2">
                {task.status === "completed" ? (
                  <Badge className="bg-green-100 text-green-800 py-2 px-3 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </Badge>
                ) : task.status === "in-progress" ? (
                  <Button
                    onClick={handleComplete}
                    className={`${getButtonColor()} gap-2`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </Button>
                ) : (
                  <Button
                    onClick={handleContinue}
                    className={`${getButtonColor()} gap-2`}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Task
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        );
        
      case "inProgress":
        return (
          <div className="py-10 px-6 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <PlayCircle className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're doing great!</h2>
              <p className="text-gray-600 mb-6">
                Keep working on "{task.title}". You can do it!
              </p>
              
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>50%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("details")}
                >
                  View Details
                </Button>
                <Button
                  onClick={handleComplete}
                  className={`${getButtonColor()}`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
              </div>
            </div>
          </div>
        );
        
      case "completed":
        return (
          <div className="py-10 px-6 text-center">
            {showCelebration ? (
              <div className="mb-6 animate-bounce relative">
                <div className="mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-50"></div>
                  <div className="relative w-full h-full rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2 text-green-600">Amazing Job!</h2>
                <p className="text-xl text-gray-600">
                  You completed "{task.title}"!
                </p>
                
                {/* CSS-based confetti */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="confetti-piece absolute w-3 h-8 bg-red-500 opacity-80 animate-confetti" style={{ left: '10%', top: '-5%', transform: 'rotate(15deg)' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-yellow-500 opacity-80 animate-confetti" style={{ left: '20%', top: '-5%', transform: 'rotate(32deg)', animationDelay: '0.1s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-blue-500 opacity-80 animate-confetti" style={{ left: '30%', top: '-5%', transform: 'rotate(43deg)', animationDelay: '0.2s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-green-500 opacity-80 animate-confetti" style={{ left: '40%', top: '-5%', transform: 'rotate(12deg)', animationDelay: '0.3s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-purple-500 opacity-80 animate-confetti" style={{ left: '50%', top: '-5%', transform: 'rotate(24deg)', animationDelay: '0.4s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-pink-500 opacity-80 animate-confetti" style={{ left: '60%', top: '-5%', transform: 'rotate(60deg)', animationDelay: '0.5s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-indigo-500 opacity-80 animate-confetti" style={{ left: '70%', top: '-5%', transform: 'rotate(35deg)', animationDelay: '0.6s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-orange-500 opacity-80 animate-confetti" style={{ left: '80%', top: '-5%', transform: 'rotate(25deg)', animationDelay: '0.7s' }}></div>
                  <div className="confetti-piece absolute w-3 h-8 bg-teal-500 opacity-80 animate-confetti" style={{ left: '90%', top: '-5%', transform: 'rotate(40deg)', animationDelay: '0.8s' }}></div>
                </div>
              </div>
            ) : showReward ? (
              <div className="mb-6">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-50"></div>
                  <div className="relative w-full h-full rounded-full bg-amber-100 flex items-center justify-center">
                    <Trophy className="h-16 w-16 text-amber-500" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-amber-600">You earned a reward!</h2>
                
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-6 w-6 text-amber-500" />
                    <h3 className="text-xl font-bold text-amber-700">{task.rewardPoints || 0} Points</h3>
                  </div>
                  <p className="text-amber-700">
                    Great work! Keep completing tasks to earn more points and unlock special rewards!
                  </p>
                </div>
                
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Continue Learning
                </Button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Task Completed!</h2>
                <p className="text-gray-600 mb-6">
                  You've successfully completed "{task.title}".
                </p>
                
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Back to Tasks
                </Button>
              </div>
            )}
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

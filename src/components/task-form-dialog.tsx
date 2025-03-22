"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Clock, Link, Award, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskFormData, SUBJECT_OPTIONS, PRIORITY_OPTIONS, RECURRING_OPTIONS, PlanStep } from "@/lib/types/task";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";
import { PlanPreviewDialog } from "./plan-preview-dialog";
import { toast } from "@/components/ui/use-toast";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  isEditing?: boolean;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false
}: TaskFormDialogProps) {
  const { profiles } = useKidProfiles();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [childId, setChildId] = useState(initialData?.childId || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [dueDate, setDueDate] = useState<Date>(initialData?.dueDate || new Date());
  const [startDate, setStartDate] = useState<Date>(initialData?.startDate || new Date());
  const [priority, setPriority] = useState<"high" | "medium" | "low">(initialData?.priority || "medium");
  const [estimatedTime, setEstimatedTime] = useState(initialData?.estimatedTime?.toString() || "");
  const [recurringType, setRecurringType] = useState(initialData?.recurringType || "none");
  const [resourceUrl, setResourceUrl] = useState(initialData?.resourceUrl || "");
  const [rewardPoints, setRewardPoints] = useState(initialData?.rewardPoints?.toString() || "");
  
  // Plan generation state
  const [plan, setPlan] = useState(initialData?.plan || "");
  const [planSteps, setPlanSteps] = useState(initialData?.planSteps || []);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  // Advanced settings toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setChildId(initialData.childId || "");
      setSubject(initialData.subject || "");
      setDueDate(initialData.dueDate || new Date());
      setStartDate(initialData.startDate || new Date());
      setPriority(initialData.priority || "medium");
      setEstimatedTime(initialData.estimatedTime?.toString() || "");
      setRecurringType(initialData.recurringType || "none");
      setResourceUrl(initialData.resourceUrl || "");
      setRewardPoints(initialData.rewardPoints?.toString() || "");
      setPlan(initialData.plan || "");
      setPlanSteps(initialData.planSteps || []);
    }
  }, [initialData]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: TaskFormData = {
      title,
      description,
      childId,
      subject,
      dueDate,
      startDate,
      priority,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined,
      recurringType: recurringType as "none" | "daily" | "weekly",
      resourceUrl: resourceUrl || undefined,
      rewardPoints: rewardPoints ? parseInt(rewardPoints, 10) : undefined,
      plan,
      planSteps,
    };
    
    // If editing, include the id and submit directly
    if (isEditing && initialData?.id) {
      formData.id = initialData.id;
      onSubmit(formData);
      onOpenChange(false);
      return;
    }
    
    // For new tasks, generate a plan
    try {
      // Get the selected child profile
      const selectedChild = profiles.find(profile => profile.id === childId);
      
      if (!selectedChild) {
        toast({
          title: "Error",
          description: "Child profile not found. Please select a valid child.",
          variant: "destructive",
        });
        return;
      }
      
      // Show the plan dialog with loading state
      setIsGeneratingPlan(true);
      setIsPlanDialogOpen(true);
      
      // Get the API key from localStorage
      const apiKey = localStorage.getItem('geminiApiKey') || 'AIzaSyBwdyYJYFTLzxlt2kMWDzub-OIirRPZJLI';
      
      // Call the API to generate a plan
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: formData,
          childProfile: selectedChild,
          apiKey
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }
      
      const data = await response.json();
      setPlan(data.plan);
      setIsGeneratingPlan(false);
    } catch (error) {
      console.error('Error generating plan:', error);
      setIsGeneratingPlan(false);
      toast({
        title: "Error Generating Plan",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      // Close the plan dialog and submit the form without a plan
      setIsPlanDialogOpen(false);
      onSubmit(formData);
      onOpenChange(false);
    }
  };
  
  // Handle plan submission
  const handlePlanSubmit = (updatedPlan: string, updatedPlanSteps?: PlanStep[]) => {
    setPlan(updatedPlan);
    if (updatedPlanSteps) {
      setPlanSteps(updatedPlanSteps);
    }
    
    // Continue with form submission
    const formData: TaskFormData = {
      title,
      description,
      childId,
      subject,
      dueDate,
      startDate,
      priority,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined,
      recurringType: recurringType as "none" | "daily" | "weekly",
      resourceUrl: resourceUrl || undefined,
      rewardPoints: rewardPoints ? parseInt(rewardPoints, 10) : undefined,
      plan: updatedPlan,
      planSteps: updatedPlanSteps || planSteps
    };
    
    // If editing, include the id
    if (isEditing && initialData?.id) {
      formData.id = initialData.id;
    }
    
    onSubmit(formData);
    onOpenChange(false);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogDescription>
              Fill out the form below to {isEditing ? "update the" : "create a new"} task.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description / Instructions</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed instructions for this task"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child">Assign To</Label>
                  <Select value={childId} onValueChange={setChildId} required>
                    <SelectTrigger id="child">
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject / Category</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)} required>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Advanced Settings Toggle */}
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-2"
              >
                {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
              </Button>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Time (minutes)
                    </Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      placeholder="e.g., 30"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recurringType" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Recurring Task
                    </Label>
                    <Select 
                      value={recurringType} 
                      onValueChange={(value: "none" | "daily" | "weekly") => setRecurringType(value)}
                    >
                      <SelectTrigger id="recurringType">
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRING_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resourceUrl" className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Resource URL
                    </Label>
                    <Input
                      id="resourceUrl"
                      type="url"
                      placeholder="https://example.com/resource"
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rewardPoints" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Reward Points
                    </Label>
                    <Input
                      id="rewardPoints"
                      type="number"
                      placeholder="e.g., 10"
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <PlanPreviewDialog
        open={isPlanDialogOpen}
        onOpenChange={setIsPlanDialogOpen}
        plan={plan}
        onPlanChange={setPlan}
        onSubmit={handlePlanSubmit}
        isLoading={isGeneratingPlan}
      />
    </>
  );
}

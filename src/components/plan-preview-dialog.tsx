"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { LearningPlanTodoList } from "./learning-plan-todo-list";
import { PlanStep } from "@/lib/types/task";

interface PlanPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: string;
  onPlanChange: (plan: string) => void;
  onSubmit: (plan: string, planSteps?: PlanStep[]) => void;
  isLoading?: boolean;
}

export function PlanPreviewDialog({
  open,
  onOpenChange,
  plan,
  onPlanChange,
  onSubmit,
  isLoading = false
}: PlanPreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);

  const handleSubmit = () => {
    onSubmit(plan, planSteps);
    onOpenChange(false);
  };

  const handlePlanStepsChange = (steps: PlanStep[]) => {
    setPlanSteps(steps);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            AI-Generated Learning Plan
          </DialogTitle>
          <DialogDescription>
            Review and customize the AI-generated learning plan for this task.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground">Generating personalized learning plan...</p>
          </div>
        ) : (
          <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-4 border rounded-md mt-2 min-h-[400px] max-h-[500px] overflow-y-auto">
              <LearningPlanTodoList 
                planText={plan} 
                onPlanStepsChange={handlePlanStepsChange}
                readOnly={true}
              />
            </TabsContent>
            <TabsContent value="edit" className="mt-2">
              <Textarea
                value={plan}
                onChange={(e) => onPlanChange(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="The AI-generated plan will appear here. You can edit it if needed."
              />
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Save Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

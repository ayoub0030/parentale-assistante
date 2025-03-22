"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PlanStep } from "@/lib/types/task";
import { CheckCircle, CheckCheck, PartyPopper } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface LearningPlanTodoListProps {
  planText?: string;
  planSteps?: PlanStep[];
  onPlanStepsChange: (steps: PlanStep[]) => void;
  readOnly?: boolean;
}

export function LearningPlanTodoList({ 
  planText, 
  planSteps: initialPlanSteps, 
  onPlanStepsChange,
  readOnly = false
}: LearningPlanTodoListProps) {
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Parse the plan text into steps on first render or when plan changes
  useEffect(() => {
    if (initialPlanSteps && initialPlanSteps.length > 0) {
      // Use saved steps if available
      setSteps(initialPlanSteps);
      checkAllCompleted(initialPlanSteps);
      setProgress(calculateProgress(initialPlanSteps));
    } else if (planText) {
      // Otherwise parse the plan text
      const parsedSteps = parsePlanIntoSteps(planText);
      setSteps(parsedSteps);
      setProgress(calculateProgress(parsedSteps));
      
      // Notify parent component of the initial steps
      // But only if we're actually parsing new steps from text
      if (onPlanStepsChange && !initialPlanSteps) {
        onPlanStepsChange(parsedSteps);
      }
    }
  // Remove onPlanStepsChange from dependencies to prevent infinite loops
  }, [planText, initialPlanSteps]);

  // Check if all steps are completed
  const checkAllCompleted = (steps: PlanStep[]) => {
    const completed = steps.length > 0 && steps.every(step => step.isCompleted);
    setAllCompleted(completed);
  };

  // Calculate progress percentage
  const calculateProgress = (steps: PlanStep[]): number => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Parse the plan text into steps
  const parsePlanIntoSteps = (planText: string): PlanStep[] => {
    if (!planText) return [];

    // Split by common list markers
    const lines = planText.split('\n');
    const steps: PlanStep[] = [];
    
    let currentSection = '';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      // Check if this is a section header
      if (trimmedLine.endsWith(':') || 
          /^#+\s+/.test(trimmedLine) || // Markdown headers
          /^[A-Z\s]+:$/.test(trimmedLine)) { // ALL CAPS followed by colon
        currentSection = trimmedLine;
        return;
      }
      
      // Check if line is a list item
      const isListItem = /^[-*•]|\d+\.|\d+\)/.test(trimmedLine);
      
      if (isListItem) {
        // Remove the list marker
        const stepText = trimmedLine.replace(/^[-*•]|\d+\.|\d+\)\s*/, '').trim();
        
        if (stepText) {
          steps.push({
            id: uuidv4(),
            text: stepText,
            isCompleted: false
          });
        }
      } else if (trimmedLine && currentSection) {
        // If not a list item but has content and we're in a section, add it as a step
        steps.push({
          id: uuidv4(),
          text: `${currentSection}: ${trimmedLine}`,
          isCompleted: false
        });
        currentSection = ''; // Reset current section
      } else if (trimmedLine) {
        // Regular text that isn't a list item or in a section
        steps.push({
          id: uuidv4(),
          text: trimmedLine,
          isCompleted: false
        });
      }
    });

    return steps;
  };

  // Toggle step completion
  const toggleStepCompletion = (stepId: string) => {
    if (readOnly) return;
    
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
    );
    setSteps(updatedSteps);
    checkAllCompleted(updatedSteps);
    setProgress(calculateProgress(updatedSteps));
    
    // Only notify parent if we need to
    if (onPlanStepsChange) {
      onPlanStepsChange(updatedSteps);
    }
  };

  // Mark all steps as completed or uncompleted
  const toggleAllSteps = () => {
    if (readOnly) return;
    
    const shouldComplete = !allCompleted;
    const updatedSteps = steps.map(step => ({
      ...step,
      isCompleted: shouldComplete
    }));
    
    setSteps(updatedSteps);
    setAllCompleted(shouldComplete);
    setProgress(shouldComplete ? 100 : 0);
    
    // Only notify parent if we need to
    if (onPlanStepsChange) {
      onPlanStepsChange(updatedSteps);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-blue-700">Your Learning Steps</h3>
          <div className="text-sm text-blue-600">Progress: {progress}%</div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleAllSteps}
          className="text-xs flex items-center gap-1"
          disabled={readOnly}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {allCompleted ? 'Uncheck All' : 'Check All'}
        </Button>
      </div>
      
      <div className="space-y-2">
        {steps.length === 0 ? (
          <p className="text-gray-500 italic">No steps found in the learning plan.</p>
        ) : (
          steps.map((step) => (
            <div 
              key={step.id} 
              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                step.isCompleted 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Checkbox 
                id={`step-${step.id}`}
                checked={step.isCompleted}
                onCheckedChange={() => toggleStepCompletion(step.id)}
                disabled={readOnly}
                className={step.isCompleted ? "bg-green-500 border-green-500" : ""}
              />
              <label 
                htmlFor={`step-${step.id}`} 
                className={`text-sm cursor-pointer flex-1 ${
                  step.isCompleted ? 'text-green-800 line-through' : 'text-gray-700'
                }`}
              >
                {step.text}
              </label>
              {step.isCompleted && (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
      
      {allCompleted && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <PartyPopper className="h-6 w-6 text-green-600 animate-bounce" />
          </div>
          <p className="font-medium text-green-800">
            Amazing! You've completed all the learning steps!
          </p>
        </div>
      )}
    </div>
  );
}

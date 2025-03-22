export interface Task {
  id: string;
  title: string;
  description: string;
  childId: string;
  subject: string;
  dueDate: Date;
  startDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  estimatedTime?: number; // in minutes
  recurringType?: 'none' | 'daily' | 'weekly';
  resourceUrl?: string;
  rewardPoints?: number;
  plan?: string; // Original AI-generated learning plan text
  planSteps?: PlanStep[]; // Parsed plan steps for interactive to-do list
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export type TaskFormData = Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export const SUBJECT_OPTIONS = [
  { label: 'Math', value: 'math' },
  { label: 'Reading', value: 'reading' },
  { label: 'Writing', value: 'writing' },
  { label: 'Science', value: 'science' },
  { label: 'Coding', value: 'coding' },
  { label: 'Art', value: 'art' },
  { label: 'Music', value: 'music' },
  { label: 'Physical Education', value: 'physical-education' },
  { label: 'Languages', value: 'languages' },
  { label: 'Other', value: 'other' }
];

export const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

export const RECURRING_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' }
];

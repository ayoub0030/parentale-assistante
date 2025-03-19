"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { Task, TaskFormData } from "../types/task";
import { v4 as uuidv4 } from "uuid";

export function useTasks(childId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  // Load tasks from Supabase
  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      let query = supabase.from("tasks").select("*");
      
      // If childId is provided, filter tasks for that child
      if (childId) {
        query = query.eq("childId", childId);
      }
      
      const { data, error } = await query.order("dueDate", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Convert string dates to Date objects
      const formattedTasks = data.map(task => ({
        ...task,
        dueDate: new Date(task.dueDate),
        startDate: new Date(task.startDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
      
      setTasks(formattedTasks);
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setError(err.message || "Failed to load tasks");
      
      // Fallback to local storage if Supabase fails
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks);
          const formattedTasks = parsedTasks.map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate),
            startDate: new Date(task.startDate),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }));
          
          // Filter by childId if provided
          const filteredTasks = childId 
            ? formattedTasks.filter((task: Task) => task.childId === childId)
            : formattedTasks;
            
          setTasks(filteredTasks);
        } catch (parseError) {
          console.error("Error parsing stored tasks:", parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new task
  const addTask = async (taskData: TaskFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      // Format dates for Supabase
      const supabaseTask = {
        ...newTask,
        dueDate: newTask.dueDate.toISOString(),
        startDate: newTask.startDate.toISOString(),
        createdAt: newTask.createdAt.toISOString(),
        updatedAt: newTask.updatedAt.toISOString()
      };
      
      const { error } = await supabase.from("tasks").insert(supabaseTask);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setTasks(prev => [...prev, newTask]);
      
      // Backup to localStorage
      const updatedTasks = [...tasks, newTask];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      
      return newTask;
    } catch (err: any) {
      console.error("Error adding task:", err);
      setError(err.message || "Failed to add task");
      
      // Still update localStorage as fallback
      try {
        const newTask: Task = {
          ...taskData,
          id: uuidv4(),
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const updatedTasks = [...tasks, newTask];
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        
        // Update local state
        setTasks(updatedTasks);
        
        return newTask;
      } catch (localErr) {
        console.error("Error with localStorage fallback:", localErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, taskData: Partial<TaskFormData>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      // Find the task to update
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        throw new Error("Task not found");
      }
      
      // Create updated task
      const updatedTask: Task = {
        ...tasks[taskIndex],
        ...taskData,
        updatedAt: new Date()
      };
      
      // Format dates for Supabase
      const supabaseTask = {
        ...updatedTask,
        dueDate: updatedTask.dueDate.toISOString(),
        startDate: updatedTask.startDate.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString()
      };
      
      const { error } = await supabase
        .from("tasks")
        .update(supabaseTask)
        .eq("id", taskId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
      
      // Backup to localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      
      return updatedTask;
    } catch (err: any) {
      console.error("Error updating task:", err);
      setError(err.message || "Failed to update task");
      
      // Still update localStorage as fallback
      try {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const updatedTask: Task = {
            ...tasks[taskIndex],
            ...taskData,
            updatedAt: new Date()
          };
          
          const updatedTasks = [...tasks];
          updatedTasks[taskIndex] = updatedTask;
          
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));
          
          // Update local state
          setTasks(updatedTasks);
          
          return updatedTask;
        }
      } catch (localErr) {
        console.error("Error with localStorage fallback:", localErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    return updateTask(taskId, { status } as any);
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Backup to localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (err: any) {
      console.error("Error deleting task:", err);
      setError(err.message || "Failed to delete task");
      
      // Still update localStorage as fallback
      try {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        
        // Update local state
        setTasks(updatedTasks);
      } catch (localErr) {
        console.error("Error with localStorage fallback:", localErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks by status
  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  // Filter tasks by subject
  const getTasksBySubject = (subject: string) => {
    return tasks.filter(task => task.subject === subject);
  };

  // Filter tasks by priority
  const getTasksByPriority = (priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority);
  };

  // Get overdue tasks
  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate < now
    );
  };

  // Load tasks on component mount or when childId changes
  useEffect(() => {
    loadTasks();
  }, [childId, supabase]);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksByStatus,
    getTasksBySubject,
    getTasksByPriority,
    getOverdueTasks,
    refreshTasks: loadTasks
  };
}

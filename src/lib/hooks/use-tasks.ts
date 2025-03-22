"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { Task, TaskFormData } from "../types/task";
import { v4 as uuidv4 } from "uuid";

export function useTasks(childId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, isInitialized } = useSupabase();

  // Load tasks from Supabase
  const loadTasks = useCallback(async () => {
    if (!isInitialized) {
      console.log("Waiting for Supabase to initialize...");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Check if tasks table exists
      try {
        const { count, error: tableError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true });
          
        if (tableError) {
          console.warn("Tasks table might not exist:", tableError.message);
        }
      } catch (tableCheckError) {
        console.warn("Error checking tasks table:", tableCheckError);
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
      
      if (!data || data.length === 0) {
        console.log("No tasks found in database, using localStorage fallback");
        useLocalStorageFallback();
        return;
      }
      
      // Convert string dates to Date objects
      const formattedTasks = data.map(task => ({
        ...task,
        dueDate: new Date(task.dueDate),
        startDate: new Date(task.startDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        planSteps: task.planSteps ? JSON.parse(task.planSteps) : null
      }));
      
      setTasks(formattedTasks);
      
      // Also update localStorage as backup
      localStorage.setItem("tasks", JSON.stringify(data));
      
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setError(err.message || "Failed to load tasks");
      
      useLocalStorageFallback();
    } finally {
      setIsLoading(false);
    }
  }, [supabase, childId, isInitialized]);
  
  // Helper function for localStorage fallback
  const useLocalStorageFallback = () => {
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
          updatedAt: new Date(task.updatedAt),
          planSteps: task.planSteps ? JSON.parse(task.planSteps) : null
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
  };

  // Add a new task
  const addTask = async (taskData: TaskFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      // Create a new task object
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to Supabase
      const { error } = await supabase
        .from("tasks")
        .insert([{
          ...newTask,
          dueDate: newTask.dueDate.toISOString(),
          startDate: newTask.startDate.toISOString(),
          createdAt: newTask.createdAt.toISOString(),
          updatedAt: newTask.updatedAt.toISOString(),
          plan: newTask.plan || null,
          planSteps: newTask.planSteps ? JSON.stringify(newTask.planSteps) : null
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Update state with the new task
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      // Also update localStorage as backup
      const storedTasks = localStorage.getItem("tasks");
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      parsedTasks.push({
        ...newTask,
        dueDate: newTask.dueDate.toISOString(),
        startDate: newTask.startDate.toISOString(),
        createdAt: newTask.createdAt.toISOString(),
        updatedAt: newTask.updatedAt.toISOString(),
        planSteps: newTask.planSteps ? JSON.stringify(newTask.planSteps) : null
      });
      localStorage.setItem("tasks", JSON.stringify(parsedTasks));
      
      return newTask;
    } catch (err: any) {
      console.error("Error adding task:", err);
      setError(err.message || "Failed to add task");
      
      // Still add to local state and localStorage as fallback
      try {
        const newTask: Task = {
          ...taskData,
          id: uuidv4(),
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        const storedTasks = localStorage.getItem("tasks");
        const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
        parsedTasks.push({
          ...newTask,
          dueDate: newTask.dueDate.toISOString(),
          startDate: newTask.startDate.toISOString(),
          createdAt: newTask.createdAt.toISOString(),
          updatedAt: newTask.updatedAt.toISOString(),
          planSteps: newTask.planSteps ? JSON.stringify(newTask.planSteps) : null
        });
        localStorage.setItem("tasks", JSON.stringify(parsedTasks));
        
        return newTask;
      } catch (fallbackError) {
        console.error("Error with localStorage fallback:", fallbackError);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (updatedTaskData: Task) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      // Find the task to update
      const taskIndex = tasks.findIndex(task => task.id === updatedTaskData.id);
      if (taskIndex === -1) {
        throw new Error("Task not found");
      }
      
      // Create updated task with current timestamp
      const updatedTask: Task = {
        ...updatedTaskData,
        updatedAt: new Date()
      };
      
      // Format dates and data for Supabase
      const supabaseTask = {
        ...updatedTask,
        dueDate: updatedTask.dueDate.toISOString(),
        startDate: updatedTask.startDate.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
        plan: updatedTask.plan || null,
        planSteps: updatedTask.planSteps ? JSON.stringify(updatedTask.planSteps) : null
      };
      
      const { error } = await supabase
        .from("tasks")
        .update(supabaseTask)
        .eq("id", updatedTask.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
      
      // Backup to localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks.map(task => ({
        ...task,
        dueDate: task.dueDate.toISOString(),
        startDate: task.startDate.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        planSteps: task.planSteps
      }))));
      
      return updatedTask;
    } catch (err: any) {
      console.error("Error updating task:", err);
      setError(err.message || "Failed to update task");
      
      // Still update localStorage as fallback
      try {
        const taskIndex = tasks.findIndex(task => task.id === updatedTaskData.id);
        if (taskIndex !== -1) {
          const updatedTask: Task = {
            ...updatedTaskData,
            updatedAt: new Date()
          };
          
          const updatedTasks = [...tasks];
          updatedTasks[taskIndex] = updatedTask;
          
          localStorage.setItem("tasks", JSON.stringify(updatedTasks.map(task => ({
            ...task,
            dueDate: task.dueDate.toISOString(),
            startDate: task.startDate.toISOString(),
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
            planSteps: task.planSteps
          }))));
          
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
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      return updateTask({
        ...taskToUpdate,
        status
      });
    }
    return null;
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
      localStorage.setItem("tasks", JSON.stringify(updatedTasks.map(task => ({
        ...task,
        dueDate: task.dueDate.toISOString(),
        startDate: task.startDate.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        planSteps: task.planSteps
      }))));
    } catch (err: any) {
      console.error("Error deleting task:", err);
      setError(err.message || "Failed to delete task");
      
      // Still update localStorage as fallback
      try {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks.map(task => ({
          ...task,
          dueDate: task.dueDate.toISOString(),
          startDate: task.startDate.toISOString(),
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          planSteps: task.planSteps
        }))));
        
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
    if (isInitialized) {
      loadTasks();
    }
  }, [childId, supabase, isInitialized, loadTasks]);

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

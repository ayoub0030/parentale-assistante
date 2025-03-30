"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pipe, type ContentItem } from "@screenpipe/browser";
import { Loader2, Send, Square, ChevronDown, Search, Plus, VideoIcon, Bot } from "lucide-react";
import { useToast } from "@/lib/use-toast";
import { motion } from "framer-motion";
import { generateId, Message } from "ai";
import { OpenAI } from "openai";
import { ChatMessage } from "@/components/chat-message";
import { useSettings } from "@/lib/hooks/use-settings";
import { useAiProvider } from "@/lib/hooks/use-ai-provider";
import { useHealthCheck } from "@/lib/hooks/use-health-check";
import { useSearchHistory } from "@/lib/hooks/use-search-history";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoGenerationModal } from "./video-generation-modal";
import { generateVideoContent, GeneratedVideoContent } from "@/lib/services/video-generation-service";
import { type Speaker } from "@screenpipe/browser";

// Import the agents from search-chat.tsx
interface Agent {
  id: string;
  name: string;
  description: string;
  dataSelector: (results: ContentItem[]) => any;
  systemPrompt: string;
}

const AGENTS: Agent[] = [
  {
    id: "context-master",
    name: "context master",
    description: "analyzes everything: apps, windows, text & audio",
    systemPrompt:
      "you analyze all types of data from screen recordings and the user is a student who need to learn python from their ocr data provide the m with help on what they are doing ",
    dataSelector: (results) => results,
  },
  {
    id: "window-detective",
    name: "window detective",
    description: "focuses on app usage patterns",
    systemPrompt:
      "you analyze all types of data from screen recordings and the user is a student who need to learn python from their ocr data provide the m with help on what they are doing.",
    dataSelector: (results) =>
      results
        .filter(
          (item) =>
            item.type === "OCR" &&
            (item.content.appName || item.content.windowName)
        )
        .map((item) => ({
          timestamp: item.content.timestamp,
          // @ts-ignore
          appName: item.content.appName,
          // @ts-ignore
          windowName: item.content.windowName,
        })),
  },
  {
    id: "text-oracle",
    name: "text oracle",
    description: "analyzes screen text (OCR)",
    systemPrompt:
      "you analyze all types of data from screen recordings and the user is a student who need to learn python from their ocr data provide the m with help on what they are doing",
    dataSelector: (results) =>
      results
        .filter((item) => item.type === "OCR")
        .map((item) => ({
          timestamp: item.content.timestamp,
          text: item.content.text,
          appName: item.content.appName,
        })),
  },
  {
    id: "voice-sage",
    name: "voice sage",
    description: "focuses on audio transcriptions",
    systemPrompt:
      "you analyze all types of data from screen recordings and the user is a student who need to learn python from their ocr data provide the m with help on what they are doing.",
    dataSelector: (results) =>
      results
        .filter((item) => item.type === "Audio")
        .map((item) => ({
          timestamp: item.content.timestamp,
          transcription: item.content.transcription,
        })),
  },
];

export function ChatInterface({ mode = "parent" }: { mode?: "parent" | "child" }) {
  // Core state
  const { toast } = useToast();
  const { settings } = useSettings();
  const { health, isServerDown } = useHealthCheck();
  const { isAvailable, error } = useAiProvider(settings);
  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null);
  
  // Search state (hidden but functional)
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 24 * 3600000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [contentType, setContentType] = useState("all");
  const [limit, setLimit] = useState(30);
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isOcrDataLoading, setIsOcrDataLoading] = useState(false);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [minLength, setMinLength] = useState(50);
  const [maxLength, setMaxLength] = useState(10000);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<Message>>([]);
  const [floatingInput, setFloatingInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const floatingInputRef = useRef<HTMLInputElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollPosition = useRef(0);
  
  // Video generation state
  const [isVideoGenerationModalOpen, setIsVideoGenerationModalOpen] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoContent, setGeneratedVideoContent] = useState<GeneratedVideoContent | null>(null);

  const MAX_CONTENT_LENGTH = settings.aiMaxContextChars;

  // Platform detection
  useEffect(() => {
    if ("userAgentData" in navigator) {
      // @ts-ignore - TypeScript doesn't know about userAgentData yet
      const platform = navigator.userAgent.toLowerCase();
      setCurrentPlatform(
        platform.includes("mac")
          ? "macos"
          : platform.includes("win")
          ? "windows"
          : platform.includes("linux")
          ? "linux"
          : "unknown"
      );
    } else {
      // Fallback to platform for older browsers
      const platform = window.navigator.platform.toLowerCase();
      setCurrentPlatform(
        platform.includes("mac")
          ? "macos"
          : platform.includes("win")
          ? "windows"
          : platform.includes("linux")
          ? "linux"
          : "unknown"
      );
    }
  }, []);

  // Perform automatic background search
  useEffect(() => {
    const performBackgroundSearch = async () => {
      try {
        console.log("Performing automatic background search for 'youtube'...");
        
        // Always perform the search to ensure fresh data
        await handleSearch(0, {
          query: "youtube",
          contentType: "all",
          startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Last 14 days
          endTime: new Date().toISOString(),
          silent: true, // Don't show loading indicators or toasts
        });
        
        console.log("Background search completed successfully");
      } catch (error) {
        console.error("Error in background search:", error);
      }
    };
    
    // Run the background search when component mounts
    performBackgroundSearch();
    
    // Set up periodic search every 5 minutes (300,000ms)
    const searchInterval = setInterval(performBackgroundSearch, 300000);
    
    return () => {
      clearInterval(searchInterval);
    };
  }, []);

  // Add scroll button visibility handler
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      const scrollPercentage =
        (currentScrollPosition /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      const shouldShow = scrollPercentage < 90; // Show when scrolled up more than 10%

      setShowScrollButton(shouldShow);

      // Check if user is scrolling up while AI is loading
      if (isAiLoading && currentScrollPosition < lastScrollPosition.current) {
        setIsUserScrolling(true);
      }

      lastScrollPosition.current = currentScrollPosition;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAiLoading]);

  // Add keyboard shortcut handler for chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        if (floatingInputRef.current) {
          floatingInputRef.current.focus();
        }
      } else if (event.key === "Escape") {
        setFloatingInput("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search handling
  const handleSearch = async (newOffset = 0, overrides: any = {}) => {
    // Skip loading state if in silent mode
    if (!overrides.silent) {
      setIsSearchLoading(true);
    }
    
    try {
      const startTime = overrides.startTime || startDate.toISOString();
      const endTime = overrides.endTime || endDate.toISOString();

      const params: any = {
        query: overrides.query !== undefined ? overrides.query : query,
        contentType: overrides.contentType || contentType,
        limit: overrides.limit || limit,
        offset: newOffset,
        startTime,
        endTime,
        appName: overrides.appName || undefined,
        windowName: overrides.windowName || undefined,
        includeFrames: overrides.includeFrames || false,
        minLength: overrides.minLength || minLength,
        maxLength: maxLength,
      };

      console.log("Search params:", params);
      
      const response = await pipe.queryScreenpipe(params);

      if (!response || !Array.isArray(response.data)) {
        throw new Error("invalid response data");
      }

      setResults(response.data);
      setTotalResults(response.pagination.total);
      setSelectedResults(new Set(response.data.map((_, index) => index)));
      setHasSearched(true);
    } catch (error) {
      console.error("search error:", error);
      if (!overrides.silent) {
        toast({
          title: "error",
          description: "failed to fetch search results. please try again.",
          variant: "destructive",
        });
      }
      setResults([]);
      setTotalResults(0);
    } finally {
      // Only update loading state if not in silent mode
      if (!overrides.silent) {
        setIsSearchLoading(false);
      }
    }
  };

  // Calculate the total length of selected content
  const calculateSelectedContentLength = () => {
    return Array.from(selectedResults).reduce((total, index) => {
      const item = results[index];
      if (!item || !item.type) return total;

      const contentLength =
        item.type === "OCR"
          ? item.content.text.length
          : item.type === "Audio"
          ? item.content.transcription.length
          : item.type === "UI"
          ? item.content.text.length
          : 0;
      return total + contentLength;
    }, 0);
  };

  // Handle message submission
  const handleFloatingInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floatingInput.trim() && !isStreaming) return;

    if (isStreaming) {
      handleStopStreaming();
      return;
    }

    scrollToBottom();

    // Fetch OCR data if needed
    if (results.length === 0 && !isOcrDataLoading) {
      try {
        setIsOcrDataLoading(true);
        console.log("On-demand OCR fetch for chat via search...");
        
        await handleSearch(0, {
          query: "youtube", // Known search term that returns results
          contentType: "all", 
          startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Last 14 days
          endTime: new Date().toISOString(),
          silent: true, // No UI notifications
        });
        
        console.log("On-demand search completed for chat");
      } catch (error) {
        console.error("Error in on-demand search for chat:", error);
      } finally {
        setIsOcrDataLoading(false);
      }
    }

    const selectedContentLength = calculateSelectedContentLength();
    if (selectedContentLength > MAX_CONTENT_LENGTH) {
      toast({
        title: "Content too large",
        description: `The selected content length (${selectedContentLength} characters) exceeds the maximum allowed (${MAX_CONTENT_LENGTH} characters). Please unselect some items to reduce the amount of content.`,
        variant: "destructive",
      });
      return;
    }

    const userMessage = {
      id: generateId(),
      role: "user" as const,
      content: floatingInput,
    };
    setChatMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { id: generateId(), role: "assistant", content: "" },
    ]);
    setFloatingInput("");
    setIsAiLoading(true);

    try {
      // Check if we're using Gemini API or Google's API endpoint
      const isGoogleApi = settings.aiModel.includes('gemini') || 
                         settings.aiUrl.includes('generativelanguage.googleapis.com');
      
      // For Google API, use our proxy endpoint
      if (isGoogleApi) {
        const apiKey = settings.openaiApiKey || settings.customSettings?.geminiApiKey;
        
        // We should have results at this point, but double check
        const hasSearchResults = results.length > 0;
        
        // Fetch any active learning plan if available
        let activeLearningPlan: string | null = null;
        try {
          // Try to fetch the most recent active task with a plan
          const planResponse = await fetch('/api/tasks/active');
          if (planResponse.ok) {
            const activeTask = await planResponse.json();
            if (activeTask?.plan) {
              activeLearningPlan = activeTask.plan;
              console.log("Found active learning plan for context");
            }
          }
        } catch (planError) {
          console.warn("Could not fetch learning plan:", planError);
          // Continue without plan data - non-critical
        }

        // Create contextual message
        let contextMessage;
        if (hasSearchResults) {
          // We have results, use them
          const selectedData = selectedAgent.dataSelector(
            results.filter((_, index) => selectedResults.has(index))
          );
          
          // Include OCR data in context
          let contextData = `OCR data: ${JSON.stringify(selectedData)}`;
          
          // Include learning plan if available
          if (activeLearningPlan) {
            contextData += `\n\nLearning Plan: ${activeLearningPlan}`;
          }
          
          contextMessage = `Context data: ${contextData}`;
          console.log(`Using ${selectedData.length} OCR items for context ${activeLearningPlan ? 'and learning plan' : ''}`);
        } else {
          // This should not happen with our auto-fetch, but just in case
          let noDataMessage = "No OCR data available at the moment.";
          
          // Include learning plan if available even if no OCR data
          if (activeLearningPlan) {
            noDataMessage += ` However, I do have access to your learning plan: ${activeLearningPlan}`;
          }
          
          contextMessage = noDataMessage + " I'll do my best to answer your question.";
          console.warn("No OCR data available for chat");
        }
        
        const systemPrompt = `You are a helpful assistant specialized as a "${selectedAgent.name}". ${selectedAgent.systemPrompt}
          Additional Instructions:
          - You are helping a student who is learning Python programming
          - When providing code examples, include detailed explanations for each line
          - Explain programming concepts in simple terms with real-world analogies
          - If you see Python code in the OCR data, analyze it for errors or improvements
          - If you see a learning plan, refer to it when answering questions related to the plan's topics
          - Suggest practical exercises that build on what the student is currently learning
          
          Rules:
          - Current time (JavaScript Date.prototype.toString): ${new Date().toString()}
          - User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
          - User timezone offset: ${new Date().getTimezoneOffset()}
          - ${settings.customPrompt ? `Custom prompt: ${settings.customPrompt}` : ""}
          `;
        
        try {
          // Use our proxy API route to avoid CORS issues
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...chatMessages.map((msg) => ({
                  role: msg.role as "user" | "assistant" | "system",
                  content: msg.content,
                })),
                {
                  role: "user",
                  content: `${contextMessage}\n\nUser query: ${floatingInput}`,
                },
              ],
              parameters: {
                temperature: 0.7,
                maxTokens: 8192,
              }
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${errorData.error || response.statusText}`);
          }
          
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          
          setChatMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { id: generateId(), role: "assistant", content: content },
          ]);
        } catch (error) {
          console.error("Error calling Gemini API:", error);
          toast({
            title: "AI Error",
            description: `Failed to get a response: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive",
          });
          
          // Update the error message in the chat
          setChatMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { 
              id: generateId(), 
              role: "assistant", 
              content: "I'm sorry, I encountered an error while processing your request. Please check your API key in settings and try again." 
            },
          ]);
        }
      } else {
        try {
          // Standard OpenAI implementation for actual OpenAI endpoints
          const openai = new OpenAI({
            apiKey:
              settings.aiProviderType === "screenpipe-cloud"
                ? settings.user.token
                : settings.openaiApiKey,
            baseURL: settings.aiUrl,
            dangerouslyAllowBrowser: true,
          });

          const model = settings.aiModel;
          const customPrompt = settings.customPrompt || "";

          // Check if we have search results
          const hasSearchResults = results.length > 0;
          
          // Fetch any active learning plan if available
          let activeLearningPlan: string | null = null;
          try {
            // Try to fetch the most recent active task with a plan
            const planResponse = await fetch('/api/tasks/active');
            if (planResponse.ok) {
              const activeTask = await planResponse.json();
              if (activeTask?.plan) {
                activeLearningPlan = activeTask.plan;
                console.log("Found active learning plan for context");
              }
            }
          } catch (planError) {
            console.warn("Could not fetch learning plan:", planError);
            // Continue without plan data - non-critical
          }

          // Create contextual message based on search results availability
          let contextMessage;
          if (hasSearchResults) {
            // We have search results, use them as context
            const selectedData = selectedAgent.dataSelector(
              results.filter((_, index) => selectedResults.has(index))
            );
            
            // Include OCR data in context
            let contextData = `OCR data: ${JSON.stringify(selectedData)}`;
            
            // Include learning plan if available
            if (activeLearningPlan) {
              contextData += `\n\nLearning Plan: ${activeLearningPlan}`;
            }
            
            contextMessage = `Context data: ${contextData}`;
          } else {
            // No search results, inform the AI
            let noDataMessage = "The user hasn't performed a search yet, so there is no OCR data available.";
            
            // Include learning plan if available even if no OCR data
            if (activeLearningPlan) {
              noDataMessage += ` However, I do have access to their learning plan: ${activeLearningPlan}`;
            }
            
            contextMessage = noDataMessage + " Please respond to their query as best you can.";
          }

          const messages = [
            {
              role: "user" as const,
              content: `You are a helpful assistant specialized as a "${selectedAgent.name}". ${selectedAgent.systemPrompt}
                Additional Instructions:
                - You are helping a student who is learning Python programming
                - When providing code examples, include detailed explanations for each line
                - Explain programming concepts in simple terms with real-world analogies
                - If you see Python code in the OCR data, analyze it for errors or improvements
                - If you see a learning plan, refer to it when answering questions related to the plan's topics
                - Suggest practical exercises that build on what the student is currently learning
                
                Rules:
                - Current time (JavaScript Date.prototype.toString): ${new Date().toString()}
                - User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
                - User timezone offset: ${new Date().getTimezoneOffset()}
                - ${customPrompt ? `Custom prompt: ${customPrompt}` : ""}
                `,
            },
            ...chatMessages.map((msg) => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            })),
            {
              role: "user" as const,
              content: `${contextMessage}

              User query: ${floatingInput}`,
            },
          ];

          console.log("messages", messages);

          abortControllerRef.current = new AbortController();
          setIsStreaming(true);

          const stream = await openai.chat.completions.create(
            {
              model: model,
              messages: messages,
              stream: true,
            },
            {
              signal: abortControllerRef.current.signal,
            }
          );

          let fullResponse = "";
          setChatMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { id: generateId(), role: "assistant", content: fullResponse },
          ]);

          setIsUserScrolling(false);
          lastScrollPosition.current = window.scrollY;
          scrollToBottom();

          for await (const chunk of stream) {
            console.log("chunk", chunk);
            const content = chunk.choices[0]?.delta?.content || "";
            fullResponse += content;
            setChatMessages((prevMessages) => [
              ...prevMessages.slice(0, -1),
              { id: generateId(), role: "assistant", content: fullResponse },
            ]);
            scrollToBottom();
          }
        } catch (error: any) {
          if (error.toString().includes("unauthorized")) {
            toast({
              title: "Error",
              description: "Please sign in to use AI features",
              variant: "destructive",
            });
          } else if (error.toString().includes("aborted")) {
            console.log("Streaming was aborted");
          } else {
            console.error("Error generating AI response:", error);
            toast({
              title: "Error",
              description: "Failed to generate AI response. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error: any) {
      if (error.toString().includes("unauthorized")) {
        toast({
          title: "Error",
          description: "Please sign in to use AI features",
          variant: "destructive",
        });
      } else if (error.toString().includes("aborted")) {
        console.log("Streaming was aborted");
      } else {
        console.error("Error generating AI response:", error);
        toast({
          title: "Error",
          description: "Failed to generate AI response. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAiLoading(false);
      setIsStreaming(false);
      if (!isUserScrolling) {
        scrollToBottom();
      }
    }
  };

  // Handle stopping streaming response
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsAiLoading(false);
    }
  };

  // Handle video generation
  const handleGenerateVideo = async () => {
    if (selectedResults.size === 0) {
      toast({
        title: "No content selected",
        description: "Please select content to generate a video",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVideo(true);

    try {
      const selectedItems = Array.from(selectedResults).map(
        (index) => results[index]
      );

      const apiKey = settings.openaiApiKey || settings.customSettings?.geminiApiKey;
      
      if (!apiKey) {
        throw new Error("No API key available for Gemini");
      }

      const content = await generateVideoContent(selectedItems, apiKey);
      setGeneratedVideoContent(content);
      setIsVideoGenerationModalOpen(true);
    } catch (error) {
      console.error("Error generating video content:", error);
      toast({
        title: "Generation failed",
        description: `Failed to generate video content: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Handle saving video content
  const handleSaveVideoContent = (generatedContent: GeneratedVideoContent | null) => {
    if (generatedContent) {
      setGeneratedVideoContent(generatedContent);
    }
    setIsVideoGenerationModalOpen(false);
    toast({
      title: "Content saved",
      description: "Video content has been saved",
    });
  };

  // Handle reload/new search
  const handleNewSearch = () => {
    location.reload();
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (!isUserScrolling) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Render component
  if (mode === "child") {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 mt-12">
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewSearch}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-20 mt-8">
          {/* Welcome message when no chat messages */}
          {chatMessages.length === 0 && (
            <div className="text-center p-8">
              <div className="mb-4">
                <Bot className="w-12 h-12 mx-auto text-primary opacity-70" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                AI Assistant
              </h2>
              <p className="text-muted-foreground mb-6">
                Ask a question about your screen recordings or anything else
              </p>
            </div>
          )}
          
          {chatMessages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}
        </div>

        {/* Video Generation Modal */}
        <VideoGenerationModal
          isOpen={isVideoGenerationModalOpen}
          onClose={() => setIsVideoGenerationModalOpen(false)}
          generatedContent={{
            title: generatedVideoContent?.title || "",
            logoPrompt: generatedVideoContent?.logoPrompt || "",
            description: generatedVideoContent?.description || "",
            script: generatedVideoContent?.script || "",
            seoKeywords: generatedVideoContent?.seoKeywords || "",
            sceneDescriptions: generatedVideoContent?.sceneDescriptions || ""
          }}
          onSave={handleSaveVideoContent}
        />

        {/* Floating Chat Input */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40">
          <form
            onSubmit={handleFloatingInputSubmit}
            className="flex w-full max-w-2xl items-center space-x-2 bg-background border rounded-lg p-2 shadow-lg"
          >
            <Input
              ref={floatingInputRef}
              type="text"
              placeholder="Ask anything... (press / to focus)"
              value={floatingInput}
              onChange={(e) => setFloatingInput(e.target.value)}
              className="flex-grow"
              disabled={isStreaming}
            />

            {isStreaming ? (
              <Button
                type="submit"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleStopStreaming();
                }}
                className="h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Select
                  value={selectedAgent.id}
                  onValueChange={(value) => {
                    const agent = AGENTS.find((a) => a.id === value);
                    if (agent) setSelectedAgent(agent);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTS.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="icon" className="h-8 w-8" disabled={!floatingInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
                
                {/* Video Generation Button */}
                {results.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="h-8 w-8"
                  >
                    {isGeneratingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <VideoIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </>
            )}
          </form>
        </div>

        {showScrollButton && (
          <div className="fixed bottom-24 right-4 z-50">
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollToBottom}
              className="rounded-full shadow-lg"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 mt-12">
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewSearch}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-20 mt-8">
          {/* Welcome message when no chat messages */}
          {chatMessages.length === 0 && (
            <div className="text-center p-8">
              <div className="mb-4">
                <Bot className="w-12 h-12 mx-auto text-primary opacity-70" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                AI Assistant
              </h2>
              <p className="text-muted-foreground mb-6">
                Ask a question about your screen recordings or anything else
              </p>
            </div>
          )}
          
          {chatMessages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}
        </div>

        {/* Video Generation Modal */}
        <VideoGenerationModal
          isOpen={isVideoGenerationModalOpen}
          onClose={() => setIsVideoGenerationModalOpen(false)}
          generatedContent={{
            title: generatedVideoContent?.title || "",
            logoPrompt: generatedVideoContent?.logoPrompt || "",
            description: generatedVideoContent?.description || "",
            script: generatedVideoContent?.script || "",
            seoKeywords: generatedVideoContent?.seoKeywords || "",
            sceneDescriptions: generatedVideoContent?.sceneDescriptions || ""
          }}
          onSave={handleSaveVideoContent}
        />

        {/* Floating Chat Input */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40">
          <form
            onSubmit={handleFloatingInputSubmit}
            className="flex w-full max-w-2xl items-center space-x-2 bg-background border rounded-lg p-2 shadow-lg"
          >
            <Input
              ref={floatingInputRef}
              type="text"
              placeholder="Ask anything... (press / to focus)"
              value={floatingInput}
              onChange={(e) => setFloatingInput(e.target.value)}
              className="flex-grow"
              disabled={isStreaming}
            />

            {isStreaming ? (
              <Button
                type="submit"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleStopStreaming();
                }}
                className="h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Select
                  value={selectedAgent.id}
                  onValueChange={(value) => {
                    const agent = AGENTS.find((a) => a.id === value);
                    if (agent) setSelectedAgent(agent);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTS.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="icon" className="h-8 w-8" disabled={!floatingInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
                
                {/* Video Generation Button */}
                {results.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="h-8 w-8"
                  >
                    {isGeneratingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <VideoIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </>
            )}
          </form>
        </div>

        {showScrollButton && (
          <div className="fixed bottom-24 right-4 z-50">
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollToBottom}
              className="rounded-full shadow-lg"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
}

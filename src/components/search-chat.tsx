"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pipe, type ContentItem } from "@screenpipe/browser";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAiProvider } from "@/lib/hooks/use-ai-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DateTimePicker } from "./date-time-picker";
import { Badge } from "./ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Laptop,
  Layers,
  Layout,
  Loader2,
  Search,
  Send,
  Square,
  Clock,
  Check,
  Plus,
  AlertCircle,
  SpeechIcon,
  ChevronsUpDown,
  Bot,
  Settings,
  VideoIcon,
  MessageSquare,
  Clipboard,
} from "lucide-react";
import { useToast } from "@/lib/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { generateId, Message } from "ai";
import { OpenAI } from "openai";
import { ChatMessage } from "@/components/chat-message";
import { spinner } from "@/components/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VideoComponent } from "@/components/video";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ContextUsageIndicator } from "@/components/context-usage-indicator";
import { Checkbox } from "@/components/ui/checkbox";
import { IconCode } from "@/components/ui/icons";
import { CodeBlock } from "@/components/ui/codeblock";
import { SqlAutocompleteInput } from "@/components/sql-autocomplete-input";
import { cn, removeDuplicateSelections } from "@/lib/utils";
import {
  ExampleSearch,
  ExampleSearchCards,
} from "@/components/example-search-cards";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useHealthCheck } from "@/lib/hooks/use-health-check";
import {
  SearchHistory,
  useSearchHistory,
} from "@/lib/hooks/use-search-history";
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
} from "./ui/command";
import { type Speaker } from "@screenpipe/browser";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSettings } from "@/lib/hooks/use-settings";
import { SearchFilterGenerator } from "./search-filter-generator";
import { VideoGenerationModal } from "./video-generation-modal";
import { generateVideoContent, improveVideoContent, GeneratedVideoContent } from "@/lib/services/video-generation-service";

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
      "you analyze all types of data from screen recordings and audio transcriptions. provide comprehensive insights.",
    dataSelector: (results) => results,
  },
  {
    id: "window-detective",
    name: "window detective",
    description: "focuses on app usage patterns",
    systemPrompt:
      "you specialize in analyzing app usage patterns and window switching behavior. help users understand their app usage.",
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
      "you focus on text extracted from screen recordings. help users find and understand text content.",
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
      "you analyze audio transcriptions from recordings. help users understand spoken content.",
    dataSelector: (results) =>
      results
        .filter((item) => item.type === "Audio")
        .map((item) => ({
          timestamp: item.content.timestamp,
          transcription: item.content.transcription,
        })),
  },
];

// Add this helper function to highlight keywords in text
const highlightKeyword = (text: string, keyword: string): JSX.Element => {
  if (!keyword || !text) return <>{text}</>;

  const parts = text.split(new RegExp(`(${keyword})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <span
            key={i}
            className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

// Update the getContextAroundKeyword function to return both text and positions
const getContextAroundKeyword = (
  text: string,
  keyword: string,
  contextLength: number = 40
): string => {
  if (!keyword || !text) return text;

  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return text;

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + keyword.length + contextLength);

  let result = text.slice(start, end);
  if (start > 0) result = "..." + result;
  if (end < text.length) result = result + "...";

  return result;
};

export function SearchChat() {
  const {
    searches,
    currentSearchId,
    setCurrentSearchId,
    addSearch,
    deleteSearch,
    isCollapsed,
    toggleCollapse,
  } = useSearchHistory();
  // Search state
  const { health, isServerDown } = useHealthCheck();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 24 * 3600000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeFrames, setIncludeFrames] = useState(false);
  const [limit, setLimit] = useState(30);
  const [appName, setAppName] = useState("");
  const [windowName, setWindowName] = useState("");
  const [contentType, setContentType] = useState("all");
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isOcrDataLoading, setIsOcrDataLoading] = useState(false);
  const [preloadedOcrData, setPreloadedOcrData] = useState<ContentItem[]>([]);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const { settings } = useSettings();
  const { isAvailable, error } = useAiProvider(settings);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [minLength, setMinLength] = useState(50);
  const [maxLength, setMaxLength] = useState(10000);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState<{
    [key: number]: Speaker;
  }>({});
  const [openSpeakers, setOpenSpeakers] = useState(false);
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<Message>>([]);

  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  const [floatingInput, setFloatingInput] = useState("");
  const [isFloatingInputVisible, setIsFloatingInputVisible] = useState(false);

  const floatingInputRef = useRef<HTMLInputElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollPosition = useRef(0);

  const MAX_CONTENT_LENGTH = settings.aiMaxContextChars;

  const [selectedResults, setSelectedResults] = useState<Set<number>>(
    new Set()
  );
  const [similarityThreshold, setSimilarityThreshold] = useState(1);
  const [hoveredResult, setHoveredResult] = useState<number | null>(null);

  const [isCurlDialogOpen, setIsCurlDialogOpen] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectAll, setSelectAll] = useState(true);

  const [showExamples, setShowExamples] = useState(true);

  const [isFiltering, setIsFiltering] = useState(false);
  const debouncedThreshold = useDebounce(similarityThreshold, 300);

  const [isQueryParamsDialogOpen, setIsQueryParamsDialogOpen] = useState(false);

  // Add state for individual content types
  const [selectedTypes, setSelectedTypes] = useState({
    ocr: false,
    audio: false,
    ui: false,
  });

  // Add new state near the top with other state declarations
  const [hideDeselected, setHideDeselected] = useState(false);

  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null);

  const [speakerSearchQuery, setSpeakerSearchQuery] = useState("");
  const [frameName, setFrameName] = useState<string>("");
  // Add the missing showChat state with default value true to keep chat visible
  const [showChat, setShowChat] = useState(true);
  // Add the missing messagesEndRef
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Add missing isGeneratingVideo state
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const [isVideoGenerationModalOpen, setIsVideoGenerationModalOpen] = useState(false);
  const [generatedVideoContent, setGeneratedVideoContent] = useState<GeneratedVideoContent>({
    title: "",
    logoPrompt: "",
    description: "",
    script: "",
    seoKeywords: "",
    sceneDescriptions: ""
  });

  useEffect(() => {
    if (Object.keys(selectedSpeakers).length > 0) {
      setSelectedTypes({
        ocr: false,
        ui: false,
        audio: true,
      });
      setContentType("audio");
    }
  }, [selectedSpeakers]);

  useEffect(() => {
    // More reliable OS detection using navigator.userAgentData when available
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

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        ((currentPlatform === "macos" && e.metaKey) ||
          (currentPlatform !== "macos" && e.ctrlKey))
      ) {
        e.preventDefault();
        handleSearch(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPlatform]);

  const handleSpeakerChange = (speaker: Speaker) => {
    setSelectedSpeakers((prev) => {
      const newSpeakers = { ...prev, [speaker.id]: speaker };

      if (prev[speaker.id]) {
        delete newSpeakers[speaker.id];
      }

      return newSpeakers;
    });
  };

  useEffect(() => {
    if (isQueryParamsDialogOpen && !speakers.length) {
      loadSpeakers();
    }
  }, [isQueryParamsDialogOpen]);

  useEffect(() => {
    loadSpeakers();
  }, [speakerSearchQuery]);

  const loadSpeakers = async () => {
    try {
      const getSpeakers = await fetch(
        `http://localhost:3030/speakers/search?name=${speakerSearchQuery}`
      );
      const speakers = await getSpeakers.json();
      setSpeakers(speakers);
    } catch (error) {
      console.error("Error loading speakers:", error);
      setSpeakers([]);
    }
  };

  // Update content type when checkboxes change
  const handleContentTypeChange = (type: "ocr" | "audio" | "ui") => {
    const newTypes = { ...selectedTypes, [type]: !selectedTypes[type] };
    setSelectedTypes(newTypes);

    if (Object.keys(selectedSpeakers).length > 0) {
      setSelectedTypes({
        ocr: false,
        ui: false,
        audio: true,
      });
      setContentType("audio");
    }

    // Convert checkbox state to content type
    if (!newTypes.ocr && !newTypes.audio && !newTypes.ui) {
      setContentType("all"); // fallback to all if nothing selected
    } else if (newTypes.audio && newTypes.ui && !newTypes.ocr) {
      setContentType("audio+ui");
    } else if (newTypes.ocr && newTypes.ui && !newTypes.audio) {
      setContentType("ocr+ui");
    } else if (newTypes.audio && newTypes.ocr && !newTypes.ui) {
      setContentType("audio+ocr");
    } else if (newTypes.audio) {
      setContentType("audio");
    } else if (newTypes.ocr) {
      setContentType("ocr");
    } else if (newTypes.ui) {
      setContentType("ui"); // This was missing - single UI type
    } else {
      setContentType("all");
    }
  };

  const handleContentTypeFromFilter = (contentType: string) => {
    // Update content type
    setContentType(contentType);

    // Update checkbox states based on content type
    setSelectedTypes({
      ocr: contentType.includes("ocr") || contentType === "all",
      audio: contentType.includes("audio") || contentType === "all",
      ui: contentType.includes("ui") || contentType === "all",
    });
  };

  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);

  useEffect(() => {
    const updateDates = () => {
      const now = new Date();
      setEndDate(now);
      // Optionally update startDate if you want to maintain a rolling time window
      // setStartDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)); // 24 hours ago
    };

    // Update dates immediately
    updateDates();

    // Set up interval to update dates every 5 minutes
    const intervalId = setInterval(updateDates, 5 * 60 * 1000);

    // Add event listener for when the page becomes visible
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        updateDates();
      }
    });

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", updateDates);
    };
  }, []);

  const isAiDisabled =
    !settings.user?.token && settings.aiProviderType === "screenpipe-cloud";

  const handleExampleSelect = async (example: ExampleSearch) => {
    if (isAiDisabled) {
      toast({
        title: "error",
        description:
          "your selected ai provider is screenpipe-cloud. consider login in app to use screenpipe-cloud",
        variant: "destructive",
      });
      return;
    }
    const newWindowName = example.windowName || "";
    const newAppName = example.appName || "";
    const newLimit = example.limit || limit;
    const newMinLength = example.minLength || minLength;
    const newContentType =
      (example.contentType as "all" | "ocr" | "audio") || contentType;
    const newStartDate = example.startDate;

    setWindowName(newWindowName);
    setAppName(newAppName);
    setLimit(newLimit);
    setMinLength(newMinLength);
    setContentType(newContentType);
    setStartDate(newStartDate);
    setShowExamples(false);

    handleSearch(0, {
      windowName: newWindowName,
      appName: newAppName,
      limit: newLimit,
      minLength: newMinLength,
      contentType: newContentType,
      startDate: newStartDate,
    });
  };

  const generateCurlCommand = () => {
    const baseUrl = "http://localhost:3030";
    const params: any = {
      query: query,
      contentType: contentType,
      limit: limit.toString(),
      offset: offset.toString(),
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      min_length: minLength.toString(),
      max_length: maxLength.toString(),
      q: query,
      app_name: appName,
      window_name: windowName,
      include_frames: includeFrames ? "true" : undefined,
    };

    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        // Make sure value is converted to string before using encodeURIComponent
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `${key}=${encodeURIComponent(stringValue)}`;
      })
      .join("&");

    return `curl "${baseUrl}/search?${queryParams}" | jq`;
  };

  useEffect(() => {
    if (results.length > 0) {
      setSelectedResults(new Set(results.map((_, index) => index)));
      setSelectAll(true);
    }
  }, [results]);

  useEffect(() => {
    handleFilterDuplicates();
  }, [debouncedThreshold, results]);

  const handleFilterDuplicates = async () => {
    if (similarityThreshold === 1) {
      setSelectedResults(new Set(results.map((_, index) => index)));
      setSelectAll(true);
      return;
    }
    setIsFiltering(true);
    // simulate a delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    const allIndices = new Set(results.map((_, index) => index));
    setSelectedResults(
      removeDuplicateSelections(results, allIndices, debouncedThreshold)
    );
    setSelectAll(false);
    setIsFiltering(false);
  };

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

  const scrollToBottom = () => {
    if (!isUserScrolling) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        setIsFloatingInputVisible(true);
      } else if (event.key === "Escape") {
        setIsFloatingInputVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isFloatingInputVisible && floatingInputRef.current) {
      floatingInputRef.current.focus();
    }
  }, [isFloatingInputVisible]);

  const handleResultSelection = (index: number) => {
    setSelectedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const calculateSelectedContentLength = () => {
    return Array.from(selectedResults).reduce((total, index) => {
      const item = results[index];
      if (!item || !item.type) return total; // Add this check

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
        
        // automated search function Use the handleSearch function which already works correctly
        await handleSearch(0, {
          query: "youtube", // Known search term that returns results
          contentType: "all", // Use "all" instead of "OCR"
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
      console.log("settings", settings);
      
      // Check if we're using Gemini API
      const isGeminiApi = settings.aiModel.includes('gemini');
      
      // For Gemini API, use our proxy endpoint
      if (isGeminiApi) {
        const apiKey = settings.openaiApiKey || settings.customSettings?.geminiApiKey;
        
        // We should have results at this point, but double check
        const hasSearchResults = results.length > 0;
        
        // Create contextual message
        let contextMessage;
        if (hasSearchResults) {
          // We have results, use them
          const selectedData = selectedAgent.dataSelector(
            results.filter((_, index) => selectedResults.has(index))
          );
          contextMessage = `Context data: ${JSON.stringify(selectedData)}`;
          console.log(`Using ${selectedData.length} OCR items for context`);
        } else {
          // This should not happen with our auto-fetch, but just in case
          contextMessage = "No OCR data available at the moment. I'll do my best to answer your question.";
          console.warn("No OCR data available for chat");
        }
        
        // Use our proxy API route
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey,
            messages: [
              {
                role: "user" as const,
                content: `You are a helpful assistant specialized as a "${selectedAgent.name}". ${selectedAgent.systemPrompt}
                  Rules:
                  - Current time (JavaScript Date.prototype.toString): ${new Date().toString()}
                  - User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
                  - User timezone offset: ${new Date().getTimezoneOffset()}
                  - ${settings.customPrompt ? `Custom prompt: ${settings.customPrompt}` : ""}
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
            ],
            parameters: {
              temperature: 0.7,
              maxTokens: 8192,
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        setChatMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { id: generateId(), role: "assistant", content: content },
        ]);
      } else {
        // Original OpenAI implementation
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
        
        // Create contextual message based on search results availability
        let contextMessage;
        if (hasSearchResults) {
          // We have search results, use them as context
          contextMessage = `Context data: ${JSON.stringify(
            selectedAgent.dataSelector(
              results.filter((_, index) => selectedResults.has(index))
            )
          )}`;
        } else {
          // No search results, inform the AI
          contextMessage = "The user hasn't performed a search yet, so there is no OCR data available. " +
                          "Please respond to their query as best you can without context data, and " +
                          "let them know that to get more specific answers about screen content, they should " +
                          "perform a search first.";
        }

        const messages = [
          {
            role: "user" as const,
            content: `You are a helpful assistant specialized as a "${selectedAgent.name}". ${selectedAgent.systemPrompt}
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
        // @ts-ignore
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
          // @ts-ignore
          setChatMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { id: generateId(), role: "assistant", content: fullResponse },
          ]);
          scrollToBottom();
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
      setIsFloatingInputVisible(false);
      setIsStreaming(false);
      if (!isUserScrolling) {
        scrollToBottom();
      }
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsAiLoading(false);
    }
  };

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
        appName: overrides.appName || appName || undefined,
        windowName: overrides.windowName || windowName || undefined,
        includeFrames: includeFrames,
        minLength: overrides.minLength || minLength,
        maxLength: maxLength,
        speakerIds: Object.values(selectedSpeakers).map(
          (speaker) => speaker.id
        ),
        ...(frameName && { frame_name: frameName }),
      };

      console.log("Search params:", params);
      
      const response = await pipe.queryScreenpipe(params);

      if (!response || !Array.isArray(response.data)) {
        throw new Error("invalid response data");
      }

      setResults(response.data);
      setTotalResults(response.pagination.total);

      // Save search to history
      // await onAddSearch(searchParams, response.data);
    } catch (error) {
      console.error("search error:", error);
      toast({
        title: "error",
        description: "failed to fetch search results. please try again.",
        variant: "destructive",
      });
      setResults([]);
      setTotalResults(0);
    } finally {
      // Only update loading state if not in silent mode
      if (!overrides.silent) {
        setIsSearchLoading(false);
      }
    }
  };

  const handleNextPage = () => {
    if (offset + limit < totalResults) {
      handleSearch(offset + limit);
    }
  };

  const handlePrevPage = () => {
    if (offset - limit >= 0) {
      handleSearch(offset - limit);
    }
  };

  const handleBadgeClick = (value: string, type: "app" | "window") => {
    if (type === "app") {
      setAppName(value);
    } else if (type === "window") {
      setWindowName(value);
    }
    handleSearch(0);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedResults(new Set(results.map((_, index) => index)));
    } else {
      setSelectedResults(new Set());
    }
  };

  const handleQuickTimeFilter = (minutes: number) => {
    const now = new Date();
    const newStartDate = new Date(now.getTime() - minutes * 60000);
    setStartDate(newStartDate);
    setEndDate(now);
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ));
    }

    if (hasSearched && results.length === 0) {
      return <p className="text-center">no results found</p>;
    }

    if (!hasSearched || results.length === 0) {
      return null;
    }

    // First filter results based on hideDeselected setting
    const visibleResults = results
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(
        ({ originalIndex }) =>
          !hideDeselected || selectedResults.has(originalIndex)
      );

    return visibleResults.map(({ item, originalIndex }) => (
      <motion.div
        key={originalIndex}
        className="flex items-center mb-4 relative pl-8"
      >
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <Checkbox
            checked={selectedResults.has(originalIndex)}
            onCheckedChange={() => handleResultSelection(originalIndex)}
          />
        </div>
        <Card className="w-full">
          <CardContent className="p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`item-${originalIndex}`}>
                <AccordionTrigger className="flex flex-col w-full py-2">
                  {/* Main content */}
                  <div className="flex w-full items-center gap-2">
                    <span className="text-left truncate">
                      {item.type === "OCR" &&
                        highlightKeyword(
                          getContextAroundKeyword(item.content.text, query),
                          query
                        )}
                      {item.type === "Audio" &&
                        highlightKeyword(
                          getContextAroundKeyword(
                            item.content.transcription,
                            query
                          ),
                          query
                        )}
                      {item.type === "UI" &&
                        highlightKeyword(
                          getContextAroundKeyword(item.content.text, query),
                          query
                        )}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {item.type === "UI" && (
                    <>
                      <div className="max-h-[400px] overflow-y-auto rounded border border-gray-100 dark:border-gray-800 p-4">
                        <p className="whitespace-pre-line">
                          {highlightKeyword(item.content.text, query)}
                        </p>
                      </div>
                      <div className="flex justify-center mt-4">
                        <VideoComponent filePath={item.content.filePath} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.content.appName && (
                          <Badge
                            className="text-xs cursor-pointer"
                            onClick={() =>
                              handleBadgeClick(item.content.appName, "app")
                            }
                          >
                            {item.content.appName}
                          </Badge>
                        )}
                        {item.content.windowName && (
                          <Badge
                            className="text-xs cursor-pointer"
                            onClick={() =>
                              handleBadgeClick(
                                item.content.windowName,
                                "window"
                              )
                            }
                          >
                            {item.content.windowName}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                  {item.type === "OCR" && (
                    <>
                      <div className="max-h-[400px] overflow-y-auto rounded border border-gray-100 dark:border-gray-800 p-4">
                        <p className="whitespace-pre-line">
                          {highlightKeyword(item.content.text, query)}
                        </p>
                      </div>
                      <div className="flex justify-center mt-4">
                        <VideoComponent filePath={item.content.filePath} />
                      </div>
                      {includeFrames && item.content.frame && (
                        <div className="mt-2 flex items-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <img
                                src={`data:image/jpeg;base64,${item.content.frame}`}
                                alt="Frame"
                                className="w-24 h-auto cursor-pointer"
                              />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[80vw]">
                              <img
                                src={`data:image/jpeg;base64,${item.content.frame}`}
                                alt="Frame"
                                className="w-full h-auto"
                              />
                            </DialogContent>
                          </Dialog>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>this is the frame where the text appeared</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </>
                  )}
                  {item.type === "Audio" && (
                    <>
                      <div className="max-h-[400px] overflow-y-auto rounded border border-gray-100 dark:border-gray-800 p-4">
                        <p className="whitespace-pre-line">
                          {highlightKeyword(item.content.transcription, query)}
                        </p>
                      </div>
                      {item.content.filePath &&
                      item.content.filePath.trim() !== "" ? (
                        <div className="flex justify-center mt-4">
                          <VideoComponent
                            filePath={item.content.filePath}
                            startTime={item.content.startTime}
                            endTime={item.content.endTime}
                            speaker={item.content.speaker}

                          />
                        </div>
                      ) : (
                        <p className="text-gray-500 italic mt-2">
                          no file path available for this audio.
                        </p>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
              <p className="text-xs text-gray-400">
                {new Date(item.content.timestamp).toLocaleString()}{" "}
                {/* Display local time */}
              </p>
              {item.type === "Audio" && item.content.speaker?.name && (
                <p className="text-xs text-gray-400">
                  {item.content.speaker.name}
                </p>
              )}
              {item.type === "OCR" && item.content.appName && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">app:</span>
                  <Badge
                    className="text-xs cursor-pointer"
                    onClick={() =>
                      handleBadgeClick(item.content.appName, "app")
                    }
                  >
                    {item.content.appName}
                  </Badge>
                </div>
              )}
              {item.type === "OCR" && item.content.windowName && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">window:</span>
                  <Badge
                    className="text-xs cursor-pointer"
                    onClick={() =>
                      handleBadgeClick(item.content.windowName, "window")
                    }
                  >
                    {item.content.windowName}
                  </Badge>
                </div>
              )}
              {"tags" in item.content &&
                item.content.tags &&
                item.content.tags.map((tag: string, index: number) => (
                  <Badge key={index} className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  // Add effect to restore search when currentSearchId changes
  useEffect(() => {
    // if (currentSearchId) {
    const selectedSearch = searches.find((s) => s.id === currentSearchId);
    if (selectedSearch) {
      // Restore search parameters
      setQuery(selectedSearch.searchParams.q || "");
      setContentType(selectedSearch.searchParams.content_type);
      setLimit(selectedSearch.searchParams.limit);
      setStartDate(new Date(selectedSearch.searchParams.start_time));
      setEndDate(new Date(selectedSearch.searchParams.end_time));
      setAppName(selectedSearch.searchParams.app_name || "");
      setWindowName(selectedSearch.searchParams.window_name || "");
      setIncludeFrames(selectedSearch.searchParams.include_frames);
      setMinLength(selectedSearch.searchParams.min_length);
      setMaxLength(selectedSearch.searchParams.max_length);

      // Restore results
      setResults(selectedSearch.results);
      setTotalResults(selectedSearch.results.length);
      setHasSearched(true);
      setShowExamples(false);

      // Restore messages if any
      if (selectedSearch.messages) {
        setChatMessages(
          selectedSearch.messages.map((msg) => ({
            id: msg.id,
            role: msg.type === "ai" ? "assistant" : "user",
            content: msg.content,
          }))
        );
      }
    }
    // }
  }, [currentSearchId, searches]);

  const handleNewSearch = () => {
    // setCurrentSearchId(null);
    location.reload();
    // Add any other reset logic you need
  };

  // Add this effect near other useEffect hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+Shift (macOS) or Ctrl+Shift (Windows/Linux)
      if (
        e.shiftKey &&
        ((currentPlatform === "macos" && e.metaKey) ||
          (currentPlatform !== "macos" && e.ctrlKey)) &&
        !e.altKey && // ensure alt/option isn't pressed
        !e.key.match(/^[a-zA-Z0-9]$/) // prevent triggering on letter/number keys
      ) {
        e.preventDefault();
        if (floatingInputRef.current && results.length > 0) {
          handleFloatingInputSubmit(new Event("submit") as any);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPlatform, results.length, floatingInput, isStreaming]);

  // Perform automatic background search for "youtube" to ensure we have OCR data
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

  // Add state for video generation
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

  const handleSaveVideoContent = (content: GeneratedVideoContent) => {
    setGeneratedVideoContent(content);
    setIsVideoGenerationModalOpen(false);
    toast({
      title: "Content saved",
      description: "Video content has been saved",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-12">
      {/* Commented out header buttons */}
      {/* <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={toggleExpanded}>
            <Menu className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium sr-only">menu</span>
        </div>
      </div> */}

      {/* Commented out logo and platform buttons */}
      {/* <div className="fixed top-4 right-4 z-50 flex items-center space-x-1">
        {isModalOpen && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="ml-0">
              {currentPlatform}
            </Badge>
            <CloseButton onClick={closeModal} />
          </div>
        )}
      </div> */}

      {/* Commented out search form and controls */}
      {/* <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <h2 className="text-xl font-bold">{showChat ? "search" : "..."}</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1">
                <Checkbox
                  id="speech-type"
                  checked={selectedTypes.speech}
                  onCheckedChange={() => handleContentTypeChange("speech")}
                  className="h-4 w-4"
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="speech-type" className="text-xs">
                        speech
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>audio text transcriptions from your microphone</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {currentPlatform === "macos" && (
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="ui-type"
                    checked={selectedTypes.ui}
                    onCheckedChange={() => handleContentTypeChange("ui")}
                    className="h-4 w-4"
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="ui-type" className="text-xs">
                          screen UI
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          text emitted directly from the source code of the
                          desktop applications
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Checkbox
                  id="ocr-type"
                  checked={selectedTypes.ocr}
                  onCheckedChange={() => handleContentTypeChange("ocr")}
                  className="h-4 w-4"
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="ocr-type" className="text-xs">
                        screen capture
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        recognized text from screenshots taken every 5s by default
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(0);
              }
            }}
            placeholder="keyword search, you may leave it blank"
            className="w-[350px]"
            autoCorrect="off"
            autoComplete="off"
          />

          <SqlAutocompleteInput
            id="window-name"
            type="window"
            value={windowName}
            onChange={setWindowName}
            placeholder="filter by window"
            className="w-[300px]"
          />

          <SqlAutocompleteInput
            id="app-name"
            type="app"
            value={appName}
            onChange={setAppName}
            placeholder="filter by app"
            className="w-[200px]"
          />

          <Button
            onClick={() => {
              setShowAdvancedFilters(!showAdvancedFilters);
            }}
            size="sm"
            variant="ghost"
            className="w-8 h-8"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={() => handleSearch(0)}>
                  {isSearchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">search</span>
                      <span className="text-xs opacity-70">
                        {currentPlatform === "macos" ? "⌘+↵" : "ctrl+↵"}
                      </span>
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Press {currentPlatform === "macos" ? "⌘+enter" : "ctrl+enter"}{" "}
                  to search
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <DateTimePicker
                  date={startDate}
                  setDate={setStartDate}
                  showLabel
                  label="start date"
                />
                <DateTimePicker
                  date={endDate}
                  setDate={setEndDate}
                  showLabel
                  label="end date"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTimeRangeChange(range.value)}
                    className="px-2 h-7 text-xs"
                  >
                    last {range.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="min-length">
                  min length
                </Label>
                <Input
                  id="min-length"
                  type="number"
                  min="0"
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="max-length">
                  max length
                </Label>
                <Input
                  id="max-length"
                  type="number"
                  min="0"
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="limit">
                  results per page
                </Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs">frames</span>
                <div className="flex h-9 items-center space-x-1">
                  <Checkbox
                    id="include-frames"
                    checked={includeFrames}
                    onCheckedChange={(checked) =>
                      setIncludeFrames(Boolean(checked))
                    }
                  />
                  <Label htmlFor="include-frames" className="text-xs">
                    include
                  </Label>
                  <SqlAutocompleteInput
                    id="frame-name"
                    type="frame"
                    value={frameName}
                    onChange={setFrameName}
                    placeholder="filter by frame"
                    disabled={!includeFrames}
                    className="ml-1 h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div> */}
      
      {/* Commented out results section with pagination */}
      {/* <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedResults(
                  new Set(results.map((_, index) => index))
                );
                setSelectAll(true);
              } else {
                setSelectedResults(new Set());
                setSelectAll(false);
              }
            }}
          />
          <Label htmlFor="select-all" className="text-sm">
            select all results
          </Label>

          <div className="h-4 border-l mx-2"></div>

          <Switch
            checked={hideUnselected}
            onCheckedChange={setHideUnselected}
            id="hide-unselected"
          />
          <Label
            htmlFor="hide-unselected"
            className="text-sm cursor-pointer"
          >
            hide unselected
          </Label>

          <div className="h-4 border-l mx-2"></div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedResults(removeDuplicateSelections())}
            className="text-xs h-7"
            disabled={isLoading || selectedResults.size === 0}
          >
            <Copy className="h-3 w-3 mr-1" />
            remove duplicates
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 text-xs text-muted-foreground">
                  (?){" "}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove results with duplicate content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (offset - limit >= 0) {
                  handleSearch(offset - limit);
                }
              }}
              disabled={offset === 0}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm">
              {results.length > 0
                ? `Showing ${offset + 1} - ${
                    offset + results.length
                  } of ${totalResults}`
                : ""}
            </span>
            <Button
              onClick={() => {
                if (offset + limit < totalResults) {
                  handleSearch(offset + limit);
                }
              }}
              disabled={offset + limit >= totalResults}
              size="sm"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        )}
      </div> */}
      
      {/* Main content container */}
      <div className="grid gap-8">
        {/* Commented out search results display */}
        {/* <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results
                .filter((_, index) => !hideUnselected || selectedResults.has(index))
                .map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      "border rounded-lg p-4 relative",
                      selectedResults.has(index)
                        ? "bg-muted border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id={`result-${index}`}
                        checked={selectedResults.has(index)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedResults);
                          if (checked) {
                            newSelected.add(index);
                          } else {
                            newSelected.delete(index);
                            setSelectAll(false);
                          }
                          setSelectedResults(newSelected);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div
                            className={cn(
                              "text-xs inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                              result.content_type === "OCR"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                : result.content_type === "SPEECH"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                            )}
                          >
                            {result.content_type}
                          </div>
                          <div className="flex gap-1 flex-wrap ml-2">
                            {result.app && (
                              <Badge variant="outline" className="ml-1 text-xs h-5">
                                {result.app}
                              </Badge>
                            )}
                            {result.window && (
                              <Badge variant="outline" className="ml-1 text-xs h-5">
                                {result.window}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm line-clamp-8 whitespace-pre-wrap break-words">
                          {result.content}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                          {result.content_length && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{result.content_length} chars</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-2">
                <File className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term or adjusting your filters
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-2">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Search your history</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use the search bar to query your recorded content
              </p>
              {showExamples && (
                <div className="flex flex-col gap-2 mt-4 max-w-md mx-auto">
                  <p className="text-sm font-medium">Example searches:</p>
                  {EXAMPLE_SEARCHES.map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      className="text-sm"
                      onClick={() => {
                        setQuery(example);
                        handleSearch(0);
                      }}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div> */}
        
        {/* Chat container - keep this visible */}
        <div className={cn(showChat ? "block" : "hidden", "mt-6")}>
          <div className="relative min-h-[300px] border rounded-lg p-4">
            {/* Chat messages container */}
            <div ref={messagesEndRef} className="space-y-4 mb-14">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg",
                    msg.role === "user" ? "bg-muted" : ""
                  )}
                >
                  {msg.role === "user" ? (
                    <MessageSquare className="h-6 w-6 mt-1 text-blue-500" />
                  ) : (
                    <div className="flex-shrink-0 mt-1">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    {msg.role === "assistant" && msg.content === "" ? (
                      <div className="flex gap-1 items-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground text-sm">
                          Thinking...
                        </span>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* End of messages marker */}
              <div className="h-4" />
            </div>

            {/* Fixed input at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <form onSubmit={handleFloatingInputSubmit}>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="ask a question about the results..."
                    value={floatingInput}
                    onChange={(e) => setFloatingInput(e.target.value)}
                    disabled={isStreaming}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={
                      calculateSelectedContentLength() > MAX_CONTENT_LENGTH ||
                      isAiDisabled
                    }
                    title={
                      isAiDisabled
                        ? "Please sign in to use AI features"
                        : `${currentPlatform === "macos" ? "⌘" : "ctrl"}+shift`
                    }
                  >
                    {isStreaming ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">
                          {currentPlatform === "macos" ? "⌘" : "ctrl"}+shift
                        </span>
                      </div>
                    )}
                  </Button>

                  {/* Add Generate Video button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="ml-2"
                          disabled={isGeneratingVideo || selectedResults.size === 0}
                          onClick={handleGenerateVideo}
                        >
                          {isGeneratingVideo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <VideoIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Generate video content using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <ContextUsageIndicator
                            currentSize={calculateSelectedContentLength()}
                            maxSize={MAX_CONTENT_LENGTH}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          {calculateSelectedContentLength() > MAX_CONTENT_LENGTH
                            ? `selected content exceeds maximum allowed: ${calculateSelectedContentLength()} / ${MAX_CONTENT_LENGTH} characters. unselect some items to use AI.`
                            : `${calculateSelectedContentLength()} / ${MAX_CONTENT_LENGTH} characters used for AI message`}
                          <br />
                          <span className="text-muted-foreground mt-1 block">
                            ai models can only process a limited amount of text at
                            once. the circle indicates your current usage.
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </form>
            </div>
            {isGeneratingVideo && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-3xl w-full">
                  <h2 className="text-xl font-bold mb-4">Generating Video Content</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Creating complete video production content using AI. This may take a
                      moment...
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video generation modal */}
      {generatedVideoContent && (
        <VideoGenerationModal
          isOpen={isVideoGenerationModalOpen}
          onClose={() => setIsVideoGenerationModalOpen(false)}
          generatedContent={generatedVideoContent}
          onSave={(content) => {
            setGeneratedVideoContent(content);
            setIsVideoGenerationModalOpen(false);
            toast({
              title: "Content saved",
              description: "Video content has been saved",
            });
          }}
          onImprove={async (field) => {
            try {
              const apiKey = settings.openaiApiKey || settings.customSettings?.geminiApiKey;
              if (!apiKey) {
                throw new Error("No API key available");
              }
              
              return await improveVideoContent(field, generatedVideoContent[field], apiKey);
            } catch (error) {
              console.error(`Error improving ${field}:`, error);
              toast({
                title: "Improvement failed",
                description: `Failed to improve ${field}: ${error instanceof Error ? error.message : "Unknown error"}`,
                variant: "destructive",
              });
              return generatedVideoContent[field];
            }
          }}
        />
      )}
    </div>
  );
}

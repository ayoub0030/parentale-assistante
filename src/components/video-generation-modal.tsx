import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconGemini } from "@/components/ui/icons";
import { Clipboard, Download, Save, Sun, Moon, Share2, Star, Wand2 } from "lucide-react";
import { useToast } from "@/lib/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedContent: {
    title: string;
    logoPrompt: string;
    description: string;
    script: string;
    seoKeywords: string;
    sceneDescriptions: string;
  };
  onSave: (content: VideoGenerationModalProps["generatedContent"]) => void;
  onImprove?: (field: keyof VideoGenerationModalProps["generatedContent"]) => Promise<string>;
}

export function VideoGenerationModal({
  isOpen,
  onClose,
  generatedContent,
  onSave,
  onImprove,
}: VideoGenerationModalProps) {
  const [content, setContent] = useState(generatedContent);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Apply dark mode class to dialog content
    const dialogContent = document.querySelector(".video-generation-dialog");
    if (dialogContent) {
      if (darkMode) {
        dialogContent.classList.add("dark-theme");
      } else {
        dialogContent.classList.remove("dark-theme");
      }
    }
  }, [darkMode]);

  const handleChange = (
    field: keyof VideoGenerationModalProps["generatedContent"],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
      duration: 2000,
    });
  };

  const handleExport = () => {
    const blob = new Blob(
      [
        `# Generated Video Content\n\n` +
          `## Title\n${content.title}\n\n` +
          `## Logo Design Prompt\n${content.logoPrompt}\n\n` +
          `## Description\n${content.description}\n\n` +
          `## Script\n${content.script}\n\n` +
          `## SEO Keywords\n${content.seoKeywords}\n\n` +
          `## Scene Descriptions\n${content.sceneDescriptions}`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-content.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Exported!",
      description: "Content exported as video-content.md",
      duration: 2000,
    });
  };

  const handleShare = () => {
    // Simple implementation - could be expanded with actual sharing APIs
    const shareData = {
      title: content.title,
      text: "Check out my AI-generated video content",
      url: window.location.href,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData)
        .then(() => {
          toast({
            title: "Shared!",
            description: "Content shared successfully",
            duration: 2000,
          });
        })
        .catch(err => {
          console.error("Error sharing:", err);
          toast({
            title: "Sharing failed",
            description: "Could not share content",
            variant: "destructive",
            duration: 2000,
          });
        });
    } else {
      // Fallback for browsers that don't support sharing
      handleCopy(`${content.title}\n\n${content.description}`, "Content summary");
      toast({
        title: "Content copied for sharing",
        description: "Your browser doesn't support direct sharing",
        duration: 3000,
      });
    }
  };

  const handleImprove = async (field: keyof VideoGenerationModalProps["generatedContent"]) => {
    if (!onImprove) return;
    
    setIsLoading(field);
    try {
      const improved = await onImprove(field);
      handleChange(field, improved);
      toast({
        title: "Content improved!",
        description: `AI has enhanced your ${field} content`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Improvement failed",
        description: "Could not improve content at this time",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(null);
    }
  };

  const renderPreview = () => {
    const currentTab = document.querySelector('[role="tabpanel"][data-state="active"]')?.getAttribute('value');
    
    if (!currentTab) return null;
    
    switch (currentTab) {
      case 'title':
        return (
          <div className="preview-container p-4 border rounded-md">
            <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
            <p className="text-sm text-muted-foreground">Preview of how your title might appear on a video platform</p>
          </div>
        );
      case 'logo':
        return (
          <div className="preview-container p-4 border rounded-md">
            <div className="bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center rounded-md">
              <p className="text-center text-muted-foreground">Logo visualization based on prompt would appear here</p>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">This is how a logo designer might interpret your prompt</p>
          </div>
        );
      case 'description':
        return (
          <div className="preview-container p-4 border rounded-md">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <p className="text-sm">{content.description}</p>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">Preview of description as it might appear under a video</p>
          </div>
        );
      // Add other cases for remaining tabs
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col video-generation-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconGemini className="h-5 w-5" /> 
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Generated Video Content
            </motion.span>
            <Badge className="ml-2" variant="outline">Pro</Badge>
          </DialogTitle>
          <DialogDescription>
            Review, edit and enhance your AI-generated video content
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={previewMode}
              onCheckedChange={setPreviewMode}
              id="preview-mode"
            />
            <Label htmlFor="preview-mode">Preview Mode</Label>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch 
                checked={darkMode}
                onCheckedChange={setDarkMode}
                id="dark-mode"
              />
              <Moon className="h-4 w-4" />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Share Options</h4>
                    <p className="text-sm text-muted-foreground">Share your generated video content</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" /> Share Link
                    </Button>
                    <Button size="sm" onClick={() => handleCopy(JSON.stringify(content), "Content data")}>
                      <Clipboard className="h-4 w-4 mr-2" /> Copy Data
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs defaultValue="title" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="title">Title</TabsTrigger>
            <TabsTrigger value="logo">Logo Prompt</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="seo">SEO Keywords</TabsTrigger>
            <TabsTrigger value="scenes">Scene Descriptions</TabsTrigger>
          </TabsList>

          <div className="overflow-auto flex-1 pr-2">
            {previewMode && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  {renderPreview()}
                </motion.div>
              </AnimatePresence>
            )}
            
            <TabsContent value="title" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="title">Video Title</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content.title, "Title")}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    {onImprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImprove("title")}
                        disabled={isLoading === "title"}
                      >
                        {isLoading === "title" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="title"
                  value={content.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="logo" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="logoPrompt">Logo Design Prompt</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content.logoPrompt, "Logo prompt")}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    {onImprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImprove("logoPrompt")}
                        disabled={isLoading === "logoPrompt"}
                      >
                        {isLoading === "logoPrompt" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="logoPrompt"
                  value={content.logoPrompt}
                  onChange={(e) => handleChange("logoPrompt", e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="description" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description">Video Description</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content.description, "Description")}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    {onImprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImprove("description")}
                        disabled={isLoading === "description"}
                      >
                        {isLoading === "description" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="script" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="script">Complete Script</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content.script, "Script")}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    {onImprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImprove("script")}
                        disabled={isLoading === "script"}
                      >
                        {isLoading === "script" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="script"
                  value={content.script}
                  onChange={(e) => handleChange("script", e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="seoKeywords">SEO Keywords</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content.seoKeywords, "SEO Keywords")}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    {onImprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImprove("seoKeywords")}
                        disabled={isLoading === "seoKeywords"}
                      >
                        {isLoading === "seoKeywords" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="seoKeywords"
                  value={content.seoKeywords}
                  onChange={(e) => handleChange("seoKeywords", e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="scenes" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="sceneDescriptions">Scene Descriptions</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content.sceneDescriptions, "Scene Descriptions")}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    {onImprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImprove("sceneDescriptions")}
                        disabled={isLoading === "sceneDescriptions"}
                      >
                        {isLoading === "sceneDescriptions" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="sceneDescriptions"
                  value={content.sceneDescriptions}
                  onChange={(e) => handleChange("sceneDescriptions", e.target.value)}
                  className="flex-1 min-h-[200px]"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="pt-4 space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => onSave(content)}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

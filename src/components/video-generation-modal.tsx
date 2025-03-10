import React, { useState } from "react";
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
import { Clipboard, Download, Save } from "lucide-react";
import { useToast } from "@/lib/use-toast";

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
}

export function VideoGenerationModal({
  isOpen,
  onClose,
  generatedContent,
  onSave,
}: VideoGenerationModalProps) {
  const [content, setContent] = useState(generatedContent);
  const { toast } = useToast();

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconGemini className="h-5 w-5" /> 
            Generated Video Content
          </DialogTitle>
          <DialogDescription>
            Review and edit your AI-generated video content
          </DialogDescription>
        </DialogHeader>

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
            <TabsContent value="title" className="mt-0 h-full">
              <div className="flex flex-col h-full gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="title">Video Title</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.title, "Title")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.logoPrompt, "Logo prompt")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.description, "Description")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.script, "Script")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.seoKeywords, "SEO keywords")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
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
                  <Label htmlFor="sceneDescriptions">Visual Scene Descriptions</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.sceneDescriptions, "Scene descriptions")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
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

        <DialogFooter className="flex justify-between items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => onSave(content)}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

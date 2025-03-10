import { ContentItem } from "@screenpipe/browser";

export interface GeneratedVideoContent {
  title: string;
  logoPrompt: string;
  description: string;
  script: string;
  seoKeywords: string;
  sceneDescriptions: string;
}

export async function generateVideoContent(
  selectedContent: ContentItem[],
  apiKey: string
): Promise<GeneratedVideoContent> {
  try {
    // Extract transcripts from selected content
    const transcripts = selectedContent
      .filter((item) => item.type === "Audio")
      .map((item) => ({
        timestamp: item.content.timestamp,
        text: item.content.transcription,
        speaker: item.content.speaker?.name || "Unknown",
      }));

    // Extract text from OCR data for additional context
    const ocrText = selectedContent
      .filter((item) => item.type === "OCR")
      .map((item) => ({
        timestamp: item.content.timestamp,
        text: item.content.text,
      }));

    // Format the data for the prompt
    const transcriptData = transcripts
      .map((t) => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`)
      .join("\n");

    const contextData = ocrText
      .map((t) => `[${new Date(t.timestamp).toLocaleTimeString()}] Screen: ${t.text}`)
      .join("\n");

    // Construct the prompt for Gemini
    const prompt = `
    As a professional video content creator, analyze the following transcript and context data to generate a complete video production package.

    TRANSCRIPT:
    ${transcriptData}

    ADDITIONAL CONTEXT:
    ${contextData}

    Based on this content, generate the following elements for a professional video:

    1. A catchy, SEO-optimized title (max 60 characters)
    2. A detailed prompt for logo design that captures the essence of the content
    3. A compelling video description (250-300 words)
    4. A complete script with narrator parts, dialogue, and timing cues
    5. A list of SEO keywords and tags for maximizing discoverability
    6. Visual scene descriptions with shot suggestions, transitions, and graphical elements

    Format your response as follows:
    TITLE: [Your title]
    LOGO_PROMPT: [Your logo design prompt]
    DESCRIPTION: [Your video description]
    SCRIPT: [Your complete script]
    SEO_KEYWORDS: [Your SEO keywords]
    SCENE_DESCRIPTIONS: [Your visual scene descriptions]
    `;

    // Call Gemini API through our proxy endpoint
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        model: "gemini-1.5-pro",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse the response into structured data
    const titleMatch = generatedText.match(/TITLE:\s*(.*?)(?=\n\s*LOGO_PROMPT:|$)/s);
    const logoPromptMatch = generatedText.match(/LOGO_PROMPT:\s*(.*?)(?=\n\s*DESCRIPTION:|$)/s);
    const descriptionMatch = generatedText.match(/DESCRIPTION:\s*(.*?)(?=\n\s*SCRIPT:|$)/s);
    const scriptMatch = generatedText.match(/SCRIPT:\s*(.*?)(?=\n\s*SEO_KEYWORDS:|$)/s);
    const seoKeywordsMatch = generatedText.match(/SEO_KEYWORDS:\s*(.*?)(?=\n\s*SCENE_DESCRIPTIONS:|$)/s);
    const sceneDescriptionsMatch = generatedText.match(/SCENE_DESCRIPTIONS:\s*(.*?)(?=$)/s);

    return {
      title: (titleMatch && titleMatch[1].trim()) || "Untitled Video",
      logoPrompt: (logoPromptMatch && logoPromptMatch[1].trim()) || "Design a minimalist logo that represents the video content",
      description: (descriptionMatch && descriptionMatch[1].trim()) || "No description generated",
      script: (scriptMatch && scriptMatch[1].trim()) || "No script generated",
      seoKeywords: (seoKeywordsMatch && seoKeywordsMatch[1].trim()) || "video, content",
      sceneDescriptions: (sceneDescriptionsMatch && sceneDescriptionsMatch[1].trim()) || "No scene descriptions generated",
    };
  } catch (error) {
    console.error("Error generating video content:", error);
    throw error;
  }
}

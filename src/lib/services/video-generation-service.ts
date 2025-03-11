import { ContentItem } from "@screenpipe/browser";

export interface GeneratedVideoContent {
  title: string;
  logoPrompt: string;
  description: string;
  script: string;
  seoKeywords: string;
  sceneDescriptions: string;
}

/**
 * Génère un contenu vidéo complet basé sur les transcriptions et données OCR sélectionnées
 * @param selectedContent Contenu sélectionné depuis l'application
 * @param apiKey Clé API pour Gemini
 * @returns Contenu vidéo généré
 */
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
        max_tokens: 4096,
        top_p: 0.95,
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

    // Parse the response into structured data - fixed regex to not use /s flag
    const titleMatch = generatedText.match(/TITLE:\s*([\s\S]*?)(?=\n\s*LOGO_PROMPT:|$)/);
    const logoPromptMatch = generatedText.match(/LOGO_PROMPT:\s*([\s\S]*?)(?=\n\s*DESCRIPTION:|$)/);
    const descriptionMatch = generatedText.match(/DESCRIPTION:\s*([\s\S]*?)(?=\n\s*SCRIPT:|$)/);
    const scriptMatch = generatedText.match(/SCRIPT:\s*([\s\S]*?)(?=\n\s*SEO_KEYWORDS:|$)/);
    const seoKeywordsMatch = generatedText.match(/SEO_KEYWORDS:\s*([\s\S]*?)(?=\n\s*SCENE_DESCRIPTIONS:|$)/);
    const sceneDescriptionsMatch = generatedText.match(/SCENE_DESCRIPTIONS:\s*([\s\S]*?)(?=$)/);

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

/**
 * Améliore un élément spécifique du contenu vidéo en utilisant l'IA
 * @param fieldName Nom du champ à améliorer
 * @param currentContent Contenu actuel du champ
 * @param apiKey Clé API pour Gemini
 * @returns Contenu amélioré
 */
export async function improveVideoContent(
  fieldName: keyof GeneratedVideoContent,
  currentContent: string,
  apiKey: string
): Promise<string> {
  try {
    // Construire un prompt spécifique basé sur le type de champ
    let prompt = '';
    
    switch(fieldName) {
      case 'title':
        prompt = `
        You are a professional video title optimizer. The following is a video title:

        "${currentContent}"

        Please improve this title to make it more:
        - Attention-grabbing
        - SEO-optimized
        - Click-worthy
        - Clear and concise (max 60 characters)
        
        Respond with ONLY the improved title text, nothing else.
        `;
        break;
      
      case 'logoPrompt':
        prompt = `
        You are a professional graphic design prompt engineer. The following is a logo design prompt:

        "${currentContent}"

        Please enhance this prompt to create a more detailed and effective brief for a logo designer.
        Include specific details about:
        - Style (minimalist, vintage, modern, etc.)
        - Colors and their psychological impact
        - Symbolism and meaning
        - Typography recommendations
        - Versatility considerations (works on different backgrounds and sizes)
        
        Respond with ONLY the improved logo design prompt, nothing else.
        `;
        break;
      
      case 'description':
        prompt = `
        You are a professional video description writer. The following is a video description:

        "${currentContent}"

        Please enhance this description to make it more:
        - Engaging and compelling
        - SEO-friendly
        - Informative about the video content
        - Structured with proper formatting (250-300 words)
        - Include a strong call-to-action
        
        Respond with ONLY the improved description, nothing else.
        `;
        break;
      
      case 'script':
        prompt = `
        You are a professional video script writer. The following is a video script:

        "${currentContent}"

        Please enhance this script to make it more:
        - Engaging and conversational
        - Well-paced with proper timing cues
        - Include clear direction for visuals, transitions, and sound effects
        - Natural-sounding dialogue and narration
        - Optimized for audience retention
        
        Respond with ONLY the improved script, nothing else.
        `;
        break;
      
      case 'seoKeywords':
        prompt = `
        You are an SEO specialist for video content. The following are SEO keywords:

        "${currentContent}"

        Please enhance these keywords to:
        - Include a mix of high-volume and long-tail keywords
        - Group them by relevance
        - Add trending and niche-specific terms
        - Format them for easy use in video platforms
        - Optimize for search algorithms
        
        Respond with ONLY the improved keywords, nothing else.
        `;
        break;
      
      case 'sceneDescriptions':
        prompt = `
        You are a professional video storyboard artist. The following are scene descriptions:

        "${currentContent}"

        Please enhance these scene descriptions to include:
        - Detailed shot compositions (close-up, wide, aerial, etc.)
        - Lighting and color palette suggestions
        - Camera movement instructions
        - Transitions between scenes
        - Key visual elements and graphics
        - Timing recommendations
        
        Respond with ONLY the improved scene descriptions, nothing else.
        `;
        break;
      
      default:
        throw new Error(`Unknown field type: ${fieldName}`);
    }

    // Call Gemini API through our proxy endpoint
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        model: "gemini-1.5-pro",
        temperature: 0.75,
        max_tokens: 2048,
        top_p: 0.98,
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
    const improvedContent = data.choices[0].message.content.trim();

    return improvedContent;
  } catch (error) {
    console.error(`Error improving ${fieldName}:`, error);
    throw error;
  }
}

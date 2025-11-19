import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ScriptSchema, CalendarSchema } from "../types";

// Helper to get AI instance. 
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to strip markdown code blocks from JSON strings
 */
const cleanJSON = (text: string): string => {
  if (!text) return "{}";
  return text.replace(/^```json\s*/, '').replace(/^```/, '').replace(/\s*```$/, '').trim();
};

/**
 * Enhances a simple user prompt into a detailed prompt for image/video generation.
 */
export const enhancePrompt = async (simplePrompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert prompt engineer for AI Art models (Imagen, Midjourney, Veo). 
      Rewrite the following simple description into a highly detailed, artistic, and descriptive prompt suitable for high-quality generation.
      Keep it under 50 words. Focus on lighting, texture, style, and camera angle.
      
      Input: "${simplePrompt}"`,
    });
    return response.text || simplePrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return simplePrompt;
  }
};

/**
 * Analyzes an image to determine the subject type and appropriate voice persona.
 * Used for Talking Photos to match voice to gender/age/species.
 */
export const detectVoicePersona = async (imageBase64: string): Promise<{ type: string; voicePrompt: string; label: string }> => {
  const ai = getAI();
  try {
    const prompt = `
      Analyze the main subject in this image for a "Talking Photo" video.
      Determine if the subject is a:
      - CHILD (Baby, Kid)
      - FEMALE (Woman, Girl)
      - MALE (Man, Boy)
      - CUTE_ANIMAL (Cat, Dog, Mascot, Cartoon animal)
      
      Return a JSON object with:
      - "type": One of the categories above.
      - "voicePrompt": A short, descriptive English prompt for the audio generation describing the voice tone (e.g. "High-pitched cute squeaky voice", "Deep authoritative male voice").
      - "label": A Portuguese label for the UI (e.g. "Voz Infantil", "Voz Feminina", "Voz de Mascote").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return { type: 'UNKNOWN', voicePrompt: 'Clear narration voice', label: 'Padrão' };
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("Error detecting voice persona:", error);
    return { type: 'UNKNOWN', voicePrompt: 'Clear narration voice', label: 'Padrão' };
  }
};

/**
 * Generates a marketing script and visual prompts based on product info.
 * Uses: gemini-2.5-flash
 */
export const generateMarketingPlan = async (productName: string, productDesc: string) => {
  const ai = getAI();
  
  const prompt = `
    You are a world-class marketing creative director.
    Create a video marketing plan for a product named "${productName}".
    Product Description: "${productDesc}".
    
    Output a JSON object containing:
    1. A catchy headline.
    2. A 30-second narration script.
    3. A highly detailed prompt to generate a video background using Veo (realistic, cinematic).
    4. A highly detailed prompt to generate a product lifestyle image using Imagen.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ScriptSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("Error generating marketing plan:", error);
    throw error;
  }
};

/**
 * Generates a social media content calendar.
 */
export const generateSocialPlan = async (niche: string) => {
  const ai = getAI();
  const prompt = `
    Generate a social media content calendar for the current month for a brand in the "${niche}" niche.
    Create 8 diverse posts distributed across the month.
    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CalendarSchema
      }
    });
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (error) {
    console.error("Error generating calendar:", error);
    throw error;
  }
};

/**
 * Generates analysis insights based on metrics.
 */
export const generateAnalysis = async (metrics: any) => {
  const ai = getAI();
  const prompt = `
    Analyze these social media metrics and provide a 2-sentence strategic insight on what to improve.
    Metrics: ${JSON.stringify(metrics)}
    Tone: Professional and encouraging.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    return "Unable to generate insights at this time.";
  }
};

/**
 * Generates a High-Quality Image using Imagen 3.
 * Uses: imagen-4.0-generate-001
 */
export const generateImage = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) throw new Error("No image generated");
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generates a Fast Design Image using Nano Banana.
 * Uses: gemini-2.5-flash-image
 */
export const generateFastImage = async (prompt: string) => {
  const ai = getAI();
  try {
    console.log("Generating Nano Banana image for:", prompt);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    // Nano Banana returns image in inlineData of the content part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image generated by Nano Banana");
  } catch (error) {
    console.error("Error generating fast image:", error);
    throw error;
  }
};

/**
 * Generates Speech from Text.
 * Uses: gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

/**
 * Generates a Video using Veo.
 * Uses: veo-3.1-fast-generate-preview or veo-3.1-generate-preview
 * Supports Text-to-Video and Image-to-Video.
 * Handles specific API key errors for Veo.
 */
export const generateVideo = async (prompt: string, imageBase64?: string, modelId: string = 'veo-3.1-fast-generate-preview') => {
  // Internal helper to execute the generation
  const executeGeneration = async () => {
    // Always create a new instance to ensure fresh key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    console.log("Starting Veo generation with model:", modelId);
    
    const request: any = {
      model: modelId,
      prompt: prompt, 
      config: {
        numberOfVideos: 1,
        resolution: '720p', 
        aspectRatio: '16:9' 
      }
    };

    if (imageBase64) {
      console.log("Attaching image for Image-to-Video generation...");
      request.image = {
        imageBytes: imageBase64,
        mimeType: 'image/png', 
      };
    }

    let operation = await ai.models.generateVideos(request);
    console.log("Veo operation started:", operation);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log("Polling Veo status...");
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");

    console.log("Fetching video bytes...");
    const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoRes.blob();
    return URL.createObjectURL(blob);
  };

  try {
    return await executeGeneration();
  } catch (error: any) {
    console.error("Error generating video:", error);

    // Enhanced Error Handling for Quota (429), Invalid Key (400), and Entity Not Found (404)
    const errorMessage = error.message || JSON.stringify(error);
    
    // Check for Quota Exceeded
    const isQuotaError = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || error.status === "RESOURCE_EXHAUSTED" || error.code === 429;
    
    // Check for Entity Not Found (Common Veo issue with wrong key/project)
    const isEntityNotFoundError = errorMessage.includes("Requested entity was not found") || error.code === 404;
    
    // Check for Invalid Key / Expired Key
    const isKeyInvalidError = errorMessage.includes("API key expired") || errorMessage.includes("API_KEY_INVALID") || error.code === 400;

    if (isEntityNotFoundError || isQuotaError || isKeyInvalidError) {
      console.warn("Veo API Error (Key/Quota/Invalid). Prompting user to select key again...");
      
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Retry once after key selection
        console.log("Retrying video generation after key selection...");
        return await executeGeneration();
      }
    }
    
    throw error;
  }
};

/**
 * LIVE API: Establishes a real-time session.
 * Uses: gemini-2.5-flash-native-audio-preview-09-2025
 */
export const connectLiveSession = async (callbacks: any) => {
    const ai = getAI();
    // Note: We return the promise so the component can use .then() to send inputs only after connection
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: 'You are ContentAI, a creative assistant. Help the user with brainstorming.',
      }
    });
};

/**
 * MARKET RESEARCH: Uses Thinking Mode + Search Grounding.
 * Uses: gemini-3-pro-preview
 */
export const performDeepResearch = async (query: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for reasoning
      }
    });
    return response;
  } catch (error) {
    console.error("Research error:", error);
    throw error;
  }
};

/**
 * LOCATION SCOUT: Uses Maps Grounding.
 * Uses: gemini-2.5-flash
 */
export const findLocations = async (query: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });
    return response;
  } catch (error) {
    console.error("Maps error:", error);
    throw error;
  }
};

/**
 * VIDEO ANALYSIS: Uses Gemini 3 Pro for Video Understanding.
 * Uses: gemini-3-pro-preview
 */
export const analyzeVideo = async (prompt: string, videoBase64: string, mimeType: string = 'video/mp4') => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: videoBase64 } },
                    { text: prompt }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Video analysis error:", error);
        throw error;
    }
}
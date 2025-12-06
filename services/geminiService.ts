import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ScriptSchema, CalendarSchema } from "../types";

// Helper to get AI instance. 
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to strip markdown code blocks from JSON strings.
 * Now robustly finds the first '{' and last '}' to ignore intro text.
 */
const cleanJSON = (text: string): string => {
  if (!text) return "{}";
  // Try to find a JSON object block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  // Fallback cleanup
  return text.replace(/^```json\s*/, '').replace(/^```/, '').replace(/\s*```$/, '').trim();
};

/**
 * Helper to normalize MIME types for Veo API which is strict.
 */
const normalizeMimeType = (mimeType: string): string => {
  if (mimeType === 'image/jpg') return 'image/jpeg';
  // Veo primarily supports png and jpeg. WebP might be supported but jpeg is safer fallback if unsure.
  if (!mimeType || (!mimeType.includes('image/'))) return 'image/png';
  return mimeType;
};

/**
 * Helper to clean Base64 string
 */
const cleanBase64 = (b64: string): string => {
  return b64.replace(/\s/g, '');
};

/**
 * Enhances a simple user prompt into a detailed, artistic, and descriptive prompt suitable for high-quality generation.
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
 * Enhances a simple user prompt into a detailed prompt specifically for Video Generation (Veo).
 * Focuses on cinematic camera moves, lighting, and consistency.
 */
export const enhanceVideoPrompt = async (simplePrompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `As a professional cinematographer, upgrade this video description into a premium Veo prompt.
      
      Original: "${simplePrompt}"
      
      Requirements:
      1. Add camera movement (e.g., "Slow pan right", "Drone flyover", "Dolly zoom", "Handheld shake").
      2. Add lighting/atmosphere (e.g., "Cinematic lighting", "Volumetric fog", "Cyberpunk neon", "Golden hour").
      3. Add film stock/lens details (e.g., "35mm", "Anamorphic lens", "Depth of field").
      4. Keep it concise (under 60 words).
      5. Output ONLY the enhanced prompt.`,
    });
    return response.text || simplePrompt;
  } catch (error) {
    console.error("Error enhancing video prompt:", error);
    return simplePrompt;
  }
};

/**
 * Analyzes an image to determine the subject type and appropriate voice persona.
 */
export const detectVoicePersona = async (imageBase64: string): Promise<{ type: string; voicePrompt: string; label: string }> => {
  const ai = getAI();
  
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

  try {
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
  } catch (error: any) {
    console.warn("Error detecting voice persona:", error);
    return { type: 'UNKNOWN', voicePrompt: 'Clear narration voice', label: 'Padrão' };
  }
};

/**
 * Generates a marketing script and visual prompts based on product info.
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
      model: "gemini-3-pro-preview",
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
  // Try API first, fallback silently to local
  try {
    const ai = getAI();
    const prompt = `
      Generate a social media content calendar for the current month for a brand in the "${niche}" niche.
      Create 8 diverse posts distributed across the month.
      Return ONLY JSON.
    `;

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
    console.error("Error generating calendar, using fallback:", error);
    return generateLocalSocialPlan(niche);
  }
};

export const generateLocalSocialPlan = (niche: string) => {
    return {
        posts: [
            { day: 2, title: `${niche}: Bastidores Exclusivos`, platform: 'Instagram', time: '10:00' },
            { day: 5, title: `Top Dicas de ${niche}`, platform: 'TikTok', time: '18:00' },
            { day: 9, title: `Promoção Relâmpago`, platform: 'Facebook', time: '12:00' },
            { day: 12, title: `Tutorial Rápido: Como fazer`, platform: 'TikTok', time: '19:00' },
            { day: 16, title: `Meme do Momento: ${niche}`, platform: 'Instagram', time: '15:00' },
            { day: 20, title: `Depoimento de Cliente Feliz`, platform: 'Facebook', time: '11:00' },
            { day: 24, title: `Trend Alert: O que vem por aí`, platform: 'TikTok', time: '20:00' },
            { day: 28, title: `Resumo do Mês em 1 Minuto`, platform: 'Instagram', time: '17:00' }
        ]
    };
};

/**
 * Generates analysis insights based on metrics.
 */
export const generateAnalysis = async (metrics: any) => {
  try {
    const ai = getAI();
    const prompt = `
      Analyze these social media metrics and provide a 2-sentence strategic insight on what to improve.
      Metrics: ${JSON.stringify(metrics)}
      Tone: Professional and encouraging.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    return generateLocalAnalysis(metrics);
  }
};

export const generateLocalAnalysis = (metrics: any) => {
    const growth = parseInt(metrics.follower_growth);
    if (growth > 10) return "Seu crescimento está excelente! Continue apostando em vídeos curtos para manter o engajamento alto.";
    if (growth > 0) return "Crescimento estável. Experimente postar em horários diferentes para alcançar novos públicos.";
    return "O engajamento caiu um pouco. Tente interagir mais nos stories e usar hashtags em alta.";
}

/**
 * Generates a High-Quality Image using Imagen 3.
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
 * Supports Image-to-Image if imageBase64 is provided.
 */
export const generateFastImage = async (prompt: string, imageBase64?: string, mimeType: string = 'image/png') => {
  const ai = getAI();
  try {
    console.log("Generating Nano Banana image for:", prompt);
    
    const parts: any[] = [];
    
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: normalizeMimeType(mimeType),
                data: cleanBase64(imageBase64)
            }
        });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

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
 * Transcribes audio (e.g. microphone recording or file) to text using Gemini.
 */
export const transcribeUserAudio = async (audioBase64: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: cleanBase64(audioBase64) } }, // Gemini handles wav/mp3 inputs
          { text: "Transcribe this audio exactly as spoken. Return only the text." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

/**
 * Analyzes audio style for voice cloning (Simulation/Prompting)
 */
export const analyzeVoiceStyle = async (audioBase64: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: cleanBase64(audioBase64) } },
          { text: "Analyze this voice recording. Describe the speaker's gender, approximate age, tone (e.g. cheerful, serious), and speaking style in 5-10 words." }
        ]
      }
    });
    return response.text || "Cloned Voice Style";
  } catch (error) {
    console.warn("Voice analysis failed, using default label.");
    return "Cloned Voice Style";
  }
}

/**
 * Generates a Video using Veo.
 */
export const generateVideo = async (
    prompt: string, 
    imageBase64?: string,
    mimeType: string = 'image/png',
    modelId: string = 'veo-3.1-fast-generate-preview',
    resolution: string = '720p',
    aspectRatio: string = '16:9'
) => {
  
  const executeGeneration = async (currentModelId: string) => {
    // New instance for fresh key logic if needed, but standard calls use process.env
    const ai = getAI();
    const cleanMime = normalizeMimeType(mimeType);
    
    console.log("Starting Veo generation with model:", currentModelId, "Res:", resolution, "Mime:", cleanMime, "Ratio:", aspectRatio);
    
    // Map '4k' to '1080p' as 4k is not fully supported in this preview tier, but we pass the best available.
    const apiResolution = resolution === '4k' ? '1080p' : resolution;

    const request: any = {
      model: currentModelId,
      prompt: prompt, 
      config: {
        numberOfVideos: 1,
        resolution: apiResolution, 
        aspectRatio: aspectRatio 
      }
    };

    if (imageBase64) {
      request.image = {
        imageBytes: cleanBase64(imageBase64),
        mimeType: cleanMime, 
      };
    }

    let operation = await ai.models.generateVideos(request);
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      // IMPORTANT: Explicitly pass the operation name to avoid 404 errors during polling
      // if the SDK or API behavior varies.
      if (operation.name) {
          operation = await ai.operations.getVideosOperation({ name: operation.name });
      } else {
          // Fallback if name isn't directly on root, though it should be.
          operation = await ai.operations.getVideosOperation({ operation: operation });
      }
    }

    if (operation.error) {
      throw new Error(`Video generation operation failed: ${operation.error.message || JSON.stringify(operation.error)}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        console.error("Operation finished but no link:", JSON.stringify(operation));
        throw new Error("No video URI returned from Veo API");
    }

    // IMPORTANT: Append API key to fetch the content from the protected URI
    // Use encodeURIComponent to ensure the key is passed correctly even if it has special chars
    const videoRes = await fetch(`${downloadLink}&key=${encodeURIComponent(process.env.API_KEY || '')}`);
    if (!videoRes.ok) {
        throw new Error(`Failed to fetch video bytes. Status: ${videoRes.status}`);
    }
    const blob = await videoRes.blob();
    return URL.createObjectURL(blob);
  };

  try {
    return await executeGeneration(modelId);
  } catch (error: any) {
    console.error("Error generating video with primary model:", error);
    
    // Fallback logic for Model Not Found or 404
    // If we used 'fast', try 'standard'. If 'standard', try 'fast'.
    const isNotFound = error.message?.includes('404') || error.message?.includes('NOT_FOUND') || error.status === 404;
    
    if (isNotFound) {
        const fallbackModel = modelId.includes('fast') ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
        console.warn(`Primary model ${modelId} not found/failed (404). Retrying with fallback: ${fallbackModel}`);
        try {
            return await executeGeneration(fallbackModel);
        } catch (retryError) {
            console.error("Fallback video generation also failed:", retryError);
            throw retryError; // Throw the original error or the new one
        }
    }

    throw error;
  }
};

/**
 * LIVE API Connection
 */
export const connectLiveSession = async (callbacks: any): Promise<any> => {
    const ai = getAI();
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
 * MARKET RESEARCH: Thinking Mode + Search Grounding
 */
export const performDeepResearch = async (query: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 } // Max budget for deep research
      }
    });
    return response;
  } catch (error) {
    console.error("Research error:", error);
    throw error;
  }
};

/**
 * LOCATION SCOUT: Maps Grounding
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
 * VIDEO ANALYSIS: Gemini 3 Pro Vision
 */
export const analyzeVideo = async (prompt: string, videoBase64: string, mimeType: string = 'video/mp4') => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: cleanBase64(videoBase64) } },
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

/**
 * FLASH BRAINSTORM: Low Latency
 */
export const askFlashLite = async (query: string) => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite-latest',
            contents: query
        });
        return response.text;
    } catch (error) {
        console.error("Flash Lite error:", error);
        throw error;
    }
}
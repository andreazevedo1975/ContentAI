import { Type } from "@google/genai";

export enum ContentType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  SCRIPT = 'SCRIPT'
}

export type VideoMode = 'marketing' | 'avatar' | 'talking_photo' | 'showcase';
export type ImageMode = 'product' | 'design';

export interface ProductData {
  name: string;
  description: string;
  url?: string;
  price?: string;
}

export interface GeneratedAsset {
  id: string;
  type: ContentType;
  url?: string; // For images/videos
  text?: string; // For scripts
  audioData?: string; // Base64 for audio
  createdAt: Date;
  status: 'generating' | 'completed' | 'failed';
}

export interface CalendarPost {
  day: number;
  title: string;
  platform: 'TikTok' | 'Instagram' | 'Facebook';
  time: string;
}

// Global type definition for AI Studio window object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    webkitAudioContext: typeof AudioContext;
    webkitSpeechRecognition: any;
  }
}

// Schema for Script Generation
export const ScriptSchema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: "Catchy hook for the video" },
    scriptBody: { type: Type.STRING, description: "The main narration script for the video, approx 30-60 seconds" },
    visualPrompt: { type: Type.STRING, description: "A detailed prompt to generate the background video using Veo (realistic, cinematic)" },
    imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate a product showcase image using Imagen" },
  },
  required: ["headline", "scriptBody", "visualPrompt", "imagePrompt"],
};

// Schema for Calendar Generation
export const CalendarSchema = {
  type: Type.OBJECT,
  properties: {
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER, description: "Day of the month (1-31)" },
          title: { type: Type.STRING, description: "Short title of the post content" },
          platform: { type: Type.STRING, enum: ["TikTok", "Instagram", "Facebook"] },
          time: { type: Type.STRING, description: "Best time to post e.g. '14:00'" }
        }
      }
    }
  }
};
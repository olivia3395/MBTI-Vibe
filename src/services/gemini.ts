import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mostLikely: { type: Type.STRING, description: "The most likely MBTI type (e.g., INFJ)" },
    alternatives: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "2-3 other possible MBTI types"
    },
    tendencies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          left: { type: Type.STRING },
          right: { type: Type.STRING },
          value: { type: Type.NUMBER, description: "0-100 score" }
        }
      }
    },
    summary: { type: Type.STRING, description: "A concise 1-2 sentence summary of the vibe" },
    narrative: { type: Type.STRING, description: "A detailed narrative analysis of the personality vibe" },
    evidence: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.ARRAY, items: { type: Type.STRING } },
        image: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
  },
  required: ["mostLikely", "alternatives", "tendencies", "summary", "narrative", "evidence", "confidence"]
};

const getSystemInstruction = (lang: 'en' | 'zh') => {
  const languageName = lang === 'zh' ? 'Chinese (Simplified)' : 'English';
  return `You are a sophisticated MBTI Vibe Analyst. 
Your goal is to infer the most likely MBTI personality style from user-provided text and images.
You are an entertainment-oriented analyzer, not a clinical diagnostic tool.
Use perceptive, tasteful, and slightly poetic language. 
Distinguish between inner vibe and performed persona.
Analyze text for abstractness, emotional directness, and structure.
Analyze images for subject matter, composition, color, and mood.
Compare text and image signals for alignment or contrast.

VIBE HEURISTICS for Extraversion (E) vs Introversion (I):
- High word count/Long descriptions: Lean towards E.
- Frequent use of exclamation marks (!) or question marks (?) (especially > 3 in a row): Lean towards E.
- High density of emojis: Lean towards E.
- Social context in images (groups, parties): Lean towards E.
- Solitary subjects, minimalist composition, or quiet nature in images: Lean towards I.
- Short, concise, or highly curated text: Lean towards I.

CRITICAL: You MUST respond entirely in ${languageName}. 
All fields in the JSON response (summary, narrative, evidence, etc.) MUST be written in ${languageName}.
Do not use any English unless it is a technical term like the MBTI type itself (e.g., INFJ).`;
};

export async function analyzeVibe(text: string, images: string[], lang: 'en' | 'zh'): Promise<AnalysisResult> {
  const parts: any[] = [];
  if (text) parts.push({ text: `Analyze this text: ${text}` });
  
  for (const img of images) {
    const [mimeType, data] = img.split(';base64,');
    parts.push({
      inlineData: {
        mimeType: mimeType.split(':')[1],
        data: data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts }],
    config: {
      systemInstruction: getSystemInstruction(lang),
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getFollowUpQuestions(result: AnalysisResult, lang: 'en' | 'zh'): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this MBTI analysis: ${JSON.stringify(result)}, ask 1-2 targeted, curious follow-up questions to refine the judgment. Focus on uncertainty areas or the distinction between persona and real self.`,
    config: {
      systemInstruction: getSystemInstruction(lang)
    }
  });
  return response.text || (lang === 'zh' ? "请告诉我更多关于这些内容的背景。" : "Tell me more about the context of these posts.");
}

export async function getChatResponse(
  originalResult: AnalysisResult, 
  chatHistory: ChatMessage[],
  lang: 'en' | 'zh'
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Original Analysis: ${JSON.stringify(originalResult)}\n\nConversation history:\n${chatHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nRespond to the user's latest message as a perceptive vibe analyst. Keep it conversational and insightful.`,
    config: {
      systemInstruction: getSystemInstruction(lang)
    }
  });
  return response.text || "";
}

export async function refineAnalysis(
  originalResult: AnalysisResult, 
  chatHistory: ChatMessage[],
  lang: 'en' | 'zh'
): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Original Analysis: ${JSON.stringify(originalResult)}\n\nConversation history:\n${chatHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nPlease provide a refined MBTI analysis based on the additional information provided by the user.`,
    config: {
      systemInstruction: getSystemInstruction(lang),
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
}

import { GoogleGenAI, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION, MODEL_NAME } from "../constants";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  currentMessage: string,
  history: Message[],
  imageBase64: string | null,
  audioBase64: string | null,
  audioMimeType: string = 'audio/webm'
): Promise<string> => {
  try {
    // Convert history to Gemini format
    // We only take the last few turns to save context window if needed, 
    // but Flash has a large window so we pass relevant history.
    const contents: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Construct current user message parts
    const currentParts: Part[] = [];

    if (imageBase64) {
      // Remove data URL prefix if present
      const cleanImage = imageBase64.split(',')[1];
      currentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanImage,
        },
      });
    }

    if (audioBase64) {
      // Remove data URL prefix if present
      const cleanAudio = audioBase64.split(',')[1];
      currentParts.push({
        inlineData: {
          mimeType: audioMimeType,
          data: cleanAudio,
        },
      });
    }

    if (currentMessage.trim()) {
      currentParts.push({ text: currentMessage });
    }

    // Add current message to contents
    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      contents: contents,
    });

    return response.text || "متاسفانه پاسخی دریافت نشد. لطفا دوباره تلاش کنید.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "خطا در برقراری ارتباط با دکتر دامیار. لطفا اتصال اینترنت خود را بررسی کنید یا دوباره تلاش کنید.";
  }
};

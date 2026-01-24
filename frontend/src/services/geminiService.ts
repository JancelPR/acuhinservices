import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!ai) return "Gemini API Key not configured.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, catchy, 1-sentence description for a store product. 
      Product Name: ${productName}
      Category: ${category}
      Language: English (with a touch of Filipino flair if appropriate).`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description.";
  }
};

export const generateProductImage = async (productName: string, category: string): Promise<string | null> => {
  if (!ai) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Professional studio photography of a ${productName} (${category} product). Isolated on a clean white background. Realistic, high quality, commercial look.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};
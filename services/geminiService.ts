
import { GoogleGenAI, Type } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTeamNames(count: number): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} creative, professional, and slightly fun team names for a corporate environment. Return as a plain list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    // The text property directly returns the string output; providing a fallback for JSON.parse
    const names = JSON.parse(response.text || '[]');
    return Array.isArray(names) && names.length > 0 
      ? names 
      : Array(count).fill("Team").map((t, i) => `${t} ${i + 1}`);
  } catch (error) {
    console.error("Gemini failed to generate names:", error);
    return Array(count).fill("Group").map((g, i) => `${g} ${i + 1}`);
  }
}

export async function generateWinnerAnnouncement(name: string, prize: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short, enthusiastic one-sentence announcement for a lucky draw winner named ${name} who won ${prize}.`
    });
    // Access response.text property directly and trim whitespace
    return (response.text || "").trim();
  } catch (error) {
    return `Congratulations to ${name} for winning ${prize}!`;
  }
}

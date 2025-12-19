
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from '../src/types';

// This function is the serverless entry point.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userPrompt } = request.body;

  if (!userPrompt) {
    return response.status(400).json({ error: 'userPrompt is required' });
  }

  // IMPORTANT: Use environment variables to protect API keys.
  // This key should be set in your Vercel project settings.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const systemInstruction = `
      You are an expert music curator and radio DJ. 
      Your goal is to translate a user's natural language request (mood, genre, activity, or specific taste) 
      into search parameters compatible with the Radio Browser API.
      
      The Radio Browser API supports searching by: 'name', 'country', 'tag' (genre).
      
      Analyze the user's request and provide:
      1. A short, fun reasoning for your choice.
      2. A structured object with 'tag', 'country', or 'name' to perform the search.
      
      Example:
      User: "I want to relax while coding"
      Output: { "reasoning": "Here are some low-fidelity beats to help you focus.", "searchQuery": { "tag": "lofi" } }
      
      User: "News from Spain"
      Output: { "reasoning": "Catching up on current events from Spain.", "searchQuery": { "country": "Spain", "tag": "news" } }
    `;

    const genAIResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reasoning: {
                type: Type.STRING,
              },
              searchQuery: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  country: { type: Type.STRING },
                  name: { type: Type.STRING },
                },
              },
              suggestedStationNames: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 3 specific famous station names if applicable, otherwise empty."
              }
            },
            required: ["reasoning", "searchQuery"],
          },
        },
      });

    const text = genAIResponse.text;
    if (!text) {
        throw new Error("No response from AI");
    }

    const result = JSON.parse(text) as AIRecommendation;
    
    // Send the successful response back to the client
    return response.status(200).json(result);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback in case of error
    const fallback: AIRecommendation = {
      reasoning: "I couldn't reach the AI DJ, but here is some pop music!",
      searchQuery: { tag: "pop" }
    };
    return response.status(500).json(fallback);
  }
}

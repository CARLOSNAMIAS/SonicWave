
import { AIRecommendation, ChatMessage } from "@/types";

/**
 * Fetches AI-powered radio recommendations based on a user's prompt.
 * This function communicates with a dedicated serverless function backend (`/api/recommend`)
 * which in turn processes the prompt with the Google Gemini API.
 *
 * @param userPrompt The natural language prompt from the user (e.g., "rock music for coding").
 * @param history The conversation history for context.
 * @returns A promise that resolves to an `AIRecommendation` object.
 */
export const getRadioRecommendations = async (userPrompt: string, history: ChatMessage[] = []): Promise<AIRecommendation> => {
  try {
    // Sends the user's prompt and history to the backend API endpoint.
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPrompt, history }),
    });

    if (!response.ok) {
      // Try to parse a structured error message from the serverless function.
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI recommendations');
    }

    const result = await response.json() as AIRecommendation;
    return result;

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    // If the request fails, provide a user-friendly fallback recommendation.
    return {
      reasoning: "El DJ de IA no está disponible en este momento. ¡Aquí tienes una selección de música pop para que no pare la música!",
      searchQuery: { tag: "pop" }
    };
  }
};


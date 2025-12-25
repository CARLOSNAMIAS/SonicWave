
import { AIRecommendation } from "@/types";

/**
 * Fetches AI-powered radio recommendations based on a user's prompt.
 * This function communicates with a dedicated serverless function backend (`/api/recommend`)
 * which in turn processes the prompt with the Google Gemini API.
 *
 * @param userPrompt The natural language prompt from the user (e.g., "rock music for coding").
 * @returns A promise that resolves to an `AIRecommendation` object.
 *          This object includes the AI's reasoning and the search query to be used
 *          with the radio API.
 *          In case of an error or if the AI is unavailable, it returns a fallback
 *          recommendation (e.g., pop music).
 */
export const getRadioRecommendations = async (userPrompt: string): Promise<AIRecommendation> => {
  try {
    // Sends the user's prompt to the backend API endpoint.
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPrompt }),
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
      reasoning: "The AI DJ is currently unavailable. Here's a selection of pop music to keep you going!",
      searchQuery: { tag: "pop" }
    };
  }
};


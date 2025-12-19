
import { AIRecommendation } from "@/types";

export const getRadioRecommendations = async (userPrompt: string): Promise<AIRecommendation> => {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPrompt }),
    });

    if (!response.ok) {
      // Try to parse the error message from the serverless function
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI recommendations');
    }

    const result = await response.json() as AIRecommendation;
    return result;

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    // Provide a user-friendly fallback
    return {
      reasoning: "The AI DJ is currently unavailable. Here's a selection of pop music to keep you going!",
      searchQuery: { tag: "pop" }
    };
  }
};


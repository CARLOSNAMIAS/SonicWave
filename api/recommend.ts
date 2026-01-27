/**
 * Vercel Serverless Function to get AI-powered radio recommendations.
 *
 * This function acts as a secure backend proxy. It receives a user's prompt,
 * securely calls the Google Gemini API with a predefined system instruction,
 * and transforms the user's natural language request into a structured JSON object
 * that the frontend can use to search for radio stations.
 *
 * This backend approach is crucial for two reasons:
 * 1.  It protects the `GEMINI_API_KEY` by keeping it in a server-side environment variable,
 *     preventing its exposure to the client-side browser.
 * 2.  It allows for the definition of a controlled `systemInstruction`, ensuring the AI's
 *     responses are consistent, safe, and formatted correctly in the desired JSON schema.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from '../src/types';

// This function is the serverless entry point.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only allow POST requests.
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userPrompt, history = [] } = request.body;

  if (!userPrompt) {
    return response.status(400).json({ error: 'userPrompt is required' });
  }

  // IMPORTANT: Use environment variables to protect API keys.
  // This key should be set in your Vercel project settings.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return response.status(500).json({ error: 'Server configuration error: AI service is not available.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // This system instruction is the "master prompt" that defines the AI's persona, task, and output format.
    // It's a critical part of ensuring reliable and structured responses from the model.
    const systemInstruction = `
      Eres un experto curador musical y DJ de radio de clase mundial. 
      Tu objetivo es traducir la solicitud del usuario (estado de ánimo, género, actividad o gusto específico) 
      en parámetros de búsqueda compatibles con la Radio Browser API.
      
      IMPORTANTE: Tienes acceso al historial de la conversación. Si el usuario hace una petición de seguimiento 
      como "algo más movido" o "ponme otro", utiliza el contexto anterior para refinar la búsqueda.
      
      La Radio Browser API soporta búsquedas por: 'tag' (género), 'country' (país) y 'name' (nombre de la emisora).
      
      REGLAS CRÍTICAS PARA LA VARIEDAD:
      1. No te limites a géneros genéricos. Si el usuario pide algo relajante, alterna entre 'lofi', 'ambient', 'chillout', 'jazz', 'classical' o 'nature'.
      2. Sé específico con los subgéneros si es posible (ej. 'synthwave' en lugar de 'electronic', 'reggaeton' en lugar de 'latino').
      3. Varía los países si la solicitud es global (ej. 'France', 'Japan', 'Brazil', 'United Kingdom').
      4. Si el usuario repite una idea, intenta ofrecer un ángulo diferente.
      5. Responde SIEMPRE en español con un tono profesional pero divertido.
      
      VIBE VISUAL:
      Proporciona un "vibe" visual que represente la música seleccionada:
      - primaryColor: Un color hexadecimal (ej. #EF4444 para energía, #8B5CF6 para relax) o un color de Tailwind.
      - accentColor: Un color de acento que combine bien.
      - mood: Una palabra que describa el sentimiento (ej. 'enérgico', 'meditativo', 'nostálgico').

      Analiza la solicitud y proporciona:
      1. Un razonamiento corto y divertido en español.
      2. Un objeto estructurado para la búsqueda.
      3. El "vibe" visual.
    `;

    // Process history for Gemini format
    const geminiHistory = (history as any[]).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const genAIResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        ...geminiHistory,
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = genAIResponse.text;

    if (!text) {
      throw new Error("No response from AI");
    }

    // Since we are using JSON mode, we should try to parse it
    let aiResponse;
    try {
      // Find JSON block if it exists, or just parse if the whole text is JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      aiResponse = JSON.parse(jsonStr) as AIRecommendation;
    } catch (e) {
      console.error("Failed to parse AI JSON response:", text);
      throw new Error("Invalid AI response format");
    }

    return response.status(200).json(aiResponse);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    // In case of an error with the AI service, send a structured error and a fallback recommendation.
    const fallback: AIRecommendation = {
      reasoning: "No he podido contactar con mi asistente de IA, ¡pero aquí tienes algo de pop para animar el ambiente!",
      searchQuery: { tag: "pop" }
    };
    return response.status(500).json(fallback);
  }
}

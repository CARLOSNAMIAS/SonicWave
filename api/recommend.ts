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

  const { userPrompt } = request.body;

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
      
      La Radio Browser API soporta búsquedas por: 'tag' (género), 'country' (país) y 'name' (nombre de la emisora).
      
      REGLAS CRÍTICAS PARA LA VARIEDAD:
      1. No te limites a géneros genéricos. Si el usuario pide algo relajante, alterna entre 'lofi', 'ambient', 'chillout', 'jazz', 'classical' o 'nature'.
      2. Sé específico con los subgéneros si es posible (ej. 'synthwave' en lugar de 'electronic', 'reggaeton' en lugar de 'latino').
      3. Varía los países si la solicitud es global (ej. 'France', 'Japan', 'Brazil', 'United Kingdom').
      4. Si el usuario repite una idea, intenta ofrecer un ángulo diferente (ej. si pide rock, prueba con 'rockabilly', 'grunge' o 'indie rock').
      5. Responde SIEMPRE en español.
      
      Analiza la solicitud y proporciona:
      1. Un razonamiento corto, divertido y profesional en español para tu elección.
      2. Un objeto estructurado con 'tag', 'country', o 'name' para realizar la búsqueda.
      
      Ejemplo:
      Usuario: "Quiero relajarme mientras programo"
      Resultado: { "reasoning": "He seleccionado unos ritmos lofi y ambient que te ayudarán a mantener el foco absoluto.", "searchQuery": { "tag": "lofi" } }
    `;

    const genAIResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // A fast and capable model suitable for this task.
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json", // Enforce JSON output.
        // Define the exact JSON schema the AI's response must follow.
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: {
              type: Type.STRING,
              description: "The AI's reasoning for the recommendation."
            },
            searchQuery: {
              type: Type.OBJECT,
              properties: {
                tag: { type: Type.STRING },
                country: { type: Type.STRING },
                name: { type: Type.STRING },
              },
              description: "The search query for the Radio Browser API."
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
    // In case of an error with the AI service, send a structured error and a fallback recommendation.
    const fallback: AIRecommendation = {
      reasoning: "No he podido contactar con mi asistente de IA, ¡pero aquí tienes algo de pop para animar el ambiente!",
      searchQuery: { tag: "pop" }
    };
    return response.status(500).json(fallback);
  }
}

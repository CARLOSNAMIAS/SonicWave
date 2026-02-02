/**
 * Vercel Serverless Function to get AI-powered radio recommendations.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIRecommendation } from '../src/types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userPrompt, history = [] } = request.body;

  if (!userPrompt) {
    return response.status(400).json({ error: 'userPrompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return response.status(500).json({ error: 'Server configuration error: AI service is not available.' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
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
      
      Responde SOLO con un objeto JSON válido con esta estructura:
      {
        "reasoning": "string",
        "searchQuery": { "tag": "string" } | { "country": "string" } | { "name": "string" },
        "vibe": {
          "primaryColor": "string",
          "accentColor": "string",
          "mood": "string"
        }
      }
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Build chat history
    const chatHistory = (history as any[]).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(userPrompt);
    const text = result.response.text();

    if (!text) {
      throw new Error("No response from AI");
    }

    let aiResponse: AIRecommendation;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      aiResponse = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", text);
      throw new Error("Invalid AI response format");
    }

    return response.status(200).json(aiResponse);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    const fallback: AIRecommendation = {
      reasoning: "No he podido contactar con mi asistente de IA, ¡pero aquí tienes algo de pop para animar el ambiente!",
      searchQuery: { tag: "pop" }
    };
    return response.status(500).json(fallback);
  }
}
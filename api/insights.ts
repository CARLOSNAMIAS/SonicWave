import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    // Use environment variables to protect API keys.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        return response.status(500).json({ error: 'Server configuration error.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const systemInstruction = `
      Eres el editor jefe de "Sonic Magazine", la revista digital de SonicWave AI Radio. 
      Tu tarea es generar contenido diario dinámico, interesante y de alta calidad para nuestros usuarios en español. 
      Este contenido debe ser original y útil, ideal para mejorar el valor del sitio ante Google AdSense.

      Genera un objeto JSON con las siguientes secciones:
      1. 'horoscopes': Un array de 12 objetos, uno por cada signo zodiacal tradicional (Aries, Tauro, Géminis, Cáncer, Leo, Virgo, Libra, Escorpio, Sagitario, Capricornio, Acuario, Piscis). Cada objeto debe tener:
         - sign: El nombre del signo zodiacal.
         - prediction: Una predicción musical y energética original y motivadora de unas 2 frases.
         - recommendedGenre: Un género musical sugerido acorde a la vibración del signo hoy.

      2. 'news': Un array de 3 noticias breves e interesantes sobre la industria musical, tecnología o eventos globales.
         - title: Titular llamativo.
         - content: Descripción original de 2 a 3 frases. No copies noticias reales textualmente, crea resúmenes editoriales.
         - tag: Una etiqueta corta (ej: "Tendencia", "Tecnología", "Historia").

      3. 'trivia': Un dato curioso histórico sobre la música o la radio.
         - fact: Una pregunta o dato sorprendente.
         - context: Una breve explicación del contexto.

      Responde SIEMPRE con un objeto JSON válido.
    `;

        const genAIResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: 'user', parts: [{ text: systemInstruction + "\n\nGenera el contenido de hoy:" }] }
            ],
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = genAIResponse.text;

        if (!text) {
            throw new Error("No response from AI");
        }

        const aiResponse = JSON.parse(text);
        return response.status(200).json(aiResponse);

    } catch (error) {
        console.error("Gemini AI Insights Error:", error);
        // Fallback content in case of error
        const fallback = {
            horoscopes: [
                { sign: "Aries", prediction: "Energía explosiva. Los ritmos rápidos te ayudarán a canalizar tu proactividad hoy.", recommendedGenre: "Hard Rock" },
                { sign: "Tauro", prediction: "Buscas confort y armonía. Una melodia clásica o jazz suave será tu mejor refugio.", recommendedGenre: "Smooth Jazz" },
                { sign: "Géminis", prediction: "Tu mente necesita estímulos variados. Alterna géneros para mantener tu curiosidad viva.", recommendedGenre: "Indie Pop" },
                { sign: "Cáncer", prediction: "Conexión emocional profunda. La música nostálgica te traerá grandes recuerdos.", recommendedGenre: "Dream Pop" },
                { sign: "Leo", prediction: "Es tu momento de brillar. Pon música que te haga sentir el protagonista de tu historia.", recommendedGenre: "Synth-Pop" },
                { sign: "Virgo", prediction: "Buscas orden y perfección. Las estructuras complejas de la música clásica te fascinarán.", recommendedGenre: "Barroco" },
                { sign: "Libra", prediction: "Equilibrio ante todo. Ritmos perfectamente balanceados para una jornada armoniosa.", recommendedGenre: "Lo-Fi Beats" },
                { sign: "Escorpio", prediction: "Intensidad y misterio. Los sonidos profundos y envolventes resonarán con tu alma.", recommendedGenre: "Dark Ambient" },
                { sign: "Sagitario", prediction: "Aventura sin límites. Explora ritmos de tierras lejanas y déjate llevar.", recommendedGenre: "World Music" },
                { sign: "Capricornio", prediction: "Determinación constante. La música que inspire esfuerzo y éxito será tu aliada.", recommendedGenre: "Classical Piano" },
                { sign: "Acuario", prediction: "Innovación y rebeldía. Los sonidos experimentales alimentarán tu creatividad.", recommendedGenre: "Electronic Experimental" },
                { sign: "Piscis", prediction: "Intuición pura. Sumérgete en paisajes sonoros acuáticos y melancólicos.", recommendedGenre: "Post-Rock" }
            ],
            news: [
                {
                    title: "El Resurgimiento del Casete",
                    content: "Coleccionistas de todo el mundo reportan un aumento en la demanda de cintas analógicas por su calidez única.",
                    tag: "Retro"
                },
                {
                    title: "Audio Espacial en Vivo",
                    content: "Nuevas tecnologías de streaming permiten vivir conciertos desde casa con una profundidad sonora tridimensional.",
                    tag: "Tecnología"
                }
            ],
            trivia: {
                fact: "¿Cuál fue la primera canción en el espacio?",
                context: "Fue 'Jingle Bells', tocada por los astronautas de la Gemini 6 en 1965 usando una armónica."
            }
        };
        return response.status(200).json(fallback);
    }
}

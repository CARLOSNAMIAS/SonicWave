import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Configuración de Vercel para esta función serverless.
 * maxDuration: Aumenta el tiempo máximo de ejecución a 30 segundos
 */
export const config = {
  maxDuration: 30,
};

// Lista de servidores de fallback en caso de que la API principal no responda
const FALLBACK_SERVERS = [
  'de1.api.radio-browser.info',
  'nl1.api.radio-browser.info',
  'at1.api.radio-browser.info',
];

/**
 * Obtiene la lista de servidores de la API de Radio Browser.
 * Intenta obtener la lista dinámica y, si falla, usa la lista de fallback.
 * @returns Una lista de nombres de host de servidores API.
 */
async function getApiServers(): Promise<string[]> {
  try {
    const response = await fetch('https://all.api.radio-browser.info/json/servers');
    if (!response.ok) {
      throw new Error(`Failed to fetch server list: ${response.statusText}`);
    }
    const servers = await response.json();
    // Filtra y mapea para obtener solo los nombres de host válidos
    return servers.map((s: { name: string }) => s.name).filter(Boolean);
  } catch (error) {
    console.warn('[PROXY] Could not fetch dynamic server list, using fallback. Reason:', error);
    return FALLBACK_SERVERS;
  }
}

/**
 * Selecciona un servidor base aleatorio de la lista proporcionada.
 * @param servers - Una lista de nombres de host de servidores.
 * @returns Una URL de servidor base completa (ej. "https://de1.api.radio-browser.info").
 */
function getRandomBaseServer(servers: string[]): string {
  if (servers.length === 0) {
    // Fallback de emergencia si todo lo demás falla
    return `https://${FALLBACK_SERVERS[0]}`;
  }
  const randomServerHost = servers[Math.floor(Math.random() * servers.length)];
  return `https://${randomServerHost}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejo de la solicitud OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Solo se permite el método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const availableServers = await getApiServers();
    const baseServer = getRandomBaseServer(availableServers);
    
    // Reconstruye la URL para la API de Radio Browser
    const { searchParams } = new URL(req.url || '', `http://${req.headers.host}`);
    const apiUrl = `${baseServer}/json/stations/search?${searchParams.toString()}`;

    console.log(`[PROXY] Fetching from: ${apiUrl}`);

    // Implementa un timeout para la solicitud a la API externa
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 25000); // 25 segundos

    const apiResponse = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': `SonicWave-AI-Radio/1.0 (Vercel Proxy)`,
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      // Si la API de Radio Browser devuelve un error, lo propagamos
      const errorBody = await apiResponse.text();
      console.error(`[PROXY] Radio Browser API Error: ${apiResponse.status} ${apiResponse.statusText}`, errorBody);
      return res.status(apiResponse.status).json({
        error: 'Radio Browser API Error',
        status: apiResponse.status,
        message: apiResponse.statusText,
        upstream_body: errorBody
      });
    }

    const data = await apiResponse.json();

    // Configura las cabeceras de la respuesta final
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache por 1 hora

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('[PROXY] Internal Handler Error:', error);

    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway Timeout' });
    }

    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
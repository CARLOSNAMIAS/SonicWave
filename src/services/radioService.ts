
// Importa los tipos necesarios para definir las emisoras de radio y los filtros de búsqueda.
import { RadioStation, SearchFilters } from '@/types';

// URL base de la API de radio-browser.info para realizar búsquedas de emisoras.
const BASE_URL = 'https://de1.api.radio-browser.info/json/stations/search';

/**
 * Busca emisoras de radio en la API de radio-browser.info basándose en un conjunto de filtros.
 * @param filters - Un objeto que contiene los criterios de búsqueda (nombre, país, etiqueta, límite).
 * @returns Una promesa que se resuelve en un array de objetos RadioStation.
 */
export const searchStations = async (filters: SearchFilters): Promise<RadioStation[]> => {
  // Crea un objeto URLSearchParams para construir la cadena de consulta de la URL de forma segura.
  const params = new URLSearchParams();
  
  // Añade los filtros a los parámetros de búsqueda si están definidos.
  if (filters.name) params.append('name', filters.name);
  if (filters.country) params.append('country', filters.country);
  if (filters.tag) params.append('tag', filters.tag);
  
  // Configura parámetros adicionales para la búsqueda.
  params.append('limit', (filters.limit || 50).toString()); // Limita el número de resultados (50 por defecto).
  params.append('hidebroken', 'true'); // Oculta emisoras que no funcionan.
  params.append('order', 'clickcount'); // Ordena los resultados por el número de clics.
  params.append('reverse', 'true'); // Ordena de forma descendente (las más populares primero).
  
  // SOLUCIÓN CLAVE: Solo solicita emisoras que usen HTTPS.
  // Esto es crucial para evitar errores de "Mixed Content" cuando la página se carga sobre HTTPS.
  params.append('is_https', 'true'); 

  try {
    // Realiza la solicitud a la API con los parámetros construidos.
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    // Si la respuesta no es exitosa, lanza un error.
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    
    // Convierte la respuesta a formato JSON.
    const data = await response.json();
    
    // Mapea los resultados para limpiar y asegurar datos consistentes.
    return data.map((station: RadioStation) => ({
      ...station,
      // Asegura que el favicon sea una URL válida o nulo.
      favicon: station.favicon && station.favicon.startsWith('http') ? station.favicon : null,
      // Si url_resolved no existe, usa la URL base como fallback.
      url_resolved: station.url_resolved || station.url
    }));
  } catch (error) {
    // Si ocurre un error durante la solicitud, lo muestra en la consola y devuelve un array vacío.
    console.error('Error fetching stations:', error);
    return [];
  }
};

/**
 * Obtiene las emisoras de radio más populares (top).
 * Es una función de conveniencia que llama a searchStations con un límite predefinido.
 * @returns Una promesa que se resuelve en un array de las emisoras más populares.
 */
export const getTopStations = async (): Promise<RadioStation[]> => {
  // Reutiliza la función searchStations para obtener las 50 emisoras con más clics.
  return searchStations({ limit: 50 });
};

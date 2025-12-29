import { RadioStation, SearchFilters } from '@/types';

const BASE_URL = '/api/stations';

/**
 * Busca emisoras de radio con manejo mejorado de errores
 */
export const searchStations = async (filters: SearchFilters): Promise<RadioStation[]> => {
  const params = new URLSearchParams();
  
  if (filters.name) params.append('name', filters.name);
  if (filters.country) params.append('country', filters.country);
  if (filters.tag) params.append('tag', filters.tag);
  
  params.append('limit', (filters.limit || 50).toString());
  params.append('hidebroken', 'true');
  params.append('order', 'clickcount');
  params.append('reverse', 'true');
  params.append('is_https', 'true');

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      // Intentar leer el mensaje de error del servidor
      let errorMessage = 'API Error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from API');
    }
    
    return data.map((station: RadioStation) => ({
      ...station,
      favicon: station.favicon && station.favicon.startsWith('http') ? station.favicon : null,
      url_resolved: station.url_resolved || station.url
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    // Re-lanzar el error para que App.tsx pueda manejarlo
    throw error;
  }
};

export const getTopStations = async (): Promise<RadioStation[]> => {
  return searchStations({ limit: 50 });
};
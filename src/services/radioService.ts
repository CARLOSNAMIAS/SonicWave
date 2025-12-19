
import { RadioStation, SearchFilters } from '@/types';

const BASE_URL = 'https://de1.api.radio-browser.info/json/stations/search';

export const searchStations = async (filters: SearchFilters): Promise<RadioStation[]> => {
  const params = new URLSearchParams();
  
  if (filters.name) params.append('name', filters.name);
  if (filters.country) params.append('country', filters.country);
  if (filters.tag) params.append('tag', filters.tag);
  
  params.append('limit', (filters.limit || 28).toString());
  params.append('hidebroken', 'true');
  params.append('order', 'clickcount');
  params.append('reverse', 'true');
  
  // SOLUCIÓN CLAVE: Solo pedir emisoras HTTPS para evitar bloqueos de "Mixed Content"
  params.append('is_https', 'true'); 

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    
    return data.map((station: RadioStation) => ({
      ...station,
      favicon: station.favicon && station.favicon.startsWith('http') ? station.favicon : null,
      url_resolved: station.url_resolved || station.url
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

export const getTopStations = async (): Promise<RadioStation[]> => {
  return searchStations({ limit: 28 });
};

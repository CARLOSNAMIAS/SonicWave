// Radio Browser API Types
export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  clickcount: number;
}

export interface SearchFilters {
  name?: string;
  country?: string;
  tag?: string;
  limit?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// AI Service Types
export interface AIRecommendation {
  searchQuery: SearchFilters;
  reasoning: string;
  suggestedStationNames?: string[];
  vibe?: {
    primaryColor: string;
    accentColor: string;
    mood: string;
  };
}

export enum ViewState {
  HOME = 'HOME',
  FAVORITES = 'FAVORITES',
  AI_RECOMMEND = 'AI_RECOMMEND',
}
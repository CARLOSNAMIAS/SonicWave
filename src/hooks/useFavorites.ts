import { useState, useEffect } from 'react';
import { RadioStation } from '@/types';

/**
 * A custom hook to manage a user's list of favorite radio stations.
 * It initializes favorites from localStorage and persists any changes back to it.
 *
 * @returns A tuple containing:
 *  - `favorites`: An array of the user's favorite `RadioStation` objects.
 *  - `toggleFavorite`: A function that adds or removes a station from the favorites list.
 */
export const useFavorites = (): [RadioStation[], (station: RadioStation) => void] => {
  const [favorites, setFavorites] = useState<RadioStation[]>([]);

  // Effect to load favorites from localStorage on initial render.
  useEffect(() => {
    const storedFavs = localStorage.getItem('sonicwave_favs');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  // Effect to save favorites to localStorage whenever the list changes.
  useEffect(() => {
    localStorage.setItem('sonicwave_favs', JSON.stringify(favorites));
  }, [favorites]);

  /**
   * Adds a station to favorites if it's not already there,
   * or removes it if it is.
   * @param station The `RadioStation` object to add or remove.
   */
  const toggleFavorite = (station: RadioStation) => {
    setFavorites(prev =>
      prev.some(f => f.stationuuid === station.stationuuid)
        ? prev.filter(f => f.stationuuid !== station.stationuuid) // Remove if exists
        : [...prev, station] // Add if doesn't exist
    );
  };

  return [favorites, toggleFavorite];
};
import { useState, useEffect, useRef } from 'react';
import { RadioStation } from '@/types';

/**
 * A comprehensive custom hook for managing audio playback of radio streams.
 * It encapsulates all logic related to the audio player, including:
 * - Managing the current station and playback state (playing, paused, loading).
 * - Handling playback errors.
 * - Persisting and applying volume settings.
 * - Directly controlling an HTMLAudioElement via a ref.
 *
 * @returns An object containing the player's state and control functions.
 */
export const useAudioPlayer = () => {
  // State for the currently selected radio station.
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  // State to track if audio is actively playing.
  const [isPlaying, setIsPlaying] = useState(false);
  // State to indicate if the stream is buffering.
  const [isLoading, setIsLoading] = useState(false);
  // State to hold any playback error messages.
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  // State for the player volume, initialized from localStorage.
  const [volume, setVolume] = useState(() => {
    const storedVolume = localStorage.getItem('sonicwave_volume');
    return storedVolume ? parseFloat(storedVolume) : 0.8;
  });

  // Ref to the underlying <audio> element.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect to update the audio element's volume and persist it to localStorage.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('sonicwave_volume', volume.toString());
    }
  }, [volume]);

  // Core effect to manage audio source and playback based on state changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If no station is selected, pause and clear the audio source.
    if (!currentStation) {
      audio.pause();
      audio.src = '';
      return;
    }

    const streamUrl = currentStation.url_resolved || currentStation.url;
    
    // Change the source only if it's different from the current one.
    if (audio.src !== streamUrl) {
      setPlaybackError(null);
      setIsLoading(true);
      audio.src = streamUrl;
      audio.load(); // Explicitly load the new source.
    }

    // Handle play/pause commands.
    if (isPlaying) {
      audio.play().catch(err => {
        // Ignore AbortError which can happen on rapid source changes.
        if (err.name !== 'AbortError') {
          console.error("Audio Playback Error:", err);
          setPlaybackError("No se puede reproducir este stream actualmente.");
          setIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }
  }, [currentStation, isPlaying]);

  /**
   * Handles playing a new station or toggling the current one.
   * @param station The `RadioStation` to play.
   */
  const handlePlayPause = (station: RadioStation) => {
    setPlaybackError(null);
    if (currentStation?.stationuuid === station.stationuuid) {
      // If it's the same station, just toggle the play state.
      setIsPlaying(prev => !prev);
    } else {
      // If it's a new station, set it and start playing.
      setCurrentStation(station);
      setIsPlaying(true);
    }
  };

  /**
   * Stops the player completely by clearing the station and setting play state to false.
   */
  const stopPlayer = () => {
    setIsPlaying(false);
    setCurrentStation(null);
  }

  /**
   * Toggles the play/pause state of the currently loaded station.
   * Does nothing if no station is loaded.
   */
  const togglePlayPause = () => {
    if (currentStation) {
      setIsPlaying(prev => !prev);
    }
  }

  return {
    audioRef,
    currentStation,
    isPlaying,
    isLoading,
    playbackError,
    setPlaybackError,
    volume,
    handlePlayPause,
    setVolume,
    setIsLoading,
    togglePlayPause,
    stopPlayer
  };
};

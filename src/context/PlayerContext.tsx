import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { RadioStation } from '@/types';

/**
 * Interface defining the shape of the PlayerContext.
 * It strictly mirrors the return type of the useAudioPlayer hook.
 */
interface PlayerContextType {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    currentStation: RadioStation | null;
    isPlaying: boolean;
    isLoading: boolean;
    playbackError: string | null;
    setPlaybackError: React.Dispatch<React.SetStateAction<string | null>>;
    volume: number;
    handlePlayPause: (station: RadioStation) => void;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    togglePlayPause: () => void;
    stopPlayer: () => void;
    analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

/**
 * Provider component that wraps the application and supplies the audio player state.
 * 
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Child components that will consume the context.
 */
export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const playerState = useAudioPlayer();

    return (
        <PlayerContext.Provider value={playerState}>
            {children}
        </PlayerContext.Provider>
    );
};

/**
 * Custom hook to consume the PlayerContext.
 * 
 * @returns {PlayerContextType} The audio player state and control functions.
 * @throws {Error} If used outside of a PlayerProvider.
 */
export const usePlayer = (): PlayerContextType => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

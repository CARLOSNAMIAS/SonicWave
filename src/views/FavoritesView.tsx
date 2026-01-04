import React from 'react';
import { RadioStation } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import StationCard from '@/components/StationCard';
import { Music } from 'lucide-react';

interface FavoritesViewProps {
    favorites: RadioStation[];
    onToggleFavorite: (station: RadioStation) => void;
}

/**
 * View component determining the layout for the Favorites page.
 * Displays a grid of stations that the user has marked as favorite.
 */
const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onToggleFavorite }) => {
    const { currentStation, isPlaying, handlePlayPause } = usePlayer();

    return (
        <section className="space-y-10 min-h-[60vh]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                <h3 className="text-xl font-black dark:text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
                    Tus favoritos
                </h3>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {favorites.length} Emisoras
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {favorites.map(s => (
                    <StationCard
                        key={s.stationuuid}
                        station={s}
                        isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                        isFavorite={true}
                        onPlay={handlePlayPause}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>

            {favorites.length === 0 && (
                <div className="py-32 flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <Music size={40} />
                    </div>
                    <p className="text-slate-400 font-bold">Aún no tienes favoritos. ¡Explora y añade algunos!</p>
                </div>
            )}
        </section>
    );
};

export default FavoritesView;

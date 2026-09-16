import React from 'react';
import { RadioStation } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import StationCard from '@/components/StationCard';

interface FavoritesViewProps {
    favorites: RadioStation[];
    onToggleFavorite: (station: RadioStation) => void;
}

/**
 * Índice de las emisoras guardadas en este dispositivo.
 */
const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onToggleFavorite }) => {
    const { currentStation, isPlaying, handlePlayPause } = usePlayer();

    return (
        <section className="min-h-[60vh] pt-10">
            <div className="flex items-end justify-between gap-6 py-6">
                <h1 className="t-display text-[clamp(2rem,7vw,3.5rem)]">Tus emisoras</h1>
                <span className="t-data text-[10px] text-meta-c shrink-0 pb-1">
                    {favorites.length} guardadas
                </span>
            </div>

            <div className="">
                {favorites.map((s, i) => (
                    <StationCard
                        key={s.stationuuid}
                        station={s}
                        index={i + 1}
                        isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                        isFavorite={true}
                        onPlay={handlePlayPause}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>

            {favorites.length === 0 && (
                <div className="py-24 max-w-[44ch]">
                    <p className="t-display text-[clamp(1.5rem,5vw,2.25rem)] mb-4">Todavía nada aquí</p>
                    <p className="text-[15px] leading-relaxed text-meta-c">
                        Toca el corazón de cualquier emisora y aparecerá en esta lista. Se guarda
                        en este dispositivo, sin cuenta ni registro.
                    </p>
                </div>
            )}
        </section>
    );
};

export default FavoritesView;

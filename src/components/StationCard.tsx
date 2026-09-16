
import React from 'react';
import { RadioStation } from '@/types';
import { Play, Pause, Heart, Music2 } from 'lucide-react';

/**
 * Props para el componente StationCard.
 * @property {RadioStation} station - Los datos de la emisora a mostrar.
 * @property {boolean} isPlaying - Si esta emisora específica se está reproduciendo actualmente.
 * @property {boolean} isFavorite - Si esta emisora está en los favoritos del usuario.
 * @property {(station: RadioStation) => void} onPlay - Callback para reproducir o pausar la emisora.
 * @property {(station: RadioStation) => void} onToggleFavorite - Callback para agregar o eliminar la emisora de favoritos.
 * @property {number} [index] - Posición de la emisora dentro del listado (la lista viene ordenada por popularidad).
 */
interface StationCardProps {
  station: RadioStation;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  index?: number;
}

const fallbackArt = (name: string, size: number) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000000&color=E9E6DF&size=${size}&font-size=0.34&bold=true&format=png`;

/**
 * Una fila del índice de emisoras.
 * Cada emisora ocupa un renglón alineado a las mismas columnas: posición, carátula,
 * nombre, procedencia y calidad de transmisión. La emisora que suena invierte la fila
 * sobre el color de señal; es el único momento en que aparece color en el listado.
 */
const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  index
}) => {
  const genre = station.tags ? station.tags.split(',')[0] : 'Radio';
  const code = (station.countrycode || station.country || '--').slice(0, 2).toUpperCase();

  return (
    <div
      onClick={() => onPlay(station)}
      className={`
        group grid grid-cols-[2.5rem_3.5rem_1fr_auto] md:grid-cols-[3.5rem_4rem_1fr_7rem_5rem_auto]
        items-center gap-3 md:gap-5 px-2 md:px-3 py-4 cursor-pointer
        transition-colors duration-150
        ${isPlaying
          ? 'bg-signal text-white'
          : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
        }
      `}
    >
      {/* Posición en el listado */}
      <span className={`t-data text-[11px] md:text-xs ${isPlaying ? 'text-white' : 'text-meta-c'}`}>
        {typeof index === 'number' ? String(index).padStart(3, '0') : '—'}
      </span>

      {/* Carátula */}
      <div className="w-12 h-12 md:w-16 md:h-16 overflow-hidden bg-black/5 dark:bg-white/5 shrink-0">
        {station.favicon ? (
          <img
            src={station.favicon}
            alt=""
            loading="lazy"
            className={`w-full h-full object-cover ${isPlaying ? 'grayscale contrast-125' : ''}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackArt(station.name, 128);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-meta-c">
            <Music2 size={22} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Nombre y género */}
      <div className="min-w-0">
        <h3 className="font-semibold text-[15px] md:text-[17px] leading-tight truncate">
          {station.name}
        </h3>
        <p className={`text-[13px] truncate ${isPlaying ? 'text-white/75' : 'text-meta-c'}`}>
          {genre}
          <span className="md:hidden"> · {station.country || 'Global'}</span>
        </p>
      </div>

      {/* Procedencia */}
      <div className="hidden md:block min-w-0">
        <p className={`t-data text-[11px] truncate ${isPlaying ? 'text-white/75' : 'text-meta-c'}`}>
          {code} {station.country || 'Global'}
        </p>
      </div>

      {/* Calidad de transmisión, o el nivel de señal si está sonando */}
      <div className="hidden md:block">
        {isPlaying ? (
          <div className="flex items-end gap-[3px] h-4" aria-label="Sonando">
            {[0, 0.15, 0.3, 0.45].map((delay) => (
              <div
                key={delay}
                className="w-[3px] bg-white animate-sound-wave"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        ) : (
          <span className="t-data text-[11px] text-meta-c">
            {station.bitrate ? `${station.bitrate} kbps` : '—'}
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 md:gap-2">
        <button
          type="button"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(station);
          }}
          className={`w-9 h-9 flex items-center justify-center transition-colors ${isPlaying ? 'text-white' : 'text-meta-c hover:text-ink dark:hover:text-paper'
            }`}
        >
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        <span
          className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-colors ${isPlaying
            ? 'bg-white text-ink'
            : 'surface text-ink dark:text-paper group-hover:bg-ink group-hover:text-paper dark:group-hover:bg-paper dark:group-hover:text-ink'
            }`}
        >
          {isPlaying
            ? <Pause size={16} fill="currentColor" strokeWidth={0} />
            : <Play size={16} fill="currentColor" strokeWidth={0} />}
        </span>
      </div>
    </div>
  );
};

export default StationCard;

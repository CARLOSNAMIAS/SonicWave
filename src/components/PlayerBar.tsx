
import React, { useState } from 'react';
import { RadioStation } from '@/types';
import { Play, Pause, Volume2, SkipBack, SkipForward, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

/**
 * Props for the PlayerBar component.
 * @property {RadioStation | null} currentStation - The radio station currently loaded in the player.
 * @property {boolean} isPlaying - Whether the audio is currently playing.
 * @property {() => void} onPlayPause - Function to toggle play/pause state.
 * @property {number} volume - The current volume level (0 to 1).
 * @property {(val: number) => void} onVolumeChange - Function to call when the volume is changed.
 * @property {boolean} isLoading - Whether the audio stream is currently loading.
 */
interface PlayerBarProps {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: (direction: 'next' | 'previous') => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  isLoading: boolean;
  analyser: AnalyserNode | null;
  isFavorite: boolean;
  onToggleFavorite: (station: RadioStation) => void;
}

const fallbackArt = (name: string, size: number) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000000&color=E9E6DF&size=${size}&font-size=0.34&bold=true&format=png`;

/** Indicador de carga: dos filetes girando, sin círculos. */
const Tuning: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <span
    className="animate-spin block border-2 border-current border-r-transparent border-b-transparent"
    style={{ width: size, height: size }}
  />
);

/**
 * Reproductor fijo al pie de la página.
 * Es la única superficie permanentemente negra de la interfaz: ancla el diseño y
 * deja claro, en cualquier vista, qué se está escuchando. En móvil se despliega a
 * pantalla completa con la carátula y el medidor de espectro.
 */
const PlayerBar: React.FC<PlayerBarProps> = ({
  currentStation,
  isPlaying,
  onPlayPause,
  onSkip,
  volume,
  onVolumeChange,
  isLoading,
  analyser,
  isFavorite,
  onToggleFavorite
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentStation) return null;

  const genre = currentStation.tags?.split(',')[0] || 'Radio';
  const code = (currentStation.countrycode || '--').slice(0, 2).toUpperCase();
  const artwork = currentStation.favicon || fallbackArt(currentStation.name, 512);

  return (
    <>
      {/* Vista a pantalla completa (móvil) */}
      <div
        className={`fixed inset-0 z-[70] bg-ink text-paper transition-transform duration-300 ease-out ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 h-14 shrink-0">
            <span className="t-data text-[11px] text-white/50">
              {isPlaying ? 'En vivo' : 'En pausa'}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              title="Cerrar reproductor"
              aria-label="Cerrar reproductor"
            >
              <ChevronDown size={22} />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-6 py-8 gap-8 overflow-y-auto scrollbar-hide">
            <img
              src={artwork}
              alt=""
              className="w-full max-w-[280px] aspect-square object-cover mx-auto grayscale contrast-125"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackArt(currentStation.name, 512);
              }}
            />

            <div>
              <h2 className="t-display text-[clamp(2rem,9vw,3.5rem)] break-words">
                {currentStation.name}
              </h2>
              <p className="t-data text-[11px] text-white/50 mt-3 flex items-center gap-2">
                <span className={`w-2 h-2 shrink-0 ${isPlaying ? 'bg-signal animate-signal-blink' : 'bg-white/30'}`} />
                {code} {currentStation.country} · {genre}
                {currentStation.bitrate ? ` · ${currentStation.bitrate} kbps` : ''}
              </p>
            </div>

            <div className="h-16 w-full py-2">
              <AudioVisualizer analyser={analyser} isPlaying={isPlaying} bars={40} height={56} />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSkip('previous')}
                title="Emisora anterior"
                aria-label="Emisora anterior"
                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <SkipBack size={22} fill="currentColor" strokeWidth={0} />
              </button>

              <button
                type="button"
                onClick={onPlayPause}
                title={isPlaying ? 'Pausar' : 'Reproducir'}
                className="w-20 h-20 bg-signal text-white flex items-center justify-center active:bg-white active:text-ink transition-colors"
              >
                {isLoading
                  ? <Tuning size={26} />
                  : isPlaying
                    ? <Pause size={30} fill="currentColor" strokeWidth={0} />
                    : <Play size={30} fill="currentColor" strokeWidth={0} />}
              </button>

              <button
                type="button"
                onClick={() => onSkip('next')}
                title="Emisora siguiente"
                aria-label="Emisora siguiente"
                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <SkipForward size={22} fill="currentColor" strokeWidth={0} />
              </button>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <button
                type="button"
                onClick={() => onToggleFavorite(currentStation)}
                className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors"
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
                {isFavorite ? 'Guardada' : 'Guardar'}
              </button>

              <div className="flex items-center gap-3 flex-1">
                <Volume2 size={16} className="text-white/40 shrink-0" />
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
                  className="flex-1"
                  title="Volumen"
                  aria-label="Volumen"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra fija */}
      <div className="fixed bottom-0 inset-x-0 z-[60] bg-ink text-paper">
        <div className={`h-[3px] ${isPlaying ? 'bg-signal' : 'bg-white/15'}`} />

        <div className="max-w-[1600px] mx-auto h-[72px] px-3 md:px-8 flex items-center gap-4 md:gap-8">
          {/* Emisora */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <button
              type="button"
              className="w-12 h-12 md:w-14 md:h-14 overflow-hidden bg-white/10 shrink-0"
              onClick={() => setIsExpanded(true)}
              aria-label="Abrir reproductor"
            >
              <img
                src={currentStation.favicon || fallbackArt(currentStation.name, 128)}
                alt=""
                className="w-full h-full object-cover grayscale contrast-125"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackArt(currentStation.name, 128);
                }}
              />
            </button>
            <div className="min-w-0">
              <h4 className="font-semibold text-[15px] truncate leading-tight">{currentStation.name}</h4>
              <p className="t-data text-[10px] text-white/45 truncate mt-0.5">
                {code} {currentStation.country || 'Global'} · {genre}
              </p>
            </div>
          </div>

          {/* Transporte */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSkip('previous')}
              title="Emisora anterior"
              aria-label="Emisora anterior"
              className="hidden sm:flex w-10 h-10 items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <SkipBack size={18} fill="currentColor" strokeWidth={0} />
            </button>

            <button
              type="button"
              onClick={onPlayPause}
              title={isPlaying ? 'Pausar' : 'Reproducir'}
              className="w-12 h-12 flex items-center justify-center bg-paper text-ink hover:bg-signal hover:text-white transition-colors"
            >
              {isLoading
                ? <Tuning size={18} />
                : isPlaying
                  ? <Pause size={20} fill="currentColor" strokeWidth={0} />
                  : <Play size={20} fill="currentColor" strokeWidth={0} />}
            </button>

            <button
              type="button"
              onClick={() => onSkip('next')}
              title="Emisora siguiente"
              aria-label="Emisora siguiente"
              className="hidden sm:flex w-10 h-10 items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <SkipForward size={18} fill="currentColor" strokeWidth={0} />
            </button>
          </div>

          {/* Medidor y volumen */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
            <div className="h-8 w-[200px] lg:w-[280px]">
              <AudioVisualizer analyser={analyser} isPlaying={isPlaying} bars={36} height={32} />
            </div>

            <div className="hidden lg:flex items-center gap-3 w-32">
              <Volume2 size={16} className="text-white/40 shrink-0" />
              <input
                type="range" min="0" max="1" step="0.01"
                value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
                className="w-full"
                title="Volumen"
                aria-label="Volumen"
              />
            </div>

            <button
              type="button"
              onClick={() => onToggleFavorite(currentStation)}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          </div>

          {/* Accesos en móvil */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(currentStation)}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="w-10 h-10 flex items-center justify-center text-white/50"
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
            <button
              type="button"
              title="Abrir reproductor"
              aria-label="Abrir reproductor"
              className="w-10 h-10 flex items-center justify-center text-white/50"
              onClick={() => setIsExpanded(true)}
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerBar;

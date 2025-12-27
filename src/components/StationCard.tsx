
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
 */
interface StationCardProps {
  station: RadioStation;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
}

/**
 * Un componente de tarjeta que muestra información sobre una única emisora de radio.
 * Muestra el nombre, el país y la imagen de la emisora. También proporciona controles
 * para reproducir/pausar la emisora y para agregarla/eliminarla de favoritos.
 */
const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  isPlaying, 
  isFavorite, 
  onPlay, 
  onToggleFavorite 
}) => {
  return (
    <div 
      onClick={() => onPlay(station)}
      className={`
        group relative p-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50
        hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 cursor-pointer
        ${isPlaying ? 'ring-2 ring-cyan-500/50 bg-slate-50 dark:bg-slate-800/60' : ''}
      `}
    >
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
        {station.favicon ? (
          <img 
            src={station.favicon} 
            alt={station.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
            <Music2 size={48} strokeWidth={1.5} />
          </div>
        )}
        
        {/* Superposición del botón de reproducción */}
        <div className={`
          absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isPlaying ? 'opacity-100' : ''}
        `}>
          <div className={`
            p-4 rounded-full shadow-2xl transition-all duration-500 transform
            ${isPlaying ? 'sonic-gradient scale-110' : 'bg-white/90 dark:bg-slate-900/90 scale-90 group-hover:scale-100'}
            text-${isPlaying ? 'white' : 'cyan-500'}
          `}>
            {isPlaying ? <Pause size={24} fill="currentColor" strokeWidth={0} /> : <Play size={24} fill="currentColor" strokeWidth={0} className="ml-1" />}
          </div>
        </div>

        {isPlaying && (
          <div className="absolute bottom-3 left-3 flex items-end gap-1 h-4">
            {[0, 0.2, 0.4].map((delay) => (
              <div 
                key={delay}
                className="w-1 bg-white animate-sound-wave rounded-full" 
                style={{ animationDelay: `${delay}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      <div className="px-1 pb-2">
        <h3 className="font-bold text-slate-900 dark:text-white truncate text-[15px] tracking-tight mb-0.5">
          {station.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate uppercase tracking-wider">
          {station.country || 'Global'} • {station.tags ? station.tags.split(',')[0] : 'Radio'}
        </p>
      </div>

      <button 
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(station);
        }}
        className={`
          absolute top-5 right-5 p-2 rounded-full transition-all backdrop-blur-md
          ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-white/70 bg-black/20 opacity-0 group-hover:opacity-100 hover:bg-black/40'}
        `}
      >
        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2} />
      </button>
    </div>
  );
};

export default StationCard;

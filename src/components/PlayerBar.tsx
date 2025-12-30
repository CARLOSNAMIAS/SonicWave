
import React, { useState } from 'react';
import { RadioStation } from '@/types';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, ChevronDown, ChevronUp, Music2, Maximize2, Activity } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

/**
 * Props for the PlayerBar component.
 * @property {RadioStation | null} currentStation - The radio station currently loaded in the player.
 * @property {boolean} isPlaying - Whether the audio is currently playing.
 * @property {() => void} onPlayPause - Function to toggle play/pause state.
 * @property {number} volume - The current volume level (0 to 1).
 * @property {(val: number) => void} onVolumeChange - Function to call when the volume is changed.
 * @property {boolean} isLoading - Whether the audio stream is currently loading.
 * @property {React.RefObject<HTMLAudioElement | null>} audioRef - Ref to the HTMLAudioElement for direct control.
 */
interface PlayerBarProps {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: (direction: 'next' | 'previous') => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  isLoading: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  analyser: AnalyserNode | null;
}

/**
 * A responsive audio player component that appears at the bottom of the screen.
 * It has two views:
 * 1. A compact bar for desktop and mobile.
 * 2. An expandable, full-screen view with more details, primarily for mobile.
 * It displays the current station, playback controls, and volume controls.
 */
const PlayerBar: React.FC<PlayerBarProps> = ({
  currentStation,
  isPlaying,
  onPlayPause,
  onSkip,
  volume,
  onVolumeChange,
  isLoading,
  analyser
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentStation) return null;

  return (
    <>
      {/* Mobile Fullscreen (Premium Look) */}
      <div className={`fixed inset-0 z-[70] bg-sonic-darker transition-all duration-700 ease-in-out transform ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
        <div className="h-full flex flex-col p-6 relative overflow-y-auto scrollbar-hide">
          <button onClick={() => setIsExpanded(false)} className="self-center p-2 sm:p-4 text-slate-400 hover:text-white transition-colors shrink-0" title="Close player">
            <ChevronDown size={40} strokeWidth={1.5} />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center space-y-8 sm:space-y-12 py-4">
            <div className={`w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(34,211,238,0.3)] transition-all duration-1000 transform ${isPlaying ? 'scale-100 rotate-0' : 'scale-90 rotate-2 opacity-50'}`}>
              <img
                src={currentStation.favicon || `https://picsum.photos/600/600?radio=${currentStation.stationuuid}`}
                alt={currentStation.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full max-w-sm text-center space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 truncate px-4">{currentStation.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded">Live</span>
                <p className="text-slate-400 font-bold text-sm tracking-wide">{currentStation.country} • {currentStation.tags?.split(',')[0]}</p>
              </div>

              {/* Main Visualizer in Expanded Mode */}
              <div className="h-20 sm:h-24 w-full px-8 mt-4 sm:mt-8">
                <AudioVisualizer analyser={analyser} isPlaying={isPlaying} bars={48} height={100} />
              </div>
            </div>

            <div className="flex items-center gap-12">
              <button type="button" onClick={() => onSkip('previous')} title="Skip Back" className="text-slate-500 hover:text-white transition-all transform active:scale-90"><SkipBack size={32} /></button>
              <button
                type="button"
                onClick={onPlayPause}
                title={isPlaying ? "Pause" : "Play"}
                className="w-20 h-20 sonic-gradient text-white rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause size={40} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play size={40} className="ml-2" fill="currentColor" strokeWidth={0} />
                )}
              </button>
              <button type="button" onClick={() => onSkip('next')} title="Skip Forward" className="text-slate-500 hover:text-white transition-all transform active:scale-90"><SkipForward size={32} /></button>
            </div>

            <div className="w-full max-w-xs space-y-4">
              <div className="flex items-center gap-4">
                <VolumeX className="text-slate-500" size={20} />
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 h-1.5 rounded-full cursor-pointer bg-slate-800"
                  title="Volume control"
                />
                <Volume2 className="text-slate-500" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar (Desktop/Mini) */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 sm:pb-6">
        <div className="max-w-6xl mx-auto sonic-glass border border-white/10 dark:border-white/5 rounded-3xl shadow-2xl h-20 sm:h-24 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 cursor-pointer shadow-lg group relative"
              onClick={() => setIsExpanded(true)}
            >
              <img
                src={currentStation.favicon || ''}
                alt="Logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={e => (e.currentTarget.src = 'https://picsum.photos/100/100')}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 size={16} className="text-white" />
              </div>
            </div>
            <div className="min-w-0 pr-4 hidden sm:block">
              <h4 className="font-bold text-slate-900 dark:text-white text-base truncate tracking-tight">{currentStation.name}</h4>
              <p className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest truncate">{currentStation.country || 'Worldwide'}</p>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1 space-y-2">
            <div className="flex items-center gap-8">
              <button type="button" onClick={() => onSkip('previous')} title="Skip Back" className="text-slate-400 hover:text-cyan-500 transition-colors hidden sm:block"><SkipBack size={20} /></button>
              <button
                type="button"
                onClick={onPlayPause}
                title={isPlaying ? "Pause" : "Play"}
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg
                    ${isPlaying ? 'bg-white dark:bg-slate-100 text-slate-900' : 'sonic-gradient text-white'}
                  `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause size={24} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play size={24} className="ml-1" fill="currentColor" strokeWidth={0} />
                )}
              </button>
              <button type="button" onClick={() => onSkip('next')} title="Skip Forward" className="text-slate-400 hover:text-cyan-500 transition-colors hidden sm:block"><SkipForward size={20} /></button>
            </div>

            <div className="hidden sm:flex items-center gap-3 w-full max-w-[280px]">
              <Activity size={12} className={isPlaying ? "text-cyan-500 animate-pulse" : "text-slate-600"} />
              <div className="flex-1 h-8 bg-black/20 rounded-lg overflow-hidden border border-white/5">
                <AudioVisualizer analyser={analyser} isPlaying={isPlaying} bars={24} height={32} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-1 justify-end">
            <div className="hidden lg:flex items-center gap-3 w-32 group">
              <Volume2 className="text-slate-400 group-hover:text-cyan-500 transition-colors" size={18} />
              <input
                type="range" min="0" max="1" step="0.01"
                value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-full"
                title="Volume control"
              />
            </div>
            <button
              type="button"
              title="Expand player"
              className="p-2 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800/50 rounded-xl lg:hidden"
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

import React, { useEffect, useState } from 'react';
import { RadioStation } from '@/types';
import { Music, Play, X, Star, Sparkles } from 'lucide-react';

interface RecommendationToastProps {
    station: RadioStation;
    onClose: () => void;
    onPlay: (station: RadioStation) => void;
}

const RecommendationToast: React.FC<RecommendationToastProps> = ({ station, onClose, onPlay }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 200);
        const autoCloseTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 800);
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoCloseTimer);
        };
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 900);
    };

    return (
        <div
            className={`fixed top-28 right-4 z-50 transition-all duration-700 ease-out transform ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
                }`}
        >
            <div className="relative group">
                {/* Subtle dynamic background glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative sonic-glass dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 p-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-3.5 min-w-[280px] max-w-sm backdrop-blur-xl">
                    {/* Station Favicon */}
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-black/5 dark:border-white/5 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {station.favicon ? (
                                <img
                                    src={station.favicon}
                                    className="w-full h-full object-cover"
                                    alt={station.name}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=0D9488&color=fff&size=128&font-size=0.33&bold=true`;
                                    }}
                                />
                            ) : (
                                <Music size={20} className="text-slate-400" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                            <Star size={8} fill="currentColor" />
                        </div>
                    </div>

                    {/* Content info */}
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Sparkles size={10} className="text-cyan-500" fill="currentColor" />
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-cyan-500/80">Sugerencia IA</p>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm leading-tight mb-0.5">{station.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mb-2">
                            <span className="truncate">{station.country || 'Global'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
                            <span className="truncate opacity-75">{station.tags?.split(',')[0] || 'Radio'}</span>
                        </div>

                        <button
                            onClick={() => onPlay(station)}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white sonic-gradient px-4 py-1.5 rounded-lg active:scale-95 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                        >
                            <Play size={10} fill="currentColor" /> Escuchar
                        </button>
                    </div>

                    {/* Refined close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center justify-center rounded-lg hover:bg-rose-500/10"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationToast;

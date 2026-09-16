import React, { useEffect, useState } from 'react';
import { RadioStation } from '@/types';
import { Music, Play, X } from 'lucide-react';

interface RecommendationToastProps {
    station: RadioStation;
    onClose: () => void;
    onPlay: (station: RadioStation) => void;
}

/**
 * Aviso lateral con la emisora que el DJ propone a partir de lo que acabas de guardar.
 * Se retira solo a los ocho segundos.
 */
const RecommendationToast: React.FC<RecommendationToastProps> = ({ station, onClose, onPlay }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 200);
        const autoCloseTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoCloseTimer);
        };
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 500);
    };

    return (
        <div
            className={`fixed top-20 right-0 z-50 w-[320px] max-w-[calc(100vw-2rem)] transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                }`}
        >
            <div className="bg-ink text-paper border-l-[3px] border-signal">
                <div className="flex items-start justify-between px-4 pt-3">
                    <p className="t-data text-[10px] text-white/50">Te puede sonar</p>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Descartar sugerencia"
                        className="text-white/40 hover:text-white transition-colors -mr-1"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 shrink-0 bg-white/10 flex items-center justify-center overflow-hidden">
                        {station.favicon ? (
                            <img
                                src={station.favicon}
                                className="w-full h-full object-cover grayscale contrast-125"
                                alt=""
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=000000&color=E9E6DF&size=128&font-size=0.34&bold=true&format=png`;
                                }}
                            />
                        ) : (
                            <Music size={18} className="text-white/40" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h4 className="font-semibold text-[15px] leading-tight truncate">{station.name}</h4>
                        <p className="t-data text-[10px] text-white/45 truncate mt-1">
                            {station.country || 'Global'} · {station.tags?.split(',')[0] || 'Radio'}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onPlay(station)}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-signal text-white text-[14px] font-semibold hover:bg-white hover:text-ink transition-colors"
                >
                    <Play size={14} fill="currentColor" strokeWidth={0} /> Escuchar ahora
                </button>
            </div>
        </div>
    );
};

export default RecommendationToast;

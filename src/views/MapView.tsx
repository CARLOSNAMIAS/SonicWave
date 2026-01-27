
import React, { useState } from 'react';
import { RadioStation, SearchFilters } from '@/types';
import { Globe, MapPin, Search, Music, Zap } from 'lucide-react';

interface MapViewProps {
    onPerformSearch: (filters: SearchFilters) => void;
}

const regions = [
    { name: 'América del Sur', country: 'Argentina,Brazil,Chile,Colombia,Peru,Venezuela', icon: '🌎' },
    { name: 'Europa', country: 'Spain,Germany,France,Italy,United Kingdom,Netherlands', icon: '🌍' },
    { name: 'América del Norte', country: 'USA,Canada,Mexico', icon: '🌎' },
    { name: 'Asia', country: 'Japan,China,Korea,India,Thailand', icon: '🌏' },
    { name: 'África', country: 'Nigeria,Egypt,South Africa,Morocco', icon: '🌍' },
    { name: 'Oceanía', country: 'Australia,New Zealand', icon: '🌏' }
];

const MapView: React.FC<MapViewProps> = ({ onPerformSearch }) => {
    const [activeRegion, setActiveRegion] = useState<string | null>(null);

    const handleCountryClick = (country: string) => {
        onPerformSearch({ country, limit: 30 });
    };

    return (
        <div className="py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center mb-12 text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 text-cyan-500">
                    <Globe size={40} className="animate-spin-slow" />
                </div>
                <h1 className="text-4xl font-black dark:text-white tracking-tight mb-2">Explorador Global</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg">Sintoniza cualquier parte del planeta. Selecciona una región para descubrir sus ondas sonoras.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {regions.map((region) => (
                    <div
                        key={region.name}
                        className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${activeRegion === region.name
                                ? 'border-cyan-500 ring-4 ring-cyan-500/10 bg-cyan-500/5'
                                : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:border-cyan-500/50'
                            }`}
                        onClick={() => setActiveRegion(activeRegion === region.name ? null : region.name)}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">{region.icon}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeRegion === region.name ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                                    <Zap size={14} fill={activeRegion === region.name ? "currentColor" : "none"} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold dark:text-white mb-2">{region.name}</h3>
                            <div className="flex flex-wrap gap-2 transition-all">
                                {region.country.split(',').map(country => (
                                    <span
                                        key={country}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCountryClick(country.trim());
                                        }}
                                        className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
                                    >
                                        {country.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 p-8 rounded-[2rem] border border-cyan-500/20 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black dark:text-white tracking-tight">¿Buscas algo específico?</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Prueba con géneros o estados de ánimo específicos.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => onPerformSearch({ tag: 'chillout' })}
                        className="px-6 py-3 bg-white dark:bg-sonic-darker border border-cyan-500/30 dark:text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Music size={18} className="text-cyan-500" /> Relax
                    </button>
                    <button
                        onClick={() => onPerformSearch({ tag: 'news' })}
                        className="px-6 py-3 bg-cyan-500 text-white rounded-2xl font-bold shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Search size={18} /> Noticias
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapView;

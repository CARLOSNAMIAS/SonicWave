
import React from 'react';
import { SearchFilters } from '@/types';
import { useSEO } from '@/hooks/useSEO';

interface MapViewProps {
    onPerformSearch: (filters: SearchFilters) => void;
}

const regions = [
    { name: 'América del Sur', countries: ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Peru', 'Venezuela'] },
    { name: 'Europa', countries: ['Spain', 'Germany', 'France', 'Italy', 'United Kingdom', 'Netherlands'] },
    { name: 'América del Norte', countries: ['USA', 'Canada', 'Mexico'] },
    { name: 'Asia', countries: ['Japan', 'China', 'Korea', 'India', 'Thailand'] },
    { name: 'África', countries: ['Nigeria', 'Egypt', 'South Africa', 'Morocco'] },
    { name: 'Oceanía', countries: ['Australia', 'New Zealand'] },
];

/**
 * Directorio por regiones: cada región es una celda de la retícula y cada país
 * un renglón que lanza la búsqueda.
 */
const MapView: React.FC<MapViewProps> = ({ onPerformSearch }) => {
    useSEO({
        title: 'Radio por países | SonicWave',
        description: 'Explora emisoras de radio en directo por regiones y países: América, Europa, Asia, África y Oceanía. Elige un país y escucha lo que suena allí ahora mismo.',
        path: '/?view=EXPLORE'
    });

    return (
        <div className="pt-10">
            <header className="pb-10">
                <h1 className="t-display text-[clamp(2.5rem,12vw,8rem)]">
                    Elige un<br />rincón del mundo
                </h1>
                <p className="mt-8 text-[17px] leading-relaxed max-w-[48ch] text-meta-c">
                    Seis regiones, los países con más emisoras activas de cada una.
                    Toca cualquiera y el índice se llena con sus señales.
                </p>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {regions.map(region => (
                    <section key={region.name} className="surface pb-2">
                        <h2 className="t-display text-[clamp(1.25rem,3.5vw,1.75rem)] px-5 py-4">
                            {region.name}
                        </h2>
                        <ul>
                            {region.countries.map(country => (
                                <li key={country}>
                                    <button
                                        type="button"
                                        onClick={() => onPerformSearch({ country, limit: 30 })}
                                        className="w-full text-left px-5 py-2.5 text-[15px] hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                                    >
                                        {country}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            <section className="py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h2 className="t-display text-[clamp(1.5rem,5vw,2.5rem)] max-w-[16ch]">
                    ¿Prefieres ir por ambiente?
                </h2>
                <div className="flex flex-wrap gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => onPerformSearch({ tag: 'chillout' })}
                        className="h-11 px-6 surface text-[15px] font-medium hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                    >
                        Algo tranquilo
                    </button>
                    <button
                        type="button"
                        onClick={() => onPerformSearch({ tag: 'news' })}
                        className="h-11 px-6 bg-ink text-paper dark:bg-paper dark:text-ink text-[15px] font-medium hover:bg-signal hover:text-white dark:hover:bg-signal dark:hover:text-white transition-colors"
                    >
                        Noticias en directo
                    </button>
                </div>
            </section>
        </div>
    );
};

export default MapView;

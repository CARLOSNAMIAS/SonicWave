
import React from 'react';
import { SearchFilters } from '@/types';
import { useSEO } from '@/hooks/useSEO';
import { countryLabel } from '@/data/countries';

interface MapViewProps {
    onPerformSearch: (filters: SearchFilters) => void;
}

// Los países van con el nombre que entiende la API; en pantalla se muestran en español.
const regions = [
    { name: 'Sudamérica', countries: ['Colombia', 'Venezuela', 'Argentina', 'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Brazil'] },
    { name: 'Centroamérica y el Caribe', countries: ['Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Dominican Republic', 'Puerto Rico'] },
    { name: 'Norteamérica', countries: ['Mexico', 'USA', 'Canada'] },
    { name: 'Europa', countries: ['Spain', 'Portugal', 'France', 'Italy', 'Germany', 'United Kingdom', 'Netherlands'] },
    { name: 'Asia', countries: ['Japan', 'Korea', 'China', 'India', 'Thailand'] },
    { name: 'África y Oceanía', countries: ['Morocco', 'Egypt', 'Nigeria', 'South Africa', 'Australia', 'New Zealand'] },
];

/**
 * Directorio por regiones: cada región es una celda de la retícula y cada país
 * un renglón que lanza la búsqueda.
 */
const MapView: React.FC<MapViewProps> = ({ onPerformSearch }) => {
    useSEO({
        title: 'Radio en vivo por país: emisoras de Latinoamérica y el mundo | SonicWave',
        description: 'Escucha radio en vivo por país: México, Colombia, Venezuela, Argentina, Perú, Centroamérica, el Caribe y el resto del mundo. Elige un país y escucha lo que suena allí ahora mismo.',
        path: '/?view=EXPLORE'
    });

    return (
        <div className="pt-10">
            <header className="pb-10">
                <h1 className="t-display text-[clamp(2.5rem,12vw,8rem)]">
                    Radio en vivo<br />por país
                </h1>
                <p className="mt-8 text-[17px] leading-relaxed max-w-[48ch] text-meta-c">
                    De Latinoamérica al resto del mundo: los países con más emisoras activas de cada región.
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
                                        {countryLabel(country)}
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
                        Noticias en vivo
                    </button>
                </div>
            </section>
        </div>
    );
};

export default MapView;

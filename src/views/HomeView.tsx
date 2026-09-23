import React from 'react';
import { RadioStation, SearchFilters } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { useSEO } from '@/hooks/useSEO';
import StationCard from '@/components/StationCard';
import SkeletonCard from '@/components/SkeletonCard';
import HeroCarousel from '@/components/HeroCarousel';
import ContentHeader from '@/components/ContentHeader';
import { getContentForFilter, ContentInfo } from '@/data/contentData';
import { countryLabel } from '@/data/countries';
import { ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

// Primero Latinoamérica, que es a quien se dirige el sitio; después, el resto.
// `name` es el nombre que entiende la API; el que se muestra sale de `countryLabel`.
const POPULAR_COUNTRIES = [
    { name: 'Mexico', code: 'mx' },
    { name: 'Colombia', code: 'co' },
    { name: 'Venezuela', code: 've' },
    { name: 'Argentina', code: 'ar' },
    { name: 'Peru', code: 'pe' },
    { name: 'Chile', code: 'cl' },
    { name: 'Ecuador', code: 'ec' },
    { name: 'Guatemala', code: 'gt' },
    { name: 'Dominican Republic', code: 'do' },
    { name: 'Cuba', code: 'cu' },
    { name: 'Bolivia', code: 'bo' },
    { name: 'Honduras', code: 'hn' },
    { name: 'Paraguay', code: 'py' },
    { name: 'El Salvador', code: 'sv' },
    { name: 'Nicaragua', code: 'ni' },
    { name: 'Costa Rica', code: 'cr' },
    { name: 'Panama', code: 'pa' },
    { name: 'Uruguay', code: 'uy' },
    { name: 'Puerto Rico', code: 'pr' },
    { name: 'USA', code: 'us' },
    { name: 'Spain', code: 'es' },
    { name: 'Brazil', code: 'br' },
    { name: 'France', code: 'fr' },
    { name: 'Italy', code: 'it' },
    { name: 'Germany', code: 'de' },
    { name: 'Japan', code: 'jp' },
    { name: 'South Korea', code: 'kr' },
];

const QUICK_MOODS = [
    { id: 'latin', label: 'Música latina', filters: { tag: 'latin' } },
    { id: 'salsa', label: 'Salsa', filters: { tag: 'salsa' } },
    { id: 'reggaeton', label: 'Reguetón', filters: { tag: 'reggaeton' } },
    { id: 'cumbia', label: 'Cumbia', filters: { tag: 'cumbia' } },
    { id: 'bachata', label: 'Bachata', filters: { tag: 'bachata' } },
    { id: 'vallenato', label: 'Vallenato', filters: { tag: 'vallenato' } },
    { id: 'rock', label: 'Rock', filters: { tag: 'rock' } },
    { id: 'hip-hop', label: 'Rap', filters: { tag: 'hip-hop' } },
    { id: 'electronic', label: 'Electrónica', filters: { tag: 'electronic' } },
    { id: 'jazz', label: 'Jazz', filters: { tag: 'jazz' } },
    { id: 'lofi', label: 'Para concentrarse', filters: { tag: 'lofi' } },
    { id: 'dance', label: 'Para bailar', filters: { tag: 'dance' } },
    { id: 'chill', label: 'Tranquila', filters: { tag: 'chillout' } },
    { id: 'podcast', label: 'Pódcast en español', filters: { tag: 'podcast', name: 'spanish' } },
    { id: 'bts', label: 'Radio de BTS', filters: { name: 'bts' } },
];

interface HomeViewProps {
    stations: RadioStation[];
    isFetching: boolean;
    searchTitle: string;
    aiReasoning: string | null;
    favorites: RadioStation[];
    onToggleFavorite: (station: RadioStation) => void;
    onPerformSearch: (filters: SearchFilters) => void;
    countryScrollRef: React.RefObject<HTMLDivElement | null>;
    resultsSectionRef: React.RefObject<HTMLDivElement | null>;
    onCountryScroll: (direction: 'left' | 'right') => void;
}

/**
 * Portada de la aplicación.
 * Se lee de arriba abajo como un número de revista: apertura, géneros, países,
 * la nota del DJ cuando ha buscado él, y el índice de emisoras.
 */
const HomeView: React.FC<HomeViewProps> = ({
    stations,
    isFetching,
    searchTitle,
    aiReasoning,
    favorites,
    onToggleFavorite,
    onPerformSearch,
    countryScrollRef,
    resultsSectionRef,
    onCountryScroll
}) => {
    const { currentStation, isPlaying, handlePlayPause } = usePlayer();
    const [activeContent, setActiveContent] = React.useState<ContentInfo | null>(null);
    const [activeFilterId, setActiveFilterId] = React.useState<string | null>(null);

    const handleSearch = (filters: SearchFilters, id?: string) => {
        onPerformSearch(filters);
        const type = filters.country ? 'country' : (filters.tag ? 'tag' : 'default');
        const key = filters.country || filters.tag || 'default';
        setActiveContent(getContentForFilter(key, type));
        setActiveFilterId(id || null);
    };

    useSEO({
        title: activeContent ? `${activeContent.title} | SonicWave` : 'Radio en vivo gratis: emisoras latinas y del mundo | SonicWave',
        description: activeContent?.description || 'Escucha radio en vivo gratis: emisoras de México, Colombia, Venezuela, Argentina y más de 190 países. Salsa, reguetón, noticias y fútbol, sin registro.',
        path: '/'
    });

    return (
        <div>
            <HeroCarousel count={stations.length} />

            {/* Géneros: casillas separadas por espacio, iguales en móvil y escritorio */}
            <section className="pt-14">
                <h2 className="t-data text-[10px] text-meta-c mb-5">¿Qué quieres escuchar?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {QUICK_MOODS.map(mood => (
                        <button
                            key={mood.id}
                            onClick={() => handleSearch(mood.filters, mood.id)}
                            className={`text-left px-4 py-5 text-[15px] font-medium transition-colors ${activeFilterId === mood.id
                                ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                                : 'surface hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink'
                                }`}
                        >
                            {mood.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Países */}
            <section className="relative pt-14">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="t-data text-[10px] text-meta-c">O elige un país</h2>
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            type="button"
                            title="Ver países anteriores"
                            onClick={() => onCountryScroll('left')}
                            className="w-8 h-8 flex items-center justify-center surface text-meta-c hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            title="Ver más países"
                            onClick={() => onCountryScroll('right')}
                            className="w-8 h-8 flex items-center justify-center surface text-meta-c hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                        >
                            <ChevronRightIcon size={16} />
                        </button>
                    </div>
                </div>

                <div ref={countryScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {POPULAR_COUNTRIES.map(c => (
                        <button
                            key={c.code}
                            onClick={() => handleSearch({ country: c.name }, c.code)}
                            className={`shrink-0 w-[124px] px-4 py-4 text-left transition-colors ${activeFilterId === c.code
                                ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                                : 'surface hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink'
                                }`}
                        >
                            <img
                                src={`https://flagcdn.com/w160/${c.code}.png`}
                                className="w-[76px] h-[50px] object-cover mb-3"
                                loading="lazy"
                                alt={`Bandera de ${countryLabel(c.name)}`}
                            />
                            <span className="text-[14px] font-medium block truncate">{countryLabel(c.name)}</span>
                            <span className={`t-data text-[10px] ${activeFilterId === c.code ? 'opacity-60' : 'text-meta-c'}`}>
                                {c.code.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Lo que dice el DJ sobre esta selección */}
            {aiReasoning && (
                <section className="pt-16">
                    <div className="border-l-[3px] border-signal pl-5 md:pl-8 max-w-[52ch]">
                        <p className="t-data text-[10px] text-meta-c mb-3">El DJ eligió esto</p>
                        <p key={aiReasoning} className="text-[22px] md:text-[28px] leading-[1.25] font-medium">
                            {aiReasoning}
                        </p>
                    </div>
                </section>
            )}

            {/* Índice de emisoras */}
            <section ref={resultsSectionRef} className="pt-16">
                {activeContent && !aiReasoning && <ContentHeader content={activeContent} />}

                <div className="flex items-end justify-between gap-6 mb-6">
                    <h2 key={searchTitle} className="t-display text-[clamp(1.8rem,6vw,3rem)]">
                        {searchTitle}
                    </h2>
                    <span className="t-data text-[10px] text-meta-c shrink-0 pb-1">
                        {stations.length} emisoras
                    </span>
                </div>

                <div className="">
                    {isFetching ? (
                        Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        stations.map((s, i) => (
                            <StationCard
                                key={s.stationuuid}
                                station={s}
                                index={i + 1}
                                isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                                isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                                onPlay={handlePlayPause}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))
                    )}
                </div>

                {stations.length === 0 && !isFetching && (
                    <div className="py-24 max-w-[44ch]">
                        <p className="t-display text-[clamp(1.5rem,5vw,2.25rem)] mb-4">Sin resultados</p>
                        <p className="text-[15px] leading-relaxed text-meta-c">
                            Esa búsqueda no devolvió emisoras. Prueba con un género de la lista
                            de arriba o pídele al DJ que busque por ti.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomeView;

import React from 'react';
import { RadioStation, SearchFilters } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { useSEO } from '@/hooks/useSEO';
import StationCard from '@/components/StationCard';
import SkeletonCard from '@/components/SkeletonCard';
import HeroCarousel from '@/components/HeroCarousel';
import ContentHeader from '@/components/ContentHeader';
import { getContentForFilter, ContentInfo } from '@/data/contentData';
import { Music, LayoutGrid, X, Compass, Sparkles, Trophy, ChevronLeft, ChevronRight as ChevronRightIcon, Coffee, Zap, Moon, Heart, Mic } from 'lucide-react';

// Constants moved to a local scope or separate file if preferred
const POPULAR_COUNTRIES = [
    { name: 'Venezuela', code: 've', label: 'Venezuela' },
    { name: 'Spain', code: 'es', label: 'España' },
    { name: 'USA', code: 'us', label: 'USA' },
    { name: 'Mexico', code: 'mx', label: 'México' },
    { name: 'Argentina', code: 'ar', label: 'Arg' },
    { name: 'Bolivia', code: 'bo', label: 'Bolivia' },
    { name: 'Chile', code: 'cl', label: 'Chile' },
    { name: 'Colombia', code: 'co', label: 'Col' },
    { name: 'Ecuador', code: 'ec', label: 'Ecuador' },
    { name: 'Peru', code: 'pe', label: 'Perú' },
    { name: 'Uruguay', code: 'uy', label: 'Uruguay' },
    { name: 'Brazil', code: 'br', label: 'Brasil' },
    { name: 'France', code: 'fr', label: 'Francia' },
    { name: 'Italy', code: 'it', label: 'Italia' },
    { name: 'Germany', code: 'de', label: 'Alemania' },
    { name: 'Japan', code: 'jp', label: 'Japón' },
    { name: 'South Korea', code: 'kr', label: 'Corea' },
    { name: 'China', code: 'cn', label: 'China' },
    { name: 'India', code: 'in', label: 'India' },
    { name: 'Indonesia', code: 'id', label: 'Indonesia' },
    { name: 'Philippines', code: 'ph', label: 'Filipinas' },
    { name: 'Thailand', code: 'th', label: 'Tailandia' },
    { name: 'Vietnam', code: 'vn', label: 'Vietnam' },
];

const QUICK_MOODS = [
    { id: 'lofi', icon: <Coffee size={16} />, label: 'Enfoque', filters: { tag: 'lofi' } },
    { id: 'dance', icon: <Zap size={16} />, label: 'Energía', filters: { tag: 'dance' } },
    { id: 'chill', icon: <Moon size={16} />, label: 'Relax', filters: { tag: 'chillout' } },
    { id: 'jazz', icon: <Music size={16} />, label: 'Jazz', filters: { tag: 'jazz' } },
    { id: 'rock', icon: <Music size={16} />, label: 'Rock', filters: { tag: 'rock' } },
    { id: 'hip-hop', icon: <Music size={16} />, label: 'Hip-Hop', filters: { tag: 'hip-hop' } },
    { id: 'electronic', icon: <Music size={16} />, label: 'Electrónica', filters: { tag: 'electronic' } },
    { id: 'latin', icon: <Music size={16} />, label: 'Latino', filters: { tag: 'latin' } },
    { id: 'podcast', icon: <Mic size={16} />, label: 'Podcasts (ESP)', filters: { tag: 'podcast', name: 'spanish' } },
    { id: 'bts', icon: <Heart size={16} className="text-purple-400 fill-purple-400" />, label: 'BTS Army', filters: { name: 'bts' } },
];

interface HomeViewProps {
    stations: RadioStation[];
    featuredStations: RadioStation[];
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
 * The main Home View component.
 * Displays the hero carousel, search filters, popular countries, custom recommendations,
 * and the main grid of radio stations.
 */
const HomeView: React.FC<HomeViewProps> = ({
    stations,
    featuredStations,
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
    const [isFiltersExpanded, setIsFiltersExpanded] = React.useState(false);
    const [activeContent, setActiveContent] = React.useState<ContentInfo | null>(null);

    // Update content when search is performed or mounted
    // We can infer content from searchTitle/state or pass it as prop?
    // For simplicity, let's track the last filter used or default.
    // However, since we don't have the last filter here directly exposed as state in HomeView (it's in App),
    // we might need to derive it or update App to pass it.
    // simpler hack: derived from searchTitle? No, that's brittle.
    // Better: Allow HomeView to accept 'activeFilter' or similar. 
    // OR: just defaulting to general message if not specific.

    // Let's rely on a side-effect of onPerformSearch wrapper:
    // Actually, HomeView props don't have the filter state. 
    // Let's modify the onPerformSearch calls inside HomeView to ALSO update local content state.

    const handleSearch = (filters: SearchFilters) => {
        onPerformSearch(filters);
        const type = filters.country ? 'country' : (filters.tag ? 'tag' : 'default');
        const key = filters.country || filters.tag || 'default';
        setActiveContent(getContentForFilter(key, type));
    };

    useSEO({
        title: activeContent ? `SonicWave - ${activeContent.title}` : 'SonicWave AI Radio - Explora el Mundo',
        description: activeContent?.description || 'Descubre emisoras de radio de todo el mundo con inteligencia artificial.'
    });

    return (
        <div className="space-y-10">
            {/* === CAROUSEL === */}
            <HeroCarousel />

            {/* --- Search and Filter Section --- */}
            <section className="space-y-4">
                {/* Desktop View: Full Grid */}
                <div className="hidden lg:block space-y-4">
                    <div className="flex items-center gap-3 text-slate-400">
                        <Music size={20} />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Categorías Disponibles</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {QUICK_MOODS.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => handleSearch(mood.filters)}
                                className="flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 px-6 py-3 rounded-2xl transition-all border border-slate-200 dark:border-white/5 shadow-sm text-sm font-black uppercase tracking-widest active:scale-95"
                            >
                                {mood.icon} {mood.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile View: Single Unified Button */}
                <div className="lg:hidden space-y-4">
                    {!isFiltersExpanded ? (
                        <button
                            onClick={() => setIsFiltersExpanded(true)}
                            className="w-full sonic-gradient p-[1px] rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
                        >
                            <div className="bg-slate-50 dark:bg-sonic-darker rounded-[15px] px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-white">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                        <LayoutGrid size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-cyan-500">Explorar</p>
                                        <p className="text-lg font-black tracking-tight">Géneros y Podcasts</p>
                                    </div>
                                </div>
                                <ChevronRightIcon size={20} className="text-slate-400" />
                            </div>
                        </button>
                    ) : (
                        <div className="bg-slate-200/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black dark:text-white tracking-tight">Elige una Categoría</h3>
                                <button
                                    onClick={() => setIsFiltersExpanded(false)}
                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {QUICK_MOODS.map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => {
                                            handleSearch(mood.filters);
                                            setIsFiltersExpanded(false);
                                        }}
                                        className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-transparent active:scale-95 transition-all text-xs font-black uppercase tracking-widest text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            {mood.icon}
                                            <span>{mood.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* --- Popular Countries Section --- */}
            <section className="space-y-6 relative">
                <div className="flex items-center gap-3 text-slate-400 mb-6">
                    <Compass size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Países populares</h3>
                </div>
                <div ref={countryScrollRef} className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
                    {POPULAR_COUNTRIES.map(c => (
                        <button key={c.code} onClick={() => handleSearch({ country: c.name })} className="flex flex-col items-center gap-4 group shrink-0">
                            <div className="w-24 h-24 rounded-full p-1.5 border-2 border-transparent group-hover:border-cyan-500 transition-all duration-500 overflow-hidden shadow-xl">
                                <img src={`https://flagcdn.com/w160/${c.code}.png`} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" alt={c.label} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-500 transition-colors">{c.label}</span>
                        </button>
                    ))}
                </div>
                {/* Scroll Buttons for Country List */}
                <button
                    type="button"
                    title="Desplazar países hacia la izquierda"
                    onClick={() => onCountryScroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm transition-colors z-10 hidden md:block"
                >
                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <button
                    type="button"
                    title="Desplazar países hacia la derecha"
                    onClick={() => onCountryScroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm transition-colors z-10 hidden md:block"
                >
                    <ChevronRightIcon size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
            </section>

            {/* --- AI Reasoning Display --- */}
            {aiReasoning && (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-slate-900/90 p-8 rounded-3xl border border-white/10 overflow-hidden animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-cyan-500 mb-4">
                            <Sparkles size={20} fill="currentColor" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Selección de la IA</span>
                        </div>
                        <p
                            key={aiReasoning}
                            className="text-2xl font-bold dark:text-white leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700"
                        >
                            {aiReasoning}
                        </p>
                    </div>
                </div>
            )}

            {/* === FEATURED STATIONS === */}
            {featuredStations.length > 0 && (
                <section className="mt-16 space-y-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="sonic-gradient p-2 rounded-lg shadow-lg">
                                <Trophy size={20} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black dark:text-white tracking-tighter">Selección de los Editores</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed text-sm md:text-base border-l-4 border-cyan-500 pl-4">
                            Cada semana, nuestro equipo editorial y algoritmos de IA seleccionan emisoras que destacan por su calidad de transmisión, unicidad cultural y contribución al paisaje sonoro global. Estas son nuestras recomendaciones principales para empezar tu viaje.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                        {featuredStations.map(s => (
                            <StationCard
                                key={s.stationuuid}
                                station={s}
                                isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                                isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                                onPlay={handlePlayPause}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* --- Main Station List --- */}
            <section ref={resultsSectionRef} className="mt-20 space-y-10">
                {activeContent && !aiReasoning && (
                    <ContentHeader content={activeContent} className="animate-in fade-in slide-in-from-bottom-4" />
                )}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                    <h3
                        key={searchTitle}
                        className="text-xl font-black dark:text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                        {searchTitle}
                    </h3>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {stations.length} Emisoras
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                    {isFetching ? (
                        Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        stations.map(s => (
                            <StationCard
                                key={s.stationuuid}
                                station={s}
                                isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                                isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                                onPlay={handlePlayPause}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))
                    )}
                </div>
                {stations.length === 0 && !isFetching && (
                    <div className="py-32 flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                            <Music size={40} />
                        </div>
                        <p className="text-slate-400 font-bold">No hay nada por aquí todavía...</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomeView;

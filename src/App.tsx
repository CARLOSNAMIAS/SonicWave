import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/hooks/useFavorites';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { RadioStation, ViewState, SearchFilters } from '@/types';
import { searchStations, getTopStations } from '@/services/radioService';
import { getRadioRecommendations } from '@/services/geminiService';
import { customVenezuelaStations } from '@/data/venezuelaStations';
import StationCard from '@/components/StationCard';
import PlayerBar from '@/components/PlayerBar';
import AIDJModal from '@/components/AIDJModal';
import { Radio, Sparkles, Music, Coffee, Zap, Moon, Sun, AlertCircle, Trophy, Compass, Github, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import SkeletonCard from '@/components/SkeletonCard';


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
  
];

const QUICK_MOODS = [
  { id: 'lofi', icon: <Coffee size={16} />, label: 'Enfoque', tag: 'lofi' },
  { id: 'dance', icon: <Zap size={16} />, label: 'Energía', tag: 'dance' },
  { id: 'chill', icon: <Moon size={16} />, label: 'Relax', tag: 'chillout' },
  { id: 'jazz', icon: <Music size={16} />, label: 'Jazz', tag: 'jazz' },
];



/**
 * The main component of the SonicWave AI Radio application.
 * It orchestrates the entire user interface and application logic, including:
 * - State management for stations, views, and searches.
 * - Integration of custom hooks for theme, favorites, and audio playback.
 * - Handling data fetching from radio and AI services.
 * - Rendering all major UI sections, components, and modals.
 */
const App: React.FC = () => {
  // Custom hooks for core functionalities
  const [theme, toggleTheme] = useTheme();
  const [favorites, toggleFavorite] = useFavorites();
  const {
    audioRef,
    currentStation,
    isPlaying,
    isLoading,
    playbackError,
    setPlaybackError,
    volume,
    handlePlayPause,
    setVolume,
    setIsLoading,
    togglePlayPause,
  } = useAudioPlayer();

  // State for radio station data
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [featuredStations, setFeaturedStations] = useState<RadioStation[]>([]);
  
  // UI and async operation states
  const [isFetching, setIsFetching] = useState(false); // Tracks when data is being fetched.
  const [appError, setAppError] = useState<string | null>(null); // For general application errors.
  const [view, setView] = useState<ViewState>(ViewState.HOME); // Controls which view is shown (Home vs. Favorites).
  
  // Search-related states

  
  // AI DJ Modal and logic states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false); // Tracks when the AI is processing a request.
  const [aiReasoning, setAiReasoning] = useState<string | null>(null); // Stores the AI's textual response.
  
  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ref for the horizontal country list for scrolling.
  const countryScrollRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handles scrolling the popular countries list horizontally.
   * @param direction - The direction to scroll ('left' or 'right').
   */
  const handleCountryScroll = (direction: 'left' | 'right') => {
    if (countryScrollRef.current) {
      const scrollAmount = 300;
      countryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Effect to load initial station data when the component mounts.
  useEffect(() => {
    loadInitialData();
  }, []);


  // Effect to lock body scrolling when the mobile menu is open.
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to restore scrolling when the component unmounts.
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);


  /**
   * Fetches the initial data for the application, including top stations
   * and custom Venezuelan stations.
   */
  const loadInitialData = async () => {
    setIsFetching(true);
    const topData = await getTopStations();
    
    // Ensure custom Venezuelan stations aren't duplicated if they also appear in the top list.
    const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
    const topDataWithoutCustom = topData.filter(s => !customStationUUIDs.has(s.stationuuid));
    
    setFeaturedStations([]); // Clear featured stations, can be used for other purposes.
    setStations([...customVenezuelaStations, ...topDataWithoutCustom]);
    setIsFetching(false);
  };

  /**
   * Performs a station search using the radio service based on the provided filters.
   * @param filters - An object containing search criteria (e.g., tag, country, name).
   */
  const performSearch = async (filters: SearchFilters) => {
    setIsFetching(true);
    setAiReasoning(null); // Clear previous AI reasoning on new search.
    setAppError(null);
    const results = await searchStations(filters);
    
    // Special handling for Venezuela to ensure custom stations are always at the top.
    if (filters.country === 'Venezuela') {
      const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
      const filteredResults = results.filter(s => !customStationUUIDs.has(s.stationuuid));
      setStations([...customVenezuelaStations, ...filteredResults]);
    } else {
      setStations(results);
    }
    
    setView(ViewState.HOME); // Switch back to the home view to show results.
    setIsFetching(false);
  };




  /**
   * Handles the request to the AI DJ. It sends the user's prompt to the
   * backend service and then performs a search based on the AI's response.
   * @param prompt - The user's natural language request.
   */
  const handleAIRequest = async (prompt: string) => {
    setAiProcessing(true);
    setAppError(null);
    setPlaybackError(null);
    try {
      const rec = await getRadioRecommendations(prompt);
      setAiReasoning(rec.reasoning); // Display the AI's reasoning.
      setIsAIModalOpen(false);
      await performSearch(rec.searchQuery); // Perform the search suggested by the AI.
    } catch (error) {
      console.error("AI Request Error:", error);
      setAppError("El DJ de IA no está disponible en este momento.");
    } finally {
      setAiProcessing(false);
    }
  };

  // Determine which list of stations to display based on the current view.
  const displayedStations = view === ViewState.FAVORITES ? favorites : stations;

  /**
   * Handles skipping to the next or previous station in the current list.
   * @param direction - The direction to skip ('next' or 'previous').
   */
  const handleSkip = (direction: 'next' | 'previous') => {
    if (!currentStation || displayedStations.length === 0) return;

    const currentIndex = displayedStations.findIndex(s => s.stationuuid === currentStation.stationuuid);
    // If the current station isn't in the list (e.g., it was a search result and then the user switched to favorites),
    // just play the first station from the current list.
    if (currentIndex === -1) {
      handlePlayPause(displayedStations[0]);
      return;
    }

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % displayedStations.length;
    } else {
      nextIndex = (currentIndex - 1 + displayedStations.length) % displayedStations.length;
    }

    const nextStation = displayedStations[nextIndex];
    handlePlayPause(nextStation);
  };

  return (
    <div className="min-h-screen pb-40 bg-slate-50 dark:bg-sonic-darker transition-colors duration-500">
      {/* The single audio element controlled by the useAudioPlayer hook */}
      <audio ref={audioRef} onWaiting={() => setIsLoading(true)} onPlaying={() => setIsLoading(false)} onCanPlay={() => setIsLoading(false)} />

      {/* --- Navigation Bar --- */}
      <nav className="sticky top-0 z-40 sonic-glass border-b border-black/5 dark:border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => { setView(ViewState.HOME); loadInitialData(); }}
          >
            <div className="sonic-gradient p-2 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <Radio className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black dark:text-white tracking-tighter uppercase">Sonic<span className="text-cyan-500">Wave</span></span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <button onClick={() => setView(ViewState.HOME)} className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.HOME ? 'text-cyan-500' : 'text-slate-600 hover:text-cyan-500'}`}>Descubrir</button>
            <button onClick={() => setView(ViewState.FAVORITES)} className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.FAVORITES ? 'text-cyan-500' : 'text-slate-600 hover:text-cyan-500'}`}>Favoritos</button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              title="Abrir menú"
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-400 hover:text-cyan-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl transition-all">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* AI DJ Modal Trigger */}
            <button 
              type="button"
              title="Abrir asistente de IA DJ"
              onClick={() => setIsAIModalOpen(true)} 
              className="hidden lg:flex sonic-gradient text-white px-6 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest items-center gap-2 hover:shadow-xl hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Sparkles size={16} fill="currentColor" /> AI DJ
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Playback Error Display */}
        {playbackError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} /> <p className="font-bold text-sm tracking-tight">{playbackError}</p>
          </div>
        )}
        
        {/* === HOME VIEW === */}
        {view === ViewState.HOME && (
          <div className="space-y-12">
            
            {/* --- Search and Filter Section --- */}
            <section>
              {/* Quick Mood/Genre Buttons */}
              <div className="flex flex-wrap gap-3">
                {QUICK_MOODS.map(mood => (
                  <button 
                    key={mood.id} 
                    onClick={() => performSearch({ tag: mood.tag })} 
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 px-6 py-3 rounded-2xl transition-all border border-slate-200 dark:border-white/5 shadow-sm text-sm font-black uppercase tracking-widest active:scale-95"
                  >
                    {mood.icon} {mood.label}
                  </button>
                ))}
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
                  <button key={c.code} onClick={() => performSearch({ country: c.name })} className="flex flex-col items-center gap-4 group shrink-0">
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
                onClick={() => handleCountryScroll('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm transition-colors z-10 hidden md:block"
              >
                <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              <button 
                type="button"
                title="Desplazar países hacia la derecha"
                onClick={() => handleCountryScroll('right')} 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm transition-colors z-10 hidden md:block"
              >
                <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
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
                  <p className="text-2xl font-bold dark:text-white leading-tight tracking-tight">{aiReasoning}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === FEATURED STATIONS (Example Section) === */}
        {view === ViewState.HOME && featuredStations.length > 0 && !searchQuery && (
          <section className="mt-16 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="sonic-gradient p-2 rounded-lg shadow-lg">
                  <Trophy size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-black dark:text-white tracking-tighter">Destacadas para ti</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
              {featuredStations.map(s => (
                <StationCard 
                  key={s.stationuuid} 
                  station={s} 
                  isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying} 
                  isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                  onPlay={handlePlayPause}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* --- Main Station List (Home or Favorites) --- */}
        <section className="mt-20 space-y-10">
           <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
             <h3 className="text-xl font-black dark:text-white tracking-tight">
               {view === ViewState.FAVORITES ? 'Tus favoritos' : 'Descubre más ondas'}
             </h3>
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                {displayedStations.length} Emisoras
             </span>
           </div>
           
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {isFetching ? (
                  // Show skeleton loaders while fetching data.
                  Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  // Render the list of stations.
                  displayedStations.map(s => (
                    <StationCard
                      key={s.stationuuid}
                      station={s}
                      isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                      isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                      onPlay={handlePlayPause}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))
                )}
            </div>
          {/* Empty state message when no stations are available. */}
          {displayedStations.length === 0 && !isFetching && (
            <div className="py-32 flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                  <Music size={40} />
               </div>
               <p className="text-slate-400 font-bold">No hay nada por aquí todavía...</p>
            </div>
          )}
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="mt-20 py-8 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} SonicWave AI Radio. Todos los derechos reservados.</p>
        <p className="mt-1 text-xs">Estaciones de radio provistas por la <a href="http://www.radio-browser.info/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Radio Browser API</a>.</p>
        <div className="mt-2 inline-flex items-center gap-2">
          <span>Creado por</span>
          <a 
            href="https://github.com/CARLOSNAMIAS" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-3 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-300/70 dark:hover:bg-slate-700/70 transition-colors"
          >
            <Github size={16} className="text-slate-700 dark:text-slate-300" />
            <span className="font-bold text-slate-800 dark:text-slate-200">CARLOSNAMIAS</span>
          </a>
        </div>
      </footer>
      
      {/* --- Modals and Overlays --- */}
      <AIDJModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSubmit={handleAIRequest} isProcessing={aiProcessing} />

      {/* Mobile Off-canvas Menu */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)}></div>
        
        <div className={`relative z-10 w-80 h-full bg-slate-100 dark:bg-sonic-darker shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
            <span className="text-xl font-black dark:text-white tracking-tighter uppercase">Menú</span>
            <button 
              type="button"
              title="Cerrar menú"
              onClick={() => setIsMenuOpen(false)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-500 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={() => { setView(ViewState.HOME); setIsMenuOpen(false); }} 
              className={`w-full text-left text-lg font-bold transition-all ${view === ViewState.HOME ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'}`}
            >
              Descubrir
            </button>
            <button 
              onClick={() => { setView(ViewState.FAVORITES); setIsMenuOpen(false); }} 
              className={`w-full text-left text-lg font-bold transition-all ${view === ViewState.FAVORITES ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'}`}
            >
              Favoritos
            </button>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 sm:hidden">
              <button onClick={toggleTheme} className="w-full flex items-center justify-between text-slate-600 dark:text-slate-300 text-lg font-bold">
                Cambiar Tema
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button for AI DJ on mobile */}
      <div className="lg:hidden fixed bottom-28 right-6 z-40">
        <span className="relative flex h-14 w-14">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <button
            type="button"
            title="Abrir asistente de IA DJ"
            onClick={() => setIsAIModalOpen(true)}
            className="relative inline-flex w-14 h-14 sonic-gradient rounded-full items-center justify-center shadow-2xl shadow-cyan-500/30 active:scale-95 transition-transform"
          >
            <Sparkles size={24} fill="currentColor" className="text-white" />
          </button>
        </span>
      </div>
      
      {/* The global player bar */}
      <PlayerBar currentStation={currentStation} isPlaying={isPlaying} onPlayPause={togglePlayPause} onSkip={handleSkip} volume={volume} onVolumeChange={setVolume} isLoading={isLoading} audioRef={audioRef} />
    </div>
  );
};

export default App;
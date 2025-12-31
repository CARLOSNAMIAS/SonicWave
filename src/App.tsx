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
import { Radio, Sparkles, Music, Coffee, Zap, Moon, Sun, AlertCircle, Trophy, Compass, Github, ChevronLeft, ChevronRight, Menu, X, Mic, Heart, LayoutGrid } from 'lucide-react';
import SkeletonCard from '@/components/SkeletonCard';
import HeroCarousel from '@/components/HeroCarousel';
import RecommendationToast from '@/components/RecommendationToast';


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
    analyserRef
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

  // Filters expansion state (mobile only)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Recommendation state
  const [recommendedStation, setRecommendedStation] = useState<RadioStation | null>(null);

  // Search description state
  const [searchTitle, setSearchTitle] = useState('Descubre más ondas');

  // Floating AI DJ button position state (for mobile drag functionality)
  const [fabPosition, setFabPosition] = useState(() => {
    // Initialize with random position on first load
    const randomBottom = Math.floor(Math.random() * 40) + 20; // 20-60% from bottom
    const randomRight = Math.floor(Math.random() * 20) + 5; // 5-25% from right
    return { bottom: randomBottom, right: randomRight };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Ref for the horizontal country list for scrolling.
  const countryScrollRef = useRef<HTMLDivElement | null>(null);
  // Ref for the main results section to scroll into view.
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

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

    // Hide native splash screen from index.html
    const splash = document.getElementById('initial-splash');
    if (splash) {
      setTimeout(() => {
        splash.classList.add('opacity-0', 'scale-110');
        setTimeout(() => splash.remove(), 800);
      }, 2000);
    }
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
    setSearchTitle('Explorando el mundo');
    const topData = await getTopStations();

    // Ensure custom Venezuelan stations aren't duplicated if they also appear in the top list.
    const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
    const topDataWithoutCustom = topData.filter(s => !customStationUUIDs.has(s.stationuuid));

    setFeaturedStations([]); // Clear featured stations, can be used for other purposes.
    setStations([...customVenezuelaStations, ...topDataWithoutCustom]);
    setIsFetching(false);
  };

  /**
   * Shuffles an array in place using the Fisher-Yates algorithm.
   */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[shuffled[i] as any] as any]; // Fix for TS in this context
    }
    return shuffled;
  };

  // Correction for the shuffle logic to be cleaner
  const shuffle = <T,>(array: T[]): T[] => {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  /**
   * Performs a station search using the radio service based on the provided filters.
   * @param filters - An object containing search criteria (e.g., tag, country, name).
   * @param isAISearch - Whether the search was triggered by the AI assistant.
   */
  const performSearch = async (filters: SearchFilters, isAISearch: boolean = false) => {
    setIsFetching(true);
    if (!isAISearch) {
      setAiReasoning(null); // Only clear AI reasoning on new manual searches.
    }
    setAppError(null);
    const results = await searchStations(filters);

    // Update the search title based on filters
    if (filters.name) {
      setSearchTitle(`Resultados para: ${filters.name}`);
    } else if (filters.country) {
      setSearchTitle(`Emisoras de ${filters.country}`);
    } else if (filters.tag) {
      // Capitalize tag for better display
      const tagLabel = filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1);
      setSearchTitle(`Música ${tagLabel}`);
    } else {
      setSearchTitle('Descubre más ondas');
    }

    // Special override titles
    if (filters.tag === 'podcast' && filters.name === 'spanish') setSearchTitle('Podcasts en Español');
    if (filters.name === 'bts') setSearchTitle('BTS Army Radio');

    // Special handling for Venezuela to ensure custom stations are always at the top.
    if (filters.country === 'Venezuela') {
      const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
      const filteredResults = results.filter(s => !customStationUUIDs.has(s.stationuuid));
      const finalResults = isAISearch ? shuffle(filteredResults) : filteredResults;
      setStations([...customVenezuelaStations, ...finalResults]);
    } else {
      setStations(isAISearch ? shuffle(results) : results);
    }

    setView(ViewState.HOME); // Switch back to the home view to show results.
    setIsFetching(false);
  };

  /**
   * Handles finding a recommendation when a station is favorited
   */
  const handleRecommendation = async (station: RadioStation) => {
    try {
      // Prioritize country-based recommendation for Venezuelan stations
      const searchOptions: SearchFilters = station.country === 'Venezuela'
        ? { country: 'Venezuela', limit: 20 }
        : { tag: station.tags?.split(',')[0] || 'music', limit: 20 };

      const results = await searchStations(searchOptions);

      // Filter out current station and stations already in favorites
      const candidates = results.filter(s =>
        s.stationuuid !== station.stationuuid &&
        !favorites.some(f => f.stationuuid === s.stationuuid)
      );

      if (candidates.length > 0) {
        // Pick a random candidate
        const randomStation = candidates[Math.floor(Math.random() * candidates.length)];
        setRecommendedStation(randomStation);
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    }
  };

  /**
   * Wrapped toggleFavorite to include recommendation logic
   */
  const handleToggleFavorite = (station: RadioStation) => {
    const isAdding = !favorites.some(f => f.stationuuid === station.stationuuid);
    toggleFavorite(station);

    if (isAdding) {
      // Trigger recommendation with a slight delay
      setTimeout(() => handleRecommendation(station), 1000);
    }
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
      // Set a title specific to AI search
      setSearchTitle('Recomendaciones de tu DJ IA');
      // Don't close the modal - let the chat component handle displaying the response
      await performSearch(rec.searchQuery, true); // Perform the search suggested by the AI, passing true to preserve reasoning.
      // Override the title again after performSearch because it sets its own
      setSearchTitle('Recomendaciones de tu DJ IA');

      // Scroll to results after a short delay to allow the UI to update
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

  /**
   * Handles the start of a touch drag on the floating AI DJ button.
   * Records the initial touch position and current button position.
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  /**
   * Handles touch movement while dragging the floating AI DJ button.
   * Updates the button position based on finger movement.
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = dragStart.x - touch.clientX;
    const deltaY = touch.clientY - dragStart.y;

    // Calculate new position as percentage of viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const newRight = fabPosition.right + (deltaX / viewportWidth) * 100;
    const newBottom = fabPosition.bottom + (deltaY / viewportHeight) * 100;

    // Constrain to viewport bounds (with some padding)
    const constrainedRight = Math.max(5, Math.min(85, newRight));
    const constrainedBottom = Math.max(15, Math.min(85, newBottom));

    setFabPosition({
      right: constrainedRight,
      bottom: constrainedBottom,
    });

    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  /**
   * Handles the end of a touch drag on the floating AI DJ button.
   */
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen pb-40 bg-slate-50 dark:bg-sonic-darker transition-colors duration-500">
      {/* The single audio element controlled by the useAudioPlayer hook */}
      <audio ref={audioRef} crossOrigin="anonymous" onWaiting={() => setIsLoading(true)} onPlaying={() => setIsLoading(false)} onCanPlay={() => setIsLoading(false)} />

      {/* --- Navigation Bar --- */}
      <nav className="sticky top-0 z-40 sonic-glass border-b border-black/5 dark:border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
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
            <button onClick={() => setView(ViewState.HOME)} className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.HOME ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-600 hover:text-cyan-500'}`}>Descubrir</button>
            <button onClick={() => setView(ViewState.FAVORITES)} className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.FAVORITES ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-600 hover:text-cyan-500'}`}>Favoritos</button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              title="Abrir menú"
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-400 hover:text-cyan-500 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Menu size={20} />
            </button>
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-700 dark:text-slate-400 hover:text-cyan-500 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-xl transition-all shadow-sm hover:shadow-md">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-1">
        {/* === CAROUSEL === */}
        {view === ViewState.HOME && <HeroCarousel />}

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
                      onClick={() => performSearch(mood.filters)}
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
                      <ChevronRight size={20} className="text-slate-400" />
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
                            performSearch(mood.filters);
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
                  <p
                    key={aiReasoning}
                    className="text-2xl font-bold dark:text-white leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700"
                  >
                    {aiReasoning}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === FEATURED STATIONS (Example Section) === */}
        {view === ViewState.HOME && featuredStations.length > 0 && (
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
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* --- Main Station List (Home or Favorites) --- */}
        <section ref={resultsSectionRef} className="mt-20 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
            <h3
              key={view === ViewState.FAVORITES ? 'favorites' : searchTitle}
              className="text-xl font-black dark:text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {view === ViewState.FAVORITES ? 'Tus favoritos' : searchTitle}
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
                  onToggleFavorite={handleToggleFavorite}
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

        {/* --- About Section (SEO / AdSense Optimization) --- */}
        <section className="mt-28 py-16 border-t border-slate-200 dark:border-white/5">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black dark:text-white tracking-tight">SonicWave: La Revolución de la Radio con IA</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                SonicWave AI Radio no es solo un agregador de emisoras; es tu portal inteligente al universo sonoro global. Utilizando tecnología de vanguardia y el poder de <strong>Google Gemini AI</strong>, nuestro asistente aprende de tus gustos para ofrecerte recomendaciones musicales precisas y descubrimientos que cruzan fronteras.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-500">Mundial</span>
                  <p className="text-sm font-bold dark:text-slate-200">+30,000 Emisoras</p>
                </div>
                <div className="px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-500">Inteligente</span>
                  <p className="text-sm font-bold dark:text-slate-200">DJ Recomendador IA</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-8 rounded-3xl border border-cyan-500/20">
              <h3 className="text-xl font-bold dark:text-white mb-4">¿Por qué elegirnos?</h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  </div>
                  <span>Acceso gratuito a miles de géneros: desde Jazz Manouche hasta K-Pop.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  </div>
                  <span>Interfaz premium con visualizador rítmico en tiempo real.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  </div>
                  <span>Privacidad garantizada y sin registros complicados.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer (AdSense Compliant) --- */}
      <footer className="mt-20 py-12 border-t border-slate-200 dark:border-white/5 bg-slate-100/30 dark:bg-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-2xl font-black dark:text-white tracking-widest uppercase">SonicWave</h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              Sintonizando el futuro a través de la inteligencia artificial. Tu compañero musical definitivo para descubrir ondas de todo el mundo.
            </p>
            <div className="pt-4 flex items-center gap-4">
              <a href="https://github.com/CARLOSNAMIAS" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-500 transition-colors">
                <Github size={24} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-black text-xs uppercase tracking-widest text-cyan-500">Información</h5>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/privacy.html" className="hover:text-cyan-500 transition-colors">Privacidad</a></li>
              <li><a href="/terms.html" className="hover:text-cyan-500 transition-colors">Términos</a></li>
              <li><a href="/cookies.html" className="hover:text-cyan-500 transition-colors">Cookies</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-black text-xs uppercase tracking-widest text-cyan-500">Soporte</h5>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="https://github.com/CARLOSNAMIAS" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">Contacto</a></li>
              <li><a href="http://www.radio-browser.info/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">API Radio</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} SonicWave AI Radio. Transmitiendo en vivo.</p>
          <p className="italic">Disclaimer: SonicWave es un agregador que no aloja los flujos de audio directamente.</p>
        </div>
      </footer>

      {/* --- Modals and Overlays --- */}
      <AIDJModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSubmit={handleAIRequest} isProcessing={aiProcessing} aiReasoning={aiReasoning} />

      {/* Mobile Off-canvas Menu */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)}></div>

        <div className={`relative z-10 w-80 h-full bg-slate-100 dark:bg-sonic-darker shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/5">
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
          <div className="p-4 sm:p-6 space-y-4">
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
      <div
        className="lg:hidden fixed z-40 touch-none"
        style={{
          bottom: `${fabPosition.bottom}%`,
          right: `${fabPosition.right}%`,
          transform: 'translate(50%, 50%)',
          transition: isDragging ? 'none' : 'all 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <span className="relative flex h-14 w-14">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 ${isDragging ? 'opacity-0' : ''}`}></span>
          <button
            type="button"
            title="Abrir asistente de IA DJ"
            onClick={() => !isDragging && setIsAIModalOpen(true)}
            className={`relative inline-flex w-14 h-14 sonic-gradient rounded-full items-center justify-center shadow-2xl shadow-cyan-500/30 transition-transform ${isDragging ? 'scale-110' : 'active:scale-95'}`}
          >
            <Sparkles size={24} fill="currentColor" className="text-white" />
          </button>
        </span>
      </div>

      {/* The global player bar */}
      <PlayerBar
        currentStation={currentStation}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onSkip={handleSkip}
        volume={volume}
        onVolumeChange={setVolume}
        isLoading={isLoading}
        audioRef={audioRef}
        analyser={analyserRef.current}
        isFavorite={currentStation ? favorites.some(f => f.stationuuid === currentStation.stationuuid) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Recommendation Toast */}
      {recommendedStation && (
        <RecommendationToast
          station={recommendedStation}
          onClose={() => setRecommendedStation(null)}
          onPlay={(s) => {
            handlePlayPause(s);
            setRecommendedStation(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
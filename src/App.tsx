import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/hooks/useFavorites';
// Note: useAudioPlayer hook usage is now replaced by PlayerProvider + usePlayer (internally in components)
// However, App needs access to some player state if it renders the PlayerBar. 
// See implementation below.
import { useSpeech } from '@/hooks/useSpeech';
import { RadioStation, ViewState, SearchFilters } from '@/types';
import { searchStations, getTopStations } from '@/services/radioService';
import { getRadioRecommendations } from '@/services/geminiService';
import { customVenezuelaStations } from '@/data/venezuelaStations';
import PlayerBar from '@/components/PlayerBar';
import AIDJModal from '@/components/AIDJModal';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import RecommendationToast from '@/components/RecommendationToast';

// Context
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';

// Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeView from '@/views/HomeView';
import FavoritesView from '@/views/FavoritesView';
import AboutView from '@/views/AboutView';
import MagazineView from '@/views/MagazineView';
import CookieBanner from '@/components/CookieBanner';

/**
 * Inner App component that has access to PlayerContext.
 * We separate this to allow usage of usePlayer() hook inside the main logic.
 */
const SonicWaveApp: React.FC = () => {
  // Custom hooks
  const [theme, toggleTheme] = useTheme();
  const [favorites, toggleFavorite] = useFavorites();
  const { speak, isMuted, toggleMute, isSpeaking } = useSpeech();

  // Player Context
  const {
    currentStation,
    isPlaying,
    isLoading,
    playbackError,
    volume,
    setVolume,
    handlePlayPause,
    togglePlayPause,
    audioRef,
    analyserRef,
    setPlaybackError,
    setIsLoading
  } = usePlayer();

  // State
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [featuredStations, setFeaturedStations] = useState<RadioStation[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.HOME);

  // AI DJ
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recommendedStation, setRecommendedStation] = useState<RadioStation | null>(null);
  const [searchTitle, setSearchTitle] = useState('Descubre más ondas');
  const [vibe, setVibe] = useState<{ primaryColor: string; accentColor: string; mood: string } | null>(null);

  // Refs
  const countryScrollRef = useRef<HTMLDivElement | null>(null);
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

  // Floating Action Button State
  const [fabPosition, setFabPosition] = useState(() => {
    const randomBottom = Math.floor(Math.random() * 40) + 20;
    const randomRight = Math.floor(Math.random() * 20) + 5;
    return { bottom: randomBottom, right: randomRight };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });


  // --- Effects ---

  useEffect(() => {
    const init = async () => {
      await loadInitialData();

      // Hide native splash screen after data load
      const splash = document.getElementById('initial-splash');
      if (splash) {
        // Restore delay to ensure custom animation is visible/enjoyed
        setTimeout(() => {
          splash.classList.add('opacity-0', 'scale-110');
          setTimeout(() => splash.remove(), 800);
        }, 2000);
      }
    };

    init();
  }, []);

  useEffect(() => {
    // Initial load from URL
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'ABOUT') {
      setView(ViewState.ABOUT);
    } else if (viewParam === 'FAVORITES') {
      setView(ViewState.FAVORITES);
    }
  }, []);

  useEffect(() => {
    // Sync URL with view state
    const params = new URLSearchParams(window.location.search);
    if (view === ViewState.HOME) {
      params.delete('view');
    } else {
      params.set('view', view);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen, view]);

  // --- Logic ---

  const loadInitialData = async () => {
    setIsFetching(true);
    setSearchTitle('Explorando el mundo');
    const topData = await getTopStations();

    const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
    const topDataWithoutCustom = topData.filter(s => !customStationUUIDs.has(s.stationuuid));

    setFeaturedStations([]);
    setStations([...customVenezuelaStations, ...topDataWithoutCustom]);
    setIsFetching(false);
  };

  const shuffle = <T,>(array: T[]): T[] => {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const performSearch = async (filters: SearchFilters, isAISearch: boolean = false) => {
    setIsFetching(true);
    if (!isAISearch) {
      setAiReasoning(null);
    }
    setPlaybackError(null);
    const results = await searchStations(filters);

    // Title Logic
    if (filters.name) setSearchTitle(`Resultados para: ${filters.name}`);
    else if (filters.country) setSearchTitle(`Emisoras de ${filters.country}`);
    else if (filters.tag) {
      const tagLabel = filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1);
      setSearchTitle(`Música ${tagLabel}`);
    } else {
      setSearchTitle('Descubre más ondas');
    }

    if (filters.tag === 'podcast' && filters.name === 'spanish') setSearchTitle('Podcasts en Español');
    if (filters.name === 'bts') setSearchTitle('BTS Army Radio');

    // Venezuela override
    if (filters.country === 'Venezuela') {
      const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
      const filteredResults = results.filter(s => !customStationUUIDs.has(s.stationuuid));
      const finalResults = isAISearch ? shuffle(filteredResults) : filteredResults;
      setStations([...customVenezuelaStations, ...finalResults]);
    } else {
      setStations(isAISearch ? shuffle(results) : results);
    }

    setView(ViewState.HOME);
    setIsFetching(false);
  };

  const handleRecommendation = async (station: RadioStation) => {
    try {
      const searchOptions: SearchFilters = station.country === 'Venezuela'
        ? { country: 'Venezuela', limit: 20 }
        : { tag: station.tags?.split(',')[0] || 'music', limit: 20 };

      const results = await searchStations(searchOptions);
      const candidates = results.filter(s =>
        s.stationuuid !== station.stationuuid &&
        !favorites.some(f => f.stationuuid === s.stationuuid)
      );

      if (candidates.length > 0) {
        const randomStation = candidates[Math.floor(Math.random() * candidates.length)];
        setRecommendedStation(randomStation);
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    }
  };

  const handleToggleFavorite = (station: RadioStation) => {
    const isAdding = !favorites.some(f => f.stationuuid === station.stationuuid);
    toggleFavorite(station);
    if (isAdding) {
      setTimeout(() => handleRecommendation(station), 1000);
    }
  };

  const handleAIRequest = async (prompt: string, history: any[] = []) => {
    setAiProcessing(true);
    setPlaybackError(null);
    try {
      const rec = await getRadioRecommendations(prompt, history);
      setAiReasoning(rec.reasoning);
      speak(rec.reasoning);

      if (rec.vibe) {
        setVibe(rec.vibe);
      }

      setSearchTitle('Recomendaciones de tu DJ IA');
      await performSearch(rec.searchQuery, true);
      setSearchTitle('Recomendaciones de tu DJ IA');

      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("AI Request Error:", error);
      setPlaybackError("El DJ de IA tiene problemas de conexión, pero puedes seguir buscando por género o país manualmente.");
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSkip = (direction: 'next' | 'previous') => {
    const displayedStations = view === ViewState.FAVORITES ? favorites : stations;
    if (!currentStation || displayedStations.length === 0) return;

    const currentIndex = displayedStations.findIndex(s => s.stationuuid === currentStation.stationuuid);
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

    handlePlayPause(displayedStations[nextIndex]);
  };

  const handleCountryScroll = (direction: 'left' | 'right') => {
    if (countryScrollRef.current) {
      const scrollAmount = 300;
      countryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // --- Touch Handling for FAB ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = dragStart.x - touch.clientX;
    const deltaY = touch.clientY - dragStart.y;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const newRight = fabPosition.right + (deltaX / viewportWidth) * 100;
    const newBottom = fabPosition.bottom + (deltaY / viewportHeight) * 100;
    const constrainedRight = Math.max(5, Math.min(85, newRight));
    const constrainedBottom = Math.max(15, Math.min(85, newBottom));

    setFabPosition({ right: constrainedRight, bottom: constrainedBottom });
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => setIsDragging(false);


  // --- Render ---
  return (
    <div className="min-h-screen pb-40 bg-slate-50 dark:bg-sonic-darker transition-colors duration-500">
      {vibe && (
        <style>{`
          :root {
            --sonic-primary: ${vibe.primaryColor};
            --sonic-accent: ${vibe.accentColor};
          }
        `}</style>
      )}

      {/* Audio element controlled exclusively by PlayerContext */}
      {/* Audio element controlled exclusively by PlayerContext */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onError={(e) => {
          // If no station is selected, ignore errors caused by empty src or reset
          if (!currentStation) return;

          const target = e.currentTarget;
          console.error("Audio error event:", e);
          console.error("Audio error details:", target.error);

          let errorMessage = "Error al reproducir la emisora.";
          if (target.error) {
            switch (target.error.code) {
              case target.error.MEDIA_ERR_ABORTED:
                errorMessage = "La reproducción fue interrumpida.";
                break;
              case target.error.MEDIA_ERR_NETWORK:
                errorMessage = "Error de red. Verifique su conexión.";
                break;
              case target.error.MEDIA_ERR_DECODE:
                errorMessage = "Error al decodificar el audio.";
                break;
              case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = "Formato no soportado o stream no disponible.";
                break;
              default:
                errorMessage = `Error desconocido: ${target.error.message || target.error.code}`;
            }
          }
          setPlaybackError(errorMessage);
          setIsLoading(false);
        }}
      />

      <Navbar
        view={view}
        setView={setView}
        onLogoClick={() => { setView(ViewState.HOME); loadInitialData(); }}
        onOpenMenu={() => setIsMenuOpen(true)}
        toggleTheme={toggleTheme}
        theme={theme}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        isSpeaking={isSpeaking}
      />

      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-1">
        {/* Playback Error */}
        {playbackError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} /> <p className="font-bold text-sm tracking-tight">{playbackError}</p>
          </div>
        )}

        {view === ViewState.HOME && (
          <HomeView
            stations={stations}
            featuredStations={featuredStations}
            isFetching={isFetching}
            searchTitle={searchTitle}
            aiReasoning={aiReasoning}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onPerformSearch={performSearch}
            countryScrollRef={countryScrollRef}
            resultsSectionRef={resultsSectionRef}
            onCountryScroll={handleCountryScroll}
          />
        )}

        {view === ViewState.FAVORITES && (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {view === ViewState.ABOUT && <AboutView />}

        {view === ViewState.MAGAZINE && <MagazineView />}

        {/* SEO / About Section included in Footer or below content? Original had it in main. Keeping it here. */}
        {view === ViewState.HOME && <section className="mt-28 py-16 border-t border-slate-200 dark:border-white/5">
          {/* This could also be extracted to an AboutSection component */}
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
        </section>}
      </main>

      <Footer
        onAboutClick={() => { setView(ViewState.ABOUT); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onMagazineClick={() => { setView(ViewState.MAGAZINE); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      <AIDJModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSubmit={handleAIRequest}
        isProcessing={aiProcessing}
        aiReasoning={aiReasoning}
        isMuted={isMuted}
        toggleMute={toggleMute}
        isSpeaking={isSpeaking}
      />

      {/* Mobile Menu - could be extracted but it has loose state dependencies like setView */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`relative z-10 w-80 h-full bg-slate-100 dark:bg-sonic-darker shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/5">
            <span className="text-xl font-black dark:text-white tracking-tighter uppercase">Menú</span>
            <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú" title="Cerrar menú" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-500 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <button onClick={() => { setView(ViewState.HOME); setIsMenuOpen(false); }} className={`w-full text-left text-lg font-bold transition-all ${view === ViewState.HOME ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'}`}>Descubrir</button>
            <button onClick={() => { setView(ViewState.FAVORITES); setIsMenuOpen(false); }} className={`w-full text-left text-lg font-bold transition-all ${view === ViewState.FAVORITES ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'}`}>Favoritos</button>
            <button onClick={() => { setView(ViewState.MAGAZINE); setIsMenuOpen(false); }} className={`w-full text-left text-lg font-bold transition-all ${view === ViewState.MAGAZINE ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'}`}>Revista</button>
            <button onClick={() => { setView(ViewState.ABOUT); setIsMenuOpen(false); }} className={`w-full text-left text-lg font-bold transition-all ${view === ViewState.ABOUT ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'}`}>Sobre Nosotros</button>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 sm:hidden">
              <button onClick={toggleTheme} className="w-full flex items-center justify-between text-slate-600 dark:text-slate-300 text-lg font-bold">Cambiar Tema {theme === 'dark' ? <React.Fragment>☀️</React.Fragment> : <React.Fragment>🌙</React.Fragment>}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
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
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpeaking ? 'bg-rose-400' : 'bg-cyan-400'} opacity-75 ${isDragging ? 'opacity-0' : ''}`}></span>
          <button
            type="button"
            onClick={() => !isDragging && setIsAIModalOpen(true)}
            className={`relative inline-flex w-14 h-14 ${isSpeaking ? 'bg-rose-500' : 'sonic-gradient'} rounded-full items-center justify-center shadow-2xl ${isSpeaking ? 'shadow-rose-500/30' : 'shadow-cyan-500/30'} transition-transform ${isDragging ? 'scale-110' : 'active:scale-95'}`}
          >
            <Sparkles size={24} fill="currentColor" className={`text-white ${isSpeaking ? 'animate-bounce' : ''}`} />
          </button>
        </span>
      </div>


      {/* Player Bar */}
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


      <CookieBanner />
    </div>
  );
}

/**
 * Main App Container that provides Contexts.
 */
const App: React.FC = () => {
  return (
    <PlayerProvider>
      <SonicWaveApp />
    </PlayerProvider>
  );
};

export default App;
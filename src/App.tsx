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

/** Convierte "#22D3EE" en "34 211 238" para usarlo en la variable --signal. */
const hexToRgbTriplet = (hex?: string): string | null => {
  if (!hex) return null;
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

// Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeView from '@/views/HomeView';
import FavoritesView from '@/views/FavoritesView';
import AboutView from '@/views/AboutView';
import MagazineView from '@/views/MagazineView';
import MapView from '@/views/MapView';
import CookieBanner from '@/components/CookieBanner';
import DynamicBackground from '@/components/DynamicBackground';

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
  const [searchTitle, setSearchTitle] = useState('Lo más escuchado');
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
      try {
        await loadInitialData();
      } finally {
        // La pantalla de carga se retira pase lo que pase con los datos: si la
        // API falla, la aplicación se muestra con el aviso del error, nunca
        // congelada sobre el logotipo.
        const splash = document.getElementById('initial-splash');
        if (splash) {
          // Se mantiene hasta que la barra de sintonía termina su recorrido
          setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 500);
          }, 2400);
        }
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
    setSearchTitle('Lo más escuchado');
    setFeaturedStations([]);

    try {
      const topData = await getTopStations();

      const customStationUUIDs = new Set(customVenezuelaStations.map(s => s.stationuuid));
      const topDataWithoutCustom = topData.filter(s => !customStationUUIDs.has(s.stationuuid));

      setStations([...customVenezuelaStations, ...topDataWithoutCustom]);
      setPlaybackError(null);
    } catch (error) {
      // El catálogo global vive en un servidor ajeno que a veces corta la
      // conexión. Se avisa del fallo y se deja lo que sí tenemos en local.
      console.error('Error loading initial stations:', error);
      setStations(customVenezuelaStations);
      setSearchTitle('Emisoras de Venezuela');
      setPlaybackError('No se pudo cargar el catálogo mundial: el servidor de emisoras no responde. Mientras tanto puedes escuchar estas emisoras o volver a intentarlo en un momento.');
    } finally {
      setIsFetching(false);
    }
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

    let results: RadioStation[];
    try {
      results = await searchStations(filters);
    } catch (error) {
      // Sin resultados no se deja el listado en carga perpetua.
      console.error('Error searching stations:', error);
      setStations([]);
      setSearchTitle('Sin conexión con el catálogo');
      setPlaybackError('No se pudo completar la búsqueda: el servidor de emisoras no responde. Inténtalo de nuevo en un momento.');
      setView(ViewState.HOME);
      setIsFetching(false);
      return;
    }

    // Title Logic
    if (filters.name) setSearchTitle(`Resultados para: ${filters.name}`);
    else if (filters.country) setSearchTitle(`Emisoras de ${filters.country}`);
    else if (filters.tag) {
      const tagLabel = filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1);
      setSearchTitle(`Música ${tagLabel}`);
    } else {
      setSearchTitle('Todas las emisoras');
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
  // El DJ puede proponer un color para la sesión; se aplica al único acento del
  // sistema (la señal). Si el valor no es un hexadecimal válido, se ignora.
  const signalOverride = hexToRgbTriplet(vibe?.primaryColor);

  return (
    <div className="min-h-screen pb-28">
      {signalOverride && (
        <style>{`:root { --signal: ${signalOverride}; }`}</style>
      )}

      <DynamicBackground />

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

      <main className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Playback Error */}
        {playbackError && (
          <div className="mt-6 border-l-[3px] border-signal pl-4 py-3 flex items-start gap-3">
            <AlertCircle size={18} className="text-signal shrink-0 mt-0.5" />
            <p className="text-[15px] leading-relaxed">{playbackError}</p>
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

        {view === ViewState.EXPLORE && (
          <MapView onPerformSearch={performSearch} />
        )}

        {view === ViewState.MAGAZINE && <MagazineView />}

        {/* Cierre editorial de la portada: explica qué es esto a quien llega de una búsqueda. */}
        {view === ViewState.HOME && <section className="mt-24 py-16">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24">
            <div>
              <h2 className="t-display text-[clamp(2rem,7vw,4.5rem)]">
                Radio de todo<br />el mundo, sin<br />complicaciones
              </h2>
              <p className="mt-8 text-[16px] md:text-[18px] leading-relaxed text-meta-c max-w-[58ch]">
                SonicWave reúne más de 30 000 emisoras públicas y te ayuda a moverte
                entre ellas. Escribe lo que te apetece escuchar y el DJ, con{' '}
                <strong className="font-semibold text-ink dark:text-paper">Google Gemini</strong>,
                traduce esa frase en géneros, países y emisoras concretas, y te cuenta
                por qué eligió cada una.
              </p>
            </div>

            <ul className="space-y-8">
              {[
                ['Sin cuenta', 'Nada que registrar: entras y suena.'],
                ['Tus favoritos, tuyos', 'Se guardan en este dispositivo y en ningún otro sitio.'],
                ['El sonido, a la vista', 'El espectro de lo que suena se dibuja detrás de la página.'],
              ].map(([title, text]) => (
                <li key={title}>
                  <h3 className="text-[17px] font-semibold mb-1.5">{title}</h3>
                  <p className="text-[15px] leading-relaxed text-meta-c">{text}</p>
                </li>
              ))}
            </ul>
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

      {/* Menú en móvil: los enlaces son el contenido, a tamaño de titular */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isMenuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-ink/50 transition-opacity duration-200 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <div className={`relative z-10 w-[min(360px,88vw)] h-full bg-paper dark:bg-ink flex flex-col transition-transform duration-200 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-5 shrink-0">
            <span className="t-data text-[10px] text-meta-c">Ir a</span>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
              title="Cerrar menú"
              className="w-10 h-10 flex items-center justify-center -mr-2 text-meta-c hover:text-ink dark:hover:text-paper transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto">
            {[
              { v: ViewState.HOME, label: 'Descubrir' },
              { v: ViewState.FAVORITES, label: 'Favoritos' },
              { v: ViewState.EXPLORE, label: 'Explorar' },
              { v: ViewState.MAGAZINE, label: 'Revista' },
              { v: ViewState.ABOUT, label: 'Sobre nosotros' },
            ].map(item => (
              <button
                key={item.v}
                onClick={() => { setView(item.v); setIsMenuOpen(false); window.scrollTo({ top: 0 }); }}
                className={`w-full text-left px-5 py-5 t-display text-[clamp(1.5rem,7vw,2.25rem)] transition-colors ${view === item.v
                  ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="shrink-0">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-medium"
            >
              {theme === 'dark' ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
              <span className="t-data text-[10px] text-meta-c">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Acceso al DJ en móvil: se puede arrastrar a donde estorbe menos */}
      <div
        className="lg:hidden fixed z-40 touch-none"
        style={{
          bottom: `${fabPosition.bottom}%`,
          right: `${fabPosition.right}%`,
          transform: 'translate(50%, 50%)',
          transition: isDragging ? 'none' : 'bottom 0.3s ease, right 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={() => !isDragging && setIsAIModalOpen(true)}
          aria-label="Pedirle emisoras al DJ"
          className={`w-14 h-14 flex flex-col items-center justify-center gap-1 ${isSpeaking
            ? 'bg-signal text-white'
            : 'bg-ink text-paper dark:bg-paper dark:text-ink'
            }`}
        >
          <Sparkles size={18} fill="currentColor" strokeWidth={0} />
          <span className="t-data text-[8px] leading-none">DJ</span>
        </button>
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
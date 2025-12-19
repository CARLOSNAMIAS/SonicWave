
import React, { useState, useEffect, useRef } from 'react';
import { RadioStation, ViewState, SearchFilters } from '@/types';
import { searchStations, getTopStations } from '@/services/radioService';
import { getRadioRecommendations } from '@/services/geminiService';
import StationCard from '@/components/StationCard';
import PlayerBar from '@/components/PlayerBar';
import AIDJModal from '@/components/AIDJModal';
import { Search, Radio, Sparkles, Music, Coffee, Zap, Moon, Sun, AlertCircle, Trophy, Compass, Github, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

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

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('sonicwave_theme') as 'dark' | 'light') || 'dark';
  });
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [featuredStations, setFeaturedStations] = useState<RadioStation[]>([]);
  const [favorites, setFavorites] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'country' | 'tag'>('tag');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countryScrollRef = useRef<HTMLDivElement | null>(null);

  const handleCountryScroll = (direction: 'left' | 'right') => {
    if (countryScrollRef.current) {
      const scrollAmount = 300;
      countryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('sonicwave_theme', theme);
  }, [theme]);

  useEffect(() => {
    loadInitialData();
    const storedFavs = localStorage.getItem('sonicwave_favs');
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    const storedVolume = localStorage.getItem('sonicwave_volume');
    if (storedVolume) setVolume(parseFloat(storedVolume));
  }, []);

  useEffect(() => {
    localStorage.setItem('sonicwave_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('sonicwave_volume', volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStation) return;
    const streamUrl = currentStation.url_resolved || currentStation.url;
    
    if (audio.src !== streamUrl) {
      setPlaybackError(null);
      setIsLoading(true);
      audio.pause();
      audio.removeAttribute('crossorigin');
      audio.src = streamUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(err => {
        if (err.name !== 'AbortError') {
          setPlaybackError("No se puede reproducir este stream actualmente.");
          setIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }
  }, [currentStation, isPlaying]);

  const loadInitialData = async () => {
    setIsFetching(true);
    const metropolisData = await searchStations({ name: 'Metropolis 103.9', limit: 1 });
    const topData = await getTopStations();
    
    // Ensure Metropolis is not duplicated if it's already in topData
    const topDataWithoutMetropolis = topData.filter(s => 
      metropolisData.length > 0 ? s.stationuuid !== metropolisData[0].stationuuid : true
    );
    
    setFeaturedStations(metropolisData);
    setStations([...metropolisData, ...topDataWithoutMetropolis]);
    setIsFetching(false);
  };

  const performSearch = async (filters: SearchFilters) => {
    setIsFetching(true);
    setAiReasoning(null);
    setPlaybackError(null);
    const results = await searchStations(filters);
    
    if (filters.country === 'Venezuela' || (filters.name && filters.name.toLowerCase().includes('maracaibo'))) {
      const metropolis = await searchStations({ name: 'Metropolis 103.9', limit: 1 });
      if (metropolis.length > 0) {
        const filteredResults = results.filter(s => s.stationuuid !== metropolis[0].stationuuid);
        setStations([metropolis[0], ...filteredResults]);
      } else {
        setStations(results);
      }
    } else {
      setStations(results);
    }
    
    setView(ViewState.HOME);
    setIsFetching(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch({ [searchType]: searchQuery });
  };

  const handlePlayStation = (station: RadioStation) => {
    setPlaybackError(null);
    if (currentStation?.stationuuid === station.stationuuid) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
    }
  };

  const handleAIRequest = async (prompt: string) => {
    setAiProcessing(true);
    try {
      const rec = await getRadioRecommendations(prompt);
      setAiReasoning(rec.reasoning);
      setIsAIModalOpen(false);
      await performSearch(rec.searchQuery);
    } catch (error) {
      setPlaybackError("El DJ de IA no está disponible en este momento.");
    } finally {
      setAiProcessing(false);
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const displayedStations = view === ViewState.FAVORITES ? favorites : stations;

  return (
    <div className="min-h-screen pb-40 bg-slate-50 dark:bg-sonic-darker transition-colors duration-500">
      <audio ref={audioRef} onWaiting={() => setIsLoading(true)} onPlaying={() => setIsLoading(false)} onCanPlay={() => setIsLoading(false)} />

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

          <div className="hidden lg:flex items-center space-x-8">
            <button onClick={() => setView(ViewState.HOME)} className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.HOME ? 'text-cyan-500' : 'text-slate-400 hover:text-white'}`}>Descubrir</button>
            <button onClick={() => setView(ViewState.FAVORITES)} className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.FAVORITES ? 'text-cyan-500' : 'text-slate-400 hover:text-white'}`}>Favoritos</button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>
            <button onClick={toggleTheme} className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-400 hover:text-cyan-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl transition-all">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsAIModalOpen(true)} 
              className="hidden lg:flex sonic-gradient text-white px-6 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest items-center gap-2 hover:shadow-xl hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Sparkles size={16} fill="currentColor" /> AI DJ
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {playbackError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} /> <p className="font-bold text-sm tracking-tight">{playbackError}</p>
          </div>
        )}

        {view === ViewState.HOME && (
          <div className="space-y-12">
            <section>
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                <div className="flex-1 max-w-2xl relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
                  <form onSubmit={handleSearch}>
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      placeholder="Explora ritmos, ciudades o países..." 
                      className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-base font-medium shadow-sm" 
                    />
                  </form>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 mr-2 hidden sm:block">Filtro:</span>
                  <select 
                    value={searchType} 
                    onChange={e => setSearchType(e.target.value as any)} 
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl px-6 py-4 text-sm font-bold border border-slate-200 dark:border-white/5 outline-none cursor-pointer focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm"
                  >
                    <option value="tag">Género</option>
                    <option value="country">País</option>
                    <option value="name">Nombre</option>
                  </select>
                </div>
              </div>

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

            <section className="space-y-6 relative"> {/* Added relative positioning here */}
              <div className="flex items-center gap-3 text-slate-400 mb-6"> {/* Simplified title row */}
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
              {/* Overlay scroll buttons */}
              <button 
                onClick={() => handleCountryScroll('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm transition-colors z-10"
              >
                <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              <button 
                onClick={() => handleCountryScroll('right')} 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm transition-colors z-10"
              >
                <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
            </section>

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

        {/* Featured Section */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {featuredStations.map(s => (
                <StationCard 
                  key={s.stationuuid} 
                  station={s} 
                  isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying} 
                  isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                  onPlay={handlePlayStation}
                  onToggleFavorite={station => {
                    setFavorites(prev => prev.some(f => f.stationuuid === station.stationuuid) ? prev.filter(f => f.stationuuid !== station.stationuuid) : [...prev, station]);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-20 space-y-10">
           <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
             <h3 className="text-xl font-black dark:text-white tracking-tight">
               {view === ViewState.FAVORITES ? 'Tus favoritos' : 'Descubre más ondas'}
             </h3>
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                {displayedStations.length} Emisoras
             </span>
           </div>
           
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                       {isFetching ? (
                         Array(10).fill(0).map((_, i) => <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800/40 rounded-3xl animate-pulse" />)
                       ) : (
                         displayedStations.map(s => (
                           <StationCard
                             key={s.stationuuid}
                             station={s}
                             isPlaying={currentStation?.stationuuid === s.stationuuid && isPlaying}
                             isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                             onPlay={handlePlayStation}
                             onToggleFavorite={station => {
                               setFavorites(prev => prev.some(f => f.stationuuid === station.stationuuid) ? prev.filter(f => f.stationuuid !== station.stationuuid) : [...prev, station]);
                             }}
                           />
                         ))
                       )}
                     </div>
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

      <footer className="mt-20 py-8 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} SonicWave AI Radio. Todos los derechos reservados.</p>
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

      <AIDJModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSubmit={handleAIRequest} isProcessing={aiProcessing} />

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)}></div>
        
        {/* Menu Panel */}
        <div className={`relative z-10 w-80 h-full bg-slate-100 dark:bg-sonic-darker shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
            <span className="text-xl font-black dark:text-white tracking-tighter uppercase">Menú</span>
            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-500 rounded-xl transition-all">
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

      {/* AI DJ Floating Action Button (Mobile) */}
      <button
        onClick={() => setIsAIModalOpen(true)}
        className="lg:hidden fixed bottom-28 right-6 z-40 w-16 h-16 sonic-gradient rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30 active:scale-95 transition-transform"
      >
        <Sparkles size={28} fill="currentColor" className="text-white" />
      </button>

      <PlayerBar currentStation={currentStation} isPlaying={isPlaying} onPlayPause={() => setIsPlaying(!isPlaying)} volume={volume} onVolumeChange={setVolume} isLoading={isLoading} audioRef={audioRef} />
    </div>
  );
};

export default App;

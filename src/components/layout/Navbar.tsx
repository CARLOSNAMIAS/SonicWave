import React from 'react';
import { Radio, Moon, Sun, Menu, Sparkles } from 'lucide-react';
import { ViewState } from '@/types';

/**
 * Props for the Navbar component.
 */
interface NavbarProps {
    /** Current view state of the application */
    view: ViewState;
    /** Function to update the view state */
    setView: (view: ViewState) => void;
    /** Function to reload initial data (used when clicking the logo) */
    onLogoClick: () => void;
    /** Function to open the mobile menu */
    onOpenMenu: () => void;
    /** Function to toggle the application theme */
    toggleTheme: () => void;
    /** Current theme ('light' or 'dark') */
    theme: string;
    /** Function to open the AI DJ modal */
    onOpenAIModal: () => void;
    /** Whether the AI DJ is currently speaking */
    isSpeaking: boolean;
}

/**
 * The main integration navigation bar.
 * Handles desktop links, mobile menu trigger, theme toggling, and AI DJ activation.
 */
const Navbar: React.FC<NavbarProps> = ({
    view,
    setView,
    onLogoClick,
    onOpenMenu,
    toggleTheme,
    theme,
    onOpenAIModal,
    isSpeaking
}) => {
    return (
        <nav className="sticky top-0 z-40 sonic-glass border-b border-black/5 dark:border-white/5 h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                {/* Logo Section */}
                <div
                    className="flex items-center space-x-3 cursor-pointer group"
                    onClick={onLogoClick}
                >
                    <div className="sonic-gradient p-2 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        <Radio className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black dark:text-white tracking-tighter uppercase">
                        Sonic<span className="text-cyan-500">Wave</span>
                    </span>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center space-x-8">
                    <button
                        onClick={() => setView(ViewState.HOME)}
                        className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.HOME ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-600 hover:text-cyan-500'}`}
                    >
                        Descubrir
                    </button>
                    <button
                        onClick={() => setView(ViewState.FAVORITES)}
                        className={`text-[13px] font-black uppercase tracking-widest transition-all ${view === ViewState.FAVORITES ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-600 hover:text-cyan-500'}`}
                    >
                        Favoritos
                    </button>
                </div>

                {/* Controls Section */}
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Trigger */}
                    <button
                        type="button"
                        title="Abrir menú"
                        onClick={onOpenMenu}
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-400 hover:text-cyan-500 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-700 dark:text-slate-400 hover:text-cyan-500 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* AI DJ Modal Trigger */}
                    <button
                        type="button"
                        title="Abrir asistente de IA DJ"
                        onClick={onOpenAIModal}
                        className={`hidden lg:flex ${isSpeaking ? 'bg-rose-500 animate-pulse' : 'sonic-gradient'} text-white px-6 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest items-center gap-2 hover:shadow-xl hover:shadow-cyan-500/20 active:scale-95 transition-all`}
                    >
                        <Sparkles size={16} fill="currentColor" className={isSpeaking ? 'animate-bounce' : ''} />
                        {isSpeaking ? 'Escuchando DJ...' : 'AI DJ'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

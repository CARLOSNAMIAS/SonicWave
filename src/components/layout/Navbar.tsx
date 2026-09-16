import React from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
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

const LINKS: { view: ViewState; label: string }[] = [
    { view: ViewState.HOME, label: 'Descubrir' },
    { view: ViewState.FAVORITES, label: 'Favoritos' },
    { view: ViewState.EXPLORE, label: 'Explorar' },
    { view: ViewState.MAGAZINE, label: 'Revista' },
    { view: ViewState.ABOUT, label: 'Sobre nosotros' },
];

/**
 * Barra de navegación principal.
 * Se apoya en una sola regla inferior y en el logotipo tipográfico; la vista activa
 * se marca con un filete de señal bajo el enlace.
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
        <nav className="sticky top-0 z-40 bg-paper dark:bg-ink h-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-6">
                <button
                    type="button"
                    onClick={onLogoClick}
                    className="t-display text-2xl md:text-[28px] shrink-0"
                >
                    Sonicwave
                </button>

                <div className="hidden lg:flex items-center gap-8 h-full">
                    {LINKS.map(link => (
                        <button
                            key={link.view}
                            onClick={() => setView(link.view)}
                            className={`h-full flex items-center text-[15px] font-medium border-b-2 transition-colors ${view === link.view
                                ? 'border-signal text-ink dark:text-paper'
                                : 'border-transparent text-meta-c hover:text-ink dark:hover:text-paper'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        type="button"
                        title="Abrir menú"
                        onClick={onOpenMenu}
                        className="lg:hidden w-10 h-10 flex items-center justify-center surface hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                    >
                        <Menu size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        className="hidden sm:flex w-10 h-10 items-center justify-center surface hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        type="button"
                        title="Pedirle emisoras al DJ"
                        onClick={onOpenAIModal}
                        className={`hidden lg:flex h-10 px-5 items-center gap-2.5 text-[14px] font-semibold transition-colors ${isSpeaking
                            ? 'bg-signal text-white'
                            : 'bg-ink text-paper dark:bg-paper dark:text-ink hover:bg-signal hover:text-white dark:hover:bg-signal dark:hover:text-white'
                            }`}
                    >
                        <span className={`w-2 h-2 ${isSpeaking ? 'bg-white animate-signal-blink' : 'bg-signal'}`} />
                        {isSpeaking ? 'Hablando' : 'Pedir al DJ'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React from 'react';
import { MAGAZINE_ENABLED } from '@/config';
import { ViewState } from '@/types';
import { viewPath, handleViewLinkClick } from '@/lib/navigation';

// Páginas estáticas generadas en el build (scripts/lib/pages-data.mjs). Se
// escriben aquí a mano porque ese módulo pertenece al build, no a la aplicación.
const PAISES = [
    { slug: 'venezuela', name: 'Venezuela' },
    { slug: 'colombia', name: 'Colombia' },
    { slug: 'mexico', name: 'México' },
    { slug: 'argentina', name: 'Argentina' },
    { slug: 'espana', name: 'España' },
    { slug: 'usa', name: 'Estados Unidos' },
];

const GENEROS = [
    { slug: 'salsa', name: 'Salsa' },
    { slug: 'reggaeton', name: 'Reguetón' },
    { slug: 'cumbia', name: 'Cumbia' },
    { slug: 'bachata', name: 'Bachata' },
    { slug: 'vallenato', name: 'Vallenato' },
    { slug: 'latina', name: 'Música latina' },
    { slug: 'rock', name: 'Rock' },
    { slug: 'rap', name: 'Rap' },
    { slug: 'electronica', name: 'Electrónica' },
    { slug: 'jazz', name: 'Jazz' },
    { slug: 'dance', name: 'Música para bailar' },
    { slug: 'lofi', name: 'Lo-fi' },
    { slug: 'tranquila', name: 'Música tranquila' },
    { slug: 'podcast', name: 'Pódcast' },
    { slug: 'bts', name: 'BTS' },
];

/**
 * Footer component containing legal links, contact info, and disclaimer.
 */
interface FooterProps {
    onAboutClick: () => void;
    onMagazineClick: () => void;
}

/**
 * Pie de página: el logotipo a tamaño de cartel cierra la composición y las
 * columnas de enlaces se alinean a la misma retícula que el contenido.
 */
const Footer: React.FC<FooterProps> = ({ onAboutClick, onMagazineClick }) => {
    return (
        <footer className="mt-24">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="grid md:grid-cols-[1fr_auto_auto] gap-10 md:gap-16 py-12">
                    <div className="max-w-[46ch]">
                        <p className="text-[15px] leading-relaxed text-meta-c">
                            SonicWave reúne emisoras públicas de todo el mundo y te ayuda a
                            encontrar la tuya. No alojamos ninguna transmisión: cada señal viaja
                            directa desde su emisora.
                        </p>
                    </div>

                    <nav className="md:w-44">
                        <h2 className="t-data text-[10px] text-meta-c mb-4">Secciones</h2>
                        <ul className="space-y-2.5 text-[15px]">
                            {MAGAZINE_ENABLED && (
                                <li>
                                    <a
                                        href={viewPath(ViewState.MAGAZINE)}
                                        onClick={(e) => handleViewLinkClick(e, ViewState.MAGAZINE, onMagazineClick)}
                                        className="hover:text-signal transition-colors"
                                    >
                                        Revista
                                    </a>
                                </li>
                            )}
                            <li>
                                <a
                                    href={viewPath(ViewState.ABOUT)}
                                    onClick={(e) => handleViewLinkClick(e, ViewState.ABOUT, onAboutClick)}
                                    className="hover:text-signal transition-colors"
                                >
                                    Sobre nosotros
                                </a>
                            </li>
                            <li>
                                <a href="http://www.radio-browser.info/" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">
                                    Radio Browser
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/CARLOSNAMIAS" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <nav className="md:w-44">
                        <h2 className="t-data text-[10px] text-meta-c mb-4">Legal</h2>
                        <ul className="space-y-2.5 text-[15px]">
                            <li><a href="/privacy.html" className="hover:text-signal transition-colors">Privacidad</a></li>
                            <li><a href="/terms.html" className="hover:text-signal transition-colors">Términos</a></li>
                            <li><a href="/cookies.html" className="hover:text-signal transition-colors">Cookies</a></li>
                        </ul>
                    </nav>

                    <nav className="md:col-span-3">
                        <h2 className="t-data text-[10px] text-meta-c mb-4">Radio por países</h2>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-[15px]">
                            {PAISES.map(p => (
                                <li key={p.slug}>
                                    <a href={`/radio/${p.slug}`} className="hover:text-signal transition-colors">
                                        {p.name}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <h2 className="t-data text-[10px] text-meta-c mb-4 mt-8">Por género</h2>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-[15px]">
                            {GENEROS.map(g => (
                                <li key={g.slug}>
                                    <a href={`/genero/${g.slug}`} className="hover:text-signal transition-colors">
                                        {g.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* El logotipo cierra la página a sangre */}
                <div className="pt-10 pb-4">
                    <p className="t-display text-[clamp(3rem,17vw,13rem)] leading-[0.8] select-none">
                        Sonicwave
                    </p>
                </div>

                <div className="pt-4 pb-8 flex flex-col sm:flex-row justify-between gap-2 t-data text-[10px] text-meta-c">
                    <span>© {new Date().getFullYear()} SonicWave</span>
                    <span>Transmitiendo desde Venezuela para el mundo</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

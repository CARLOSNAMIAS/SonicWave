import React from 'react';
import { MAGAZINE_ENABLED } from '@/config';

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
                                    <button onClick={onMagazineClick} className="hover:text-signal transition-colors">
                                        Revista
                                    </button>
                                </li>
                            )}
                            <li>
                                <button onClick={onAboutClick} className="hover:text-signal transition-colors">
                                    Sobre nosotros
                                </button>
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
                </div>

                {/* El logotipo cierra la página a sangre */}
                <div className="pt-10 pb-4">
                    <p className="t-display text-[clamp(3rem,17vw,13rem)] leading-[0.8] select-none">
                        Sonicwave
                    </p>
                </div>

                <div className="pt-4 pb-8 flex flex-col sm:flex-row justify-between gap-2 t-data text-[10px] text-meta-c">
                    <span>© {new Date().getFullYear()} SonicWave AI Radio</span>
                    <span>Transmitiendo desde Venezuela para el mundo</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import React from 'react';
import { Github } from 'lucide-react';

/**
 * Footer component containing legal links, contact info, and disclaimer.
 */
const Footer: React.FC = () => {
    return (
        <footer className="mt-20 py-12 border-t border-slate-200 dark:border-white/5 bg-slate-100/30 dark:bg-black/20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
                {/* Brand Section */}
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

                {/* Legal Links */}
                <div className="space-y-4">
                    <h5 className="font-black text-xs uppercase tracking-widest text-cyan-500">Información</h5>
                    <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <li><a href="/privacy.html" className="hover:text-cyan-500 transition-colors">Privacidad</a></li>
                        <li><a href="/terms.html" className="hover:text-cyan-500 transition-colors">Términos</a></li>
                        <li><a href="/cookies.html" className="hover:text-cyan-500 transition-colors">Cookies</a></li>
                    </ul>
                </div>

                {/* Support Links */}
                <div className="space-y-4">
                    <h5 className="font-black text-xs uppercase tracking-widest text-cyan-500">Soporte</h5>
                    <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <li><a href="https://github.com/CARLOSNAMIAS" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">Contacto</a></li>
                        <li><a href="http://www.radio-browser.info/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">API Radio</a></li>
                    </ul>
                </div>
            </div>

            {/* Copyright & Disclaimer */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} SonicWave AI Radio. Transmitiendo en vivo.</p>
                <p className="italic">Disclaimer: SonicWave es un agregador que no aloja los flujos de audio directamente.</p>
            </div>
        </footer>
    );
};

export default Footer;

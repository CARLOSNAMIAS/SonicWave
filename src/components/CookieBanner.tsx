import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('sonicwave_cookie_consent');
        if (!consent) {
            // Delay slightly for better UX
            setTimeout(() => setIsVisible(true), 1500);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('sonicwave_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-cyan-500/20 shadow-2xl rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-full shrink-0">
                    <Cookie className="text-cyan-500" size={24} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Nos importan tus datos</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        Usamos cookies no intrusivas para guardar tus favoritos y preferencias de tema. Al continuar, aceptas el uso de estas tecnologías para mejorar tu experiencia.
                        <a href="/privacy.html" className="text-cyan-500 hover:underline ml-1">Leer más</a>.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <button
                        onClick={() => setIsVisible(false)} // Just dismiss for session
                        className="flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none py-2 px-6 rounded-xl text-xs font-bold bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-all active:scale-95"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;

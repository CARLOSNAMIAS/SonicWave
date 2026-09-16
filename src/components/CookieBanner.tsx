import React, { useState, useEffect } from 'react';

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
        <div className="fixed bottom-0 inset-x-0 z-[80] bg-ink text-paper border-t-[3px] border-signal">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <p className="text-[14px] leading-relaxed flex-1 max-w-[80ch] text-white/75">
                    Guardamos tus favoritos y tu preferencia de tema en este dispositivo. Nada más.{' '}
                    <a href="/privacy.html" className="text-paper underline underline-offset-2 hover:text-signal transition-colors">
                        Cómo tratamos tus datos
                    </a>
                </p>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsVisible(false)}
                        className="h-10 px-5 text-[14px] font-medium text-white/60 hover:text-white transition-colors"
                    >
                        Ahora no
                    </button>
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="h-10 px-6 text-[14px] font-semibold bg-paper text-ink hover:bg-signal hover:text-white transition-colors"
                    >
                        De acuerdo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;

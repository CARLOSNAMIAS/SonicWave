import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { Newspaper, Star, Lightbulb, RefreshCw, Music } from 'lucide-react';

interface MagazineContent {
    horoscopes: {
        sign: string;
        prediction: string;
        recommendedGenre: string;
    }[];
    news: {
        title: string;
        content: string;
        tag: string;
    }[];
    trivia: {
        fact: string;
        context: string;
    };
}

const MagazineView: React.FC = () => {
    useSEO({
        title: 'Sonic Insights | Tu Revista Musical con IA',
        description: 'Descubre el horóscopo musical, noticias de la industria y datos curiosos generados por nuestra IA.'
    });

    const [content, setContent] = useState<MagazineContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInsights = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/insights');
            if (response.ok) {
                const data = await response.json();
                setContent(data);
            }
        } catch (error) {
            console.error("Error fetching insights:", error);
            // Fallback content if API fails
            setContent({
                horoscopes: [
                    {
                        sign: "Capricornio",
                        prediction: "Tu disciplina musical hoy te llevará a encontrar esa joya oculta que tanto buscabas. Los astros vibran en frecuencias bajas.",
                        recommendedGenre: "Techno Melódico"
                    },
                    {
                        sign: "Aries",
                        prediction: "Energía pura y ritmos acelerados. No te detengas ante nada, la música será tu motor principal.",
                        recommendedGenre: "Punk Rock"
                    },
                    {
                        sign: "Leo",
                        prediction: "Tu carisma brilla como una estrella de rock. Es el momento perfecto para liderar tu propia lista de éxitos.",
                        recommendedGenre: "Pop Glam"
                    }
                ],
                news: [
                    {
                        title: "La IA revoluciona la Radio",
                        content: "Nuevos algoritmos permiten una personalización sin precedentes en la experiencia auditiva global.",
                        tag: "Tecnología"
                    },
                    {
                        title: "El Vinilo sigue Creciendo",
                        content: "Las ventas de discos físicos alcanzan un nuevo máximo en la era digital.",
                        tag: "Tendencias"
                    }
                ],
                trivia: {
                    fact: "¿Sabías que la primera transmisión de radio pública fue en 1910?",
                    context: "Lee de Forest transmitió una actuación de Enrico Caruso desde el Metropolitan Opera House."
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <RefreshCw className="animate-spin text-cyan-500" size={48} />
                <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Sintonizando Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                    <Newspaper size={14} className="text-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Sonic Magazine</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tight leading-none">
                    Insights <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500">Musicales</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                    Explora el cosmos sonoro a través de nuestra inteligencia artificial. Noticias, horóscopo y curiosidades actualizadas diariamente.
                </p>
            </header>

            {/* Top Section: News & Trivia */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* News Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Newspaper size={20} className="text-indigo-500" />
                        </div>
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Flash Melódico</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {content?.news.map((item, idx) => (
                            <article key={idx} className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] hover:border-indigo-500/50 transition-all group">
                                <div className="space-y-4">
                                    <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                        {item.tag}
                                    </span>
                                    <h3 className="text-2xl font-black dark:text-white leading-tight group-hover:text-indigo-500 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        {item.content}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Trivia & Featured Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="absolute -bottom-4 -left-4 opacity-20">
                            <Lightbulb size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">¿Sabías que?</h3>
                            <p className="text-xl font-bold leading-tight">
                                {content?.trivia.fact}
                            </p>
                            <p className="text-sm opacity-80 leading-relaxed italic">
                                "{content?.trivia.context}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Full Zodiac Grid */}
            <section className="space-y-8 pt-8 border-t border-slate-200 dark:border-white/5">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <Star size={20} className="text-cyan-500" />
                        </div>
                        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">El Oráculo del Zodíaco</h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Predicciones musicales exclusivas para cada signo</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {content?.horoscopes.map((h, idx) => (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Star size={40} className="text-cyan-500" />
                            </div>
                            <div className="relative z-10 space-y-3">
                                <span className="text-xl font-black text-cyan-500 italic block">{h.sign}</span>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-serif italic text-xs">
                                    {h.prediction}
                                </p>
                            </div>
                            <div className="pt-4 flex flex-col border-t border-slate-50 dark:border-white/5 mt-4">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Recomendación Melódica</span>
                                <p className="text-xs font-black dark:text-cyan-400">{h.recommendedGenre}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Controls */}
            <div className="flex justify-center pt-8">
                <button
                    onClick={fetchInsights}
                    className="flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
                >
                    <RefreshCw size={20} className="text-cyan-500 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="font-black uppercase tracking-widest text-[11px] dark:text-white">Sincronizar nuevas predicciones</span>
                </button>
            </div>
        </div>
    );
};

export default MagazineView;

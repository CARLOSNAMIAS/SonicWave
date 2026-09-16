import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';

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
            <div className="min-h-[60vh] flex items-end pb-16">
                <div>
                    <div className="flex items-end gap-1 h-8 mb-5">
                        {[0, 0.12, 0.24, 0.36, 0.48].map(delay => (
                            <span
                                key={delay}
                                className="w-1.5 bg-signal animate-sound-wave"
                                style={{ animationDelay: `${delay}s` }}
                            />
                        ))}
                    </div>
                    <p className="t-data text-[11px] text-meta-c">Cerrando la edición de hoy</p>
                </div>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="pt-10">
            {/* Cabecera de la publicación */}
            <header className="pb-6">
                <div className="flex items-baseline justify-between gap-4 t-data text-[10px] text-meta-c mb-4">
                    <span>Revista de SonicWave</span>
                    <span>{today}</span>
                </div>
                <h1 className="t-display text-[clamp(2.75rem,14vw,9rem)]">
                    Sonic Insights
                </h1>
            </header>

            {/* Portada: dato del día */}
            {content?.trivia && (
                <section className="bg-ink text-paper px-6 md:px-10 py-10 md:py-14">
                    <p className="t-data text-[10px] text-white/45 mb-5">Dato del día</p>
                    <p className="t-display text-[clamp(1.75rem,6vw,3.5rem)] max-w-[20ch]">
                        {content.trivia.fact}
                    </p>
                    <p className="mt-6 text-[15px] md:text-base leading-relaxed text-white/60 max-w-[62ch]">
                        {content.trivia.context}
                    </p>
                </section>
            )}

            {/* Noticias a dos columnas */}
            <section className="py-12">
                <h2 className="t-data text-[10px] text-meta-c mb-6">Lo que suena en la industria</h2>
                <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                    {content?.news.map((item, idx) => (
                        <article key={idx} className="pt-5">
                            <p className="t-data text-[10px] text-meta-c mb-3">{item.tag}</p>
                            <h3 className="t-display text-[clamp(1.5rem,4vw,2.25rem)] mb-4">
                                {item.title}
                            </h3>
                            <p className="text-[15px] leading-relaxed text-meta-c max-w-[58ch]">
                                {item.content}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Horóscopo: una fila por signo */}
            <section className="py-12">
                <div className="flex items-end justify-between gap-6 mb-6">
                    <h2 className="t-display text-[clamp(1.75rem,5vw,3rem)]">Horóscopo sonoro</h2>
                    <span className="t-data text-[10px] text-meta-c shrink-0 pb-1">
                        {content?.horoscopes.length || 0} signos
                    </span>
                </div>

                <div className="">
                    {content?.horoscopes.map((h, idx) => (
                        <article
                            key={idx}
                            className="grid md:grid-cols-[10rem_1fr_12rem] gap-3 md:gap-8 py-6"
                        >
                            <h3 className="t-display text-[clamp(1.25rem,3.5vw,1.75rem)]">{h.sign}</h3>
                            <p className="text-[15px] leading-relaxed max-w-[62ch]">{h.prediction}</p>
                            <p className="t-data text-[11px] text-meta-c md:text-right">
                                Suena mejor con
                                <span className="block text-ink dark:text-paper mt-1">{h.recommendedGenre}</span>
                            </p>
                        </article>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={fetchInsights}
                    className="mt-10 h-12 px-8 bg-ink text-paper dark:bg-paper dark:text-ink text-[15px] font-semibold hover:bg-signal hover:text-white dark:hover:bg-signal dark:hover:text-white transition-colors"
                >
                    Pedir otra edición
                </button>
            </section>
        </div>
    );
};

export default MagazineView;

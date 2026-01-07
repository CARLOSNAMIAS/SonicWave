import React from 'react';
import { Radio, Heart, Globe, Cpu, Music, Shield, Mail } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const AboutView: React.FC = () => {
    useSEO({
        title: 'SonicWave - Sobre Nosotros',
        description: 'Conoce la misión de SonicWave: democratizar el acceso a la radio global mediante inteligencia artificial. Descubre más de 30,000 emisoras sin fronteras.'
    });

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <header className="text-center space-y-6">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 mb-4">
                    <Radio className="text-cyan-500 w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    Sobre <span className="text-cyan-500">SonicWave</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Redefiniendo la forma en que el mundo descubre música a través de la inteligencia artificial y la radio global.
                </p>
            </header>

            {/* Mission Section */}
            <section className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 md:p-12 shadow-xl shadow-cyan-500/5 border border-slate-100 dark:border-white/5">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Heart className="text-rose-500" /> Nuestra Misión
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            En SonicWave, creemos que la radio sigue siendo el medio más poderoso para conectar culturas. Nuestra misión es democratizar el acceso a las ondas globales, eliminando las barreras geográficas y permitiendo que cualquier persona, en cualquier lugar, experimente la riqueza auditiva de más de 190 países.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            No solo queremos que escuches; queremos que sientas. Por eso hemos integrado tecnología de visualización de audio en tiempo real y una estética inmersiva que transforma cada sesión de escucha en una experiencia multisensorial.
                        </p>
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-colors">
                    <Cpu className="text-purple-500 w-10 h-10 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Impulsado por IA</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Nuestro motor de recomendaciones utiliza <strong>Google Gemini AI</strong> para entender tus preferencias musicales en lenguaje natural. Simplemente dile a nuestro DJ cómo te sientes o qué quieres escuchar, y él curará una lista de emisoras perfecta para ti, explicando el "por qué" de cada elección.
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-colors">
                    <Globe className="text-cyan-500 w-10 h-10 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Base de Datos Global</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Nos conectamos directamente con la comunidad de <strong>Radio Browser</strong>, ofreciendo acceso instantáneo y gratuito a más de 30,000 estaciones de radio validadas y activas. Desde emisoras locales en Los Andes hasta grandes cadenas en Tokio, todo está a un clic de distancia.
                    </p>
                </div>
            </section>

            {/* Features List */}
            <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Características Premium, Gratis</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Music className="shrink-0 text-cyan-500" />
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Sin Publicidad Intrusiva</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Disfruta de la música sin interrupciones de audio forzadas por nuestra plataforma.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Shield className="shrink-0 text-cyan-500" />
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Privacidad Primero</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No requerimos registro. Tus datos de escucha son anónimos y seguros.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Radio className="shrink-0 text-cyan-500" />
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Favoritos Locales</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Guarda tus emisoras preferidas en tu dispositivo para un acceso rápido y sencillo.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Legal & Contact */}
            <section className="bg-slate-100 dark:bg-slate-900 p-8 rounded-3xl text-center space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Aviso Legal y Contacto</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    SonicWave es un proyecto de código abierto apasionado por la música. No alojamos ningún stream de audio; actuamos como un índice inteligente que conecta a los oyentes con las transmisiones públicas de las emisoras.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                    <a href="#" className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-200 hover:text-cyan-500 transition-colors shadow-sm">
                        <Mail size={16} /> Contactar Soporte
                    </a>
                    {/* Legal links would go here if they were separate pages, for now just text */}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-white/5">
                    © {new Date().getFullYear()} SonicWave AI Radio. Todos los derechos reservados.
                </div>
            </section>

        </div>
    );
};

export default AboutView;

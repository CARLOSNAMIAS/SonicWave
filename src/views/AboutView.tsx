import React from 'react';
import { useSEO } from '@/hooks/useSEO';

const FACTS: { label: string; value: string }[] = [
    { label: 'Emisoras', value: '30 000 +' },
    { label: 'Países', value: '190 +' },
    { label: 'Registro', value: 'No hace falta' },
    { label: 'Precio', value: 'Gratis' },
];

const AboutView: React.FC = () => {
    useSEO({
        title: 'Qué es SonicWave: radio del mundo gratis y sin registro',
        description: 'SonicWave es un índice gratuito de la radio pública mundial: más de 30.000 emisoras de 190 países, sin cuenta ni registro, con un buscador que entiende lo que quieres escuchar.',
        path: '/?view=ABOUT'
    });

    return (
        <div className="pt-10">
            <header className="pb-10">
                <h1 className="t-display text-[clamp(2.5rem,12vw,8rem)]">
                    Qué es<br />SonicWave
                </h1>
                <p className="mt-8 text-[18px] md:text-[22px] leading-[1.4] max-w-[52ch]">
                    Un índice de la radio pública mundial. Escribes lo que te apetece
                    escuchar, el DJ busca entre miles de emisoras y te dice por qué eligió
                    cada una.
                </p>
            </header>

            {/* Datos en tabla: una fila por dato, alineados a la misma columna */}
            <section className="">
                {FACTS.map(fact => (
                    <div key={fact.label} className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-4">
                        <span className="t-data text-[11px] text-meta-c">{fact.label}</span>
                        <span className="t-display text-[clamp(1.25rem,4vw,2rem)]">{fact.value}</span>
                    </div>
                ))}
            </section>

            <section className="grid md:grid-cols-2 gap-10 md:gap-16 py-12">
                <div className="max-w-[60ch]">
                    <h2 className="t-display text-[clamp(1.5rem,4.5vw,2.25rem)] mb-5">Por qué la radio</h2>
                    <p className="text-[15px] md:text-base leading-relaxed text-meta-c mb-4">
                        La radio sigue siendo el medio que mejor cuenta cómo suena un sitio.
                        Una emisora de barrio en Caracas dice más de esa ciudad que cualquier
                        lista de reproducción automática.
                    </p>
                    <p className="text-[15px] md:text-base leading-relaxed text-meta-c">
                        SonicWave quita el trabajo de buscar: reúne las señales públicas que ya
                        existen y te las pone a un clic, vengan de donde vengan.
                    </p>
                </div>

                <div className="max-w-[60ch]">
                    <h2 className="t-display text-[clamp(1.5rem,4.5vw,2.25rem)] mb-5">Cómo funciona</h2>
                    <p className="text-[15px] md:text-base leading-relaxed text-meta-c mb-4">
                        El catálogo viene de <strong className="font-semibold text-ink dark:text-paper">Radio Browser</strong>,
                        la base de datos comunitaria de emisoras activas. El DJ traduce lo
                        que le escribes —«algo tranquilo para trabajar», «salsa venezolana»—
                        en géneros y países concretos. Funciona dentro de tu navegador, sin
                        enviar tus peticiones a ningún servicio externo.
                    </p>
                    <p className="text-[15px] md:text-base leading-relaxed text-meta-c">
                        Tus favoritos y tu preferencia de tema se guardan solo en tu navegador.
                        No hay cuentas, ni perfiles, ni seguimiento entre sesiones.
                    </p>
                </div>
            </section>

            <section className="py-12">
                <p className="text-[15px] leading-relaxed text-meta-c max-w-[62ch]">
                    SonicWave no aloja ninguna transmisión: funciona como un índice que conecta
                    a quien escucha con la señal pública de cada emisora. Si eres responsable de
                    una emisora y quieres corregir o retirar sus datos,{' '}
                    <a
                        href="https://github.com/CARLOSNAMIAS"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink dark:text-paper underline underline-offset-2 hover:text-signal transition-colors"
                    >
                        escríbenos
                    </a>.
                </p>
            </section>
        </div>
    );
};

export default AboutView;


import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';

/**
 * Fondo de la página: el espectro de lo que suena, dibujado a tamaño de pantalla
 * como columnas planas apenas perceptibles. Sin audio no dibuja nada, así que
 * nunca compite con el contenido.
 */
const DynamicBackground: React.FC = () => {
    const { analyserRef, isPlaying } = usePlayer();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);
    const levelsRef = useRef<number[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const columnCount = () => (window.innerWidth < 768 ? 8 : 16);

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const columns = columnCount();
            const columnWidth = width / columns;

            const isDark = document.documentElement.classList.contains('dark');
            const fill = isDark ? 'rgba(233, 230, 223, 0.045)' : 'rgba(0, 0, 0, 0.035)';

            ctx.clearRect(0, 0, width, height);

            if (levelsRef.current.length !== columns) {
                levelsRef.current = new Array(columns).fill(0);
            }

            let data: Uint8Array | null = null;
            if (isPlaying && analyserRef.current && !prefersReducedMotion) {
                const bufferLength = analyserRef.current.frequencyBinCount;
                data = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(data);
            }

            ctx.fillStyle = fill;
            for (let i = 0; i < columns; i++) {
                let target = 0;
                if (data) {
                    const index = Math.floor((i / columns) * (data.length / 2));
                    target = (data[index] / 255) * height * 0.55;
                }
                // Suavizado: las columnas caen despacio para que no parpadeen.
                levelsRef.current[i] += (target - levelsRef.current[i]) * 0.12;
                const level = levelsRef.current[i];
                if (level > 1) {
                    ctx.fillRect(i * columnWidth, height - level, columnWidth, level);
                }
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, analyserRef]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 -z-10 pointer-events-none"
        />
    );
};

export default DynamicBackground;

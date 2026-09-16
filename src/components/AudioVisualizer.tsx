
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    isPlaying: boolean;
    color?: string;
    bars?: number;
    height?: number;
}

/** Lee el color de señal vigente (el DJ IA puede reasignarlo). */
const readSignal = (): string => {
    if (typeof window === 'undefined') return 'rgb(255, 59, 0)';
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
    return raw ? `rgb(${raw})` : 'rgb(255, 59, 0)';
};

/**
 * Medidor de espectro en barras rectangulares.
 * Sin degradados ni esquinas: la altura es el único dato que transmite.
 */
const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    analyser,
    isPlaying,
    color,
    bars = 32,
    height = 40
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const ink = color || readSignal();

        const render = () => {
            const width = canvas.width;
            const canvasHeight = canvas.height;
            const gap = 2;
            const barWidth = Math.max(1, (width / bars) - gap);

            ctx.clearRect(0, 0, width, canvasHeight);

            if (!isPlaying || !analyser) {
                // Línea de base: el medidor existe aunque no haya audio.
                ctx.globalAlpha = 0.35;
                ctx.fillStyle = ink;
                for (let i = 0; i < bars; i++) {
                    ctx.fillRect(i * (barWidth + gap), canvasHeight - 2, barWidth, 2);
                }
                ctx.globalAlpha = 1;
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            // Un stream sin cabeceras CORS entrega solo ceros: se simula el movimiento.
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            const isCORSBlocked = sum === 0;

            ctx.fillStyle = ink;
            let x = 0;

            for (let i = 0; i < bars; i++) {
                let barHeight;

                if (isCORSBlocked) {
                    barHeight = (Math.sin(Date.now() / 220 + i * 0.6) + 1) * (canvasHeight / 2) * 0.7;
                } else {
                    const index = Math.floor((i / bars) * (bufferLength / 2));
                    barHeight = (dataArray[index] / 255) * canvasHeight;
                }

                barHeight = Math.max(barHeight, 2);
                ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
                x += barWidth + gap;
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyser, isPlaying, color, bars, height]);

    return (
        <canvas
            ref={canvasRef}
            width={bars * 6}
            height={height}
            className="w-full h-full"
        />
    );
};

export default AudioVisualizer;

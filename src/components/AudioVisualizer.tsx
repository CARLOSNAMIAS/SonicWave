
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    isPlaying: boolean;
    color?: string;
    bars?: number;
    height?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    analyser,
    isPlaying,
    color = '#22D3EE',
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

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            if (!isPlaying || !analyser) {
                // Draw static baseline
                ctx.fillStyle = `${color}33`; // 20% opacity
                const barWidth = (width / bars) - 2;
                for (let i = 0; i < bars; i++) {
                    ctx.fillRect(i * (barWidth + 2), height - 2, barWidth, 2);
                }
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            // Check if we are getting zeros (CORS issue)
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            const isCORSBlocked = sum === 0 && isPlaying;

            const barWidth = (width / bars) - 2;
            let x = 0;

            for (let i = 0; i < bars; i++) {
                let barHeight;

                if (isCORSBlocked) {
                    // Fallback animation: simulate movement if CORS blocks real data
                    barHeight = (Math.sin(Date.now() / 200 + i) + 1) * (height / 2) * (0.5 + Math.random() * 0.5);
                } else {
                    // Use real audio data
                    const index = Math.floor((i / bars) * (bufferLength / 2));
                    barHeight = (dataArray[index] / 255) * height;
                }

                // Apply a minimum height for aesthetic
                barHeight = Math.max(barHeight, 2);

                // Gradient for bars
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, `${color}66`);

                ctx.fillStyle = gradient;

                // Rounded bars (approx)
                ctx.beginPath();
                ctx.roundRect(x, height - barHeight, barWidth, barHeight, 4);
                ctx.fill();

                x += barWidth + 2;
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

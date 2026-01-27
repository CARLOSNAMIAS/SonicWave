
import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';

const DynamicBackground: React.FC = () => {
    const { analyserRef, isPlaying } = usePlayer();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        let particles: { x: number; y: number; size: number; speedX: number; speedY: number; color: string }[] = [];

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 5 + 2,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    color: i % 2 === 0 ? 'rgba(34, 211, 238, 0.1)' : 'rgba(99, 102, 241, 0.1)'
                });
            }
        };

        createParticles();

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Clear with slight trail
            ctx.fillStyle = document.documentElement.classList.contains('dark')
                ? 'rgba(11, 15, 25, 0.05)'
                : 'rgba(248, 250, 252, 0.05)';
            ctx.fillRect(0, 0, width, height);

            let intensity = 0;
            if (isPlaying && analyserRef.current) {
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(dataArray);

                // Get average of low frequencies for beat detection
                const lowFreqs = dataArray.slice(0, 10);
                const sum = lowFreqs.reduce((a, b) => a + b, 0);
                intensity = sum / lowFreqs.length / 255;

                // Update CSS variables for other components to react
                document.documentElement.style.setProperty('--glow-intensity', intensity.toString());
                document.documentElement.style.setProperty('--beat-scale', (1 + intensity * 0.05).toString());
            } else {
                document.documentElement.style.setProperty('--glow-intensity', '0');
                document.documentElement.style.setProperty('--beat-scale', '1');
            }

            particles.forEach((p, i) => {
                p.x += p.speedX * (1 + intensity * 5);
                p.y += p.speedY * (1 + intensity * 5);

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                const currentSize = p.size * (1 + intensity * 2);

                ctx.beginPath();
                ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace('0.1', (0.05 + intensity * 0.2).toString());
                ctx.fill();

                // Draw lines between nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(0, (0.05 + intensity * 0.1) * (1 - dist / 150))})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            // Ambient Glow in center or corners
            const gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            );

            const color1 = document.documentElement.classList.contains('dark') ? '34, 211, 238' : '34, 211, 238';
            const color2 = document.documentElement.classList.contains('dark') ? '99, 102, 241' : '99, 102, 241';

            gradient.addColorStop(0, `rgba(${color1}, ${0.02 + intensity * 0.05})`);
            gradient.addColorStop(1, `rgba(${color2}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

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
            className="fixed inset-0 -z-50 pointer-events-none transition-opacity duration-1000"
            style={{ opacity: 0.6 }}
        />
    );
};

export default DynamicBackground;

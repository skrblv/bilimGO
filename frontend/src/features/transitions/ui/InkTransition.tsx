import { useEffect, useRef } from 'react';

interface InkTransitionProps {
    isAnimating: boolean;
    onAnimationComplete: () => void;
}

export const InkTransition = ({ isAnimating, onAnimationComplete }: InkTransitionProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isAnimating || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const maxRadius = Math.max(canvas.width, canvas.height) * 0.4;
        const animationDuration = 1200; // мс
        const fadeOutDuration = 400; // мс

        // Создаем массив "капель" чернил
        const drops = [...Array(30)].map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            // У каждой капли своя скорость роста
            speed: (0.5 + Math.random()) * (maxRadius / (animationDuration / 16.67)),
            radius: 0,
        }));

        let startTime: number | null = null;
        let isFading = false;
        let fadeStartTime: number | null = null;
        
        const render = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            // Очищаем canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let allDropsFinished = true;

            // Рисуем каждую каплю
            drops.forEach(drop => {
                if (drop.radius < maxRadius) {
                    drop.radius += drop.speed;
                    allDropsFinished = false;
                }
                
                let opacity = 1;
                if (isFading) {
                    if (!fadeStartTime) fadeStartTime = timestamp;
                    const fadeElapsed = timestamp - fadeStartTime;
                    opacity = Math.max(0, 1 - (fadeElapsed / fadeOutDuration));
                }
                
                ctx.beginPath();
                ctx.arc(drop.x, drop.y, drop.radius, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(13, 17, 23, ${opacity})`;
                ctx.fill();
            });

            // Если все капли выросли, запускаем затухание
            if (allDropsFinished && !isFading) {
                isFading = true;
            }

            // Если затухание завершилось
            if (isFading && timestamp - (fadeStartTime || 0) > fadeOutDuration) {
                onAnimationComplete();
            } else {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };

    }, [isAnimating, onAnimationComplete]);

    if (!isAnimating) return null;

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
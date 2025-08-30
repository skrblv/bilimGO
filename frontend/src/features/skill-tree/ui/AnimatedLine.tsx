import { motion } from 'framer-motion';

interface AnimatedLineProps {
    isActive: boolean;
}

export const AnimatedLine = ({ isActive }: AnimatedLineProps) => {
    // Варианты анимации для SVG-пути
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeInOut"
            }
        }
    };
    
    return (
        <svg 
            className="absolute top-0 left-0 w-full h-full" 
            style={{ top: '-13px', left: '-10px' }} // Корректируем позицию SVG
            overflow="visible"
            aria-hidden="true"
        >
            {/* 
                Рисуем путь от вертикальной линии родителя (если он есть) к центру нашей иконки.
                Координаты подобраны для иконки размером w-12 h-12 (48px).
            */}
            <path
                d="M 24 0 V 22" // Вертикальный сегмент
                stroke="rgb(var(--color-border))" 
                strokeWidth="2" 
            />
            <path
                d="M 24 22 H 48" // Горизонтальный сегмент
                stroke="rgb(var(--color-border))" 
                strokeWidth="2" 
            />

            {/* Анимированная цветная линия поверх */}
            <motion.path
                d="M 24 0 V 22 H 48" // Тот же самый путь
                stroke="rgb(var(--color-primary))"
                strokeWidth="3"
                variants={pathVariants}
                initial="hidden"
                animate={isActive ? "visible" : "hidden"}
            />
        </svg>
    );
};
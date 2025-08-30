import { motion } from 'framer-motion';

interface WaveTransitionProps {
    isAnimating: boolean;
    onAnimationComplete: () => void;
}

export const WaveTransition = ({ isAnimating, onAnimationComplete }: WaveTransitionProps) => {
    if (!isAnimating) return null;

    // Функция для генерации случайного пути волны
    const generateWavePath = (startY: number, chaos: number) => {
        return `M -50 ${startY} C 300 ${startY + (Math.random() - 0.5) * chaos}, 500 ${startY + (Math.random() - 0.5) * chaos}, 800 ${startY} S 1100 ${startY + (Math.random() - 0.5) * chaos}, 1650 ${startY}`;
    };

    // Анимационные варианты для заливки
    const fillVariants = {
        initial: {
            y: "100%", // Начинаем за пределами экрана снизу
        },
        animate: {
            y: "0%", // Поднимаемся до верха
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } // Красивая кривая easing
        },
    };

    return (
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1600 900" preserveAspectRatio="none">
            {/* 
                Мы создаем "маску" с несколькими анимированными волнами.
                Все, что внутри маски, будет видимо.
            */}
            <defs>
                <mask id="wave-mask">
                    {/* Белый прямоугольник, который будет "заливать" экран */}
                    <motion.rect
                        x="0"
                        y="0"
                        width="1600"
                        height="900"
                        fill="white"
                        variants={fillVariants}
                        initial="initial"
                        animate="animate"
                    />
                    {/* 
                        Черные волны "прорезают" белый прямоугольник,
                        создавая ощущение хаотичной заливки.
                    */}
                    {[...Array(5)].map((_, i) => (
                        <motion.path
                            key={i}
                            d={generateWavePath(950, 200)} // Начальная позиция волн
                            fill="black"
                            animate={{
                                d: generateWavePath( -50, 150) // Конечная позиция
                            }}
                            transition={{
                                duration: 1.2,
                                ease: "easeInOut",
                                delay: i * 0.05, // Небольшая задержка для каждой волны
                                repeat: Infinity,
                                repeatType: "mirror",
                                repeatDelay: 1,
                            }}
                        />
                    ))}
                </mask>
            </defs>

            {/* 
                Основной фон, который мы показываем через маску.
                Мы анимируем его появление, чтобы избежать резкого скачка.
            */}
            <motion.rect
                x="0"
                y="0"
                width="1600"
                height="900"
                fill="#0D1117"
                mask="url(#wave-mask)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                onAnimationComplete={onAnimationComplete}
            />
        </svg>
    );
};
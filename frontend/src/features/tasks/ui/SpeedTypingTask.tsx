import { useState, useEffect, useMemo, useRef } from 'react';
import { useTimer } from 'react-timer-hook';
import type { Task } from '../../../shared/types/course';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SpeedTypingTaskProps {
    task: Task;
    onComplete: (isSuccess: boolean) => void;
}

type CharState = 'pending' | 'correct' | 'incorrect';

interface TokenizedChar {
    char: string;
    className: string;
}

const StatCard = ({ label, value, unit, colorClass = 'text-primary' }: { label: string; value: string | number, unit?: string, colorClass?: string }) => (
    <div className="bg-surface p-4 rounded-lg border border-border text-center">
        <p className="text-sm text-text-secondary uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value} <span className="text-lg text-text-secondary">{unit}</span></p>
    </div>
);

export const SpeedTypingTask = ({ task, onComplete }: SpeedTypingTaskProps) => {
    // Используем .trim() для удаления случайных пробелов/переносов в начале/конце из БД
    const textToType = useMemo(() => (task.correct_answer || "Текст для этого задания не найден.").trim(), [task.correct_answer]);

    const [tokenizedText, setTokenizedText] = useState<TokenizedChar[]>([]);
    const [typedText, setTypedText] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    const startTimeRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Новая, надежная рекурсивная функция для токенизации, решающая проблему "черного" текста
    useEffect(() => {
        const flattenTokens = (tokenStream: (string | Prism.Token)[]): TokenizedChar[] => {
            const result: TokenizedChar[] = [];
            for (const token of tokenStream) {
                if (typeof token === 'string') {
                    // Если это просто строка, добавляем каждый символ без специфичного класса
                    for (const char of token) {
                        result.push({ char, className: 'token' });
                    }
                } else {
                    // Если это токен-объект, получаем его содержимое
                    const content = token.content;
                    // Собираем все классы для этого токена
                    const inheritedClassName = `token ${token.type} ${token.alias || ''}`.trim();

                    if (Array.isArray(content)) {
                        // Если содержимое - массив, рекурсивно обрабатываем его, передавая родительские классы
                        flattenTokens(content).forEach(t => {
                            result.push({ ...t, className: `${t.className} ${inheritedClassName}`.trim() });
                        });
                    } else if (typeof content === 'string') {
                         // Если содержимое - строка, добавляем каждый символ с унаследованным классом
                         for (const char of content) {
                            result.push({ char, className: inheritedClassName });
                        }
                    }
                }
            }
            return result;
        };

        const tokens = Prism.tokenize(textToType, Prism.languages.python);
        const flattenedChars = flattenTokens(tokens);
        setTokenizedText(flattenedChars);
    }, [textToType]);
    
    const expiryTimestamp = useMemo(() => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + (task.time_limit || 60));
        return time;
    }, [task.time_limit]);

    const { seconds, minutes, start, pause, isRunning } = useTimer({
        expiryTimestamp,
        autoStart: false,
        onExpire: () => {
            if (!isFinished) {
                setIsFinished(true);
                onComplete(false);
            }
        }
    });
    
    const { wpm, accuracy } = useMemo(() => {
        if (!hasStarted) return { wpm: 0, accuracy: 100 };
        const secondsElapsed = (Date.now() - (startTimeRef.current || Date.now())) / 1000;
        let correctChars = 0;
        let errors = 0;
        typedText.split('').forEach((char, index) => {
            if (index < textToType.length) {
                if (char === textToType[index]) correctChars++;
                else errors++;
            }
        });
        const calculatedAccuracy = typedText.length === 0 ? 100 : Math.max(0, Math.round(((typedText.length - errors) / typedText.length) * 100));
        const words = correctChars / 5;
        const minutesElapsed = secondsElapsed > 0 ? secondsElapsed / 60 : 0;
        const calculatedWpm = minutesElapsed > 0 ? Math.round(words / minutesElapsed) : 0;
        return { wpm: calculatedWpm, accuracy: calculatedAccuracy };
    }, [typedText, hasStarted, textToType]);

    // Логика завершения
    useEffect(() => {
        if (!isFinished && typedText === textToType) {
            pause();
            setIsFinished(true);
            onComplete(true);
        }
    }, [typedText, textToType, isFinished, pause, onComplete]);
    
    // Обработка ввода с клавиатуры
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isFinished) return;
        if (!hasStarted && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setHasStarted(true);
            startTimeRef.current = Date.now();
            start();
        }
        e.preventDefault();
        switch (e.key) {
            case 'Enter': setTypedText(prev => prev + '\n'); break;
            case 'Tab': setTypedText(prev => prev + '\t'); break;
            case 'Backspace': setTypedText(prev => prev.slice(0, -1)); break;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    setTypedText(prev => prev + e.key);
                }
        }
    };
    
    const focusInput = () => inputRef.current?.focus();

    // Рендеринг символов
    const charactersToRender = useMemo(() => {
        return tokenizedText.map(({ char, className }, index) => {
            let state: CharState = 'pending';
            if (index < typedText.length) {
                state = typedText[index] === char ? 'correct' : 'incorrect';
            }
            const isCursor = index === typedText.length;

            return (
                <span
                    key={index}
                    className={clsx({
                        // Серый цвет для ненапечатанного текста
                        'text-slate-500': state === 'pending',
                        // Красный фон для ошибок
                        'bg-red-500/50 text-white rounded-sm': state === 'incorrect',
                        // Применяем классы синтаксиса от Prism ТОЛЬКО для правильных символов
                        [className]: state === 'correct', 
                        // Каретка
                        'border-l-2 border-primary animate-pulse': isCursor,
                    })}
                >
                    {/* Правильная обработка переноса строк для HTML */}
                    {char === '\n' ? ' ' : char}
                    {char === '\n' && <br />} 
                </span>
            );
        });
    }, [tokenizedText, typedText]);
    
    // Рендеринг "лишних" символов
    const extraCharacters = typedText.slice(textToType.length).split('').map((char, index) => (
         <span key={`extra-${index}`} className="bg-red-500/50 text-white rounded-sm">
            {char === '\n' ? ' ' : char}
            {char === '\n' && <br />}
         </span>
    ));

    return (
        <div className="w-full">
            {/* Заголовок удален, так как он отображается родительским компонентом LessonPage */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <StatCard label="WPM" value={isRunning ? wpm : '-'} />
                <StatCard label="Точность" value={hasStarted ? accuracy : '-'} unit="%" colorClass={accuracy >= 95 ? 'text-success' : 'text-amber-400'}/>
                <StatCard label="Время" value={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}/>
            </div>
            
            <div 
                className="bg-[#2d2d2d] border border-border rounded-lg shadow-lg p-4 font-mono text-[14px] leading-6 tracking-wide relative cursor-text whitespace-pre-wrap break-all"
                style={{ tabSize: 4, MozTabSize: 4 }}
                onClick={focusInput}
            >
                <input
                    ref={inputRef}
                    type="text"
                    onKeyDown={handleKeyDown} 
                    autoFocus
                    className="absolute top-0 left-0 w-0 h-0 opacity-0 p-0 m-0 border-0"
                    disabled={isFinished}
                    spellCheck="false" autoComplete="off" autoCorrect="off" autoCapitalize="off"
                />
                {charactersToRender}
                {extraCharacters}
                {typedText.length === textToType.length && typedText === textToType && !isFinished && (
                    <span className="inline-block border-l-2 border-primary animate-pulse">{'\u00A0'}</span>
                )}
                {isFinished && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white rounded-lg"
                    >
                        <span>{typedText === textToType ? '🎉 Отлично!' : '⌛ Время вышло!'}</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
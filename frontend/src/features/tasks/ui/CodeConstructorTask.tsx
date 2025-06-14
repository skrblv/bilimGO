import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, ConstructorOptions } from "../../../shared/types/course";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

import 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeConstructorTaskProps {
    task: Task;
    isAnswerChecked: boolean;
    onSelectAnswer: (answer: string) => void;
}

const shuffleArray = (array: string[]) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

export const CodeConstructorTask = ({ task, isAnswerChecked, onSelectAnswer }: CodeConstructorTaskProps) => {
    const isConstructorOptions = (options: any): options is ConstructorOptions => {
        return options && Array.isArray(options.options);
    };

    const initialOptions = isConstructorOptions(task.options) ? task.options.options : [];
    
    const [builtBlocks, setBuiltBlocks] = useState<{ id: number; value: string }[]>([]);
    const [availableBlocks, setAvailableBlocks] = useState<{ id: number; value: string }[]>([]);

    useEffect(() => {
        const initialShuffled = shuffleArray(initialOptions).map((value, index) => ({ id: index, value }));
        setAvailableBlocks(initialShuffled);
    }, [task]);

    const handleOptionClick = (block: { id: number; value: string }) => {
        if (isAnswerChecked) return;
        const newBuilt = [...builtBlocks, block];
        setBuiltBlocks(newBuilt);
        onSelectAnswer(newBuilt.map(b => b.value).join(''));
        setAvailableBlocks(prev => prev.filter(b => b.id !== block.id));
    };

    const handleBuiltBlockClick = (block: { id: number; value: string }) => {
        if (isAnswerChecked) return;
        const newAvailable = [...availableBlocks, block];
        setAvailableBlocks(newAvailable.sort((a, b) => a.id - b.id));
        const newBuilt = builtBlocks.filter(b => b.id !== block.id);
        setBuiltBlocks(newBuilt);
        onSelectAnswer(newBuilt.map(b => b.value).join(''));
    };

    const handleReset = () => {
        if (isAnswerChecked) return;
        setBuiltBlocks([]);
        onSelectAnswer('');
        setAvailableBlocks(shuffleArray(initialOptions).map((value, index) => ({ id: index, value })));
    };

    if (initialOptions.length === 0) {
        return <p className="text-danger">Ошибка: для этого задания не настроены блоки конструктора.</p>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-surface to-background rounded-2xl border border-border shadow-2xl">
            <div className="relative bg-[#0D1117] border border-border rounded-lg p-4 min-h-[80px] mb-8 font-mono text-lg w-full flex flex-wrap gap-3 items-center shadow-inner">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative w-full min-h-[48px] flex flex-wrap gap-3 items-center">
                    {builtBlocks.length > 0 ? (
                        <AnimatePresence>
                            {builtBlocks.map((block) => (
                                <motion.div
                                    key={block.id}
                                    layoutId={`constructor-block-${block.id}`}
                                    onClick={() => handleBuiltBlockClick(block)}
                                    className="bg-primary/20 border border-primary text-primary px-3 py-1.5 rounded-md cursor-pointer shadow-lg shadow-primary/20"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    whileHover={{ scale: 1.05, y: -2, boxShadow: '0 0 15px rgba(88, 166, 255, 0.5)' }}
                                >
                                    {block.value}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <span className="text-text-secondary italic pl-2">Соберите код здесь...</span>
                    )}
                </div>
            </div>
            
            <div className="flex justify-center gap-4 flex-wrap mb-4 min-h-[50px]">
                <AnimatePresence>
                    {availableBlocks.map((block) => (
                        <motion.button
                            key={block.id}
                            layoutId={`constructor-block-${block.id}`}
                            onClick={() => handleOptionClick(block)}
                            className="relative group bg-surface border border-border px-5 py-2.5 rounded-lg font-mono text-text-primary shadow-md hover:border-primary transition-all duration-300"
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                            {block.value}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
            
            {builtBlocks.length > 0 && (
                 <button onClick={handleReset} disabled={isAnswerChecked} className="text-sm text-text-secondary hover:text-primary disabled:opacity-50 flex items-center gap-1.5 transition-colors mt-4">
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    Сбросить
                </button>
            )}
        </div>
    );
};
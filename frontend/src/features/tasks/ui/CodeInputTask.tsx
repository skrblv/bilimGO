import React from 'react';
import Editor from 'react-simple-code-editor';

// --- НАЧАЛО ИСПРАВЛЕНИЯ ---
// 1. Импортируем ядро Prism
import Prism from 'prismjs';

// 2. Импортируем саму грамматику как модуль
import 'prismjs/components/prism-clike'; // Python зависит от C-like
import 'prismjs/components/prism-python';

// 3. Импортируем тему
import 'prismjs/themes/prism-tomorrow.css'; 
// --- КОНЕЦ ИСПРАВЛЕНИЯ ---

interface CodeInputTaskProps {
    isAnswerChecked: boolean;
    onSelectAnswer: (answer: string) => void;
    initialValue?: string;
}

export const CodeInputTask = ({ isAnswerChecked, onSelectAnswer, initialValue = '' }: CodeInputTaskProps) => {
    const [code, setCode] = React.useState(initialValue);

    const handleValueChange = (newCode: string) => {
        if (isAnswerChecked) return;
        setCode(newCode);
        onSelectAnswer(newCode);
    };

    return (
        <div className="bg-[#2d2d2d] border border-border rounded-lg shadow-lg font-mono text-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-700/50 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <Editor
                value={code}
                onValueChange={handleValueChange}
                // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
                // Используем Prism.highlight и Prism.languages напрямую
                highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
                padding={16}
                style={{
                    fontFamily: '"Fira Mono", "DejaVu Sans Mono", monospace',
                    fontSize: 14,
                    outline: 0,
                    minHeight: '120px',
                    backgroundColor: '#2d2d2d',
                    color: '#f8f8f2'
                }}
                disabled={isAnswerChecked}
                textareaClassName="focus:outline-none !bg-transparent"
                preClassName="!bg-transparent"
            />
        </div>
    );
};
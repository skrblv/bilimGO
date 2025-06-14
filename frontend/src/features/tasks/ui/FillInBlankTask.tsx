import { useState } from "react";

interface FillInBlankTaskProps {
    task: { code_template?: string | null };
    isAnswerChecked: boolean;
    onSelectAnswer: (answer: string) => void;
}

export const FillInBlankTask = ({ task, isAnswerChecked, onSelectAnswer }: FillInBlankTaskProps) => {
    const [inputValue, setInputValue] = useState("");

    if (!task.code_template) {
        return <p className="text-danger text-center">Ошибка: шаблон кода для этого задания не найден.</p>;
    }

    const parts = task.code_template.split('_');

    return (
        <div className="bg-[#2d2d2d] border border-border rounded-lg p-6 flex items-center justify-center font-mono text-lg flex-wrap gap-2 shadow-lg">
            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
            {/* Меняем цвет текста на более светлый и читаемый */}
            <span className="text-gray-300">{parts[0]}</span>
            
            <input
                type="text"
                className="bg-transparent border-b-2 border-primary text-gray-300 mx-2 w-24 text-center focus:outline-none p-1 text-lg :placeholder-gray-300"
                placeholder="..."
                disabled={isAnswerChecked}
                value={inputValue}
                autoFocus
                onChange={(e) => {
                    setInputValue(e.target.value);
                    onSelectAnswer(e.target.value);
                }}
            />
            
            <span className="text-gray-300">{parts[1]}</span>
        </div>
    );
};
import type { Task } from "../../../shared/types/course";

interface MultipleChoiceTaskProps {
    task: Task;
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    correctAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
}

export const MultipleChoiceTask = ({ task, selectedAnswer, isAnswerChecked, correctAnswer, onSelectAnswer }: MultipleChoiceTaskProps) => {
    
    const handleClick = (key: string) => {
        // --- ОТЛАДОЧНЫЙ ЛОГ ---
        console.log(`[MultipleChoiceTask] Клик по варианту: ${key}. isAnswerChecked: ${isAnswerChecked}`);
        
        if (!isAnswerChecked) {
            onSelectAnswer(key);
        }
    };

    const getOptionStyle = (key: string) => {
        if (!isAnswerChecked) {
            return selectedAnswer === key ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:border-primary/50';
        }
        if (key === correctAnswer) {
            return 'border-success bg-success/10 pointer-events-none';
        }
        if (key === selectedAnswer) {
            return 'border-danger bg-danger/10 pointer-events-none';
        }
        return 'border-border opacity-50 pointer-events-none';
    };

    return (
        <div className="space-y-3">
            {task.options && Object.entries(task.options).map(([key, value]) => (
                <div 
                    key={key} 
                    onClick={() => handleClick(key)} 
                    className={`p-4 border rounded-lg transition-all text-center ${getOptionStyle(key)} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {/* Добавляем букву варианта для ясности */}
                    <span className="font-bold mr-3 py-1 px-2.5 bg-surface border border-border rounded-md">{key}</span>
                    {value}
                </div>
            ))}
        </div>
    );
};
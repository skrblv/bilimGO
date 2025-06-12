import type { Task } from "../../../shared/types/course";

interface MultipleChoiceTaskProps {
    task: Task;
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    correctAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
}

export const MultipleChoiceTask = ({ task, selectedAnswer, isAnswerChecked, correctAnswer, onSelectAnswer }: MultipleChoiceTaskProps) => {
    
    const getOptionStyle = (key: string) => {
        if (!isAnswerChecked) return selectedAnswer === key ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface';
        if (key === correctAnswer) return 'border-success bg-success/10';
        if (key === selectedAnswer) return 'border-danger bg-danger/10';
        return 'border-border opacity-60';
    };

    return (
        <div className="space-y-3">
            {task.options && Object.entries(task.options).map(([key, value]) => (
                <div 
                    key={key} 
                    onClick={() => !isAnswerChecked && onSelectAnswer(key)} 
                    className={`p-4 border rounded-lg transition-all text-center ${getOptionStyle(key)} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {value}
                </div>
            ))}
        </div>
    );
};
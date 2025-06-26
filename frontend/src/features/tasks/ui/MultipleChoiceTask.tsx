import type { Task, MultipleChoiceOptions } from "../../../shared/types/course";

interface MultipleChoiceTaskProps {
    task: Task;
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    correctAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
}

const isMultipleChoiceOptions = (options: any): options is MultipleChoiceOptions => {
    return options && typeof options === 'object' && !Array.isArray(options.options);
};

export const MultipleChoiceTask = ({ task, selectedAnswer, isAnswerChecked, correctAnswer, onSelectAnswer }: MultipleChoiceTaskProps) => {
    
    const handleClick = (key: string) => {
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

    const options = isMultipleChoiceOptions(task.options) ? task.options : {};

    return (
        <div className="space-y-3">
            {Object.entries(options).map(([key, value]) => (
                <div 
                    key={key} 
                    onClick={() => handleClick(key)} 
                    className={`p-4 border rounded-lg transition-all flex items-center gap-4 ${getOptionStyle(key)} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="font-bold py-1 px-2.5 bg-surface border border-border rounded-md">{key}</span>
                    <span>{value}</span>
                </div>
            ))}
        </div>
    );
};
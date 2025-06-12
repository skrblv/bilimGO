import type { Task } from "../../../shared/types/course";

interface TrueFalseTaskProps {
    task: Task;
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    correctAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
}

export const TrueFalseTask = ({ task, selectedAnswer, isAnswerChecked, correctAnswer, onSelectAnswer }: TrueFalseTaskProps) => {
    
    // Стили для кнопок "Верно" и "Неверно"
    const getButtonStyle = (buttonValue: 'True' | 'False') => {
        if (!isAnswerChecked) {
            return selectedAnswer === buttonValue ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface';
        }
        // Если ответ проверен, подсвечиваем правильный и неправильный
        if (buttonValue === correctAnswer) return 'border-success bg-success/10';
        if (buttonValue === selectedAnswer) return 'border-danger bg-danger/10';
        return 'border-border opacity-60';
    };

    return (
        <div className="flex justify-center gap-4">
            {/* Кнопка "Верно" */}
            <div 
                onClick={() => !isAnswerChecked && onSelectAnswer('True')}
                className={`w-40 p-4 border rounded-lg transition-all text-center font-bold text-lg ${getButtonStyle('True')} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                Верно
            </div>
            {/* Кнопка "Неверно" */}
            <div 
                onClick={() => !isAnswerChecked && onSelectAnswer('False')}
                className={`w-40 p-4 border rounded-lg transition-all text-center font-bold text-lg ${getButtonStyle('False')} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                Неверно
            </div>
        </div>
    );
};
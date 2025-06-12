interface TextInputTaskProps {
    isAnswerChecked: boolean;
    onSelectAnswer: (answer: string) => void;
}

export const TextInputTask = ({ isAnswerChecked, onSelectAnswer }: TextInputTaskProps) => {
    return (
        <input
            type="text"
            className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none transition text-center text-lg"
            placeholder="Введите ваш ответ..."
            disabled={isAnswerChecked}
            onChange={(e) => onSelectAnswer(e.target.value)}
        />
    );
};
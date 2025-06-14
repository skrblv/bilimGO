import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface TrueFalseTaskProps {
    // task не используется, но оставляем для консистентности
    task: object; 
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    correctAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
}

const ChoiceButton = ({ 
    value, 
    label, 
    icon: Icon,
    colorClasses,
    isSelected,
    isCorrect,
    isAnswerChecked,
    onClick 
}: any) => {

    const getVariant = () => {
        if (isAnswerChecked) {
            if (isSelected && isCorrect) return 'correct';
            if (isSelected && !isCorrect) return 'incorrect';
            if (!isSelected && isCorrect) return 'correct-dimmed'; // Подсвечиваем правильный, если выбран не он
            return 'disabled';
        }
        return isSelected ? 'selected' : 'default';
    }

    const variants = {
        default: {
            scale: 1,
            backgroundColor: 'rgba(22, 27, 34, 0.5)', // bg-surface с прозрачностью
            borderColor: '#30363D', // border-border
            color: '#C9D1D9', // text-primary
        },
        selected: {
            scale: 1.05,
            backgroundColor: 'rgba(88, 166, 255, 0.1)', // bg-primary/10
            borderColor: '#58A6FF', // border-primary
            color: '#58A6FF',
        },
        correct: {
            scale: 1.05,
            backgroundColor: 'rgba(35, 134, 54, 0.2)', // bg-success/20
            borderColor: '#238636', // border-success
            color: '#3FB950',
        },
        incorrect: {
            scale: 1.05,
            backgroundColor: 'rgba(218, 54, 51, 0.2)', // bg-danger/20
            borderColor: '#DA3633', // border-danger
            color: '#F85149',
        },
        'correct-dimmed': {
            scale: 1,
            backgroundColor: 'rgba(35, 134, 54, 0.2)',
            borderColor: '#238636',
            color: '#3FB950',
            opacity: 0.7,
        },
        disabled: {
            scale: 1,
            opacity: 0.5,
            backgroundColor: 'rgba(22, 27, 34, 0.5)',
            borderColor: '#30363D',
        }
    }

    return (
        <motion.div
            onClick={() => !isAnswerChecked && onClick(value)}
            className={`flex-1 p-8 border-2 rounded-xl flex flex-col items-center justify-center gap-4 transition-all ${!isAnswerChecked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            variants={variants}
            initial="default"
            animate={getVariant()}
            whileHover={!isAnswerChecked ? { scale: 1.05 } : {}}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
            <Icon className="h-16 w-16" />
            <span className="text-2xl font-bold">{label}</span>
        </motion.div>
    );
};

export const TrueFalseTask = ({ selectedAnswer, isAnswerChecked, correctAnswer, onSelectAnswer }: TrueFalseTaskProps) => {
    return (
        <div className="flex justify-center gap-4 sm:gap-8">
            <ChoiceButton 
                value="True"
                label="Верно"
                icon={CheckIcon}
                isSelected={selectedAnswer === 'True'}
                isCorrect={correctAnswer === 'True'}
                isAnswerChecked={isAnswerChecked}
                onClick={onSelectAnswer}
            />
            <ChoiceButton 
                value="False"
                label="Неверно"
                icon={XMarkIcon}
                isSelected={selectedAnswer === 'False'}
                isCorrect={correctAnswer === 'False'}
                isAnswerChecked={isAnswerChecked}
                onClick={onSelectAnswer}
            />
        </div>
    );
};
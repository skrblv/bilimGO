import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startTest, submitTest, type UserAnswer } from '../shared/api/testing';
import type { Task } from '../shared/types/course';
import { Button } from '../shared/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем все наши компоненты для заданий
import { MultipleChoiceTask } from '../features/tasks/ui/MultipleChoiceTask';
import { TextInputTask } from '../features/tasks/ui/TextInputTask';
import { CodeInputTask } from '../features/tasks/ui/CodeInputTask';
import { TrueFalseTask } from '../features/tasks/ui/TrueFalseTask';
import { FillInBlankTask } from '../features/tasks/ui/FillInBlankTask';
import { CodeConstructorTask } from '../features/tasks/ui/CodeConstructorTask';
import { SpeedTypingTask } from '../features/tasks/ui/SpeedTypingTask';

export const TestSessionPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Task[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const beginTest = async () => {
            if (!courseId) {
                navigate('/');
                return;
            }
            try {
                const data = await startTest(Number(courseId));
                setAttemptId(data.attempt_id);
                setQuestions(data.questions as Task[]);
            } catch (error) {
                console.error("Failed to start test:", error);
                alert("Не удалось начать тест. Возможно, для этого курса еще не подготовлены вопросы.");
                navigate(`/courses/${courseId}/test`);
            } finally {
                setIsLoading(false);
            }
        };
        beginTest();
    }, [courseId, navigate]);

    const currentQuestion = questions[currentQuestionIndex];
    
    const handleSelectAnswer = (answer: string) => {
        if (!currentQuestion) return;
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answer
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitTest();
        }
    };

    const handleSubmitTest = async () => {
        if (!attemptId) return;
        setIsSubmitting(true);
        const answersPayload: UserAnswer[] = Object.entries(userAnswers).map(([qid, ans]) => ({
            question_id: Number(qid),
            answer: ans
        }));

        questions.forEach(q => {
            if (userAnswers[q.id] === undefined) {
                answersPayload.push({ question_id: q.id, answer: "" });
            }
        });

        try {
            const result = await submitTest(attemptId, answersPayload);
            navigate(`/courses/${courseId}/test/result`, { state: { result }, replace: true });
        } catch (error) {
            console.error("Failed to submit test:", error);
            alert("Не удалось завершить тест. Попробуйте позже.");
            setIsSubmitting(false);
        }
    };

    const renderTaskInput = (task: Task) => {
        const currentAnswer = userAnswers[task.id] || "";
        switch(task.task_type) {
            case 'multiple_choice':
                return <MultipleChoiceTask task={task} selectedAnswer={currentAnswer} onSelectAnswer={handleSelectAnswer} isAnswerChecked={false} correctAnswer={null} />;
            case 'text_input':
                return <TextInputTask onSelectAnswer={handleSelectAnswer} isAnswerChecked={false} />;
            case 'code':
                return <CodeInputTask initialValue={currentAnswer} onSelectAnswer={handleSelectAnswer} isAnswerChecked={false} />;
            case 'true_false':
                return <TrueFalseTask task={task} selectedAnswer={currentAnswer} onSelectAnswer={handleSelectAnswer} isAnswerChecked={false} correctAnswer={null} />;
            case 'fill_in_blank':
                return <FillInBlankTask task={task} onSelectAnswer={handleSelectAnswer} isAnswerChecked={false} />;
            case 'constructor':
                return <CodeConstructorTask task={task} onSelectAnswer={handleSelectAnswer} isAnswerChecked={false} />;
            case 'speed_typing':
                return <p className="text-center text-[#8B949E]">Задание на скорость недоступно в этом режиме.</p>;
            default:
                return <p>Неизвестный тип задания.</p>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0D1117] text-[#C9D1D9]">
                <p className="text-xl animate-pulse">Готовим вопросы...</p>
            </div>
        );
    }
    
    if (!currentQuestion) {
        return (
             <div className="flex items-center justify-center h-screen bg-[#0D1117] text-[#C9D1D9]">
                <p className="text-xl">Не удалось загрузить вопросы.</p>
            </div>
        );
    }
    
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-[#0D1117] text-[#C9D1D9]">
            <header className="p-4 flex items-center gap-4 border-b border-[#30363D] sticky top-0 bg-[#0D1117]/80 backdrop-blur-sm z-10">
                <div className="font-mono text-sm text-[#8B949E]">
                    Вопрос {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="w-full bg-[#161B22] rounded-full h-2.5 border border-[#30363D] overflow-hidden">
                    <motion.div className="bg-[#58A6FF] h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }} />
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-3xl">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQuestion.id} 
                            initial={{opacity: 0, y: 30}} 
                            animate={{opacity: 1, y: 0}} 
                            exit={{opacity: 0, y: -30}} 
                            transition={{duration: 0.3}}
                        >
                            <h2 className="text-2xl font-bold mb-8 text-center text-[#C9D1D9]">{currentQuestion.question}</h2>
                            {renderTaskInput(currentQuestion)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            
            <footer className="sticky bottom-0 p-4 border-t bg-[#161B22] border-[#30363D]">
                <div className="max-w-3xl mx-auto flex items-center justify-end">
                    <Button 
                        onClick={handleNextQuestion}
                        isLoading={isSubmitting}
                        disabled={userAnswers[currentQuestion.id] === undefined}
                        className="!w-auto"
                    >
                        {currentQuestionIndex < questions.length - 1 ? "Следующий вопрос" : "Завершить тест"}
                    </Button>
                </div>
            </footer>
        </div>
    );
};
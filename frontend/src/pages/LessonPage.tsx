import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { Modal } from '../shared/ui/Modal';
import { ArrowLeftIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import type { Lesson, Task } from '../shared/types/course';
import { completeLesson, checkAnswer } from '../shared/api/courses';
import { useAuthStore } from '../stores/authStore';
import { TheoryBlock } from '../widgets/TheoryBlock/ui/TheoryBlock';
// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
import { motion, AnimatePresence } from 'framer-motion';

type LessonStage = 'theory' | 'task' | 'completed';

export const LessonPage = () => {
    const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const lessonData: Lesson | undefined = location.state?.lesson;

    const { refreshUserData, addCompletedLesson } = useAuthStore();
    
    const [lesson, setLesson] = useState<Lesson | null>(lessonData || null);
    const [stage, setStage] = useState<LessonStage>('theory');
    const [theoryStep, setTheoryStep] = useState(0);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [correctAnswerFromAPI, setCorrectAnswerFromAPI] = useState<string|null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");

    useEffect(() => { if (!lesson) navigate(`/courses/${courseId}`); }, [lesson, courseId, navigate]);

    const totalTheorySteps = lesson?.theory_content?.length || 0;
    const totalTasks = lesson?.tasks?.length || 0;
    const currentTask = lesson?.tasks?.[currentTaskIndex];

    const handleNext = async () => {
        if (stage === 'theory') {
            if (theoryStep < totalTheorySteps - 1) {
                setTheoryStep(prev => prev + 1);
            } else {
                setStage(totalTasks > 0 ? 'task' : 'completed');
            }
        } else if (stage === 'task') {
            if (isAnswerCorrect) {
                if (currentTaskIndex < totalTasks - 1) {
                    setCurrentTaskIndex(prev => prev + 1);
                    setIsAnswerChecked(false);
                    setIsAnswerCorrect(false);
                    setSelectedAnswer(null);
                    setCorrectAnswerFromAPI(null);
                } else {
                    setStage('completed');
                    await handleCompleteLesson();
                }
            }
        }
    };

    const handleBack = () => {
        if (stage === 'task' && currentTaskIndex === 0) {
            setStage('theory');
            return;
        }
        if (stage === 'theory' && theoryStep > 0) {
            setTheoryStep(prev => prev - 1);
        }
    };

    const handleCheckAnswer = async () => {
        if (!selectedAnswer || !currentTask) return;
        setIsLoading(true);
        try {
            const response = await checkAnswer(currentTask.id, selectedAnswer);
            setIsAnswerChecked(true);
            setIsAnswerCorrect(response.is_correct);
            if(!response.is_correct) {
                setCorrectAnswerFromAPI(response.correct_answer ?? null);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCompleteLesson = async () => {
        if (!lesson) return;
        setIsLoading(true);
        try {
            const response = await completeLesson(lesson.id);
            addCompletedLesson(lesson.id);
            await refreshUserData();
            setCompletionMessage(response.message);
            setShowCompletionModal(true);
        } catch (err: any) { alert(err.response?.data?.message || 'Не удалось завершить урок'); } 
        finally { setIsLoading(false); }
    };
    
    const getOptionStyle = (key: string) => {
        if (!isAnswerChecked) return selectedAnswer === key ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface';
        const correctAnswer = correctAnswerFromAPI || currentTask?.correct_answer;
        if (key === correctAnswer) return 'border-success bg-success/10';
        if (key === selectedAnswer) return 'border-danger bg-danger/10';
        return 'border-border opacity-60';
    };

    if (!lesson) return null;

    const progressPercentage = stage === 'theory' 
        ? ((theoryStep + 1) / (totalTheorySteps + totalTasks)) * 100
        : ((totalTheorySteps + currentTaskIndex + (isAnswerChecked && isAnswerCorrect ? 1 : 0)) / (totalTheorySteps + totalTasks)) * 100;

    const getFooterButtonText = () => {
        if (stage === 'theory') {
            return theoryStep < totalTheorySteps - 1 ? 'Далее' : (totalTasks > 0 ? 'К заданиям!' : 'Завершить урок');
        }
        if (stage === 'task') {
            return isAnswerChecked && isAnswerCorrect ? 'Далее' : 'Проверить';
        }
        return 'Завершить';
    }
    
    const handleFooterButtonClick = () => {
        if (stage === 'theory') {
            if (theoryStep < totalTheorySteps - 1) handleNext();
            else (totalTasks > 0 ? setStage('task') : handleCompleteLesson());
        } else if (stage === 'task') {
            if (!isAnswerChecked) handleCheckAnswer();
            else if (isAnswerCorrect) handleNext();
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="p-4 flex items-center gap-4 border-b border-border">
                <Link to={`/courses/${courseId}`}><XCircleIcon className="h-8 w-8 text-text-secondary hover:text-white" /></Link>
                <div className="w-full bg-surface rounded-full h-4 border border-border">
                    <motion.div className="bg-success h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ ease: "easeOut", duration: 0.5 }} />
                </div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-3xl">
                    <AnimatePresence mode="wait">
                        {stage === 'theory' && lesson.theory_content && (
                            <motion.div key={`theory-${theoryStep}`} initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -50}} transition={{duration: 0.3}}>
                                <TheoryBlock blocks={lesson.theory_content} step={theoryStep} />
                            </motion.div>
                        )}
                        {stage === 'task' && currentTask && (
                            <motion.div key={`task-${currentTask.id}`} initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -50}} transition={{duration: 0.3}}>
                                <h2 className="text-2xl font-bold mb-4 text-center text-text-primary">{currentTask.question}</h2>
                                <div className="space-y-3">
                                    {currentTask.options && Object.entries(currentTask.options).map(([key, value]) => (
                                        <div key={key} onClick={() => setSelectedAnswer(key)} className={`p-4 border rounded-lg transition-all text-center ${getOptionStyle(key)} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                            {value}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {stage === 'completed' && (
                             <motion.div key="completed" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="text-center">
                                <h2 className="text-3xl font-bold text-success">Все задания выполнены!</h2>
                                <p className="text-text-secondary mt-2">Вы готовы завершить урок.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            <footer className={`sticky bottom-0 p-4 border-t ${isAnswerChecked && !isAnswerCorrect ? 'bg-danger/20 border-danger' : 'bg-surface border-border'}`}>
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Button variant="secondary" onClick={handleBack} disabled={(stage === 'theory' && theoryStep === 0) || (stage === 'task' && isAnswerChecked)}>Назад</Button>
                    <div className="text-center h-6">
                        {isAnswerChecked && !isAnswerCorrect && <motion.p initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-danger font-bold">Попробуйте еще раз!</motion.p>}
                        {isAnswerChecked && isAnswerCorrect && <motion.p initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-success font-bold">Отлично!</motion.p>}
                    </div>
                    <Button onClick={handleFooterButtonClick} disabled={isLoading || (stage === 'task' && (!selectedAnswer || (isAnswerChecked && !isAnswerCorrect)))}>
                        {getFooterButtonText()}
                    </Button>
                </div>
            </footer>

            <Modal isOpen={showCompletionModal} onClose={() => navigate(`/courses/${courseId}`)} title="Урок пройден!">
                <div className="text-center py-4">
                    <p className="text-7xl mb-4">🎉</p>
                    <p className="text-text-primary text-lg">{completionMessage}</p>
                    <Button className="mt-6" onClick={() => navigate(`/courses/${courseId}`)}>Вернуться к курсу</Button>
                </div>
            </Modal>
        </div>
    );
};
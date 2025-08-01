import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { Modal } from '../shared/ui/Modal';
import { XCircleIcon, CheckCircleIcon, ArrowUturnLeftIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/solid';
import type { Lesson, Task } from '../shared/types/course';
import { completeLesson, checkAnswer, getCourseById } from '../shared/api/courses';
import { sendChallenge, submitChallengeResult } from '../shared/api/challenges';
import { useAuthStore } from '../stores/authStore';
import { TheoryBlock } from '../widgets/TheoryBlock/ui/TheoryBlock';
import { motion, AnimatePresence } from 'framer-motion';

import { MultipleChoiceTask } from '../features/tasks/ui/MultipleChoiceTask';
import { TextInputTask } from '../features/tasks/ui/TextInputTask';
import { CodeInputTask } from '../features/tasks/ui/CodeInputTask';
import { TrueFalseTask } from '../features/tasks/ui/TrueFalseTask';
import { FillInBlankTask } from '../features/tasks/ui/FillInBlankTask';
import { CodeConstructorTask } from '../features/tasks/ui/CodeConstructorTask';
import { SpeedTypingTask } from '../features/tasks/ui/SpeedTypingTask';

type LessonStage = 'theory' | 'task' | 'completed';

export const LessonPage = () => {
    const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const lessonFromState: Lesson | undefined = location.state?.lesson;
    const challengeId: number | undefined = location.state?.challengeId;

    const { user, refreshUserData, addCompletedLesson } = useAuthStore();
    
    const hasFullLessonData = lessonFromState && 'theory_content' in lessonFromState;
    const [lesson, setLesson] = useState<Lesson | null>(hasFullLessonData ? lessonFromState : null);
    const [pageIsLoading, setPageIsLoading] = useState(!hasFullLessonData);
    
    const [stage, setStage] = useState<LessonStage>('theory');
    const [theoryStep, setTheoryStep] = useState(0);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [correctAnswerFromAPI, setCorrectAnswerFromAPI] = useState<string|null>(null);
    
    const [apiIsLoading, setApiIsLoading] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");

    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
    const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);

    useEffect(() => {
        if (!hasFullLessonData && courseId && lessonId) {
            setPageIsLoading(true);
            const fetchLessonData = async () => {
                try {
                    const courseData = await getCourseById(courseId);
                    const foundLesson = courseData.skills.flatMap(skill => skill.lessons).find(l => l.id === Number(lessonId));
                    if (foundLesson) {
                        setLesson(foundLesson);
                    } else {
                        navigate(`/courses/${courseId}`);
                    }
                } catch (error) {
                    console.error("Failed to fetch lesson data on direct load", error);
                    navigate(`/courses/${courseId}`);
                } 
                finally {
                    setPageIsLoading(false);
                }
            };
            fetchLessonData();
        }
        
        if (challengeId) {
            setChallengeStartTime(Date.now());
        }
    }, [courseId, lessonId, hasFullLessonData, navigate, challengeId]);

    useEffect(() => {
        setIsAnswerChecked(false);
        setIsAnswerCorrect(false);
        setSelectedAnswer("");
        setCorrectAnswerFromAPI(null);
    }, [currentTaskIndex, theoryStep]);

    const totalTheorySteps = lesson?.theory_content?.length ?? 0;
    const totalTasks = lesson?.tasks?.length ?? 0;
    const currentTask = (lesson && lesson.tasks) ? lesson.tasks[currentTaskIndex] : undefined;

    const handleNext = async () => {
        if (stage === 'theory') {
            if (theoryStep < totalTheorySteps - 1) {
                setTheoryStep(p => p + 1);
            } else {
                setStage(totalTasks > 0 ? 'task' : 'completed');
            }
        } else if (stage === 'task' && isAnswerCorrect) {
            if (currentTaskIndex < totalTasks - 1) {
                setCurrentTaskIndex(p => p + 1);
            } else {
                setStage('completed');
                await handleCompleteLesson();
            }
        }
    };

    const handleBack = () => {
        if (stage === 'task' && currentTaskIndex === 0) {
            setStage('theory');
        } else if (stage === 'theory' && theoryStep > 0) {
            setTheoryStep(p => p - 1);
        }
    };

    const handleCheckAnswer = async () => {
        if (!selectedAnswer || !currentTask) return;
        setApiIsLoading(true);
        try {
            const response = await checkAnswer(currentTask.id, selectedAnswer);
            setIsAnswerChecked(true);
            setIsAnswerCorrect(response.is_correct);
            if (!response.is_correct) {
                setCorrectAnswerFromAPI(response.correct_answer ?? null);
            }
        } catch(e) { 
            console.error(e);
            alert("Ошибка при проверке ответа");
        } 
        finally { setApiIsLoading(false); }
    };
    
    const handleCompleteLesson = async () => {
        if (!lessonId) return;
        setApiIsLoading(true);
        try {
            if (challengeId && challengeStartTime) {
                const endTime = Date.now();
                const timeTaken = Math.round((endTime - challengeStartTime) / 1000);
                await submitChallengeResult(challengeId, timeTaken);
            }
            const response = await completeLesson(Number(lessonId));
            addCompletedLesson(Number(lessonId));
            await refreshUserData();
            setCompletionMessage(response.message);
            setShowCompletionModal(true);
        } catch (err: any) { 
            alert(err.response?.data?.message || 'Не удалось завершить урок'); 
        } 
        finally { setApiIsLoading(false); }
    };

    const handleTryAgain = () => {
        setIsAnswerChecked(false);
        setIsAnswerCorrect(false);
        setSelectedAnswer("");
        setCorrectAnswerFromAPI(null);
    };

    const handleSendChallenge = async () => {
        if (!selectedFriend || !lessonId) return;
        setApiIsLoading(true);
        try {
            await sendChallenge(selectedFriend, Number(lessonId));
            setShowChallengeModal(false);
            alert("Вызов успешно отправлен!");
        } catch (error) {
            console.error("Failed to send challenge", error);
            alert("Не удалось отправить вызов.");
        } finally {
            setApiIsLoading(false);
        }
    };

    const renderTaskInput = (task: Task) => {
        switch(task.task_type) {
            case 'multiple_choice': return <MultipleChoiceTask task={task} selectedAnswer={selectedAnswer} isAnswerChecked={isAnswerChecked} correctAnswer={correctAnswerFromAPI || task.correct_answer} onSelectAnswer={setSelectedAnswer} />;
            case 'text_input': return <TextInputTask isAnswerChecked={isAnswerChecked} onSelectAnswer={setSelectedAnswer} />;
            case 'code': return <CodeInputTask isAnswerChecked={isAnswerChecked} onSelectAnswer={setSelectedAnswer} initialValue={selectedAnswer || ''} />;
            case 'true_false': return <TrueFalseTask task={task} selectedAnswer={selectedAnswer} isAnswerChecked={isAnswerChecked} correctAnswer={correctAnswerFromAPI || task.correct_answer} onSelectAnswer={setSelectedAnswer} />;
            case 'fill_in_blank': return <FillInBlankTask task={task} isAnswerChecked={isAnswerChecked} onSelectAnswer={setSelectedAnswer} />;
            case 'constructor': return <CodeConstructorTask task={task} isAnswerChecked={isAnswerChecked} onSelectAnswer={setSelectedAnswer} />;
            case 'speed_typing': return <SpeedTypingTask task={task} onComplete={(isSuccess) => { setIsAnswerChecked(true); setIsAnswerCorrect(isSuccess); }} />;
            default: return <p>Неизвестный тип задания: {task.task_type}</p>;
        }
    };
    
    if (pageIsLoading || !lesson) {
        return <div className="flex items-center justify-center h-screen bg-background"><p>Загрузка урока...</p></div>;
    }

    const progressPercentage = stage === 'theory' 
        ? ((theoryStep + 1) / (totalTheorySteps + totalTasks)) * 100
        : ((totalTheorySteps + currentTaskIndex + (isAnswerChecked && isAnswerCorrect ? 1 : 0)) / (totalTheorySteps + totalTasks)) * 100;

    const getFooterButtonText = () => {
        if (stage === 'theory') return theoryStep < totalTheorySteps - 1 ? 'Далее' : (totalTasks > 0 ? 'К заданиям!' : 'Завершить урок');
        if (stage === 'task') {
            if (currentTask?.task_type === 'speed_typing') return isAnswerCorrect ? 'Далее' : 'Завершение...';
            if (isAnswerChecked && isAnswerCorrect) return currentTaskIndex < totalTasks - 1 ? 'Далее' : 'Завершить урок';
            return 'Проверить';
        }
        return 'Завершить';
    };
    
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
            <header className="p-4 flex items-center gap-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <Link to={`/courses/${courseId}`}><XCircleIcon className="h-8 w-8 text-text-secondary hover:text-white transition-colors" /></Link>
                <div className="w-full bg-surface rounded-full h-4 border border-border overflow-hidden">
                    <motion.div className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ ease: "easeOut", duration: 0.5 }} />
                </div>
                {user && user.friends.length > 0 && !challengeId && (<Button variant="secondary" className="!w-auto !px-3" onClick={() => setShowChallengeModal(true)}><SparklesIcon className="h-5 w-5" /></Button>)}
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-3xl">
                    <AnimatePresence mode="wait">
                        {stage === 'theory' && (<motion.div key={`theory-${theoryStep}`} initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -50}} transition={{duration: 0.3}}><h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-text-primary">{lesson.title}</h1><TheoryBlock blocks={lesson.theory_content} step={theoryStep} /></motion.div>)}
                        {stage === 'task' && currentTask && (<motion.div key={`task-${currentTask.id}`} initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -50}} transition={{duration: 0.3}}><h2 className="text-2xl font-bold mb-6 text-center text-text-primary">{currentTask.question}</h2>{renderTaskInput(currentTask)}</motion.div>)}
                        {stage === 'completed' && (<motion.div key="completed" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="text-center"><h2 className="text-3xl font-bold text-success">Все задания выполнены!</h2><p className="text-text-secondary mt-2">Вы готовы завершить урок.</p><Button className='mt-6 max-w-xs mx-auto' onClick={handleCompleteLesson} isLoading={apiIsLoading}>Завершить и получить награду</Button></motion.div>)}
                    </AnimatePresence>
                </div>
            </main>
            
            {stage !== 'completed' && (
                <footer className={`sticky bottom-0 p-4 border-t ${isAnswerChecked && !isAnswerCorrect ? 'bg-danger/20 border-danger' : (isAnswerChecked && isAnswerCorrect ? 'bg-success/10 border-success' : 'bg-surface border-border')}`}>
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <Button variant="secondary" onClick={handleBack} className="!w-auto" disabled={(stage === 'theory' && theoryStep === 0) || (stage === 'task' && isAnswerChecked)}> <ChevronLeftIcon className="h-5 w-5"/></Button>
                        <div className="text-center h-6">
                            {isAnswerChecked && !isAnswerCorrect && currentTask?.task_type !== 'speed_typing' && (<motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="flex justify-center"><Button onClick={handleTryAgain} variant="secondary" className="!w-auto !border-amber-500 !text-amber-500"><ArrowUturnLeftIcon className="h-5 w-5 mr-2" />Попробовать снова</Button></motion.div>)}
                            {isAnswerChecked && isAnswerCorrect && <motion.p initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-success font-bold">Правильно!</motion.p>}
                        </div>
                        <Button onClick={handleFooterButtonClick} className={`!w-auto ${isAnswerChecked && isAnswerCorrect ? '!bg-success hover:!bg-green-700' : ''}`} disabled={apiIsLoading || (stage === 'task' && ((!selectedAnswer && currentTask?.task_type !== 'speed_typing') || (isAnswerChecked && !isAnswerCorrect)))}>{getFooterButtonText()}<ChevronRightIcon className="h-5 w-5 ml-2"/></Button>
                    </div>
                </footer>
            )}

            <Modal isOpen={showCompletionModal} onClose={() => navigate(challengeId ? '/profile' : `/courses/${courseId}`)} title="Урок пройден!"><div className="text-center py-4"><p className="text-7xl mb-4">🎉</p><p className="text-text-primary text-lg">{completionMessage}</p><Button className="mt-6" onClick={() => navigate(challengeId ? '/profile' : `/courses/${courseId}`)}>{challengeId ? 'Вернуться к челленджам' : 'Вернуться к курсу'}</Button></div></Modal>
            <Modal isOpen={showChallengeModal} onClose={() => setShowChallengeModal(false)} title="Бросить вызов другу"><div className="py-2"><p className="text-text-secondary mb-4">Выберите друга, которому хотите отправить вызов по этому уроку.</p><select defaultValue="" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none" onChange={(e) => setSelectedFriend(Number(e.target.value))}><option value="" disabled>Выберите друга</option>{user?.friends.map(friend => (<option key={friend.id} value={friend.id}>{friend.username}</option>))}</select><Button className="mt-4" onClick={handleSendChallenge} disabled={!selectedFriend || apiIsLoading} isLoading={apiIsLoading}>Отправить вызов</Button></div></Modal>
        </div>
    );
};
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { ArrowLeftIcon, ClockIcon, QuestionMarkCircleIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Card } from '../shared/ui/Card';
import { getTestDetails, type TestDetails } from '../shared/api/testing';
import { useTransitionStore } from '../stores/transitionStore';

export const TestHubPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const startTransition = useTransitionStore(state => state.startTransition);
    
    const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            getTestDetails(courseId)
                .then(setTestDetails)
                .catch(err => {
                    console.error("Failed to load test details", err);
                    // Если тест не найден, можно перенаправить или показать ошибку здесь
                })
                .finally(() => setIsLoading(false));
        }
    }, [courseId]);

    const handleStartTest = () => {
        if (!courseId) return;
        
        // Запускаем переход и передаем ему коллбэк (функцию навигации),
        // который выполнится ПОСЛЕ завершения анимации.
        startTransition(() => {
            navigate(`/courses/${courseId}/test/session`);
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <p className="text-center text-text-secondary animate-pulse">Загрузка информации о тесте...</p>
            </div>
        );
    }

    if (!testDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
                <h1 className="text-2xl font-bold text-danger">Тест не найден</h1>
                <p className="text-text-secondary mt-2">К сожалению, для этого курса еще не создан сертификационный экзамен.</p>
                <Link to={`/courses/${courseId}`}>
                    <Button className="mt-6 !w-auto">Вернуться к курсу</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center">
                <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-primary font-semibold mb-8 hover:underline">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Вернуться к курсу
                </Link>
                <h1 className="text-4xl font-bold text-primary">{testDetails.title}</h1>
                <p className="text-lg text-text-secondary mt-4 max-w-xl mx-auto">
                    {testDetails.description}
                </p>
            </div>

            <Card className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center p-4">
                        <QuestionMarkCircleIcon className="h-10 w-10 text-primary" />
                        <p className="mt-2 font-bold text-lg text-text-primary">{testDetails.number_of_questions} вопросов</p>
                        <p className="text-sm text-text-secondary">случайно из банка</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <CheckBadgeIcon className="h-10 w-10 text-success" />
                        <p className="mt-2 font-bold text-lg text-text-primary">Проходной балл: {testDetails.passing_score}%</p>
                        <p className="text-sm text-text-secondary">{testDetails.required_correct_answers} правильных ответа</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <ClockIcon className="h-10 w-10 text-warning" />
                        <p className="mt-2 font-bold text-lg text-text-primary">Без лимита времени</p>
                        <p className="text-sm text-text-secondary">сосредоточьтесь на ответах</p>
                    </div>
                </div>
            </Card>
            
            <div className="mt-8 text-center">
                 <Button onClick={handleStartTest} className="text-lg px-8 py-4 max-w-xs mx-auto">
                    Начать тестирование
                </Button>
            </div>
        </div>
    );
};
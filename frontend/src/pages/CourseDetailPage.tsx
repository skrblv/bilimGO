import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../shared/api/courses';
import type { CourseDetail } from '../shared/types/course';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { SkillTree } from '../widgets/SkillTree/ui/SkillTree';

const CourseDetailPage = () => {
    // useParams всегда возвращает строку, поэтому мы можем быть в этом уверены
    const { id: courseIdParam } = useParams<{ id: string }>(); 
    
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Проверяем, что courseIdParam действительно есть
        if (!courseIdParam) {
            setError("ID курса не найден в URL.");
            setIsLoading(false);
            return;
        }

        const fetchCourse = async () => {
            try {
                // Устанавливаем isLoading в true в самом начале
                setIsLoading(true);
                const data = await getCourseById(courseIdParam);
                setCourse(data);
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить информацию о курсе.");
            } finally {
                // Устанавливаем isLoading в false в самом конце
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [courseIdParam]); // Зависимость - только ID из URL

    const LoadingSkeleton = () => (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
            <div className="h-6 w-32 bg-surface rounded-md mb-6"></div>
            <div className="h-48 bg-surface rounded-lg mb-12"></div>
            <div className="h-10 w-64 bg-surface rounded-md mb-6"></div>
            <div className="bg-surface border border-border rounded-lg p-8">
                <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0"></div>
                    <div className="pt-2 flex-grow">
                        <div className="h-8 w-1/2 bg-gray-700 rounded-md"></div>
                        <div className="mt-4 space-y-3">
                            <div className="h-12 w-full bg-gray-700 rounded-md"></div>
                            <div className="h-12 w-full bg-gray-700 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Пока идет загрузка, показываем скелетон
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Если произошла ошибка, показываем ее
    if (error) {
        return <p className="text-center text-danger p-10">{error}</p>;
    }

    // Если загрузка завершилась, но курса нет (например, 404 с бэкенда)
    if (!course) {
        return <p className="text-center p-10">Курс не найден или не удалось его загрузить.</p>;
    }

    // Если все хорошо, рендерим страницу
    const imageUrl = course.image_url || `https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1170&q=80`;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
             <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-primary font-semibold mb-6 hover:underline">
                <ArrowLeftIcon className="h-4 w-4" />
                Все курсы
            </Link>
            
            <header className="relative p-8 md:p-12 lg:p-16 rounded-lg overflow-hidden bg-surface mb-12">
                <div className="absolute inset-0 bg-black opacity-50 z-0">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">{course.title}</h1>
                    <p className="mt-4 max-w-2xl text-lg text-gray-200 drop-shadow-md mx-auto md:mx-0">{course.description}</p>
                </div>
            </header>

            <main>
                <h2 className="text-3xl font-bold text-primary mb-8">Дерево навыков</h2>
                <div className="bg-surface border border-border rounded-lg p-8">
                    {/* 
                      ФИНАЛЬНАЯ ПРОВЕРКА:
                      Мы рендерим SkillTree только если `course` и `course.id` существуют.
                      Это на 100% гарантирует, что `courseId` будет передан как число.
                    */}
                    {course && course.id ? (
                        <SkillTree skills={course.skills} courseId={course.id} />
                    ) : (
                        <p className="text-text-secondary text-center">Не удалось загрузить дерево навыков.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CourseDetailPage;
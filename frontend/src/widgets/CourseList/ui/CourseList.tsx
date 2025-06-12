import { useState, useEffect } from 'react';
import { getCourses } from '../../../shared/api/courses';
import type { Course } from '../../../shared/types/course';
import { CourseCard } from '../../../entities/course/ui/CourseCard';

const CourseCardSkeleton = () => (
    <div className="bg-surface border border-border rounded-lg p-6 md:p-8 animate-pulse">
        <div className="bg-gray-700 h-40 w-full rounded-t-lg -mt-6 -mx-6 md:-mx-8"></div>
        <div className="pt-6">
            <div className="h-6 w-3/4 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-700 rounded"></div>
        </div>
        <div className="mt-6 h-5 w-1/3 bg-gray-700 rounded ml-auto"></div>
    </div>
);

export const CourseList = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log(`%c[CourseList] Рендер. isLoading: ${isLoading}`, 'color: blue');

    useEffect(() => {
        console.log('%c[CourseList] useEffect сработал.', 'color: green');
        
        // Флаг для предотвращения двойного вызова в StrictMode
        let isMounted = true; 

        const fetchCourses = async () => {
            console.log('%c[CourseList] fetchCourses начался.', 'color: green');
            try {
                const data = await getCourses();
                console.log('%c[CourseList] Данные получены:', 'color: green', data);
                if (isMounted) {
                    setCourses(data);
                }
            } catch (err) {
                console.error('[CourseList] Ошибка при загрузке:', err);
                if (isMounted) {
                    setError("Не удалось загрузить курсы. Попробуйте позже.");
                }
            } finally {
                console.log('%c[CourseList] Блок finally сработал.', 'color: red');
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCourses();
        
        // Функция очистки для StrictMode
        return () => {
            console.log('%c[CourseList] useEffect очистка.', 'color: orange');
            isMounted = false;
        };
    }, []); // Пустой массив зависимостей, выполняется один раз

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-danger">{error}</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
};
import { Link } from 'react-router-dom';
import type { Course } from '../../../shared/types/course';
import { Card } from '../../../shared/ui/Card';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

interface CourseCardProps {
    course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    // --- ОТЛАДОЧНЫЙ ЛОГ ---
    console.log("CourseCard рендерится с данными:", course);
    if (!course || typeof course.id === 'undefined') {
        console.error("КРИТИЧЕСКАЯ ОШИБКА: в CourseCard не передан ID курса!", course);
        return <div className="text-danger">Ошибка загрузки карточки курса</div>;
    }
    // --- КОНЕЦ ОТЛАДКИ ---

    const imageUrl = course.image_url || `https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&w=1170&q=80`;

    return (
        <Link to={`/courses/${course.id}`} className="block group">
            <Card className="h-full flex flex-col transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
                <img src={imageUrl} alt={course.title} className="w-full h-40 object-cover rounded-t-lg -mt-6 -mx-6 md:-mx-8" />
                <div className="flex-grow pt-6">
                    <h3 className="text-xl font-bold text-text-primary mb-2">{course.title}</h3>
                    <p className="text-text-secondary text-sm line-clamp-3 flex-grow">{course.description}</p>
                </div>
                <div className="mt-4 flex justify-end items-center text-primary font-semibold text-sm">
                    Начать обучение
                    <ArrowRightIcon className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </Card>
        </Link>
    );
};
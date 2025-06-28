import { Link } from 'react-router-dom';
import type { LastCourseInfo } from '../../../shared/api/users';
import { Button } from '../../../shared/ui/Button';

export const ContinueLearning = ({ course }: { course: LastCourseInfo | null }) => {
    if (!course) {
        return (
            <div className="bg-surface p-6 rounded-lg border border-border text-center">
                <h3 className="text-xl font-bold text-text-primary">Добро пожаловать!</h3>
                <p className="text-text-secondary mt-2 mb-4">Начните свой путь в IT с выбора первого курса.</p>
                <Link to="/courses"><Button className="max-w-xs mx-auto">Выбрать курс</Button></Link>
            </div>
        );
    }

    return (
        <div className="bg-surface p-6 rounded-lg border border-border">
            <p className="text-sm text-text-secondary">Продолжить обучение</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{course.title}</h3>
            <div className="w-full bg-background rounded-full h-2 my-4 border border-border">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${course.percentage}%` }}></div>
            </div>
            <Link to={`/courses/${course.id}`}><Button>Продолжить</Button></Link>
        </div>
    );
};
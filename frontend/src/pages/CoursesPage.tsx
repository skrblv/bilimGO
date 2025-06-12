import { CourseList } from '../widgets/CourseList/ui/CourseList';

const CoursesPage = () => {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-primary tracking-tight">Направления</h1>
                <p className="mt-2 text-lg text-text-secondary">Выберите путь, который приведет вас к цели.</p>
            </header>
            <main>
                <CourseList />
            </main>
        </div>
    );
};

export default CoursesPage;
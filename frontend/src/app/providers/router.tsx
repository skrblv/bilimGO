import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import ProfilePage from '../../pages/ProfilePage';
import CoursesPage from '../../pages/CoursesPage';
import CourseDetailPage from '../../pages/CourseDetailPage';
import LeaderboardPage from '../../pages/LeaderboardPage';
import FindFriendsPage from '../../pages/FindFriendsPage';
import ProfileEditPage from '../../pages/ProfileEditPage';
import { LessonPage } from '../../pages/LessonPage';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';

// Компонент-обертка для проверки статуса аутентификации
const AppGate = () => {
    const { isInitialized, initialize } = useAuthStore();
    
    useEffect(() => {
        // Запускаем инициализацию только один раз при старте приложения
        initialize();
    }, [initialize]); // Пустая зависимость не нужна, initialize стабильна
    
    // Пока идет проверка, показываем глобальный лоадер
    if (!isInitialized) {
        return <div className="flex items-center justify-center h-screen"><p>Загрузка приложения...</p></div>;
    }

    return <RouterProvider router={router} />;
}

// Компонент-обертка для защищенных роутов
const PrivateRouteWrapper = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();
    
    if (!isAuthenticated) {
        // Если не залогинен, перенаправляем на страницу входа, запомнив, откуда пришли
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Если залогинен, показываем основной Layout, в который будут вставляться дочерние страницы
    return <MainLayout />;
};

const router = createBrowserRouter([
    // --- ПУБЛИЧНЫЕ РОУТЫ ---
    // Эти роуты не используют MainLayout и не требуют логина
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    
    // --- ПРИВАТНЫЕ РОУТЫ ---
    // Все роуты внутри этого блока будут защищены и будут использовать MainLayout
    {
        path: '/',
        element: <PrivateRouteWrapper />,
        children: [
            // Главная страница после логина (редирект на курсы)
            { index: true, element: <Navigate to="/courses" replace /> }, 
            
            // Основные страницы
            { path: 'courses', element: <CoursesPage /> },
            // ВАЖНЫЙ РОУТ: здесь мы объявляем параметр :id
            { path: 'courses/:id', element: <CourseDetailPage /> }, 
            { path: 'courses/:courseId/lessons/:lessonId', element: <LessonPage /> },
            { path: 'leaderboard', element: <LeaderboardPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profile/edit', element: <ProfileEditPage /> },
            { path: 'friends/find', element: <FindFriendsPage /> },
        ]
    },

    // --- ОБРАБОТКА НЕИЗВЕСТНЫХ URL ---
    // Если пользователь ввел что-то несуществующее, перенаправляем его на главную
    { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter = () => {
    return <AppGate />;
};
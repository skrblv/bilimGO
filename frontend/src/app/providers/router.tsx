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

// Компонент-обертка для проверки статуса аутентификации при старте
const AppGate = () => {
    const { isInitialized, initialize } = useAuthStore();
    
    useEffect(() => {
        initialize();
    }, [initialize]);
    
    if (!isInitialized) {
        return <div className="flex items-center justify-center h-screen bg-background"><p>Загрузка приложения...</p></div>;
    }

    return <RouterProvider router={router} />;
}

// Компонент-обертка для защищенных роутов, которые используют MainLayout
const PrivateRouteWrapper = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return <MainLayout />;
};

// Компонент-обертка для защищенных роутов, которые НЕ используют MainLayout
const PrivateRouteStandalone = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const router = createBrowserRouter([
    // --- ПУБЛИЧНЫЕ РОУТЫ ---
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    
    // --- ПРИВАТНЫЕ РОУТЫ С ОБЩИМ НАВБАРОМ ---
    {
        path: '/',
        element: <PrivateRouteWrapper />,
        children: [
            { index: true, element: <Navigate to="/courses" replace /> }, 
            { path: 'courses', element: <CoursesPage /> },
            { path: 'courses/:id', element: <CourseDetailPage /> },
            { path: 'leaderboard', element: <LeaderboardPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profile/edit', element: <ProfileEditPage /> },
            { path: 'friends/find', element: <FindFriendsPage /> },
        ]
    },

    // --- ОТДЕЛЬНЫЙ РОУТ ДЛЯ СТРАНИЦЫ УРОКА (РЕЖИМ ПОГРУЖЕНИЯ) ---
    {
        path: '/courses/:courseId/lessons/:lessonId',
        element: (
            <PrivateRouteStandalone>
                <LessonPage />
            </PrivateRouteStandalone>
        )
    },

    // --- ОБРАБОТКА НЕИЗВЕСТНЫХ URL ---
    { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter = () => {
    return <AppGate />;
};
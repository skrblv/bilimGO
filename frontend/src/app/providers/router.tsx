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
import UserProfilePage from '../../pages/UserProfilePage';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../../pages/DashboardPage'; // <-- Импорт


const AppGate = () => {
    const { isInitialized, initialize } = useAuthStore();
    useEffect(() => { initialize(); }, [initialize]);
    if (!isInitialized) {
        return <div className="flex items-center justify-center h-screen bg-background"><p>Загрузка приложения...</p></div>;
    }
    return <RouterProvider router={router} />;
}

const PrivateRouteWrapper = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <MainLayout />;
};

const PrivateRouteStandalone = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
};

const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    {
        path: '/',
        element: <PrivateRouteWrapper />,
        children: [
            { index: true, element: <DashboardPage /> },
            { index: true, element: <Navigate to="/courses" replace /> }, 
            { path: 'courses', element: <CoursesPage /> },
            { path: 'courses/:id', element: <CourseDetailPage /> },
            { path: 'leaderboard', element: <LeaderboardPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profile/edit', element: <ProfileEditPage /> },
            { path: 'friends/find', element: <FindFriendsPage /> },
            { path: 'users/:id', element: <UserProfilePage /> },
        ]
    },
    {
        path: '/courses/:courseId/lessons/:lessonId',
        element: (
            <PrivateRouteStandalone>
                <LessonPage />
            </PrivateRouteStandalone>
        )
    },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter = () => {
    return <AppGate />;
};
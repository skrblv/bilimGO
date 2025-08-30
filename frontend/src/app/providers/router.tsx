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
import { DashboardPage } from '../../pages/DashboardPage';
import { TestHubPage } from '../../pages/TestHubPage';
import { TestSessionPage } from '../../pages/TestSessionPage';
import { TestResultPage } from '../../pages/TestResultPage';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';

const AppGate = () => {
    const { isInitialized, initialize } = useAuthStore();
    useEffect(() => { initialize(); }, [initialize]);
    if (!isInitialized) {
        return <div className="flex items-center justify-center h-screen bg-background"><p>Загрузка приложения...</p></div>;
    }
    return <RouterProvider router={router} />;
};

const PrivateRouteWrapper = ({ children }: { children: React.ReactNode }) => {
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
        element: <PrivateRouteWrapper><MainLayout /></PrivateRouteWrapper>,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'courses', element: <CoursesPage /> },
            { path: 'courses/:id', element: <CourseDetailPage /> },
            { path: 'leaderboard', element: <LeaderboardPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profile/edit', element: <ProfileEditPage /> },
            { path: 'friends/find', element: <FindFriendsPage /> },
            { path: 'users/:id', element: <UserProfilePage /> },
            { path: 'courses/:courseId/test', element: <TestHubPage /> },
            { path: 'courses/:courseId/test/result', element: <TestResultPage /> },
        ]
    },
    {
        path: '/courses/:courseId/lessons/:lessonId',
        element: <PrivateRouteWrapper><LessonPage /></PrivateRouteWrapper>
    },
    {
        path: '/courses/:courseId/test/session',
        element: <PrivateRouteWrapper><TestSessionPage /></PrivateRouteWrapper>
    },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter = () => {
    return <AppGate />;
};
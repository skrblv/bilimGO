import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../shared/api/axios';
// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
// Добавляем импорт типа 'User'
import type { User, UserBadge, Friend } from '../shared/types/course';

// Интерфейс для локального прогресса
interface UserProgress {
    completedLessons: number[];
}

// Интерфейс для всего хранилища
interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null; // Этот тип теперь импортирован
    progress: UserProgress;
    isAuthenticated: boolean;
    isInitialized: boolean;

    login: (tokens: { access: string; refresh: string }) => Promise<void>;
    logout: () => void;
    initialize: () => Promise<void>;
    addCompletedLesson: (lessonId: number) => void;
    refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Начальное состояние
            accessToken: null,
            refreshToken: null,
            user: null,
            progress: { completedLessons: [] },
            isAuthenticated: false,
            isInitialized: false,

            // Метод для входа в систему
            login: async (tokens: { access: string; refresh: string }) => {
                set({ accessToken: tokens.access, refreshToken: tokens.refresh });
                await get().initialize();
            },

            // Метод для выхода из системы
            logout: () => {
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                    isInitialized: true,
                    progress: { completedLessons: [] }
                });
            },
            
            // Метод для проверки токена и инициализации состояния при загрузке приложения
            initialize: async () => {
                const token = get().accessToken;
                if (!token) {
                    set({ isInitialized: true, isAuthenticated: false });
                    return;
                }
                
                try {
                    const response = await apiClient.get<User>('auth/users/me/');
                    const userData = response.data;
                    
                    if (userData.avatar) {
                        userData.avatar = `${userData.avatar}?t=${new Date().getTime()}`;
                    }

                    set({ 
                        user: userData, 
                        isAuthenticated: true, 
                        isInitialized: true 
                    });
                } catch (error) {
                    console.error("Token is invalid, logging out.", error);
                    get().logout();
                }
            },
            
            // Метод для принудительного обновления данных пользователя с сервера
            refreshUserData: async () => {
                 if (!get().isAuthenticated) return;
                try {
                    const response = await apiClient.get<User>('auth/users/me/');
                    const userData = response.data;
                    
                    if (userData.avatar) {
                        userData.avatar = `${userData.avatar}?t=${new Date().getTime()}`;
                    }
                    
                    set({ user: userData });
                } catch (error) {
                    console.error("Could not refresh user data", error);
                }
            },
            
            // Метод для локального добавления ID пройденного урока
            addCompletedLesson: (lessonId: number) => {
                set(state => ({
                    progress: {
                        ...state.progress,
                        completedLessons: Array.from(new Set([...state.progress.completedLessons, lessonId]))
                    }
                }));
            },
        }),
        {
            // Настройки для сохранения в localStorage
            name: 'auth-storage',
        }
    )
);
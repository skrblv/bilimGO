import apiClient from "./axios";
import type { UserBadge, Friendship, Friend } from "../types/course";

// Этот тип остается для таблицы лидеров
export interface LeaderboardUser {
    id: number;
    username: string;
    avatar?: string;
    xp: number;
    user_badges: UserBadge[];
}

// Этот тип мы используем для друзей и для поиска
export type { Friend }; 

export interface FriendRequestsResponse {
    incoming: Friendship[];
    outgoing: Friendship[];
}

export interface ProfileUpdateData {
    username?: string;
    avatar?: File;
}

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
    const response = await apiClient.get<LeaderboardUser[]>('/users/leaderboard/');
    return response.data;
};

// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
// Функция теперь обещает вернуть массив Friend[]
export const searchUsers = async (query: string): Promise<Friend[]> => {
    // И мы указываем, что ожидаем получить Friend[] от API
    const response = await apiClient.get<Friend[]>(`/users/search/?search=${query}`);
    return response.data;
};

export const sendFriendRequest = async (userId: number): Promise<Friendship> => {
    const response = await apiClient.post<Friendship>('/users/friendship/send_request/', { to_user_id: userId });
    return response.data;
};

export const getFriendRequests = async (): Promise<FriendRequestsResponse> => {
    const response = await apiClient.get<FriendRequestsResponse>('/users/friendship/requests/');
    return response.data;
};

export const acceptFriendRequest = async (requestId: number): Promise<Friendship> => {
    const response = await apiClient.post<Friendship>(`/users/friendship/${requestId}/accept/`);
    return response.data;
};

export const declineFriendRequest = async (requestId: number): Promise<void> => {
    await apiClient.post(`/users/friendship/${requestId}/decline/`);
};

export const removeFriend = async (userId: number): Promise<void> => {
    await apiClient.post(`/users/friendship/remove/${userId}/`);
};

// Полный тип User для обновления профиля
export interface User {
    id: number; email: string; username: string; avatar?: string; xp: number; streak: number; last_activity_date: string | null; user_badges: UserBadge[]; friends: Friend[];
}
export const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
    const formData = new FormData();
    if (data.username) { formData.append('username', data.username); }
    if (data.avatar) { formData.append('avatar', data.avatar); }
    const response = await apiClient.patch<User>('/auth/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data', },
    });
    return response.data;
};
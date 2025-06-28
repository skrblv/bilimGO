import apiClient from "./axios";
import type { User, UserBadge, Friendship, Friend, UserProfile, LeaderboardUser } from "../types/course";

export type { UserProfile, Friend, Friendship, User, LeaderboardUser };
// ... (все импорты)

// ... (все другие интерфейсы)

// --- НОВЫЕ ТИПЫ ДЛЯ ДАШБОРДА ---
export interface LastCourseInfo {
    id: number;
    title: string;
    image_url: string | null;
    percentage: number;
}

export interface DashboardData {
    last_course: LastCourseInfo | null;
    leaderboard_top: LeaderboardUser[];
    user_rank: number;
}

// --- НОВАЯ ФУНКЦИЯ ---
export const getDashboardData = async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/users/dashboard/');
    return response.data;
}

// ... (остальные функции)

export interface FriendRequestsResponse {
    incoming: Friendship[];
    outgoing: Friendship[];
}

export interface ProfileUpdateData {
    username?: string;
    avatar?: File;
}

export interface RadarStat {
    name: string;
    value: number;
}
export type HeatmapStat = [string, number];

export interface CourseProgressStat {
    id: number;
    title: string;
    completed: number;
    total: number;
    percentage: number;
    xp_earned: number;
}

export interface UserStats {
    radar_chart: RadarStat[];
    heatmap: HeatmapStat[];
    courses_progress: CourseProgressStat[];
}

export const getLeaderboard = async (): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[]>('/users/leaderboard/');
    return response.data;
};

export const searchUsers = async (query: string): Promise<Friend[]> => {
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

export const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
    const formData = new FormData();
    if (data.username) { formData.append('username', data.username); }
    if (data.avatar) { formData.append('avatar', data.avatar); }
    const response = await apiClient.patch<User>('/auth/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data', },
    });
    return response.data;
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/${userId}/`);
    return response.data;
};

export const getMyStats = async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>('/users/me/stats/');
    return response.data;
};
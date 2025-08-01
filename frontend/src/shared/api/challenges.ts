import apiClient from "./axios";
import type { Challenge } from "../types/course";

// Получить все свои челленджи (входящие, исходящие, активные)
export const getMyChallenges = async (): Promise<Challenge[]> => {
    const response = await apiClient.get<Challenge[]>('/challenges/');
    return response.data;
};

// Отправить вызов
export const sendChallenge = async (receiverId: number, lessonId: number): Promise<Challenge> => {
    const response = await apiClient.post<Challenge>('/challenges/', {
        receiver_id: receiverId,
        lesson_id: lessonId,
    });
    return response.data;
};

// Принять вызов
export const acceptChallenge = async (challengeId: number): Promise<Challenge> => {
    const response = await apiClient.post<Challenge>(`/challenges/${challengeId}/accept/`);
    return response.data;
};

// Отклонить вызов
export const declineChallenge = async (challengeId: number): Promise<Challenge> => {
    const response = await apiClient.post<Challenge>(`/challenges/${challengeId}/decline/`);
    return response.data;
};

// Отправить результат
export const submitChallengeResult = async (challengeId: number, timeTaken: number): Promise<Challenge> => {
    const response = await apiClient.post<Challenge>(`/challenges/${challengeId}/submit_result/`, {
        time_taken: timeTaken
    });
    return response.data;
};
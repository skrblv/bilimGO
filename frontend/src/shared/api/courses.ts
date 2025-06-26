import apiClient from "./axios";
import type { Course, CourseDetail } from "../types/course";

interface LessonCompletionResponse {
    message: string;
    xp_earned: number;
    new_badges_count: number;
}

interface HintResponse {
    hint: { text: string };
    message: string;
}

interface AnswerCheckResponse {
    is_correct: boolean;
    correct_answer?: string;
}

export const getCourses = async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses/');
    return response.data;
};

export const getCourseById = async (id: string): Promise<CourseDetail> => {
    const response = await apiClient.get<CourseDetail>(`/courses/${id}/`);
    return response.data;
};

export const completeLesson = async (lessonId: number): Promise<LessonCompletionResponse> => {
    const response = await apiClient.post<LessonCompletionResponse>('/lessons/complete/', { lesson_id: lessonId });
    return response.data;
};

export const requestHint = async (taskId: number): Promise<HintResponse> => {
    const response = await apiClient.post<HintResponse>(`/tasks/request_hint/`, { task_id: taskId });
    return response.data;
}

export const checkAnswer = async (taskId: number, answer: string): Promise<AnswerCheckResponse> => {
    const response = await apiClient.post<AnswerCheckResponse>(`/tasks/check_answer/`, { task_id: taskId, answer: answer });
    return response.data;
}

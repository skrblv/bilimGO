import apiClient from "./axios";
import type { Task } from "../types/course"; // Переиспользуем тип Task

// Вопросы, которые приходят с бэкенда (без ответов)
export type TestQuestion = Omit<Task, 'correct_answer'>;
export interface TestDetails {
    id: number;
    title: string;
    description: string;
    number_of_questions: number;
    passing_score: number;
    required_correct_answers: number;
}

// Ответ сервера при старте теста
export interface StartTestResponse {
    attempt_id: number;
    questions: TestQuestion[];
}

// Ответ, который мы отправляем на сервер
export interface UserAnswer {
    question_id: number;
    answer: string;
}

// Результат теста, который приходит с сервера
export interface TestResult {
    id: number;
    score: number;
    is_passed: boolean;
    end_time: string;
}

// Начать новую попытку теста
export const startTest = async (courseId: number): Promise<StartTestResponse> => {
    const response = await apiClient.post<StartTestResponse>('/testing/session/', { course_id: courseId });
    return response.data;
};

// Завершить и отправить ответы
export const submitTest = async (attemptId: number, answers: UserAnswer[]): Promise<TestResult> => {
    const response = await apiClient.put<TestResult>('/testing/session/', {
        attempt_id: attemptId,
        answers: answers
    });
    return response.data;
};
export const getTestDetails = async (courseId: string): Promise<TestDetails> => {
    const response = await apiClient.get<TestDetails>(`/testing/details/${courseId}/`);
    return response.data;
};
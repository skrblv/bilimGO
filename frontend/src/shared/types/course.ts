// --- Типы для заданий и подсказок ---

export interface Hint {
    id: number;
    text: string;
    xp_penalty: number;
}

export type MultipleChoiceOptions = Record<string, string>;
export type ConstructorOptions = { options: string[] };

export interface Task {
    id: number;
    task_type: string;
    question: string;
    options: MultipleChoiceOptions | ConstructorOptions | null;
    correct_answer: string;
    code_template?: string | null;
    time_limit?: number | null;
    hints: Hint[];
}

// --- Типы для контента урока ---

export interface ContentBlock {
    type: 'text' | 'code' | 'image';
    content: string;
    language?: string;
    url?: string;
    caption?: string;
}

export interface Lesson {
    id: number;
    title: string;
    theory_content: ContentBlock[];
    xp_reward: number;
    tasks: Task[];
}

// --- Типы для структуры курса ---

export interface Skill {
    id: number;
    title: string;
    children: Skill[];
    lessons: Lesson[];
}

export interface Course {
    id: number;
    title: string;
    description: string;
    image_url: string | null;
}

export interface CourseDetail extends Course {
    skills: Skill[];
}

// --- Типы для наград и геймификации ---

export interface Badge {
    id: number;
    title: string;
    description: string;
    image_url: string;
    code: string;
}

export interface UserBadge {
    badge: Badge;
    awarded_at: string;
}

// --- Типы для пользователей и социальных функций ---

export interface Friend {
    id: number;
    username: string;
    avatar?: string;
    xp: number;
    friendship_status: 'not_friends' | 'friends' | 'request_sent' | 'request_received' | 'self' | null;
}

export interface Friendship {
    id: number;
    from_user: Friend;
    to_user: Friend;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    created_at: string;
}

// Полный тип для залогиненного пользователя (в authStore)
export interface User {
    id: number;
    email: string;
    username: string;
    avatar?: string;
    xp: number;
    streak: number;
    last_activity_date: string | null;
    user_badges: UserBadge[];
    friends: Friend[];
}

// Тип для публичного профиля
export interface UserProfile {
    id: number;
    username: string;
    avatar?: string;
    xp: number;
    streak: number;
    last_activity_date: string | null;
    user_badges: UserBadge[];
    friends_count: number;
    friendship_status: 'not_friends' | 'friends' | 'request_sent' | 'request_received' | 'self' | null;
}

// Тип для таблицы лидеров (может быть таким же как Friend, но лучше выделить)
export interface LeaderboardUser extends Friend {
    user_badges: UserBadge[];
}
// --- Типы для заданий и подсказок ---

export interface Hint {
    id: number;
    text: string;
    xp_penalty: number;
}

export interface Task {
    id: number;
    task_type: string;
    question: string;
    options: Record<string, string> | null;
    correct_answer: string;
    hints: Hint[];
}

// --- Типы для контента урока ---

// Блок контента для пошаговой теории
export interface ContentBlock {
    type: 'text' | 'code' | 'image';
    content: string;
    language?: string;
    url?: string;
    caption?: string;
}

// Урок
export interface Lesson {
    id: number;
    title: string;
    theory_content: ContentBlock[]; // Используем структурированную теорию
    xp_reward: number;
    tasks: Task[];
}

// --- Типы для структуры курса ---

// Навык
export interface Skill {
    id: number;
    title: string;
    children: Skill[];
    lessons: Lesson[];
}

// Курс (в списке)
export interface Course {
    id: number;
    title: string;
    description: string;
    image_url: string | null;
}

// Детальная информация о курсе
export interface CourseDetail extends Course {
    skills: Skill[];
}

// --- Типы для наград и геймификации ---

// Бейдж
export interface Badge {
    id: number;
    title: string;
    description: string;
    image_url: string;
    code: string;
}

// Связь "Пользователь-Бейдж"
export interface UserBadge {
    badge: Badge;
    awarded_at: string;
}

// --- Типы для социальных функций ---

// Друг (или пользователь в поиске)
export interface Friend {
    id: number;
    username: string;
    avatar?: string;
    xp: number;
    friendship_status: 'not_friends' | 'friends' | 'request_sent' | 'request_received' | 'self' | null;
}

// Связь "Дружба" (запрос)
export interface Friendship {
    id: number;
    from_user: Friend;
    to_user: Friend;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    created_at: string;
}
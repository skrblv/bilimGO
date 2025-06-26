// --- Типы для заданий и подсказок ---

export interface Hint {
    id: number;
    text: string;
    xp_penalty: number;
}

// export interface Hint { id: number; text: string; xp_penalty: number; }

export type MultipleChoiceOptions = Record<string, string>;
export type ConstructorOptions = { options: string[] };

export interface Task {
    id: number;
    task_type: string;
    question: string;
    options: MultipleChoiceOptions | ConstructorOptions | null;
    correct_answer: string;
    code_template?: string | null;
    time_limit?: number | null; // <-- ДОБАВЛЯЕМ ЭТО ПОЛЕ
    hints: Hint[];
}

// --- Типы для контента урока ---

export interface ContentBlock {
    type: 'text' | 'code' | 'image' | 'details' | 'alert' | 'divider';
    content: string;
    language?: string;
    url?: string;
    caption?: string;
    summary?: string;
    style?: 'info' | 'success' | 'warning' | 'danger';
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

// --- Типы для социальных функций ---

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
// ... (все предыдущие типы)
// --- НОВЫЙ ТИП ДЛЯ ДЕТАЛЬНОГО ПРОФИЛЯ ---
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
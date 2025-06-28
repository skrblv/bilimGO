import { useAuthStore } from '../../../stores/authStore';
import { FireIcon } from '@heroicons/react/24/solid';

export const StreakWidget = () => {
    const user = useAuthStore(state => state.user);
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const isStreakActiveToday = user.last_activity_date === today;
    const streakColor = user.streak > 0 && isStreakActiveToday ? 'text-orange-400' : 'text-text-secondary';

    return (
        <div className="bg-surface p-6 rounded-lg border border-border text-center">
            <p className="text-sm text-text-secondary">Ударный режим</p>
            <div className={`flex items-center justify-center gap-2 my-2 ${streakColor}`}>
                <FireIcon className="h-10 w-10" />
                <span className="text-5xl font-bold">{user.streak}</span>
            </div>
            <p className="text-xs text-text-secondary">
                {user.streak > 0 ? (isStreakActiveToday ? "Вы в ударе! Так держать!" : "Пройдите урок сегодня, чтобы сохранить серию.") : "Пройдите урок, чтобы начать!"}
            </p>
        </div>
    );
};
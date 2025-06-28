import { useState, useEffect } from "react";
import { getDashboardData, type DashboardData } from "../shared/api/users";
import { ContinueLearning } from "../widgets/ContinueLearning/ui/ContinueLearning";
import { StreakWidget } from "../widgets/StreakWidget/ui/StreakWidget";
import { MiniLeaderboard } from "../widgets/MiniLeaderboard/ui/MiniLeaderboard";
import { useAuthStore } from "../stores/authStore";

export const DashboardPage = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        getDashboardData()
            .then(setData)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <div className="text-center p-10">Загрузка дашборда...</div>;
    }

    if (!data) {
        return <div className="text-center p-10 text-danger">Не удалось загрузить данные.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-text-primary">Добро пожаловать, <span className="text-primary">{user?.username}!</span></h1>
                <p className="mt-2 text-lg text-text-secondary">Готовы к новым знаниям сегодня?</p>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ContinueLearning course={data.last_course} />
                    <MiniLeaderboard topUsers={data.leaderboard_top} userRank={data.user_rank} />
                </div>
                <div className="space-y-8">
                    <StreakWidget />
                    {/* Здесь можно добавить другие виджеты, например "Ваши друзья сейчас онлайн" */}
                </div>
            </main>
        </div>
    );
};
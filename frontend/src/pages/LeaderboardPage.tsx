import { Leaderboard } from "../widgets/Leaderboard/ui/Leaderboard";

const LeaderboardPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary tracking-tight">Таблица лидеров</h1>
                <p className="mt-2 text-lg text-text-secondary">Лучшие из лучших на платформе.</p>
            </header>
            <main>
                <Leaderboard />
            </main>
        </div>
    );
};

export default LeaderboardPage;
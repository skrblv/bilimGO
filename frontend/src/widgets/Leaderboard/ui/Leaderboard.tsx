import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardUser } from "../../../shared/api/users";
import { useAuthStore } from "../../../stores/authStore";
import { StarIcon } from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';

const LeaderboardRow = ({ user, rank }: { user: LeaderboardUser, rank: number }) => {
    const currentUser = useAuthStore((state) => state.user);
    const isCurrentUser = currentUser?.id === user.id;

    const rankColors: { [key: number]: string } = {
        1: 'bg-amber-400 text-amber-900',
        2: 'bg-slate-400 text-slate-900',
        3: 'bg-amber-600 text-amber-100',
    };
    const rankColor = rankColors[rank] || 'bg-surface text-text-secondary';
    
    return (
        <tr className={`border-b border-border transition-colors ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-surface'}`}>
            <td className="p-4 text-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankColor}`}>
                    {rank <= 3 ? <StarIcon className="h-5 w-5" /> : rank}
                </span>
            </td>
            <td className="p-4">
                <Link to={`/users/${user.id}`} className="flex items-center gap-4 group">
                    <img 
                        src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} 
                        alt={user.username}
                        className="w-12 h-12 rounded-full border-2 border-border group-hover:border-primary transition-colors"
                    />
                    <div>
                        <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{user.username}</p>
                        <p className="text-sm text-text-secondary">{user.user_badges.length} наград</p>
                    </div>
                </Link>
            </td>
            <td className="p-4 text-right">
                <p className="font-bold text-lg text-primary">{user.xp.toLocaleString('ru-RU')} XP</p>
            </td>
        </tr>
    );
}

export const Leaderboard = () => {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                const data = await getLeaderboard();
                setUsers(data);
            } catch (err) {
                setError("Не удалось загрузить таблицу лидеров.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (isLoading) {
        return <div className="text-center p-10">Загрузка лидеров...</div>
    }

    if (error) {
        return <p className="text-center text-danger p-10">{error}</p>;
    }

    return (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-background text-left text-sm text-text-secondary uppercase">
                    <tr>
                        <th className="p-4 w-20 text-center">Место</th>
                        <th className="p-4">Пользователь</th>
                        <th className="p-4 text-right">Опыт</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <LeaderboardRow key={user.id} user={user} rank={index + 1} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
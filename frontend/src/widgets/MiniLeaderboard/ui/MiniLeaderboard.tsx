import { Link } from 'react-router-dom';
import type { LeaderboardUser } from '../../../shared/api/users';
import { TrophyIcon } from '@heroicons/react/24/solid';

export const MiniLeaderboard = ({ topUsers, userRank }: { topUsers: LeaderboardUser[], userRank: number }) => {
    return (
        <div className="bg-surface p-6 rounded-lg border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Таблица лидеров</h3>
            <div className="space-y-3">
                {topUsers.map((user, index) => (
                    <Link to={`/users/${user.id}`} key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-background">
                        <span className="font-bold w-6 text-center text-text-secondary">{index + 1}</span>
                        <img src={user.avatar || `...`} alt={user.username} className="w-8 h-8 rounded-full" />
                        <span className="text-text-primary font-semibold">{user.username}</span>
                        <span className="ml-auto text-primary font-bold">{user.xp} XP</span>
                    </Link>
                ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 text-center">
                <p className="text-sm text-text-secondary">Вы на <span className="font-bold text-primary">{userRank}-м</span> месте!</p>
                <Link to="/leaderboard" className="text-sm text-primary hover:underline mt-2 inline-block">Вся таблица</Link>
            </div>
        </div>
    );
};
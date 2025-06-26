import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserProfile, sendFriendRequest, removeFriend } from '../shared/api/users';
import type { UserProfile } from '../shared/types/course';
import { Button } from '../shared/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon, FireIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { BadgeCard } from '../entities/badge/ui/BadgeCard';

const StatCard = ({ label, value, icon: Icon }: {label: string, value: string | number, icon: React.FC<any>}) => (
    <div className="bg-background p-4 rounded-lg flex flex-col items-center justify-center text-center border border-border">
        <Icon className="h-6 w-6 text-primary mb-1" />
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary uppercase tracking-wide">{label}</p>
    </div>
);

const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const { user: currentUser, refreshUserData } = useAuthStore();
    const navigate = useNavigate();

    const fetchProfile = async (userId: number) => {
        setIsLoading(true);
        try {
            const data = await getUserProfile(userId);
            setProfile(data);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const userId = Number(id);
        if (isNaN(userId)) {
            navigate('/leaderboard');
            return;
        }
        
        if (userId === currentUser?.id) {
            navigate('/profile', { replace: true });
            return;
        }

        fetchProfile(userId);
    }, [id, currentUser, navigate]);

    const handleFriendAction = async () => {
        if (!profile) return;
        setActionLoading(true);
        try {
            if (profile.friendship_status === 'not_friends') {
                await sendFriendRequest(profile.id);
            } else if (profile.friendship_status === 'friends') {
                await removeFriend(profile.id);
            }
            
            await refreshUserData();
            await fetchProfile(profile.id);

        } catch (error) {
            console.error("Friend action failed", error);
        } finally {
            setActionLoading(false);
        }
    };

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    const renderFriendButton = (): React.ReactNode => {
        if (!profile) return null;

        switch (profile.friendship_status) {
            case 'not_friends':
                return <Button onClick={handleFriendAction} isLoading={actionLoading} className="w-full"><UserPlusIcon className="h-5 w-5 mr-2" />Добавить в друзья</Button>;
            case 'friends':
                return <Button onClick={handleFriendAction} isLoading={actionLoading} variant="secondary" className="w-full"><UserMinusIcon className="h-5 w-5 mr-2" />Удалить из друзей</Button>;
            case 'request_sent':
                return <Button className="w-full" disabled>Запрос отправлен</Button>;
            case 'request_received':
                return <Link to="/profile"><Button as="span" variant="secondary" className="w-full">Ответить на запрос</Button></Link>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Загрузка профиля...</div>;
    }
    
    if (!profile) {
        return <div className="text-center p-10">Пользователь не найден.</div>;
    }

    const today = new Date().toISOString().split('T')[0];
    const isStreakActiveToday = profile.last_activity_date === today;
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <Link to="/leaderboard" className="inline-flex items-center gap-2 text-sm text-primary font-semibold mb-6 hover:underline">
                <ArrowLeftIcon className="h-4 w-4" />
                Назад к таблице лидеров
            </Link>

            <div className="bg-surface border border-border rounded-lg p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img
                        className="h-32 w-32 rounded-full border-4 border-primary flex-shrink-0"
                        src={profile.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`}
                        alt="Аватар"
                    />
                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-text-primary">{profile.username}</h1>
                        <p className="text-lg text-primary font-semibold mt-1">{profile.xp.toLocaleString('ru')} XP</p>
                        <div className="mt-4 max-w-xs mx-auto sm:mx-0">
                            {renderFriendButton()}
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <StatCard label="Уровень" value={Math.floor(profile.xp / 100) + 1} icon={TrophyIcon} />
                   <StatCard label="Ударный режим" value={`${profile.streak} ${isStreakActiveToday ? '🔥' : '❄️'}`} icon={FireIcon} />
                   <StatCard label="Друзья" value={profile.friends_count} icon={UserGroupIcon} />
                   <StatCard label="Награды" value={profile.user_badges.length} icon={TrophyIcon} />
                </div>
            </div>

            {profile.user_badges.length > 0 && (
                 <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Награды</h3>
                    <div className="bg-surface border border-border rounded-lg p-8">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                            {profile.user_badges.map(userBadge => (
                                <BadgeCard key={userBadge.badge.id} userBadge={userBadge} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
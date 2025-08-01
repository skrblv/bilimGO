import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../shared/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { ArrowLeftOnRectangleIcon, PencilIcon, BookOpenIcon, FireIcon, TrophyIcon, ChartBarIcon, UserGroupIcon, UserPlusIcon, PresentationChartLineIcon, BeakerIcon } from '@heroicons/react/24/solid';
import { BadgeCard } from '../entities/badge/ui/BadgeCard';
import { FriendRequests } from '../widgets/FriendRequests/ui/FriendRequests';
import type { Friend } from '../shared/types/course';
import { removeFriend } from '../shared/api/users';
import { MyProgress } from '../widgets/MyProgress/ui/MyProgress';
import { ChallengesWidget } from '../widgets/ChallengesWidget/ui/ChallengesWidget'; // Импорт нового виджета

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const FriendCard = ({ friend, onRemove }: { friend: Friend, onRemove: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleRemove = async () => {
        setIsLoading(true);
        try {
            await removeFriend(friend.id);
            onRemove();
        } catch (error) {
            console.error("Failed to remove friend", error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div className="flex items-center gap-3">
                <img src={friend.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${friend.username}`} alt={friend.username} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-semibold text-text-primary">{friend.username}</p>
                    <p className="text-xs text-text-secondary">{friend.xp} XP</p>
                </div>
            </div>
            <Button onClick={handleRemove} isLoading={isLoading} variant="secondary" className="!w-auto !px-3 !py-1.5 text-xs">Удалить</Button>
        </div>
    );
};

const ProfilePage = () => {
    const { user, logout, refreshUserData } = useAuthStore();
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleLogout = () => { logout(); navigate('/login'); };
    if (!user) { return <div className="text-center p-10">Загрузка профиля...</div>; }

    const handleFriendAction = () => { refreshUserData(); };

    const today = new Date().toISOString().split('T')[0];
    const isStreakActiveToday = user.last_activity_date === today;
    const streakColor = user.streak > 0 && isStreakActiveToday ? 'text-orange-400' : 'text-text-secondary';
    const streakText = user.streak > 0 ? `${user.streak} ${isStreakActiveToday ? '🔥' : '❄️'}` : '0';
    const streakSubtext = user.streak > 0 ? (isStreakActiveToday ? 'Отличная работа!' : 'Пройдите урок') : 'Пройдите первый урок';

    const TABS = [
        { name: 'Награды', icon: TrophyIcon },
        { name: 'Друзья', icon: UserGroupIcon },
        { name: 'Запросы', icon: UserPlusIcon },
        { name: 'Прогресс', icon: PresentationChartLineIcon },
        { name: 'Челленджи', icon: BeakerIcon },
    ];
    
    const handleTabChange = (index: number) => {
        // Обновляем данные для вкладок, требующих свежей информации
        if (index === 1 || index === 2 || index === 4) { 
            refreshUserData(); 
        }
        setSelectedIndex(index);
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Мой профиль</h1>
                <Button onClick={handleLogout} variant="secondary" className="w-auto">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                    Выйти
                </Button>
            </header>
            <div className="bg-surface border border-border rounded-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <img className="h-32 w-32 rounded-full border-4 border-primary mb-4" src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="Аватар пользователя" />
                    <h2 className="text-2xl font-bold text-text-primary">{user.username}</h2>
                    <p className="text-text-secondary">{user.email}</p>
                    <Link to="/profile/edit" className="w-auto mt-4"><Button as="span" variant='primary' className='w-full'><PencilIcon className="h-4 w-4 mr-2" />Редактировать</Button></Link>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-6 bg-background p-6 rounded-lg">
                    <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg"><p className="text-sm text-text-secondary">Опыт (XP)</p><p className="text-3xl font-bold text-primary">{user.xp}</p></div>
                    <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg"><p className="text-sm text-text-secondary">Уровень</p><p className="text-3xl font-bold text-primary">{Math.floor(user.xp / 100) + 1}</p></div>
                    <div className="col-span-2 flex flex-col items-center justify-center p-4 bg-surface rounded-lg"><div className="flex items-center gap-2"><FireIcon className={`h-6 w-6 ${streakColor} transition-colors`} /><p className="text-sm text-text-secondary">Ударный режим</p></div><p className={`text-4xl font-bold ${streakColor} transition-colors`}>{streakText}</p><p className="text-xs text-text-secondary mt-1">{streakSubtext}</p></div>
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/courses" className="block group"><div className="bg-surface border border-border rounded-lg p-6 transition-colors group-hover:border-primary h-full"><div className="flex items-center"><div className="p-3 bg-primary/10 rounded-lg"><BookOpenIcon className="h-6 w-6 text-primary" /></div><div className="ml-4"><h3 className="text-lg font-semibold text-text-primary">Перейти к обучению</h3><p className="text-sm text-text-secondary">Продолжите свой путь</p></div></div></div></Link>
                <Link to="/leaderboard" className="block group"><div className="bg-surface border border-border rounded-lg p-6 transition-colors group-hover:border-primary h-full"><div className="flex items-center"><div className="p-3 bg-primary/10 rounded-lg"><ChartBarIcon className="h-6 w-6 text-primary" /></div><div className="ml-4"><h3 className="text-lg font-semibold text-text-primary">Таблица лидеров</h3><p className="text-sm text-text-secondary">Сравните свой прогресс</p></div></div></div></Link>
            </div>
            
            <div className="w-full mt-8">
                <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-surface p-1 border border-border">
                        {TABS.map((tab) => (
                            <Tab key={tab.name} className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'focus:outline-none', selected ? 'bg-primary text-background shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                                <span className='flex items-center justify-center gap-2'><tab.icon className="h-5 w-5" /> {tab.name}</span>
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        <Tab.Panel className="rounded-xl bg-surface border border-border p-6 focus:outline-none min-h-[200px]">
                            {user.user_badges?.length > 0 ? (<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">{user.user_badges.map(ub => (<BadgeCard key={ub.badge.id} userBadge={ub} />))}</div>) : (<p className="text-text-secondary text-center">У вас пока нет наград.</p>)}
                        </Tab.Panel>
                        <Tab.Panel className="rounded-xl bg-surface border border-border p-6 focus:outline-none min-h-[200px]">
                            <div className='flex justify-end mb-4'><Link to="/friends/find" className='text-sm text-primary hover:underline flex items-center gap-1'><UserPlusIcon className='h-4 w-4' />Найти друзей</Link></div>
                            {user.friends?.length > 0 ? (<div className="space-y-2">{user.friends.map(friend => (<FriendCard key={friend.id} friend={friend} onRemove={handleFriendAction} />))}</div>) : (<p className="text-text-secondary text-center">У вас пока нет друзей.</p>)}
                        </Tab.Panel>
                        <Tab.Panel className="rounded-xl bg-surface border border-border p-6 focus:outline-none min-h-[200px]">
                            <FriendRequests />
                        </Tab.Panel>
                        <Tab.Panel className="rounded-xl bg-surface border border-border p-3 sm:p-6 focus:outline-none min-h-[200px]">
                            <MyProgress />
                        </Tab.Panel>
                        <Tab.Panel className="rounded-xl bg-surface border border-border p-6 focus:outline-none min-h-[200px]">
                            <ChallengesWidget />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

export default ProfilePage;
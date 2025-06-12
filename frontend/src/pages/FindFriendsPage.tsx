import { useState } from "react";
import { useForm } from "react-hook-form";
import { searchUsers, sendFriendRequest } from "../shared/api/users";
import type { Friend } from "../shared/types/course";
import { Input } from "../shared/ui/Input";
import { Button } from "../shared/ui/Button";

// --- ВОТ ИСПРАВЛЕНИЕ ---
// Возвращаем на место объявление типа для формы
type SearchForm = {
    query: string;
}

const UserSearchCard = ({ user, onStatusChange }: { user: Friend, onStatusChange: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFriend = async () => {
        setIsLoading(true);
        try {
            await sendFriendRequest(user.id);
            onStatusChange(); 
        } catch (error: any) {
            console.error(error.response?.data?.error || 'Не удалось отправить запрос.');
        } finally {
            setIsLoading(false);
        }
    }
    
    const renderActionButton = () => {
        switch (user.friendship_status) {
            case 'not_friends':
                return <Button onClick={handleAddFriend} isLoading={isLoading} className="w-auto !px-4 !py-2 text-xs">Добавить</Button>;
            case 'request_sent':
                return <p className="text-sm text-text-secondary">Запрос отправлен</p>;
            case 'request_received':
                return <p className="text-sm text-amber-400">Ожидает вашего ответа</p>;
            case 'friends':
                return <p className="text-sm text-success">Вы уже друзья</p>;
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
            <div className="flex items-center gap-4">
                <img src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt={user.username} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-bold text-text-primary">{user.username}</p>
                    <p className="text-sm text-text-secondary">{user.xp} XP</p>
                </div>
            </div>
            <div>{renderActionButton()}</div>
        </div>
    );
}


const FindFriendsPage = () => {
    const { register, handleSubmit, watch } = useForm<SearchForm>(); 
    const [users, setUsers] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const currentQuery = watch('query');

    const onSearch = async (data: SearchForm) => {
        if (!data.query || data.query.trim() === '') {
            setUsers([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchUsers(data.query);
            setUsers(results);
        } catch (error) {
            console.error("Failed to search users", error);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary">Найти друзей</h1>
                <p className="mt-2 text-lg text-text-secondary">Найдите единомышленников для совместной учебы.</p>
            </header>
            <form onSubmit={handleSubmit(onSearch)} className="flex gap-2 mb-8">
                <Input id="query" label="" placeholder="Введите имя пользователя..." {...register("query")} />
                <Button type="submit" isLoading={isLoading} className="w-32">Найти</Button>
            </form>
            <div className="space-y-4">
                {isLoading && <p className="text-center">Поиск...</p>}
                {!isLoading && users.length === 0 && <p className="text-center text-text-secondary">Введите имя или почту пользователя для поиска.</p>}
                {users.map(user => <UserSearchCard key={user.id} user={user} onStatusChange={() => onSearch({query: currentQuery || ''})} />)}
            </div>
        </div>
    );
}

export default FindFriendsPage;
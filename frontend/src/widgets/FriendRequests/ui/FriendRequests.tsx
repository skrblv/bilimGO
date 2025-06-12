import { useEffect, useState } from "react";
import { type FriendRequestsResponse, getFriendRequests, acceptFriendRequest, declineFriendRequest } from "../../../shared/api/users";
import type { Friendship } from "../../../shared/types/course";
import { Button } from "../../../shared/ui/Button";

const RequestCard = ({ request, onAction }: { request: Friendship, onAction: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const userToShow = request.from_user;

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            await acceptFriendRequest(request.id);
            onAction();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDecline = async () => {
        setIsLoading(true);
        try {
            await declineFriendRequest(request.id);
            onAction();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div className="flex items-center gap-3">
                <img src={userToShow.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userToShow.username}`} alt={userToShow.username} className="w-10 h-10 rounded-full" />
                <p className="font-semibold text-text-primary">{userToShow.username}</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleAccept} isLoading={isLoading} className="w-auto !px-3 !py-1.5 text-xs">Принять</Button>
                <Button onClick={handleDecline} isLoading={isLoading} variant="secondary" className="w-auto !px-3 !py-1.5 text-xs">Отклонить</Button>
            </div>
        </div>
    );
}

export const FriendRequests = () => {
    const [requests, setRequests] = useState<FriendRequestsResponse>({ incoming: [], outgoing: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await getFriendRequests();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    if (isLoading) return <p className="text-center">Загрузка запросов...</p>

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold mb-2">Входящие запросы ({requests.incoming.length})</h4>
                {requests.incoming.length > 0 ? (
                    <div className="space-y-2">
                        {requests.incoming.map(req => <RequestCard key={req.id} request={req} onAction={fetchRequests} />)}
                    </div>
                ) : <p className="text-sm text-text-secondary">Нет входящих запросов.</p>}
            </div>
            <div>
                <h4 className="font-bold mb-2">Отправленные запросы ({requests.outgoing.length})</h4>
                {requests.outgoing.length > 0 ? (
                    <div className="space-y-2">
                        {requests.outgoing.map(req => (
                             <div key={req.id} className="flex items-center justify-between p-3 bg-background rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={req.to_user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.to_user.username}`} alt={req.to_user.username} className="w-10 h-10 rounded-full" />
                                    <p className="font-semibold text-text-primary">{req.to_user.username}</p>
                                </div>
                                <p className="text-sm text-text-secondary">В ожидании...</p>
                             </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-text-secondary">Нет отправленных запросов.</p>}
            </div>
        </div>
    );
}
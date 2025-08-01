import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyChallenges, acceptChallenge, declineChallenge } from '../../../shared/api/challenges';
import type { Challenge } from '../../../shared/types/course';
import { Button } from '../../../shared/ui/Button';
import { useAuthStore } from '../../../stores/authStore';

const ChallengeCard = ({ challenge, onAction }: { challenge: Challenge, onAction: () => void }) => {
    const { user } = useAuthStore();
    const isReceiver = user?.id === challenge.receiver.id;

    const handleAccept = async () => {
        await acceptChallenge(challenge.id);
        onAction();
    };
    const handleDecline = async () => {
        await declineChallenge(challenge.id);
        onAction();
    };

    const renderStatusAndActions = () => {
        switch (challenge.status) {
            case 'PENDING':
                if (isReceiver) {
                    return (
                        <div className="flex gap-2 mt-2">
                            <Button onClick={handleAccept} className="!w-auto !py-1 text-xs">Принять</Button>
                            <Button onClick={handleDecline} variant="secondary" className="!w-auto !py-1 text-xs">Отклонить</Button>
                        </div>
                    );
                }
                return <p className="text-sm text-text-secondary mt-2">Ожидает ответа от {challenge.receiver.username}</p>;
            
            case 'IN_PROGRESS':
                const myTime = user?.id === challenge.sender.id ? challenge.sender_time : challenge.receiver_time;
                if (myTime) {
                    return <p className="text-sm text-success mt-2">Вы завершили! Ожидаем соперника.</p>;
                }
                return (
                    <Link to={`/courses/${challenge.lesson.course.id}/lessons/${challenge.lesson.id}`} state={{ challengeId: challenge.id, lesson: challenge.lesson, courseId: challenge.lesson.course.id }}>
                        <Button className="mt-2 !w-auto !py-1 text-xs border border-black">Начать!</Button>
                    </Link>
                );

            case 'COMPLETED':
                const myResult = user?.id === challenge.sender.id ? challenge.sender_time : challenge.receiver_time;
                const opponentResult = user?.id === challenge.sender.id ? challenge.receiver_time : challenge.sender_time;
                const winnerMessage = challenge.winner === user?.id ? "🏆 Победа!" : (challenge.winner ? "Поражение" : "Ничья");
                return (
                    <div className="mt-2 text-sm">
                        <p className={`font-bold ${challenge.winner === user?.id ? 'text-success' : 'text-text-primary'}`}>{winnerMessage}</p>
                        <p>Ваше время: {myResult}с. Время соперника: {opponentResult}с.</p>
                    </div>
                );
            case 'DECLINED':
                 return <p className="text-sm text-danger mt-2">Вызов отклонен</p>;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-background p-4 rounded-lg border border-border">
            <p className="text-sm text-text-secondary">
                {isReceiver ? `Вызов от` : `Вызов для`} <span className="font-bold text-primary">{isReceiver ? challenge.sender.username : challenge.receiver.username}</span>
            </p>
            {/* --- ИСПРАВЛЕНИЕ ЗДЕСЬ --- */}
            <p className="font-semibold text-text-primary">Урок: {challenge.lesson.title}</p>
            
            {renderStatusAndActions()}
        </div>
    );
}

export const ChallengesWidget = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchChallenges = async () => {
        try {
            const data = await getMyChallenges();
            setChallenges(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    if (isLoading) {
        return <p className="text-center text-text-secondary">Загрузка челленджей...</p>;
    }

    const pending = challenges.filter(c => c.status === 'PENDING');
    const inProgress = challenges.filter(c => c.status === 'IN_PROGRESS');
    const completed = challenges.filter(c => c.status === 'COMPLETED' || c.status === 'DECLINED');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-primary mb-2">Активные вызовы</h3>
                {inProgress.length > 0 ? (
                    <div className="space-y-3">{inProgress.map(c => <ChallengeCard key={c.id} challenge={c} onAction={fetchChallenges} />)}</div>
                ) : <p className="text-sm text-text-secondary">Нет активных вызовов.</p>}
            </div>
            <div>
                <h3 className="text-lg font-bold text-primary mb-2">Ожидают ответа</h3>
                 {pending.length > 0 ? (
                    <div className="space-y-3">{pending.map(c => <ChallengeCard key={c.id} challenge={c} onAction={fetchChallenges} />)}</div>
                ) : <p className="text-sm text-text-secondary">Нет ожидающих вызовов.</p>}
            </div>
             <div>
                <h3 className="text-lg font-bold text-primary mb-2">История вызовов</h3>
                 {completed.length > 0 ? (
                    <div className="space-y-3">{completed.map(c => <ChallengeCard key={c.id} challenge={c} onAction={fetchChallenges} />)}</div>
                ) : <p className="text-sm text-text-secondary">История пуста.</p>}
            </div>
        </div>
    );
};
import type { UserBadge } from "../../../shared/types/course";
import { Tooltip } from 'react-tooltip'

interface BadgeCardProps {
    userBadge: UserBadge;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export const BadgeCard = ({ userBadge }: BadgeCardProps) => {
    const { badge, awarded_at } = userBadge;
    const tooltipId = `badge-tooltip-${badge.id}`;

    return (
        <>
            <a
                data-tooltip-id={tooltipId}
                className="flex flex-col items-center text-center transition-transform hover:scale-105"
            >
                <div className="w-24 h-24 p-2 bg-surface rounded-full flex items-center justify-center border-2 border-border">
                    <img src={badge.image_url} alt={badge.title} className="w-full h-full object-contain" />
                </div>
                <p className="mt-2 text-sm font-semibold text-text-primary">{badge.title}</p>
            </a>
            <Tooltip id={tooltipId} place="top" className="z-50 max-w-xs !bg-background !border !border-border !rounded-lg !opacity-100">
                <div className="p-2">
                    <p className="font-bold text-md text-primary">{badge.title}</p>
                    <p className="text-sm text-text-primary mt-1">{badge.description}</p>
                    <p className="text-xs text-text-secondary mt-2 border-t border-border pt-1">
                        Получено: {formatDate(awarded_at)}
                    </p>
                </div>
            </Tooltip>
        </>
    );
};
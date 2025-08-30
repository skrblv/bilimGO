import { InkTransition } from '../../../features/transitions/ui/InkTransition';
import { useTransitionStore } from '../../../stores/transitionStore';

export const TransitionScreen = () => {
    // Получаем состояние и функции из стора
    const isTransitioning = useTransitionStore(state => state.isTransitioning);
    const finishTransition = useTransitionStore(state => state.finishTransition);

    if (!isTransitioning) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-auto">
            <InkTransition 
                isAnimating={isTransitioning}
                // Когда InkTransition завершится, он вызовет finishTransition
                onAnimationComplete={finishTransition}
            />
        </div>
    );
};

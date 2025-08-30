import { create } from 'zustand';

interface TransitionState {
    isTransitioning: boolean;
    transitionCallback: (() => void) | null;
    startTransition: (callback: () => void) => void;
    finishTransition: () => void; // Новая функция
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
    isTransitioning: false,
    transitionCallback: null,
    startTransition: (callback) => {
        set({ isTransitioning: true, transitionCallback: callback });
    },
    finishTransition: () => {
        const { transitionCallback } = get();
        if (transitionCallback) {
            transitionCallback(); // Выполняем сохраненный коллбэк
        }
        // Сбрасываем состояние
        set({ isTransitioning: false, transitionCallback: null });
    },
}))
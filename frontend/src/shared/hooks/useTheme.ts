import { useState, useEffect, useLayoutEffect } from 'react';

type Theme = 'light' | 'dark';

// Эта функция будет нашим единственным источником правды
const applyTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
    } else {
        root.classList.add('light');
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
};

export const useTheme = (): [Theme, () => void, (theme: Theme) => void] => {
    // 1. Мы инициализируем состояние, ВСЕГДА читая из localStorage.
    // Если там пусто, смотрим системные настройки.
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light';
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // 2. Используем useLayoutEffect, чтобы применить тему ДО того, как браузер что-то нарисует.
    // Это помогает избежать "мигания" (FOUC - Flash of Unstyled Content).
    useLayoutEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // 3. Функция для переключения темы
    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
    };

    // 4. Возвращаем состояние, переключатель и функцию для прямой установки темы
    return [theme, toggleTheme, setTheme];
};

// 5. Создаем скрипт для вставки в index.html, чтобы избежать мигания при первой загрузке
export const themeInitializerScript = `
  (function() {
    function getInitialTheme() {
      const savedTheme = window.localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const theme = getInitialTheme();
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.add('light');
    }
  })();
`;
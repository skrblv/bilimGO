import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { BookOpenIcon, ChartBarIcon, UserCircleIcon } from '@heroicons/react/24/solid';

const NavItem = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <NavLink 
        to={to}
        className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                ? 'bg-primary text-background' 
                : 'text-text-secondary hover:bg-surface hover:text-text-primary'
            }`
        }
    >
        {children}
    </NavLink>
);

export const Navbar = () => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return null; // Не показываем навбар на страницах входа/регистрации
    }

    return (
        <header className="bg-background border-b border-border sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Левая часть: Лого и основные ссылки */}
                    <div className="flex items-center gap-8">
                        <Link to="/courses" className="text-primary font-bold text-xl">
                            EduPlatform
                        </Link>
                        <nav className="hidden md:flex items-center gap-4">
                            <NavItem to="/courses">
                                <BookOpenIcon className="h-5 w-5" />
                                Курсы
                            </NavItem>
                            <NavItem to="/leaderboard">
                                <ChartBarIcon className="h-5 w-5" />
                                Лидеры
                            </NavItem>
                        </nav>
                    </div>

                    {/* Правая часть: Профиль */}
                    <div className="flex items-center">
                        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                            <span className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-text-primary">{user?.username}</p>
                                <p className="text-xs text-primary">{user?.xp} XP</p>
                            </span>
                            <img 
                                src={user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username}`} 
                                alt="Аватар"
                                className="w-10 h-10 rounded-full border-2 border-primary"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};
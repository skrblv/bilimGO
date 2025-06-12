import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../shared/api/axios';
import { Card } from '../shared/ui/Card';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';

type Inputs = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const from = location.state?.from?.pathname || "/courses";
    const message = location.state?.message;

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/auth/jwt/create/', data);
            await login(response.data);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.detail || "Произошла ошибка при входе");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-primary mb-6">EduPlatform</h1>
                <Card>
                    <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">Вход в аккаунт</h2>
                    {message && <p className="text-success text-center bg-success/10 p-3 rounded-md mb-4">{message}</p>}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input id="email" label="Email" type="email" {...register('email', { required: "Email обязателен" })} />
                            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Input id="password" label="Пароль" type="password" {...register('password', { required: "Пароль обязателен" })} />
                            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        {error && <p className="text-danger text-sm text-center bg-danger/10 p-3 rounded-md">{error}</p>}
                        <div className="pt-2">
                           <Button type="submit" isLoading={isLoading}>Войти</Button>
                        </div>
                    </form>
                    <p className="text-center text-text-secondary text-sm mt-6">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="font-medium text-primary hover:underline">
                            Зарегистрироваться
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
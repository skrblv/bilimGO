import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../shared/api/axios';
import { Card } from '../shared/ui/Card';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';

type Inputs = {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
};

const RegisterPage = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/users/', {
                username: data.username,
                email: data.email,
                password: data.password
            });
            navigate('/login', { state: { message: 'Регистрация прошла успешно! Теперь вы можете войти.' } });
        } catch (err: any) {
             if (err.response && err.response.data) {
                const messages = Object.entries(err.response.data).map(([key, value]) => `${key}: ${(value as string[]).join(' ')}`);
                setError(messages.join(' ') || "Произошла ошибка при регистрации");
            } else {
                setError("Произошла ошибка при регистрации. Проверьте соединение.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-primary mb-6">EduPlatform</h1>
                <Card>
                    <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">Создание аккаунта</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                           <Input id="username" label="Имя пользователя" type="text" {...register('username', { required: "Имя пользователя обязательно" })} />
                             {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
                        </div>
                         <div>
                            <Input id="email" label="Email" type="email" {...register('email', { required: "Email обязателен" })} />
                            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Input id="password" label="Пароль" type="password" {...register('password', { required: "Пароль обязателен", minLength: { value: 8, message: "Пароль должен быть не менее 8 символов" } })} />
                            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
                        </div>
                         <div>
                            <Input id="passwordConfirm" label="Повторите пароль" type="password" {...register('passwordConfirm', { required: "Повторите пароль", validate: value => value === watch('password') || "Пароли не совпадают" })} />
                            {errors.passwordConfirm && <p className="text-danger text-xs mt-1">{errors.passwordConfirm.message}</p>}
                        </div>
                        {error && <p className="text-danger text-sm text-center bg-danger/10 p-3 rounded-md">{error}</p>}
                        <div className="pt-2">
                            <Button type="submit" isLoading={isLoading}>Зарегистрироваться</Button>
                        </div>
                    </form>
                    <p className="text-center text-text-secondary text-sm mt-6">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Войти
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
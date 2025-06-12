import { useState, useRef, type ChangeEvent } from 'react'; // <-- Импортируем ChangeEvent
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfile, type ProfileUpdateData } from '../shared/api/users';
import { Button } from '../shared/ui/Button';
import { Input } from '../shared/ui/Input';
import { Card } from '../shared/ui/Card';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// Теперь в форме только username
type FormInputs = {
    username: string;
}

const ProfileEditPage = () => {
    const { user, refreshUserData } = useAuthStore();
    const navigate = useNavigate();
    // react-hook-form теперь управляет только именем
    const { register, handleSubmit } = useForm<FormInputs>({
        defaultValues: {
            username: user?.username || ''
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- НАЧАЛО ИЗМЕНЕНИЙ ---
    // Для превью используем URL из стора или null
    const [preview, setPreview] = useState<string | null>(user?.avatar || null);
    // Для самого файла используем отдельный стейт
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    // Ручной обработчик изменения файла
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            // Проверяем, что это изображение
            if (file && file.type.startsWith("image/")) {
                setSelectedFile(file); // Сохраняем сам файл
                setPreview(URL.createObjectURL(file)); // Устанавливаем превью
                console.log("Файл выбран и превью установлено:", file.name);
            }
        }
    };
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---
    
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsLoading(true);
        setError(null);

        const updateData: ProfileUpdateData = {};
        if (data.username !== user?.username) {
            updateData.username = data.username;
        }
        // Берем файл из нашего стейта, а не из данных формы
        if (selectedFile) {
            updateData.avatar = selectedFile;
        }

        if (Object.keys(updateData).length === 0) {
            setError("Вы не внесли никаких изменений.");
            setIsLoading(false);
            return;
        }

        try {
            await updateProfile(updateData);
            await refreshUserData();
            navigate('/profile');
        } catch (err: any) {
            setError(err.response?.data?.username?.[0] || 'Не удалось обновить профиль.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-primary font-semibold mb-6 hover:underline">
                <ArrowLeftIcon className="h-4 w-4" />
                Назад в профиль
            </Link>

            <h1 className="text-3xl font-bold text-primary mb-6">Редактирование профиля</h1>
            
            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <img
                            src={preview || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username}`}
                            alt="Превью аватара"
                            className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                        />
                        <div>
                            <p className="text-text-secondary mb-2">Загрузить новый аватар</p>
                            <Button type="button" variant="secondary" onClick={() => avatarInputRef.current?.click()}>
                                Выбрать файл
                            </Button>
                            {/* Убираем регистрацию в react-hook-form и вешаем свой обработчик */}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange} 
                                ref={avatarInputRef}
                            />
                        </div>
                    </div>

                    <Input 
                        id="username"
                        label="Имя пользователя"
                        type="text"
                        {...register("username", { required: "Имя не может быть пустым" })}
                    />
                    
                    {error && <p className="text-danger text-sm">{error}</p>}
                    
                    <div className="pt-4">
                        <Button type="submit" isLoading={isLoading}>Сохранить изменения</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProfileEditPage;
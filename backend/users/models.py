from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings # Добавим импорт settings

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='avatars/default.png')
    xp = models.PositiveIntegerField(default=0)
    streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True, verbose_name="Дата последней активности")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

# --- НОВАЯ МОДЕЛЬ ---
class Friendship(models.Model):
    """Модель для представления запроса в друзья и самой дружбы."""
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'В ожидании'
        ACCEPTED = 'ACCEPTED', 'Принято'
        DECLINED = 'DECLINED', 'Отклонено'

    # Тот, кто отправил запрос
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friendship_requests_sent'
    )
    # Тот, кто получил запрос
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friendship_requests_received'
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Уникальность пары, чтобы нельзя было отправить второй запрос тому же человеку
        unique_together = ('from_user', 'to_user')
        verbose_name = "Дружба"
        verbose_name_plural = "Дружбы"
    
    def __str__(self):
        return f"Запрос от {self.from_user} к {self.to_user} ({self.status})"
from django.db import models
from django.conf import settings

class Course(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название курса")
    description = models.TextField(verbose_name="Описание")
    image_url = models.URLField(max_length=255, blank=True, null=True, verbose_name="URL обложки")
    is_published = models.BooleanField(default=False, verbose_name="Опубликован")
    class Meta:
        verbose_name = "Курс"; verbose_name_plural = "Курсы"; ordering = ['title']
    def __str__(self): return self.title

class Skill(models.Model):
    course = models.ForeignKey(Course, related_name='skills', on_delete=models.CASCADE, verbose_name="Курс")
    title = models.CharField(max_length=200, verbose_name="Название навыка")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="Родительский навык")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    class Meta:
        verbose_name = "Навык"; verbose_name_plural = "Навыки"; ordering = ['order']
    def __str__(self): return f"{self.course.title} -> {self.title}"

class Lesson(models.Model):
    skill = models.ForeignKey(Skill, related_name='lessons', on_delete=models.CASCADE, verbose_name="Навык")
    title = models.CharField(max_length=200, verbose_name="Название урока")
    theory_content = models.JSONField(default=list, verbose_name="Содержимое теории (JSON)")
    xp_reward = models.PositiveIntegerField(default=10, verbose_name="Награда в XP")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    class Meta:
        verbose_name = "Урок"; verbose_name_plural = "Уроки"; ordering = ['skill', 'order']
    def __str__(self): return self.title

class Task(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='tasks', on_delete=models.CASCADE, verbose_name="Урок")
    TASK_TYPES = [
        ('multiple_choice', 'Множественный выбор'),
        ('true_false', 'Верно/Неверно'),
        ('text_input', 'Ввод текста'),
        ('code', 'Кодовая задача'),
        ('fill_in_blank', 'Вставить пропущенное'),
        ('constructor', 'Конструктор кода'),
        ('speed_typing', 'Печать на скорость'),
    ]
    task_type = models.CharField(max_length=20, choices=TASK_TYPES, verbose_name="Тип задания")
    question = models.TextField(verbose_name="Текст вопроса")
    options = models.JSONField(null=True, blank=True, verbose_name="Опции/Блоки (JSON)")
    correct_answer = models.TextField(verbose_name="Правильный ответ")
    code_template = models.TextField(blank=True, null=True, verbose_name="Шаблон кода")
    time_limit = models.PositiveIntegerField(
        null=True, 
        blank=True, 
        verbose_name="Лимит времени (в секундах)",
        help_text="Используется для заданий 'Печать на скорость'."
    )
    class Meta:
        verbose_name = "Задание"; verbose_name_plural = "Задания"
    def __str__(self): return f"Задание к уроку: {self.lesson.title}"

class Hint(models.Model):
    task = models.ForeignKey(Task, related_name='hints', on_delete=models.CASCADE, verbose_name="Задание")
    text = models.TextField(verbose_name="Текст подсказки")
    xp_penalty = models.PositiveIntegerField(default=1, verbose_name="Штраф в XP за использование")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    class Meta:
        verbose_name = "Подсказка"; verbose_name_plural = "Подсказки"; ordering = ['order']
    def __str__(self): return f"Подсказка {self.order} к заданию"

class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress', verbose_name="Пользователь")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, verbose_name="Урок")
    completed_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата завершения")
    class Meta:
        verbose_name = "Прогресс пользователя"; verbose_name_plural = "Прогрессы пользователей"; unique_together = ('user', 'lesson')
    def __str__(self): return f"Прогресс {self.user.username} по уроку '{self.lesson.title}'"

class Badge(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название бейджа")
    description = models.TextField(verbose_name="Описание (за что дается)")
    code = models.CharField(max_length=50, unique=True, verbose_name="Код бейджа")
    image_url = models.URLField(max_length=255, verbose_name="URL иконки бейджа")
    class Meta:
        verbose_name = "Бейдж"; verbose_name_plural = "Бейджи"
    def __str__(self): return self.title

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_badges', verbose_name="Пользователь")
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, verbose_name="Бейдж")
    awarded_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата получения")
    class Meta:
        verbose_name = "Бейдж пользователя"; verbose_name_plural = "Бейджи пользователей"; unique_together = ('user', 'badge')
    def __str__(self): return f"Бейдж '{self.badge.title}' пользователя {self.user.username}"

class Challenge(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Ожидает ответа'
        ACCEPTED = 'ACCEPTED', 'Принят'
        DECLINED = 'DECLINED', 'Отклонен'
        IN_PROGRESS = 'IN_PROGRESS', 'В процессе'
        COMPLETED = 'COMPLETED', 'Завершен'
    
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_challenges')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_challenges')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    sender_time = models.PositiveIntegerField(null=True, blank=True, help_text="Время отправителя в секундах")
    receiver_time = models.PositiveIntegerField(null=True, blank=True, help_text="Время получателя в секундах")
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_challenges')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Челлендж"; verbose_name_plural = "Челленджи"; ordering = ['-created_at']
    def __str__(self): return f"Вызов от {self.sender} к {self.receiver} по уроку '{self.lesson.title}'"
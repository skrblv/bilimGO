from django.db import models
from django.conf import settings
from courses.models import Course # Импортируем курс, к которому будет привязан тест

class QuestionBank(models.Model):
    """Банк вопросов для тестов."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="question_banks")
    # Используем те же типы заданий, что и в уроках
    TASK_TYPES = [
        ('multiple_choice', 'Множественный выбор'),
        ('true_false', 'Верно/Неверно'),
        ('text_input', 'Ввод текста'),
        ('code', 'Кодовая задача'),
        ('fill_in_blank', 'Вставить пропущенное'),
    ]
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    question = models.TextField()
    options = models.JSONField(null=True, blank=True)
    correct_answer = models.TextField()
    code_template = models.TextField(blank=True, null=True)
    difficulty = models.PositiveIntegerField(default=1, help_text="Сложность от 1 (легкий) до 5 (сложный)")

    def __str__(self):
        return f"{self.course.title}: {self.question[:50]}..."
    
    class Meta:
        verbose_name = "Вопрос из банка"; verbose_name_plural = "Банк вопросов"

class CertificationTest(models.Model):
    """Описывает сам сертификационный тест."""
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name="certification_test")
    title = models.CharField(max_length=200)
    description = models.TextField()
    number_of_questions = models.PositiveIntegerField(default=100)
    passing_score = models.PositiveIntegerField(default=80, help_text="Проходной балл в процентах")

    def __str__(self):
        return self.title
        
    class Meta:
        verbose_name = "Сертификационный тест"; verbose_name_plural = "Сертификационные тесты"

class UserTestAttempt(models.Model):
    """Попытка пользователя пройти тест."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="test_attempts")
    test = models.ForeignKey(CertificationTest, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(null=True, blank=True, help_text="Итоговый балл в процентах")
    is_passed = models.BooleanField(default=False)
    # Здесь мы будем хранить JSON со всеми вопросами, которые были в этой попытке, и ответами пользователя
    session_data = models.JSONField(default=dict)

    def __str__(self):
        return f"Попытка {self.user} теста '{self.test.title}'"
        
    class Meta:
        verbose_name = "Попытка теста"; verbose_name_plural = "Попытки тестов"
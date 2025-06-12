import re
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import Course, Lesson, UserProgress, Task, Hint
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    CompleteLessonSerializer,
    LessonCompletionResponseSerializer
)
from .services import check_and_award_badges

def normalize_text(text: str) -> str:
    """Убирает пробелы в начале/конце и приводит к нижнему регистру для текстовых ответов."""
    return str(text).strip().lower()

def execute_and_compare_code(user_code: str, correct_code_example: str) -> bool:
    """
    Выполняет код пользователя и эталонный код в изолированных окружениях
    и сравнивает итоговые словари переменных.
    """
    try:
        # Декодируем escape-последовательности, чтобы \n стал реальным переносом строки
        processed_user_code = user_code.encode().decode('unicode_escape')
        processed_correct_code = correct_code_example.encode().decode('unicode_escape')
        
        user_scope = {}
        correct_scope = {}

        # Выполняем код в безопасном окружении, без доступа к опасным встроенным функциям
        safe_builtins = {"True": True, "False": False, "int": int, "str": str, "print": print, "list": list, "dict": dict}
        exec(processed_user_code, {"__builtins__": safe_builtins}, user_scope)
        exec(processed_correct_code, {"__builtins__": safe_builtins}, correct_scope)
        
        # Сравниваем словари. Если они идентичны, код функционально эквивалентен.
        return user_scope == correct_scope
        
    except Exception as e:
        print(f"Ошибка при выполнении кода: {e}")
        return False

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения списка курсов и детальной информации о курсе."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

class CompleteLessonView(APIView):
    """Представление для завершения урока, начисления XP и выдачи наград."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CompleteLessonSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lesson_id = serializer.validated_data['lesson_id']
        user = request.user
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        progress, created = UserProgress.objects.get_or_create(user=user, lesson=lesson)

        if created:
            user.xp += lesson.xp_reward
            today = timezone.now().date()
            if user.last_activity_date:
                yesterday = today - timedelta(days=1)
                if user.last_activity_date == yesterday:
                    user.streak += 1
                elif user.last_activity_date != today:
                    user.streak = 1
            else:
                user.streak = 1
            user.last_activity_date = today
            user.save()

            new_badges = check_and_award_badges(user)
            
            message = f"Урок '{lesson.title}' успешно пройден! Вы получили {lesson.xp_reward} XP."
            if new_badges:
                message += f" Новая награда: {', '.join([b.title for b in new_badges])}!"
        else:
            progress.completed_at = timezone.now()
            progress.save()
            message = f"Вы повторили урок '{lesson.title}'. Так держать!"

        response_serializer = LessonCompletionResponseSerializer({
            'user': user,
            'message': message
        })

        return Response(response_serializer.data, status=status.HTTP_200_OK)

class CheckAnswerView(APIView):
    """Представление для проверки ответа пользователя на задание."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        task_id = request.data.get('task_id')
        user_answer = request.data.get('answer')

        if not task_id or user_answer is None:
            return Response(
                {"error": "task_id and answer are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        task = get_object_or_404(Task, id=task_id)
        is_correct = False
        
        if task.task_type == 'code':
            is_correct = execute_and_compare_code(user_answer, task.correct_answer)
        else:
            if normalize_text(user_answer) == normalize_text(task.correct_answer):
                is_correct = True
        
        if is_correct:
            return Response({"is_correct": True})
        else:
            return Response({
                "is_correct": False,
                "correct_answer": None if task.task_type == 'code' else task.correct_answer
            })
            
class RequestHintView(APIView):
    """Представление для получения подсказки к заданию."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        task_id = request.data.get('task_id')
        if not task_id:
            return Response({"error": "task_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        task = get_object_or_404(Task, id=task_id)
        user = request.user
        
        hint = task.hints.first() 
        
        if hint:
            user.xp = max(0, user.xp - hint.xp_penalty)
            user.save()
            
            return Response({
                "hint": {"text": hint.text},
                "message": f"Вы использовали подсказку. Списано {hint.xp_penalty} XP."
            })
        else:
            return Response(
                {"message": "Для этого задания нет подсказок."}, 
                status=status.HTTP_404_NOT_FOUND
            )
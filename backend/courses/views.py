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

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
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
        is_correct = (str(user_answer).lower() == str(task.correct_answer).lower())

        if is_correct:
            return Response({"is_correct": True})
        else:
            return Response({
                "is_correct": False,
                "correct_answer": task.correct_answer
            })
            
class RequestHintView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        task_id = request.data.get('task_id')
        task = get_object_or_404(Task, id=task_id)
        
        user = request.user
        
        # Просто берем первую неиспользованную подсказку
        # В реальном приложении нужно было бы хранить, какие подсказки юзер уже видел
        hint = task.hints.first()
        
        if hint:
            user.xp -= hint.xp_penalty
            if user.xp < 0:
                user.xp = 0
            user.save()
            
            return Response({"hint": {"text": hint.text}, "message": f"Вы использовали подсказку. Списано {hint.xp_penalty} XP."})
        else:
            return Response(
                {"message": "Для этого задания нет подсказок."}, 
                status=status.HTTP_404_NOT_FOUND
            )
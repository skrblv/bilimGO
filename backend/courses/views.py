import re
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Course, Lesson, UserProgress, Task, Hint, Challenge
from users.models import User
from .serializers import (
    CourseListSerializer, 
    CourseDetailSerializer, 
    CompleteLessonSerializer, 
    LessonCompletionResponseSerializer, 
    ChallengeSerializer, 
    CreateChallengeSerializer,
    SubmitChallengeResultSerializer
)
from .services import check_and_award_badges

def normalize_text(text: str):
    return str(text).strip().lower()

def execute_and_compare_code(user_code: str, correct_code_example: str):
    try:
        processed_user_code = user_code.encode().decode('unicode_escape')
        processed_correct_code = correct_code_example.encode().decode('unicode_escape')
        user_scope, correct_scope = {}, {}
        safe_builtins = {"True": True, "False": False, "int": int, "str": str, "print": print, "list": list, "dict": dict}
        exec(processed_user_code, {"__builtins__": safe_builtins}, user_scope)
        exec(processed_correct_code, {"__builtins__": safe_builtins}, correct_scope)
        return user_scope == correct_scope
    except Exception as e:
        print(f"Ошибка при выполнении кода: {e}")
        return False

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
        xp_earned_this_time = 0
        new_badges = []
        if created:
            xp_earned_this_time = lesson.xp_reward
            user.xp += xp_earned_this_time
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
            message = f"Урок '{lesson.title}' успешно пройден!"
        else:
            progress.completed_at = timezone.now()
            progress.save()
            message = f"Вы повторили урок '{lesson.title}'. Так держать!"
        response_data = {
            'message': message,
            'xp_earned': xp_earned_this_time,
            'new_badges_count': len(new_badges)
        }
        serializer = LessonCompletionResponseSerializer(data=response_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class CheckAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        task_id = request.data.get('task_id')
        user_answer = request.data.get('answer')
        if not task_id or user_answer is None:
            return Response({"error": "task_id and answer are required."}, status=status.HTTP_400_BAD_REQUEST)
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
            return Response({"is_correct": False, "correct_answer": None if task.task_type in ['code', 'constructor'] else task.correct_answer})

class RequestHintView(APIView):
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
            return Response({"hint": {"text": hint.text}, "message": f"Вы использовали подсказку. Списано {hint.xp_penalty} XP."})
        else:
            return Response({"message": "Для этого задания нет подсказок."}, status=status.HTTP_404_NOT_FOUND)

class ChallengeViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChallengeSerializer
    def get_queryset(self):
        user = self.request.user
        return Challenge.objects.filter(Q(sender=user) | Q(receiver=user))

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = CreateChallengeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        receiver_id = serializer.validated_data['receiver_id']
        lesson_id = serializer.validated_data['lesson_id']
        sender = request.user
        receiver = get_object_or_404(User, id=receiver_id)
        lesson = get_object_or_404(Lesson, id=lesson_id)
        challenge = Challenge.objects.create(sender=sender, receiver=receiver, lesson=lesson)
        return Response(self.get_serializer(challenge).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        challenge = self.get_object()
        if challenge.receiver != request.user or challenge.status != Challenge.Status.PENDING:
            return Response(status=status.HTTP_403_FORBIDDEN)
        challenge.status = Challenge.Status.IN_PROGRESS
        challenge.save()
        return Response(self.get_serializer(challenge).data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        challenge = self.get_object()
        if challenge.receiver != request.user or challenge.status != Challenge.Status.PENDING:
            return Response(status=status.HTTP_403_FORBIDDEN)
        challenge.status = Challenge.Status.DECLINED
        challenge.save()
        return Response(self.get_serializer(challenge).data)
        
    @action(detail=True, methods=['post'])
    def submit_result(self, request, pk=None):
        challenge = self.get_object()
        user = request.user
        if challenge.status != Challenge.Status.IN_PROGRESS:
            return Response({'error': 'Челлендж не активен'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SubmitChallengeResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        time_taken = serializer.validated_data['time_taken']
        if user == challenge.sender:
            challenge.sender_time = time_taken
        elif user == challenge.receiver:
            challenge.receiver_time = time_taken
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if challenge.sender_time is not None and challenge.receiver_time is not None:
            if challenge.sender_time < challenge.receiver_time:
                challenge.winner = challenge.sender
            elif challenge.receiver_time < challenge.sender_time:
                challenge.winner = challenge.receiver
            challenge.status = Challenge.Status.COMPLETED
        challenge.save()
        return Response(self.get_serializer(challenge).data)
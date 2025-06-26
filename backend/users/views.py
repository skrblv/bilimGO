import re
from rest_framework import generics, permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from .models import User, Friendship
from courses.models import Course, UserProgress, Lesson
from .serializers import UserSerializer, FriendshipSerializer, FriendSerializer, UserProfileSerializer
from django.shortcuts import get_object_or_404
from rest_framework.filters import SearchFilter
from datetime import date, timedelta

class UserSearchView(generics.ListAPIView):
    """
    Представление для поиска пользователей по имени (username) и почте (email).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer 
    filter_backends = [SearchFilter]
    search_fields = ['username', 'email']

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)
    
    def get_serializer_context(self):
        return {'request': self.request}

class UserProfileView(generics.RetrieveAPIView):
    """
    Представление для получения публичной информации о пользователе по его ID.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer 
    lookup_field = 'id'

    def get_serializer_context(self):
        return {'request': self.request}

class LeaderboardView(generics.ListAPIView):
    """
    Представление для получения таблицы лидеров.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.order_by('-xp')[:100]

class UserStatsView(APIView):
    """
    Представление для получения агрегированной статистики пользователя.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # 1. Статистика по направлениям (Radar Chart)
        radar_stats = UserProgress.objects.filter(user=user)\
            .values('lesson__skill__course__title')\
            .annotate(total_xp=Sum('lesson__xp_reward'))\
            .order_by('-total_xp')
        
        radar_data = [{'name': item['lesson__skill__course__title'], 'value': item['total_xp']} for item in radar_stats]

        # 2. Статистика активности (Heatmap)
        one_year_ago = date.today() - timedelta(days=365)
        activity_stats = UserProgress.objects.filter(user=user, completed_at__date__gte=one_year_ago)\
            .values('completed_at__date')\
            .annotate(lessons_completed=Count('id'))\
            .order_by('completed_at__date')

        heatmap_data = [[item['completed_at__date'].strftime('%Y-%m-%d'), item['lessons_completed']] for item in activity_stats]

        # 3. Прогресс по курсам (Progress Bar)
        started_course_ids = UserProgress.objects.filter(user=user)\
            .values_list('lesson__skill__course_id', flat=True).distinct()
        
        started_courses = Course.objects.filter(id__in=started_course_ids)

        progress_data = []
        for course in started_courses:
            total_lessons_in_course = Lesson.objects.filter(skill__course=course).count()
            completed_lessons_in_course = UserProgress.objects.filter(
                user=user, 
                lesson__skill__course=course
            ).count()
            
            if total_lessons_in_course > 0:
                percentage = round((completed_lessons_in_course / total_lessons_in_course) * 100)
                xp_in_course = UserProgress.objects.filter(user=user, lesson__skill__course=course).aggregate(total_xp=Sum('lesson__xp_reward'))['total_xp'] or 0
                
                progress_data.append({
                    'id': course.id,
                    'title': course.title,
                    'completed': completed_lessons_in_course,
                    'total': total_lessons_in_course,
                    'percentage': percentage,
                    'xp_earned': xp_in_course
                })

        return Response({
            'radar_chart': radar_data,
            'heatmap': heatmap_data,
            'courses_progress': progress_data
        })

class FriendshipViewSet(viewsets.GenericViewSet):
    """ViewSet для управления запросами в друзья."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    
    @action(detail=False, methods=['get'])
    def requests(self, request):
        incoming = Friendship.objects.filter(to_user=request.user, status=Friendship.Status.PENDING)
        outgoing = Friendship.objects.filter(from_user=request.user, status=Friendship.Status.PENDING)
        return Response({
            'incoming': self.get_serializer(incoming, many=True).data,
            'outgoing': self.get_serializer(outgoing, many=True).data
        })

    @action(detail=False, methods=['post'])
    def send_request(self, request):
        to_user_id = request.data.get('to_user_id')
        if not to_user_id:
            return Response({'error': 'to_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        to_user = get_object_or_404(User, id=to_user_id)
        from_user = request.user
        if to_user == from_user:
            return Response({'error': 'You cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter((Q(from_user=from_user, to_user=to_user) | Q(from_user=to_user, to_user=from_user))).exists():
            return Response({'error': 'Friend request already sent or you are already friends.'}, status=status.HTTP_400_BAD_REQUEST)
        friendship = Friendship.objects.create(from_user=from_user, to_user=to_user)
        return Response(self.get_serializer(friendship).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friend_request = get_object_or_404(self.queryset, id=pk, to_user=request.user)
        if friend_request.status != Friendship.Status.PENDING:
            return Response({'error': 'This request is not pending.'}, status=status.HTTP_400_BAD_REQUEST)
        friend_request.status = Friendship.Status.ACCEPTED
        friend_request.save()
        return Response(self.get_serializer(friend_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        friend_request = get_object_or_404(self.queryset, id=pk, to_user=request.user)
        friend_request.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='remove/(?P<user_id>[^/.]+)')
    def remove(self, request, pk=None, user_id=None):
        friend_to_remove = get_object_or_404(User, id=user_id)
        friendship = Friendship.objects.filter((Q(from_user=request.user, to_user=friend_to_remove) | Q(from_user=friend_to_remove, to_user=request.user)) & Q(status=Friendship.Status.ACCEPTED)).first()
        if not friendship:
            return Response({'error': 'You are not friends with this user.'}, status=status.HTTP_400_BAD_REQUEST)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CompleteLessonView, CheckAnswerView, RequestHintView, ChallengeViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'challenges', ChallengeViewSet, basename='challenge')

urlpatterns = [
    path('', include(router.urls)),
    path('lessons/complete/', CompleteLessonView.as_view(), name='complete-lesson'),
    path('tasks/check_answer/', CheckAnswerView.as_view(), name='check-answer'),
    path('tasks/request_hint/', RequestHintView.as_view(), name='request-hint'),
]
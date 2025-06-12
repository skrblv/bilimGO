from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaderboardView, FriendshipViewSet, UserSearchView

router = DefaultRouter()
router.register(r'friendship', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('', include(router.urls)),
]
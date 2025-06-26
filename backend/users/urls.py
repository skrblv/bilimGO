from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaderboardView, FriendshipViewSet, UserSearchView, UserProfileView, UserStatsView

router = DefaultRouter()
router.register(r'friendship', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('me/stats/', UserStatsView.as_view(), name='user-stats'),
    path('<int:id>/', UserProfileView.as_view(), name='user-profile'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('', include(router.urls)),
]
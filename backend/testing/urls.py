from django.urls import path
from .views import TestSessionView, TestDetailView

urlpatterns = [
    path('details/<int:course_id>/', TestDetailView.as_view(), name='test-details'),
    path('session/', TestSessionView.as_view(), name='test-session'),
]
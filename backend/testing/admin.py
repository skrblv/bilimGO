from django.contrib import admin
from .models import QuestionBank, CertificationTest, UserTestAttempt

@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ('question', 'course', 'task_type', 'difficulty')
    list_filter = ('course', 'task_type', 'difficulty')

@admin.register(CertificationTest)
class CertificationTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'number_of_questions', 'passing_score')

@admin.register(UserTestAttempt)
class UserTestAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'is_passed', 'start_time')
    list_filter = ('test', 'is_passed')
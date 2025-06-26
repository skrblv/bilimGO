from django.contrib import admin
from django.forms import Textarea
from django.db import models
from .models import Course, Skill, Lesson, Task, Hint, UserProgress, Badge, UserBadge

class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1
    formfield_overrides = {
        models.JSONField: {'widget': Textarea(attrs={'rows': 8, 'cols': 60})},
    }

class SkillInline(admin.StackedInline):
    model = Skill
    extra = 1

class TaskInline(admin.StackedInline):
    model = Task
    extra = 1
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 4, 'cols': 60})},
        models.CharField: {'widget': Textarea(attrs={'rows': 2, 'cols': 60})},
        models.JSONField: {'widget': Textarea(attrs={'rows': 4, 'cols': 60})},
    }

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('title', 'description')
    inlines = [SkillInline]

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'parent', 'order')
    list_filter = ('course',)
    search_fields = ('title',)
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill', 'xp_reward', 'order')
    list_filter = ('skill__course',)
    search_fields = ('title',)
    inlines = [TaskInline]

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('question', 'lesson', 'task_type')
    list_filter = ('lesson__skill__course', 'task_type')
    search_fields = ('question',)
    fieldsets = (
        (None, {
            'fields': ('lesson', 'task_type', 'question')
        }),
        ('Содержимое задания', {
            'fields': ('code_template', 'options', 'correct_answer', 'time_limit')
        }),
    )
    # --- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ ---
    # Мы говорим Django: "Для всех полей TextField и CharField в этой админке,
    # используй виджет Textarea (большое текстовое поле)".
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 8, 'cols': 80})},
        models.CharField: {'widget': Textarea(attrs={'rows': 8, 'cols': 80})},
        models.JSONField: {'widget': Textarea(attrs={'rows': 8, 'cols': 80})},
    }

@admin.register(Hint)
class HintAdmin(admin.ModelAdmin):
    list_display = ('text', 'task', 'xp_penalty')

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'completed_at')
    list_filter = ('user', 'lesson__skill__course')

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'description')
    search_fields = ('title', 'code')

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at')
    list_filter = ('badge', 'user')
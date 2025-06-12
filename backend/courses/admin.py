from django.contrib import admin
from .models import Course, Skill, Lesson, Task, Hint, UserProgress, Badge, UserBadge

class LessonInline(admin.StackedInline):
    model = Lesson; extra = 1

class SkillInline(admin.StackedInline):
    model = Skill; extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published'); list_filter = ('is_published',); search_fields = ('title', 'description'); inlines = [SkillInline]

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'parent', 'order'); list_filter = ('course',); search_fields = ('title',); inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill', 'xp_reward', 'order'); list_filter = ('skill__course',); search_fields = ('title', 'theory')

admin.site.register(Task)
admin.site.register(Hint)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'completed_at'); list_filter = ('user', 'lesson__skill__course')

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'description'); search_fields = ('title', 'code')

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at'); list_filter = ('badge', 'user')
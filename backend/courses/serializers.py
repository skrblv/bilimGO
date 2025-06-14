from rest_framework import serializers
from .models import Course, Skill, Lesson, Task, Hint, Badge, UserBadge

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'title', 'description', 'image_url', 'code']

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ['badge', 'awarded_at']

class HintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hint
        fields = ['id', 'text', 'xp_penalty', 'order']

class TaskSerializer(serializers.ModelSerializer):
    hints = HintSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        # --- ВОТ ИЗМЕНЕНИЕ ---
        # Добавляем новое поле 'code_template'
        fields = ['id', 'task_type', 'question', 'options', 'correct_answer', 'code_template', 'hints']

class LessonSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    class Meta: 
        model = Lesson
        fields = ['id', 'title', 'theory_content', 'xp_reward', 'tasks']

class SkillSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()
    class Meta:
        model = Skill
        fields = ['id', 'title', 'children', 'lessons']
    
    def get_children(self, obj):
        return SkillSerializer(obj.children.all(), many=True, context=self.context).data

class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image_url']

class CourseDetailSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image_url', 'skills']
    
    def get_skills(self, obj):
        root_skills = obj.skills.filter(parent__isnull=True)
        return SkillSerializer(root_skills, many=True, context=self.context).data

class CompleteLessonSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()

class LessonCompletionResponseSerializer(serializers.Serializer):
    user = serializers.SerializerMethodField()
    message = serializers.CharField()
    
    def get_user(self, obj):
        from users.serializers import UserSerializer
        user_instance = obj.get('user')
        return UserSerializer(instance=user_instance, context=self.context).data
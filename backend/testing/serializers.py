from rest_framework import serializers
from .models import QuestionBank, CertificationTest, UserTestAttempt

class CertificationTestSerializer(serializers.ModelSerializer):
    """Сериализатор для метаданных теста."""
    required_correct_answers = serializers.SerializerMethodField()

    class Meta:
        model = CertificationTest
        fields = [
            'id', 'title', 'description', 'number_of_questions', 
            'passing_score', 'required_correct_answers'
        ]
        
    def get_required_correct_answers(self, obj):
        import math
        return math.ceil(obj.number_of_questions * (obj.passing_score / 100))

class TestQuestionSerializer(serializers.ModelSerializer):
    """Сериализатор для отправки вопросов на фронтенд (без правильных ответов)."""
    class Meta:
        model = QuestionBank
        exclude = ('correct_answer', 'course', 'difficulty')

class StartTestResponseSerializer(serializers.Serializer):
    """Ответ при начале теста."""
    attempt_id = serializers.IntegerField()
    questions = TestQuestionSerializer(many=True)

class SubmitTestAnswerSerializer(serializers.Serializer):
    """Структура одного ответа от пользователя."""
    question_id = serializers.IntegerField()
    answer = serializers.CharField(allow_blank=True, allow_null=True)

class SubmitTestRequestSerializer(serializers.Serializer):
    """Запрос на завершение теста."""
    attempt_id = serializers.IntegerField()
    answers = SubmitTestAnswerSerializer(many=True)

class TestResultSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения результата."""
    class Meta:
        model = UserTestAttempt
        fields = ('id', 'score', 'is_passed', 'end_time')
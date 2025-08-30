import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics # <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
from django.utils import timezone
from .models import CertificationTest, QuestionBank, UserTestAttempt
from .serializers import (
    StartTestResponseSerializer, 
    SubmitTestRequestSerializer,
    TestResultSerializer,
    CertificationTestSerializer # <-- Теперь этот импорт будет работать
)

class TestDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = CertificationTest.objects.all()
    serializer_class = CertificationTestSerializer
    lookup_field = 'course_id'

class TestSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        try:
            test = CertificationTest.objects.get(course_id=course_id)
        except CertificationTest.DoesNotExist:
            return Response({"error": "Тест для этого курса не найден."}, status=status.HTTP_404_NOT_FOUND)

        all_questions = list(QuestionBank.objects.filter(course=test.course))
        
        if len(all_questions) < test.number_of_questions:
             return Response({"error": "В банке недостаточно вопросов для этого теста."}, status=status.HTTP_400_BAD_REQUEST)
        
        selected_questions = random.sample(all_questions, test.number_of_questions)
        
        question_ids = [q.id for q in selected_questions]
        
        attempt = UserTestAttempt.objects.create(
            user=request.user,
            test=test,
            session_data={'questions': question_ids}
        )
        
        serializer = StartTestResponseSerializer({
            'attempt_id': attempt.id,
            'questions': selected_questions
        })
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        serializer = SubmitTestRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        attempt_id = serializer.validated_data['attempt_id']
        user_answers = {item['question_id']: item['answer'] for item in serializer.validated_data['answers']}
        
        try:
            attempt = UserTestAttempt.objects.get(id=attempt_id, user=request.user)
        except UserTestAttempt.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if attempt.end_time:
            return Response({"error": "Эта попытка уже завершена."}, status=status.HTTP_400_BAD_REQUEST)
            
        question_ids = attempt.session_data.get('questions', [])
        questions = QuestionBank.objects.filter(id__in=question_ids)
        
        correct_answers_count = 0
        for question in questions:
            user_answer = user_answers.get(question.id)
            if user_answer and str(user_answer).strip().lower() == str(question.correct_answer).strip().lower():
                correct_answers_count += 1
        
        score = round((correct_answers_count / len(questions)) * 100) if questions else 0
        
        attempt.score = score
        attempt.is_passed = score >= attempt.test.passing_score
        attempt.end_time = timezone.now()
        attempt.session_data['user_answers'] = user_answers
        attempt.save()
        
        result_serializer = TestResultSerializer(attempt)
        return Response(result_serializer.data, status=status.HTTP_200_OK)
from rest_framework import serializers
from users.serializers import UserSerializer

# Этот сериализатор живет в отдельном файле, чтобы избежать циклических импортов.
class LessonCompletionResponseSerializer(serializers.Serializer):
    user = serializers.SerializerMethodField()
    message = serializers.CharField()
    
    def get_user(self, obj):
        """
        Метод для сериализации поля 'user'.
        Он явно передает 'context' в UserSerializer, что необходимо
        для построения полных URL-адресов для медиафайлов.
        """
        user_instance = obj.get('user')
        # self.context передается из view, где создается этот сериализатор
        return UserSerializer(instance=user_instance, context=self.context).data
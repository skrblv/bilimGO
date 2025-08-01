from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import User, Friendship
from courses.models import UserProgress # Импортируем UserProgress
from courses.serializers import UserBadgeSerializer
from django.db.models import Q

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'password')

class FriendSerializer(serializers.ModelSerializer):
    friendship_status = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'username', 'avatar', 'xp', 'friendship_status')
    def get_friendship_status(self, obj):
        request_user = self.context.get('request').user
        if not request_user or not request_user.is_authenticated or request_user == obj: return 'self'
        friendship = Friendship.objects.filter((Q(from_user=request_user, to_user=obj) | Q(from_user=obj, to_user=request_user))).first()
        if not friendship: return 'not_friends'
        if friendship.status == Friendship.Status.ACCEPTED: return 'friends'
        if friendship.status == Friendship.Status.PENDING:
            if friendship.from_user == request_user: return 'request_sent'
            else: return 'request_received'
        return 'not_friends'

class UserProfileSerializer(serializers.ModelSerializer):
    user_badges = UserBadgeSerializer(many=True, read_only=True)
    friends_count = serializers.SerializerMethodField()
    friendship_status = serializers.SerializerMethodField()
    completed_lessons_ids = serializers.SerializerMethodField() # Новое поле

    class Meta:
        model = User
        fields = (
            'id', 'username', 'avatar', 'xp', 'streak', 'last_activity_date', 
            'user_badges', 'friends_count', 'friendship_status', 'completed_lessons_ids'
        )

    def get_friends_count(self, obj):
        return Friendship.objects.filter((Q(from_user=obj) | Q(to_user=obj)) & Q(status=Friendship.Status.ACCEPTED)).count()
    
    def get_friendship_status(self, obj):
        request_user = self.context.get('request').user
        if not request_user or not request_user.is_authenticated or request_user == obj: return 'self'
        friendship = Friendship.objects.filter((Q(from_user=request_user, to_user=obj) | Q(from_user=obj, to_user=request_user))).first()
        if not friendship: return 'not_friends'
        if friendship.status == Friendship.Status.ACCEPTED: return 'friends'
        if friendship.status == Friendship.Status.PENDING:
            if friendship.from_user == request_user: return 'request_sent'
            else: return 'request_received'
        return 'not_friends'

    def get_completed_lessons_ids(self, obj):
        return UserProgress.objects.filter(user=obj).values_list('lesson_id', flat=True)

class UserSerializer(BaseUserSerializer):
    user_badges = UserBadgeSerializer(many=True, read_only=True)
    friends = serializers.SerializerMethodField()
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'avatar', 'xp', 'streak', 'last_activity_date', 'user_badges', 'friends')
    def get_friends(self, obj):
        accepted_friendships = Friendship.objects.filter((Q(from_user=obj) | Q(to_user=obj)) & Q(status=Friendship.Status.ACCEPTED))
        friend_ids = [f.from_user.id if f.to_user.id == obj.id else f.to_user.id for f in accepted_friendships]
        friends = User.objects.filter(id__in=friend_ids)
        return FriendSerializer(friends, many=True, context=self.context).data

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = FriendSerializer(read_only=True)
    to_user = FriendSerializer(read_only=True)
    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Friendship
from .serializers import UserSerializer, FriendshipSerializer, FriendSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.filters import SearchFilter

class UserSearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer 
    filter_backends = [SearchFilter]
    search_fields = ['username', 'email']

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)
    
    def get_serializer_context(self):
        return {'request': self.request}


class LeaderboardView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    def get_queryset(self):
        return User.objects.order_by('-xp')[:100]


class FriendshipViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer

    @action(detail=False, methods=['get'])
    def requests(self, request):
        incoming = Friendship.objects.filter(to_user=request.user, status=Friendship.Status.PENDING)
        outgoing = Friendship.objects.filter(from_user=request.user, status=Friendship.Status.PENDING)
        return Response({
            'incoming': self.get_serializer(incoming, many=True).data,
            'outgoing': self.get_serializer(outgoing, many=True).data
        })

    @action(detail=False, methods=['post'])
    def send_request(self, request):
        to_user_id = request.data.get('to_user_id')
        if not to_user_id:
            return Response({'error': 'to_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        to_user = get_object_or_404(User, id=to_user_id)
        from_user = request.user
        if to_user == from_user:
            return Response({'error': 'You cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(
            (Q(from_user=from_user, to_user=to_user) | Q(from_user=to_user, to_user=from_user))
        ).exists():
            return Response({'error': 'Friend request already sent or you are already friends.'}, status=status.HTTP_400_BAD_REQUEST)
        friendship = Friendship.objects.create(from_user=from_user, to_user=to_user)
        return Response(self.get_serializer(friendship).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friend_request = get_object_or_404(self.queryset, id=pk, to_user=request.user)
        if friend_request.status != Friendship.Status.PENDING:
            return Response({'error': 'This request is not pending.'}, status=status.HTTP_400_BAD_REQUEST)
        friend_request.status = Friendship.Status.ACCEPTED
        friend_request.save()
        return Response(self.get_serializer(friend_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        friend_request = get_object_or_404(self.queryset, id=pk, to_user=request.user)
        friend_request.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='remove/(?P<user_id>[^/.]+)')
    def remove(self, request, pk=None, user_id=None):
        friend_to_remove = get_object_or_404(User, id=user_id)
        friendship = Friendship.objects.filter(
            (Q(from_user=request.user, to_user=friend_to_remove) | Q(from_user=friend_to_remove, to_user=request.user))
            & Q(status=Friendship.Status.ACCEPTED)
        ).first()
        if not friendship:
            return Response({'error': 'You are not friends with this user.'}, status=status.HTTP_400_BAD_REQUEST)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
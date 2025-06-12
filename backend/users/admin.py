from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Friendship # Добавили Friendship

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'xp', 'streak', 'is_staff')
    search_fields = ('email', 'username')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'avatar', 'xp', 'streak', 'last_activity_date')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    readonly_fields = ('last_login', 'date_joined')

admin.site.register(User, CustomUserAdmin)

# --- НОВАЯ РЕГИСТРАЦИЯ ---
@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status',)
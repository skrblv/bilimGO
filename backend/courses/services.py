from .models import Badge, UserBadge, UserProgress

def check_and_award_badges(user):
    newly_awarded_badges = []
    user_existing_badges_codes = set(user.user_badges.values_list('badge__code', flat=True))
    
    badge_code = 'FIRST_LESSON'
    if badge_code not in user_existing_badges_codes:
        if UserProgress.objects.filter(user=user).count() >= 1:
            badge = Badge.objects.filter(code=badge_code).first()
            if badge: UserBadge.objects.create(user=user, badge=badge); newly_awarded_badges.append(badge)

    badge_code = 'STREAK_5_DAYS'
    if badge_code not in user_existing_badges_codes:
        if user.streak >= 5:
            badge = Badge.objects.filter(code=badge_code).first()
            if badge: UserBadge.objects.create(user=user, badge=badge); newly_awarded_badges.append(badge)

    badge_code = 'LESSONS_10'
    if badge_code not in user_existing_badges_codes:
        if UserProgress.objects.filter(user=user).count() >= 10:
            badge = Badge.objects.filter(code=badge_code).first()
            if badge: UserBadge.objects.create(user=user, badge=badge); newly_awarded_badges.append(badge)
    
    return newly_awarded_badges
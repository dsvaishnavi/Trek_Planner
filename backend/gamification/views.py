from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User

from .models import Badge, UserBadge
from .services import ensure_badges


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ("id", "name", "slug", "description", "icon", "criteria")


class MyBadgesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_badges()
        badges = UserBadge.objects.filter(user=request.user).select_related("badge")
        data = [
            {
                "name": ub.badge.name,
                "slug": ub.badge.slug,
                "icon": ub.badge.icon,
                "description": ub.badge.description,
                "earned_at": ub.earned_at,
            }
            for ub in badges
        ]
        return Response({"badges": data, "level": request.user.travel_level, "xp": request.user.xp_points})


class AllBadgesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ensure_badges()
        return Response(BadgeSerializer(Badge.objects.all(), many=True).data)


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        users = User.objects.filter(is_active=True).order_by("-xp_points", "-travel_level")[:20]
        return Response(
            [
                {
                    "rank": i + 1,
                    "username": u.display_name,
                    "xp_points": u.xp_points,
                    "travel_level": u.travel_level,
                }
                for i, u in enumerate(users)
            ]
        )

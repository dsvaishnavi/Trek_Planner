from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Notification, PasswordResetToken, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "travel_level", "xp_points", "is_staff")
    search_fields = ("email", "username")
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Travel Profile",
            {
                "fields": (
                    "phone",
                    "bio",
                    "profile_picture",
                    "age",
                    "travel_style",
                    "interests",
                    "travel_level",
                    "xp_points",
                )
            },
        ),
    )


admin.site.register(PasswordResetToken)
admin.site.register(Notification)

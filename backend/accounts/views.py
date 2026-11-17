"""Authentication and profile API views."""
import secrets

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Notification, PasswordResetToken, User
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    NotificationSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
)


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Notification.objects.create(
            user=user,
            title="Welcome to TrekVerse AI!",
            message="Your account is ready. Plan your first AI-powered journey.",
            link="/planner",
        )
        data = ProfileSerializer(user, context={"request": request}).data
        return Response({**data, "tokens": tokens_for_user(user)}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(
            {
                "user": ProfileSerializer(user, context={"request": request}).data,
                "tokens": tokens_for_user(user),
            }
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Do not reveal whether email exists
            return Response({"detail": "If that email exists, a reset link was sent."})

        token = secrets.token_urlsafe(32)
        PasswordResetToken.objects.create(user=user, token=token)
        reset_url = f"{settings.FRONTEND_URL}/forgot-password?token={token}"
        send_mail(
            subject="TrekVerse AI — Reset your password",
            message=f"Reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
        payload = {"detail": "If that email exists, a reset link was sent."}
        if settings.DEBUG:
            payload["debug_token"] = token
            payload["debug_url"] = reset_url
        return Response(payload)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            reset = PasswordResetToken.objects.get(
                token=serializer.validated_data["token"], used=False
            )
        except PasswordResetToken.DoesNotExist:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user = reset.user
        user.set_password(serializer.validated_data["password"])
        user.save()
        reset.used = True
        reset.save()
        return Response({"detail": "Password updated successfully."})


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        qs = Notification.objects.filter(user=request.user)
        if pk:
            qs.filter(pk=pk).update(is_read=True)
        else:
            qs.update(is_read=True)
        return Response({"detail": "Marked as read."})

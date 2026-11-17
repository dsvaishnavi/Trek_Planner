from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChatSessionViewSet, SendMessageView, SuggestedQuestionsView

router = DefaultRouter()
router.register("sessions", ChatSessionViewSet, basename="chat-session")

urlpatterns = [
    path("", include(router.urls)),
    path("sessions/<int:pk>/messages/", SendMessageView.as_view(), name="chat-send"),
    path("suggestions/", SuggestedQuestionsView.as_view(), name="chat-suggestions"),
]

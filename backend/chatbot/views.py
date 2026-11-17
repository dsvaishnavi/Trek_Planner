import json

from django.http import StreamingHttpResponse
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatMessage, ChatSession
from .serializers import ChatSessionSerializer, SendMessageSerializer
from .services import chat_response, suggested_questions


class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).prefetch_related("messages")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        session = ChatSession.objects.filter(pk=pk, user=request.user).first()
        if not session:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]
        want_stream = serializer.validated_data.get("stream") or request.query_params.get("stream") == "1"

        ChatMessage.objects.create(session=session, role="user", content=content)
        if session.title == "New chat":
            session.title = content[:60]
            session.save(update_fields=["title", "updated_at"])

        history = list(session.messages.values("role", "content"))
        result = chat_response(history, stream=want_stream)

        if want_stream:

            def event_stream():
                full = []
                for chunk in result:
                    full.append(chunk)
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                text = "".join(full)
                ChatMessage.objects.create(session=session, role="assistant", content=text)
                yield f"data: {json.dumps({'done': True, 'content': text})}\n\n"

            return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

        assistant_text = result if isinstance(result, str) else "".join(result)
        msg = ChatMessage.objects.create(session=session, role="assistant", content=assistant_text)
        return Response(
            {
                "message": {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at,
                }
            }
        )


class SuggestedQuestionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"suggestions": suggested_questions()})

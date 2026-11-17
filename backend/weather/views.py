from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import fetch_weather


class WeatherView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        city = request.query_params.get("city", "Mumbai")
        return Response(fetch_weather(city))

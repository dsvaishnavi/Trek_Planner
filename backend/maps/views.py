from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import nearby_places


class NearbyPlacesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get("lat", 19.0760))
            lng = float(request.query_params.get("lng", 72.8777))
        except ValueError:
            return Response({"detail": "Invalid lat/lng"}, status=400)
        place_type = request.query_params.get("type", "attractions")
        return Response({"results": nearby_places(lat, lng, place_type), "lat": lat, "lng": lng})

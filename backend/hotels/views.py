from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Hotel


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = "__all__"


class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name", "destination"]
    filterset_fields = ["destination"]

    def get_queryset(self):
        qs = super().get_queryset()
        budget_max = self.request.query_params.get("budget_max")
        min_rating = self.request.query_params.get("min_rating")
        if budget_max:
            qs = qs.filter(price__lte=budget_max)
        if min_rating:
            qs = qs.filter(rating__gte=min_rating)
        return qs

    @action(detail=False, methods=["get"])
    def recommend(self, request):
        qs = self.get_queryset().order_by("-rating", "price")[:12]
        return Response(HotelSerializer(qs, many=True).data)

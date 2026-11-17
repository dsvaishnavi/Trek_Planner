from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from ml_models.budget_predictor import predict_budget


class BudgetPredictSerializer(serializers.Serializer):
    destination = serializers.CharField(required=False, allow_blank=True, default="")
    days = serializers.IntegerField(min_value=1, max_value=60, default=3)
    travelers = serializers.IntegerField(min_value=1, max_value=20, default=2)
    hotel_category = serializers.ChoiceField(
        choices=["budget", "standard", "premium", "luxury"], default="standard"
    )
    transport = serializers.CharField(default="train")
    season = serializers.ChoiceField(
        choices=["winter", "summer", "monsoon", "shoulder"], default="summer"
    )
    activities = serializers.IntegerField(min_value=0, max_value=20, default=3)
    destination_cost_index = serializers.FloatField(required=False, default=3500)


class BudgetPredictView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = BudgetPredictSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        result = predict_budget(ser.validated_data)
        result["destination"] = ser.validated_data.get("destination", "")
        return Response(result)

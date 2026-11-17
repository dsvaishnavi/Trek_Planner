from django.urls import path

from .views import BudgetPredictView

urlpatterns = [
    path("predict/", BudgetPredictView.as_view(), name="budget-predict"),
]

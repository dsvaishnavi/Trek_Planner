"""Budget prediction service wrapping ml_models.budget_predictor."""
from ml_models.budget_predictor import predict as _predict


def predict_budget(inputs: dict) -> dict:
    """
    Return breakdown: hotel, food, transport, activity, shopping, emergency, total.
    """
    return _predict(inputs or {})

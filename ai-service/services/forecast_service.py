from models.schemas import ForecastRequest, ForecastResponseData
from forecasting.arima_model import run_time_series_forecast

def generate_drug_forecast(req: ForecastRequest) -> ForecastResponseData:
    history_values = [p.quantity for p in req.historical_consumption if p.quantity > 0]

    predicted_30, conf_30, trend = run_time_series_forecast(history_values, horizon_days=30)
    predicted_7, _, _ = run_time_series_forecast(history_values, horizon_days=7)
    predicted_90, _, _ = run_time_series_forecast(history_values, horizon_days=90)

    # If requested horizon differs
    if req.days == 7:
        predicted_demand = predicted_7
    elif req.days == 90:
        predicted_demand = predicted_90
    else:
        predicted_demand = predicted_30

    shortage = max(0.0, predicted_30 - req.current_stock)
    safety_stock = req.safety_stock if req.safety_stock is not None else round(predicted_30 * 0.2)
    recommended_order = max(0.0, predicted_30 + safety_stock - req.current_stock)

    return ForecastResponseData(
        drugId=req.drug_id,
        drugName=req.drug_name,
        currentStock=req.current_stock,
        predicted7=predicted_7,
        predicted30=predicted_30,
        predicted90=predicted_90,
        predictedDemand=predicted_demand,
        confidence=conf_30,
        trend=trend,
        shortage=shortage,
        safetyStock=safety_stock,
        recommendedOrder=recommended_order,
        modelName="FastAPI AI Engine (ARIMA + Ensemble Regression)",
        confidenceInterval={
            "lower_bound": round(predicted_demand * 0.88),
            "upper_bound": round(predicted_demand * 1.12),
        }
    )

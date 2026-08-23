from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ConsumptionPoint(BaseModel):
    date: Optional[str] = None
    month: Optional[str] = None
    quantity: float

class ForecastRequest(BaseModel):
    drug_id: str
    drug_name: str
    current_stock: float
    safety_stock: Optional[float] = 500.0
    days: Optional[int] = 30
    historical_consumption: Optional[List[ConsumptionPoint]] = []

class ForecastResponseData(BaseModel):
    drugId: str
    drugName: str
    currentStock: float
    predicted7: float
    predicted30: float
    predicted90: float
    predictedDemand: float
    confidence: float
    trend: str
    shortage: float
    safetyStock: float
    recommendedOrder: float
    modelName: str
    confidenceInterval: Optional[Dict[str, float]] = None

class ForecastResponse(BaseModel):
    success: bool
    data: ForecastResponseData

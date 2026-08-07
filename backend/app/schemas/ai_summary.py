from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RiskLevel = Literal["low", "medium", "high", "critical"]

class AISummaryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    device_id: int = Field(alias="deviceDatabaseId")
    device_uid: str = Field(alias="deviceUid")
    device_name: str = Field(alias="deviceName")
    summary: str
    risk_level: RiskLevel = Field(alias="riskLevel")
    recommended_actions: list[str] = Field(alias="recommendedActions")
    data_start_at: datetime = Field(alias="dataStartAt")
    data_end_at: datetime = Field(alias="dataEndAt")
    telemetry_count: int = Field(alias="telemetryCount")
    active_alert_count: int = Field(alias="activeAlertCount")
    prediction_id: int | None = Field(alias="predictionId")
    created_at: datetime = Field(alias="createdAt")
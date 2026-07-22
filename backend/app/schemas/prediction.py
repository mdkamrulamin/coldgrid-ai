from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RiskLevel = Literal["low", "medium", "high", "critical"]
TemperatureThresholdDirection = Literal["high", "low"]

class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: int
    device_id: int = Field(alias="deviceDatabaseId")   # Internal numeric database ID.
    # Public device details for frontend display.
    device_uid: str | None = Field(default=None, alias="deviceUid")
    device_name: str | None = Field(default=None, alias="deviceName")
    risk_level: RiskLevel = Field(alias="riskLevel")
    risk_score: int = Field(alias="riskScore")
    summary: str
    battery_current_level: float | None = Field(alias="batteryCurrentLevel")
    battery_drain_rate_per_hour: float | None = Field(alias="batteryDrainRatePerHour")
    battery_threshold: float | None = Field(alias="batteryThreshold")
    estimated_hours_to_battery_threshold:float | None = Field(alias="estimatedHoursToBatteryThreshold")
    battery_prediction_message: str | None = Field(alias="batteryPredictionMessage")
    temperature_current: float | None = Field(alias="currentTemperature")
    temperature_change_rate_per_hour: float | None = Field(alias="temperatureChangeRatePerHour")
    temperature_min_threshold: float | None = Field(alias="minTemperature")
    temperature_max_threshold: float | None = Field(alias="maxTemperature")
    estimated_hours_to_temperature_threshold: float | None = Field(alias="estimatedHoursToTemperatureThreshold")
    temperature_threshold_direction: TemperatureThresholdDirection | None = Field(alias="temperatureThresholdDirection")
    temperature_prediction_message: str | None = Field(alias="temperaturePredictionMessage")
    generated_power_current: float | None = Field(alias="generatedPowerCurrent")
    cooling_load_current: float | None = Field(alias="coolingLoadCurrent")
    power_to_cooling_ratio: float | None = Field(alias="powerToCoolingRatio")
    active_alert_count: int = Field(alias="activeAlertCount")
    critical_alert_count: int = Field(alias="criticalAlertCount")
    offline_alert_active: bool = Field(alias="offlineAlertActive")
    created_at: datetime = Field(alias="createdAt")
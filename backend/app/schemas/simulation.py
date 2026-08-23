from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SimulationScenario = Literal[
    "normal",
    "battery_drain",
    "temperature_rise",
    "low_generation",
    "cooling_failure",
    "sensor_failure",
    "power_spike",
]

SimulationTimeRange = Literal["1h", "6h", "24h", "7d"]

class SimulationRunRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    scenario: SimulationScenario = "normal"
    reading_count: int = Field(
        default=40,
        ge=5,
        le=100,
        alias="readingCount",
    )
    time_range: SimulationTimeRange = Field(
        default="1h",
        alias="timeRange"
    )
    
class SimulationRunResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    device_uid: str = Field(alias="deviceUid")
    scenario: SimulationScenario
    reading_count: int = Field(alias="readingCount")
    time_range: SimulationTimeRange = Field(alias="timeRange")
    message: str
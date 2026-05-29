from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class TelemetryCreate(BaseModel):
    """
    Request body for creating a new telemetry reading. This schema validates data sent by a simulator or device
    before it is stored in PostgreSQL.
    """
    device_id: str = Field(
        ...,
        alias="deviceId",
        min_length=1,
        max_length=100,
    )       # Public device identifier generated during device onboarding. The API receives "deviceId" in JSON, while Python uses "device_id".
    
    temperature: float = Field(
        ...,
        ge=-100,
        le=100,
    )       # Current cold-storage temperature in degrees Celsius. Negative values allowed because frozen-storage devices may use them.
    
    humidity: float = Field(
        ...,
        ge=0,
        le=100,
    )
    
    battery_level: float = Field(
        ...,
        alias="batteryLevel",
        ge=0,
        le=100,
    )       # Current battery charge percentage.
    
    generated_power: float = Field(
        ...,
        alias="generatedPower",
        ge=0,
    )       # Renewable power currently being generated. This value is treated as Watts.
    
    cooling_load: float = Field(
        ...,
        alias="coolingLoad",
        ge=0,
    )       # Power currently required by the cooling system. This values is treated as Watts.
    
    wind_speed: float = Field(
        ...,
        alias="windSpeed",
        ge=0,
    )       # Current wind speed in metres per second. No negative wind speed allowed.
    
    status: str = Field(
        default="normal",
        min_length=1,
        max_length=50,
    )       # Device-reported operating status example: normal, warning, failure, sensor_error.
    
    # Allow data to be created using either:
    # API-style names such as batteryLevel
    # Python-style names such as battery_level
    model_config = ConfigDict(populate_by_name=True)
    
class TelemetryResponse(BaseModel):
    """
    Standard response returned after telemetry is stored or retrieved from the database.
    """
    id: int      # Internal database ID of this telemetry record.
    
    """
    The Telemetry database model stores the internal device foreign key. The API route will construct this public device ID in its response.
    """
    device_id: str = Field(alias="deviceId")        # Public ID of the device that sent the telemetry.
    timestamp: datetime      # Time when the backend stored this telemetry record.
    temperature: float
    humidity: float
    battery_level: float = Field(alias="batteryLevel")
    generated_power: float = Field(alias="generatedPower")
    cooling_load: float = Field(alias="coolingLoad")
    wind_speed: float = Field(alias="windSpeed")
    status: str         # Device-reported operating status.
    
    # Allow Pydantic to accept Python-style field names when we construct the response object inside our route.
    model_config = ConfigDict(populate_by_name=True)
    
    

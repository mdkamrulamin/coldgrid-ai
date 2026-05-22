from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

class DeviceCreate(BaseModel):
    """
    Request body for creating a new cold-storage device.
    """
    name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    storage_type: str = Field(..., alias="storageType", min_length=2, max_length=100)
    min_temperature: float = Field(..., alias="minTemperature")
    max_temperature: float = Field(..., alias="maxTemperature")
    min_humidity: float = Field(..., alias="minHumidity", ge=0, le=100)
    max_humidity: float = Field(..., alias="maxHumidity", ge=0, le=100)
    battery_threshold: float = Field(..., alias="batteryThreshold", ge=0, le=100)
    
    model_config = ConfigDict(populate_by_name=True)
    
    @model_validator(mode="after")
    def validate_ranges(self):
        """
        Validate safe temperature and humidity ranges.
        """
        if self.min_temperature >= self.max_temperature:
            raise ValueError("minTemperature must be less than maxTemperature.")
        
        if self.min_humidity >= self.max_humidity:
            raise ValueError("minHumidity must be less than maxHumidity.")
        
        return self
    
class DeviceUpdate(BaseModel):
    """
    Request body for updating an existing device. All fields are optional because update/Patch should update only provided values.
    """
    
    name: str | None = Field(None, min_length=2, max_length=100)
    location: str | None = Field(None, min_length=2, max_length=255)
    storage_type: str | None = Field(None, alias="storageType", min_length=2, max_length=100)
    min_temperature: float | None = Field(None, alias="minTemperature")
    max_temperature: float  | None = Field(None, alias="maxTemperature")
    min_humidity: float  | None = Field(None, alias="minHumidity", ge=0, le=100)
    max_humidity: float  | None = Field(None, alias="maxHumidity", ge=0, le=100)
    battery_threshold: float  | None = Field(None, alias="batteryThreshold", ge=0, le=100)
    
    model_config = ConfigDict(populate_by_name=True)
    
class DeviceResponse(BaseModel):
    """
    Standard device response.
    """
    
    id: int
    device_uid: str = Field(alias="deviceId")       # Public device ID for telemetry/simulator use.
    name: str
    location: str
    storage_type: str = Field(alias="storageType")
    min_temperature: float = Field(alias="minTemperature")
    max_temperature: float = Field(alias="maxTemperature")
    min_humidity: float = Field(alias="minHumidity")
    max_humidity: float = Field(alias="maxHumidity")
    battery_threshold: float = Field(alias="batteryThreshold")
    created_at: datetime = Field(alias="createdAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)      # Allows conversion from SQLAlchemy model objects.
    
class DeviceCreateResponse(DeviceResponse):
    """
    Response returned only after creating a device. It includes the raw API key once. 
    The backend does not store this raw key.
    """
    api_key: str = Field(alias="apiKey")
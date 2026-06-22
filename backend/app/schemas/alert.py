from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

AlertSeverity = Literal["low", "medium", "high", "critical"]
AlertStatus = Literal["active", "resolved"]

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: int
    device_id: int = Field(alias="deviceDatabaseId") #Internal database device ID.
    
    # Public device UID and name are useful for the global alerts page. These will be filled manually in the alerts API response later.
    device_uid: str | None = Field(default=None, alias="deviceUid") 
    device_name: str | None = Field(default=None, alias="deviceName")
    
    alert_type: str = Field(alias="alertType")
    severity: AlertSeverity
    message: str
    status: AlertStatus
    created_at: datetime = Field(alias="createdAt")
    resolved_at: datetime | None = Field(alias="resolvedAt")
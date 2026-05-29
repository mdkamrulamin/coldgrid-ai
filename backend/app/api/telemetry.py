from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import verify_api_key
from app.db.database import get_db
from app.models.device import Device
from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse

# Create a router for telemetry-related endpoints.
#
# We do not set a prefix here because this file will later contain:
# - POST /telemetry
# - GET /devices/{device_id}/telemetry
# - GET /devices/{device_id}/telemetry/latest
router = APIRouter(
    tags=["Telemetry"],
)

def build_telemetry_response(telemetry: Telemetry, device_uid: str,) -> TelemetryResponse:
    """
    Convert a Telemetry database object into an API response.

    Why do we build the response manually?
    - PostgreSQL stores the internal device integer ID, such as 1.
    - The API should return the public device ID, such as dev_a1b2c3d4.
    """
    return TelemetryResponse(
        id=telemetry.id,
        device_id=device_uid,
        timestamp=telemetry.timestamp,
        temperature=telemetry.temperature,
        humidity=telemetry.humidity,
        battery_level=telemetry.battery_level,
        generated_power=telemetry.generated_power,
        cooling_load=telemetry.cooling_load,
        wind_speed=telemetry.wind_speed,
        status=telemetry.status,
    )
    
@router.post(
    "/telemetry",
    response_model=TelemetryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_telemetry_reading(
    telemetry_data: TelemetryCreate,
    device_api_key: Annotated[str, Header(alias="X-Device-API-Key")],   # Read the device API key from the HTTP request header
    db: Session = Depends(get_db),      # Provide a PostgreSQL database session for this request.
):
    """
    Receive and store one telemetry reading from a device.
    1. Read the public device ID from the request body.
    2. Find that device in the database.
    3. Verify the API key sent in the request header.
    4. Save the reading only when credentials are valid.
    """
    device = (
        db.query(Device).filter(Device.device_uid == telemetry_data.device_id)
        .first()
        )       # Find the device using its public device ID.
    
    # This avoids revealing whether a particular device ID exists.
    if device is None or not verify_api_key(device_api_key, device.api_key_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device credentials.",
        )
        
    new_telemetry = Telemetry(
        device_id=device.id,
        temperature=telemetry_data.temperature,
        humidity=telemetry_data.humidity,
        battery_level=telemetry_data.battery_level,
        generated_power=telemetry_data.generated_power,
        cooling_load=telemetry_data.cooling_load,
        wind_speed=telemetry_data.wind_speed,
        status=telemetry_data.status,
    )       # Create a new telemetry database object.     
    
    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)
    
    return build_telemetry_response(
        telemetry=new_telemetry,
        device_uid=device.device_uid,
    )       # Return the saved telemetry reading using the public device ID.
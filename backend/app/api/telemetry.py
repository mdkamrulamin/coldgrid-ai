from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import verify_api_key
from app.db.database import get_db
from app.models.device import Device
from app.models.telemetry import Telemetry
from app.models.user import User
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse
from app.services.alert_service import evaluate_telemetry_alert_rules

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

def get_owned_device_by_uid_or_404(
    device_uid: str,
    current_user: User,
    db: Session,
) -> Device:
    """
    Find a device by its public device ID and confirm that it belongs to the currently logged-in user.
    """
    
    # Search for a device only when its public device ID matches the value in the URL and it belongs to the currently logged-in user
    device = (
        db.query(Device).filter(
            Device.device_uid == device_uid,
            Device.user_id == current_user.id).first()
    )       
    
    # Return 404 both when the device does not exist and when it is not owned by the current user.
    if device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )
    
    return device
 
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
        db.query(Device).filter(
            Device.device_uid == telemetry_data.device_id
        ).first()
    )       # Find the device using its public device ID.
    
    # This avoids revealing whether a particular device ID exists.
    if device is None or not verify_api_key(device_api_key, device.api_key_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device credentials.",
        )
    
    previous_telemetry = (
        db.query(Telemetry).filter(
                Telemetry.device_id == device.id
            ).order_by(Telemetry.timestamp.desc()).first()
    )   # Get previous telemetry before adding the new one.
        
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
    
    # Evaluate alert rules before commit. Alert rows will be committed together with the telemetry reading.
    evaluate_telemetry_alert_rules(
        db=db,
        device=device,
        current_telemetry=new_telemetry,
        previous_telemetry=previous_telemetry,
    )
    
    db.commit()
    db.refresh(new_telemetry)
    
    return build_telemetry_response(
        telemetry=new_telemetry,
        device_uid=device.device_uid,
    )       # Return the saved telemetry reading using the public device ID.
    
@router.get(
    "/devices/{device_uid}/telemetry",
    response_model=list[TelemetryResponse],
)
def list_device_telemetry(
    device_uid: str,
    current_user: User = Depends(get_current_user),     # JWT-authenticated user requesting access to telemetry history.
    db: Session = Depends(get_db),      # Database session used to fetch the device and telemetry records.
):
    """
    Return all telemetry readings for one device owned by the logged-in user. The most recent telemetry readings are returned first.
    """
    
    device = get_owned_device_by_uid_or_404(device_uid=device_uid, current_user=current_user, db=db)
    telemetry_records = (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device.id).order_by(Telemetry.timestamp.desc()).all()
    )       # Find every telemetry record belonging to this device. Newest readings are returned first.
    
    # Convert database telemetry records into API responses. 
    # This ensures the API returns the public device UID instead of the internal PostgreSQL device ID.
    return [
        build_telemetry_response(
            telemetry=telemetry,
            device_uid=device.device_uid,
        )
        for telemetry in telemetry_records
    ]
    
@router.get(
    "/devices/{device_uid}/telemetry/latest",
    response_model=TelemetryResponse,
)
def get_latest_device_telemetry(
    device_uid: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the latest telemetry reading for one device owned by the logged-in user.
    """
    device = get_owned_device_by_uid_or_404(device_uid=device_uid, current_user=current_user, db=db)
    latest_telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device.id).order_by(Telemetry.timestamp.desc()).first()
    )       # Get only the most recently stored telemetry reading.
    
    if latest_telemetry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No telemetry records found for this device.",
        )
    
    return build_telemetry_response(
        telemetry=latest_telemetry,
        device_uid=device.device_uid,
    )       # Return the latest reading using the public device UID.
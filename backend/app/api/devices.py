from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import (
    generate_device_api_key,
    generate_device_uid,
    hash_api_key,
)
from app.db.database import get_db
from app.models.device import Device
from app.models.user import User
from app.schemas.device import DeviceCreate, DeviceCreateResponse, DeviceResponse, DeviceUpdate

router = APIRouter(
    prefix="/devices",
    tags=["Devices"],
)

def get_user_device_or_404(device_id: int,current_user: User,db: Session) -> Device:
    """
    Find a device by ID that belongs to the logged-in user. 
    """
    device = (
        db.query(Device).filter(
            Device.id == device_id,
            Device.user_id == current_user.id,
        ).first()
    )
    
    if device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found."
        )
    return device

def validate_device_ranges(min_temperature: float, max_temperature: float, min_humidity: float, max_humidity: float):
    """
    Validate device threshold ranges.
    """
    if min_temperature >= max_temperature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="minTemperature must be less than maxTemperature.",
        )
    
    if min_humidity >= max_humidity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="minHumidity must be less than maxHumidity.",
        )

def create_unique_device_uid(db: Session) -> str:
    """
    Generate a unique public device ID.
    """
    for _ in range(5):
        device_uid = generate_device_uid()
        existing_device = (
            db.query(Device).filter(Device.device_uid == device_uid).first()
        )
        if existing_device is None:
            return device_uid
        
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not generate a unique device ID.",
    )
    
@router.post(
    "",
    response_model=DeviceCreateResponse,
    status_code=status.HTTP_201_CREATED,
    )
def create_device(device_data: DeviceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),):
    """
    Create a new cold-storage device the user that is logged in.
    """
    device_uid = create_unique_device_uid(db)
    raw_api_key = generate_device_api_key()
    
    new_device = Device(
        device_uid=device_uid,
        user_id=current_user.id,
        name=device_data.name,
        location=device_data.location,
        storage_type=device_data.storage_type,
        min_temperature=device_data.min_temperature,
        max_temperature=device_data.max_temperature,
        min_humidity=device_data.min_humidity,
        max_humidity=device_data.max_humidity,
        battery_threshold=device_data.battery_threshold,
        api_key_hash=hash_api_key(raw_api_key),
    )
    
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    
    return {
        "id": new_device.id,
        "device_uid": new_device.device_uid,
        "name": new_device.name,
        "location": new_device.location,
        "storage_type": new_device.storage_type,
        "min_temperature": new_device.min_temperature,
        "max_temperature": new_device.max_temperature,
        "min_humidity": new_device.min_humidity,
        "max_humidity": new_device.max_humidity,
        "battery_threshold": new_device.battery_threshold,
        "created_at": new_device.created_at,
        "api_key": raw_api_key,
    }

@router.get(
    "",
    response_model=list[DeviceResponse],
)
def list_devices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    List all devices owned by user that is logged in.
    """
    devices = {
        db.query(Device).filter(Device.user_id == current_user.id)
        .order_by(Device.created_at.desc).all()
    }
    
    return devices

@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
)
def get_device(device_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get one device by internal database ID.
    """
    return get_user_device_or_404(device_id, current_user, db)

@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
)
def update_device(
    device_id: int,
    device_data: DeviceUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)):
    """
    Update an existing device. Only updated fields will change.
    """
    device = get_user_device_or_404(device_id, current_user, db)
    update_data = device_data.model_dump(exclude_unset=True)    # Convert provided update fields into a dictionary.
    
    # Apply updates to the SQLAlchemy model object.
    for field_name, value in update_data.items():
        setattr(device, field_name, value)
        
    validate_device_ranges(
        min_temperature=device.min_temperature,
        max_temperature=device.max_temperature,
        min_humidity=device.min_humidity,
        max_humidity=device.max_humidity,
    )       # Validate final thresholds after applying patch data.
    
    db.commit()
    db.refresh(device)
    return device


@router.get(
    "/{device_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_device(device_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Delete one device owned by the logged in user.
    """
    device = get_user_device_or_404(device_id, current_user, db)
    db.delete(device)
    db.commit()
    
    return None          # 204 response should never return a body.
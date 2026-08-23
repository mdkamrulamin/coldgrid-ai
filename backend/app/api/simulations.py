from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.device import Device
from app.models.user import User
from app.schemas.simulation import SimulationRunRequest, SimulationRunResponse
from app.services.demo_simulation_service import run_demo_simulation

router = APIRouter(
    tags=["Simulations"]
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
    "/devices/{device_uid}/simulations/run",
    response_model=SimulationRunResponse,
)
def run_device_simulation(
    device_uid: str,
    simulation_data: SimulationRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    device = get_owned_device_by_uid_or_404(device_uid=device_uid, current_user=current_user, db=db)
    created_count = run_demo_simulation(
        db=db,
        device=device,
        scenario=simulation_data.scenario,
        reading_count=simulation_data.reading_count,
        time_range=simulation_data.time_range,
    )
    
    db.commit()
    
    return SimulationRunResponse(
        device_uid=device.device_uid,
        scenario=simulation_data.scenario,
        reading_count=created_count,
        time_range=simulation_data.time_range,
        message=f"Generated {created_count} demo telemetry readings.",
    )
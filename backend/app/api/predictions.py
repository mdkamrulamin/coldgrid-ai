from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.device import Device
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import run_prediction_for_device

router = APIRouter(tags=["Predictions"])

def get_owned_device_by_uid(db: Session, device_uid: str, current_user: User) -> Device:
    device = (
        db.query(Device).filter(
            Device.device_uid == device_uid,
            Device.user_id == current_user.id
        ).first()
    )
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )
    
    return device

def build_prediction_response(prediction: Prediction, device: Device) -> dict:
    return {
        "id": prediction.id,
        "deviceDatabaseId": prediction.device_id,
        "deviceUid": device.device_uid,
        "deviceName": device.name,
        "riskLevel": prediction.risk_level,
        "riskScore": prediction.risk_score,
        "summary": prediction.summary,
        "batteryCurrentLevel": prediction.battery_current_level,
        "batteryDrainRatePerHour": prediction.battery_drain_rate_per_hour,
        "batteryThreshold": prediction.battery_threshold,
        "estimatedHoursToBatteryThreshold": (prediction.estimated_hours_to_battery_threshold),
        "batteryPredictionMessage": prediction.battery_prediction_message,
        "currentTemperature": prediction.temperature_current,
        "temperatureChangeRatePerHour": (prediction.temperature_change_rate_per_hour),
        "minTemperature": prediction.temperature_min_threshold,
        "maxTemperature": prediction.temperature_max_threshold,
        "estimatedHoursToTemperatureThreshold": (prediction.estimated_hours_to_temperature_threshold),
        "temperatureThresholdDirection": (prediction.temperature_threshold_direction),
        "temperaturePredictionMessage": (prediction.temperature_prediction_message),
        "generatedPowerCurrent": prediction.generated_power_current,
        "coolingLoadCurrent": prediction.cooling_load_current,
        "powerToCoolingRatio": prediction.power_to_cooling_ratio,
        "activeAlertCount": prediction.active_alert_count,
        "criticalAlertCount": prediction.critical_alert_count,
        "offlineAlertActive": prediction.offline_alert_active,
        "createdAt": prediction.created_at,
    }
    
@router.post(
    "/devices/{device_uid}/predictions/run",
    response_model=PredictionResponse,
)
def run_device_prediction(device_uid: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    device = get_owned_device_by_uid(db=db, device_uid=device_uid, current_user=current_user)
    prediction = run_prediction_for_device(db=db, device=device)
    
    db.commit()
    db.refresh(prediction)
    
    return build_prediction_response(
        prediction=prediction,
        device=device
    )
    
@router.get(
    "/devices/{device_uid}/predictions/latest",
    response_model=PredictionResponse,
)
def get_latest_device_prediction(device_uid: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    device = get_owned_device_by_uid(
        db=db,
        device_uid=device_uid,
        current_user=current_user
    )
    prediction = (
        db.query(Prediction).filter(Prediction.device_id == device.id)
        .order_by(Prediction.created_at.desc()).first()
    )
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction found for this device."
        )
    return build_prediction_response(prediction=prediction, device=device)


    
    
    
    
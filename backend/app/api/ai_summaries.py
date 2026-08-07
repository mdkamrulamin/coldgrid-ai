from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.ai_summary import AISummary
from app.models.device import Device
from app.models.user import User
from app.schemas.ai_summary import AISummaryResponse
from app.services.ai_summary_service import generate_ai_summary_for_device

router = APIRouter(tags=["AI Summary"])

def get_owned_device_by_uid(db: Session, device_uid: str, current_user: User) -> Device:
    device = (
        db.query(Device).filter(
            Device.device_uid == device_uid,
            Device.user_id == current_user.id,
        ).first()
    )
    
    if not device: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )
    return device

def build_ai_summary_response(ai_summary: AISummary, device: Device) -> dict:
    return {
        "id": ai_summary.id,
        "deviceDatabaseId": ai_summary.device_id,
        "deviceUid": device.device_uid,
        "deviceName": device.name,
        "summary": ai_summary.summary,
        "riskLevel": ai_summary.risk_level,
        "recommendedActions": ai_summary.recommended_actions,
        "dataStartAt": ai_summary.data_start_at,
        "dataEndAt": ai_summary.data_end_at,
        "telemetryCount": ai_summary.telemetry_count,
        "activeAlertCount": ai_summary.active_alert_count,
        "predictionId": ai_summary.prediction_id,
        "createdAt": ai_summary.created_at,
    }
    
@router.post(
    "/devices/{device_uid}/ai-summary",
    response_model=AISummaryResponse,
)
def generate_device_ai_summart(device_uid: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    device = get_owned_device_by_uid(db=db, device_uid=device_uid, current_user=current_user)
    ai_summary = generate_ai_summary_for_device(db=db, device=device)
    
    db.commit()
    db.refresh(ai_summary)
    
    return build_ai_summary_response(
        ai_summary=ai_summary,
        device=device,
    )

def get_latest_device_ai_summary(device_uid: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    device = get_owned_device_by_uid(db=db, device_uid=device_uid, current_user=current_user)
    ai_summary = (
        db.query(AISummary).filter(AISummary.device_id == device.id)
        .order_by(AISummary.created_at.desc()).first()
    )
    
    if not ai_summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AI summary found for this device."
        )
    return build_ai_summary_response(ai_summary=ai_summary, device=device)
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.alert import Alert
from app.models.device import Device
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertSeverity

router = APIRouter(tags=["Alerts"])

AlertStatusFilter = Literal["active", "resolved"]

def utc_now() -> datetime:
    # Use timezone-aware UTC timestamps for consistency.
    return datetime.now(timezone.utc)

def build_alert_response(alert: Alert, device: Device) -> dict:
    # Alert only stores the internal numeric device_id.
    # The frontend also needs device UID and device name, especially on the global /alerts page.
    return {
        "id": alert.id,
        "deviceDatabaseId": alert.device_id,
        "deviceUid": device.device_uid,
        "deviceName": device.name,
        "alertType": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "status": alert.status,
        "createdAt": alert.created_at,
        "resolvedAt": alert.resolved_at,
    }
    
@router.get("/alerts", response_model=list[AlertResponse])
def get_alerts(
    status_filter: AlertStatusFilter | None = Query(default=None, alias="status"),
    severity_filter: AlertSeverity | None = Query(default=None, alias="severity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    '''
    Return alerts across all devices owned by the logged-in user. Examples:
    - GET /alerts
    - GET /alerts?status=active
    - GET /alerts?severity=critical
    '''
    query = (
        db.query(Alert, Device).join(Device, Alert.device_id == Device.id)
        .filter(Device.user_id == current_user.id)
    )
    
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity_filter:
        query = query.filter(Alert.severity == severity_filter)
        
    results = query.order_by(
        Alert.status.asc(),
        Alert.created_at.desc(),
    ).all()
    
    return [
        build_alert_response(alert=alert, device=device)
        for alert, device in results
    ]
    

@router.get("/devices/{device_uid}/alerts", response_model=list[AlertResponse])
def get_device_alerts(
    device_uid: str,
    status_filter: AlertStatusFilter | None = Query(default=None, alias="status"),
    severity_filter: AlertSeverity | None = Query(default=None, alias="severity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Make sure the requested device belongs to the logged-in user.
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
    
    query = db.query(Alert).filter(Alert.device_id == device.id)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    
    if severity_filter:
        query = query.filter(Alert.severity == severity_filter)
    
    alerts = query.order_by(
        Alert.status.asc(),
        Alert.created_at.desc(),
    ).all()
    
    return [
        build_alert_response(alert=alert, device=device)
        for alert in alerts
    ]

@router.patch("/alerts/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Join Alert with Device so users can only resolve alerts for devices that belong to them.
    result = (
        db.query(Alert, Device).join(Device, Alert.device_id == Device.id)
        .filter(
            Alert.id == alert_id,
            Device.user_id == current_user.id,
        ).first()
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )
    
    alert, device = result
    # If already resolved, return it unchanged.
    if alert.status == "resolved":
        return build_alert_response(alert=alert, device=device)
    alert.status = "resolved"
    alert.resolved_at = utc_now()
    
    db.commit()
    db.refresh(alert)
    return build_alert_response(alert=alert, device=device)
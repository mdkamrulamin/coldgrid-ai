from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.device import Device
from app.models.telemetry import Telemetry

#Alert thresholds not directly stored on device.
POWER_DROP_PERCENTAGE = 0.40
MIN_PREVIOUS_GENERATED_POWER_FOR_DROP = 100.0
LOW_GENERATION_RATIO = 0.50
HIGH_COOLING_LOAD_THRESHOLD = 900.0

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def get_active_alert(db: Session, device_id: int, alert_type: str) -> Alert | None:
    # Find an existing active alert for the same device and alert type. This prevents duplicate active alerts from being created every time a simulator reading arrives.
    return (
        db.query(Alert).filter(
            Alert.device_id == device_id,
            Alert.alert_type == alert_type,
            Alert.status == "active",
        ).first()
    )

def sync_alert(db: Session, device_id: int, alert_type: str, should_be_active: bool, severity: str, message: str) -> None:
    active_alert = get_active_alert(db=db, device_id=device_id, alert_type=alert_type) # Check whether this alert type is already active for the device.
    
    if should_be_active:
        # If the issue is happening and no active alert exists, create a new alert.
        if not active_alert:
            db.add(
                Alert(
                    device_id=device_id,
                    alert_type=alert_type,
                    severity=severity,
                    message=message,
                    status="active",
                )
            )
            return
        # If the alert already exists, update the latest severity/message. This keeps one active alert per device + alert type, instead of creating duplicates every 5 seconds.
        active_alert.severity = severity
        active_alert.message = message
        return
    # If the issue is no longer happening, resolve the active alert.
    if active_alert:
        active_alert.status = "resolved"
        active_alert.resolved_at = utc_now()

def evaluate_generated_power_drop(db: Session, device: Device, current_telemetry: Telemetry, previous_telemetry: Telemetry | None) -> None:
    # A sudden drop requires a previous reading to compare against.
    if not previous_telemetry:
        sync_alert(
            db=db,
            device_id=device.id,
            alert_type="generated_power_drop",
            should_be_active=False,
            severity="high",
            message="Generated power drop recovered.",
        )
        return
    previous_power = previous_telemetry.generated_power
    current_power = current_telemetry.generated_power
    
    has_enough_previous_power = (previous_power >= MIN_PREVIOUS_GENERATED_POWER_FOR_DROP)
    drop_ratio = 0.0
    if previous_power > 0:
        drop_ratio = (previous_power - current_power) / previous_power
        
    has_sudden_drop = (has_enough_previous_power and drop_ratio >= POWER_DROP_PERCENTAGE)
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="generated_power_drop",
        should_be_active=has_sudden_drop,
        severity="high",
        message=(
            f"Generated power dropped suddenly from {previous_power} W to {current_power} W."
        ),
    )
    
def evaluate_telemetry_alert_rules(db: Session, device: Device, current_telemetry: Telemetry, previous_telemetry: Telemetry | None) -> None:
    # If telemetry has arrived, the device is no longer offline.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="device_offline",
        should_be_active=False,
        severity="high",
        message="Device is back online.",
    )
    
    #Temperature too high.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="temperature_high",
        should_be_active=current_telemetry.temperature > device.max_temperature,
        severity="critical",
        message=(
            f"Temperature is too high: {current_telemetry.temperature}°C. Maximum allowed is {device.max_temperature}°C."
        ),
    )
    
    #Temperature too low.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="temperature_low",
        should_be_active=current_telemetry.temperature < device.min_temperature,
        severity="critical",
        message=(
            f"Temperature is too low: {current_telemetry.temperature}°C. Minimum allowed is {device.min_temperature}°C."
        ),
    )
    
    #Humidity too high.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="humidity_high",
        should_be_active=current_telemetry.humidity > device.max_humidity,
        severity="medium",
        message=(
            f"Humidity is too high: {current_telemetry.humidity}%. Maximum allowed is {device.max_humidity}%."
        ),
    )
    
    #Humidity too low.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="humidity_low",
        should_be_active=current_telemetry.humidity < device.min_humidity,
        severity="medium",
        message=(
            f"Humidity is too high: {current_telemetry.humidity}%. Minimum allowed is {device.min_humidity}%."
        ),
    )
    
    #Battery below configured threshold.
    battery_is_low = current_telemetry.battery_level < device.battery_threshold
    battery_severity = (
        "critical"
        if current_telemetry.battery_level < device.battery_threshold / 2
        else "medium"
    )
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="battery_low",
        should_be_active=battery_is_low,
        severity=battery_severity,
        message=(
            f"Battery is low: {current_telemetry.battery_level}%. Threshold is {device.battery_threshold}%."
        ),
    )
    
    #Generated power sudden drop compared to previous telemetry.
    evaluate_generated_power_drop(
        db=db,
        device=device,
        current_telemetry=current_telemetry,
        previous_telemetry=previous_telemetry,
    )
    #Generated power is too low compared to cooling demand.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="low_generation",
        should_be_active=(current_telemetry.generated_power < current_telemetry.cooling_load * LOW_GENERATION_RATIO),
        severity="high",
        message=(
            f"Generated power is low: {current_telemetry.generated_power} W. Cooling load is {current_telemetry.cooling_load} W."
        ),
    )
    
    # Cooling load unusually high.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="high_cooling_load",
        should_be_active=(current_telemetry.cooling_load > HIGH_COOLING_LOAD_THRESHOLD),
        severity="medium",
        message=(
            f"Cooling load is unusually high: {current_telemetry.cooling_load} W."
        ),
    )
    
    telemetry_status = current_telemetry.status.lower()
    # Abnormal sensor value from simulator.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="sensor_failure",
        should_be_active=telemetry_status == "sensor_error",
        severity="critical",
        message="Sensor readings appear abnormal or unreliable.",
    )
    
    # Cooling failure from simulator or suspicious cooling behaviour.
    sync_alert(
        db=db,
        device_id=device.id,
        alert_type="cooling_failure",
        should_be_active=(
            telemetry_status == "failure"
            or (
                current_telemetry.cooling_load < 50 
                and current_telemetry.temperature > device.max_temperature
            )
        ),
        severity="critical",
        message="Cooling system may not be operating correctly.",
    )
    
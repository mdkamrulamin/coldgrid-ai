from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.device import Device
from app.models.prediction import Prediction
from app.models.telemetry import Telemetry

RECENT_TELEMETRY_LIMIT = 20     # Number of recent telemetry readings used for trend calculation.

# Risk score boundaries.
LOW_RISK_MAX = 24
MEDIUM_RISK_MAX = 49
HIGH_RISK_MAX = 74

def ensure_aware_utc(value: datetime) -> datetime:
    # To safely compare timestamps, treat values as UTC.
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    
    return value.astimezone(timezone.utc)

def round_or_none(value: float | None, digits: int = 2) -> float | None:
    if value is None:
        return None
    
    return round(value, digits)

def pluralize(value: int, unit: str) -> str:
    if value == 1:
        return f"{value} {unit}"
    return f"{value} {unit}s"

def format_duration_from_hours(hours: float) -> str:
    # 0.04 hours -> 2 minutes 24 seconds
    # 1.5 hours  -> 1 hour 30 minutes
    # 28 hours   -> 1 day 4 hours
    # 800 hours  -> 1 month 3 days
    total_seconds = max(0, int(round(hours * 3600)))
    if total_seconds == 0:
        return "less than 1 second"
    units = [
        ("year", 365 * 24 * 60 * 60),
        ("month", 30 * 24 * 60 * 60),
        ("day", 24 * 60 * 60),
        ("hour", 60 * 60),
        ("minute", 60),
        ("second", 1),
    ]
    
    parts: list[str] = []
    remaining_seconds = total_seconds
    
    for unit_name, unit_seconds in units:
        value = remaining_seconds // unit_seconds
        
        if value == 0:
            continue
        
        parts.append(pluralize(value, unit_name))
        remaining_seconds = remaining_seconds % unit_seconds
        
        # Show only the two biggest useful units.
        # Example: 1 day 4 hours, not 1 day 4 hours 12 minutes 3 seconds.
        if len(parts) == 2:
            break
    return " ".join(parts)

def get_risk_level(risk_score: int) -> str:
    if risk_score <= LOW_RISK_MAX:
        return "low"
    
    if risk_score <= MEDIUM_RISK_MAX:
        return "medium"
    
    if risk_score <= HIGH_RISK_MAX:
        return "high"
    
    return "critical"

def get_recent_telemetry(db: Session, device_id: int) -> list[Telemetry]:
    # Fetch newest readings first from the database.
    newest_first_readings = (
        db.query(Telemetry).filter(Telemetry.device_id == device_id)
        .order_by(Telemetry.timestamp.desc()).limit(RECENT_TELEMETRY_LIMIT).all()
    )
    # Reverse so calculations go from old to new.
    return list(reversed(newest_first_readings))

def get_active_alerts(db: Session, device_id: int) -> list[Alert]:
    return (
        db.query(Alert).filter(
            Alert.device_id == device_id,
            Alert.status == "active"
        ).all()
    )

def calculate_hours_between(older_reading: Telemetry, newer_reading: Telemetry) -> float:
    older_timestamp = ensure_aware_utc(older_reading.timestamp)
    newer_timestamp = ensure_aware_utc(newer_reading.timestamp)
    seconds = (newer_timestamp - older_timestamp).total_seconds()
    
    if seconds <= 0:
        return 0
    
    return seconds / 3600

def calculate_battery_prediction(device: Device, readings: list[Telemetry]) -> dict:
    latest_reading = readings[-1]
    current_battery = latest_reading.battery_level
    battery_threshold = device.battery_threshold
    
    if len(readings) <2:
        return {
            "battery_current_level": current_battery,
            "battery_drain_rate_per_hour": None,
            "battery_threshold": battery_threshold,
            "estimated_hours_to_battery_threshold": None,
            "battery_prediction_message": (
                "Not enough telemetry readings to calculate battery drain rate."
            )
        }
    oldest_reading = readings[0]
    hours_elapsed = calculate_hours_between(
        older_reading=oldest_reading,
        newer_reading=latest_reading,
    )
    
    if hours_elapsed == 0:
        return {
            "battery_current_level": current_battery,
            "battery_drain_rate_per_hour": None,
            "battery_threshold": battery_threshold,
            "estimated_hours_to_battery_threshold": None,
            "battery_prediction_message": (
                "Not enough time has passed to calculate battery drain rate."
            )
        }
    battery_drain = oldest_reading.battery_level - current_battery
    drain_rate_per_hour = battery_drain / hours_elapsed
    
    if current_battery <= battery_threshold:
        estimated_hours = 0.0
        message = (
            f"Battery is already below the threshold of "
            f"{battery_threshold}%."
        )
    elif drain_rate_per_hour <= 0:
        estimated_hours = None
        message = (
            "Battery is not currently draining based on recent telemetry."
        )        
    else:
        estimated_hours = (current_battery - battery_threshold) / drain_rate_per_hour
        readable_duration = format_duration_from_hours(estimated_hours)
        message = (
            f"Battery may fall below {battery_threshold}% in "
            f"{readable_duration} if current drain continues."
        )
    return {
        "battery_current_level": current_battery,
        "battery_drain_rate_per_hour": drain_rate_per_hour,
        "battery_threshold": battery_threshold,
        "estimated_hours_to_battery_threshold": estimated_hours,
        "battery_prediction_message": message,
    }
    
def calculate_temperature_prediction(device: Device, readings: list[Telemetry]) -> dict:
    latest_reading = readings[-1]
    current_temperature = latest_reading.temperature
    min_temperature = device.min_temperature
    max_temperature = device.max_temperature
    
    if len(readings) <2:
        return {
            "temperature_current": current_temperature,
            "temperature_change_rate_per_hour": None,
            "temperature_min_threshold": min_temperature,
            "temperature_max_threshold": max_temperature,
            "estimated_hours_to_temperature_threshold": None,
            "temperature_threshold_direction": None,
            "temperature_prediction_message": (
                "Not enough telemetry readings to calculate temperature trend."
            )
        }
    oldest_reading = readings[0]
    hours_elapsed = calculate_hours_between(older_reading=oldest_reading, newer_reading=latest_reading)
    if hours_elapsed == 0:
        return {
            "temperature_current": current_temperature,
            "temperature_change_rate_per_hour": None,
            "temperature_min_threshold": min_temperature,
            "temperature_max_threshold": max_temperature,
            "estimated_hours_to_temperature_threshold": None,
            "temperature_threshold_direction": None,
            "temperature_prediction_message": (
                "Not enough time has passed to calculate temperature trend."
            )
        }
    temperature_change = current_temperature - oldest_reading.temperature
    change_rate_per_hour = temperature_change / hours_elapsed
    estimated_hours = None
    direction = None
    
    if current_temperature > max_temperature:
        estimated_hours = 0.0
        direction = "high"
        message = (
            f"Temperature is already above the maximum safe threshold of "
            f"{max_temperature}°C."
        )
    elif current_temperature < min_temperature:
        estimated_hours = 0.0
        direction = "low"
        message = (
            f"Temperature is already below the minimum safe threshold of "
            f"{min_temperature}°C."
        )
    elif change_rate_per_hour > 0:
        estimated_hours = (max_temperature - current_temperature) / change_rate_per_hour
        direction = "high"
        readable_duration = format_duration_from_hours(estimated_hours)
        message = (
            f"Temperature may exceed {max_temperature}°C in "
            f"{readable_duration} if current trend continues."
        )
    elif change_rate_per_hour < 0:
        estimated_hours = (current_temperature - min_temperature) / abs(change_rate_per_hour)
        direction = "low"
        readable_duration = format_duration_from_hours(estimated_hours)
        message = (
            f"Temperature may fall below {min_temperature}°C in "
            f"{readable_duration} if current trend continues."
        )
    else:
        message = "Temperature is stable based on recent telemetry."
    return {
        "temperature_current": current_temperature,
        "temperature_change_rate_per_hour": change_rate_per_hour,
        "temperature_min_threshold": min_temperature,
        "temperature_max_threshold": max_temperature,
        "estimated_hours_to_temperature_threshold": estimated_hours,
        "temperature_threshold_direction": direction,
        "temperature_prediction_message": message
    }
    
def calculate_risk_score(
    device: Device, 
    readings: list[Telemetry], 
    active_alerts: list[Alert], 
    battery_prediction: dict,
    temperature_prediction: dict,
) -> tuple[int, str]:
    risk_score = 0
    reasons: list[str] = []
    latest_reading = readings[-1] if readings else None
    offline_alert_active = any(
        alert.alert_type == "device_offline"
        for alert in active_alerts
    )
    critical_alert_count = sum(
        1 for alert in active_alerts if alert.severity == "critical"
    )
    high_alert_count = sum(
        1 for alert in active_alerts if alert.severity == "high"
    )
    medium_alert_count = sum(
        1 for alert in active_alerts if alert.severity == "medium"
    )
    low_alert_count = sum(
        1 for alert in active_alerts if alert.severity == "low"
    )
    if offline_alert_active:
        risk_score += 45
        reasons.append("Device is currently offline.")
        
    risk_score += critical_alert_count * 30
    risk_score += high_alert_count * 20
    risk_score += medium_alert_count * 10
    risk_score += low_alert_count * 5
    
    if critical_alert_count > 0:
        reasons.append("Critical active alerts are present.")
    elif high_alert_count > 0:
        reasons.append("High severity active alerts are present.")
    elif medium_alert_count > 0:
        reasons.append("Medium severity active alerts are present.")
    
    estimated_battery_hours = battery_prediction["estimated_hours_to_battery_threshold"]
    if estimated_battery_hours is not None:
        if estimated_battery_hours <= 0:
            risk_score += 25
            reasons.append("Battery is already below threshold.")
        elif estimated_battery_hours <= 1:
            risk_score += 25
            reasons.append("Battery may reach threshold within 1 hour.")
        elif estimated_battery_hours <= 4:
            risk_score += 15
            reasons.append("Battery may reach threshold within 4 hours.")
    
    estimated_temperature_hours = temperature_prediction["estimated_hours_to_temperature_threshold"]
    if estimated_temperature_hours is not None:
        if estimated_temperature_hours <= 0:
            risk_score += 30
            reasons.append("Temperature is already outside the safe range.")
        elif estimated_temperature_hours <= 1:
            risk_score += 25
            reasons.append("Temperature may cross threshold within 1 hour.")
        elif estimated_temperature_hours <= 4:
            risk_score += 15
            reasons.append("Temperature may cross threshold within 4 hour.")
            
    if latest_reading:
        if latest_reading.cooling_load > 0:
            power_to_cooling_ratio = (latest_reading.generated_power / latest_reading.cooling_load)

            if power_to_cooling_ratio < 0.5:
                risk_score += 20
                reasons.append("Generated power is far below cooling demand.")
            elif power_to_cooling_ratio < 0.8:
                risk_score += 10
                reasons.append("Generated power is below cooling demand.")
        if latest_reading.cooling_load > 900:
            risk_score += 10
            reasons.append("Cooling load is unusually high.")
    
    risk_score = min(risk_score, 100)
    
    if not reasons:
        reasons.append("Device conditions look stable based on recent data.")
        
    return risk_score, " ".join(reasons)

def run_prediction_for_device(db: Session, device: Device) -> Prediction:
    readings = get_recent_telemetry(db=db, device_id=device.id)
    active_alerts = get_active_alerts(db=db, device_id=device.id)
    offline_alert_active = any(
        alert.alert_type == "device_offline"
        for alert in active_alerts
    )
    active_alert_count = len(active_alerts)
    critical_alert_count = sum(
        1 for alert in active_alerts if alert.severity == "critical"
    )
    
    if not readings:
        risk_score = 80 if offline_alert_active else 40
        risk_level = get_risk_level(risk_score)
        
        prediction = Prediction(
            device_id=device.id,
            risk_level=risk_level,
            risk_score=risk_score,
            summary =(
                "No telemetry is available for this device."
                "Prediction accuracy is limited."
            ),
            active_alert_count=active_alert_count,
            critical_alert_count=critical_alert_count,
            offline_alert_active=offline_alert_active,
        )
        db.add(prediction)
        return prediction
    
    latest_reading = readings[-1]
    battery_prediction = calculate_battery_prediction(device=device, readings=readings)
    temperature_prediction = calculate_temperature_prediction(device=device, readings=readings)
    risk_score, summary = calculate_risk_score(
        device=device,
        readings=readings,
        active_alerts=active_alerts,
        battery_prediction=battery_prediction,
        temperature_prediction=temperature_prediction,
    )
    risk_level = get_risk_level(risk_score)
    
    power_to_cooling_ratio = None
    
    if latest_reading.cooling_load > 0:
        power_to_cooling_ratio = (latest_reading.generated_power / latest_reading.cooling_load)
        
    prediction = Prediction(
        device_id=device.id,
        risk_level=risk_level,
        risk_score=risk_score,
        summary=summary,
        battery_current_level=round_or_none(
            battery_prediction["battery_current_level"],
        ),
        battery_drain_rate_per_hour=round_or_none(
            battery_prediction["battery_drain_rate_per_hour"],
        ),
        battery_threshold=round_or_none(
            battery_prediction["battery_threshold"],
        ),
        estimated_hours_to_battery_threshold=round_or_none(
            battery_prediction["estimated_hours_to_battery_threshold"],
        ),
        battery_prediction_message=battery_prediction[
            "battery_prediction_message"
        ],
        temperature_current=round_or_none(
            temperature_prediction["temperature_current"],
        ),
        temperature_change_rate_per_hour=round_or_none(
            temperature_prediction["temperature_change_rate_per_hour"],
        ),
        temperature_min_threshold=round_or_none(
            temperature_prediction["temperature_min_threshold"],
        ),
        temperature_max_threshold=round_or_none(
            temperature_prediction["temperature_max_threshold"],
        ),
        estimated_hours_to_temperature_threshold=round_or_none(
            temperature_prediction[
                "estimated_hours_to_temperature_threshold"
            ],
        ),
        temperature_threshold_direction=temperature_prediction[
            "temperature_threshold_direction"
        ],
        temperature_prediction_message=temperature_prediction[
            "temperature_prediction_message"
        ],
        generated_power_current=round_or_none(latest_reading.generated_power),
        cooling_load_current=round_or_none(latest_reading.cooling_load),
        power_to_cooling_ratio=round_or_none(power_to_cooling_ratio),
        active_alert_count=active_alert_count,
        critical_alert_count=critical_alert_count,
        offline_alert_active=offline_alert_active,
    )
    
    db.add(prediction)
    
    return prediction
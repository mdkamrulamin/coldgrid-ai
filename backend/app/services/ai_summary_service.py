from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.ai_summary import AISummary
from app.models.alert import Alert
from app.models.device import Device
from app.models.prediction import Prediction
from app.models.telemetry import Telemetry

SUMMARY_WINDOW_HOURS = 24

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def ensure_aware_utc(value: datetime) -> datetime:
    # Some older models may still store naive datetime values. A naive datetime has no timezone information.
    # To safely compare times, we treat naive values as UTC.
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)

def get_telemetry_for_summary(db: Session, device_id: int, start_at: datetime, end_at: datetime) -> list[Telemetry]:
    return (
        db.query(Telemetry).filter(
            Telemetry.device_id == device_id,
            Telemetry.timestamp >= start_at,
            Telemetry.timestamp <= end_at,
        ).order_by(Telemetry.timestamp.asc()).all()
    )
    
def get_active_alerts_for_summary(db: Session, device_id: int) -> list[Alert]:
    return (
        db.query(Alert).filter(
            Alert.device_id == device_id,
            Alert.status == "active",
        ).order_by(Alert.created_at.desc()).all()
    )
    
def get_latest_prediction_for_summary(db: Session, device_id: int) -> Prediction | None:
    return (
        db.query(Prediction).filter(Prediction.device_id == device_id)
        .order_by(Prediction.created_at.desc()).first()
    )

def get_risk_level_from_alerts(active_alerts: list[Alert]) -> str:
    if any(alert.severity == "critical" for alert in active_alerts):
        return "critical"
    
    if any(alert.severity == "high" for alert in active_alerts):
        return "high"
    
    if any(alert.severity == "medium" for alert in active_alerts):
        return "medium"
    
    return "low"

def get_summary_risk_level(latest_prediction: Prediction | None, active_alerts: list[Alert]) -> str:
    # If a prediction exists, trust it because it already combines telemetry, alerts, offline state, and cooling context.
    if latest_prediction:
        return latest_prediction.risk_level
    
    return get_risk_level_from_alerts(active_alerts)

def calculate_average(values: list[float]) -> float | None:
    if not values:
        return None
    
    return round(sum(values) / len(values), 2)

def format_alert_type(alert_type: str) -> str:
    return alert_type.replace("_", " ")

def add_unique_action(actions: list[str], action: str) -> None:
    if action not in actions:
        actions.append(action)
    
def generate_recommended_actions(active_alerts: list[Alert], latest_prediction: Prediction | None) -> list[str]:
    actions: list[str] = []
    for alert in active_alerts:
        if alert.alert_type == "device_offline":
            add_unique_action(
                actions,
                "Check the device power connection and network connectivity.",
            )
        elif alert.alert_type in ["temperature_high", "temperature_low"]:
            add_unique_action(
                actions,
                "Inspect the cooling system and verify the storage temperature.",
            )
        elif alert.alert_type in ["humidity_high", "humidity_low"]:
            add_unique_action(
                actions,
                "Check humidity controls and inspect the storage environment.",
            )
        elif alert.alert_type == "battery_low":
            add_unique_action(
                actions,
                "Recharge or replace the device battery soon.",
            )
        elif alert.alert_type in ["generated_power_drop", "low_generation"]:
            add_unique_action(
                actions,
                "Check the renewable power input and power generation source.",
            )
        elif alert.alert_type == "high_cooling_load":
            add_unique_action(
                actions,
                "Inspect door seals, insulation, and cooling load demand.",
            )
        elif alert.alert_type == "sensor_failure":
            add_unique_action(
                actions,
                "Inspect or replace the device sensor.",
            )
        elif alert.alert_type == "cooling_failure":
            add_unique_action(
                actions,
                "Inspect the cooling unit immediately.",
            )
    
    if latest_prediction:
        if latest_prediction.offline_alert_active:
            add_unique_action(
                actions,
                "Restore device communication before relying on new telemetry.",
            )
        if latest_prediction.estimated_hours_to_battery_threshold is not None:
            if latest_prediction.estimated_hours_to_battery_threshold <= 4:
                add_unique_action(
                    actions,
                    "Monitor battery level closely over the next few hours.",
                )
        if latest_prediction.estimated_hours_to_temperature_threshold is not None:
            if latest_prediction.estimated_hours_to_temperature_threshold <= 4:
                add_unique_action(
                    actions,
                    "Monitor temperature trend and prepare corrective action.",
                )
        if latest_prediction.power_to_cooling_ratio is not None:
            if latest_prediction.power_to_cooling_ratio < 0.8:
                add_unique_action(
                    actions,
                    "Compare generated power with cooling demand and investigate power shortage.",
                )
    
    if not actions:
        actions.append("Continue monitoring the device. No immediate action is required.")
        
    return actions

def generate_summary_text(
    device: Device,
    telemetry_readings: list[Telemetry],
    active_alerts: list[Alert],
    latest_prediction: Prediction | None,
    risk_level: str,
) -> str:
    telemetry_count = len(telemetry_readings)
    if telemetry_count == 0:
        if active_alerts:
            alert_names = ", ".join(
                format_alert_type(alert.alert_type)
                for alert in active_alerts[:3]
            )
            
            return (
                f"{device.name} has no telemetry in the last "
                f"{SUMMARY_WINDOW_HOURS} hours. Current risk is {risk_level}. "
                f"Active alerts include {alert_names}."
            )
        
        return (
            f"{device.name} has no telemetry in the last "
            f"{SUMMARY_WINDOW_HOURS} hours. Current risk is {risk_level}. "
            "There is not enough recent data to summarize device performance."
        )
    
    first_reading = telemetry_readings[0]
    latest_reading = telemetry_readings[-1]
    temperatures = [reading.temperature for reading in telemetry_readings]
    battery_levels = [reading.battery_level for reading in telemetry_readings]
    generated_power_values = [reading.generated_power for reading in telemetry_readings]
    cooling_load_values = [reading.cooling_load for reading in telemetry_readings]
    min_temperature = round(min(temperatures), 2)
    max_temperature = round(max(temperatures), 2)
    average_temperature = calculate_average(temperatures)
    battery_change = round(latest_reading.battery_level - first_reading.battery_level, 2)
    average_generated_power = calculate_average(generated_power_values)
    average_cooling_load = calculate_average(cooling_load_values)
    
    if battery_change < 0:
        battery_sentence = (
            f"Battery decreased by {abs(battery_change)} percentage points during the summary window."
        )
    elif battery_change > 0:
        battery_sentence = (
            f"Battery increased by {battery_change} percentage points during the summary window."
        )
    else:
        battery_sentence = "Battery stayed nearly unchanged during the summary window."
    
    alert_sentence = (
        f"There are {len(active_alerts)} active alerts."
        if active_alerts
        else "There are no active alerts."
    )
    
    prediction_sentence = ""
    
    if latest_prediction:
        prediction_sentence = (
            f" Latest prediction risk is {latest_prediction.risk_level} "
            f"with a score of {latest_prediction.risk_score}/100."
        )
    return (
        f"{device.name} reported {telemetry_count} telemetry readings in the last "
        f"{SUMMARY_WINDOW_HOURS} hours. Temperature ranged from "
        f"{min_temperature}°C to {max_temperature}°C, with an average of "
        f"{average_temperature}°C. {battery_sentence} Average generated power "
        f"was {average_generated_power} W and average cooling load was "
        f"{average_cooling_load} W. Current risk is {risk_level}. "
        f"{alert_sentence}{prediction_sentence}"
    )
    
def generate_ai_summary_for_device(db: Session, device: Device) -> AISummary:
    end_at = utc_now()
    start_at = end_at - timedelta(hours=SUMMARY_WINDOW_HOURS)
    
    telemetry_readings = get_telemetry_for_summary(
        db=db,
        device_id=device.id,
        start_at=start_at,
        end_at=end_at,
    )
    active_alerts = get_active_alerts_for_summary(db=db, device_id=device.id)
    latest_prediction = get_latest_prediction_for_summary(db=db, device_id=device.id)
    risk_level = get_summary_risk_level(latest_prediction=latest_prediction, active_alerts=active_alerts)
    summary = generate_summary_text(
        device=device,
        telemetry_readings=telemetry_readings,
        active_alerts=active_alerts,
        latest_prediction=latest_prediction,
        risk_level=risk_level,
    )
    recommended_actions = generate_recommended_actions(active_alerts=active_alerts, latest_prediction=latest_prediction)
    
    ai_summary = AISummary(
        device_id=device.id,
        summary=summary,
        risk_level=risk_level,
        recommended_actions=recommended_actions,
        data_start_at=start_at,
        data_end_at=end_at,
        telemetry_count=len(telemetry_readings),
        active_alert_count=len(active_alerts),
        prediction_id=latest_prediction.id if latest_prediction else None,
    )
    
    db.add(ai_summary)
    
    return ai_summary
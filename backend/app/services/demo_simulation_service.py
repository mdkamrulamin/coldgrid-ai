from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.telemetry import Telemetry
from app.schemas.simulation import SimulationScenario, SimulationTimeRange
from app.services.alert_service import evaluate_telemetry_alert_rules

TIME_RANGE_TO_DELTA: dict[SimulationTimeRange, timedelta] = {
    "1h": timedelta(hours=1),
    "6h": timedelta(hours=6),
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
}

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def calculate_reading_timestamp(
    start_time: datetime,
    end_time: datetime,
    index: int,
    reading_count: int,
) -> datetime:
    """
    Spread generated readings evenly between start_time and end_time. Example:
    - 40 readings over 6h
    - first reading is around 6h ago
    - final reading is around now
    """
    if reading_count <= 1:
        return end_time
    
    total_seconds = (end_time - start_time).total_seconds()
    step_seconds = total_seconds / (reading_count - 1)
    
    return start_time + timedelta(seconds=step_seconds * index)

def generate_demo_values(scenario: SimulationScenario, index: int, reading_count: int) -> dict[str, float | str]:
    """
    Generate one synthetic telemetry reading. The values are intentionally simple and predictable so the it is easy to understand.
    """
    progress = index / max(reading_count - 1, 1)
    temperature = 4.0
    humidity = 72.0
    battery_level = 88.0
    generated_power = 520.0
    cooling_load = 420.0
    wind_speed = 8.0
    status = "normal"
    
    if scenario == "battery_drain":
        battery_level = 88.0 - (55.0 * progress)
        generated_power = 260.0
        cooling_load = 540.0
        status = "warning" if progress > 0.5 else "normal"

    elif scenario == "temperature_rise":
        temperature = 3.5 + (8.0 * progress)
        cooling_load = 760.0
        status = "warning" if progress > 0.6 else "normal"

    elif scenario == "low_generation":
        generated_power = 520.0 - (390.0 * progress)
        battery_level = 88.0 - (25.0 * progress)
        status = "warning" if progress > 0.5 else "normal"

    elif scenario == "cooling_failure":
        temperature = 4.0 + (10.0 * progress)
        cooling_load = 980.0
        generated_power = 420.0
        status = "critical" if progress > 0.75 else "warning"

    elif scenario == "sensor_failure":
        temperature = -99.0 if index % 5 == 0 else 4.0
        humidity = 0.0 if index % 5 == 0 else 72.0
        status = "critical" if index % 5 == 0 else "normal"

    elif scenario == "power_spike":
        generated_power = 1300.0 if index % 6 == 0 else 520.0
        cooling_load = 900.0 if index % 6 == 0 else 430.0
        status = "warning" if index % 6 == 0 else "normal"
        
    return {
        "temperature": round(temperature, 2),
        "humidity": round(humidity, 2),
        "battery_level": round(max(battery_level, 0), 2),
        "generated_power": round(max(generated_power, 0), 2),
        "cooling_load": round(max(cooling_load, 0), 2),
        "wind_speed": round(wind_speed, 2),
        "status": status,
    }

def run_demo_simulation(
    db: Session,
    device: Device,
    scenario: SimulationScenario,
    reading_count: int,
    time_range: SimulationTimeRange,
) -> int:
    """
    Generate demo telemetry for the device in question. Alert rules are evaluated after each generated reading so the it looks real.
    """
    end_time = utc_now()
    start_time = end_time - TIME_RANGE_TO_DELTA[time_range]
    previous_telemetry = (
        db.query(Telemetry).filter(Telemetry.device_id == device.id)
        .order_by(Telemetry.timestamp.desc()).first()
    )
    created_count = 0
    
    for index in range(reading_count):
        values = generate_demo_values(scenario=scenario, index=index, reading_count=reading_count)
        telemetry = Telemetry(
            device_id=device.id,
            timestamp=calculate_reading_timestamp(
                start_time=start_time,
                end_time=end_time,
                index=index,
                reading_count=reading_count,
            ),
            temperature=values["temperature"],
            humidity=values["humidity"],
            battery_level=values["battery_level"],
            generated_power=values["generated_power"],
            cooling_load=values["cooling_load"],
            wind_speed=values["wind_speed"],
            status=values["status"],
        )
        
        db.add(telemetry)
        
        evaluate_telemetry_alert_rules(
            db=db, 
            device=device, 
            current_telemetry=telemetry, 
            previous_telemetry=previous_telemetry
        )
        
        # Flush after each simulated reading so duplicate-alert checks can see alerts created earlier in this same batch request.
        db.flush()
        
        previous_telemetry = telemetry
        created_count += 1
    
    return created_count
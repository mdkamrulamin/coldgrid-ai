import random

from scenarios.base import TelemetryReading
from scenarios.normal import NormalScenario

class PowerSpikeScenario(NormalScenario):
    """
    Simulates unexpected high generated-power readings. Real world causes:
    - Electrical surge
    - Renewable controller issue
    - Abnormal sensor or inverter behaviour
    """
    def __init__(self) -> None:
        """
        Start with stable cold-room operating values.
        """
        super().__init__()
        self.generated_power = 340.0    # Begin in a stable state before unusually high readings appear.
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one telemetry reading with an abnormal power spike.
        """
        self.temperature = self._clamp(
            self.temperature + random.uniform(-0.15, 0.15),
            minimum=1.5,
            maximum=4.8,
        )       # Temperature remains stable.
        
        self.humidity = self._clamp(
            self.humidity + random.uniform(-0.8, 0.8),
            minimum=62.0,
            maximum=78.0,
        )       # Humidity remains stable.
        
        self.battery_level = self._clamp(
            self.battery_level + random.uniform(0.1, 0.5),
            minimum=0.0,
            maximum=100.0,
        )       # Battery may increase slightly due to unusually high generated power.
        
        self.generated_power = random.uniform(850.0, 1450.0)   # Generated power jumps far above normal operating values.
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-8.0, 8.0),
            minimum=170.0,
            maximum=260.0,
        )       # Cooling load stays within normal range.
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(0.5, 1.5),
            minimum=6.0,
            maximum=18.0,
        )       # Wind may also appear unusually strong.
        
        return TelemetryReading(
            temperature=round(self.temperature, 2),
            humidity=round(self.humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="warning",
        )
    
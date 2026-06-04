import random

from scenarios.base import TelemetryReading
from scenarios.normal import NormalScenario

class BatteryDrainScenario(NormalScenario):
    """
    Simulates a device whose battery is losing charge too quickly. Possible real-world causes:
    - Low renewable generation
    - High cooling demand
    - Battery degradation
    """
    def __init__(self) -> None:
        """
        Start the simulated device with moderate battery charge and reduced generated power.
        """
        super().__init__()
        self.battery_level = 72.0       # Start lower than normal so the battery trend becomes visible sooner.
        self.generated_power = 135.0    # Simulate weak renewable input.
        self.cooling_load = 245.0       # Cooling system is still operating and consuming power.
        self.wind_speed = 2.3           # Lower wind speed contributes to reduced renewable generation.
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one battery-drain telemetry reading. Battery level drops much faster than in normal operation.
        """
        self.temperature = self._clamp(
            self.temperature + random.uniform(-0.05, 0.18),
            minimum=1.5,
            maximum=5.5,
        )       # Temperature remains mostly controlled, but may drift slightly upward.  
        
        self.humidity = self._clamp(
            self.humidity + random.uniform(-1.0, 1.0),
            minimum=60.0,
            maximum=82.0,
        )       # Humidity continues to vary within a believable range.
        
        self.battery_level = self._clamp(
            self.battery_level - random.uniform(1.4, 3.0),
            minimum=0.0,
            maximum=100.0,
        )       # Battery drains rapidly on every reading.
        
        self.generated_power = self._clamp(
            self.generated_power + random.uniform(-15.0, 10.0),
            minimum=40.0,
            maximum=175.0,
        )       # Generated power remains low and unstable.
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-8.0, 8.0),
            minimum=215.0,
            maximum=275.0,
        )       # Cooling load remains significant despite weak generation.
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(-0.25, 0.25),
            minimum=0.5,
            maximum=3.2,
        )       # Wind remains low.
        
        return TelemetryReading(
            temperature=round(self.temperature, 2),
            humidity=round(self.humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="warning",
        )
import random

from scenarios.base import TelemetryReading
from scenarios.normal import NormalScenario

class TemperatureRiseScenario(NormalScenario):
    """
    Simulates a cold room whose temperature is steadily increasing. Possible real-world causes:
    - Door left open
    - Insulation problem
    - Insufficient cooling
    - High external heat load
    """
    def __init__(self) -> None:
        """
        Start from a safe temperature before gradually increasing it.
        """
        super().__init__()
        self.temperature = 3.2      # Begin inside a normal safe range.
        self.cooling_load = 285.0    # Cooling is still active, but not keeping up with heat gain.
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one temperature-rise telemetry reading. Temperature increases each time this method is called.
        """
        self.temperature = self._clamp(
            self.temperature + random.uniform(0.35, 0.75),
            minimum=-20.0,
            maximum=20.0,
        )        # Temperature rises steadily and can move beyond the safe range.
        
        self.humidity = self._clamp(
            self.humidity + random.uniform(-0.3, 1.2),
            minimum=55.0,
            maximum=95.0,
        )       # Humidity may also increase slightly as conditions worsen.
        
        self.battery_level = self._clamp(
            self.battery_level - random.uniform(0.3, 0.8),
            minimum=0.0,
            maximum=100.0,
        )       # Battery experiences a moderate drain as cooling works harder.
        
        self.generated_power = self._clamp(
            self.generated_power + random.uniform(-15.0, 15.0),
            minimum=230.0,
            maximum=420.0,
        )      # Generation remains reasonably normal.
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-5.0, 14.0),
            minimum=260.0,
            maximum=380.0,
        )    # Cooling load is higher than normal because the system is struggling.   
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(-0.3, 0.3),
            minimum=2.5,
            maximum=8.0,
        )     # Wind speed varies normally.
        
        return TelemetryReading(
            temperature=round(self.temperature, 2),
            humidity=round(self.humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="warning",
        )
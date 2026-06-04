import random

from scenarios.base import TelemetryReading
from scenarios.normal import NormalScenario

class CoolingFailureScenario(NormalScenario):
    """
    Simulates a cooling system failure. The cooling system consumes very little power because it is no longer
    functioning properly, while storage temperature rises quickly.
    """
    def __init__(self) -> None:
        """
        Start from a safe temperature the cooling failure progresses.
        """
        super().__init__()
        self.temperature = 3.0      # Cold room begins in a normal state.
        self.cooling_load = 30.0   # Failed cooling system shows very low operational load.
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one telemetry reading while cooling has failed.
        """
        self.temperature = self._clamp(
            self.temperature + random.uniform(0.7, 1.35),
            minimum=-20.0,
            maximum=30.0,
        )        # Temperature rises quickly because cooling is no longer effective.
        
        self.humidity = self._clamp(
            self.humidity + random.uniform(0.2, 1.8),
            minimum=50.0,
            maximum=100.0,
        )       # Humidity may rise as storage conditions deteriorate.
        
        self.battery_level = self._clamp(
            self.battery_level - random.uniform(0.05, 0.25),
            minimum=0.0,
            maximum=100.0,
        )       # Battery drains slowly because the failed cooling equipment is no longer drawing normal operating power.
        
        self.generated_power = self._clamp(
            self.generated_power + random.uniform(-12.0, 12.0),
            minimum=220.0,
            maximum=430.0,
        )       # Renewable generation may still remain normal.
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-5.0, 5.0),
            minimum=0.0,
            maximum=45.0,
        )       # Cooling load stays abnormally low during failure.
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(-0.3, 0.3),
            minimum=2.5,
            maximum=8.0,
        )     # Wind conditions remain generally normal.
        
        return TelemetryReading(
            temperature=round(self.temperature, 2),
            humidity=round(self.humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="failure",
        )
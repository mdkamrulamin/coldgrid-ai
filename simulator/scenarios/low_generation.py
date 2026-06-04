import random

from scenarios.base import TelemetryReading
from scenarios.normal import NormalScenario

class LowGenerationScenario(NormalScenario):
    """
    Simulates low renewable power generation. Possible real-world causes:
    - Weak wind conditions
    - Renewable generation equipment problem
    - Weather-related generation drop
    """
    def __init__(self) -> None:
        """
        Start with declining renewable input and a healthy battery.
        """
        super().__init__()
        self.battery_level = 82.0       # Begin with enough battery to demonstrate gradual drain.
        self.generated_power = 170.0    # Generation starts below normal levels.
        self.wind_speed = 2.8           # Wind input is also reduced.
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one telemetry reading during low power generation. Generated power remains significantly below cooling demand.
        """
        self.temperature = self._clamp(
            self.temperature + random.uniform(-0.05, 0.18),
            minimum=1.5,
            maximum=6.0,
        )       # Temperature remains acceptable initially, with slight upward drift.
        
        self.humidity = self._clamp(
            self.humidity + random.uniform(-0.8, 0.8),
            minimum=60.0,
            maximum=82.0,
        )       # Humidity remains mostly stable.
        
        self.battery_level = self._clamp(
            self.battery_level - random.uniform(0.5, 1.3),
            minimum=0.0,
            maximum=100.0,
        )       # Battery drains because generation cannot fully supply cooling demand.
        
        self.generated_power = self._clamp(
            self.generated_power + random.uniform(-18.0, 5.0),
            minimum=25.0,
            maximum=185.0,
        )       # Generated power gradually remains low or falls further.
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-6.0, 8.0),
            minimum=185.0,
            maximum=260.0,
        )       # Cooling load continues at a normal operating level.
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(-0.3, 0.12),
            minimum=0.3,
            maximum=3.2,
        )       # Low wind conditions explain reduced generated power.
        
        return TelemetryReading(
            temperature=round(self.temperature, 2),
            humidity=round(self.humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="warning",
        )
    
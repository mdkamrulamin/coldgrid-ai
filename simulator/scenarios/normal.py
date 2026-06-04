import random

from scenarios.base import TelemetryReading

class NormalScenario:
    """
    Simulates normal cold-storage operation. Values vary slightly on every reading, 
    but remain within generally safe and stable operating ranges.
    """
    def __init__(self) -> None:
        """
        Set reasonable initial operating values for a stable device.
        """
        self.temperature = 3.0
        self.humidity = 70.0
        self.battery_level = 85.0
        self.generated_power = 340.0
        self.cooling_load = 210.0
        self.wind_speed = 5.8
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one realistic normal-operation telemetry reading. Each call slightly changes the values to make the data look live.
        """
        self.temperature = self._clamp(
            self.temperature + random.uniform(-0.2, 0.2),
            minimum=1.5,
            maximum=4.5,
        )       # Temperature gently fluctuates while remaining in a safe range.
        
        self.humidity = self._clamp(
            self.humidity + random.uniform(-1.0, 1.0),
            minimum=62.0,
            maximum=78.0,
        )       # Humidity gently fluctuates within a stable range.
        
        self.battery_level = self._clamp(
            self.battery_level - random.uniform(0.05, 0.2),
            minimum=0.0,
            maximum=100.0,
        )       # Battery slowly drains during normal operation.
        
        self.generated_power = self._clamp(
            self.generated_power + random.uniform(-12.0, 12.0),
            minimum=250.0,
            maximum=430.0,
        )       # Generated power changes slightly as renewable input changes.
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-8.0, 8.0),
            minimum=170.0,
            maximum=260.0,
        )       # Cooling load changes slightly.
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(-0.3, 0.3),
            minimum=3.0,
            maximum=8.0,
        )       # Wind speed fluctuates slightly.
        
        return TelemetryReading(
            temperature=round(self.temperature, 2),
            humidity=round(self.humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="normal",
        )
    
    @staticmethod
    def _clamp(value: float, minimum: float, maximum: float) -> float:
        """
        Keep a generated value within a realistic minimum and maximum range.
        """
        return max(minimum, min(value, maximum))
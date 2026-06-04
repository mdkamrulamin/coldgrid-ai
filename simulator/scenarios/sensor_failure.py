import random

from scenarios.base import TelemetryReading
from scenarios.normal import NormalScenario

class SensorFailureScenario(NormalScenario):
    """
    Simulates unreliable sensor readings. The simulator intentionally sends strange temperature or humidity values,
    but keeps them within API validation limits so the backend stores them. Later, anomaly detection can identify these readings as suspicious.
    """
    def __init__(self) -> None:
        """
        Track the number of readings so abnormal readings can occur repeatedly.
        """
        super().__init__()
        self.reading_count = 0      # Used to alternate between corrupted and unstable sensor readings.
    
    def generate_reading(self) -> TelemetryReading:
        """
        Generate one telemetry reading from a malfunctioning sensor.
        """
        self.reading_count += 1     # Count how many sensor readings have been generated.
        
        # Keep battery, power, cooling load, and wind generally realistic.
        self.battery_level = self._clamp(
            self.battery_level - random.uniform(0.05, 0.2),
            minimum=0.0,
            maximum=100.0,
        )      
        
        self.generated_power = self._clamp(
            self.generated_power + random.uniform(-10.0, 10.0),
            minimum=250.0,
            maximum=430.0,
        )  
        
        self.cooling_load = self._clamp(
            self.cooling_load + random.uniform(-6.0, 6.0),
            minimum=170.0,
            maximum=260.0,
        ) 
        
        self.wind_speed = self._clamp(
            self.wind_speed + random.uniform(-0.25, 0.25),
            minimum=3.0,
            maximum=8.0,
        ) 
        
        if self.reading_count % 2 == 0:
            # Simulate an unrealistically high temperature reading.
            corrupted_temperature = random.uniform(70.0, 98.0)
            corrupted_humidity = random.uniform(0.0, 8.0)
        else:
            # Simulate an unrealistically low temperature reading.
            corrupted_temperature = random.uniform(-80.0, -45.0)
            corrupted_humidity = random.uniform(92.0, 100.0)   
        
        return TelemetryReading(
            temperature=round(corrupted_temperature, 2),
            humidity=round(corrupted_humidity, 2),
            battery_level=round(self.battery_level, 2),
            generated_power=round(self.generated_power, 2),
            cooling_load=round(self.cooling_load, 2),
            wind_speed=round(self.wind_speed, 2),
            status="sensor_error",
        )
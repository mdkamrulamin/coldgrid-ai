from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Telemetry(Base):
    """
    SQLAlchemy model for telemetry readings sent by devices. Each row in this table represents one measurement sent by
    a simulator or a real device in the future.
    """
    __tablename__ = "telemetry"      # Name of the PostgreSQL table.
    
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )        # Unique internal ID for each telemetry record.
    
    """
    # Internal database ID of the device that sent this reading.
    #
    # Important:
    # The simulator will send the public device ID, such as:
    # dev_a1b2c3d4
    #
    # The backend will find that device and store its internal
    # database ID here, such as:
    # device_id = 1
    """
    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id"),
        index=True,
        nullable=False,
    )
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )       # Time when the backend saved this telemetry record.
    
    temperature: Mapped[float] = mapped_column(Float, nullable=False)     # Current cold-storage temperature.
    humidity: Mapped[float] = mapped_column(Float, nullable=False)        # Current humidity percentage.
    battery_level: Mapped[float] = mapped_column(Float, nullable=False)   # Current battery charge percentage.
    generated_power: Mapped[float] = mapped_column(Float, nullable=False) # Renewable power currently being generated in Watts.
    cooling_load: Mapped[float] = mapped_column(Float, nullable=False)     # Power currently required by the cooling system in Watts.
    wind_speed: Mapped[float] = mapped_column(Float, nullable=False)        # Current wind speed associated with renewable generation in metre per secs.
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="normal",
    )       # Status reported by the device or simulator examples: normal, warning, failure, sensor_error.
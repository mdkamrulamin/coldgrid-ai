from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Device(Base):
    """
    SQLAlchemy model for cold-storage devices. Each device belongs to one user.
    The device stores safe operating thresholds and a hashed API key.
    """
    
    # DB table name
    __tablename__ = "devices"
    
    # Internal database ID. This is used by our backend for CRUD endpoints like /devices/{device_id}.
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    
    # Public device ID used later by the simulator/telemetry endpoint. This is safer than exposing only the internal database ID.
    device_uid: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    
    # The user who owns this device. This connects devices.user_id to users.id.
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
        nullable=False,
    )
    
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )       # Device display name.
    
    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )       # Physical or test location of the device.
    
    storage_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )       # Type of stored product.

    min_temperature: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )       # Minimum safe temperature for the storage unit.
    
    max_temperature: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )       # Maximum safe temperature for the storage unit.
    
    min_humidity: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )       # Minimum safe humidity percentage.
    
    max_humidity: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )        # Maximum safe humidity percentage.
    
    # Battery level percentage where warning alerts should start. 25 means warn when battery goes below 25%
    battery_threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )   
        
    # Hashed device API key. The raw API key is shown only once when the device is created.
    api_key_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )       # Device creation timestamp.
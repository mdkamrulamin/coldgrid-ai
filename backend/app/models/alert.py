from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Alert(Base):
    """
    SQLAlchemy model for cold-storage device alerts.
    """
    __tablename__ = "alerts"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Internal database ID of the device. We store the numeric device ID here because it links directly
    # to the devices table.
    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"),
        index=True,
    )
    
    # Types of alert: temperature_high, battery_low, generated_power_drop, device_offline
    alert_type: Mapped[str] = mapped_column(String(80), index=True)
    
     # Severity level. Values used: low, medium, high, critical
    severity: Mapped[str] = mapped_column(String(30), index=True)
    message: Mapped[str] = mapped_column(Text) #Alert message for frontend.
    
    # Alert status: active, resolved.
    status: Mapped[str] = mapped_column(String(30), default="active", index=True)
    created_at = Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
    )
    
    resolved_at = Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True,
    )
    
    
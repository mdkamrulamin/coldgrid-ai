from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"),
        index=True
    ) # Internal numeric database ID of the device.
    
    # Overall risk level calculated by the prediction engine.
    # Allowed values in use: low, medium, high, critical
    risk_level: Mapped[str] = mapped_column(String(30), index=True)
    
    # Numeric score behind the risk level.
    # 0-24 -> low
    # 25-49 -> medium
    # 50-74 -> high
    # 75-100 -> critical
    risk_score = Mapped[int] = mapped_column(Integer, default=0)
    summary: Mapped[str] = mapped_column(Text) # Short rule-based summary of the current device risk.
    
    # Battery prediction fields.
    battery_current_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_drain_rate_per_hour: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_hours_to_battery_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_prediction_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Temperature prediction fields.
    temperature_current: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature_change_rate_per_hour: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature_min_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature_max_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_hours_to_temperature_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    # high means temperature is predicted to exceed max threshold.
    # low means temperature is predicted to fall below min threshold.
    temperature_threshold_direction: Mapped[str | None] = mapped_column(String(20), nullable=True)
    temperature_prediction_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Cooling/generation context used for risk score.
    generated_power_current: Mapped[float | None] = mapped_column(Float, nullable=True)
    cooling_load_current: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_to_cooling_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Alert context used for risk score.
    active_alert_count: Mapped[int] = mapped_column(Integer, default=0)
    critical_alert_count: Mapped[int] = mapped_column(Integer, default=0)
    offline_alert_active: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
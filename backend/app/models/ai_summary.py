from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class AISummary(Base):
    __tablename__ = "ai_summaries"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    
    # Main summary for the user.
    summary: Mapped[str] = mapped_column(Text)
    
    # Short current risk level snapshot. Values: low, medium, high, critical
    risk_level: Mapped[str] = mapped_column(String(30), index=True)
    
    # Recommended actions shown as a list in the frontend.
    # Example:
    # [
    #   "Check device power connection.",
    #   "Monitor battery level for the next hour."
    # ]
    recommended_actions: Mapped[list[str]] = mapped_column(JSON)
    
    # Data window used to generate summary.
    data_start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    data_end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    # Helpful metadata for frontend display/debugging.
    telemetry_count: Mapped[int] = mapped_column(Integer, default=0)
    active_alert_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Latest prediction used when this summary was generated.
    # Nullable because a device may not have a prediction yet.
    prediction_id: Mapped[int | None] = mapped_column(ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped,mapped_column

from app.db.base import Base

class User(Base):
    """
    SQLAlchemy model for application users.
    Each user will be able to register, log in,
    create devices, and manage their own telemetry data later.
    """
    
    # DB table name
    __tablename__ = "users"
    
    #Primary key column
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True      #generate the ID automatically.
    )
    
    # User's email address.
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,    #Email has to be unique.
        index=True,     #True allows email lookup faster during login.
        nullable=False,
    )
    
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    # Timestamp for when the user account was created.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    
    
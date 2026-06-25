import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, UUIDMixin


class DigestPreference(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "digest_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    frequency: Mapped[str] = mapped_column(String(20), default="weekly")  # weekly, biweekly, monthly
    day: Mapped[str] = mapped_column(String(20), default="sunday")
    time: Mapped[str] = mapped_column(String(10), default="10:00")
    max_results: Mapped[int] = mapped_column(Integer, default=5)
    min_match_score: Mapped[float] = mapped_column(default=0.0)
    include_new_only: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="digest_preferences")


class DigestLog(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "digest_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    opportunities_count: Mapped[int] = mapped_column(Integer, default=0)
    opened: Mapped[bool] = mapped_column(Boolean, default=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    error: Mapped[str] = mapped_column(Text, nullable=True)

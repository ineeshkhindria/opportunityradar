import uuid
import enum
from datetime import date
from sqlalchemy import String, Text, Date, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, UUIDMixin


class ApplicationStatus(str, enum.Enum):
    saved = "saved"
    applied = "applied"
    interview = "interview"
    offered = "offered"
    rejected = "rejected"
    accepted = "accepted"
    withdrawn = "withdrawn"


class Application(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "applications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default=ApplicationStatus.saved.value,
        index=True,
    )
    applied_date: Mapped[date] = mapped_column(Date, nullable=True)
    deadline: Mapped[date] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    reminder_set: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_days_before: Mapped[int] = mapped_column(default=3)

    user = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")

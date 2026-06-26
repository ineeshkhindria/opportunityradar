import uuid
from datetime import date
from sqlalchemy import String, Integer, Text, Float, Boolean, UniqueConstraint, Date, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, UUIDMixin


class Opportunity(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "opportunities"
    __table_args__ = (
        UniqueConstraint("source", "source_id", name="uq_opportunity_source"),
    )

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    company: Mapped[str] = mapped_column(String(300), nullable=False)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    company_logo: Mapped[str] = mapped_column(String(500), nullable=True)
    company_founded_date: Mapped[date] = mapped_column(Date, nullable=True)
    company_size: Mapped[str] = mapped_column(String(100), nullable=True)
    company_funding_stage: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    source_id: Mapped[str] = mapped_column(String(200), nullable=True)
    location: Mapped[str] = mapped_column(String(300), nullable=True)
    work_mode: Mapped[str] = mapped_column(String(50), default="remote")
    stipend: Mapped[str] = mapped_column(String(200), nullable=True)
    stipend_min: Mapped[int] = mapped_column(Integer, nullable=True)
    stipend_max: Mapped[int] = mapped_column(Integer, nullable=True)
    duration: Mapped[str] = mapped_column(String(100), nullable=True)
    skills_required: Mapped[list] = mapped_column(ARRAY(String), default=list)
    domains: Mapped[list] = mapped_column(ARRAY(String), default=list)
    posted_date: Mapped[date] = mapped_column(Date, nullable=True)
    deadline: Mapped[date] = mapped_column(Date, nullable=True)
    applicants_count: Mapped[int] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    # match_score and match_reason are plain Python attrs set at runtime
    # (not persisted — avoids race conditions from GET request flushes)

    company_rel = relationship("Company", back_populates="opportunities")
    applications = relationship("Application", back_populates="opportunity")

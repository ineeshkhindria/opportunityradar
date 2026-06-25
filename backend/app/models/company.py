from datetime import date
from sqlalchemy import String, Integer, Date, Text, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, UUIDMixin


class Company(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(300), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    website: Mapped[str] = mapped_column(String(500), nullable=True)
    founded_date: Mapped[date] = mapped_column(Date, nullable=True)
    founded_year: Mapped[int] = mapped_column(Integer, nullable=True)
    company_size: Mapped[str] = mapped_column(String(100), nullable=True)
    funding_stage: Mapped[str] = mapped_column(String(100), nullable=True)
    locations: Mapped[list] = mapped_column(ARRAY(String), default=list)
    domains: Mapped[list] = mapped_column(ARRAY(String), default=list)
    source: Mapped[str] = mapped_column(String(50), default="manual")
    source_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_yc: Mapped[bool] = mapped_column(Boolean, default=False)
    yc_batch: Mapped[str] = mapped_column(String(50), nullable=True)
    is_active_hiring: Mapped[bool] = mapped_column(Boolean, default=True)

    opportunities = relationship("Opportunity", back_populates="company_rel")

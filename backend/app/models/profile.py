import uuid
from sqlalchemy import String, Integer, ForeignKey, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, UUIDMixin


class StudentProfile(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "student_profiles"
    __table_args__ = (
        CheckConstraint(
            "year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'PhD')",
            name="ck_profile_valid_year",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    college: Mapped[str] = mapped_column(String(300), nullable=True)
    year: Mapped[str] = mapped_column(String(50), nullable=False)
    branch: Mapped[str] = mapped_column(String(200), nullable=False)
    degree: Mapped[str] = mapped_column(String(100), default="B.Tech")
    skills: Mapped[list] = mapped_column(ARRAY(String), default=list)
    preferred_domains: Mapped[list] = mapped_column(ARRAY(String), default=list)
    preferred_locations: Mapped[list] = mapped_column(ARRAY(String), default=list)
    work_mode: Mapped[str] = mapped_column(String(50), default="remote")  # remote, hybrid, onsite
    min_stipend: Mapped[int] = mapped_column(Integer, nullable=True)
    github_url: Mapped[str] = mapped_column(String(500), nullable=True)
    linkedin_url: Mapped[str] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str] = mapped_column(String(500), nullable=True)
    resume_url: Mapped[str] = mapped_column(String(500), nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="profile")

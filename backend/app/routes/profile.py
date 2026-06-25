import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.auth.deps import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileResponse(BaseModel):
    id: str
    college: Optional[str] = None
    year: Optional[str] = None
    branch: Optional[str] = None
    degree: Optional[str] = None
    skills: list[str] = []
    preferred_domains: list[str] = []
    preferred_locations: list[str] = []
    work_mode: Optional[str] = None
    min_stipend: Optional[int] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    college: Optional[str] = None
    year: Optional[str] = None
    branch: Optional[str] = None
    degree: Optional[str] = None
    skills: Optional[list[str]] = None
    preferred_domains: Optional[list[str]] = None
    preferred_locations: Optional[list[str]] = None
    work_mode: Optional[str] = None
    min_stipend: Optional[int] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    bio: Optional[str] = None


@router.get("", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileResponse(
        id=str(profile.id),
        college=profile.college,
        year=profile.year,
        branch=profile.branch,
        degree=profile.degree,
        skills=profile.skills or [],
        preferred_domains=profile.preferred_domains or [],
        preferred_locations=profile.preferred_locations or [],
        work_mode=profile.work_mode,
        min_stipend=profile.min_stipend,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        portfolio_url=profile.portfolio_url,
        resume_url=profile.resume_url,
        bio=profile.bio,
    )


@router.put("", response_model=ProfileResponse)
async def upsert_profile(
    req: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    update_data = req.model_dump(exclude_unset=True)

    if profile:
        for key, value in update_data.items():
            setattr(profile, key, value)
    else:
        profile = StudentProfile(user_id=user.id, **update_data)
        db.add(profile)

    await db.flush()
    return ProfileResponse(
        id=str(profile.id),
        college=profile.college,
        year=profile.year,
        branch=profile.branch,
        degree=profile.degree,
        skills=profile.skills or [],
        preferred_domains=profile.preferred_domains or [],
        preferred_locations=profile.preferred_locations or [],
        work_mode=profile.work_mode,
        min_stipend=profile.min_stipend,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        portfolio_url=profile.portfolio_url,
        resume_url=profile.resume_url,
        bio=profile.bio,
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile:
        await db.delete(profile)

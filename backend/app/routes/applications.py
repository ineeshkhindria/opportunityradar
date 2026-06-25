import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.models.opportunity import Opportunity
from app.auth.deps import get_current_user

router = APIRouter(prefix="/api/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    opportunity_id: str
    notes: Optional[str] = None
    deadline: Optional[date] = None
    reminder_set: bool = False
    reminder_days_before: int = 3


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    deadline: Optional[date] = None
    reminder_set: Optional[bool] = None
    reminder_days_before: Optional[int] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    status: str
    applied_date: Optional[str] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None
    reminder_set: bool = False
    reminder_days_before: int = 3
    created_at: str
    updated_at: str
    opportunity: Optional[dict] = None

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    items: list[ApplicationResponse]
    total: int


STATUS_TRANSITIONS = {
    ApplicationStatus.saved.value: ["applied", "withdrawn"],
    ApplicationStatus.applied.value: ["interview", "rejected", "withdrawn"],
    ApplicationStatus.interview.value: ["offered", "rejected", "withdrawn"],
    ApplicationStatus.offered.value: ["accepted", "rejected", "withdrawn"],
    ApplicationStatus.accepted.value: ["withdrawn"],
    ApplicationStatus.rejected.value: [],
    ApplicationStatus.withdrawn.value: [],
}


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    status_filter: Optional[str] = Query(None),
    sort_by: str = Query("updated_at"),
    sort_order: str = Query("desc"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Application).where(Application.user_id == user.id)
    if status_filter:
        query = query.where(Application.status == status_filter)

    sort_column = getattr(Application, sort_by, Application.updated_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    result = await db.execute(query)
    applications = result.scalars().all()

    opp_ids = [app.opportunity_id for app in applications]
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id.in_(opp_ids))
    )
    opportunities = {str(o.id): o for o in opp_result.scalars().all()}

    return ApplicationListResponse(
        items=[ApplicationResponse(
            id=str(app.id),
            user_id=str(app.user_id),
            opportunity_id=str(app.opportunity_id),
            status=app.status,
            applied_date=app.applied_date.isoformat() if app.applied_date else None,
            deadline=app.deadline.isoformat() if app.deadline else None,
            notes=app.notes,
            reminder_set=app.reminder_set,
            reminder_days_before=app.reminder_days_before,
            created_at=app.created_at.isoformat() if app.created_at else "",
            updated_at=app.updated_at.isoformat() if app.updated_at else "",
            opportunity={
                "id": str(opp.id),
                "title": opp.title,
                "company": opp.company,
                "source_url": opp.source_url,
                "location": opp.location,
                "stipend": opp.stipend,
                "work_mode": opp.work_mode,
            } if (opp := opportunities.get(str(app.opportunity_id))) else None,
        ) for app in applications],
        total=total,
    )


@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(
    req: ApplicationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == uuid.UUID(req.opportunity_id))
    )
    opp = opp_result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = await db.execute(
        select(Application).where(
            and_(
                Application.user_id == user.id,
                Application.opportunity_id == uuid.UUID(req.opportunity_id),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already applied to this opportunity")

    app = Application(
        user_id=user.id,
        opportunity_id=uuid.UUID(req.opportunity_id),
        status=ApplicationStatus.saved.value,
        notes=req.notes,
        deadline=req.deadline,
        reminder_set=req.reminder_set,
        reminder_days_before=req.reminder_days_before,
    )
    db.add(app)
    await db.flush()

    return ApplicationResponse(
        id=str(app.id),
        user_id=str(app.user_id),
        opportunity_id=str(app.opportunity_id),
        status=app.status,
        notes=app.notes,
        deadline=app.deadline.isoformat() if app.deadline else None,
        reminder_set=app.reminder_set,
        reminder_days_before=app.reminder_days_before,
        created_at=app.created_at.isoformat() if app.created_at else "",
        updated_at=app.updated_at.isoformat() if app.updated_at else "",
        opportunity={
            "id": str(opp.id),
            "title": opp.title,
            "company": opp.company,
            "source_url": opp.source_url,
            "location": opp.location,
            "stipend": opp.stipend,
            "work_mode": opp.work_mode,
        },
    )


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    req: ApplicationUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == user.id,
            )
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    update_data = req.model_dump(exclude_unset=True)

    if "status" in update_data:
        new_status = update_data["status"]
        allowed = STATUS_TRANSITIONS.get(app.status, [])
        if new_status not in allowed and new_status != app.status:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from '{app.status}' to '{new_status}'. Allowed: {allowed}",
            )
        app.status = new_status
        if new_status == ApplicationStatus.applied.value and not app.applied_date:
            app.applied_date = date.today()

    if "applied_date" in update_data:
        app.applied_date = update_data["applied_date"]
    if "notes" in update_data:
        app.notes = update_data["notes"]
    if "deadline" in update_data:
        app.deadline = update_data["deadline"]
    if "reminder_set" in update_data:
        app.reminder_set = update_data["reminder_set"]
    if "reminder_days_before" in update_data:
        app.reminder_days_before = update_data["reminder_days_before"]

    await db.flush()

    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == app.opportunity_id)
    )
    opp = opp_result.scalar_one_or_none()

    return ApplicationResponse(
        id=str(app.id),
        user_id=str(app.user_id),
        opportunity_id=str(app.opportunity_id),
        status=app.status,
        applied_date=app.applied_date.isoformat() if app.applied_date else None,
        deadline=app.deadline.isoformat() if app.deadline else None,
        notes=app.notes,
        reminder_set=app.reminder_set,
        reminder_days_before=app.reminder_days_before,
        created_at=app.created_at.isoformat() if app.created_at else "",
        updated_at=app.updated_at.isoformat() if app.updated_at else "",
        opportunity={
            "id": str(opp.id),
            "title": opp.title,
            "company": opp.company,
            "source_url": opp.source_url,
            "location": opp.location,
            "stipend": opp.stipend,
            "work_mode": opp.work_mode,
        } if opp else None,
    )


@router.delete("/{application_id}", status_code=204)
async def delete_application(
    application_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == user.id,
            )
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.delete(app)


@router.get("/stats", response_model=dict)
async def get_application_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id == user.id)
        .group_by(Application.status)
    )
    rows = result.all()
    stats = {status: count for status, count in rows}
    total = sum(stats.values())
    return {
        "total": total,
        "by_status": stats,
        "saved": stats.get("saved", 0),
        "applied": stats.get("applied", 0),
        "interview": stats.get("interview", 0),
        "offered": stats.get("offered", 0),
        "rejected": stats.get("rejected", 0),
        "accepted": stats.get("accepted", 0),
    }

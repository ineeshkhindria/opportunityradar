import asyncio
import logging
from datetime import datetime, timezone
from celery import Celery
from sqlalchemy import select, update
from app.config import settings

celery_app = Celery(
    "opportunityradar",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_soft_time_limit=600,
    task_time_limit=900,
    beat_schedule={
        "scrape-all-sources": {
            "task": "app.celery_app.scrape_all_opportunities",
            "schedule": settings.scraper_interval_hours * 3600,
            "options": {"queue": "scraping"},
        },
        "send-weekly-digests": {
            "task": "app.celery_app.send_digests",
            "schedule": 3600,
            "options": {"queue": "email"},
        },
        "deactivate-old-opportunities": {
            "task": "app.celery_app.deactivate_old_opportunities",
            "schedule": 86400,
            "options": {"queue": "maintenance"},
        },
    },
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def scrape_all_opportunities(self):
    async def _run():
        from app.services.scraper.manager import ScraperManager
        manager = ScraperManager()
        results = await manager.run_all()
        return results

    try:
        return asyncio.get_event_loop().run_until_complete(_run())
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(_run())
        finally:
            loop.close()


@celery_app.task(bind=True, max_retries=3)
def send_digests(self):
    async def _run():
        from app.database import async_session_factory
        from app.models.user import User
        from app.models.digest import DigestPreference, DigestLog
        from app.models.profile import StudentProfile
        from app.services.ranking.engine import RankingEngine
        from app.services.email.service import EmailService
        from app.services.scraper.manager import ScraperManager

        now = datetime.now(timezone.utc)
        weekday = now.strftime("%A").lower()
        hour_min = now.strftime("%H:%M")

        async with async_session_factory() as db:
            result = await db.execute(
                select(DigestPreference)
                .where(
                    DigestPreference.enabled == True,
                    DigestPreference.day == weekday,
                )
            )
            prefs = result.scalars().all()

            ranking_engine = RankingEngine()
            email_service = EmailService()
            sent_count = 0

            for pref in prefs:
                if pref.time != hour_min:
                    continue

                user_result = await db.execute(
                    select(User).where(User.id == pref.user_id)
                )
                user = user_result.scalar_one_or_none()
                if not user or not user.is_active:
                    continue

                profile_result = await db.execute(
                    select(StudentProfile).where(StudentProfile.user_id == user.id)
                )
                profile = profile_result.scalar_one_or_none()
                if not profile:
                    continue

                        from app.models.opportunity import Opportunity
                        result = await db.execute(
                            select(Opportunity).where(Opportunity.is_active == True)
                        )
                all_opportunities = result.scalars().all()

                matched = await ranking_engine.rank_for_user(
                    profile=profile,
                    opportunities=all_opportunities,
                    db=db,
                    top_k=pref.max_results or 5,
                )

                opp_ids = [m["opportunity_id"] for m in matched]
                matched_opps = []
                for mid in matched:
                    opp_id = mid["opportunity_id"]
                    opp = next((o for o in all_opportunities if str(o.id) == opp_id), None)
                    if opp:
                        matched_opps.append({
                            "title": opp.title,
                            "company": opp.company,
                            "location": opp.location,
                            "stipend": opp.stipend,
                            "work_mode": opp.work_mode,
                            "source_url": opp.source_url,
                            "skills_required": opp.skills_required,
                            "score": mid.get("score", 0),
                            "reason": mid.get("reason", ""),
                        })

                if not matched_opps:
                    continue

                success = await email_service.send_digest(
                    to_email=user.email,
                    to_name=user.full_name,
                    opportunities=matched_opps,
                    profile_name=user.full_name.split()[0],
                    unsubscribe_token=str(user.id),
                )

                db.add(DigestLog(
                    user_id=user.id,
                    sent_at=now,
                    opportunities_count=len(matched_opps),
                ))
                pref.last_sent_at = now
                await db.commit()
                sent_count += 1

            return {"sent": sent_count, "total_prefs": len(prefs)}

    try:
        return asyncio.get_event_loop().run_until_complete(_run())
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(_run())
        finally:
            loop.close()


@celery_app.task(bind=True)
def deactivate_old_opportunities(self):
    async def _run():
        from app.services.scraper.manager import ScraperManager
        manager = ScraperManager()
        await manager.deactivate_old(days=60)
        return {"status": "ok"}

    try:
        return asyncio.get_event_loop().run_until_complete(_run())
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(_run())
        finally:
            loop.close()

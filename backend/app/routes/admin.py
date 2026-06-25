from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.user import User
from app.auth.deps import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


class ScrapeResponse(BaseModel):
    message: str
    results: dict[str, int]


class EnrichResponse(BaseModel):
    message: str
    checked: int
    found_age: int


@router.post("/scrape", response_model=ScrapeResponse)
async def trigger_scrape(user: User = Depends(get_current_user)):
    import asyncio
    from app.services.scraper.manager import ScraperManager
    manager = ScraperManager()
    results = await asyncio.wait_for(manager.run_all(), timeout=120.0)
    total = sum(results.values())
    return ScrapeResponse(
        message=f"Scraped {total} new opportunities across {len(results)} sources.",
        results=results,
    )


@router.post("/enrich", response_model=EnrichResponse)
async def enrich_companies(user: User = Depends(get_current_user)):
    import asyncio
    from app.services.scraper.enricher import CompanyAgeEnricher
    enricher = CompanyAgeEnricher()
    stats = await asyncio.wait_for(enricher.enrich_all(batch_size=30), timeout=60.0)
    return EnrichResponse(
        message=f"Checked {stats['checked']} companies, found founding dates for {stats['found_age']}.",
        checked=stats["checked"],
        found_age=stats["found_age"],
    )

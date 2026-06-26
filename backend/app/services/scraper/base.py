from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional


@dataclass
class ScrapedOpportunity:
    title: str
    company: str
    description: str
    source: str
    source_url: str
    source_id: str
    location: Optional[str] = None
    work_mode: Optional[str] = "remote"
    stipend: Optional[str] = None
    stipend_min: Optional[int] = None
    stipend_max: Optional[int] = None
    duration: Optional[str] = None
    skills_required: list[str] = field(default_factory=list)
    domains: list[str] = field(default_factory=list)
    posted_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    applicants_count: Optional[int] = None
    company_logo: Optional[str] = None
    company_founded_date: Optional[date] = None
    company_size: Optional[str] = None
    company_funding_stage: Optional[str] = None
    company_slug: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None


class BaseScraper(ABC):
    def __init__(self):
        self.name = self.__class__.__name__

    @abstractmethod
    async def scrape(self) -> list[ScrapedOpportunity]:
        pass

    @abstractmethod
    async def validate(self, opportunity: ScrapedOpportunity) -> bool:
        pass

    @staticmethod
    def parse_date(date_str: Optional[str]) -> Optional[datetime]:
        if not date_str:
            return None
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ", "%B %d, %Y", "%d %B, %Y"):
            try:
                return datetime.strptime(date_str, fmt)
            except (ValueError, TypeError):
                continue
        return None

    @staticmethod
    def parse_founded_year(year_str: Optional[str]) -> Optional[date]:
        if not year_str:
            return None
        try:
            year = int(year_str.strip()[:4])
            return date(year, 1, 1)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def is_young_company(founded_date: Optional[date], max_years: float = 1.5) -> Optional[bool]:
        """
        Returns True if founded_date is within max_years, False if older, None if unknown.
        Callers must treat None as "unknown" — not as "old" — to avoid silently
        excluding companies that simply lack a founding date.
        """
        if not founded_date:
            return None
        age = (date.today() - founded_date).days / 365.25
        return age <= max_years

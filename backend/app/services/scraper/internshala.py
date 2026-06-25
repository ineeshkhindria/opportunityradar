import re
import httpx
from datetime import datetime
from bs4 import BeautifulSoup
from typing import Optional
from app.services.scraper.base import BaseScraper, ScrapedOpportunity


class InternshalaScraper(BaseScraper):
    BASE_URL = "https://internshala.com"
    SEARCH_URL = f"{BASE_URL}/internships"

    async def scrape(self) -> list[ScrapedOpportunity]:
        opportunities = []
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            try:
                resp = await client.get(
                    self.SEARCH_URL,
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                            "Chrome/125.0.0.0 Safari/537.36"
                        ),
                        "Accept": "text/html,application/xhtml+xml",
                    },
                )
                if resp.status_code != 200:
                    return opportunities

                soup = BeautifulSoup(resp.text, "lxml")
                cards = soup.select("div.internship_card")
                for card in cards[:50]:
                    try:
                        opp = await self._parse_card(card)
                        if opp and await self.validate(opp):
                            opportunities.append(opp)
                    except Exception:
                        continue
            except httpx.RequestError:
                return opportunities
        return opportunities

    async def _parse_card(self, card) -> Optional[ScrapedOpportunity]:
        title_el = card.select_one("a.internship_card_title")
        company_el = card.select_one("a.company_name")
        desc_el = card.select_one("div.internship_card_description")
        location_el = card.select_one("div.row-1-item.locations")
        stipend_el = card.select_one("div.stipend")
        skills_els = card.select("div.skill-container span.skill")
        posted_el = card.select_one("div.status-line span")

        if not title_el or not company_el:
            return None

        href = title_el.get("href", "")
        source_url = f"{self.BASE_URL}{href}" if href.startswith("/") else href
        source_id = href.split("/")[-1] if "/" in href else href

        title = title_el.text.strip()
        company = company_el.text.strip()
        description = desc_el.text.strip() if desc_el else ""
        location = location_el.text.strip() if location_el else None
        stipend = stipend_el.text.strip() if stipend_el else None

        skills = [s.text.strip() for s in skills_els] if skills_els else []

        stipend_min, stipend_max = self._parse_stipend(stipend)

        return ScrapedOpportunity(
            title=title,
            company=company,
            description=description,
            source="internshala",
            source_url=source_url,
            source_id=source_id,
            location=location,
            stipend=stipend,
            stipend_min=stipend_min,
            stipend_max=stipend_max,
            skills_required=skills,
            domains=[],
            work_mode="remote",
        )

    def _parse_stipend(self, stipend_text: Optional[str]) -> tuple[Optional[int], Optional[int]]:
        if not stipend_text:
            return None, None
        nums = re.findall(r"\d[\d,]*", stipend_text.replace(",", ""))
        parsed = [int(n) for n in nums if n.isdigit()]
        if len(parsed) >= 2:
            return parsed[0], parsed[1]
        elif len(parsed) == 1:
            return parsed[0], parsed[0]
        return None, None

    async def validate(self, opportunity: ScrapedOpportunity) -> bool:
        return bool(opportunity.title and opportunity.company and len(opportunity.title) > 5)

import httpx
import json
import re
from datetime import date, datetime
from typing import Optional
from bs4 import BeautifulSoup
from app.services.scraper.base import BaseScraper, ScrapedOpportunity


class YCombinatorScraper(BaseScraper):
    COMPANY_LIST_URL = "https://www.ycombinator.com/companies/"
    COMPANY_API = "https://www.ycombinator.com/api/v1/companies"

    YC_BATCH_ORDER = ["W26", "S26", "W25", "S25", "W24", "S24", "W23", "S23"]

    BATCH_TO_FOUNDED: dict[str, date] = {}

    def __init__(self):
        super().__init__()
        self._init_batch_dates()

    def _init_batch_dates(self):
        for batch in self.YC_BATCH_ORDER:
            season = batch[0]
            year = int(batch[1:])
            if season == "W":
                self.BATCH_TO_FOUNDED[batch] = date(year, 1, 1)
            else:
                self.BATCH_TO_FOUNDED[batch] = date(year, 6, 1)

    async def scrape(self) -> list[ScrapedOpportunity]:
        opportunities = []
        young_batches = await self._get_young_batches()

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            for batch in young_batches:
                companies = await self._fetch_batch_companies(client, batch)
                for company in companies[:20]:
                    try:
                        jobs = await self._fetch_company_jobs(client, company)
                        for job in jobs:
                            opp = self._parse_job(job, company, batch)
                            if opp and await self.validate(opp):
                                opportunities.append(opp)
                    except Exception:
                        continue

        return opportunities

    async def _get_young_batches(self) -> list[str]:
        today = date.today()
        young = []
        for batch, founded in self.BATCH_TO_FOUNDED.items():
            age = (today - founded).days / 365.25
            if age <= 1.5:
                young.append(batch)
        return young

    async def _fetch_batch_companies(self, client: httpx.AsyncClient, batch: str) -> list[dict]:
        companies = []
        page = 1
        while page <= 5:
            try:
                resp = await client.get(
                    self.COMPANY_API,
                    params={
                        "q": "",
                        "batch": batch,
                        "page": page,
                        "limit": 50,
                        "sort": "newest",
                    },
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                            "Chrome/125.0.0.0 Safari/537.36"
                        ),
                        "Accept": "application/json",
                        "Referer": self.COMPANY_LIST_URL,
                    },
                )
                if resp.status_code != 200:
                    break
                data = resp.json()
                items = data if isinstance(data, list) else data.get("companies", [])
                if not items:
                    break
                companies.extend(items)
                page += 1
            except Exception:
                break
        return companies

    async def _fetch_company_jobs(self, client: httpx.AsyncClient, company: dict) -> list[dict]:
        slug = company.get("slug") or company.get("url", "").strip("/").split("/")[-1]
        if not slug:
            return []

        try:
            resp = await client.get(
                f"https://www.ycombinator.com/companies/{slug}/jobs",
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
                return []

            soup = BeautifulSoup(resp.text, "lxml")
            job_scripts = soup.find_all("script", type="application/ld+json")

            jobs_data = []
            for script in job_scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and data.get("@type") == "JobPosting":
                        jobs_data.append(data)
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and item.get("@type") == "JobPosting":
                                jobs_data.append(item)
                except (json.JSONDecodeError, AttributeError):
                    continue

            return jobs_data
        except Exception:
            return []

    def _parse_job(self, job: dict, company: dict, batch: str) -> Optional[ScrapedOpportunity]:
        title = job.get("title", "")
        if not title or not self._is_relevant(title):
            return None

        company_name = company.get("name") or job.get("hiringOrganization", {}).get("name", "YC Startup")
        slug = company.get("slug", "")
        description = job.get("description", "") or ""
        url = job.get("url") or f"https://www.ycombinator.com/companies/{slug}/jobs"
        source_id = job.get("id", slug)
        location = job.get("jobLocation", {})
        if isinstance(location, dict):
            location = location.get("address", {}).get("addressLocality") or location.get("addressLocality", "")
        elif isinstance(location, str):
            pass
        else:
            location = ""

        remote = job.get("employmentType") == "REMOTE" or "remote" in str(job.get("jobLocationType", "")).lower()
        skills = job.get("skills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",")]

        founded_date = self.BATCH_TO_FOUNDED.get(batch)
        logo = company.get("logo") or company.get("logo_url")
        company_desc = company.get("description") or company.get("one_liner", "")
        company_size = company.get("team_size") or company.get("size")
        website = company.get("url") or company.get("website")

        return ScrapedOpportunity(
            title=title.strip(),
            company=company_name.strip(),
            description=self._clean_html(description)[:3000],
            source="yc",
            source_url=url,
            source_id=f"yc_{slug}_{source_id}",
            location=location.strip() if location else "Remote",
            work_mode="remote" if remote else "hybrid",
            stipend=None,
            skills_required=[s.strip() for s in skills] if isinstance(skills, list) else [],
            domains=["startup", self._infer_domain(company)],
            company_logo=logo,
            company_founded_date=founded_date,
            company_size=company_size,
            company_funding_stage=f"YC {batch}",
            company_slug=slug,
            company_website=website,
            company_description=company_desc,
        )

    def _is_relevant(self, title: str) -> bool:
        t = title.lower()
        keywords = [
            "intern", "internship",
            "junior", "entry level", "entry-level",
            "graduate", "trainee", "apprentice",
            "co-op", "coop", "summer", "winter",
            "fresher", "early career",
        ]
        return any(k in t for k in keywords)

    def _infer_domain(self, company: dict) -> str:
        tags = company.get("tags", company.get("industries", []))
        if isinstance(tags, list) and tags:
            return tags[0].lower().replace(" ", "_")
        desc = (company.get("description", "") + company.get("one_liner", "")).lower()
        if "ai" in desc or "machine learning" in desc:
            return "artificial_intelligence"
        if "health" in desc or "bio" in desc:
            return "healthtech"
        if "fin" in desc:
            return "fintech"
        if "dev" in desc or "saas" in desc:
            return "saas"
        return "startup"

    def _clean_html(self, text: str) -> str:
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    async def validate(self, opportunity: ScrapedOpportunity) -> bool:
        if not opportunity.title or not opportunity.company:
            return False
        if len(opportunity.title) < 3:
            return False
        return True

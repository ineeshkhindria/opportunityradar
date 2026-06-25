import re
import httpx
import json
from datetime import date, datetime
from typing import Optional
from bs4 import BeautifulSoup
from app.services.scraper.base import BaseScraper, ScrapedOpportunity


class LinkedInScraper(BaseScraper):
    SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"

    async def scrape(self) -> list[ScrapedOpportunity]:
        opportunities = []
        search_queries = [
            "startup internship",
            "YC intern",
            "Y Combinator intern",
            "seed stage intern",
            "early stage startup intern",
            "venture backed intern",
            "series A startup intern",
            "tech intern startup",
            "AI startup intern",
            "founder intern",
        ]

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            for query in search_queries:
                try:
                    jobs = await self._fetch_jobs(client, query, 0)
                    opportunities.extend(jobs)
                except Exception:
                    continue

        return opportunities[:150]

    async def _fetch_jobs(self, client: httpx.AsyncClient, keywords: str, start: int) -> list[ScrapedOpportunity]:
        opportunities = []
        resp = await client.get(
            self.SEARCH_URL,
            params={
                "keywords": keywords,
                "location": "Worldwide",
                "f_TPR": "r604800",
                "start": start,
            },
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/125.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )

        if resp.status_code != 200:
            return opportunities

        soup = BeautifulSoup(resp.text, "lxml")
        cards = soup.select("li:has(div.base-card), div.job-search-card, div[data-entity-urn]")

        seen_ids = set()
        for card in cards:
            try:
                opp = self._parse_card(card)
                if opp and opp.source_id not in seen_ids and await self.validate(opp):
                    seen_ids.add(opp.source_id)
                    opportunities.append(opp)
            except Exception:
                continue

        return opportunities

    def _parse_card(self, card) -> Optional[ScrapedOpportunity]:
        entity_urn = card.get("data-entity-urn", "")
        source_id = entity_urn.split(":")[-1] if ":" in entity_urn else ""

        title_el = card.select_one("a.base-card__full-link, a.job-search-card__title, h3.base-search-card__title a")
        company_el = card.select_one("a.job-search-card__subtitle, h4.base-search-card__subtitle a, span.base-search-card__subtitle")
        location_el = card.select_one("span.job-search-card__location, span.base-search-card__metadata-item")
        date_el = card.select_one("time, span.job-search-card__listed-time, span.base-search-card__metadata-item:last-child")
        logo_el = card.select_one("img.base-search-card__logo, img.job-search-card__logo")
        stipend_el = card.select_one("span.job-search-card__salary-info, span.base-search-card__salary")

        if not title_el:
            title_el = card.select_one("[class*=title] a, [class*=title] span")
        if not company_el:
            company_el = card.select_one("[class*=subtitle] a, [class*=subtitle] span, [class*=company]")

        if not title_el or not company_el:
            return None

        title = title_el.get_text(strip=True) or title_el.get("title", "")
        company = company_el.get_text(strip=True)
        location = location_el.get_text(strip=True) if location_el else "Remote"
        date_text = date_el.get_text(strip=True) if date_el else ""

        href = title_el.get("href", "")
        if not source_id and href:
            match = re.search(r"/jobs/view/(\d+)", href)
            if match:
                source_id = match.group(1)

        if not source_id:
            return None

        posted_date = self._parse_date(date_text)
        startup_data = self._detect_startup_profile(title, company)
        full_text = f"{title} at {company}. Location: {location}."

        return ScrapedOpportunity(
            title=title,
            company=company,
            description=full_text,
            source="linkedin",
            source_url=href or f"https://www.linkedin.com/jobs/view/{source_id}/",
            source_id=source_id,
            location=location,
            work_mode=self._infer_work_mode(title, location),
            stipend=stipend_el.get_text(strip=True) if stipend_el else None,
            skills_required=self._extract_skills(title),
            domains=startup_data["domains"],
            posted_date=posted_date,
            company_logo=logo_el.get("src") if logo_el else None,
            company_size=startup_data["company_size"],
            company_funding_stage=startup_data["funding_stage"],
            company_founded_date=startup_data["est_founded_date"],
        )

    STARTUP_NAMES = {
        "stripe", "brex", "deel", "notion", "vercel", "netlify", "railway",
        "replit", "cursor", "linear", "cal.com", "plaid", "figma", "canva",
        "databricks", "snowflake", "convex", "neon", "supabase", "airtable",
        "retool", "render", "fly.io", "modal", "scale.ai", "sentry",
        "datadog", "databricks", "cohere", "anthropic", "mistral",
        "perplexity", "character.ai", "midjourney", "runway", "hugging face",
        "openai", "claude", "elevenlabs", "langchain", "chroma",
        "pinecone", "weaviate", "mindsdb", "nuro", "cruise", "waymo",
        "rippling", "gusto", "ashby", "lever", "greenhouse",
        "workato", "celonis", "samsara", "locus", "fivetran",
        "dbt labs", "airbyte", "dagster", "astronomer", "kestra",
        "octopus", "render", "railway", "neon", "planetscale",
        "cockroach labs", "timescale", "influxdata", "confluent",
        "redpanda", "materialize", "risingwave", "clickhouse",
        "duckdb", "motherduck", "dagshub", "labelbox", "snorkel ai",
        "gong", "chili piper", "outreach", "salesloft", "apollo",
        "lusha", "zoominfo", "clari", "people.ai", "copy.ai",
        "writer", "jasper", "typeface", "synthesia", "descript",
        "opus clip", "pika labs", "hey gen", "krea", "leonardo ai",
        "adobe firefly", "stability ai", "black forest labs",
        "ideogram", "recraft", "illustroke", "vector shift",
        "akamai", "warp", "raycast", "arc", "sigma computing",
        "together ai", "fireworks ai", "anyscale", "modal",
        "baseten", "replicate", "fal.ai", "banana dev",
    }

    def _detect_startup_profile(self, title: str, company: str) -> dict:
        text = (title + " " + company).lower()
        company_lower = company.lower().strip()
        domains = ["tech"]
        company_size = None
        funding_stage = None
        est_founded_date = None

        today = date.today()

        is_startup = False
        if company_lower in self.STARTUP_NAMES or any(
            name in company_lower for name in self.STARTUP_NAMES
        ):
            is_startup = True
            funding_stage = "Startup (Known)"
            est_founded_date = date(today.year - 2, 1, 1)

        signals = [
            "startup", "yc ", "y combinator", "venture backed", "venture-backed",
            "seed stage", "seed-stage", "series a", "series b", "stealth startup",
            "backed by", "funded startup", "early stage", "early-stage",
            "pre-seed", "preseed", "pre seed",
        ]
        for signal in signals:
            if signal in text:
                is_startup = True
                stage_map = {
                    "pre-seed": ("Pre-Seed", 0.5), "preseed": ("Pre-Seed", 0.5), "pre seed": ("Pre-Seed", 0.5),
                    "seed": ("Seed", 1), "seed stage": ("Seed", 1), "seed-stage": ("Seed", 1),
                    "series a": ("Series A", 2),
                    "series b": ("Series B", 3),
                }
                for key, (stage, years) in stage_map.items():
                    if key in text:
                        funding_stage = stage
                        est_year = today.year - int(years * 12 // 12)
                        est_founded_date = date(est_year, 1, 1)
                        company_size = "1-10" if "pre-seed" in key or "seed" in key else "11-50"
                        break
                if not funding_stage:
                    funding_stage = "Startup"
                    est_founded_date = date(today.year - 2, 1, 1)
                break

        if is_startup:
            domains.insert(0, "startup")

        return {
            "domains": domains,
            "company_size": company_size,
            "funding_stage": funding_stage,
            "est_founded_date": est_founded_date,
        }

    def _parse_date(self, date_text: str) -> Optional[datetime]:
        if not date_text:
            return None
        date_text = date_text.lower().strip()
        now = datetime.now()

        if "hour" in date_text or "minute" in date_text or "just now" in date_text:
            return now
        if "day" in date_text:
            match = re.search(r"(\d+)", date_text)
            days = int(match.group(1)) if match else 1
            return now.replace(hour=0, minute=0, second=0, microsecond=0)
        if "week" in date_text:
            match = re.search(r"(\d+)", date_text)
            weeks = int(match.group(1)) if match else 1
            return now.replace(hour=0, minute=0, second=0, microsecond=0)
        if "month" in date_text:
            return now.replace(hour=0, minute=0, second=0, microsecond=0)
        return now

    def _is_startup_related(self, title: str, company: str) -> bool:
        text = (title + " " + company).lower()
        startup_keywords = [
            "startup", "early-stage", "early stage", "seed", "series a",
            "venture backed", "yc ", "y combinator", "stealth",
            "founder", "co-founder", "pre-seed", "preseed",
        ]
        return any(k in text for k in startup_keywords)

    def _infer_work_mode(self, title: str, location: str) -> str:
        t = title.lower()
        loc = location.lower()
        if "remote" in t or "remote" in loc or "anywhere" in loc:
            return "remote"
        if "hybrid" in t or "hybrid" in loc:
            return "hybrid"
        return "onsite"

    def _extract_skills(self, title: str) -> list[str]:
        title_lower = title.lower()
        skill_map = {
            "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
            "react": "React", "node": "Node.js", "java": "Java", "go": "Go",
            "rust": "Rust", "sql": "SQL", "aws": "AWS", "docker": "Docker",
            "kubernetes": "Kubernetes", "machine learning": "Machine Learning",
            "ai": "AI", "data": "Data Science", "frontend": "Frontend",
            "backend": "Backend", "full stack": "Full Stack", "fullstack": "Full Stack",
            "design": "Design", "product": "Product Management",
            "mobile": "Mobile Development", "ios": "iOS", "android": "Android",
            "devops": "DevOps", "security": "Cybersecurity",
        }
        found = []
        for keyword, skill in skill_map.items():
            if keyword in title_lower:
                found.append(skill)
        return found

    async def validate(self, opportunity: ScrapedOpportunity) -> bool:
        if not opportunity.title or not opportunity.company or not opportunity.source_id:
            return False
        if len(opportunity.title) < 5:
            return False
        return True

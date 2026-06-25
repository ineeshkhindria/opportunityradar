import re
import json
from datetime import date, datetime
from typing import Optional
from bs4 import BeautifulSoup
from app.services.scraper.base import BaseScraper, ScrapedOpportunity


class WellfoundScraper(BaseScraper):
    EXPLORE_URL = "https://wellfound.com/startups"
    COMPANY_URL = "https://wellfound.com/company/{slug}"

    async def scrape(self) -> list[ScrapedOpportunity]:
        opportunities = []
        startups = await self._fetch_recent_startups()
        for startup in startups:
            jobs = await self._fetch_company_jobs(startup)
            for job in jobs:
                if job and await self.validate(job):
                    opportunities.append(job)
        return opportunities

    async def _fetch_recent_startups(self) -> list[dict]:
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return []

        startups = []
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.set_extra_http_headers({
                    "User-Agent": (
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0.0.0 Safari/537.36"
                    ),
                })

                await page.goto(self.EXPLORE_URL, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(3000)

                for _ in range(3):
                    content = await page.content()
                    soup = BeautifulSoup(content, "lxml")

                    cards = (
                        soup.select("[class*=startup] a[href*='/company/']")
                        or soup.select("a[href*='/company/']")
                        or soup.select("[class*=card] a[href]")
                    )

                    for card in cards:
                        href = card.get("href", "")
                        if "/company/" in href:
                            slug = href.strip("/").split("/")[-1]
                            name_el = card.select_one("[class*=name], [class*=title], h3, h4")
                            name = name_el.get_text(strip=True) if name_el else slug.replace("-", " ").title()
                            if slug and len(slug) > 2:
                                startups.append({
                                    "slug": slug,
                                    "name": name,
                                })

                    try:
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await page.wait_for_timeout(2000)

                        load_more = await page.query_selector("button:has-text('Load More'), button:has-text('Show More')")
                        if load_more:
                            await load_more.click()
                            await page.wait_for_timeout(2000)
                    except Exception:
                        break

                await browser.close()
        except Exception:
            pass

        seen = set()
        unique = []
        for s in startups:
            if s["slug"] not in seen:
                seen.add(s["slug"])
                unique.append(s)
        return unique[:50]

    async def _fetch_company_jobs(self, startup: dict) -> list[ScrapedOpportunity]:
        slug = startup["slug"]
        company_name = startup["name"]

        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return []

        opportunities = []
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.set_extra_http_headers({
                    "User-Agent": (
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0.0.0 Safari/537.36"
                    ),
                })

                url = self.COMPANY_URL.format(slug=slug)
                await page.goto(url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(3000)

                content = await page.content()
                soup = BeautifulSoup(content, "lxml")

                company_info = self._extract_company_info(soup)
                company_name = company_info.get("name") or company_name
                founded_date = company_info.get("founded_date")
                company_size = company_info.get("company_size")
                funding_stage = company_info.get("funding_stage")
                logo = company_info.get("logo")

                job_cards = (
                    soup.select("[class*=job], [class*=position], [class*=opening]")
                    or soup.select("a[href*='/jobs/']")
                )

                seen_titles = set()
                for card in job_cards:
                    opp = self._parse_job_card(
                        card, company_name, slug, founded_date,
                        company_size, funding_stage, logo
                    )
                    if opp and opp.title not in seen_titles:
                        seen_titles.add(opp.title)
                        opportunities.append(opp)

                await browser.close()
        except Exception:
            pass

        return opportunities

    def _extract_company_info(self, soup: BeautifulSoup) -> dict:
        info = {}

        scripts = soup.find_all("script", type="application/ld+json")
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    if data.get("@type") == "Organization":
                        info["name"] = data.get("name")
                        info["logo"] = data.get("logo")
                        info["description"] = data.get("description")
                        founding = data.get("foundingDate") or data.get("founding_date")
                        if founding:
                            try:
                                info["founded_date"] = datetime.strptime(founding[:10], "%Y-%m-%d").date()
                            except (ValueError, TypeError):
                                try:
                                    info["founded_date"] = date(int(founding[:4]), 1, 1)
                                except (ValueError, TypeError):
                                    pass
                    break
            except (json.JSONDecodeError, AttributeError):
                continue

        if not info.get("founded_date"):
            text = soup.get_text()
            patterns = [
                r"Founded[:\s]+(\d{4})",
                r"Founding Date[:\s]+(\d{4})",
                r"Since[:\s]+(\d{4})",
                r"Established[:\s]+(\d{4})",
            ]
            for pat in patterns:
                match = re.search(pat, text)
                if match:
                    try:
                        info["founded_date"] = date(int(match.group(1)), 1, 1)
                        break
                    except (ValueError, TypeError):
                        continue

        meta_els = soup.select("[class*=meta], [class*=detail], [class*=info] span, li")
        for el in meta_els:
            text = el.get_text(strip=True).lower()
            if "employees" in text or "size" in text:
                info["company_size"] = el.get_text(strip=True)
            elif "stage" in text or "funding" in text:
                info["funding_stage"] = el.get_text(strip=True)
            elif "founded" in text and not info.get("founded_date"):
                match = re.search(r"(\d{4})", text)
                if match:
                    try:
                        info["founded_date"] = date(int(match.group(1)), 1, 1)
                    except (ValueError, TypeError):
                        pass

        return info

    def _parse_job_card(
        self, card, company_name: str, slug: str,
        founded_date: Optional[date], company_size: Optional[str],
        funding_stage: Optional[str], logo: Optional[str],
    ) -> Optional[ScrapedOpportunity]:
        title_el = card.select_one("a[href*='/jobs/'], [class*=title] a, h3, h4, [class*=position]")
        if not title_el:
            title_el = card.select_one("a")

        if not title_el:
            return None

        title = title_el.get_text(strip=True)
        if not title or not self._is_internship(title):
            return None

        href = title_el.get("href", "")
        if href.startswith("/"):
            href = f"https://wellfound.com{href}"
        source_id = href.split("/")[-1] if "/" in href else slug

        location_el = card.select_one("[class*=location], [class*=locality]")
        location = location_el.get_text(strip=True) if location_el else "Remote"

        stipend_el = card.select_one("[class*=compensation], [class*=salary], [class*=stipend]")
        stipend = stipend_el.get_text(strip=True) if stipend_el else None

        desc_el = card.select_one("[class*=description], [class*=overview], p")
        description = desc_el.get_text(strip=True) if desc_el else title

        skills_el = card.select("[class*=skill], [class*=tech]")
        skills = [s.get_text(strip=True) for s in skills_el if s.get_text(strip=True)]

        return ScrapedOpportunity(
            title=title,
            company=company_name,
            description=description[:2000],
            source="wellfound",
            source_url=href,
            source_id=f"wf_{slug}_{source_id}",
            location=location,
            work_mode="remote" if "remote" in (location + title).lower() else "hybrid",
            stipend=stipend,
            skills_required=skills,
            domains=["startup", "tech"],
            company_logo=logo,
            company_founded_date=founded_date,
            company_size=company_size,
            company_funding_stage=funding_stage,
            company_slug=slug,
        )

    def _is_internship(self, title: str) -> bool:
        t = title.lower()
        keywords = [
            "intern", "internship", "junior", "entry level", "entry-level",
            "graduate", "trainee", "fellowship", "apprentice",
            "co-op", "coop", "summer", "winter",
        ]
        return any(k in t for k in keywords)

    async def validate(self, opportunity: ScrapedOpportunity) -> bool:
        if not opportunity.title or not opportunity.company:
            return False
        if len(opportunity.title) < 3:
            return False
        return True

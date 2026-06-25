import json
import logging
from typing import Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models.profile import StudentProfile
from app.models.opportunity import Opportunity

logger = logging.getLogger(__name__)

RANKING_PROMPT = """You are an internship matching expert. Given a student's profile and a list of internship opportunities, rank them by relevance and provide a personalized explanation for each.

STUDENT PROFILE:
- Skills: {skills}
- Year: {year}
- Branch: {branch}
- Degree: {degree}
- Preferred Domains: {domains}
- Preferred Locations: {locations}
- Work Mode: {work_mode}
- Min Expected Stipend: {min_stipend}

INTERNSHIPS:
{opportunities}

For each internship, provide:
1. A match score from 0-100
2. A concise 1-2 sentence explanation of why it fits (or doesn't fit) this student

Respond ONLY with a valid JSON array. No markdown, no code fences.
Format:
[
  {{
    "opportunity_id": "<uuid>",
    "score": 0-100,
    "reason": "explanation text"
  }}
]
"""


class RankingEngine:
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self._init_clients()

    def _init_clients(self):
        if settings.openai_api_key:
            self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        if settings.anthropic_api_key:
            self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def rank_for_user(
        self,
        profile: StudentProfile,
        opportunities: list[Opportunity],
        db: AsyncSession,
        top_k: int = 20,
    ) -> list[dict]:
        if not opportunities:
            return []

        if profile.skills and profile.preferred_domains:
            pre_filtered = self._keyword_filter(profile, opportunities)
        else:
            pre_filtered = opportunities

        candidates = pre_filtered[:50]

        if not self.openai_client and not self.anthropic_client:
            return self._score_fallback(profile, candidates)

        try:
            return await self._llm_rank(profile, candidates, top_k)
        except Exception as e:
            logger.error(f"LLM ranking failed: {e}, using fallback")
            return self._score_fallback(profile, candidates)

    def _keyword_filter(self, profile: StudentProfile, opportunities: list[Opportunity]) -> list[Opportunity]:
        profile_skills_lower = [s.lower() for s in (profile.skills or [])]
        profile_domains_lower = [d.lower() for d in (profile.preferred_domains or [])]

        scored = []
        for opp in opportunities:
            score = 0
            opp_skills = [s.lower() for s in (opp.skills_required or [])]
            opp_domains = [d.lower() for d in (opp.domains or [])]
            text = (opp.title + " " + opp.description + " " + opp.company).lower()

            for skill in profile_skills_lower:
                if skill in text or skill in opp_skills:
                    score += 2
            for domain in profile_domains_lower:
                if domain in text or domain in opp_domains:
                    score += 3

            if profile.preferred_locations:
                for loc in profile.preferred_locations:
                    if opp.location and loc.lower() in opp.location.lower():
                        score += 2

            if profile.work_mode and opp.work_mode:
                if profile.work_mode == opp.work_mode:
                    score += 2

            if score > 0:
                scored.append((score, opp))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [opp for _, opp in scored]

    async def _llm_rank(
        self,
        profile: StudentProfile,
        opportunities: list[Opportunity],
        top_k: int,
    ) -> list[dict]:
        opp_text = []
        for opp in opportunities:
            opp_text.append(
                f"ID: {opp.id}\n"
                f"Title: {opp.title}\n"
                f"Company: {opp.company}\n"
                f"Location: {opp.location}\n"
                f"Stipend: {opp.stipend}\n"
                f"Skills: {', '.join(opp.skills_required or [])}\n"
                f"Work Mode: {opp.work_mode}\n"
                f"Description: {(opp.description or '')[:500]}\n"
            )

        prompt = RANKING_PROMPT.format(
            skills=", ".join(profile.skills or ["Not specified"]),
            year=profile.year or "Not specified",
            branch=profile.branch or "Not specified",
            degree=profile.degree or "Not specified",
            domains=", ".join(profile.preferred_domains or ["Any"]),
            locations=", ".join(profile.preferred_locations or ["Any"]),
            work_mode=profile.work_mode or "Any",
            min_stipend=str(profile.min_stipend) if profile.min_stipend else "Not specified",
            opportunities="\n---\n".join(opp_text),
        )

        if settings.llm_provider == "anthropic" and self.anthropic_client:
            response = await self.anthropic_client.messages.create(
                model=settings.llm_model or "claude-sonnet-4-20250514",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = response.content[0].text
        else:
            if not self.openai_client:
                return self._score_fallback(profile, opportunities)
            response = await self.openai_client.chat.completions.create(
                model=settings.llm_model or "gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content or ""

        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0]
        if raw.startswith("json"):
            raw = raw[4:].strip()

        try:
            results = json.loads(raw)
            if isinstance(results, dict) and "rankings" in results:
                results = results["rankings"]
            if isinstance(results, dict):
                results = list(results.values())
        except json.JSONDecodeError:
            logger.error(f"Failed to parse LLM response: {raw[:200]}")
            return self._score_fallback(profile, opportunities)

        results.sort(key=lambda x: x.get("score", 0), reverse=True)
        return results[:top_k]

    def _score_fallback(self, profile: StudentProfile, opportunities: list[Opportunity]) -> list[dict]:
        scored = self._keyword_filter(profile, opportunities)
        results = []
        for opp in scored:
            results.append({
                "opportunity_id": str(opp.id),
                "score": 50,
                "reason": "Matched based on skills and preferences",
            })
        return results

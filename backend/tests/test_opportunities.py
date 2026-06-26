import pytest
from httpx import AsyncClient

class TestOpportunities:
    @pytest.mark.asyncio
    async def test_list_opportunities(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/opportunities", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        if data["items"]:
            opp = data["items"][0]
            assert "title" in opp
            assert "company" in opp

    @pytest.mark.asyncio
    async def test_match_endpoint_returns_rankings(self, client: AsyncClient, auth_headers):
        resp = await client.put("/api/profile", json={
            "college": "MUJ",
            "year": "3rd Year",
            "branch": "CS",
            "degree": "B.Tech",
            "skills": ["Python"],
            "preferred_domains": ["Engineering"],
            "work_mode": "remote",
        }, headers=auth_headers)
        assert resp.status_code == 200
        resp = await client.get("/api/opportunities/match", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data

    @pytest.mark.asyncio
    async def test_match_requires_profile(self, client: AsyncClient):
        resp = await client.get("/api/opportunities/match", headers={
            "Authorization": "Bearer invalidtoken"
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_filter_by_domain(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/opportunities?domain=tech", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data

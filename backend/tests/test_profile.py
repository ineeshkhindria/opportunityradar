import pytest
from httpx import AsyncClient

class TestProfile:
    @pytest.mark.asyncio
    async def test_create_profile(self, client: AsyncClient, auth_headers):
        resp = await client.put("/api/profile", json={
            "college": "MUJ",
            "year": "3rd Year",
            "branch": "Computer Science",
            "degree": "B.Tech",
            "skills": ["Python", "React", "TypeScript"],
            "preferred_domains": ["Software Development"],
            "preferred_locations": ["Bangalore", "Remote"],
            "work_mode": "remote",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["college"] == "MUJ"
        assert "Python" in data["skills"]

    @pytest.mark.asyncio
    async def test_get_profile(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/profile", headers=auth_headers)
        assert resp.status_code in (200, 404)

    @pytest.mark.asyncio
    async def test_profile_requires_auth(self, client: AsyncClient):
        resp = await client.put("/api/profile", json={"college": "MUJ"})
        assert resp.status_code == 401

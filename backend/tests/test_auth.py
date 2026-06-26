import pytest
from httpx import AsyncClient

class TestAuth:
    @pytest.mark.asyncio
    async def test_register_returns_jwt(self, client: AsyncClient):
        import uuid
        email = f"new-{uuid.uuid4().hex[:8]}@test.com"
        resp = await client.post("/api/auth/register", json={
            "email": email,
            "password": "password123",
            "full_name": "New User",
        })
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_returns_jwt(self, client: AsyncClient, registered_user):
        resp = await client.post("/api/auth/login", json={
            "email": "testuser@test.com",
            "password": "testpass123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient):
        resp = await client.post("/api/auth/login", json={
            "email": "testuser@test.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_me_returns_current_user(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "testuser@test.com"

    @pytest.mark.asyncio
    async def test_me_without_token(self, client: AsyncClient):
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 401

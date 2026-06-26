import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

TEST_EMAIL = "testuser@test.com"
TEST_PASSWORD = "testpass123"

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def registered_user(client):
    resp = await client.post("/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": "Test User",
    })
    if resp.status_code == 200:
        return resp.json()
    resp = await client.post("/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    })
    return resp.json()

@pytest_asyncio.fixture
async def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['access_token']}"}

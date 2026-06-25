import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend'))

from app.database import engine
from app.models.base import Base


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


try:
    asyncio.get_running_loop()
except RuntimeError:
    asyncio.run(init_db())

from app.main import app

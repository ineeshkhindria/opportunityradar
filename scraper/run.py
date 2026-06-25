import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.scraper.manager import ScraperManager
from app.database import engine


async def main():
    print("Starting scraper run...")
    manager = ScraperManager()
    results = await manager.run_all()
    for source, count in results.items():
        print(f"  {source}: {count}")
    total = sum(results.values())
    print(f"Total new opportunities: {total}")


if __name__ == "__main__":
    asyncio.run(main())

"""
Standalone scraper entrypoint for CI (GitHub Actions) and local runs.

Usage:
    PYTHONPATH=backend python scraper/run.py

In CI, PYTHONPATH is set via the workflow env block — see .github/workflows/scrape.yml.
"""
import asyncio
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

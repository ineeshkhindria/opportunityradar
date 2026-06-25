from .base import BaseScraper, ScrapedOpportunity
from .internshala import InternshalaScraper
from .linkedin import LinkedInScraper
from .wellfound import WellfoundScraper
from .yc import YCombinatorScraper
from .manager import ScraperManager

__all__ = [
    "BaseScraper",
    "ScrapedOpportunity",
    "InternshalaScraper",
    "LinkedInScraper",
    "WellfoundScraper",
    "YCombinatorScraper",
    "ScraperManager",
]

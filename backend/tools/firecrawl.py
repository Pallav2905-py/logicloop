"""
Firecrawl tool — selective deep content extraction.

IMPORTANT: Firecrawl is NOT used for bulk scraping.
It is called ONLY after evidence processing identifies 1-2 high-value URLs
that would benefit from deeper content extraction.
"""
import os
import logging
import aiohttp
from typing import Optional

logger = logging.getLogger(__name__)

FIRECRAWL_BASE = "https://api.firecrawl.dev/v1"


async def extract_page_content(url: str, max_chars: int = 2000) -> Optional[str]:
    """
    Extract deep content from a single high-value URL.
    
    Returns cleaned text or None on failure.
    Never raises — all errors are handled gracefully.
    """
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        logger.info("FIRECRAWL_API_KEY not configured, skipping deep extraction")
        return None

    payload = {
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": True,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{FIRECRAWL_BASE}/scrape",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=20),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    content = data.get("data", {}).get("markdown", "") or ""
                    # Clean and truncate
                    cleaned = " ".join(content.split())
                    return cleaned[:max_chars] if cleaned else None
                elif resp.status == 402:
                    logger.warning("Firecrawl: payment required / quota exceeded")
                    return None
                else:
                    logger.warning(f"Firecrawl returned {resp.status} for {url}")
                    return None
    except Exception as e:
        logger.error(f"Firecrawl extraction failed for {url}: {e}")
        return None


def should_use_firecrawl(url: str) -> bool:
    """
    Heuristic to decide if a URL warrants deep Firecrawl extraction.
    Only use for high-value pages (academic papers, official product pages, etc.)
    """
    if not os.getenv("FIRECRAWL_API_KEY"):
        return False

    skip_domains = {"github.com", "twitter.com", "x.com", "linkedin.com", "youtube.com", "reddit.com"}
    from urllib.parse import urlparse
    domain = urlparse(url).netloc.replace("www.", "")

    if any(skip in domain for skip in skip_domains):
        return False

    # Prefer: academic sites, official product pages, well-known tech blogs
    priority_patterns = ["arxiv.org", "scholar.google", "research.", "blog.", "docs.", "/paper", "/research", "/about"]
    return any(p in url.lower() for p in priority_patterns)

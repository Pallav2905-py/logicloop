"""SerpAPI tool — targeted web search for competitors, products, patents."""
import os
import logging
import asyncio
import aiohttp
from models.evidence import WebEvidence, PatentEvidence

logger = logging.getLogger(__name__)

SERP_API_BASE = "https://serpapi.com/search"


async def _serp_search(session: aiohttp.ClientSession, query: str, search_type: str = "web") -> list[dict]:
    api_key = os.getenv("SERP_API_KEY")
    if not api_key:
        logger.warning("SERP_API_KEY not configured, skipping SerpAPI search")
        return []

    params = {
        "q": query,
        "api_key": api_key,
        "num": 8,
        "hl": "en",
    }
    if search_type == "patent":
        params["tbm"] = "pts"

    try:
        async with session.get(SERP_API_BASE, params=params, timeout=aiohttp.ClientTimeout(total=12)) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("organic_results", [])
            else:
                body = await resp.text()
                logger.warning(f"SerpAPI returned {resp.status}: {body[:200]}")
                return []
    except Exception as e:
        logger.error(f"SerpAPI error for query '{query}': {e}")
        return []


async def fetch_web_evidence(queries: list[str]) -> list[WebEvidence]:
    """Fetch web evidence for a list of queries."""
    if not queries:
        return []

    results: list[WebEvidence] = []
    seen_urls: set[str] = set()

    async with aiohttp.ClientSession() as session:
        tasks = [_serp_search(session, q, "web") for q in queries[:4]]
        raw_batches = await asyncio.gather(*tasks, return_exceptions=True)

        for i, batch in enumerate(raw_batches):
            if isinstance(batch, Exception):
                logger.warning(f"SerpAPI web query {i} failed: {batch}")
                continue
            for item in batch:
                url = item.get("link", "")
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)

                from urllib.parse import urlparse
                domain = urlparse(url).netloc.replace("www.", "")

                results.append(WebEvidence(
                    title=item.get("title", "Untitled")[:200],
                    description=item.get("snippet", "")[:400],
                    url=url,
                    snippet=item.get("snippet", "")[:400],
                    domain=domain,
                    relevance=0.6,  # base relevance; refined during processing
                ))

    return results[:12]


async def fetch_patent_evidence(queries: list[str]) -> list[PatentEvidence]:
    """Fetch patent prior-art signals via SerpAPI patent search."""
    if not queries:
        return []

    results: list[PatentEvidence] = []
    seen_urls: set[str] = set()
    DISCLAIMER = "Prior-art signal only — not a legal opinion on patentability or freedom-to-operate."

    async with aiohttp.ClientSession() as session:
        # Use at most 2 patent queries to preserve quota
        tasks = [_serp_search(session, q + " patent", "patent") for q in queries[:2]]
        raw_batches = await asyncio.gather(*tasks, return_exceptions=True)

        for i, batch in enumerate(raw_batches):
            if isinstance(batch, Exception):
                logger.warning(f"SerpAPI patent query {i} failed: {batch}")
                continue
            for item in batch:
                url = item.get("link", "")
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)

                results.append(PatentEvidence(
                    title=item.get("title", "Untitled Patent")[:200],
                    description=item.get("snippet", "")[:400],
                    url=url,
                    snippet=item.get("snippet", "")[:400],
                    patent_number=item.get("patent_id"),
                    assignee=item.get("assignee"),
                    filing_date=item.get("priority_date"),
                    relevance=0.5,
                ))

    return results[:6]

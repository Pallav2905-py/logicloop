"""Tavily tool — semantic web research for market landscape and competitors."""
import os
import logging
import asyncio
import aiohttp
from models.evidence import WebEvidence

logger = logging.getLogger(__name__)

TAVILY_API_BASE = "https://api.tavily.com/search"


async def _tavily_search(session: aiohttp.ClientSession, query: str, max_results: int = 6) -> list[dict]:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        logger.warning("TAVILY_API_KEY not configured, skipping Tavily search")
        return []

    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "basic",
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": False,
    }
    try:
        async with session.post(TAVILY_API_BASE, json=payload, timeout=aiohttp.ClientTimeout(total=12)) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("results", [])
            else:
                body = await resp.text()
                logger.warning(f"Tavily returned {resp.status}: {body[:200]}")
                return []
    except Exception as e:
        logger.error(f"Tavily error for query '{query}': {e}")
        return []


async def fetch_semantic_evidence(queries: list[str]) -> list[WebEvidence]:
    """
    Fetch semantically relevant web evidence via Tavily.
    Prefer for market landscape, competitors, and emerging solutions.
    """
    if not queries:
        return []

    results: list[WebEvidence] = []
    seen_urls: set[str] = set()

    async with aiohttp.ClientSession() as session:
        # Max 3 Tavily queries to avoid duplication with SerpAPI
        tasks = [_tavily_search(session, q) for q in queries[:3]]
        raw_batches = await asyncio.gather(*tasks, return_exceptions=True)

        for i, batch in enumerate(raw_batches):
            if isinstance(batch, Exception):
                logger.warning(f"Tavily query {i} failed: {batch}")
                continue
            for item in batch:
                url = item.get("url", "")
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)

                from urllib.parse import urlparse
                domain = urlparse(url).netloc.replace("www.", "")

                results.append(WebEvidence(
                    title=item.get("title", "Untitled")[:200],
                    description=item.get("content", "")[:400],
                    url=url,
                    snippet=item.get("content", "")[:400],
                    domain=domain,
                    relevance=item.get("score", 0.5),
                ))

    results.sort(key=lambda x: x.relevance, reverse=True)
    return results[:10]

"""OpenAlex tool — academic paper search via OpenAlex API."""
import os
import logging
import asyncio
import aiohttp
from models.evidence import PaperEvidence

logger = logging.getLogger(__name__)

OPENALEX_BASE = "https://api.openalex.org/works"


async def _search_papers(session: aiohttp.ClientSession, query: str, max_results: int = 6) -> list[dict]:
    api_key = os.getenv("OPENALEX_API_KEY")
    params = {
        "search": query,
        "per-page": max_results,
        "sort": "cited_by_count:desc",
        "filter": "is_oa:false",  # include all papers, not just OA
        "select": "id,title,authorships,publication_year,doi,abstract_inverted_index,cited_by_count,primary_location,open_access",
    }
    headers = {}
    if api_key:
        headers["api_key"] = api_key
    else:
        # Use polite pool with email — required without key
        params["mailto"] = "hackathon@logicloop.ai"

    try:
        async with session.get(OPENALEX_BASE, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=12)) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("results", [])
            else:
                logger.warning(f"OpenAlex returned {resp.status}")
                return []
    except Exception as e:
        logger.error(f"OpenAlex error for query '{query}': {e}")
        return []


def _reconstruct_abstract(inverted: dict | None) -> str:
    """Reconstruct abstract from OpenAlex inverted index."""
    if not inverted:
        return ""
    try:
        word_positions: list[tuple[int, str]] = []
        for word, positions in inverted.items():
            for pos in positions:
                word_positions.append((pos, word))
        word_positions.sort()
        return " ".join(w for _, w in word_positions)[:500]
    except Exception:
        return ""


def _extract_doi_url(work: dict) -> str:
    doi = work.get("doi")
    if doi:
        return doi if doi.startswith("http") else f"https://doi.org/{doi.replace('https://doi.org/', '')}"
    loc = work.get("primary_location") or {}
    return loc.get("landing_page_url") or f"https://openalex.org/{work.get('id', '').split('/')[-1]}"


async def fetch_paper_evidence(queries: list[str]) -> list[PaperEvidence]:
    """Fetch academic papers from OpenAlex for a list of queries."""
    if not queries:
        return []

    results: list[PaperEvidence] = []
    seen_ids: set[str] = set()

    async with aiohttp.ClientSession() as session:
        tasks = [_search_papers(session, q) for q in queries[:3]]
        raw_batches = await asyncio.gather(*tasks, return_exceptions=True)

        for i, batch in enumerate(raw_batches):
            if isinstance(batch, Exception):
                logger.warning(f"OpenAlex query {i} failed: {batch}")
                continue

            for work in batch:
                work_id = work.get("id", "")
                if work_id in seen_ids:
                    continue
                seen_ids.add(work_id)

                authors = []
                for a in work.get("authorships", [])[:4]:
                    author_name = a.get("author", {}).get("display_name", "")
                    if author_name:
                        authors.append(author_name)

                abstract = _reconstruct_abstract(work.get("abstract_inverted_index"))
                citations = work.get("cited_by_count", 0)
                year = work.get("publication_year")
                url = _extract_doi_url(work)
                title = work.get("title") or "Untitled"

                results.append(PaperEvidence(
                    title=title[:300],
                    description=(abstract or title)[:400],
                    url=url,
                    authors=authors,
                    year=year,
                    doi=work.get("doi"),
                    abstract=abstract[:400] if abstract else None,
                    citations=citations,
                    relevance=min(citations / 500, 1.0) if citations > 0 else 0.3,
                ))

    results.sort(key=lambda x: x.citations, reverse=True)
    return results[:8]

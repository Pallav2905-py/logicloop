"""GitHub tool — fetches repositories using GitHub REST API."""
import os
import asyncio
import aiohttp
import logging
from models.evidence import GitHubEvidence

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"


def _get_headers() -> dict:
    token = os.getenv("GITHUB_API")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def _search_repos(session: aiohttp.ClientSession, query: str, max_results: int = 5) -> list[dict]:
    url = f"{GITHUB_API_BASE}/search/repositories"
    params = {"q": query, "sort": "stars", "order": "desc", "per_page": max_results}
    try:
        async with session.get(url, params=params, headers=_get_headers(), timeout=aiohttp.ClientTimeout(total=10)) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("items", [])
            elif resp.status == 403:
                logger.warning("GitHub rate limit hit")
                return []
            else:
                logger.warning(f"GitHub search returned {resp.status}")
                return []
    except Exception as e:
        logger.error(f"GitHub search error: {e}")
        return []


async def _get_readme(session: aiohttp.ClientSession, owner: str, repo: str) -> str:
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/readme"
    try:
        async with session.get(url, headers={**_get_headers(), "Accept": "application/vnd.github.raw+json"}, timeout=aiohttp.ClientTimeout(total=8)) as resp:
            if resp.status == 200:
                text = await resp.text()
                # Return first 500 chars
                return text[:500].strip()
            return ""
    except Exception:
        return ""


def _score_relevance(repo: dict, query: str) -> float:
    """Simple relevance scoring based on stars and description match."""
    score = min(repo.get("stargazers_count", 0) / 10000, 0.5)
    desc = (repo.get("description") or "").lower()
    query_words = query.lower().split()
    matches = sum(1 for w in query_words if w in desc)
    score += (matches / max(len(query_words), 1)) * 0.5
    return round(min(score, 1.0), 2)


async def fetch_github_evidence(queries: list[str], max_per_query: int = 5) -> list[GitHubEvidence]:
    """
    Fetch GitHub repositories for a list of queries.
    Returns deduplicated GitHubEvidence items.
    """
    if not queries:
        return []

    results: list[GitHubEvidence] = []
    seen_urls: set[str] = set()

    async with aiohttp.ClientSession() as session:
        # Run queries concurrently
        tasks = [_search_repos(session, q, max_per_query) for q in queries[:4]]
        raw_batches = await asyncio.gather(*tasks, return_exceptions=True)

        # Collect top repos for README fetching
        top_repos: list[tuple[dict, str]] = []  # (repo, query)
        for i, batch in enumerate(raw_batches):
            if isinstance(batch, Exception):
                logger.warning(f"GitHub query {i} failed: {batch}")
                continue
            for repo in batch:
                url = repo.get("html_url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    top_repos.append((repo, queries[i] if i < len(queries) else ""))

        # Fetch READMEs for top-5 by stars
        top_repos.sort(key=lambda x: x[0].get("stargazers_count", 0), reverse=True)
        readme_tasks = []
        for repo, _ in top_repos[:5]:
            owner = repo.get("owner", {}).get("login", "")
            name = repo.get("name", "")
            readme_tasks.append(_get_readme(session, owner, name))

        readmes = await asyncio.gather(*readme_tasks, return_exceptions=True)

        # Build evidence objects
        for idx, (repo, query) in enumerate(top_repos):
            owner = repo.get("owner", {}).get("login", "")
            name = repo.get("name", "")
            readme = readmes[idx] if idx < len(readmes) and not isinstance(readmes[idx], Exception) else ""
            full_name = repo.get("full_name", f"{owner}/{name}")

            evidence = GitHubEvidence(
                title=full_name,
                description=(repo.get("description") or "No description")[:300],
                url=repo.get("html_url", f"https://github.com/{full_name}"),
                repo_name=full_name,
                stars=repo.get("stargazers_count", 0),
                language=repo.get("language"),
                readme_snippet=str(readme)[:500] if readme else None,
                topics=repo.get("topics", [])[:5],
                relevance=_score_relevance(repo, query),
            )
            results.append(evidence)

    # Sort by relevance desc
    results.sort(key=lambda x: x.relevance, reverse=True)
    return results[:10]  # cap at 10 per run

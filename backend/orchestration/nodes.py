"""
LangGraph node implementations for the validation workflow.

Each node:
  1. Receives the current ProjectState
  2. Performs its work (tool calls, LLM calls, processing)
  3. Returns a dict of state updates (only the fields it modifies)

No node maintains private state. All shared memory flows through ProjectState.
"""
import asyncio
import json
import logging
from typing import Any

from models.state import ProjectState
from models.input import ProjectInput, NormalizedProject, SearchQueries
from models.evidence import EvidenceBundle, GitHubEvidence, WebEvidence, PaperEvidence, PatentEvidence
from models.agents import (
    ResearchAnalysis, PriorArtAnalysis, CompetitionAnalysis,
    SolutionAnalysis, CriticAnalysis,
    ExistingSolution, PaperHighlight, PatentSignal, Competitor, MVPFeature, TechApproach, RiskItem
)
from models.report import FinalReport, Scorecard, Decision, AgentScores, EvidenceSummary

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# NODE 1: validate_input
# ─────────────────────────────────────────────────────────────────────────────

def validate_input(state: ProjectState) -> dict:
    """
    Validate the incoming project input.
    Checks for minimum description length and coherence.
    """
    logger.info("[Node] validate_input")
    project = state["project"]
    warnings = list(state.get("warnings", []))

    if not project:
        return {"errors": ["No project input provided"], "current_stage": "error"}

    desc = project.description.strip()
    if len(desc) < 30:
        return {
            "is_clarification_needed": True,
            "clarification_message": (
                f"Your description is too vague ({len(desc)} chars). "
                "Please provide at least 30 characters describing the problem you're solving, "
                "your proposed approach, and target users."
            ),
            "current_stage": "clarification_needed",
        }

    # Warn if optional fields are missing
    if not project.target_users:
        warnings.append("No target users specified — analysis will be less targeted")
    if not project.market:
        warnings.append("No market/geography specified — defaulting to global analysis")

    return {
        "warnings": warnings,
        "current_stage": "validated",
    }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 2: normalize_project
# ─────────────────────────────────────────────────────────────────────────────

def normalize_project(state: ProjectState) -> dict:
    """
    Normalize and enrich the project input.
    Derives domain, problem statement, key concepts for query generation.
    Uses a lightweight LLM call for normalization.
    """
    logger.info("[Node] normalize_project")
    project = state["project"]
    warnings = list(state.get("warnings", []))

    try:
        from llm.router import call_llm

        prompt = f"""Given this project submission, extract structured information.
Return ONLY a JSON object with no markdown:

Project Title: {project.title}
Description: {project.description}
Target Users: {', '.join(project.target_users) if project.target_users else 'Not specified'}
Market: {project.market or 'Not specified'}
Constraints: {', '.join(project.constraints) if project.constraints else 'None'}

Return this JSON:
{{
  "domain": "<primary domain, e.g. 'food tech', 'healthtech', 'edtech', 'fintech', 'logistics'>",
  "problem_statement": "<1 sentence: what core problem is being solved>",
  "solution_hint": "<1 sentence: the proposed technical approach>",
  "key_concepts": ["<concept1>", "<concept2>", "<concept3>", "<concept4>"]
}}"""

        class _NormResult:
            def __init__(self):
                self.domain = ""
                self.problem_statement = ""
                self.solution_hint = ""
                self.key_concepts = []

        # Try LLM-based normalization; fallback to simple extraction
        try:
            from llm.gemini import call_gemini
            import json as _json

            _, raw = call_gemini(prompt, output_model=None, temperature=0.2)
            if raw:
                from llm.gemini import _extract_json
                json_str = _extract_json(raw)
                data = _json.loads(json_str)
                norm = NormalizedProject(
                    title=project.title,
                    description=project.description,
                    target_users=project.target_users,
                    market=project.market or "Global",
                    constraints=project.constraints,
                    domain=data.get("domain", ""),
                    problem_statement=data.get("problem_statement", project.description[:100]),
                    solution_hint=data.get("solution_hint", ""),
                    key_concepts=data.get("key_concepts", []),
                )
                return {
                    "normalized_project": norm,
                    "current_stage": "normalized",
                }
        except Exception as e:
            logger.warning(f"LLM normalization failed, using fallback: {e}")

    except Exception as e:
        logger.warning(f"normalize_project outer error: {e}")
        warnings.append(f"Normalization used fallback: {e}")

    # Fallback: simple keyword extraction
    desc_lower = project.description.lower()
    domain = "technology"
    for kw, d in [("food", "food tech"), ("health", "healthtech"), ("educ", "edtech"),
                   ("finance", "fintech"), ("logistic", "logistics"), ("transport", "transportation"),
                   ("retail", "retail tech"), ("agri", "agritech"), ("energy", "cleantech")]:
        if kw in desc_lower:
            domain = d
            break

    words = [w for w in project.description.split() if len(w) > 5][:6]
    norm = NormalizedProject(
        title=project.title,
        description=project.description,
        target_users=project.target_users,
        market=project.market or "Global",
        constraints=project.constraints,
        domain=domain,
        problem_statement=project.description[:150],
        solution_hint="",
        key_concepts=words,
    )
    return {
        "normalized_project": norm,
        "warnings": warnings,
        "current_stage": "normalized",
    }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 3: generate_queries
# ─────────────────────────────────────────────────────────────────────────────

def generate_queries(state: ProjectState) -> dict:
    """Generate focused search queries for all external APIs."""
    logger.info("[Node] generate_queries")
    norm = state["normalized_project"]

    title = norm.title.lower()
    domain = norm.domain or "AI technology"
    concepts = " ".join(norm.key_concepts[:3])
    market = norm.market

    # GitHub: 2-4 focused technical queries
    github_queries = [
        f"{title} AI",
        f"{domain} {concepts}",
        f"{norm.problem_statement[:60]}",
    ]
    if market and market.lower() not in ("global", "not specified"):
        github_queries.append(f"{domain} {market}")

    # Web: competitors, products, market
    web_queries = [
        f"{title} competitors market analysis",
        f"best {domain} solutions {market or ''}".strip(),
        f"{title} startup product",
    ]

    # Semantic (Tavily): trends and landscape
    semantic_queries = [
        f"{domain} market trends innovation {market or ''}".strip(),
        f"{title} use case technology landscape",
    ]

    # Papers (OpenAlex): academic research
    paper_queries = [
        f"{concepts} machine learning",
        f"{domain} AI research",
    ]

    # Patents: prior-art signals
    patent_queries = [
        f"{title}",
        f"{domain} {concepts} system method",
    ]

    queries = SearchQueries(
        github_queries=[q.strip() for q in github_queries if q.strip()][:4],
        web_queries=[q.strip() for q in web_queries if q.strip()][:4],
        semantic_queries=[q.strip() for q in semantic_queries if q.strip()][:3],
        paper_queries=[q.strip() for q in paper_queries if q.strip()][:3],
        patent_queries=[q.strip() for q in patent_queries if q.strip()][:2],
    )

    logger.info(f"Generated queries: {len(queries.github_queries)} GitHub, "
                f"{len(queries.web_queries)} web, {len(queries.paper_queries)} papers")
    return {
        "search_queries": queries,
        "current_stage": "queries_generated",
    }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 4: collect_evidence (async concurrent)
# ─────────────────────────────────────────────────────────────────────────────

def collect_evidence(state: ProjectState) -> dict:
    """
    Collect evidence from all external APIs concurrently.
    
    Tools used:
    - GitHub (github.py)
    - SerpAPI for web + patents (serpapi.py)
    - Tavily for semantic web (tavily.py)
    - OpenAlex for papers (openalex.py)
    
    Firecrawl is NOT called here — it's applied selectively during process_evidence.
    """
    logger.info("[Node] collect_evidence")
    queries = state["search_queries"]
    warnings = list(state.get("warnings", []))

    async def _collect_all():
        from tools.github import fetch_github_evidence
        from tools.serpapi import fetch_web_evidence, fetch_patent_evidence
        from tools.tavily import fetch_semantic_evidence
        from tools.openalex import fetch_paper_evidence

        results = await asyncio.gather(
            fetch_github_evidence(queries.github_queries),
            fetch_web_evidence(queries.web_queries),
            fetch_semantic_evidence(queries.semantic_queries),
            fetch_paper_evidence(queries.paper_queries),
            fetch_patent_evidence(queries.patent_queries),
            return_exceptions=True,
        )
        return results

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(_collect_all())
        loop.close()
    except Exception as e:
        logger.error(f"collect_evidence event loop error: {e}")
        warnings.append(f"Evidence collection failed: {e}")
        return {
            "github_results": [],
            "web_results": [],
            "paper_results": [],
            "patent_results": [],
            "warnings": warnings,
            "current_stage": "evidence_collected",
        }

    github_results, web_results, semantic_results, paper_results, patent_results = results

    # Handle exceptions from individual tools
    def _safe(r, name: str, default: list) -> list:
        if isinstance(r, Exception):
            warnings.append(f"{name} collection failed: {str(r)[:100]}")
            return default
        return r or default

    github_results = _safe(github_results, "GitHub", [])
    web_serp = _safe(web_results, "SerpAPI web", [])
    web_tavily = _safe(semantic_results, "Tavily", [])
    paper_results = _safe(paper_results, "OpenAlex", [])
    patent_results = _safe(patent_results, "SerpAPI patents", [])

    # Merge web results (SerpAPI + Tavily), deduplicate by URL
    seen_urls: set[str] = set()
    merged_web: list[WebEvidence] = []
    for item in web_serp + web_tavily:
        if item.url not in seen_urls:
            seen_urls.add(item.url)
            merged_web.append(item)

    logger.info(
        f"Evidence collected: {len(github_results)} GitHub, {len(merged_web)} web, "
        f"{len(paper_results)} papers, {len(patent_results)} patents"
    )

    return {
        "github_results": github_results,
        "web_results": merged_web,
        "paper_results": paper_results,
        "patent_results": patent_results,
        "warnings": warnings,
        "current_stage": "evidence_collected",
    }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 5: process_evidence
# ─────────────────────────────────────────────────────────────────────────────

def process_evidence(state: ProjectState) -> dict:
    """
    Process raw evidence:
    - Deduplicate
    - Rank by relevance
    - Truncate long descriptions
    - Apply selective Firecrawl on 1-2 high-value URLs
    - Build compact EvidenceBundle
    """
    logger.info("[Node] process_evidence")
    norm = state["normalized_project"]
    warnings = list(state.get("warnings", []))

    github_raw = state.get("github_results", [])
    web_raw = state.get("web_results", [])
    paper_raw = state.get("paper_results", [])
    patent_raw = state.get("patent_results", [])

    total_raw = len(github_raw) + len(web_raw) + len(paper_raw) + len(patent_raw)

    # Re-score relevance based on keyword overlap with project
    keywords = set((norm.title + " " + norm.description + " " + " ".join(norm.key_concepts)).lower().split())
    keywords = {w for w in keywords if len(w) > 4}

    def _relevance_boost(text: str, base: float) -> float:
        words = set(text.lower().split())
        overlap = len(keywords & words) / max(len(keywords), 1)
        return round(min(base + overlap * 0.4, 1.0), 2)

    for g in github_raw:
        g.relevance = _relevance_boost(g.description + " " + (g.readme_snippet or ""), g.relevance)
    for w in web_raw:
        w.relevance = _relevance_boost(w.snippet, w.relevance)
    for p in paper_raw:
        p.relevance = _relevance_boost((p.abstract or p.description), p.relevance)
    for pt in patent_raw:
        pt.relevance = _relevance_boost(pt.snippet, pt.relevance)

    # Sort and truncate
    github_top = sorted(github_raw, key=lambda x: x.relevance, reverse=True)[:8]
    web_top = sorted(web_raw, key=lambda x: x.relevance, reverse=True)[:8]
    paper_top = sorted(paper_raw, key=lambda x: x.relevance, reverse=True)[:6]
    patent_top = sorted(patent_raw, key=lambda x: x.relevance, reverse=True)[:5]

    # Selective Firecrawl: apply only to 1-2 high-value web URLs
    firecrawl_count = 0
    try:
        from tools.firecrawl import extract_page_content, should_use_firecrawl

        high_value_urls = [
            w for w in web_top[:4]
            if should_use_firecrawl(w.url) and w.deep_content is None
        ][:2]  # max 2 Firecrawl calls

        if high_value_urls:
            async def _crawl_selected():
                tasks = [extract_page_content(w.url) for w in high_value_urls]
                return await asyncio.gather(*tasks, return_exceptions=True)

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            crawl_results = loop.run_until_complete(_crawl_selected())
            loop.close()

            for idx, w in enumerate(high_value_urls):
                result = crawl_results[idx]
                if result and not isinstance(result, Exception):
                    w.deep_content = str(result)[:800]
                    firecrawl_count += 1
    except Exception as e:
        logger.warning(f"Firecrawl processing failed: {e}")

    after_count = len(github_top) + len(web_top) + len(paper_top) + len(patent_top)

    bundle = EvidenceBundle(
        github=github_top,
        web=web_top,
        papers=paper_top,
        patents=patent_top,
        total_raw_count=total_raw,
        after_dedup_count=after_count,
        github_query_count=len(state.get("search_queries").github_queries),
        web_query_count=len(state.get("search_queries").web_queries),
        paper_query_count=len(state.get("search_queries").paper_queries),
        patent_query_count=len(state.get("search_queries").patent_queries),
        firecrawl_pages_extracted=firecrawl_count,
        github_available=len(github_top) > 0,
        web_available=len(web_top) > 0,
        papers_available=len(paper_top) > 0,
        patents_available=len(patent_top) > 0,
    )

    if total_raw == 0:
        warnings.append("No external evidence collected — analysis relies on LLM knowledge only")
    elif after_count < 5:
        warnings.append("Very limited evidence found — confidence will be lower")

    logger.info(f"Evidence processed: {after_count} items, {firecrawl_count} Firecrawl extractions")
    return {
        "processed_evidence": bundle,
        "warnings": warnings,
        "current_stage": "evidence_processed",
    }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 6: evidence_synthesis (LLM CALL #1)
# Research Agent + Prior-Art Agent + Competition Agent
# ─────────────────────────────────────────────────────────────────────────────

def evidence_synthesis(state: ProjectState) -> dict:
    """
    LLM Call #1: Synthesizes evidence through 3 agent perspectives in one call.
    
    Serves: Research Agent + Prior-Art Agent + Competition Agent
    
    Uses a combined prompt to generate all three analyses in a single
    structured JSON response, saving API quota.
    """
    logger.info("[Node] evidence_synthesis (LLM Call #1)")
    norm = state["normalized_project"]
    evidence = state["processed_evidence"]
    warnings = list(state.get("warnings", []))

    from agents.research_agent import build_research_prompt, RESEARCH_SYSTEM
    from agents.prior_art_agent import build_prior_art_prompt, PRIOR_ART_SYSTEM
    from agents.competition_agent import build_competition_prompt, COMPETITION_SYSTEM

    target_users = ", ".join(norm.target_users) if norm.target_users else "Not specified"
    constraints = ", ".join(norm.constraints) if norm.constraints else "None"
    evidence_text = evidence.to_compact_text()

    combined_prompt = f"""You are an AI analysis harness running three specialized agents simultaneously.
Each agent analyzes the same evidence from its unique perspective.
Return a single JSON object containing all three agent analyses.

## Project
**Title:** {norm.title}
**Description:** {norm.description}
**Target Users:** {target_users}
**Market:** {norm.market}
**Constraints:** {constraints}
**Domain:** {norm.domain}
**Key Concepts:** {", ".join(norm.key_concepts)}

## Collected Evidence
{evidence_text if evidence_text.strip() else "No external evidence available — base analysis on domain knowledge."}

---

Return this exact JSON structure (all three agents):

{{
  "research": {{
    "score": <0-100, domain maturity/research coverage>,
    "confidence": <0-100>,
    "summary": "<2-3 sentence research landscape overview>",
    "existing_solutions": [
      {{"name": "<name>", "description": "<what it does and gap>", "url": "<url or empty>", "gap": "<gap vs this idea>"}}
    ],
    "market_landscape": "<market dynamics, TAM, growth>",
    "market_size_estimate": "<e.g. '$4.5B by 2028'>",
    "technology_trends": ["<trend1>", "<trend2>", "<trend3>"],
    "challenges": ["<challenge1>", "<challenge2>", "<challenge3>"],
    "github_highlights": ["<finding1>", "<finding2>"],
    "reasoning": "<how evidence was weighed>"
  }},
  "prior_art": {{
    "score": <0-100, prior art density>,
    "confidence": <0-100>,
    "summary": "<2-3 sentence prior art overview>",
    "paper_highlights": [
      {{"title": "<title>", "authors": ["<a1>"], "year": <year or null>, "key_finding": "<finding>", "url": "<url>", "relevance": "<why relevant>"}}
    ],
    "patent_signals": [
      {{"title": "<title>", "patent_number": "<number or null>", "assignee": "<company or null>", "relevance": "<overlap>", "url": "<url>", "disclaimer": "Prior-art signal only — not a legal opinion."}}
    ],
    "research_gaps": ["<gap1>", "<gap2>"],
    "novelty_assessment": "<where might be novel vs. well-covered>",
    "evidence_strength": "<HIGH|MEDIUM|LOW|INSUFFICIENT>",
    "reasoning": "<reasoning>"
  }},
  "competition": {{
    "score": <0-100, differentiation potential>,
    "confidence": <0-100>,
    "summary": "<2-3 sentence competitive overview>",
    "competitors": [
      {{"name": "<name>", "description": "<what they do>", "similarity": <0-100>, "strengths": ["<s1>"], "weaknesses": ["<w1>"], "url": "<url>"}}
    ],
    "saturation_level": "<LOW|MEDIUM|HIGH|VERY_HIGH>",
    "differentiation_opportunities": ["<opp1>", "<opp2>", "<opp3>"],
    "market_entry_barriers": ["<barrier1>", "<barrier2>"],
    "competitive_moat_suggestions": ["<moat1>", "<moat2>"],
    "reasoning": "<reasoning>"
  }}
}}

Critical rules:
- Base existing_solutions and competitors on evidence OR genuinely well-known products in this domain
- Do NOT invent URLs; use actual URLs from evidence or empty strings
- patent_signals: only if actual patents found in evidence; empty array otherwise
- Return ONLY the JSON object, no markdown, no prose
"""

    try:
        from llm.router import call_llm
        import json as _json
        from llm.gemini import _extract_json, call_gemini

        _, raw = call_gemini(combined_prompt, output_model=None, temperature=0.3, max_retries=1)

        if not raw:
            # Try Groq fallback
            from llm.groq import call_groq
            _, raw = call_groq(combined_prompt, output_model=None, temperature=0.3)

        if not raw:
            raise RuntimeError("Both LLMs failed for evidence synthesis")

        json_str = _extract_json(raw)
        data = _json.loads(json_str)

        # Parse into typed models
        r_data = data.get("research", {})
        p_data = data.get("prior_art", {})
        c_data = data.get("competition", {})

        research = ResearchAnalysis(
            score=int(r_data.get("score", 50)),
            confidence=int(r_data.get("confidence", 50)),
            summary=r_data.get("summary", ""),
            existing_solutions=[
                ExistingSolution(**s) for s in r_data.get("existing_solutions", [])[:5]
                if isinstance(s, dict)
            ],
            market_landscape=r_data.get("market_landscape", ""),
            market_size_estimate=r_data.get("market_size_estimate", ""),
            technology_trends=r_data.get("technology_trends", [])[:5],
            challenges=r_data.get("challenges", [])[:5],
            github_highlights=r_data.get("github_highlights", [])[:3],
            reasoning=r_data.get("reasoning", ""),
        )

        prior_art = PriorArtAnalysis(
            score=int(p_data.get("score", 50)),
            confidence=int(p_data.get("confidence", 50)),
            summary=p_data.get("summary", ""),
            paper_highlights=[
                PaperHighlight(**p) for p in p_data.get("paper_highlights", [])[:5]
                if isinstance(p, dict)
            ],
            patent_signals=[
                PatentSignal(**pt) for pt in p_data.get("patent_signals", [])[:4]
                if isinstance(pt, dict)
            ],
            research_gaps=p_data.get("research_gaps", [])[:4],
            novelty_assessment=p_data.get("novelty_assessment", ""),
            evidence_strength=p_data.get("evidence_strength", "MEDIUM"),
            reasoning=p_data.get("reasoning", ""),
        )

        competition = CompetitionAnalysis(
            score=int(c_data.get("score", 50)),
            confidence=int(c_data.get("confidence", 50)),
            summary=c_data.get("summary", ""),
            competitors=[
                Competitor(**c) for c in c_data.get("competitors", [])[:5]
                if isinstance(c, dict)
            ],
            saturation_level=c_data.get("saturation_level", "MEDIUM"),
            differentiation_opportunities=c_data.get("differentiation_opportunities", [])[:5],
            market_entry_barriers=c_data.get("market_entry_barriers", [])[:4],
            competitive_moat_suggestions=c_data.get("competitive_moat_suggestions", [])[:3],
            reasoning=c_data.get("reasoning", ""),
        )

        return {
            "research_analysis": research,
            "prior_art_analysis": prior_art,
            "competition_analysis": competition,
            "current_stage": "synthesis_complete",
            "warnings": warnings,
        }

    except Exception as e:
        logger.error(f"evidence_synthesis failed: {e}", exc_info=True)
        warnings.append(f"Evidence synthesis (Call #1) failed: {str(e)[:100]}")

        # Return minimal fallback analyses
        fallback_research = ResearchAnalysis(
            score=50, confidence=20,
            summary="Evidence synthesis failed — using minimal analysis.",
            reasoning=str(e)[:100],
        )
        fallback_prior_art = PriorArtAnalysis(
            score=50, confidence=20,
            summary="Prior art analysis unavailable.",
            evidence_strength="INSUFFICIENT",
        )
        fallback_competition = CompetitionAnalysis(
            score=50, confidence=20,
            summary="Competition analysis unavailable.",
            saturation_level="MEDIUM",
        )
        return {
            "research_analysis": fallback_research,
            "prior_art_analysis": fallback_prior_art,
            "competition_analysis": fallback_competition,
            "warnings": warnings,
            "current_stage": "synthesis_partial",
        }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 7: solution_innovation (LLM CALL #2)
# Solution/Innovation Agent
# ─────────────────────────────────────────────────────────────────────────────

def solution_innovation(state: ProjectState) -> dict:
    """LLM Call #2: Solution/Innovation Agent."""
    logger.info("[Node] solution_innovation (LLM Call #2)")
    norm = state["normalized_project"]
    evidence = state["processed_evidence"]
    research = state["research_analysis"]
    prior_art = state["prior_art_analysis"]
    competition = state["competition_analysis"]
    warnings = list(state.get("warnings", []))

    from agents.solution_agent import build_solution_prompt
    from llm.router import call_llm

    prompt = build_solution_prompt(norm, evidence, research, prior_art, competition)

    try:
        import json as _json
        from llm.gemini import call_gemini, _extract_json
        from llm.groq import call_groq

        _, raw = call_gemini(prompt, output_model=None, temperature=0.4, max_retries=1)
        if not raw:
            _, raw = call_groq(prompt, output_model=None, temperature=0.4)
        if not raw:
            raise RuntimeError("Both LLMs failed for solution agent")

        json_str = _extract_json(raw)
        data = _json.loads(json_str)

        solution = SolutionAnalysis(
            score=int(data.get("score", 60)),
            confidence=int(data.get("confidence", 60)),
            summary=data.get("summary", ""),
            innovation_gaps=data.get("innovation_gaps", [])[:5],
            market_gaps=data.get("market_gaps", [])[:4],
            differentiation_strategy=data.get("differentiation_strategy", ""),
            mvp_features=[
                MVPFeature(**f) for f in data.get("mvp_features", [])[:6]
                if isinstance(f, dict) and "name" in f and "description" in f and "priority" in f
            ],
            tech_approach=[
                TechApproach(**t) for t in data.get("tech_approach", [])[:5]
                if isinstance(t, dict)
            ],
            recommended_tech_stack=data.get("recommended_tech_stack", {}),
            architecture_mermaid=data.get("architecture_mermaid", ""),
            roadmap=data.get("roadmap", [])[:4],
            innovation_opportunities=data.get("innovation_opportunities", [])[:4],
            reasoning=data.get("reasoning", ""),
        )

        return {
            "solution_analysis": solution,
            "current_stage": "solution_complete",
            "warnings": warnings,
        }

    except Exception as e:
        logger.error(f"solution_innovation failed: {e}", exc_info=True)
        warnings.append(f"Solution analysis (Call #2) failed: {str(e)[:100]}")

        fallback = SolutionAnalysis(
            score=50, confidence=20,
            summary="Solution analysis unavailable due to LLM failure.",
            reasoning=str(e)[:100],
        )
        return {
            "solution_analysis": fallback,
            "warnings": warnings,
            "current_stage": "solution_partial",
        }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 8: critic_review (LLM CALL #3)
# Critic Agent
# ─────────────────────────────────────────────────────────────────────────────

def critic_review(state: ProjectState) -> dict:
    """LLM Call #3: Critic Agent — adversarial review."""
    logger.info("[Node] critic_review (LLM Call #3)")
    norm = state["normalized_project"]
    evidence = state["processed_evidence"]
    research = state["research_analysis"]
    prior_art = state["prior_art_analysis"]
    competition = state["competition_analysis"]
    solution = state["solution_analysis"]
    warnings = list(state.get("warnings", []))

    from agents.critic_agent import build_critic_prompt

    prompt = build_critic_prompt(norm, evidence, research, prior_art, competition, solution)

    try:
        import json as _json
        from llm.gemini import call_gemini, _extract_json
        from llm.groq import call_groq

        _, raw = call_gemini(prompt, output_model=None, temperature=0.5, max_retries=1)
        if not raw:
            _, raw = call_groq(prompt, output_model=None, temperature=0.5)
        if not raw:
            raise RuntimeError("Both LLMs failed for critic agent")

        json_str = _extract_json(raw)
        data = _json.loads(json_str)

        # Parse risks
        risks = []
        for r in data.get("risks", [])[:6]:
            if isinstance(r, dict):
                try:
                    risks.append(RiskItem(
                        category=r.get("category", "general"),
                        risk=r.get("risk", ""),
                        severity=r.get("severity", "MEDIUM"),
                        mitigation=r.get("mitigation", ""),
                    ))
                except Exception:
                    pass

        critic = CriticAnalysis(
            score=int(data.get("score", 50)),
            confidence=int(data.get("confidence", 50)),
            summary=data.get("summary", ""),
            recommendation=data.get("recommendation", "REWORK"),
            verdict_reason=data.get("verdict_reason", ""),
            weak_assumptions=data.get("weak_assumptions", [])[:5],
            risks=risks,
            contradictions_found=data.get("contradictions_found", [])[:4],
            missing_evidence=data.get("missing_evidence", [])[:4],
            strongest_counter_argument=data.get("strongest_counter_argument", ""),
            agreement_with_solution=bool(data.get("agreement_with_solution", True)),
            reasoning=data.get("reasoning", ""),
        )

        return {
            "critic_analysis": critic,
            "current_stage": "critic_complete",
            "warnings": warnings,
        }

    except Exception as e:
        logger.error(f"critic_review failed: {e}", exc_info=True)
        warnings.append(f"Critic analysis (Call #3) failed: {str(e)[:100]}")

        fallback = CriticAnalysis(
            score=50, confidence=20,
            summary="Critic analysis unavailable due to LLM failure.",
            recommendation="REWORK",
            verdict_reason="Analysis could not be completed.",
        )
        return {
            "critic_analysis": fallback,
            "warnings": warnings,
            "current_stage": "critic_partial",
        }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 9: final_consensus (LLM CALL #4)
# Final Report generation
# ─────────────────────────────────────────────────────────────────────────────

def final_consensus(state: ProjectState) -> dict:
    """LLM Call #4: Final consensus and complete report generation."""
    logger.info("[Node] final_consensus (LLM Call #4)")
    project = state["project"]
    norm = state["normalized_project"]
    evidence = state["processed_evidence"]
    research = state["research_analysis"]
    prior_art = state["prior_art_analysis"]
    competition = state["competition_analysis"]
    solution = state["solution_analysis"]
    critic = state["critic_analysis"]
    warnings = list(state.get("warnings", []))

    target_users = ", ".join(norm.target_users) if norm.target_users else "Not specified"

    prompt = f"""You are the Final Consensus Agent. You have read all five agent analyses.
Your job is to synthesize everything into a final balanced decision and report.
Do NOT blindly accept any single agent's view — weigh them against each other.

## Project
Title: {norm.title}
Description: {norm.description}
Target Users: {target_users}
Market: {norm.market}
Constraints: {", ".join(norm.constraints) if norm.constraints else "None"}

## Agent Summaries
Research Agent (Score: {research.score}/100): {research.summary}
Prior-Art Agent (Score: {prior_art.score}/100, Evidence: {prior_art.evidence_strength}): {prior_art.summary}
Competition Agent (Score: {competition.score}/100, Saturation: {competition.saturation_level}): {competition.summary}
Solution Agent (Score: {solution.score}/100): {solution.summary}
Critic Agent (Score: {critic.score}/100, Recommends: {critic.recommendation}): {critic.summary}
Critic's strongest counter-argument: {critic.strongest_counter_argument}

## Your Task
Generate the final consolidated decision. Return this JSON:

{{
  "recommendation": "<BUILD|PIVOT|REWORK|FLAG — must be justified>",
  "overall_score": <integer 0-100, weighted consensus>,
  "confidence": <integer 0-100>,
  "executive_summary": "<3-4 sentence balanced final summary>",
  "short_verdict": "<1 bold sentence: the bottom line>",
  "biggest_opportunity": "<the single most compelling opportunity>",
  "biggest_risk": "<the single most critical risk>",
  "key_findings": ["<finding1>", "<finding2>", "<finding3>", "<finding4>"],
  "scorecard": {{
    "opportunity": <0-100>,
    "technical_feasibility": <0-100>,
    "competition": <0-100>,
    "prior_art": <0-100>,
    "differentiation": <0-100>,
    "evidence_confidence": <0-100>
  }},
  "agent_scores": {{
    "research": {research.score},
    "prior_art": {prior_art.score},
    "competition": {competition.score},
    "solution": {solution.score},
    "critic": {critic.score}
  }},
  "key_risks": ["<risk1>", "<risk2>", "<risk3>"],
  "key_opportunities": ["<opp1>", "<opp2>", "<opp3>"]
}}

Scoring guide:
- overall_score: weighted average (research 20%, prior_art 15%, competition 20%, solution 25%, critic 20%)
- scorecard.competition: invert saturation (LOW saturation = high score)
- Recommendation must align with overall_score:
  - 70-100: BUILD (if critic agrees) 
  - 50-69: PIVOT (meaningful issues exist)
  - 30-49: REWORK (significant problems)
  - <30 or FLAG from critic: FLAG

Return ONLY the JSON object.
"""

    try:
        import json as _json
        from llm.gemini import call_gemini, _extract_json
        from llm.groq import call_groq

        _, raw = call_gemini(prompt, output_model=None, temperature=0.3, max_retries=1)
        if not raw:
            _, raw = call_groq(prompt, output_model=None, temperature=0.3)
        if not raw:
            raise RuntimeError("Both LLMs failed for final consensus")

        json_str = _extract_json(raw)
        data = _json.loads(json_str)

        sc = data.get("scorecard", {})
        scorecard = Scorecard(
            opportunity=int(sc.get("opportunity", 50)),
            technical_feasibility=int(sc.get("technical_feasibility", 50)),
            competition=int(sc.get("competition", 50)),
            prior_art=int(sc.get("prior_art", 50)),
            differentiation=int(sc.get("differentiation", 50)),
            evidence_confidence=int(sc.get("evidence_confidence", 50)),
        )

        ag = data.get("agent_scores", {})
        agent_scores = AgentScores(
            research=int(ag.get("research", research.score)),
            prior_art=int(ag.get("prior_art", prior_art.score)),
            competition=int(ag.get("competition", competition.score)),
            solution=int(ag.get("solution", solution.score)),
            critic=int(ag.get("critic", critic.score)),
        )

        decision = Decision(
            recommendation=data.get("recommendation", critic.recommendation),
            overall_score=int(data.get("overall_score", 50)),
            confidence=int(data.get("confidence", 50)),
            executive_summary=data.get("executive_summary", ""),
            key_findings=data.get("key_findings", [])[:6],
            biggest_opportunity=data.get("biggest_opportunity", ""),
            biggest_risk=data.get("biggest_risk", ""),
            short_verdict=data.get("short_verdict", ""),
        )

        evidence_summary = EvidenceSummary(
            github_count=len(evidence.github),
            paper_count=len(evidence.papers),
            patent_count=len(evidence.patents),
            web_count=len(evidence.web),
            firecrawl_pages=evidence.firecrawl_pages_extracted,
            evidence_strength=prior_art.evidence_strength,
            notable_sources=[g.url for g in evidence.github[:3]] + [p.url for p in evidence.papers[:2]],
        )

        report = FinalReport(
            project_title=norm.title,
            project_description=norm.description,
            target_users=norm.target_users,
            market=norm.market,
            constraints=norm.constraints,
            decision=decision,
            scorecard=scorecard,
            agent_scores=agent_scores,
            # Research
            research_summary=research.summary,
            research_existing_solutions=[s.model_dump() for s in research.existing_solutions],
            research_market_landscape=research.market_landscape,
            research_trends=research.technology_trends,
            research_reasoning=research.reasoning,
            # Prior Art
            prior_art_summary=prior_art.summary,
            prior_art_papers=[p.model_dump() for p in prior_art.paper_highlights],
            prior_art_patents=[pt.model_dump() for pt in prior_art.patent_signals],
            prior_art_gaps=prior_art.research_gaps,
            prior_art_reasoning=prior_art.reasoning,
            # Competition
            competition_summary=competition.summary,
            competitors=[c.model_dump() for c in competition.competitors],
            competition_saturation=competition.saturation_level,
            differentiation_opportunities=competition.differentiation_opportunities,
            competition_reasoning=competition.reasoning,
            # Solution
            solution_summary=solution.summary,
            mvp_features=[f.model_dump() for f in solution.mvp_features],
            innovation_opportunities=solution.innovation_opportunities,
            solution_reasoning=solution.reasoning,
            # Critic
            critic_summary=critic.summary,
            critic_risks=[r.model_dump() for r in critic.risks],
            critic_weak_assumptions=critic.weak_assumptions,
            critic_recommendation=critic.recommendation,
            critic_reasoning=critic.reasoning,
            # Full report
            architecture_mermaid=solution.architecture_mermaid,
            tech_stack=solution.recommended_tech_stack,
            roadmap=solution.roadmap,
            key_risks=data.get("key_risks", []),
            key_opportunities=data.get("key_opportunities", []),
            evidence_summary=evidence_summary,
            github_repos=[g.model_dump() for g in evidence.github],
            research_papers=[p.model_dump() for p in evidence.papers],
            patent_signals=[pt.model_dump() for pt in evidence.patents],
            warnings=warnings,
            is_partial=len([w for w in warnings if "failed" in w.lower()]) > 0,
        )

        return {
            "final_report": report,
            "current_stage": "complete",
            "warnings": warnings,
        }

    except Exception as e:
        logger.error(f"final_consensus failed: {e}", exc_info=True)
        warnings.append(f"Final consensus (Call #4) failed: {str(e)[:100]}")
        
        fallback_decision = Decision(
            recommendation="FLAG",
            overall_score=0,
            confidence=0,
            executive_summary="Report generation failed due to an error processing the model's output.",
            key_findings=["Error generating final report"],
            biggest_opportunity="",
            biggest_risk="Report generation failed",
            short_verdict="Error during generation",
        )
        fallback_scorecard = Scorecard(
            opportunity=0, technical_feasibility=0, competition=0, prior_art=0, differentiation=0, evidence_confidence=0
        )
        fallback_agent_scores = AgentScores(
            research=research.score, prior_art=prior_art.score, competition=competition.score, solution=solution.score, critic=critic.score
        )
        
        fallback_report = FinalReport(
            project_title=norm.title,
            project_description=norm.description,
            target_users=norm.target_users,
            market=norm.market,
            constraints=norm.constraints,
            decision=fallback_decision,
            scorecard=fallback_scorecard,
            agent_scores=fallback_agent_scores,
            warnings=warnings,
            is_partial=True,
        )
        
        return {
            "final_report": fallback_report,
            "warnings": warnings,
            "current_stage": "complete",
        }


# ─────────────────────────────────────────────────────────────────────────────
# NODE 10: validate_final_report
# ─────────────────────────────────────────────────────────────────────────────

def validate_final_report(state: ProjectState) -> dict:
    """Validate the final report has required fields."""
    logger.info("[Node] validate_final_report")
    report = state.get("final_report")
    if not report:
        return {
            "errors": ["Final report is empty — workflow did not complete successfully"],
            "current_stage": "validation_failed",
        }

    if not report.decision.recommendation:
        report.decision.recommendation = "REWORK"

    if report.decision.overall_score < 0 or report.decision.overall_score > 100:
        report.decision.overall_score = max(0, min(100, report.decision.overall_score))

    return {"current_stage": "validated_report"}


# ─────────────────────────────────────────────────────────────────────────────
# ROUTING FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def route_after_validation(state: ProjectState) -> str:
    """Route after input validation."""
    if state.get("is_clarification_needed"):
        return "clarification_needed"
    if state.get("errors"):
        return "error"
    return "normalize"


def route_after_report_validation(state: ProjectState) -> str:
    """Route after final report validation."""
    if state.get("errors") or not state.get("final_report"):
        return "error"
    return "persist"

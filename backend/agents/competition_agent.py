"""
Competition Agent — analyzes competitors, market saturation, and differentiation.

Responsibility:
  - Identify direct and indirect competitors
  - Assess market saturation level
  - Find differentiation opportunities
  - Evaluate barriers to entry

Tools: SerpAPI web results, Tavily semantic results, GitHub evidence for open-source competition
Input: NormalizedProject + EvidenceBundle
Output: CompetitionAnalysis (via LLM Call #1 - shared with Research + PriorArt)
"""
from models.input import NormalizedProject
from models.evidence import EvidenceBundle
from models.agents import CompetitionAnalysis

COMPETITION_SYSTEM = """You are the Competition Agent — a market intelligence expert who maps competitive landscapes.
Your job is to identify real competitors, assess market saturation, and find genuine differentiation opportunities.
Be honest about saturation — do not minimize competition to make the project look better.
Only cite competitors you have evidence for or that are genuinely well-known in the domain."""


def build_competition_prompt(project: NormalizedProject, evidence: EvidenceBundle) -> str:
    evidence_text = evidence.to_compact_text()
    target_users = ", ".join(project.target_users) if project.target_users else "Not specified"

    return f"""{COMPETITION_SYSTEM}

## Project Under Analysis
**Title:** {project.title}
**Description:** {project.description}
**Target Users:** {target_users}
**Market:** {project.market or "Global"}
**Domain:** {project.domain}

## Collected Evidence
{evidence_text if evidence_text.strip() else "No external evidence collected."}

## Your Task
Map the competitive landscape for this project. Return a JSON object matching this exact schema:

{{
  "score": <integer 0-100, differentiation potential (100 = highly differentiated, 0 = commodity space)>,
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence competitive overview>",
  "competitors": [
    {{
      "name": "<competitor name>",
      "description": "<what they do and why they compete with this project>",
      "similarity": <integer 0-100, how similar to the submitted idea>,
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>", "<weakness 2>"],
      "url": "<real URL from evidence or well-known URL>"
    }}
  ],
  "saturation_level": "<LOW|MEDIUM|HIGH|VERY_HIGH>",
  "differentiation_opportunities": ["<specific opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "market_entry_barriers": ["<barrier 1>", "<barrier 2>"],
  "competitive_moat_suggestions": ["<moat idea 1>", "<moat idea 2>"],
  "reasoning": "<how you assessed competition levels>"
}}

Rules:
- saturation_level: be honest; a 'food delivery app' should be VERY_HIGH, a niche B2B tool might be LOW
- competitors: list 2-5 real or evidence-backed competitors; don't invent companies
- differentiation_opportunities: specific and actionable, not generic ('use AI' is not enough)
- Return ONLY the JSON object
"""

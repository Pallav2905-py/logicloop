"""
Research Agent — analyzes existing implementations, technologies, and GitHub repos.

Responsibility:
  - Map the existing solution landscape
  - Identify market players and tech approaches
  - Highlight relevant GitHub activity
  - Assess market size and dynamics

Tools: GitHub (via evidence bundle), SerpAPI web results, Tavily semantic results
Input: NormalizedProject + EvidenceBundle
Output: ResearchAnalysis (via LLM Call #1 - shared with PriorArt + Competition)
"""
import json
from models.input import NormalizedProject
from models.evidence import EvidenceBundle
from models.agents import ResearchAnalysis

RESEARCH_SYSTEM = """You are the Research Agent — an expert at mapping the existing technical and market landscape.
Your job is to analyze what already exists for a given project idea based on provided evidence.
Be specific, cite evidence, and avoid generic statements.
Do NOT fabricate products, repos, or statistics not present in the evidence."""


def build_research_prompt(project: NormalizedProject, evidence: EvidenceBundle) -> str:
    evidence_text = evidence.to_compact_text()
    target_users = ", ".join(project.target_users) if project.target_users else "Not specified"
    constraints = ", ".join(project.constraints) if project.constraints else "None"

    return f"""{RESEARCH_SYSTEM}

## Project Under Analysis
**Title:** {project.title}
**Description:** {project.description}
**Target Users:** {target_users}
**Market:** {project.market or "Not specified"}
**Constraints:** {constraints}
**Domain:** {project.domain}
**Key Concepts:** {", ".join(project.key_concepts)}

## Collected Evidence
{evidence_text if evidence_text.strip() else "No external evidence collected (APIs may be unavailable)."}

## Your Task
Analyze the research landscape for this project. Return a JSON object matching this exact schema:

{{
  "score": <integer 0-100, how mature/researched is this domain>,
  "confidence": <integer 0-100, confidence in your assessment>,
  "summary": "<2-3 sentence research landscape overview>",
  "existing_solutions": [
    {{
      "name": "<product/tool name>",
      "description": "<what it does and where it falls short for THIS project>",
      "url": "<real URL from evidence or leave as empty string>",
      "gap": "<specific gap relative to the submitted idea>"
    }}
  ],
  "market_landscape": "<2-3 sentences on market dynamics, TAM estimate, growth>",
  "market_size_estimate": "<e.g. '$4.5B by 2028, 18% CAGR'>",
  "technology_trends": ["<trend 1>", "<trend 2>", "<trend 3>"],
  "challenges": ["<technical challenge>", "<operational challenge>", "<adoption challenge>"],
  "github_highlights": ["<notable open-source activity finding>", "<another finding>"],
  "reasoning": "<brief explanation of how you weighed the evidence>"
}}

Rules:
- existing_solutions must be based on evidence OR well-known products in this domain
- Score reflects how well-researched/mature the domain is (higher = more mature = more competition)
- github_highlights should reference actual repos from evidence if available
- Return ONLY the JSON object, no prose, no markdown fences
"""


def get_research_analysis_schema() -> dict:
    """Return the JSON schema for ResearchAnalysis for use in combined prompts."""
    return ResearchAnalysis.model_json_schema()

"""
Solution/Innovation Agent — identifies gaps and proposes a differentiated solution.

Responsibility:
  - Synthesize research gaps and market gaps
  - Propose a differentiated solution strategy
  - Define MVP feature set (MoSCoW prioritization)
  - Recommend technical approach and architecture
  - Define roadmap

Input: NormalizedProject + Call #1 outputs (Research + PriorArt + Competition analyses)
Output: SolutionAnalysis (LLM Call #2)
"""
from models.input import NormalizedProject
from models.evidence import EvidenceBundle
from models.agents import ResearchAnalysis, PriorArtAnalysis, CompetitionAnalysis, SolutionAnalysis

SOLUTION_SYSTEM = """You are the Solution/Innovation Agent — an expert at designing differentiated technical solutions.
Given evidence about the research landscape, prior art, and competitive landscape,
your job is to identify the best innovation angle and propose a concrete, differentiated solution.
Be specific and actionable. Define a real MVP. Propose a real architecture.
Do not be generic — tailor everything to this specific project and its constraints."""


def build_solution_prompt(
    project: NormalizedProject,
    evidence: EvidenceBundle,
    research: ResearchAnalysis,
    prior_art: PriorArtAnalysis,
    competition: CompetitionAnalysis,
) -> str:
    target_users = ", ".join(project.target_users) if project.target_users else "Not specified"
    constraints = ", ".join(project.constraints) if project.constraints else "None"

    return f"""{SOLUTION_SYSTEM}

## Project Under Analysis
**Title:** {project.title}
**Description:** {project.description}
**Target Users:** {target_users}
**Market:** {project.market or "Global"}
**Constraints:** {constraints}

## Research Agent Findings (Call #1)
- Score: {research.score}/100 | Confidence: {research.confidence}/100
- Summary: {research.summary}
- Market Landscape: {research.market_landscape}
- Key Challenges: {", ".join(research.challenges[:3])}
- Existing Solutions: {", ".join([s.name + " (" + s.gap + ")" for s in research.existing_solutions[:3]])}

## Prior Art Agent Findings (Call #1)
- Score: {prior_art.score}/100 | Evidence Strength: {prior_art.evidence_strength}
- Summary: {prior_art.summary}
- Research Gaps: {", ".join(prior_art.research_gaps[:3])}
- Novelty Assessment: {prior_art.novelty_assessment}

## Competition Agent Findings (Call #1)
- Score: {competition.score}/100 | Saturation: {competition.saturation_level}
- Summary: {competition.summary}
- Differentiation Opportunities: {", ".join(competition.differentiation_opportunities[:3])}
- Competitive Moats: {", ".join(competition.competitive_moat_suggestions[:2])}

## Strongest Evidence Context
{evidence.to_compact_text()[:3000]}

## Your Task
Synthesize all findings to propose the best differentiated solution. Return this JSON schema:

{{
  "score": <integer 0-100, solution quality and differentiation potential>,
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence solution overview>",
  "innovation_gaps": ["<research gap this solution addresses>", "<another gap>"],
  "market_gaps": ["<market gap>", "<another market gap>"],
  "differentiation_strategy": "<1-2 sentences on core differentiation angle>",
  "mvp_features": [
    {{
      "name": "<feature name>",
      "description": "<specific feature description>",
      "priority": "<MUST|SHOULD|COULD>"
    }}
  ],
  "tech_approach": [
    {{
      "component": "<e.g. AI/ML Engine>",
      "recommendation": "<specific tech recommendation>",
      "rationale": "<why this tech choice for this project>"
    }}
  ],
  "recommended_tech_stack": {{
    "frontend": ["<tech>"],
    "backend": ["<tech>"],
    "database": ["<tech>"],
    "ai_ml": ["<specific models or frameworks>"],
    "deployment": ["<tech>"]
  }},
  "architecture_mermaid": "graph TD\\n  A[User] --> B[...]\\n  ...",
  "roadmap": [
    {{
      "phase": "Phase 1 — MVP",
      "duration": "4 weeks",
      "tasks": ["<specific task>", "<specific task>"]
    }},
    {{
      "phase": "Phase 2 — Growth",
      "duration": "8 weeks",
      "tasks": ["<specific task>", "<specific task>"]
    }}
  ],
  "innovation_opportunities": ["<specific innovation opportunity>", "<another>"],
  "reasoning": "<how you synthesized the findings into this solution>"
}}

Rules:
- architecture_mermaid must be valid Mermaid.js graph TD syntax
- mvp_features: 4-6 features, prioritized properly (not everything is MUST)
- tech_approach: specific to this domain, not generic ('use PostgreSQL' needs a reason)
- roadmap: realistic timelines for a hackathon-style team
- Return ONLY the JSON object
"""

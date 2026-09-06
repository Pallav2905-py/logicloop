"""
Critic Agent — adversarial reviewer that challenges assumptions and surfaces risks.

Responsibility:
  - Actively try to disprove the project idea
  - Challenge weak assumptions made by previous agents
  - Surface technical, market, adoption, cost, data, and regulatory risks
  - Identify contradictions in the evidence
  - Recommend BUILD / PIVOT / REWORK / FLAG

Input: All previous agent outputs + original project + evidence
Output: CriticAnalysis (LLM Call #3)

IMPORTANT: The Critic is ALLOWED and EXPECTED to disagree with previous agents.
It must not be constrained to agree with the Solution Agent's optimism.
"""
from models.input import NormalizedProject
from models.evidence import EvidenceBundle
from models.agents import ResearchAnalysis, PriorArtAnalysis, CompetitionAnalysis, SolutionAnalysis, CriticAnalysis

CRITIC_SYSTEM = """You are the Critic Agent — a rigorous adversarial reviewer.
Your job is to CHALLENGE the proposed idea and solution. Be honest, be skeptical, be direct.
Do not be harsh for its own sake, but do not sugarcoat serious problems.
If previous agents were too optimistic, say so explicitly.
Your recommendation (BUILD/PIVOT/REWORK/FLAG) must be evidence-based, not arbitrary."""

RECOMMENDATION_GUIDE = """
Recommendation guide:
- BUILD: Evidence strongly supports the idea. Competition is manageable. Technical risks are low. Proceed.
- PIVOT: Core idea has merit but significant market or tech issues. Must change approach/target/scope.
- REWORK: Direction is wrong. Needs substantial redesign before any execution.
- FLAG: Serious unresolved issues (legal, ethical, data availability, market reality). Do not proceed without resolving.
"""


def build_critic_prompt(
    project: NormalizedProject,
    evidence: EvidenceBundle,
    research: ResearchAnalysis,
    prior_art: PriorArtAnalysis,
    competition: CompetitionAnalysis,
    solution: SolutionAnalysis,
) -> str:
    target_users = ", ".join(project.target_users) if project.target_users else "Not specified"
    constraints = ", ".join(project.constraints) if project.constraints else "None"

    return f"""{CRITIC_SYSTEM}

{RECOMMENDATION_GUIDE}

## Original Project
**Title:** {project.title}
**Description:** {project.description}
**Target Users:** {target_users}
**Market:** {project.market or "Global"}
**Constraints:** {constraints}

## Previous Agent Findings Summary

### Research Agent (Score: {research.score}/100)
{research.summary}
Challenges identified: {", ".join(research.challenges[:3])}

### Prior-Art Agent (Score: {prior_art.score}/100, Evidence: {prior_art.evidence_strength})
{prior_art.summary}
Novelty: {prior_art.novelty_assessment}

### Competition Agent (Score: {competition.score}/100, Saturation: {competition.saturation_level})
{competition.summary}
Top differentiation: {competition.differentiation_opportunities[0] if competition.differentiation_opportunities else "None identified"}

### Solution Agent (Score: {solution.score}/100)
{solution.summary}
Differentiation strategy: {solution.differentiation_strategy}
MVP features: {", ".join([f.name for f in solution.mvp_features[:3]])}

## Evidence Summary
GitHub repos found: {len(evidence.github)}
Web results: {len(evidence.web)}
Papers: {len(evidence.papers)}
Patent signals: {len(evidence.patents)}

## Your Task
Challenge everything. Return this JSON schema:

{{
  "score": <integer 0-100, viability score AFTER critique — can differ significantly from previous agents>,
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence critical assessment>",
  "recommendation": "<BUILD|PIVOT|REWORK|FLAG>",
  "verdict_reason": "<1-2 sentence direct explanation of why you chose this recommendation>",
  "weak_assumptions": [
    "<specific assumption made by previous agents that may not hold>",
    "<another assumption>",
    "<another assumption>"
  ],
  "risks": [
    {{
      "category": "<technical|market|adoption|data|cost|regulatory|competition>",
      "risk": "<specific risk>",
      "severity": "<LOW|MEDIUM|HIGH|CRITICAL>",
      "mitigation": "<concrete mitigation or 'No clear mitigation exists'>"
    }}
  ],
  "contradictions_found": [
    "<contradiction between evidence and agent claims, or within evidence itself>"
  ],
  "missing_evidence": [
    "<important question that evidence doesn't answer>"
  ],
  "strongest_counter_argument": "<the single most damaging argument against this idea>",
  "agreement_with_solution": <true if you broadly agree with Solution Agent, false if you disagree>,
  "reasoning": "<full critical reasoning — why each major risk is significant>"
}}

Rules:
- Do NOT default to BUILD unless evidence genuinely supports it
- risks: identify 3-6 specific, non-generic risks with severity levels
- Be honest: if competition_saturation is HIGH, that must influence recommendation
- Return ONLY the JSON object
"""

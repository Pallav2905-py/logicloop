"""Report models — final structured output of the full validation workflow."""
from typing import Optional
from pydantic import BaseModel, Field


class Scorecard(BaseModel):
    opportunity: int = Field(ge=0, le=100)
    technical_feasibility: int = Field(ge=0, le=100)
    competition: int = Field(ge=0, le=100)
    prior_art: int = Field(ge=0, le=100)
    differentiation: int = Field(ge=0, le=100)
    evidence_confidence: int = Field(ge=0, le=100)


class Decision(BaseModel):
    recommendation: str  # BUILD | PIVOT | REWORK | FLAG
    overall_score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    executive_summary: str
    key_findings: list[str] = Field(default_factory=list)
    biggest_opportunity: str = ""
    biggest_risk: str = ""
    short_verdict: str = ""


class AgentScores(BaseModel):
    research: int = Field(ge=0, le=100)
    prior_art: int = Field(ge=0, le=100)
    competition: int = Field(ge=0, le=100)
    solution: int = Field(ge=0, le=100)
    critic: int = Field(ge=0, le=100)


class EvidenceSummary(BaseModel):
    github_count: int = 0
    paper_count: int = 0
    patent_count: int = 0
    web_count: int = 0
    firecrawl_pages: int = 0
    evidence_strength: str = "MEDIUM"  # HIGH | MEDIUM | LOW | INSUFFICIENT
    notable_sources: list[str] = Field(default_factory=list)


class FinalReport(BaseModel):
    """The master report JSON returned to the frontend."""
    # Project metadata
    project_title: str
    project_description: str
    target_users: list[str] = Field(default_factory=list)
    market: str = ""
    constraints: list[str] = Field(default_factory=list)

    # Core decision
    decision: Decision
    scorecard: Scorecard
    agent_scores: AgentScores

    # Agent analysis (for ANALYSIS view)
    research_summary: str = ""
    research_existing_solutions: list[dict] = Field(default_factory=list)
    research_market_landscape: str = ""
    research_trends: list[str] = Field(default_factory=list)
    research_reasoning: str = ""

    prior_art_summary: str = ""
    prior_art_papers: list[dict] = Field(default_factory=list)
    prior_art_patents: list[dict] = Field(default_factory=list)
    prior_art_gaps: list[str] = Field(default_factory=list)
    prior_art_reasoning: str = ""

    competition_summary: str = ""
    competitors: list[dict] = Field(default_factory=list)
    competition_saturation: str = ""
    differentiation_opportunities: list[str] = Field(default_factory=list)
    competition_reasoning: str = ""

    solution_summary: str = ""
    mvp_features: list[dict] = Field(default_factory=list)
    innovation_opportunities: list[str] = Field(default_factory=list)
    solution_reasoning: str = ""

    critic_summary: str = ""
    critic_risks: list[dict] = Field(default_factory=list)
    critic_weak_assumptions: list[str] = Field(default_factory=list)
    critic_recommendation: str = ""
    critic_reasoning: str = ""

    # Full report extras (for FULL REPORT view)
    architecture_mermaid: str = ""
    tech_stack: dict[str, list[str]] = Field(default_factory=dict)
    roadmap: list[dict] = Field(default_factory=list)
    key_risks: list[str] = Field(default_factory=list)
    key_opportunities: list[str] = Field(default_factory=list)
    evidence_summary: EvidenceSummary = Field(default_factory=EvidenceSummary)

    # Raw evidence for FULL REPORT
    github_repos: list[dict] = Field(default_factory=list)
    research_papers: list[dict] = Field(default_factory=list)
    patent_signals: list[dict] = Field(default_factory=list)

    # Warnings/notes
    warnings: list[str] = Field(default_factory=list)
    is_partial: bool = False  # True if some evidence collection failed

"""Agent output models — typed structured outputs for all 5 logical agents."""
from typing import Optional
from pydantic import BaseModel, Field


# ── Research Agent Output ─────────────────────────────────────────────────────

class ExistingSolution(BaseModel):
    name: str
    description: str
    url: str
    gap: str  # where it falls short


class ResearchAnalysis(BaseModel):
    """Output of the Research Agent (part of LLM Call #1)."""
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    existing_solutions: list[ExistingSolution] = Field(default_factory=list)
    market_landscape: str = ""
    market_size_estimate: str = ""
    technology_trends: list[str] = Field(default_factory=list)
    challenges: list[str] = Field(default_factory=list)
    github_highlights: list[str] = Field(default_factory=list)
    reasoning: str = ""


# ── Prior-Art Agent Output ────────────────────────────────────────────────────

class PaperHighlight(BaseModel):
    title: str
    authors: list[str] = Field(default_factory=list)
    year: Optional[int] = None
    key_finding: str
    url: str
    relevance: str


class PatentSignal(BaseModel):
    title: str
    patent_number: Optional[str] = None
    assignee: Optional[str] = None
    relevance: str
    url: str
    disclaimer: str = "This is a prior-art signal only, not a legal opinion."


class PriorArtAnalysis(BaseModel):
    """Output of the Prior-Art Agent (part of LLM Call #1)."""
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    paper_highlights: list[PaperHighlight] = Field(default_factory=list)
    patent_signals: list[PatentSignal] = Field(default_factory=list)
    research_gaps: list[str] = Field(default_factory=list)
    novelty_assessment: str = ""
    evidence_strength: str = ""  # HIGH | MEDIUM | LOW | INSUFFICIENT
    reasoning: str = ""


# ── Competition Agent Output ──────────────────────────────────────────────────

class Competitor(BaseModel):
    name: str
    description: str
    similarity: int = Field(ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    url: str = ""


class CompetitionAnalysis(BaseModel):
    """Output of the Competition Agent (part of LLM Call #1)."""
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    competitors: list[Competitor] = Field(default_factory=list)
    saturation_level: str = ""  # LOW | MEDIUM | HIGH | VERY_HIGH
    differentiation_opportunities: list[str] = Field(default_factory=list)
    market_entry_barriers: list[str] = Field(default_factory=list)
    competitive_moat_suggestions: list[str] = Field(default_factory=list)
    reasoning: str = ""


# ── Solution/Innovation Agent Output ─────────────────────────────────────────

class MVPFeature(BaseModel):
    name: str
    description: str
    priority: str  # MUST | SHOULD | COULD


class TechApproach(BaseModel):
    component: str
    recommendation: str
    rationale: str


class SolutionAnalysis(BaseModel):
    """Output of the Solution/Innovation Agent (LLM Call #2)."""
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    innovation_gaps: list[str] = Field(default_factory=list)
    market_gaps: list[str] = Field(default_factory=list)
    differentiation_strategy: str = ""
    mvp_features: list[MVPFeature] = Field(default_factory=list)
    tech_approach: list[TechApproach] = Field(default_factory=list)
    recommended_tech_stack: dict[str, list[str]] = Field(default_factory=dict)
    architecture_mermaid: str = ""
    roadmap: list[dict] = Field(default_factory=list)  # [{phase, duration, tasks}]
    innovation_opportunities: list[str] = Field(default_factory=list)
    reasoning: str = ""


# ── Critic Agent Output ───────────────────────────────────────────────────────

class RiskItem(BaseModel):
    category: str  # technical | market | adoption | data | cost | regulatory
    risk: str
    severity: str  # LOW | MEDIUM | HIGH | CRITICAL
    mitigation: str


class CriticAnalysis(BaseModel):
    """Output of the Critic Agent (LLM Call #3)."""
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    recommendation: str  # BUILD | PIVOT | REWORK | FLAG
    verdict_reason: str
    weak_assumptions: list[str] = Field(default_factory=list)
    risks: list[RiskItem] = Field(default_factory=list)
    contradictions_found: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)
    strongest_counter_argument: str = ""
    agreement_with_solution: bool = True
    reasoning: str = ""

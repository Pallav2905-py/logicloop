"""
ProjectState — the single shared working memory for the LangGraph workflow.

All nodes/agents read from and write updates to this TypedDict.
MongoDB is NOT used as agent memory; this state IS the agent memory.
"""
from typing import Optional, Annotated
from typing_extensions import TypedDict
import operator

from models.input import ProjectInput, NormalizedProject, SearchQueries
from models.evidence import (
    GitHubEvidence, WebEvidence, PaperEvidence, PatentEvidence, EvidenceBundle
)
from models.agents import (
    ResearchAnalysis, PriorArtAnalysis, CompetitionAnalysis,
    SolutionAnalysis, CriticAnalysis
)
from models.report import FinalReport


def _merge_lists(a: list, b: list) -> list:
    """Reducer: extend list a with list b."""
    return a + b


def _keep_last(a, b):
    """Reducer: keep the latest value."""
    return b if b is not None else a


class ProjectState(TypedDict):
    # ── Input ─────────────────────────────────────────────────────────────────
    project: Optional[ProjectInput]
    normalized_project: Optional[NormalizedProject]
    search_queries: Optional[SearchQueries]

    # ── Raw evidence from tools ────────────────────────────────────────────────
    github_results: list[GitHubEvidence]
    web_results: list[WebEvidence]
    paper_results: list[PaperEvidence]
    patent_results: list[PatentEvidence]

    # ── Processed evidence ready for LLM ──────────────────────────────────────
    processed_evidence: Optional[EvidenceBundle]

    # ── Agent analyses (populated by LLM calls) ───────────────────────────────
    research_analysis: Optional[ResearchAnalysis]
    prior_art_analysis: Optional[PriorArtAnalysis]
    competition_analysis: Optional[CompetitionAnalysis]
    solution_analysis: Optional[SolutionAnalysis]
    critic_analysis: Optional[CriticAnalysis]

    # ── Final output ───────────────────────────────────────────────────────────
    final_report: Optional[FinalReport]

    # ── Workflow control ───────────────────────────────────────────────────────
    current_stage: str          # e.g. "collect_evidence", "synthesis", etc.
    warnings: list[str]
    errors: list[str]
    is_clarification_needed: bool
    clarification_message: str


def make_initial_state(project_input: ProjectInput) -> ProjectState:
    """Create a fresh state for a new analysis run."""
    return ProjectState(
        project=project_input,
        normalized_project=None,
        search_queries=None,
        github_results=[],
        web_results=[],
        paper_results=[],
        patent_results=[],
        processed_evidence=None,
        research_analysis=None,
        prior_art_analysis=None,
        competition_analysis=None,
        solution_analysis=None,
        critic_analysis=None,
        final_report=None,
        current_stage="start",
        warnings=[],
        errors=[],
        is_clarification_needed=False,
        clarification_message="",
    )

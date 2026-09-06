"""
LangGraph StateGraph — the compiled validation workflow graph.

Graph structure:
  validate_input
    ├── [clarification_needed] → END (return clarification response)
    ├── [error] → END
    └── [normalize] →
  normalize_project →
  generate_queries →
  collect_evidence →
  process_evidence →
  evidence_synthesis (LLM #1) →
  solution_innovation (LLM #2) →
  critic_review (LLM #3) →
  final_consensus (LLM #4) →
  validate_final_report
    ├── [error] → END
    └── [persist] →
  persist_report → END

All nodes read from and write to the shared ProjectState TypedDict.
"""
import logging
from langgraph.graph import StateGraph, END

from models.state import ProjectState
from orchestration.nodes import (
    validate_input,
    normalize_project,
    generate_queries,
    collect_evidence,
    process_evidence,
    evidence_synthesis,
    solution_innovation,
    critic_review,
    final_consensus,
    validate_final_report,
    route_after_validation,
    route_after_report_validation,
)

logger = logging.getLogger(__name__)

_compiled_graph = None


def build_graph():
    """
    Build and compile the LangGraph StateGraph.
    
    Returns a compiled graph ready to invoke with a ProjectState.
    """
    graph = StateGraph(ProjectState)

    # ── Add nodes ────────────────────────────────────────────────────────────
    graph.add_node("validate_input", validate_input)
    graph.add_node("normalize_project", normalize_project)
    graph.add_node("generate_queries", generate_queries)
    graph.add_node("collect_evidence", collect_evidence)
    graph.add_node("process_evidence", process_evidence)
    graph.add_node("evidence_synthesis", evidence_synthesis)
    graph.add_node("solution_innovation", solution_innovation)
    graph.add_node("critic_review", critic_review)
    graph.add_node("final_consensus", final_consensus)
    graph.add_node("validate_final_report", validate_final_report)
    graph.add_node("persist_report", _persist_report_node)

    # ── Set entry point ───────────────────────────────────────────────────────
    graph.set_entry_point("validate_input")

    # ── Edges ─────────────────────────────────────────────────────────────────
    # Conditional routing after input validation
    graph.add_conditional_edges(
        "validate_input",
        route_after_validation,
        {
            "clarification_needed": END,
            "error": END,
            "normalize": "normalize_project",
        }
    )

    # Linear pipeline after normalization
    graph.add_edge("normalize_project", "generate_queries")
    graph.add_edge("generate_queries", "collect_evidence")
    graph.add_edge("collect_evidence", "process_evidence")
    graph.add_edge("process_evidence", "evidence_synthesis")
    graph.add_edge("evidence_synthesis", "solution_innovation")
    graph.add_edge("solution_innovation", "critic_review")
    graph.add_edge("critic_review", "final_consensus")
    graph.add_edge("final_consensus", "validate_final_report")

    # Conditional routing after report validation
    graph.add_conditional_edges(
        "validate_final_report",
        route_after_report_validation,
        {
            "error": END,
            "persist": "persist_report",
        }
    )

    graph.add_edge("persist_report", END)

    compiled = graph.compile()
    logger.info("LangGraph compiled successfully")
    return compiled


def _persist_report_node(state: ProjectState) -> dict:
    """Node wrapper for MongoDB persistence."""
    from persistence.mongodb import persist_analysis
    report = state.get("final_report")
    project = state.get("project")
    warnings = list(state.get("warnings", []))

    if report and project:
        try:
            persist_analysis(project, report)
            logger.info("Report persisted to MongoDB")
        except Exception as e:
            logger.warning(f"MongoDB persistence failed (non-fatal): {e}")
            warnings.append(f"Report not persisted: {str(e)[:100]}")

    return {"warnings": warnings, "current_stage": "persisted"}


def get_graph():
    """Get or build the compiled graph (singleton)."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def run_validation(project_input) -> dict:
    """
    Run the full validation workflow for a project input.
    
    Args:
        project_input: ProjectInput Pydantic model
        
    Returns:
        dict with 'status', 'report' (or 'clarification_message'), 'warnings'
    """
    from models.state import make_initial_state

    graph = get_graph()
    initial_state = make_initial_state(project_input)

    try:
        final_state = graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"Graph invocation failed: {e}", exc_info=True)
        return {
            "status": "error",
            "error": f"Workflow failed: {str(e)[:300]}",
            "warnings": initial_state.get("warnings", []),
        }

    # Check for clarification needed
    if final_state.get("is_clarification_needed"):
        return {
            "status": "clarification_needed",
            "clarification_message": final_state.get("clarification_message", "Please provide more details."),
            "warnings": final_state.get("warnings", []),
        }

    # Check for errors
    errors = final_state.get("errors", [])
    if errors:
        return {
            "status": "error",
            "error": errors[0] if errors else "Unknown error",
            "warnings": final_state.get("warnings", []),
        }

    # Return final report
    report = final_state.get("final_report")
    if not report:
        return {
            "status": "error",
            "error": "Workflow completed but no report was generated",
            "warnings": final_state.get("warnings", []),
        }

    return {
        "status": "success",
        "report": report.model_dump(),
        "warnings": final_state.get("warnings", []),
    }

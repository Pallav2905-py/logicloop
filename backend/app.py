"""
Flask application — main entry point for the validation backend.

Endpoints:
  GET  /api/health   — health check
  POST /api/analyze  — run the full validation workflow
  GET  /api/history  — list recent analyses (MongoDB)

CORS is configured to allow the Next.js frontend at localhost:3000.
All API keys are read from environment variables ONLY.
"""
import os
import sys
import logging
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load .env from backend/ directory if it exists (for local dev)
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        logging.getLogger(__name__).info(f"Loaded env from {env_path}")
except ImportError:
    pass  # dotenv not available; rely on system env vars

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

# Allow CORS from the Next.js dev server and production
frontend_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
CORS(app, origins=frontend_origins, supports_credentials=True)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    """Health check endpoint."""
    from orchestration.graph import build_graph
    graph_status = "ok"
    try:
        build_graph()
    except Exception as e:
        graph_status = f"error: {e}"

    return jsonify({
        "status": "ok",
        "service": "logicloop-validation-backend",
        "version": "1.0.0",
        "graph": graph_status,
        "environment": {
            "gemini": bool(os.getenv("GEMINI_API_KEY")),
            "groq": bool(os.getenv("GROQ_API_KEY")),
            "github": bool(os.getenv("GITHUB_API")),
            "serp": bool(os.getenv("SERP_API_KEY")),
            "tavily": bool(os.getenv("TAVILY_API_KEY")),
            "openalex": bool(os.getenv("OPENALEX_API_KEY")),
            "firecrawl": bool(os.getenv("FIRECRAWL_API_KEY")),
            "mongodb": bool(os.getenv("MONGODB_URI")),
        }
    })


@app.post("/api/analyze")
def analyze():
    """
    Main validation endpoint.
    
    Request body:
    {
        "title": "...",
        "description": "...",
        "target_users": [...],
        "market": "...",
        "constraints": [...]
    }
    
    Response:
    {
        "status": "success" | "clarification_needed" | "error",
        "report": {...},          // on success
        "clarification_message": "...",  // on clarification_needed
        "error": "...",           // on error
        "warnings": [...]
    }
    """
    try:
        body = request.get_json(force=True, silent=True)
        if not body:
            return jsonify({"status": "error", "error": "Request body must be JSON"}), 400

        # Validate and parse input
        from models.input import ProjectInput
        from pydantic import ValidationError

        try:
            project_input = ProjectInput(
                title=body.get("title", "").strip(),
                description=body.get("description", "").strip(),
                target_users=body.get("target_users", []),
                market=body.get("market", ""),
                constraints=body.get("constraints", []),
            )
        except ValidationError as e:
            errors = e.errors()
            first_error = errors[0]["msg"] if errors else "Invalid input"
            return jsonify({
                "status": "clarification_needed",
                "clarification_message": first_error,
                "warnings": [],
            }), 200

        # Run the LangGraph workflow
        from orchestration.graph import run_validation
        result = run_validation(project_input)

        status_code = 200
        if result.get("status") == "error":
            status_code = 500

        return jsonify(result), status_code

    except Exception as e:
        logger.error(f"/api/analyze unexpected error: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": f"Internal server error: {str(e)[:200]}",
        }), 500


@app.get("/api/history")
def history():
    """List recent analyses from MongoDB (if available)."""
    try:
        from persistence.mongodb import list_analyses
        analyses = list_analyses(limit=20)
        return jsonify({"status": "ok", "analyses": analyses})
    except Exception as e:
        return jsonify({"status": "ok", "analyses": [], "warning": str(e)}), 200


@app.get("/api/analysis/<analysis_id>")
def get_analysis(analysis_id: str):
    """Retrieve a specific analysis by ID."""
    try:
        from persistence.mongodb import get_analysis
        doc = get_analysis(analysis_id)
        if not doc:
            return jsonify({"status": "error", "error": "Analysis not found"}), 404
        return jsonify({"status": "ok", "analysis": doc})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    logger.info(f"Starting LogicLoop Validation Backend on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)

"""
MongoDB persistence — stores completed analysis reports.

MongoDB is persistence ONLY — it is not used as agent working memory.
The LangGraph ProjectState is the working memory.

Graceful failure: if MongoDB is unavailable, the analysis continues and
the report is returned. Persistence failure does not destroy the result.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

_client = None
_db = None


def _get_db():
    """Lazy init MongoDB connection."""
    global _client, _db
    if _db is not None:
        return _db

    uri = os.getenv("MONGODB_URI")
    if not uri:
        logger.warning("MONGODB_URI not set — persistence disabled")
        return None

    try:
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure

        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _client.admin.command("ping")  # test connection
        _db = _client.get_default_database() or _client["logicloop"]
        logger.info("MongoDB connected")
        return _db
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}")
        return None


def persist_analysis(project_input, report) -> Optional[str]:
    """
    Persist a completed analysis to MongoDB.
    
    Returns the inserted document ID string, or None if persistence failed.
    """
    db = _get_db()
    if not db:
        return None

    try:
        collection = db["project_analyses"]
        doc = {
            "project_input": {
                "title": project_input.title,
                "description": project_input.description,
                "target_users": project_input.target_users,
                "market": project_input.market,
                "constraints": project_input.constraints,
            },
            "report": report.model_dump(),
            "recommendation": report.decision.recommendation,
            "overall_score": report.decision.overall_score,
            "created_at": datetime.now(timezone.utc),
            "status": "complete",
        }
        result = collection.insert_one(doc)
        inserted_id = str(result.inserted_id)
        logger.info(f"Analysis persisted: {inserted_id}")
        return inserted_id
    except Exception as e:
        logger.error(f"Failed to persist analysis: {e}")
        return None


def get_analysis(analysis_id: str) -> Optional[dict]:
    """Retrieve a previously persisted analysis."""
    db = _get_db()
    if not db:
        return None

    try:
        from bson import ObjectId
        collection = db["project_analyses"]
        doc = collection.find_one({"_id": ObjectId(analysis_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc
    except Exception as e:
        logger.error(f"Failed to retrieve analysis {analysis_id}: {e}")
        return None


def list_analyses(limit: int = 20) -> list[dict]:
    """List recent analyses for history view."""
    db = _get_db()
    if not db:
        return []

    try:
        collection = db["project_analyses"]
        docs = list(
            collection.find({}, {"project_input": 1, "recommendation": 1, "overall_score": 1, "created_at": 1})
            .sort("created_at", -1)
            .limit(limit)
        )
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return docs
    except Exception as e:
        logger.error(f"Failed to list analyses: {e}")
        return []

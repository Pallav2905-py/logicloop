"""
LLM Router — Gemini → Groq fallback.

Agents call this router instead of directly calling a provider.
Flow: Gemini → (failure/rate-limit) → Groq → (failure) → exception
"""
import logging
from typing import Optional, Type, TypeVar
from pydantic import BaseModel

from llm.gemini import call_gemini
from llm.groq import call_groq

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def call_llm(
    prompt: str,
    output_model: Optional[Type[T]] = None,
    temperature: float = 0.3,
    stage_name: str = "unknown",
) -> T:
    """
    Route LLM call: Gemini first, then Groq fallback.
    
    Args:
        prompt: The full prompt string
        output_model: Pydantic model class to parse the response into
        temperature: Generation temperature (0-1)
        stage_name: Human-readable stage label for logging
        
    Returns:
        Validated Pydantic model instance
        
    Raises:
        RuntimeError: If both Gemini and Groq fail
    """
    logger.info(f"[LLM Router] Stage: {stage_name} — trying Gemini")

    # Try Gemini first
    instance, raw = call_gemini(prompt, output_model, temperature, max_retries=1)
    if instance is not None:
        logger.info(f"[LLM Router] Stage: {stage_name} — Gemini succeeded")
        return instance

    # Gemini returned raw text but couldn't parse
    if raw is not None:
        logger.warning(f"[LLM Router] Stage: {stage_name} — Gemini returned unparseable output, trying Groq")
    else:
        logger.warning(f"[LLM Router] Stage: {stage_name} — Gemini call failed, falling back to Groq")

    # Try Groq fallback
    instance, raw = call_groq(prompt, output_model, temperature)
    if instance is not None:
        logger.info(f"[LLM Router] Stage: {stage_name} — Groq fallback succeeded")
        return instance

    raise RuntimeError(
        f"[LLM Router] Both Gemini and Groq failed for stage '{stage_name}'. "
        f"Raw output: {str(raw)[:200] if raw else 'None'}"
    )


def call_llm_raw(prompt: str, stage_name: str = "unknown") -> str:
    """Call LLM and return raw text (no structured parsing)."""
    logger.info(f"[LLM Router] Stage: {stage_name} — raw text mode")
    _, raw = call_gemini(prompt, output_model=None)
    if raw:
        return raw
    _, raw = call_groq(prompt, output_model=None)
    if raw:
        return raw
    raise RuntimeError(f"Both LLMs failed for raw call at stage '{stage_name}'")

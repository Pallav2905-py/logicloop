"""
Gemini LLM client using the current google-genai SDK.

Uses gemini-2.0-flash. Handles structured JSON output with
robust parsing and a single retry on failure.
"""
import os
import json
import logging
import re
from typing import Optional, Type, TypeVar
from pydantic import BaseModel

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

# Current stable Flash model available on free tier
GEMINI_MODEL = "gemini-3.5-flash"


def _get_client():
    """Lazy-init Google GenAI client using the new google-genai SDK."""
    try:
        from google import genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set")
        client = genai.Client(api_key=api_key)
        return client
    except ImportError:
        raise ImportError("google-genai not installed. Run: pip install google-genai")


def _extract_json(text: str) -> str:
    """Extract JSON object from model response, stripping markdown fences."""
    text = text.strip()
    # Strip markdown code fences
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text, flags=re.MULTILINE)
    text = text.strip()

    # Try to find the outermost JSON object
    brace_start = text.find("{")
    if brace_start != -1:
        # Find matching close brace
        depth = 0
        for i, ch in enumerate(text[brace_start:], start=brace_start):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[brace_start:i+1]
    return text


def call_gemini(
    prompt: str,
    output_model: Optional[Type[T]] = None,
    temperature: float = 0.3,
    max_retries: int = 1,
) -> tuple[Optional[T], Optional[str]]:
    """
    Call Gemini and return (parsed_model_instance, raw_text).
    
    Returns:
        (model_instance, None) on success
        (None, raw_text) if JSON parsing fails after retries
        (None, None) if the API call itself fails
    """
    try:
        client = _get_client()
    except Exception as e:
        logger.error(f"Gemini client init failed: {e}")
        return None, None

    from google.genai import types

    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=8192,
    )

    current_prompt = prompt
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=current_prompt,
                config=config,
            )
            raw = response.text

            if output_model is None:
                return None, raw

            json_str = _extract_json(raw)
            try:
                data = json.loads(json_str)
                instance = output_model.model_validate(data)
                return instance, raw
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Gemini JSON parse attempt {attempt+1} failed: {e}")
                if attempt < max_retries:
                    logger.info("Retrying with stricter JSON instruction...")
                    current_prompt = (
                        prompt + "\n\nIMPORTANT: Return ONLY a valid JSON object. "
                        "No markdown, no prose, no code fences. Start with { and end with }."
                    )
                    continue
                return None, raw

        except Exception as e:
            err_str = str(e)
            logger.error(f"Gemini API call attempt {attempt+1} failed: {err_str}")
            # Check for rate limit
            if "429" in err_str or "quota" in err_str.lower() or "RESOURCE_EXHAUSTED" in err_str:
                logger.warning("Gemini rate limit hit — flagging for Groq fallback")
                return None, None
            if attempt < max_retries:
                continue
            return None, None

    return None, None

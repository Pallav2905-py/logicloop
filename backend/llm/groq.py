"""
Groq LLM fallback client.

Used when Gemini is unavailable or rate-limited.
Uses LangChain's ChatGroq for convenience.
"""
import os
import json
import logging
import re
from typing import Optional, Type, TypeVar
from pydantic import BaseModel

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

GROQ_MODEL = "llama-3.3-70b-versatile"


def _extract_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text, flags=re.MULTILINE)
    text = text.strip()
    brace_start = text.find("{")
    if brace_start != -1:
        depth = 0
        for i, ch in enumerate(text[brace_start:], start=brace_start):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[brace_start:i+1]
    return text


def call_groq(
    prompt: str,
    output_model: Optional[Type[T]] = None,
    temperature: float = 0.3,
) -> tuple[Optional[T], Optional[str]]:
    """
    Call Groq as fallback LLM.
    
    Returns:
        (model_instance, None) on success
        (None, raw_text) if parsing fails
        (None, None) if API call fails
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY not set — cannot use Groq fallback")
        return None, None

    try:
        from langchain_groq import ChatGroq
    except ImportError:
        try:
            # Fallback: direct HTTP call to Groq
            return _call_groq_direct(prompt, output_model, api_key, temperature)
        except Exception as e:
            logger.error(f"Groq direct call failed: {e}")
            return None, None

    try:
        llm = ChatGroq(
            api_key=api_key,
            model=GROQ_MODEL,
            temperature=temperature,
            max_tokens=8192,
        )
        response = llm.invoke(prompt)
        raw = response.content

        if output_model is None:
            return None, raw

        json_str = _extract_json(raw)
        try:
            data = json.loads(json_str)
            instance = output_model.model_validate(data)
            return instance, raw
        except Exception as e:
            logger.error(f"Groq JSON parse failed: {e}")
            return None, raw

    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None, None


def _call_groq_direct(prompt: str, output_model, api_key: str, temperature: float):
    """Direct HTTP call to Groq API as fallback."""
    import urllib.request
    import json as json_lib

    body = json_lib.dumps({
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": 8192,
    }).encode()

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json_lib.loads(resp.read())
        raw = data["choices"][0]["message"]["content"]

    if output_model is None:
        return None, raw

    json_str = _extract_json(raw)
    parsed = json_lib.loads(json_str)
    instance = output_model.model_validate(parsed)
    return instance, raw

"""
Prior-Art Agent — analyzes research papers, patents, and academic prior art.

Responsibility:
  - Identify relevant research papers and academic work
  - Surface patent prior-art signals
  - Assess research gaps and novelty signals
  - Identify what has and hasn't been studied

Tools: OpenAlex papers, SerpAPI patent results, Firecrawl for selected papers
Input: NormalizedProject + EvidenceBundle
Output: PriorArtAnalysis (via LLM Call #1 - shared with Research + Competition)

DISCLAIMER: Patent analysis is informational only.
Do NOT make claims about freedom-to-operate or legal novelty.
"""
from models.input import NormalizedProject
from models.evidence import EvidenceBundle
from models.agents import PriorArtAnalysis

PRIOR_ART_SYSTEM = """You are the Prior-Art Agent — an expert at identifying academic literature, patents, and research precedents.
Your job is to assess the prior art landscape for a project idea based on collected evidence.
Be precise about what evidence exists vs. what is inferred.
CRITICAL: Never claim something is patent-free or legally novel. 
Use language like 'prior-art signal', 'potentially relevant patent', 'not a legal opinion'."""


def build_prior_art_prompt(project: NormalizedProject, evidence: EvidenceBundle) -> str:
    evidence_text = evidence.to_compact_text()

    return f"""{PRIOR_ART_SYSTEM}

## Project Under Analysis
**Title:** {project.title}
**Description:** {project.description}
**Domain:** {project.domain}
**Key Concepts:** {", ".join(project.key_concepts)}

## Collected Evidence
{evidence_text if evidence_text.strip() else "No external evidence collected."}

## Your Task
Analyze the academic and patent prior-art landscape. Return a JSON object matching this exact schema:

{{
  "score": <integer 0-100, prior art density (100 = heavily patented/researched, 0 = greenfield)>,
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence prior art overview>",
  "paper_highlights": [
    {{
      "title": "<paper title from evidence or well-known paper>",
      "authors": ["<author1>", "<author2>"],
      "year": <year or null>,
      "key_finding": "<most relevant finding for THIS project>",
      "url": "<URL from evidence or empty string>",
      "relevance": "<why this paper matters for the project>"
    }}
  ],
  "patent_signals": [
    {{
      "title": "<patent title>",
      "patent_number": "<number or null>",
      "assignee": "<company or null>",
      "relevance": "<how this overlaps with the project concept>",
      "url": "<URL from evidence or empty string>",
      "disclaimer": "Prior-art signal only — not a legal opinion on patentability or freedom-to-operate."
    }}
  ],
  "research_gaps": ["<identified gap in existing research>", "<another gap>"],
  "novelty_assessment": "<2-3 sentences on where the project might be novel vs. well-covered>",
  "evidence_strength": "<HIGH|MEDIUM|LOW|INSUFFICIENT based on quality of evidence found>",
  "reasoning": "<how you weighed papers vs patents vs absence of evidence>"
}}

Rules:
- paper_highlights: use evidence papers first; if none, note that no specific papers were found
- patent_signals: only include if patents exist in evidence; empty array if none found
- Do NOT say 'no patents exist' — say 'no patents found in available evidence'
- evidence_strength: INSUFFICIENT means almost nothing was found
- Return ONLY the JSON object
"""

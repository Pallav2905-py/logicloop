"""Evidence models — typed containers for all external API results."""
from typing import Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    """Base evidence item shared across all sources."""
    title: str
    description: str
    source: str  # github | web | paper | patent
    url: str
    date: Optional[str] = None
    relevance: float = Field(default=0.0, ge=0.0, le=1.0)


class GitHubEvidence(EvidenceItem):
    source: str = "github"
    repo_name: str = ""
    stars: int = 0
    language: Optional[str] = None
    readme_snippet: Optional[str] = None
    topics: list[str] = Field(default_factory=list)


class WebEvidence(EvidenceItem):
    source: str = "web"
    snippet: str = ""
    domain: str = ""
    deep_content: Optional[str] = None  # populated by Firecrawl selectively


class PaperEvidence(EvidenceItem):
    source: str = "paper"
    authors: list[str] = Field(default_factory=list)
    year: Optional[int] = None
    doi: Optional[str] = None
    abstract: Optional[str] = None
    citations: int = 0
    venue: Optional[str] = None


class PatentEvidence(EvidenceItem):
    source: str = "patent"
    patent_number: Optional[str] = None
    assignee: Optional[str] = None
    filing_date: Optional[str] = None
    snippet: str = ""


class EvidenceBundle(BaseModel):
    """Processed, deduplicated, ranked evidence ready for LLM ingestion."""
    github: list[GitHubEvidence] = Field(default_factory=list)
    web: list[WebEvidence] = Field(default_factory=list)
    papers: list[PaperEvidence] = Field(default_factory=list)
    patents: list[PatentEvidence] = Field(default_factory=list)

    # Collection metadata
    total_raw_count: int = 0
    after_dedup_count: int = 0
    github_query_count: int = 0
    web_query_count: int = 0
    paper_query_count: int = 0
    patent_query_count: int = 0
    firecrawl_pages_extracted: int = 0

    # Flags
    github_available: bool = True
    web_available: bool = True
    papers_available: bool = True
    patents_available: bool = True

    def to_compact_text(self, max_tokens_hint: int = 12000) -> str:
        """Render evidence bundle as compact text for Gemini prompts."""
        sections: list[str] = []

        if self.github:
            lines = ["## GitHub Repositories"]
            for g in self.github[:8]:
                lines.append(
                    f"- **{g.repo_name}** ({g.stars}★, {g.language or 'N/A'})\n"
                    f"  {g.description[:200]}\n"
                    f"  URL: {g.url}\n"
                    f"  Relevance: {g.relevance:.2f}"
                )
                if g.readme_snippet:
                    lines.append(f"  README: {g.readme_snippet[:300]}")
            sections.append("\n".join(lines))

        if self.web:
            lines = ["## Web Evidence"]
            for w in self.web[:8]:
                lines.append(
                    f"- **{w.title}** ({w.domain})\n"
                    f"  {w.snippet[:250]}\n"
                    f"  URL: {w.url}\n"
                    f"  Relevance: {w.relevance:.2f}"
                )
                if w.deep_content:
                    lines.append(f"  Deep: {w.deep_content[:400]}")
            sections.append("\n".join(lines))

        if self.papers:
            lines = ["## Research Papers"]
            for p in self.papers[:6]:
                lines.append(
                    f"- **{p.title}** ({p.year}, {p.citations} citations)\n"
                    f"  Authors: {', '.join(p.authors[:3])}\n"
                    f"  {(p.abstract or p.description)[:250]}\n"
                    f"  URL: {p.url}\n"
                    f"  Relevance: {p.relevance:.2f}"
                )
            sections.append("\n".join(lines))

        if self.patents:
            lines = ["## Prior Art / Patents (informational only, not a legal opinion)"]
            for pt in self.patents[:5]:
                lines.append(
                    f"- **{pt.title}** (Patent: {pt.patent_number or 'N/A'}, Assignee: {pt.assignee or 'N/A'})\n"
                    f"  {pt.snippet[:200]}\n"
                    f"  URL: {pt.url}\n"
                    f"  Relevance: {pt.relevance:.2f}"
                )
            sections.append("\n".join(lines))

        return "\n\n".join(sections)

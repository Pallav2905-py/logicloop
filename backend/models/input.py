"""Input models — single source of truth for project submission."""
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ProjectInput(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)
    target_users: list[str] = Field(default_factory=list)
    market: Optional[str] = None
    constraints: list[str] = Field(default_factory=list)

    @field_validator("description")
    @classmethod
    def description_not_too_vague(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError("Description is too vague. Please provide at least 20 characters.")
        return v.strip()

    @field_validator("title")
    @classmethod
    def title_strip(cls, v: str) -> str:
        return v.strip()


class NormalizedProject(BaseModel):
    """Structured representation used by all agents."""
    title: str
    description: str
    target_users: list[str]
    market: str
    constraints: list[str]
    # Derived during normalization
    domain: str = ""
    problem_statement: str = ""
    solution_hint: str = ""
    key_concepts: list[str] = Field(default_factory=list)


class SearchQueries(BaseModel):
    """Generated search queries for each tool."""
    github_queries: list[str] = Field(default_factory=list)
    web_queries: list[str] = Field(default_factory=list)
    semantic_queries: list[str] = Field(default_factory=list)
    paper_queries: list[str] = Field(default_factory=list)
    patent_queries: list[str] = Field(default_factory=list)

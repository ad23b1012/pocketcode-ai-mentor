"""Pydantic models for API request/response schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class MentorMode(str, Enum):
    EXPLAIN = "explain"
    DEBUG = "debug"
    SUGGEST = "suggest"
    TRANSLATE = "translate"
    IDEA = "idea"
    GENERAL = "general"


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message content")


class MentorRequest(BaseModel):
    message: str = Field(..., description="The student's message/question")
    mode: MentorMode = Field(default=MentorMode.GENERAL, description="AI mentor mode")
    code_context: Optional[str] = Field(default=None, description="Current code/script context from PocketCode")
    output_context: Optional[str] = Field(default=None, description="Compiler/runtime errors or output")
    system_context: Optional[str] = Field(default=None, description="Additional context (language, level, framework)")
    conversation_history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation turns")
    student_level: Optional[str] = Field(default="intermediate", description="Student level: beginner, intermediate, advanced")


class MentorResponse(BaseModel):
    reply: str = Field(..., description="AI mentor's response")
    mode: MentorMode = Field(..., description="Mode used for this response")
    suggestions: List[str] = Field(default_factory=list, description="Follow-up suggestions")


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "pocketcode-ai-mentor"
    version: str = "1.0.0"


class AnalyzeProjectRequest(BaseModel):
    project_xml: str = Field(..., description="Catrobat project XML content")
    analysis_type: str = Field(default="overview", description="Type: overview, complexity, suggestions")


class AnalyzeProjectResponse(BaseModel):
    summary: str
    sprites: List[str] = Field(default_factory=list)
    complexity_score: Optional[int] = None
    suggestions: List[str] = Field(default_factory=list)
    concepts_used: List[str] = Field(default_factory=list)

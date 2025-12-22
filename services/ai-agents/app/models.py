"""Pydantic models for the AI agents API."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AgentInfo(BaseModel):
    agentId: str = Field(..., min_length=1)
    name: str = Field(..., min_length=2)
    description: str = Field(..., min_length=4)

    model_config = ConfigDict(extra="forbid")


class AgentRunRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    context: dict[str, Any] | None = None

    model_config = ConfigDict(extra="allow")


class AgentRunResponse(BaseModel):
    agentId: str
    output: str
    model: str
    createdAt: str

    model_config = ConfigDict(extra="forbid")

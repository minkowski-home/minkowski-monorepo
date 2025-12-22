"""Agent routing and orchestration stubs."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from ..models import AgentInfo, AgentRunRequest, AgentRunResponse

router = APIRouter(tags=["agents"])

AGENTS = [
    AgentInfo(
        agentId="copywriter",
        name="Copywriter",
        description="Drafts concise marketing copy and messaging variants.",
    ),
    AgentInfo(
        agentId="brand-analyst",
        name="Brand Analyst",
        description="Evaluates brand alignment and voice consistency.",
    ),
]


@router.get("/agents", response_model=list[AgentInfo])
async def list_agents() -> list[AgentInfo]:
    """Return the configured agent roster."""
    return AGENTS


@router.post("/agents/{agent_id}/run", response_model=AgentRunResponse)
async def run_agent(agent_id: str, payload: AgentRunRequest) -> AgentRunResponse:
    """Stub execution endpoint for a specific agent."""
    agent = next((entry for entry in AGENTS if entry.agentId == agent_id), None)
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found.")

    now = datetime.now(timezone.utc).isoformat()
    output = (
        f"Stub response from {agent.name}. "
        "Wire this to a model or toolchain in services/ai-agents. "
        f"Prompt was: {payload.prompt}"
    )

    return AgentRunResponse(
        agentId=agent.agentId,
        output=output,
        model="placeholder",
        createdAt=now,
    )

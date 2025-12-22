"""FastAPI application for AI agent orchestration."""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.agents import router as agents_router

load_dotenv()

app = FastAPI(title="AI Agents API", version="0.1.0")


def _allowed_origins() -> list[str]:
    """Parse ALLOWED_ORIGINS into a list for CORS configuration."""
    raw = os.getenv("ALLOWED_ORIGINS", "")
    parsed = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return parsed or ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def healthcheck() -> dict[str, str]:
    """Lightweight liveness probe."""
    return {"status": "ok"}


app.include_router(agents_router)

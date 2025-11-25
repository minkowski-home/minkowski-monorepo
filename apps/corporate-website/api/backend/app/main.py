import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import close_client, get_client
from .routes.design_test import router as design_test_router

load_dotenv()

app = FastAPI(title="Design Sense Test API", version="0.1.0")


def _allowed_origins() -> list[str]:
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


@app.on_event("startup")
async def startup() -> None:
    await get_client()


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_client()


@app.get("/health", tags=["health"])
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(design_test_router)

"""MongoDB connection helpers for the Design Sense API."""

import os
from typing import Optional

from motor.motor_asyncio import (  # type: ignore
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
    AsyncIOMotorDatabase,
)

_client: Optional[AsyncIOMotorClient] = None


def _get_mongo_uri() -> str:
    """Return the MongoDB connection string or raise if missing."""
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI environment variable is required.")
    return uri


def _get_database_name() -> str:
    """Return the configured database name or a sensible default."""
    return os.getenv("MONGODB_DB", "minkowski_design_test")


async def get_client() -> AsyncIOMotorClient:
    """Initialize and cache the AsyncIOMotorClient."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(_get_mongo_uri(), uuidRepresentation="standard")
    return _client


async def close_client() -> None:
    """Close the cached client and clear the reference."""
    global _client
    if _client is not None:
        _client.close()
        _client = None


async def _get_database() -> AsyncIOMotorDatabase:
    """Get the database handle for the configured DB."""
    client = await get_client()
    return client[_get_database_name()]


async def get_questions_collection() -> AsyncIOMotorCollection:
    """Collection for design test questions."""
    database = await _get_database()
    return database["design_test_questions"]


async def get_images_collection() -> AsyncIOMotorCollection:
    """Collection for images tied to questions."""
    database = await _get_database()
    return database["images"]


async def get_applicants_collection() -> AsyncIOMotorCollection:
    """Collection for applicant profile data."""
    database = await _get_database()
    return database["applicants"]


async def get_attempts_collection() -> AsyncIOMotorCollection:
    """Collection for attempt submissions and scoring results."""
    database = await _get_database()
    return database["attempts"]


async def get_supplemental_questions_collection() -> AsyncIOMotorCollection:
    """Collection for selection/boost metadata for the bonus questions."""
    database = await _get_database()
    return database["supplemental_questions"]

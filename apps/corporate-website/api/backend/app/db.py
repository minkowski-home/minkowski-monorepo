import os
from typing import Optional

from motor.motor_asyncio import ( # type: ignore
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
    AsyncIOMotorDatabase,
)

_client: Optional[AsyncIOMotorClient] = None


def _get_mongo_uri() -> str:
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI environment variable is required.")
    return uri


def _get_database_name() -> str:
    return os.getenv("MONGODB_DB", "minkowski_design_test")


async def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(_get_mongo_uri(), uuidRepresentation="standard")
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


async def _get_database() -> AsyncIOMotorDatabase:
    client = await get_client()
    return client[_get_database_name()]


async def get_questions_collection() -> AsyncIOMotorCollection:
    database = await _get_database()
    return database["design_test_questions"]


async def get_images_collection() -> AsyncIOMotorCollection:
    database = await _get_database()
    return database["images"]


async def get_applicants_collection() -> AsyncIOMotorCollection:
    database = await _get_database()
    return database["applicants"]


async def get_attempts_collection() -> AsyncIOMotorCollection:
    database = await _get_database()
    return database["attempts"]


async def get_supplemental_questions_collection() -> AsyncIOMotorCollection:
    database = await _get_database()
    return database["supplemental_questions"]

"""Placeholder high-throughput event collector using FastAPI."""
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Event Collector")

class Event(BaseModel):
    name: str
    user_id: str
    at: datetime = datetime.utcnow()

@app.post("/events")
async def ingest(event: Event) -> dict[str, str]:
    # In production this would push to Pub/Sub or Kafka.
    print(f"received {event.name} for {event.user_id}")
    return {"status": "queued"}

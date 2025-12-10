from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Minkowski Metadata API")

class Dataset(BaseModel):
    name: str
    owner: str
    tags: list[str] = []

_fake_catalog = [
    Dataset(name="campaign_spend_daily", owner="growth", tags=["ads", "finance"]),
    Dataset(name="product_inventory", owner="ops", tags=["inventory"]),
]

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/datasets", response_model=list[Dataset])
def list_datasets() -> list[Dataset]:
    return _fake_catalog

"""Shared helpers consumed by FastAPI services and data jobs."""

from dataclasses import dataclass

@dataclass
class DatasetRef:
  name: str
  owner: str

  def catalog_key(self) -> str:
    return f"{self.owner}/{self.name}"

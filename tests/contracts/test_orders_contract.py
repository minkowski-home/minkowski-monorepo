import json
from pathlib import Path

SCHEMA_PATH = Path(__file__).resolve().parents[2] / "data-contracts" / "order_contract.json"


def test_order_contract_schema_loads() -> None:
    schema = json.loads(SCHEMA_PATH.read_text())
    assert schema["title"] == "order.v1"
    assert set(schema["required"]) == {"id", "customer_id", "status", "total"}

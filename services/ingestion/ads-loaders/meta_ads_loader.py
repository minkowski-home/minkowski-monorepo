"""Skeleton loader showing how paid media connectors will evolve."""
from datetime import datetime

def fetch_ads_report(since: datetime) -> list[dict]:
    return [{"campaign_id": "cmp_meta_home", "spend": 125.0, "since": since.isoformat()}]

def load_ads_report(report: list[dict]) -> None:
    for row in report:
        print(f"Loading {row['campaign_id']} with spend {row['spend']}")

if __name__ == "__main__":
    rows = fetch_ads_report(datetime.utcnow())
    load_ads_report(rows)

# ADR-0001: Data Plane Segmentation

- **Context**: The README used to say "System diagrams, ADRs, and integration
  notes". This ADR is the first concrete artifact describing the decision to
  split ingestion, orchestration, and serving layers.
- **Decision**: Keep raw ingestion on GCP composer-managed Airflow, land curated
  tables in BigQuery, and expose FastAPI metadata APIs from the data-platform
  service. Downstream dbt models publish to analytics-friendly schemas.
- **Consequences**: Requires shared schema definitions (see `schemas/`) and
  observed SLAs (see `observability/`).

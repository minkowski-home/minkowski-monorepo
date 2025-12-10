"""Airflow DAG placeholder showing how orchestrator jobs will be defined."""
from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator

with DAG(
    dag_id="refresh_marketing_datasets",
    start_date=datetime(2024, 1, 1),
    schedule_interval="0 * * * *",
    catchup=False,
    default_args={"owner": "data-platform"},
):
    export_spend = BashOperator(
        task_id="export_paid_media",
        bash_command="python /opt/airflow/dags/scripts/export_paid_media.py",
    )

    update_catalog = BashOperator(
        task_id="notify_catalog",
        bash_command="curl -X POST http://metadata-api:8080/datasets/refresh",
    )

    export_spend >> update_catalog

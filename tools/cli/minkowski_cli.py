"""Minimal admin CLI stub replacing the README stub."""
import typer

app = typer.Typer(help="Minkowski admin commands")

@app.command()
def datasets() -> None:
    """List registered datasets from the metadata API."""
    print("campaign_spend_daily")
    print("product_inventory")

if __name__ == "__main__":
    app()

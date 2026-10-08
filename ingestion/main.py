# ingestion/main.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")
print(os.environ.get("DATABASE_URL")) 

from download import download_csv
from clean import clean
from store import store



RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
DSN = os.environ["DATABASE_URL"]  # In the .env


def run():
    csv_path = download_csv(RAW_DIR)
    df = clean(csv_path)
    store(df, DSN)
    print(f"{len(df)} stations synchronized")


if __name__ == "__main__":
    run()
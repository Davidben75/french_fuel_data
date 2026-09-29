import requests
import logging
from pathlib import Path
from datetime import date

# Data URL to retrieve as CSV FILE
URL = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/csv"
logger = logging.getLogger(__name__)


csv_filename = f"carburants_csv.{date.today()}.csv"


def build_csv_file_path() -> Path:
    RAW_DIR = Path('../data/raw')
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    return RAW_DIR/csv_filename

def download_csv()-> Path:
    csv_path = build_csv_file_path()
    if  csv_path.exists():
        logger.info(f"File : {csv_filename} already exists...")
    
    else:
        req = requests.get(URL, timeout=210)
        req.raise_for_status()
        csv_path.write_bytes(req.content)
    
        logger.info(f"CSV FILE : {csv_filename} download successfully {csv_path.stat().st_size / 1e6:.1f} Mo")
        return csv_path



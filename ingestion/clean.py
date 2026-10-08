import pandas as pd

FUELS = ["gazole", "sp95", "e10", "sp98", "e85", "gplc"]
KEEP = ["id", "cp", "adresse", "ville", "geom"] + [
    f"{fuel}_{suffix}" for fuel in FUELS for suffix in ("prix", "maj")
]

def clean(csv_path) -> pd.DataFrame:
    df = pd.read_csv(csv_path, sep=";")
    df = df[KEEP].copy()

    for fuel in FUELS:
        df[f"{fuel}_prix"] = pd.to_numeric(df[f"{fuel}_prix"], errors="coerce")
        df[f"{fuel}_maj"] = pd.to_datetime(df[f"{fuel}_maj"], errors="coerce")

    return df
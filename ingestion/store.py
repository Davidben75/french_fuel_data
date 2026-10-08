import psycopg
import pandas as pd

FUELS = ["gazole", "sp95", "e10", "sp98", "e85", "gplc"]

# Database connection 
def get_connection(dsn: str):
    return psycopg.connect(dsn)

def upsert_station(cur, row):
    cur.execute(
        """
        INSERT INTO stations (id, adresse, cp, ville, location)
        VALUES (
            %s, %s, %s, %s,
            ST_SetSRID(
                ST_MakePoint(
                    split_part(%s, ',', 2)::float,
                    split_part(%s, ',', 1)::float
                ),
                4326
            )
        )
        ON CONFLICT (id) DO UPDATE SET
            adresse = EXCLUDED.adresse,
            cp = EXCLUDED.cp,
            ville = EXCLUDED.ville,
            location = EXCLUDED.location
        """,
        (row.id, row.adresse, row.cp, row.ville, row.geom, row.geom),
    )

def insert_prices(cur, row):
    for fuel in FUELS:
        price = getattr(row, f"{fuel}_prix")
        updated_at = getattr(row, f"{fuel}_maj")
        if pd.notna(price):  # on ignore les carburants non vendus, comme vu plus haut
            cur.execute(
                """
                INSERT INTO prices (station_id, fuel, price, updated_at)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (station_id, fuel, updated_at) DO NOTHING
                """,
                (row.id, fuel, price, updated_at),
            )

def store(df: pd.DataFrame, dsn: str):
    with get_connection(dsn) as conn:
        with conn.cursor() as cur:
            for row in df.itertuples():
                upsert_station(cur, row)
                insert_prices(cur, row)
        conn.commit()
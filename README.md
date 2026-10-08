# French Fuel Data — Fuel Prices in France

A portfolio project to fetch, store, and (soon) expose via API the fuel prices across France, using the French Ministry of Economy's open dataset.

## Current project status

✅ Containerized PostgreSQL + PostGIS database
✅ Working ingestion script (download → clean → store)
✅ 9,809 stations successfully synced
⬜ FastAPI backend
⬜ Frontend with map
⬜ Automation (cron)

## Data source

- **Dataset**: [Fuel prices in France - Instant feed - v2](https://data.economie.gouv.fr/explore/dataset/prix-des-carburants-en-france-flux-instantane-v2/)
- **Format used**: CSV export (lightest option, `;` separator)
- **Download URL**:
    ```
    https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/csv
    ```
- **Source update frequency**: check the dataset page before scheduling an automated sync.

## Architecture

```
french_fuel_data/
├── docker-compose.yml
├── init_db.sql              # PostGIS activation + table creation
├── .env                      # DATABASE_URL (not versioned)
├── .env.dev                  # Docker Compose variables (not versioned)
├── .env.example               # versioned template, no secrets
├── .gitignore
├── data/
│   └── raw/                  # downloaded CSVs (not versioned)
└── ingestion/
    ├── requirements.txt
    ├── download.py
    ├── clean.py
    ├── store.py
    ├── main.py
    └── notebooks/
        └── exploration.ipynb
```

## Database

### Container

- **Image**: `postgis/postgis:18-3.6-alpine` (PostgreSQL 18 + PostGIS 3.6)
- **Start it**: `docker compose --env-file .env.dev up -d`
- **Manual connection**:
    ```bash
    docker compose exec db_dev psql -U <DB_USER> -d <DB_NAME>
    ```

### Schema

**`stations` table** — one row per point of sale, `id` as primary key:

| Column   | Type                   | Description               |
| -------- | ---------------------- | ------------------------- |
| id       | INTEGER PRIMARY KEY    | unique station identifier |
| adresse  | TEXT                   | street address            |
| cp       | TEXT                   | postal code               |
| ville    | TEXT                   | city                      |
| location | GEOGRAPHY(POINT, 4326) | GPS coordinates (PostGIS) |

A `GIST` spatial index on `location` supports "nearby stations" queries.

**`prices` table** — multiple rows per station (one per fuel type, and eventually per date once price history builds up):

| Column     | Type      | Description                                |
| ---------- | --------- | ------------------------------------------ |
| station_id | INTEGER   | foreign key to `stations.id`               |
| fuel       | TEXT      | gazole, sp95, e10, sp98, e85, gplc         |
| price      | REAL      | fuel price                                 |
| updated_at | TIMESTAMP | last-updated date from the source (`_maj`) |
| fetched_at | TIMESTAMP | sync date (filled by default)              |

A `UNIQUE (station_id, fuel, updated_at)` constraint prevents duplicates if the script runs again before a price actually changes, and lets a clean price history build up over time.

### Why PostGIS

- `location` is a `GEOGRAPHY(POINT, 4326)` type, not two separate `lat`/`lon` columns: spatial functions (`ST_DWithin`, `ST_Distance`) combined with the `GIST` index make "stations within X km" queries fast and accurate — useful for the upcoming interactive map.
- `ST_AsGeoJSON` will later let the API return data already shaped for Leaflet/Mapbox, with no extra reshaping needed.

## Ingestion pipeline

The script follows a classic ETL pattern (Extract, Transform, Load), split into three independent modules:

1. **`download.py`** — downloads the day's CSV into `data/raw/`, skips re-downloading if it already exists.
2. **`clean.py`** — loads the CSV with pandas, keeps only the useful columns (`id`, `cp`, `adresse`, `ville`, `geom`, and the `_prix`/`_maj` pair for each fuel), converts types with `errors="coerce"` (missing values stay `NaN`/`NaT`, never artificially filled in).
3. **`store.py`** — connects to PostgreSQL via `psycopg`, upserts each station (`ON CONFLICT ... DO UPDATE`), builds the geographic point directly in SQL from the raw `geom` text (`"latitude, longitude"`) using `split_part` + `ST_MakePoint`, then inserts prices while skipping fuels the station doesn't sell (`NaN` value).

`main.py` chains all three steps and prints a summary (`"9809 stations synced"`).

### Decisions made along the way

- **`geom` kept as raw text**, converted into a point only at SQL insert time (not in pandas), to keep the cleaning step simple.
- **`NaN` values in `_prix`/`_maj` are never filled in**: a station that doesn't sell a given fuel simply has no row for it in `prices`, rather than a made-up value.
- **Prices are historized** (separate `prices` table, no wide columns on `stations`), to support price-evolution charts later on.

## Environment variables

See `.env.example` at the project root for the full list. In short:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db_name>
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
```

`DATABASE_URL` is read by `ingestion/main.py` (via `python-dotenv`), the other three by Docker Compose (via `.env.dev`).

## Running the ingestion manually

```bash
# 1. Start the database
docker compose --env-file .env.dev up -d

# 2. Activate the venv and install dependencies
source .venv/bin/activate
pip install -r ingestion/requirements.txt

# 3. Run the sync
cd ingestion
python main.py
```

## Useful checks in the database

```sql
SELECT COUNT(*) FROM stations;
SELECT id, ville, ST_AsText(location) FROM stations LIMIT 5;
SELECT fuel, COUNT(*) FROM prices GROUP BY fuel ORDER BY COUNT(*) DESC;
```

## Next steps

1. Automate the sync (cron or equivalent) to start building a price history.
2. Build the FastAPI backend (station, history, and statistics routes).
3. Frontend with a Leaflet map and fuel-type filters.
4. Deployment (backend, frontend, scheduled task).

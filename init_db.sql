CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY,
    adresse TEXT,
    cp TEXT,
    ville TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stations_location
    ON stations USING GIST (location);

CREATE TABLE IF NOT EXISTS prices (
    station_id INTEGER REFERENCES stations(id),
    fuel TEXT NOT NULL,
    price REAL,
    updated_at TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT now(),
    UNIQUE (station_id, fuel, updated_at)
);
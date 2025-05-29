-- Migration number: 0004
CREATE TABLE IF NOT EXISTS sensor_data (
    data_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL, -- UNIX timestamp
    "data" TEXT NOT NULL, -- JSON data
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE
);
-- Optional: Add index for faster lookups, especially on timestamp for time-series queries
-- CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_id_timestamp ON sensor_data (sensor_id, "timestamp" DESC);

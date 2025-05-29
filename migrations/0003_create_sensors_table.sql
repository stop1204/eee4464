-- Migration number: 0003
CREATE TABLE IF NOT EXISTS sensors (
    sensor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    sensor_type TEXT NOT NULL,
    sensor_name TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY (device_id) REFERENCES device(device_id) ON DELETE CASCADE
);
-- Optional: Add index for faster lookups
-- CREATE INDEX IF NOT EXISTS idx_sensor_device_id ON sensors (device_id);
-- CREATE INDEX IF NOT EXISTS idx_sensor_type ON sensors (sensor_type);

-- Migration number: 0002
CREATE TABLE IF NOT EXISTS device (
    device_id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT NOT NULL,
    device_type TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now'))
);
-- Optional: Add index for faster lookups if needed
-- CREATE INDEX IF NOT EXISTS idx_device_name ON device (device_name);
-- CREATE INDEX IF NOT EXISTS idx_device_type ON device (device_type);

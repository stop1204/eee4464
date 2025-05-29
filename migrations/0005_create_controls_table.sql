-- Migration number: 0005
CREATE TABLE IF NOT EXISTS controls (
    control_id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    control_type TEXT NOT NULL, -- e.g., 'button', 'slider', 'switch'
    control_name TEXT,
    state TEXT, -- e.g., 'on', 'off', '0-100'
    updated_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY (device_id) REFERENCES device(device_id) ON DELETE CASCADE
);
-- Optional: Add index for faster lookups
-- CREATE INDEX IF NOT EXISTS idx_control_device_id ON controls (device_id);

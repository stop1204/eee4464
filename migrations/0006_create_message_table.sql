-- Migration number: 0006
CREATE TABLE IF NOT EXISTS message (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_id INTEGER, -- Can be NULL if message is not directly tied to a control
    state TEXT,
    device_id INTEGER NOT NULL,
    from_source TEXT, -- e.g., 'web', 'device_serial_xyz', 'scheduler'
    created_at INTEGER NOT NULL, -- UNIX timestamp
    FOREIGN KEY (control_id) REFERENCES controls(control_id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES device(device_id) ON DELETE CASCADE
);
-- Optional: Add index for faster lookups
-- CREATE INDEX IF NOT EXISTS idx_message_created_at ON message (created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_message_device_id ON message (device_id);

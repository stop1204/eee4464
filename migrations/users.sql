
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    devices TEXT NOT NULL -- JSON array of device_id
);

-- Insert test users (in production, passwords should be properly hashed)
INSERT OR IGNORE INTO users (username, password_hash, devices)
VALUES 
  ('admin', 'admin123', '[]'), -- Admin with access to all devices (handled in code)
  ('user1', 'password1', '[1, 2, 3]'), -- User with access to specific devices
  ('user2', 'password2', '[4, 5]'); -- Another user with different device access

-- Note: In a production environment, you would use a proper password hashing algorithm
-- like bcrypt, scrypt, or Argon2 instead of storing plain text passwords

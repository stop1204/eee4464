# API Reference

This document describes the HTTP API exposed by the Cloudflare Worker. All endpoints return JSON unless otherwise noted. Timestamp values are Unix seconds.

## Endpoints

### `POST /api/login`
Authenticate a user.

**Request body**
```json
{
  "username": "user1",
  "password": "password123"
}
```
**Response**
```json
{
  "success": true,
  "token": "session_...",
  "username": "user1",
  "devices": [1,2,3]
}
```

### `POST /api/register`
Create a new user account.

Body fields: `username` and `password` (both required).

### `POST /api/change-password`
Change a user's password.

Body fields: `username`, `currentPassword`, `newPassword`.

### `POST /api/user/devices/add`
Associate a device ID with a user.

Body fields: `username`, `device_id`.

### `POST /api/user/devices/remove`
Remove a device ID from a user.

Body fields: `username`, `device_id`.

### `/api/device`
Manage device records.

- `GET /api/device?device_id=<id>&limit=20`
- `POST /api/device`
- `PUT /api/device?device_id=<id>`
- `DELETE /api/device?device_id=<id>`

Example `POST` body:
```json
{ "device_name": "ESP32", "device_type": "sensor" }
```

### `/api/sensors`
Manage sensor metadata.

- `GET /api/sensors?device_id=<id>&limit=20`
- `POST /api/sensors`
- `PUT /api/sensors?sensor_id=<id>`
- `DELETE /api/sensors?sensor_id=<id>`

### `/api/sensor_data`
Send or query sensor readings.

- `GET /api/sensor_data?sensor_id=<id>&start=<ts>&end=<ts>`
- `POST /api/sensor_data`
- `DELETE /api/sensor_data?sensor_id=<id>`

`POST` body example:
```json
{ "sensor_id": 1, "timestamp": 1716900000, "data": { "temp": 24.5 } }
```

### `/api/controls`
Read or modify device control states.

- `GET /api/controls?device_id=<id>`
- `POST /api/controls`
- `PUT /api/controls?control_id=<id>`
- `DELETE /api/controls?control_id=<id>`

### `/api/messages`
Message log used for debugging/device control history.

- `GET /api/messages?after=<ts>&limit=10`
- `POST /api/messages`

### `GET /`
Returns the dashboard HTML user interface.

## Notes
- Responses use standard HTTP status codes. On errors the JSON object contains `success: false` and a `message` field.
- No CORS headers are enabled by default. Add them if your sensors post from other origins.
- Timestamps are stored and returned as Unix seconds.
- For production deployments consider authentication headers or API keys. Rate limiting is recommended to protect the Worker.


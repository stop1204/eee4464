# Task 1: Project Overview

## 1. Cloudflare Worker Features and Data Flow
- The main entry point is the `fetch` function in `src/index.ts`, which dispatches requests to handlers such as `handleLogin` and `handleDevice` based on the path.
- All data access is performed via the Cloudflare D1 database (`env.DB`) using SQL statements. Tables include `device`, `sensors`, and `sensor_data`.
- The Worker exposes `/api/ingest_mqtt` and handles `pubsub` events to receive MQTT messages and store them in the database.
- Requests that don't match an API route return the built‑in front‑end page `site/index.html`.

## 2. Front-End Modules
- `site/index.html` contains the UI and JavaScript code with features such as:
  - Dashboard view using Chart.js to plot sensor data with time range and chart type options.
  - Switch/button controls that read and update device state through `/api/controls`, also logging to `/api/messages`.
  - MQTT integration allowing configuration of broker, topic, username, and password, dynamically creating widgets that display real-time messages.
  - Interfaces for user login/registration and device management.

## 3. Interaction with ESP32
- Devices can call HTTP APIs directly, e.g., POST to `/api/sensor_data` to upload readings or query `/api/controls` for commands.
- The dashboard can forward MQTT data via `/api/ingest_mqtt` or rely on Cloudflare Pub/Sub to process messages in the background.
- Earlier versions used WebSocket (later removed); the main interaction methods are now HTTP and MQTT.

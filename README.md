# EEE4464 IoT Dashboard

A lightweight IoT platform built with **Cloudflare Workers** and **D1**. It provides REST APIs and a web dashboard for managing devices, storing sensor data and sending control messages.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-template)

## Features
- Cloudflare Worker backend with a D1 database
- Real-time sensor ingestion via HTTP or MQTT
- Dashboard interface using Chart.js for data visualisation
- User login/registration and device management
- Endpoints for controls and message logging

## Directory Structure
```
./src        Worker TypeScript source
./site       Static frontend served by the Worker
./migrations SQL schema for the D1 database
./data       Example scripts and data plots
./docs       Architecture diagrams
```

## Requirements
- Node.js and npm
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI
- Access to Cloudflare D1

## Quick Start
1. Install dependencies
   ```bash
   npm install
   npm install -g wrangler
   wrangler login
   ```
2. Create a D1 database
   ```bash
   npx wrangler d1 create eee4464
   ```
   Update `wrangler.json` with the new `database_id` if necessary.
3. Apply migrations
   ```bash
   # npx wrangler d1 migrations apply eee4464 --remote
   npx wrangler d1 execute eee4464 --file=./migrations/0001_create_comments_table.sql --remote
   npx wrangler d1 execute eee4464 --file=./migrations/0002_create_device_table.sql --remote
   npx wrangler d1 execute eee4464 --file=./migrations/0003_create_sensors_table.sql --remote
   npx wrangler d1 execute eee4464 --file=./migrations/0004_create_sensor_data_table.sql --remote
   npx wrangler d1 execute eee4464 --file=./migrations/0005_create_controls_table.sql --remote
   npx wrangler d1 execute eee4464 --file=./migrations/0006_create_message_table.sql --remote
   npx wrangler d1 execute eee4464 --file=./migrations/users.sql --remote
   ```
4. Run locally
   ```bash
   npx wrangler dev
   ```
5. Deploy
   ```bash
   npx wrangler deploy
   ```

## Usage
The API responds with JSON. Example: posting a sensor reading
```bash
curl -X POST https://<your-worker>/api/sensor_data \
  -H 'Content-Type: application/json' \
  -d '{"device_id": "123", "sensor_type": "temperature", "value": 25.2}'
```
The front end is served at the Worker root URL and connects to these APIs.

## Screenshots / Examples
Plots generated from example data can be found in [`data/plots`](data/plots).

## FAQ
- **Where are the database tables defined?**  
  Migration files in [`migrations/`](migrations/) create the tables.
- **Why do I get `401` when calling an API?**  
  Ensure you have logged in and included the session token in your request headers.

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
Author: Terry He & Karen  
Email: <230263367@stu.vtc.edu.hk>

For detailed API endpoints see [API_REFERENCE.md](API_REFERENCE.md).

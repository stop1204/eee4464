# Task 3: Pull Request History Analysis

This repository contains multiple merged branches. The main PRs are summarized below:

1. **#1 feature/initial-project-refinement**
   - Aimed to reorganize the project and add migration scripts while updating documentation.
   - Solved issues with missing files and messy structure, introducing `migrations` scripts and a clearer README.

2. **#3 create-api_reference.md-and-update-readme.md**
   - Added an API reference describing the HTTP interfaces and improved the README for a more complete deployment guide.

3. **#6 codex/modify-index.html-to-integrate-mqtt-data**
   - Integrated real-time MQTT data in the dashboard and added Pub/Sub handling.
   - Subsequent PRs (#7 and #9) fixed certificate and parsing problems for MQTT connectivity.

4. **#7 codex/modify-index.html-to-integrate-mqtt-data (follow-up)**
   - Fixed MQTT credentials and dashboard issues to ensure the broker connection worked properly.

5. **#9 dswfic-codex/modify-index.html-to-integrate-mqtt-data**
   - Finalized MQTT parsing and display logic so the front end could reliably show JSON data.

### Main Issues Encountered
- **Dynamic device and sensor registration**: The initial version supported only fixed devices. Later API changes (`handleDevice`, `handleSensors`) added creation, deletion, and query functions with corresponding UI.
- **Switching from HTTP/WebSocket to MQTT**: Early attempts to use WebSocket (`add WebSocket support` commit) were removed due to reliability concerns. The project switched to Cloudflare Pub/Sub and the `ingest_mqtt` endpoint, while the front end uses MQTT.js directly.
- **Data sync and real-time updates**: Several PRs addressed MQTT connection and parsing, indicating challenges with broker authentication and inconsistent message formats.
- **Insufficient architectural planning**: Lacking an overall design, data processing methods had to be revised repeatedly to meet both front-end and device requirements.
- **Wrangler deployment limitations**: Node.js modules used during local development could not be deployed to Cloudflare Workers, requiring alternative implementations.

### Future Optimization Directions
- Unify device communication protocols, possibly relying solely on MQTT or HTTP to reduce complexity.
- Add authentication and permissions in device registration and management so only authorized devices can read/write data.
- If real-time monitoring is required, consider reintroducing WebSocket or long polling for more timely updates.
- Separate JS code from HTML and manage it in modules to ease maintenance.
- Enhance charting and automate data analysis to provide correlation insights.

# Cloudflare Worker IoT Dashboard with D1

This project is an IoT platform for managing devices, collecting and visualizing sensor data, and controlling device states, all powered by Cloudflare Workers and D1. It features a frontend dashboard for easy interaction.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-template) <!-- TODO: Update this deploy button URL if the template location changes -->

<!-- ![Worker + D1 Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/cb7cb0a9-6102-4822-633c-b76b7bb25900/public) -->
<!-- TODO: Add a new preview image relevant to the IoT dashboard -->

<!-- dash-content-start -->

D1 is Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/)). This project utilizes D1 to store device information, sensor readings, and control states. The Cloudflare Worker provides the API backend, and a web-based frontend allows for data visualization and device management.

The database schema is defined by several migration files in the `migrations/` directory, creating tables such as `device`, `sensors`, `sensor_data`, `controls`, and `message`.

> [!IMPORTANT]
> When using C3 to create this project (if applicable, this template might be used directly), select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](#setup-steps) before deploying.

<!-- dash-content-end -->

## TODO

*   Enhance charting options (e.g., real-time updates via WebSockets).
*   Implement user authentication for the dashboard.
*   Add more comprehensive API documentation (e.g., OpenAPI spec).
*   Refactor backend code for better modularity.
*   Improve error handling and user feedback in the frontend.

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```
npm create cloudflare@latest -- --template=YOUR_TEMPLATE_PATH_HERE # TODO: Update this if it becomes a C3 template
```

<!-- A live public deployment of this template is available at [https://d1-template.templates.workers.dev](https://d1-template.templates.workers.dev) -->
<!-- TODO: Update with the new deployment URL once available -->

## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   npm install -g wrangler
   wrangler login
   ```
2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) (e.g., "iot_dashboard_db"):
   ```bash
   npx wrangler d1 create iot_dashboard_db
   ```
   ...and update the `database_id` field in `wrangler.toml` (or `wrangler.json` if you are using that) with the new database ID.
   **Note:** The `database_name` in `wrangler.toml` should also match the name you choose (e.g., "iot_dashboard_db").
3. Run the database migrations to set up the complete schema. This project contains multiple migration files (from `0001_...` to `0006_...`) in the `migrations/` directory which will create all necessary tables (`device`, `sensors`, `sensor_data`, `controls`, `message`, etc.).
   ```bash
   npx wrangler d1 migrations apply iot_dashboard_db --remote
   ```
   (Use `--local` instead of `--remote` for local development if you have a local D1 setup).
4. Deploy the project!
   ```bash
   npx wrangler deploy
   ```
## Local Development
To run this project locally, you can use the `wrangler dev` command:

```bash
npx wrangler dev
```
or
```bash
wrangler dev --remote
```
This will start a local server that simulates the Worker environment, allowing you to test your Worker and D1 database interactions.
## License
This project is licensed under the [MIT License](lICENSE).
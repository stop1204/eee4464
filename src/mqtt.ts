import mqtt from 'mqtt';

const TOPICS = [
  'iot/temperature',
  'iot/humidity',
  'iot/moisture',
  'iot/pump',
  'iot/light',
  'iot/motion',
  'iot/heart_rate',
  'iot/current'
];

let client: mqtt.MqttClient | null = null;

export function initMqtt(env: Env, db: D1Database) {
  if (client) return;
  const url = env.MQTT_BROKER_URL;
  const username = env.MQTT_USERNAME;
  const password = env.MQTT_PASSWORD;
  client = mqtt.connect(url, { username, password });
  client.on('connect', () => {
    client?.subscribe(TOPICS);
  });
  client.on('message', async (topic, payload) => {
    await handleMessage(topic, payload.toString(), db);
  });
  client.on('error', err => console.error('MQTT error', err));
}

async function handleMessage(topic: string, payload: string, db: D1Database) {
  try {
    const data = JSON.parse(payload);
    const sensorType = topic.split('/')[1];
    let sensor = await db.prepare('SELECT sensor_id FROM sensors WHERE sensor_type = ? LIMIT 1').bind(sensorType).first();
    let sensorId = sensor?.sensor_id;
    if (!sensorId) {
      const insert = await db.prepare(
        'INSERT INTO sensors (device_id, sensor_type, sensor_name, created_at) VALUES (1, ?, ?, strftime(\'%s\',\'now\'))'
      ).bind(sensorType, sensorType).run();
      sensorId = insert.meta.last_row_id;
    }
    await db.prepare(
      'INSERT INTO sensor_data (sensor_id, data, timestamp) VALUES (?, ?, strftime(\'%s\',\'now\'))'
    ).bind(sensorId, JSON.stringify(data)).run();
  } catch (err) {
    console.error('Failed to handle MQTT message', err);
  }
}

export function publishPumpState(state: 'on' | 'off') {
  if (client && client.connected) {
    client.publish('iot/pump', JSON.stringify({ pump_state: state === 'on' ? 1 : 0 }));
  }
}

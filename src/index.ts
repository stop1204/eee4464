import { renderHtml } from './resp.js';

var __defProp = Object.defineProperty;
var __name = (target: (content: any) => string, value: string) => __defProp(target, "name", { value, configurable: true });


__name(renderHtml, "renderHtml");

// src/index.ts
var index_default = {
  async fetch(request: { url: string | URL; }, env: { DB: any; }) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const db = env.DB;

    if (pathname.startsWith('/api/device')) return handleDevice(request, db, searchParams);
    if (pathname.startsWith('/api/sensors')) return handleSensors(request, db, searchParams);
    if (pathname.startsWith('/api/sensor_data')) return handleSensorData(request, db, searchParams);
    if (pathname.startsWith('/api/controls')) return handleControls(request, db, searchParams);
    if (pathname.startsWith('/api/messages')) return handleMessages(request, db, searchParams);


    return new Response( renderHtml(), {
      headers: {
        "content-type": "text/html"
      }
    });
  }
};
export {
  index_default as default
};

// @ts-ignore
async function handleDevice(request, db, searchParams) {
  if (request.method === 'GET') {
    // allow filter by device_name, device_type, device_id
    const device_name = searchParams.get('device_name');
    const device_type = searchParams.get('device_type');
    const device_id = searchParams.get('device_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = 'SELECT * FROM device WHERE 1=1';
    let params = [];

    if (device_name) {
      query += ' AND device_name LIKE ?';
      params.push(`%${device_name}%`);
    }
    if (device_type) {
      query += ' AND device_type = ?';
      params.push(device_type);
    }
    if (device_id) {
      query += ' AND device_id = ?';
      params.push(device_id);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(res.results), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    // new device
    const { device_id, device_name, device_type } = await request.json();
    if (!device_name) return new Response('Missing device_name', { status: 400 });

    let insert;
    if (device_id !== undefined && device_id !== null) {
      insert = await db.prepare(
        'INSERT INTO device (device_id, device_name, device_type, created_at) VALUES (?, ?, ?, strftime("%s","now"))'
      ).bind(device_id, device_name, device_type).run();
    } else {
      insert = await db.prepare(
        'INSERT INTO device (device_name, device_type, created_at) VALUES (?, ?, strftime("%s","now"))'
      ).bind(device_name, device_type).run();
    }
    return new Response(JSON.stringify({ insertedId: insert.meta.last_row_id }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PUT') {

    // update device, need to specify device_id in query params (?device_id=xxx)
    const device_id = searchParams.get('device_id');
    if (!device_id) return new Response('Missing device_id', { status: 400 });

    const { device_name, device_type } = await request.json();

    const update = await db.prepare(
      'UPDATE device SET device_name = COALESCE(?, device_name), device_type = COALESCE(?, device_type) WHERE device_id = ?'
    ).bind(device_name, device_type, device_id).run();

    return new Response(JSON.stringify({ changes: update.changes }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
    // delete device, need to specify device_id in query params (?device_id=xxx)
    const device_id = searchParams.get('device_id');
    if (!device_id) return new Response('Missing device_id', { status: 400 });

    const del = await db.prepare('DELETE FROM device WHERE device_id = ?').bind(device_id).run();
    return new Response(JSON.stringify({ deleted: del.changes }), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405 });
}


// @ts-ignore
async function handleSensors(request, db, searchParams) {
  if (request.method === 'GET') {
    // allow filter by device_id, sensor_type
    const device_id = searchParams.get('device_id');
    const sensor_type = searchParams.get('sensor_type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = 'SELECT * FROM sensors WHERE 1=1';
    let params = [];

    if (device_id) {
      query += ' AND device_id = ?';
      params.push(device_id);
    }
    if (sensor_type) {
      query += ' AND sensor_type = ?';
      params.push(sensor_type);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(query).bind(...params).all();
    return json(res.results);
  }

  if (request.method === 'POST') {
    const { sensor_id,device_id, sensor_type, sensor_name } = await request.json();
    if (!device_id || !sensor_type) return text('Missing device_id or sensor_type', 400);

    let insert;
    if (sensor_id !== undefined && sensor_id !== null) {
      insert = await db.prepare(`
        INSERT INTO sensors (sensor_id, device_id, sensor_type, sensor_name, created_at)
        VALUES (?, ?, ?, ?, strftime('%s','now'))
      `).bind(sensor_id, device_id, sensor_type, sensor_name).run();
    } else {
      // if sensor_id is not provided, it will be auto-incremented
      insert = await db.prepare(`
        INSERT INTO sensors (device_id, sensor_type, sensor_name, created_at)
        VALUES (?, ?, ?, strftime('%s','now'))
      `).bind(device_id, sensor_type, sensor_name).run();
    }

    return json({ sensor_id: insert.meta.last_row_id });
  }

  if (request.method === 'PUT') {
    const sensor_id = searchParams.get('sensor_id');
    if (!sensor_id) return text('Missing sensor_id', 400);

    const { sensor_type, sensor_name } = await request.json();

    const update = await db.prepare(`
      UPDATE sensors SET
      sensor_type = COALESCE(?, sensor_type),
      sensor_name = COALESCE(?, sensor_name)
      WHERE sensor_id = ?
    `).bind(sensor_type, sensor_name, sensor_id).run();

    return json({ changes: update.changes });
  }

  if (request.method === 'DELETE') {
    const sensor_id = searchParams.get('sensor_id');
    if (!sensor_id) return text('Missing sensor_id', 400);

    const del = await db.prepare('DELETE FROM sensors WHERE sensor_id = ?').bind(sensor_id).run();
    return json({ deleted: del.changes });
  }
}
// @ts-ignore
async function handleSensorData(request, db, searchParams) {
  if (request.method === 'GET') {
    // allow filter by sensor_id, start, end, limit, offset
    const sensor_id = searchParams.get('sensor_id');
    const start = searchParams.get('start'); // UNIX时间戳
    const end = searchParams.get('end');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!sensor_id) return text('Missing sensor_id', 400);

    let query = 'SELECT * FROM sensor_data WHERE sensor_id = ?';
    let params = [sensor_id];

    if (start) {
      query += ' AND timestamp >= ?';
      params.push(start);
    }
    if (end) {
      query += ' AND timestamp <= ?';
      params.push(end);
    }
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(query).bind(...params).all();
    return json(res.results);
  }

  if (request.method === 'POST') {
    /*
      upload example：
      {
        sensor_id: 123,
        timestamp: 1684555200,
        data: { temperature: 24.5, humidity: 60, voltage: 3.3 }
      }
    */
    const body = await request.json();
    const { sensor_id, timestamp, data } = body;

    if (!sensor_id || !data) return text('Missing sensor_id or timestamp or data', 400);

    // if timestamp is not provided use current time

    let insert;
    if (!timestamp) {

      insert = await db.prepare(`
        INSERT INTO sensor_data (sensor_id, data, timestamp)
        VALUES (?,?,strftime('%s','now')
        )`).bind(sensor_id, JSON.stringify(data)).run();
    }else{
      insert = await db.prepare(`
        INSERT INTO sensor_data (sensor_id, timestamp, data)
        VALUES (?, ?, ?)
      `).bind(sensor_id, timestamp, JSON.stringify(data)).run();
    }

    return json({ data_id: insert.meta.last_row_id });
  }

  // put and delete methods can be implemented as needed, generally POST is used for uploading data, and GET is used for querying
}
// @ts-ignore
async function handleControls(request, db, searchParams) {
  if (request.method === 'GET') {
    const device_id = searchParams.get('device_id');
    if (!device_id) return text('Missing device_id', 400);

    const res = await db.prepare('SELECT * FROM controls WHERE device_id = ? ORDER BY updated_at DESC').bind(device_id).all();
    return json(res.results);
  }

  if (request.method === 'POST') {
    /*
      example：
      {
        device_id: 1,
        control_type: "button",
        control_name: "light_switch",
        state: "on"
      }
    */
    const { device_id, control_id , control_type, control_name, state } = await request.json();
    if (!device_id || !control_id || !control_type) return text('Missing device_id or control_type', 400);

    const insert = await db.prepare(`
      INSERT INTO controls (device_id, control_type, control_name, state, updated_at,control_id)
      VALUES (?, ?, ?, ?, strftime('%s','now'),?)
    `).bind(device_id, control_type, control_name, state,control_id).run();

    return json({ control_id: insert.meta.last_row_id });
  }

  if (request.method === 'PUT') {
    const control_id = searchParams.get('control_id');
    if (!control_id) return text('Missing control_id', 400);

    const { state } = await request.json();

    const update = await db.prepare(`
      UPDATE controls SET state = ?, updated_at = strftime('%s','now')
      WHERE control_id = ?
    `).bind(state, control_id).run();

    return json({ changes: update.changes });
  }

  if (request.method === 'DELETE') {
    const control_id = searchParams.get('control_id');
    if (!control_id) return text('Missing control_id', 400);

    const del = await db.prepare('DELETE FROM controls WHERE control_id = ?').bind(control_id).run();
    return json({ deleted: del.changes });
  }
}

// @ts-ignore
async function handleMessages(request, db, searchParams) {
  if (request.method === 'GET') {
    // pull messages after a certain timestamp, default 10
    const after = Number(searchParams.get('after')) || 0;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    const res = await db.prepare(
        'SELECT * FROM message WHERE created_at > ? ORDER BY created_at ASC LIMIT ?'
    ).bind(after, limit).all();

    return json(res.results);
  }

  if (request.method === 'POST') {
    // write a message
    const body = await request.json();
    const { control_id, state, device_id, from_source } = body;
    if (!control_id || !state || !device_id || !from_source) {
      return text('Missing fields', 400);
    }
    const created_at = Math.floor(Date.now() / 1000); // current timestamp
    const insert = await db.prepare(`
      INSERT INTO message (control_id, state, device_id, from_source, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(control_id, state, device_id, from_source, created_at).run();

    return json({ message_id: insert.meta.last_row_id });
  }

  return text('Method Not Allowed', 405);
}
// @ts-ignore
function json(obj) {
  return new Response(JSON.stringify(obj), { headers: { 'Content-Type': 'application/json' } });
}
// @ts-ignore
function text(msg, status = 200) {
  return new Response(msg, { status, headers: { 'Content-Type': 'text/plain' } });
}
import { renderHtml } from './resp.js';
var __defProp = Object.defineProperty;
var __name = (target: (content: any) => string, value: string) => __defProp(target, "name", { value, configurable: true });


__name(renderHtml, "renderHtml");

// src/index.ts
var index_default = {
  async fetch(request: { url: string | URL; }, env: { DB: any; }) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const db = env.DB; // 你的 D1 绑定名，确保已绑定

    if (pathname.startsWith('/api/device')) return handleDevice(request, db, searchParams);
    if (pathname.startsWith('/api/sensors')) return handleSensors(request, db, searchParams);
    if (pathname.startsWith('/api/sensor_data')) return handleSensorData(request, db, searchParams);
    if (pathname.startsWith('/api/controls')) return handleControls(request, db, searchParams);


    // return new Response('Not Found', { status: 404 });



    const stmt = db.prepare("SELECT * FROM sensor_data LIMIT 3");
    const { results } = await stmt.all();
    return new Response( renderHtml(JSON.stringify(results, null, 2)), {
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
    // 支持分页和筛选 device_name、device_type
    const device_name = searchParams.get('device_name');
    const device_type = searchParams.get('device_type');
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
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(res.results), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    // 新增设备
    const { device_name, device_type } = await request.json();
    if (!device_name) return new Response('Missing device_name', { status: 400 });

    const insert = await db.prepare(
      'INSERT INTO device (device_name, device_type, created_at) VALUES (?, ?, strftime("%s","now"))'
    ).bind(device_name, device_type).run();
    console.log('Insert result:');
    return new Response(JSON.stringify({ insertedId: insert.meta.last_row_id }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PUT') {
    // 更新设备，需通过 ?device_id=xxx 指定ID
    const device_id = searchParams.get('device_id');
    if (!device_id) return new Response('Missing device_id', { status: 400 });

    const { device_name, device_type } = await request.json();

    const update = await db.prepare(
      'UPDATE device SET device_name = COALESCE(?, device_name), device_type = COALESCE(?, device_type) WHERE device_id = ?'
    ).bind(device_name, device_type, device_id).run();

    return new Response(JSON.stringify({ changes: update.changes }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
    // 删除设备，需通过 ?device_id=xxx 指定ID
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
    // 支持分页和筛选 device_id, sensor_type
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
    const { device_id, sensor_type, sensor_name } = await request.json();
    if (!device_id || !sensor_type) return text('Missing device_id or sensor_type', 400);

    const insert = await db.prepare(`
      INSERT INTO sensors (device_id, sensor_type, sensor_name, created_at)
      VALUES (?, ?, ?, strftime('%s','now'))
    `).bind(device_id, sensor_type, sensor_name).run();

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
    // 支持分页、时间区间和传感器筛选
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
      传感器数据上传示例格式：
      {
        sensor_id: 123,
        timestamp: 1684555200,
        data: { temperature: 24.5, humidity: 60, voltage: 3.3 }
      }
    */
    const body = await request.json();
    const { sensor_id, timestamp, data } = body;

    if (!sensor_id || !timestamp || !data) return text('Missing sensor_id or timestamp or data', 400);

    const insert = await db.prepare(`
      INSERT INTO sensor_data (sensor_id, timestamp, data)
      VALUES (?, ?, ?)
    `).bind(sensor_id, timestamp, JSON.stringify(data)).run();

    return json({ data_id: insert.meta.last_row_id });
  }

  // PUT和DELETE可视需求实现，一般上传数据多用POST，查询用GET
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
      控制命令格式示例：
      {
        device_id: 1,
        control_type: "button",
        control_name: "light_switch",
        state: "on"
      }
    */
    const { device_id, control_type, control_name, state } = await request.json();
    if (!device_id || !control_type) return text('Missing device_id or control_type', 400);

    const insert = await db.prepare(`
      INSERT INTO controls (device_id, control_type, control_name, state, updated_at)
      VALUES (?, ?, ?, ?, strftime('%s','now'))
    `).bind(device_id, control_type, control_name, state).run();

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
function json(obj) {
  return new Response(JSON.stringify(obj), { headers: { 'Content-Type': 'application/json' } });
}
// @ts-ignore
function text(msg, status = 200) {
  return new Response(msg, { status, headers: { 'Content-Type': 'text/plain' } });
}
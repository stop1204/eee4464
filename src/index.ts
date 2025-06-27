import { renderHtml } from './resp.js';


var __defProp = Object.defineProperty;
var __name = (target: (content: any) => string, value: string) => __defProp(target, "name", { value, configurable: true });

__name(renderHtml, "renderHtml");

// Helper for SHA-256 Hashing
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// @ts-ignore
__name(sha256, "sha256");

// src/index.ts
var index_default = {
  async fetch(request: Request, env: { DB: D1Database; }, _ctx: ExecutionContext) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const db = env.DB;


    if (pathname.startsWith('/api/login')) return handleLogin(request, db);
    if (pathname.startsWith('/api/register')) return handleRegister(request, db);
    if (pathname.startsWith('/api/change-password')) return handleChangePassword(request, db);
    if (pathname.startsWith( '/api/user/devices/add')) return handleAddDeviceToUser(request, db);
    if (pathname.startsWith( '/api/user/devices/remove')) return handleRemoveDeviceFromUser(request, db);
    if (pathname.startsWith('/api/device')) return handleDevice(request, db, searchParams);
    if (pathname.startsWith('/api/sensors')) return handleSensors(request, db, searchParams);
    if (pathname.startsWith('/api/sensor_data')) return handleSensorData(request, db, searchParams);
    if (pathname.startsWith('/api/controls')) return handleControls(request, db, searchParams);
    if (pathname.startsWith('/api/messages')) return handleMessages(request, db, searchParams);

    return new Response(renderHtml(), {
      headers: {
        "content-type": "text/html"
      }
    });
  }
};
export {
  index_default as default
};

// Add device to user's devices list
async function handleAddDeviceToUser(request: Request, db: D1Database) {
  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  try {
    // @ts-ignore
    const { username, device_id } = await request.json();
    
    if (!username || !device_id) {
      return json({ success: false, message: 'Username and device_id are required' }, 400);
    }
    
    // Validate device_id format (numeric 3-20 characters)
    if (!/^\d{3,20}$/.test(device_id.toString())) {
      return json({ success: false, message: 'Device ID must be 3-20 digits' }, 400);
    }
    
    // Check if user exists
    const user = await db.prepare('SELECT user_id, devices FROM users WHERE username = ?')
      .bind(username)
      .first();
      
    if (!user) {
      return json({ success: false, message: 'User not found' }, 404);
    }
    
    // Parse existing devices
    let devices = [];
    try {
      devices = JSON.parse(user.devices as string || '[]');
      if (!Array.isArray(devices)) {
        devices = [];
      }
    } catch (e) {
      console.error('Failed to parse devices:', e);
      devices = [];
    }
    
    // Check if device is already in the list
    const deviceStr = device_id.toString();
    if (devices.includes(deviceStr)) {
      return json({ 
        success: true, 
        message: 'Device ID already assigned to this user', 
        devices: devices 
      });
    }
    
    // Add device to the list
    devices.push(deviceStr);
    
    // Update user's devices
    const result = await db.prepare('UPDATE users SET devices = ? WHERE username = ?')
      .bind(JSON.stringify(devices), username)
      .run();
      
    if (result.success) {
      return json({ 
        success: true, 
        message: 'Device added successfully', 
        devices: devices 
      });
    } else {
      return json({ success: false, message: 'Failed to update user devices' }, 500);
    }
  } catch (error) {
    console.error('Error in handleAddDeviceToUser:', error);
    return json({ success: false, message: 'An error occurred' }, 500);
  }
}

// Remove device from user's devices list
async function handleRemoveDeviceFromUser(request: Request, db: D1Database) {
  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  try {
    // @ts-ignore
    const { username, device_id } = await request.json();
    
    if (!username || !device_id) {
      return json({ success: false, message: 'Username and device_id are required' }, 400);
    }
    
    // Check if user exists
    const user = await db.prepare('SELECT user_id, devices FROM users WHERE username = ?')
      .bind(username)
      .first();
      
    if (!user) {
      return json({ success: false, message: 'User not found' }, 404);
    }
    
    // Parse existing devices
    let devices = [];
    try {
      devices = JSON.parse(user.devices as string || '[]');
      if (!Array.isArray(devices)) {
        devices = [];
      }
    } catch (e) {
      console.error('Failed to parse devices:', e);
      devices = [];
    }
    
    // Convert to string for consistent comparison
    const deviceStr = device_id.toString();
    
    // Check if device is in the list
    const index = devices.indexOf(deviceStr);
    if (index === -1) {
      return json({ 
        success: true, 
        message: 'Device ID was not assigned to this user', 
        devices: devices 
      });
    }
    
    // Remove device from the list
    devices.splice(index, 1);
    
    // Update user's devices
    const result = await db.prepare('UPDATE users SET devices = ? WHERE username = ?')
      .bind(JSON.stringify(devices), username)
      .run();
      
    if (result.success) {
      return json({ 
        success: true,
        message: 'Device removed successfully', 
        devices: devices 
      });
    } else {
      return json({ success: false, message: 'Failed to update user devices' }, 500);
    }
  } catch (error) {
    console.error('Error in handleRemoveDeviceFromUser:', error);
    return json({ success: false, message: 'An error occurred' }, 500);
  }
}

async function handleRegister(request: Request, db: D1Database) {
  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  try {
    // @ts-ignore
    const { username, password } = await request.json();

    if (!username || !password) {
      return json({ success: false, message: 'Username and password are required.' }, 400);
    }

    // Basic validation (can be expanded)
    if (username.length < 3) {
        return json({ success: false, message: 'Username must be at least 3 characters long.' }, 400);
    }
    if (password.length < 6) {
        return json({ success: false, message: 'Password must be at least 6 characters long.' }, 400);
    }

    // Check if username already exists
    const existingUser = await db.prepare('SELECT user_id FROM users WHERE username = ?').bind(username).first();
    if (existingUser) {
      return json({ success: false, message: 'Username already taken.' }, 409); // 409 Conflict
    }

    const passwordHash = await sha256(password);
    const defaultDevices = '[]'; // New users start with no devices

    const result = await db.prepare(
      'INSERT INTO users (username, password_hash, devices) VALUES (?, ?, ?)'
    ).bind(username, passwordHash, defaultDevices).run();

    if (result.success) {
      return json({ success: true, message: 'User registered successfully.' });
    } else {
      console.error('Registration DB error:', result.error);
      return json({ success: false, message: 'Registration failed. Please try again.' }, 500);
    }

  } catch (error) {
    console.error('Registration error:', error);
    // @ts-ignore
    if (error.message && error.message.includes("UNIQUE constraint failed: users.username")) {
        return json({ success: false, message: 'Username already taken.' }, 409);
    }
    return json({ success: false, message: 'An internal error occurred during registration.' }, 500);
  }
}
// @ts-ignore
__name(handleRegister, "handleRegister");

async function handleLogin(request: Request, db: D1Database) {
  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  try {
    // @ts-ignore
    const { username, password } = await request.json();

    if (!username || !password) {
      return json({ success: false, message: 'Username and password are required.' }, 400);
    }

    const userQuery = await db.prepare('SELECT user_id, username, password_hash, devices FROM users WHERE username = ?').bind(username).first();

    if (!userQuery) {
      return json({ success: false, message: 'Invalid username or password.' }, 401);
    }
    
    const storedHash = userQuery.password_hash as string;
    const userDevices = userQuery.devices as string;

    const inputPasswordHash = await sha256(password);

    if (inputPasswordHash !== storedHash) {
      return json({ success: false, message: 'Invalid username or password.' }, 401);
    }

    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    let parsedDevices = [];
    try {
        parsedDevices = JSON.parse(userDevices);
        if (!Array.isArray(parsedDevices)) {
            console.error("User devices field is not a valid JSON array:", userDevices);
            parsedDevices = [];
        }
    } catch (e) {
        console.error("Failed to parse user devices JSON:", e, userDevices);
        parsedDevices = [];
    }

    return json({ success: true, token, username: userQuery.username, devices: parsedDevices });

  } catch (error) {
    console.error('Login error:', error);
    return json({ success: false, message: 'An internal error occurred.' }, 500);
  }
}
// @ts-ignore
__name(handleLogin, "handleLogin");

async function handleChangePassword(request: Request, db: D1Database) {
  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  try {
    // @ts-ignore
    const { username, currentPassword, newPassword } = await request.json();

    if (!username || !currentPassword || !newPassword) {
      return json({ 
        success: false, 
        message: 'Username, current password, and new password are required.' 
      }, 400);
    }

    // Basic validation for new password
    if (newPassword.length < 6) {
      return json({ 
        success: false, 
        message: 'New password must be at least 6 characters long.' 
      }, 400);
    }

    // Get user from database
    const user = await db.prepare('SELECT user_id, password_hash FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (!user) {
      return json({ success: false, message: 'User not found.' }, 404);
    }

    // Verify current password
    const currentPasswordHash = await sha256(currentPassword);
    if (currentPasswordHash !== user.password_hash) {
      return json({ success: false, message: 'Current password is incorrect.' }, 401);
    }

    // Hash new password
    const newPasswordHash = await sha256(newPassword);

    // Update password in the database
    const updateResult = await db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
      .bind(newPasswordHash, username)
      .run();

    if (updateResult.success) {
      return json({ 
        success: true, 
        message: 'Password changed successfully.' 
      });
    } else {
      return json({ 
        success: false, 
        message: 'Failed to update password. Please try again.' 
      }, 500);
    }

  } catch (error) {
    console.error('Password change error:', error);
    return json({ 
      success: false, 
      message: 'An internal error occurred while changing the password.' 
    }, 500);
  }
}
// @ts-ignore
__name(handleChangePassword, "handleChangePassword");

// @ts-ignore
async function handleDevice(request, db, searchParams) {
  if (request.method === 'GET') {
    const device_name = searchParams.get('device_name');
    const device_type = searchParams.get('device_type');
    const device_id_single = searchParams.get('device_id');
    const device_ids_plural = searchParams.get('device_ids');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = 'SELECT * FROM device WHERE 1=1';
    let params: any[] = [];

    if (device_ids_plural) {
        const ids = device_ids_plural.split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id !== '');
        if (ids.length > 0) {
            query += ` AND device_id IN (${ids.map(() => '?').join(',')})`;
            params.push(...ids);
        } else {
            return json([]);
        }
    } else if (device_id_single) {
        query += ' AND device_id = ?';
        params.push(device_id_single);
    } else {
        if (device_name) {
            query += ' AND device_name LIKE ?';
            params.push(`%${device_name}%`);
        }
        if (device_type) {
            query += ' AND device_type = ?';
            params.push(device_type);
        }
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(res.results), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
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
    const device_id = searchParams.get('device_id');
    if (!device_id) return new Response('Missing device_id', { status: 400 });

    const { device_name, device_type } = await request.json();

    const update = await db.prepare(
      'UPDATE device SET device_name = COALESCE(?, device_name), device_type = COALESCE(?, device_type) WHERE device_id = ?'
    ).bind(device_name, device_type, device_id).run();

    return new Response(JSON.stringify({ changes: update.changes }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'DELETE') {
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
    const { sensor_id, device_id, sensor_type, sensor_name } = await request.json();
    if (!device_id || !sensor_type) return text('Missing device_id or sensor_type', 400);

    let insert;
    if (sensor_id !== undefined && sensor_id !== null) {
      insert = await db.prepare(`
        INSERT INTO sensors (sensor_id, device_id, sensor_type, sensor_name, created_at)
        VALUES (?, ?, ?, ?, strftime('%s','now'))
      `).bind(sensor_id, device_id, sensor_type, sensor_name).run();
    } else {
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
    const sensor_id = searchParams.get('sensor_id');
    const start = searchParams.get('start');
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
    const body = await request.json();
    const { sensor_id, timestamp, data } = body;

    if (!sensor_id || !data) return text('Missing sensor_id or timestamp or data', 400);

    let insert;
    let data_json;

    if (typeof data === 'string') {
      try {
        data_json = JSON.parse(data.replace(/\"{/g, '{').replace(/}\"/g, '}').replace(/\\"/g, '"'));
      } catch (e) {
        return text('Invalid data format', 400);
      }
    }
    if (typeof data === 'object') {
      data_json = data;
    }
    if (!timestamp) {
      insert = await db.prepare(`
        INSERT INTO sensor_data (sensor_id, data, timestamp)
        VALUES (?,?,strftime('%s','now')
        )`).bind(sensor_id, JSON.stringify(data_json)).run();
    } else {
      insert = await db.prepare(`
        INSERT INTO sensor_data (sensor_id, timestamp, data)
        VALUES (?, ?, ?)
      `).bind(sensor_id, timestamp, JSON.stringify(data_json)).run();
    }

    return json({ data_id: insert.meta.last_row_id });
  }

  if (request.method === 'DELETE') {
    const sensor_id = searchParams.get('sensor_id');
    if (!sensor_id) return text('Missing sensor_id or timestamp', 400);

    const del = await db.prepare('DELETE FROM sensor_data WHERE sensor_id = ?').bind(sensor_id).run();
    return json({ deleted: del.changes });
  }
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
    let { device_id, control_id, control_type, control_name, state } = await request.json();
    if (!device_id || !control_id || !control_type) return text('Missing device_id or control_type', 400);

    // Convert control_id to number if possible
    if (/^\d+$/.test(control_id)) control_id = Number(control_id);

    const insert = await db.prepare(`
      INSERT INTO controls (device_id, control_type, control_name, state, updated_at, control_id)
      VALUES (?, ?, ?, ?, strftime('%s','now'), ?)
    `).bind(device_id, control_type, control_name, state, control_id).run();

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
    const after = Number(searchParams.get('after')) || 0;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    const res = await db.prepare(
        'SELECT * FROM message WHERE created_at > ? ORDER BY created_at ASC LIMIT ?'
    ).bind(after, limit).all();

    return json(res.results);
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const { control_id, state, device_id, from_source } = body;
    if (!control_id || !state || !device_id || !from_source) {
      return text('Missing fields', 400);
    }
    const created_at = Math.floor(Date.now() / 1000);
    const insert = await db.prepare(`
      INSERT INTO message (control_id, state, device_id, from_source, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(control_id, state, device_id, from_source, created_at).run();

    return json({ message_id: insert.meta.last_row_id });
  }

  return text('Method Not Allowed', 405);
}

// @ts-ignore
function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
// @ts-ignore
__name(json, "json");

// @ts-ignore
function text(msg: string, status = 200) {
  return new Response(msg, { status, headers: { 'Content-Type': 'text/plain' } });
}
// @ts-ignore
__name(text, "text");


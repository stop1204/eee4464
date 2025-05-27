
function _2_renderHtml(content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>D1 IoT Dashboard</title>
      <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        select, button { margin: 5px 0; padding: 5px; }
        #sensorDataChart { max-width: 700px; height: 300px; }
        .controls { margin-top: 20px; }
        .control-btn { margin-right: 10px; padding: 10px 20px; }
      </style>
    </head>
    <body>
      <header>
        <img src="https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/30e0d3f6-6076-40f8-7abb-8a7676f83c00/public" alt="Logo" />
        <h1>🎉 D1 IoT Dashboard</h1>
      </header>
      <main>
        <div>
          <label for="deviceSelect">Select Device:</label><br/>
          <select id="deviceSelect"><option>Loading...</option></select>
        </div>
        <div>
          <label for="sensorSelect">Select Sensor:</label><br/>
          <select id="sensorSelect"><option>Select device first</option></select>
        </div>
        <canvas id="sensorDataChart"></canvas>
        <div class="controls">
          <h3>Controls</h3>
          <div id="controlButtons">Select device to load controls</div>
        </div>
      </main>
  
      <script>
        const deviceSelect = document.getElementById('deviceSelect');
        const sensorSelect = document.getElementById('sensorSelect');
        const controlButtonsDiv = document.getElementById('controlButtons');
        const ctx = document.getElementById('sensorDataChart').getContext('2d');
        let chart;
  
        async function fetchDevices() {
          const res = await fetch('/api/device?limit=100');
          const devices = await res.json();
          deviceSelect.innerHTML = '<option value="">--Select Device--</option>' + devices.map(d => \`<option value="\${d.device_id}">\${d.device_name}</option>\`).join('');
        }
  
        async function fetchSensors(deviceId) {
          if (!deviceId) {
            sensorSelect.innerHTML = '<option>Select device first</option>';
            return;
          }
          const res = await fetch(\`/api/sensors?device_id=\${deviceId}&limit=100\`);
          const sensors = await res.json();
          if (sensors.length === 0) {
            sensorSelect.innerHTML = '<option>No sensors found</option>';
            return;
          }
          sensorSelect.innerHTML = '<option value="">--Select Sensor--</option>' + sensors.map(s => \`<option value="\${s.sensor_id}">\${s.sensor_type} (\${s.sensor_name || 'Unnamed'})</option>\`).join('');
        }
  
        async function fetchSensorData(sensorId) {
          if (!sensorId) {
            updateChart([]);
            return;
          }
          const now = Math.floor(Date.now() / 1000);
          const start = now - 3600 * 24; // 最近24小时
          const res = await fetch(\`/api/sensor_data?sensor_id=\${sensorId}&start=\${start}&end=\${now}&limit=1000\`);
          const data = await res.json();
  
          // data格式: [{timestamp, data: '{"temperature":24.5, ...}'}, ...]
          // 抽取时间和首个数据字段绘图
          if (data.length === 0) {
            updateChart([]);
            return;
          }
          const labels = data.map(d => new Date(d.timestamp * 1000).toLocaleString()).reverse();
          // 解析JSON取第一个key的数据
          const firstKey = Object.keys(JSON.parse(data[0].data))[0];
          const values = data.map(d => JSON.parse(d.data)[firstKey]).reverse();
  
          updateChart(labels, values, firstKey);
        }
  
        function updateChart(labels = [], values = [], labelName = '') {
          if (chart) chart.destroy();
          chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{
                label: labelName || 'Sensor Data',
                data: values,
                borderColor: 'rgba(14, 131, 143, 0.8)',
                backgroundColor: 'rgba(14, 131, 143, 0.3)',
                fill: true,
                tension: 0.3,
                pointRadius: 2,
              }]
            },
            options: {
              scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: labelName } }
              }
            }
          });
        }
  
        async function fetchControls(deviceId) {
          if (!deviceId) {
            controlButtonsDiv.innerHTML = 'Select device to load controls';
            return;
          }
          const res = await fetch(\`/api/controls?device_id=\${deviceId}\`);
          const controls = await res.json();
          if (controls.length === 0) {
            controlButtonsDiv.innerHTML = 'No controls found';
            return;
          }
  
          controlButtonsDiv.innerHTML = '';
          controls.forEach(c => {
            const btn = document.createElement('button');
            btn.textContent = \`\${c.control_name || c.control_type}: \${c.state || 'off'}\`;
            btn.className = 'control-btn';
            btn.onclick = async () => {
              // 简单示例，开关状态切换
              const newState = (c.state === 'on') ? 'off' : 'on';
              const res = await fetch('/api/controls?control_id=' + c.control_id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: newState })
              });
              if (res.ok) {
                c.state = newState;
                btn.textContent = \`\${c.control_name || c.control_type}: \${newState}\`;
              } else {
                alert('Failed to update control');
              }
            };
            controlButtonsDiv.appendChild(btn);
          });
        }
  
        // 事件绑定
        deviceSelect.addEventListener('change', async () => {
          const deviceId = deviceSelect.value;
          await fetchSensors(deviceId);
          await fetchControls(deviceId);
          updateChart();
        });
  
        sensorSelect.addEventListener('change', () => {
          fetchSensorData(sensorSelect.value);
        });
  
        // 初始化
        fetchDevices();
        updateChart();
      </script>
    </body>
    </html>
    `;
  }
  
  // src/renderHtml.ts
  function _1_renderHtml(content) {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>D1</title>
          <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
        </head>
      
        <body>
          <header>
            <img
              src="https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/30e0d3f6-6076-40f8-7abb-8a7676f83c00/public"
            />
            <h1>\u{1F389} Successfully connected d1-template to D1</h1>
          </header>
          <main>
            <p>Your D1 Database contains the following data:</p>
            <pre><code><span style="color: #0E838F">&gt; </span>SELECT * FROM comments LIMIT 3;<br>${content}</code></pre>
            <small class="blue">
              <a target="_blank" href="https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/">Build a comments API with Workers and D1</a>
            </small>
          </main>
        </body>
      </html>
  `;
  }



  export  function renderHtml(s: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>EEE4464 IoT Dashboard</title>
      <link rel="stylesheet" href="https://static.integrations.cloudflare.com/styles.css" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #f5f7fa; }
        header { padding: 10px 20px; background: #0e838f; color: white; }
        header h1 { margin: 0; font-weight: 700; }
        nav { display: flex; border-bottom: 2px solid #ddd; background: white; }
        nav button {
          flex: 1; padding: 15px; border: none; background: #eee; cursor: pointer; font-weight: 600;
          transition: background-color 0.3s ease;
        }
        nav button.active, nav button:hover {
          background: #0e838f; color: white; box-shadow: 0 4px 10px rgba(14,131,143,.5);
        }
        main { padding: 20px; }
        .tab-content { display: none; animation: fadeIn 0.5s ease forwards; }
        .tab-content.active { display: block; }
        @keyframes fadeIn {
          from {opacity:0; transform: translateY(20px);}
          to {opacity:1; transform: translateY(0);}
        }
  
        /* Widget布局 */
        #widgetContainer {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .widget {
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.1);
          position: relative;
          transition: transform 0.2s ease;
        }
        .widget:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(14,131,143,0.4);
        }
        .widget .closeBtn {
          position: absolute;
          top: 8px; right: 8px;
          background: #e74c3c;
          border: none;
          border-radius: 50%;
          width: 22px; height: 22px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        .widget .closeBtn:hover {
          opacity: 1;
        }
  
        /* 按钮组 */
        .btn-group button {
          padding: 8px 15px;
          margin: 0 3px 10px 0;
          border: none;
          background: #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-group button.active, .btn-group button:hover {
          background: #0e838f;
          color: white;
        }
  
        /* 选择框 */
        select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
        }
  
      </style>
    </head>
    <body>
      <header>
        <h1>🌟 EEE4464 IoT Dashboard</h1>
      </header>
  
      <nav>
        <button class="tabBtn active" data-tab="dashboard">Dashboard</button>
        <button class="tabBtn" data-tab="widgets">Widgets</button>
        <button class="tabBtn" data-tab="settings">Settings</button>
        <button class="tabBtn" data-tab="test">Test</button>
      </nav>
  
      <main>
        <!-- Dashboard Tab -->
        <div style="margin:10px 0;">
            <label><input type="checkbox" id="autoRefreshCheckbox" /> 自动刷新</label>
            <input type="number" id="autoRefreshInterval" value="1" min="1" style="width:60px;" /> 秒
        </div>
        <section id="dashboard" class="tab-content active">
          <div>
            <label>选择设备:</label><br />
            <select id="deviceSelect"><option>加载中...</option></select>
          </div>
          <div>
            <label>选择传感器 (可多选):</label><br />
            <select id="sensorSelect" multiple size="5"></select>
          </div>
          <div class="btn-group" id="timeRangeButtons">
            <button data-range="hour" class="active">小时</button>
            <button data-range="day">日</button>
            <button data-range="week">周</button>
            <button data-range="month">月</button>
            <button data-range="year">年</button>
          </div>
          <div>
            <label>选择图表类型:</label><br />
            <select id="chartTypeSelect">
              <option value="line" selected>折线图</option>
              <option value="bar">柱状图</option>
              <option value="pie">饼图</option>
              <option value="doughnut">环形图</option>
              <option value="radar">雷达图</option>
            </select>
          </div>
          <canvas id="sensorDataChart" width="800" height="400" style="max-width: 800px; height: 400px;"></canvas>
        </section>
  
        <!-- Widgets Tab -->
        <section id="widgets" class="tab-content">
          <button id="addWidgetBtn">添加状态控件 Widget</button>
          <div id="widgetContainer"></div>
        </section>
  
        <!-- Settings Tab -->
        <section id="settings" class="tab-content">
          <h2>用户设置</h2>
          <p>当前设置保存在浏览器本地 <code>localStorage</code>，不会跨设备同步。</p>
          <label>默认时间范围:</label>
          <select id="defaultTimeRangeSelect">
            <option value="hour">小时</option>
            <option value="day">日</option>
            <option value="week">周</option>
            <option value="month">月</option>
            <option value="year">年</option>
          </select>
          <br/>
          <label>默认图表类型:</label>
          <select id="defaultChartTypeSelect">
            <option value="line">折线图</option>
            <option value="bar">柱状图</option>
            <option value="pie">饼图</option>
            <option value="doughnut">环形图</option>
            <option value="radar">雷达图</option>
          </select>
          <br/><br/>
          <button id="saveSettingsBtn">保存设置</button>
        </section>
        <!-- Test Tab -->
        <section id="test" class="tab-content">
            <h2>Test add data</h2>
            <button id="btnAddDevice">add device</button>
            <button id="btnAddControl">add control (need to add device first)</button>
            <button id="btnAddSensor">add sensor (need to add device first)</button>
            <button id="btnAddSensorData">add sensor data (need to add sensor first)</button>
            <button id="btnAddAll">add all data once</button>
            </section>
      </main>

      <script>
        // chart
        let autoRefreshTimer = null; 
        let chartDataCache = []; // 存儲當前圖表的全部原始數據
        let chartLastTimestamp = 0;
        
        // --- TAB切换 ---
        const tabs = document.querySelectorAll('.tabBtn');
        const contents = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
          });
        });
  
        // --- 变量 ---
        const deviceSelect = document.getElementById('deviceSelect');
        const sensorSelect = document.getElementById('sensorSelect');
        const timeRangeButtons = document.getElementById('timeRangeButtons');
        const chartTypeSelect = document.getElementById('chartTypeSelect');
        const chartCtx = document.getElementById('sensorDataChart').getContext('2d');
        const widgetContainer = document.getElementById('widgetContainer');
        const addWidgetBtn = document.getElementById('addWidgetBtn');
        const defaultTimeRangeSelect = document.getElementById('defaultTimeRangeSelect');
        const defaultChartTypeSelect = document.getElementById('defaultChartTypeSelect');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const autoRefreshCheckbox = document.getElementById('autoRefreshCheckbox');
        const autoRefreshIntervalInput = document.getElementById('autoRefreshInterval');
        
        let currentChart = null;
        let renderPending = false;
        let lastDatasets = null;
        let updating = false;
        // 記住每條線的顏色
        let lineColors = {};

        let selectedDeviceId = null;
        let selectedSensorIds = [];
        let selectedTimeRange = 'hour';
        let selectedChartType = 'line';
        let widgets = [];
  
        function getLineColor(label, idx) {
        if (!lineColors[label]) {
            const baseColors = [
            '#0e838f', '#8a2be2', '#ff7f50', '#ffdc34', '#0ecb81', '#c74e4e', '#bc7af9',
            '#f08a5d', '#f9ed69', '#3ec1d3', '#ffb6b9', '#283c63'
            ];
            lineColors[label] = baseColors[idx % baseColors.length];
        }
        return lineColors[label];
        }

        // 初始化 datasets 時用
        const datasets = chartDataCache.map((d, i) => ({
        label: \`\${d.field} (Sensor:\${d.sensorId})\`,
        data: d.points,
        borderColor: getLineColor(\`\${d.field}-\${d.sensorId}\`, i),
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.2,
        pointRadius: 2
        }));
        function startAutoRefresh() {
            if (autoRefreshTimer) clearInterval(autoRefreshTimer);
            if (!autoRefreshCheckbox.checked) return;
            autoRefreshTimer = setInterval(() => {
              fetchNewSensorData();
            }, Number(autoRefreshIntervalInput.value) * 1000);
          }

        // --- 初始化 ---
        async function init() {
            loadSettings();
            await loadDevices();
            await loadAndRenderSensorData();
            setupEventListeners();
            startAutoRefresh();
        }
  
        // --- 加载设备 ---
        
        async function loadDevices() {
          const res = await fetch('/api/device?limit=100');
          const devices = await res.json();
          // @ts-ignore
          deviceSelect.innerHTML = '<option value="">--请选择设备--</option>' + devices.map(function(d) {
            return '<option value="' + d.device_id + '">' + d.device_name + '</option>';
          }).join('');
        }
  
        // --- 加载传感器 ---
       
        async function loadSensors(deviceId) {
          if (!deviceId) {
            sensorSelect.innerHTML = '';
            return;
          }
          const res = await fetch(\`/api/sensors?device_id=\${deviceId}&limit=100\`);
          const sensors = await res.json();
          sensorSelect.innerHTML = sensors.length ? sensors.map(function(s) {
            return '<option value="' + s.sensor_id + '">' + s.sensor_type + ' (' + (s.sensor_name || '未命名') + ')</option>';
          }).join('') : '<option>无传感器</option>';
        }
  
        // --- 加载并渲染多传感器趋势数据 ---
        async function loadAndRenderSensorData() {
            if (updating) return;
            updating = true;
            if (!selectedSensorIds.length) {
              renderChart([]);
              chartDataCache = [];
              chartLastTimestamp = 0;
              updating = false;
              return;
            }
            const now = Math.floor(Date.now() / 1000);
            let start;
            switch(selectedTimeRange) {
                case 'hour': start = now - 3600; break;
                case 'day': start = now - 86400; break;
                case 'week': start = now - 86400*7; break;
                case 'month': start = now - 86400*30; break;
                case 'year': start = now - 86400*365; break;
                default: start = now - 3600;
            }
  
            // 拉取全部數據，存 cache
            chartDataCache = [];
            chartLastTimestamp = 0;

            // 拉取所有選擇的 sensor
            await Promise.all(selectedSensorIds.map(async (sensorId) => {
                const resp = await fetch(\`/api/sensor_data?sensor_id=\${sensorId}&start=\${start}&end=\${now}&limit=1000\`);
                const data = await resp.json();
                if (!data.length) return;
                // 提取所有字段
                const allFields = Object.keys(JSON.parse(data[0].data));
                allFields.forEach(field => {
                const points = data.map(d => ({
                    x: d.timestamp * 1000,
                    y: parseFloat(JSON.parse(d.data)[field])
                })).reverse(); // 時間正序
                chartDataCache.push({
                    sensorId,
                    field,
                    points
                });
                });
                // 記錄最新時間
                chartLastTimestamp = Math.max(chartLastTimestamp, ...data.map(d => d.timestamp * 1000));
            }));

            // 組裝 datasets
            const datasets = chartDataCache.map((d,i) => ({
                label: \`\${d.field} (Sensor:\${d.sensorId})\`,
                data: d.points,
                borderColor: getLineColor(\`\${d.field}-\${d.sensorId}\`, i),
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.2,
                pointRadius: 2
            }));

            renderChart(datasets);
            updating = false;
        }
  
        // auto refresh
        async function fetchNewSensorData() {
            if (!selectedSensorIds.length || !chartLastTimestamp) return;
            const now = Math.floor(Date.now() / 1000);
            let hasUpdate = false;
            // 新增數據，根據 cache 裡的 sensorId 和 field 動態處理
            await Promise.all(chartDataCache.map(async (d) => {
              const resp = await fetch(\`/api/sensor_data?sensor_id=\${d.sensorId}&start=\${Math.floor(chartLastTimestamp/1000)+1}&end=\${now}&limit=100\`);
              const data = await resp.json();
              if (!data.length) return;
              // 新數據只取本 field
              const newPoints = [];
              data.forEach(row => {
                const val = JSON.parse(row.data)[d.field];
                if (val !== undefined) {
                  newPoints.push({
                    x: row.timestamp * 1000,
                    y: parseFloat(val)
                  });
                }
              });
              if (newPoints.length) {
                d.points = d.points.concat(newPoints);
                hasUpdate = true;
              }
            }));
          
            if (hasUpdate) {
              // 更新最新 timestamp
              chartLastTimestamp = Math.max(...chartDataCache.map(d => d.points.length ? d.points[d.points.length-1].x : 0));
              // 重組 datasets
              const datasets = chartDataCache.map((d,i) => ({
                label: \`\${d.field} (Sensor:\${d.sensorId})\`,
                data: d.points,
                borderColor:  getLineColor(\`\${d.field}-\${d.sensorId}\`, i),
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.2,
                pointRadius: 2
              }));
              renderChart(datasets);
            }
          }

        // --- 渲染Chart.js图表 ---
        function renderChart(datasets) {
            // if (currentChart) {
            //   currentChart.destroy();
            //   currentChart = null;
            // }
            const timeUnitMap = {
                hour: 'minute',
                day: 'hour',
                week: 'day',
                month: 'day',
                year: 'month'
              };
            
            // 餅圖類型時，只能顯示一組 label+data
            if (selectedChartType === 'pie' || selectedChartType === 'doughnut') {
              // 取第一條曲線，或者合併所有點（如需可定制）
              const first = datasets[0];
              if (!first) return;

              if (!currentChart) {
                currentChart = new Chart(chartCtx, {
                    type: selectedChartType,
                    data: {
                    labels: first.data.map(p => new Date(p.x).toLocaleString()),
                    datasets: [{
                        label: first.label,
                        data: first.data.map(p => p.y),
                        backgroundColor: pieColors(first.data.length) // 下方補充
                    }]
                    },
                    options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true } }
                    }
                });
              } else {
                currentChart.labels = first.data.map(p => new Date(p.x).toLocaleString());

                currentChart.data.datasets = datasets;
                currentChart.update('none');
              }

            } else {
                if (!currentChart) {
                    // 折線、柱狀、雷達圖
                    currentChart = new Chart(chartCtx, {
                        type: selectedChartType,
                        data: { datasets },
                        options: {
                        responsive: false,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: true } },
                        scales: {
                            x: {
                            type: 'time',
                            time: { unit: timeUnitMap[selectedTimeRange] || 'day' },
                            title: { display: true, text: '时间' },
                            ticks: { autoSkip: true, maxTicksLimit: 10 }
                            },
                            y: {
                            beginAtZero: true,
                            title: { display: true, text: '值' }
                            }
                        }
                        }
                    });
                } else {
                currentChart.data.datasets = datasets;
                currentChart.update('none');
              }
            }
          }
          
          // pie 顏色生成
          function pieColors(count) {
            // 返回 count 個固定顏色
            const baseColors = [
              '#0e838f', '#8a2be2', '#ff7f50', '#ffdc34', '#0ecb81', '#c74e4e', '#bc7af9',
              '#f08a5d', '#f9ed69', '#3ec1d3', '#ffb6b9', '#283c63'
            ];
            return Array(count).fill(0).map((_,i)=>baseColors[i%baseColors.length]);
          }
  
        // --- 生成随机颜色 ---
        function randomColor() {
          return 'hsl(' + Math.floor(Math.random() * 360) + ', 70%, 50%)';
        }
  
        // --- 加载控件 ---
        async function loadWidgets() {
          if (!selectedDeviceId) {
            widgetContainer.innerHTML = '请先选择设备';
            return;
          }
          const res = await fetch(\`/api/controls?device_id=\${selectedDeviceId}\`);
          const controls = await res.json();
          widgets = controls;
          renderWidgets();
        }
  
        // --- 渲染Widgets ---
        function renderWidgets() {
          widgetContainer.innerHTML = '';
          widgets.forEach(w => {
            const div = document.createElement('div');
            div.className = 'widget';
            div.innerHTML = \`
              <button class="closeBtn" data-id="\${w.control_id}">×</button>
              <h4>\${w.control_name || w.control_type}</h4>
              <p>状态: <strong>\${w.state || '未知'}</strong></p>
              <button class="toggleBtn">\${w.state === 'on' ? '关闭' : '开启'}</button>
            \`;
            // 删除按钮
            div.querySelector('.closeBtn').onclick = () => {
              widgets = widgets.filter(x => x.control_id !== w.control_id);
              renderWidgets();
            };
            // 开关按钮
            div.querySelector('.toggleBtn').onclick = async () => {
              const newState = w.state === 'on' ? 'off' : 'on';
              const resp = await fetch('/api/controls?control_id=' + w.control_id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({state: newState})
              });
              if (resp.ok) {
                w.state = newState;
                renderWidgets();
              } else {
                alert('更新失败');
              }
            };
            widgetContainer.appendChild(div);
          });
        }
  
        // --- 事件监听 ---
        function setupEventListeners() {
          deviceSelect.addEventListener('change', async () => {
            selectedDeviceId = deviceSelect.value;
            await loadSensors(selectedDeviceId);
            await loadWidgets();
            selectedSensorIds = [];
            sensorSelect.selectedIndex = -1;
            await loadAndRenderSensorData();
          });
  
          sensorSelect.addEventListener('change', () => {
            selectedSensorIds = Array.from(sensorSelect.selectedOptions).map(opt => opt.value);
            loadAndRenderSensorData();
          });
  
          timeRangeButtons.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
              timeRangeButtons.querySelectorAll('button').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              selectedTimeRange = btn.dataset.range;
              // saveSettingsToLocal();
              loadAndRenderSensorData();  // 這句非常關鍵
            });
          });
  
          chartTypeSelect.addEventListener('change', () => {
            if (currentChart) {
                currentChart.destroy();
                currentChart = null;
            }
            selectedChartType = chartTypeSelect.value;
            // saveSettingsToLocal();
            // 不需要再拉數據，直接根據 chartDataCache 重畫
            const datasets = chartDataCache.map((d,i) => ({
              label: d.labelKey + ' (ID:' + d.sensorId + ')',
              data: d.points,
              borderColor: getLineColor(\`\${d.field}-\${d.sensorId}\`, i),
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.2
            }));
            renderChart(datasets);
          });
  
          saveSettingsBtn.addEventListener('click', () => {
            saveSettingsToLocal();
            alert('设置已保存到浏览器本地');
          });
  
          // 初始化settings面板值
          defaultTimeRangeSelect.value = selectedTimeRange;
          defaultChartTypeSelect.value = selectedChartType;
  
          defaultTimeRangeSelect.addEventListener('change', (e) => {
            selectedTimeRange = e.target.value;
            timeRangeButtons.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            const btn = timeRangeButtons.querySelector(\`button[data-range="\${selectedTimeRange}"]\`);
            if (btn) btn.classList.add('active');
            // saveSettingsToLocal();
            loadAndRenderSensorData();
          });
  
          defaultChartTypeSelect.addEventListener('change', (e) => {
            selectedChartType = e.target.value;
            chartTypeSelect.value = selectedChartType;
            // saveSettingsToLocal();
            loadAndRenderSensorData();
          });
  
          addWidgetBtn.addEventListener('click', async () => {
            // 简单弹窗，用户输入control_name和control_type
            const name = prompt('请输入控件名称');
            const type = prompt('请输入控件类型 (button/slider/switch)');
            if (!name || !type) return alert('名称和类型必填');
            const resp = await fetch('/api/controls', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({device_id: selectedDeviceId, control_name: name, control_type: type, state: 'off'})
            });
            if (resp.ok) {
              await loadWidgets();
            } else {
              alert('添加控件失败');
            }
          });


            // auto refresh chart

            autoRefreshCheckbox.addEventListener('change', startAutoRefresh);
            autoRefreshIntervalInput.addEventListener('change', startAutoRefresh);


            // Add Test buttons
            document.getElementById('btnAddDevice').addEventListener('click', addTestDevice);

            let lastDeviceId = localStorage.getItem('lastDeviceId') || null;
            let lastControlId = localStorage.getItem('lastControlId') || null;
            let lastSensorId = localStorage.getItem('lastSensorId') || null;
            let lastSensorDataId = localStorage.getItem('lastSensorDataId') || null;

            document.getElementById('btnAddControl').addEventListener('click', async () => {
                if (!lastDeviceId) {
                    lastDeviceId = await addTestDevice();
                }
                await addTestControl(lastDeviceId);
            });

            document.getElementById('btnAddSensor').addEventListener('click', async () => {
                if (!lastDeviceId) {
                    lastDeviceId = await addTestDevice();
                }
                lastSensorId = await addTestSensor(lastDeviceId);
            });

            document.getElementById('btnAddSensorData').addEventListener('click', async () => {
                if (!lastSensorId) {
                    alert('请先添加传感器');
                    return;
                }
                await addTestSensorData(lastSensorId);
            });

            document.getElementById('btnAddAll').addEventListener('click', addTestAll);

         
        }
  


        async function addTestDevice() {
            const testDevice = {
              device_name: 'Test Device '+ Date.now(),
              device_type: 'test_type'
            };
            const res = await fetch('/api/device', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(testDevice)
            });
            const data = await res.json();
            if (!data.insertedId) {
                alert('新增设备失败');
                return null;
            }
            localStorage.setItem('lastDeviceId', data.insertedId);
            alert('新增设备 ID: '+data.insertedId);
            return data.insertedId;
          }
          
        async function addTestControl(deviceId) {
            if (!deviceId) {
              alert('请先添加或选择设备');
              return;
            }
            const testControl = {
              device_id: deviceId,
              control_type: 'button',
              control_name: 'Test Control',
              state: 'off'
            };
            const res = await fetch('/api/controls', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(testControl)
            });
            const data = await res.json();
            if (!data.control_id) {
                alert('新增控件失败');
                return null;
            }
            localStorage.setItem('lastControlId', data.control_id);
            alert('新增控件 ID: ' + data.control_id);
            return data.control_id;
          }
          
         async function addTestSensor(deviceId) {
            if (!deviceId) {
              alert('请先添加或选择设备');
              return;
            }
            const testSensor = {
              device_id: deviceId,
              sensor_type: 'temperature',
              sensor_name: 'Test Sensor'
            };
            const res = await fetch('/api/sensors', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(testSensor)
            });
            const data = await res.json();
            if (!data.sensor_id) {
                alert('新增传感器失败');
                return null;
            }
            localStorage.setItem('lastSensorId', data.sensor_id);
            alert('新增传感器 ID: ' + data.sensor_id);
            return data.sensor_id;
          }
          
         async function addTestSensorData(sensorId) {
            if (!sensorId) {
              alert('请先添加或选择传感器');
              return;
            }
            const testData = {
              sensor_id: sensorId,
              timestamp: Math.floor(Date.now() / 1000),
              data: { temperature: (20 + Math.random() * 10).toFixed(2), humidity: (40 + Math.random() * 20).toFixed(2) }
            };
            const res = await fetch('/api/sensor_data', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(testData)
            });
            const data = await res.json();
            if (!data.data_id) {
              alert('新增传感器数据失败');
              return null;
            }
            localStorage.setItem('lastSensorDataId', data.data_id);
            alert('新增传感器数据 ID: ' + data.data_id);
            return data.data_id;
          }
          
          // 测试整合，按顺序执行，方便一键添加所有数据
          async function addTestAll() {
            const deviceId = await addTestDevice();
            if (!deviceId) return;
            const controlId = await addTestControl(deviceId);
            const sensorId = await addTestSensor(deviceId);
            if (sensorId) {
              await addTestSensorData(sensorId);
            }
            alert('测试数据添加完成');
          }
        
        // --- local storage settings ---
        function saveSettingsToLocal() {
          localStorage.setItem('iot-dashboard-timeRange', selectedTimeRange);
          localStorage.setItem('iot-dashboard-chartType', selectedChartType);
          defaultTimeRangeSelect.value = selectedTimeRange;
          defaultChartTypeSelect.value = selectedChartType;
        }
  
        function loadSettings() {
          selectedTimeRange = localStorage.getItem('iot-dashboard-timeRange') || 'hour';
          selectedChartType = localStorage.getItem('iot-dashboard-chartType') || 'line';

        }


  
        // --- initial ---
        init();
  
      </script>
    </body>
    </html>
    `;
  }
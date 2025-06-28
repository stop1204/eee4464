# 任務二：完整技術分析

## 1. Worker 資料流程與 API 結構
- Worker 入口位於 `src/index.ts`。`fetch` 事件依 URL 路徑呼叫對應的 `handle*` 函式，包含 `login`、`register`、`device`、`sensors`、`sensor_data`、`controls`、`messages` 以及 `ingest_mqtt` 等。
- 各 `handle` 函式以 `db.prepare(...).bind(...).run()` 與 D1 資料庫互動，對應的 SQL 皆在遷移檔 `migrations/*.sql` 定義。
- `pubsub` 事件可接受 Cloudflare Pub/Sub 的 MQTT 訊息，轉由 `handlePubSubMessage` 存入 `sensor_data` 表。
- 部署設定在 `wrangler.json`，指定 `main: "src/index.ts"`，並綁定 D1 資料庫；靜態資源由 `wrangler.toml` 的 `[site]` 指向 `./site`。

## 2. MQTT 與 HTTP 整合
- ESP32 或其他裝置可直接以 HTTP POST `/api/sensor_data` 傳送感測值，也能透過 MQTT 發佈到 Cloudflare Pub/Sub，Worker 監聽 `pubsub` 事件將資料寫入資料庫。
- 前端頁面另提供 `/api/ingest_mqtt`，當使用 MQTT.js 連線到外部 broker 時，可把訊息轉送至 Worker 儲存，形成「外部 MQTT → 前端 → HTTP → Worker」的流程。
- 控制命令由前端發送至 `/api/controls`，並記錄在 `/api/messages`，ESP32 可定期查詢或透過 MQTT 訂閱實作即時控制。

## 3. Widget 動態渲染與狀態更新
- `site/index.html` 會在載入裝置與感測器後，呼叫 `renderWidgets()` 依 `controls` 資料建立對應元件。
- 普通控制元件（button、slider、switch）直接操作 `state`，並在 UI 上即時更新；MQTT widget 會建立 MQTT 連線 (`mqtt.connect`)，即時顯示最新訊息。
- Chart.js 圖表同樣根據 `/api/sensor_data` 取得的資料動態繪製，支援多感測器選擇與不同時間範圍。

## 4. 前端與 JS 架構評估
- 所有 HTML、CSS、JS 都集中在單一檔案 `index.html`，易於修改但可維護性較低，建議拆分模組或使用框架（如 React/Vue）管理狀態。
- 目前的程式以全域變數及大量 DOM 操作為主，隨著功能增多可能難以擴充，可考慮重構為元件化或使用模組化打包工具。
- 資料快取以 `localStorage` 儲存選擇的 device 與 sensor，符合基本需求，但缺乏統一的狀態管理機制。

## 5. 安全性與錯誤處理
- Worker 端針對錯誤會回傳標準 JSON 格式 `{ success: false, message }`，但未實作權杖驗證或角色權限控制，僅以簡單的 session token 表示登入。
- 未啟用 CORS 控制，若需跨來源請自行設定。亦建議加入速率限制及帳號鎖定機制避免暴力攻擊。
- 前端對於 fetch 失敗僅顯示 `alert` 或錯誤訊息，缺少進一步的例外處理或重試機制。

### 建議
- 模組化前端結構，將 MQTT 控制、圖表繪製等邏輯拆出，便於後續維護。
- 將 JavaScript 從 `index.html` 分離為獨立檔案，配合模組化打包工具以提升可讀性與擴充性。
- 加強圖表呈現與自動化分析功能，例如統計趨勢與相關性提示。
- 在 Worker 加入驗證（如 JWT 或 API Key）、輸入驗證與更完整的錯誤紀錄。
- 針對大量資料或即時應用，可擴充 WebSocket 或 Queue 服務，提升即時性與可靠度。

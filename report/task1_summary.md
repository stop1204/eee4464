# 任務一：專案概觀

## 1. Cloudflare Worker 功能與資料流程
- `src/index.ts` 內的 `fetch` 函式是主要入口，依照路徑分派至 `handleLogin`、`handleDevice` 等函式。
- 資料存取皆透過 Cloudflare D1 資料庫 (`env.DB`) 執行 SQL 語句，例如存取 `device`、`sensors`、`sensor_data` 等表格。
- 提供 `/api/ingest_mqtt` 以及 `pubsub` 事件處理，可接收 MQTT 訊息並寫入資料庫。
- 未命中的路徑會回傳內嵌的 `site/index.html` 前端頁面。

## 2. 前端模組
- `site/index.html` 集結 UI 與 JavaScript，功能包含：
  - 儀表板頁面：以 Chart.js 顯示感測資料走勢，支援時間範圍、圖表類型切換與統計計算。
  - 控制開關／按鈕：透過 `/api/controls` 讀取及更新裝置狀態，也會記錄至 `/api/messages`。
  - MQTT 整合：可設定 broker、topic、帳號與密碼，動態建立 MQTT widget，即時顯示訊息。
  - 使用者登入/註冊與裝置管理介面。

## 3. 與 ESP32 互動方式
- 裝置可直接呼叫 HTTP API，如 `/api/sensor_data` 上傳量測結果或 `/api/controls` 取得控制指令。
- Dashboard 也能透過 `/api/ingest_mqtt` 將接收到的 MQTT 資料轉存，或利用 Cloudflare Pub/Sub 在背景處理 MQTT 訊息。
- 早期版本曾使用 WebSocket (後續移除)，目前主要互動方式為 HTTP 與 MQTT。

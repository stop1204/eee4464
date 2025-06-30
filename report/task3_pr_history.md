# 任務三：歷史 Pull Request 分析

本專案的 Git 紀錄包含多次合併分支，以下依序整理主要的 PR 標題與內容：

1. **#1 feature/initial-project-refinement**
   - 目標：調整專案結構並補充遷移檔、更新文件。
   - 解決問題：早期檔案不足、目錄雜亂，透過重構後加入 `migrations` 中的資料表腳本與更清楚的 README。

2. **#3 create-api_reference.md-and-update-readme.md**
   - 新增 API Reference 文件，說明各種 HTTP 介面；同時改善 README 內容，使部署步驟更完整。

3. **#6 codex/modify-index.html-to-integrate-mqtt-data**
   - 重點：在 dashboard 中加入 MQTT 即時資料顯示，並增設 Pub/Sub 處理流程。
   - 過程中對 MQTT 連線、權限等進行修正，逐步於 PR #7、#9 中修正憑證與解析問題。

4. **#7 codex/modify-index.html-to-integrate-mqtt-data (後續修正)**
   - 修正 MQTT 凭證與 dashboard 介面問題，確保能正確連到 broker 並顯示訊息。

5. **#9 dswfic-codex/modify-index.html-to-integrate-mqtt-data**
   - 最後完成 MQTT 資料解析及展示邏輯的修正，使前端能穩定處理 JSON 格式訊息。

### 遇到的主要問題
- **動態註冊裝置與感測器**：原本僅支援固定裝置，後續在 `handleDevice`、`handleSensors` 等 API 中加入新增、刪除與查詢功能，並在 UI 上提供選擇與管理介面。
- **HTTP 轉向 MQTT**：先前嘗試以 WebSocket 傳輸 (`add WebSocket support` commit)，但因實作與可靠度問題最終被移除；改採 Cloudflare Pub/Sub 與 `ingest_mqtt` endpoint 處理 MQTT 訊息，並在前端以 MQTT.js 直接接 broker。
- **資料同步與即時性**：多次 PR 提及修正 MQTT 連線及資料解析，顯示在實作過程中需解決 broker 認證、訊息格式不一致等問題。
- **架構規劃不足**：最初未完整規劃資料流程與模組劃分，後續必須多次調整處理方式才能相容前端與裝置需求。
- **Wrangler 部署限制**：本地開發使用的 Node.js 模組無法在 Cloudflare Worker 上部署，必須改寫為原生支援的實作方式。

### 未來可優化方向
- 統一裝置通訊協定，可考慮全以 MQTT 或 HTTP 為主，減少雙軌機制的複雜度。
- 在裝置註冊與管理中加入驗證與權限，確保僅授權設備能寫入/讀取資料。
- 若需要實時監控，可評估重新引入 WebSocket 或長輪詢機制，提升前端即時更新效率。
- 將 JS 程式從 HTML 中抽離，改以模組化方式管理，降低維護成本。
- 強化圖表與資料分析功能，自動計算趨勢並提供相關性建議。

/**
 * Google Apps Script：接收遊戲 POST 成績並寫入「同一個」試算表
 *
 * ⚠️ 請在「要收集成績的那一份試算表」內開啟 Apps Script：
 *    試算表 → 擴充功能 → Apps Script（這樣 getActiveSpreadsheet() 才會指向正確檔案）
 *
 * 試算表第一列標題請設為（與 Google 表單回應常用格式一致）：
 *   Timestamp | Class | Seat | Name | Score | Time
 *
 * 部署步驟：
 * 1. 貼上此檔 doPost 內容
 * 2. 部署 → 新增部署 → 網路應用程式
 * 3. 執行身分：我；存取權：任何人
 * 4. 複製「網路應用程式」URL（結尾為 /exec）到 Vercel／本機 .env：
 *    VITE_GOOGLE_FORM_SCRIPT_URL=該網址
 * 5. 修改程式碼後必須「管理部署 → 編輯 → 新版本」才會生效
 *
 * 用瀏覽器開啟 /exec 網址若看到 JSON（doGet）代表部署成功；
 * 遊戲實際送成績使用 POST（doPost）。
 */
function doGet() {
  return jsonResponse({
    ok: true,
    message: '料理鼠亡成績 API 運作中，請由遊戲以 POST 傳送成績。',
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'empty body' });
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    const classId = String(data.Class ?? data.classId ?? '').trim();
    const seat = String(data.Seat ?? data.seatNumber ?? '').trim();
    const name = String(data.Name ?? data.name ?? '').trim();
    const score = data.Score ?? data.totalScore ?? '';
    const time = String(data.Time ?? data.elapsedTime ?? '').trim();

    // 欄位順序：A Timestamp, B Class, C Seat, D Name, E Score, F Time
    sheet.appendRow([new Date(), classId, seat, name, score, time]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Google Apps Script 範例：接收遊戲 POST 成績並寫入試算表
 *
 * 1. 建立 Google 試算表，第一列標題建議：
 *    班級 | 座號 | 姓名 | 總積分 | 完成時間 | 防疫積分 | 完成任務數 | 星級 | 時間戳記
 * 2. 試算表 → 擴充功能 → Apps Script，貼上此檔內容
 * 3. 部署 → 新增部署 → 網路應用程式 → 執行身分：我；存取：任何人
 * 4. 複製部署 URL 至專案 .env 的 VITE_GOOGLE_FORM_SCRIPT_URL
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      data.classId || '',
      data.seatNumber || '',
      data.name || '',
      data.totalScore ?? '',
      data.elapsedTime || '',
      data.preventionScore ?? '',
      data.completedQuests ?? '',
      data.stars ?? '',
      new Date(),
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

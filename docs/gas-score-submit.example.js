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
 * 1. 貼上此檔 doPost / doGet 內容
 * 2. 部署 → 新增部署 → 網路應用程式
 * 3. 執行身分：我；存取權：任何人
 * 4. 複製「網路應用程式」URL（結尾為 /exec）到 Vercel／本機 .env：
 *    VITE_GOOGLE_FORM_SCRIPT_URL=該網址
 * 5. 修改程式碼後必須「管理部署 → 編輯 → 新版本」才會生效
 *
 * 用瀏覽器開啟 /exec?action=leaderboard&limit=6 應回傳 JSON 前六名；
 * 遊戲送成績使用 POST（doPost）。
 */
function doGet(e) {
  var action = e && e.parameter ? String(e.parameter.action || '') : '';
  if (action === 'leaderboard') {
    return jsonResponse(getLeaderboard(e));
  }
  return jsonResponse({
    ok: true,
    message: '料理鼠亡成績 API 運作中。POST 寫入成績；GET ?action=leaderboard 讀取排行榜。',
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'empty body' });
    }

    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var classId = String(data.Class ?? data.classId ?? '').trim();
    var seat = String(data.Seat ?? data.seatNumber ?? '').trim();
    var name = String(data.Name ?? data.name ?? '').trim();
    var score = data.Score ?? data.totalScore ?? '';
    var time = String(data.Time ?? data.elapsedTime ?? '').trim();

    // 欄位順序：A Timestamp, B Class, C Seat, D Name, E Score, F Time
    sheet.appendRow([new Date(), classId, seat, name, score, time]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * 每位學生（班級+座號+姓名）只保留最快一筆，再取全體前 limit 名
 */
function getLeaderboard(e) {
  try {
    var limit = Math.min(20, Math.max(1, parseInt(e.parameter.limit, 10) || 6));
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var bestByKey = {};

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var classId = String(row[1] || '').trim();
      var seatNumber = String(row[2] || '').trim();
      var name = String(row[3] || '').trim();
      var time = String(row[5] || '').trim();
      if (!name || !time) continue;

      var elapsedSeconds = parseTimeToSeconds(time);
      if (!isFinite(elapsedSeconds)) continue;

      var key = classId + '\t' + seatNumber + '\t' + name;
      var savedAt = '';
      if (row[0] instanceof Date) {
        savedAt = row[0].toISOString();
      } else if (row[0]) {
        savedAt = String(row[0]);
      }

      var entry = {
        classId: classId,
        seatNumber: seatNumber,
        name: name,
        elapsedTime: time,
        elapsedSeconds: elapsedSeconds,
        savedAt: savedAt,
      };

      if (!bestByKey[key] || elapsedSeconds < bestByKey[key].elapsedSeconds) {
        bestByKey[key] = entry;
      }
    }

    var list = [];
    for (var k in bestByKey) {
      if (bestByKey.hasOwnProperty(k)) {
        list.push(bestByKey[k]);
      }
    }

    list.sort(function (a, b) {
      if (a.elapsedSeconds !== b.elapsedSeconds) {
        return a.elapsedSeconds - b.elapsedSeconds;
      }
      return String(a.savedAt).localeCompare(String(b.savedAt));
    });

    return { ok: true, entries: list.slice(0, limit) };
  } catch (err) {
    return { ok: false, error: String(err), entries: [] };
  }
}

function parseTimeToSeconds(time) {
  var m = String(time).trim().match(/^(\d+):(\d{2})$/);
  if (!m) return NaN;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

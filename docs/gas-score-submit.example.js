/**
 * Google Apps Script：接收遊戲 POST 成績並寫入「同一個」試算表
 *
 * ⚠️ 請在「要收集成績的那一份試算表」內開啟 Apps Script：
 *    試算表 → 擴充功能 → Apps Script（這樣 getActiveSpreadsheet() 才會指向正確檔案）
 *
 * 試算表第一列標題建議：
 *   Timestamp | Class | Seat | Name | BaseScore | Score | Time
 *   BaseScore = 總積分（100 分制）；Score = 防疫積分；Time = MM:SS
 *   （舊版僅有 Score+Time 欄時，排行榜會由 Score 當 baseScore 並重算防疫積分）
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

    var classId = String(data.class ?? data.Class ?? data.classId ?? '').trim();
    var seat = String(data.seat ?? data.Seat ?? data.seatNumber ?? '').trim();
    var name = String(data.name ?? data.Name ?? '').trim();
    var baseScore = parseBaseScore(
      data.baseScore ?? data.BaseScore ?? data.totalScore ?? data.Score ?? 0,
    );
    var time = String(data.time ?? data.Time ?? data.elapsedTime ?? '').trim();
    var elapsedSeconds = parseTimeToSeconds(time);
    var leaderboardScore = parseFloat(
      String(data.score ?? data.leaderboardScore ?? data.LeaderboardScore ?? ''),
    );
    if (!isFinite(leaderboardScore) && isFinite(elapsedSeconds)) {
      leaderboardScore = computeLeaderboardScore(baseScore, elapsedSeconds);
    }
    if (!isFinite(leaderboardScore)) {
      leaderboardScore = 0;
    }

    // A Timestamp, B Class, C Seat, D Name, E BaseScore, F Score(防疫), G Time
    sheet.appendRow([
      new Date(),
      classId,
      seat,
      name,
      baseScore,
      leaderboardScore,
      time,
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

var LEADERBOARD_TIME_BASE_SEC = 600;
var LEADERBOARD_TIME_BONUS_PER_SEC = 2;

function parseBaseScore(raw) {
  var n = parseFloat(String(raw || '').trim());
  return isFinite(n) ? n : 0;
}

/** 讀取一列成績（支援新 7 欄與舊 6 欄試算表） */
function parseSheetScoreRow(displayRow, rawRow) {
  var classId = String(displayRow[1] || '').trim();
  var seatNumber = String(displayRow[2] || '').trim();
  var name = String(displayRow[3] || '').trim();
  if (!name) return null;

  var baseScore;
  var leaderboardScore;
  var time;
  var timeRaw;

  var hasNewFormat =
    displayRow.length > 6 && String(displayRow[6] || '').trim() !== '';

  if (hasNewFormat) {
    baseScore = parseBaseScore(displayRow[4]);
    leaderboardScore = parseFloat(String(displayRow[5] || '').trim());
    timeRaw = rawRow[6];
    time = formatTimeCell(displayRow[6], timeRaw);
  } else {
    baseScore = parseBaseScore(displayRow[4]);
    timeRaw = rawRow[5];
    time = formatTimeCell(displayRow[5], timeRaw);
    leaderboardScore = NaN;
  }

  if (!time) return null;
  var elapsedSeconds = parseTimeToSeconds(time);
  if (!isFinite(elapsedSeconds)) return null;

  if (!isFinite(leaderboardScore)) {
    leaderboardScore = computeLeaderboardScore(baseScore, elapsedSeconds);
  }

  return {
    classId: classId,
    seatNumber: seatNumber,
    name: name,
    baseScore: baseScore,
    leaderboardScore: Math.round(leaderboardScore),
    time: time,
    elapsedSeconds: elapsedSeconds,
  };
}

/** 防疫積分 = 總積分×10 + max(0, 600-秒數)×2 */
function computeLeaderboardScore(baseScore, elapsedSeconds) {
  var timeBonus = Math.max(0, LEADERBOARD_TIME_BASE_SEC - elapsedSeconds) * LEADERBOARD_TIME_BONUS_PER_SEC;
  return Math.round(baseScore * 10 + timeBonus);
}

/**
 * 每位學生只保留防疫積分最高的一筆；同分則保留時間較短者
 */
function getLeaderboard(e) {
  try {
    var limit = Math.min(20, Math.max(1, parseInt(e.parameter.limit, 10) || 6));
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var range = sheet.getDataRange();
    var displayRows = range.getDisplayValues();
    var rawRows = range.getValues();
    var bestByKey = {};

    for (var i = 1; i < displayRows.length; i++) {
      var row = displayRows[i];
      var raw = rawRows[i];
      var parsed = parseSheetScoreRow(row, raw);
      if (!parsed) continue;

      var classId = parsed.classId;
      var seatNumber = parsed.seatNumber;
      var name = parsed.name;
      var baseScore = parsed.baseScore;
      var time = parsed.time;
      var elapsedSeconds = parsed.elapsedSeconds;
      var leaderboardScore = parsed.leaderboardScore;
      var key = classId + '\t' + seatNumber + '\t' + name;
      var savedAt = '';
      if (raw[0] instanceof Date) {
        savedAt = raw[0].toISOString();
      } else if (row[0]) {
        savedAt = String(row[0]);
      }

      var entry = {
        classId: classId,
        seatNumber: seatNumber,
        name: name,
        baseScore: baseScore,
        leaderboardScore: leaderboardScore,
        elapsedTime: time,
        elapsedSeconds: elapsedSeconds,
        savedAt: savedAt,
      };

      if (!bestByKey[key]) {
        bestByKey[key] = entry;
        continue;
      }
      var prev = bestByKey[key];
      if (
        leaderboardScore > prev.leaderboardScore ||
        (leaderboardScore === prev.leaderboardScore &&
          elapsedSeconds < prev.elapsedSeconds)
      ) {
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
      if (b.leaderboardScore !== a.leaderboardScore) {
        return b.leaderboardScore - a.leaderboardScore;
      }
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

/** 優先使用試算表畫面上的字串（4:42），否則嘗試從儲存格原始值還原 */
function formatTimeCell(displayValue, rawValue) {
  var shown = String(displayValue || '').trim();
  if (shown && isFinite(parseTimeToSeconds(shown))) {
    return shown;
  }
  if (typeof rawValue === 'number' && isFinite(rawValue) && rawValue >= 0) {
    var totalMinutes = Math.round(rawValue * 24 * 60);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    return hours + ':' + (minutes < 10 ? '0' : '') + minutes;
  }
  if (rawValue instanceof Date) {
    var h = rawValue.getHours();
    var m = rawValue.getMinutes();
    return h + ':' + (m < 10 ? '0' : '') + m;
  }
  return shown;
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

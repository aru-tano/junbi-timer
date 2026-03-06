// =============================================
//  Google Calendar 連携
//  セットアップ手順:
//  1. Google Cloud Console でプロジェクト作成
//  2. Calendar API を有効化
//  3. OAuth同意画面を設定（テストモード、外部ユーザー）
//  4. OAuth 2.0 クライアントID作成（種類: ウェブアプリケーション）
//     承認済みJSオリジン: ホスティング先URL
//  5. テストユーザーに使う人のGmailを登録
//  6. 下の CLIENT_ID を書き換え
// =============================================

const GCAL_CLIENT_ID = '312882037224-bb4nt6jv43f2ar8j0241n4reqbnl21e3.apps.googleusercontent.com';
const GCAL_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GCAL_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let gcalGapiInited = false;
let gcalGisInited = false;
let gcalTokenClient = null;
let gcalAccessToken = null;
let gcalUserEmail = null;
let gcalLastSync = null;

// Google のカラーID → HEX マッピング
const GCAL_COLOR_MAP = {
  '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
  '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
  '9': '#3f51b5', '10': '#0b8043', '11': '#d50000',
};

// --- ライブラリ初期化コールバック ---

function gapiLoaded() {
  gapi.load('client', async () => {
    await gapi.client.init({
      discoveryDocs: [GCAL_DISCOVERY_DOC],
    });
    gcalGapiInited = true;
    maybeEnableGcalButton();
  });
}

function gisLoaded() {
  gcalTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GCAL_CLIENT_ID,
    scope: GCAL_SCOPES,
    callback: '', // 後で設定
  });
  gcalGisInited = true;
  maybeEnableGcalButton();
}

function maybeEnableGcalButton() {
  if (gcalGapiInited && gcalGisInited) {
    const btn = document.getElementById('gcalConnectBtn');
    if (btn) btn.disabled = false;
  }
}

// --- OAuth 認証 ---

function gcalConnect() {
  if (!gcalTokenClient) return;
  gcalTokenClient.callback = async (resp) => {
    if (resp.error) {
      console.error('GCal OAuth error:', resp);
      return;
    }
    gcalAccessToken = resp.access_token;
    // メールアドレス取得
    try {
      const res = await gapi.client.calendar.calendarList.get({ calendarId: 'primary' });
      gcalUserEmail = res.result.summary || res.result.id || '';
    } catch (e) {
      gcalUserEmail = '';
    }
    await gcalFetchEvents();
    updateGcalUI();
  };
  if (gcalAccessToken === null) {
    gcalTokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    gcalTokenClient.requestAccessToken({ prompt: '' });
  }
}

function gcalDisconnect() {
  if (gcalAccessToken) {
    google.accounts.oauth2.revoke(gcalAccessToken);
  }
  gcalAccessToken = null;
  gcalUserEmail = null;
  gcalLastSync = null;
  // gcal由来の予定を除去
  removeGcalEvents();
  updateGcalUI();
}

// --- イベント取得 ---

async function gcalFetchEvents() {
  if (!gcalAccessToken) return;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  try {
    const resp = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    });
    const events = resp.result.items || [];
    gcalEventsToSchedule(events);
    gcalLastSync = new Date();
    saveSchedule();
    // メイン画面のタスクリスト更新
    const nowDate = new Date();
    if (typeof renderTaskList === 'function') renderTaskList(nowDate);
    if (typeof renderEventList === 'function') renderEventList();
    if (typeof renderDayTabs === 'function') renderDayTabs();
  } catch (e) {
    console.error('GCal fetch error:', e);
  }
}

// --- イベント → scheduleData 変換 ---

function gcalEventsToSchedule(events) {
  // まず既存のgcal由来を除去
  removeGcalEvents();

  events.forEach(ev => {
    // 終日イベントはスキップ（dateTime がない）
    if (!ev.start || !ev.start.dateTime) return;

    const start = new Date(ev.start.dateTime);
    const end = ev.end && ev.end.dateTime ? new Date(ev.end.dateTime) : null;
    const dayOfWeek = start.getDay();
    const startH = start.getHours();
    const startM = start.getMinutes();
    const durationMin = end ? Math.round((end - start) / 60000) : 60;
    const color = ev.colorId ? (GCAL_COLOR_MAP[ev.colorId] || COLORS[0]) : '#3b82f6';

    // 説明欄から持ち物を抽出
    const todos = parseDescription(ev.description || '');

    if (!scheduleData[dayOfWeek]) scheduleData[dayOfWeek] = [];

    scheduleData[dayOfWeek].push({
      name: ev.summary || '（名前なし）',
      startH: startH,
      startM: startM,
      durationMin: Math.max(durationMin, 5),
      prepMin: 15,
      color: color,
      todos: todos,
      source: 'gcal',
      gcalId: ev.id,
    });
  });
}

// 説明欄のテキストから持ち物リストを抽出
function parseDescription(desc) {
  if (!desc || !desc.trim()) return [];
  // HTMLタグ除去（GoogleカレンダーはリッチテキストをHTMLで返す）
  const text = desc.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  // 改行・カンマ・読点・「、」で分割
  return text.split(/[\n,、・]/)
    .map(s => s.replace(/^[\s\-\*\•\─]+/, '').trim())
    .filter(s => s.length > 0 && s.length < 30);
}

function removeGcalEvents() {
  for (let d = 0; d < 7; d++) {
    if (scheduleData[d]) {
      scheduleData[d] = scheduleData[d].filter(ev => ev.source !== 'gcal');
    }
  }
}

// --- 設定画面 UI 更新 ---

function updateGcalUI() {
  const section = document.getElementById('gcalSection');
  if (!section) return;

  if (GCAL_CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com') {
    section.innerHTML = `
      <div class="gcal-status-text" style="color:var(--g400); font-size:0.8rem;">
        ※ Googleカレンダー連携を使うには CLIENT_ID の設定が必要です
      </div>`;
    return;
  }

  if (gcalAccessToken) {
    const email = gcalUserEmail || '';
    const syncTime = gcalLastSync
      ? `${gcalLastSync.getMonth()+1}/${gcalLastSync.getDate()} ${gcalLastSync.getHours()}:${String(gcalLastSync.getMinutes()).padStart(2,'0')}`
      : '--';
    section.innerHTML = `
      <div class="gcal-connected">
        <div class="gcal-status">✅ 連携中${email ? '（' + email + '）' : ''}</div>
        <div class="gcal-actions">
          <button onclick="gcalSync()" class="gcal-action-btn gcal-sync-btn">🔄 今すぐ同期</button>
          <button onclick="gcalDisconnect()" class="gcal-action-btn gcal-disconnect-btn">🔌 解除</button>
        </div>
        <div class="gcal-last-sync">最終同期: ${syncTime}</div>
      </div>`;
  } else {
    const disabled = (!gcalGapiInited || !gcalGisInited) ? 'disabled' : '';
    section.innerHTML = `
      <button id="gcalConnectBtn" onclick="gcalConnect()" class="gcal-connect-btn" ${disabled}>
        🔗 Googleカレンダーと連携する
      </button>`;
  }
}

async function gcalSync() {
  await gcalFetchEvents();
  updateGcalUI();
}

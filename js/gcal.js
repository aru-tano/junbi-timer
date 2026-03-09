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
let gcalCalendarList = [];       // 取得したカレンダー一覧
let gcalSelectedCalendars = null; // 選択済みカレンダーID配列（nullなら未設定＝primaryのみ）
let _gcalSyncing = false;        // 同期中フラグ（多重実行防止）

// Google のカラーID → HEX マッピング
const GCAL_COLOR_MAP = {
  '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
  '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
  '9': '#3f51b5', '10': '#0b8043', '11': '#d50000',
};

// --- localStorage でカレンダー選択を永続化 ---

function loadGcalSelection() {
  try {
    const raw = localStorage.getItem('junbi_timer_gcal_calendars');
    if (raw) gcalSelectedCalendars = JSON.parse(raw);
  } catch (e) {}
}
function saveGcalSelection() {
  localStorage.setItem('junbi_timer_gcal_calendars', JSON.stringify(gcalSelectedCalendars));
}
loadGcalSelection();

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
    // カレンダー一覧を取得
    await gcalFetchCalendarList();
    // 未選択なら primary だけ選択
    if (!gcalSelectedCalendars) {
      gcalSelectedCalendars = ['primary'];
      saveGcalSelection();
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
  gcalCalendarList = [];
  // gcal由来の予定を除去
  removeGcalEvents();
  saveSchedule();
  refreshMainView();
  updateGcalUI();
}

// --- カレンダー一覧取得 ---

async function gcalFetchCalendarList() {
  if (!gcalAccessToken) return;
  try {
    const resp = await gapi.client.calendar.calendarList.list();
    gcalCalendarList = (resp.result.items || [])
      // 祝日・誕生日などの特殊カレンダーを除外
      .filter(cal => {
        const id = cal.id || '';
        if (id.endsWith('#holiday@group.v.calendar.google.com')) return false;
        if (id.endsWith('#contacts@group.v.calendar.google.com')) return false;
        if (id.endsWith('#weeknum@group.v.calendar.google.com')) return false;
        // freeBusyReader はイベント詳細が取れないので除外
        if (cal.accessRole === 'freeBusyReader') return false;
        return true;
      })
      .map(cal => ({
        id: cal.id,
        summary: cal.summary || cal.id,
        backgroundColor: cal.backgroundColor || '#3b82f6',
        primary: !!cal.primary,
        accessRole: cal.accessRole,
      }));
    // primary を先頭に、その後は名前順
    gcalCalendarList.sort((a, b) => {
      if (a.primary) return -1;
      if (b.primary) return 1;
      return a.summary.localeCompare(b.summary);
    });
  } catch (e) {
    console.error('GCal calendar list error:', e);
  }
}

// --- イベント取得（複数カレンダー対応・重複排除・競合防止） ---

async function gcalFetchEvents() {
  if (!gcalAccessToken) return;
  // 多重実行防止
  if (_gcalSyncing) return;
  _gcalSyncing = true;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const calIds = gcalSelectedCalendars && gcalSelectedCalendars.length > 0
    ? gcalSelectedCalendars
    : ['primary'];

  try {
    // 全カレンダーを並列取得（削除はまだしない）
    const results = await Promise.allSettled(
      calIds.map(calId =>
        gapi.client.calendar.events.list({
          calendarId: calId,
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 100,
        })
      )
    );

    // iCalUID で重複排除しながらイベントを集約
    const seenUIDs = new Set();
    const allEvents = [];
    results.forEach((r, i) => {
      if (r.status !== 'fulfilled') return;
      const items = r.value.result.items || [];
      const cal = gcalCalendarList.find(c => c.id === calIds[i]);
      items.forEach(ev => {
        // 重複チェック: iCalUID があればそれで、なければ id + 開始時刻で判定
        const uid = ev.iCalUID || `${ev.id}_${ev.start?.dateTime || ev.start?.date}`;
        if (seenUIDs.has(uid)) return; // 重複スキップ
        seenUIDs.add(uid);
        ev._calColor = cal ? cal.backgroundColor : null;
        ev._calName = cal ? cal.summary : '';
        allEvents.push(ev);
      });
    });

    // API取得が全部終わってから、一括で削除→追加（画面チラつき防止）
    removeGcalEvents();
    gcalEventsToSchedule(allEvents);
    gcalLastSync = new Date();
    saveSchedule();
    refreshMainView();
  } catch (e) {
    console.error('GCal fetch error:', e);
  } finally {
    _gcalSyncing = false;
  }
}

// メイン画面の更新をまとめて実行
function refreshMainView() {
  const now = new Date();
  if (typeof renderTaskList === 'function') renderTaskList(now);
  if (typeof renderEventList === 'function') renderEventList();
  if (typeof renderDayTabs === 'function') renderDayTabs();
}

// --- イベント → scheduleData 変換 ---

function gcalEventsToSchedule(events) {
  events.forEach(ev => {
    // 終日イベントはスキップ（dateTime がない）
    if (!ev.start || !ev.start.dateTime) return;

    const start = new Date(ev.start.dateTime);
    const end = ev.end && ev.end.dateTime ? new Date(ev.end.dateTime) : null;
    const dayOfWeek = start.getDay();
    const startH = start.getHours();
    const startM = start.getMinutes();
    const durationMin = end ? Math.round((end - start) / 60000) : 60;
    // イベント固有色 → カレンダー色 → デフォルト青
    const color = ev.colorId
      ? (GCAL_COLOR_MAP[ev.colorId] || COLORS[0])
      : (ev._calColor || '#3b82f6');

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

// --- カレンダー選択の切り替え ---

function gcalToggleCalendar(calId) {
  if (!gcalSelectedCalendars) gcalSelectedCalendars = [];
  const idx = gcalSelectedCalendars.indexOf(calId);
  if (idx >= 0) {
    gcalSelectedCalendars.splice(idx, 1);
  } else {
    gcalSelectedCalendars.push(calId);
  }
  saveGcalSelection();
  // 同期してからUI更新（多重実行は _gcalSyncing で防止済み）
  gcalFetchEvents().then(() => updateGcalUI());
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

    // カレンダー一覧チェックボックス
    const selected = gcalSelectedCalendars || [];
    const calListHtml = gcalCalendarList.length > 0
      ? gcalCalendarList.map(cal => {
          const checked = selected.includes(cal.id) ? 'checked' : '';
          const label = cal.primary ? `${cal.summary}（メイン）` : cal.summary;
          return `<label class="gcal-cal-item">
            <input type="checkbox" ${checked} onchange="gcalToggleCalendar('${cal.id.replace(/'/g, "\\'")}')">
            <span class="gcal-cal-dot" style="background:${cal.backgroundColor}"></span>
            <span class="gcal-cal-name">${label}</span>
          </label>`;
        }).join('')
      : '<div style="color:var(--g400);font-size:0.8rem;">カレンダーを読み込み中...</div>';

    const syncingLabel = _gcalSyncing ? ' (同期中...)' : '';
    section.innerHTML = `
      <div class="gcal-connected">
        <div class="gcal-status">✅ 連携中${email ? '（' + email + '）' : ''}</div>
        <div class="gcal-cal-list">
          <div class="gcal-cal-list-title">同期するカレンダー</div>
          ${calListHtml}
        </div>
        <div class="gcal-actions">
          <button onclick="gcalSync()" class="gcal-action-btn gcal-sync-btn" ${_gcalSyncing ? 'disabled' : ''}>🔄 今すぐ同期${syncingLabel}</button>
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
  await gcalFetchCalendarList();
  await gcalFetchEvents();
  updateGcalUI();
}

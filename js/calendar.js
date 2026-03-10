// =============================================
//  カレンダー & 記録 (v4 — 緑グラデ)
// =============================================

let calendarLog = {};
let calViewYear, calViewMonth;
let calViewMode = 'month'; // 'month' | 'week'
let calViewWeekStart = null; // 週表示の起点日（日曜）

const SPRITE_SM = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

// ローカルタイムで YYYY-MM-DD を返す（toISOString はUTCなので日本時間でズレる）
function localDateStr(d) {
  if (!d) d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function loadCalendarLog() {
  const raw = localStorage.getItem('junbi_timer_calendar');
  if (raw) { try { calendarLog = JSON.parse(raw); } catch(e) {} }
  const now = new Date();
  calViewYear = now.getFullYear();
  calViewMonth = now.getMonth();
}
function saveCalendarLog() {
  localStorage.setItem('junbi_timer_calendar', JSON.stringify(calendarLog));
}

// --- 記録 ---
function recordCompletion(eventName, points, detail) {
  const key = todayKey();
  if (!calendarLog[key]) {
    calendarLog[key] = { completed: [], missed: [], points: 0, partner: gachaData.partner || null, tasks: {} };
  }
  if (!calendarLog[key].tasks) calendarLog[key].tasks = {};
  if (!calendarLog[key].completed.includes(eventName)) {
    calendarLog[key].completed.push(eventName);
  }
  calendarLog[key].points += points;
  calendarLog[key].partner = gachaData.partner || null;
  // タスク詳細を記録（余裕時間、出発時刻）
  if (detail) {
    calendarLog[key].tasks[eventName] = {
      margin: detail.margin,
      departTime: detail.departTime
    };
  }
  saveCalendarLog();
}

function recordMiss(eventName) {
  const key = todayKey();
  if (!calendarLog[key]) {
    calendarLog[key] = { completed: [], missed: [], points: 0, partner: gachaData.partner || null };
  }
  if (!calendarLog[key].missed.includes(eventName) && !calendarLog[key].completed.includes(eventName)) {
    calendarLog[key].missed.push(eventName);
  }
  saveCalendarLog();
}

function todayKey() {
  return localDateStr();
}

function getDayStatus(dateKey) {
  const log = calendarLog[dateKey];
  if (!log) return 'none';
  if (log.completed.length > 0 && log.missed.length === 0) return 'perfect';
  if (log.completed.length > 0) return 'partial';
  if (log.missed.length > 0) return 'missed';
  return 'none';
}

// --- 完了率クラス ---
function getRateClass(dateKey) {
  const log = calendarLog[dateKey];
  if (!log || (log.completed.length === 0 && log.missed.length === 0)) return 'rate-0';
  const total = log.completed.length + log.missed.length;
  const done = log.completed.length;
  const rate = done / total;
  if (rate >= 1) return 'rate-100';
  if (rate >= 0.5) return 'rate-50';
  if (done >= 1) return 'rate-low';
  return 'rate-0';
}

function getRateIcon(dateKey) {
  const log = calendarLog[dateKey];
  if (!log || (log.completed.length === 0 && log.missed.length === 0)) return '';
  const total = log.completed.length + log.missed.length;
  const done = log.completed.length;
  const rate = done / total;
  if (rate >= 1) return '🌟';
  if (rate >= 0.5) return '🌿';
  if (done >= 1) return '🌱';
  return '';
}

// --- カレンダー描画 (v4: 緑グラデ) ---
function renderCalendar() {
  if (calViewMode === 'week') {
    renderCalendarWeek();
  } else {
    renderCalendarMonth();
  }
}

function renderCalendarMonth() {
  const titleEl = document.getElementById('calTitle');
  const gridEl = document.getElementById('calGrid');
  const totalEl = document.getElementById('calTotal');
  if (!titleEl || !gridEl) return;

  titleEl.textContent = `${calViewYear}年${calViewMonth + 1}月`;
  gridEl.classList.remove('week-view');

  const firstDay = new Date(calViewYear, calViewMonth, 1).getDay();
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const today = new Date();
  const todayStr = localDateStr(today);

  let html = '';
  let daysWithCompleted = 0;
  let totalDaysWithEvents = 0;

  // 空セル
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-cell empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calViewYear}-${String(calViewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayStr;
    const isFuture = new Date(calViewYear, calViewMonth, d) > today;
    const log = calendarLog[dateStr];

    let cls = 'cal-cell';
    if (isToday) cls += ' today';

    if (isFuture) {
      cls += ' future';
    } else {
      const rateClass = getRateClass(dateStr);
      cls += ' ' + rateClass;
      if (log && (log.completed.length > 0 || log.missed.length > 0)) {
        totalDaysWithEvents++;
        if (log.completed.length > 0) daysWithCompleted++;
      }
    }

    const icon = isFuture ? '' : getRateIcon(dateStr);
    const subText = (log && !isFuture && (log.completed.length > 0 || log.missed.length > 0))
      ? `<div class="cal-sub">${log.completed.length}/${log.completed.length + log.missed.length}</div>` : '';

    const clickAttr = (!isFuture && log && (log.completed.length > 0 || log.missed.length > 0))
      ? `onclick="showDayDetail('${dateStr}')" style="cursor:pointer;"` : '';
    html += `<div class="${cls}" ${clickAttr}>${d}${subText}${icon ? `<div class="cal-mini">${icon}</div>` : ''}</div>`;
  }

  gridEl.innerHTML = html;

  if (totalEl) {
    totalEl.textContent = `🌟 ${daysWithCompleted}/${totalDaysWithEvents || 0}日 できた`;
  }
}

function renderCalendarWeek() {
  const titleEl = document.getElementById('calTitle');
  const gridEl = document.getElementById('calGrid');
  const totalEl = document.getElementById('calTotal');
  if (!titleEl || !gridEl) return;

  if (!calViewWeekStart) {
    const now = new Date();
    calViewWeekStart = new Date(now);
    calViewWeekStart.setDate(calViewWeekStart.getDate() - calViewWeekStart.getDay());
    calViewWeekStart.setHours(0, 0, 0, 0);
  }

  // タイトル: 「3/8 〜 3/14」形式
  const weekEnd = new Date(calViewWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  titleEl.textContent = `${calViewWeekStart.getMonth()+1}/${calViewWeekStart.getDate()} 〜 ${weekEnd.getMonth()+1}/${weekEnd.getDate()}`;

  gridEl.classList.add('week-view');

  const today = new Date();
  const todayStr = localDateStr(today);

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(calViewWeekStart);
    d.setDate(d.getDate() + i);
    const dateStr = localDateStr(d);
    const isToday = dateStr === todayStr;
    const isFuture = d > today;
    const log = calendarLog[dateStr];
    const dayOfWeek = d.getDay();

    let cls = 'cal-cell';
    if (isToday) cls += ' today';

    if (isFuture) {
      cls += ' future';
    } else {
      cls += ' ' + getRateClass(dateStr);
    }

    const icon = isFuture ? '' : getRateIcon(dateStr);
    const subText = (log && !isFuture && (log.completed.length > 0 || log.missed.length > 0))
      ? `<div class="cal-sub">${log.completed.length}/${log.completed.length + log.missed.length}</div>` : '';

    // 週表示: その曜日の予定を表示
    let eventsHtml = '';
    if (typeof scheduleData !== 'undefined') {
      const dayEvents = scheduleData[dayOfWeek] || [];
      if (dayEvents.length > 0) {
        const items = dayEvents.slice(0, 3).map(ev => {
          const timeStr = `${ev.startH}:${String(ev.startM).padStart(2,'0')}`;
          return `<div class="cal-ev-dot"><span style="color:${ev.color}">●</span> ${timeStr} ${ev.name}</div>`;
        }).join('');
        eventsHtml = `<div class="cal-cell-events">${items}</div>`;
      }
    }

    const clickAttr = (!isFuture && log && (log.completed.length > 0 || log.missed.length > 0))
      ? `onclick="showDayDetail('${dateStr}')" style="cursor:pointer;"` : '';

    html += `<div class="${cls}" ${clickAttr}>${d.getDate()}${subText}${icon ? `<div class="cal-mini">${icon}</div>` : ''}${eventsHtml}</div>`;
  }

  gridEl.innerHTML = html;

  if (totalEl) {
    totalEl.textContent = '';
  }
}

// --- calcTotalDays: 全期間で1つでも完了した日数 ---
function calcTotalDays() {
  let count = 0;
  Object.keys(calendarLog).forEach(key => {
    const log = calendarLog[key];
    if (log && log.completed && log.completed.length > 0) count++;
  });
  return count;
}

// --- calcStreak: 連続日数 ---
function calcStreak() {
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = localDateStr(d);
    const day = d.getDay();
    const events = (typeof scheduleData !== 'undefined' && scheduleData[day]) ? scheduleData[day] : [];
    if (events.length === 0) continue;
    const status = getDayStatus(key);
    if (status === 'perfect' || status === 'partial') {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

// --- ビュー切り替え ---
function setCalView(mode) {
  calViewMode = mode;
  const btnM = document.getElementById('calBtnMonth');
  const btnW = document.getElementById('calBtnWeek');
  if (btnM) btnM.classList.toggle('active', mode === 'month');
  if (btnW) btnW.classList.toggle('active', mode === 'week');
  if (mode === 'week' && !calViewWeekStart) {
    // 今週の日曜を起点にする
    const now = new Date();
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    calViewWeekStart = d;
  }
  renderCalendar();
}

// --- ◀ ▶ 統合ナビ ---
function calPrev() {
  if (calViewMode === 'month') {
    calViewMonth--;
    if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
  } else {
    calViewWeekStart = new Date(calViewWeekStart);
    calViewWeekStart.setDate(calViewWeekStart.getDate() - 7);
  }
  renderCalendar();
}
function calNext() {
  if (calViewMode === 'month') {
    calViewMonth++;
    if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  } else {
    calViewWeekStart = new Date(calViewWeekStart);
    calViewWeekStart.setDate(calViewWeekStart.getDate() + 7);
  }
  renderCalendar();
}

// 後方互換
function calPrevMonth() { calPrev(); }
function calNextMonth() { calNext(); }

// ====================================================
//  カレンダー日付タップ → その日の記録ポップアップ
// ====================================================
function showDayDetail(dateStr) {
  const log = calendarLog[dateStr];
  if (!log) return;

  const d = new Date(dateStr + 'T00:00:00');
  const weekday = WEEKDAY_NAMES[d.getDay()];
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const tasks = log.tasks || {};

  let cardsHtml = '';

  // 完了タスク
  for (const name of (log.completed || [])) {
    const detail = tasks[name];
    let marginHtml = '';
    if (detail && detail.margin !== undefined) {
      const mg = getMarginMessage(detail.margin);
      marginHtml = `<div class="journal-task-margin ${mg.cls}">${mg.icon} ${mg.text}</div>`;
    }
    const timeHtml = detail && detail.departTime
      ? `<span class="journal-task-time">${detail.departTime} しゅっぱつ</span>` : '';
    cardsHtml += `
      <div class="journal-task-card journal-task-done">
        <div class="journal-task-top">
          <span class="journal-task-name">✅ ${name}</span>
          ${timeHtml}
        </div>
        ${marginHtml}
      </div>`;
  }

  // missedタスク
  for (const name of (log.missed || [])) {
    cardsHtml += `
      <div class="journal-task-card journal-task-missed">
        <div class="journal-task-top">
          <span class="journal-task-name">😢 ${name}</span>
        </div>
        <div class="journal-task-margin margin-miss">💪 つぎは がんばろう！</div>
      </div>`;
  }

  // ポケモンイベント
  let pokeHtml = '';
  if (typeof gachaData !== 'undefined' && gachaData.history) {
    const pokes = [];
    for (const [idStr, hist] of Object.entries(gachaData.history)) {
      if (hist.date === dateStr) {
        const id = Number(idStr);
        pokes.push({
          id: id,
          name: typeof findPokeName === 'function' ? findPokeName(id) : `No.${id}`,
          method: hist.method || ''
        });
      }
    }
    if (pokes.length > 0) {
      const items = pokes.map(pe => {
        const icon = pe.method === 'さいしょのともだち' ? '🌱' : pe.method === 'しんか' ? '✨' : '🔮';
        return `<div class="day-detail-poke">${icon}<img src="${SPRITE_SM}${pe.id}.png" class="journal-poke-sprite"> ${pe.name}</div>`;
      }).join('');
      pokeHtml = `<div style="margin-top:8px;">${items}</div>`;
    }
  }

  const icon = getRateIcon(dateStr);
  const pts = log.points ? `<span class="journal-date-pts">+${log.points}pt</span>` : '';
  const total = (log.completed || []).length + (log.missed || []).length;
  const done = (log.completed || []).length;

  showOverlay(`
    <div class="day-detail-panel">
      <div class="day-detail-header">
        <div class="day-detail-date">${m}/${day}（${weekday}）${icon} ${pts}</div>
        <button onclick="hideOverlay()" class="btn-close-sm">✕</button>
      </div>
      <div class="day-detail-summary">${done}/${total} できた</div>
      <div class="day-detail-cards">${cardsHtml}</div>
      ${pokeHtml}
    </div>
  `);
}

// ====================================================
//  にっき（がんばり日記）
// ====================================================
const WEEKDAY_NAMES = ['日','月','火','水','木','金','土'];

function getMarginMessage(margin) {
  if (margin >= 10) return { text: `${margin}分まえに じゅんびできた！すごい！`, icon: '🌟', cls: 'margin-great' };
  if (margin >= 5)  return { text: `${margin}分まえに じゅんびできた！`, icon: '✨', cls: 'margin-good' };
  if (margin >= 1)  return { text: `${margin}分まえに しゅっぱつ！`, icon: '👍', cls: 'margin-ok' };
  return { text: 'じかんぴったり しゅっぱつ！', icon: '🏃', cls: 'margin-just' };
}

function showJournal() {
  const allDates = Object.keys(calendarLog).sort((a, b) => b.localeCompare(a));
  const totalDays = calcTotalDays();
  const streak = calcStreak();

  if (allDates.length === 0 && (!gachaData.history || Object.keys(gachaData.history).length === 0)) {
    showOverlay(`
      <div class="journal-panel">
        <div class="journal-header">
          <div class="journal-title">📔 がんばりにっき</div>
          <button onclick="hideOverlay()" class="btn-close-sm">とじる</button>
        </div>
        <div class="journal-empty">まだ きろくが ないよ。<br>タスクを がんばろう！</div>
      </div>
    `);
    return;
  }

  // --- 次の予定セクション ---
  let nextHtml = '';
  const now = new Date();
  const todayEvents = (typeof scheduleData !== 'undefined' && scheduleData[now.getDay()]) || [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const upcoming = todayEvents
    .filter(ev => {
      const evKey = `${ev.name}-${ev.startH}:${ev.startM}`;
      return (ev.startH * 60 + ev.startM) > nowMin && !completedEvents[evKey] && !missedEvents[evKey];
    })
    .sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));

  if (upcoming.length > 0) {
    const nxt = upcoming[0];
    const endMin = nxt.startH * 60 + nxt.startM + nxt.durationMin;
    const endStr = `${Math.floor(endMin/60)}:${String(endMin%60).padStart(2,'0')}`;
    const todosStr = nxt.todos && nxt.todos.length > 0 ? `<div class="journal-next-todos">📝 ${nxt.todos.join('・')}</div>` : '';
    nextHtml = `
      <div class="journal-next">
        <div class="journal-next-label">📣 つぎの予定</div>
        <div class="journal-next-name">${nxt.name}</div>
        <div class="journal-next-time">${nxt.startH}:${String(nxt.startM).padStart(2,'0')} 〜 ${endStr}</div>
        ${todosStr}
      </div>
    `;
  }

  // --- 日ごとのエントリー ---
  // ポケモンイベントも日付別にまとめる
  const pokeEvents = {};
  if (typeof gachaData !== 'undefined' && gachaData.history) {
    for (const [idStr, hist] of Object.entries(gachaData.history)) {
      const id = Number(idStr);
      const date = hist.date;
      if (!date) continue;
      if (!pokeEvents[date]) pokeEvents[date] = [];
      pokeEvents[date].push({
        id: id,
        name: typeof findPokeName === 'function' ? findPokeName(id) : `No.${id}`,
        method: hist.method || '???'
      });
    }
  }

  // カレンダーログ + ポケモン履歴の全日付
  const allDatesSet = new Set(allDates);
  Object.keys(pokeEvents).forEach(d => allDatesSet.add(d));
  const sortedDates = [...allDatesSet].sort((a, b) => b.localeCompare(a));

  let entriesHtml = '';
  for (const dateStr of sortedDates) {
    const d = new Date(dateStr + 'T00:00:00');
    const weekday = WEEKDAY_NAMES[d.getDay()];
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const log = calendarLog[dateStr];
    const pokes = pokeEvents[dateStr] || [];

    const hasLog = log && (log.completed.length > 0 || log.missed.length > 0);
    const hasPoke = pokes.length > 0;
    if (!hasLog && !hasPoke) continue;

    const icon = getRateIcon(dateStr);
    const tasks = (log && log.tasks) ? log.tasks : {};

    let taskCards = '';

    // 完了タスクをカードで表示
    if (log && log.completed.length > 0) {
      for (const taskName of log.completed) {
        const detail = tasks[taskName];
        let marginHtml = '';
        if (detail && detail.margin !== undefined) {
          const mg = getMarginMessage(detail.margin);
          marginHtml = `<div class="journal-task-margin ${mg.cls}">${mg.icon} ${mg.text}</div>`;
        }
        const timeHtml = detail && detail.departTime
          ? `<span class="journal-task-time">${detail.departTime} しゅっぱつ</span>` : '';

        taskCards += `
          <div class="journal-task-card journal-task-done">
            <div class="journal-task-top">
              <span class="journal-task-name">✅ ${taskName}</span>
              ${timeHtml}
            </div>
            ${marginHtml}
          </div>
        `;
      }
    }

    // 間に合わなかったタスク
    if (log && log.missed.length > 0) {
      for (const taskName of log.missed) {
        taskCards += `
          <div class="journal-task-card journal-task-missed">
            <div class="journal-task-top">
              <span class="journal-task-name">😢 ${taskName}</span>
              <span class="journal-task-time">まにあわなかった</span>
            </div>
            <div class="journal-task-margin margin-miss">💪 つぎは がんばろう！</div>
          </div>
        `;
      }
    }

    // ポケモンイベント（小さく表示）
    let pokeHtml = '';
    if (pokes.length > 0) {
      const pokeItems = pokes.map(pe => {
        const methodIcon = pe.method === 'さいしょのともだち' ? '🌱'
                         : pe.method === 'しんか' ? '✨'
                         : pe.method.includes('マイルストーン') ? '🎉'
                         : '🔮';
        let methodText = pe.method === 'さいしょのともだち' ? `${pe.name}を えらんだ`
                       : pe.method === 'しんか' ? `${pe.name}に しんか！`
                       : pe.method.includes('マイルストーン') ? `${pe.name}が やってきた！`
                       : `${pe.name}が なかまに`;
        return `<span class="journal-poke-item">${methodIcon}<img src="${SPRITE_SM}${pe.id}.png" class="journal-poke-sprite">${methodText}</span>`;
      }).join('');
      pokeHtml = `<div class="journal-poke-row">${pokeItems}</div>`;
    }

    entriesHtml += `
      <div class="journal-entry">
        <div class="journal-date">
          <span class="journal-date-text">${m}/${day}（${weekday}）</span>
          ${icon ? `<span class="journal-date-icon">${icon}</span>` : ''}
          ${log && log.points ? `<span class="journal-date-pts">+${log.points}pt</span>` : ''}
        </div>
        ${taskCards}
        ${pokeHtml}
      </div>
    `;
  }

  showOverlay(`
    <div class="journal-panel">
      <div class="journal-header">
        <div class="journal-title">📔 がんばりにっき</div>
        <button onclick="hideOverlay()" class="btn-close-sm">とじる</button>
      </div>
      <div class="journal-stats">
        <span class="journal-stat">🌟 ${totalDays}日がんばった</span>
        <span class="journal-stat">🔥 ${streak}日れんぞく</span>
      </div>
      ${nextHtml}
      <div class="journal-entries">${entriesHtml}</div>
    </div>
  `);
}

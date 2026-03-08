// =============================================
//  設定画面
// =============================================

function openSettings() {
  selectedDay = new Date().getDay();
  renderDayTabs();
  renderEventList();
  // しきい値の現在値をセット
  const thCaution = document.getElementById('thCaution');
  const thWarning = document.getElementById('thWarning');
  const thCritical = document.getElementById('thCritical');
  if (thCaution) thCaution.value = urgencyThresholds.caution;
  if (thWarning) thWarning.value = urgencyThresholds.warning;
  if (thCritical) thCritical.value = urgencyThresholds.critical;
  if (typeof updateGcalUI === 'function') updateGcalUI();
  // ?debug でメンテナンスセクション表示
  const maint = document.getElementById('maintSection');
  if (maint) maint.style.display = location.search.includes('debug') ? '' : 'none';
  document.getElementById('settingsOverlay').classList.remove('hidden');
}

function updateThreshold(key, val) {
  urgencyThresholds[key] = val;
  // 整合性チェック: critical < warning < caution
  if (urgencyThresholds.critical >= urgencyThresholds.warning) {
    urgencyThresholds.warning = urgencyThresholds.critical + 1;
    const el = document.getElementById('thWarning');
    if (el) el.value = urgencyThresholds.warning;
  }
  if (urgencyThresholds.warning >= urgencyThresholds.caution) {
    urgencyThresholds.caution = urgencyThresholds.warning + 1;
    const el = document.getElementById('thCaution');
    if (el) el.value = urgencyThresholds.caution;
  }
  saveUrgencyThresholds();
}
function closeSettings() {
  document.getElementById('settingsOverlay').classList.add('hidden');
}

function renderDayTabs() {
  const el = document.getElementById('dayTabs');
  if (!el) return;
  el.innerHTML = DAY_NAMES.map((name, i) => {
    const cls = i === selectedDay ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50';
    const count = (scheduleData[i] || []).length;
    return `<button onclick="selectDay(${i})" class="${cls} font-bold px-3 py-2 rounded-xl text-sm transition-colors whitespace-nowrap border border-gray-100">${name} <span class="text-xs opacity-70">(${count})</span></button>`;
  }).join('');
}

function selectDay(d) { selectedDay = d; renderDayTabs(); renderEventList(); }

function renderEventList() {
  const events = scheduleData[selectedDay] || [];
  const container = document.getElementById('eventList');
  if (!container) return;
  if (events.length === 0) {
    container.innerHTML = '<div class="ev-empty">予定がありません</div>';
    return;
  }
  container.innerHTML = events.map((ev, i) => {
    const timeVal = `${String(ev.startH).padStart(2,'0')}:${String(ev.startM).padStart(2,'0')}`;
    const todos = ev.todos || [];
    const todosHtml = todos.map((t, ti) =>
      `<span class="ev-tag">${t}<button class="ev-tag-del" onclick="removeTodo(${i},${ti})">✕</button></span>`
    ).join('') + `<button class="ev-tag-add" onclick="promptAddTodo(${i})">＋ ついか</button>`;

    const colorBar = COLORS.map(c =>
      `<div class="ev-color-seg${ev.color===c?' sel':''}" style="background:${c};" onclick="updateEvent(${i},'color','${c}')"></div>`
    ).join('');

    return `
    <div class="ev-card">
      <div class="ev-card-top" style="background:linear-gradient(135deg, ${ev.color}18, ${ev.color}08);">
        <input type="text" class="ev-name-input" value="${ev.name}"
          onchange="updateEvent(${i},'name',this.value)">
        <button class="ev-del-btn" onclick="confirmRemoveEvent(${i})">✕</button>
      </div>
      <div class="ev-sections">
        <div class="ev-section">
          <span class="ev-sec-icon">🕐</span>
          <div class="ev-sec-content">
            <div class="ev-sec-label">開始じかん</div>
            <input type="time" class="ev-sec-input" value="${timeVal}"
              onchange="updateEventTime(${i},this.value)">
          </div>
          <div class="ev-sec-divider"></div>
          <div class="ev-sec-content">
            <div class="ev-sec-label">ながさ</div>
            <div class="ev-sec-row">
              <input type="number" class="ev-sec-input ev-sec-input-num" value="${ev.durationMin}"
                min="5" max="240" step="5" onchange="updateEvent(${i},'durationMin',+this.value)">
              <span class="ev-sec-unit">分</span>
            </div>
          </div>
        </div>
        <div class="ev-section ev-section-col">
          <div class="ev-sec-header">
            <span class="ev-sec-icon">🎒</span>
            <span class="ev-sec-label">もちもの</span>
          </div>
          <div class="ev-tags">${todosHtml}</div>
        </div>
        <div class="ev-color-wrap">
          <div class="ev-sec-label">いろ</div>
          <div class="ev-color-strip">${colorBar}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function removeTodo(evIdx, todoIdx) {
  const ev = scheduleData[selectedDay][evIdx];
  if (!ev || !ev.todos) return;
  ev.todos.splice(todoIdx, 1);
  saveSchedule();
  renderEventList();
}

function promptAddTodo(evIdx) {
  const text = prompt('もちものを入力してね');
  if (!text || !text.trim()) return;
  const ev = scheduleData[selectedDay][evIdx];
  if (!ev.todos) ev.todos = [];
  // カンマ・読点で分割して複数追加可能
  text.split(/[、,]/).map(s => s.trim()).filter(Boolean).forEach(t => ev.todos.push(t));
  saveSchedule();
  renderEventList();
}

function confirmRemoveEvent(i) {
  const ev = scheduleData[selectedDay][i];
  if (!ev) return;
  if (confirm(`「${ev.name}」を消してもいい？`)) {
    removeEvent(i);
  }
}

function addEvent() {
  if (!scheduleData[selectedDay]) scheduleData[selectedDay] = [];
  scheduleData[selectedDay].push({ name:'あたらしい予定', startH:15, startM:0, durationMin:60, prepMin:15, color:COLORS[scheduleData[selectedDay].length % COLORS.length], todos:[] });
  saveSchedule(); renderEventList();
}
function removeEvent(i) { scheduleData[selectedDay].splice(i,1); saveSchedule(); renderEventList(); }
function updateEvent(i,key,val) { scheduleData[selectedDay][i][key]=val; saveSchedule(); if(key==='color') renderEventList(); }
function updateEventTime(i,val) { const [h,m]=val.split(':').map(Number); scheduleData[selectedDay][i].startH=h; scheduleData[selectedDay][i].startM=m; saveSchedule(); }
function updateTodos(i,val) { scheduleData[selectedDay][i].todos = val.split(/[、,]/).map(s=>s.trim()).filter(Boolean); saveSchedule(); }
function copyToAllDays() {
  const dayName = DAY_NAMES[selectedDay];
  if (!confirm(`${dayName}曜日の予定を全曜日にコピーします。他の曜日の予定は上書きされますが、よろしいですか？`)) return;
  const src = JSON.parse(JSON.stringify(scheduleData[selectedDay]||[]));
  for (let i=0;i<7;i++) scheduleData[i]=JSON.parse(JSON.stringify(src));
  saveSchedule(); renderDayTabs(); renderEventList();
}

// =============================================
//  リセット
// =============================================
function resetData(target) {
  const labels = {
    schedule: '予定データ', pokemon: 'ポケモンデータ',
    calendar: 'カレンダー記録', points: 'ポイント', all: 'すべてのデータ'
  };
  if (!confirm(`「${labels[target]}」をリセットします。よろしいですか？`)) return;
  if (target === 'all' && !confirm('本当にすべて消しますか？ 元に戻せません。')) return;

  if (target === 'schedule' || target === 'all') {
    localStorage.removeItem('junbi_timer_schedule');
    for (let i = 0; i < 7; i++) scheduleData[i] = [];
    renderDayTabs(); renderEventList();
  }
  if (target === 'pokemon' || target === 'all') {
    localStorage.removeItem('junbi_timer_gacha');
    if (typeof gachaData !== 'undefined') {
      gachaData.collection = []; gachaData.partner = null;
      gachaData.friendship = {}; gachaData.milestones = [];
      gachaData.history = {}; gachaData.points = 0;
    }
    if (typeof updatePartnerDisplay === 'function') updatePartnerDisplay('calm');
    if (typeof updateStats === 'function') updateStats();
  }
  if (target === 'calendar' || target === 'all') {
    localStorage.removeItem('junbi_timer_calendar');
    if (typeof calendarLog !== 'undefined') {
      for (const k in calendarLog) delete calendarLog[k];
    }
    if (typeof renderCalendar === 'function') renderCalendar();
  }
  if (target === 'points' || target === 'all') {
    if (typeof gachaData !== 'undefined') {
      gachaData.points = 0;
      if (typeof saveGachaData === 'function') saveGachaData();
    }
    if (typeof updateStats === 'function') updateStats();
  }
  if (target === 'all') {
    localStorage.removeItem('junbi_timer_urgency');
  }
  alert('リセットしました');
}

// =============================================
//  デバッグ
// =============================================
let debugTimeOverride = null;

function toggleDebugSection() {
  const sec = document.getElementById('debugSection');
  const arrow = document.getElementById('debugToggleArrow');
  if (!sec) return;
  const hidden = sec.style.display === 'none';
  sec.style.display = hidden ? 'block' : 'none';
  if (arrow) arrow.textContent = hidden ? '▼' : '▶';
}

function debugSetTime() {
  const input = document.getElementById('debugTimeInput');
  if (!input || !input.value) return;
  const [h, m] = input.value.split(':').map(Number);
  debugTimeOverride = { h, m };
  const status = document.getElementById('debugTimeStatus');
  if (status) status.textContent = `オーバーライド中: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function debugClearTime() {
  debugTimeOverride = null;
  const status = document.getElementById('debugTimeStatus');
  if (status) status.textContent = '現在: リアルタイム';
}

function debugGetNow() {
  if (!debugTimeOverride) return new Date();
  const now = new Date();
  now.setHours(debugTimeOverride.h, debugTimeOverride.m, 0, 0);
  return now;
}

function debugAddDays(n) {
  // カレンダーログに過去n日分のダミー記録を追加
  if (typeof calendarLog === 'undefined') return;
  const today = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!calendarLog[key]) calendarLog[key] = { events: [{ name:'デバッグ', departed: true }] };
  }
  if (typeof saveCalendarLog === 'function') saveCalendarLog();
  if (typeof renderCalendar === 'function') renderCalendar();
  if (typeof updateStats === 'function') updateStats();
  if (typeof checkMilestone === 'function') checkMilestone();
}

function debugAddPoints(n) {
  if (typeof addPoints === 'function') addPoints(n);
}

function debugAddFriendship(n) {
  if (typeof gachaData === 'undefined' || !gachaData.partner) return;
  const pid = gachaData.partner;
  if (!gachaData.friendship[pid]) gachaData.friendship[pid] = { exp: 0, level: 0 };
  gachaData.friendship[pid].exp += n;
  if (typeof saveGachaData === 'function') saveGachaData();
  if (typeof updatePartnerDisplay === 'function') updatePartnerDisplay('calm');
}

function debugTriggerPrep() {
  if (typeof missionState !== 'undefined') missionState = 'prep';
  if (typeof tick === 'function') tick();
}

function debugTriggerMilestone() {
  if (typeof checkMilestone === 'function') {
    checkMilestone(true);
  } else {
  }
}

// =============================================
//  フローティングデバッグバー（?debug時）
// =============================================
let dbSliderActive = false; // スライダー操作中はtickの時刻更新を止める

(function initDebugBar() {
  if (!location.search.includes('debug')) return;
  const bar = document.getElementById('debugBar');
  if (bar) bar.style.display = 'flex';
  document.body.classList.add('debug-mode');
})();

function dbSetState(state) {
  // ボタンのハイライト更新
  document.querySelectorAll('#debugBar .db-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const events = scheduleData[new Date().getDay()] || [];
  const firstEv = events[0] || { name:'テスト', startH:16, startM:0, durationMin:60, prepMin:15, todos:['えんぴつ','ノート'], color:'#3b82f6' };

  switch (state) {
    case 'idle':
      missionState = 'idle';
      activeEvent = null;
      completedEvents = {};
      missedEvents = {};
      departTime = null;
      // 最初の予定の1時間前にセット
      debugTimeOverride = { h: Math.max(0, firstEv.startH - 1), m: firstEv.startM };
      dbSliderActive = true;
      transitionTo('idle', null);
      document.getElementById('dbSlider').value = 60;
      document.getElementById('dbSliderVal').textContent = '60分';
      updateRingGauge(60);
      activeEvent = firstEv;
      renderFocusCard(debugGetNow());
      renderTaskList(debugGetNow());
      updatePartnerDisplay('calm');
      break;

    case 'prep':
      dbSliderActive = true;
      activeEvent = firstEv;
      missionState = 'idle'; // transitionToでprepに遷移
      transitionTo('prep', firstEv);
      dbOnSlider(+document.getElementById('dbSlider').value);
      break;

    case 'out':
      dbSliderActive = false;
      activeEvent = firstEv;
      departTime = new Date();
      transitionTo('out', firstEv);
      renderFocusCard(new Date());
      renderTaskList(new Date());
      break;

    case 'okaeri':
      activeEvent = firstEv;
      const evKey = `${firstEv.name}-${firstEv.startH}:${firstEv.startM}`;
      completedEvents[evKey] = true;
      transitionTo('okaeri', firstEv);
      populateOkaeriOverlay();
      break;

    case 'missed':
      activeEvent = firstEv;
      transitionTo('missed', firstEv);
      break;
  }
  updateStats();
}

function dbOnSlider(min) {
  dbSliderActive = true;
  const label = document.getElementById('dbSliderVal');
  if (label) label.textContent = min + '分';

  // 次の予定の開始時刻からmin分前の時刻を計算してオーバーライド
  const events = scheduleData[new Date().getDay()] || [];
  const ev = activeEvent || events[0];
  if (ev) {
    const evStartMin = ev.startH * 60 + ev.startM;
    const targetMin = evStartMin - min;
    const h = Math.floor(targetMin / 60);
    const m = targetMin % 60;
    debugTimeOverride = { h: Math.max(0, h), m: Math.max(0, m) };
    activeEvent = ev;
    if (min > 0) {
      missionState = min <= urgencyThresholds.caution ? 'prep' : 'idle';
      transitionTo(missionState, ev);
    }
  }

  // リングゲージと画面を即座に更新
  updateRingGauge(min);
  const now = debugGetNow();
  renderFocusCard(now);
  renderTaskList(now);
  updatePartnerSpeech(getUrgencyLevel(min));
  updatePartnerDisplay(getUrgencyLevel(min));
}

function dbEncounter() {
  const events = scheduleData[new Date().getDay()] || [];
  const ev = events[0] || { name:'テスト', startH:16, startM:0, durationMin:60, prepMin:15, todos:[], color:'#3b82f6' };
  if (typeof tryEncounter === 'function') {
    // 確率無視で強制発動
    const rarity = ['C','C','C','C','R','SR'][Math.floor(Math.random() * 6)];
    const pool = POKEDEX.filter(p => p.r === rarity);
    const unowned = pool.filter(p => !gachaData.collection.includes(p.id));
    const candidates = unowned.length > 0 ? unowned : pool;
    const poke = candidates[Math.floor(Math.random() * candidates.length)];
    const isNew = !gachaData.collection.includes(poke.id);
    if (isNew) gachaData.collection.push(poke.id);
    if (!gachaData.friendship[poke.id]) gachaData.friendship[poke.id] = { exp: 0 };
    recordHistory(poke.id, ev.name);
    saveGachaData();
    showEncounterAnimation(poke, isNew, ev.name);
  }
}

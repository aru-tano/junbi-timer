// =============================================
//  ミッション v4 — 状態マシン
//  idle / prep / out / okaeri / missed
// =============================================

let missionState = 'idle';
let activeEvent = null;
let notifiedEvents = {};
let completedEvents = {};
let missedEvents = {};
let wakeLock = null;
let departTime = null; // しゅっぱつ時刻

// レベル別セリフ（Lv3以上で親密なセリフが混ざる、Lv5以上でさらに）
const SPEECHES_BASE = {
  calm:     ['きょうもがんばろ！', 'まだ じかん あるよ〜', 'ゆっくり じゅんびしよ'],
  caution:  ['そろそろ じゅんび しよっか', 'じかん あるから だいじょうぶ！', 'もちもの チェック！'],
  warning:  ['そろそろ だよ！じゅんび！', 'がんばれ〜！いそいで！', 'えんぴつ もった？'],
  critical: ['いそいで！！もうすぐ！', 'はやくはやく〜！🔥', 'まにあうよ！ダッシュ！'],
  out:      ['まってるよ〜！がんばって！', 'おうえん してるよ！', 'はやく かえってきてね！'],
};
const SPEECHES_LV3 = {
  calm:     ['きみと いると たのしいな♪', 'きょうも いっしょだね！'],
  caution:  ['いっしょに じゅんび しよ！', 'ぼくも てつだうよ！'],
  warning:  ['きみなら できる！しんじてる！', 'いそげ〜！おうえんしてる！'],
  critical: ['だいじょうぶ！ぼくが ついてる！', 'ぜったい まにあう！いくよ！'],
  out:      ['はやく かえってきて！さみしいよ〜', 'きみの こと おうえん してるよ！'],
};
const SPEECHES_LV5 = {
  calm:     ['しんゆう と すごす じかん さいこう！', 'きみが いてくれて しあわせ！'],
  caution:  ['ふたりなら なんでも できるよ！', 'いつも ありがとう！'],
  warning:  ['しんゆうの ピンチ！ぼくも がんばる！', 'いっしょに ダッシュ！！'],
  critical: ['ぼくたちの きずなで のりこえよう！', 'さいきょうコンビ ここにあり！🔥'],
  out:      ['ずっと まってるからね！', 'かえったら いっぱい あそぼ！'],
};

function getSpeechesByLevel(level) {
  const result = {};
  for (const key of Object.keys(SPEECHES_BASE)) {
    const arr = [...SPEECHES_BASE[key]];
    if (level >= 3) arr.push(...(SPEECHES_LV3[key] || []));
    if (level >= 5) arr.push(...(SPEECHES_LV5[key] || []));
    result[key] = arr;
  }
  return result;
}

// 後方互換
const SPEECHES = SPEECHES_BASE;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// --- 毎秒チェック ---
function checkMission(now) {
  // デバッグバーのスライダー操作中は自動遷移を止める
  if (typeof dbSliderActive !== 'undefined' && dbSliderActive) {
    renderFocusCard(now);
    renderTaskList(now);
    updateStats();
    return;
  }

  const events = scheduleData[now.getDay()] || [];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // out/okaeri 状態は手動遷移まで維持
  if (missionState === 'out') {
    renderFocusCard(now);
    renderTaskList(now);
    updateStats();
    return;
  }
  if (missionState === 'okaeri' || missionState === 'missed') {
    renderTaskList(now);
    updateStats();
    return;
  }

  // 設定画面が開いている間はmissed判定を止める
  const settingsOpen = !document.getElementById('settingsOverlay')?.classList.contains('hidden');

  // 次の未完了イベントを探す
  let nextEv = null;
  let nextPrepStart = Infinity;

  events.forEach(ev => {
    const evKey = `${ev.name}-${ev.startH}:${ev.startM}`;
    if (completedEvents[evKey] || missedEvents[evKey]) return;
    // 設定画面が開いている間、または編集中の予定はmissed判定をスキップ
    if (settingsOpen || ev._editing) return;
    const prepStart = ev.startH * 60 + ev.startM - urgencyThresholds.caution;
    const evStart = ev.startH * 60 + ev.startM;
    if (nowMin >= evStart) {
      // 時間が過ぎた → missed（ただし起動直後は静かにスキップ）
      if (!missedEvents[evKey]) {
        missedEvents[evKey] = true;
        if (typeof _appBooted !== 'undefined' && _appBooted) {
          if (typeof recordMiss === 'function') recordMiss(ev.name);
          transitionTo('missed', ev);
          return;
        }
      }
      return;
    }
    if (prepStart < nextPrepStart) {
      nextPrepStart = prepStart;
      nextEv = ev;
    }
  });

  if (missionState === 'missed') return; // missed遷移直後

  if (!nextEv) {
    activeEvent = null;
    missionState = 'idle';
    renderFocusCard(now);
    renderTaskList(now);
    updateStats();
    return;
  }

  const diff = nextPrepStart - nowMin;

  if (diff <= 0 && missionState === 'idle') {
    // prep時間到達
    activeEvent = nextEv;
    const evKey = `${nextEv.name}-${nextEv.startH}:${nextEv.startM}`;
    if (!notifiedEvents[evKey]) {
      notifiedEvents[evKey] = true;
      playGentleChime();
    }
    transitionTo('prep', nextEv);
  } else if (missionState === 'idle') {
    activeEvent = nextEv;
  }

  renderFocusCard(now);
  renderTaskList(now);
  updateStats();
}

// --- 状態遷移 ---
function transitionTo(state, ev) {
  missionState = state;
  const focusCard  = document.getElementById('focusCard');
  const outingCard = document.getElementById('outingCard');
  const taskList   = document.getElementById('taskList');
  const btnDepart  = document.getElementById('btnDepart');
  const okaeriOv   = document.getElementById('okaeriOverlay');
  const missedOv   = document.getElementById('missedOverlay');

  // 全リセット
  if (focusCard)  focusCard.classList.remove('hidden');
  if (outingCard) outingCard.classList.remove('visible');
  if (taskList)   taskList.classList.remove('hidden');
  if (btnDepart)  btnDepart.classList.add('hidden');
  if (okaeriOv)   okaeriOv.classList.remove('visible');
  if (missedOv)   missedOv.classList.remove('visible');

  switch (state) {
    case 'idle':
      break;

    case 'prep':
      if (btnDepart) btnDepart.classList.remove('hidden');
      break;

    case 'out':
      if (focusCard)  focusCard.classList.add('hidden');
      if (outingCard) outingCard.classList.add('visible');
      if (ev) {
        const endMin = ev.startH * 60 + ev.startM + ev.durationMin;
        const endStr = `${Math.floor(endMin/60)}:${String(endMin%60).padStart(2,'0')}`;
        const outText = document.getElementById('outingText');
        const outSub  = document.getElementById('outingSub');
        if (outText) outText.textContent = `${ev.name} いってらっしゃい！`;
        if (outSub) outSub.textContent = `${ev.startH}:${String(ev.startM).padStart(2,'0')} 〜 ${endStr}`;
      }
      updatePartnerSpeech('out');
      break;

    case 'okaeri':
      if (focusCard)  focusCard.classList.add('hidden');
      if (outingCard) outingCard.classList.remove('visible');
      if (taskList)   taskList.classList.remove('hidden');
      populateOkaeriOverlay();
      if (okaeriOv) okaeriOv.classList.add('visible');
      break;

    case 'missed':
      if (focusCard) focusCard.classList.add('hidden');
      populateMissedOverlay(ev);
      if (missedOv) missedOv.classList.add('visible');
      break;
  }
}

// --- フォーカスカード描画 ---
function renderFocusCard(now) {
  const focusName   = document.getElementById('focusName');
  const focusTimeStr = document.getElementById('focusTimeStr');
  const focusItems  = document.getElementById('focusItems');

  if (missionState === 'out') {
    // おでかけ中タイマー更新
    if (departTime) {
      const elapsed = Math.floor((now - departTime) / 1000);
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = elapsed % 60;
      const timerEl = document.getElementById('outingTimer');
      if (timerEl) timerEl.textContent = `🕐 ${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    return;
  }

  if (!activeEvent) {
    if (focusName) focusName.textContent = 'きょうの予定はおわり！ 🎉';
    if (focusTimeStr) focusTimeStr.textContent = '';
    if (focusItems) focusItems.textContent = '';
    updateRingGauge(60);
    updatePartnerSpeech('calm');
    return;
  }

  const ev = activeEvent;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const evStartMin = ev.startH * 60 + ev.startM;
  const minutesLeft = evStartMin - nowMin;
  const endMin = evStartMin + ev.durationMin;
  const endStr = `${Math.floor(endMin/60)}:${String(endMin%60).padStart(2,'0')}`;

  if (focusName) focusName.textContent = ev.name;
  if (focusTimeStr) focusTimeStr.textContent = `${ev.startH}:${String(ev.startM).padStart(2,'0')} 〜 ${endStr}`;
  if (focusItems && ev.todos && ev.todos.length > 0) {
    focusItems.textContent = '📝 ' + ev.todos.join('・');
  } else if (focusItems) {
    focusItems.textContent = '';
  }

  updateRingGauge(Math.max(0, minutesLeft));

  // パートナーのセリフを切迫感レベルに連動
  const lv = getUrgencyLevel(Math.max(0, minutesLeft));
  updatePartnerSpeech(lv);
}

// --- タスク一覧描画 ---
function renderTaskList(now) {
  const body = document.getElementById('taskListBody');
  if (!body) return;

  const events = scheduleData[now.getDay()] || [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sorted = events.slice().sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));

  const nextStart = activeEvent ? (activeEvent.startH * 60 + activeEvent.startM) : -1;

  body.innerHTML = sorted.map(ev => {
    const evKey = `${ev.name}-${ev.startH}:${ev.startM}`;
    const isDone = !!completedEvents[evKey];
    const isMissed = !!missedEvents[evKey];
    const startMin = ev.startH * 60 + ev.startM;
    const isNext = !isDone && !isMissed && (startMin === nextStart);
    const isActive = missionState === 'out' && activeEvent &&
      ev.startH === activeEvent.startH && ev.startM === activeEvent.startM && ev.name === activeEvent.name;

    let rowCls = 'tl-row';
    if (isDone) rowCls += ' done';
    else if (isActive) rowCls += ' active';
    else if (isNext) rowCls += ' next';

    const timeStr = `${ev.startH}:${String(ev.startM).padStart(2,'0')}`;

    let badgeHtml = '';
    if (isDone) {
      badgeHtml = `<span class="tl-badge" style="background:#22c55e">✓</span>`;
    } else if (isMissed) {
      badgeHtml = `<span class="tl-badge" style="background:#9ca3af">😢</span>`;
    } else if (isActive) {
      badgeHtml = `<span class="tl-badge" style="background:#3b82f6">🏃 いま</span>`;
    } else if (isNext) {
      const lv = activeEvent ? getUrgencyLevel(Math.max(0, startMin - nowMin)) : 'calm';
      const color = URGENCY_COLORS[lv];
      badgeHtml = `<span class="tl-badge" style="background:${color}">つぎ</span>`;
    }

    const todosHtml = ev.todos && ev.todos.length > 0
      ? `<div class="tl-todos">📝 ${ev.todos.join('・')}</div>` : '';

    return `<div class="${rowCls}" onclick="showTaskDetailByTime(${ev.startH},${ev.startM})">
      <div class="tl-main">
        <div class="tl-dot" style="background:${ev.color}"></div>
        <span class="tl-name">${ev.name}</span>
        <span class="tl-time">${timeStr}</span>
        ${badgeHtml}
      </div>
      ${todosHtml}
    </div>`;
  }).join('');
}

// --- タスク詳細ポップアップ ---
function showTaskDetailByTime(h, m) {
  const now = (typeof debugGetNow === 'function') ? debugGetNow() : new Date();
  const today = now.getDay();
  const events = scheduleData[today] || [];
  const ev = events.find(e => e.startH === h && e.startM === m);
  if (ev) showTaskDetail(ev);
}

function showTaskDetail(ev) {
  const startStr = `${ev.startH}:${String(ev.startM).padStart(2,'0')}`;
  const endMin = ev.startH * 60 + ev.startM + ev.durationMin;
  const endStr = `${Math.floor(endMin/60)}:${String(endMin%60).padStart(2,'0')}`;
  const todosHtml = ev.todos && ev.todos.length > 0
    ? ev.todos.map(t => `<div class="td-todo-item">• ${t}</div>`).join('')
    : '<div class="td-empty">持ち物の登録なし</div>';

  const overlay = document.getElementById('taskDetailOverlay');
  if (!overlay) return;
  overlay.innerHTML = `
    <div class="td-card">
      <div class="td-color" style="background:${ev.color}"></div>
      <div class="td-name">${ev.name}</div>
      <div class="td-time">🕐 ${startStr} 〜 ${endStr}（${ev.durationMin}分）</div>
      <div class="td-prep">⏱ ${urgencyThresholds.caution}分前からおしらせ</div>
      <div class="td-todos-title">📝 もちもの</div>
      <div class="td-todos">${todosHtml}</div>
      <button class="td-close" onclick="closeTaskDetail()">とじる</button>
    </div>
  `;
  overlay.classList.add('visible');
}

function closeTaskDetail() {
  const overlay = document.getElementById('taskDetailOverlay');
  if (overlay) overlay.classList.remove('visible');
}

// --- パートナー表示 ---
function updatePartnerDisplay(level) {
  const partner = typeof getPartnerPoke === 'function' ? getPartnerPoke() : null;
  const sprite = document.getElementById('partnerSprite');
  const nameEl = document.getElementById('partnerName');
  const heartsEl = document.getElementById('partnerHearts');
  const barFill = document.getElementById('partnerBarFill');
  const speechEl = document.getElementById('partnerSpeech');
  const area = document.getElementById('partnerArea');

  if (!area) return;

  if (partner) {
    if (sprite) {
      sprite.style.display = '';
      const src = SPRITE_HD + partner.id + '.png';
      if (sprite.src !== src) {
        sprite.src = src;
        sprite.onerror = function() { this.src = SPRITE_URL + partner.id + '.png'; };
      }
      sprite.alt = partner.name;
    }
    if (nameEl) {
      const lv = typeof getFriendshipLevel === 'function' ? getFriendshipLevel(partner.id) : 0;
      nameEl.textContent = `${partner.name} Lv.${lv}`;
    }
    if (heartsEl && typeof getHeartsDisplay === 'function') {
      heartsEl.textContent = getHeartsDisplay(partner.id);
    }
    if (barFill && typeof getFriendshipProgress === 'function') {
      barFill.style.width = getFriendshipProgress(partner.id) + '%';
    }
    if (speechEl) {
      const friendLv = typeof getFriendshipLevel === 'function' ? getFriendshipLevel(partner.id) : 0;
      const speeches = getSpeechesByLevel(friendLv);
      speechEl.textContent = pick(speeches[level] || speeches.calm);
    }
  } else {
    if (sprite) { sprite.src = ''; sprite.style.display = 'none'; }
    if (nameEl) nameEl.textContent = 'タップしてともだちをえらぼう';
    if (heartsEl) heartsEl.textContent = '';
    if (barFill) barFill.style.width = '0%';
    if (speechEl) speechEl.textContent = '🥚';
  }
}

let _lastSpeechLevel = '';
let _lastSpeechTime = 0;
const SPEECH_INTERVAL = 15000; // 15秒ごとにセリフ更新

function updatePartnerSpeech(level) {
  const now = Date.now();
  const levelChanged = level !== _lastSpeechLevel;
  const intervalPassed = now - _lastSpeechTime >= SPEECH_INTERVAL;

  if (!levelChanged && !intervalPassed) return;

  const speechEl = document.getElementById('partnerSpeech');
  const partner = typeof getPartnerPoke === 'function' ? getPartnerPoke() : null;
  const friendLv = partner && typeof getFriendshipLevel === 'function' ? getFriendshipLevel(partner.id) : 0;
  const speeches = getSpeechesByLevel(friendLv);
  if (speechEl) speechEl.textContent = pick(speeches[level] || speeches.calm);
  _lastSpeechLevel = level;
  _lastSpeechTime = now;
}

// --- しゅっぱつ ---
function depart() {
  if (!activeEvent) return;
  const evKey = `${activeEvent.name}-${activeEvent.startH}:${activeEvent.startM}`;
  completedEvents[evKey] = true;
  departTime = (typeof debugGetNow === 'function') ? debugGetNow() : new Date();

  // 余裕時間を計算（イベント開始 - 出発時刻）
  const now = departTime;
  const evStartMin = activeEvent.startH * 60 + activeEvent.startM;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const margin = evStartMin - nowMin;
  const departTimeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;

  if (typeof recordCompletion === 'function') {
    recordCompletion(activeEvent.name, 5, { margin: margin, departTime: departTimeStr });
  }
  addPoints(5);
  if (typeof onDepartBonus === 'function') onDepartBonus();
  playGentleChime();
  transitionTo('out', activeEvent);
  renderTaskList(new Date());
  updateStats();
}

// --- ただいま ---
function tadaima() {
  departTime = null;
  const returnedEvent = activeEvent;
  transitionTo('okaeri', activeEvent);
  renderTaskList(new Date());
  updateStats();
  if (typeof renderCalendar === 'function') renderCalendar();

  // ただいまボーナス: パートナーに+2exp
  if (typeof onTadaimaBonus === 'function') onTadaimaBonus();

  // ポケモン遭遇判定 → 当たりならボール演出を先に出す
  if (typeof tryEncounter === 'function' && returnedEvent) {
    const encountered = tryEncounter(returnedEvent);
    if (encountered) {
      // 遭遇演出中はおかえりオーバーレイを隠す
      const okaeriOv = document.getElementById('okaeriOverlay');
      if (okaeriOv) okaeriOv.classList.remove('visible');
      return;
    }
  }

  playWelcomeSound();
  if (typeof checkMilestone === 'function') checkMilestone();
}

// --- おかえりオーバーレイ ---
function populateOkaeriOverlay() {
  const overlay = document.getElementById('okaeriOverlay');
  if (!overlay) return;

  const partner = typeof getPartnerPoke === 'function' ? getPartnerPoke() : null;
  const canFeed = gachaData.points >= 3 && partner;

  const spriteHtml = partner
    ? `<img class="okaeri-sprite" src="${SPRITE_HD}${partner.id}.png" alt="${partner.name}"
        onerror="this.src='${SPRITE_URL}${partner.id}.png'">`
    : '<div style="font-size:4rem;">🎉</div>';

  const evName = activeEvent ? activeEvent.name : '';

  overlay.innerHTML = `
    <div class="okaeri-card">
      ${spriteHtml}
      <div class="okaeri-title">おかえりなさい！</div>
      <div class="okaeri-message">${evName ? evName + '、' : ''}がんばったね！えらい！🌟</div>
      <div class="okaeri-points">+5 pt ゲット！💰（💰${gachaData.points}pt）</div>
      <div class="okaeri-actions">
        <button class="okaeri-btn okaeri-btn-feed" onclick="closeOkaeri(); feedPartner();" ${canFeed?'':'disabled'}>🍎 おやつをあげる (3pt)</button>
        <button class="okaeri-btn okaeri-btn-close" onclick="closeOkaeri()">とじる</button>
      </div>
    </div>
  `;
}

function closeOkaeri() {
  const overlay = document.getElementById('okaeriOverlay');
  if (overlay) overlay.classList.remove('visible');
  missionState = 'idle';
  activeEvent = null;
  const now = new Date();
  transitionTo('idle', null);
  renderFocusCard(now);
  renderTaskList(now);
  updatePartnerDisplay('calm');
}

// --- 間に合わなかったオーバーレイ ---
function populateMissedOverlay(ev) {
  const overlay = document.getElementById('missedOverlay');
  if (!overlay) return;

  const partner = typeof getPartnerPoke === 'function' ? getPartnerPoke() : null;
  const spriteHtml = partner
    ? `<img class="missed-sprite" src="${SPRITE_HD}${partner.id}.png" alt="${partner.name}"
        onerror="this.src='${SPRITE_URL}${partner.id}.png'">`
    : '<div style="font-size:3rem;">😢</div>';

  const partnerName = partner ? partner.name : '';
  const evName = ev ? ev.name : '';

  overlay.innerHTML = `
    <div class="missed-card">
      ${spriteHtml}
      <div class="missed-title">じかん すぎちゃった…</div>
      <div class="missed-message">でも だいじょうぶ！<br>つぎ がんばろう！💪</div>
      <div class="missed-partner-says">${partnerName ? partnerName + '「' : '「'}きにしないで！ぼくも まってるよ」</div>
      <div class="missed-actions">
        <button class="missed-btn missed-btn-ok" onclick="closeMissed()">うん、つぎがんばる！</button>
      </div>
    </div>
  `;
}

function closeMissed() {
  const overlay = document.getElementById('missedOverlay');
  if (overlay) overlay.classList.remove('visible');
  missionState = 'idle';
  activeEvent = null;
  const now = new Date();
  transitionTo('idle', null);
  renderFocusCard(now);
  renderTaskList(now);
  updatePartnerDisplay('calm');
}

// --- ステータス更新 (topbar chips) ---
function updateStats() {
  const totalEl  = document.getElementById('totalDaysChip');
  const pointsEl = document.getElementById('pointsChip');
  const streakEl = document.getElementById('streakChip');

  if (totalEl && typeof calcTotalDays === 'function') {
    totalEl.textContent = `🌟 ${calcTotalDays()}日`;
  }
  if (pointsEl) {
    pointsEl.textContent = `💰 ${gachaData.points} pt`;
  }
  if (streakEl && typeof calcStreak === 'function') {
    streakEl.textContent = `🔥 ${calcStreak()}`;
  }
}

// --- サウンド ---
function playGentleChime() {
  const ctx = getAudioCtx(); const t = ctx.currentTime;
  [523, 659, 784].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = f; o.type = 'sine';
    g.gain.setValueAtTime(0.15, t + i * 0.2);
    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.2 + 0.6);
    o.start(t + i * 0.2); o.stop(t + i * 0.2 + 0.7);
  });
}

function playHappyJingle() {
  const ctx = getAudioCtx(); const t = ctx.currentTime;
  [523, 587, 659, 784, 1047].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = f; o.type = 'triangle';
    g.gain.setValueAtTime(0.12, t + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.3);
    o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.35);
  });
}

function playWelcomeSound() {
  const ctx = getAudioCtx(); const t = ctx.currentTime;
  [784, 988, 1175, 1568].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = f; o.type = 'sine';
    g.gain.setValueAtTime(0.1, t + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.4);
    o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.45);
  });
}

// --- Wake Lock ---
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  async function acquireWakeLock() {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
  }
  await acquireWakeLock();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquireWakeLock();
  });
}

// --- デバッグ ---
function debugTriggerPrep() {
  const events = scheduleData[new Date().getDay()] || [];
  activeEvent = events[0] || { name: 'テスト', startH: 23, startM: 59, durationMin: 60, prepMin: 15, todos: ['みずぎ','タオル','ゴーグル'], color: '#3b82f6' };
  transitionTo('prep', activeEvent);
  playGentleChime();
  const now = new Date();
  renderFocusCard(now);
  renderTaskList(now);
}

function debugReset() {
  missionState = 'idle';
  activeEvent = null;
  completedEvents = {};
  missedEvents = {};
  departTime = null;
  transitionTo('idle', null);
  const now = new Date();
  renderFocusCard(now);
  renderTaskList(now);
  updatePartnerDisplay('calm');
}

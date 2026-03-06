// =============================================
//  アラーム + クイズ解除 + エスカレーション
// =============================================

let activeAlarmLevel = 0;
let alarmAudioCtx = null;
let alarmInterval = null;
let alarmStartTime = 0;
let escalationTimer = null;
let currentEscalation = 0;
let quizAnswer = 0;
let quizSolved = false;
let alarmGainLevel = 0.5;
let wakeLock = null;
let currentAlarmEvent = null;

// --- アラーム判定 ---
function checkAlarms(now) {
  const todayEvents = scheduleData[now.getDay()] || [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const mainEl = document.getElementById('clockScreen');
  let maxLevel = 0, alarmEvent = null;

  todayEvents.forEach(ev => {
    const prepStart = ev.startH * 60 + ev.startM - ev.prepMin;
    const diff = prepStart - nowMin;
    if (diff <= 5 && diff > -1) { maxLevel = Math.max(maxLevel, 3); alarmEvent = ev; }
    else if (diff <= 15 && diff > 5) { maxLevel = Math.max(maxLevel, 2); alarmEvent = ev; }
    else if (diff <= 30 && diff > 15) { maxLevel = Math.max(maxLevel, 1); alarmEvent = ev; }
  });

  mainEl.classList.remove('warn-border-yellow', 'warn-border-orange');
  if (maxLevel === 1) mainEl.classList.add('warn-border-yellow');
  else if (maxLevel === 2) mainEl.classList.add('warn-border-orange');

  if (maxLevel === 3 && activeAlarmLevel < 3) triggerFullAlarm(alarmEvent);
  if (maxLevel === 2 && activeAlarmLevel < 2) playNotificationBeep();

  activeAlarmLevel = maxLevel;
}

// --- フルアラーム ---
function triggerFullAlarm(ev) {
  currentAlarmEvent = ev;
  const overlay = document.getElementById('alarmOverlay');
  const msg = document.getElementById('alarmMessage');
  msg.textContent = `${ev.name}の\nじゅんび！！`;
  msg.style.whiteSpace = 'pre-line';
  document.getElementById('alarmSubText').textContent = '⬇ もんだいに正解して止めろ！ ⬇';
  overlay.classList.add('show', 'flash');
  overlay.classList.remove('escalate-1', 'escalate-2', 'escalate-3');
  currentEscalation = 0;
  quizSolved = false;
  alarmStartTime = Date.now();
  document.getElementById('escalationLabel').style.opacity = '0';
  generateQuiz();
  startAlarmSound();
  startEscalation();
}

// --- クイズ ---
function generateQuiz() {
  const ops = [
    () => { const a = rand(2,9), b = rand(2,9); return { q: `${a} × ${b} = ?`, ans: a*b }; },
    () => { const a = rand(10,50), b = rand(10,50); return { q: `${a} + ${b} = ?`, ans: a+b }; },
    () => { const a = rand(30,99), b = rand(10, a); return { q: `${a} − ${b} = ?`, ans: a-b }; },
  ];
  const { q, ans } = ops[rand(0, ops.length-1)]();
  quizAnswer = ans;
  document.getElementById('quizQuestion').textContent = q;
  const choices = [ans];
  while (choices.length < 4) {
    const dummy = ans + rand(-10, 10);
    if (dummy !== ans && dummy > 0 && !choices.includes(dummy)) choices.push(dummy);
  }
  for (let i = choices.length - 1; i > 0; i--) {
    const j = rand(0, i); [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  document.getElementById('quizChoices').innerHTML = choices.map(c =>
    `<button class="quiz-btn" onclick="checkQuizAnswer(this, ${c})">${c}</button>`
  ).join('');
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function checkQuizAnswer(btn, val) {
  if (quizSolved) return;
  if (val === quizAnswer) {
    btn.classList.add('correct');
    quizSolved = true;
    const pts = Math.max(5, 20 - currentEscalation * 5);
    addPoints(pts);
    btn.textContent = `⭕ +${pts}pt`;
    // カレンダーに記録
    if (currentAlarmEvent && typeof recordCompletion === 'function') {
      recordCompletion(currentAlarmEvent.name, pts);
    }
    setTimeout(() => {
      stopAlarm();
      showCheer(pts);
    }, 500);
  } else {
    btn.classList.add('wrong');
    btn.style.pointerEvents = 'none';
    escalate();
    setTimeout(generateQuiz, 600);
  }
}

// --- エスカレーション ---
function startEscalation() {
  clearInterval(escalationTimer);
  escalationTimer = setInterval(() => {
    const elapsed = (Date.now() - alarmStartTime) / 1000;
    if (elapsed > 30 && currentEscalation < 3) escalate();
    else if (elapsed > 15 && currentEscalation < 2) escalate();
    else if (elapsed > 7 && currentEscalation < 1) escalate();
  }, 1000);
}

function escalate() {
  currentEscalation = Math.min(currentEscalation + 1, 3);
  const overlay = document.getElementById('alarmOverlay');
  const label = document.getElementById('escalationLabel');
  overlay.classList.remove('escalate-1', 'escalate-2', 'escalate-3');
  overlay.classList.add(`escalate-${currentEscalation}`);
  const messages = ['', '⚡ 音量アップ ⚡', '🔊🔊 もっとうるさくなるぞ 🔊🔊', '💀💀💀 最大レベル 💀💀💀'];
  label.textContent = messages[currentEscalation];
  label.style.opacity = '1';
  updateAlarmVolume();
}

function stopAlarm() {
  const overlay = document.getElementById('alarmOverlay');
  overlay.classList.remove('show', 'flash', 'escalate-1', 'escalate-2', 'escalate-3');
  stopAlarmSound();
  clearInterval(escalationTimer);
  currentEscalation = 0;
  activeAlarmLevel = 99;
}

// --- Web Audio ---
function getAudioCtx() {
  if (!alarmAudioCtx) alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (alarmAudioCtx.state === 'suspended') alarmAudioCtx.resume();
  return alarmAudioCtx;
}

function startAlarmSound() {
  stopAlarmSound();
  alarmGainLevel = 0.5;
  const ctx = getAudioCtx();
  const pattern = [
    {f:880,d:0.15,t:0},{f:1108,d:0.15,t:0.18},{f:1318,d:0.25,t:0.36},
    {f:880,d:0.15,t:0.8},{f:1108,d:0.15,t:0.98},{f:1318,d:0.25,t:1.16},
    {f:1500,d:0.4,t:1.6,siren:true},
  ];
  function playCycle() {
    const now = ctx.currentTime;
    pattern.forEach(note => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.value = note.f;
      if (note.siren) osc.frequency.linearRampToValueAtTime(800, now + note.t + note.d);
      gain.gain.setValueAtTime(alarmGainLevel, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + note.d);
      osc.start(now + note.t); osc.stop(now + note.t + note.d + 0.05);
    });
    if (currentEscalation >= 2) {
      [{f:933,d:0.3,t:0.1},{f:1400,d:0.3,t:0.5},{f:700,d:0.5,t:1.0}].forEach(note => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth'; osc.frequency.value = note.f;
        gain.gain.setValueAtTime(alarmGainLevel * 0.4, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + note.d);
        osc.start(now + note.t); osc.stop(now + note.t + note.d + 0.05);
      });
    }
  }
  playCycle();
  alarmInterval = setInterval(playCycle, 2400);
}

function updateAlarmVolume() {
  alarmGainLevel = [0.5, 0.7, 0.85, 1.0][Math.min(currentEscalation, 3)];
}

function stopAlarmSound() { if (alarmInterval) { clearInterval(alarmInterval); alarmInterval = null; } }

function playNotificationBeep() {
  const ctx = getAudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = 523; osc.type = 'sine'; gain.gain.value = 0.2;
  osc.start(); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.stop(ctx.currentTime + 0.6);
}

document.addEventListener('click', () => { getAudioCtx(); }, { once: true });
document.addEventListener('touchstart', () => { getAudioCtx(); }, { once: true });

// --- Wake Lock ---
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        document.addEventListener('visibilitychange', async () => {
          if (document.visibilityState === 'visible') {
            try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
          }
        });
      });
    } catch(e) {}
  }
}

// =============================================
//  リングゲージ + 予定管理 (v4)
// =============================================

const DAY_NAMES = ['日','月','火','水','木','金','土'];
const COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f43f5e','#6366f1'
];
const PREP_COLOR = '#fbbf24';

let scheduleData = {};
let selectedDay = new Date().getDay();

// --- データ ---
function defaultSchedule() {
  const d = {};
  for (let i = 0; i < 7; i++) d[i] = [];
  const sample = [
    { name: '水泳', startH: 16, startM: 0, durationMin: 60, prepMin: 15, color: COLORS[4], todos: ['みずぎ','タオル','ゴーグル'] },
    { name: 'ピアノ', startH: 17, startM: 30, durationMin: 30, prepMin: 10, color: COLORS[5], todos: ['楽譜','れんしゅう帳'] },
    { name: '夜の部', startH: 19, startM: 0, durationMin: 60, prepMin: 10, color: COLORS[3], todos: ['テキスト','ノート'] },
  ];
  for (let i = 0; i < 7; i++) d[i] = JSON.parse(JSON.stringify(sample));
  return d;
}

function loadSchedule() {
  const raw = localStorage.getItem('junbi_timer_schedule');
  if (raw) { try { scheduleData = JSON.parse(raw); return; } catch(e) {} }
  scheduleData = defaultSchedule();
  saveSchedule();
}
function saveSchedule() {
  localStorage.setItem('junbi_timer_schedule', JSON.stringify(scheduleData));
}

// =============================================
//  リングゲージ
// =============================================
const CIRC = 2 * Math.PI * 66; // ≈414.7
const RING_TOTAL = 60; // 60分満タン

// しきい値（分）— 設定画面から変更可能
let urgencyThresholds = { critical: 5, warning: 15, caution: 30 };

function loadUrgencyThresholds() {
  try {
    const raw = localStorage.getItem('junbi_timer_urgency');
    if (raw) urgencyThresholds = JSON.parse(raw);
  } catch(e) {}
}
function saveUrgencyThresholds() {
  localStorage.setItem('junbi_timer_urgency', JSON.stringify(urgencyThresholds));
}
loadUrgencyThresholds();

function getUrgencyLevel(min) {
  if (min <= urgencyThresholds.critical) return 'critical';
  if (min <= urgencyThresholds.warning) return 'warning';
  if (min <= urgencyThresholds.caution) return 'caution';
  return 'calm';
}

const URGENCY_COLORS  = { critical:'#ef4444', warning:'#f97316', caution:'#eab308', calm:'#22c55e' };
const URGENCY_BG = {
  critical: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
  warning:  'linear-gradient(135deg, #fff7ed, #fef3c7)',
  caution:  'linear-gradient(135deg, #fefce8, #fef9c3)',
  calm:     'linear-gradient(135deg, #f0fdf4, #dcfce7)'
};
const URGENCY_BORDER  = { critical:'#fca5a5', warning:'#fed7aa', caution:'#fde68a', calm:'#bbf7d0' };
const URGENCY_LABEL = {
  critical: '⚠️ もうすぐ！いそいで！',
  warning:  '⏰ そろそろ じゅんび！',
  caution:  '🕐 まだ すこし あるよ',
  calm:     '✨ ゆっくり じゅんびしよう'
};

function updateRingGauge(minutesLeft) {
  const ringFill = document.getElementById('ringFill');
  const ringNum  = document.getElementById('ringNum');
  const focusCard = document.getElementById('focusCard');
  const focusLabel = document.getElementById('focusLabel');
  const focusName  = document.getElementById('focusName');
  if (!ringFill || !ringNum) return;

  const lv = getUrgencyLevel(minutesLeft);
  const color = URGENCY_COLORS[lv];
  const ratio = Math.min(minutesLeft / RING_TOTAL, 1);

  // リング更新
  ringFill.style.strokeDashoffset = CIRC * ratio;
  ringFill.style.stroke = color;
  ringNum.textContent = Math.max(0, Math.floor(minutesLeft));
  ringNum.style.color = color;

  // カード背景
  if (focusCard) {
    focusCard.style.background = URGENCY_BG[lv];
    focusCard.style.borderColor = URGENCY_BORDER[lv];
    focusCard.classList.toggle('urgent-pulse', lv === 'critical');
    focusCard.classList.toggle('urgent-pulse-orange', lv === 'warning');
  }

  // ラベル
  if (focusLabel) {
    focusLabel.textContent = URGENCY_LABEL[lv];
    focusLabel.style.color = color;
  }
  if (focusName) {
    focusName.style.color = lv === 'critical' ? '#dc2626' : lv === 'warning' ? '#ea580c' : '#2d2621';
  }
}

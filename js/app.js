// =============================================
//  メインエントリーポイント (v4)
// =============================================

function init() {
  loadSchedule();
  loadGachaData();
  loadCalendarLog();
  renderCalendar();
  updatePartnerDisplay('calm');
  updateStats();
  requestWakeLock();
  tick();
  setInterval(tick, 1000);
}

function tick() {
  const now = (typeof debugGetNow === 'function') ? debugGetNow() : new Date();
  const dateEl = document.getElementById('dateLabel');
  const clockEl = document.getElementById('digitalClock');
  if (dateEl) {
    dateEl.textContent = `${now.getMonth()+1}月${now.getDate()}日（${DAY_NAMES[now.getDay()]}）`;
  }
  if (clockEl) {
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    clockEl.textContent = `${h}:${m}:${s}`;
  }
  checkMission(now);
}

init();

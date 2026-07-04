// ---------- 分頁切換 ----------
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------- 共用：今天日期字串（用於每日重置判斷） ----------
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function isWeekend() {
  const day = new Date().getDay(); // 0=日 6=六
  return day === 0 || day === 6;
}

// ---------- 每日打菇次數 ----------
const BATTLE_KEY = 'pikminMushroom_battleCount';
const battleCountEl = document.getElementById('battleCount');

function loadBattleCount() {
  const stored = JSON.parse(localStorage.getItem(BATTLE_KEY) || 'null');
  if (!stored || stored.date !== todayKey()) {
    const fresh = { date: todayKey(), count: 0 };
    localStorage.setItem(BATTLE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  return stored;
}

function saveBattleCount(count) {
  localStorage.setItem(BATTLE_KEY, JSON.stringify({ date: todayKey(), count }));
}

function renderBattleCount() {
  const data = loadBattleCount();
  battleCountEl.textContent = data.count;
}

document.getElementById('addBattleBtn').addEventListener('click', () => {
  const data = loadBattleCount();
  saveBattleCount(data.count + 1);
  renderBattleCount();
});

document.getElementById('resetBattleBtn').addEventListener('click', () => {
  saveBattleCount(0);
  renderBattleCount();
});

// ---------- 大聲公次數 ----------
const BULLHORN_KEY = 'pikminMushroom_bullhornCount';
const bullhornCountEl = document.getElementById('bullhornCount');
const bullhornLimitLabel = document.getElementById('bullhornLimitLabel');

function loadBullhornCount() {
  const stored = JSON.parse(localStorage.getItem(BULLHORN_KEY) || 'null');
  if (!stored || stored.date !== todayKey()) {
    const fresh = { date: todayKey(), count: 0 };
    localStorage.setItem(BULLHORN_KEY, JSON.stringify(fresh));
    return fresh;
  }
  return stored;
}

function saveBullhornCount(count) {
  localStorage.setItem(BULLHORN_KEY, JSON.stringify({ date: todayKey(), count }));
}

function renderBullhornCount() {
  const data = loadBullhornCount();
  bullhornCountEl.textContent = data.count;
  bullhornLimitLabel.textContent = isWeekend() ? '/ 3 次（週末）' : '/ 1 次（平日）';
}

document.getElementById('addBullhornBtn').addEventListener('click', () => {
  const data = loadBullhornCount();
  saveBullhornCount(data.count + 1);
  renderBullhornCount();
});

document.getElementById('resetBullhornBtn').addEventListener('click', () => {
  saveBullhornCount(0);
  renderBullhornCount();
});

// ---------- 蘑菇重生倒數 ----------
const TIMERS_KEY = 'pikminMushroom_timers';

const COLOR_LABELS = {
  red: '🔴 紅蘑菇', yellow: '🟡 黃蘑菇', blue: '🔵 藍蘑菇', purple: '🟣 紫蘑菇',
  white: '⚪ 白蘑菇', pink: '🌸 粉蘑菇', gray: '⚫ 灰蘑菇', ice: '🧊 冰藍蘑菇',
  fire: '🔥 火蘑菇', water: '💧 水蘑菇', electric: '⚡ 電蘑菇',
  poison: '☠️ 毒蘑菇', crystal: '💎 水晶蘑菇',
  event: '🎉 活動蘑菇（任務）'
};

const SIZE_LABELS = {
  small: '小型', normal: '普通', large: '大型', giant: '巨大'
};

const RESPAWN_MIN_MS = 5 * 60 * 1000;
const RESPAWN_MAX_MS = 10 * 60 * 1000;

function loadTimers() {
  return JSON.parse(localStorage.getItem(TIMERS_KEY) || '[]');
}

function saveTimers(timers) {
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
}

function addTimer(color, size, finishTimeMs) {
  const timers = loadTimers();
  timers.push({
    id: Date.now() + Math.random().toString(16).slice(2),
    color, size, finishTimeMs
  });
  saveTimers(timers);
  renderTimers();
}

function removeTimer(id) {
  saveTimers(loadTimers().filter(t => t.id !== id));
  renderTimers();
}

function formatDuration(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderTimers() {
  const listEl = document.getElementById('timerList');
  const emptyMsg = document.getElementById('emptyMsg');
  const timers = loadTimers().sort((a, b) => a.finishTimeMs - b.finishTimeMs);

  listEl.innerHTML = '';
  if (timers.length === 0) {
    listEl.appendChild(emptyMsg);
    return;
  }

  timers.forEach(t => {
    const item = document.createElement('div');
    item.className = 'timer-item';
    item.dataset.id = t.id;
    item.dataset.finish = t.finishTimeMs;

    const info = document.createElement('div');
    info.className = 'timer-info';
    info.innerHTML = `<span class="timer-title">${COLOR_LABELS[t.color]} · ${SIZE_LABELS[t.size]}</span>
      <span class="timer-sub">完成時間：${new Date(t.finishTimeMs).toLocaleString('zh-TW', { hour12: false })}</span>`;

    const countdown = document.createElement('div');
    countdown.className = 'timer-countdown';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => removeTimer(t.id));

    item.appendChild(info);
    item.appendChild(countdown);
    item.appendChild(removeBtn);
    listEl.appendChild(item);
  });

  tickTimers();
}

function tickTimers() {
  const now = Date.now();
  document.querySelectorAll('.timer-item').forEach(item => {
    const finish = Number(item.dataset.finish);
    const t5 = finish + RESPAWN_MIN_MS;
    const t10 = finish + RESPAWN_MAX_MS;
    const countdown = item.querySelector('.timer-countdown');

    if (now < finish) {
      countdown.textContent = `⚔️ 戰鬥中，還剩 ${formatDuration(finish - now)}`;
      countdown.classList.remove('ready');
      countdown.classList.add('battling');
      item.classList.remove('done');
      item.classList.add('battling');
    } else if (now < t5) {
      countdown.textContent = `⏳ ${formatDuration(t5 - now)} 後可能重生`;
      countdown.classList.remove('ready', 'battling');
      item.classList.remove('done', 'battling');
    } else if (now < t10) {
      countdown.textContent = `🍄 可能已重生（${formatDuration(t10 - now)} 內確定）`;
      countdown.classList.add('ready');
      countdown.classList.remove('battling');
      item.classList.add('done');
      item.classList.remove('battling');
    } else {
      countdown.textContent = '✅ 應已重生';
      countdown.classList.add('ready');
      countdown.classList.remove('battling');
      item.classList.add('done');
      item.classList.remove('battling');
    }
  });
}

document.getElementById('justFinishedBtn').addEventListener('click', () => {
  const color = document.getElementById('mushroomColor').value;
  const size = document.getElementById('mushroomSize').value;
  addTimer(color, size, Date.now());
});

document.getElementById('addBattleTimerBtn').addEventListener('click', () => {
  const color = document.getElementById('mushroomColor').value;
  const size = document.getElementById('mushroomSize').value;
  const hour = Math.max(0, parseInt(document.getElementById('battleHour').value, 10) || 0);
  const min = Math.max(0, parseInt(document.getElementById('battleMin').value, 10) || 0);
  const sec = Math.max(0, parseInt(document.getElementById('battleSec').value, 10) || 0);
  const remainingMs = (hour * 3600 + min * 60 + sec) * 1000;
  if (remainingMs <= 0) return;

  addTimer(color, size, Date.now() + remainingMs);
});

document.getElementById('addTimerBtn').addEventListener('click', () => {
  const color = document.getElementById('mushroomColor').value;
  const size = document.getElementById('mushroomSize').value;
  const customTime = document.getElementById('customTime').value;

  if (!customTime) return;
  const finishTimeMs = new Date(customTime).getTime();
  if (isNaN(finishTimeMs)) return;

  addTimer(color, size, finishTimeMs);
  document.getElementById('customTime').value = '';
});

// ---------- 初始化 ----------
renderBattleCount();
renderBullhornCount();
renderTimers();

setInterval(() => {
  tickTimers();
  // 跨日時自動刷新次數顯示
  renderBattleCount();
  renderBullhornCount();
}, 1000);

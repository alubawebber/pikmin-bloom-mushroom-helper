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

// ---------- 常駐地點 ----------
const LOCATIONS_KEY = 'pikminMushroom_locations';
const locationChipsEl = document.getElementById('locationChips');
const timerLocationSelect = document.getElementById('timerLocation');

function loadLocations() {
  return JSON.parse(localStorage.getItem(LOCATIONS_KEY) || '[]');
}

function saveLocations(locations) {
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
}

function renderLocations() {
  const locations = loadLocations();

  locationChipsEl.innerHTML = '';
  if (locations.length === 0) {
    locationChipsEl.innerHTML = '<span class="location-empty">尚未新增任何地點</span>';
  } else {
    locations.forEach(loc => {
      const chip = document.createElement('span');
      chip.className = 'location-chip';
      chip.append(`📍 ${loc.name} `);
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        saveLocations(loadLocations().filter(l => l.id !== loc.id));
        renderLocations();
      });
      chip.appendChild(delBtn);
      locationChipsEl.appendChild(chip);
    });
  }

  const currentValue = timerLocationSelect.value;
  timerLocationSelect.innerHTML = '<option value="">（未指定地點）</option>';
  locations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.id;
    opt.textContent = `📍 ${loc.name}`;
    timerLocationSelect.appendChild(opt);
  });
  if (locations.some(l => l.id === currentValue)) {
    timerLocationSelect.value = currentValue;
  } else if (locations.length > 0) {
    timerLocationSelect.value = locations[locations.length - 1].id;
  }
}

document.getElementById('addLocationBtn').addEventListener('click', () => {
  const input = document.getElementById('newLocationName');
  const name = input.value.trim();
  if (!name) return;

  const locations = loadLocations();
  locations.push({ id: Date.now() + Math.random().toString(16).slice(2), name });
  saveLocations(locations);
  input.value = '';
  renderLocations();
});

// ---------- 瀏覽器通知 ----------
const enableNotifyBtn = document.getElementById('enableNotifyBtn');
const notifyStatusText = document.getElementById('notifyStatusText');
const recheckNotifyBtn = document.getElementById('recheckNotifyBtn');
const notifyHintAfterClick = document.getElementById('notifyHintAfterClick');
const notifyBlockedHelp = document.getElementById('notifyBlockedHelp');

function updateNotifyStatus() {
  if (!('Notification' in window)) {
    notifyStatusText.textContent = '這個瀏覽器不支援通知功能。';
    enableNotifyBtn.style.display = 'none';
    notifyHintAfterClick.style.display = 'none';
    notifyBlockedHelp.style.display = 'none';
    return;
  }
  if (Notification.permission === 'granted') {
    notifyStatusText.textContent = '✅ 瀏覽器提醒已啟用，蘑菇可能重生時會跳出通知。';
    enableNotifyBtn.style.display = 'none';
    notifyHintAfterClick.style.display = 'none';
    notifyBlockedHelp.style.display = 'none';
  } else if (Notification.permission === 'denied') {
    notifyStatusText.textContent = '瀏覽器通知已被封鎖，請用下面的方式手動開啟。';
    enableNotifyBtn.style.display = 'none';
    notifyHintAfterClick.style.display = 'none';
    notifyBlockedHelp.style.display = '';
  } else {
    notifyStatusText.textContent = '尚未啟用瀏覽器通知。啟用後，蘑菇可能重生時會跳出系統通知，不用一直開著這頁盯著看。';
    enableNotifyBtn.style.display = '';
    notifyBlockedHelp.style.display = 'none';
  }
}

enableNotifyBtn.addEventListener('click', () => {
  notifyHintAfterClick.style.display = '';
  Notification.requestPermission().then(result => {
    updateNotifyStatus();
    if (result === 'default') {
      notifyStatusText.textContent = '沒有看到允許的話，通常是網址列悄悄跳出的小圖示被忽略了，或瀏覽器/擴充功能自動擋掉了。可以按下面「重新檢查狀態」，或直接用手動開啟的方式。';
      notifyBlockedHelp.style.display = '';
    }
  });
});

recheckNotifyBtn.addEventListener('click', updateNotifyStatus);

notifyBlockedHelp.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = '已複製！';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });
});

function notify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

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

function addTimer(color, size, finishTimeMs, locationId) {
  const timers = loadTimers();
  const location = loadLocations().find(l => l.id === locationId);
  timers.push({
    id: Date.now() + Math.random().toString(16).slice(2),
    color, size, finishTimeMs,
    locationId: locationId || null,
    locationName: location ? location.name : null,
    notified5: false
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
    const locationLabel = t.locationName ? `📍 ${t.locationName}` : null;
    const colorSizeLabel = `${COLOR_LABELS[t.color]} · ${SIZE_LABELS[t.size]}`;
    const subParts = [];
    if (locationLabel) subParts.push(colorSizeLabel);
    subParts.push(`完成時間：${new Date(t.finishTimeMs).toLocaleString('zh-TW', { hour12: false })}`);
    info.innerHTML = `<span class="timer-title">${locationLabel || colorSizeLabel}</span>
      <span class="timer-sub">${subParts.join(' ・ ')}</span>`;

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

function checkNotifications() {
  const now = Date.now();
  const timers = loadTimers();
  let changed = false;

  timers.forEach(t => {
    const t5 = t.finishTimeMs + RESPAWN_MIN_MS;
    if (!t.notified5 && now >= t5) {
      const label = t.locationName ? `📍 ${t.locationName}` : `${COLOR_LABELS[t.color]} · ${SIZE_LABELS[t.size]}`;
      notify('🍄 蘑菇可能重生了', `${label} 可能已經重生，去看看吧！`);
      t.notified5 = true;
      changed = true;
    }
  });

  if (changed) saveTimers(timers);
}

function tickTimers() {
  const now = Date.now();
  checkNotifications();
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
  const locationId = timerLocationSelect.value;
  addTimer(color, size, Date.now(), locationId);
});

document.getElementById('addBattleTimerBtn').addEventListener('click', () => {
  const color = document.getElementById('mushroomColor').value;
  const size = document.getElementById('mushroomSize').value;
  const locationId = timerLocationSelect.value;
  const hour = Math.max(0, parseInt(document.getElementById('battleHour').value, 10) || 0);
  const min = Math.max(0, parseInt(document.getElementById('battleMin').value, 10) || 0);
  const sec = Math.max(0, parseInt(document.getElementById('battleSec').value, 10) || 0);
  const remainingMs = (hour * 3600 + min * 60 + sec) * 1000;
  if (remainingMs <= 0) return;

  addTimer(color, size, Date.now() + remainingMs, locationId);
});

document.getElementById('addTimerBtn').addEventListener('click', () => {
  const color = document.getElementById('mushroomColor').value;
  const size = document.getElementById('mushroomSize').value;
  const locationId = timerLocationSelect.value;
  const customTime = document.getElementById('customTime').value;

  if (!customTime) return;
  const finishTimeMs = new Date(customTime).getTime();
  if (isNaN(finishTimeMs)) return;

  addTimer(color, size, finishTimeMs, locationId);
  document.getElementById('customTime').value = '';
});

// ---------- 初始化 ----------
renderBattleCount();
renderBullhornCount();
renderLocations();
updateNotifyStatus();
renderTimers();

setInterval(() => {
  tickTimers();
  // 跨日時自動刷新次數顯示
  renderBattleCount();
  renderBullhornCount();
}, 1000);

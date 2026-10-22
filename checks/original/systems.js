'use strict';
/* ===== Системы: погода, этапы сложности, новые герои, подсказки, достижения ===== */

/* ---------- Длина смены ---------- */
const SHIFT = 180, STAGE_LEN = 36;   // секунд

/* ---------- Погода ---------- */
const WX_TYPES = ['clear', 'wind', 'rain', 'snow'];
const WX_NAME = { clear: 'ЯСНО', wind: 'ВЕТЕР', rain: 'ДОЖДЬ', snow: 'СНЕГ' };
const WX_COL = { clear: '#ffe14d', wind: '#9ad7ff', rain: '#6fa8ff', snow: '#ffffff' };
const WX_TOAST = {
  clear: ['ЯСНАЯ ПОГОДА', 'НИКАКИХ ПОМЕХ, СНИМАЙ!'],
  wind: ['ПОДУЛ ВЕТЕР', 'ПО ВЕТРУ БЕЖИШЬ БЫСТРЕЕ, ПРОТИВ — МЕДЛЕННЕЕ'],
  rain: ['НАЧАЛСЯ ДОЖДЬ', 'ФОКУС НАВОДИТСЯ ДОЛЬШЕ'],
  snow: ['ПОШЁЛ СНЕГ', 'БЕГ МЕДЛЕННЕЕ ВО ВСЕ СТОРОНЫ']
};
let WXP = [];   // частицы погоды на экране

function setWeather(type, first) {
  const old = S.wx ? S.wx.type : '';
  let dir = S.wx ? S.wx.dir : 0;
  if (type === 'wind') dir = Math.floor(Math.random() * 8) * Math.PI / 4;
  S.wx = { type, dir, fade: first ? 1 : 0, next: rnd(35, 50) };
  WXP = [];
  const n = type === 'rain' ? 70 : type === 'snow' ? 60 : type === 'wind' ? 22 : 0;
  for (let i = 0; i < n; i++) WXP.push({ x: rnd(0, VW), y: rnd(0, VH), v: rnd(0.7, 1.3), p: rnd(0, 6) });
  setAmbient(type);
  if (S.st && old !== type) { S.st.wx[type] = 1; }
  if (!first) { toast(WX_TOAST[type][0], WX_TOAST[type][1], WX_COL[type]); beep(type === 'clear' ? 880 : 300, 0.15, 'triangle', 0.05); }
}
function updateWeather(dt) {
  const w = S.wx; if (!w) return;
  w.fade = Math.min(1, w.fade + dt / 2); w.next -= dt;
  if (w.next <= 0) { const opts = WX_TYPES.filter(t => t !== w.type); setWeather(opts[Math.floor(Math.random() * opts.length)], false); }
  for (const p of WXP) {
    if (w.type === 'rain') { p.y += 260 * p.v * dt; p.x -= 50 * p.v * dt; }
    else if (w.type === 'snow') { p.y += 28 * p.v * dt; p.x += Math.sin(S.tt * 1.5 + p.p) * 14 * dt; }
    else if (w.type === 'wind') { p.x += Math.cos(w.dir) * 320 * p.v * dt; p.y += Math.sin(w.dir) * 320 * p.v * dt; }
    if (p.x < -12) p.x += VW + 24; if (p.x > VW + 12) p.x -= VW + 24; if (p.y < -12) p.y += VH + 24; if (p.y > VH + 12) p.y -= VH + 24;
  }
}
/* множитель скорости бега от погоды (dx, dy — направление бега) */
function wxSpeedMul(dx, dy) {
  const w = S.wx; if (!w) return 1;
  if (w.type === 'snow') return 1 - 0.25 * w.fade;
  if (w.type === 'wind') { const l = Math.hypot(dx, dy) || 1; return 1 + 0.3 * w.fade * ((dx * Math.cos(w.dir) + dy * Math.sin(w.dir)) / l); }
  return 1;
}
/* во сколько раз дольше наводится фокус */
function wxFocusMul() { const w = S.wx; return w && w.type === 'rain' ? 1 + 0.7 * w.fade : 1; }

function drawArrow(c, cx, cy, ang, col) {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  for (let i = -4; i <= 4; i++) R(c, Math.round(cx + ux * i), Math.round(cy + uy * i), 2, 2, col);
  for (const s of [-1, 1]) for (let i = 1; i <= 3; i++) {
    const a = ang + Math.PI + s * 0.7; R(c, Math.round(cx + ux * 4 + Math.cos(a) * i), Math.round(cy + uy * 4 + Math.sin(a) * i), 2, 2, col);
  }
}
function drawWeather() {
  const w = S.wx; if (!w || w.type === 'clear') return;
  const f = w.fade;
  if (w.type === 'rain') {
    ctx.globalAlpha = 0.16 * f; ctx.fillStyle = '#2a4a9a'; ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = 0.65 * f; for (const p of WXP) { R(ctx, Math.round(p.x), Math.round(p.y), 1, 5, '#cfe2ff'); R(ctx, Math.round(p.x) + 1, Math.round(p.y) - 2, 1, 2, '#cfe2ff'); }
  } else if (w.type === 'snow') {
    ctx.globalAlpha = 0.1 * f; ctx.fillStyle = '#eaf4ff'; ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = 0.9 * f; for (const p of WXP) R(ctx, Math.round(p.x), Math.round(p.y), p.v > 1 ? 3 : 2, p.v > 1 ? 3 : 2, '#ffffff');
  } else if (w.type === 'wind') {
    ctx.globalAlpha = 0.5 * f; const ux = Math.cos(w.dir), uy = Math.sin(w.dir);
    for (const p of WXP) for (let i = 0; i < 9; i++) R(ctx, Math.round(p.x - ux * i * 2), Math.round(p.y - uy * i * 2), 2, 1, '#ffffff');
  }
  ctx.globalAlpha = 1;
}
function drawWeatherChip(x, y) {
  const w = S.wx; if (!w) return; const col = WX_COL[w.type];
  if (w.type === 'clear') { disc(ctx, x + 5, y + 4, 4, '#ffe14d'); }
  else if (w.type === 'wind') drawArrow(ctx, x + 5, y + 4, w.dir, col);
  else if (w.type === 'rain') { ell(ctx, x + 5, y + 2, 6, 3, '#cfd8ee'); for (let i = 0; i < 3; i++) R(ctx, x + 1 + i * 4, y + 6 + (i % 2), 1, 3, '#6fa8ff'); }
  else { for (let i = 0; i < 3; i++) R(ctx, x + 1 + i * 4, y + 1 + (i % 2) * 4, 3, 3, '#ffffff'); }
  T(WX_NAME[w.type], x + 16, y, col);
}

/* ---------- Всплывающие уведомления (очередь) ---------- */
function toast(l1, l2, col) { S.toasts.push({ t: 3.4, l1, l2: l2 || '', col: col || '#ffe14d' }); }
function updateToasts(dt) { if (S.toasts.length) { S.toasts[0].t -= dt; if (S.toasts[0].t <= 0) S.toasts.shift(); } }
function drawToast() {
  if (!S.toasts.length) return; const t = S.toasts[0], al = Math.min(1, t.t * 3, (3.4 - t.t) * 4);
  const W = 300, x = (VW - W) / 2, H = t.l2 ? 28 : 18, y = VH - 100;
  ctx.globalAlpha = 0.85 * al; R(ctx, x, y, W, H, '#1b0f33'); ctx.globalAlpha = al; R(ctx, x, y, 3, H, t.col);
  T(t.l1, VW / 2, y + 5, t.col, 8, 'center'); if (t.l2) T(t.l2, VW / 2, y + 17, '#ffffff', 8, 'center'); ctx.globalAlpha = 1;
}

/* ---------- Этапы сложности и расписание новых героев ---------- */
const HIDDEN_AT_START = ['busker', 'couple', 'jogger', 'wedding'];
const STAGE_NAME = ['РАЗМИНКА', 'ПАРК ОЖИВАЕТ', 'ГОРЯЧИЙ ЧАС', 'ТОЛПА И ХАОС', 'ФИНАЛЬНЫЙ РЫВОК'];
const SCHEDULE = [
  { t: 20, do: () => arriveClient('busker', 'ВЫШЕЛ МУЗЫКАНТ', 'ВНИЗУ СЛЕВА, У СЦЕНЫ') },
  { t: 44, do: () => arrivePest('tourist', 'ПРИШЁЛ ТУРИСТ', 'ЛЕЗЕТ В КАДР СО СЕЛФИ-ПАЛКОЙ') },
  { t: 60, do: () => arriveClient('couple', 'ПРИШЛА ПАРА С СОБАЧКОЙ', 'ВНИЗУ ПО ЦЕНТРУ') },
  { t: 80, do: () => arrivePest('dog', 'СБЕЖАЛА СОБАКА', 'НОСИТСЯ ПО ПАРКУ И ПОРТИТ КАДРЫ') },
  { t: 96, do: () => arriveClient('jogger', 'ВЫБЕЖАЛ БЕГУН', 'БЕГАЕТ ПО КРАЮ ПАРКА') },
  { t: 116, do: () => { for (let i = 0; i < 2; i++) { const p = new PigeonB(rnd(80, 1200), rnd(100, 640)); S.pigeons.push(p); } toast('ПРИЛЕТЕЛА СТАЯ', '+2 ГОЛУБЯ В ПАРКЕ', '#c9d0e0'); sfx('flutter', S.pl.x, S.pl.y); } },
  { t: 132, do: () => arriveClient('wedding', 'ПРИШЛА СВАДЬБА', 'ВНИЗУ СПРАВА, У АРКИ') },
  { t: 152, do: () => arrivePest('tourist', 'ВТОРОЙ ТУРИСТ', 'ТЕПЕРЬ ИХ ДВОЕ') },
  { t: 164, do: () => arrivePest('dog', 'ЕЩЁ ОДНА СОБАКА', 'ДВА ХВОСТА — ДВОЕ ПОМЕХ') }
];
function arriveClient(id, l1, l2) {
  const cl = S.hiddenClients.find(c => c.id === id); if (!cl) return;
  S.hiddenClients.splice(S.hiddenClients.indexOf(cl), 1); S.clients.push(cl);
  toast(l1, l2, '#8aff7a'); beep(660, 0.1, 'triangle', 0.06); beep(990, 0.14, 'triangle', 0.06, 0, 0.1);
}
function arrivePest(kind, l1, l2) {
  const pl = S.pl; let x = 0, y = 0;
  for (let i = 0; i < 12; i++) { x = rnd(80, 1200); y = rnd(100, 640); if (dist(x, y, pl.x, pl.y) > 260) break; }
  S.pests.push(kind === 'tourist' ? new Tourist(x, y) : new RunDog(x, y));
  toast(l1, l2, '#ff9a6b'); beep(300, 0.12, 'sawtooth', 0.05, 200);
}
function updateStages(dt) {
  const st = Math.min(4, Math.floor(S.t / STAGE_LEN));
  if (st > S.stage) {
    S.stage = st; S.diff = 1 + 0.18 * st;
    toast('ЭТАП ' + (st + 1) + ' ИЗ 5: ' + STAGE_NAME[st], 'ГОЛУБИ И МАРТЫШКА АКТИВНЕЕ, МУЗЫКА БЫСТРЕЕ', '#ffe14d');
    beep(440, 0.1, 'square', 0.05); beep(660, 0.1, 'square', 0.05, 0, 0.1); beep(880, 0.16, 'square', 0.05, 0, 0.2);
  }
  while (S.sched < SCHEDULE.length && S.t >= SCHEDULE[S.sched].t) SCHEDULE[S.sched++].do();
}

/* ---------- Достижения ---------- */
const ACH = [
  { id: 'master', name: 'ШЕДЕВР ДНЯ', desc: 'КАДР НА 300+ ОЧКОВ' },
  { id: 'combo', name: 'СЕРИЙНИК', desc: 'СЕРИЯ ДОШЛА ДО x2' },
  { id: 'everyone', name: 'ВСЕХ ОХВАТИЛА', desc: '8 РАЗНЫХ КЛИЕНТОВ ЗА СМЕНУ' },
  { id: 'pigeon', name: 'ПОРТРЕТ ГОЛУБЯ', desc: 'СНЯТЬ ГОЛУБЯ ВМЕСТО КЛИЕНТА' },
  { id: 'cat', name: 'КОТ-МОДЕЛЬ', desc: 'СДЕЛАТЬ ПОРТРЕТ КОТА' },
  { id: 'bonus', name: 'ХОЗЯЙКА ПАРКА', desc: 'ПОДОБРАТЬ ВСЕ 5 БОНУСОВ ЗА СМЕНУ' },
  { id: 'storm', name: 'НЕ ПОГОДА', desc: 'ШЕДЕВР ПОД ДОЖДЁМ ИЛИ СНЕГОМ' },
  { id: 'k2', name: 'ЧЕТЫРЕ ТЫСЯЧИ', desc: 'НАБРАТЬ 4000 ОЧКОВ ЗА СМЕНУ' },
  { id: 'clean', name: 'ЧИСТАЯ РАБОТА', desc: '12 КАДРОВ И НИ ОДНОЙ МАЗНИ' },
  { id: 'empty', name: 'ФОТО НИ О ЧЁМ', desc: 'СНЯТЬ ПУСТОТУ' }
];
function loadAch() { try { const j = JSON.parse(localStorage.getItem('oksana-ach') || '{}'); return j && typeof j === 'object' ? j : {}; } catch (e) { return {}; } }
function saveAch() { try { localStorage.setItem('oksana-ach', JSON.stringify(S.ach)); } catch (e) { } }
function unlock(id) {
  if (S.ach[id]) return; S.ach[id] = 1; S.newAch.push(id); saveAch();
  const a = ACH.find(x => x.id === id);
  toast('ДОСТИЖЕНИЕ: ' + a.name, a.desc, '#ffd23f');
  beep(784, 0.1, 'square', 0.05); beep(988, 0.1, 'square', 0.05, 0, 0.1); beep(1568, 0.25, 'square', 0.05, 0, 0.2);
}
function achCount() { return ACH.filter(a => S.ach[a.id]).length; }

/* ---------- Подсказки после слабого кадра ---------- */
const TIPS = {
  clown: 'ЖДИ ПРЫЖКА КЛОУНА', fashion: 'ЖДИ ПОЗУ С ПОЦЕЛУЕМ', hipster: 'ЖДИ, КОГДА ПОДНИМЕТ ЧАШКУ', barista: 'ЖДИ СЕРДЕЧКО НА ЛАТТЕ',
  grandpa: 'ЖДИ, КОГДА ДЕДУШКА ПРОСНЁТСЯ', family: 'ЖДИ, КОГДА СЕМЬЯ СОБЕРЁТСЯ В КУЧКУ', couple: 'ЖДИ ПОЦЕЛУЙ ПАРЫ', wedding: 'ЖДИ ПОЦЕЛУЙ ЖЕНИХА И НЕВЕСТЫ',
  jogger: 'СНИМАЙ, КОГДА БЕГУН ОСТАНОВИТСЯ', busker: 'ЖДИ ГИТАРНОЕ СОЛО'
};
/* f — множители, которые снизили кадр (1 = без потерь); берём самый плохой и объясняем */
function shotHint(cl, f) {
  const order = ['mq', 'comp', 'fresh', 'pest', 'foc', 'cen'];
  let worst = null, wv = 0.85;
  for (const k of order) if (f[k] < wv) { wv = f[k]; worst = k; }
  switch (worst) {
    case 'mq': return 'СОВЕТ: ' + (TIPS[cl.id] || 'ЖДИ ПИК ПОЗЫ');
    case 'comp': return 'СОВЕТ: В РАМКЕ ДОЛЖЕН БЫТЬ ВЕСЬ КЛИЕНТ ЦЕЛИКОМ';
    case 'fresh': return 'СОВЕТ: ЭТОГО КЛИЕНТА ТОЛЬКО ЧТО СНЯЛИ, ИЩИ ДРУГОГО';
    case 'pest': return 'СОВЕТ: ПУГНИ ПОМЕХИ ВСПЫШКОЙ ИЛИ ЖДИ, КОГДА УЙДУТ';
    case 'foc': return 'СОВЕТ: ДЕРЖИ ПКМ, ПОКА РАМКА НЕ СТАНЕТ ЗЕЛЁНОЙ';
    case 'cen': return 'СОВЕТ: ПОСТАВЬ КЛИЕНТА В ЦЕНТР РАМКИ';
  }
  return '';
}

/* ---------- Старт и обновление ---------- */
function initRun() {
  S.stage = 0; S.diff = 1; S.sched = 0; S.toasts = []; S.newAch = []; S.pests = [];
  S.st = { shots: 0, bad: 0, uniq: {}, bon: {}, wx: {} };
  S.hiddenClients = S.clients.filter(c => HIDDEN_AT_START.includes(c.id));
  S.clients = S.clients.filter(c => !HIDDEN_AT_START.includes(c.id));
  const first = WX_TYPES[Math.floor(Math.random() * WX_TYPES.length)];
  S.wx = null; setWeather(first, true); S.st.wx[first] = 1;
  toast('СМЕНА НАЧАЛАСЬ: ' + WX_NAME[first], WX_TOAST[first][1], WX_COL[first]);
}
function updateSystems(dt) { updateWeather(dt); updateStages(dt); updateToasts(dt); for (const p of S.pests) p.upd(dt); }

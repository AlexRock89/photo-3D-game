'use strict';
/* ===== Управление касанием для телефонов ===== */
const TZ = { split: VW * 0.42, jr: 40, jx: 54, jy: 298, aimLift: 44 };

/* На телефоне вместо клавиш и мыши другие слова */
function touchText(s) {
  return s.replace('ПРОБЕЛ — ПРАВИЛА ИГРЫ', 'КНОПКА ? — ПРАВИЛА ИГРЫ').replace('ПРОБЕЛ — ПАУЗА И ПРАВИЛА В ЛЮБОЙ МОМЕНТ.', 'КНОПКА ? — ПАУЗА И ПРАВИЛА.')
    .replace('КЛИК ИЛИ ENTER', 'КАСАНИЕ').replace(/ПКМ/g, 'ПАЛЕЦ');
}
function isPortrait() { try { return !!(window.matchMedia && window.matchMedia('(orientation: portrait) and (pointer: coarse)').matches); } catch (e) { return false; } }

function touchPos(t) {
  const r = canvas.getBoundingClientRect();
  return { x: (t.clientX - r.left) * VW / r.width, y: (t.clientY - r.top) * VH / r.height };
}
function startTouchIntro() {
  S.intro = 0; S.joy.on = false; S.joy.id = -1; S.joy.x = 0; S.joy.y = 0; S.aimId = -1;
  if (!S.touch) return;
  let seen = false; try { seen = localStorage.getItem('oksana-touch') === '1'; } catch (e) { }
  if (!seen) { S.intro = 8; try { localStorage.setItem('oksana-touch', '1'); } catch (e) { } }
}
/* Кнопка «?»: на заставке — крупная, справа под блоком бонусов; в игре — квадрат справа под верхней панелью */
function helpBtnRect() { return S.mode === 'title' ? { x: 564, y: 246, w: 36, h: 36 } : { x: VW - 40, y: 22, w: 32, h: 32 }; }
const inHelpBtn = p => { const b = helpBtnRect(); return p.x >= b.x - 8 && p.x <= b.x + b.w + 8 && p.y >= b.y - 8 && p.y <= b.y + b.h + 8; };

function touchDown(id, p) {
  if (S.intro > 0) { if (S.intro < 7.3) S.intro = 0; return; }
  if (S.help) { if (S.helpPage < HELP_PAGES - 1) S.helpPage++; else S.help = false; return; }
  if (inHelpBtn(p)) { S.help = true; S.helpPage = 0; return; }
  if (S.mode !== 'play') { begin(); return; }
  if (p.x < TZ.split) {
    if (S.joy.id < 0) { Object.assign(S.joy, { id, on: true, ox: TZ.jx, oy: TZ.jy, x: 0, y: 0, kx: 0, ky: 0 }); touchMove(id, p); }
  } else if (S.aimId < 0) {
    S.aimId = id; S.rmb = true; S.mx = p.x; S.my = p.y - TZ.aimLift;
  }
}
function touchMove(id, p) {
  const j = S.joy;
  if (id === j.id) {
    const dx = p.x - j.ox, dy = p.y - j.oy, m = Math.hypot(dx, dy) || 1, k = Math.min(1, m / TZ.jr);
    j.kx = dx / m * k * TZ.jr; j.ky = dy / m * k * TZ.jr;
    if (m < 10) { j.x = 0; j.y = 0; } else { j.x = dx / m; j.y = dy / m; }
  } else if (id === S.aimId) { S.mx = p.x; S.my = p.y - TZ.aimLift; }
}
function touchUp(id, p, cancel) {
  const j = S.joy;
  if (id === j.id) { j.on = false; j.id = -1; j.x = 0; j.y = 0; j.kx = 0; j.ky = 0; }
  else if (id === S.aimId) {
    S.aimId = -1; S.rmb = false;
    if (!cancel && S.mode === 'play' && !S.help && S.intro <= 0) { S.mx = p.x; S.my = p.y - TZ.aimLift; S.shotReq = true; }
  }
}
/* Во весь экран: прячет адресную строку (Android). На iPhone такой возможности у браузера нет */
let FS_TRIES = 0;
function goFullscreen() {
  if (!S.touch || FS_TRIES > 3) return;
  if (document.fullscreenElement || document.webkitFullscreenElement) return;
  const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen; if (!rq) return;
  FS_TRIES++;
  try {
    const r = rq.call(el, { navigationUI: 'hide' });
    if (r && r.then) r.then(() => { try { screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } setTimeout(fit, 250); }).catch(() => { });
  } catch (e) { }
}
function initTouch() {
  try { if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) S.touch = true; } catch (e) { }
  const opt = { passive: false };
  canvas.addEventListener('touchstart', e => { e.preventDefault(); S.touch = true; actx(); for (const t of e.changedTouches) touchDown(t.identifier, touchPos(t)); }, opt);
  canvas.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) touchMove(t.identifier, touchPos(t)); }, opt);
  canvas.addEventListener('touchend', e => { e.preventDefault(); actx(); goFullscreen(); for (const t of e.changedTouches) touchUp(t.identifier, touchPos(t), false); }, opt);
  canvas.addEventListener('touchcancel', e => { e.preventDefault(); for (const t of e.changedTouches) touchUp(t.identifier, touchPos(t), true); }, opt);
  window.addEventListener('orientationchange', () => { setTimeout(fit, 150); });
  document.addEventListener('fullscreenchange', () => { setTimeout(fit, 250); });
}

/* ---------- Рисование ---------- */
function tri(c, x, y, d, col) {   // маленькая стрелка-треугольник: d = 0 вверх, 1 вправо, 2 вниз, 3 влево
  for (let i = 0; i < 4; i++) {
    const w = 1 + i * 2;
    if (d === 0) R(c, x - i, y + i, w, 1, col); else if (d === 2) R(c, x - i, y - i, w, 1, col);
    else if (d === 1) R(c, x - i, y - i, 1, w, col); else R(c, x + i, y - i, 1, w, col);
  }
}
function ring(c, x, y, r, fill, fa, line, la) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { c.globalAlpha = fa; c.fillStyle = fill; c.fill(); }
  if (line) { c.globalAlpha = la; c.strokeStyle = line; c.lineWidth = 2; c.stroke(); }
  c.globalAlpha = 1;
}
function drawStick(bx, by, knobX, knobY, active, alpha) {
  const c = ctx, r = TZ.jr;
  ring(c, bx, by, r, '#1b0f33', 0.45 * alpha, '#ffffff', (active ? 0.9 : 0.6) * alpha);
  c.globalAlpha = 0.85 * alpha;
  tri(c, bx, by - r + 7, 0, '#ffffff'); tri(c, bx, by + r - 8, 2, '#ffffff'); tri(c, bx - r + 7, by, 3, '#ffffff'); tri(c, bx + r - 8, by, 1, '#ffffff');
  c.globalAlpha = alpha;
  if (!active) T('БЕГ', bx, by - 4, '#ffe14d', 8, 'center');
  else ring(c, bx + knobX, by + knobY, 15, '#ffe14d', 0.8 * alpha, '#ffffff', 0.9 * alpha);
  c.globalAlpha = 1;
}
function drawZones() {
  const c = ctx, j = S.joy;
  drawStick(TZ.jx, TZ.jy, j.kx || 0, j.ky || 0, j.on, 1);
  const zx = TZ.split + 10, zw = VW - zx - 10, zc = zx + zw / 2;
  if (!S.st || S.st.shots < 1) {
    const y = VH - 66;
    c.globalAlpha = 0.7; R(c, zc - 104, y, 208, 42, '#1b0f33'); c.globalAlpha = 1;
    T('ВЕДИ ПАЛЬЦЕМ — РАМКА', zc, y + 5, '#ffffff', 8, 'center'); T('ДЕРЖИ — ФОКУС', zc, y + 17, '#8aff7a', 8, 'center'); T('ОТПУСТИ — СНИМОК', zc, y + 29, '#ffe14d', 8, 'center');
  }
}
function drawHelpButton() {
  const c = ctx, b = helpBtnRect();
  R(c, b.x + 2, b.y + 2, b.w, b.h, '#1b0f33');
  R(c, b.x, b.y, b.w, b.h, '#ffffff'); R(c, b.x + 2, b.y + 2, b.w - 4, b.h - 4, '#ff3d7f');
  T('?', b.x + b.w / 2, b.y + (b.h - 16) / 2 + 1, '#ffffff', 16, 'center');
}
function drawIntro() {
  const c = ctx, t = S.tt;
  c.globalAlpha = 0.88; c.fillStyle = '#120a24'; c.fillRect(0, 0, VW, VH); c.globalAlpha = 1;
  T('КАК ИГРАТЬ НА ТЕЛЕФОНЕ', VW / 2, 12, '#ffe14d', 16, 'center');
  // левая зона
  T('ЛЕВЫЙ ПАЛЕЦ', 110, 64, '#ffe14d', 8, 'center');
  const kx = Math.cos(t * 2) * 26, ky = Math.sin(t * 2) * 26;
  drawStick(110, 140, kx, ky, true, 1);
  ring(c, 110 + kx, 140 + ky, 5, '#ffffff', 1, null, 1);
  textLines(['ТЯНИ ПАЛЕЦ —', 'ОКСАНА БЕЖИТ'], 62, 196);
  // правая зона
  T('ПРАВЫЙ ПАЛЕЦ', 470, 64, '#ffe14d', 8, 'center');
  const zx = 340, zy = 84, zw = 260, zh = 104;
  c.globalAlpha = 0.5; corners(zx, zy, zw, zh, '#ffe14d'); c.globalAlpha = 1;
  const px = zx + zw / 2 + Math.cos(t * 1.4) * 80, py = zy + zh / 2 + Math.sin(t * 2.6) * 26;
  const ph = (t % 3) / 3;   // фаза: водим -> держим -> отпускаем
  c.globalAlpha = 0.9; corners(px - 26, py - 18, 52, 36, ph > 0.66 ? '#7dff7a' : '#ffffff'); c.globalAlpha = 1;
  ring(c, px, py + 22, 9, '#ffffff', 0.7, '#ffffff', 1);
  if (ph > 0.88) { c.globalAlpha = (ph - 0.88) / 0.12 * 0.8; c.fillStyle = '#ffffff'; c.fillRect(px - 26, py - 18, 52, 36); c.globalAlpha = 1; }
  textLines(['ВЕДИ — РАМКА ЗА ПАЛЬЦЕМ', 'ДЕРЖИ — НАВОДИТСЯ ФОКУС', 'ОТПУСТИ — СНИМОК'], 372, 204);
  if (Math.floor(t * 2) % 2 === 0) T('КАСАНИЕ — НАЧАТЬ СМЕНУ', VW / 2, 300, '#8aff7a', 8, 'center');
  T('КНОПКА ? СПРАВА — ПРАВИЛА И ПАУЗА', VW / 2, 320, '#c9b6ff', 8, 'center');
}
function drawTouch() {
  if (!S.touch) return;
  if (S.mode === 'play' && !S.help && S.intro <= 0) drawZones();
  if (!S.help) drawHelpButton();
  if (S.mode === 'play' && !S.help && S.intro > 0) drawIntro();
}

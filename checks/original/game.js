'use strict';
/* ===== Состояние ===== */
const S = {
  mode: 'title', t: 0, tt: 0, time: SHIFT, score: 0, combo: 0, best: 0, x2: 0, speedT: 0, lensT: 0, safeT: 0, clockT: 0,
  shots: [], texts: [], flash: 0, cd: 0, focus: 0, rmb: false, mx: VW / 2, my: VH / 2, keys: {},
  cam: { x: 440, y: 300 }, pl: { x: 640, y: 470, ph: 0, moving: false, dir: 1 }, endT: 0, bonuses: [], bonusT: 4,
  pending: null, monkeyOn: 0, fr: null, aimOnClient: false, clients: [], pigeons: [], cat: null, monkey: null,
  shotReq: false, mute: false, noMusic: false, banner: null, hint: 0, top: [], rank: '', newBest: false, help: false, helpPage: 0, alert: null,
  touch: false, joy: { on: false, id: -1, x: 0, y: 0, ox: 0, oy: 0, kx: 0, ky: 0 }, aimId: -1, intro: 0, portrait: false,
  stage: 0, diff: 1, sched: 0, toasts: [], wx: null, st: null, ach: {}, newAch: [], pests: [], hiddenClients: []
};
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VW; canvas.height = VH;
S.ground = makeGround();

/* ===== Мир ===== */
const TREES = [[100, 200, 0], [330, 252, 1], [560, 236, 2], [760, 244, 3], [1010, 232, 0], [1190, 200, 1], [110, 430, 2], [300, 452, 3], [520, 522, 0], [800, 548, 1], [980, 472, 2], [1190, 500, 3], [180, 590, 0], [420, 596, 2], [900, 592, 3], [1190, 330, 2]];
const BALLOONS = [[150, 300], [430, 210], [700, 500], [1000, 352], [250, 380], [600, 470], [880, 600], [380, 640], [1150, 160]];
const LAMPS = [[600, 300], [680, 424], [300, 350], [980, 380], [640, 600]];
const SOLIDS = [
  { c: 1, x: 640, y: 360, r: 36 }, { r: 1, x: 862, y: 84, w: 116, h: 48 }, { c: 1, x: 140, y: 556, r: 24 }, { r: 1, x: 1102, y: 284, w: 36, h: 14 }
];
TREES.forEach(t => SOLIDS.push({ c: 1, x: t[0], y: t[1], r: 5 }));
const STATIC = [];
TREES.forEach(([x, y, k]) => STATIC.push({ x, y, draw: (c, t) => drawTree(c, x, y, k, t) }));
BALLOONS.forEach(([x, y], i) => STATIC.push({ x, y, draw: (c, t) => drawBalloons(c, x, y, t, i) }));
LAMPS.forEach(([x, y]) => STATIC.push({ x, y, draw: (c, t) => drawLamp(c, x, y, t) }));
STATIC.push({ x: 640, y: 366, draw: (c, t) => drawFountain(c, 640, 356, t) });
STATIC.push({ x: 920, y: 132, draw: (c, t) => drawTruck(c, 920, 132, t) });
STATIC.push({ x: 230, y: 190, draw: (c, t) => drawTrampoline(c, 230, 206, S.clients[0] && S.clients[0].dip) });
STATIC.push({ x: 140, y: 560, draw: (c, t) => drawDino(c, 140, 560, t) });
STATIC.push({ x: 1120, y: 296, draw: (c) => drawBenchBack(c, 1120, 298) });
STATIC.push({ x: 1120, y: 299.5, draw: (c) => drawBenchFront(c, 1120, 298) });
STATIC.push({ x: 330, y: 540, draw: (c, t) => drawStage(c, 330, 566, t) });
STATIC.push({ x: 1062, y: 556, draw: (c, t) => drawArch(c, 1062, 556, t) });

function buildWorld() {
  S.clients = [new Clown(), new Fashion(), new Hipster(), new Family(), new CoupleDog(), new Barista(), new Grandpa(), new Wedding(), new Jogger(), new Busker()];
  S.pigeons = [[300, 300], [560, 420], [760, 400], [960, 260], [430, 520], [1100, 500], [220, 470]].map(p => new PigeonB(p[0], p[1]));
  S.cat = new CatB(700, 300); S.monkey = new MonkeyB(760, 250); S.bonuses = []; S.pests = []; S.hiddenClients = [];
}
function addText(x, y, text, col, big) { S.texts.push({ x, y, text, col: col || '#fff', t: 0, big: !!big }); }
function scareAll(cx, cy, rad) { for (const p of S.pigeons) p.scare(cx, cy, rad); for (const p of S.pests) p.scare(cx, cy, rad); S.cat.scare(cx, cy, rad); S.monkey.scare(cx, cy, rad); }

function startGame() {
  Object.assign(S, { mode: 'play', t: 0, time: SHIFT, score: 0, combo: 0, x2: 0, speedT: 0, lensT: 0, safeT: 0, clockT: 0, shots: [], texts: [], flash: 0, cd: 0, focus: 0, monkeyOn: 0, bonusT: 4, banner: null, hint: 8, pending: null, shotReq: false, newBest: false, help: false, helpPage: 0, alert: null });
  S.pl.x = 640; S.pl.y = 470; S.pl.dir = 1; S.cam.x = clamp(S.pl.x - VW / 2, 0, WW - VW); S.cam.y = clamp(S.pl.y - VH / 2, 0, WH - VH);
  buildWorld(); initRun(); startTouchIntro(); beep(520, 0.1, 'square', 0.06); beep(780, 0.15, 'square', 0.06);
}
function endGame() {
  S.mode = 'end'; S.endT = 0; S.time = 0; S.top = S.shots.filter(s => s.img).sort((a, b) => b.score - a.score).slice(0, 6);
  setAmbient('clear'); if (S.score >= 4000) unlock('k2'); if (S.st.shots >= 12 && S.st.bad === 0) unlock('clean');
  const r = S.score; S.rank = r < 1200 ? 'ПРАКТИКАНТКА' : r < 3000 ? 'СВАДЕБНЫЙ ФОТОГРАФ' : r < 6000 ? 'ЗВЕЗДА ГЛЯНЦА' : 'ЛЕГЕНДА (ГОЛУБИ В ШОКЕ)';
  if (S.score > S.best) { S.best = S.score; S.newBest = S.score > 0; try { localStorage.setItem('oksana-best', String(S.best)); } catch (e) { } }
  beep(392, 0.12, 'square', 0.06); setTimeout(() => beep(523, 0.12, 'square', 0.06), 130); setTimeout(() => beep(784, 0.25, 'square', 0.06), 260);
}
try { S.best = parseInt(localStorage.getItem('oksana-best') || '0', 10) || 0; } catch (e) { }
S.ach = loadAch();
buildWorld();

/* ===== Съёмка ===== */
function frac(b, f) {
  const ix = Math.max(0, Math.min(b.x + b.w, f.x + f.w) - Math.max(b.x, f.x)), iy = Math.max(0, Math.min(b.y + b.h, f.y + f.h) - Math.max(b.y, f.y));
  return ix * iy / (b.w * b.h);
}
const inside = (x, y, f) => x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h;

function takeShot() {
  const f = S.fr; let raw = 0, top = null, topV = 0, hits = 0; const seen = [];
  for (const cl of S.clients) {
    const mem = cl.members(); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const b of mem) if (frac(b, f) >= 0.6) { n++; x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
    if (!n) continue;
    const m = cl.moment(), comp = n / mem.length, off = Math.min(1, dist((x0 + x1) / 2, (y0 + y1) / 2, f.cx, f.cy) / (f.w * 0.5));
    const cen = 1 - 0.45 * off, fm = 0.6 + 0.9 * S.focus, fr = cl.fresh > 0 ? 0.2 : 1;
    const v = cl.base * m.q * cen * fm * fr * comp * comp;
    raw += v; hits++; seen.push(cl.id); if (v > topV) { topV = v; top = { cl, m, f: { mq: m.q, comp: comp * comp, fresh: fr, foc: fm / 1.5, cen } }; }
    if (v > 20) cl.fresh = 7;
  }
  let pg = 0; for (const p of S.pigeons) if (inside(p.x, p.y - p.z - 3, f)) pg++;
  let ps = 0; for (const p of S.pests) if (inside(p.x, p.y - (p.kind === 'dog' ? 6 : 16), f)) ps++;
  const ct = inside(S.cat.x, S.cat.y - 6, f) ? 1 : 0, mk = S.monkeyOn > 0, notes = [];
  let pen = Math.max(0.1, 1 - 0.22 * pg - 0.25 * ct - 0.25 * ps); if (mk) pen *= 0.2;
  raw *= pen;
  let cap = '', who = '';
  if (top) { cap = top.cl.capFor(top.m); who = top.cl.name; }
  else if (pg) { raw = 10 * pg; cap = 'Портрет голубя. Красавец!'; who = 'Голубь'; }
  else if (ct) { raw = 30; cap = 'Кот-модель в кадре'; who = 'Кот'; }
  else cap = 'Пусто. Там никого нет';
  if (top) {
    if (pg) notes.push('ГОЛУБЬ ВЛЕЗ В КАДР!'); if (ct) notes.push('КОТ ПОРТИТ ВИД!');
    for (const p of S.pests) if (inside(p.x, p.y - (p.kind === 'dog' ? 6 : 16), f)) { notes.push(p.kind === 'dog' ? 'СОБАКА ПРОБЕЖАЛА!' : 'ТУРИСТ ЛЕЗЕТ В КАДР!'); break; }
  }
  if (mk) notes.push('МАРТЫШКА НА ОБЪЕКТИВЕ!');
  let pts = Math.round(raw / 10) * 10; if (raw > 0 && pts === 0) pts = 10;
  if (pts >= 80) S.combo = Math.min(5, S.combo + 1); else S.combo = 0;
  pts = Math.round(pts * (1 + 0.25 * (Math.max(1, S.combo) - 1)) * (S.x2 > 0 ? 2 : 1) / 10) * 10;
  S.score += pts;
  const label = pts >= 300 ? ['ШЕДЕВР!', '#ffe14d'] : pts >= 180 ? ['ОТЛИЧНО!', '#8aff7a'] : pts >= 80 ? ['НОРМ', '#ffffff'] : pts > 0 ? ['МАЗНЯ', '#ff9a9a'] : ['ПУСТО', '#bbbbbb'];
  if (pts > 0) addText(f.cx, f.y - 8, '+' + pts, label[1], true);
  addText(f.cx, f.y + f.h + 6, label[0], label[1]);
  // подсказка: что именно снизило кадр
  let hint = '';
  if (pts < 180) {
    if (top) hint = shotHint(top.cl, Object.assign({ pest: pen }, top.f));
    else if (pg) hint = 'СОВЕТ: ГОЛУБЬ — НЕ КЛИЕНТ, ИЩИ ЛЮДЕЙ';
    else if (ct) hint = 'СОВЕТ: КОТ — НЕ КЛИЕНТ, ИЩИ ЛЮДЕЙ';
    else hint = 'СОВЕТ: ВЕДИ РАМКУ НА КЛИЕНТА, НУЖНО 60% ФИГУРЫ';
  }
  const lines = [{ s: cap, col: label[1] }]; if (notes.length) lines.push({ s: notes.join(' '), col: '#ff6b6b' }); if (hint) lines.push({ s: hint, col: '#ffd23f' });
  S.banner = { t: hint ? 4.5 : 3, lines };
  const entry = { score: pts, cap, who: who || '—', focus: S.focus, sx: f.sx, sy: f.sy, w: f.w, h: f.h, img: null };
  S.pending = entry; if (pts > 0) S.shots.push(entry);
  S.flash = 1; S.cd = 0.45; shutter();
  scareAll(f.cx, f.cy, f.w * 1.1 + 40); S.monkey.release();
  if (pts >= 180) { beep(880, 0.1, 'square', 0.05); beep(1320, 0.15, 'square', 0.05, 0, 0.09); }
  else if (pts === 0) beep(140, 0.2, 'sawtooth', 0.05, 80);
  // статистика и достижения
  S.st.shots++; if (pts < 80) S.st.bad++;
  if (pts >= 80) for (const id of seen) S.st.uniq[id] = 1;
  if (Object.keys(S.st.uniq).length >= 8) unlock('everyone');
  if (pts >= 300) { unlock('master'); if (S.wx && (S.wx.type === 'rain' || S.wx.type === 'snow')) unlock('storm'); }
  if (S.combo >= 5) unlock('combo');
  if (!top) { if (pg) unlock('pigeon'); else if (ct) unlock('cat'); else unlock('empty'); }
}
function announceBonus(b) {
  const sx = b.x - S.cam.x, sy = b.y - S.cam.y - 18, on = sx > 6 && sx < VW - 6 && sy > 26 && sy < VH - 6;
  S.alert = { t: 4, type: b.type, on };
  beep(880, 0.08, 'triangle', 0.07); beep(1175, 0.14, 'triangle', 0.07, 0, 0.1);
}
function applyBonus(b) {
  const i = BONUS_INFO[b.type]; addText(S.pl.x, S.pl.y - 42, i.msg, '#ffe14d');
  beep(660, 0.08, 'square', 0.06); beep(990, 0.12, 'square', 0.06, 0, 0.07);
  S.st.bon[b.type] = 1; if (Object.keys(S.st.bon).length >= 5) unlock('bonus');
  if (b.type === 'coffee') S.speedT = BONUS_INFO.coffee.dur; else if (b.type === 'lens') S.lensT = BONUS_INFO.lens.dur; else if (b.type === 'clock') { S.time += 8; S.clockT = 2.5; } else if (b.type === 'x2') S.x2 = BONUS_INFO.x2.dur;
  else if (b.type === 'flash') { scareAll(S.pl.x, S.pl.y, 260); S.safeT = BONUS_INFO.flash.dur; S.flash = 0.6; }
}

/* ===== Обновление ===== */
function updateEntities(dt) {
  for (const c of S.clients) c.upd(dt);
  for (const p of S.pigeons) p.upd(dt);
  for (const p of S.pests) p.upd(dt);
  S.cat.upd(dt); S.monkey.upd(dt);
  for (const t of S.texts) t.t += dt; S.texts = S.texts.filter(t => t.t < 1.5);
}
function update(dt) {
  S.tt += dt; S.portrait = isPortrait();
  if (S.portrait) return;
  if (S.help) return;
  if (S.mode === 'play' && S.intro > 0) { S.intro -= dt; return; }
  if (S.mode !== 'play') {
    updateEntities(dt); S.cam.x = 420 + Math.sin(S.tt * 0.08) * 260; S.cam.y = 260 + Math.cos(S.tt * 0.06) * 120; S.fr = null;
    if (S.mode === 'end') S.endT += dt; return;
  }
  S.t += dt; S.time -= dt; if (S.hint > 0) S.hint -= dt; updateSystems(dt);
  S.speedT = Math.max(0, S.speedT - dt); S.lensT = Math.max(0, S.lensT - dt); S.safeT = Math.max(0, S.safeT - dt); S.x2 = Math.max(0, S.x2 - dt); S.clockT = Math.max(0, S.clockT - dt); if (S.alert) { S.alert.t -= dt; if (S.alert.t <= 0) S.alert = null; }
  S.flash = Math.max(0, S.flash - dt * 5); S.cd = Math.max(0, S.cd - dt); if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
  // движение
  const k = S.keys, pl = S.pl;
  let dx = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), dy = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  if (S.joy.on) { dx += S.joy.x; dy += S.joy.y; }
  pl.moving = !!(dx || dy);
  if (pl.moving) {
    const l = Math.hypot(dx, dy), sp = 96 * (S.speedT > 0 ? 1.55 : 1) * (S.monkeyOn > 0 ? 0.6 : 1) * wxSpeedMul(dx, dy);
    pl.x += dx / l * sp * dt; pl.y += dy / l * sp * dt; pl.ph += sp * dt * 0.2;
  }
  for (const s of SOLIDS) {
    if (s.c) { const d = dist(pl.x, pl.y, s.x, s.y), m = s.r + 4; if (d < m && d > 0.01) { pl.x = s.x + (pl.x - s.x) / d * m; pl.y = s.y + (pl.y - s.y) / d * m; } }
    else if (pl.x > s.x - 4 && pl.x < s.x + s.w + 4 && pl.y > s.y - 1 && pl.y < s.y + s.h + 3) {
      const dl = pl.x - (s.x - 4), dr = s.x + s.w + 4 - pl.x, du = pl.y - (s.y - 1), dd = s.y + s.h + 3 - pl.y, m = Math.min(dl, dr, du, dd);
      if (m === dl) pl.x = s.x - 4; else if (m === dr) pl.x = s.x + s.w + 4; else if (m === du) pl.y = s.y - 1; else pl.y = s.y + s.h + 3;
    }
  }
  pl.x = clamp(pl.x, 22, WW - 22); pl.y = clamp(pl.y, 42, WH - 20);
  // камера
  const tx = clamp(pl.x - VW / 2, 0, WW - VW), ty = clamp(pl.y - 14 - VH / 2, 0, WH - VH), a = Math.min(1, dt * 8);
  S.cam.x += (tx - S.cam.x) * a; S.cam.y += (ty - S.cam.y) * a;
  // рамка
  S.focus = S.rmb ? Math.min(1, S.focus + dt / ((S.lensT > 0 ? 0.12 : 0.55) * wxFocusMul())) : Math.max(0, S.focus - dt / 0.25);
  const w = Math.round(lerp(96, 60, S.focus)), h = Math.round(w * 2 / 3);
  const cx = clamp(S.mx, w / 2, VW - w / 2), cy = clamp(S.my, h / 2, VH - h / 2);
  const sx = Math.round(cx - w / 2), sy = Math.round(cy - h / 2), camx = Math.round(S.cam.x), camy = Math.round(S.cam.y);
  S.fr = { w, h, sx, sy, x: sx + camx, y: sy + camy, cx: sx + w / 2 + camx, cy: sy + h / 2 + camy };
  pl.dir = S.fr.cx >= pl.x ? 1 : -1;
  S.aimOnClient = false;
  for (const cl of S.clients) { for (const b of cl.members()) if (frac(b, S.fr) >= 0.6) { S.aimOnClient = true; break; } if (S.aimOnClient) break; }
  updateEntities(dt);
  // выстрел
  if (S.shotReq) { S.shotReq = false; if (S.cd <= 0) takeShot(); }
  // бонусы
  S.bonusT -= dt;
  if (S.bonusT <= 0 && S.bonuses.length < 3) {
    for (let tries = 0; tries < 12; tries++) {
      const x = rnd(90, 1190), y = rnd(100, 650); let ok = true;
      for (const s of SOLIDS) { if (s.c ? dist(x, y, s.x, s.y) < s.r + 18 : (x > s.x - 18 && x < s.x + s.w + 18 && y > s.y - 18 && y < s.y + s.h + 18)) { ok = false; break; } }
      if (ok) { const nb = new Bonus(BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)], x, y); S.bonuses.push(nb); announceBonus(nb); break; }
    }
    S.bonusT = rnd(5, 8);
  }
  for (const b of S.bonuses) { b.life -= dt; b.t += dt; if (dist(pl.x, pl.y - 8, b.x, b.y - 8) < 18) { b.life = -1; applyBonus(b); } }
  S.bonuses = S.bonuses.filter(b => b.life > 0);
  if (S.time <= 0) endGame();
}

/* ===== Рисование ===== */
function T(str, x, y, col, size, align) {
  if (S.touch) str = touchText(str);
  ctx.font = (size || 8) + 'px ' + FONT; ctx.textBaseline = 'top'; ctx.textAlign = align || 'left';
  ctx.fillStyle = '#1b0f33'; ctx.fillText(str, x + 1, y + 1); ctx.fillStyle = col || '#fff'; ctx.fillText(str, x, y);
}
function renderWorld(t) {
  ctx.save(); ctx.translate(-Math.round(S.cam.x), -Math.round(S.cam.y));
  ctx.drawImage(S.ground, 0, 0);
  const items = [], cx0 = S.cam.x - 130, cx1 = S.cam.x + VW + 130, cy0 = S.cam.y - 90, cy1 = S.cam.y + VH + 150, vis = o => o.x > cx0 && o.x < cx1 && o.y > cy0 && o.y < cy1;
  for (const s of STATIC) if (vis(s)) items.push({ y: s.y, d: s.draw });
  for (const c of S.clients) if (vis(c)) items.push({ y: c.y, d: (cc, tt) => c.draw(cc, tt) });
  for (const p of S.pigeons) if (vis(p)) items.push({ y: p.y + (p.z > 0.5 ? 1000 : 0), d: cc => p.draw(cc) });
  for (const p of S.pests) if (vis(p)) items.push({ y: p.y, d: cc => p.draw(cc) });
  if (vis(S.cat)) items.push({ y: S.cat.y, d: cc => S.cat.draw(cc) });
  if (vis(S.monkey)) items.push({ y: S.monkey.y + 1, d: cc => S.monkey.draw(cc) });
  items.push({ y: S.pl.y, d: cc => { shadow(cc, S.pl.x, S.pl.y, 9); drawOksana(cc, S.pl.x, S.pl.y, { dir: S.pl.dir, ph: S.pl.ph, moving: S.pl.moving, flash: S.flash > 0.5 }); } });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.d(ctx, t);
  for (const b of S.bonuses) b.draw(ctx);
  for (const tx of S.texts) {
    const k = tx.t / 1.5; ctx.globalAlpha = 1 - k * k * k;
    T(tx.text, Math.round(tx.x), Math.round(tx.y - tx.t * 16), tx.col, tx.big ? 16 : 8, 'center');
  }
  ctx.globalAlpha = 1; ctx.restore();
}
function capturePending() {
  const e = S.pending; if (!e) return; S.pending = null;
  try {
    const cv = document.createElement('canvas'); cv.width = e.w; cv.height = e.h; const c2 = cv.getContext('2d');
    if (e.focus < 0.5 && 'filter' in c2) c2.filter = 'blur(1px)';
    c2.drawImage(canvas, e.sx, e.sy, e.w, e.h, 0, 0, e.w, e.h); e.img = cv;
  } catch (err) { }
}
function corners(x, y, w, h, col) {
  const L = 9;
  for (const [ox, oy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    R(ctx, sx > 0 ? ox - 1 : ox - L + 1, oy - (sy > 0 ? 1 : 1), L + 1, 4, '#1b0f33'); R(ctx, ox - (sx > 0 ? 1 : 1), sy > 0 ? oy - 1 : oy - L + 1, 4, L + 1, '#1b0f33');
    R(ctx, sx > 0 ? ox : ox - L + 2, sy > 0 ? oy : oy + 0, L, 2, col); R(ctx, sx > 0 ? ox : ox - 1, sy > 0 ? oy : oy - L + 2, 2, L, col);
  }
}
function drawFrame() {
  const f = S.fr, sharp = S.focus >= 0.95, col = sharp ? '#7dff7a' : '#ffffff';
  if (S.focus > 0.05) {
    ctx.globalAlpha = 0.38 * S.focus; ctx.fillStyle = '#1b0f33';
    ctx.fillRect(0, 0, VW, f.sy); ctx.fillRect(0, f.sy + f.h, VW, VH - f.sy - f.h); ctx.fillRect(0, f.sy, f.sx, f.h); ctx.fillRect(f.sx + f.w, f.sy, VW - f.sx - f.w, f.h); ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 0.3;
  R(ctx, f.sx + f.w / 3, f.sy, 1, f.h, col); R(ctx, f.sx + f.w * 2 / 3, f.sy, 1, f.h, col); R(ctx, f.sx, f.sy + f.h / 3, f.w, 1, col); R(ctx, f.sx, f.sy + f.h * 2 / 3, f.w, 1, col); ctx.globalAlpha = 1;
  corners(f.sx, f.sy, f.w - 2, f.h - 2, col);
  const mx = Math.round(f.sx + f.w / 2), my = Math.round(f.sy + f.h / 2);
  R(ctx, mx - 3, my, 7, 1, col); R(ctx, mx, my - 3, 1, 7, col);
  R(ctx, f.sx, f.sy + f.h + 4, f.w, 4, '#1b0f33'); R(ctx, f.sx + 1, f.sy + f.h + 5, Math.round((f.w - 2) * S.focus), 2, sharp ? '#7dff7a' : '#ffd23f');
  if (sharp) T('ФОКУС', mx, f.sy - 10, '#7dff7a', 8, 'center');
  if (S.monkeyOn > 0) {
    const x = mx, y = my; disc(ctx, x - 20, y - 14, 8, '#7b4a2b'); disc(ctx, x + 20, y - 14, 8, '#7b4a2b'); disc(ctx, x - 20, y - 14, 4, '#e9c49b'); disc(ctx, x + 20, y - 14, 4, '#e9c49b');
    disc(ctx, x, y, 24, '#7b4a2b'); ell(ctx, x, y + 4, 17, 15, '#e9c49b');
    disc(ctx, x - 7, y - 4, 4, '#fff'); disc(ctx, x + 7, y - 4, 4, '#fff'); R(ctx, x - 6 + Math.round(Math.sin(S.tt * 12)), y - 4, 2, 3, '#222'); R(ctx, x + 6 + Math.round(Math.sin(S.tt * 12)), y - 4, 2, 3, '#222');
    R(ctx, x - 9, y + 8, 18, 7, '#a5502e'); R(ctx, x - 7, y + 8, 14, 3, '#fff'); R(ctx, x - 2, y + 2, 1, 2, '#4e2d19'); R(ctx, x + 1, y + 2, 1, 2, '#4e2d19');
    T('У-У! А-А!', x, y + 30, '#ffd23f', 8, 'center');
  }
}
function fmtTime(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function drawBonusRadar() {
  const cxm = VW / 2, minY = 44, maxY = VH - 48, cym = (minY + maxY) / 2;
  for (const b of S.bonuses) {
    const sx = b.x - S.cam.x, sy = b.y - S.cam.y - 18;
    if (sx > 6 && sx < VW - 6 && sy > 26 && sy < VH - 6) continue;
    if (b.life < 3 && Math.floor(b.life * 6) % 2) continue;
    const dx = sx - cxm, dy = sy - cym, k = Math.min((cxm - 22) / Math.max(1, Math.abs(dx)), (cym - minY) / Math.max(1, Math.abs(dy)), 1);
    const mx = Math.round(cxm + dx * k), my = Math.round(cym + dy * k), inf = BONUS_INFO[b.type], pulse = Math.sin(S.tt * 8) > 0;
    disc(ctx, mx, my, pulse ? 13 : 12, inf.col); disc(ctx, mx, my, 10, '#ffffff'); icon(ctx, inf.ic, mx - 5, my - 4, 1);
    if (b.type === 'x2') { ctx.font = '8px ' + FONT; ctx.textBaseline = 'top'; ctx.textAlign = 'center'; ctx.fillStyle = '#7a3ff2'; ctx.fillText('x2', mx, my - 4); }
    const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    for (let i = 0; i < 4; i++) { const s = 4 - i; R(ctx, mx + ux * (14 + i * 2) - s / 2, my + uy * (14 + i * 2) - s / 2, s, s, inf.col); }
  }
  if (S.alert) {
    const a = S.alert, inf = BONUS_INFO[a.type], al = Math.min(1, a.t * 2);
    ctx.globalAlpha = al * 0.88; const ax = VW - 246 - (S.touch ? 46 : 0); R(ctx, ax, 34, 238, 30, '#1b0f33'); ctx.globalAlpha = al; R(ctx, ax, 34, 2, 30, inf.col);
    icon(ctx, inf.ic, ax + 8, 40, 2); T('НОВЫЙ БОНУС: ' + inf.name, ax + 38, 38, inf.col === '#ffffff' ? '#ffffff' : inf.col); T(a.on ? 'ОН РЯДОМ, ЛОВИ!' : 'СЛЕДУЙ ЗА СТРЕЛКОЙ!', ax + 38, 50, '#ffffff'); ctx.globalAlpha = 1;
  }
}
function drawHUD() {
  ctx.globalAlpha = 0.6; R(ctx, 0, 0, VW, 18, '#1b0f33'); ctx.globalAlpha = 1;
  const low = S.time < 10 && Math.floor(S.time * 3) % 2 === 0;
  T('ВРЕМЯ ' + fmtTime(S.time), 8, 5, low ? '#ff6b6b' : '#ffffff');
  T('ОЧКИ ' + S.score, VW / 2, 5, '#ffe14d', 8, 'center');
  const rx = VW - 8;
  if (S.combo > 1) T('СЕРИЯ x' + (1 + 0.25 * (S.combo - 1)), rx, 5, '#8aff7a', 8, 'right'); else T('РЕКОРД ' + S.best, rx, 5, '#c9b6ff', 8, 'right');
  drawWeatherChip(112, 5);
  if (!S.touch) T('ПРОБЕЛ — ПРАВИЛА', VW - 8, 22, '#c9b6ff', 8, 'right');
  const act = [['coffee', S.speedT], ['lens', S.lensT], ['flash', S.safeT], ['x2', S.x2], ['clock', S.clockT]].filter(a => a[1] > 0);
  act.forEach(([n, v], i) => {
    const inf = BONUS_INFO[n], y = 22 + i * 17, fr = inf.dur ? v / inf.dur : v / 2.5;
    ctx.globalAlpha = 0.72; R(ctx, 6, y, 230, 15, '#1b0f33'); ctx.globalAlpha = 1;
    R(ctx, 6, y, 2, 15, inf.col); icon(ctx, inf.ic, 12, y + 3, 1);
    T(inf.hud, 28, y + 3, '#ffffff'); if (inf.dur) T(Math.ceil(v) + ' С', 232, y + 3, '#ffe14d', 8, 'right');
    R(ctx, 28, y + 12, 204, 2, '#4b3a66'); R(ctx, 28, y + 12, Math.round(204 * Math.min(1, fr)), 2, inf.col);
  });
  if (S.banner) {
    const b = S.banner, n = b.lines.length, h = 10 + n * 11, y0 = VH - 8 - h, al = Math.min(1, b.t * 3), bx = S.touch ? 112 : 50, bw = S.touch ? VW - 124 : VW - 100;
    ctx.globalAlpha = 0.78 * al; R(ctx, bx, y0, bw, h, '#1b0f33'); ctx.globalAlpha = al;
    b.lines.forEach((l, i) => T(l.s, bx + bw / 2, y0 + 6 + i * 11, l.col, 8, 'center')); ctx.globalAlpha = 1;
  } else if (S.hint > 0 && !S.touch) {
    ctx.globalAlpha = Math.min(1, S.hint); T('WASD — БЕГ  ЛКМ — СНИМОК  ПКМ — ФОКУС  ПРОБЕЛ — ПАУЗА', VW / 2, VH - 16, '#ffffff', 8, 'center'); ctx.globalAlpha = 1;
  }
  drawBonusRadar(); drawToast();
}
function drawInfoPanels(PY) {
  const PW = 270, PH = 118, LX = 40, RX = 330;
  T('УПРАВЛЕНИЕ', LX + PW / 2, PY - 14, '#ffe14d', 8, 'center'); T('БОНУСЫ В ПАРКЕ', RX + PW / 2, PY - 14, '#ffe14d', 8, 'center');
  ctx.globalAlpha = 0.65; R(ctx, LX, PY, PW, PH, '#1b0f33'); R(ctx, RX, PY, PW, PH, '#1b0f33'); ctx.globalAlpha = 1;
  const keys = S.touch ? [['ЛЕВЫЙ ПАЛЕЦ', 'БЕГ: ТЯНИ ДЖОЙСТИК'], ['ПРАВЫЙ ПАЛЕЦ', 'РАМКА ЗА ПАЛЬЦЕМ'], ['ДЕРЖИ', 'НАВОДИТСЯ ФОКУС'], ['ОТПУСТИ', 'СНИМОК СО ВСПЫШКОЙ'], ['КНОПКА ?', 'ПАУЗА И ПРАВИЛА']] : [['WASD / СТРЕЛКИ', 'БЕГ ПО ПАРКУ'], ['МЫШЬ', 'ПРИЦЕЛ-РАМКА'], ['ЛКМ', 'СНИМОК СО ВСПЫШКОЙ'], ['ПКМ (ДЕРЖАТЬ)', 'ФОКУС, БОЛЬШЕ ОЧКОВ'], ['M / N', 'ЗВУК / МУЗЫКА ВКЛ-ВЫКЛ']];
  keys.forEach((k, i) => { const y = PY + 6 + i * 22; R(ctx, LX + 6, y, 2, 18, '#ffe14d'); T(k[0], LX + 16, y + 1, '#ffe14d'); T(k[1], LX + 16, y + 11, '#ffffff'); });
  BONUS_TYPES.forEach((n, i) => {
    const inf = BONUS_INFO[n], y = PY + 6 + i * 22; R(ctx, RX + 6, y, 2, 18, inf.col); icon(ctx, inf.ic, RX + 14, y + 1, 2);
    T(inf.name + (inf.dur ? '  ' + inf.dur + ' С' : ''), RX + 44, y + 1, inf.col, 8); T(inf.desc, RX + 44, y + 11, '#ffffff');
  });
}
function textLines(arr, x, y, col) { for (const s of arr) { if (s === '') { y += 5; continue; } T(s, x, y, col || '#ffffff'); y += 10; } return y; }
const HELP_TITLES = ['КАК СЧИТАЮТСЯ ОЧКИ', 'ВРЕДИТЕЛИ И СЛОЖНОСТЬ', 'ПОГОДА', 'УПРАВЛЕНИЕ И БОНУСЫ', 'ДОСТИЖЕНИЯ'], HELP_PAGES = 5;
function drawHelp() {
  ctx.fillStyle = 'rgba(27,15,51,0.96)'; ctx.fillRect(0, 0, VW, VH);
  const pg = S.helpPage;
  T(HELP_TITLES[pg], VW / 2, 8, '#ffe14d', 16, 'center');
  if (pg === 0) {
    T('ОЧКИ ЗА КАДР', 24, 36, '#ffe14d');
    let y = textLines(['КЛИЕНТ ЗАСЧИТАН, ЕСЛИ В РАМКЕ', 'ХОТЯ БЫ 60% ЕГО ФИГУРЫ.', '',
      '1. МОМЕНТ: ЖДИ ПИК ПОЗЫ. КЛОУН', '   В ПРЫЖКЕ, ПОЦЕЛУЙ, СЕРДЕЧКО,', '   СОЛО, СЕМЬЯ СОБРАЛАСЬ.',
      '2. ФОКУС: ДЕРЖИ ПКМ ДО ЗЕЛЁНОЙ', '   РАМКИ. ЭТО ДО x2.5 К ОЧКАМ.',
      '3. ЦЕНТР: ЧЕМ БЛИЖЕ К СЕРЕДИНЕ', '   РАМКИ, ТЕМ ЛУЧШЕ (КРАЙ: -45%).',
      '4. СЕМЬЯ, ПАРА И СВАДЬБА — ТОЛЬКО', '   ЦЕЛИКОМ, ИНАЧЕ ОЧКОВ МАЛО.',
      '5. ОДНОГО КЛИЕНТА 7 СЕК ПОСЛЕ', '   СНИМКА СНИМАТЬ БЕСПОЛЕЗНО.'], 24, 50);
    textLines(['', 'СЕРИЯ: КАЖДЫЙ КАДР ОТ 80 ОЧКОВ', 'ПОДНИМАЕТ МНОЖИТЕЛЬ ДО x2.', 'СЛАБЕЕ 80 — СЕРИЯ СБРОШЕНА.'], 24, y, '#8aff7a');
    T('ОЦЕНКА КАДРА', 330, 36, '#ffe14d');
    [['ШЕДЕВР     300+', '#ffe14d'], ['ОТЛИЧНО     180+', '#8aff7a'], ['НОРМ         80+', '#ffffff'], ['МАЗНЯ     10-70', '#ff9a9a'], ['ПУСТО          0', '#bbbbbb']].forEach((r, i) => T(r[0], 330, 52 + i * 12, r[1]));
    T('ПОДСКАЗКИ', 330, 124, '#ffe14d');
    textLines(['ЕСЛИ КАДР СЛАБЕЕ 180, ВНИЗУ', 'ПОЯВИТСЯ СОВЕТ: ЧТО ИМЕННО', 'СНИЗИЛО ОЧКИ И КАК ИСПРАВИТЬ.'], 330, 138);
    T('ЦЕЛЬ', 330, 184, '#ffe14d');
    textLines(['ЗА ' + SHIFT / 60 + ' МИНУТЫ НАБРАТЬ МАКСИМУМ', 'ОЧКОВ. ЛУЧШИЕ КАДРЫ ПОПАДУТ', 'В ПОРТФОЛИО В КОНЦЕ СМЕНЫ.'], 330, 198);
  } else if (pg === 1) {
    const rows = [
      ['ГОЛУБЬ', '#c9d0e0', ['ЛЕТИТ В РАМКУ И САДИТСЯ. -22% ЗА', 'КАЖДОГО В КАДРЕ. ПУГАЕТСЯ ВСПЫШКИ.'], () => pigeon(ctx, 24, 17, { dir: -1, ph: S.tt * 4, peck: Math.sin(S.tt * 5) > 0 })],
      ['КОТ', '#ffb35a', ['СИДИТ У КЛИЕНТОВ, ПОРТИТ КОМПОЗИЦИЮ:', '-25% ЗА КАДР. ПУГАЕТСЯ ВСПЫШКИ.'], () => cat(ctx, 24, 17, { dir: 1, ph: S.tt * 3, sit: true })],
      ['МАРТЫШКА', '#d9a066', ['КРАДЁТ БОНУСЫ, ПРЫГАЕТ НА ОБЪЕКТИВ:', 'КАДР ПОЧТИ БЕЗ ОЧКОВ. ВСПЫШКА СГОНЯЕТ.'], () => monkey(ctx, 24, 17, { dir: 1, ph: S.tt * 8, moving: false })],
      ['ТУРИСТ  (С 44 СЕК)', '#ff9a6b', ['ХОДИТ СО СЕЛФИ-ПАЛКОЙ, -25% ЗА КАДР.', 'ВСПЫШКОЙ НЕ ПУГАЕТСЯ — ЖДИ, КОГДА УЙДЁТ.'], null],
      ['СОБАКА  (С 80 СЕК)', '#c58a54', ['НОСИТСЯ ПО ПАРКУ, -25% ЗА КАДР.', 'ВСПЫШКА ЕЁ ПУГАЕТ, БЕЖИТ ЕЩЁ БЫСТРЕЕ.'], () => dog(ctx, 24, 17, { dir: 1, ph: S.tt * 10, body: '#7a5240', pat: '#34211a' })]
    ];
    rows.forEach((r, i) => {
      const y = 30 + i * 40;
      if (r[3]) { ctx.save(); ctx.translate(0, y); ctx.scale(2, 2); r[3](); ctx.restore(); } else touristSprite(ctx, 48, y + 34, S.tt * 6, true, Math.sin(S.tt * 4) > 0.5);
      T(r[0], 90, y + 4, r[1]); textLines(r[2], 90, y + 16);
    });
    T('ЧЕМ ДАЛЬШЕ, ТЕМ СЛОЖНЕЕ', 24, 236, '#ffe14d');
    textLines(['5 ЭТАПОВ ПО ' + STAGE_LEN + ' СЕКУНД. СНАЧАЛА 6 КЛИЕНТОВ,', 'ПОТОМ ВЫХОДЯТ МУЗЫКАНТ, ПАРА, БЕГУН И СВАДЬБА.', 'ПОДТЯГИВАЮТСЯ ТУРИСТЫ, СОБАКИ И СТАЯ ГОЛУБЕЙ.', 'ГОЛУБИ И МАРТЫШКА С КАЖДЫМ ЭТАПОМ АКТИВНЕЕ.'], 24, 250, '#ffffff');
  } else if (pg === 2) {
    const rows = [
      ['ЯСНО', 'clear', ['ПОГОДА БЕЗ ПОМЕХ.', 'ЛУЧШЕЕ ВРЕМЯ ГНАТЬСЯ ЗА ОЧКАМИ.']],
      ['ВЕТЕР', 'wind', ['СТРЕЛКА В ВЕРХНЕЙ ПАНЕЛИ — КУДА ДУЕТ.', 'ПО ВЕТРУ БЕГ БЫСТРЕЕ (ДО +30%), ПРОТИВ — МЕДЛЕННЕЕ (ДО -30%).']],
      ['ДОЖДЬ', 'rain', ['ФОКУС НАВОДИТСЯ В 1.7 РАЗА ДОЛЬШЕ.', 'ДЕРЖИ ПКМ ЗАРАНЕЕ, ПОКА ЖДЁШЬ МОМЕНТ.']],
      ['СНЕГ', 'snow', ['БЕГ МЕДЛЕННЕЕ НА 25% ВО ВСЕ СТОРОНЫ.', 'ПЛАНИРУЙ ПУТЬ К КЛИЕНТАМ И БОНУСАМ ЗАРАНЕЕ.']]
    ];
    rows.forEach((r, i) => {
      const y = 36 + i * 48, ic = 40, col = WX_COL[r[1]];
      R(ctx, 24, y, 2, 38, col);
      if (r[1] === 'clear') disc(ctx, ic + 8, y + 16, 8, '#ffe14d');
      else if (r[1] === 'wind') drawArrow(ctx, ic + 8, y + 16, Math.sin(S.tt) * 0.5, col);
      else if (r[1] === 'rain') { ell(ctx, ic + 8, y + 10, 10, 5, '#cfd8ee'); for (let k = 0; k < 4; k++) R(ctx, ic + 1 + k * 5, y + 18 + ((S.tt * 14 + k * 3) % 10), 1, 4, '#6fa8ff'); }
      else for (let k = 0; k < 4; k++) R(ctx, ic + 2 + k * 5, y + 8 + ((S.tt * 8 + k * 6) % 20), 3, 3, '#ffffff');
      T(r[0], 84, y + 4, col); textLines(r[2], 84, y + 17);
    });
    textLines(['СМЕНА НАЧИНАЕТСЯ СО СЛУЧАЙНОЙ ПОГОДЫ.', 'ДАЛЬШЕ ОНА МЕНЯЕТСЯ КАЖДЫЕ 35-50 СЕКУНД.', 'КАЖДАЯ СМЕНА ИГРАЕТСЯ ПО-РАЗНОМУ.'], 24, 240, '#c9b6ff');
  } else if (pg === 3) {
    drawInfoPanels(62);
    T('ПРОБЕЛ — ПАУЗА И ПРАВИЛА В ЛЮБОЙ МОМЕНТ.', VW / 2, 206, '#ffffff', 8, 'center');
    T('БОНУС ЛЕЖИТ 14 СЕКУНД, ПОТОМ ИСЧЕЗАЕТ.', VW / 2, 222, '#c9b6ff', 8, 'center');
    T('МАРТЫШКА МОЖЕТ УТАЩИТЬ ЕГО РАНЬШЕ ТЕБЯ.', VW / 2, 238, '#c9b6ff', 8, 'center');
    T('БОНУС ВНЕ ЭКРАНА? ПО КРАЮ ПОКАЖЕТ СТРЕЛКА.', VW / 2, 254, '#8aff7a', 8, 'center');
  } else {
    ACH.forEach((a, i) => {
      const col = i < 5 ? 0 : 1, row = i % 5, x = 24 + col * 306, y = 36 + row * 40, got = !!S.ach[a.id];
      R(ctx, x, y, 14, 14, '#1b0f33'); R(ctx, x + 1, y + 1, 12, 12, got ? '#ffd23f' : '#3a2a5c'); if (got) icon(ctx, 'star', x + 3, y + 3, 1);
      T(a.name, x + 22, y + 1, got ? '#ffd23f' : '#c9b6ff'); T(a.desc, x + 22, y + 14, got ? '#ffffff' : '#8f7fb5');
    });
    T('ОТКРЫТО: ' + achCount() + ' ИЗ ' + ACH.length + '. ДОСТИЖЕНИЯ СОХРАНЯЮТСЯ В БРАУЗЕРЕ.', VW / 2, 248, '#8aff7a', 8, 'center');
    T('ИХ ОТКРЫТИЕ ПОКАЖЕТ ПЛАШКА ВО ВРЕМЯ ИГРЫ.', VW / 2, 264, '#c9b6ff', 8, 'center');
  }
  T(S.touch ? 'КАСАНИЕ — ДАЛЬШЕ, В КОНЦЕ — ЗАКРЫТЬ    ' + (pg + 1) + '/' + HELP_PAGES : 'СТРЕЛКИ — ЛИСТАТЬ    ПРОБЕЛ — ' + (S.mode === 'play' ? 'ПРОДОЛЖИТЬ' : 'ЗАКРЫТЬ') + '    ' + (pg + 1) + '/' + HELP_PAGES, VW / 2, 336, '#8aff7a', 8, 'center');
}
function drawTitle() {
  ctx.fillStyle = 'rgba(38,14,84,0.7)'; ctx.fillRect(0, 0, VW, VH);
  T('ОБЫЧНЫЙ ДЕНЬ', VW / 2 + 3, 12 + 3, '#ff3d7f', 24, 'center'); T('ОБЫЧНЫЙ ДЕНЬ', VW / 2, 12, '#ffe14d', 24, 'center');
  T('ФОТОГРАФА', VW / 2 + 4, 42 + 4, '#ff3d7f', 40, 'center'); T('ФОТОГРАФА', VW / 2, 42, '#ffffff', 40, 'center');
  T('ГЛАВНАЯ РОЛЬ — ОКСАНА КЛИМЕНКО', VW / 2, 92, '#c9b6ff', 8, 'center');
  ctx.save(); ctx.scale(2, 2); const bob = Math.round(Math.sin(S.tt * 3));
  drawOksana(ctx, 62 / 2, (346 + bob) / 2, { dir: 1, ph: 0, moving: false, flash: Math.sin(S.tt * 1.7) > 0.93 }); ctx.restore();
  ctx.save(); ctx.scale(2, 2); pigeon(ctx, 584 / 2, 342 / 2, { dir: -1, ph: S.tt * 4, peck: Math.sin(S.tt * 5) > 0 }); ctx.restore();
  drawInfoPanels(120);
  if (Math.floor(S.tt * 2) % 2 === 0) T('КЛИК ИЛИ ENTER — НАЧАТЬ СМЕНУ', VW / 2, 250, '#8aff7a', 8, 'center');
  T('ПРОБЕЛ — ПРАВИЛА ИГРЫ', VW / 2, 270, '#ffd23f', 8, 'center');
  T('РЕКОРД: ' + S.best + '    СМЕНА — 3 МИНУТЫ', VW / 2, 292, '#c9b6ff', 8, 'center');
  T('ДОСТИЖЕНИЯ: ' + achCount() + ' ИЗ ' + ACH.length, VW / 2, 310, '#ffd23f', 8, 'center');
}
function drawEnd() {
  ctx.fillStyle = 'rgba(38,14,84,0.8)'; ctx.fillRect(0, 0, VW, VH);
  T('СМЕНА ОКОНЧЕНА', VW / 2, 10, '#ffe14d', 16, 'center'); T('ОЧКИ: ' + S.score, VW / 2, 32, '#ffffff', 16, 'center');
  T(S.rank + (S.newBest ? '  НОВЫЙ РЕКОРД!' : ''), VW / 2, 54, S.newBest ? '#8aff7a' : '#c9b6ff', 8, 'center');
  ctx.imageSmoothingEnabled = false;
  if (!S.top.length) T('ПОРТФОЛИО ПУСТОЕ. ГОЛУБИ ПОБЕДИЛИ.', VW / 2, 170, '#ff9a9a', 8, 'center');
  S.top.forEach((s, i) => {
    const col = i % 3, row = (i / 3) | 0, x = 140 + col * 132 - 0, y = 74 + row * 112 + (col === 1 ? 4 : 0);
    R(ctx, x - 1, y - 1, 114, 104, i === 0 ? '#ffd23f' : '#1b0f33'); R(ctx, x, y, 112, 102, '#fffaf0');
    const sc = Math.max(1, Math.floor(Math.min(100 / s.w, 62 / s.h)));
    ctx.drawImage(s.img, Math.round(x + 56 - s.w * sc / 2), Math.round(y + 6 + (62 - s.h * sc) / 2), s.w * sc, s.h * sc);
    ctx.font = '8px ' + FONT; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
    ctx.fillStyle = '#d6336c'; ctx.fillText('+' + s.score, x + 56, y + 74); ctx.fillStyle = '#4b3a66'; ctx.fillText(s.who.slice(0, 13), x + 56, y + 88);
    if (i === 0) icon(ctx, 'star', x + 4, y + 4, 1);
  });
  T('ДОСТИЖЕНИЯ: ' + achCount() + ' ИЗ ' + ACH.length, VW / 2, 297, '#ffd23f', 8, 'center');
  if (S.newAch.length) T('НОВОЕ: ' + S.newAch.map(id => ACH.find(a => a.id === id).name).join(', '), VW / 2, 312, '#8aff7a', 8, 'center');
  if (S.endT > 1.2 && Math.floor(S.tt * 2) % 2 === 0) T('КЛИК ИЛИ ENTER — ЕЩЁ СМЕНА', VW / 2, 338, '#8aff7a', 8, 'center');
  T('РЕКОРД: ' + S.best, 8, 338, '#ffe14d');
}
function render() {
  renderWorld(S.tt);
  if (S.mode === 'play') drawWeather();
  capturePending();
  if (S.mode === 'play') {
    if (S.fr) drawFrame(); drawHUD();
    if (S.flash > 0) {
      ctx.globalAlpha = S.flash * 0.9; ctx.fillStyle = '#fffbe8'; ctx.fillRect(0, 0, VW, VH);
      if (S.fr) { ctx.globalAlpha = S.flash * 0.8; ctx.fillStyle = '#ffffff'; disc(ctx, S.fr.sx + S.fr.w / 2, S.fr.sy + S.fr.h / 2, 70, '#ffffff'); } ctx.globalAlpha = 1;
    }
  } else if (S.mode === 'title') drawTitle(); else drawEnd();
  drawTouch();
  if (S.help) drawHelp();
}

/* ===== Ввод ===== */
function begin() { if (S.mode === 'title' || (S.mode === 'end' && S.endT > 1.2)) { startGame(); return true; } return false; }
window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  S.keys[e.code] = true; actx();
  if (e.code === 'Space') { if (!e.repeat) { S.help = !S.help; S.helpPage = 0; } return; }
  if (e.code === 'KeyM') { S.mute = !S.mute; return; }
  if (e.code === 'KeyN') { S.noMusic = !S.noMusic; return; }
  if (S.help) {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') S.helpPage = Math.min(HELP_PAGES - 1, S.helpPage + 1); else if (e.code === 'ArrowLeft' || e.code === 'KeyA') S.helpPage = Math.max(0, S.helpPage - 1);
    else if (e.code === 'Escape') S.help = false; else if (e.code === 'Enter') { S.help = false; begin(); }
    return;
  }
  if (e.code === 'Enter') begin();
});
window.addEventListener('keyup', e => { S.keys[e.code] = false; });
window.addEventListener('blur', () => { S.keys = {}; S.rmb = false; });
function setMouse(e) { const r = canvas.getBoundingClientRect(); S.mx = (e.clientX - r.left) * VW / r.width; S.my = (e.clientY - r.top) * VH / r.height; }
canvas.addEventListener('mousemove', setMouse);
canvas.addEventListener('mousedown', e => {
  setMouse(e); actx();
  if (S.help) { if (e.button === 0) { if (S.helpPage < HELP_PAGES - 1) S.helpPage++; else S.help = false; } return; }
  if (e.button === 0) { if (!begin() && S.mode === 'play') S.shotReq = true; }
  else if (e.button === 2) S.rmb = true;
});
window.addEventListener('mouseup', e => { if (e.button === 2) S.rmb = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());

/* ===== Размер и цикл ===== */
function fit() {
  const hint = document.getElementById('hint'), wrap = document.getElementById('wrap');
  const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const availW = Math.max(240, wrap.clientWidth), availH = Math.max(160, coarse ? window.innerHeight : window.innerHeight - (hint ? hint.offsetHeight : 0) - 56);
  const s = Math.min(availW / VW, availH / VH);
  canvas.style.width = Math.floor(VW * s) + 'px'; canvas.style.height = Math.floor(VH * s) + 'px';
}
window.addEventListener('resize', fit); fit();
try { document.fonts.load('8px "Press Start 2P"'); document.fonts.load('24px "Press Start 2P"'); } catch (e) { }
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt); render(); requestAnimationFrame(frame);
}
initTouch();
requestAnimationFrame(frame);

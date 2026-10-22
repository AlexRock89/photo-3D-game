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
canvas.width = VW * 3; canvas.height = VH * 3;


/* ===== Мир ===== */
const TREES = [[100, 200, 0], [330, 252, 1], [560, 236, 2], [760, 244, 3], [1010, 232, 0], [1190, 200, 1], [110, 430, 2], [300, 452, 3], [520, 522, 0], [862, 545, 1], [980, 472, 2], [1190, 500, 3], [180, 590, 0], [420, 596, 2], [900, 592, 3], [1190, 330, 2]];
const BALLOONS = [[150, 300], [430, 210], [700, 500], [905, 308], [390, 403], [600, 470], [880, 600], [502, 655], [1150, 160]];
const LAMPS = [[548, 277], [754, 433], [324, 313], [884, 403], [604, 600]];
// Rendering, navigation and photo targets share one placement definition.
const FLOWER_BEDS = [[440,116,100,40],[1000,420,90,40],[160,395,70,50],[760,520,80,40],[300,200,50,30]];
const DINO = {x:123,y:516};
const SOLIDS = [
  { c:1, tag:'fountain', x:640, y:356, r:51, rx:51, ry:36 },
  { tag:'van', x:864, y:102, w:112, h:28 },
  { c:1, tag:'dino', x:DINO.x-3, y:DINO.y, r:35, rx:35, ry:17 },
  { tag:'bench', x:1102, y:292, w:36, h:13 },
  { c:1, tag:'trampoline', x:230, y:206, r:23, rx:23, ry:15 },
  { tag:'stage', x:294, y:556, w:72, h:20 },
  ...FLOWER_BEDS.map(([x,y,w,h])=>({tag:'flowers',x,y,w,h})),
  ...[1037,1087].map(x=>({c:1,tag:'arch',x,y:556,r:3}))
];
TREES.forEach(t=>SOLIDS.push({c:1,tag:'tree',x:t[0],y:t[1],r:4}));
LAMPS.forEach(([x,y])=>SOLIDS.push({c:1,tag:'lamp',x,y,r:2.5}));
function buildWorld() {
  S.clients = [new Clown(), new Fashion(), new Hipster(), new Family(), new CoupleDog(), new Barista(), new Grandpa(), new Wedding(), new Jogger(), new Busker()];
  S.pigeons = [[300, 300], [560, 420], [760, 400], [960, 260], [430, 520], [1100, 500], [220, 470]].map(p => new PigeonB(p[0], p[1]));
  S.cat = new CatB(700, 300); S.monkey = new MonkeyB(760, 250); S.bonuses = []; S.pests = []; S.hiddenClients = [];
}
function addText(x, y, text, col, big) { S.texts.push({ x, y, text, col: col || '#fff', t: 0, big: !!big }); }
function scareAll(cx, cy, rad) { if(typeof Soundscape!=='undefined')Soundscape.scare(cx,cy,rad); for (const p of S.pigeons) p.scare(cx, cy, rad); for (const p of S.pests) p.scare(cx, cy, rad); S.cat.scare(cx, cy, rad); S.monkey.scare(cx, cy, rad); }

function startGame() {
  Object.assign(S, { mode: 'play', t: 0, time: SHIFT, score: 0, combo: 0, x2: 0, speedT: 0, lensT: 0, safeT: 0, clockT: 0, shots: [], texts: [], flash: 0, cd: 0, focus: 0, monkeyOn: 0, bonusT: 4, banner: null, hint: 8, pending: null, shotReq: false, newBest: false, help: false, helpPage: 0, alert: null });
  S.pl.x = 640; S.pl.y = 470; S.pl.dir = 1; S.cam.x = clamp(S.pl.x - VW / 2, 0, WW - VW); S.cam.y = clamp(S.pl.y - VH / 2, 0, WH - VH);
  buildWorld(); initRun(); if(typeof Parade!=='undefined')Parade.reset(); if(typeof Soundscape!=='undefined')Soundscape.reset(); startTouchIntro(); beep(520, 0.1, 'square', 0.06); beep(780, 0.15, 'square', 0.06);
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
  const paradeHit = typeof Parade!=='undefined' && Parade.inFrame(f) && S.safeT<=0;
  if(paradeHit) { pen *= .7; notes.push('ШЕСТВИЕ В КАДРЕ: −30%'); }
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
  if(typeof Soundscape!=='undefined')Soundscape.photo(f);
  if(typeof Parade!=='undefined')Parade.onShot(pts);
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
  for (const c of S.clients) { c.upd(dt); navConstrainClient(c,dt); }
  for (const p of S.pigeons) { p.upd(dt); Object.assign(p,navProjectPoint(p.x,p.y,3)); }
  for (const p of S.pests) { p.upd(dt); Object.assign(p,navProjectPoint(p.x,p.y,p.kind==='tourist'?5:3)); }
  S.cat.upd(dt); Object.assign(S.cat,navProjectPoint(S.cat.x,S.cat.y,3)); S.monkey.upd(dt); if(S.monkey.st!=='latch')Object.assign(S.monkey,navProjectPoint(S.monkey.x,S.monkey.y,4));
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
  const k = S.keys, pl = S.pl, previous = {x:S.pl.x,y:S.pl.y};
  let dx = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), dy = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  if (S.joy.on) { dx += S.joy.x; dy += S.joy.y; }
  pl.moving = !!(dx || dy);
  if (pl.moving) {
    const l = Math.hypot(dx, dy), sp = 96 * (S.speedT > 0 ? 1.55 : 1) * (S.monkeyOn > 0 ? 0.6 : 1) * wxSpeedMul(dx, dy);
    pl.moveAngle = Math.atan2(dx,dy*Math.SQRT2); pl.x += dx / l * sp * dt; pl.y += dy / l * sp * dt; pl.ph += sp * dt * 0.2;
  }
  navResolvePlayer(pl, previous);
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
  if(typeof Parade!=='undefined')Parade.update(dt);
  if(typeof Soundscape!=='undefined')Soundscape.update(dt);
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

/* UI lives in ui.js; simulation and input stay here. */
function fmtTime(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
const HELP_TITLES = ['КАК СЧИТАЮТСЯ ОЧКИ', 'ПОМЕХИ В КАДРЕ', 'ПОГОДА', 'УПРАВЛЕНИЕ И БОНУСЫ', 'ДОСТИЖЕНИЯ'], HELP_PAGES = 5;

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
  if (S.help) { if (e.button === 0) { if(typeof handleHelpPointer==='function')handleHelpPointer(S.mx,S.my);else if(S.helpPage<HELP_PAGES-1)S.helpPage++;else S.help=false; } return; }
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
window.bootGame = function () { initTouch(); requestAnimationFrame(frame); };

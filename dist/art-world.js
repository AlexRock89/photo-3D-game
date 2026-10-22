'use strict';
const VW = 640, VH = 360, WW = 1280, WH = 720;
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const FONT = '"Press Start 2P", monospace';

/* ===== Статичная земля, рисуется один раз ===== */
function makeGround() {
  const g = document.createElement('canvas'); g.width = WW; g.height = WH;
  const c = g.getContext('2d');
  for (let y = 0; y < WH; y += 16) for (let x = 0; x < WW; x += 16) R(c, x, y, 16, 16, ((x + y) / 16) % 2 ? '#5fd873' : '#56cd6b');
  let seed = 11; const rn = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 420; i++) { const x = rn() * WW, y = rn() * WH; R(c, x, y, 1, 3, '#3fb85a'); R(c, x + 2, y + 1, 1, 2, '#3fb85a'); }
  // дорожки
  const path = '#ffd9b3', dots = '#ffc99a';
  const band = (x, y, w, h) => { R(c, x, y, w, h, path); for (let j = 0; j < h; j += 6) for (let i = ((j / 6) % 2) * 6; i < w; i += 12) R(c, x + i, y + j, 2, 2, dots); };
  band(62, 336, 1156, 48); band(616, 62, 48, 596); band(62, 612, 1156, 40); band(840, 130, 170, 60);
  ell(c, 640, 360, 134, 98, path); for (let a = 0; a < 40; a++) { const an = a / 40 * 6.283; R(c, 640 + Math.cos(an) * 120, 360 + Math.sin(an) * 86, 2, 2, dots); }
  // беговая дорожка по периметру
  const tr = '#e8708c';
  R(c, 30, 30, 1220, 32, tr); R(c, 30, 658, 1220, 32, tr); R(c, 30, 30, 32, 660, tr); R(c, 1218, 30, 32, 660, tr);
  for (let x = 40; x < 1240; x += 14) { R(c, x, 46, 7, 1, '#ffe3ea'); R(c, x, 674, 7, 1, '#ffe3ea'); }
  for (let y = 40; y < 680; y += 14) { R(c, 46, y, 1, 7, '#ffe3ea'); R(c, 1234, y, 1, 7, '#ffe3ea'); }
  // ковёр у арки
  R(c, 1036, 566, 52, 64, '#ff6f91'); R(c, 1038, 568, 48, 60, '#ff8aa8'); for (let j = 570; j < 626; j += 8) { R(c, 1038, j, 48, 1, '#ffd1de'); }
  // клумбы
  const bed = (x, y, w, h) => {
    R(c, x - 2, y - 2, w + 4, h + 4, '#b35a3b'); R(c, x, y, w, h, '#3fa85a');
    const cols = ['#ff4d6d', '#ffd23f', '#ffffff', '#c77dff', '#ff9f1c'];
    for (let i = 0; i < w * h / 26; i++) { const fx = x + 2 + Math.floor(rn() * (w - 6)), fy = y + 2 + Math.floor(rn() * (h - 6)); const col = cols[Math.floor(rn() * cols.length)]; R(c, fx, fy, 3, 3, col); R(c, fx + 1, fy + 1, 1, 1, '#ffd23f'); }
  };
  bed(440, 116, 100, 40); bed(1000, 420, 90, 40); bed(150, 336, 70, 50); bed(760, 520, 80, 40); bed(300, 200, 50, 30);
  // конфетти и лужицы
  const cc = ['#ff4d6d', '#ffd23f', '#4aa3ff', '#c77dff', '#fff'];
  for (let i = 0; i < 160; i++) R(c, rn() * WW, rn() * WH, 2, 2, cc[Math.floor(rn() * cc.length)]);
  ell(c, 420, 440, 12, 5, '#7fd3ff'); ell(c, 423, 439, 7, 3, '#bfeaff'); ell(c, 860, 470, 10, 4, '#7fd3ff'); ell(c, 862, 469, 5, 2, '#bfeaff');
  // верхняя цирковая стена
  for (let x = 0; x < WW; x += 16) { R(c, x, 0, 16, 26, (x / 16) % 2 ? '#fff' : '#ff5a5f'); R(c, x, 26, 16, 3, (x / 16) % 2 ? '#e8e0f0' : '#d73a40'); }
  for (let x = 0; x < WW; x += 16) { R(c, x + 2, 29, 12, 2, (x / 16) % 2 ? '#fff' : '#ff5a5f'); R(c, x + 5, 31, 6, 1, (x / 16) % 2 ? '#fff' : '#ff5a5f'); }
  // гирлянда флажков
  const fc = ['#ffd23f', '#4aa3ff', '#ff4d6d', '#8aff7a', '#c77dff'];
  for (let x = 6, k = 0; x < WW; x += 18, k++) { const sag = Math.round(Math.sin((x % 288) / 288 * Math.PI) * 6); pix(c, x, 34 + sag, ['xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], { x: fc[k % 5] }, 1); }
  // живая изгородь по краям
  R(c, 0, 29, 12, WH, '#2fa84f'); R(c, WW - 12, 29, 12, WH, '#2fa84f'); R(c, 0, WH - 14, WW, 14, '#2fa84f');
  for (let i = 0; i < 260; i++) { const side = Math.floor(rn() * 3); let x, y; if (side === 0) { x = rn() * 10; y = 31 + rn() * (WH - 31); } else if (side === 1) { x = WW - 12 + rn() * 10; y = 31 + rn() * (WH - 31); } else { x = rn() * WW; y = WH - 12 + rn() * 10; } R(c, x, y, 2, 2, cc[Math.floor(rn() * 4)]); }
  return g;
}

/* ===== Декорации ===== */
function drawTree(c, x, y, k, t) {
  const cols = [['#ff8fc7', '#ff6fb0', '#ffc2e2'], ['#a77bff', '#8a5cf0', '#cdb6ff'], ['#ffb347', '#ff9a2e', '#ffd79b'], ['#4fd6c8', '#2dbcae', '#9af0e6']][k % 4];
  shadow(c, x + 4, y, 13); R(c, x - 2, y - 9, 4, 9, '#7b4a2a'); R(c, x - 2, y - 9, 1, 9, '#5d3720');
  const sw = Math.round(Math.sin(t * 1.2 + x) * 1);
  ell(c, x + sw, y - 22, 13, 11, cols[1]); ell(c, x - 3 + sw, y - 25, 9, 7, cols[0]);
  disc(c, x + 4 + sw, y - 27, 3, cols[2]); disc(c, x - 6 + sw, y - 20, 2, cols[2]); disc(c, x + 7 + sw, y - 19, 2, cols[0]);
}
function drawFountain(c, x, y, t) {
  ell(c, x, y + 4, 50, 34, '#d9c2ad'); ell(c, x, y + 1, 48, 32, '#f7e8d8'); ell(c, x, y + 2, 42, 27, '#4cc2ff');
  for (let i = 0; i < 3; i++) {
    const r = ((t * 9 + i * 14) % 40); for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; R(c, x + Math.cos(a) * r, y + 2 + Math.sin(a) * r * 0.66, 2, 1, '#a8e4ff'); }
  }
  R(c, x - 4, y - 12, 8, 14, '#f7e8d8'); R(c, x - 4, y - 12, 2, 14, '#e2cdb8'); ell(c, x, y - 13, 11, 5, '#f7e8d8'); ell(c, x, y - 13, 8, 3, '#4cc2ff');
  for (let i = 0; i < 8; i++) { const ph = (t * 1.4 + i / 8) % 1, h = Math.sin(ph * Math.PI) * 24, dx = (i - 3.5) * 3 * ph; R(c, x + dx, y - 16 - h, 2, 2, '#d6f3ff'); }
  const dx = x + Math.cos(t * 0.6) * 28, dy = y + 6 + Math.sin(t * 0.6) * 12;
  ell(c, dx, dy, 5, 3, '#ffd93d'); disc(c, dx + 4, dy - 3, 2, '#ffd93d'); R(c, dx + 6, dy - 3, 2, 1, '#ff8a1f'); R(c, dx + 4, dy - 4, 1, 1, '#222');
}
function drawTruck(c, x, y, t) {
  const L = x - 56;
  shadow(c, x, y, 58);
  R(c, L, y - 46, 112, 40, '#ffcf3f'); R(c, L, y - 18, 112, 6, '#19b5a5'); R(c, L, y - 46, 112, 3, '#e6ac1d');
  R(c, L + 20, y - 40, 72, 20, '#3a2247'); R(c, L + 20, y - 22, 72, 3, '#ff8a5b');
  for (let i = 0; i < 10; i++) { R(c, L + 18 + i * 7.6, y - 46, 8, 8, i % 2 ? '#fff' : '#ff4d6d'); R(c, L + 19 + i * 7.6, y - 38, 6, 2, i % 2 ? '#fff' : '#ff4d6d'); }
  disc(c, L + 18, y - 4, 6, '#222'); disc(c, L + 94, y - 4, 6, '#222'); disc(c, L + 18, y - 4, 2, '#bbb'); disc(c, L + 94, y - 4, 2, '#bbb');
  R(c, L + 104, y - 26, 6, 6, '#fff6b0'); R(c, L + 2, y - 26, 4, 6, '#ff6b6b');
  R(c, x - 24, y - 64, 48, 14, '#fff'); R(c, x - 24, y - 52, 48, 2, '#d6336c');
  c.font = '8px ' + FONT; c.textBaseline = 'top'; c.fillStyle = '#d6336c'; c.fillText('КОФЕ', x - 16, y - 61);
  R(c, x - 22, y - 50, 2, 4, '#444'); R(c, x + 20, y - 50, 2, 4, '#444');
  for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; c.globalAlpha = 1 - ph; R(c, x + 40 + Math.sin(ph * 6 + i) * 3, y - 50 - ph * 18, 3, 3, '#fff'); } c.globalAlpha = 1;
}
function drawTrampoline(c, x, y, dip) {
  ell(c, x, y + 3, 24, 15, '#1d2f7a'); ell(c, x, y, 22, 14, '#2f6bff'); ell(c, x, y + (dip ? 1 : 0), 18, 11, '#1b2766');
  for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; R(c, x + Math.cos(a) * 20, y + Math.sin(a) * 12.5, 2, 2, '#ffd23f'); }
  R(c, x - 8, y - 1, 16, 1, '#3b4fa8'); R(c, x - 1, y - 7, 1, 14, '#3b4fa8');
}
function drawDino(c, x, y, t) {
  const w = Math.round(Math.sin(t * 2.2) * 1);
  shadow(c, x, y, 26);
  ell(c, x - 21, y - 9, 8, 5, '#3fc874'); R(c, x - 31, y - 11, 5, 4, '#3fc874');
  ell(c, x, y - 16 + w, 20, 15, '#58e08b'); ell(c, x + 2, y - 10 + w, 13, 8, '#b9f5cf');
  for (let i = 0; i < 5; i++) pix(c, x - 15 + i * 7, y - 36 + w + (i % 2), ['.x.', 'xxx', 'xxx'], { x: '#ff9f1c' }, 1);
  ell(c, x + 17, y - 26 + w, 10, 9, '#58e08b'); R(c, x + 19, y - 30 + w, 3, 3, '#fff'); R(c, x + 21, y - 29 + w, 1, 2, '#222');
  R(c, x + 22, y - 22 + w, 6, 1, '#b4232c'); R(c, x + 23, y - 23 + w, 1, 1, '#fff'); R(c, x + 26, y - 23 + w, 1, 1, '#fff'); R(c, x + 25, y - 27 + w, 1, 1, '#2a8a52');
  R(c, x - 10, y - 4, 7, 5, '#3fc874'); R(c, x + 4, y - 4, 7, 5, '#3fc874'); R(c, x + 8, y - 15 + w, 6, 3, '#3fc874');
  R(c, x - 12, y - 24 + w, 4, 2, '#d9ffe8');
}
function drawBenchBack(c, x, y) { shadow(c, x, y + 1, 18); R(c, x - 16, y - 15, 32, 4, '#a8683a'); R(c, x - 16, y - 15, 32, 1, '#c98650'); R(c, x - 16, y - 11, 3, 7, '#6e4023'); R(c, x + 13, y - 11, 3, 7, '#6e4023'); }
function drawBenchFront(c, x, y) { R(c, x - 16, y - 5, 32, 5, '#c98650'); R(c, x - 16, y - 1, 32, 1, '#8a5328'); R(c, x - 15, y, 2, 3, '#6e4023'); R(c, x + 13, y, 2, 3, '#6e4023'); }
function drawStage(c, x, y, t) {
  R(c, x - 36, y - 8, 72, 14, '#d8a064'); for (let i = 0; i < 72; i += 9) R(c, x - 36 + i, y - 8, 1, 14, '#bf8850');
  R(c, x - 36, y + 6, 72, 8, '#a5693a'); R(c, x - 36, y + 6, 72, 1, '#c98650');
  R(c, x - 32, y - 36, 64, 28, '#7a3ff2'); R(c, x - 32, y - 36, 64, 3, '#9a62ff');
  for (let i = 0; i < 5; i++) { const on = Math.floor(t * 3 + i) % 3; R(c, x - 26 + i * 13, y - 33, 4, 4, ['#ffe14d', '#ff4d6d', '#4aa3ff'][on]); }
  pix(c, x - 18, y - 26, ICON.note.rows, { b: '#ffe14d' }, 1); pix(c, x + 8, y - 24, ICON.note.rows, { b: '#ff9ad0' }, 1);
  R(c, x + 22, y - 22, 2, 16, '#444'); R(c, x + 21, y - 24, 4, 3, '#222');
}
function drawArch(c, x, y, t) {
  shadow(c, x, y, 30); R(c, x - 26, y - 44, 4, 44, '#fff'); R(c, x + 22, y - 44, 4, 44, '#fff');
  for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI, fx = x + Math.cos(a) * 26, fy = y - 44 - Math.sin(a) * 16; disc(c, fx, fy, 3, i % 3 === 0 ? '#ff8fb8' : (i % 3 === 1 ? '#fff' : '#ffd6e8')); R(c, fx - 1, fy + 2, 2, 2, '#2fa84f'); }
  for (let i = 0; i < 5; i++) { disc(c, x - 24, y - 6 - i * 8, 2, i % 2 ? '#ff8fb8' : '#fff'); disc(c, x + 24, y - 6 - i * 8, 2, i % 2 ? '#fff' : '#ff8fb8'); }
}
function drawLamp(c, x, y, t) { shadow(c, x, y, 5); R(c, x - 1, y - 32, 3, 32, '#4b4b5c'); R(c, x - 3, y - 36, 7, 5, '#fff3a0'); R(c, x - 4, y - 38, 9, 2, '#4b4b5c'); c.globalAlpha = 0.18 + Math.sin(t * 3 + x) * 0.04; disc(c, x, y - 33, 9, '#fff3a0'); c.globalAlpha = 1; }
function drawBalloons(c, x, y, t, seed) {
  const cols = [['#ff4d6d', '#ffb3c1'], ['#4aa3ff', '#b7dcff'], ['#ffd23f', '#fff0a8'], ['#8aff7a', '#d2ffc9'], ['#c77dff', '#e6c6ff']];
  R(c, x, y - 3, 2, 3, '#777');
  for (let i = 0; i < 3; i++) {
    const bx = x + (i - 1) * 7 + Math.sin(t * 1.5 + seed + i) * 2, by = y - 38 - (i === 1 ? 5 : 0), col = cols[(seed + i) % 5];
    for (let s = 0; s < 9; s++) R(c, lerp(x + 1, bx, s / 9), lerp(y - 3, by + 6, s / 9), 1, 1, '#ddd');
    ell(c, bx, by, 5, 6, col[0]); R(c, bx - 2, by - 3, 2, 2, col[1]); R(c, bx - 1, by + 6, 2, 2, col[0]);
  }
}

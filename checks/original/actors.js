'use strict';
/* ===== Клиенты ===== */
class Client {
  constructor(id, name, x, y, w, h, base) {
    this.id = id; this.name = name; this.x = x; this.y = y; this.w = w; this.h = h; this.base = base || 120;
    this.t = rnd(0, 5); this.fresh = 0; this.ph = 0; this.good = 'Отличный кадр!'; this.bad = 'Не тот момент';
  }
  upd(dt) { this.t += dt; this.ph += dt * 6; if (this.fresh > 0) this.fresh -= dt; }
  box() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  members() { return [this.box()]; }
  moment() { return { q: 0.4 }; }
  capFor(m) { return m.q >= 0.75 ? this.good : this.bad; }
}

class Clown extends Client {
  constructor() { super('clown', 'Клоун', 230, 206, 18, 32, 120); this.jz = 0; this.good = 'Клоун завис в воздухе!'; this.bad = 'Клоун скучает на батуте'; }
  upd(dt) { super.upd(dt); const T = this.t % 2.1, was = this.jz > 0; this.jz = T < 1.2 ? 0 : Math.sin((T - 1.2) / 0.9 * Math.PI) * 28; this.dip = T < 0.2 || T > 1.95; if (!was && this.jz > 0.5) sfx('honk', this.x, this.y); }
  box() { return { x: this.x - 9, y: this.y - 32 - this.jz, w: 18, h: 32 }; }
  moment() { const h = this.jz / 28; return { q: h > 0.7 ? 1 : h > 0.25 ? 0.65 : 0.3 }; }
  draw(c, t) {
    const x = this.x, y = this.y;
    shadow(c, x, y, Math.max(5, 10 - this.jz * 0.15));
    person(c, x, y, { z: this.jz, skin: '#ffe6d2', hair: '#ff5d73', hs: 'curly', top: '#ffd23f', sleeve: '#4aa3ff', pants: '#ff4d6d', shoes: '#2f6bff', nose: '#ff2d4d', mouth: 'open', l: 2, r: 2, ph: this.ph });
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.09; disc(c, x + Math.cos(a) * 9, y - this.jz - 38 - Math.abs(Math.sin(a)) * 9, 2, ['#ff4d6d', '#4aa3ff', '#8aff7a'][i]); }
  }
}

class Fashion extends Client {
  constructor() { super('fashion', 'Модница', 490, 178, 16, 32, 120); this.pose = 0; this.good = 'Поза, как с обложки!'; this.bad = 'Модница не в образе'; }
  upd(dt) { super.upd(dt); const p = Math.floor(this.t / 2) % 4; if (p === 2 && this.pose !== 2) sfx('chime', this.x, this.y); this.pose = p; }
  moment() { return { q: [0.3, 0.7, 1, 0.2][this.pose] }; }
  draw(c, t) {
    const x = this.x, y = this.y, p = this.pose;
    shadow(c, x, y, 9);
    person(c, x, y, { skin: '#f6d3b9', hair: '#ff7ac6', hs: 'bob', top: '#c77dff', dress: '#ffd23f', glasses: '#1d1d2b', l: p === 1 ? 3 : p === 2 ? 2 : 0, r: p === 1 ? 3 : p === 2 ? 2 : 0, back: p === 3, mouth: p === 2 ? 'kiss' : 'smile', ph: this.ph });
    if (p === 2) drawHeart(c, x - 3, y - 42 + Math.round(Math.sin(t * 6)), 1);
    R(c, x + 7, y - 9, 5, 6, '#ff4d6d'); R(c, x + 8, y - 11, 3, 2, '#b3243d');
  }
}

class Hipster extends Client {
  constructor() { super('hipster', 'Хипстер', 866, 184, 20, 34, 120); this.phase = 0; this.good = 'Кофе в кадре, хипстер счастлив!'; this.bad = 'Хипстер просто пьёт кофе'; }
  upd(dt) { super.upd(dt); const T = this.t % 4, p = T < 2.2 ? 0 : (T < 3.5 ? 1 : 2); if (p === 1 && this.phase !== 1) sfx('click', this.x, this.y); this.phase = p; }
  box() { const h = this.phase === 1 ? 40 : 32; return { x: this.x - 9, y: this.y - h, w: 20, h: h }; }
  moment() { return { q: this.phase === 1 ? 1 : 0.4 }; }
  draw(c, t) {
    const x = this.x, y = this.y, up = this.phase === 1;
    shadow(c, x, y, 9);
    person(c, x, y, { skin: '#f1c9a6', hair: '#6b4226', hs: 'short', hat: 'beanie', hatc: '#f2b134', hatc2: '#fff', beard: '#6b4226', glasses: '#222', top: '#c0392b', pants: '#33405a', shoes: '#8a5a2b', r: up ? 2 : 1, ph: this.ph, mouth: 'smile' });
    for (let j = 0; j < 8; j += 3) R(c, x - 4, y - 16 + j, 8, 1, '#7a1f16');
    for (let i = 0; i < 8; i += 3) R(c, x - 4 + i, y - 17, 1, 8, '#7a1f16');
    if (up) { R(c, x + 4, y - 36, 7, 6, '#fff'); R(c, x + 4, y - 38, 7, 2, '#c58a54'); R(c, x + 11, y - 35, 2, 3, '#fff'); icon(c, 'star', x + 11, y - 42 + Math.round(Math.sin(t * 8)), 1); }
    else { R(c, x + 6, y - 19, 6, 5, '#fff'); R(c, x + 6, y - 20, 6, 1, '#c58a54'); }
  }
}

class Barista extends Client {
  constructor() { super('barista', 'Бариста', 924, 146, 20, 30, 120); this.phase = 0; this.good = 'Сердечко на латте!'; this.bad = 'Бариста взбивает пену'; }
  upd(dt) { super.upd(dt); const p = (this.t % 4.2) < 2.9 ? 0 : 1; if (p === 1 && this.phase !== 1) sfx('bell', this.x, this.y); this.phase = p; }
  box() { return { x: this.x - 10, y: this.y - (this.phase ? 40 : 30), w: 22, h: this.phase ? 40 : 30 }; }
  moment() { return { q: this.phase ? 1 : 0.35 }; }
  draw(c, t) {
    const x = this.x, y = this.y;
    person(c, x, y, { skin: '#e9b99a', hair: '#2a1830', hs: 'bun', hat: 'chef', hatc: '#fff', top: '#fff', pants: '#2b2b3a', r: this.phase ? 2 : 0, l: 0, ph: this.ph, mouth: 'smile' });
    R(c, x - 14, y - 9, 28, 9, '#ff8a5b'); R(c, x - 14, y - 10, 28, 2, '#ffc9a8');
    if (this.phase) { R(c, x + 5, y - 33, 8, 6, '#fff'); R(c, x + 13, y - 32, 2, 3, '#fff'); drawHeart(c, x + 6, y - 40, 1); }
    else { R(c, x + 6, y - 14, 6, 5, '#fff'); for (let i = 0; i < 2; i++) { const ph = (t * 1.2 + i / 2) % 1; c.globalAlpha = 1 - ph; R(c, x + 7 + i * 2, y - 16 - ph * 10, 2, 2, '#fff'); } c.globalAlpha = 1; }
  }
}

class Grandpa extends Client {
  constructor() { super('grandpa', 'Дедушка', 1120, 298, 18, 30, 120); this.awake = false; this.good = 'Дедушка грозит пальцем!'; this.bad = 'Дедушка дремлет'; }
  upd(dt) { super.upd(dt); const T = this.t % 5, w = T > 3.6 && T < 4.9; if (w && !this.awake) sfx('grumble', this.x, this.y); this.awake = w; }
  moment() { return { q: this.awake ? 1 : 0.25 }; }
  draw(c, t) {
    const x = this.x, y = this.y;
    person(c, x, y, { skin: '#f1c7a5', hair: '#f4f4f4', hs: 'bald', hat: 'fedora', hatc: '#6b6f7a', stache: '#f4f4f4', top: '#8b5a3c', pants: '#4a4a5a', shoes: '#333', sleep: !this.awake, brow: this.awake, mouth: this.awake ? 'open' : 'flat', r: this.awake ? 2 : 0, ph: 0 });
    R(c, x - 5, y - 12, 10, 6, '#f2f2f2'); R(c, x - 4, y - 11, 8, 1, '#9a9aa8'); R(c, x - 4, y - 9, 6, 1, '#9a9aa8');
    c.font = '8px ' + FONT; c.textBaseline = 'top';
    if (this.awake) { c.fillStyle = '#ff3d3d'; c.fillText('!', x + 8 + Math.round(Math.sin(t * 25)), y - 40); }
    else { c.fillStyle = '#ffffff'; c.globalAlpha = 0.9; c.fillText('Z', x + 9, y - 36 - (t * 8) % 8); c.fillText('z', x + 15, y - 42 - (t * 8) % 8); c.globalAlpha = 1; }
  }
}

function kidPerson(c, x, y, o) {
  x = Math.round(x); y = Math.round(y); const sw = Math.round(Math.sin(o.ph || 0));
  R(c, x - 3, y - 5, 2, 4 - (sw > 0 ? 1 : 0), o.pants); R(c, x + 1, y - 5, 2, 4 - (sw < 0 ? 1 : 0), o.pants);
  R(c, x - 3, y - 1 - (sw > 0 ? 1 : 0), 2, 1, '#fff'); R(c, x + 1, y - 1 - (sw < 0 ? 1 : 0), 2, 1, '#fff');
  R(c, x - 3, y - 11, 6, 6, o.top); R(c, x - 5, y - 11 - (sw > 0 ? 1 : 0), 2, 5, o.top); R(c, x + 3, y - 11 - (sw < 0 ? 1 : 0), 2, 5, o.top);
  R(c, x - 3, y - 17, 6, 6, '#f2cdb0'); R(c, x - 3, y - 18, 6, 3, o.hair); R(c, x - 2, y - 14, 1, 1, '#222'); R(c, x + 1, y - 14, 1, 1, '#222'); R(c, x - 1, y - 12, 2, 1, '#b5524f');
  if (o.bow) R(c, x - 5, y - 18, 3, 2, o.bow);
}
class Family extends Client {
  constructor() { super('family', 'Семья', 640, 242, 0, 0, 220); this.ang = rnd(0, 6.28); this.avgR = 40; this.good = 'Вся семья в кадре!'; this.bad = 'Дети разбежались'; this.parts = []; this.upd(0); }
  upd(dt) {
    super.upd(dt); this.ang += dt * 0.10;
    const cx = 640 + Math.cos(this.ang) * 190, cy = 360 + Math.sin(this.ang) * 118;
    this.x = cx; this.y = cy; this.dir = -Math.sin(this.ang) >= 0 ? 1 : -1;
    const parts = [{ k: 'dad', x: cx - 8, y: cy }, { k: 'mom', x: cx + 8, y: cy + 1 }]; let sr = 0;
    for (let i = 0; i < 2; i++) {
      const a = this.t * 1.7 * (i ? 1 : -1) + i * Math.PI, r = 26 + 22 * (0.5 + 0.5 * Math.sin(this.t * 0.9 + i * 2));
      sr += r; parts.push({ k: i ? 'girl' : 'boy', x: cx + Math.cos(a) * r, y: cy + 6 + Math.sin(a) * r * 0.55 });
    }
    this.avgR = sr / 2; this.parts = parts;
  }
  members() { return this.parts.map((p, i) => i < 2 ? { x: p.x - 7, y: p.y - 26, w: 14, h: 26 } : { x: p.x - 6, y: p.y - 19, w: 12, h: 19 }); }
  moment() { return { q: clamp((52 - this.avgR) / 24, 0.15, 1) }; }
  draw(c, t) {
    const ps = this.parts.slice().sort((a, b) => a.y - b.y);
    for (const p of ps) {
      shadow(c, p.x, p.y, p.k === 'dad' || p.k === 'mom' ? 8 : 6);
      if (p.k === 'dad') person(c, p.x, p.y, { skin: '#f2cdb0', hair: '#6b4226', hs: 'short', top: '#4a7bd0', pants: '#2b3a55', moving: true, ph: this.ph, l: 1, r: 0 });
      else if (p.k === 'mom') person(c, p.x, p.y, { skin: '#f6d3b9', hair: '#c88a4b', hs: 'long', top: '#ff7a59', dress: '#ff7a59', moving: true, ph: this.ph, l: 0, r: 1 });
      else if (p.k === 'boy') kidPerson(c, p.x, p.y, { top: '#8aff7a', pants: '#3a3f6b', hair: '#222', ph: this.ph * 1.6 });
      else kidPerson(c, p.x, p.y, { top: '#ffd23f', pants: '#c77dff', hair: '#a5502e', bow: '#ff4d6d', ph: this.ph * 1.6 });
    }
  }
}

class CoupleDog extends Client {
  constructor() { super('couple', 'Пара с собачкой', 700, 632, 0, 0, 170); this.kiss = false; this.good = 'Поцелуй под лай собаки!'; this.bad = 'Парочка просто гуляет'; this.dv = 1; this.dx = 0; this.dy = 0; this.upd(0); }
  upd(dt) {
    super.upd(dt); const a = this.t * 0.12;
    this.x = 700 + 210 * Math.sin(a); this.y = 632; this.dv = Math.cos(a) >= 0 ? 1 : -1;
    const k = (this.t % 6) > 4.6; if (k && !this.kiss) sfx('smack', this.x, this.y); this.kiss = k;
    this.dx = this.x + this.dv * 40 + Math.sin(this.t * 3) * 5; this.dy = 636 + Math.sin(this.t * 2.3) * 3;
  }
  members() { return [{ x: this.x - 16, y: this.y - 26, w: 14, h: 26 }, { x: this.x + 2, y: this.y - 26, w: 14, h: 26 }]; }
  moment() { return { q: this.kiss ? 1 : 0.3 }; }
  draw(c, t) {
    const x = this.x, y = this.y, k = this.kiss;
    shadow(c, x - 9, y, 8); shadow(c, x + 9, y, 8); shadow(c, this.dx, this.dy, 7);
    person(c, x - 9, y, { skin: '#f6d3b9', hair: '#7a3a1e', hs: 'long', top: '#ff7ac6', dress: '#ff7ac6', moving: !k, ph: this.ph, mouth: k ? 'kiss' : 'smile', look: 1, l: 0, r: k ? 2 : 0 });
    person(c, x + 9, y, { skin: '#f1c9a6', hair: '#2a1830', hs: 'short', top: '#3a8f6b', pants: '#33405a', moving: !k, ph: this.ph + 1, mouth: k ? 'kiss' : 'smile', look: -1, l: k ? 2 : 0, r: 0 });
    const hx = this.dv > 0 ? x + 12 : x - 12;
    for (let s = 0; s < 8; s++) R(c, lerp(x + 8, this.dx - this.dv * 4, s / 8), lerp(y - 9, this.dy - 6, s / 8), 1, 1, '#ff4d6d');
    dog(c, this.dx, this.dy, { dir: this.dv, ph: this.ph });
    if (k) { drawHeart(c, x - 4, y - 40 + Math.round(Math.sin(t * 6)), 1); drawHeart(c, x + 6, y - 46, 1); }
  }
}

class Wedding extends Client {
  constructor() { super('wedding', 'Жених и невеста', 1062, 578, 0, 0, 200); this.off = 0; this.kiss = false; this.good = 'Поцелуй у арки!'; this.bad = 'Свадьба без жениха'; this.upd(0); }
  upd(dt) {
    super.upd(dt); const T = this.t % 9;
    this.off = T < 5.5 ? 0 : T < 6.5 ? (T - 5.5) * 110 : T < 8 ? 110 : (9 - T) * 110;
    const r = (T >= 5.5 && T < 6.5) || T >= 8, k = T > 4 && T < 5.5; if (r && !this.run && T < 7) sfx('oops', this.x, this.y); if (k && !this.kiss) sfx('smack', this.x, this.y); this.run = r; this.kiss = k;
  }
  members() { return [{ x: 1050 - 8, y: 578 - 28, w: 16, h: 28 }, { x: 1074 + this.off - 7, y: 578 - 26, w: 14, h: 26 }]; }
  moment() { return { q: this.off > 20 ? 0.15 : this.kiss ? 1 : 0.65 }; }
  capFor(m) { return this.off > 20 ? 'Жених сбежал!' : (m.q >= 0.75 ? this.good : 'Скромная свадьба'); }
  draw(c, t) {
    const y = this.y, bx = 1050, gx = 1074 + this.off, away = this.off > 20;
    shadow(c, bx, y, 9); shadow(c, gx, y, 8);
    person(c, bx, y, { skin: '#f6d3b9', hair: '#d4a05a', hs: 'wavy', hat: 'veil', hatc: '#fff', top: '#fff', dress: '#fff', pants: '#fff', l: away ? 2 : 0, r: away ? 2 : 3, mouth: away ? 'open' : (this.kiss ? 'kiss' : 'smile'), brow: away, ph: this.ph });
    if (!away) { disc(c, bx + 5, y - 11, 3, '#ff4d6d'); disc(c, bx + 7, y - 13, 2, '#ffd23f'); disc(c, bx + 3, y - 13, 2, '#fff'); }
    person(c, gx, y, { skin: '#f1c9a6', hair: '#4a2f1d', hs: 'short', top: '#222436', pants: '#222436', shoes: '#111', moving: this.run, ph: this.ph * 2, mouth: this.kiss ? 'kiss' : (away ? 'open' : 'smile'), look: -1 });
    R(c, gx - 2, y - 17, 4, 2, '#ff4d6d');
    if (this.kiss) { drawHeart(c, bx + 6, y - 40 + Math.round(Math.sin(t * 6)), 1); }
    if (away) { c.font = '8px ' + FONT; c.textBaseline = 'top'; c.fillStyle = '#ff3d3d'; c.fillText('!', bx - 2, y - 42); }
  }
}

class Jogger extends Client {
  constructor() {
    super('jogger', 'Бегун', 46, 46, 18, 30, 100); this.leg = 0; this.d = rnd(100, 600); this.pause = 0;
    this.P = [[46, 46], [1234, 46], [1234, 674], [46, 674]]; this.L = [1188, 628, 1188, 628]; this.dirx = 1; this.good = 'Поймала на растяжке!'; this.bad = 'Бегун — смазанный силуэт'; this.upd(0);
  }
  upd(dt) {
    this.t += dt; this.ph += dt * 14; if (this.fresh > 0) this.fresh -= dt;
    if (this.pause > 0) { this.pause -= dt; return; }
    this.d += 125 * dt;
    if (this.d >= this.L[this.leg]) { this.d = 0; this.leg = (this.leg + 1) % 4; this.pause = 1.4; sfx('whistle', this.x, this.y); }
    const p = this.P[this.leg], n = this.P[(this.leg + 1) % 4], k = this.d / this.L[this.leg];
    this.x = lerp(p[0], n[0], k); this.y = lerp(p[1], n[1], k);
    const dx = n[0] - p[0]; if (dx !== 0) this.dirx = dx > 0 ? 1 : -1;
  }
  moment() { return { q: this.pause > 0.2 ? 1 : 0.55 }; }
  draw(c, t) {
    const x = this.x, y = this.y, st = this.pause > 0;
    shadow(c, x, y, 8);
    if (!st) for (let i = 1; i < 4; i++) { c.globalAlpha = 0.5 - i * 0.12; R(c, x - this.dirx * (8 + i * 6), y - 20 + i * 3, 6, 1, '#fff'); } c.globalAlpha = 1;
    person(c, x, y, { skin: '#e7b894', hair: '#2a1830', hs: 'short', hat: 'band', hatc: '#ff4d6d', top: '#19b5a5', pants: '#ff4d6d', shoes: '#ffd23f', moving: !st, ph: this.ph, l: st ? 2 : 3, r: st ? 2 : 3, mouth: st ? 'smile' : 'open' });
  }
}

class Busker extends Client {
  constructor() { super('busker', 'Музыкант', 330, 566, 22, 34, 120); this.solo = false; this.good = 'Гитарное соло!'; this.bad = 'Музыкант настраивает гитару'; }
  upd(dt) { super.upd(dt); const T = this.t % 6, s = T > 4.2 && T < 5.8; if (s && !this.solo) sfx('riff', this.x, this.y); this.solo = s; }
  moment() { return { q: this.solo ? 1 : 0.4 }; }
  draw(c, t) {
    const x = this.x, y = this.y, s = this.solo, ox = s ? Math.round(Math.sin(t * 14)) : 0, X = x + ox;
    shadow(c, x, y, 9);
    person(c, X, y, { skin: '#f1c9a6', hair: '#2a1830', hs: 'long', hat: 'bandana', hatc: '#ff4d6d', top: '#7a3ff2', pants: '#1d1d2b', shoes: '#e63946', mouth: s ? 'open' : 'smile', l: 0, r: 0, ph: 0 });
    R(c, X - 11, y - 16, 14, 2, '#6b3b1e'); R(c, X - 13, y - 17, 3, 4, '#3a2012'); ell(c, X + 3, y - 9, 6, 4, '#e0792b'); disc(c, X + 3, y - 9, 1, '#3a2012'); R(c, X - 3, y - 14, 10, 1, '#fff3c4');
    R(c, X - 7, y - 16, 2, 2, '#f1c9a6');
    R(c, x + 24, y - 3, 8, 4, '#7a4b2a'); R(c, x + 25, y - 4, 6, 1, '#ffd23f');
    if (s) { for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; c.globalAlpha = 1 - ph; pix(c, x + 10 + i * 5 + Math.round(Math.sin(ph * 9)) * 2, y - 30 - ph * 20, ICON.note.rows, { b: ['#ffe14d', '#ff9ad0', '#8aff7a'][i] }, 1); } c.globalAlpha = 1; icon(c, 'star', x - 14, y - 36 + Math.round(Math.sin(t * 9)), 1); }
  }
}

/* ===== Помехи ===== */
class PigeonB {
  constructor(x, y) { this.x = x; this.y = y; this.z = 0; this.st = 'peck'; this.tx = x; this.ty = y; this.timer = rnd(1, 3); this.dir = 1; this.ph = rnd(0, 6); this.landT = 0; this.peck = false; this.jx = 0; this.jy = 0; }
  go(sp, dt) { const d = dist(this.x, this.y, this.tx, this.ty); if (d > 1) { this.x += (this.tx - this.x) / d * sp * dt; this.y += (this.ty - this.y) / d * sp * dt; this.dir = this.tx > this.x ? 1 : -1; } return d; }
  upd(dt) {
    const fr = S.fr; this.ph += dt * (this.st === 'peck' || this.st === 'land' ? 4 : 14);
    if (this.st === 'peck') {
      this.z = 0; this.timer -= dt;
      if (this.timer <= 0) { this.timer = rnd(1.2, 3.5); this.peck = Math.random() < 0.7; if (Math.random() < 0.5) { this.tx = clamp(this.x + rnd(-50, 50), 40, WW - 40); this.ty = clamp(this.y + rnd(-30, 30), 70, WH - 30); } }
      if (this.go(22, dt) > 2) this.peck = false;
      if (S.mode === 'play' && fr && S.safeT <= 0 && dist(this.x, this.y, fr.cx, fr.cy) < 320) {
        const rate = (S.aimOnClient ? 0.22 : 0.03) * (S.focus > 0.3 ? 1.8 : 1) * (S.diff || 1);
        if (Math.random() < rate * dt) { this.st = 'fly'; this.jx = rnd(-0.25, 0.25) * fr.w; this.jy = rnd(-0.2, 0.2) * fr.h; this.z = 3; }
      }
    } else if (this.st === 'fly') {
      this.z = Math.min(14, this.z + 40 * dt);
      if (fr) { this.tx = fr.cx + this.jx; this.ty = fr.cy + this.jy; }
      if (this.go(100, dt) < 5) { this.st = 'land'; this.landT = rnd(2.5, 4.2); sfx('coo', this.x, this.y); }
      if (S.safeT > 0) this.scare(this.x, this.y, 9999);
    } else if (this.st === 'land') {
      this.z = Math.max(0, this.z - 60 * dt); this.landT -= dt;
      if (this.landT <= 0) { this.st = 'peck'; this.timer = 1; }
    } else {
      this.z = 14; if (this.go(150, dt) < 5) { this.st = 'peck'; this.z = 0; this.timer = rnd(2, 4); }
    }
  }
  scare(cx, cy, rad) {
    if (this.st === 'scatter' || dist(this.x, this.y, cx, cy) > rad) return;
    const a = Math.atan2(this.y - cy, this.x - cx) + rnd(-0.6, 0.6), r = rnd(200, 320);
    this.tx = clamp(this.x + Math.cos(a) * r, 40, WW - 40); this.ty = clamp(this.y + Math.sin(a) * r, 70, WH - 30); this.st = 'scatter'; sfx('flutter', this.x, this.y);
  }
  draw(c) { shadow(c, this.x, this.y, 4); pigeon(c, this.x, this.y - this.z, { dir: this.dir, ph: this.ph, fly: this.st === 'fly' || this.st === 'scatter', peck: this.peck && this.st === 'peck' }); }
}

class CatB {
  constructor(x, y) { this.x = x; this.y = y; this.st = 'sit'; this.timer = rnd(2, 5); this.tx = x; this.ty = y; this.dir = 1; this.ph = 0; }
  pick() {
    if (Math.random() < 0.65 && S.clients && S.clients.length) { const cl = S.clients[Math.floor(Math.random() * S.clients.length)]; this.tx = clamp(cl.x + rnd(-30, 30), 40, WW - 40); this.ty = clamp(cl.y + rnd(2, 16), 80, WH - 30); }
    else { this.tx = rnd(80, 1200); this.ty = rnd(90, 680); }
  }
  upd(dt) {
    this.ph += dt * (this.st === 'sit' ? 3 : 8);
    if (this.st === 'sit') { this.timer -= dt; if (this.timer <= 0) { this.pick(); this.st = 'walk'; } return; }
    const d = dist(this.x, this.y, this.tx, this.ty), sp = this.st === 'flee' ? 110 : 26;
    if (d < 3) { this.st = 'sit'; this.timer = rnd(4, 9); return; }
    this.x += (this.tx - this.x) / d * sp * dt; this.y += (this.ty - this.y) / d * sp * dt; this.dir = this.tx > this.x ? 1 : -1;
  }
  scare(cx, cy, rad) {
    if (dist(this.x, this.y, cx, cy) > rad) return;
    const a = Math.atan2(this.y - cy, this.x - cx), r = rnd(200, 320);
    this.tx = clamp(this.x + Math.cos(a) * r, 40, WW - 40); this.ty = clamp(this.y + Math.sin(a) * r, 80, WH - 30); this.st = 'flee'; sfx('meow', this.x, this.y);
  }
  draw(c) { shadow(c, this.x, this.y, 6); cat(c, this.x, this.y, { dir: this.dir, ph: this.ph, sit: this.st === 'sit' }); }
}

class MonkeyB {
  constructor(x, y) { this.x = x; this.y = y; this.st = 'idle'; this.timer = rnd(10, 16); this.dir = 1; this.ph = 0; this.tx = x; this.ty = y; this.moving = false; this.hold = 0; }
  mv(tx, ty, sp, dt) { const d = dist(this.x, this.y, tx, ty); if (d > 1) { this.x += (tx - this.x) / d * sp * dt; this.y += (ty - this.y) / d * sp * dt; this.dir = tx > this.x ? 1 : -1; this.moving = true; } return d; }
  flee(fx, fy) { const a = Math.atan2(this.y - fy, this.x - fx), r = rnd(220, 340); this.tx = clamp(this.x + Math.cos(a) * r, 40, WW - 40); this.ty = clamp(this.y + Math.sin(a) * r, 80, WH - 30); this.st = 'flee'; }
  upd(dt) {
    this.ph += dt * 8; this.moving = false; const pl = S.pl;
    if (this.st === 'idle') {
      this.timer -= dt;
      if (Math.random() < 0.3 * dt) { this.tx = clamp(this.x + rnd(-40, 40), 40, WW - 40); this.ty = clamp(this.y + rnd(-25, 25), 80, WH - 30); this.st = 'hop'; }
      if (this.timer <= 0 && S.mode === 'play') { this.st = (S.bonuses.length && Math.random() < 0.6) ? 'steal' : 'hunt'; this.timer = rnd(16, 24) / (S.diff || 1); }
    } else if (this.st === 'hop') { if (this.mv(this.tx, this.ty, 40, dt) < 2) this.st = 'idle'; }
    else if (this.st === 'steal') {
      let best = null, bd = 1e9; for (const b of S.bonuses) { const d = dist(b.x, b.y, this.x, this.y); if (d < bd) { bd = d; best = b; } }
      if (!best) { this.st = 'idle'; return; }
      if (this.mv(best.x, best.y, 80, dt) < 8) { S.bonuses.splice(S.bonuses.indexOf(best), 1); addText(this.x, this.y - 24, 'МАРТЫШКА УКРАЛА БОНУС!', '#ff6b6b'); this.flee(this.x, this.y); }
    } else if (this.st === 'hunt') {
      if (this.mv(pl.x, pl.y, 92, dt) < 18) { this.st = 'latch'; this.hold = 2.6; S.monkeyOn = this.hold; addText(pl.x, pl.y - 40, 'МАРТЫШКА НА ОБЪЕКТИВЕ!', '#ff6b6b'); beep(180, 0.25, 'sawtooth', 0.06, 90); }
    } else if (this.st === 'latch') {
      this.x = pl.x; this.y = pl.y + 1; this.hold -= dt; S.monkeyOn = Math.max(0, this.hold);
      if (this.hold <= 0) { S.monkeyOn = 0; this.flee(pl.x, pl.y); }
    } else if (this.st === 'flee') { if (this.mv(this.tx, this.ty, 110, dt) < 4) { this.st = 'idle'; this.timer = rnd(14, 22) / (S.diff || 1); } }
  }
  release() { if (this.st === 'latch') { S.monkeyOn = 0; this.flee(S.pl.x, S.pl.y); } }
  scare(cx, cy, rad) { if (this.st === 'latch') { if (dist(S.pl.x, S.pl.y, cx, cy) < rad) this.release(); } else if (dist(this.x, this.y, cx, cy) < rad) this.flee(cx, cy); }
  draw(c) {
    if (this.st === 'latch') { monkey(c, this.x, this.y - 22, { dir: this.dir, ph: this.ph, moving: false }); return; }
    shadow(c, this.x, this.y, 6); monkey(c, this.x, this.y, { dir: this.dir, ph: this.ph, moving: this.moving });
  }
}

function touristSprite(c, x, y, ph, moving, flash) {
  person(c, x, y, { skin: '#f1c9a6', hair: '#6b4226', hs: 'short', hat: 'cap', hatc: '#ffd23f', hatc2: '#ffb000', glasses: '#1d1d2b', top: '#ff7a3d', pants: '#4aa3ff', shoes: '#ffffff', moving: moving, ph: ph, r: 2, l: 0, mouth: flash ? 'open' : 'smile' });
  for (let i = 0; i < 3; i++) R(c, x - 3 + i * 3, y - 14 + (i % 2) * 2, 2, 2, '#ffe14d');
  R(c, x + 5, y - 40, 1, 16, '#444'); R(c, x + 3, y - 46, 6, 6, '#222'); R(c, x + 4, y - 45, 4, 4, flash ? '#ffffff' : '#4aa3ff');
}
class Tourist {
  constructor(x, y) { this.kind = 'tourist'; this.x = x; this.y = y; this.tx = x; this.ty = y; this.st = 'walk'; this.timer = 0; this.dir = 1; this.ph = 0; this.pick(); }
  pick() { const p = S.pl; this.tx = clamp(p.x + rnd(-170, 170), 40, WW - 40); this.ty = clamp(p.y + rnd(-100, 100), 80, WH - 30); }
  upd(dt) {
    this.ph += dt * 6;
    if (this.st === 'walk') {
      const d = dist(this.x, this.y, this.tx, this.ty);
      if (d < 4) { this.st = 'selfie'; this.timer = 1.4; sfx('click', this.x, this.y); }
      else { this.x += (this.tx - this.x) / d * 24 * dt; this.y += (this.ty - this.y) / d * 24 * dt; this.dir = this.tx > this.x ? 1 : -1; }
    } else { this.timer -= dt; if (this.timer <= 0) { this.st = 'walk'; this.pick(); } }
  }
  scare() { }
  draw(c) { shadow(c, this.x, this.y, 8); touristSprite(c, this.x, this.y, this.ph, this.st === 'walk', this.st === 'selfie' && Math.floor(this.timer * 8) % 2 === 0); }
}
class RunDog {
  constructor(x, y) { this.kind = 'dog'; this.x = x; this.y = y; this.tx = x; this.ty = y; this.dir = 1; this.ph = 0; this.t = 0; this.fast = 0; this.pick(); }
  pick() { this.tx = rnd(80, 1200); this.ty = rnd(90, 650); }
  upd(dt) {
    this.t += dt; this.ph += dt * 12; this.fast = Math.max(0, this.fast - dt);
    const d = dist(this.x, this.y, this.tx, this.ty);
    if (d < 8) { this.pick(); if (Math.random() < 0.5) sfx('bark', this.x, this.y); return; }
    const sp = this.fast > 0 ? 125 : 80, nx = (this.tx - this.x) / d, ny = (this.ty - this.y) / d, zz = Math.sin(this.t * 5) * 0.8;
    this.x = clamp(this.x + (nx - ny * zz) * sp * dt, 30, WW - 30); this.y = clamp(this.y + (ny + nx * zz) * sp * dt, 70, WH - 24); this.dir = nx >= 0 ? 1 : -1;
  }
  scare(cx, cy, rad) {
    if (dist(this.x, this.y, cx, cy) > rad) return; const a = Math.atan2(this.y - cy, this.x - cx);
    this.tx = clamp(this.x + Math.cos(a) * 300, 40, WW - 40); this.ty = clamp(this.y + Math.sin(a) * 300, 80, WH - 30); this.fast = 2.5; sfx('bark', this.x, this.y);
  }
  draw(c) { shadow(c, this.x, this.y, 7); dog(c, this.x, this.y, { dir: this.dir, ph: this.ph, body: '#7a5240', pat: '#34211a' }); }
}

/* ===== Бонусы ===== */
const BONUS_TYPES = ['coffee', 'lens', 'flash', 'clock', 'x2'];
const BONUS_INFO = {
  coffee: { ic: 'coffee', col: '#c58a54', msg: 'КОФЕ! БЕЖИМ БЫСТРЕЕ', name: 'КОФЕ', hud: 'БЕГ БЫСТРЕЕ', desc: 'БЕГ БЫСТРЕЕ', dur: 9 },
  lens: { ic: 'lens', col: '#4aa3ff', msg: 'ЛИНЗА! МГНОВЕННЫЙ ФОКУС', name: 'ЛИНЗА', hud: 'МГНОВЕННЫЙ ФОКУС', desc: 'МГНОВЕННЫЙ ФОКУС', dur: 12 },
  flash: { ic: 'flash', col: '#ffe14d', msg: 'МОЩНАЯ ВСПЫШКА! ВСЕ РАЗЛЕТЕЛИСЬ', name: 'ВСПЫШКА', hud: 'ВСПЫШКА ПУГАЕТ ВСЕХ', desc: 'ПУГАЕТ ГОЛУБЕЙ И МАРТЫШКУ', dur: 10 },
  clock: { ic: 'clock', col: '#ffffff', msg: '+8 СЕКУНД', name: 'ЧАСЫ', hud: '+8 СЕКУНД', desc: '+8 СЕКУНД К СМЕНЕ', dur: 0 },
  x2: { ic: 'x2', col: '#ffb000', msg: 'ОЧКИ x2 НА 10 СЕК', name: 'ЗВЕЗДА', hud: 'ОЧКИ x2', desc: 'ОЧКИ x2', dur: 10 }
};
class Bonus {
  constructor(type, x, y) { this.type = type; this.x = x; this.y = y; this.life = 14; this.t = rnd(0, 6); }
  draw(c) {
    if (this.life < 3 && Math.floor(this.life * 6) % 2) return;
    const bob = Math.round(Math.sin(this.t * 4) * 2), info = BONUS_INFO[this.type];
    c.globalAlpha = 0.3; ell(c, this.x, this.y, 10, 4, '#1d2a12'); c.globalAlpha = 1;
    c.globalAlpha = 0.9; disc(c, this.x, this.y - 22 + bob, 15, info.col); c.globalAlpha = 1; disc(c, this.x, this.y - 22 + bob, 13, '#ffffff');
    icon(c, info.ic, this.x - 10, this.y - 30 + bob, 2);
    if (this.type === 'x2') { c.font = '8px ' + FONT; c.textBaseline = 'top'; c.fillStyle = '#7a3ff2'; c.fillText('x2', this.x - 7, this.y - 25 + bob); }
  }
}

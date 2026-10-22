'use strict';
/* ===== Пиксельные примитивы ===== */
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
function disc(c, x, y, r, col) {
  c.fillStyle = col; x = Math.round(x); y = Math.round(y);
  for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy + 0.25)); c.fillRect(x - w, y + dy, w * 2 + 1, 1); }
}
function ell(c, x, y, rx, ry, col) {
  c.fillStyle = col; x = Math.round(x); y = Math.round(y);
  for (let dy = -ry; dy <= ry; dy++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01)))); c.fillRect(x - w, y + dy, w * 2 + 1, 1); }
}
function shadow(c, x, y, rx) { c.globalAlpha = 0.28; ell(c, x, y, rx, Math.max(2, Math.round(rx / 3)), '#14331f'); c.globalAlpha = 1; }
function pix(c, x, y, rows, pal, s) {
  s = s || 1; x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch !== '.' && pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x + i * s, y + j * s, s, s); } }
  }
}

/* ===== Иконки ===== */
const ICON = {
  heart: { rows: ['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], pal: { r: '#ff3d7f', w: '#ffc2d8' } },
  note: { rows: ['...bbbb', '...b..b', '...b..b', '...b..b', 'bb.b.bb', 'bb...bb'], pal: { b: '#2a1830' } },
  star: { rows: ['..y..', '..y..', 'yyyyy', '..y..', '..y..'], pal: { y: '#ffe14d' } },
  coffee: { rows: ['..s..s....', '.s..s.....', 'wwwwwwww..', 'wbbbbbbwww', 'wbbbbbbw.w', 'wbbbbbbwww', '.wbbbbw...', '..wwww....'], pal: { w: '#ffffff', b: '#8a4b24', s: '#e6f4ff' } },
  lens: { rows: ['..kkkkkk..', '.kbbbbbbk.', 'kbbwwbbbbk', 'kbwbbbbbbk', 'kbbbbbbbbk', 'kbbbbbbbbk', '.kbbbbbbk.', '..kkkkkk..'], pal: { k: '#222233', b: '#4aa3ff', w: '#ffffff' } },
  flash: { rows: ['....yyy...', '...yyy....', '..yyy.....', '.yyyyyy...', '....yyy...', '...yy.....', '..yy......', '.y........'], pal: { y: '#ffe14d' } },
  clock: { rows: ['..kkkkkk..', '.kwwwwwwk.', 'kwwwkwwwwk', 'kwwwkwwwwk', 'kwwwkkkwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kkkkkk..'], pal: { k: '#222233', w: '#ffffff' } },
  x2: { rows: ['....y....', '....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yyyyy..', '.yyy.yyy.', '.yy...yy.'], pal: { y: '#ffb000' } }
};
function icon(c, name, x, y, s) { const i = ICON[name]; pix(c, x, y, i.rows, i.pal, s || 1); }

/* ===== Леопардовый принт ===== */
function leopard(c, x, y, w, h, base, spot, dark) {
  R(c, x, y, w, h, base);
  for (let j = 0, r = 0; j + 2 <= h; j += 3, r++) {
    for (let i = (r % 2) ? 2 : 0, k = 0; i + 2 <= w; i += 4, k++) {
      if ((k + r) % 5 === 3) continue;
      R(c, x + i, y + j, 2, 1, spot);
      R(c, x + i, y + j + 1, 1, 1, dark || spot);
    }
  }
}

/* ===== Руки, волосы, шапки ===== */
function arm(c, sx, sy, up, left, col, skin) {
  if (up === 0) { R(c, sx, sy, 2, 6, col); R(c, sx, sy + 6, 2, 2, skin); }
  else if (up === 1) {
    if (left) { R(c, sx - 4, sy + 1, 5, 2, col); R(c, sx - 6, sy + 1, 2, 2, skin); }
    else { R(c, sx + 1, sy + 1, 5, 2, col); R(c, sx + 5, sy + 1, 2, 2, skin); }
  }
  else if (up === 2) { R(c, sx, sy - 5, 2, 6, col); R(c, sx, sy - 7, 2, 2, skin); }
  else {
    if (left) { R(c, sx - 1, sy + 1, 2, 4, col); R(c, sx, sy + 4, 3, 2, skin); }
    else { R(c, sx + 1, sy + 1, 2, 4, col); R(c, sx - 1, sy + 4, 3, 2, skin); }
  }
}
function hair(c, x, y, st, col, hi) {
  switch (st) {
    case 'quiff':
      R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 1, 4, col); R(c, x + 4, y - 25, 1, 3, col);
      R(c, x - 4, y - 30, 6, 2, col); R(c, x - 1, y - 32, 5, 2, col); R(c, x + 3, y - 31, 3, 2, col); R(c, x - 6, y - 27, 2, 2, col);
      R(c, x - 3, y - 27, 3, 1, hi || col); break;
    case 'short': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 1, 3, col); R(c, x + 4, y - 25, 1, 3, col); break;
    case 'bob': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 2, 9, col); R(c, x + 3, y - 25, 2, 9, col); R(c, x - 4, y - 25, 8, 1, col); break;
    case 'long': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 2, 12, col); R(c, x + 3, y - 25, 2, 12, col); break;
    case 'bun': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 1, 3, col); R(c, x + 4, y - 25, 1, 3, col); disc(c, x, y - 31, 2, col); break;
    case 'curly': disc(c, x - 6, y - 24, 3, col); disc(c, x + 6, y - 24, 3, col); disc(c, x - 3, y - 29, 4, col); disc(c, x + 3, y - 29, 4, col); disc(c, x, y - 31, 3, col); break;
    case 'bald': R(c, x - 5, y - 24, 1, 4, col); R(c, x + 4, y - 24, 1, 4, col); R(c, x - 4, y - 26, 8, 1, col); break;
    case 'wavy': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 6, y - 25, 3, 9, col); R(c, x + 4, y - 25, 3, 9, col); R(c, x - 7, y - 20, 2, 5, col); R(c, x + 6, y - 20, 2, 5, col); break;
  }
}
function hat(c, x, y, st, col, col2) {
  switch (st) {
    case 'beanie': R(c, x - 5, y - 29, 10, 5, col); R(c, x - 5, y - 26, 10, 1, col2 || '#fff'); R(c, x - 1, y - 31, 3, 2, col2 || '#fff'); break;
    case 'fedora': R(c, x - 7, y - 26, 14, 2, col); R(c, x - 4, y - 31, 8, 5, col); R(c, x - 4, y - 27, 8, 1, col2 || '#222'); break;
    case 'band': R(c, x - 5, y - 27, 10, 2, col); break;
    case 'chef': R(c, x - 5, y - 27, 10, 3, col); R(c, x - 4, y - 31, 8, 4, col); break;
    case 'cap': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 12, 1, col2 || col); break;
    case 'veil': R(c, x - 5, y - 28, 10, 3, col); R(c, x - 6, y - 26, 2, 11, col); R(c, x + 4, y - 26, 2, 11, col); R(c, x - 3, y - 30, 6, 2, '#ffd6e8'); break;
    case 'top': R(c, x - 6, y - 26, 12, 2, col); R(c, x - 4, y - 33, 8, 7, col); R(c, x - 4, y - 28, 8, 1, col2 || '#d33'); break;
    case 'bandana': R(c, x - 5, y - 28, 10, 4, col); R(c, x - 5, y - 25, 10, 1, col); R(c, x + 4, y - 25, 3, 2, col); break;
  }
}

/* ===== Человечек (x,y — центр стоп) =====
   o: skin, hair, hs (стиль), hi, top, sleeve, pants, shoes, dress, hat, hatc, hatc2, beard, glasses, back, sleep,
      mouth, look, ph, moving, z, l, r (позы рук: 0 вниз, 1 в сторону, 2 вверх, 3 на поясе), pattern, spot, nose, earring */
function person(c, x, y, o) {
  const z = o.z || 0, ph = o.ph || 0, mv = !!o.moving;
  const sw = mv ? Math.round(Math.sin(ph) * 1.5) : 0;
  const bob = mv && Math.cos(ph * 2) > 0.5 ? -1 : 0;
  x = Math.round(x); y = Math.round(y - z) + bob;
  const skin = o.skin || '#f2cdb0', pants = o.pants || '#3a3f6b', shoes = o.shoes || '#ffffff', top = o.top || '#ff6b6b', ink = '#2a1830';
  const sl = o.sleeve || top;
  const wide = o.pattern === 'leopard' ? 1 : 0;
  // ноги / юбка
  if (o.dress) {
    R(c, x - 5, y - 8, 10, 5, o.dress); R(c, x - 6, y - 5, 12, 2, o.dress);
    R(c, x - 3, y - 3, 2, 2, skin); R(c, x + 1, y - 3, 2, 2, skin);
    R(c, x - 4, y - 1, 3, 1, shoes); R(c, x + 1, y - 1, 3, 1, shoes);
  } else {
    const lo = sw > 0 ? 1 : 0, ro = sw < 0 ? 1 : 0;
    R(c, x - 4, y - 9, 3, 7 - lo, pants); R(c, x + 1, y - 9, 3, 7 - ro, pants);
    R(c, x - 4, y - 2 - lo, 3, 2, shoes); R(c, x + 1, y - 2 - ro, 3, 2, shoes);
  }
  // торс
  if (o.pattern === 'leopard') { leopard(c, x - 5, y - 17, 10, 10, '#e9a23b', '#5b3213', '#2b1a0e'); R(c, x - 1, y - 17, 2, 5, '#1c1c24'); R(c, x - 5, y - 8, 10, 1, '#c9821f'); }
  else R(c, x - 4, y - 17, 8, 8, top);
  if (o.belt) R(c, x - 4, y - 10, 8, 1, o.belt);
  // руки
  const lx = x - 6 - wide, rx = x + 4 + wide, sy = y - 17;
  const lup = o.l || 0, rup = o.r || 0;
  arm(c, lx, sy + (lup === 0 ? -sw : 0), lup, true, sl, skin);
  arm(c, rx, sy + (rup === 0 ? sw : 0), rup, false, sl, skin);
  if (o.spot) { if (lup === 0) { R(c, lx, sy + 1 - sw, 1, 1, o.spot); R(c, lx + 1, sy + 3 - sw, 1, 1, o.spot); } if (rup === 0) { R(c, rx + 1, sy + 1 + sw, 1, 1, o.spot); R(c, rx, sy + 3 + sw, 1, 1, o.spot); } }
  // голова
  R(c, x - 4, y - 25, 8, 8, skin);
  if (o.earring) { R(c, x - 5, y - 21, 1, 6, '#dfe3ee'); R(c, x - 5, y - 21, 1, 1, '#ffffff'); }
  if (o.back) { R(c, x - 4, y - 25, 8, 8, o.hair || '#222'); }
  else {
    const dx = o.look || 0;
    if (o.sleep) { R(c, x - 3 + dx, y - 21, 2, 1, ink); R(c, x + 1 + dx, y - 21, 2, 1, ink); }
    else { R(c, x - 3 + dx, y - 22, 1, 2, ink); R(c, x + 2 + dx, y - 22, 1, 2, ink); }
    if (o.brow) { R(c, x - 4 + dx, y - 24, 3, 1, ink); R(c, x + 1 + dx, y - 24, 3, 1, ink); }
    if (o.cheek !== false) { R(c, x - 4, y - 20, 1, 1, '#ff9aa8'); R(c, x + 3, y - 20, 1, 1, '#ff9aa8'); }
    const m = o.mouth || 'smile';
    if (m === 'smile') { R(c, x - 1 + dx, y - 19, 3, 1, '#b5524f'); R(c, x - 2 + dx, y - 20, 1, 1, '#b5524f'); R(c, x + 2 + dx, y - 20, 1, 1, '#b5524f'); }
    else if (m === 'open') R(c, x - 1 + dx, y - 20, 3, 2, '#7a1f2b');
    else if (m === 'flat') R(c, x - 1 + dx, y - 19, 3, 1, '#7a3a3a');
    else if (m === 'kiss') R(c, x + dx, y - 19, 2, 2, '#e0486e');
    if (o.nose) R(c, x - 1 + dx, y - 21, 3, 3, o.nose);
    if (o.glasses) { R(c, x - 4, y - 23, 3, 3, o.glasses); R(c, x + 1, y - 23, 3, 3, o.glasses); R(c, x - 1, y - 22, 2, 1, o.glasses); }
    if (o.beard) { R(c, x - 4, y - 20, 8, 4, o.beard); R(c, x - 1 + dx, y - 19, 3, 1, '#b5524f'); }
    if (o.stache) R(c, x - 3, y - 20, 6, 1, o.stache);
    if (o.hs) hair(c, x, y, o.hs, o.hair || '#222', o.hi);
  }
  if (o.back && o.hs === 'bob') { R(c, x - 5, y - 28, 10, 12, o.hair); }
  if (o.hat) hat(c, x, y, o.hat, o.hatc || '#333', o.hatc2);
}

/* ===== Оксана ===== */
function drawOksana(c, x, y, o) {
  o = o || {};
  const d = o.dir >= 0 ? 1 : -1;
  const aiming = !!o.aim;
  person(c, x, y, {
    skin: '#f2cdb0', hair: '#3a281f', hi: '#5a3e30', hs: 'quiff', pattern: 'leopard', sleeve: '#e9a23b', spot: '#5b3213',
    pants: '#1c1c24', shoes: '#f4f4f8', earring: true, look: d, ph: o.ph, moving: o.moving, mouth: o.mouth || 'smile',
    l: d > 0 ? 0 : 1, r: d > 0 ? 1 : 0
  });
  const by = Math.round(y) + (o.moving && Math.cos((o.ph || 0) * 2) > 0.5 ? -1 : 0);
  const cx = Math.round(x) + d * 9, cy = by - 16;
  R(c, cx - 4, cy - 1, 9, 6, '#26262e'); R(c, cx - 4, cy - 2, 9, 1, '#b9bcc8'); R(c, cx - 4, cy + 1, 9, 1, '#3a3a45');
  disc(c, cx, cy + 2, 2, '#2e5f94'); R(c, cx - 1, cy + 1, 1, 1, '#ffffff');
  R(c, cx + 3, cy - 3, 2, 1, '#ff4d6d');
  if (o.flash) { icon(c, 'star', cx - 2, cy - 8, 1); R(c, cx - 6, cy - 6, 2, 2, '#fff'); R(c, cx + 5, cy - 7, 2, 2, '#fff7a8'); }
}

/* ===== Животные ===== */
function pigeon(c, x, y, o) {
  x = Math.round(x); y = Math.round(y); const d = o.dir >= 0 ? 1 : -1, col = '#aeb4c2', dk = '#7d8597';
  if (o.fly) {
    const f = Math.sin((o.ph || 0) * 2) > 0;
    ell(c, x, y, 3, 2, col);
    R(c, d > 0 ? x + 3 : x - 5, y - 2, 2, 2, '#6c7386'); R(c, d > 0 ? x + 5 : x - 6, y - 1, 1, 1, '#f2a33a');
    if (f) { R(c, x - 6, y - 5, 4, 2, dk); R(c, x + 3, y - 5, 4, 2, dk); R(c, x - 5, y - 3, 3, 1, dk); R(c, x + 3, y - 3, 3, 1, dk); }
    else { R(c, x - 7, y - 1, 5, 2, dk); R(c, x + 3, y - 1, 5, 2, dk); }
  } else {
    const pk = o.peck ? 2 : 0;
    ell(c, x, y - 2, 3, 2, col); R(c, d > 0 ? x - 5 : x + 3, y - 2, 3, 1, dk);
    R(c, d > 0 ? x + 2 : x - 4, y - 5 + pk, 3, 3, '#6c7386'); R(c, d > 0 ? x + 1 : x - 2, y - 4, 2, 1, '#6fbf9c');
    R(c, d > 0 ? x + 5 : x - 5, y - 4 + pk, 1, 1, '#f2a33a'); R(c, d > 0 ? x + 3 : x - 3, y - 5 + pk, 1, 1, '#ff8a1f');
    R(c, x - 1, y, 1, 1, '#e0657a'); R(c, x + 1, y, 1, 1, '#e0657a');
  }
}
function cat(c, x, y, o) {
  x = Math.round(x); y = Math.round(y); const d = o.dir >= 0 ? 1 : -1, col = '#f0a04b', st = '#c9732a', tw = Math.sin((o.ph || 0) * 2) > 0 ? 1 : 0;
  if (o.sit) {
    ell(c, x, y - 4, 4, 4, col); R(c, x - 2, y - 3, 4, 3, '#ffe2b8');
    R(c, x - 3, y - 12, 7, 6, col); R(c, x - 3, y - 14, 2, 2, col); R(c, x + 2, y - 14, 2, 2, col);
    R(c, x - 2, y - 10, 1, 2, '#2e9d4a'); R(c, x + 1, y - 10, 1, 2, '#2e9d4a'); R(c, x, y - 8, 1, 1, '#ff7aa8'); R(c, x - 2, y - 12, 5, 1, st);
    R(c, x - d * 5, y - 2 - tw, 2, 2, col); R(c, x - d * 6, y - 5 - tw, 2, 4, col); R(c, x - d * 6, y - 7 - tw, 2, 2, st);
  } else {
    const lg = Math.sin((o.ph || 0) * 3) > 0 ? 1 : 0;
    ell(c, x, y - 5, 6, 3, col); R(c, x - 3, y - 7, 2, 1, st); R(c, x + 1, y - 7, 2, 1, st);
    R(c, x + d * 6 - 2, y - 10, 5, 5, col); R(c, x + d * 6 - 2, y - 12, 2, 2, col); R(c, x + d * 6 + 1, y - 12, 2, 2, col);
    R(c, x + d * 7, y - 8, 1, 1, '#2e9d4a'); R(c, x + d * 8, y - 6, 1, 1, '#ff7aa8');
    R(c, x - 4, y - 2 + lg, 2, 2 - lg, col); R(c, x + 3, y - 2 + (1 - lg), 2, 2 - (1 - lg), col);
    R(c, x - d * 7, y - 8 - tw, 2, 4, col); R(c, x - d * 7, y - 10 - tw, 2, 2, st);
  }
}
function monkey(c, x, y, o) {
  x = Math.round(x); y = Math.round(y); const d = o.dir >= 0 ? 1 : -1, br = '#7b4a2b', lt = '#e9c49b', dk = '#4e2d19';
  y += o.moving ? -Math.abs(Math.round(Math.sin((o.ph || 0) * 2) * 2)) : 0;
  const tw = Math.round(Math.sin(o.ph || 0) * 2);
  R(c, x - d * 5, y - 6, 2, 2, br); R(c, x - d * 7, y - 9, 2, 4, br); R(c, x - d * 7 + tw, y - 12, 2, 3, br); R(c, x - d * 6 + tw, y - 13, 2, 1, br);
  ell(c, x, y - 5, 4, 5, br); ell(c, x, y - 4, 2, 3, lt);
  R(c, x - 4, y - 1, 3, 2, dk); R(c, x + 1, y - 1, 3, 2, dk);
  R(c, x - 6, y - 8, 2, 5, br); R(c, x + 4, y - 8, 2, 5, br);
  disc(c, x, y - 13, 4, br); disc(c, x - 5, y - 13, 2, br); disc(c, x + 5, y - 13, 2, br); disc(c, x - 5, y - 13, 1, lt); disc(c, x + 5, y - 13, 1, lt);
  ell(c, x, y - 12, 3, 3, lt); R(c, x - 2, y - 14, 1, 2, '#222'); R(c, x + 1, y - 14, 1, 2, '#222'); R(c, x - 1, y - 11, 3, 1, '#a5502e');
}
function dog(c, x, y, o) {
  x = Math.round(x); y = Math.round(y); const d = o.dir >= 0 ? 1 : -1, body = o.body || '#f6e6c6', pat = o.pat || '#c98b4a';
  const wag = Math.sin((o.ph || 0) * 3) > 0 ? 1 : 0, lg = Math.sin((o.ph || 0) * 2) > 0 ? 1 : 0;
  ell(c, x, y - 5, 6, 3, body); R(c, x - 3, y - 8, 4, 3, pat);
  const hx = d > 0 ? x + 4 : x - 9;
  R(c, hx, y - 10, 6, 5, body); R(c, hx + (d > 0 ? 4 : -1), y - 8, 3, 2, '#fff'); R(c, hx + (d > 0 ? 6 : -2), y - 9, 1, 1, '#222');
  R(c, hx + (d > 0 ? 0 : 4), y - 13, 2, 4, pat); R(c, hx + (d > 0 ? 3 : 2), y - 9, 1, 1, '#222');
  R(c, x - 5, y - 3, 2, 3 - lg, body); R(c, x + 3, y - 3, 2, 2 + lg, body);
  R(c, x - d * 7, y - 9 - wag, 2, 4, body);
}
function drawHeart(c, x, y, s) { pix(c, x, y, ICON.heart.rows, ICON.heart.pal, s || 1); }

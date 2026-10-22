'use strict';
/* ===== Звук: эффекты, голоса, музыка, шум погоды ===== */
let AC = null, AMB = null;
function actx() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { } }
  if(AC&&typeof Soundscape!=='undefined')Soundscape.warm(AC);
  return AC;
}
function beep(f, d, type, vol, slide, delay) {
  if (S.mute) return; const a = actx(); if (!a) return;
  try {
    const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + d);
    g.gain.setValueAtTime(vol || 0.06, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + d + 0.02);
  } catch (e) { }
}
function noise(d, vol, freq, kind, delay) {
  if (S.mute) return; const a = actx(); if (!a) return;
  try {
    const n = Math.max(1, Math.floor(a.sampleRate * d)), b = a.createBuffer(1, n, a.sampleRate), data = b.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; f.type = kind || 'highpass'; f.frequency.value = freq || 1000; g.gain.value = vol || 0.1;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + (delay || 0));
  } catch (e) { }
}
function shutter() { if(typeof Soundscape!=='undefined')Soundscape.play('shutter',S.pl.x,S.pl.y,.9,true); }
// Legacy pose beeps are superseded by camera-triggered recorded Foley.
function sfx() {}

/* Шум дождя и ветра */
function setAmbient(type) {
  if (AMB) { try { AMB.s.stop(); } catch (e) { } AMB = null; }
  if (type !== 'rain' && type !== 'wind') return; const a = actx(); if (!a) return;
  try {
    const n = a.sampleRate * 2, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; s.loop = true; f.type = type === 'rain' ? 'highpass' : 'lowpass'; f.frequency.value = type === 'rain' ? 3000 : 600; g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(); AMB = { s, g, type, base: type === 'rain' ? 0.05 : 0.08 };
  } catch (e) { AMB = null; }
}
function ambientTick() {
  if (!AMB) return;
  try { AMB.g.gain.value = (S.mute || S.help || S.portrait || S.mode !== 'play') ? 0 : AMB.base * (AMB.type === 'wind' ? 0.7 + 0.3 * Math.sin(S.tt * 0.8) : 1); } catch (e) { }
}

/* Музыка: простой цикл из басса, арпеджио и ритма. Темп растёт вместе со сложностью */
const MUS = { step: 0, next: 0 };
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
const mhz = n => 440 * Math.pow(2, (n - 69) / 12);
function musicStep(a, t, step, sd) {
  const bar = (step >> 4) % 8, ch = CHORDS[(bar >> 1) % 4], s = step & 15, dl = Math.max(0, t - a.currentTime);
  if (s === 0 || s === 6 || s === 14) beep(mhz(ch[0] - 12), sd * 3, 'triangle', 0.05, 0, dl);
  if (s === 8) beep(mhz(ch[2] - 12), sd * 3, 'triangle', 0.05, 0, dl);
  if (s % 2 === 0) beep(mhz(ch[(s / 2) % 3] + 12 + (bar >= 4 && s % 4 === 2 ? 12 : 0)), sd * 1.6, 'square', 0.016, 0, dl);
  if (s === 0 || s === 8) beep(130, 0.1, 'sine', 0.07, 45, dl);
  if (s % 4 === 2) noise(0.04, 0.015, 7000, 'highpass', dl);
}
function musicLoop() {
  const a = AC; if (!a) return;
  const want = !S.mute && !S.noMusic && !S.help && !S.portrait && (S.mode === 'title' || S.mode === 'play');
  if (!want) { MUS.next = 0; return; }
  const sd = 60 / (120 + (S.stage || 0) * 8) / 4;
  if (!MUS.next || MUS.next < a.currentTime - 0.2) MUS.next = a.currentTime + 0.05;
  while (MUS.next < a.currentTime + 0.3) { musicStep(a, MUS.next, MUS.step++, sd); MUS.next += sd; }
}
setInterval(() => { musicLoop(); ambientTick(); if(typeof Soundscape!=='undefined')Soundscape.sync(); }, 100);

// core.js — shared helpers for every scene (plain Canvas 2D, deterministic: everything is a function of time).
'use strict';
const W = 1920, H = 1080;

// ---------- palette ----------
const C = {
  bg: '#F4EBDD', bg2: '#EADBC4', paper: '#FBF6EE', ink: '#2B2623', inkSoft: '#5B514A',
  lime: '#F3EEE3', limeShade: '#E2D8C6', ochre: '#D9A441', ochreDark: '#B07F25', terracotta: '#C8643B',
  sand: '#E6CFA5', stone: '#B9AD9B', stoneDark: '#8F8372', stoneLight: '#D6CCBC', mortar: '#E9E1D2',
  water: '#3E9BDA', waterLight: '#A9D6F5', vapor: '#CFE6F7',
  plastic: '#E9F3F7', plasticShine: '#FFFFFF', plasticTint: '#9FD3E6', rpe: '#F1E7C8',
  cement: '#A3A6A8', cementDark: '#7E8285',
  mold: '#55703A', moldDark: '#3D5229', algae: '#6E9A45', salt: '#FFFFFF',
  danger: '#D64545', good: '#3E9A5B', goodLight: '#BFE3C8', warn: '#E7943A',
  sky: '#BFDDEE', skyTop: '#9CCAE6', grass: '#8DB86B', grassDark: '#6E9A4F',
  wood: '#9C6B43', woodDark: '#6E4A2D', roof: '#A64B2A', roofDark: '#7E3820', slate: '#55606B',
  insulationPS: '#F5F5F0', fiber: '#C9A26B', hemp: '#CDBE8E', cork: '#9E6E45',
  keim: ['#C9643F', '#D9A441', '#5F8FA8', '#7E9C6A', '#B9806A'],
  volcano: '#5A4A44', lava: '#E2582B', roman: '#D8C9A8',
};
const FONT = { title: '"Fredoka", system-ui, sans-serif', body: '"Nunito", system-ui, sans-serif', hand: '"Caveat", cursive' };

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));           // 0..1 progress of x through [a,b]
const smooth = k => (k = clamp(k), k * k * (3 - 2 * k));
const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeIn = k => Math.pow(clamp(k), 3);
const easeOutBack = (k, s = 1.70158) => { k = clamp(k) - 1; return k * k * ((s + 1) * k + s) + 1; };
const easeOutElastic = k => { k = clamp(k); if (k === 0 || k === 1) return k; return Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI / 3)) + 1; };
// appear: 0 before t0, rises to 1 over dur (eased)
const appear = (t, t0, dur = .5, fn = easeOut) => fn(inv(t0, t0 + dur, t));
// window: rises at t0, falls at t1
const windowed = (t, t0, t1, fade = .4) => Math.min(appear(t, t0, fade, smooth), 1 - appear(t, t1 - fade, fade, smooth));
const TAU = Math.PI * 2;

// deterministic random
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function noise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// colors
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mixColor(a, b, k) { const A = hexRgb(a), B = hexRgb(b); k = clamp(k); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }

// ---------- drawing primitives ----------
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillRR(ctx, x, y, w, h, r, fill, stroke, lw = 4) { rr(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function circle(ctx, x, y, r, fill, stroke, lw = 4) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function ellipse(ctx, x, y, rx, ry, fill, stroke, lw = 4, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function line(ctx, x1, y1, x2, y2, color = C.ink, lw = 4, cap = 'round') { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.stroke(); }
function poly(ctx, pts, fill, stroke, lw = 4) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); } }
// wobbly blob path (organic shapes): n points around (x,y) with radius r, seed
function blob(ctx, x, y, r, seed = 1, wob = .18, n = 10, fill, stroke, lw = 4, t = 0) {
  ctx.beginPath();
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr2 = r * (1 + wob * (hash(seed * 31 + i) * 2 - 1) + wob * .4 * Math.sin(t * 2 + i + seed)); pts.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); }
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (i === 0) { const l = pts[n - 1]; ctx.moveTo((l[0] + p[0]) / 2, (l[1] + p[1]) / 2); } ctx.quadraticCurveTo(p[0], p[1], mx, my); }
  ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
// arrow from (x1,y1) to (x2,y2); k = drawing progress 0..1
function arrow(ctx, x1, y1, x2, y2, { color = C.ink, lw = 8, head = 26, k = 1, curve = 0, dash = null } = {}) {
  if (k <= 0) return;
  const mx = (x1 + x2) / 2 - (y2 - y1) * curve, my = (y1 + y2) / 2 + (x2 - x1) * curve;
  const P = s => [(1 - s) * (1 - s) * x1 + 2 * (1 - s) * s * mx + s * s * x2, (1 - s) * (1 - s) * y1 + 2 * (1 - s) * s * my + s * s * y2];
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); const N = 30; for (let i = 0; i <= N * k; i++) { const p = P(i / N); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } const pe = P(k); ctx.lineTo(...pe); ctx.stroke();
  ctx.setLineDash([]);
  const pb = P(Math.max(0, k - .02)), a = Math.atan2(pe[1] - pb[1], pe[0] - pb[0]);
  ctx.beginPath(); ctx.moveTo(pe[0] + Math.cos(a) * head * .4, pe[1] + Math.sin(a) * head * .4);
  ctx.lineTo(pe[0] + Math.cos(a + 2.5) * head, pe[1] + Math.sin(a + 2.5) * head);
  ctx.lineTo(pe[0] + Math.cos(a - 2.5) * head, pe[1] + Math.sin(a - 2.5) * head); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// water droplet pointing up (tip at top); s = size (height ≈ 2.4 s)
function drop(ctx, x, y, s, fill = C.water, stroke = null, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.beginPath();
  ctx.moveTo(x, y - s * 1.5);
  ctx.bezierCurveTo(x + s * .35, y - s * .9, x + s, y - s * .35, x + s, y + .15 * s);
  ctx.arc(x, y + .15 * s, s, 0, Math.PI);
  ctx.bezierCurveTo(x - s, y - s * .35, x - s * .35, y - s * .9, x, y - s * 1.5);
  ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(2, s * .12); ctx.stroke(); }
  ellipse(ctx, x - s * .38, y - s * .05, s * .18, s * .32, 'rgba(255,255,255,.65)', null, 0, -.4);
  ctx.restore();
}
// vapor puff (soft round cloud)
function puff(ctx, x, y, r, alpha = .7, color = '#FFFFFF') {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x - r * .7, y + r * .25, r * .7, 0, TAU); ctx.arc(x + r * .75, y + r * .2, r * .65, 0, TAU); ctx.fill(); ctx.restore();
}
function cloud(ctx, x, y, s, fill = '#FFFFFF', alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = fill; ctx.beginPath();
  [[0, 0, 1], [-.9, .25, .7], [.9, .25, .72], [-.4, -.35, .75], [.45, -.3, .7]].forEach(([dx, dy, r]) => { ctx.moveTo(x + dx * s + r * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); });
  ctx.fill(); ctx.restore();
}
function sun(ctx, x, y, r, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * .1);
  for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); line(ctx, r * 1.25, 0, r * 1.6, 0, '#F2B843', 8); }
  ctx.restore(); circle(ctx, x, y, r, '#F6C84C', '#E5A92E', 5);
}

// ---------- text ----------
function setFont(ctx, size, family = FONT.body, weight = 800) { ctx.font = `${weight} ${size}px ${family}`; }
function text(ctx, s, x, y, { size = 48, font = FONT.body, weight = 800, color = C.ink, align = 'center', base = 'middle', alpha = 1, stroke = null, sw = 8, maxW = null } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; setFont(ctx, size, font, weight); ctx.textAlign = align; ctx.textBaseline = base;
  if (maxW) { const w = ctx.measureText(s).width; if (w > maxW) setFont(ctx, size * maxW / w, font, weight); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
function wrap(ctx, s, maxW) {
  const words = s.split(' '), out = []; let cur = '';
  for (const w of words) { const tryS = cur ? cur + ' ' + w : w; if (ctx.measureText(tryS).width > maxW && cur) { out.push(cur); cur = w; } else cur = tryS; }
  if (cur) out.push(cur); return out;
}
// multi-line text block; returns height
function textBlock(ctx, s, x, y, maxW, { size = 40, font = FONT.body, weight = 700, color = C.ink, align = 'left', lh = 1.25, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; setFont(ctx, size, font, weight); ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillStyle = color;
  const ls = wrap(ctx, s, maxW); ls.forEach((l, i) => ctx.fillText(l, x, y + i * size * lh)); ctx.restore(); return ls.length * size * lh;
}
// rounded callout label with pop-in. k = 0..1 appear progress
function label(ctx, s, x, y, { k = 1, size = 40, bg = C.paper, color = C.ink, border = C.ink, pad = 18, font = FONT.title, weight = 600, rot = 0, icon = null } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, size, font, weight); const w = ctx.measureText(s).width + pad * 2, h = size * 1.45;
  fillRR(ctx, -w / 2 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, bg, border, 4);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * .05);
  ctx.restore();
}
// big stamp (✔ / ✘ style verdicts)
function stamp(ctx, s, x, y, { k = 1, color = C.danger, size = 70, rot = -.12 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = lerp(2.2, 1, easeOut(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2);
  setFont(ctx, size, FONT.title, 700); const w = ctx.measureText(s).width + 50, h = size * 1.5;
  fillRR(ctx, -w / 2, -h / 2, w, h, 16, rgba(color, .08), color, 7);
  text(ctx, s, 0, 4, { size, font: FONT.title, weight: 700, color });
  ctx.restore();
}
function check(ctx, x, y, s, color = C.good, k = 1) { if (k <= 0) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = s * .22; ctx.beginPath(); const p = [[x - s * .5, y], [x - s * .12, y + s * .4], [x + s * .6, y - s * .45]]; ctx.moveTo(...p[0]); if (k < .4) ctx.lineTo(lerp(p[0][0], p[1][0], k / .4), lerp(p[0][1], p[1][1], k / .4)); else { ctx.lineTo(...p[1]); const k2 = (k - .4) / .6; ctx.lineTo(lerp(p[1][0], p[2][0], k2), lerp(p[1][1], p[2][1], k2)); } ctx.stroke(); ctx.restore(); }
function cross(ctx, x, y, s, color = C.danger, k = 1) { if (k <= 0) return; const a = clamp(k * 2), b = clamp(k * 2 - 1); line(ctx, x - s / 2, y - s / 2, lerp(x - s / 2, x + s / 2, a), lerp(y - s / 2, y + s / 2, a), color, s * .2); if (b > 0) line(ctx, x + s / 2, y - s / 2, lerp(x + s / 2, x - s / 2, b), lerp(y - s / 2, y + s / 2, b), color, s * .2); }

// ---------- backgrounds ----------
function paperBg(ctx, top = C.bg, bottom = C.bg2) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(GRAIN(), 0, 0);
}
function skyBg(ctx, t = 0, { top = C.skyTop, bottom = '#EAF4F8', ground = C.grass, groundY = 900, clouds = true } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, groundY); g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, groundY);
  if (clouds) { for (let i = 0; i < 4; i++) { const x = ((i * 610 + t * (14 + i * 4)) % (W + 500)) - 250; cloud(ctx, x, 120 + i * 55 + (i % 2) * 40, 55 + i * 10, '#FFFFFF', .9); } }
  ctx.fillStyle = ground; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = C.grassDark; ctx.fillRect(0, groundY, W, 10);
}
const GRAIN = (() => { let c; return () => { if (c) return c; c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = rng(5); for (let i = 0; i < 9000; i++) { g.fillStyle = r() < .5 ? 'rgba(80,60,40,.05)' : 'rgba(255,255,255,.08)'; const s = 1 + r() * 3; g.fillRect(r() * W, r() * H, s, s); } return c; }; })();

// cache helper: draw something expensive once into an offscreen canvas
const _cache = new Map();
function cached(key, w, h, draw) {
  let c = _cache.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); draw(c.getContext('2d')); _cache.set(key, c); return c;
}

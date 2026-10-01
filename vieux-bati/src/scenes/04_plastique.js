// 04_plastique.js — Chapitre 3 « Comment le plastique a piégé l'eau » (~62 s)
// Set A (lines 0–7): wall cross-section — interior (left), stone + old lime render, exterior (right).
//   70s plastic paints + RPE + cement plinth → closed film → rain bounces off, but ground water and
//   house vapour keep coming from behind → blocked → pocket, pressure, blisters, peeling → salts → frost.
// Set B (lines 8–9): the façade looks clean, an x-ray shows powdery render behind; one scrape… all falls.
(() => {
'use strict';

// ------------------------------------------------------------------ geometry (world coordinates of set A)
const P = { in0: 600, st0: 616, rd0: 978, fx: 1014, top: 112, gy: 860, ply: 600, film: 12, rpe: 16, cem: 32 };
const PLA_BL = [{ y: 262, h: 46, a: 40, d: 0 }, { y: 430, h: 62, a: 60, d: .22 }, { y: 562, h: 34, a: 28, d: .45 }];
const PLA_SB = [{ y: 158, h: 16, a: 9 }, { y: 340, h: 18, a: 11 }, { y: 508, h: 13, a: 8 }];   // salt bumps
const PEEL = { y0: 368, y1: 492 };      // the plaque that peels off (over the big blister)
const FILM_C = '#86CDE6', FILM_L = '#CDEFF9', RPE_C = '#F3E2B3';

// ------------------------------------------------------------------ small helpers
function pla_vap(ctx, x, y, r, a = .9) { if (a <= .01 || r <= 0) return; puff(ctx, x, y, r * 1.16, a * .6, '#5FA8DC'); puff(ctx, x, y, r, a, '#F2F9FE'); }
function pla_drop(ctx, x, y, s, a = 1) { if (a <= .01) return; drop(ctx, x, y, s, C.water, '#FFFFFF', a); }
function pla_pill(ctx, s, x, y, k, { size = 40, bg = C.paper, color = C.ink, border = C.ink, tx = null, ty = null, acol = C.ink, icon = null } = {}) {
  if (k <= 0) return;
  if (tx != null) { ctx.save(); ctx.globalAlpha *= clamp(k * 2); arrow(ctx, x, y, tx, ty, { color: acol, lw: 6, head: 20, k: easeOut(k) }); ctx.restore(); }
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, size, FONT.title, 600); const tw = ctx.measureText(s).width, iw = icon ? size * 1.15 : 0, w = tw + 44 + iw, h = size * 1.5;
  fillRR(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h / 2, 'rgba(0,0,0,.16)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, bg, border, 4);
  if (icon) icon(ctx, -w / 2 + 20 + iw / 2 - 4, 0, size * .48);
  text(ctx, s, -w / 2 + 22 + iw + tw / 2, size * .05, { size, font: FONT.title, weight: 600, color });
  ctx.restore();
}
const ICON_OK = (ctx, x, y, r) => { circle(ctx, x, y, r, C.good, C.ink, 3); check(ctx, x, y + 2, r * 1.15, '#FFFFFF'); };
const ICON_NO = (ctx, x, y, r) => { circle(ctx, x, y, r, C.danger, C.ink, 3); cross(ctx, x, y, r * .9, '#FFFFFF'); };
const ICON_LOCK = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y - r * .25, r * .5, Math.PI, 0); ctx.strokeStyle = C.ink; ctx.lineWidth = r * .28; ctx.stroke(); fillRR(ctx, x - r * .75, y - r * .3, r * 1.5, r * 1.2, r * .25, C.ochre, C.ink, 3); circle(ctx, x, y + r * .25, r * .17, C.ink); };
// crack polyline (deterministic) from (x,y) heading `ang`
const _cracks = new Map();
function pla_crackPts(seed, x, y, len, ang) {
  const key = seed + '|' + x + '|' + y + '|' + len; if (_cracks.has(key)) return _cracks.get(key);
  const r = rng(seed), pts = [[x, y]], br = []; let a = ang, px = x, py = y; const n = 10;
  for (let i = 1; i <= n; i++) { a += (r() - .5) * .9; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; pts.push([px, py]); if (r() < .35 && i < n - 2) br.push({ i, a: a + (r() < .5 ? 1 : -1) * (.6 + r() * .6), l: len * (.18 + r() * .2) }); }
  const out = { pts, br }; _cracks.set(key, out); return out;
}
function pla_crack(ctx, c, k, color = C.ink, lw = 4) {
  if (k <= 0) return; const n = c.pts.length - 1, m = n * k;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i <= Math.floor(m); i++) i ? ctx.lineTo(...c.pts[i]) : ctx.moveTo(...c.pts[i]);
  if (m < n) { const i = Math.floor(m), f = m - i; ctx.lineTo(lerp(c.pts[i][0], c.pts[i + 1][0], f), lerp(c.pts[i][1], c.pts[i + 1][1], f)); }
  for (const b of c.br) { if (b.i > m) continue; const p = c.pts[b.i], kk = clamp((m - b.i) / 3); ctx.moveTo(...p); ctx.lineTo(p[0] + Math.cos(b.a) * b.l * kk, p[1] + Math.sin(b.a) * b.l * kk); }
  ctx.stroke(); ctx.restore();
}
function pla_bigCrack(ctx, c, k, lw = 5) { pla_crack(ctx, c, k, 'rgba(255,255,255,.75)', lw + 5); pla_crack(ctx, c, k, C.ink, lw); }
function pla_flake(ctx, x, y, r, rot = 0, color = '#FFFFFF', lw = 3) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6, c = Math.cos(a), s = Math.sin(a); ctx.moveTo(0, 0); ctx.lineTo(c * r, s * r);
    const bx = c * r * .55, by = s * r * .55, l = r * .3; ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + .8) * l, by + Math.sin(a + .8) * l); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - .8) * l, by + Math.sin(a - .8) * l); }
  ctx.stroke(); ctx.restore();
}
function pla_salt(ctx, x, y, s, k, seed) {     // cluster of small cubic salt crystals
  if (k <= 0) return; const r = rng(seed);
  for (let i = 0; i < 8; i++) {
    const kk = clamp(k * 1.7 - i * .1); if (kk <= 0) continue;
    const cx = x + (r() - .5) * s * 1.2, cy = y + (r() - .5) * s * 1.6, sz = s * (.22 + r() * .22) * kk, rot = (r() - .5) * .8;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    fillRR(ctx, -sz, -sz, sz * 2, sz * 2, sz * .3, '#FFFFFF', '#7F8C96', 2);
    line(ctx, -sz * .5, -sz * .45, sz * .3, -sz * .45, 'rgba(150,185,210,.9)', 2);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ cached static layers
function pla_soilTex() {
  return cached('pla|soil|v1', 1920, 240, g => {
    g.fillStyle = '#8A6A4C'; g.fillRect(0, 0, 1920, 240);
    const r = rng(77);
    for (let i = 0; i < 260; i++) { const x = r() * 1920, y = r() * 240, s = 3 + r() * 9; ellipse(g, x, y, s, s * .7, r() < .5 ? '#7A5C40' : '#9C7C5C', 'rgba(60,40,25,.35)', 1.5, r() * 3); }
    for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(40,25,15,.18)'; g.fillRect(r() * 1920, r() * 240, 2, 2); }
  });
}
function pla_room() {          // interior: wallpaper, floor, frame, side table + kettle
  return cached('pla|room|v5', 600, 880, g => {
    g.fillStyle = '#F2DDBA'; g.fillRect(0, 0, 600, 860);
    g.fillStyle = 'rgba(176,127,37,.09)'; for (let x = 10; x < 600; x += 44) g.fillRect(x, 0, 18, 860);
    g.fillStyle = 'rgba(200,100,59,.12)';
    for (let y = 30; y < 840; y += 60) for (let x = 19 + ((y / 60) % 2) * 22; x < 600; x += 44) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
    fillRR(g, 0, 834, 600, 26, 0, '#B98454', null); line(g, 0, 834, 600, 834, C.ink, 3);
    fillRR(g, 0, 860, 600, 20, 0, C.wood, null); for (let x = 30; x < 600; x += 80) line(g, x, 862, x, 878, C.woodDark, 2); line(g, 0, 860, 600, 860, C.ink, 4); line(g, 0, 880, 600, 880, C.ink, 3);
    fillRR(g, 446, 286, 96, 76, 4, 'rgba(0,0,0,.12)'); fillRR(g, 440, 280, 96, 76, 4, C.ochre, C.ink, 4); fillRR(g, 449, 289, 78, 58, 2, '#BFDDEE', C.ink, 2);
    poly(g, [[452, 344], [474, 312], [492, 330], [506, 318], [524, 344]], '#7E9C6A'); circle(g, 506, 302, 6, '#F6C84C');
    g.translate(16, 0);
    fillRR(g, 430, 800, 132, 16, 5, C.wood, C.ink, 4); line(g, 446, 816, 446, 858, C.ink, 7); line(g, 546, 816, 546, 858, C.ink, 7);
    line(g, 446, 816, 446, 858, C.woodDark, 3); line(g, 546, 816, 546, 858, C.woodDark, 3);
    poly(g, [[518, 768], [544, 746], [550, 750], [530, 778]], '#C8643B', C.ink, 3);
    ellipse(g, 486, 778, 40, 24, '#C8643B', C.ink, 4);
    fillRR(g, 448, 778, 76, 22, [0, 0, 10, 10], '#C8643B', C.ink, 4);
    ellipse(g, 486, 756, 22, 7, '#B0522E', C.ink, 3); circle(g, 486, 747, 6, C.ink);
    g.beginPath(); g.arc(486, 768, 30, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
    line(g, 466, 772, 474, 788, 'rgba(255,255,255,.6)', 4);
  });
}
function pla_wallTex() {       // dense rubble stone + inner plaster + old lime render with pores (2× res for the zooms)
  const w = P.fx - P.in0, h = 1080 - P.top + 30;
  return cached('pla|wall|v4', 2 * w, 2 * h, g => {
    g.scale(2, 2);
    const sw = P.rd0 - P.st0, x0 = P.st0 - P.in0;
    g.fillStyle = '#DED1B8'; g.fillRect(x0, 0, sw, h);
    const clear = 'rgba(0,0,0,0)';
    g.drawImage(stoneTexture(2 * sw + 120, 2 * h + 120, 57, { size: 128, mortar: clear }), x0 - 34, -30, sw + 60, h + 60);
    g.drawImage(stoneTexture(2 * sw, 2 * h, 31, { size: 128, mortar: clear }), x0, 0, sw, h);
    g.fillStyle = '#F3EEE3'; g.fillRect(0, 0, x0, h);
    g.drawImage(limeTexture(2 * (P.fx - P.rd0), 2 * h, '#EDE3CC', 7), P.rd0 - P.in0, 0, P.fx - P.rd0, h);
    const r = rng(4);
    for (let i = 0; i < 300; i++) { const x = P.rd0 - P.in0 + 3 + r() * (P.fx - P.rd0 - 6), y = r() * h, s = 1 + r() * 2.4; ellipse(g, x, y, s, s * .8, 'rgba(120,100,70,.5)'); }
    g.strokeStyle = 'rgba(60,50,40,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(P.rd0 - P.in0, 0); g.lineTo(P.rd0 - P.in0, h); g.moveTo(x0, 0); g.lineTo(x0, h); g.stroke();
  });
}

// ------------------------------------------------------------------ the coating profile
function pla_bump(y, list, amp) { let b = 0; list.forEach((bl, i) => { const u = (y - bl.y) / bl.h; if (Math.abs(u) < 1) b += amp[i] * Math.pow(1 - u * u, .75); }); return b; }
function pla_coatPath(ctx, y0, y1, bul, off) {
  ctx.beginPath(); const st = 3;
  for (let y = y0; y <= y1 + .01; y += st) { const yy = Math.min(y, y1), x = P.fx + bul(yy) + off; y === y0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
}
function pla_coatSeg(ctx, y0, y1, bul, rpe, glint) {
  if (y1 - y0 < 1) return;
  const th = P.film + (rpe ? P.rpe : 0);
  ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  pla_coatPath(ctx, y0, y1, bul, th / 2); ctx.strokeStyle = C.ink; ctx.lineWidth = th + 7; ctx.stroke();
  if (rpe) {
    ctx.strokeStyle = RPE_C; ctx.lineWidth = th; ctx.stroke();
    pla_coatPath(ctx, y0, y1, bul, P.film + P.rpe * .55); ctx.setLineDash([3, 8]); ctx.strokeStyle = 'rgba(175,140,80,.7)'; ctx.lineWidth = 5; ctx.stroke(); ctx.setLineDash([]);
  }
  pla_coatPath(ctx, y0, y1, bul, P.film / 2); ctx.strokeStyle = FILM_C; ctx.lineWidth = P.film; ctx.stroke();
  pla_coatPath(ctx, y0, y1, bul, P.film * .4); ctx.strokeStyle = FILM_L; ctx.lineWidth = 4; ctx.stroke();
  if (rpe) { pla_coatPath(ctx, y0, y1, bul, P.film); ctx.strokeStyle = 'rgba(43,38,35,.55)'; ctx.lineWidth = 2; ctx.stroke(); }
  pla_coatPath(ctx, y0, y1, bul, th - 3.5); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.stroke();
  if (glint && glint.k > 0) {           // a shiny highlight travelling along the plastic
    for (const gy of glint.ys) { const a = Math.max(y0, gy - 50), b = Math.min(y1, gy + 50); if (b <= a) continue; pla_coatPath(ctx, a, b, bul, th - 4); ctx.strokeStyle = `rgba(255,255,255,${glint.k})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); }
  }
  ctx.restore();
}
// a band along an arbitrary polyline (used for the peeling plaque); normal = left of the direction of travel
function pla_bandAlong(ctx, pts, layers) {
  const N = pts.length, nrm = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  for (const [off, lw, col] of layers) {
    ctx.beginPath(); pts.forEach((p, i) => { const x = p[0] + nrm[i][0] * off, y = p[1] + nrm[i][1] * off; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ props
function pla_can(ctx, x, y, k, name, col, t, i) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 4); const sc = easeOutBack(k) * 1.2; ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  ellipse(ctx, 6, 74, 60, 12, 'rgba(0,0,0,.15)');
  if (name === 'RPE') {
    poly(ctx, [[-58, -46], [58, -46], [48, 66], [-48, 66]], '#F1E7C8', C.ink, 5);
    ellipse(ctx, 0, -46, 58, 13, '#E2D6B0', C.ink, 4);
    ctx.beginPath(); ctx.arc(0, -40, 50, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    fillRR(ctx, -40, -10, 80, 44, 8, col, C.ink, 3);
    text(ctx, 'RPE', 0, 13, { size: 30, font: FONT.title, weight: 700, color: '#FFFFFF' });
  } else {
    fillRR(ctx, -50, -50, 100, 120, 10, '#C9D3DA', C.ink, 5);
    fillRR(ctx, -50, -20, 100, 64, 0, col, null); line(ctx, -50, -20, 50, -20, C.ink, 3); line(ctx, -50, 44, 50, 44, C.ink, 3);
    ellipse(ctx, 0, -50, 50, 12, '#E3E8EC', C.ink, 4);
    line(ctx, -36, -8, -36, 34, 'rgba(255,255,255,.5)', 8);
    ctx.beginPath(); ctx.moveTo(-30, -20); ctx.quadraticCurveTo(-26, 6, -22, -20); ctx.fillStyle = col; ctx.fill();
    circle(ctx, 0, 12, 16, 'rgba(255,255,255,.85)'); text(ctx, '70', 0, 14, { size: 20, font: FONT.title, weight: 700, color: col });
  }
  ctx.restore();
  text(ctx, name, x, y + 124, { size: 38, font: FONT.title, weight: 600, alpha: clamp(k * 2), color: C.ink, stroke: 'rgba(255,255,255,.85)', sw: 8 });
}
function pla_badge70(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.08 + Math.sin(t * 1.5) * .03); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  const cols = ['#C8643B', '#D9A441', '#7E9C6A', '#5F8FA8'];
  fillRR(ctx, -172 + 8, -58 + 9, 344, 116, 58, 'rgba(0,0,0,.16)');
  ctx.save(); rr(ctx, -172, -58, 344, 116, 58); ctx.clip();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(-172, -58 + i * 29, 344, 30); }
  ctx.restore();
  rr(ctx, -172, -58, 344, 116, 58); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  text(ctx, 'années 70', 0, 4, { size: 64, font: FONT.title, weight: 700, color: '#FFF6E0', stroke: C.ink, sw: 10 });
  text(ctx, 'années 70', 0, 4, { size: 64, font: FONT.title, weight: 700, color: '#FFF6E0' });
  ctx.restore();
}
function pla_roller(ctx, x, y, k, col) {         // paint roller seen from the side, touching the façade at x
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3); ctx.translate(lerp(160, 0, easeOut(k)), 0);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x + 22, y); ctx.lineTo(x + 62, y); ctx.lineTo(x + 96, y + 70); ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = '#9AA5AD'; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); ctx.translate(x + 96, y + 70); ctx.rotate(-.5); fillRR(ctx, -11, 0, 22, 160, 10, C.wood, C.ink, 4); ctx.restore();
  fillRR(ctx, x, y - 66, 42, 132, 13, col, C.ink, 5);
  for (let i = 0; i < 5; i++) line(ctx, x + 9, y - 50 + i * 25, x + 33, y - 42 + i * 25, 'rgba(255,255,255,.5)', 3);
  ctx.restore();
}
function pla_float(ctx, x, y, k, col) {          // taloche pressing on the face
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3); ctx.translate(lerp(160, 0, easeOut(k)), 0);
  fillRR(ctx, x, y - 74, 15, 148, 4, '#C9CED2', C.ink, 4);
  fillRR(ctx, x + 15, y - 16, 34, 32, 6, C.wood, C.ink, 4);
  fillRR(ctx, x + 47, y - 13, 76, 26, 11, C.wood, C.ink, 4);
  if (col) { ctx.fillStyle = col; ctx.fillRect(x - 5, y - 70, 7, 140); }
  ctx.restore();
}
function pla_gauge(ctx, x, y, r, v, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  circle(ctx, 7, 9, r + 10, 'rgba(0,0,0,.16)'); circle(ctx, 0, 0, r + 10, '#FFFFFF', C.ink, 6);
  const a0 = Math.PI * .8, a1 = Math.PI * 2.2;
  [[0, .5, C.good], [.5, .75, C.warn], [.75, 1, C.danger]].forEach(([u0, u1, c]) => { ctx.beginPath(); ctx.arc(0, 0, r - 12, lerp(a0, a1, u0), lerp(a0, a1, u1)); ctx.strokeStyle = c; ctx.lineWidth = 18; ctx.stroke(); });
  for (let i = 0; i <= 8; i++) { const a = lerp(a0, a1, i / 8); line(ctx, Math.cos(a) * (r - 30), Math.sin(a) * (r - 30), Math.cos(a) * (r - 22), Math.sin(a) * (r - 22), C.ink, 3); }
  const shake = v > .75 ? Math.sin(t * 40) * .05 : 0, a = lerp(a0, a1, clamp(v)) + shake;
  ctx.beginPath(); ctx.moveTo(Math.cos(a + 1.57) * 8, Math.sin(a + 1.57) * 8); ctx.lineTo(Math.cos(a) * (r - 18), Math.sin(a) * (r - 18)); ctx.lineTo(Math.cos(a - 1.57) * 8, Math.sin(a - 1.57) * 8); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
  circle(ctx, 0, 0, 11, C.ink); circle(ctx, 0, 0, 4, '#FFFFFF');
  text(ctx, 'pression', 0, r * .55, { size: 30, font: FONT.title, weight: 600 });
  ctx.restore();
}
function pla_thermo(ctx, x, y, k, v) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  fillRR(ctx, -20 + 6, -150 + 8, 40, 190, 20, 'rgba(0,0,0,.15)');
  fillRR(ctx, -20, -150, 40, 190, 20, '#FFFFFF', C.ink, 5); circle(ctx, 0, 52, 32, '#5FA8D8', C.ink, 5);
  const top = lerp(-110, 0, v); fillRR(ctx, -9, top, 18, 50 - top, 9, '#5FA8D8');
  for (let i = 0; i < 5; i++) line(ctx, 10, -120 + i * 28, 20, -120 + i * 28, C.ink, 3);
  text(ctx, '−5 °C', 0, 124, { size: 46, font: FONT.title, weight: 700, color: '#2A6FB0', stroke: '#FFFFFF', sw: 8 });
  ctx.restore();
}
// scraper (grattoir) in the frame of Margot's hand: handle along +y, blade edge at +y = 200
function pla_scraperInHand(ctx, hx, hy, a, s, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a); const sc = s * easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  fillRR(ctx, -9, -22, 18, 132, 8, '#C8643B', C.ink, 4);
  line(ctx, -3, -10, -3, 96, 'rgba(255,255,255,.35)', 4);
  fillRR(ctx, -11, 106, 22, 26, 4, '#8E9499', C.ink, 4);
  poly(ctx, [[-16, 130], [16, 130], [40, 200], [-40, 200]], '#D3DADF', C.ink, 4);
  line(ctx, -26, 190, 26, 190, 'rgba(255,255,255,.85)', 4);
  ctx.restore();
  circle(ctx, hx, hy, 23 * s, '#F3C9A2', C.ink, 5 * s);          // the hand, over the handle
}
// Margot's viewer-left hand position (same maths as presenter())
function pla_handL(x, y, s, pose, T, bounce = 0) {
  const talk = talkAt(T), breathe = Math.sin(T * 2.1) * 3, sway = Math.sin(T * .9) * .015 + talk * Math.sin(T * 7) * .01;
  const hop = -Math.abs(Math.sin(bounce * Math.PI)) * 40, [u, b] = pose.L, sy = -362 - pose.sh + 22, sx = -82;
  const wig = talk * 6 * Math.sin(T * 6 - 1), ua = (u + wig) * Math.PI / 180, fa = (u + b + wig * 1.6) * Math.PI / 180;
  const ex = sx - Math.sin(ua) * 100, ey = sy + Math.cos(ua) * 100, hx = ex - Math.sin(fa) * 96, hy = ey + Math.cos(fa) * 96 + breathe * .4;
  const c = Math.cos(sway), sn = Math.sin(sway);
  return { x: x + s * (hx * c - hy * sn), y: y + s * (hop + hx * sn + hy * c), a: fa + sway };
}

// ------------------------------------------------------------------ camera for set A
function pla_cam(S, A) {
  const t = S.t, K = [
    [0, 1, 960, 540, 960, 540],
    [S.cue(2) - .25, 1, 960, 540, 960, 540],
    [S.cue(2) + .75, 2.05, 1014, 380, 930, 480],
    [S.cue(3) - .4, 2.07, 1014, 382, 930, 480],
    [S.cue(3) + .5, 1, 960, 540, 960, 540],
    [S.cue(4) - .1, 1, 960, 540, 960, 540],
    [S.cue(4) + .7, 1.16, 1000, 520, 1000, 520],
    [S.cue(5) - .35, 1.17, 1000, 520, 1000, 520],
    [S.cue(5) + .6, 1.42, 1004, 450, 900, 450],
    [S.cue(7) - .35, 1.43, 1004, 450, 900, 450],
    [S.cue(7) + .65, 1.22, 980, 500, 880, 480],
    [1e9, 1.23, 980, 500, 880, 480],
  ];
  let i = 0; while (i < K.length - 2 && t >= K[i + 1][0]) i++;
  const a = K[i], b = K[i + 1], k = ease(inv(a[0], b[0], t)), L = j => lerp(a[j], b[j], k);
  const z = L(1) * (1.006 + .006 * Math.sin(t * .35));
  return { z, fx: L(2), fy: L(3), sx: L(4), sy: L(5), X: x => L(4) + (x - L(2)) * z, Y: y => L(5) + (y - L(3)) * z };
}

// ------------------------------------------------------------------ SET A: the wall section
function pla_setA(ctx, S, A) {
  const t = S.t, cam = pla_cam(S, A);
  const T = {
    badge: A(0, .13), paint0: A(0, .24), paint1: A(0, .48), cans: [A(0, .494), A(0, .572), A(0, .658), A(0, .739)],
    rpe0: A(0, .8), rpe1: A(0, .975), cansOut: S.cue(1) - .3,
    cem0: S.cue(1) + .2, cem1: A(1, .45), dur: A(1, .5), perm: A(1, .7),
    film: A(2, .15), skin: A(2, .52),
    rain: S.cue(3), sol: A(3, .39), vap: A(3, .5), back: A(3, .665),
    block: S.cue(4), stop: A(4, .45),
    acc: S.cue(5), press: A(5, .337), swell: A(5, .527), cloque: A(5, .689), peel: A(5, .837),
    salt: S.cue(6), migr: A(6, .23), cryst: A(6, .42), salpe: A(6, .8),
    winter: S.cue(7) - .3, gel: A(7, .2), vol: A(7, .28), burst: A(7, .47), gelif: A(7, .83),
  };
  const wk = appear(t, T.winter, 1.2, smooth);
  const yPaint = lerp(P.top, P.ply, smooth(inv(T.paint0, T.paint1, t)));
  const yRpe = lerp(P.top, P.ply, smooth(inv(T.rpe0, T.rpe1, t)));
  const yCem = lerp(P.gy + 24, P.ply, smooth(inv(T.cem0, T.cem1, t)));
  const peelK = inv(T.peel, T.peel + 1.7, t), peeled = peelK > .12;
  const swell = PLA_BL.map(bl => easeOut(inv(T.swell + bl.d * .9, T.cloque + .5 + bl.d * .4, t)));
  const iceGrow = 1 + .16 * appear(t, T.vol, .9);
  const amp = PLA_BL.map((bl, i) => bl.a * swell[i] * iceGrow * (i === 1 && peeled ? 0 : 1));
  const kc = inv(T.cryst, T.salpe + .6, t);
  const sAmp = PLA_SB.map((sb, i) => sb.a * clamp(kc * 1.4 - i * .1));
  const bul = y => pla_bump(y, PLA_BL, amp) + pla_bump(y, PLA_SB, sAmp);
  const acc = smooth(inv(T.acc - .3, T.press + 2.5, t));
  const ice = smooth(inv(T.gel, T.gel + .9, t));
  const damp = .65 * smooth(inv(T.sol - .3, T.sol + 3.5, t)) + .35 * smooth(inv(T.acc, T.acc + 5, t));

  ctx.save(); ctx.translate(cam.sx, cam.sy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy);
  // ---- exterior sky & ground
  const skyTop = mixColor(C.skyTop, '#8EA5BB', wk), skyBot = mixColor('#EAF4F8', '#E6EDF2', wk);
  const sg = ctx.createLinearGradient(0, 0, 0, P.gy); sg.addColorStop(0, skyTop); sg.addColorStop(1, skyBot);
  ctx.fillStyle = sg; ctx.fillRect(P.in0 - 10, -300, 1600, P.gy + 300);
  for (let i = 0; i < 4; i++) { const x = 1120 + ((i * 330 + t * (10 + i * 3)) % 1000), y = 150 + i * 120 + (i % 2) * 30; cloud(ctx, x, y, 42 + i * 8, mixColor('#FFFFFF', '#E9EEF3', wk), .9); }
  ctx.drawImage(pla_soilTex(), 0, P.gy + 18);
  ctx.fillStyle = mixColor(C.grass, '#F4F8FB', wk); ctx.fillRect(P.fx, P.gy, 1000, 22);
  ctx.fillStyle = mixColor(C.grassDark, '#D5E3EC', wk); ctx.fillRect(P.fx, P.gy + 16, 1000, 6);
  for (let i = 0; i < 26; i++) { const x = P.fx + 50 + hash(i * 3.3) * 900; line(ctx, x, P.gy + 4, x - 6, P.gy - 14, mixColor(C.grassDark, '#FFFFFF', wk), 4); line(ctx, x + 6, P.gy + 4, x + 10, P.gy - 12, mixColor(C.grassDark, '#FFFFFF', wk), 4); }
  if (wk > 0) { ctx.save(); ctx.globalAlpha = wk; for (let i = 0; i < 18; i++) ellipse(ctx, P.fx + 70 + i * 52, P.gy - 2, 34, 12, '#FFFFFF'); ctx.restore(); }
  if (damp > 0) { const g = ctx.createRadialGradient(800, 1010, 20, 800, 1010, 420); g.addColorStop(0, rgba('#2F6FA8', .55 * damp)); g.addColorStop(1, rgba('#2F6FA8', 0)); ctx.fillStyle = g; ctx.fillRect(300, P.gy + 20, 1000, 260); }
  // ---- interior
  ctx.drawImage(pla_room(), 0, 0);
  const lg = ctx.createRadialGradient(330, 200, 10, 330, 200, 260); lg.addColorStop(0, 'rgba(255,214,120,.5)'); lg.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = lg; ctx.fillRect(60, 0, 540, 480);
  line(ctx, 330, -300, 330, 150, C.ink, 4); poly(ctx, [[288, 196], [372, 196], [356, 148], [304, 148]], '#7E9C6A', C.ink, 4); ellipse(ctx, 330, 200, 16, 8, '#FFE7A0', C.ink, 2);
  // ---- the wall (stone + render), with a section-cut top edge
  const cut = () => { ctx.beginPath(); ctx.moveTo(P.in0, 1100); ctx.lineTo(P.in0, P.top + 6); for (let i = 0; i <= 12; i++) ctx.lineTo(P.in0 + i * (P.fx - P.in0) / 12, P.top + (i % 2 ? -8 : 6)); ctx.lineTo(P.fx, 1100); };
  ctx.save(); cut(); ctx.closePath(); ctx.clip();
  ctx.drawImage(pla_wallTex(), P.in0, P.top - 10, P.fx - P.in0, 1080 - P.top + 30);
  if (damp > 0) {            // rising damp
    const yTop = lerp(P.gy + 60, 500, damp), g = ctx.createLinearGradient(0, yTop, 0, 1080);
    g.addColorStop(0, rgba(C.water, 0)); g.addColorStop(.3, rgba(C.water, .3 * damp)); g.addColorStop(1, rgba('#2A6FB0', .58 * damp));
    ctx.fillStyle = g; ctx.fillRect(P.in0, yTop, P.fx - P.in0, 1080 - yTop);
  }
  if (acc > 0) {             // trapped water soaking the outer part of the wall
    const g = ctx.createLinearGradient(P.fx - 200, 0, P.fx, 0), c = mixColor('#2A6FB0', '#BFE6F5', ice);
    g.addColorStop(0, rgba(c, 0)); g.addColorStop(.6, rgba(c, .3 * acc)); g.addColorStop(1, rgba(c, .62 * acc));
    ctx.fillStyle = g; ctx.fillRect(P.fx - 200, P.top, 200, P.gy + 40 - P.top);
  }
  ctx.restore();
  cut(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();

  // ---- moisture particles
  const parts = [], thin = (n, ts) => ts > T.acc + 1 && n % 2;     // fewer new particles once water is trapped
  // c2 close-up: vapour in the render pushes on the film and bounces back
  if (t > T.film - .7 && t < S.cue(3) + 1.4) for (let n = 0; n < 50; n++) {
    const ts = T.film - .7 + n * .13; if (ts > t) break; const a = t - ts;
    const y = 190 + hash(n * 3.7) * 400, x0 = 900 + hash(n * 1.9) * 60, xs = P.fx - 11, v = 75, ah = (xs - x0) / v;
    let x; if (a < ah) x = x0 + a * v; else { const a3 = a - ah; x = xs - 46 * Math.sin(Math.min(1, a3 / .55) * Math.PI) * Math.exp(-a3 * .8); if (a3 < .4) parts.push({ ring: true, x: xs + 4, y, k: a3 / .4 }); }
    const al = Math.min(1, a * 3) * (1 - smooth(inv(1.6, 2.3, a - ah))) * (1 - appear(t, S.cue(3) + .3, .6));
    parts.push({ x, y: y + Math.sin(a * 3 + n) * 4, r: 10, al, k: 'vap' });
  }
  // c3+: vapour from the house crosses the wall up to the face
  if (t > T.vap - .4) for (let n = 0; n < 160; n++) {
    const ts = T.vap - .4 + n * .21; if (ts > t) break; if (thin(n, ts)) continue; const a = t - ts;
    const kettle = n % 3 === 0, x0 = kettle ? 556 : 380 + hash(n * 1.7) * 190, y0 = kettle ? 742 : 240 + hash(n * 2.9) * 500;
    const ye = clamp(y0 + (hash(n * 5.1) - .5) * 160 - (kettle ? 140 : 0), P.top + 50, P.gy - 50), d1 = (P.in0 - x0) / 120;
    if (a < d1) { const k = a / d1; parts.push({ x: lerp(x0, P.in0, k), y: lerp(y0, ye, smooth(k)) + Math.sin(a * 3 + n) * 6, r: lerp(15, 10, k), al: Math.min(1, a * 3), k: 'vap' }); continue; }
    const a2 = a - d1, v = 100, xs = P.fx - 11, xw = P.in0 + a2 * v, yw = ye + Math.sin(a2 * 2.1 + n) * 9;
    if (xw < xs) { parts.push({ x: xw, y: yw, r: 9, al: 1, k: 'vap' }); continue; }
    const a3 = a2 - (xs - P.in0) / v; if (a3 > 2.6) continue;
    const bx = xs - 36 * Math.sin(Math.min(1, a3 / .45) * Math.PI) * Math.exp(-a3 * 1.1);
    if (a3 < .45) parts.push({ hitX: xs, y: yw, hk: a3 / .45 });
    parts.push({ x: bx, y: yw, r: 9, al: 1 - smooth(inv(1.4, 2.5, a3)), k: 'vap' });
  }
  // c3+: water rising from the ground (capillarity)
  if (t > T.sol - .4) for (let n = 0; n < 180; n++) {
    const ts = T.sol - .4 + n * .17; if (ts > t) break; if (thin(n, ts)) continue; const a = t - ts; if (a > 7) continue;
    const x0 = 640 + hash(n * 4.4) * 350, ytop = 470 + hash(n * 2.2) * 260;
    const y = lerp(1080, ytop, 1 - Math.exp(-a / 1.7)), toFace = x0 > 850 ? smooth(inv(1, 4, a)) : 0;
    const xs = P.fx - 11, x = lerp(x0, xs, toFace) + Math.sin(a * 2 + n) * 4;
    if (toFace >= .999 && a < 4.45) parts.push({ hitX: xs, y, hk: (a - 4) / .45 });
    parts.push({ x, y, r: 7, al: Math.min(1, a * 2) * (1 - smooth(inv(5.5, 7, a))), k: 'drop' });
  }
  ctx.save(); ctx.beginPath(); ctx.rect(P.in0 - 400, P.top, P.fx - P.in0 + 400, 1100); ctx.clip();
  for (const p of parts) {
    if (p.hitX != null) continue;
    if (p.ring) { circle(ctx, p.x, p.y, 8 + p.k * 16, null, rgba('#FFFFFF', 1 - p.k), 4); continue; }
    if (p.k === 'vap') pla_vap(ctx, p.x, p.y, p.r, p.al * (1 - ice));
    else pla_drop(ctx, p.x, p.y + 4, p.r, p.al * (1 - ice));
  }
  ctx.restore();
  const kX = windowed(t, T.block - .1, T.acc + 1.2, .3);        // red crosses where moisture hits the film from behind
  if (kX > 0) for (const p of parts) if (p.hitX != null && p.hk >= 0 && p.hk <= 1) { ctx.save(); ctx.globalAlpha = kX * Math.sin(p.hk * Math.PI); cross(ctx, p.hitX - 20, p.y, 26, C.danger); ctx.restore(); }

  // c4: big U-turn arrows — moisture reaches the film from behind and is sent back
  const kU = windowed(t, T.block + .1, T.acc + .7, .3);
  if (kU > 0) [[300, 0], [500, .18], [660, .36]].forEach(([y, d]) => {
    const k = easeOut(inv(T.block + .1 + d, T.block + .9 + d, t)); if (k <= 0) return;
    const x0 = 820, x1 = P.fx - 34, r = 26, segs = 28, pts = [];
    for (let i = 0; i <= segs; i++) { const u = i / segs; let p;
      if (u < .5) p = [lerp(x0, x1, u / .5), y]; else if (u < .7) { const a = -Math.PI / 2 + (u - .5) / .2 * Math.PI; p = [x1 + Math.cos(a) * r, y + r + Math.sin(a) * r]; } else p = [lerp(x1, x0 + 30, (u - .7) / .3), y + 2 * r]; pts.push(p); }
    const n = Math.max(2, Math.round(segs * k)), pe = pts[n - 1], pb = pts[n - 2], a = Math.atan2(pe[1] - pb[1], pe[0] - pb[0]);
    ctx.save(); ctx.globalAlpha *= kU; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); pts.slice(0, n).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 15; ctx.stroke(); ctx.strokeStyle = C.danger; ctx.lineWidth = 8; ctx.stroke();
    poly(ctx, [[pe[0] + Math.cos(a) * 12, pe[1] + Math.sin(a) * 12], [pe[0] + Math.cos(a + 2.4) * 22, pe[1] + Math.sin(a + 2.4) * 22], [pe[0] + Math.cos(a - 2.4) * 22, pe[1] + Math.sin(a - 2.4) * 22]], C.danger, '#FFFFFF', 3);
    ctx.restore();
  });
  // ---- liquid trapped under the film (pooling layer + blisters)
  if (acc > 0 || amp.some(a => a > 0)) {
    const wcol = mixColor('#3E9BDA', '#D6F0FA', ice), wcol2 = mixColor('#2A6FB0', '#A9DDF0', ice);
    ctx.beginPath(); ctx.moveTo(P.fx - 7 * acc, P.top + 4);
    for (let y = P.top + 4; y <= P.ply; y += 3) ctx.lineTo(P.fx + pla_bump(y, PLA_BL, amp), y);
    ctx.lineTo(P.fx - 7 * acc, P.ply); ctx.closePath();
    const g = ctx.createLinearGradient(P.fx, 0, P.fx + 60, 0); g.addColorStop(0, wcol2); g.addColorStop(1, wcol); ctx.fillStyle = g; ctx.fill();
    PLA_BL.forEach((bl, i) => {
      if (amp[i] < 4) return;
      if (ice < .5) ellipse(ctx, P.fx + amp[i] * .5, bl.y - bl.h * .38, amp[i] * .13, bl.h * .15, 'rgba(255,255,255,.75)', null, 0, -.3);
      if (ice > 0) { ctx.save(); ctx.globalAlpha = ice; for (let j = 0; j < 3; j++) pla_flake(ctx, P.fx + amp[i] * (.22 + j * .18), bl.y + (j - 1) * bl.h * .36, Math.min(amp[i] * .3, 14), j + t * .2, '#FFFFFF', 2.5); ctx.restore(); }
    });
  }
  if (peeled) {               // exposed wet render where the plaque came off
    const g = ctx.createLinearGradient(P.fx - 34, 0, P.fx, 0); g.addColorStop(0, 'rgba(42,111,176,0)'); g.addColorStop(1, rgba('#2A6FB0', .55 * (1 - ice * .4)));
    ctx.fillStyle = g; ctx.fillRect(P.fx - 34, PEEL.y0, 34, PEEL.y1 - PEEL.y0);
    line(ctx, P.fx, PEEL.y0, P.fx, PEEL.y1, 'rgba(43,38,35,.6)', 2);
  }
  // ---- salts migrate & crystallise under the coating
  const kSalt = appear(t, T.salt, .6);
  if (kSalt > 0) {
    for (let n = 0; n < 34; n++) {
      const sy = 170 + hash(n * 6.1) * 660, sx0 = 650 + hash(n * 2.3) * 270, mk = smooth(inv(T.migr + hash(n) * .8, T.cryst + 1.4 + hash(n * 3) * .6, t));
      const x = lerp(sx0, P.fx - 14, mk), y = sy + Math.sin(t * 2 + n) * 4, a = kSalt * (1 - smooth(inv(.85, 1, mk))) * (1 - ice * .6);
      if (a > 0.01) { ctx.save(); ctx.globalAlpha = a; fillRR(ctx, x - 6, y - 6, 12, 12, 3, '#FFFFFF', '#6F7D88', 2.5); ctx.restore(); }
    }
    const sites = [[158, 18], [212, 16], [340, 22], [400, 18], [440, 20], [470, 18], [508, 16], [600, 18], [650, 22], [720, 20], [790, 22], [845, 18]];
    sites.forEach(([y, s], i) => {
      const onPeel = peeled && y > PEEL.y0 && y < PEEL.y1;
      pla_salt(ctx, P.fx - 8 + (onPeel ? 16 : 0) + (y < P.ply && !onPeel ? pla_bump(y, PLA_SB, sAmp) * .5 : 0), y, s * (onPeel ? 1.4 : 1), clamp(kc * 1.5 - i * .04), 300 + i);
    });
  }
  // ---- frost: cracks through stone & old render, ice crystals in the wet zone
  const kCr = inv(T.burst, T.burst + 1.8, t);
  const cracks = [[986, 240, 230, Math.PI * 1.02, 1], [1000, 400, 270, Math.PI * .97, 2], [992, 620, 210, Math.PI * 1.05, 3], [1010, 724, 250, Math.PI * .95, 4], [1006, 820, 160, Math.PI * 1.1, 5], [962, 330, 170, Math.PI * .75, 6]];
  if (kCr > 0) cracks.forEach(([x, y, l, a, s], i) => pla_bigCrack(ctx, pla_crackPts(s * 17, x, y, l, a), clamp(kCr * 1.4 - i * .07), 4.5));
  if (ice > 0) { ctx.save(); ctx.globalAlpha = ice; for (let i = 0; i < 16; i++) { const y = 170 + hash(i * 9.1) * 660, x = P.fx - 22 - hash(i * 3.3) * 110, r = (8 + hash(i) * 10) * (1 + .2 * appear(t, T.vol, .9)); pla_flake(ctx, x, y, r, i + t * .15, '#FFFFFF', 3.5); pla_flake(ctx, x, y, r * .45, i, '#7CC3E6', 2); } ctx.restore(); }

  // ---- the coating: plastic film (+RPE) with blisters, and the cement plinth
  const glint = { k: windowed(t, T.film - .2, S.cue(3) - .2, .4) * .95, ys: [P.top + ((t - T.film) * 230 % 560), P.top + ((t - T.film) * 230 + 280) % 560] };
  if (yPaint > P.top + 1) {
    const segs = peeled ? [[P.top, Math.min(yPaint, PEEL.y0)], [PEEL.y1, yPaint]] : [[P.top, yPaint]];
    for (const [y0, y1] of segs) {
      if (y1 <= y0) continue;
      const yr = clamp(yRpe, y0, y1);
      pla_coatSeg(ctx, y0, yr, bul, true, glint);
      pla_coatSeg(ctx, yr, y1, bul, false, glint);
    }
  }
  // the peeling plaque: its top edge lifts and curls outward, then it breaks off and falls
  if (peelK > 0) {
    const k1 = clamp(peelK / .38), k2 = clamp((peelK - .38) / .62), L = PEEL.y1 - PEEL.y0, n = 24, m = smooth(clamp(k1 * 2.2)), kap = 1.5 * smooth(k1) / L;
    const ampP = PLA_BL.map((bl, i) => bl.a * swell[i] * iceGrow);
    let cx = 0, cy = 0; const pts = [];
    for (let j = 0; j <= n; j++) {
      const s = j / n * L, y = PEEL.y1 - s, q0 = [P.fx + pla_bump(y, PLA_BL, ampP), y];
      if (j) { const th = -Math.PI / 2 + kap * (s - L / n / 2); cx += Math.cos(th) * L / n; cy += Math.sin(th) * L / n; }
      pts.push([lerp(q0[0], P.fx + cx, m), lerp(q0[1], PEEL.y1 + cy, m)]);
    }
    const tau = k2 * .62 * 1.7, hinge = pts[0], fall = .5 * 1700 * tau * tau, floor = P.gy - 8 - hinge[1];
    const rot = k2 * 1.9, dx = 70 * tau, dy = Math.min(fall, floor + 40), alpha = 1 - smooth(clamp((fall - floor) / 60));
    if (alpha > 0) {
      ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(hinge[0] + dx, hinge[1] + dy); ctx.rotate(rot); ctx.translate(-hinge[0], -hinge[1]);
      const th = P.film + P.rpe;          // going up the plaque, +normal points to the outside (right)
      pla_bandAlong(ctx, pts, [[th / 2, th + 7, C.ink], [th / 2, th, RPE_C], [P.film / 2, P.film, FILM_C], [P.film * .4, 4, FILM_L]]);
      ctx.restore();
    }
    for (let q = 0; q < 10; q++) { const ts = T.peel + .2 + q * .13, a = t - ts; if (a < 0 || a > .9) continue; pla_drop(ctx, P.fx + 8 + hash(q) * 10, 470 + a * 80 + a * a * 700, 7, (1 - ice) * (1 - a / .9)); }
  }
  // cement plinth (grows upward while it is applied)
  if (yCem < P.gy + 23) {
    ctx.save(); ctx.beginPath(); ctx.rect(P.fx - 2, yCem, P.cem + 6, P.gy + 24 - yCem); ctx.clip();
    fillRR(ctx, P.fx, P.ply - 6, P.cem, P.gy + 30 - P.ply, [10, 0, 0, 0], C.cement, C.ink, 4);
    ctx.drawImage(cached('pla|cem|' + P.cem, P.cem, 300, g => { const r = rng(5); for (let i = 0; i < 240; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.22)'; g.fillRect(r() * P.cem, r() * 300, 2, 2); } }), P.fx, P.ply - 6);
    line(ctx, P.fx + P.cem - 5, P.ply + 12, P.fx + P.cem - 5, P.gy, 'rgba(255,255,255,.35)', 3);
    if (kCr > 0) pla_bigCrack(ctx, pla_crackPts(91, P.fx + P.cem, 700, 80, Math.PI * .85), clamp(kCr * 1.3 - .2), 3.5);
    ctx.restore();
  }
  if (kCr > 0) for (let n = 0; n < 14; n++) {         // fragments spalling off the face
    const ts = T.burst + .15 + n * .14, a = t - ts; if (a < 0 || a > 1.4) continue;
    const y0 = cracks[n % 5][1] + (hash(n * 3) - .5) * 40, x = P.fx + 30 + a * (130 + hash(n) * 120), y = y0 + a * a * 800 - a * 160, sz = 1 + hash(n * 7) * .9;
    ctx.save(); ctx.translate(x, Math.min(y, P.gy - 4)); ctx.rotate(a * 6 + n); ctx.scale(sz, sz); poly(ctx, [[-13, -9], [11, -12], [14, 7], [-9, 12]], n % 2 ? '#EDE3CC' : C.stone, C.ink, 2.5); ctx.restore();
  }

  // ---- outside: rain bounces off the film
  const kRain = windowed(t, T.rain - .3, T.block + 1.4, .5);
  if (kRain > 0) {
    const xs = P.fx + P.film + P.rpe + 3;
    for (let i = 0; i < 80; i++) {
      const per = .75, ph = hash(i * 1.37) * per, cyc = Math.floor((t + ph) / per), a = t + ph - cyc * per;
      const x0 = xs + 10 + Math.pow(hash(i * 7.1 + cyc * 3.9), 1.8) * 880, vx = -230, vy = 1050, y0 = -60;
      const ah = (x0 - xs) / -vx, yh = y0 + vy * ah, hitWall = yh < P.gy, aEnd = hitWall ? ah : (P.gy - y0) / vy;
      ctx.save(); ctx.globalAlpha = kRain;
      if (a < aEnd) { const x = x0 + vx * a, y = y0 + vy * a; line(ctx, x, y, x - vx * .035, y - vy * .035, rgba(C.water, .85), 4); }
      else if (a < aEnd + .35) {
        const b = a - aEnd, hx = hitWall ? xs : x0 + vx * aEnd, hy = hitWall ? yh : P.gy;
        if (hitWall) { ctx.beginPath(); ctx.arc(hx, hy, 8 + b * 60, -1.2, 1.2); ctx.strokeStyle = rgba('#FFFFFF', 1 - b / .35); ctx.lineWidth = 4; ctx.stroke(); }
        for (let j = 0; j < 4; j++) { const vx2 = hitWall ? 100 + j * 55 : (j - 1.5) * 60, vy2 = -150 - j * 45; circle(ctx, hx + vx2 * b, hy + vy2 * b + 900 * b * b, hitWall ? 6 : 4, rgba(C.water, .95 * (1 - b / .35)), hitWall ? rgba('#FFFFFF', .8 * (1 - b / .35)) : null, 1.5); }
      }
      ctx.restore();
    }
  }
  if (wk > 0) for (let i = 0; i < 70; i++) {           // snow
    const sp = 60 + hash(i) * 50, x = P.fx + 50 + hash(i * 3.1) * 950 + Math.sin(t * 1.2 + i) * 20, y = ((hash(i * 5.7) * 1000 + t * sp) % 1000) - 60;
    circle(ctx, x, y, 3 + hash(i * 2) * 4, rgba('#FFFFFF', .95 * wk), rgba('#9DB3C8', .6 * wk), 1.5);
  }
  // ---- tools
  const kRoll = windowed(t, T.paint0 - .3, T.paint1 + .5, .35);
  if (kRoll > 0) pla_roller(ctx, P.fx + P.film + 1, clamp(yPaint - 40 + Math.sin(t * 9) * 26, P.top + 66, P.ply - 50), kRoll, FILM_C);
  const kFl = windowed(t, T.rpe0 - .3, T.rpe1 + .45, .35);
  if (kFl > 0) pla_float(ctx, P.fx + P.film + P.rpe + 1, clamp(yRpe - 30 + Math.sin(t * 8) * 18, P.top + 74, P.ply - 74), kFl, RPE_C);
  const kTr = windowed(t, T.cem0 - .3, T.cem1 + .5, .35);
  if (kTr > 0) pla_float(ctx, P.fx + P.cem + 1, clamp(yCem + 30 + Math.sin(t * 8) * 16, P.ply + 74, P.gy - 40), kTr, C.cement);
  ctx.restore();   // camera

  // ================= screen-space overlays =================
  const X = cam.X, Y = cam.Y;
  const kOutCans = 1 - appear(t, T.cansOut, .5);
  pla_badge70(ctx, 1500, 180, appear(t, T.badge, .6) * (1 - appear(t, S.cue(2) - .5, .4)), t);
  pla_pill(ctx, 'peinture plastique', 1420, 340, windowed(t, T.paint0 + .4, T.cans[0] - .1, .35), { size: 44, tx: X(P.fx + P.film + 4), ty: Y(330) });
  [['Acrylique', '#5F8FA8'], ['Vinylique', '#7E9C6A'], ['Pliolite', '#D9A441'], ['RPE', '#C8643B']].forEach(([nm, c], i) => pla_can(ctx, 1230 + i * 194, 450, appear(t, T.cans[i], .5) * kOutCans, nm, c, t, i));
  const kCemL = windowed(t, T.cem0 + .1, S.cue(2) - .2, .4);
  if (kCemL > 0) {
    pla_pill(ctx, 'Enduit ciment', 1350, 560, kCemL, { size: 48, tx: X(P.fx + P.cem + 8), ty: Y(700) });
    text(ctx, 'dur', 1290, 670, { size: 56, font: FONT.hand, weight: 700, color: C.inkSoft, alpha: appear(t, T.dur, .4) * kCemL });
    text(ctx, 'peu perméable', 1470, 690, { size: 56, font: FONT.hand, weight: 700, color: C.inkSoft, alpha: appear(t, T.perm, .4) * kCemL });
    const ks = appear(t, T.cem0, .5) * kCemL;
    if (ks > 0) { ctx.save(); ctx.translate(1750, 800); ctx.scale(easeOutBack(ks), easeOutBack(ks)); ctx.globalAlpha *= clamp(ks * 3); poly(ctx, [[-72, -84], [72, -84], [84, 72], [-84, 72]], '#C9CDD0', C.ink, 5); line(ctx, -62, -84, -52, -100, C.ink, 5); line(ctx, 62, -84, 52, -100, C.ink, 5); text(ctx, 'CIMENT', 0, 4, { size: 34, font: FONT.title, weight: 700, color: C.cementDark }); ctx.restore(); }
  }
  const kFilm = windowed(t, T.film, S.cue(3) - .1, .35);
  if (kFilm > 0) {
    pla_pill(ctx, 'film fermé', X(P.fx) + 360, Y(250), kFilm, { size: 56, tx: X(P.fx + P.film + P.rpe + 4), ty: Y(300) });
    pla_pill(ctx, 'une peau fermée', X(P.fx) + 390, Y(560), windowed(t, T.skin, S.cue(3) - .1, .35), { size: 46, bg: '#FFFFFF', icon: ICON_LOCK });
  }
  const k3 = 1 - appear(t, S.cue(5) - .2, .4);
  pla_pill(ctx, 'la pluie ne rentre plus', X(1400), Y(190), appear(t, A(3, .1), .45) * k3 * (1 - appear(t, T.block + .8, .4)), { size: 42, icon: ICON_OK });
  const kSol = appear(t, T.sol, .45) * k3;
  if (kSol > 0) { arrow(ctx, X(700), Y(1000), X(700), Y(720), { color: '#2A6FB0', lw: 12, head: 30, k: kSol }); pla_pill(ctx, 'eau du sol', X(830), Y(790), kSol, { size: 42, bg: '#FFFFFF' }); }
  const kVap = appear(t, T.vap, .45) * k3;
  if (kVap > 0) { arrow(ctx, X(440), Y(450), X(700), Y(450), { color: '#5FA8DC', lw: 12, head: 30, k: kVap }); pla_pill(ctx, 'vapeur', X(440), Y(370), kVap, { size: 42, bg: '#FFFFFF' }); }
  const kBack = appear(t, T.back, .5) * k3;
  if (kBack > 0) text(ctx, 'par derrière !', X(800), Y(222), { size: 64, font: FONT.hand, weight: 700, color: '#2A6FB0', alpha: kBack, stroke: '#FFFFFF', sw: 8 });
  const kSt = appear(t, T.stop - .25, .4) * (1 - appear(t, S.cue(5) + .3, .4));
  if (kSt > 0) stamp(ctx, 'BLOQUÉE', X(P.fx) + 260, Y(440), { k: kSt, color: C.danger, size: 70 });
  pla_pill(ctx, 'eau piégée', X(P.fx) + 330, Y(700), windowed(t, T.acc + .4, T.swell + .2, .35), { size: 48, tx: X(P.fx - 12), ty: Y(690), bg: '#FFFFFF' });
  const vP = smooth(inv(T.press, T.peel - .1, t)) * (1 - .55 * smooth(inv(T.peel + .2, T.peel + 1.2, t)));
  pla_gauge(ctx, 1600, 290, 96, vP, appear(t, T.press, .5) * (1 - appear(t, S.cue(6) + .2, .4)), t);
  pla_pill(ctx, 'cloques', X(P.fx) + 330, Y(262), windowed(t, T.cloque - .1, S.cue(6) + .2, .35), { size: 50, tx: X(P.fx + amp[0] + P.film + P.rpe + 6), ty: Y(262), bg: '#FFFFFF' });
  pla_pill(ctx, 'ça se décolle !', X(P.fx) + 360, Y(560), windowed(t, T.peel + .25, S.cue(6) + .3, .35), { size: 46, bg: '#FFFFFF', color: C.danger });
  pla_pill(ctx, 'sels', X(760), Y(300), windowed(t, T.salt + .2, T.salpe + .2, .35), { size: 42, bg: '#FFFFFF' });
  pla_pill(ctx, 'Salpêtre', X(P.fx) + 340, Y(600), windowed(t, T.salpe, S.cue(7) + .1, .35), { size: 64, tx: X(P.fx + 6), ty: Y(650), bg: '#FFFFFF' });
  pla_thermo(ctx, 1650, 300, appear(t, T.winter + .3, .5), appear(t, T.winter + .3, 1.2));
  const kVol = windowed(t, T.vol, T.gelif + .2, .35);
  if (kVol > 0) {
    pla_pill(ctx, '+9 % de volume', X(P.fx) + 380, Y(430), kVol, { size: 48, bg: '#E8F6FC', color: '#2A6FB0' });
    for (const [y, a] of [[262, 0], [562, 2]]) { const xx = X(P.fx + amp[a] + P.film + P.rpe + 8), yy = Y(y), o = Math.sin(t * 6) * 4; ctx.save(); ctx.globalAlpha = kVol; arrow(ctx, xx, yy, xx + 50 + o, yy, { color: '#2A6FB0', lw: 7, head: 18 }); ctx.restore(); }
  }
  const kGel = appear(t, T.gelif, .45);
  if (kGel > 0) stamp(ctx, 'Gélifraction', X(P.fx) + 380, Y(650), { k: kGel, color: '#2A6FB0', size: 66, rot: -.06 });
  return cam;
}

// ------------------------------------------------------------------ SET B: the façade
const HB = { cx: 760, gy: 900, w: 860 };
HB.h = HB.w * .62; HB.x = HB.cx - HB.w / 2; HB.y = HB.gy - HB.h;
const PAINT_C = '#F2E6CE';
function pla_holes() {            // windows (with shutters & sill) and the door, as rects
  const w = HB.w, h = HB.h, ww = w * .13, wh = w * .19, out = [];
  [[.2, .14], [.5, .14], [.8, .14], [.2, .56], [.8, .56]].forEach(([u, v]) => { const wx = HB.x + w * u - ww / 2, wy = HB.y + h * v; out.push([wx - ww * .48 - 3, wy - 9, ww * 1.96 + 6, wh + 30]); });
  const dw = w * .14, dh = h * .38, dx = HB.cx - dw / 2, dy = HB.gy - dh; out.push([dx - 13, dy - 13, dw + 26, dh + 14]);
  return out;
}
function pla_wallClip(ctx) {     // clip to the façade wall minus windows & door (even-odd)
  ctx.beginPath(); ctx.rect(HB.x + 2, HB.y + 2, HB.w - 4, HB.h - 4);
  for (const [x, y, w, h] of pla_holes()) ctx.rect(x, y, w, h);
  ctx.clip('evenodd');
}
function pla_damageTex() {        // what is really behind the paint: the old lime render crumbling to powder, damp, salt
  return cached('pla|damage|v5', HB.w, HB.h, g => {
    const w = HB.w, h = Math.round(HB.h), r = rng(12);
    g.drawImage(stoneTexture(w, h, 8, { size: 64 }), 0, 0);
    g.fillStyle = 'rgba(70,52,34,.38)'; g.fillRect(0, 0, w, h);                // cavities look deep and damp
    const R = document.createElement('canvas'); R.width = w; R.height = h; const q = R.getContext('2d');
    q.fillStyle = '#E2D3B4'; q.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) { q.fillStyle = r() < .55 ? 'rgba(255,250,235,.75)' : 'rgba(150,125,90,.3)'; const sz = 1.5 + r() * 4; q.fillRect(r() * w, r() * h, sz, sz); }
    const holes = []; for (let i = 0; i < 30; i++) holes.push([r() * w, r() * h, 20 + r() * 46, i]);
    q.globalCompositeOperation = 'destination-out';
    for (const [x, y, sz, i] of holes) blob(q, x, y, sz, i + 9, .45, 10, '#000');
    q.globalCompositeOperation = 'source-over';
    for (const [x, y, sz, i] of holes) blob(q, x, y, sz, i + 9, .45, 10, null, 'rgba(105,80,50,.7)', 3);
    g.drawImage(R, 0, 0);
    for (const [x, y, sz] of holes) for (let j = 0; j < 22; j++) {            // powder crumbs gathering at the bottom of each hole
      const a = Math.PI * (.15 + .7 * r()), d = sz * (.55 + .35 * r()); circle(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 2 + r() * 3.5, '#F4ECDA', 'rgba(120,100,70,.5)', 1);
    }
    const dg = g.createLinearGradient(0, h * .45, 0, h); dg.addColorStop(0, 'rgba(50,70,90,0)'); dg.addColorStop(1, 'rgba(50,70,90,.42)'); g.fillStyle = dg; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) blob(g, r() * w, h * (.62 + r() * .36), 4 + r() * 10, i, .5, 7, 'rgba(255,255,255,.88)');
    for (let i = 0; i < 9; i++) { const c = pla_crackPts(500 + i, r() * w, r() * h * .5, 120 + r() * 120, Math.PI / 2 + (r() - .5)); pla_crack(g, c, 1, 'rgba(60,45,35,.75)', 3); }
  });
}
function pla_pieces() {           // jittered grid of paint plaques covering the wall
  if (pla_pieces.v) return pla_pieces.v;
  const nx = 7, ny = 5, r = rng(42), V = [];
  for (let j = 0; j <= ny; j++) { V.push([]); for (let i = 0; i <= nx; i++) { const ex = i === 0 || i === nx, ey = j === 0 || j === ny; V[j].push([HB.x + HB.w * i / nx + (ex ? (i ? 8 : -8) : (r() - .5) * 60), HB.y + HB.h * j / ny + (ey ? (j ? 8 : -8) : (r() - .5) * 50)]); } }
  const out = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const pts = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]]; const cx = pts.reduce((a, p) => a + p[0], 0) / 4, cy = pts.reduce((a, p) => a + p[1], 0) / 4; out.push({ pts, cx, cy, s: r(), s2: r() }); }
  return (pla_pieces.v = out);
}
const PLA_HIT = [1150, 640];
function pla_setB(ctx, S, A) {
  const t = S.t;
  const T = { cache: A(8, .09), propre: A(8, .315), scan: A(8, .52), poudre: A(8, .86), grat: S.cue(9), hit: A(9, .38), fall: A(9, .78) };
  skyBg(ctx, t, { groundY: HB.gy });
  for (const [x, s] of [[230, 50], [1290, 44]]) { blob(ctx, x, HB.gy - s * .45, s, x, .2, 9, C.grassDark, C.ink, 4); blob(ctx, x - s * .3, HB.gy - s * .7, s * .55, x + 3, .2, 8, C.grass, null); }
  const sparkle = windowed(t, T.cache, T.grat + .3, .5);
  house(ctx, HB.cx, HB.gy, HB.w, { finish: 'plastic', color: PAINT_C, sparkle, t, seed: 3 });

  // ---- x-ray of the right half: see through the paint — the old lime render is turning to powder
  const kScan = inv(T.scan, T.scan + .9, t), xrOut = 1 - appear(t, T.grat, .4);
  if (kScan > 0 && xrOut > 0) {
    const xs = lerp(HB.cx, HB.x + HB.w, ease(kScan));
    ctx.save(); ctx.globalAlpha = xrOut; pla_wallClip(ctx); ctx.beginPath(); ctx.rect(HB.cx, HB.y, xs - HB.cx, HB.h); ctx.clip();
    ctx.drawImage(pla_damageTex(), HB.x, HB.y);
    ctx.fillStyle = 'rgba(242,230,206,.12)'; ctx.fillRect(HB.cx, HB.y, HB.w / 2, HB.h);          // ghost of the paint
    ctx.fillStyle = 'rgba(70,150,210,.08)'; ctx.fillRect(HB.cx, HB.y, HB.w / 2, HB.h);
    for (let y = HB.y; y < HB.gy; y += 9) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(HB.cx, y, HB.w / 2, 3); }
    for (let i = 0; i < 110; i++) { const x = HB.cx + 10 + hash(i * 3.1) * (HB.w / 2 - 20), sp = 45 + hash(i) * 60, y = HB.y + ((hash(i * 7.3) * HB.h + (t - T.scan) * sp) % HB.h); circle(ctx, x + Math.sin(t * 2 + i) * 3, y, 3 + hash(i * 2) * 3.5, 'rgba(247,239,218,.97)', 'rgba(120,100,70,.6)', 1.2); }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = xrOut; ctx.setLineDash([16, 10]); ctx.strokeStyle = '#46A8E8'; ctx.lineWidth = 5; ctx.strokeRect(HB.cx + 3, HB.y + 3, xs - HB.cx - 6, HB.h - 6); ctx.restore();
    if (kScan < 1) { ctx.save(); ctx.globalAlpha = xrOut; line(ctx, xs, HB.y - 10, xs, HB.gy + 6, '#46A8E8', 9); ctx.restore(); }
  }
  const SMILE = (c, x, y, r) => { circle(c, x, y, r, '#F6C84C', C.ink, 3); circle(c, x - r * .35, y - r * .2, r * .12, C.ink); circle(c, x + r * .35, y - r * .2, r * .12, C.ink); c.beginPath(); c.arc(x, y + r * .05, r * .5, .3, Math.PI - .3); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke(); };
  pla_pill(ctx, 'propre…', 172, 470, appear(t, T.propre, .45) * xrOut, { size: 50, icon: SMILE });
  pla_pill(ctx, 'en poudre', 1390, 290, appear(t, T.poudre, .45) * xrOut, { size: 52, icon: ICON_NO, tx: 1158, ty: 560 });

  // ---- one scrape… and everything falls
  const pieces = pla_pieces(), hit = PLA_HIT, tFall = T.fall;
  const pStart = pc => tFall + Math.hypot(pc.cx - hit[0], pc.cy - hit[1]) / 2100 + pc.s * .08;
  const fallen = pieces.filter(pc => t > pStart(pc));
  if (fallen.length) {
    ctx.save(); pla_wallClip(ctx); ctx.beginPath(); for (const pc of fallen) { pc.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); } ctx.clip();
    ctx.drawImage(pla_damageTex(), HB.x, HB.y); ctx.restore();
  }
  const kHitCr = inv(T.hit, tFall, t);
  if (kHitCr > 0 && t < tFall + .5) { ctx.save(); pla_wallClip(ctx); for (let i = 0; i < 6; i++) pla_crack(ctx, pla_crackPts(700 + i, hit[0], hit[1], 260 + i * 30, Math.PI * (.55 + i * .2)), clamp(kHitCr * 1.3), 'rgba(43,38,35,.85)', 4); ctx.restore(); }
  // debris pile at the foot of the wall
  const kPile = fallen.length / pieces.length;
  if (kPile > 0) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(HB.x - 30, HB.gy + 6);
    for (let i = 0; i <= 40; i++) { const x = HB.x - 30 + i * (HB.w + 60) / 40, hh = (14 + 12 * noise(i * .7)) * clamp(kPile * 1.6 - Math.abs(x - hit[0]) / 2400); ctx.lineTo(x, HB.gy + 4 - hh); }
    ctx.lineTo(HB.x + HB.w + 30, HB.gy + 6); ctx.closePath(); ctx.fillStyle = '#E2D5BA'; ctx.fill(); ctx.strokeStyle = 'rgba(110,90,60,.6)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }
  for (const pc of fallen) {
    const a = t - pStart(pc), g = 2400, dx = (pc.cx - hit[0]) * .22 * a + (pc.s - .5) * 120 * a, dy = .5 * g * a * a + 30 * a, rot = (pc.s2 - .5) * 3 * a;
    if (pc.cy + dy > HB.gy + 140) continue;
    for (let q = 1; q <= 3; q++) { const aq = Math.max(0, a - q * .07), qy = .5 * g * aq * aq + 30 * aq; puff(ctx, pc.cx + (pc.cx - hit[0]) * .22 * aq, pc.cy + qy, 10 + q * 4, .35 * (1 - q / 4), '#EDE3CC'); }
    const shape = () => { ctx.beginPath(); pc.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    ctx.save(); ctx.translate(pc.cx + dx, pc.cy + dy); ctx.rotate(rot); ctx.translate(-pc.cx, -pc.cy);
    ctx.save(); ctx.translate(8, 10); shape(); ctx.clip(); ctx.translate(-8, -10); pla_wallClip(ctx);
    ctx.fillStyle = '#C2AA7E'; ctx.fillRect(HB.x, HB.y, HB.w, HB.h); ctx.restore();                  // powdery render on the back
    ctx.save(); shape(); ctx.clip(); pla_wallClip(ctx); plasticFill(ctx, HB.x, HB.y, HB.w, HB.h, PAINT_C, { gloss: 1 });
    shape(); ctx.strokeStyle = 'rgba(43,38,35,.55)'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  for (const pc of pieces) {                           // dust
    const a = t - pStart(pc); if (a < 0 || a > 1.8) continue;
    const k = a / 1.8; puff(ctx, pc.cx + (pc.s - .5) * 40, pc.cy + a * 60, 22 + k * 56, .6 * (1 - k), '#E9DFC9');
    const land = Math.sqrt(2 * Math.max(0, HB.gy - pc.cy) / 2400), b = a - land;
    if (b > 0 && b < 1.3) { const kb = b / 1.3; puff(ctx, pc.cx + (pc.cx - hit[0]) * .22 * land, HB.gy - 24 - kb * 70, 38 + kb * 80, .75 * (1 - kb), '#E9DFC9'); }
  }
  if (t > T.hit && t < T.hit + .35) { const k = (t - T.hit) / .35; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .3; line(ctx, hit[0] + Math.cos(a) * (22 + k * 30), hit[1] + Math.sin(a) * (22 + k * 30), hit[0] + Math.cos(a) * (40 + k * 44), hit[1] + Math.sin(a) * (40 + k * 44), C.ink, 6); } ctx.restore(); }
}

// ------------------------------------------------------------------ the scene
scene('plastique', (ctx, S) => {
  const t = S.t, A = (i, f) => S.cue(i) + f * (S.cueEnd(i) - S.cue(i));
  const tTr = S.cue(8) - .35, kTr = ease(inv(tTr, tTr + .75, t));
  if (kTr < 1) {
    ctx.save(); ctx.translate(-kTr * W, 0);
    pla_setA(ctx, S, A);
    const pose = poseAt(t, [[0, 'idle'], [S.cue(0), 'explain'], [A(0, .13), 'pointUp'], [A(0, .24), 'point'], [A(0, .49), 'count'], [A(0, .74), 'explain'], [A(0, .84), 'point'],
      [S.cue(1), 'pointDown'], [A(1, .5), 'explain'], [S.cue(2), 'point'], [A(2, .52), 'explain'], [S.cue(3), 'point'], [A(3, .39), 'pointDown'], [A(3, .5), 'explain'], [A(3, .665), 'point'],
      [S.cue(4), 'stop'], [S.cue(5), 'explain'], [A(5, .34), 'point'], [A(5, .53), 'shrug'], [A(5, .83), 'point'], [S.cue(6), 'explain'], [A(6, .42), 'point'],
      [S.cue(7), 'shrug'], [A(7, .45), 'point'], [A(7, .83), 'explain']]);
    let expr = 'happy';
    if (t > S.cue(1)) expr = 'serious';
    if (t > S.cue(2)) expr = 'worried';
    if (t > A(5, .83) && t < A(5, .83) + 1.2) expr = 'surprised';
    const shiver = appear(t, S.cue(7) + .2, .4) * (1 - appear(t, A(7, .45), .4));
    presenter(ctx, { x: 205 + Math.sin(t * 38) * 2.5 * shiver, y: 1000, s: .86, T: S.T, pose, expr, look: .9, lookY: t > A(0, .13) && t < A(0, .24) ? -.8 : 0 });
    ctx.restore();
  }
  if (kTr > 0) {
    ctx.save(); ctx.translate((1 - kTr) * W, 0);
    pla_setB(ctx, S, A);
    // Margot: explains, points at the façade, then scrapes it herself with a grattoir
    const tHit = A(9, .38), tFall = A(9, .78);
    const pose = poseAt(t, [[0, 'explain'], [S.cue(8), 'explain'], [A(8, .3), 'pointL'], [A(8, .52), 'explain'], [A(8, .84), 'pointL'], [tFall + .15, 'open'], [tFall + 1.0, 'shrug']], .4);
    let expr = 'serious';
    if (t > A(8, .84)) expr = 'worried';
    if (t > tFall && t < tFall + 1.0) expr = 'surprised';
    const lunge = ease(inv(S.cue(9) + .1, tHit, t)) - .7 * ease(inv(tFall + .1, tFall + .6, t));
    const mx = lerp(1700, 1600, lunge), my = 1015;
    const hop = inv(tFall + .05, tFall + .5, t), bounce = hop > 0 && hop < 1 ? hop : 0;
    const scK = appear(t, S.cue(9) - .25, .35);
    presenter(ctx, { x: mx, y: my, s: .95, T: S.T, pose, expr, look: -.9, bounce, trowel: t < S.cue(9) - .25 });
    if (scK > 0) {
      const h = pla_handL(mx, my, .95, pose, S.T, bounce);
      const pin = windowed(t, tHit - .12, tFall + .05, .12);       // while scraping, the blade stays on the façade
      const want = Math.atan2(-(PLA_HIT[0] + 6 - h.x), PLA_HIT[1] - h.y);
      pla_scraperInHand(ctx, h.x, h.y, lerp(h.a, want, pin), .95, scK);
    }
    ctx.restore();
  }
});
})();

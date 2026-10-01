// 04_plastique.js — Chapitre 3 « Comment le plastique a piégé l'eau » (~62 s)
// Set A (lines 0–7): wall cross-section — interior (left), stone + old lime render, exterior (right).
//   70s plastic paints + RPE + cement plinth → closed film → rain bounces, but ground water and house
//   vapour keep coming from behind → blocked → pocket, pressure, blisters, peeling → salts → frost.
// Set B (lines 8–9): the façade looks clean, an x-ray shows powdery render behind; one scrape… all falls.
(() => {
'use strict';

// ------------------------------------------------------------------ geometry (world coordinates)
const P = { in0: 600, st0: 616, fx: 1014, top: 112, gy: 860, ply: 600, film: 10, rpe: 14, cem: 30 };
const PLA_BL = [{ y: 296, h: 60, a: 44, d: 0 }, { y: 440, h: 78, a: 64, d: .25 }, { y: 552, h: 42, a: 30, d: .5 }];
const PEEL = { y0: 362, y1: 518 };      // the plaque that peels off (over the big blister)

// ------------------------------------------------------------------ small helpers
function pla_vap(ctx, x, y, r, a = .9) { if (a <= .01 || r <= 0) return; puff(ctx, x, y, r * 1.16, a * .6, '#6FB2E2'); puff(ctx, x, y, r, a, '#F2F9FE'); }
function pla_drop(ctx, x, y, s, a = 1) { if (a <= .01) return; drop(ctx, x, y, s, C.water, '#FFFFFF', a); }
function pla_pill(ctx, s, x, y, k, { size = 40, bg = C.paper, color = C.ink, border = C.ink, tx = null, ty = null, acol = C.ink, icon = null } = {}) {
  if (k <= 0) return;
  if (tx != null) { ctx.save(); ctx.globalAlpha *= clamp(k * 2); arrow(ctx, x, y, tx, ty, { color: acol, lw: 6, head: 20, k: easeOut(k) }); ctx.restore(); }
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, size, FONT.title, 600); const tw = ctx.measureText(s).width, iw = icon ? size * 1.2 : 0, w = tw + 40 + iw, h = size * 1.5;
  fillRR(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h / 2, 'rgba(0,0,0,.16)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, bg, border, 4);
  if (icon) icon(ctx, -w / 2 + 20 + iw / 2, 0, size * .5);
  text(ctx, s, -w / 2 + 20 + iw + tw / 2, size * .05, { size, font: FONT.title, weight: 600, color });
  ctx.restore();
}
const ICON_OK = (ctx, x, y, r) => { circle(ctx, x, y, r, C.good, C.ink, 3); check(ctx, x, y + 2, r * 1.15, '#FFFFFF'); };
const ICON_NO = (ctx, x, y, r) => { circle(ctx, x, y, r, C.danger, C.ink, 3); cross(ctx, x, y, r * .9, '#FFFFFF'); };
// crack polyline (deterministic) from (x,y) heading `ang`; returns array of points + branches
const _cracks = new Map();
function pla_crackPts(seed, x, y, len, ang) {
  const key = seed + '|' + x + '|' + y; if (_cracks.has(key)) return _cracks.get(key);
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
function pla_flake(ctx, x, y, r, rot = 0, color = '#FFFFFF', lw = 3) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6, c = Math.cos(a), s = Math.sin(a); ctx.moveTo(0, 0); ctx.lineTo(c * r, s * r);
    const bx = c * r * .55, by = s * r * .55, l = r * .3; ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + .8) * l, by + Math.sin(a + .8) * l); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - .8) * l, by + Math.sin(a - .8) * l); }
  ctx.stroke(); ctx.restore();
}
function pla_salt(ctx, x, y, s, k, seed) {     // cluster of white salt crystals
  if (k <= 0) return; const r = rng(seed);
  for (let i = 0; i < 6; i++) {
    const kk = clamp(k * 1.6 - i * .12); if (kk <= 0) continue;
    const cx = x + (r() - .5) * s * 1.1, cy = y + (r() - .5) * s * 1.3, sz = s * (.25 + r() * .3) * kk, rot = r() * TAU;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    poly(ctx, [[0, -sz], [sz * .7, 0], [0, sz], [-sz * .7, 0]], '#FFFFFF', '#8E9AA3', 2);
    line(ctx, -sz * .3, -sz * .3, sz * .2, -sz * .55, 'rgba(160,190,210,.8)', 1.5);
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
function pla_room() {          // interior: wallpaper, floor, frame, lamp, table + kettle
  return cached('pla|room|v2', 600, 880, g => {
    g.fillStyle = '#F2DDBA'; g.fillRect(0, 0, 600, 860);
    g.fillStyle = 'rgba(176,127,37,.09)'; for (let x = 10; x < 600; x += 44) g.fillRect(x, 0, 18, 860);
    const r = rng(9); g.fillStyle = 'rgba(200,100,59,.12)';
    for (let y = 30; y < 840; y += 60) for (let x = 19 + ((y / 60) % 2) * 22; x < 600; x += 44) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
    fillRR(g, 0, 834, 600, 26, 0, '#B98454', null); line(g, 0, 834, 600, 834, C.ink, 3);
    fillRR(g, 0, 860, 600, 20, 0, C.wood, null); for (let x = 30; x < 600; x += 80) line(g, x, 862, x, 878, C.woodDark, 2); line(g, 0, 860, 600, 860, C.ink, 4); line(g, 0, 880, 600, 880, C.ink, 3);
    // picture frame
    fillRR(g, 446, 286, 96, 76, 4, 'rgba(0,0,0,.12)'); fillRR(g, 440, 280, 96, 76, 4, C.ochre, C.ink, 4); fillRR(g, 449, 289, 78, 58, 2, '#BFDDEE', C.ink, 2);
    poly(g, [[452, 344], [474, 312], [492, 330], [506, 318], [524, 344]], '#7E9C6A'); circle(g, 506, 302, 6, '#F6C84C');
    // side table
    fillRR(g, 420, 756, 140, 16, 5, C.wood, C.ink, 4); line(g, 436, 772, 436, 858, C.ink, 7); line(g, 544, 772, 544, 858, C.ink, 7);
    line(g, 436, 772, 436, 858, C.woodDark, 3); line(g, 544, 772, 544, 858, C.woodDark, 3);
    // kettle
    poly(g, [[518, 724], [544, 702], [550, 706], [530, 734]], '#C8643B', C.ink, 3);         // spout
    ellipse(g, 486, 734, 40, 24, '#C8643B', C.ink, 4);
    fillRR(g, 448, 734, 76, 22, [0, 0, 10, 10], '#C8643B', C.ink, 4);
    ellipse(g, 486, 712, 22, 7, '#B0522E', C.ink, 3); circle(g, 486, 703, 6, C.ink);
    g.beginPath(); g.arc(486, 724, 30, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
    line(g, 466, 728, 474, 744, 'rgba(255,255,255,.6)', 4);
  });
}
function pla_wallTex() {       // stone + plaster + old lime render (2× resolution for the zooms)
  return cached('pla|wall|v2', 2 * (P.fx - P.in0), 2 * (1080 - P.top + 20), g => {
    const w = (P.fx - P.in0), h = 1080 - P.top + 20; g.scale(2, 2);
    g.drawImage(stoneTexture(2 * (978 - P.st0), 2 * h, 31, { size: 150 }), P.st0 - P.in0, 0, 978 - P.st0, h);
    // inner lime plaster
    g.fillStyle = '#F3EEE3'; g.fillRect(0, 0, P.st0 - P.in0, h);
    // old lime render (outside), with pores
    g.drawImage(limeTexture(2 * (P.fx - 978), 2 * h, '#EDE3CC', 7), 978 - P.in0, 0, P.fx - 978, h);
    const r = rng(4);
    for (let i = 0; i < 260; i++) { const x = 978 - P.in0 + 3 + r() * (P.fx - 978 - 6), y = r() * h, s = 1 + r() * 2.2; ellipse(g, x, y, s, s * .8, 'rgba(120,100,70,.45)'); }
    g.strokeStyle = 'rgba(60,50,40,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(978 - P.in0, 0); g.lineTo(978 - P.in0, h); g.stroke();
    g.beginPath(); g.moveTo(P.st0 - P.in0, 0); g.lineTo(P.st0 - P.in0, h); g.stroke();
  });
}

// ------------------------------------------------------------------ the coating profile
// bulge of the coating at height y (blisters)
function pla_bulge(y, amp) { let b = 0; PLA_BL.forEach((bl, i) => { const u = (y - bl.y) / bl.h; if (Math.abs(u) < 1) b += amp[i] * Math.pow(Math.cos(u * Math.PI / 2), 2); }); return b; }
// draw a coating segment between y0..y1 (inner edge at fx + bulge), thickness th
function pla_coatPath(ctx, y0, y1, amp, off) {
  ctx.beginPath(); const st = 4;
  for (let y = y0; y <= y1 + .01; y += st) { const yy = Math.min(y, y1), x = P.fx + pla_bulge(yy, amp) + off; y === y0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
}
function pla_coatSeg(ctx, y0, y1, amp, th, rpeK, ice) {
  if (y1 - y0 < 1) return;
  ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  pla_coatPath(ctx, y0, y1, amp, th / 2); ctx.strokeStyle = C.ink; ctx.lineWidth = th + 6; ctx.stroke();
  ctx.strokeStyle = rpeK > 0 ? '#EFE4C2' : '#E3F2F8'; ctx.lineWidth = th; ctx.stroke();
  if (rpeK > 0) { ctx.setLineDash([2, 7]); ctx.strokeStyle = 'rgba(150,130,90,.6)'; ctx.lineWidth = th * .5; ctx.stroke(); ctx.setLineDash([]); }
  pla_coatPath(ctx, y0, y1, amp, 5); ctx.strokeStyle = '#DDF0F8'; ctx.lineWidth = 10; ctx.stroke();
  pla_coatPath(ctx, y0, y1, amp, 1); ctx.strokeStyle = 'rgba(43,38,35,.55)'; ctx.lineWidth = 2; ctx.stroke();
  pla_coatPath(ctx, y0, y1, amp, th - 3); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ cans (années 70)
function pla_can(ctx, x, y, k, name, col, t, i) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 4); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  ellipse(ctx, 6, 74, 60, 12, 'rgba(0,0,0,.15)');
  if (name === 'RPE') {                                   // bucket
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
    ctx.beginPath(); ctx.moveTo(-30, -20); ctx.quadraticCurveTo(-26, 6, -22, -20); ctx.fillStyle = col; ctx.fill();   // drip
    circle(ctx, 0, 12, 16, 'rgba(255,255,255,.85)'); text(ctx, '70', 0, 14, { size: 20, font: FONT.title, weight: 700, color: col });
  }
  ctx.restore();
  text(ctx, name, x, y + 108, { size: 34, font: FONT.title, weight: 600, alpha: clamp(k * 2), color: C.ink, stroke: 'rgba(255,255,255,.85)', sw: 8 });
}
function pla_badge70(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.08 + Math.sin(t * 1.5) * .03); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  const cols = ['#C8643B', '#D9A441', '#7E9C6A', '#5F8FA8'];
  for (let i = 0; i < 4; i++) { fillRR(ctx, -170 + 8, -50 + i * 25 + 8, 340, 25, 0, null); }
  fillRR(ctx, -172 + 8, -58 + 9, 344, 116, 58, 'rgba(0,0,0,.16)');
  ctx.save(); rr(ctx, -172, -58, 344, 116, 58); ctx.clip();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(-172, -58 + i * 29, 344, 30); }
  ctx.restore();
  rr(ctx, -172, -58, 344, 116, 58); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  text(ctx, 'années 70', 0, 4, { size: 64, font: FONT.title, weight: 700, color: '#FFF6E0', stroke: C.ink, sw: 10 });
  text(ctx, 'années 70', 0, 4, { size: 64, font: FONT.title, weight: 700, color: '#FFF6E0' });
  ctx.restore();
}
// roller (side view, touching the façade at x, centred on y)
function pla_roller(ctx, x, y, k, col) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3); ctx.translate(lerp(160, 0, easeOut(k)), 0);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 58, y); ctx.lineTo(x + 92, y + 70); ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = '#9AA5AD'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.translate(x + 92, y + 70); ctx.rotate(-.5); fillRR(ctx, -10, 0, 20, 150, 9, C.wood, C.ink, 4); ctx.restore();
  fillRR(ctx, x, y - 62, 38, 124, 12, col, C.ink, 5);
  for (let i = 0; i < 5; i++) line(ctx, x + 8, y - 48 + i * 24, x + 30, y - 40 + i * 24, 'rgba(255,255,255,.45)', 3);
  ctx.restore();
}
function pla_float(ctx, x, y, k, col) {      // taloche / trowel pressing on the face
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3); ctx.translate(lerp(160, 0, easeOut(k)), 0);
  fillRR(ctx, x, y - 70, 14, 140, 4, '#C9CED2', C.ink, 4);
  fillRR(ctx, x + 14, y - 16, 34, 32, 6, C.wood, C.ink, 4);
  fillRR(ctx, x + 46, y - 12, 70, 24, 10, C.wood, C.ink, 4);
  if (col) { ctx.fillStyle = col; ctx.fillRect(x - 4, y - 66, 6, 132); }
  ctx.restore();
}
function pla_gauge(ctx, x, y, r, v, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  circle(ctx, 7, 9, r + 10, 'rgba(0,0,0,.16)'); circle(ctx, 0, 0, r + 10, '#FFFFFF', C.ink, 6);
  const a0 = Math.PI * .8, a1 = Math.PI * 2.2;
  [[0, .5, C.good], [.5, .75, C.warn], [.75, 1, C.danger]].forEach(([u0, u1, c]) => { ctx.beginPath(); ctx.arc(0, 0, r - 12, lerp(a0, a1, u0), lerp(a0, a1, u1)); ctx.strokeStyle = c; ctx.lineWidth = 18; ctx.stroke(); });
  for (let i = 0; i <= 8; i++) { const a = lerp(a0, a1, i / 8); line(ctx, Math.cos(a) * (r - 30), Math.sin(a) * (r - 30), Math.cos(a) * (r - 22), Math.sin(a) * (r - 22), C.ink, 3); }
  const shake = v > .75 ? Math.sin(t * 40) * .04 : 0, a = lerp(a0, a1, clamp(v)) + shake;
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
  const top = lerp(-100, 0, v); fillRR(ctx, -9, top, 18, 50 - top, 9, '#5FA8D8');
  for (let i = 0; i < 5; i++) line(ctx, 10, -120 + i * 28, 20, -120 + i * 28, C.ink, 3);
  text(ctx, '−5 °C', 0, 124, { size: 46, font: FONT.title, weight: 700, color: '#2A6FB0', stroke: '#FFFFFF', sw: 8 });
  ctx.restore();
}
function pla_scraper(ctx, x, y, rot, k) {     // grattoir: blade tip at (x,y)
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(14, 10, 240, 30);
  poly(ctx, [[0, -38], [70, -24], [70, 24], [0, 38]], '#C9D3DA', C.ink, 5);
  line(ctx, 10, -26, 56, -18, 'rgba(255,255,255,.8)', 5);
  fillRR(ctx, 66, -14, 40, 28, 6, '#8E9499', C.ink, 4);
  fillRR(ctx, 102, -17, 150, 34, 15, '#C8643B', C.ink, 5);
  line(ctx, 120, -6, 230, -6, 'rgba(255,255,255,.35)', 5);
  ctx.restore();
}

// ------------------------------------------------------------------ camera
function pla_cam(S, A) {
  const t = S.t, K = [
    [0, 1, 960, 540, 960, 540],
    [S.cue(2) - .25, 1, 960, 540, 960, 540],
    [S.cue(2) + .75, 2.1, 1012, 376, 960, 470],
    [S.cue(3) - .4, 2.12, 1012, 378, 960, 470],
    [S.cue(3) + .5, 1, 960, 540, 960, 540],
    [S.cue(5) - .35, 1, 960, 540, 960, 540],
    [S.cue(5) + .6, 1.45, 1004, 470, 900, 466],
    [S.cue(7) - .35, 1.46, 1004, 470, 900, 466],
    [S.cue(7) + .65, 1.24, 980, 520, 880, 500],
    [1e9, 1.25, 980, 520, 880, 500],
  ];
  let i = 0; while (i < K.length - 2 && t >= K[i + 1][0]) i++;
  const a = K[i], b = K[i + 1], k = ease(inv(a[0], b[0], t)), L = j => lerp(a[j], b[j], k);
  const z = L(1) * (1 + .008 * Math.sin(t * .35));
  return { z, fx: L(2), fy: L(3), sx: L(4), sy: L(5), X: x => L(4) + (x - L(2)) * z, Y: y => L(5) + (y - L(3)) * z };
}

// ------------------------------------------------------------------ SET A: the wall section
function pla_setA(ctx, S, A) {
  const t = S.t, cam = pla_cam(S, A);
  const T = {
    badge: A(0, .13), paint0: A(0, .24), paint1: A(0, .485), cans: [A(0, .494), A(0, .572), A(0, .658), A(0, .739)],
    rpe0: A(0, .8), rpe1: A(0, .975), cansOut: S.cue(1) - .3,
    cem0: S.cue(1) + .2, cem1: A(1, .45), dur: A(1, .5), perm: A(1, .7),
    film: A(2, .15), skin: A(2, .52),
    rain: S.cue(3), sol: A(3, .39), vap: A(3, .5), back: A(3, .665),
    block: S.cue(4), stop: A(4, .45),
    acc: S.cue(5), press: A(5, .337), swell: A(5, .527), cloque: A(5, .689), peel: A(5, .837),
    salt: S.cue(6), migr: A(6, .23), cryst: A(6, .42), salpe: A(6, .8),
    winter: S.cue(7) - .3, gel: A(7, .2), vol: A(7, .28), burst: A(7, .47), gelif: A(7, .83),
  };
  const wk = appear(t, T.winter, 1.2, smooth);                       // winter amount
  // coating state
  const yPaint = lerp(P.top, P.ply, smooth(inv(T.paint0, T.paint1, t)));
  const yRpe = lerp(P.top, P.ply, smooth(inv(T.rpe0, T.rpe1, t)));
  const yCem = lerp(P.gy + 24, P.ply, smooth(inv(T.cem0, T.cem1, t)));
  const thick = y => P.film + (y < yRpe ? P.rpe : 0);
  const swell = PLA_BL.map(bl => easeOut(inv(T.swell + bl.d * .9, T.cloque + .6 + bl.d * .4, t)));
  const iceGrow = 1 + .14 * appear(t, T.vol, .9);
  const amp = PLA_BL.map((bl, i) => bl.a * swell[i] * iceGrow);
  const peelK = inv(T.peel, T.peel + 1.6, t);                         // 0..1 peel animation
  const acc = smooth(inv(T.acc - .3, T.press + 2.5, t));               // trapped water amount
  const ice = smooth(inv(T.gel, T.gel + .9, t));
  const damp = smooth(inv(T.sol - .3, T.acc + 3, t));                  // rising damp

  ctx.save(); ctx.translate(cam.sx, cam.sy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy);
  // ---- exterior sky & ground
  const skyTop = mixColor(C.skyTop, '#8EA5BB', wk), skyBot = mixColor('#EAF4F8', '#E6EDF2', wk);
  const sg = ctx.createLinearGradient(0, 0, 0, P.gy); sg.addColorStop(0, skyTop); sg.addColorStop(1, skyBot);
  ctx.fillStyle = sg; ctx.fillRect(P.fx - 40, -200, 1500, P.gy + 200);
  for (let i = 0; i < 4; i++) { const x = 1100 + ((i * 330 + t * (10 + i * 3)) % 1000), y = 150 + i * 120 + (i % 2) * 30; cloud(ctx, x, y, 42 + i * 8, mixColor('#FFFFFF', '#E9EEF3', wk), .9); }
  ctx.drawImage(pla_soilTex(), 0, P.gy + 18);
  ctx.fillStyle = mixColor(C.grass, '#F4F8FB', wk); ctx.fillRect(P.fx, P.gy, 1000, 22);
  ctx.fillStyle = mixColor(C.grassDark, '#D5E3EC', wk); ctx.fillRect(P.fx, P.gy + 16, 1000, 6);
  for (let i = 0; i < 26; i++) { const x = P.fx + 40 + hash(i * 3.3) * 900; line(ctx, x, P.gy + 4, x - 6, P.gy - 14, mixColor(C.grassDark, '#FFFFFF', wk), 4); line(ctx, x + 6, P.gy + 4, x + 10, P.gy - 12, mixColor(C.grassDark, '#FFFFFF', wk), 4); }
  if (wk > 0) { ctx.save(); ctx.globalAlpha = wk; for (let i = 0; i < 18; i++) ellipse(ctx, P.fx + 60 + i * 52, P.gy - 2, 34, 12, '#FFFFFF'); ctx.restore(); }
  // wet soil around the foundation
  if (damp > 0) { const g = ctx.createRadialGradient(800, 1010, 20, 800, 1010, 420); g.addColorStop(0, rgba('#2F6FA8', .55 * damp)); g.addColorStop(1, rgba('#2F6FA8', 0)); ctx.fillStyle = g; ctx.fillRect(300, P.gy + 20, 1000, 260); }
  // ---- interior
  ctx.drawImage(pla_room(), 0, 0);
  const lg = ctx.createRadialGradient(330, 200, 10, 330, 200, 260); lg.addColorStop(0, 'rgba(255,214,120,.5)'); lg.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = lg; ctx.fillRect(60, 0, 540, 480);
  line(ctx, 330, -40, 330, 150, C.ink, 4); poly(ctx, [[288, 196], [372, 196], [356, 148], [304, 148]], '#7E9C6A', C.ink, 4); ellipse(ctx, 330, 200, 16, 8, '#FFE7A0', C.ink, 2);
  // ---- the wall (stone + render), with a section-cut top edge
  ctx.save();
  ctx.beginPath(); ctx.moveTo(P.in0, 1100); ctx.lineTo(P.in0, P.top + 6);
  for (let i = 0; i <= 12; i++) ctx.lineTo(P.in0 + i * (P.fx - P.in0) / 12, P.top + (i % 2 ? -8 : 6));
  ctx.lineTo(P.fx, 1100); ctx.closePath(); ctx.clip();
  ctx.drawImage(pla_wallTex(), P.in0, P.top - 10, P.fx - P.in0, 1080 - P.top + 20);
  // rising damp (blue from below), stronger behind the cement plinth
  if (damp > 0) {
    const yTop = lerp(P.gy + 40, 520, damp), g = ctx.createLinearGradient(0, yTop, 0, 1080);
    g.addColorStop(0, rgba(C.water, 0)); g.addColorStop(.25, rgba(C.water, .28 * damp)); g.addColorStop(1, rgba('#2A6FB0', .55 * damp));
    ctx.fillStyle = g; ctx.fillRect(P.in0, yTop, P.fx - P.in0, 1080 - yTop);
  }
  // trapped water: wet zone behind the coating
  if (acc > 0) {
    const g = ctx.createLinearGradient(P.fx - 190, 0, P.fx, 0); const c = mixColor('#2A6FB0', '#BFE6F5', ice);
    g.addColorStop(0, rgba(c, 0)); g.addColorStop(.6, rgba(c, .3 * acc)); g.addColorStop(1, rgba(c, .62 * acc));
    ctx.fillStyle = g; ctx.fillRect(P.fx - 190, P.top, 190, P.gy + 30 - P.top);
  }
  // the outline of the section
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(P.in0, 1100); ctx.lineTo(P.in0, P.top + 6);
  for (let i = 0; i <= 12; i++) ctx.lineTo(P.in0 + i * (P.fx - P.in0) / 12, P.top + (i % 2 ? -8 : 6));
  ctx.lineTo(P.fx, 1100); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();

  // ---- moisture particles (inside the wall / from the room)
  const parts = [];
  // c2: close-up — vapour in the render pushes on the film and bounces back
  if (t > T.film - .6 && t < S.cue(3) + 1.2) for (let n = 0; n < 40; n++) {
    const ts = T.film - .6 + n * .17; if (ts > t) break; const a = t - ts;
    const y = 200 + hash(n * 3.7) * 380, x0 = 890 + hash(n * 1.9) * 60, xs = P.fx - 9, v = 70;
    const ah = (xs - x0) / v; let x;
    if (a < ah) x = x0 + a * v; else { const a3 = a - ah; x = xs - 30 * Math.sin(Math.min(1, a3 / .5) * Math.PI) * Math.exp(-a3); if (a3 < .5 && a3 > 0) parts.push({ hitX: xs, y, hk: a3 / .5 }); }
    const al = Math.min(1, a * 3) * (1 - smooth(inv(2, 2.6, a - ah))) * (1 - appear(t, S.cue(3) + .3, .6));
    parts.push({ x, y: y + Math.sin(a * 3 + n) * 4, r: 7, al, k: 'vap' });
  }
  // c3+: vapour from the house travels through the wall to the face
  if (t > T.vap - .4) for (let n = 0; n < 150; n++) {
    const ts = T.vap - .4 + n * .21; if (ts > t) break; const a = t - ts;
    const kettle = n % 3 === 0, x0 = kettle ? 534 : 380 + hash(n * 1.7) * 190, y0 = kettle ? 700 : 240 + hash(n * 2.9) * 520;
    const ye = clamp(y0 + (hash(n * 5.1) - .5) * 160 - (kettle ? 140 : 0), P.top + 50, P.gy - 50);
    const d1 = (P.in0 - x0) / 120;
    if (a < d1) { const k = a / d1; parts.push({ x: lerp(x0, P.in0, k), y: lerp(y0, ye, smooth(k)) + Math.sin(a * 3 + n) * 6, r: lerp(13, 9, k), al: Math.min(1, a * 3), k: 'vap' }); continue; }
    const a2 = a - d1, v = 100, xs = P.fx - 9, xw = P.in0 + a2 * v, yw = ye + Math.sin(a2 * 2.1 + n) * 9;
    if (xw < xs) { parts.push({ x: xw, y: yw, r: 8, al: 1, k: 'vap' }); continue; }
    const a3 = a2 - (xs - P.in0) / v; if (a3 > 2.6) continue;
    const bx = xs - 34 * Math.sin(Math.min(1, a3 / .45) * Math.PI) * Math.exp(-a3 * 1.1);
    if (a3 < .45) parts.push({ hitX: xs, y: yw, hk: a3 / .45 });
    parts.push({ x: bx, y: yw, r: 8, al: 1 - smooth(inv(1.4, 2.5, a3)), k: 'vap' });
  }
  // c3+: water rising from the ground (capillarity)
  if (t > T.sol - .4) for (let n = 0; n < 170; n++) {
    const ts = T.sol - .4 + n * .17; if (ts > t) break; const a = t - ts; if (a > 7) continue;
    const x0 = 640 + hash(n * 4.4) * 350, ytop = 470 + hash(n * 2.2) * 260;
    const y = lerp(1080, ytop, 1 - Math.exp(-a / 1.7)), toFace = x0 > 860 ? smooth(inv(1, 4, a)) : 0;
    const xs = P.fx - 9, x = lerp(x0, xs, toFace) + Math.sin(a * 2 + n) * 4;
    if (toFace >= .999 && a < 4.45) parts.push({ hitX: xs, y, hk: (a - 4) / .45 });
    parts.push({ x, y, r: 6, al: Math.min(1, a * 2) * (1 - smooth(inv(5.5, 7, a))), k: 'drop' });
  }
  ctx.save(); ctx.beginPath(); ctx.rect(P.in0 - 400, P.top, P.fx - P.in0 + 400, 1100); ctx.clip();
  for (const p of parts) {
    if (p.hitX != null) continue;
    if (p.k === 'vap') pla_vap(ctx, p.x, p.y, p.r, p.al * (1 - ice));
    else pla_drop(ctx, p.x, p.y + 4, p.r, p.al * (1 - ice));
  }
  ctx.restore();
  // blocked flashes (c4): little red crosses where moisture hits the film from behind
  const kX = windowed(t, T.block - .1, T.acc + 1.2, .3);
  if (kX > 0) for (const p of parts) if (p.hitX != null && p.hk >= 0 && p.hk <= 1) { ctx.save(); ctx.globalAlpha = kX * Math.sin(p.hk * Math.PI); cross(ctx, p.hitX - 16, p.y, 18, C.danger); ctx.restore(); }

  // ---- trapped liquid in the blisters + thin pooling layer
  if (acc > 0 || amp.some(a => a > 0)) {
    const wcol = mixColor('#3E9BDA', '#D6F0FA', ice), wcol2 = mixColor('#2A6FB0', '#A9DDF0', ice);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(P.fx - 6 * acc, P.top + 4);
    for (let y = P.top + 4; y <= P.ply; y += 4) { const peeled = peelK > .2 && y > PEEL.y0 && y < PEEL.y1; ctx.lineTo(P.fx + (peeled ? 0 : pla_bulge(y, amp)), y); }
    ctx.lineTo(P.fx - 6 * acc, P.ply); ctx.closePath();
    const g = ctx.createLinearGradient(P.fx, 0, P.fx + 70, 0); g.addColorStop(0, wcol2); g.addColorStop(1, wcol);
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    // highlights / ice facets in the blisters
    PLA_BL.forEach((bl, i) => {
      if (amp[i] < 4 || (i === 1 && peelK > .2)) return;
      const cx = P.fx + amp[i] * .45, cy = bl.y;
      if (ice < .5) ellipse(ctx, cx + amp[i] * .12, cy - bl.h * .35, amp[i] * .12, bl.h * .14, 'rgba(255,255,255,.7)', null, 0, -.3);
      if (ice > 0) { ctx.save(); ctx.globalAlpha = ice; for (let j = 0; j < 3; j++) pla_flake(ctx, P.fx + amp[i] * (.25 + j * .2), cy + (j - 1) * bl.h * .35, Math.min(amp[i] * .3, 14), j + t * .2, '#FFFFFF', 2.5); ctx.restore(); }
    });
  }
  // ---- the old render behind the peeled plaque: wet, then salty
  if (peelK > .2) {
    const g = ctx.createLinearGradient(P.fx - 30, 0, P.fx, 0); g.addColorStop(0, 'rgba(42,111,176,0)'); g.addColorStop(1, rgba('#2A6FB0', .5 * (1 - ice * .5)));
    ctx.fillStyle = g; ctx.fillRect(P.fx - 30, PEEL.y0, 30, PEEL.y1 - PEEL.y0);
  }

  // ---- salts migrate & crystallise under the coating
  const kSalt = appear(t, T.salt, .6);
  if (kSalt > 0) {
    for (let n = 0; n < 34; n++) {
      const sy = 180 + hash(n * 6.1) * 640, sx0 = 650 + hash(n * 2.3) * 280, mk = smooth(inv(T.migr + hash(n) * .8, T.cryst + 1.4 + hash(n * 3) * .6, t));
      const x = lerp(sx0, P.fx - 14, mk), y = sy + Math.sin(t * 2 + n) * 4;
      const a = kSalt * (1 - smooth(inv(.85, 1, mk))) * (1 - ice * .6);
      if (a > 0) { circle(ctx, x, y, 6, rgba('#FFFFFF', a), rgba('#7D8B96', a), 2); }
    }
    const kc = inv(T.cryst, T.salpe + .6, t);
    [[232, 22], [300, 28], [384, 20], [430, 30], [478, 26], [560, 22], [628, 30], [700, 26], [780, 30], [840, 24]].forEach(([y, s], i) => {
      const x = P.fx - 8 + (y > PEEL.y0 && y < PEEL.y1 && peelK > .2 ? 14 : 0);
      pla_salt(ctx, x, y, s, clamp(kc * 1.5 - i * .05), 300 + i);
    });
  }
  // ---- frost cracks through the stone and the old render
  const kCr = inv(T.burst, T.burst + 1.8, t);
  const cracks = [[984, 250, 220, Math.PI * 1.02, 1], [1000, 420, 260, Math.PI * .97, 2], [990, 610, 200, Math.PI * 1.05, 3], [1010, 720, 240, Math.PI * .95, 4], [1006, 820, 150, Math.PI * 1.1, 5], [960, 350, 160, Math.PI * .75, 6]];
  if (kCr > 0) cracks.forEach(([x, y, l, a, s], i) => pla_crack(ctx, pla_crackPts(s * 17, x, y, l, a), clamp(kCr * 1.4 - i * .07), C.ink, 4.5));
  // ---- ice crystals in the wet zone (winter)
  if (ice > 0) { ctx.save(); ctx.globalAlpha = ice; for (let i = 0; i < 16; i++) { const y = 170 + hash(i * 9.1) * 660, x = P.fx - 20 - hash(i * 3.3) * 110, r = (8 + hash(i) * 10) * (1 + .2 * appear(t, T.vol, .9)); pla_flake(ctx, x, y, r, i + t * .15, '#FFFFFF', 3); pla_flake(ctx, x, y, r * .45, i, '#9ED8F0', 2); } ctx.restore(); }

  // ---- the coating: plastic film (+RPE) with blisters, and the cement plinth
  if (yPaint > P.top + 1) {
    const segs = peelK > .2 ? [[P.top, Math.min(yPaint, PEEL.y0)], [PEEL.y1, yPaint]] : [[P.top, yPaint]];
    for (const [y0, y1] of segs) {
      if (y1 <= y0) continue;
      const yr = clamp(yRpe, y0, y1);
      pla_coatSeg(ctx, y0, yr, amp, P.film + P.rpe, 1, ice);
      pla_coatSeg(ctx, yr, y1, amp, P.film, 0, ice);
    }
  }
  // the peeling plaque (curls, then falls)
  if (peelK > 0) {
    const hx = P.fx + pla_bulge(PEEL.y0, amp), th = P.film + P.rpe, curl = peelK < .2 ? peelK / .2 * .4 : .4 + (peelK - .2) * 1.2;
    const pts = []; let px = 0, py = 0, prev = [P.fx + pla_bulge(PEEL.y0, amp) - hx, 0];
    pts.push([0, 0]);
    for (let y = PEEL.y0 + 6, j = 0; y <= PEEL.y1; y += 6, j++) {
      const cur = [P.fx + pla_bulge(y, amp) - hx, y - PEEL.y0], dx = cur[0] - prev[0], dy = cur[1] - prev[1];
      const ang = -curl * (j / 26) * 1.6 - curl * .5, c = Math.cos(ang), s = Math.sin(ang);
      px += dx * c - dy * s; py += dx * s + dy * c; pts.push([px, py]); prev = cur;
    }
    const fall = Math.max(0, peelK - .45) * 1.6, fx = hx + th / 2 + fall * 140, fy = PEEL.y0 + 900 * fall * fall, rot = -fall * 2.2;
    if (fy < P.gy + 200) {
      ctx.save(); ctx.translate(fx, Math.min(fy, P.gy - 10)); ctx.rotate(rot);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
      path(); ctx.strokeStyle = C.ink; ctx.lineWidth = th + 6; ctx.stroke();
      ctx.strokeStyle = '#EFE4C2'; ctx.lineWidth = th; ctx.stroke();
      ctx.save(); ctx.translate(-th / 2 + 5, 0); path(); ctx.strokeStyle = '#DDF0F8'; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
      ctx.restore();
    }
    // water dripping from the opened blister
    for (let n = 0; n < 8; n++) { const ts = T.peel + .25 + n * .16, a = t - ts; if (a < 0 || a > .8) continue; pla_drop(ctx, P.fx + 6 + hash(n) * 8, PEEL.y1 - 30 + a * a * 900 * .5 + a * 60, 7, 1 - ice); }
  }
  // cement plinth
  if (yCem < P.gy + 23) {
    ctx.save(); ctx.beginPath(); ctx.rect(P.fx - 2, yCem, P.cem + 4, P.gy + 24 - yCem); ctx.clip();
    fillRR(ctx, P.fx, P.ply - 6, P.cem, P.gy + 30 - P.ply, [8, 0, 0, 0], C.cement, C.ink, 4);
    ctx.drawImage(cached('pla|cem', P.cem, 300, g => { const r = rng(5); for (let i = 0; i < 220; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.22)'; g.fillRect(r() * P.cem, r() * 300, 2, 2); } }), P.fx, P.ply - 6);
    line(ctx, P.fx + P.cem - 4, P.ply + 10, P.fx + P.cem - 4, P.gy, 'rgba(255,255,255,.35)', 3);
    if (kCr > 0) pla_crack(ctx, pla_crackPts(91, P.fx + P.cem, 700, 70, Math.PI * .85), clamp(kCr * 1.3 - .2), C.ink, 3.5);
    ctx.restore();
  }
  // ice chips flying off the face when it bursts
  if (kCr > 0) for (let n = 0; n < 9; n++) {
    const ts = T.burst + .2 + n * .17, a = t - ts; if (a < 0 || a > 1.4) continue;
    const y0 = cracks[n % 5][1], x = P.fx + 30 + a * (120 + hash(n) * 100), y = y0 + a * a * 700 - a * 120;
    ctx.save(); ctx.translate(x, Math.min(y, P.gy)); ctx.rotate(a * 6 + n); poly(ctx, [[-9, -6], [8, -8], [10, 5], [-6, 8]], n % 2 ? '#EDE3CC' : C.stone, C.ink, 2.5); ctx.restore();
  }

  // ---- outside: rain bounces off the film
  const kRain = windowed(t, T.rain - .3, T.block + 1.4, .5);
  if (kRain > 0) {
    const xs = P.fx + P.film + P.rpe + 2;
    for (let i = 0; i < 80; i++) {
      const per = .75, ph = hash(i * 1.37) * per, cyc = Math.floor((t + ph) / per), a = t + ph - cyc * per;
      const x0 = xs + 10 + hash(i * 7.1 + cyc * 3.9) * 880, vx = -230, vy = 1050, y0 = -60;
      const ah = (x0 - xs) / -vx, yh = y0 + vy * ah, hitWall = yh < P.gy, aEnd = hitWall ? ah : (P.gy - y0) / vy;
      ctx.save(); ctx.globalAlpha = kRain;
      if (a < aEnd) { const x = x0 + vx * a, y = y0 + vy * a; line(ctx, x, y, x - vx * .035, y - vy * .035, rgba(C.water, .85), 4); }
      else if (a < aEnd + .32) {
        const b = a - aEnd, hx = hitWall ? xs : x0 + vx * aEnd, hy = hitWall ? yh : P.gy;
        for (let j = 0; j < 3; j++) { const vx2 = hitWall ? 90 + j * 50 : (j - 1) * 70, vy2 = -150 - j * 40; circle(ctx, hx + vx2 * b, hy + vy2 * b + 900 * b * b, 3.5, rgba(C.water, .9 * (1 - b / .32))); }
      }
      ctx.restore();
    }
  }
  // ---- outside: snow
  if (wk > 0) for (let i = 0; i < 70; i++) {
    const sp = 60 + hash(i) * 50, x = P.fx + 40 + hash(i * 3.1) * 950 + Math.sin(t * 1.2 + i) * 20, y = ((hash(i * 5.7) * 1000 + t * sp) % 1000) - 60;
    circle(ctx, x, y, 3 + hash(i * 2) * 4, rgba('#FFFFFF', .95 * wk), rgba('#9DB3C8', .6 * wk), 1.5);
  }

  // ---- tools
  const kRoll = windowed(t, T.paint0 - .3, T.paint1 + .5, .35);
  if (kRoll > 0) { const ry = clamp(yPaint - 40 + Math.sin(t * 9) * 26, P.top + 62, P.ply - 50); pla_roller(ctx, P.fx + P.film + 1, ry, kRoll, '#E3F2F8'); }
  const kFl = windowed(t, T.rpe0 - .3, T.rpe1 + .45, .35);
  if (kFl > 0) pla_float(ctx, P.fx + P.film + P.rpe + 1, clamp(yRpe - 30 + Math.sin(t * 8) * 18, P.top + 70, P.ply - 70), kFl, '#EFE4C2');
  const kTr = windowed(t, T.cem0 - .3, T.cem1 + .5, .35);
  if (kTr > 0) pla_float(ctx, P.fx + P.cem + 1, clamp(yCem + 30 + Math.sin(t * 8) * 16, P.ply + 70, P.gy - 40), kTr, C.cement);
  ctx.restore();   // camera

  // ================= screen-space overlays =================
  const X = cam.X, Y = cam.Y;
  // années 70 + cans
  const kOutCans = 1 - appear(t, T.cansOut, .5);
  pla_badge70(ctx, 1500, 190, appear(t, T.badge, .6) * (1 - appear(t, S.cue(2) - .5, .4)), t);
  const cans = [['Acrylique', '#5F8FA8'], ['Vinylique', '#7E9C6A'], ['Pliolite', '#D9A441'], ['RPE', '#C8643B']];
  cans.forEach(([n, c], i) => pla_can(ctx, 1250 + i * 186, 470, appear(t, T.cans[i], .5) * kOutCans, n, c, t, i));
  // cement
  const kCemL = windowed(t, T.cem0 + .1, S.cue(2) - .2, .4);
  if (kCemL > 0) {
    pla_pill(ctx, 'Enduit ciment', 1340, 560, kCemL, { size: 44, tx: X(P.fx + P.cem + 8), ty: Y(700) });
    text(ctx, 'dur', 1250, 650, { size: 52, font: FONT.hand, weight: 700, color: C.inkSoft, alpha: appear(t, T.dur, .4) * kCemL });
    text(ctx, 'peu perméable', 1440, 660, { size: 52, font: FONT.hand, weight: 700, color: C.inkSoft, alpha: appear(t, T.perm, .4) * kCemL });
    // cement sack
    const ks = appear(t, T.cem0, .5) * kCemL;
    if (ks > 0) { ctx.save(); ctx.translate(1660, 800); ctx.scale(easeOutBack(ks), easeOutBack(ks)); ctx.globalAlpha *= clamp(ks * 3); poly(ctx, [[-70, -80], [70, -80], [82, 70], [-82, 70]], '#C9CDD0', C.ink, 5); line(ctx, -60, -80, -50, -96, C.ink, 5); line(ctx, 60, -80, 50, -96, C.ink, 5); text(ctx, 'CIMENT', 0, 4, { size: 34, font: FONT.title, weight: 700, color: C.cementDark }); ctx.restore(); }
  }
  // film fermé (close-up)
  const kFilm = windowed(t, T.film, S.cue(3) - .1, .35);
  if (kFilm > 0) {
    pla_pill(ctx, 'film fermé', X(P.fx) + 330, Y(250), kFilm, { size: 52, tx: X(P.fx + 26), ty: Y(300) });
    pla_pill(ctx, 'une peau fermée', X(P.fx) + 380, Y(520), windowed(t, T.skin, S.cue(3) - .1, .35), { size: 44, bg: '#FFFFFF', icon: ICON_NO });
  }
  // rain ok, ground water, vapour
  const k3 = 1 - appear(t, S.cue(5) - .2, .4);
  pla_pill(ctx, 'pluie', X(1290), Y(200), appear(t, A(3, .1), .45) * k3 * (1 - appear(t, T.block + .8, .4)), { size: 42, icon: ICON_OK });
  const kSol = appear(t, T.sol, .45) * k3;
  if (kSol > 0) { arrow(ctx, X(700), Y(1000), X(700), Y(720), { color: '#2A6FB0', lw: 12, head: 30, k: kSol }); pla_pill(ctx, 'eau du sol', X(820), Y(790), kSol, { size: 40, bg: '#FFFFFF' }); }
  const kVap = appear(t, T.vap, .45) * k3;
  if (kVap > 0) { arrow(ctx, X(440), Y(450), X(700), Y(450), { color: '#6FB2E2', lw: 12, head: 30, k: kVap }); pla_pill(ctx, 'vapeur', X(440), Y(370), kVap, { size: 40, bg: '#FFFFFF' }); }
  const kBack = appear(t, T.back, .5) * k3;
  if (kBack > 0) text(ctx, 'par derrière !', X(800), Y(220), { size: 60, font: FONT.hand, weight: 700, color: '#2A6FB0', alpha: kBack, stroke: '#FFFFFF', sw: 8 });
  // blocked
  const kSt = appear(t, T.stop - .25, .4) * (1 - appear(t, S.cue(5) + .3, .4));
  if (kSt > 0) stamp(ctx, 'BLOQUÉE', X(P.fx) + 230, Y(430), { k: kSt, color: C.danger, size: 64 });
  // accumulation, pressure, blisters, peeling
  const kAcc = windowed(t, T.acc + .4, T.swell + .2, .35);
  pla_pill(ctx, 'eau piégée', X(P.fx) + 300, Y(700), kAcc, { size: 44, tx: X(P.fx - 10), ty: Y(690), bg: '#FFFFFF' });
  const vP = smooth(inv(T.press, T.peel - .1, t)) * (1 - .55 * smooth(inv(T.peel + .2, T.peel + 1.2, t)));
  pla_gauge(ctx, 1600, 300, 92, vP, appear(t, T.press, .5) * (1 - appear(t, S.cue(6) + .2, .4)), t);
  pla_pill(ctx, 'cloques', X(P.fx) + 290, Y(300), windowed(t, T.cloque - .1, S.cue(6) + .2, .35), { size: 46, tx: X(P.fx + amp[0] + 30), ty: Y(296), bg: '#FFFFFF' });
  pla_pill(ctx, 'ça se décolle !', X(P.fx) + 330, Y(620), windowed(t, T.peel + .3, S.cue(6) + .3, .35), { size: 44, bg: '#FFFFFF', color: C.danger });
  // salts
  pla_pill(ctx, 'sels', X(760), Y(300), windowed(t, T.salt + .2, T.salpe + .2, .35), { size: 40, bg: '#FFFFFF' });
  const kSalpe = windowed(t, T.salpe, S.cue(7) + .1, .35);
  if (kSalpe > 0) pla_pill(ctx, 'Salpêtre', X(P.fx) + 330, Y(560), kSalpe, { size: 60, tx: X(P.fx + 4), ty: Y(628), bg: '#FFFFFF' });
  // winter
  pla_thermo(ctx, 1640, 300, appear(t, T.winter + .3, .5) * (1 - appear(t, S.d, .3)), appear(t, T.winter + .3, 1.2));
  const kVol = windowed(t, T.vol, T.gelif + .2, .35);
  if (kVol > 0) { pla_pill(ctx, '+9 % de volume', X(P.fx) + 360, Y(430), kVol, { size: 46, bg: '#E8F6FC', color: '#2A6FB0' });
    for (const [y, a] of [[296, 0], [552, 2]]) { const xx = X(P.fx + amp[a] + 26), yy = Y(y), o = Math.sin(t * 6) * 4; ctx.save(); ctx.globalAlpha = kVol; arrow(ctx, xx, yy, xx + 46 + o, yy, { color: '#2A6FB0', lw: 6, head: 16 }); ctx.restore(); } }
  const kGel = appear(t, T.gelif, .45);
  if (kGel > 0) stamp(ctx, 'Gélifraction', X(P.fx) + 360, Y(640), { k: kGel, color: '#2A6FB0', size: 64, rot: -.06 });

  return cam;
}

// ------------------------------------------------------------------ SET B: the façade
const HB = { cx: 760, gy: 900, w: 860 };
HB.h = HB.w * .62; HB.x = HB.cx - HB.w / 2; HB.y = HB.gy - HB.h;
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
function pla_damageTex() {        // what is really behind the paint: crumbling render, damp, salt
  return cached('pla|damage|v2', HB.w, HB.h, g => {
    g.drawImage(stoneTexture(HB.w, Math.round(HB.h), 8, { size: 64 }), 0, 0);
    const r = rng(12);
    for (let i = 0; i < 120; i++) { const x = r() * HB.w, y = r() * HB.h, s = 18 + r() * 46; blob(g, x, y, s, i + 5, .4, 9, r() < .55 ? '#DCCFB3' : '#E8DDC6', 'rgba(110,90,60,.45)', 2); }
    for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? 'rgba(255,250,235,.55)' : 'rgba(120,100,70,.25)'; g.fillRect(r() * HB.w, r() * HB.h, 2 + r() * 3, 2 + r() * 3); }
    const dg = g.createLinearGradient(0, HB.h * .45, 0, HB.h); dg.addColorStop(0, 'rgba(50,70,90,0)'); dg.addColorStop(1, 'rgba(50,70,90,.45)'); g.fillStyle = dg; g.fillRect(0, 0, HB.w, HB.h);
    for (let i = 0; i < 40; i++) blob(g, r() * HB.w, HB.h * (.6 + r() * .38), 4 + r() * 10, i, .5, 7, 'rgba(255,255,255,.85)');
    for (let i = 0; i < 9; i++) { const c = pla_crackPts(500 + i, r() * HB.w, r() * HB.h * .5, 120 + r() * 120, Math.PI / 2 + (r() - .5)); g.save(); pla_crack(g, c, 1, 'rgba(60,45,35,.75)', 3); g.restore(); }
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
function pla_setB(ctx, S, A) {
  const t = S.t;
  const T = { pire: S.cue(8), cache: A(8, .09), propre: A(8, .315), scan: A(8, .52), poudre: A(8, .86), end8: S.cueEnd(8),
    grat: S.cue(9), hit: A(9, .38), fall: A(9, .78) };
  skyBg(ctx, t, { groundY: HB.gy });
  for (const [x, s] of [[230, 50], [1290, 44]]) { blob(ctx, x, HB.gy - s * .45, s, x, .2, 9, C.grassDark, C.ink, 4); blob(ctx, x - s * .3, HB.gy - s * .7, s * .55, x + 3, .2, 8, C.grass, null); }
  const sparkle = windowed(t, T.cache, T.grat + .3, .5);
  house(ctx, HB.cx, HB.gy, HB.w, { finish: 'plastic', color: '#F2E6CE', sparkle, t, seed: 3 });
  const holes = pla_holes();

  // ---- x-ray of the right half: powdery render behind the paint
  const kScan = inv(T.scan, T.scan + .9, t), xrOut = 1 - appear(t, T.grat, .4);
  if (kScan > 0 && xrOut > 0) {
    const xs = lerp(HB.cx, HB.x + HB.w, ease(kScan));
    ctx.save(); ctx.globalAlpha = xrOut; pla_wallClip(ctx); ctx.beginPath(); ctx.rect(HB.cx, HB.y, xs - HB.cx, HB.h); ctx.clip();
    ctx.drawImage(pla_damageTex(), HB.x, HB.y);
    ctx.fillStyle = 'rgba(70,150,210,.16)'; ctx.fillRect(HB.cx, HB.y, HB.w / 2, HB.h);
    for (let y = HB.y; y < HB.gy; y += 8) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(HB.cx, y, HB.w / 2, 3); }
    // powder falling
    for (let i = 0; i < 70; i++) { const x = HB.cx + 10 + hash(i * 3.1) * (HB.w / 2 - 20), sp = 40 + hash(i) * 50, y = HB.y + ((hash(i * 7.3) * HB.h + (t - T.scan) * sp) % HB.h); circle(ctx, x + Math.sin(t * 2 + i) * 3, y, 2 + hash(i * 2) * 3, 'rgba(240,230,205,.95)', 'rgba(120,100,70,.5)', 1); }
    ctx.restore();
    if (kScan < 1) { ctx.save(); ctx.globalAlpha = xrOut; line(ctx, xs, HB.y - 10, xs, HB.gy + 6, '#46A8E8', 8); ctx.restore(); }
  }
  // split line + labels
  const kSplit = appear(t, T.scan - .2, .4) * xrOut;
  if (kSplit > 0) { ctx.save(); ctx.globalAlpha = kSplit; ctx.setLineDash([18, 12]); line(ctx, HB.cx, HB.y - 30, HB.cx, HB.gy + 20, C.ink, 5); ctx.restore(); }
  const SMILE = (c, x, y, r) => { circle(c, x, y, r, '#F6C84C', C.ink, 3); circle(c, x - r * .35, y - r * .2, r * .12, C.ink); circle(c, x + r * .35, y - r * .2, r * .12, C.ink); c.beginPath(); c.arc(x, y + r * .05, r * .5, .3, Math.PI - .3); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke(); };
  pla_pill(ctx, 'propre…', 170, 470, appear(t, T.propre, .45) * xrOut, { size: 48, icon: SMILE });
  pla_pill(ctx, 'en poudre', 1370, 300, appear(t, T.poudre, .45) * xrOut, { size: 48, icon: ICON_NO, tx: 1080, ty: 650 });
  pla_pill(ctx, 'ce qu’on voit', 520, 300, appear(t, T.scan + .1, .45) * xrOut * 0, { size: 36 });

  // ---- the scraper and the fall
  const pieces = pla_pieces(), hit = [1150, 642];
  const tFall = T.fall;
  const pStart = pc => tFall + Math.hypot(pc.cx - hit[0], pc.cy - hit[1]) / 2100 + pc.s * .08;
  // revealed wall behind fallen plaques
  const fallen = pieces.filter(pc => t > pStart(pc));
  if (fallen.length) {
    ctx.save(); pla_wallClip(ctx); ctx.beginPath(); for (const pc of fallen) { pc.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); } ctx.clip();
    ctx.drawImage(pla_damageTex(), HB.x, HB.y); ctx.restore();
  }
  // crack spreading from the scraper hit
  const kHitCr = inv(T.hit, tFall, t);
  if (kHitCr > 0 && t < tFall + .5) { ctx.save(); pla_wallClip(ctx); for (let i = 0; i < 6; i++) pla_crack(ctx, pla_crackPts(700 + i, hit[0], hit[1], 260 + i * 30, Math.PI * (.55 + i * .2)), clamp(kHitCr * 1.3), 'rgba(43,38,35,.8)', 3.5); ctx.restore(); }
  // falling plaques
  for (const pc of fallen) {
    const a = t - pStart(pc), g = 2400, dx = (pc.cx - hit[0]) * .25 * a + (pc.s - .5) * 120 * a, dy = .5 * g * a * a + 30 * a, rot = (pc.s2 - .5) * 3 * a;
    if (pc.cy + dy > HB.gy + 260) continue;
    ctx.save(); ctx.translate(pc.cx + dx, pc.cy + dy); ctx.rotate(rot); ctx.translate(-pc.cx, -pc.cy);
    ctx.beginPath(); pc.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
    pla_wallClip(ctx);
    ctx.fillStyle = '#D9CBAE'; ctx.fillRect(HB.x, HB.y, HB.w, HB.h);                 // powdery render backing
    ctx.translate(-5, -7); plasticFill(ctx, HB.x, HB.y, HB.w, HB.h, '#F2E6CE', { gloss: 1 });
    ctx.restore();
    ctx.save(); ctx.translate(pc.cx + dx, pc.cy + dy); ctx.rotate(rot); ctx.translate(-pc.cx, -pc.cy);
    ctx.beginPath(); pc.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.strokeStyle = 'rgba(43,38,35,.55)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }
  // dust
  for (const pc of pieces) {
    const a = t - pStart(pc); if (a < 0 || a > 1.6) continue;
    const k = a / 1.6; puff(ctx, pc.cx + (pc.s - .5) * 40, pc.cy + a * 60, 20 + k * 50, .55 * (1 - k), '#E6DCC6');
    const land = Math.sqrt(2 * Math.max(0, HB.gy - pc.cy) / 2400), b = a - land;
    if (b > 0 && b < 1.2) { const kb = b / 1.2; puff(ctx, pc.cx + (pc.cx - hit[0]) * .25 * land, HB.gy - 20 - kb * 60, 34 + kb * 70, .7 * (1 - kb), '#E6DCC6'); }
  }
  // scraper
  const kSc = appear(t, T.grat + .1, .35) * (1 - appear(t, tFall + .6, .4));
  if (kSc > 0) {
    const kin = ease(inv(T.grat + .1, T.hit, t)), drag = ease(inv(T.hit, tFall, t));
    const x = lerp(1520, hit[0] + 4, kin) - drag * 10, y = lerp(520, hit[1], kin) + drag * 40, rot = lerp(-.5, -.15, kin) + drag * .2;
    pla_scraper(ctx, x, y, rot, kSc);
    if (t > T.hit && t < T.hit + .35) { const k = (t - T.hit) / .35; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(ctx, hit[0] + Math.cos(a) * (20 + k * 30), hit[1] + Math.sin(a) * (20 + k * 30), hit[0] + Math.cos(a) * (36 + k * 40), hit[1] + Math.sin(a) * (36 + k * 40), C.ink, 5); } ctx.restore(); }
  }
}

// ------------------------------------------------------------------ the scene
scene('plastique', (ctx, S) => {
  const t = S.t, A = (i, f) => S.cue(i) + f * (S.cueEnd(i) - S.cue(i));
  const tTr = S.cue(8) - .35, kTr = ease(inv(tTr, tTr + .75, t));
  if (kTr < 1) {
    ctx.save(); ctx.translate(-kTr * W, 0);
    pla_setA(ctx, S, A);
    // Margot inside the house (left), presenting the section
    const pose = poseAt(t, [[0, 'idle'], [S.cue(0), 'explain'], [A(0, .13), 'pointUp'], [A(0, .24), 'point'], [A(0, .49), 'count'], [A(0, .74), 'explain'], [A(0, .84), 'point'],
      [S.cue(1), 'pointDown'], [A(1, .5), 'explain'], [S.cue(2), 'point'], [A(2, .52), 'explain'], [S.cue(3), 'point'], [A(3, .39), 'pointDown'], [A(3, .5), 'explain'], [A(3, .665), 'point'],
      [S.cue(4), 'stop'], [S.cue(5), 'explain'], [A(5, .34), 'point'], [A(5, .53), 'shrug'], [A(5, .83), 'point'], [S.cue(6), 'explain'], [A(6, .42), 'point'],
      [S.cue(7), 'shrug'], [A(7, .45), 'point'], [A(7, .83), 'explain']]);
    let expr = 'serious';
    if (t > A(3, .6)) expr = 'worried';
    if (t > A(5, .83) && t < A(5, .83) + 1.2) expr = 'surprised';
    if (t > S.cue(6) && t < S.cue(7)) expr = 'serious';
    const shiver = appear(t, S.cue(7) + .2, .4) * (1 - appear(t, A(7, .45), .4));
    presenter(ctx, { x: 250 + Math.sin(t * 38) * 2.5 * shiver, y: 1000, s: .86, T: S.T, pose, expr, look: .9, lookY: t > A(0, .13) && t < A(0, .24) ? -.8 : 0 });
    ctx.restore();
  }
  if (kTr > 0) {
    ctx.save(); ctx.translate((1 - kTr) * W, 0);
    pla_setB(ctx, S, A);
    const pose = poseAt(t, [[0, 'explain'], [S.cue(8), 'explain'], [A(8, .3), 'pointL'], [A(8, .52), 'explain'], [A(8, .84), 'pointL'], [S.cue(9), 'pointL'], [A(9, .78), 'open'], [A(9, .78) + .9, 'shrug']]);
    let expr = 'serious';
    if (t > A(8, .84)) expr = 'worried';
    if (t > A(9, .78) - .05 && t < A(9, .78) + .9) expr = 'surprised';
    const hop = inv(A(9, .78), A(9, .78) + .45, t);
    presenter(ctx, { x: 1600, y: 1000, s: .95, T: S.T, pose, expr, look: -.9, bounce: hop > 0 && hop < 1 ? hop : 0 });
    ctx.restore();
  }
});
})();

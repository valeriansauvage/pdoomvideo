// 06_chaux.js — Chapitre 5 « Les enduits à la chaux »
// A  un vieux mur « ? » → depuis des siècles → le sac de CHAUX + seau de pâte de chaux, Margot présente
// B  le cycle de la chaux : Calcaire CaCO₃ → four ~900 °C → Chaux vive CaO → + eau → Chaux éteinte Ca(OH)₂
//    → sur le mur + CO₂ de l'air → carbonatation (Ca(OH)₂ + CO₂ → CaCO₃ + H₂O) → « = de la pierre ! »
// C  trois cartes : Souple (chaux ✔ / ciment ✘), Perspirant & capillaire, Assaini (pH 12-13, la moisissure rebondit)
// D  les trois couches : 1. Gobetis, 2. Corps d'enduit, 3. Finition + sables locaux
(() => {
'use strict';

// ------------------------------------------------------------------ small helpers
function pill(ctx, s, x, y, o = {}) {
  const { k = 1, size = 32, bg = C.paper, color = C.ink, border = C.ink, icon = null, iconColor = null, pad = 18, rot = 0, alpha = 1, font = FONT.title, weight = 600 } = o;
  if (k <= 0 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha * clamp(k * 3); ctx.translate(x, y); ctx.rotate(rot); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc);
  setFont(ctx, size, font, weight);
  const tw = ctx.measureText(s).width, iw = icon ? size * 1.05 : 0, w = tw + pad * 2 + iw, h = size * 1.45;
  fillRR(ctx, -w / 2 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, bg, border, 4);
  if (icon === 'check') check(ctx, -w / 2 + pad + size * .36, size * .04, size * .62, iconColor || C.good);
  if (icon === 'cross') cross(ctx, -w / 2 + pad + size * .42, 0, size * .52, iconColor || C.danger);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, iw / 2, size * .05);
  ctx.restore();
}
function chemPill(ctx, s, x, y, o = {}) {
  const { k = 1, size = 30, bg = C.paper, color = C.ink, border = C.ink, pad = 18 } = o;
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc);
  const tw = chem(ctx, s, 0, 0, { size, measure: true }), w = tw + pad * 2, h = size * 1.45;
  fillRR(ctx, -w / 2 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, bg, border, 4);
  chem(ctx, s, 0, -size * .02, { size, color, weight: 600 });
  ctx.restore();
}
function callout(ctx, s, x, y, tx, ty, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= (o.alpha ?? 1) * clamp(k * 2);
  const e = easeOut(clamp(k * 1.4));
  line(ctx, x, y, lerp(x, tx, e), lerp(y, ty, e), o.lineColor || C.ink, 3);
  if (e > .9) circle(ctx, tx, ty, 7, o.dot || C.ink, C.paper, 2.5);
  ctx.restore();
  pill(ctx, s, x, y, Object.assign({ k, size: 28 }, o));
}
function badge(ctx, x, y, r, k, good = true) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  circle(ctx, 3, 5, r, 'rgba(0,0,0,.18)'); circle(ctx, 0, 0, r, good ? C.good : C.danger, C.ink, 4);
  if (good) check(ctx, -r * .04, r * .04, r * 1.05, '#FFFFFF', clamp(k * 1.6)); else cross(ctx, 0, 0, r * .9, '#FFFFFF', clamp(k * 1.6));
  ctx.restore();
}
function vpuff(ctx, x, y, r, a, col = '#EEF7FD') {
  if (a <= 0) return;
  puff(ctx, x, y, r + 4, a * .5, '#6FA6D2');
  puff(ctx, x, y, r, a, col);
}
function sparkle(ctx, x, y, s, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  poly(ctx, [[0, -s], [s * .22, -s * .22], [s, 0], [s * .22, s * .22], [0, s], [-s * .22, s * .22], [-s, 0], [-s * .22, -s * .22]], '#FFF6D8', C.ochreDark, 2);
  ctx.restore();
}
// chemistry text: Unicode subscripts (₀–₉) become real subscripts in the same font, '→' becomes a drawn arrow.
// s: string or [[string, color], ...]. y is the vertical centre of the line.
function chem(ctx, s, x, y, { size = 40, color = C.ink, align = 'center', weight = 700, font = FONT.title, alpha = 1, measure = false } = {}) {
  const segs = typeof s === 'string' ? [[s, color]] : s, parts = [];
  for (const [str, col] of segs) for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code >= 0x2080 && code <= 0x2089) parts.push({ t: String(code - 0x2080), sub: true, col });
    else if (ch === '→') parts.push({ arrow: true, col });
    else { const last = parts[parts.length - 1]; if (last && !last.sub && !last.arrow && last.col === col) last.t += ch; else parts.push({ t: ch, col }); }
  }
  const subS = size * .64, aw = size * 1.35;
  const ws = parts.map(p => { if (p.arrow) return aw; setFont(ctx, p.sub ? subS : size, font, weight); return ctx.measureText(p.t).width; });
  const total = ws.reduce((a, b) => a + b, 0);
  if (measure) return total;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const base = y + size * .36;
  parts.forEach((p, i) => {
    if (p.arrow) arrow(ctx, cx + size * .18, y + size * .02, cx + aw - size * .16, y + size * .02, { color: p.col, lw: size * .1, head: size * .34 });
    else { setFont(ctx, p.sub ? subS : size, font, weight); ctx.fillStyle = p.col; ctx.fillText(p.t, cx, p.sub ? base + size * .2 : base); }
    cx += ws[i];
  });
  ctx.restore();
  return total;
}
function co2(ctx, x, y, s = 1, rot = 0, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  line(ctx, -16, 0, 16, 0, C.ink, 5);
  circle(ctx, -18, 0, 10, '#D64545', C.ink, 3); circle(ctx, 18, 0, 10, '#D64545', C.ink, 3); circle(ctx, 0, 0, 12, '#3B3B3E', C.ink, 3);
  circle(ctx, -21, -3, 3, 'rgba(255,255,255,.65)'); circle(ctx, 15, -3, 3, 'rgba(255,255,255,.65)'); circle(ctx, -3, -4, 3.5, 'rgba(255,255,255,.45)');
  ctx.restore();
}
function flame(ctx, x, y, w, h, col, t, seed) {
  const hh = h * (1 + .18 * Math.sin(t * 11 + seed) + .1 * Math.sin(t * 17 + seed * 2)), sway = Math.sin(t * 7 + seed) * w * .18;
  ctx.beginPath(); ctx.moveTo(x + sway, y - hh);
  ctx.bezierCurveTo(x + w * .5 + sway * .3, y - hh * .55, x + w * .55, y - hh * .1, x, y);
  ctx.bezierCurveTo(x - w * .55, y - hh * .1, x - w * .5 + sway * .3, y - hh * .55, x + sway, y - hh);
  ctx.fillStyle = col; ctx.fill();
}
function trowelShape(ctx, x, y, rot, s = 1, load = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  poly(ctx, [[-60, 0], [60, 0], [0, -26]], '#C9CED2', C.ink, 4);       // blade (flat, tip pointing up in local)
  line(ctx, -40, -6, 20, -6, 'rgba(255,255,255,.7)', 3);
  if (load > 0) blob(ctx, 0, 6, 26 * load, 7, .25, 9, C.lime, C.ink, 3);
  line(ctx, 0, -24, 0, -44, '#8E9499', 6);
  fillRR(ctx, -9, -94, 18, 52, 8, C.wood, C.ink, 4);
  ctx.restore();
}

// ------------------------------------------------------------------ textures
const roughTex = (w, h, base, n, rmin, rmax, seed) => cached(`chx_rough|${w}|${h}|${base}|${n}|${rmin}|${rmax}|${seed}`, w, h, g => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < w * h / n; i++) { const s = rmin + r() * (rmax - rmin); g.fillStyle = r() < .5 ? 'rgba(110,90,60,.28)' : 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(r() * w, r() * h, s, 0, TAU); g.fill(); }
});

// ------------------------------------------------------------------ cycle geometry
const CY = { x: 830, y: 505, rx: 500, ry: 275 };
const ell = a => [CY.x + CY.rx * Math.cos(a), CY.y + CY.ry * Math.sin(a)];
const dsda = a => Math.hypot(CY.rx * Math.sin(a), CY.ry * Math.cos(a));
const gap = (a, px) => px / dsda(a);
const P = Math.PI;
const A_S1 = -P / 2, A_K = -P / 4, A_S2 = 0, A_W = P / 4, A_S3 = P / 2, A_T = 3 * P / 4, A_S4 = P, A_C = 5 * P / 4, A_S1b = 3 * P / 2;
const MR = 98;  // medallion radius
function ellArc(ctx, a0, a1, k, color = C.ochre) {
  if (k <= 0) return;
  const n = 48, ae = a0 + (a1 - a0) * clamp(k), dir0 = Math.sign(a1 - a0);
  const path = () => { ctx.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = ell(a0 + (ae - a0) * i / n); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } };
  const [ex, ey] = ell(ae), [bx, by] = ell(ae - dir0 * .01), d = Math.atan2(ey - by, ex - bx), hd = 30;
  const head = () => { ctx.beginPath(); ctx.moveTo(ex + Math.cos(d) * hd * .5, ey + Math.sin(d) * hd * .5); ctx.lineTo(ex + Math.cos(d + 2.4) * hd, ey + Math.sin(d + 2.4) * hd); ctx.lineTo(ex + Math.cos(d - 2.4) * hd, ey + Math.sin(d - 2.4) * hd); ctx.closePath(); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = C.ink; ctx.lineWidth = 17; ctx.stroke(); head(); ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.stroke(); ctx.fill();
  path(); ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.stroke(); head(); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}
function medallion(ctx, x, y, k, glow, t, draw) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)) * (1 + .05 * glow * Math.sin(t * 6)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  if (glow > 0) circle(ctx, 0, 0, MR + 16, rgba('#F6D27A', .55 * glow));
  circle(ctx, 6, 9, MR, 'rgba(0,0,0,.16)');
  circle(ctx, 0, 0, MR, '#FFFDF8', C.ink, 6);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, MR - 5, 0, TAU); ctx.clip(); draw(); ctx.restore();
  ctx.restore();
}
// --- medallion contents (drawn around 0,0) ---
function limestone(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pts = [[-58, 18], [-50, -20], [-18, -40], [22, -36], [56, -12], [60, 22], [30, 38], [-30, 38]];
  ellipse(ctx, 4, 40, 60, 9, 'rgba(0,0,0,.15)');
  poly(ctx, pts, '#E2D8C3', C.ink, 4);
  ctx.save(); ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.clip();
  for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let x2 = -64; x2 <= 64; x2 += 8) { const y2 = -30 + i * 15 + Math.sin(x2 * .07 + i) * 3; x2 === -64 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2); } ctx.strokeStyle = 'rgba(150,130,100,.45)'; ctx.lineWidth = 2.5; ctx.stroke(); }
  // fossil shell
  ctx.beginPath(); for (let i = 0; i < 40; i++) { const a = i * .38, r = 1.5 + i * .33; const px = 18 + Math.cos(a) * r, py = 6 + Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.strokeStyle = 'rgba(120,100,70,.75)'; ctx.lineWidth = 2.5; ctx.stroke();
  ellipse(ctx, -24, -18, 14, 6, 'rgba(255,255,255,.5)', null, 0, -.3);
  ctx.restore();
  ctx.restore();
}
function quicklime(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 34, 64, 10, 'rgba(0,0,0,.15)');
  const L = [[-34, 18, 22, 1], [6, 22, 24, 2], [40, 20, 19, 3], [-14, -6, 22, 4], [22, -4, 20, 5], [4, -28, 17, 6]];
  for (const [a, b, r, sd] of L) { blob(ctx, a, b, r, sd + 10, .22, 7, '#FBFAF6', C.ink, 3.5); ellipse(ctx, a - r * .3, b - r * .3, r * .3, r * .16, 'rgba(200,200,190,.0)'); circle(ctx, a + r * .25, b + r * .2, r * .22, 'rgba(180,175,160,.35)'); }
  ctx.restore();
}
function putty(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 44, 62, 9, 'rgba(0,0,0,.15)');
  poly(ctx, [[-54, -18], [54, -18], [44, 42], [-44, 42]], '#7D8C96', C.ink, 4);
  line(ctx, -50, 0, 50, 0, 'rgba(0,0,0,.18)', 3);
  ellipse(ctx, 0, -18, 54, 14, '#5E6C75', C.ink, 4);
  ellipse(ctx, 0, -20, 48, 11, '#FFFFFF');
  blob(ctx, -6, -26, 22, 3, .25, 8, '#FFFFFF'); blob(ctx, 14, -24, 16, 5, .25, 8, '#FFFFFF');
  ellipse(ctx, -12, -30, 10, 4, 'rgba(255,255,255,1)'); ellipse(ctx, -2, -22, 30, 6, 'rgba(225,225,215,.6)');
  ctx.beginPath(); ctx.arc(0, -18, 62, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
// small wall: stone (left) + lime render (right) that slowly turns to stone; CO₂ molecules dive into it
function wallBit(ctx, x, y, s, t, kRender, kCarb, kCO2, t0co2) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.drawImage(stoneTexture(90, 140, 21, { size: 34 }), -70, -70);
  line(ctx, 20, -70, 20, 70, C.ink, 3);
  if (kRender > 0) {
    const hh = 140 * easeOut(kRender);
    ctx.save(); ctx.beginPath(); ctx.rect(20, -70, 40, hh); ctx.clip();
    ctx.fillStyle = mixColor('#FFFFFF', '#DCD3C0', kCarb); ctx.fillRect(20, -70, 40, 140);
    if (kCarb > 0) { ctx.globalAlpha *= kCarb; ctx.drawImage(roughTex(40, 140, '#D9D0BE', 26, .8, 2.4, 4), 20, -70); ctx.globalAlpha = 1; for (let i = 0; i < 6; i++) line(ctx, 20, -60 + i * 24, 60, -64 + i * 24, 'rgba(150,130,100,.35)', 2); }
    ctx.restore();
    line(ctx, 60, -70, 60, -70 + hh, C.ink, 3);
  }
  // CO₂ molecules drifting in from the right and vanishing into the render
  if (kCO2 > 0) for (let i = 0; i < 4; i++) {
    const p = ((t - t0co2) * .45 + i / 4) % 1; if (t - t0co2 < i * .35) continue;
    const mx = lerp(120, 44, easeIn(p)), my = -48 + i * 32 + Math.sin(t * 2 + i) * 6;
    co2(ctx, mx, my, .55, Math.sin(t + i) * .6, kCO2 * (1 - smooth((p - .8) / .2)));
  }
  ctx.restore();
}

// ------------------------------------------------------------------ shot A props
function sack(ctx, x, gy, k, glow, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, gy); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  ellipse(ctx, 0, 4, 120, 16, 'rgba(0,0,0,.18)');
  if (glow > 0) { const g = ctx.createRadialGradient(0, -130, 10, 0, -130, 230); g.addColorStop(0, rgba('#FFE7A3', .7 * glow)); g.addColorStop(1, 'rgba(255,231,163,0)'); ctx.fillStyle = g; ctx.fillRect(-240, -360, 480, 460); }
  ctx.beginPath(); ctx.moveTo(-96, 0); ctx.quadraticCurveTo(-112, -120, -84, -236); ctx.lineTo(84, -236); ctx.quadraticCurveTo(112, -120, 96, 0); ctx.closePath();
  ctx.fillStyle = '#DDBF8E'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  // folded top
  poly(ctx, [[-86, -236], [86, -236], [76, -262], [-76, -262]], '#CDAE7B', C.ink, 4);
  for (let i = 0; i < 6; i++) line(ctx, -60 + i * 24, -258, -64 + i * 24, -240, 'rgba(80,60,30,.35)', 2);
  // print
  fillRR(ctx, -78, -178, 156, 104, 10, '#F7F1E3', C.ink, 3);
  text(ctx, 'CHAUX', 0, -140, { size: 46, font: FONT.title, weight: 700, color: '#2E5570' });
  text(ctx, 'naturelle', 0, -98, { size: 26, font: FONT.hand, weight: 700, color: C.ochreDark });
  for (let i = 0; i < 6; i++) line(ctx, -90 + i * 34, -40 + (i % 2) * 6, -84 + i * 34, -20, 'rgba(120,90,50,.2)', 2);
  circle(ctx, 60, -30, 7, 'rgba(255,255,255,.8)'); circle(ctx, -50, -60, 5, 'rgba(255,255,255,.7)');
  ctx.restore();
}
function bucket(ctx, x, gy, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, gy); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  ellipse(ctx, 0, 4, 90, 12, 'rgba(0,0,0,.18)');
  poly(ctx, [[-74, -120], [74, -120], [60, 0], [-60, 0]], '#7D8C96', C.ink, 5);
  line(ctx, -70, -86, 70, -86, 'rgba(0,0,0,.18)', 4); line(ctx, -66, -40, 66, -40, 'rgba(0,0,0,.18)', 4);
  ellipse(ctx, 0, -120, 74, 18, '#5E6C75', C.ink, 4);
  ellipse(ctx, 0, -122, 66, 13, '#FFFFFF');
  blob(ctx, -14, -130, 28, 3, .25, 8, '#FFFFFF'); blob(ctx, 22, -128, 20, 5, .25, 8, '#FFFFFF');
  ellipse(ctx, -24, -136, 12, 4, 'rgba(255,255,255,1)');
  ctx.beginPath(); ctx.arc(0, -120, 86, Math.PI * 1.12, Math.PI * 1.88); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}
function hourglass(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3); ctx.rotate(Math.sin(t * 1.3) * .06);
  circle(ctx, 5, 8, 78, 'rgba(0,0,0,.15)'); circle(ctx, 0, 0, 78, '#FFFDF8', C.ink, 5);
  fillRR(ctx, -38, -56, 76, 12, 5, C.wood, C.ink, 3); fillRR(ctx, -38, 44, 76, 12, 5, C.wood, C.ink, 3);
  const p = (t * .25) % 1;
  ctx.beginPath(); ctx.moveTo(-28, -44); ctx.lineTo(28, -44); ctx.quadraticCurveTo(26, -10, 4, 0); ctx.quadraticCurveTo(26, 10, 28, 44); ctx.lineTo(-28, 44); ctx.quadraticCurveTo(-26, 10, -4, 0); ctx.quadraticCurveTo(-26, -10, -28, -44); ctx.closePath();
  ctx.fillStyle = 'rgba(210,235,245,.7)'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = C.sand; ctx.fillRect(-30, -44 + 30 * p, 60, 40 - 30 * p);
  ctx.beginPath(); ctx.moveTo(-30, 44); ctx.lineTo(30, 44); ctx.lineTo(0, 44 - 14 - 26 * p); ctx.closePath(); ctx.fill();
  line(ctx, 0, 0, 0, 44, C.sand, 3);
  ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
function oldWall(ctx, t) {
  // free-standing old wall fragment with worn lime render patches
  const x0 = 150, x1 = 700, y1 = 860;
  const top = x => 330 + Math.sin(x * .021) * 16 + Math.sin(x * .057 + 1) * 9;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0, y1); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, top(x)); ctx.lineTo(x1, y1); ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.save(); ctx.translate(10, 10); ctx.fill(); ctx.restore();
  ctx.save(); ctx.clip();
  ctx.drawImage(stoneTexture(560, 560, 33, { size: 74 }), x0, 300);
  const r = rng(91);
  for (let i = 0; i < 5; i++) { const bx = x0 + 60 + r() * 420, by = 430 + r() * 340; blob(ctx, bx, by, 40 + r() * 50, i + 20, .35, 11, '#E9DECA', 'rgba(120,100,70,.5)', 3); }
  ctx.restore();
  ctx.beginPath(); for (let x = x0; x <= x1; x += 10) x === x0 ? ctx.moveTo(x, top(x)) : ctx.lineTo(x, top(x));
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  line(ctx, x0, top(x0), x0, y1, C.ink, 5); line(ctx, x1, top(x1), x1, y1, C.ink, 5);
  // a few grass tufts
  for (let i = 0; i < 6; i++) { const gx = x0 + 30 + i * 95; line(ctx, gx, y1, gx - 8, y1 - 18, C.grassDark, 4); line(ctx, gx + 6, y1, gx + 10, y1 - 16, C.grassDark, 4); }
  ctx.restore();
}

// ------------------------------------------------------------------ kiln / water / agents
function kiln(ctx, x, y, k, heat, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  // smoke (with a few CO₂ released by the calcination)
  for (let i = 0; i < 5; i++) { const p = (t * .35 + i / 5) % 1; puff(ctx, Math.sin(p * 5 + i) * 10 + p * 22, -92 - p * 110, 10 + p * 18, .5 * (1 - p) * heat, '#C9C4BC'); }
  ctx.save(); ctx.beginPath(); ctx.moveTo(-58, 62); ctx.lineTo(58, 62); ctx.lineTo(40, -74); ctx.lineTo(-40, -74); ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.save(); ctx.translate(6, 8); ctx.fill(); ctx.restore();
  ctx.save(); ctx.clip(); ctx.drawImage(stoneTexture(130, 140, 44, { size: 30 }), -65, -76); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  fillRR(ctx, -48, -86, 96, 16, 6, C.stoneDark, C.ink, 4);
  // fire mouth
  ctx.beginPath(); ctx.moveTo(-28, 62); ctx.lineTo(-28, 22); ctx.arc(0, 22, 28, Math.PI, 0); ctx.lineTo(28, 62); ctx.closePath();
  ctx.fillStyle = '#3A2620'; ctx.fill();
  ctx.save(); ctx.clip();
  const g = ctx.createRadialGradient(0, 50, 4, 0, 50, 60); g.addColorStop(0, rgba('#FFB347', .9 * heat)); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(-30, -10, 60, 75);
  flame(ctx, -10, 62, 20, 44 * heat, '#E2582B', t, 1); flame(ctx, 10, 62, 22, 50 * heat, '#E2582B', t, 2);
  flame(ctx, -6, 62, 14, 32 * heat, '#F6C84C', t, 3); flame(ctx, 8, 62, 14, 36 * heat, '#F6C84C', t, 4);
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-28, 62); ctx.lineTo(-28, 22); ctx.arc(0, 22, 28, Math.PI, 0); ctx.lineTo(28, 62); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  // glow
  const g2 = ctx.createRadialGradient(0, 50, 10, 0, 50, 120); g2.addColorStop(0, rgba('#FF9A3C', .35 * heat)); g2.addColorStop(1, 'rgba(255,154,60,0)'); ctx.fillStyle = g2; ctx.fillRect(-120, -70, 240, 190);
  ctx.restore();
}
function thermo(ctx, x, y, k, lvl, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  fillRR(ctx, -10, -60, 20, 70, 10, '#FFFFFF', C.ink, 4); circle(ctx, 0, 18, 16, C.danger, C.ink, 4);
  fillRR(ctx, -5, -52 + 58 * (1 - lvl), 10, 58 * lvl + 8, 5, C.danger);
  ctx.restore();
}
function waterPour(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  // jug tilted, pouring a stream onto lime lumps that steam
  ctx.save(); ctx.translate(-34, -44); ctx.rotate(.6 + Math.sin(t * 2) * .04);
  fillRR(ctx, -30, -34, 60, 66, 12, '#5F8FA8', C.ink, 4); poly(ctx, [[26, -30], [44, -38], [30, -18]], '#5F8FA8', C.ink, 3);
  ctx.beginPath(); ctx.arc(-32, -2, 16, Math.PI * .5, Math.PI * 1.5); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(4, -60); ctx.quadraticCurveTo(22, -40, 18, 10); ctx.strokeStyle = C.water; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
  for (let i = 0; i < 6; i++) { const p = (t * 1.6 + i / 6) % 1; drop(ctx, 18 + Math.cos(i * 2.1) * 34 * p, 14 - Math.sin(p * Math.PI) * 26, 5, C.water, null, 1 - p); }
  for (const [a, b, r] of [[0, 30, 15], [26, 32, 13], [-24, 34, 12], [12, 18, 12]]) blob(ctx, a, b, r, a + 40, .2, 7, '#FBFAF6', C.ink, 3);
  for (let i = 0; i < 4; i++) { const p = (t * .6 + i / 4) % 1; puff(ctx, -10 + i * 14 + Math.sin(p * 6 + i) * 8, 10 - p * 90, 8 + p * 14, .7 * Math.sin(p * Math.PI), '#FFFFFF'); }
  ctx.restore();
}

// ------------------------------------------------------------------ the scene
scene('chaux', (ctx, S) => {
  const t = S.t;
  const at = (i, f = 0) => S.cue(i) + f * (S.cueEnd(i) - S.cue(i));
  const tB = at(1, .12) - .2, tC = at(5) - .4, tD = at(8) - .4;
  const kAB = smooth(inv(tB - .3, tB + .3, t)), kBC = ease(inv(tC, tC + .7, t)), kBout = smooth(inv(tC - .15, tC + .3, t)), kCD = ease(inv(tD, tD + .7, t));
  const cam = fn => {
    ctx.save();
    const cs = 1.014 + .006 * Math.sin(t * .19), dx = Math.sin(t * .16) * 7, dy = Math.cos(t * .12) * 4;
    ctx.translate(W / 2, H / 2); ctx.scale(cs, cs); ctx.translate(-W / 2 - dx, -H / 2 - dy);
    fn(); ctx.restore();
  };
  paperBg(ctx);

  // ---------------------------------------------------------------- A: the question, then lime
  if (kAB < 1) { ctx.save(); ctx.globalAlpha *= 1 - kAB; cam(() => { ctx.translate(-kAB * 140, 0); shotA(ctx, t, S, at); }); ctx.restore(); }
  // ---------------------------------------------------------------- B: lime cycle
  if (kAB > 0 && kBout < 1) { ctx.save(); ctx.globalAlpha *= kAB * (1 - kBout); cam(() => { const s0 = lerp(1.05, 1, easeOut(kAB)) * lerp(1, .92, kBC); ctx.translate(CY.x, CY.y); ctx.scale(s0, s0); ctx.translate(-CY.x, -CY.y); shotB(ctx, t, S, at); }); ctx.restore(); }
  // ---------------------------------------------------------------- C: three properties
  if (kBC > 0 && kCD < 1) { ctx.save(); ctx.globalAlpha *= kBC; cam(() => { ctx.translate(-kCD * W * .6, 0); shotC(ctx, t, S, at, kBC); }); ctx.restore(); }
  // ---------------------------------------------------------------- D: three coats
  if (kCD > 0) { ctx.save(); ctx.globalAlpha *= kCD; cam(() => { ctx.translate((1 - kCD) * W * .4, 0); shotD(ctx, t, S, at); }); ctx.restore(); }

  // ---------------------------------------------------------------- Margot
  const pose = poseAt(t, [
    [0, 'idle'], [at(0), 'explain'], [at(0, .12), 'think'], [at(0, .5), 'open'], [at(0, .86), 'hold'],
    [at(1), 'explain'], [at(1, .15), 'pointUpL'], [at(1, .44), 'pointUpL'], [at(1, .63), 'count'], [at(2), 'pointL'], [at(2, .39), 'explain'], [at(2, .7), 'pointL'],
    [at(3), 'pointL'], [at(3, .27), 'pointUpL'], [at(3, .59), 'explain'], [at(3, .8), 'count'], [at(4), 'open'], [at(4, .19), 'explain'], [at(4, .45), 'cheer'], [at(4, .63), 'open'],
    [at(5), 'pointL'], [at(5, .29), 'explain'], [at(6), 'pointL'], [at(6, .49), 'explain'], [at(7), 'pointL'], [at(7, .36), 'count'], [at(7, .66), 'stop'],
    [at(8), 'explain'], [at(8, .15), 'count'], [at(8, .37), 'point'], [at(8, .54), 'point'], [at(8, .69), 'point'], [at(8, .81), 'open'], [at(8) + 7.6, 'idle'],
  ]);
  const expr = t < at(0, .12) ? 'happy' : t < at(0, .5) ? 'serious' : t < at(4, .4) ? 'happy' : t < at(4, .63) ? 'surprised' : t < at(4, .9) ? 'wink' : 'happy';
  cam(() => {
    if (t < tD) {
      const kOut = easeIn(inv(tD - .5, tD - .05, t));
      const x = lerp(lerp(1500, 1760, ease(kAB)), 1775, ease(kBC)), s = lerp(lerp(.95, .8, ease(kAB)), .72, ease(kBC));
      presenter(ctx, { x: x + kOut * 560, y: 1000, s, T: S.T, pose, expr, look: -.55, lookY: t > at(1, .15) && t < at(1, .63) ? -.5 : 0 });
    } else {
      const kIn = easeOut(inv(tD + .1, tD + .75, t));
      presenter(ctx, { x: lerp(-260, 190, kIn), y: 1000, s: .8, T: S.T, pose, expr, look: .55 });
    }
  });
});

// ================================================================== A
function shotA(ctx, t, S, at) {
  const gy = 860;
  ctx.fillStyle = '#E3CFA8'; ctx.fillRect(0, gy, W, H - gy); ctx.fillStyle = 'rgba(120,90,50,.25)'; ctx.fillRect(0, gy, W, 6);
  for (let i = 0; i < 30; i++) circle(ctx, (i * 137) % W, gy + 20 + (i * 53) % 150, 3 + (i % 3), 'rgba(140,110,70,.25)');
  oldWall(ctx, t);
  // the question
  const kQ = appear(t, at(0, .12), .5) * (1 - appear(t, at(0, .5) - .2, .4));
  if (kQ > 0) { ctx.save(); ctx.translate(430, 205 + Math.sin(t * 3) * 6); const s = easeOutBack(kQ); ctx.scale(s, s); ctx.globalAlpha *= clamp(kQ * 3);
    circle(ctx, 6, 8, 76, 'rgba(0,0,0,.15)'); circle(ctx, 0, 0, 76, '#FFFDF8', C.ink, 5); poly(ctx, [[-20, 66], [-46, 104], [6, 72]], '#FFFDF8', C.ink, 5); circle(ctx, 0, 0, 72, '#FFFDF8');
    text(ctx, '?', 0, 6, { size: 120, font: FONT.title, weight: 700, color: C.terracotta }); ctx.restore(); }
  // centuries
  const kH = appear(t, at(0, .5), .5);
  hourglass(ctx, 330, 205, kH, t);
  if (kH > 0) { ctx.save(); ctx.globalAlpha *= clamp(kH * 2); ctx.translate(lerp(560, 600, easeOut(kH)), 205); ctx.rotate(-.04); text(ctx, 'depuis des siècles', 0, 0, { size: 58, font: FONT.hand, weight: 700, color: C.ochreDark, stroke: C.paper, sw: 10 }); ctx.restore(); }
  // lime
  const kS = appear(t, at(0, .62), .55), kBk = appear(t, at(0, .7), .55), kG = appear(t, at(0, .89), .6) * (.75 + .25 * Math.sin(t * 5));
  sack(ctx, 930, gy, kS, kG, t);
  bucket(ctx, 1150, gy, kBk, t);
  const kT = appear(t, at(0, .89), .5);
  pill(ctx, 'La chaux', 1040, 470, { k: kT, size: 66, color: '#FFFFFF', bg: C.ochre, border: C.ink });
  for (let i = 0; i < 7; i++) { const p = (t * .8 + i / 7) % 1, a = -Math.PI * (.05 + .9 * i / 6); sparkle(ctx, 1040 + Math.cos(a) * (230 + p * 30), 760 + Math.sin(a) * (175 + p * 20), 16 * Math.sin(p * Math.PI), kT * Math.sin(p * Math.PI)); }
}

// ================================================================== B: the lime cycle
function shotB(ctx, t, S, at) {
  const S1 = ell(A_S1), S2 = ell(A_S2), S3 = ell(A_S3), S4 = ell(A_S4), K = ell(A_K), Wt = ell(A_W), T = ell(A_T), Cc = ell(A_C);
  const dr = (t0, d = .55) => ease(inv(t0, t0 + d, t));
  const tS1 = at(1, .15), tK = at(1, .44), tTemp = at(1, .63), tS2 = at(2), tW = at(2, .39), tS3 = at(2, .7), tT = at(3), tS4 = at(3) + .45, tCO2 = at(3, .27), tClose = at(3, .59), tCarb = at(3, .8);
  const tLap = at(4), tStone = at(4, .45), tFac = at(4, .63);
  // soft halo + track
  const kTrack = appear(t, at(1) - .3, .8);
  if (kTrack > 0) {
    const g = ctx.createRadialGradient(CY.x, CY.y, 40, CY.x, CY.y, 560); g.addColorStop(0, 'rgba(255,248,230,.85)'); g.addColorStop(1, 'rgba(255,248,230,0)');
    ctx.save(); ctx.globalAlpha *= kTrack; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.setLineDash([4, 16]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(CY.x, CY.y, CY.rx, CY.ry, 0, 0, TAU); ctx.strokeStyle = rgba(C.ochreDark, .45); ctx.lineWidth = 6; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  // arrows (drawn under the medallions / agents)
  ellArc(ctx, A_S1 + gap(A_S1, MR + 12), A_K - gap(A_K, 80), dr(tK - .1));
  ellArc(ctx, A_K + gap(A_K, 80), A_S2 - gap(A_S2, MR + 14), dr(tS2 - .35));
  ellArc(ctx, A_S2 + gap(A_S2, MR + 12), A_W - gap(A_W, 70), dr(tW - .2));
  ellArc(ctx, A_W + gap(A_W, 72), A_S3 - gap(A_S3, MR + 14), dr(tS3 - .3));
  ellArc(ctx, A_S3 + gap(A_S3, MR + 12), A_T - gap(A_T, 66), dr(tT - .05));
  ellArc(ctx, A_T + gap(A_T, 66), A_S4 - gap(A_S4, MR + 14), dr(tT + .3));
  ellArc(ctx, A_S4 + gap(A_S4, MR + 12), A_C - gap(A_C, 76), dr(tClose - .1), C.good);
  ellArc(ctx, A_C + gap(A_C, 76), A_S1b - gap(A_S1b, MR + 14), dr(tClose + .35), C.good);
  // a glowing pulse running around the closed cycle
  if (t > tLap) {
    const p = (t - tLap) / 2.4;
    for (let i = 0; i < 6; i++) { const a = A_S1 + (p - i * .012) * TAU; if (p - i * .012 < 0) continue; const [x, y] = ell(a); circle(ctx, x, y, 13 - i * 1.6, rgba('#FFF2B0', (1 - i / 6) * .95 * (1 - smooth(inv(2.4 * 2.2, 2.4 * 2.6, t - tLap))))); }
  }
  // agents on the arcs
  const heat = .55 + .45 * appear(t, tTemp, .6);
  ctx.save(); ctx.translate(K[0], K[1] - 4); ctx.scale(1.22, 1.22); kiln(ctx, 0, 0, appear(t, tK, .55), heat, t); ctx.restore();
  thermo(ctx, K[0] + 106, K[1] - 36, appear(t, tTemp, .5), lerp(.3, .95, appear(t, tTemp, 1.2)), t);
  pill(ctx, '~900 °C', K[0] + 210, K[1] - 40, { k: appear(t, tTemp + .1, .5), size: 34, color: '#FFFFFF', bg: C.danger, border: C.ink });
  pill(ctx, 'four', K[0] - 8, K[1] + 112, { k: appear(t, tK + .2, .5), size: 30 });
  waterPour(ctx, Wt[0] + 6, Wt[1] + 8, appear(t, tW, .55), t);
  pill(ctx, '+ eau', Wt[0] + 116, Wt[1] + 10, { k: appear(t, tW + .15, .5), size: 32, color: '#FFFFFF', bg: C.water, border: C.ink });
  // trowel spreading
  const kTr = appear(t, tT, .5);
  if (kTr > 0) { ctx.save(); ctx.globalAlpha *= clamp(kTr * 3); const sw = Math.sin((t - tT) * 3.2); trowelShape(ctx, T[0] + 6 + sw * 14, T[1] + 22, .5 + sw * .1, .9 * easeOutBack(kTr), 1); ctx.restore(); }
  // CO₂ of the air: a few molecules float in the air, a steady stream dives into the render on the wall
  const kC = appear(t, tCO2, .6);
  if (kC > 0) {
    const IDLE = [[-150, -20], [-70, 40], [30, -66], [96, 2], [-10, -10]];
    IDLE.forEach(([ox, oy], i) => { const ph = i * 1.7; co2(ctx, Cc[0] + ox + Math.sin(t * .8 + ph) * 14, Cc[1] + oy + Math.cos(t * .7 + ph) * 10, .95, Math.sin(t * .9 + ph) * .8, kC * appear(t, tCO2 + i * .12, .4)); });
    const dt = .45, life = 2.3, j1 = Math.floor((t - tCO2) / dt);
    for (let j = Math.max(0, j1 - 8); j <= j1; j++) {
      const tj = tCO2 + j * dt, a = t - tj; if (a < 0 || a > life) continue;
      const u = a / life, r1 = hash(j * 2.7 + 3), r2 = hash(j * 5.1 + 1);
      const sx = Cc[0] - 150 + r1 * 250, sy = Cc[1] - 70 + r2 * 110, ex = S4[0] + 34, ey = S4[1] - 40 + r1 * 60;
      const v = easeIn(u), x = lerp(sx, ex, v) + Math.sin(a * 3 + j) * 8 * (1 - v), y = lerp(sy, ey, v);
      co2(ctx, x, y, lerp(.9, .6, v), a * 2 + j, kC * clamp(a / .25) * (1 - smooth((u - .82) / .18)));
    }
    chemPill(ctx, 'CO₂ de l\u2019air', Cc[0] - 60, Cc[1] - 104, { k: appear(t, tCO2 + .3, .5), size: 32, color: '#FFFFFF', bg: '#4A4A50', border: C.ink });
  }
  // stations
  const glow1 = appear(t, tClose + .6, .5) * (1 - appear(t, tCarb + 1.5, .8));
  medallion(ctx, S1[0], S1[1], appear(t, tS1, .55), glow1, t, () => { limestone(ctx, 0, -16, 1, t); chem(ctx, 'CaCO₃', 0, 52, { size: 32, color: C.ochreDark }); });
  medallion(ctx, S2[0], S2[1], appear(t, tS2, .55), 0, t, () => { quicklime(ctx, 0, -14, 1, t); chem(ctx, 'CaO', 0, 54, { size: 32, color: C.ochreDark }); });
  medallion(ctx, S3[0], S3[1], appear(t, tS3, .55), 0, t, () => { putty(ctx, 0, -10, .95, t); chem(ctx, 'Ca(OH)₂', 0, 56, { size: 30, color: C.ochreDark }); });
  const kCarb = appear(t, tClose, 2.2, smooth);
  medallion(ctx, S4[0], S4[1], appear(t, tS4, .55), appear(t, tFac, .4) * (1 - appear(t, tFac + 1.6, .5)), t, () => {
    wallBit(ctx, -14, -16, .9, t, appear(t, tS4 + .2, 1.2), kCarb, appear(t, tCO2 + .5, .5), tCO2 + .5);
    chem(ctx, 'Ca(OH)₂', 0, 58, { size: 26, color: C.ochreDark, alpha: 1 - kCarb }); chem(ctx, 'CaCO₃', 0, 58, { size: 28, color: C.good, alpha: kCarb });
  });
  pill(ctx, 'Calcaire', S1[0], S1[1] - MR - 27, { k: appear(t, tS1 + .2, .5), size: 34 });
  pill(ctx, 'Chaux vive', S2[0] + MR + 104, S2[1] - 62, { k: appear(t, tS2 + .2, .5), size: 32 });
  pill(ctx, 'Chaux éteinte', S3[0] + MR + 132, S3[1] + 40, { k: appear(t, tS3 + .2, .5), size: 32 });
  pill(ctx, 'Sur le mur', S4[0] - MR - 88, S4[1], { k: appear(t, tS4 + .2, .5), size: 30 });
  // centre: carbonatation → « = de la pierre ! » → façade
  const kFo = appear(t, tCarb, .6) * (1 - appear(t, tFac - .2, .5));
  if (kFo > 0) {
    pill(ctx, 'Carbonatation', CY.x, CY.y - 84, { k: kFo, size: 42, color: '#FFFFFF', bg: C.good, border: C.ink });
    ctx.save(); ctx.globalAlpha *= clamp(kFo * 2); const sc = lerp(.8, 1, easeOutBack(kFo)); ctx.translate(CY.x, CY.y + 2); ctx.scale(sc, sc);
    chem(ctx, [['Ca(OH)₂', C.ink], [' + ', C.ink], ['CO₂', '#4A4A50'], [' → ', C.ink], ['CaCO₃', C.good], [' + H₂O', C.water]], 0, 0, { size: 42 });
    ctx.restore();
  }
  const kP = appear(t, tStone, .5);
  if (kP > 0) {
    const y = lerp(CY.y + 94, CY.y + 110, appear(t, tFac, .5));
    ctx.save(); ctx.translate(CY.x, y); const sc = easeOutBack(kP) * (1 + .03 * Math.sin(t * 4)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kP * 3);
    text(ctx, '= de la pierre !', 0, 0, { size: 66, font: FONT.title, weight: 700, color: C.ochreDark, stroke: '#FFFDF8', sw: 14 });
    ctx.restore();
  }
  const kH = appear(t, tFac, .6);
  if (kH > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(kH * 3); ctx.translate(CY.x, CY.y + 46); const sc = easeOutBack(kH); ctx.scale(sc, sc); ctx.translate(-CY.x, -(CY.y + 46));
    house(ctx, CY.x, CY.y + 46, 200, { finish: 'lime', color: '#EFE3C8', patina: .3, sparkle: 1, t, smoke: false, seed: 4 });
    ctx.restore();
  }
}

// ================================================================== C: properties
const CARD_W = 490, CARD_H = 640, CARD_Y = 156, CARD_X = [70, 590, 1110];
function card(ctx, i, k, title, sub, kDone, t) {
  if (k <= 0) return false;
  const x = CARD_X[i], y = CARD_Y + Math.sin(t * 1.4 + i) * 3;
  ctx.save(); ctx.translate(x + CARD_W / 2, y + CARD_H / 2); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3); ctx.translate(-x - CARD_W / 2, -y - CARD_H / 2);
  fillRR(ctx, x + 9, y + 12, CARD_W, CARD_H, 30, 'rgba(0,0,0,.15)');
  fillRR(ctx, x, y, CARD_W, CARD_H, 30, '#FFFDF8', C.ink, 6);
  text(ctx, title, x + CARD_W / 2, y + 56, { size: 52, font: FONT.title, weight: 700, color: C.ink });
  if (sub) text(ctx, sub, x + CARD_W / 2, y + 104, { size: 36, font: FONT.hand, weight: 700, color: C.ochreDark });
  ctx.restore();
  badge(ctx, x + CARD_W - 18, y + 18, 34, kDone, true);
  return true;
}
function shotC(ctx, t, S, at, kIn) {
  // 1. Souple
  if (card(ctx, 0, appear(t, at(5) - .3, .6), 'Souple', null, appear(t, at(5, .82), .5), t)) cardFlex(ctx, t, at);
  // 2. Perspirant & capillaire
  if (card(ctx, 1, appear(t, at(6) - .25, .6), 'Perspirant', 'et capillaire', appear(t, at(6, .82), .5), t)) cardBreath(ctx, t, at);
  // 3. Assaini
  if (card(ctx, 2, appear(t, at(7) - .25, .6), 'Assaini', null, appear(t, at(7, .9), .5), t)) cardPH(ctx, t, at);
}
function bendStrip(ctx, x0, y0, w, h, dy, tex) {
  const n = 41, sw = w / (n - 1);
  for (let i = 0; i < n - 1; i++) { const u = (i + .5) / (n - 1); ctx.drawImage(tex, i * sw, 0, sw + 1, h, x0 + i * sw, y0 + dy(u), sw + 1, h); }
}
function cardFlex(ctx, t, at) {
  const x0 = CARD_X[0] + 50, w = 390, tex = stoneTexture(390, 86, 61, { size: 40 });
  const tMove = at(5, .25), amp = 16 * appear(t, tMove, .8), ph = (t - tMove) * 2.8;
  const dy = u => amp * Math.sin(ph) * Math.sin(Math.PI * u) + amp * .35 * Math.sin(ph * 1.3 + 1) * Math.sin(2 * Math.PI * u);
  const kCr = appear(t, at(5, .55), 1.2), kV1 = appear(t, at(5, .82), .5), kV2 = appear(t, at(5, .82) + .25, .5);
  const strips = [[CARD_Y + 230, 'Chaux', '#F4EFE4', C.good], [CARD_Y + 470, 'Ciment', '#A9ACAE', C.danger]];
  strips.forEach(([y0, name, col, cc], si) => {
    const th = 30;
    pill(ctx, name, x0 + 70, y0 - 74, { k: appear(t, at(5) + .1 + si * .25, .5), size: 34, color: cc, border: cc, bg: '#FFFFFF' });
    // masonry strip (bends with the building)
    ctx.save(); ctx.globalAlpha *= appear(t, at(5) + si * .25, .5);
    bendStrip(ctx, x0, y0, w, 86, dy, tex);
    const edge = (off) => { for (let i = 0; i <= 40; i++) { const u = i / 40; const px = x0 + u * w, py = y0 + off + dy(u); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } };
    ctx.beginPath(); edge(86); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    // render layer
    ctx.beginPath(); edge(-th); for (let i = 40; i >= 0; i--) { const u = i / 40; ctx.lineTo(x0 + u * w, y0 + dy(u)); } ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    if (si === 0) { for (let i = 0; i < 9; i++) { const u = .06 + i * .11; circle(ctx, x0 + u * w, y0 - th * .5 + dy(u), 2.5, 'rgba(150,130,100,.35)'); } }
    else if (kCr > 0) {
      // cracks open and close with the movement, chips fall
      [.27, .5, .74].forEach((u, ci) => {
        const kk = clamp(kCr * 1.6 - ci * .25); if (kk <= 0) return;
        const open = 2 + 5 * Math.abs(Math.sin(ph)) * kk, cx = x0 + u * w, cy = y0 - th + dy(u);
        ctx.beginPath(); ctx.moveTo(cx - 3, cy - 2); ctx.lineTo(cx + 5, cy + 9); ctx.lineTo(cx - 4, cy + 18); ctx.lineTo(cx + 3, cy + th * kk + 8);
        ctx.strokeStyle = '#2B2623'; ctx.lineWidth = open; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
        for (let j = 0; j < 2; j++) { const p = ((t - at(5, .55)) * .7 + j * .5 + ci * .3) % 1; if (t - at(5, .55) < j * .5) continue; poly(ctx, [[cx + 4, cy + p * 140], [cx + 12, cy + 4 + p * 140], [cx + 6, cy + 10 + p * 140]], '#8E9295', C.ink, 1.5); }
      });
    }
    ctx.restore();
    // verdict
    if (si === 0) badge(ctx, x0 + w - 10, y0 - 74, 28, kV1, true); else badge(ctx, x0 + w - 10, y0 - 74, 28, kV2, false);
  });
  // building movement arrows
  const kA = appear(t, tMove, .5);
  if (kA > 0) for (const y0 of [CARD_Y + 345, CARD_Y + 585]) {
    const o = Math.sin(ph) * 6; ctx.save(); ctx.globalAlpha *= kA;
    arrow(ctx, x0 + w / 2, y0 + 14 + o, x0 + w / 2, y0 + 44 + o, { color: C.inkSoft, lw: 5, head: 14 }); arrow(ctx, x0 + w / 2, y0 + 44 + o, x0 + w / 2, y0 + 12 + o, { color: C.inkSoft, lw: 5, head: 14 });
    ctx.restore();
  }
}
function cardBreath(ctx, t, at) {
  const cx0 = CARD_X[1], top = CARD_Y + 146, bot = CARD_Y + 560;
  const xs = cx0 + 150, xr = cx0 + 320, xe = cx0 + 350;  // stone 150..320, lime render 320..350
  ctx.save(); rr(ctx, cx0 + 24, top, CARD_W - 48, bot - top, 18); ctx.clip();
  ctx.fillStyle = '#F8E6CC'; ctx.fillRect(cx0, top, xs - cx0, bot - top);
  const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#BFDDEE'); g.addColorStop(1, '#EAF4F8'); ctx.fillStyle = g; ctx.fillRect(xe, top, cx0 + CARD_W - xe, bot - top);
  sun(ctx, cx0 + 430, top + 52, 26, t);
  ctx.drawImage(stoneTexture(170, 450, 71, { size: 46 }), xs, top);
  ctx.drawImage(limeTexture(30, 450, '#F1E9D8', 9), xr, top);
  line(ctx, xs, top, xs, bot, C.ink, 4); line(ctx, xr, top, xr, bot, 'rgba(43,38,35,.6)', 2); line(ctx, xe, top, xe, bot, C.ink, 4);
  const t0 = at(6) - .1;
  if (t > t0) {
    // vapour through
    for (let j = 0; j < 14; j++) {
      const dt = .42, life = 4.2, tj = t0 + (Math.floor((t - t0) / dt) - j) * dt, a = t - tj; if (a < 0 || a > life || tj < t0) continue;
      const u = a / life, yA = top + 60 + hash(Math.round(tj * 10) * 1.7) * 320;
      let x, y, r = 13;
      if (u < .7) { x = lerp(cx0 + 40, xe, u / .7); y = yA + Math.sin(a * 2 + j) * 5; }
      else { const v = (u - .7) / .3; x = xe + v * 90; y = yA - v * 110; r = 13 + v * 12; }
      vpuff(ctx, x, y, r, .9 * clamp(a / .3) * (1 - smooth((u - .8) / .2)), x > xs && x < xe ? '#DDEFFC' : '#F4FAFE');
    }
    // capillary moisture: drops travel to the surface and evaporate
    for (let i = 0; i < 5; i++) {
      const p = ((t - t0) * .28 + i / 5) % 1; if (t - t0 < i * .35) continue;
      const y = top + 80 + i * 78;
      if (p < .75) drop(ctx, lerp(xs + 12, xe - 8, p / .75), y + Math.sin(t * 2 + i) * 3, 8, '#3E9BDA', C.ink, clamp((p) / .1));
      else { const v = (p - .75) / .25; vpuff(ctx, xe + 10 + v * 40, y - v * 80, 8 + v * 12, .85 * Math.sin(v * Math.PI), '#F4FAFE'); }
    }
  }
  ctx.restore();
  rr(ctx, cx0 + 24, top, CARD_W - 48, bot - top, 18); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  pill(ctx, 'vapeur', cx0 + 90, bot + 26, { k: appear(t, at(6) + .4, .5), size: 26, color: '#245E96', border: '#245E96', bg: '#EEF4FD' });
  pill(ctx, 's’évapore', cx0 + 400, bot + 26, { k: appear(t, at(6, .8), .5), size: 26, color: '#245E96', border: '#245E96', bg: '#EEF4FD' });
  pill(ctx, 'chaux', xr + 15, top + 26, { k: appear(t, at(6) + .2, .5), size: 22, pad: 10 });
}
function cardPH(ctx, t, at) {
  const cx0 = CARD_X[2], bx = cx0 + 45, bw = CARD_W - 90, by = CARD_Y + 200, bh = 44;
  const kBar = appear(t, at(7) + .1, .6);
  if (kBar > 0) {
    ctx.save(); ctx.globalAlpha *= kBar;
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    [[0, '#D64545'], [3 / 14, '#E7943A'], [5.5 / 14, '#F2D43B'], [7 / 14, '#62B446'], [9 / 14, '#3EA6A0'], [11.5 / 14, '#3E7FD6'], [1, '#6C4FB5']].forEach(([p, c]) => g.addColorStop(p, c));
    fillRR(ctx, bx + 4, by + 6, bw, bh, bh / 2, 'rgba(0,0,0,.15)');
    fillRR(ctx, bx, by, bw, bh, bh / 2, g, C.ink, 4);
    for (const v of [0, 7, 14]) { const x = bx + 14 + v / 14 * (bw - 28); line(ctx, x, by + bh, x, by + bh + 12, C.ink, 3); text(ctx, String(v), x, by + bh + 34, { size: 28, font: FONT.title, weight: 600 }); }
    text(ctx, 'acide', bx + 40, by - 26, { size: 36, font: FONT.hand, weight: 700, color: C.danger });
    text(ctx, 'neutre', bx + bw / 2, by - 26, { size: 36, font: FONT.hand, weight: 700, color: C.good });
    text(ctx, 'basique', bx + bw - 50, by - 26, { size: 36, font: FONT.hand, weight: 700, color: '#3E5FB0' });
    ctx.restore();
  }
  const kM = appear(t, at(7, .33), 1.1, easeOutBack), v = lerp(7, 12.5, kM), mx = bx + 14 + v / 14 * (bw - 28);
  if (kBar > 0) {
    ctx.save(); ctx.globalAlpha *= kBar;
    poly(ctx, [[mx, by + bh + 2], [mx - 17, by + bh + 30], [mx + 17, by + bh + 30]], C.ink);
    ctx.restore();
    const lx = clamp(mx, bx + 90, bx + bw - 80);
    pill(ctx, 'pH 12-13', lx, by + bh + 78, { k: appear(t, at(7, .36), .5), size: 36, color: '#FFFFFF', bg: '#3E5FB0', border: C.ink });
    if (t > at(7, .4)) text(ctx, 'très basique', lx, by + bh + 136, { size: 42, font: FONT.hand, weight: 700, color: '#3E5FB0', alpha: appear(t, at(7, .4), .5) });
  }
  // lime surface + a mould spore that tries to settle and bounces off
  const sy = CARD_Y + 566, sx0 = cx0 + 40, sw = CARD_W - 80;
  const kSurf = appear(t, at(7, .55), .5);
  if (kSurf > 0) {
    ctx.save(); ctx.globalAlpha *= kSurf;
    ctx.drawImage(limeTexture(sw, 48, '#F1E9D8', 13), sx0, sy); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(sx0, sy, sw, 48);
    text(ctx, 'enduit chaux', sx0 + sw / 2, sy + 25, { size: 24, font: FONT.title, weight: 600, color: C.inkSoft });
    ctx.restore();
  }
  const t0 = at(7, .62), tHit = at(7, .72);
  if (t > t0) {
    const hx = cx0 + 175;
    let x, y, sad = 0, rot = 0;
    if (t < tHit) { const p = easeIn(inv(t0, tHit, t)); x = lerp(cx0 + 130, hx, p); y = lerp(CARD_Y + 440, sy - 30, p) + Math.sin(t * 6) * 3 * (1 - p); }
    else { const p = easeOut(clamp((t - tHit) / .8)); x = lerp(hx, cx0 + 95, p); y = sy - 30 - Math.sin(p * Math.PI * .9) * 110 - p * 36; sad = clamp((t - tHit) * 3); rot = p * 1.2; }
    if (t > tHit && t < tHit + .45) { const k = (t - tHit) / .45; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * .15); line(ctx, hx + Math.cos(a) * 30 * (1 + k), sy - 4 + Math.sin(a) * 22 * (1 + k), hx + Math.cos(a) * 52 * (1 + k), sy - 4 + Math.sin(a) * 38 * (1 + k), rgba('#F2B843', 1 - k), 5); } }
    spore(ctx, x, y, 30, t, sad, rot);
    const kX = appear(t, tHit + .6, .5);
    if (kX > 0) { ctx.save(); ctx.globalAlpha *= clamp(kX * 2); circle(ctx, x, y, 48, null, C.danger, 8); const e = easeOut(kX); line(ctx, x - 33, y - 33, lerp(x - 33, x + 33, e), lerp(y - 33, y + 33, e), C.danger, 8); ctx.restore(); }
    pill(ctx, 'moisissure', cx0 + 140, CARD_Y + 384, { k: appear(t, t0 + .05, .5), size: 26, color: C.moldDark, border: C.moldDark, bg: '#EEF2E6' });
  }
}
function spore(ctx, x, y, r, t, sad, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot * .3);
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + Math.sin(t * 3 + i) * .1; line(ctx, Math.cos(a) * r * .8, Math.sin(a) * r * .8, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, C.moldDark, 4); circle(ctx, Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35, 3.5, C.mold); }
  blob(ctx, 0, 0, r, 9, .12, 10, C.mold, C.ink, 4, t);
  circle(ctx, -9, -5, 6, '#FFFFFF', C.ink, 2); circle(ctx, 9, -5, 6, '#FFFFFF', C.ink, 2); circle(ctx, -9, -4, 2.5, C.ink); circle(ctx, 9, -4, 2.5, C.ink);
  ctx.beginPath(); const m = lerp(6, -6, sad); ctx.moveTo(-10, 12); ctx.quadraticCurveTo(0, 12 + m, 10, 12); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
  if (sad > .5) drop(ctx, 18, -14, 5, C.waterLight, C.ink);
  ctx.restore();
}

// ================================================================== D: three coats + local sands
const SANDS = [['ocre', '#D6A35C'], ['rosé', '#D9A08F'], ['beige', '#E3CFA8'], ['gris', '#B7B2A8']];
function shotD(ctx, t, S, at) {
  const top = 190, bot = 850, xs0 = 470, xs1 = 740;
  const L = [  // [name, x0, width, base, grainN, rmin, rmax, appear time]
    ['1. Gobetis', 740, 30, '#D5C8AE', 14, 1.4, 4.2, at(8, .37)],
    ['2. Corps d’enduit', 770, 96, '#E7DCC6', 22, 1, 2.6, at(8, .54)],
    ['3. Finition', 866, 26, '#EFE3C8', 30, .6, 1.4, at(8, .69)],
  ];
  const desc = ['d’accroche, rugueux', 'épais, il dresse le mur', 'fine, teintée'];
  const kX = appear(t, at(8, .76), .7, ease);   // exploded view
  const sandI = [0, 1, 2, 3, 0][Math.floor(clamp((t - at(8, .81)) / .34, 0, 4))], kSand = appear(t, at(8, .81) - .1, .5);
  const sandCol = t > at(8, .81) ? SANDS[sandI][1] : null;
  // header
  pill(ctx, '3 couches', 1000, 128, { k: appear(t, at(8, .15), .5), size: 44, color: '#FFFFFF', bg: C.ochre, border: C.ink });
  // stone wall section (break lines top and bottom)
  const brk = (x, y) => y + Math.sin(x * .08) * 6;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(xs0, brk(xs0, top)); for (let x = xs0; x <= xs1; x += 10) ctx.lineTo(x, brk(x, top)); ctx.lineTo(xs1, brk(xs1, bot)); for (let x = xs1; x >= xs0; x -= 10) ctx.lineTo(x, brk(x, bot)); ctx.closePath();
  ctx.save(); ctx.translate(9, 11); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.clip(); ctx.drawImage(stoneTexture(270, 680, 81, { size: 66 }), xs0, top - 10); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
  pill(ctx, 'Mur en pierre', (xs0 + xs1) / 2, top - 38, { k: appear(t, at(8) - .1, .5), size: 28 });
  // the three coats, each applied with a trowel then pushed apart (exploded view)
  L.forEach(([name, x0, w, base, n, r0, r1, ta], i) => {
    const kA = clamp((t - ta) / .95); if (kA <= 0) return;
    const ox = kX * (i + 1) * 30, xx = x0 + ox, yb = lerp(top, bot, easeOut(kA));
    const col = i === 2 && sandCol ? mixColor(sandCol, '#FFFFFF', .2) : base;
    ctx.save(); ctx.beginPath(); ctx.rect(xx - 2, top - 20, w + 40, yb - top + 20); ctx.clip();
    ctx.beginPath(); ctx.moveTo(xx, brk(xx, top)); ctx.lineTo(xx + w, brk(xx + w, top));
    if (i === 0) { for (let y = top; y <= bot; y += 14) ctx.lineTo(xx + w + (hash(y) - .5) * 10, y); } else for (let y = top; y <= bot; y += 20) ctx.lineTo(xx + w + Math.sin(y * .05 + i) * (i === 1 ? 3 : 1), y);
    ctx.lineTo(xx + w, brk(xx + w, bot)); ctx.lineTo(xx, brk(xx, bot)); ctx.closePath();
    ctx.save(); ctx.clip(); ctx.drawImage(roughTex(w + 12, 700, col, n, r0, r1, 30 + i), xx, top - 10); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    // trowel sweeping down the fresh coat
    const kTr = clamp((t - ta) / .95) * (1 - appear(t, ta + .95, .3));
    if (kTr > 0 && kA < 1) trowelShape(ctx, xx + w + 3, yb - 30, Math.PI / 2 - .18 + Math.sin(t * 10) * .04, .95, .6);
    else if (kTr > 0) { ctx.save(); ctx.globalAlpha *= kTr; trowelShape(ctx, xx + w + 3 + (1 - kTr) * 70, bot - 30 - (1 - kTr) * 60, Math.PI / 2 - .18, .95, 0); ctx.restore(); }
    // label
    const ly = [300, 470, 640][i], lx = 1180;
    const kL = appear(t, ta + .25, .5);
    callout(ctx, name, lx, ly, xx + w / 2, ly, kL, { size: 36, align: 'left' });
    if (kL > 0) text(ctx, desc[i], lx, ly + 52, { size: 36, font: FONT.hand, weight: 700, color: C.ochreDark, alpha: clamp(kL * 2) });
  });
  // local sands
  if (kSand > 0) {
    text(ctx, 'sables locaux', 1460, 722, { size: 54, font: FONT.hand, weight: 700, color: C.ochreDark, alpha: clamp(kSand * 2), stroke: C.paper, sw: 8 });
    SANDS.forEach(([nm, c], i) => {
      const k = appear(t, at(8, .81) - .1 + i * .12, .45), x = 1250 + i * 140, y = 850, act = sandI === i && t > at(8, .81) ? 1 : 0;
      if (k <= 0) return;
      ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k) * (1 + .12 * act); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
      ellipse(ctx, 4, 4, 64, 12, 'rgba(0,0,0,.18)');
      ctx.beginPath(); ctx.moveTo(-56, 0); ctx.quadraticCurveTo(-28, -64, 0, -66); ctx.quadraticCurveTo(28, -64, 56, 0); ctx.closePath();
      ctx.fillStyle = c; ctx.fill(); ctx.save(); ctx.clip(); ctx.drawImage(roughTex(116, 70, c, 12, .8, 2, 50 + i), -58, -68); ctx.restore();
      ctx.strokeStyle = act ? C.ochreDark : C.ink; ctx.lineWidth = act ? 6 : 4; ctx.stroke();
      ctx.restore();
      text(ctx, nm, x, y + 30, { size: 30, font: FONT.title, weight: 600, alpha: clamp(k * 2) * .9 });
    });
    // dashed arrow from the active sand to the finish coat
    if (t > at(8, .81)) {
      const x = 1250 + sandI * 140, fx = 866 + kX * 90 + 13;
      ctx.save(); ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 40;
      arrow(ctx, x - 10, 772, fx + 34, 772, { color: C.ochreDark, lw: 6, head: 18, curve: .1 });
      ctx.setLineDash([]); ctx.restore();
    }
  }
}
})();

// 10_conclusion.js — Chapitre 9 « Les bons gestes » : la checklist des 5 règles,
// la maison au soleil couchant, puis la signature de fin « Valeriansauvage.fr ».
'use strict';

const CONCL_ITEMS = [
  { title: '1. Diagnostic', sub: 'D’où vient l’eau ? Comment sort-elle ?', disc: '#CFE6F7' },
  { title: '2. Retirer plastiques, RPE, ciment', sub: '… puis laisser sécher le mur', disc: '#F6D3C3' },
  { title: '3. Enduits chaux / chaux-pouzzolane', sub: 'pouzzolane pour les zones exposées', disc: '#F3EEE3' },
  { title: '4. Peinture silicate', sub: 'ou badigeon de chaux', disc: '#F6DFA6' },
  { title: '5. Isolants perspirants', sub: '+ ventilation', disc: '#CDEBD3' },
];
const CONCL = { bx: 150, by: 104, bw: 1290, bh: 800, row0: 344, rowH: 116, mx: 1665, my: 1000, ms: .82, site: 'Valeriansauvage.fr' };

function concl_keyed(t, keys, blend = .4) {          // numeric value keyed in time, smoothly blended
  let cur = keys[0][1], prev = cur, t0 = -1e9;
  for (const [kt, v] of keys) if (t >= kt) { prev = cur; cur = v; t0 = kt; }
  return lerp(prev, cur, ease(inv(t0, t0 + blend, t)));
}

// ---------- icons (one per rule) ----------
function concl_icon(ctx, i, x, y, r, t) {
  circle(ctx, x + 4, y + 6, r, 'rgba(0,0,0,.15)');
  circle(ctx, x, y, r, CONCL_ITEMS[i].disc, C.ink, 4);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 2, 0, TAU); ctx.clip();
  if (i === 0) {                                          // magnifier + drop
    const lx = x - r * .13, ly = y - r * .13, lr = r * .45;
    line(ctx, lx + lr * .7, ly + lr * .7, x + r * .66, y + r * .66, C.ink, r * .3);
    line(ctx, lx + lr * .75, ly + lr * .75, x + r * .62, y + r * .62, C.wood, r * .17);
    circle(ctx, lx, ly, lr, '#F4FAFF', null);
    drop(ctx, lx, ly + r * .08 + Math.sin(t * 3) * r * .04, r * .2, C.water, C.ink);
    circle(ctx, lx, ly, lr, null, C.ink, r * .12);
  } else if (i === 1) {                                   // scraper + flakes
    for (let k = 0; k < 3; k++) { const u = (t * .7 + k / 3) % 1; ctx.save(); ctx.globalAlpha *= Math.sin(u * Math.PI); ctx.translate(x - r * .25 + k * r * .2, y + r * .1 + u * r * .6); ctx.rotate(u * 5 + k); poly(ctx, [[-r * .1, -r * .06], [r * .1, -r * .04], [r * .06, r * .07]], '#FFFFFF', C.ink, 2); ctx.restore(); }
    ctx.save(); ctx.translate(x + r * .12, y - r * .05); ctx.rotate(-.55 + Math.sin(t * 2.5) * .08);
    fillRR(ctx, -r * .12, -r * .82, r * .24, r * .5, r * .1, C.wood, C.ink, 3);
    poly(ctx, [[-r * .14, -r * .34], [r * .14, -r * .34], [r * .42, r * .36], [-r * .42, r * .36]], '#D9DEE2', C.ink, 3);
    line(ctx, -r * .3, r * .24, r * .3, r * .24, 'rgba(255,255,255,.8)', 2);
    ctx.restore();
  } else if (i === 2) {                                   // trowel + lime
    ctx.save(); ctx.translate(x, y + r * .05); ctx.rotate(.55 + Math.sin(t * 2) * .06);
    fillRR(ctx, -r * .11, -r * .86, r * .22, r * .44, r * .1, C.wood, C.ink, 3);
    line(ctx, 0, -r * .42, 0, -r * .22, '#8E9499', r * .1);
    poly(ctx, [[-r * .42, -r * .22], [r * .42, -r * .22], [0, r * .72]], '#C9CED2', C.ink, 3);
    blob(ctx, -r * .02, -r * .02, r * .2, 5, .25, 8, '#FFFFFF', C.ink, 2.5);
    ctx.restore();
  } else if (i === 3) {                                   // brush + mineral colours
    const cols = [C.terracotta, C.ochre, '#5F8FA8'];
    cols.forEach((c, k) => { ctx.save(); ctx.translate(x - r * .1, y + r * .38 - k * r * .26); ctx.rotate(-.12); fillRR(ctx, -r * .62, -r * .1, r * 1.0, r * .2, r * .1, c); ctx.restore(); });
    ctx.save(); ctx.translate(x + r * .2, y - r * .1); ctx.rotate(.65 + Math.sin(t * 3) * .1);
    fillRR(ctx, -r * .08, -r * .9, r * .16, r * .55, r * .08, C.wood, C.ink, 3);
    fillRR(ctx, -r * .2, -r * .38, r * .4, r * .16, 3, '#B9C0C6', C.ink, 3);
    fillRR(ctx, -r * .22, -r * .23, r * .44, r * .36, [2, 2, r * .14, r * .14], C.ochre, C.ink, 3);
    ctx.restore();
  } else {                                                // leaf + fan (breathe & ventilate)
    ctx.save(); ctx.translate(x + r * .2, y - r * .18); ctx.rotate(t * 3);
    for (let k = 0; k < 3; k++) { ctx.rotate(TAU / 3); ellipse(ctx, 0, -r * .26, r * .14, r * .26, '#FFFFFF', C.ink, 3); }
    circle(ctx, 0, 0, r * .08, C.inkSoft, C.ink, 2);
    ctx.restore();
    ctx.save(); ctx.translate(x - r * .3, y + r * .3); ctx.rotate(-.7);
    ctx.beginPath(); ctx.moveTo(0, -r * .42); ctx.quadraticCurveTo(r * .34, -r * .05, 0, r * .4); ctx.quadraticCurveTo(-r * .34, -r * .05, 0, -r * .42); ctx.closePath();
    ctx.fillStyle = C.good; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); line(ctx, 0, -r * .3, 0, r * .48, C.ink, 2.5);
    ctx.restore();
  }
  ctx.restore();
  circle(ctx, x, y, r, null, C.ink, 4);
}

// ---------- the clipboard ----------
function concl_boardBase() {
  const { bw, bh } = CONCL;
  return cached('concl_board', bw + 40, bh + 80, g => {
    g.translate(10, 50);
    fillRR(g, 12, 14, bw, bh, 28, 'rgba(0,0,0,.18)');
    fillRR(g, 0, 0, bw, bh, 28, '#C99260', C.ink, 6);
    const r = rng(11); g.save(); rr(g, 6, 6, bw - 12, bh - 12, 24); g.clip();
    for (let i = 0; i < 26; i++) { const y = r() * bh; g.strokeStyle = `rgba(110,70,40,${.12 + r() * .12})`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(bw * .3, y + (r() - .5) * 30, bw * .6, y + (r() - .5) * 30, bw, y + (r() - .5) * 20); g.stroke(); }
    g.restore();
    // paper sheet
    fillRR(g, 40, 50, bw - 72, bh - 78, 10, '#FFFDF7', C.ink, 4);
    for (let i = 0; i < 5; i++) line(g, 56, CONCL.row0 - CONCL.by + 58 + i * CONCL.rowH, bw - 50, CONCL.row0 - CONCL.by + 58 + i * CONCL.rowH, 'rgba(95,143,168,.22)', 2);
    line(g, 149, 70, 149, bh - 46, 'rgba(214,69,69,.28)', 3);
    // metal clip
    const cx = bw / 2;
    fillRR(g, cx - 140, -34, 280, 78, 18, '#AEB6BD', C.ink, 5);
    fillRR(g, cx - 110, -18, 220, 30, 10, '#D5DBE0', C.ink, 3);
    circle(g, cx, -30, 22, null, C.ink, 7); circle(g, cx, -30, 22, null, '#AEB6BD', 3);
  });
}
function concl_board(ctx, S, t) {
  const { bx, by, bw } = CONCL, c = S.cue, ce = S.cueEnd;
  ctx.drawImage(concl_boardBase(), bx - 10, by - 50);
  // title
  const tk = appear(t, .7, .6);
  text(ctx, 'Les 5 règles d’or', bx + bw / 2, by + 104, { size: 66, font: FONT.title, weight: 700, alpha: tk });
  const uk = appear(t, c(0) + .4, .9, ease);
  if (uk > 0) {
    ctx.save(); ctx.strokeStyle = C.ochre; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath();
    const x0 = bx + bw / 2 - 250, x1 = bx + bw / 2 + 250;
    for (let i = 0; i <= 40 * uk; i++) { const u = i / 40, xx = lerp(x0, x1, u), yy = by + 150 + Math.sin(u * 9) * 3 - u * 4; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.restore();
  }
  // rows
  CONCL_ITEMS.forEach((it, i) => {
    const t0 = c(i + 1) - .15, k = appear(t, t0, .6, x => x); if (k <= 0) return;
    const yc = CONCL.row0 + i * CONCL.rowH, slide = (1 - easeOutBack(k, 1.4)) * 90;
    ctx.save(); ctx.translate(slide, 0); ctx.globalAlpha *= clamp(k * 2.5);
    // highlighter swipe while the rule is spoken
    setFont(ctx, 54, FONT.title, 700); const tw = ctx.measureText(it.title).width;
    const hk = appear(t, c(i + 1) + .2, .7, ease), ho = 1 - appear(t, ce(i + 1) + .25, .5);
    if (hk > 0 && ho > 0) { ctx.save(); ctx.globalAlpha *= ho; fillRR(ctx, 412, yc - 50, (tw + 32) * hk, 58, 14, 'rgba(240,196,104,.45)'); ctx.restore(); }
    // checkbox + tick
    const ck = appear(t, ce(i + 1) - .95, .5, x => x);
    fillRR(ctx, 216, yc - 34, 68, 68, 14, ck > 0 ? mixColor('#FFFFFF', C.goodLight, clamp(ck * 2)) : '#FFFFFF', C.ink, 4);
    check(ctx, 252, yc + 2, 50, C.good, ck);
    const sp = windowed(t, ce(i + 1) - .5, ce(i + 1) + .1, .15);
    if (sp > 0) { const e = inv(ce(i + 1) - .5, ce(i + 1) + .1, t); for (let a = 0; a < 8; a++) { const an = a / 8 * TAU; line(ctx, 250 + Math.cos(an) * (44 + e * 24), yc + Math.sin(an) * (44 + e * 24), 250 + Math.cos(an) * (54 + e * 30), yc + Math.sin(an) * (54 + e * 30), rgba(C.good, sp), 5); } }
    // icon
    const ik = appear(t, t0 + .15, .5, x => x);
    ctx.save(); ctx.translate(360, yc); const isc = easeOutBack(ik, 2.2); ctx.scale(isc, isc); concl_icon(ctx, i, 0, 0, 46, t); ctx.restore();
    // texts
    text(ctx, it.title, 424, yc - 20, { size: 54, font: FONT.title, weight: 700, align: 'left' });
    text(ctx, it.sub, 426, yc + 30, { size: 35, font: FONT.body, weight: 800, color: C.inkSoft, align: 'left' });
    ctx.restore();
  });
}

// Margot raising n fingers on her raised (viewer-right) hand — mirrors presenter()'s arm maths
function concl_fingers(ctx, mx, my, s, pose, T, n, vis) {
  if (vis <= .01 || n <= 0) return;
  const M = MARGOT, talk = talkAt(T), breathe = Math.sin(T * 2.1) * 3, sway = Math.sin(T * .9) * .015 + talk * Math.sin(T * 7) * .01;
  const [u, b] = pose.R, wig = talk * 6 * Math.sin(T * 6 + 1);
  const ua = (u + wig) * Math.PI / 180, fa = (u + b + wig * 1.6) * Math.PI / 180;
  const sy = -362 - pose.sh + 22, ex = 82 + Math.sin(ua) * 100, ey = sy + Math.cos(ua) * 100;
  const hx = ex + Math.sin(fa) * 96, hy = ey + Math.cos(fa) * 96, dir = Math.atan2(Math.cos(fa), Math.sin(fa));
  ctx.save(); ctx.globalAlpha *= vis; ctx.translate(mx, my); ctx.scale(s, s); ctx.rotate(sway); ctx.translate(0, breathe * .4); ctx.translate(hx, hy);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = dir + (i - (n - 1) / 2) * .36 + (n === 5 && i === 0 ? -.35 : 0), len = (n === 5 && i === 0) ? 36 : 46;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.strokeStyle = M.ink; ctx.lineWidth = 19; ctx.stroke(); ctx.strokeStyle = M.skin; ctx.lineWidth = 11; ctx.stroke();
  }
  circle(ctx, 0, 0, 23, M.skin, M.ink, 5);
  ctx.restore();
}

// ---------- golden-hour house ----------
function concl_bird(ctx, x, y, s, t, i) {
  const f = Math.sin(t * 7 + i * 1.7);
  ctx.beginPath(); ctx.moveTo(x - s, y - f * s * .5); ctx.quadraticCurveTo(x - s * .45, y - s * .3 - f * s * .25, x, y); ctx.quadraticCurveTo(x + s * .45, y - s * .3 - f * s * .25, x + s, y - f * s * .5);
  ctx.strokeStyle = '#5E4648'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function concl_sunset(ctx, S, t) {
  const c = S.cue, ce = S.cueEnd, gy = 880, hx = 800, hw = 700;
  const g = ctx.createLinearGradient(0, 0, 0, gy);
  g.addColorStop(0, '#E7A08C'); g.addColorStop(.45, '#F6C48E'); g.addColorStop(1, '#FFE9BC');
  ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, gy + 60);
  // sun low on the left with a soft glow
  const sx = 230, sy = 700;
  const gl = ctx.createRadialGradient(sx, sy, 40, sx, sy, 640); gl.addColorStop(0, 'rgba(255,246,200,.95)'); gl.addColorStop(.25, 'rgba(255,226,150,.5)'); gl.addColorStop(1, 'rgba(255,226,150,0)');
  ctx.fillStyle = gl; ctx.fillRect(-60, -60, 1000, gy + 60);
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * .05);
  const rg = ctx.createRadialGradient(0, 0, 80, 0, 0, 1100); rg.addColorStop(0, 'rgba(255,244,208,.32)'); rg.addColorStop(1, 'rgba(255,244,208,0)');
  for (let i = 0; i < 10; i++) { ctx.rotate(TAU / 10); poly(ctx, [[0, 0], [1100, -70], [1100, 70]], rg); }
  ctx.restore();
  circle(ctx, sx, sy, 84, '#FFE08A', '#F2B04A', 6);
  // clouds
  for (let i = 0; i < 4; i++) { const x = ((i * 520 + t * (10 + i * 3)) % (W + 500)) - 250; cloud(ctx, x, 120 + i * 48 + (i % 2) * 30, 48 + i * 8, i % 2 ? '#FBD9C4' : '#FFE6CF', .9); }
  // birds
  for (let i = 0; i < 5; i++) { const bx = -140 + (t - c(6) + 2) * 75 + [0, -60, -95, -150, -40][i], by = 200 + [0, -28, 30, 6, 52][i] + Math.sin(t * 1.4 + i) * 6; if (bx > -60 && bx < W + 60) concl_bird(ctx, bx, by, 16 + (i % 2) * 4, t, i); }
  // hills
  ctx.fillStyle = '#E8AE86'; ctx.beginPath(); ctx.moveTo(-60, gy); for (let x = -60; x <= W + 60; x += 40) ctx.lineTo(x, 770 - Math.sin(x * .004 + .6) * 40 - Math.sin(x * .011) * 14); ctx.lineTo(W + 60, gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#D79A72'; ctx.beginPath(); ctx.moveTo(-60, gy); for (let x = -60; x <= W + 60; x += 40) ctx.lineTo(x, 830 - Math.sin(x * .006 + 2) * 26); ctx.lineTo(W + 60, gy); ctx.closePath(); ctx.fill();
  ground(ctx, gy, { color: '#B9B46A', dark: '#97924A', x0: -60, x1: W + 60 });
  // long evening shadow of the house (sun on the left → shadow to the right)
  ctx.save(); ctx.globalAlpha = .18; poly(ctx, [[hx - hw / 2, gy + 2], [hx + hw / 2, gy + 2], [hx + hw / 2 + 420, gy + 48], [hx - hw / 2 + 300, gy + 48]], '#5A3B2B'); ctx.restore();
  const h = hw * .62, x0 = hx - hw / 2, y0 = gy - h;
  house(ctx, hx, gy, hw, { finish: 'lime', color: '#E9C28C', patina: .3, sparkle: .6 * appear(t, c(6) + .4, .8), t, seed: 3 });
  // date stone over the door
  const pk = appear(t, c(6) + .5, .6);
  if (pk > 0) { ctx.save(); ctx.translate(hx, gy - h * .38 - 52); const sc = easeOutBack(pk); ctx.scale(sc, sc); fillRR(ctx, -58, -21, 116, 42, 8, C.stoneLight, C.ink, 4); text(ctx, '1880', 0, 2, { size: 28, font: FONT.title, weight: 700, color: C.inkSoft }); ctx.restore(); }
  // the walls breathe: soft vapour leaving the façade
  for (let i = 0; i < 12; i++) {
    const u = (t * .3 + hash(i * 7.1)) % 1, col = [.04, .35, .65, .96][i % 4], px = x0 + hw * (col + (hash(i * 2.3) - .5) * .05), py = y0 + h * (.18 + hash(i * 4.7) * .62);
    puff(ctx, px + u * 30 * (col < .5 ? -1 : 1), py - u * 120, 9 + u * 24, .42 * Math.sin(u * Math.PI), '#FFFFFF');
  }
  // golden light wash
  ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const gw = ctx.createRadialGradient(sx, sy, 100, sx, sy, 1900); gw.addColorStop(0, 'rgba(255,200,90,.75)'); gw.addColorStop(1, 'rgba(255,170,90,.25)');
  ctx.fillStyle = gw; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore();
  // "encore un siècle !"
  label(ctx, 'encore un siècle !', hx - 60, 168, { k: appear(t, lerp(c(6), ce(6), .78), .6), size: 46, bg: '#FFF6E2' });
}

// ---------- end card ----------
function concl_trowel(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.translate(8, 10); poly(ctx, [[-60, 0], [60, 0], [0, 140]], 'rgba(0,0,0,.16)'); ctx.restore();
  fillRR(ctx, -12, -110, 24, 80, 10, C.wood, C.ink, 4);
  line(ctx, 0, -32, 0, 0, '#8E9499', 9);
  poly(ctx, [[-62, 0], [62, 0], [0, 142]], '#C9CED2', C.ink, 5);
  line(ctx, -40, 16, 20, 16, 'rgba(255,255,255,.7)', 5);
  ctx.restore();
}
function concl_limeStroke(ctx, x0, x1, y, k, t) {
  if (k <= 0) return null;
  const n = 64, P = [];
  for (let i = 0; i <= n; i++) { const u = i / n; P.push([lerp(x0, x1, u), y + Math.sin(u * 7.2 + .5) * 5 + Math.sin(u * 23) * 1.6]); }
  const m = Math.max(1, Math.round(n * k)), th = u => 5 + 15 * Math.pow(Math.sin(Math.PI * Math.min(1, u)), .4) + 2.5 * Math.sin(u * 31) * Math.sin(Math.PI * u);
  const path = () => { ctx.beginPath(); for (let i = 0; i <= m; i++) { const [px, py] = P[i]; i ? ctx.lineTo(px, py - th(i / n)) : ctx.moveTo(px, py - th(i / n)); } for (let i = m; i >= 0; i--) { const [px, py] = P[i]; ctx.lineTo(px, py + th(i / n) * .85); } ctx.closePath(); };
  ctx.save(); ctx.translate(5, 8); path(); ctx.fillStyle = 'rgba(176,127,37,.28)'; ctx.fill(); ctx.restore();
  path(); ctx.fillStyle = '#FFFCF4'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); path(); ctx.clip();
  ctx.strokeStyle = 'rgba(217,164,65,.35)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= m; i++) { const [px, py] = P[i]; i ? ctx.lineTo(px, py + 5) : ctx.moveTo(px, py + 5); } ctx.stroke();
  for (let i = 0; i < 70; i++) { const u = hash(i * 3.7), [px, py] = P[Math.round(u * n)]; ctx.fillStyle = i % 3 ? 'rgba(190,160,110,.35)' : 'rgba(255,255,255,.9)'; ctx.fillRect(px + (hash(i) - .5) * 10, py + (hash(i * 9.1) - .5) * 18, 2.5, 2.5); }
  // a glint travelling along the fresh lime
  const gx = lerp(x0 - 200, x1 + 200, (t * .22) % 1); const gg = ctx.createLinearGradient(gx - 60, 0, gx + 60, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gg; ctx.fillRect(x0, y - 30, x1 - x0, 60);
  ctx.restore();
  return P[m];
}
function concl_signature(ctx, t, t0, cx, cy, size) {
  const s = CONCL.site;
  ctx.save(); setFont(ctx, size, FONT.title, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const total = ctx.measureText(s).width, x0 = cx - total / 2;
  for (const pass of [0, 1]) for (let i = 0; i < s.length; i++) {
    const k = inv(t0 + i * .055, t0 + i * .055 + .45, t); if (k <= 0) continue;
    // glyph i starts at width(prefix incl. i) − advance(i): keeps the font's kerning pairs (e.g. « Va »)
    const cw = ctx.measureText(s[i]).width, left = ctx.measureText(s.slice(0, i + 1)).width - cw;
    ctx.save(); ctx.translate(x0 + left + cw / 2, cy + (1 - easeOut(k)) * 30); const sc = lerp(.5, 1, easeOutBack(k, 1.2)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.5);
    if (pass === 0) { ctx.fillStyle = 'rgba(176,127,37,.30)'; ctx.fillText(s[i], 5, 7); }
    else { ctx.fillStyle = i >= 15 ? C.terracotta : C.ink; ctx.fillText(s[i], 0, 0); }
    ctx.restore();
  }
  ctx.restore();
  return total;
}
function concl_endCard(ctx, S, t, t0) {
  paperBg(ctx, '#FBF4E7', '#F0E2CA');
  const g = ctx.createRadialGradient(960, 470, 60, 960, 470, 900); g.addColorStop(0, 'rgba(255,236,190,.75)'); g.addColorStop(1, 'rgba(255,236,190,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // drifting vapour puffs (the walls breathe…)
  for (let i = 0; i < 9; i++) { const u = (t * .05 + hash(i * 3.3)) % 1, x = 120 + hash(i * 7.9) * 1680, y = 1040 - u * 1100; puff(ctx, x + Math.sin(u * 6 + i) * 30, y, 22 + hash(i) * 26, .32 * Math.sin(u * Math.PI), '#FFFFFF'); }
  // tagline
  const tk = appear(t, t0 + 1.9, .8);
  text(ctx, 'Rénover le bâti ancien avec des matériaux qui respirent', 960, 322 + (1 - tk) * -16, { size: 60, font: FONT.hand, weight: 700, color: C.terracotta, alpha: tk });
  // signature
  const sigT = t0 + .5, size = 136;
  const tw = concl_signature(ctx, t, sigT, 960, 478, size);
  // trowel stroke of lime underneath, drawn by a trowel
  const uk = appear(t, sigT + 1.35, .85, ease);
  const end = concl_limeStroke(ctx, 960 - tw / 2 - 14, 960 + tw / 2 + 14, 572, uk, t);
  const trk = Math.min(appear(t, sigT + 1.2, .25), 1 - appear(t, sigT + 2.25, .35));
  if (end && trk > 0) { ctx.save(); ctx.globalAlpha *= trk; concl_trowel(ctx, end[0] + 6, end[1] - 10 - (1 - trk) * 40, .62, -1.1 + Math.sin(t * 9) * .05); ctx.restore(); }
  // the five rules as a little row of icons
  for (let i = 0; i < 5; i++) { const k = appear(t, sigT + 2.2 + i * .14, .5, x => x); if (k <= 0) continue; ctx.save(); ctx.translate(960 + (i - 2) * 112, 712 + Math.sin(t * 1.6 + i) * 4); const sc = easeOutBack(k, 2.2) * .9; ctx.scale(sc, sc); concl_icon(ctx, i, 0, 0, 44, t); ctx.restore(); }
  // credits
  text(ctx, 'Illustrations & animation : Valeriansauvage.fr', 960, 990, { size: 30, font: FONT.body, weight: 700, color: C.inkSoft, alpha: appear(t, S.cueEnd(7) + .45, .7) });
}

// ---------- the scene ----------
scene('conclusion', (ctx, S) => {
  const t = S.t, c = S.cue, ce = S.cueEnd, at = (i, f) => lerp(c(i), ce(i), f);
  const sunK = appear(t, ce(5) + .05, 1.1, smooth), boardOut = easeIn(inv(ce(5) + .05, ce(5) + 1.0, t));
  const tw0 = at(7, .58), wipe = inv(tw0, tw0 + .8, t);

  if (wipe < 1) {
    if (sunK < 1) {
      paperBg(ctx);
      for (let i = 0; i < 7; i++) { const u = (t * .06 + hash(i * 5.3)) % 1; puff(ctx, 80 + hash(i * 9.1) * 1760, 1060 - u * 1100, 26 + hash(i) * 30, .28 * Math.sin(u * Math.PI), '#FFFFFF'); }
    }
    if (sunK > 0) {
      ctx.save(); ctx.globalAlpha = sunK; const z = lerp(1.07, 1, easeOut(sunK)) + .006 * Math.sin(t * .3);
      ctx.translate(W / 2, H * .6); ctx.scale(z, z); ctx.translate(-W / 2, -H * .6); concl_sunset(ctx, S, t); ctx.restore();
    }
    if (boardOut < 1) {
      const kin = appear(t, .25, .9, x => x), dy = (1 - easeOutBack(kin, 1.2)) * 1150;
      ctx.save(); ctx.translate(-boardOut * 1750, dy + boardOut * 60); ctx.rotate(-boardOut * .08); concl_board(ctx, S, t); ctx.restore();
    }
  }
  if (wipe > 0) {
    // the end card is plastered over the scene by a big trowel
    const ex = lerp(-420, W + 420, ease(wipe)), edge = y => ex - (y - H / 2) * .22 + Math.sin(y * .018 + 1) * 16;
    ctx.save();
    if (wipe < 1) { ctx.beginPath(); ctx.moveTo(-20, -20); for (let i = 0; i <= 24; i++) { const y = -20 + i * (H + 40) / 24; ctx.lineTo(edge(y), y); } ctx.lineTo(-20, H + 20); ctx.closePath(); ctx.clip(); }
    concl_endCard(ctx, S, t, tw0);
    ctx.restore();
    if (wipe < 1) {
      ctx.save(); ctx.beginPath(); for (let i = 0; i <= 24; i++) { const y = -20 + i * (H + 40) / 24; i ? ctx.lineTo(edge(y), y) : ctx.moveTo(edge(y), y); }
      ctx.strokeStyle = 'rgba(176,127,37,.35)'; ctx.lineWidth = 14; ctx.stroke(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      concl_trowel(ctx, edge(H * .56) - 30, H * .56, 2.1, -1.35 + Math.sin(t * 7) * .04);
    }
  }

  // Margot
  const cnt = i => [c(i), 'count'], pl = i => [c(i) + 2.0, 'pointL'];
  const keys = [[0, 'idle'], [c(0), 'explain'], [c(0) + 1.5, 'count'], pl(0), cnt(1), pl(1), cnt(2), pl(2), cnt(3), pl(3), cnt(4), pl(4), cnt(5), [c(5) + 1.8, 'pointL'],
    [ce(5) + .1, 'open'], [at(6, .45), 'explain'], [at(6, .8), 'cheer'], [c(7), 'wave']];
  let pose = poseAt(t, keys);
  if (t > c(7)) {
    // keep waving with the right hand; the left (trowel) arm points at the website for a moment
    const wv = (Math.sin((t - c(7)) * 7.5) * 16 - 6) * clamp((pose.R[0] - 100) / 30);
    const pk = Math.min(ease(inv(tw0 + 4.4, tw0 + 4.9, t)), 1 - ease(inv(tw0 + 6.2, tw0 + 6.7, t)));
    pose = { L: [lerp(pose.L[0], 98, pk), lerp(pose.L[1], 2, pk)], R: [pose.R[0], pose.R[1] + wv], sh: pose.sh };
  }
  const mx = t < ce(5) ? lerp(2150, CONCL.mx, easeOut(inv(.3, 1.3, t))) : t < tw0 ? lerp(CONCL.mx, 1560, ease(inv(ce(5) + .1, ce(5) + 1.4, t))) : lerp(1560, 1722, ease(inv(tw0 + .1, tw0 + 1.1, t)));
  const lkeys = [[0, 0]]; for (let i = 0; i <= 5; i++) lkeys.push([c(i) + (i ? 0 : 1.5), 0], [c(i) + 2.0, -1]);
  lkeys.push([ce(5) + .1, -.6], [c(7), 0], [tw0 + 4.4, -1], [tw0 + 6.2, 0]);
  const lk = concl_keyed(t, lkeys);
  const expr = t > tw0 + 6 ? 'wink' : 'happy';
  presenter(ctx, { x: mx, y: CONCL.my, s: CONCL.ms, pose, T: S.T, look: lk, expr });
  // fingers: how many rules so far
  let n = 1; for (let i = 1; i <= 5; i++) if (t >= c(i) - .1) n = i;
  if (t < ce(5) + .3) concl_fingers(ctx, mx, CONCL.my, CONCL.ms, pose, S.T, n, clamp((pose.R[0] - 100) / 22));
  else if (t > c(7)) concl_fingers(ctx, mx, CONCL.my, CONCL.ms, pose, S.T, 5, clamp((pose.R[0] - 115) / 20));   // open hand to wave goodbye

  // very slight fade to paper at the very end
  const fk = appear(t, S.d - .5, .5, smooth);
  if (fk > 0) { ctx.fillStyle = rgba(C.paper, .28 * fk); ctx.fillRect(0, 0, W, H); }
});

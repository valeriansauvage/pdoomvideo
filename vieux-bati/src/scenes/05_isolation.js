// 05_isolation.js — Chapitre 4 « Sur-isolation et ventilation »
// A  maison emmitouflée (écharpe) + étiquette DPE → « Isoler = bien »
// B  maison neuve (parpaings) vs mur ancien → « = ? » → tampon « ✘ même recette »
// C1 coupe de mur « recette moderne » : polystyrène, laine minérale, pare-vapeur, fenêtres étanches, pas de VMC
//    → la vapeur traverse, courbe de température 20 → 0 °C, point de rosée, condensation, mur gorgé d'eau
// C2 la pièce : moisissures dans les angles / derrière l'armoire, hygromètre 72 %, acariens, odeurs, allergies, asthme
// D  coupe « solution » : fibre de bois / chanvre-chaux / liège, la vapeur passe ; VMC hygroréglable ou double flux
// E  récap : Isoler ✔  Laisser passer la vapeur ✔  Ventiler ✔
(() => {
'use strict';

// ------------------------------------------------------------------ geometry of the diagram panel / wall section
const PX0 = 350, PY0 = 104, PX1 = 1890, PY1 = 892, PW = PX1 - PX0, PH = PY1 - PY0;
const TOP = 236, FLOOR = 842, BOT = PY1;
const X_PLACO = 860, X_FILM = 876, X_WOOL = 884, X_STONE = 1024, X_EPS = 1314, X_COAT = 1434, X_EXT = 1442;
const X_EXT2 = 1332;                       // good case: lime render 1314..1332, outside from 1332
const TPTS = [[640, 20], [790, 19.8], [860, 19.3], [876, 19.1], [884, 19.0], [1024, 11.4], [1314, 8.2], [1434, .8], [1442, .6], [1560, .05], [1760, 0]];
const TY = T => 300 + (20 - T) * 15;       // temperature → y on the section
const DEW = 12, XDEW = 884 + (19.0 - DEW) / (19.0 - 11.4) * 140, YDEW = TY(DEW);
const tempAt = x => { if (x <= TPTS[0][0]) return TPTS[0][1]; for (let i = 1; i < TPTS.length; i++) if (x <= TPTS[i][0]) { const [a, ta] = TPTS[i - 1], [b, tb] = TPTS[i]; return lerp(ta, tb, (x - a) / (b - a)); } return 0; };
const tcol = T => mixColor('#2F72CF', '#DE4430', T / 20);
const GAPS = [392, 588, 776];               // leaks in the vapour barrier (y)
const POT = [680, 664];                     // steam source (cooking pot)
const VMC = [500, 300];                     // ventilation unit (good case)

// ------------------------------------------------------------------ generic helpers
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
// label with a leader line to (tx, ty)
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
function stampX(ctx, s, x, y, k, { color = C.danger, size = 54, rot = -.08, icon = 'cross' } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = lerp(2.2, 1, easeOut(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2);
  setFont(ctx, size, FONT.title, 700); const tw = ctx.measureText(s).width, iw = size * .9, w = tw + iw + 70, h = size * 1.55;
  fillRR(ctx, -w / 2, -h / 2, w, h, 16, 'rgba(255,255,255,.75)', color, 7);
  fillRR(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 11, null, rgba(color, .5), 2);
  if (icon === 'cross') cross(ctx, -w / 2 + 30 + iw / 2, 2, size * .62, color); else check(ctx, -w / 2 + 30 + iw / 2, 2, size * .8, color);
  text(ctx, s, -w / 2 + 40 + iw + tw / 2, 4, { size, font: FONT.title, weight: 700, color });
  ctx.restore();
}
function snow(ctx, t, x0, y0, w, h, n, seed, a = .9) {
  ctx.save(); ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const sp = 28 + hash(seed + i * 3.7) * 40, s = 2.5 + hash(seed + i * 1.3) * 3.5;
    const y = y0 + ((hash(seed + i * 9.1) * h + t * sp) % h);
    const x = x0 + (((hash(seed + i * 5.3) * w + Math.sin(t * .9 + i) * 16 + t * 9) % w) + w) % w;
    ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// cosy knitted scarf wrapped under the eaves of a house(cx, gy, w)
function scarf(ctx, cx, gy, w, k, t) {
  if (k <= 0) return;
  const h = w * .62, x = cx - w / 2, y = gy - h, bh = w * .1, x0 = x - 16, x1 = x + w + 16, by = y + 2;
  const kw = easeOut(clamp(k / .7)), kt = easeOutBack(clamp((k - .55) / .45));
  const cols = [C.terracotta, '#F0C24B', '#F7ECDD', '#F0C24B'], sw = bh * .8;
  ctx.save();
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 6, by - 20, (x1 - x0 + 12) * kw, bh + 50); ctx.clip();
  fillRR(ctx, x0 + 5, by + 8, x1 - x0, bh, bh * .45, 'rgba(0,0,0,.18)');
  rr(ctx, x0, by, x1 - x0, bh, bh * .45); ctx.save(); ctx.clip();
  for (let i = 0, xx = x0; xx < x1; i++, xx += sw) { ctx.fillStyle = cols[i % 4]; ctx.fillRect(xx, by, sw + 1, bh); }
  ctx.strokeStyle = 'rgba(70,30,20,.18)'; ctx.lineWidth = 2;
  for (let row = 0; row < 4; row++) { const yy = by + bh * (.14 + row * .22); ctx.beginPath(); for (let xx = x0; xx < x1; xx += 9) { ctx.moveTo(xx, yy); ctx.lineTo(xx + 4.5, yy + 5); ctx.lineTo(xx + 9, yy); } ctx.stroke(); }
  ctx.restore();
  rr(ctx, x0, by, x1 - x0, bh, bh * .45); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  if (kt > 0) {
    for (const [ox, ang, len] of [[w * .76, .2, w * .34], [w * .83, -.05, w * .28]]) {
      ctx.save(); ctx.translate(x + ox, by + bh * .55); ctx.rotate(ang + Math.sin(t * 2.2 + ox) * .05); ctx.scale(1, kt);
      const tw = bh * .78;
      fillRR(ctx, -tw / 2 + 4, 6, tw, len, 8, 'rgba(0,0,0,.15)');
      rr(ctx, -tw / 2, 0, tw, len, 8); ctx.save(); ctx.clip();
      for (let i = 0, yy = 0; yy < len; i++, yy += sw) { ctx.fillStyle = cols[i % 4]; ctx.fillRect(-tw / 2, yy, tw, sw + 1); }
      ctx.restore();
      rr(ctx, -tw / 2, 0, tw, len, 8); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
      for (let i = 0; i < 5; i++) { const fx = -tw / 2 + 6 + i * (tw - 12) / 4; line(ctx, fx, len, fx + Math.sin(t * 3 + i) * 3, len + 16, C.terracotta, 4); }
      ctx.restore();
    }
    blob(ctx, x + w * .8, by + bh * .55, bh * .42 * kt, 4, .12, 8, C.terracotta, C.ink, 4);
  }
  ctx.restore();
}
function snowCap(ctx, cx, gy, w) {
  const h = w * .62, x = cx - w / 2, y = gy - h, rh = w * .3;
  fillRR(ctx, x + w * .1, y - rh - 13, w * .8, 24, 12, '#FFFFFF', C.ink, 4);
  for (let i = 0; i < 9; i++) { const dx = x + w * (.15 + i * .088); ellipse(ctx, dx, y - rh + 10, 9 + (i % 3) * 3, 7 + (i % 2) * 5, '#FFFFFF'); }
}
const blockTex = (w, h) => cached(`iso_blocks|${w}|${h}`, w, h, g => {
  g.fillStyle = '#8F9599'; g.fillRect(0, 0, w, h);
  const r = rng(4), bh = h / 7, bw = bh * 2.05;
  for (let row = 0; row < 8; row++) { const off = (row % 2) * bw / 2; for (let x = -off; x < w; x += bw) {
    g.fillStyle = mixColor('#C3C7CA', '#A7ACB0', r()); g.fillRect(x + 2, row * bh + 2, bw - 4, bh - 4);
    for (let k = 0; k < 14; k++) { g.fillStyle = r() < .5 ? 'rgba(60,64,68,.18)' : 'rgba(255,255,255,.25)'; g.fillRect(x + r() * bw, row * bh + r() * bh, 2, 2); }
  } }
});
function modernHouse(ctx, cx, gy, w) {
  const h = w * .52, x = cx - w / 2, y = gy - h, rh = w * .17;
  ellipse(ctx, cx, gy + 6, w * .58, 16, 'rgba(0,0,0,.18)');
  fillRR(ctx, cx + w * .22, y - rh * .55 - 30, 20, 34, 3, '#8A9096', C.ink, 3);
  poly(ctx, [[x - w * .07, y + 6], [cx, y - rh], [x + w * 1.07, y + 6]], '#555C64', C.ink, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - w * .07, y + 6); ctx.lineTo(cx, y - rh); ctx.lineTo(x + w * 1.07, y + 6); ctx.closePath(); ctx.clip();
  for (let i = 1; i < 5; i++) line(ctx, x - w * .1, y - rh + i * rh / 5 + 3, x + w * 1.1, y - rh + i * rh / 5 + 3, 'rgba(25,28,32,.45)', 3);
  ctx.restore();
  fillRR(ctx, cx - w * .22, y - rh * .5 - 9, w * .44, 16, 8, '#FFFFFF', C.ink, 3);
  ctx.drawImage(blockTex(Math.round(w), Math.round(h)), x, y);
  const win = (wx, wy, ww, wh) => {
    fillRR(ctx, wx - 8, wy - 8, ww + 16, wh + 16, 3, '#3E444B', C.ink, 3);
    const gl = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh); gl.addColorStop(0, '#B5D8EA'); gl.addColorStop(1, '#6E9FC0');
    fillRR(ctx, wx, wy, ww, wh, 2, gl); line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, '#3E444B', 6);
    line(ctx, wx + ww * .12, wy + wh * .22, wx + ww * .3, wy + wh * .08, 'rgba(255,255,255,.65)', 4);
  };
  win(x + w * .09, y + h * .22, w * .26, h * .42); win(x + w * .65, y + h * .22, w * .26, h * .42);
  fillRR(ctx, cx - w * .075, y + h * .3, w * .15, h * .7, 3, '#5A6168', C.ink, 4);
  fillRR(ctx, cx - w * .02, y + h * .38, w * .04, h * .46, 2, '#B5D8EA');
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.strokeRect(x, y, w, h);
}
const DPE_COL = ['#2E9E4F', '#62B446', '#B4CC3A', '#F2D43B', '#F0A93A', '#E8742F', '#D64545'];
function dpe(ctx, cx, y, lvl) {
  const w = 420, h = 540, x = cx - w / 2;
  fillRR(ctx, x + 8, y + 10, w, h, 26, 'rgba(0,0,0,.15)'); fillRR(ctx, x, y, w, h, 26, '#FFFFFF', C.ink, 5);
  text(ctx, 'DPE', x + 30, y + 48, { size: 46, font: FONT.title, weight: 700, align: 'left' });
  text(ctx, 'énergie', x + 134, y + 52, { size: 30, font: FONT.title, weight: 600, align: 'left', color: C.inkSoft });
  for (let i = 0; i < 7; i++) {
    const by = y + 92 + i * 62, bw = 100 + i * 28, bx = x + 26;
    poly(ctx, [[bx, by], [bx + bw, by], [bx + bw + 22, by + 26], [bx + bw, by + 52], [bx, by + 52]], DPE_COL[i], C.ink, 3);
    text(ctx, 'ABCDEFG'[i], bx + 26, by + 28, { size: 34, font: FONT.title, weight: 700, color: '#FFFFFF', stroke: rgba(C.ink, .35), sw: 5 });
  }
  const py = y + 92 + lvl * 62 + 26, px = x + w - 22, li = clamp(Math.round(lvl), 0, 6);
  poly(ctx, [[px - 58, py], [px - 30, py - 30], [px + 6, py - 30], [px + 6, py + 30], [px - 30, py + 30]], C.ink);
  text(ctx, 'ABCDEFG'[li], px - 14, py + 2, { size: 38, font: FONT.title, weight: 700, color: DPE_COL[li] });
}

// ------------------------------------------------------------------ textures (cached)
const woolTex = () => cached('iso_wool', 140, 660, g => {
  g.fillStyle = '#F1D37C'; g.fillRect(0, 0, 140, 660);
  const r = rng(11); g.lineCap = 'round';
  for (let i = 0; i < 122; i++) {
    const y = i * 5.5 + r() * 4, amp = 3 + r() * 4, ph = r() * 6;
    g.strokeStyle = r() < .55 ? 'rgba(190,140,40,.45)' : 'rgba(255,246,205,.75)'; g.lineWidth = 1.6 + r() * 1.8;
    g.beginPath(); for (let x = -6; x <= 146; x += 6) { const yy = y + Math.sin(x * .11 + ph) * amp; x === -6 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
  }
});
const epsTex = () => cached('iso_eps', 128, 660, g => {
  g.fillStyle = '#F8F8F3'; g.fillRect(0, 0, 128, 660);
  const r = rng(21);
  for (let i = 0; i < 950; i++) { const x = r() * 128, y = r() * 660, s = 3.5 + r() * 4.5; g.strokeStyle = 'rgba(140,150,160,.32)'; g.lineWidth = 1.3; g.beginPath(); g.arc(x, y, s, 0, TAU); g.stroke(); }
});
const fiberTex = (w, h, seed = 3) => cached(`iso_fiber|${w}|${h}|${seed}`, w, h, g => {
  g.fillStyle = C.fiber; g.fillRect(0, 0, w, h);
  const r = rng(seed); g.lineCap = 'round';
  for (let i = 0; i < w * h / 40; i++) {
    const x = r() * w, y = r() * h, a = (r() - .5) * 1.1 + (r() < .3 ? Math.PI / 2 : 0), l = 6 + r() * 16;
    g.strokeStyle = r() < .5 ? 'rgba(112,72,36,.4)' : 'rgba(245,220,175,.5)'; g.lineWidth = 1 + r() * 1.5;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (r() - .5) * 4, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
});
const hempTex = (w, h, seed = 5) => cached(`iso_hemp|${w}|${h}|${seed}`, w, h, g => {
  g.fillStyle = C.hemp; g.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < w * h / 70; i++) { const x = r() * w, y = r() * h, a = r() * TAU, l = 5 + r() * 10, th = 2.5 + r() * 2.5;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = r() < .5 ? 'rgba(140,110,50,.6)' : 'rgba(252,244,220,.85)'; g.fillRect(-l / 2, -th / 2, l, th); g.restore(); }
});
const corkTex = (w, h, seed = 7) => cached(`iso_cork|${w}|${h}|${seed}`, w, h, g => {
  g.fillStyle = C.cork; g.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < w * h / 34; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 4.5; g.fillStyle = r() < .5 ? 'rgba(70,40,20,.42)' : 'rgba(214,165,112,.5)'; g.beginPath(); g.ellipse(x, y, s, s * (.6 + r() * .4), r() * 3, 0, TAU); g.fill(); }
});
const plasterTex = (w, h) => cached(`iso_plaster|${w}|${h}`, w, h, g => { g.drawImage(limeTexture(w, h, '#F1EADB', 6), 0, 0); });
const roomBg = () => cached('iso_room', 680, 656, g => {
  const gr = g.createLinearGradient(0, 0, 0, 606); gr.addColorStop(0, '#FAEBD1'); gr.addColorStop(1, '#F0D6B0');
  g.fillStyle = gr; g.fillRect(0, 0, 680, 606);
  for (let x = 10; x < 680; x += 50) { g.fillStyle = 'rgba(190,140,80,.07)'; g.fillRect(x, 0, 18, 606); }
  g.fillStyle = '#E4CDA8'; g.fillRect(0, 580, 680, 26); g.fillStyle = 'rgba(80,60,40,.3)'; g.fillRect(0, 580, 680, 3);
  g.fillStyle = '#B9814F'; g.fillRect(0, 606, 680, 50);
  g.strokeStyle = 'rgba(90,55,30,.45)'; g.lineWidth = 2;
  for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(0, 606 + 17 * i); g.lineTo(680, 606 + 17 * i); g.stroke(); }
  for (let i = 0; i < 14; i++) { const xx = (i * 83 + (i % 3) * 29) % 680, row = i % 3; g.beginPath(); g.moveTo(xx, 606 + 17 * row); g.lineTo(xx, 606 + 17 * row + 17); g.stroke(); }
  g.fillStyle = C.ink; g.fillRect(0, 604, 680, 4);
  // small framed picture
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(96, 226, 104, 80);
  g.fillStyle = '#9C6B43'; g.fillRect(88, 218, 104, 80); g.fillStyle = '#CFE6F0'; g.fillRect(98, 228, 84, 60);
  g.fillStyle = '#8DB86B'; g.beginPath(); g.moveTo(98, 288); g.quadraticCurveTo(130, 250, 182, 270); g.lineTo(182, 288); g.fill();
  g.fillStyle = '#F6C84C'; g.beginPath(); g.arc(160, 246, 9, 0, TAU); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(88, 218, 104, 80);
});
const extBg = () => cached('iso_ext', 560, 656, g => {
  const gr = g.createLinearGradient(0, 0, 0, 606); gr.addColorStop(0, '#B9D2E3'); gr.addColorStop(1, '#E7F0F5');
  g.fillStyle = gr; g.fillRect(0, 0, 560, 656);
  g.fillStyle = '#DCE8EF'; g.beginPath(); g.moveTo(0, 520); g.quadraticCurveTo(200, 430, 400, 500); g.quadraticCurveTo(480, 470, 560, 480); g.lineTo(560, 606); g.lineTo(0, 606); g.fill();
  g.fillStyle = '#F6F9FB'; g.beginPath(); g.moveTo(0, 570); g.quadraticCurveTo(170, 520, 330, 560); g.quadraticCurveTo(460, 530, 560, 556); g.lineTo(560, 606); g.lineTo(0, 606); g.fill();
  // bare tree
  g.strokeStyle = '#6E5A4A'; g.lineCap = 'round';
  const br = (x, y, a, l, w, n) => { const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); if (n > 0) { br(x2, y2, a - .45, l * .72, w * .66, n - 1); br(x2, y2, a + .38, l * .7, w * .66, n - 1); } };
  br(400, 606, -Math.PI / 2, 120, 14, 4);
  g.fillStyle = '#8C7A66'; g.fillRect(0, 606, 560, 50);
  g.fillStyle = 'rgba(60,45,30,.25)'; for (let i = 0; i < 40; i++) g.fillRect((i * 53) % 560, 620 + (i * 17) % 30, 6, 4);
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 598, 560, 14);
  g.fillStyle = C.ink; g.fillRect(0, 604, 560, 3);
});
const STONE = () => stoneTexture(290, 660, 4, { size: 62 });

// ------------------------------------------------------------------ section props
function stove(ctx, t) {
  fillRR(ctx, 606, 726, 156, 116, 8, '#F4F1EA', C.ink, 4);
  fillRR(ctx, 624, 768, 120, 56, 6, '#4B4B52', C.ink, 3);
  line(ctx, 636, 760, 732, 760, C.ink, 4);
  for (let i = 0; i < 4; i++) circle(ctx, 630 + i * 36, 742, 6, '#D0CBC0', C.ink, 2);
  // pot
  fillRR(ctx, 636, 684, 92, 44, [4, 4, 14, 14], '#C8643B', C.ink, 4);
  line(ctx, 628, 694, 638, 694, C.ink, 6); line(ctx, 726, 694, 736, 694, C.ink, 6);
  fillRR(ctx, 630, 674, 104, 12, 6, '#A9502E', C.ink, 4); circle(ctx, 682, 670, 6, '#A9502E', C.ink, 3);
  for (let i = 0; i < 4; i++) { const k = (t * .55 + i / 4) % 1; puff(ctx, 676 + Math.sin(k * 6 + i) * 12, 656 - k * 90, 10 + k * 16, .55 * Math.sin(k * Math.PI)); }
}
function windowIcon(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  fillRR(ctx, -62 + 6, -72 + 8, 124, 144, 10, 'rgba(0,0,0,.15)');
  fillRR(ctx, -62, -72, 124, 144, 10, '#FFFFFF', C.ink, 5);
  const gl = ctx.createLinearGradient(-50, -60, 50, 60); gl.addColorStop(0, '#BFE0F0'); gl.addColorStop(1, '#7FB3D2');
  fillRR(ctx, -50, -60, 46, 120, 4, gl, '#3A3A40', 5); fillRR(ctx, 4, -60, 46, 120, 4, gl, '#3A3A40', 5);
  line(ctx, -42, -36, -26, -50, 'rgba(255,255,255,.7)', 4); line(ctx, 12, -36, 28, -50, 'rgba(255,255,255,.7)', 4);
  // padlock
  ctx.save(); ctx.translate(46, 54);
  ctx.beginPath(); ctx.arc(0, -10, 13, Math.PI, 0); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke();
  fillRR(ctx, -20, -12, 40, 32, 6, '#E3B54B', C.ink, 4); circle(ctx, 0, 2, 4, C.ink);
  ctx.restore();
  ctx.restore();
}
function fanIcon(ctx, x, y, r, ang, kx, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  circle(ctx, 5, 8, r, 'rgba(0,0,0,.15)'); circle(ctx, 0, 0, r, '#FFFFFF', C.ink, 5);
  ctx.save(); ctx.rotate(ang);
  for (let i = 0; i < 4; i++) { ctx.rotate(TAU / 4); ctx.beginPath(); ctx.ellipse(r * .36, 0, r * .36, r * .16, .35, 0, TAU); ctx.fillStyle = '#9DB3C2'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
  circle(ctx, 0, 0, r * .14, '#5E6E7A', C.ink, 3);
  if (kx > 0) { ctx.globalAlpha *= clamp(kx * 2); circle(ctx, 0, 0, r * .92, null, C.danger, 9); const e = easeOut(kx); line(ctx, -r * .65, -r * .65, lerp(-r * .65, r * .65, e), lerp(-r * .65, r * .65, e), C.danger, 9); }
  ctx.restore();
}
function vmcUnit(ctx, x, y, k, ang, t) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2.5); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc);
  // ducts going up through the ceiling
  fillRR(ctx, -92, -110, 34, 80, 4, '#C9CED2', C.ink, 4); fillRR(ctx, 58, -110, 34, 80, 4, '#C9CED2', C.ink, 4);
  for (let i = 0; i < 4; i++) { line(ctx, -92, -100 + i * 18, -58, -100 + i * 18, 'rgba(0,0,0,.2)', 2); line(ctx, 58, -100 + i * 18, 92, -100 + i * 18, 'rgba(0,0,0,.2)', 2); }
  fillRR(ctx, -120 + 6, -40 + 8, 240, 92, 14, 'rgba(0,0,0,.15)');
  fillRR(ctx, -120, -40, 240, 92, 14, '#F4F6F7', C.ink, 5);
  // fan window
  circle(ctx, -52, 6, 34, '#DDE6EC', C.ink, 4);
  ctx.save(); ctx.translate(-52, 6); ctx.rotate(ang);
  for (let i = 0; i < 5; i++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.ellipse(15, 0, 15, 6, .4, 0, TAU); ctx.fillStyle = '#6F8796'; ctx.fill(); }
  ctx.restore(); circle(ctx, -52, 6, 6, C.ink);
  // heat exchanger (double flux) + humidity sensor
  rr(ctx, 4, -24, 60, 60, 6); ctx.fillStyle = '#E8EEF2'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  line(ctx, 4, -24, 64, 36, '#8FA3B0', 3); line(ctx, 64, -24, 4, 36, '#8FA3B0', 3);
  for (let i = 1; i < 4; i++) { line(ctx, 4 + i * 15, -24, 4 + i * 15, 36, 'rgba(143,163,176,.5)', 2); }
  drop(ctx, 92, 4, 10, C.water, C.ink);
  ctx.restore();
}

// ------------------------------------------------------------------ the scene
scene('isolation', (ctx, S) => {
  const t = S.t, d = S.d;
  const at = (i, f = 0) => S.cue(i) + f * (S.cueEnd(i) - S.cue(i));
  const tB = at(1) - .15, tC = at(2) - .05, tC2 = at(5, .509) - .35, tD = at(7) - .3, tE = at(9) - .35;
  const kAC = smooth(inv(tC - .3, tC + .3, t));
  const kCR = ease(inv(tC2, tC2 + .8, t));
  const kRD = ease(inv(tD, tD + .8, t));
  const kDE = ease(inv(tE, tE + .7, t));

  // camera: slow drift, always ≥ 1.01 zoom so the background covers the frame
  const cam = (fn) => {
    ctx.save();
    const cs = 1.014 + .006 * Math.sin(t * .21), dx = Math.sin(t * .17) * 7, dy = Math.cos(t * .13) * 4;
    ctx.translate(W / 2, H / 2); ctx.scale(cs, cs); ctx.translate(-W / 2 - dx, -H / 2 - dy);
    fn(); ctx.restore();
  };

  // ---------------------------------------------------------------- A/B outdoor
  if (kAC < 1) cam(() => {
    const zoom = 1 + ease(inv(tC - .6, tC + .3, t)) * 1.2;
    ctx.save();
    const kB = ease(inv(tB, tB + 1.1, t));
    const hx = lerp(640, 1110, kB), hw = lerp(560, 460, kB), gy = 830;
    // zoom towards the old wall during the transition to the section
    const zx = hx + hw * .2, zy = gy - hw * .3;
    ctx.translate(zx, zy); ctx.scale(zoom, zoom); ctx.translate(-zx, -zy);
    skyBg(ctx, t, { top: '#A3C6DD', bottom: '#EAF2F6', ground: '#EEF4F6', groundY: gy });
    ctx.fillStyle = '#D6E3EA'; ctx.fillRect(0, gy, W, 10);
    ellipse(ctx, 260, gy + 10, 420, 60, '#F6F9FB'); ellipse(ctx, 1500, gy + 14, 520, 70, '#F6F9FB');
    // modern house slides in from the left
    const mx = lerp(-420, 440, easeOut(inv(tB + .1, tB + 1.1, t)));
    if (t > tB) modernHouse(ctx, mx, gy, 460);
    const kScarf = appear(t, 2.3, 1.6, x => x) * (1 - appear(t, tB - .25, .5));
    house(ctx, hx, gy, hw, { finish: 'stone', t, seed: 3 });
    snowCap(ctx, hx, gy, hw);
    scarf(ctx, hx, gy, hw, kScarf, t);
    snow(ctx, t, 0, 0, W, gy + 30, 70, 5);
    // DPE label: class improves while the house gets wrapped
    const kD = appear(t, 2.4, .7, easeOutBack) * (1 - appear(t, tB - .2, .5, easeIn));
    if (kD > 0) {
      const lvl = lerp(6, 1, ease(inv(2.9, 4.6, t)));
      ctx.save(); ctx.translate(lerp(900, 0, kD), 0); ctx.globalAlpha *= clamp(kD * 2);
      dpe(ctx, 1190, 250, lvl);
      ctx.restore();
      ctx.save(); ctx.globalAlpha *= 1 - appear(t, tB - .2, .4);
      pill(ctx, 'Isoler = bien', 1190, 178, { k: appear(t, at(0, .64), .6), size: 48, icon: 'check', bg: '#E4F4E8', border: C.good, color: C.good });
      ctx.restore();
    }
    // B: comparison
    if (t > tB) {
      const kN = appear(t, tB + .9, .5), kO = appear(t, at(1, .29), .5), kQ = appear(t, at(1, .66), .5);
      pill(ctx, 'Maison neuve', mx, 878, { k: kN, size: 34 });
      pill(ctx, 'Mur ancien', hx, 878, { k: kO, size: 34 });
      if (kQ > 0) { ctx.save(); ctx.translate(778, 515 + Math.sin(t * 3) * 6); const s2 = easeOutBack(kQ); ctx.scale(s2, s2); text(ctx, '= ?', 0, 0, { size: 104, font: FONT.title, weight: 700, color: C.ink, stroke: C.paper, sw: 14 }); ctx.restore(); }
      stampX(ctx, 'même recette', 778, 285, appear(t, at(1, .8), .45), { color: C.danger, size: 58, rot: -.07 });
    }
    ctx.restore();
  });

  // ---------------------------------------------------------------- panel shots (C1, C2, D)
  if (t > tC - .3 && kDE < 1) {
    ctx.save(); ctx.globalAlpha *= kAC * (1 - kDE);
    paperBg(ctx);
    cam(() => {
      const s0 = lerp(1.06, 1, easeOut(kAC)) * lerp(1, .9, kDE);
      ctx.translate(W / 2 + 80, H / 2); ctx.scale(s0, s0); ctx.translate(-W / 2 - 80, -H / 2);
      const border = mixColor(C.ink, C.good, kRD);
      fillRR(ctx, PX0 + 9, PY0 + 12, PW, PH, 28, 'rgba(0,0,0,.16)');
      fillRR(ctx, PX0, PY0, PW, PH, 28, C.paper);
      ctx.save(); rr(ctx, PX0, PY0, PW, PH, 28); ctx.clip();
      if (kCR < 1) { ctx.save(); ctx.translate(PW * kCR, 0); sectionBad(ctx, t, S, at); ctx.restore(); }
      if (kCR > 0 && kRD < 1) { ctx.save(); ctx.translate(-PW * (1 - kCR) - PW * kRD, 0); roomView(ctx, t, S, at); ctx.restore(); }
      if (kRD > 0) { ctx.save(); ctx.translate(PW * (1 - kRD), 0); sectionGood(ctx, t, S, at, tD); ctx.restore(); }
      ctx.restore();
      fillRR(ctx, PX0, PY0, PW, PH, 28, null, border, 6);
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- E summary
  if (kDE > 0) {
    ctx.save(); ctx.globalAlpha *= kDE;
    paperBg(ctx);
    cam(() => summary(ctx, t, at));
    ctx.restore();
  }

  // ---------------------------------------------------------------- Margot
  const pose = poseAt(t, [
    [0, 'idle'], [at(0), 'explain'], [at(0, .46), 'count'], [at(0, .73), 'cheer'], [at(1) - .1, 'shrug'], [at(1, .29), 'pointL'], [at(1, .69), 'explain'],
    [at(2), 'point'], [at(2, .54), 'explain'], [at(2, .81), 'stop'], [at(3), 'explain'], [at(3, .24), 'point'], [at(3, .585), 'explain'],
    [at(4), 'think'], [at(4, .43), 'point'], [at(4, .62), 'open'], [at(5), 'shrug'], [at(5, .21), 'point'], [at(5, .5), 'pointUp'], [at(5, .84), 'point'],
    [at(6), 'think'], [at(6, .17), 'point'], [at(6, .52), 'count'], [at(6, .9), 'shrug'],
    [at(7), 'open'], [at(7, .18), 'explain'], [at(7, .52), 'point'], [at(7, .71), 'count'], [at(7, .87), 'point'], [at(8), 'pointUp'], [at(8, .5), 'point'],
    [at(9), 'count'], [at(9, .35), 'explain'], [at(9, .75), 'cheer'], [at(9) + 4.1, 'open'],
  ]);
  const expr = t < at(0, .46) ? 'happy' : t < at(0, .7) ? 'serious' : t < at(1) - .1 ? 'happy' : t < at(3) ? 'serious' : t < at(4, .6) ? 'happy' : t < at(5) - .2 ? 'surprised' : t < at(7) - .2 ? 'worried' : 'happy';
  cam(() => {
    if (t < tC) {
      const kOut = easeIn(inv(tC - .55, tC - .05, t));
      presenter(ctx, { x: 1655 + kOut * 560, y: 1000, s: .9, T: S.T, pose, expr, look: -.55 });
    } else {
      const kIn = easeOut(inv(tC + .05, tC + .7, t));
      const ex = lerp(175, 250, kDE), es = lerp(.76, .88, kDE);
      presenter(ctx, { x: lerp(-260, ex, kIn), y: 1000, s: es, T: S.T, pose, expr, look: .55, lookY: t > at(5, .5) && t < at(5, .84) ? -.6 : 0 });
    }
  });
});

// ================================================================== C1: the "modern recipe" wall section
function sectionBad(ctx, t, S, at) {
  const kEps = appear(t, at(2) + .22, .8), kWool = appear(t, at(2, .2), .8), kFilm = appear(t, at(2, .32), 1.1);
  const kWin = appear(t, at(2, .54), .6) * (1 - appear(t, at(3) - .4, .5)), kFan = appear(t, at(2, .82), .6) * (1 - appear(t, at(3) - .4, .5));
  const tVap = at(3) + .1, tLiq = at(4, .62), kCurve = inv(at(3, .585), at(3, .585) + 2.2, t), kGrad = appear(t, at(3, .55), 1.2, smooth);
  const kDewL = appear(t, at(4), .8), kDewP = appear(t, at(4, .43), .6);
  const kWet = .3 * appear(t, tLiq + .3, 2.2, smooth) + .7 * appear(t, at(5), 2.6, smooth);
  const kSag = appear(t, at(5, .21), 1.6, ease), kGauge = appear(t, at(5, .19), .6), gv = lerp(1, .32, ease(inv(at(5, .21) + .2, at(5, .21) + 1.9, t)));
  const kBlock = appear(t, at(5) + .3, .7);
  const dim = 1 - .45 * appear(t, at(5), 1);  // curve fades a bit when the damage starts

  // backgrounds
  ctx.drawImage(roomBg(), PX0, TOP);
  ctx.drawImage(extBg(), X_EXT2, TOP);
  snow(ctx, t, X_EXT2, TOP, PX1 - X_EXT2, FLOOR - TOP, 26, 9, .9);
  const gl = ctx.createRadialGradient(470, 330, 10, 470, 330, 380); gl.addColorStop(0, 'rgba(255,214,140,.28)'); gl.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = gl; ctx.fillRect(PX0, TOP, 530, FLOOR - TOP);
  stove(ctx, t);
  // stone wall
  ctx.drawImage(STONE(), X_STONE, TOP);
  line(ctx, X_STONE, TOP, X_STONE, BOT, C.ink, 3); line(ctx, X_EPS, TOP, X_EPS, BOT, C.ink, 3);
  // wetting of the stone
  if (kWet > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(X_STONE, TOP, X_EPS - X_STONE, BOT - TOP); ctx.clip();
    const g = ctx.createLinearGradient(X_STONE, 0, X_STONE + 70 + 230 * kWet, 0); g.addColorStop(0, rgba('#245E96', .62 * kWet)); g.addColorStop(1, rgba('#245E96', 0));
    ctx.fillStyle = g; ctx.fillRect(X_STONE, TOP, X_EPS - X_STONE, BOT - TOP);
    const g2 = ctx.createLinearGradient(0, BOT, 0, BOT - 380 * kWet); g2.addColorStop(0, rgba('#245E96', .55 * kWet)); g2.addColorStop(1, rgba('#245E96', 0));
    ctx.fillStyle = g2; ctx.fillRect(X_STONE, TOP, X_EPS - X_STONE, BOT - TOP);
    const r = rng(77);
    for (let i = 0; i < 9; i++) { const bx = X_STONE + 20 + r() * 240, by = 420 + r() * 420, kk = clamp(kWet * 1.6 - r() * .6); if (kk > 0) blob(ctx, bx, by, (14 + r() * 26) * kk, i + 3, .3, 8, rgba('#1E4F80', .3)); }
    ctx.restore();
  }
  // polystyrene outside (+ thin render)
  if (kEps > 0) {
    const ox = (1 - easeOut(kEps)) * 300;
    ctx.save(); ctx.globalAlpha *= clamp(kEps * 2);
    ctx.drawImage(epsTex(), X_EPS + ox, TOP);
    ctx.fillStyle = '#E9E2D4'; ctx.fillRect(X_COAT + ox, TOP, 8, BOT - TOP);
    line(ctx, X_EPS + ox, TOP, X_EPS + ox, BOT, C.ink, 3); line(ctx, X_COAT + ox, TOP, X_COAT + ox, BOT, 'rgba(43,38,35,.5)', 2); line(ctx, X_EXT + ox, TOP, X_EXT + ox, BOT, C.ink, 3);
    ctx.restore();
  }
  // water blocked by the polystyrene: arrows from the stone that bump into the EPS
  if (kBlock > 0) {
    for (const [yy, dl] of [[500, 0], [640, .25], [770, .5]]) {
      const kk = clamp((kBlock - dl * .4) / .6); if (kk <= 0) continue;
      const bump = Math.max(0, Math.sin((t - at(5)) * 3.2 + yy)) * 6;
      arrow(ctx, 1180, yy, 1292 - bump, yy, { color: '#2F6FB0', lw: 7, head: 20, k: kk });
      if (kk > .8) { line(ctx, 1306, yy - 22, 1306, yy + 22, C.danger, 7); }
    }
  }
  // mineral wool (slides in from the room side), sags and gets damp
  if (kWool > 0) {
    const ox = -(1 - easeOut(kWool)) * 260, sag = 70 * kSag;
    const topAt = x => TOP + sag * (.5 + .5 * Math.sin(Math.PI * (x - X_WOOL) / 140));
    ctx.save(); ctx.globalAlpha *= clamp(kWool * 2); ctx.translate(ox, 0);
    if (sag > 0) { ctx.fillStyle = '#4C5C68'; ctx.fillRect(X_WOOL, TOP, 140, sag + 4); }
    ctx.beginPath(); ctx.moveTo(X_WOOL, topAt(X_WOOL)); for (let x = X_WOOL; x <= X_STONE; x += 10) ctx.lineTo(x, topAt(x)); ctx.lineTo(X_STONE, BOT); ctx.lineTo(X_WOOL, BOT); ctx.closePath();
    ctx.save(); ctx.clip();
    ctx.drawImage(woolTex(), X_WOOL, TOP + sag * .7);
    if (kSag > 0) {
      ctx.fillStyle = `rgba(95,105,112,${.42 * kSag})`; ctx.fillRect(X_WOOL, TOP, 140, BOT - TOP);
      const g = ctx.createLinearGradient(X_WOOL, 0, X_STONE, 0); g.addColorStop(0, 'rgba(36,94,150,0)'); g.addColorStop(1, rgba('#245E96', .45 * kWet)); ctx.fillStyle = g; ctx.fillRect(X_WOOL, TOP, 140, BOT - TOP);
      const g2 = ctx.createLinearGradient(0, BOT, 0, BOT - 300); g2.addColorStop(0, rgba('#245E96', .5 * kSag)); g2.addColorStop(1, 'rgba(36,94,150,0)'); ctx.fillStyle = g2; ctx.fillRect(X_WOOL, TOP, 140, BOT - TOP);
    }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X_WOOL, topAt(X_WOOL)); for (let x = X_WOOL; x <= X_STONE; x += 10) ctx.lineTo(x, topAt(x)); ctx.stroke();
    if (kSag > 0) for (const xx of [920, 990]) arrow(ctx, xx, TOP + 8, xx, TOP + 8 + 40 * kSag, { color: '#F4F4F4', lw: 5, head: 14, k: kSag });
    ctx.restore();
  }
  // vapour barrier film + plasterboard (unrolled from the top)
  if (kFilm > 0) {
    const yb = lerp(TOP, BOT, easeOut(kFilm));
    ctx.save(); ctx.beginPath(); ctx.rect(X_PLACO - 30, TOP, 70, yb - TOP); ctx.clip();
    ctx.fillStyle = 'rgba(140,200,228,.92)'; ctx.fillRect(X_FILM, TOP, 8, BOT - TOP);
    for (let y = TOP + 14; y < BOT; y += 64) line(ctx, X_FILM + 2, y, X_FILM + 6, y + 26, 'rgba(255,255,255,.9)', 2);
    ctx.fillStyle = '#F2EFE9'; ctx.fillRect(X_PLACO, TOP, 16, BOT - TOP);
    line(ctx, X_PLACO, TOP, X_PLACO, BOT, C.ink, 3); line(ctx, X_FILM, TOP, X_FILM, BOT, 'rgba(43,38,35,.45)', 2); line(ctx, X_WOOL, TOP, X_WOOL, BOT, 'rgba(43,38,35,.45)', 2);
    // leaks: torn film, joint, electrical socket
    for (let i = 0; i < 3; i++) {
      const gy = GAPS[i];
      if (i < 2) { poly(ctx, [[X_PLACO, gy - 9], [X_PLACO + 9, gy - 3], [X_FILM + 4, gy - 10], [X_WOOL, gy - 2], [X_WOOL, gy + 6], [X_FILM + 2, gy + 9], [X_PLACO + 7, gy + 3], [X_PLACO, gy + 9]], '#3A3F44'); }
      else { fillRR(ctx, X_PLACO - 20, gy - 20, 22, 40, 4, '#FFFFFF', C.ink, 3); circle(ctx, X_PLACO - 9, gy - 7, 3, C.ink); circle(ctx, X_PLACO - 9, gy + 7, 3, C.ink); ctx.fillStyle = '#3A3F44'; ctx.fillRect(X_PLACO, gy - 5, 24, 10); }
    }
    ctx.restore();
    if (kFilm < 1) { ellipse(ctx, X_FILM + 4, yb, 20, 9, '#A8D5EA', C.ink, 3); }
  }
  // icons: sealed windows, no ventilation
  windowIcon(ctx, 488, 326, kWin, t);
  pill(ctx, 'Fenêtres étanches', 488, 436, { k: kWin, size: 24, pad: 14 });
  fanIcon(ctx, 738, 326, 60, 0, appear(t, at(2, .85), .5), kFan);
  pill(ctx, 'Pas de ventilation', 738, 436, { k: kFan, size: 24, pad: 14, color: C.danger });

  // temperature gradient overlay (warm → cold)
  if (kGrad > 0) {
    const g = ctx.createLinearGradient(PX0, 0, PX1, 0);
    TPTS.forEach(([x, T]) => g.addColorStop((x - PX0) / PW, rgba(tcol(T), .13)));
    ctx.save(); ctx.globalAlpha *= kGrad * dim; ctx.fillStyle = g; ctx.fillRect(PX0, TOP, PW, FLOOR - TOP); ctx.restore();
  }
  // vapour, fog and condensation
  vapourBad(ctx, t, tVap, tLiq, at);
  // efficiency gauge of the insulation
  if (kGauge > 0) effGauge(ctx, 480, 570, kGauge, gv, t);
  // temperature curve
  if (kCurve > 0) {
    ctx.save(); ctx.globalAlpha *= dim;
    tempCurve(ctx, kCurve, t);
    ctx.restore();
    pill(ctx, '20 °C', 585, 300, { k: appear(t, at(3, .585), .5), size: 30, color: '#C23B2A', bg: '#FFF1EC', border: '#C23B2A' });
    pill(ctx, '0 °C', 1814, 600, { k: appear(t, at(3, .585) + 2.2, .5), size: 30, color: '#2F64B8', bg: '#EEF4FD', border: '#2F64B8' });
  }
  // dew point
  if (kDewL > 0) {
    ctx.save(); ctx.globalAlpha *= kDewL;
    ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 20;
    line(ctx, 630, YDEW, lerp(630, 1780, easeOut(kDewL)), YDEW, '#2F72CF', 4, 'butt');
    ctx.setLineDash([]); ctx.restore();
    pill(ctx, '12 °C', 585, YDEW, { k: kDewL, size: 26, color: '#2F64B8', bg: '#EEF4FD', border: '#2F64B8' });
  }
  if (kDewP > 0) {
    ctx.save(); ctx.globalAlpha *= kDewP;
    ctx.setLineDash([9, 9]); line(ctx, XDEW, YDEW, XDEW, lerp(YDEW, FLOOR - 4, easeOut(kDewP)), 'rgba(47,114,207,.85)', 3, 'butt'); ctx.setLineDash([]);
    const pr = 16 + 5 * Math.sin(t * 5);
    circle(ctx, XDEW, YDEW, pr + 10, null, rgba('#2F72CF', .35), 4);
    circle(ctx, XDEW, YDEW, 13, '#FFFFFF', '#2F72CF', 6);
    ctx.restore();
    callout(ctx, 'Point de rosée', XDEW + 196, 340, XDEW + 14, YDEW - 12, kDewP, { size: 32, color: '#1F57A8', border: '#2F72CF', bg: '#FFFFFF', lineColor: '#2F72CF', dot: '#2F72CF' });
  }

  // header band
  line(ctx, PX0, TOP, PX1, TOP, C.ink, 4);
  const kZ = appear(t, at(2) - .1, .5);
  pill(ctx, 'Intérieur', 470, 168, { k: kZ, size: 30, bg: '#FBE7CC' });
  pill(ctx, 'Extérieur', 1724, 168, { k: kZ, size: 30, bg: '#E3EEF5' });
  callout(ctx, 'Mur en pierre', 1169, 205, 1169, TOP + 40, appear(t, at(2), .5), { size: 28 });
  callout(ctx, 'Polystyrène', 1390, 150, 1374, TOP + 40, appear(t, at(2) + .5, .5), { size: 28 });
  callout(ctx, 'Laine minérale', 968, 150, 954, TOP + 40, appear(t, at(2, .22) + .3, .5), { size: 28 });
  callout(ctx, 'Pare-vapeur', 772, 205, X_FILM + 4, TOP + 40, appear(t, at(2, .33) + .3, .5), { size: 28 });
}

function tempCurve(ctx, k, t) {
  const pts = TPTS.map(([x, T]) => [x, TY(T)]), xA = pts[0][0], xB = pts[pts.length - 1][0], xe = lerp(xA, xB, easeOut(clamp(k)));
  ctx.save(); ctx.beginPath(); ctx.rect(xA - 30, 0, xe - xA + 30, H); ctx.clip();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 18; ctx.stroke();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.stroke();
  const g = ctx.createLinearGradient(xA, 0, xB, 0); TPTS.forEach(([x, T]) => g.addColorStop((x - xA) / (xB - xA), tcol(T)));
  ctx.strokeStyle = g; ctx.lineWidth = 7; ctx.stroke();
  ctx.restore();
  circle(ctx, xA, pts[0][1], 9, tcol(20), C.ink, 3);
  if (k < 1) { // travelling probe showing the falling temperature
    const T = tempAt(xe), y = TY(T);
    circle(ctx, xe, y, 11, tcol(T), C.ink, 3);
    pill(ctx, Math.round(T) + ' °C', xe, y - 46, { k: 1, size: 26, color: '#FFFFFF', bg: tcol(T), border: C.ink, pad: 12 });
  } else circle(ctx, xB, pts[pts.length - 1][1], 9, tcol(0), C.ink, 3);
}

// vapour puffs (room → leaks in the barrier → through the wool → stop at the cold zone), fog band, then droplets
function vapourBad(ctx, t, t0, tLiq, at) {
  if (t < t0) return;
  const dt = .2, life = 3.6, tStop = at(5, .55);
  const pathAt = (j, u) => {
    const r1 = hash(j * 3.1 + 1), r2 = hash(j * 7.7 + 2), r3 = hash(j * 1.3 + 5);
    const gy = GAPS[j % 3], s0 = [POT[0] + (r1 - .5) * 50, POT[1] - r2 * 30], c1 = [s0[0] + 60, Math.min(s0[1], gy) - 110];
    const e = [XDEW - 6, clamp(gy + (r3 - .5) * 170, 300, FLOOR - 26)];
    if (u < .55) { const v = smooth(u / .55); const a = (1 - v) * (1 - v), b = 2 * (1 - v) * v, c = v * v; return [a * s0[0] + b * c1[0] + c * (X_PLACO - 4), a * s0[1] + b * c1[1] + c * gy, 1]; }
    const v = easeOut((u - .55) / .45); return [lerp(X_PLACO - 4, e[0], v), lerp(gy, e[1], smooth(v)), 1 - v];
  };
  // fog accumulating at the cold zone before it condenses
  const kFog = appear(t, at(3, .62), 2.6, smooth) * (1 - appear(t, tLiq, .45));
  if (kFog > 0) for (let i = 0; i < 10; i++) vpuff(ctx, XDEW - 8 + Math.sin(t * 1.3 + i) * 4, 330 + i * 52, 20 + Math.sin(t + i * 2) * 3, .6 * kFog, '#CFE6F7');
  // puffs
  const j0 = Math.max(0, Math.floor((t - t0 - life) / dt)), j1 = Math.floor((t - t0) / dt);
  for (let j = j0; j <= j1; j++) {
    const tj = t0 + j * dt, a = t - tj; if (a < 0 || a > life || tj > tStop) continue;
    const u = a / life, [x, y, roomK] = pathAt(j, u), coldK = clamp((x - X_PLACO) / (XDEW - X_PLACO));
    let al = .85 * clamp(a / .3);
    const ends = tj + life;
    al *= ends < tLiq ? 1 - smooth((u - .82) / .18) : 1 - smooth((u - .9) / .1);
    const r = lerp(17, 9, coldK) + Math.sin(a * 3 + j) * 1.5;
    vpuff(ctx, x, y + Math.sin(a * 2.4 + j) * 4, r, al, mixColor('#F4FAFE', '#B9DAF2', coldK));
  }
  // droplets: initial burst when the fog condenses + one per puff that reaches the cold zone afterwards
  if (t < tLiq) return;
  const drawDrop = (x, y0, tb, hold, v, s) => {
    const b = t - tb; if (b < 0) return;
    const pop = easeOutBack(clamp(b / .35));
    const fall = Math.max(0, b - hold), y = Math.min(FLOOR - 10, y0 + v * fall + 26 * fall * fall);
    const fade = y >= FLOOR - 10 ? 1 - clamp((b - hold - (Math.sqrt(v * v + 104 * (FLOOR - 10 - y0)) - v) / 52) / .4) : 1;
    if (fade <= 0) return;
    if (fall > 0) line(ctx, x, Math.max(y0, y - 40), x, y, rgba('#3E9BDA', .35 * fade), s * .7);
    drop(ctx, x, y, s * pop, '#3E9BDA', C.ink, fade);
  };
  for (let i = 0; i < 13; i++) drawDrop(XDEW + (hash(i + 40) - .5) * 16, 330 + i * 40 + hash(i + 3) * 16, tLiq + i * .045, .4 + hash(i + 9) * 1.2, 30 + hash(i + 2) * 40, 9 + hash(i + 7) * 3);
  const jA = Math.max(0, Math.floor((t - t0 - life - 6) / dt));
  for (let j = jA; j <= j1; j++) {
    const tj = t0 + j * dt, te = tj + life; if (te < tLiq || te > t || tj > tStop) continue;
    const [x, y] = pathAt(j, 1);
    drawDrop(XDEW + (hash(j * 2.3) - .5) * 16, y, te, .5 + hash(j * 4.1) * 1.4, 30 + hash(j * 5.9) * 40, 8 + hash(j * 6.7) * 3);
  }
}

function effGauge(ctx, x, y, k, v, t) {
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  const r = 78, bx = -r - 26, by = -r - 74, bw = 2 * r + 52, bh = r + 160;
  fillRR(ctx, bx + 6, by + 8, bw, bh, 22, 'rgba(0,0,0,.15)');
  fillRR(ctx, bx, by, bw, bh, 22, '#FFFFFF');
  ctx.save(); rr(ctx, bx, by, bw, 46, [22, 22, 0, 0]); ctx.clip(); ctx.drawImage(woolTex(), bx, by, bw, 140); ctx.fillStyle = `rgba(95,105,112,${.4 * (1 - v)})`; ctx.fillRect(bx, by, bw, 46); ctx.restore();
  line(ctx, bx, by + 46, bx + bw, by + 46, C.ink, 3);
  text(ctx, 'Isolant', 0, by + 25, { size: 28, font: FONT.title, weight: 700, color: C.ink, stroke: 'rgba(255,255,255,.85)', sw: 6 });
  fillRR(ctx, bx, by, bw, bh, 22, null, C.ink, 5);
  const seg = [[0, .33, C.danger], [.33, .66, C.warn], [.66, 1, C.good]];
  for (const [a0, a1, c] of seg) { ctx.beginPath(); ctx.arc(0, 10, r - 12, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI); ctx.strokeStyle = c; ctx.lineWidth = 18; ctx.stroke(); }
  const vv = v + Math.sin(t * 9) * .012 * (v < .99 ? 1 : 0), ang = Math.PI + vv * Math.PI;
  line(ctx, 0, 10, Math.cos(ang) * (r - 20), 10 + Math.sin(ang) * (r - 20), C.ink, 7);
  circle(ctx, 0, 10, 10, C.ink);
  text(ctx, Math.round(v * 100) + ' %', 0, 48, { size: 36, font: FONT.title, weight: 700, color: v > .66 ? C.good : v > .4 ? C.warn : C.danger });
  text(ctx, 'efficacité', 0, 76, { size: 22, font: FONT.title, weight: 600, color: C.inkSoft });
  ctx.restore();
}

// ================================================================== C2: inside the room — mould, humidity, health
const MOLD = (() => {
  const r = rng(321), cl = [];
  const add = (ax, ay, dirs, n, size, delay) => { for (let i = 0; i < n; i++) { const [dx, dy] = dirs[i % dirs.length], f = Math.pow(r(), .9); cl.push({ x: ax + dx * f * size + (r() - .5) * 22, y: ay + dy * f * size + (r() - .5) * 22, r: 5 + r() * 15 * (1 - f * .6), d: delay + f * .55 + r() * .15, s: (r() * 1000) | 0 }); } };
  add(560, 190, [[1, .03], [0, 1], [-1, -.41]], 36, 200, 0);         // top-left corner
  add(1560, 190, [[-1, .03], [0, 1], [1, -.26]], 42, 230, .1);       // top-right corner
  add(1560, 760, [[-1, 0], [0, -1], [1, .4]], 24, 150, .3);          // bottom-right corner
  return cl;
})();
const MOLD2 = (() => { const r = rng(99), cl = []; for (let i = 0; i < 52; i++) { const f = r(); cl.push({ x: 1305 + r() * 235, y: 400 + Math.pow(r(), .6) * 350, r: 7 + r() * 20, d: f, s: (r() * 1000) | 0 }); } return cl; })();
function moldPatch(ctx, list, k, t) {
  if (k <= 0) return;
  for (const m of list) {   // soft halo
    const kk = easeOut(clamp((k - m.d * .6) / .4)); if (kk <= 0) continue;
    blob(ctx, m.x, m.y, m.r * 1.9 * kk, m.s, .25, 9, 'rgba(70,78,52,.16)');
  }
  for (const m of list) {   // dark core + speckles
    const kk = easeOut(clamp((k - m.d * .6) / .4)); if (kk <= 0) continue;
    blob(ctx, m.x, m.y, m.r * 1.05 * kk, m.s + 1, .3, 9, 'rgba(52,58,40,.55)');
    blob(ctx, m.x, m.y, m.r * .55 * kk, m.s + 2, .35, 8, 'rgba(26,29,22,.8)');
    for (let i = 0; i < 7; i++) { const a = i * 2.39 + m.s, d = m.r * (.6 + hash(m.s + i) * 1.1) * kk; circle(ctx, m.x + Math.cos(a) * d, m.y + Math.sin(a) * d * .9, (1.6 + hash(m.s * 3 + i) * 2.4) * kk, 'rgba(30,34,26,.7)'); }
  }
}
const ROOMV = () => cached('iso_roomview', PW, PH, g => {
  g.translate(-PX0, -PY0);
  const VP = [1060, 470];
  poly(g, [[PX0, PY0], [PX1, PY0], [1560, 190], [560, 190]], '#FBF3E6');
  poly(g, [[PX0, PY0], [560, 190], [560, 760], [PX0, PY1]], '#EED8B4');
  poly(g, [[1560, 190], [PX1, PY0], [PX1, PY1], [1560, 760]], '#E8CFA7');
  poly(g, [[560, 760], [1560, 760], [PX1, PY1], [PX0, PY1]], '#BC8656');
  g.strokeStyle = 'rgba(90,55,30,.45)'; g.lineWidth = 2;
  for (let i = 0; i <= 14; i++) { const bx = 560 + i * 1000 / 14, fx = VP[0] + (bx - VP[0]) * (PY1 - VP[1]) / (760 - VP[1]); g.beginPath(); g.moveTo(bx, 760); g.lineTo(fx, PY1); g.stroke(); }
  const bwg = g.createLinearGradient(0, 190, 0, 760); bwg.addColorStop(0, '#F6E7CD'); bwg.addColorStop(1, '#EFD9B5');
  g.fillStyle = bwg; g.fillRect(560, 190, 1000, 570);
  for (let x = 575; x < 1560; x += 52) { g.fillStyle = 'rgba(190,140,80,.07)'; g.fillRect(x, 190, 18, 570); }
  g.fillStyle = '#E2CAA2'; g.fillRect(560, 736, 1000, 24); g.fillStyle = 'rgba(80,60,40,.3)'; g.fillRect(560, 736, 1000, 3);
  g.strokeStyle = C.ink; g.lineWidth = 4; g.strokeRect(560, 190, 1000, 570);
  g.beginPath(); g.moveTo(PX0, PY0); g.lineTo(560, 190); g.moveTo(PX1, PY0); g.lineTo(1560, 190); g.moveTo(PX0, PY1); g.lineTo(560, 760); g.moveTo(PX1, PY1); g.lineTo(1560, 760); g.stroke();
  // window
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(848, 268, 196, 280);
  fillRR(g, 838, 256, 196, 280, 6, '#F7F3EC', C.ink, 4);
  const gl = g.createLinearGradient(0, 270, 0, 520); gl.addColorStop(0, '#9FBFD6'); gl.addColorStop(1, '#C9DDE8');
  fillRR(g, 854, 272, 76, 248, 3, gl, C.ink, 3); fillRR(g, 942, 272, 76, 248, 3, gl, C.ink, 3);
  fillRR(g, 822, 532, 228, 18, 4, '#E8E0D2', C.ink, 3);
  // radiator under the window
  fillRR(g, 866, 600, 140, 92, 8, '#F1EEE8', C.ink, 3); for (let i = 1; i < 7; i++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(866 + i * 20, 606, 3, 80); }
  // ceiling lamp
  line(g, 1060, 190, 1060, 236, C.ink, 3); poly(g, [[1030, 236], [1090, 236], [1104, 262], [1016, 262]], '#E9B949', C.ink, 3);
});
function wardrobe(ctx, x, y) {
  fillRR(ctx, x + 10, y + 12, 250, 440, 8, 'rgba(0,0,0,.22)');
  fillRR(ctx, x, y, 250, 440, 8, '#A87447', C.ink, 5);
  fillRR(ctx, x + 14, y + 18, 106, 380, 6, '#B98455', C.ink, 3); fillRR(ctx, x + 130, y + 18, 106, 380, 6, '#B98455', C.ink, 3);
  circle(ctx, x + 112, y + 210, 6, '#E3B54B', C.ink, 2); circle(ctx, x + 138, y + 210, 6, '#E3B54B', C.ink, 2);
  fillRR(ctx, x - 6, y - 14, 262, 20, 6, '#8E5F38', C.ink, 4);
  fillRR(ctx, x + 12, y + 440, 18, 16, 3, '#6E4A2D', C.ink, 2); fillRR(ctx, x + 220, y + 440, 18, 16, 3, '#6E4A2D', C.ink, 2);
}
function hygrometer(ctx, x, y, r, v, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  circle(ctx, 7, 10, r, 'rgba(0,0,0,.18)'); circle(ctx, 0, 0, r, '#FFFFFF', C.ink, 6);
  const a0 = Math.PI * .75, sw = Math.PI * 1.5, A = p => a0 + p / 100 * sw;
  for (const [p0, p1, c] of [[0, 40, '#E9C46A'], [40, 60, C.good], [60, 70, C.warn], [70, 100, C.danger]]) { ctx.beginPath(); ctx.arc(0, 0, r - 18, A(p0), A(p1)); ctx.strokeStyle = c; ctx.lineWidth = 16; ctx.stroke(); }
  for (let p = 0; p <= 100; p += 10) { const a = A(p); line(ctx, Math.cos(a) * (r - 32), Math.sin(a) * (r - 32), Math.cos(a) * (r - 40), Math.sin(a) * (r - 40), C.ink, 3); }
  const vv = v + Math.sin(t * 7) * .4, a = A(vv);
  line(ctx, 0, 0, Math.cos(a) * (r - 30), Math.sin(a) * (r - 30), C.ink, 7); circle(ctx, 0, 0, 10, C.ink);
  fillRR(ctx, -58, r * .3, 116, 50, 12, v > 70 ? C.danger : '#4B5A63', C.ink, 3);
  text(ctx, Math.round(v) + ' %', 0, r * .3 + 27, { size: 36, font: FONT.title, weight: 700, color: '#FFFFFF' });
  ctx.restore();
}
function iconBase(ctx, x, y, r, k, fn) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  circle(ctx, 5, 8, r, 'rgba(0,0,0,.18)'); circle(ctx, 0, 0, r, '#FFFFFF', C.ink, 5);
  fn(); ctx.restore();
}
function mite(ctx, t) {
  ctx.save(); ctx.rotate(Math.sin(t * 2) * .08);
  for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const a = (-.9 + i * .55) + Math.sin(t * 12 + i + sd) * .15; ctx.save(); ctx.scale(sd, 1); line(ctx, 14, -6 + i * 8, 14 + Math.cos(a) * 26, -6 + i * 8 + Math.sin(a) * 12 + 6, C.ink, 4); ctx.restore(); }
  ellipse(ctx, 0, 6, 24, 30, '#E8B9A0', C.ink, 4);
  for (let i = 0; i < 5; i++) line(ctx, -14 + i * 7, 18, -16 + i * 7, 26, 'rgba(120,70,50,.6)', 2);
  ellipse(ctx, 0, -26, 13, 11, '#D99C82', C.ink, 4);
  circle(ctx, -5, -27, 3.5, '#FFFFFF'); circle(ctx, 5, -27, 3.5, '#FFFFFF'); circle(ctx, -5, -27, 1.8, C.ink); circle(ctx, 5, -27, 1.8, C.ink);
  line(ctx, -6, -36, -12, -46, C.ink, 3); line(ctx, 6, -36, 12, -46, C.ink, 3);
  ctx.restore();
}
function smell(ctx, t) {
  // sock with wavy stink lines
  ctx.save(); ctx.translate(-6, 16);
  poly(ctx, [[-14, -26], [10, -26], [10, 6], [24, 14], [24, 28], [-14, 28]], '#D9D2C2', C.ink, 4);
  line(ctx, -14, -16, 10, -16, '#9DB3C2', 5);
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); const x0 = -18 + i * 16, ph = t * 4 + i;
    for (let k = 0; k <= 12; k++) { const yy = -12 - k * 3.4, xx = x0 + Math.sin(ph + k * .8) * 5; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.strokeStyle = '#7E9C4A'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
  }
}
function sneeze(ctx, t) {
  const p = (t * 1.1) % 1, burst = Math.max(0, Math.sin(p * Math.PI * 2));
  circle(ctx, -8, 0, 30, '#F3C9A2', C.ink, 4);
  line(ctx, -22, -8, -12, -4, C.ink, 3); line(ctx, -22, 0, -12, -4, C.ink, 3);
  line(ctx, 0, -8, -8, -4, C.ink, 3); line(ctx, 0, 0, -8, -4, C.ink, 3);
  circle(ctx, 8, 6, 8, '#E07A72', C.ink, 3);
  ellipse(ctx, -6, 18, 7, 5 + burst * 3, '#7A2E2A');
  for (let i = 0; i < 6; i++) { const a = -.6 + i * .24, rr2 = 30 + burst * 16; circle(ctx, 14 + Math.cos(a) * rr2, 8 + Math.sin(a) * rr2, 3, rgba('#7FB7E0', burst)); }
}
function inhaler(ctx, t) {
  ctx.save(); ctx.rotate(-.2);
  fillRR(ctx, -12, -40, 24, 44, 8, '#E46B5C', C.ink, 4);
  fillRR(ctx, -18, -2, 36, 32, 8, '#5B8FC9', C.ink, 4);
  fillRR(ctx, 12, 12, 26, 18, 5, '#5B8FC9', C.ink, 4);
  ctx.restore();
  for (let i = 0; i < 3; i++) { const k = (t * .9 + i / 3) % 1; puff(ctx, 34 + k * 20, 18 - k * 8, 4 + k * 8, .6 * (1 - k), '#CFE6F7'); }
}
function roomView(ctx, t, S, at) {
  ctx.drawImage(ROOMV(), PX0, PY0);
  const kM1 = appear(t, at(5, .55), 2.2, x => x), kSlide = appear(t, at(5, .84), .8, ease), kM2 = appear(t, at(5, .84) + .3, 1.6, x => x);
  const kH = appear(t, at(6, .12), .6), hv = lerp(55, 72, ease(inv(at(6, .17), at(6, .17) + 1.7, t)));
  const kHaze = appear(t, at(5, .55), 6, smooth);
  // condensation on the window
  ctx.save(); ctx.beginPath(); ctx.rect(854, 272, 164, 248); ctx.clip();
  ctx.fillStyle = `rgba(255,255,255,${.25 + .35 * kHaze})`; ctx.fillRect(854, 272, 164, 248);
  for (let i = 0; i < 14; i++) { const x = 860 + hash(i * 3.3) * 150, p = ((t * (.08 + hash(i) * .1) + hash(i * 7)) % 1), y = 280 + p * 240; drop(ctx, x, y, 5 + hash(i * 2) * 3, rgba('#6FA9D0', .9), null, .9 * kHaze); line(ctx, x, 280, x, y - 6, 'rgba(160,200,225,.35)', 3); }
  ctx.restore();
  // mould: corners, then behind the wardrobe
  moldPatch(ctx, MOLD, kM1, t);
  moldPatch(ctx, MOLD2, kM2, t);
  wardrobe(ctx, 1290 - 230 * kSlide, 312);
  if (kSlide > 0) arrow(ctx, 1240 - 230 * kSlide, 290, 1140 - 230 * kSlide, 290, { color: C.ink, lw: 6, head: 18, k: kSlide * (1 - appear(t, at(6), .4)) });
  // humid haze
  ctx.fillStyle = `rgba(160,182,196,${.16 * kHaze})`; ctx.fillRect(PX0, PY0, PW, PH);
  // callouts for the mould
  pill(ctx, 'Moisissures', 1360, 140, { k: appear(t, at(5, .62), .5) * (1 - appear(t, at(6) + 1.2, .4)), size: 30, color: C.moldDark, bg: '#EEF2E6', border: C.moldDark });
  // hygrometer + health issues
  hygrometer(ctx, 690, 410, 112, hv, kH, t);
  pill(ctx, 'Humidité', 690, 262, { k: kH, size: 28, bg: '#EEF4FD', color: '#245E96', border: '#245E96' });
  const items = [['Acariens', mite, .52], ['Odeurs', smell, .64], ['Allergies', sneeze, .82], ['Asthme', inhaler, .91]];
  items.forEach(([s, fn, f], i) => {
    const k = appear(t, at(6, f), .55), x = 660 + i * 186, y = 700 + Math.sin(t * 2 + i) * 4;
    iconBase(ctx, x, y, 62, k, () => fn(ctx, t));
    pill(ctx, s, x, y + 92, { k, size: 26, color: C.danger, bg: '#FFF4F1', border: C.danger });
  });
}

// ================================================================== D: the good section
function sectionGood(ctx, t, S, at, tD) {
  const kSol = appear(t, at(7) + .1, .6) * (1 - appear(t, at(8) - .3, .4));
  const kP1 = appear(t, at(7, .18), .5) * (1 - appear(t, at(8) - .3, .4)), kP2 = appear(t, at(7, .3), .5) * (1 - appear(t, at(8) - .3, .4));
  const kC = [appear(t, at(7, .52), .5), appear(t, at(7, .71), .5), appear(t, at(7, .87), .5)];
  const kFib = appear(t, at(7, .52) + .45, .9, easeOutBack), tVap = at(7, .18);
  const kVmc = appear(t, at(8) + .1, .7), kV1 = appear(t, at(8, .5), .5), kV2 = appear(t, at(8, .79), .5);
  ctx.drawImage(roomBg(), PX0, TOP);
  ctx.drawImage(extBg(), X_EXT2, TOP);
  snow(ctx, t, X_EXT2, TOP, PX1 - X_EXT2, FLOOR - TOP, 22, 11, .7);
  const gl = ctx.createRadialGradient(470, 330, 10, 470, 330, 380); gl.addColorStop(0, 'rgba(255,214,140,.28)'); gl.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = gl; ctx.fillRect(PX0, TOP, 530, FLOOR - TOP);
  stove(ctx, t);
  ctx.drawImage(STONE(), X_STONE, TOP);
  // lime render outside
  ctx.drawImage(limeTexture(18, 660, '#F1E9D8', 8), X_EPS, TOP);
  line(ctx, X_STONE, TOP, X_STONE, BOT, C.ink, 3); line(ctx, X_EPS, TOP, X_EPS, BOT, 'rgba(43,38,35,.6)', 2); line(ctx, X_EXT2, TOP, X_EXT2, BOT, C.ink, 3);
  // wood fibre board drops in, lime plaster on its face
  if (kFib > 0) {
    const oy = -(1 - kFib) * 640;
    ctx.save(); ctx.beginPath(); ctx.rect(PX0, TOP, PW, BOT - TOP); ctx.clip(); ctx.translate(0, oy);
    ctx.drawImage(fiberTex(140, 660), X_WOOL, TOP);
    ctx.drawImage(plasterTex(14, 660), X_WOOL - 14, TOP);
    line(ctx, X_WOOL - 14, TOP, X_WOOL - 14, BOT, C.ink, 3); line(ctx, X_WOOL, TOP, X_WOOL, BOT, 'rgba(43,38,35,.5)', 2);
    ctx.restore();
  }
  // vapour goes through and leaves outside; with the VMC part of it is extracted
  vapourGood(ctx, t, tVap, at(8) + .5);
  // VMC unit + airflows
  if (kVmc > 0) {
    const ang = t * 9;
    // stale humid air sucked from the room into the unit and out through the duct
    ctx.save(); ctx.globalAlpha *= kVmc;
    ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 60;
    arrow(ctx, 690, 640, VMC[0] - 30, VMC[1] + 70, { color: '#5E8FB5', lw: 7, head: 22, curve: .22 });
    arrow(ctx, VMC[0] - 75, VMC[1] - 90, VMC[0] - 75, PY0 + 18, { color: '#5E8FB5', lw: 7, head: 22 });
    arrow(ctx, VMC[0] + 75, PY0 + 18, VMC[0] + 75, VMC[1] - 90, { color: C.good, lw: 7, head: 22 });
    arrow(ctx, VMC[0] + 120, VMC[1] + 20, 760, 470, { color: C.good, lw: 7, head: 22, curve: .2 });
    ctx.setLineDash([]); ctx.restore();
    vmcUnit(ctx, VMC[0], VMC[1], kVmc, ang, t);
  }
  // header band
  line(ctx, PX0, TOP, PX1, TOP, C.ink, 4);
  pill(ctx, 'La solution', 520, 168, { k: kSol, size: 40, icon: 'check', color: C.good, bg: '#E4F4E8', border: C.good });
  pill(ctx, 'Perspirant', 540, 330, { k: kP1, size: 30, color: '#2F64B8', bg: '#EEF4FD', border: '#2F64B8' });
  pill(ctx, 'Capillaire', 540, 410, { k: kP2, size: 30, color: '#2F64B8', bg: '#EEF4FD', border: '#2F64B8' });
  if (kP1 > 0) { ctx.save(); ctx.globalAlpha *= kP1; puff(ctx, 420, 330, 12, .9, C.vapor); ctx.restore(); }
  if (kP2 > 0) drop(ctx, 432, 414, 10, C.water, C.ink, kP2);
  pill(ctx, 'VMC hygroréglable', 732, 150, { k: kV1, size: 27, pad: 14, color: '#245E96', border: '#245E96', bg: '#EEF4FD' });
  if (kV2 > 0) text(ctx, 'ou', 640, 206, { size: 38, font: FONT.hand, weight: 700, color: '#245E96', alpha: clamp(kV2 * 2) });
  pill(ctx, 'Double flux', 760, 206, { k: kV2, size: 27, pad: 14, color: '#245E96', border: '#245E96', bg: '#EEF4FD' });
  pill(ctx, 'Extérieur', 1724, 168, { k: 1, size: 30, bg: '#E3EEF5' });
  // material swatches
  const sw = [['Fibre de bois', fiberTex(158, 66, 13)], ['Chanvre-chaux', hempTex(158, 66, 15)], ['Liège', corkTex(158, 66, 17)]];
  sw.forEach(([s, tex], i) => {
    const k = kC[i]; if (k <= 0) return;
    const x = 954 + i * 192, y = 170;
    ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 2); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
    fillRR(ctx, -88 + 5, -56 + 7, 176, 112, 14, 'rgba(0,0,0,.15)');
    fillRR(ctx, -88, -56, 176, 112, 14, '#FFFFFF', i === 0 && kFib > .5 ? C.good : C.ink, i === 0 && kFib > .5 ? 5 : 4);
    ctx.save(); rr(ctx, -79, -47, 158, 60, 9); ctx.clip(); ctx.drawImage(tex, -79, -47); ctx.restore();
    rr(ctx, -79, -47, 158, 60, 9); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, s, 0, 35, { size: 25, font: FONT.title, weight: 600, maxW: 162 });
    ctx.restore();
  });
  pill(ctx, 'La vapeur passe', 1600, 300, { k: appear(t, at(7, .52) + 1.4, .5), size: 30, icon: 'check', color: C.good, bg: '#E4F4E8', border: C.good });
}
function vapourGood(ctx, t, t0, tV) {
  if (t < t0) return;
  const dt = .22, life = 5.2;
  const j0 = Math.max(0, Math.floor((t - t0 - life) / dt)), j1 = Math.floor((t - t0) / dt);
  for (let j = j0; j <= j1; j++) {
    const tj = t0 + j * dt, a = t - tj; if (a < 0 || a > life) continue;
    const r1 = hash(j * 3.1 + 1), r2 = hash(j * 7.7 + 2), r3 = hash(j * 1.3 + 5), u = a / life;
    const s0 = [POT[0] + (r1 - .5) * 50, POT[1] - r2 * 30];
    const vmc = tj > tV && j % 2 === 0;
    let x, y, al = .85 * clamp(a / .3), rad = 15;
    if (vmc) { // extracted by the VMC
      const v = smooth(clamp(u * 1.8)); x = lerp(s0[0], VMC[0] - 52, v); y = lerp(s0[1], VMC[1] + 12, v) - Math.sin(v * Math.PI) * 60; al *= 1 - smooth((u * 1.8 - .8) / .2); rad = lerp(15, 8, v);
    } else {
      const yA = clamp(360 + r3 * 430, 330, FLOOR - 30), wx = X_WOOL - 14;
      if (u < .3) { const v = smooth(u / .3); x = lerp(s0[0], wx, v); y = lerp(s0[1], yA, v) - Math.sin(v * Math.PI) * 50; }
      else if (u < .75) { const v = (u - .3) / .45; x = lerp(wx, X_EXT2, v); y = yA - v * 10 + Math.sin(a * 2 + j) * 4; rad = 12; }
      else { const v = (u - .75) / .25; x = X_EXT2 + v * 170; y = yA - 10 - easeIn(v) * 40 - v * 90; rad = 11 + v * 14; al *= 1 - v; }
    }
    vpuff(ctx, x, y, rad, al, x > X_WOOL - 20 && x < X_EXT2 ? '#DDEFFC' : '#F4FAFE');
  }
  // capillary moisture: small drops wandering out through the wall and evaporating at the surface
  for (let i = 0; i < 6; i++) {
    const p = ((t - t0) * .16 + i / 6) % 1, y = 380 + i * 72, x = lerp(X_STONE + 10, X_EXT2, p);
    if (t - t0 < i * .4) continue;
    const fa = 1 - smooth((p - .82) / .18);
    drop(ctx, x, y + Math.sin(t * 2 + i) * 3, 8, '#3E9BDA', C.ink, fa);
    if (p > .82) vpuff(ctx, X_EXT2 + (p - .82) * 300, y - (p - .82) * 260, 8 + (p - .82) * 40, .8 * Math.sin((p - .82) / .18 * Math.PI), '#EEF7FD');
  }
}

// ================================================================== E: summary
function summary(ctx, t, at) {
  const cards = [
    ['Isoler', null, at(9) + .05, (x, y, k) => { house(ctx, x, y + 92, 190, { finish: 'lime', smoke: false, t }); scarf(ctx, x, y + 92, 190, 1, t); }],
    ['Laisser passer', 'la vapeur', at(9, .35), (x, y) => {
      ctx.save(); rr(ctx, x - 40, y - 100, 80, 200, 8); ctx.clip(); ctx.drawImage(stoneTexture(80, 200, 6, { size: 40 }), x - 40, y - 100); ctx.restore();
      rr(ctx, x - 40, y - 100, 80, 200, 8); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
      for (let i = 0; i < 5; i++) { const p = (t * .35 + i / 5) % 1, px = lerp(x - 120, x + 120, p), py = y - 40 + (i % 3) * 40 - (p > .6 ? (p - .6) * 60 : 0); puff(ctx, px, py, 12 + (p > .6 ? (p - .6) * 30 : 0), .9 * Math.sin(p * Math.PI), p > .3 && p < .6 ? '#D9ECFA' : '#C6E2F6'); }
      arrow(ctx, x - 110, y + 70, x + 110, y + 70, { color: '#2F72CF', lw: 7, head: 20 });
    }],
    ['Ventiler', null, at(9, .75), (x, y) => {
      fanIcon(ctx, x, y - 6, 78, t * 6, 0, 1);
      ctx.save(); ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 50;
      arrow(ctx, x - 130, y - 70, x - 92, y - 40, { color: '#5E8FB5', lw: 6, head: 16 }); arrow(ctx, x + 92, y + 30, x + 132, y + 64, { color: '#5E8FB5', lw: 6, head: 16 });
      ctx.setLineDash([]); ctx.restore();
    }],
  ];
  const kT = appear(t, at(9) - .3, .6);
  if (kT > 0) {
    ctx.save(); ctx.translate(1180, 168); const sc = easeOutBack(kT); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kT * 3);
    text(ctx, 'La bonne recette', 0, 0, { size: 72, font: FONT.title, weight: 700, color: C.good, stroke: C.paper, sw: 12 });
    ctx.beginPath(); for (let i = 0; i <= 40; i++) { const xx = -300 + i * 15, yy = 52 + Math.sin(i * .7) * 4; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.strokeStyle = C.ochre; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
  }
  cards.forEach(([s1, s2, t0, draw], i) => {
    const k = appear(t, t0 - .15, .6), x = 760 + i * 420, y = 470 + Math.sin(t * 1.6 + i) * 5;
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3); ctx.translate(-x, -y);
    fillRR(ctx, x - 170 + 9, y - 170 + 12, 340, 340, 34, 'rgba(0,0,0,.15)');
    fillRR(ctx, x - 170, y - 170, 340, 340, 34, '#FFFFFF', C.ink, 6);
    ctx.save(); rr(ctx, x - 164, y - 164, 328, 328, 30); ctx.clip(); draw(x, y, k); ctx.restore();
    ctx.restore();
    badge(ctx, x + 150, y - 150, 40, appear(t, t0 + .25, .5));
    text(ctx, s1, x, 712, { size: 46, font: FONT.title, weight: 700, alpha: clamp(k * 2) });
    if (s2) text(ctx, s2, x, 766, { size: 46, font: FONT.title, weight: 700, alpha: clamp(k * 2) });
  });
}
})();

// 03_eau.js — Chapitre 2 « Nous sommes faits d'eau » (~35 s)
// Part 1: a glass human silhouette fills to 60 % with water.
// Part 2: a cutaway old stone house — a family of four makes vapour (breathing, sweating, cooking,
// showering, drying laundry) → 10 à 15 L / jour → it must get out → old house: chimney, wooden
// windows and breathing walls let it out → the house breathes, like us.
(() => {
'use strict';

// ------------------------------------------------------------------ geometry (world = screen at zoom 1)
const EH = {
  x0: 542, x1: 1478, wt: 54, gy: 880,               // outer wall faces, wall thickness, ground
  s1: 604, s1b: 626, s2: 336, s2b: 356,             // floor slabs (top, bottom)
  apex: [1010, 128], eL: [492, 356], eR: [1528, 356], // roof line
  p0: 1002, p1: 1018,                               // partition wall
  ch0: 1052, ch1: 1128, f0: 1072, f1: 1108, chTop: 84, hood: 690, // chimney column + flue channel
  winUR: [1146, 392, 92, 112], winLR: [1292, 652, 90, 108],      // back-wall wooden windows x,y,w,h
};
const BODY_H = 640;

// ------------------------------------------------------------------ small helpers
function eau_vap(ctx, x, y, r, a = .85) {          // vapour puff with a soft blue rim (readable on pale walls)
  if (a <= 0.01 || r <= 0) return;
  puff(ctx, x, y, r * 1.14, a * .55, '#86BFE6');
  puff(ctx, x, y, r, a, '#F2F9FE');
}
function eau_qbez(p0, p1, p2, u) { const v = 1 - u; return [v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]]; }

// ------------------------------------------------------------------ the glass body silhouette (feet at 0,0; 640 tall)
let eau_path = null;
function eau_silPath() {
  if (eau_path) return eau_path;
  const p = new Path2D(), h = Math.PI / 2;
  const cap = (x1, y1, x2, y2, r) => { const a = Math.atan2(y2 - y1, x2 - x1); p.moveTo(x1 + Math.cos(a + h) * r, y1 + Math.sin(a + h) * r); p.arc(x1, y1, r, a + h, a + 3 * h); p.arc(x2, y2, r, a - h, a + h); p.closePath(); };
  p.moveTo(70, -562); p.arc(0, -562, 70, 0, TAU); p.closePath();               // head
  p.roundRect(-26, -505, 52, 60, 12);                                         // neck
  p.moveTo(-66, -472); p.lineTo(66, -472); p.quadraticCurveTo(114, -472, 116, -420); p.lineTo(98, -330);
  p.quadraticCurveTo(90, -280, 104, -236); p.quadraticCurveTo(106, -192, 60, -192); p.lineTo(-60, -192);
  p.quadraticCurveTo(-106, -192, -104, -236); p.quadraticCurveTo(-90, -280, -98, -330); p.lineTo(-116, -420);
  p.quadraticCurveTo(-114, -472, -66, -472); p.closePath();                   // torso
  for (const sd of [-1, 1]) {
    cap(sd * 100, -440, sd * 146, -318, 28); cap(sd * 146, -318, sd * 166, -214, 25);
    p.moveTo(sd * 168 + 29, -202); p.arc(sd * 168, -202, 29, 0, TAU); p.closePath();
    cap(sd * 52, -220, sd * 58, -40, 38); cap(sd * 50, -18, sd * 90, -18, 21);
  }
  return (eau_path = p);
}
// level: water fraction of height (0..1); scan: 0..1 x-ray sweep position (or <0 for none)
function eau_body(ctx, x, y, s, level, t, { alpha = 1, scan = -1, breathe = 0 } = {}) {
  const P = eau_silPath();
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + breathe * .6), s * (1 + breathe)); ctx.globalAlpha *= alpha;
  ellipse(ctx, 0, 8, 175, 22, 'rgba(0,0,0,.13)');
  ctx.save(); ctx.translate(9, 11); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fill(P); ctx.restore();
  ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 13 / s; ctx.stroke(P);
  const g = ctx.createLinearGradient(-200, -640, 200, 0); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#E2F0FA');
  ctx.fillStyle = g; ctx.fill(P);
  ctx.save(); ctx.clip(P);
  // faint x-ray grid
  ctx.strokeStyle = 'rgba(62,155,218,.12)'; ctx.lineWidth = 2 / s; ctx.beginPath();
  for (let yy = -640; yy < 20; yy += 40) { ctx.moveTo(-230, yy); ctx.lineTo(230, yy); }
  for (let xx = -220; xx <= 220; xx += 40) { ctx.moveTo(xx, -650); ctx.lineTo(xx, 20); }
  ctx.stroke();
  if (level > 0) {
    const wy = -BODY_H * level, wave = xx => Math.sin(xx * .028 + t * 3.1) * 7 + Math.sin(xx * .061 - t * 2.3) * 4;
    ctx.beginPath(); ctx.moveTo(-240, 30);
    for (let xx = -240; xx <= 240; xx += 10) ctx.lineTo(xx, wy + wave(xx));
    ctx.lineTo(240, 30); ctx.closePath();
    const wg = ctx.createLinearGradient(0, wy, 0, 0); wg.addColorStop(0, '#6DBEF1'); wg.addColorStop(1, '#2A78BF');
    ctx.fillStyle = wg; ctx.fill();
    ctx.beginPath(); for (let xx = -240; xx <= 240; xx += 10) { const yy = wy + wave(xx) + 4; xx === -240 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); }
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 7 / s; ctx.stroke();
    for (let i = 0; i < 18; i++) {
      const ph = (t * (.22 + hash(i) * .25) + hash(i + 7)) % 1, bx = (hash(i * 3 + 1) - .5) * 330 + Math.sin(t * 2 + i) * 6;
      const byy = lerp(0, wy, ph); if (byy < wy + 14) continue;
      circle(ctx, bx, byy, (4 + hash(i * 5) * 7) / Math.max(.5, s), null, 'rgba(255,255,255,.75)', 3 / s);
    }
  }
  if (scan >= 0 && scan <= 1) {                                 // x-ray scan bar
    const sy = lerp(-660, 20, scan), sg = ctx.createLinearGradient(0, sy - 60, 0, sy + 6);
    sg.addColorStop(0, 'rgba(120,200,255,0)'); sg.addColorStop(1, 'rgba(120,200,255,.55)');
    ctx.fillStyle = sg; ctx.fillRect(-240, sy - 60, 480, 66);
    line(ctx, -240, sy + 4, 240, sy + 4, 'rgba(70,170,240,.9)', 4 / s);
  }
  // glass highlights
  ctx.globalAlpha *= .8;
  line(ctx, -40, -600, -52, -560, 'rgba(255,255,255,.95)', 10 / s);
  line(ctx, -80, -440, -88, -300, 'rgba(255,255,255,.85)', 12 / s);
  ctx.restore();
  ctx.restore();
}

// ------------------------------------------------------------------ pictograms (drawn centred at 0,0, ~70 px)
function eau_icon(ctx, id, x, y, k, t, { r = 44, ring = 0 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  if (ring > 0) circle(ctx, 0, 0, r + 10 + ring * 26, null, rgba(C.water, (1 - ring) * .7), 6);
  circle(ctx, 5, 7, r, 'rgba(0,0,0,.16)');
  circle(ctx, 0, 0, r, '#FFFFFF', C.ink, 5);
  const ink = C.ink;
  if (id === 'respire') {              // lungs
    line(ctx, 0, -26, 0, -6, ink, 6); line(ctx, 0, -6, -9, 2, ink, 5); line(ctx, 0, -6, 9, 2, ink, 5);
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 6, -14); ctx.bezierCurveTo(sd * 30, -26, sd * 32, 10, sd * 28, 22); ctx.quadraticCurveTo(sd * 14, 28, sd * 6, 18); ctx.closePath(); ctx.fillStyle = '#F08F8A'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.stroke(); }
  } else if (id === 'transpire') {     // face + sweat drops
    circle(ctx, -4, 4, 22, '#F3C9A2', ink, 4);
    line(ctx, -13, -2, -8, -2, ink, 4); line(ctx, 0, -2, 5, -2, ink, 4);
    ctx.beginPath(); ctx.arc(-4, 12, 7, .2, Math.PI - .2); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke();
    drop(ctx, 24, -14, 8, C.water, ink); drop(ctx, 28, 12, 6, C.water, ink);
  } else if (id === 'cuisine') {       // steaming pot
    fillRR(ctx, -24, -4, 48, 28, [4, 4, 12, 12], '#5B6670', ink, 4);
    line(ctx, -30, -4, 30, -4, ink, 5); line(ctx, -32, 4, -24, 4, ink, 5); line(ctx, 24, 4, 32, 4, ink, 5);
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); const ox = i * 13; ctx.moveTo(ox, -10); ctx.bezierCurveTo(ox - 7, -16, ox + 7, -22, ox, -30); ctx.strokeStyle = C.water; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); }
  } else if (id === 'douche') {        // shower head + water
    line(ctx, -22, -28, -22, -16, ink, 5); line(ctx, -22, -28, 4, -28, ink, 5);
    ctx.beginPath(); ctx.moveTo(-4, -26); ctx.lineTo(12, -26); ctx.lineTo(22, -12); ctx.lineTo(-14, -12); ctx.closePath(); ctx.fillStyle = '#C9D3DA'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 4; i++) { const xx = -10 + i * 9, o = ((t * 2 + i * .3) % 1) * 8; line(ctx, xx, -6 + o, xx - 3, 6 + o, C.water, 4); line(ctx, xx - 4, 12 + o, xx - 6, 22 + o, C.water, 4); }
  } else if (id === 'linge') {         // t-shirt on hanger
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -24); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke();
    poly(ctx, [[-10, -20], [-30, -10], [-24, 2], [-16, -2], [-16, 26], [16, 26], [16, -2], [24, 2], [30, -10], [10, -20], [5, -16], [-5, -16]], '#E57F5E', ink, 4);
    for (let i = 0; i < 3; i++) { const o = (t * .8 + i / 3) % 1; ctx.globalAlpha *= 1; circle(ctx, -8 + i * 8, -26 - o * 14, 3, rgba(C.water, 1 - o)); }
  } else if (id === 'lungs') {
    line(ctx, 0, -26, 0, -6, ink, 6); line(ctx, 0, -6, -9, 2, ink, 5); line(ctx, 0, -6, 9, 2, ink, 5);
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 6, -14); ctx.bezierCurveTo(sd * 30, -26, sd * 32, 10, sd * 28, 22); ctx.quadraticCurveTo(sd * 14, 28, sd * 6, 18); ctx.closePath(); ctx.fillStyle = '#F08F8A'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.stroke(); }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ static house cutaway (cached)
function eau_room(g, x, y, w, h, base, pat) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = base; g.fillRect(x, y, w, h);
  if (pat === 'dots') { g.fillStyle = 'rgba(255,255,255,.6)'; for (let yy = y + 16, j = 0; yy < y + h; yy += 30, j++) for (let xx = x + 12 + (j % 2) * 15; xx < x + w; xx += 30) { g.beginPath(); g.arc(xx, yy, 3.5, 0, TAU); g.fill(); } }
  if (pat === 'stripes') { g.fillStyle = 'rgba(176,127,37,.11)'; for (let xx = x + 8; xx < x + w; xx += 36) g.fillRect(xx, y, 15, h); }
  if (pat === 'tiles') {
    const ty = y + h * .42; g.fillStyle = '#BCDDE6'; g.fillRect(x, ty, w, h - (ty - y));
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.beginPath();
    for (let yy = ty; yy < y + h; yy += 24) { g.moveTo(x, yy); g.lineTo(x + w, yy); }
    for (let xx = x; xx < x + w; xx += 24) { g.moveTo(xx, ty); g.lineTo(xx, y + h); } g.stroke();
  }
  if (pat === 'kitchen') {
    const ty = y + h * .5; g.fillStyle = '#EBDDBF'; g.fillRect(x, ty, w, 40);
    for (let xx = x, j = 0; xx < x + w; xx += 20, j++) { g.fillStyle = j % 2 ? '#F7F1E4' : '#C8643B'; g.globalAlpha = j % 2 ? 1 : .35; g.fillRect(xx, ty, 20, 20); g.fillRect(xx + (j % 2 ? -20 : 20), ty + 20, 20, 20); } g.globalAlpha = 1;
  }
  g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(x, y, w, 16);
  g.fillStyle = 'rgba(110,74,45,.5)'; g.fillRect(x, y + h - 12, w, 12);
  g.restore();
}
function eau_frame(g, x, y, w, h, art) {          // picture frame on a wall
  fillRR(g, x + 4, y + 6, w, h, 4, 'rgba(0,0,0,.12)');
  fillRR(g, x, y, w, h, 4, C.ochre, C.ink, 4);
  fillRR(g, x + 8, y + 8, w - 16, h - 16, 2, art === 1 ? '#BFDDEE' : '#F3E1C0', C.ink, 2);
  if (art === 1) { poly(g, [[x + 10, y + h - 10], [x + w * .4, y + h * .38], [x + w * .62, y + h * .62], [x + w * .75, y + h * .48], [x + w - 10, y + h - 10]], '#7E9C6A'); circle(g, x + w * .72, y + h * .3, 6, '#F6C84C'); }
  else { circle(g, x + w / 2, y + h * .45, Math.min(w, h) * .18, '#E57F5E'); line(g, x + w / 2, y + h * .6, x + w / 2, y + h - 12, '#6E9A4F', 4); }
}
function eau_window(g, x, y, w, h) {             // old wooden casement on a back wall
  fillRR(g, x - 12, y - 10, w + 24, h + 20, 5, '#C9B18C', C.ink, 3);                 // stone surround
  const gl = g.createLinearGradient(x, y, x + w, y + h); gl.addColorStop(0, '#A9D3EC'); gl.addColorStop(1, '#6FA6CB');
  fillRR(g, x, y, w, h, 3, gl, null);
  g.strokeStyle = C.wood; g.lineWidth = 8; g.strokeRect(x + 2, y + 2, w - 4, h - 4);
  line(g, x + w / 2, y, x + w / 2, y + h, C.wood, 7, 'butt'); line(g, x, y + h * .5, x + w, y + h * .5, C.wood, 6, 'butt');
  g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(x, y, w, h);
  line(g, x + 10, y + 16, x + 22, y + 8, 'rgba(255,255,255,.7)', 4);
  fillRR(g, x - 18, y + h + 6, w + 36, 12, 3, C.stoneLight, C.ink, 3);               // sill
  // curtains
  for (const sd of [0, 1]) { const cx = sd ? x + w + 4 : x - 22; poly(g, [[cx, y - 14], [cx + 18, y - 14], [cx + 18 - (sd ? 0 : 6), y + h * .6], [cx + 9, y + h + 4], [cx + (sd ? 6 : 0), y + h * .6]], '#E9A36B', C.ink, 3); }
  line(g, x - 30, y - 16, x + w + 30, y - 16, C.woodDark, 5);
}
function eau_houseStatic() {
  return cached('eau|house|v3', 1140, 920, g => {
    g.translate(-450, -30);                         // canvas covers world x 450..1590, y 30..950
    const E = EH;
    // attic interior
    poly(g, [[E.x0 + E.wt, E.s2], [E.apex[0], E.apex[1] + 30], [E.x1 - E.wt, E.s2]], '#E9CFA0');
    g.save(); g.beginPath(); g.moveTo(E.x0 + E.wt, E.s2); g.lineTo(E.apex[0], E.apex[1] + 30); g.lineTo(E.x1 - E.wt, E.s2); g.closePath(); g.clip();
    for (let i = 0; i < 9; i++) { const xx = 640 + i * 95; line(g, xx, E.s2, xx, 120, 'rgba(110,74,45,.35)', 8); }
    line(g, 700, 250, 1320, 250, 'rgba(110,74,45,.45)', 10);
    g.restore();
    // rooms
    eau_room(g, E.x0 + E.wt, E.s2b, E.p0 - E.x0 - E.wt, E.s1 - E.s2b, '#F8DCCB', 'dots');     // UL bedroom
    eau_room(g, E.p1, E.s2b, E.x1 - E.wt - E.p1, E.s1 - E.s2b, '#D3EBF1', 'tiles');           // UR bathroom
    eau_room(g, E.x0 + E.wt, E.s1b, E.p0 - E.x0 - E.wt, E.gy - E.s1b, '#F4DDAA', 'stripes');  // LL living
    eau_room(g, E.p1, E.s1b, E.x1 - E.wt - E.p1, E.gy - E.s1b, '#F6ECD7', 'kitchen');         // LR kitchen
    // decor
    eau_frame(g, 880, 404, 70, 56, 1);
    eau_frame(g, 618, 660, 56, 70, 0);
    eau_window(g, ...E.winUR); eau_window(g, ...E.winLR);
    // UL bed (frame + pillow; blanket drawn live over the kid)
    fillRR(g, 612, 468, 20, 136, 6, C.wood, C.ink, 4);
    fillRR(g, 620, 552, 250, 34, 8, '#B98454', C.ink, 4);
    line(g, 636, 586, 636, 602, C.ink, 6); line(g, 856, 586, 856, 602, C.ink, 6);
    fillRR(g, 632, 512, 64, 40, 16, '#FFFFFF', C.ink, 4);
    // night stand + little lamp
    fillRR(g, 900, 548, 56, 56, 6, C.wood, C.ink, 4); line(g, 928, 548, 928, 520, C.ink, 4);
    poly(g, [[912, 524], [944, 524], [936, 500], [920, 500]], '#F6C84C', C.ink, 3);
    // UR shower: tray + pipe (glass drawn live, in front of the kid)
    fillRR(g, 1250, 592, 146, 12, 4, '#FFFFFF', C.ink, 3);
    line(g, 1380, E.s2b, 1380, 400, '#9AA5AD', 8); line(g, 1380, 400, 1356, 414, '#9AA5AD', 8);
    // towel rail + towel
    line(g, 1150, 540, 1222, 540, '#9AA5AD', 5); fillRR(g, 1160, 540, 46, 52, 4, '#E57F5E', C.ink, 3);
    // LL rug
    ellipse(g, 760, 878, 150, 12, '#C8643B', C.ink, 3);
    // LL drying rack (étendoir) with clothes
    line(g, 890, 878, 975, 776, C.inkSoft, 5); line(g, 975, 878, 890, 776, C.inkSoft, 5);
    line(g, 878, 782, 988, 782, C.inkSoft, 5); line(g, 882, 808, 984, 808, C.inkSoft, 5);
    poly(g, [[892, 782], [918, 782], [918, 826], [892, 826]], '#6FA6CB', C.ink, 3);            // towel
    poly(g, [[926, 782], [954, 782], [960, 790], [952, 794], [952, 822], [928, 822], [928, 794], [920, 790]], '#E57F5E', C.ink, 3); // shirt
    poly(g, [[960, 808], [972, 808], [972, 830], [980, 836], [976, 842], [962, 836]], '#F2C94C', C.ink, 3); // sock
    // LR hearth: surround + funnel + flue column
    poly(g, [[E.ch0, E.hood], [E.ch1, E.hood], [1158, 742], [1022, 742]], '#E4D6BE', C.ink, 4);  // hood
    fillRR(g, 1016, 736, 148, 14, 3, C.wood, C.ink, 4);                                         // mantel
    fillRR(g, 1030, 750, 120, 130, [10, 10, 0, 0], '#CDBFA6', C.ink, 4);                        // surround
    fillRR(g, 1048, 776, 84, 104, [36, 36, 0, 0], '#3A302A', null);                             // opening
    // pot crane + cauldron hook
    line(g, 1090, 776, 1090, 800, '#5B514A', 4);
    // flue column through the floors
    g.fillStyle = '#E4D6BE'; g.fillRect(E.ch0, E.chTop + 20, E.ch1 - E.ch0, E.hood - E.chTop - 20);
    g.fillStyle = '#4A403A'; g.fillRect(E.f0, E.chTop + 10, E.f1 - E.f0, E.hood - E.chTop - 4);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(E.f0, E.chTop + 10, 8, E.hood - E.chTop - 4);
    // slabs
    for (const [a, b] of [[E.s1, E.s1b], [E.s2, E.s2b]]) {
      fillRR(g, E.x0, a, E.x1 - E.x0, b - a, 0, C.wood, null);
      for (let xx = E.x0 + 30; xx < E.x1; xx += 60) line(g, xx, a + 3, xx, b - 3, C.woodDark, 2);
      g.strokeStyle = C.ink; g.lineWidth = 4; g.strokeRect(E.x0, a, E.x1 - E.x0, b - a);
    }
    // partition walls (plastered)
    for (const [a, b] of [[E.s2b, E.s1], [E.s1b, E.gy]]) { fillRR(g, E.p0, a, E.p1 - E.p0, b - a, 0, C.limeShade, null); line(g, E.p0, a, E.p0, b, C.ink, 3); line(g, E.p1, a, E.p1, b, C.ink, 3); }
    // the flue walls over the slabs
    for (const sx of [E.ch0, E.ch1]) line(g, sx, E.hood, sx, E.chTop + 20, C.ink, 4);
    line(g, E.f0, E.hood, E.f0, E.chTop + 10, 'rgba(43,38,35,.6)', 2); line(g, E.f1, E.hood, E.f1, E.chTop + 10, 'rgba(43,38,35,.6)', 2);
    // outer stone walls (in section)
    for (const [wx, seed] of [[E.x0, 11], [E.x1 - E.wt, 12]]) {
      g.drawImage(stoneTexture(E.wt, E.gy - E.s2 + 40, seed, { size: 30 }), wx, E.s2);
      g.strokeStyle = C.ink; g.lineWidth = 5; g.strokeRect(wx, E.s2, E.wt, E.gy - E.s2 + 40);
    }
    // roof (thick tiled band)
    const roofPts = [E.eL, E.apex, E.eR];
    g.lineJoin = 'miter'; g.lineCap = 'round';
    g.beginPath(); roofPts.forEach(([x, y], i) => i ? g.lineTo(x, y + 14) : g.moveTo(x, y + 14)); g.strokeStyle = C.ink; g.lineWidth = 42; g.stroke();
    g.strokeStyle = C.roof; g.lineWidth = 32; g.stroke();
    g.save(); g.beginPath(); roofPts.forEach(([x, y], i) => i ? g.lineTo(x, y + 14) : g.moveTo(x, y + 14)); g.strokeStyle = C.roofDark; g.lineWidth = 32; g.setLineDash([3, 22]); g.stroke(); g.restore();
    // chimney stack above the roof
    fillRR(g, E.ch0, E.chTop + 14, E.ch1 - E.ch0, 120, 0, C.terracotta, null);
    for (let yy = E.chTop + 30; yy < E.chTop + 120; yy += 18) line(g, E.ch0, yy, E.ch1, yy, 'rgba(126,56,32,.55)', 2);
    g.fillStyle = '#4A403A'; g.fillRect(E.f0, E.chTop + 10, E.f1 - E.f0, 124);
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(E.ch0, E.chTop + 134); g.lineTo(E.ch0, E.chTop + 14); g.moveTo(E.ch1, E.chTop + 14); g.lineTo(E.ch1, E.chTop + 134); g.stroke();
    fillRR(g, E.ch0 - 10, E.chTop, 22, 16, 3, C.roofDark, C.ink, 4); fillRR(g, E.ch1 - 12, E.chTop, 22, 16, 3, C.roofDark, C.ink, 4);
  });
}

// ------------------------------------------------------------------ live characters & props
function eau_head(ctx, x, y, r, skin, hair, style, { eyes = 'open', mouth = 'smile', mo = 0, look = 0 } = {}) {
  if (style === 'bun') circle(ctx, x + r * .1, y - r * 1.02, r * .42, hair, C.ink, 3.5);
  if (style === 'long') blob(ctx, x, y + r * .15, r * 1.12, 4, .06, 10, hair, C.ink, 3.5);
  circle(ctx, x, y, r, skin, C.ink, 4);
  // hair cap
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.beginPath(); ctx.ellipse(x, y - r * .62, r * 1.15, r * .62, 0, 0, TAU); ctx.fillStyle = hair; ctx.fill();
  if (style === 'kid') { circle(ctx, x - r * .5, y - r * .45, r * .32, hair); circle(ctx, x + r * .4, y - r * .5, r * .3, hair); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 1.05, Math.PI * 1.95); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  const ex = r * .36, ey = y + r * .08;
  if (eyes === 'closed') { for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sd * ex + look * 3, ey, r * .14, .2, Math.PI - .2); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); } }
  else for (const sd of [-1, 1]) circle(ctx, x + sd * ex + look * 4, ey, r * .11, C.ink);
  circle(ctx, x - r * .55, y + r * .38, r * .14, 'rgba(236,156,136,.55)'); circle(ctx, x + r * .55, y + r * .38, r * .14, 'rgba(236,156,136,.55)');
  if (mo > .05) ellipse(ctx, x + look * 3, y + r * .5, r * .16, r * (.08 + mo * .2), '#7A2E2A', C.ink, 2.5);
  else { ctx.beginPath(); ctx.arc(x + look * 3, y + r * .36, r * .22, .25, Math.PI - .25); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); }
}
function eau_kidBed(ctx, t, act) {                // UL: kid reading in bed
  const b = Math.sin(t * 2.2) * 1.5;
  fillRR(ctx, 650, 500 + b, 62, 70, 18, '#F2C94C', C.ink, 4);                 // pyjama
  eau_head(ctx, 682, 482 + b, 27, '#F3C9A2', '#8A5A35', 'kid', { mo: act ? .3 + .3 * Math.sin(t * 2.2) : 0, look: .6 });
  // book
  ctx.save(); ctx.translate(722, 540 + b); ctx.rotate(-.25);
  poly(ctx, [[-28, -16], [0, -10], [0, 16], [-28, 10]], '#FFFFFF', C.ink, 3); poly(ctx, [[0, -10], [28, -16], [28, 10], [0, 16]], '#FFFFFF', C.ink, 3);
  poly(ctx, [[-30, 10], [0, 16], [30, 10], [30, 14], [0, 20], [-30, 14]], '#D64545', C.ink, 3);
  ctx.restore();
  circle(ctx, 700, 548 + b, 9, '#F3C9A2', C.ink, 3);
  // blanket
  ctx.beginPath(); ctx.moveTo(646, 562); ctx.quadraticCurveTo(700, 548, 760, 556); ctx.quadraticCurveTo(820, 540, 866, 556); ctx.lineTo(866, 588); ctx.lineTo(646, 588); ctx.closePath();
  ctx.fillStyle = '#5F8FA8'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < 4; i++) line(ctx, 680 + i * 50, 560, 690 + i * 50, 586, 'rgba(255,255,255,.45)', 5);
}
function eau_dadBike(ctx, t, act) {               // LL: dad on an exercise bike
  const sp = act ? 6 : 1.2, a = t * sp;
  // bike frame
  line(ctx, 664, 876, 824, 876, C.ink, 8);
  line(ctx, 686, 876, 700, 790, '#6F7A83', 9); line(ctx, 700, 790, 800, 836, '#6F7A83', 9); line(ctx, 800, 836, 806, 742, '#6F7A83', 9);
  line(ctx, 806, 742, 784, 736, C.ink, 7);
  fillRR(ctx, 676, 778, 46, 12, 6, '#3F4A52', C.ink, 3);
  circle(ctx, 800, 840, 34, '#C9D3DA', C.ink, 5);
  for (let i = 0; i < 3; i++) { const aa = a + i * TAU / 3; line(ctx, 800, 840, 800 + Math.cos(aa) * 28, 840 + Math.sin(aa) * 28, C.inkSoft, 3); }
  const cx = 742, cy = 846, cr = 22;
  // legs (2-bone IK hip → knee → pedal)
  const hip = [700, 774], L1 = 62, L2 = 64;
  for (const ph of [Math.PI, 0]) {
    const px = cx + Math.cos(a + ph) * cr, py = cy + Math.sin(a + ph) * cr;
    const dx = px - hip[0], dy = py - hip[1], d = Math.min(L1 + L2 - 1, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx), k = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const kx = hip[0] + Math.cos(ang - k) * L1, ky = hip[1] + Math.sin(ang - k) * L1;
    const col = ph ? '#2E5570' : '#3F6E8C';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(kx, ky); ctx.lineTo(px, py); ctx.strokeStyle = C.ink; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.stroke();
    fillRR(ctx, px - 6, py - 6, 26, 12, 5, '#FFFFFF', C.ink, 3);
  }
  circle(ctx, cx, cy, 6, C.ink);
  // torso leaning forward
  const bob = act ? Math.sin(a * 2) * 2 : 0;
  ctx.save(); ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(690, 782); ctx.lineTo(712, 712); ctx.lineTo(758, 708); ctx.lineTo(728, 790); ctx.closePath();
  ctx.fillStyle = '#6FA86A'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  // arm to the handlebar
  ctx.beginPath(); ctx.moveTo(744, 716); ctx.lineTo(774, 744); ctx.lineTo(790, 738); ctx.strokeStyle = C.ink; ctx.lineWidth = 17; ctx.stroke(); ctx.strokeStyle = '#E0AC85'; ctx.lineWidth = 10; ctx.stroke();
  eau_head(ctx, 760, 680, 30, '#E0AC85', '#3F2618', 'short', { mo: act ? .35 : 0, look: .8 });
  fillRR(ctx, 731, 664, 58, 10, 5, '#D64545', C.ink, 2.5);                      // sweat band
  ctx.restore();
}
function eau_momCook(ctx, t, act) {               // LR: mum stirring the cauldron in the hearth
  // fire
  const fl = (x, s, c, ph) => { ctx.beginPath(); const hh = s * (1 + .25 * Math.sin(t * 9 + ph) + .15 * noise(t * 4 + ph)); ctx.moveTo(x - s * .5, 878); ctx.quadraticCurveTo(x - s * .55, 878 - hh * .5, x + Math.sin(t * 7 + ph) * 4, 878 - hh); ctx.quadraticCurveTo(x + s * .55, 878 - hh * .5, x + s * .5, 878); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
  const glow = ctx.createRadialGradient(1090, 860, 5, 1090, 860, 90); glow.addColorStop(0, 'rgba(255,170,60,.55)'); glow.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = glow; ctx.fillRect(1000, 770, 180, 110);
  fl(1074, 30, '#E2582B', 0); fl(1106, 28, '#E2582B', 2); fl(1090, 40, '#F2B843', 1); fl(1090, 20, '#FFF3C4', 3);
  line(ctx, 1060, 876, 1120, 870, C.woodDark, 7);
  // cauldron
  line(ctx, 1090, 800, 1090, 808, '#5B514A', 4);
  ctx.beginPath(); ctx.arc(1090, 822, 24, Math.PI * .05, Math.PI * .95); ctx.closePath(); ctx.fillStyle = '#2F3439'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  fillRR(ctx, 1062, 814, 56, 9, 4, '#4A525A', C.ink, 3);
  // mum
  const st = act ? t * 4 : t * 1.2, sx = Math.cos(st) * 7, sy = Math.sin(st) * 3;
  fillRR(ctx, 1206, 800, 16, 76, 6, '#5B3A26', C.ink, 3); fillRR(ctx, 1226, 800, 16, 76, 6, '#5B3A26', C.ink, 3);
  ctx.beginPath(); ctx.moveTo(1200, 712); ctx.lineTo(1244, 712); ctx.lineTo(1256, 812); ctx.lineTo(1188, 812); ctx.closePath(); ctx.fillStyle = '#C8643B'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  fillRR(ctx, 1202, 736, 40, 70, 8, '#FBF6EE', C.ink, 3);                        // apron
  // spoon + arm
  line(ctx, 1150 + sx, 760 + sy, 1098 + sx * 1.4, 812 + sy, C.wood, 7);
  ctx.beginPath(); ctx.moveTo(1208, 722); ctx.lineTo(1178, 752); ctx.lineTo(1152 + sx, 760 + sy); ctx.strokeStyle = C.ink; ctx.lineWidth = 17; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = '#C8643B'; ctx.lineWidth = 10; ctx.stroke();
  circle(ctx, 1152 + sx, 760 + sy, 8, '#F3C9A2', C.ink, 3);
  eau_head(ctx, 1222, 684, 29, '#F3C9A2', '#5A3825', 'bun', { mo: 0, look: -.8 });
}
function eau_kidShower(ctx, t, act) {             // UR: kid in the shower behind frosted glass
  // water spray
  if (act) for (let i = 0; i < 9; i++) { const ph = (t * 2.2 + hash(i) ) % 1, xx = 1348 - 6 - i * 7 + ph * -10, yy = 420 + ph * 160; line(ctx, xx, yy, xx - 3, yy + 16, rgba(C.water, .75 * (1 - ph * .5)), 3); }
  const b = Math.sin(t * 3) * 2;
  fillRR(ctx, 1284, 496 + b, 56, 60, 16, '#F3C9A2', C.ink, 4);                 // shoulders
  eau_head(ctx, 1312, 470 + b, 26, '#F3C9A2', '#3F2618', 'long', { eyes: act ? 'closed' : 'open', mo: act ? .25 + .2 * Math.sin(t * 5) : 0, look: -.4 });
  // foam on hair
  if (act) { circle(ctx, 1300, 446 + b, 9, '#FFFFFF', C.ink, 2); circle(ctx, 1318, 442 + b, 11, '#FFFFFF', C.ink, 2); circle(ctx, 1334, 450 + b, 7, '#FFFFFF', C.ink, 2); }
  // shower head
  ctx.save(); ctx.translate(1354, 416); ctx.rotate(.5); fillRR(ctx, -14, -6, 28, 12, 5, '#C9D3DA', C.ink, 3); ctx.restore();
  // glass cabin
  ctx.fillStyle = 'rgba(220,240,248,.14)'; ctx.fillRect(1252, 404, 142, 188);
  ctx.fillStyle = 'rgba(245,250,252,.9)'; ctx.fillRect(1252, 522, 142, 70);
  line(ctx, 1252, 404, 1252, 592, '#9AA5AD', 5); line(ctx, 1394, 404, 1394, 592, '#9AA5AD', 5); line(ctx, 1250, 404, 1396, 404, '#9AA5AD', 5);
  line(ctx, 1262, 540, 1280, 524, 'rgba(255,255,255,.9)', 4);
}

// ------------------------------------------------------------------ the bucket (10 à 15 L)
function eau_bucket(ctx, cx, top, k, level, t) {
  if (k <= 0) return;
  const h = 290, tw = 150, bw = 116, bot = top + h, my = top + h / 2;
  ctx.save(); ctx.translate(cx, my); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.translate(-cx, -my); ctx.globalAlpha *= clamp(k * 3);
  const hg = ctx.createRadialGradient(cx, my, 30, cx, my, 300); hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(.6, 'rgba(255,255,255,.7)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.fillRect(cx - 310, my - 310, 620, 620);
  const body = new Path2D(); body.moveTo(cx - tw, top); body.lineTo(cx + tw, top); body.lineTo(cx + bw, bot - 20); body.quadraticCurveTo(cx + bw - 3, bot, cx + bw - 24, bot); body.lineTo(cx - bw + 24, bot); body.quadraticCurveTo(cx - bw + 3, bot, cx - bw, bot - 20); body.closePath();
  ctx.save(); ctx.translate(9, 11); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fill(body); ctx.restore();
  ctx.fillStyle = 'rgba(232,243,250,.95)'; ctx.fill(body);
  ctx.save(); ctx.clip(body);
  const fillH = h - 34, wy = bot - fillH * level;
  if (level > 0.002) {
    const wave = xx => Math.sin(xx * .035 + t * 3.3) * 5 + Math.sin(xx * .07 - t * 2.1) * 3;
    ctx.beginPath(); ctx.moveTo(cx - 200, bot + 10); for (let xx = cx - 200; xx <= cx + 200; xx += 10) ctx.lineTo(xx, wy + wave(xx)); ctx.lineTo(cx + 200, bot + 10); ctx.closePath();
    const wg = ctx.createLinearGradient(0, wy, 0, bot); wg.addColorStop(0, '#6DBEF1'); wg.addColorStop(1, '#2A78BF'); ctx.fillStyle = wg; ctx.fill();
    ctx.beginPath(); for (let xx = cx - 200; xx <= cx + 200; xx += 10) { const yy = wy + wave(xx) + 4; xx === cx - 200 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 6; ctx.stroke();
  }
  // graduations 5 / 10 / 15 L
  for (const n of [5, 10, 15]) { const yy = bot - fillH * n / 15; line(ctx, cx - tw + 14 + (1 - (yy - top) / h) * 0, yy, cx - tw + 54, yy, C.ink, 4); text(ctx, n + ' L', cx - tw + 64 + (yy - top) / h * 30, yy + 2, { size: 30, font: FONT.title, weight: 700, align: 'left', color: C.ink, stroke: 'rgba(255,255,255,.8)', sw: 6 }); }
  line(ctx, cx + 80, top + 30, cx + 64, bot - 30, 'rgba(255,255,255,.8)', 10);
  ctx.restore();
  ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke(body);
  ellipse(ctx, cx, top, tw + 4, 15, 'rgba(255,255,255,.5)', C.ink, 6);
  ctx.beginPath(); ctx.arc(cx, top + 10, tw - 6, Math.PI * 1.08, Math.PI * 1.92); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ labels
function eau_card(ctx, x, y, w, h, k) {
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  fillRR(ctx, -w / 2 + 7, -h / 2 + 9, w, h, 26, 'rgba(0,0,0,.16)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 26, C.paper, C.ink, 5);
}
function eau_checkLabel(ctx, s, x, y, k, tx, ty, ka = k) {
  if (k <= 0) return;
  setFont(ctx, 36, FONT.title, 600); const tw = ctx.measureText(s).width, w = tw + 100, h = 62;
  if (tx != null) arrow(ctx, x - w / 2 - 6, y, tx, ty, { color: C.good, lw: 6, head: 20, k: easeOut(ka), curve: -.12, dash: [14, 10] });
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  fillRR(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, C.paper, C.ink, 4);
  circle(ctx, -w / 2 + 34, 0, 22, C.good, C.ink, 3); check(ctx, -w / 2 + 34, 2, 26, '#FFFFFF', clamp(k * 1.5 - .3));
  text(ctx, s, -w / 2 + 64, 2, { size: 36, font: FONT.title, weight: 600, align: 'left' });
  ctx.restore();
}

// ------------------------------------------------------------------ PART 1 — the body
function eau_part1(ctx, S, A) {
  const t = S.t;
  paperBg(ctx);
  const bx = 1000, by = 878;
  const glow = ctx.createRadialGradient(bx, 560, 40, bx, 560, 560); glow.addColorStop(0, 'rgba(169,214,245,.5)'); glow.addColorStop(1, 'rgba(169,214,245,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) { const ph = (t * (.035 + hash(i) * .03) + hash(i * 3.1)) % 1, x = 80 + hash(i * 7.3) * 1760, y = 1080 - ph * 1160; drop(ctx, x + Math.sin(t * .7 + i) * 14, y, 7 + hash(i * 2.2) * 12, 'rgba(62,155,218,.16)'); }
  const tSil = A(0, .5), kS = appear(t, tSil, .8, x => x);
  if (kS <= 0) return;
  const lv = .6 * ease(inv(S.cue(1) + .15, A(1, .82), t));
  const scan = t < S.cue(1) + .2 ? ((t - tSil) / 1.3) % 1 : -1;
  const pop = easeOutBack(kS, 2.2);
  eau_body(ctx, bx, by, pop, lv, t, { alpha: clamp(kS * 2.5), scan, breathe: .006 * Math.sin(t * 2.4) });
  // level marker + counter
  const kc = appear(t, S.cue(1) + .15, .35);
  if (kc > 0) {
    const ly = by - BODY_H * lv, ty = by - BODY_H * .6, done = appear(t, A(1, .82), .6, easeOutElastic);
    ctx.save(); ctx.globalAlpha *= kc;
    ctx.setLineDash([16, 12]); line(ctx, bx + 120, ly, 1300, ly, C.water, 5); ctx.setLineDash([]);
    circle(ctx, 1300, ly, 9, C.water, C.ink, 3);
    const v = Math.round(lv / .6 * 60), sz = 150 * (1 + .12 * done - .12 * clamp(done - 1));
    text(ctx, v + ' %', 1530, ty + 6, { size: sz, font: FONT.title, weight: 700, color: C.water, stroke: C.ink, sw: 14 });
    text(ctx, v + ' %', 1530, ty + 6, { size: sz, font: FONT.title, weight: 700, color: C.water, stroke: '#FFFFFF', sw: 5 });
    text(ctx, v + ' %', 1530, ty + 6, { size: sz, font: FONT.title, weight: 700, color: C.water });
    ctx.restore();
    const kd = appear(t, A(1, .55), .5);
    if (kd > 0) text(ctx, "d'eau", 1530, ty + 112, { size: 64, font: FONT.title, weight: 600, color: C.ink, alpha: kd });
  }
  // little caption under the body
  const kl = appear(t, S.cue(1), .5) * (1 - appear(t, S.cue(2) - .6, .3));
  if (kl > 0) label(ctx, 'le corps humain', bx, 176, { k: kl, size: 34, bg: '#FFFFFF' });
}

// ------------------------------------------------------------------ PART 2 — the house
const EAU_SRC = [   // vapour sources: x,y, drift, badge position, activation fraction of cue(2)
  { id: 'respire', x: 704, y: 486, dx: 50, badge: [790, 418], f: .02 },
  { id: 'transpire', x: 760, y: 650, dx: 10, badge: [850, 676], f: .127 },
  { id: 'cuisine', x: 1094, y: 796, dx: 90, badge: [1330, 840], f: .30 },
  { id: 'douche', x: 1322, y: 418, dx: -60, badge: [1196, 560], f: .43 },
  { id: 'linge', x: 932, y: 790, dx: -20, badge: [964, 714], f: .705 },
];
const EAU_EXITS = {
  chim: { entry: [1090, 812] },
  winUR: { entry: [EH.winUR[0] + EH.winUR[2] / 2, EH.winUR[1] + EH.winUR[3] / 2] },
  winLR: { entry: [EH.winLR[0] + EH.winLR[2] / 2, EH.winLR[1] + EH.winLR[3] / 2] },
};
function eau_ceil(y) { return y < EH.s1 ? EH.s2b : EH.s1b; }

// position + radius + alpha of a puff travelling an exit path. u: seconds since it started leaving
function eau_exitPath(kind, p0, u, i) {
  const sw = Math.sin(u * 5 + i) * 6;
  if (kind === 'chim') {
    const e = EAU_EXITS.chim.entry;
    if (u < .8) { const k = ease(u / .8), q = eau_qbez(p0, [lerp(p0[0], e[0], .5), Math.max(p0[1], e[1]) + 10], e, k); return [q[0], q[1], lerp(22, 15, k), .9]; }
    if (u < 1.8) { const k = (u - .8) / 1; return [1090 + sw * .3, lerp(e[1], EH.chTop + 10, easeIn(k) * .4 + k * .6), 13, .95]; }
    const k = (u - 1.8) / 1.4; if (k > 1) return null;
    return [1090 + k * 110 + sw, EH.chTop - k * 70, lerp(14, 34, k), .9 * (1 - k)];
  }
  if (kind === 'winUR' || kind === 'winLR') {
    const wn = kind === 'winUR' ? EH.winUR : EH.winLR, e = EAU_EXITS[kind].entry;
    if (u < .9) { const k = ease(u / .9), q = eau_qbez(p0, [lerp(p0[0], e[0], .5), p0[1] - 30], e, k); return [q[0], q[1], lerp(22, 14, k), .9]; }
    const k = (u - .9) / 1.3; if (k > 1) return null;
    return [e[0] + k * 26 + sw * .4, e[1] - k * 34, lerp(14, 8, k), .9 * (1 - k), wn];   // fades "behind the glass"
  }
  // walls: 'wallR' | 'wallL'
  const right = kind === 'wallR', xin = right ? EH.x1 - EH.wt : EH.x0 + EH.wt, xout = right ? EH.x1 : EH.x0, sgn = right ? 1 : -1;
  const yy = clamp(p0[1], EH.s2b + 30, EH.gy - 30);
  if (u < .9) { const k = ease(u / .9); return [lerp(p0[0], xin - sgn * 16, k), lerp(p0[1], yy, k), lerp(22, 12, k), .9]; }
  if (u < 1.7) { const k = (u - .9) / .8; return [lerp(xin - sgn * 16, xout + sgn * 6, k), yy + sw * .3, 7, .95, 'dot']; }
  const k = (u - 1.7) / 1.5; if (k > 1) return null;
  return [xout + sgn * (10 + k * 110), yy - k * 50 + sw, lerp(10, 30, k), .9 * (1 - k)];
}

function eau_part2(ctx, S, A) {
  const t = S.t, E = EH;
  const tAct = EAU_SRC.map(s => A(2, s.f));
  const tGather = S.cue(3) + .25, tSwirl = S.cue(4), tExit = S.cue(5);
  const tCh = A(5, .278), tWin = A(5, .43), tWall = A(5, .697), tBreath = S.cue(6);
  // camera: gentle push-in
  const z = 1 + .035 * smooth(inv(S.cue(2) - .6, S.d, t));
  ctx.save(); ctx.translate(1010, 600); ctx.scale(z, z); ctx.translate(-1010, -600);
  skyBg(ctx, t, { groundY: E.gy });
  // bushes
  for (const [x, s] of [[462, 44], [1566, 46]]) { blob(ctx, x, E.gy - s * .5, s, x, .2, 9, C.grassDark, C.ink, 4); blob(ctx, x - s * .4, E.gy - s * .7, s * .6, x + 3, .2, 8, C.grass, null); }
  // breathing (act 6)
  const kb = appear(t, tBreath + .3, .8, smooth), bph = Math.sin((t - tBreath) * TAU / 2.4);
  const hs = 1 + .014 * kb * bph;
  ctx.save(); ctx.translate(1010, E.gy); ctx.scale(hs, hs); ctx.translate(-1010, -E.gy);
  ellipse(ctx, 1010, E.gy + 8, 520, 20, 'rgba(0,0,0,.16)');
  ctx.drawImage(eau_houseStatic(), 450, 30);
  // living things
  const on = i => t >= tAct[i];
  eau_kidBed(ctx, t, on(0) && t < tGather);
  eau_dadBike(ctx, t, on(1) && t < tExit + 4);
  eau_momCook(ctx, t, on(2));
  eau_kidShower(ctx, t, on(3));
  // moisture glow in the walls (exits through walls, breathing)
  const kWallGlow = Math.max(appear(t, tWall - .2, .8) * (1 - appear(t, tBreath, .6)) * (.75 + .25 * Math.sin(t * 4)), kb * (.4 + .3 * bph));
  if (kWallGlow > 0) for (const [wx, sg] of [[E.x0, -1], [E.x1 - E.wt, 1]]) {
    const gr = ctx.createLinearGradient(sg > 0 ? wx : wx + E.wt, 0, sg > 0 ? wx + E.wt : wx, 0);
    gr.addColorStop(0, rgba(C.water, .42 * kWallGlow)); gr.addColorStop(1, rgba(C.water, .12 * kWallGlow));
    ctx.fillStyle = gr; ctx.fillRect(wx, E.s2b, E.wt, E.gy - E.s2b);
  }

  // ---- vapour
  ctx.save(); ctx.beginPath(); ctx.rect(E.x0 - 260, 0, E.x1 - E.x0 + 520, E.gy); ctx.clip();
  // act 2: rising puffs that collect under the ceilings
  EAU_SRC.forEach((s, si) => {
    const ta = tAct[si], tEnd = tGather + .2;
    if (t < ta) return;
    for (let n = 0; n < 40; n++) {
      const ts = ta + n * .5 + hash(si * 50 + n) * .15; if (ts > t || ts > tEnd) break;
      const age = t - ts, life = 2.8; if (age > life + .1) continue;
      const u = age / life, ceil = eau_ceil(s.y) + 26, r = lerp(9, 26, Math.sqrt(u));
      const x = s.x + s.dx * u + (hash(si * 9 + n) - .5) * 120 * u + Math.sin(age * 2 + n) * 6;
      const y = Math.max(ceil + r * .3, lerp(s.y, ceil - 30, easeOut(u * 1.2)));
      const fade = Math.min(1, age * 4) * (1 - smooth(inv(.7, 1, u))) * (1 - appear(t, tGather + .5, .6));
      eau_vap(ctx, x, y, r, .9 * fade);
    }
  });
  // act 3: puffs condense into the bucket
  const bucketTop = 462;
  EAU_SRC.forEach((s, si) => {
    for (let n = 0; n < 30; n++) {
      const ts = tGather + n * .32 + si * .065; if (ts > t || ts > tSwirl - .6) break;
      const age = t - ts, dur = 1.5; if (age > dur + .4) continue;
      const dest = [1010 + (hash(si * 7 + n) - .5) * 150, bucketTop + 8];
      const ctrl = [lerp(s.x, dest[0], .5), Math.min(s.y, dest[1]) - 110];
      if (age < dur) { const k = ease(age / dur), q = eau_qbez([s.x, s.y], ctrl, dest, k); eau_vap(ctx, q[0], q[1], lerp(18, 11, k), .92 * Math.min(1, age * 5)); }
      else { const k = (age - dur) / .4; drop(ctx, dest[0], lerp(dest[1], dest[1] + 120, k * k), 8, C.water, C.ink, 1 - k); }
    }
  });
  ctx.restore();

  // bucket
  const kBk = appear(t, S.cue(3) + .15, .6) * (1 - appear(t, tSwirl + .55, .45, easeIn));
  const lvl = lerp(0, 2 / 3, ease(inv(A(3, .1), A(3, .477), t))) + lerp(0, 1 / 3, ease(inv(A(3, .48), A(3, .6), t)));
  const evap = appear(t, tSwirl, .8);
  eau_bucket(ctx, 1010, bucketTop, kBk, lvl * (1 - evap), t);

  // family numbering 1-4
  const heads = [[682, 438], [760, 632], [1222, 626], [1312, 424]];
  heads.forEach(([x, y], i) => {
    const k = appear(t, A(3, .05 + i * .065), .4) * (1 - appear(t, A(3, .5), .4));
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y - 8); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
    circle(ctx, 3, 4, 24, 'rgba(0,0,0,.18)'); circle(ctx, 0, 0, 24, C.ochre, C.ink, 4);
    text(ctx, String(i + 1), 0, 2, { size: 32, font: FONT.title, weight: 700 }); ctx.restore();
  });

  // ---- act 4–5: swirl, then exits
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, E.gy); ctx.clip();
  const kSw = appear(t, tSwirl, .01);
  const exitKinds = [['chim', 'winLR', 'wallR', 'chim', 'wallL'], ['winUR', 'wallR', 'wallL', 'winUR', 'wallR']];
  const exitStart = { chim: tCh, winLR: tWin, winUR: tWin, wallR: tWall, wallL: tWall };
  if (kSw > 0) {
    for (let i = 0; i < 26; i++) {
      const fl = i % 2, cy = fl ? 760 : 486, cx = 1010, rx = 340, ry = fl ? 64 : 58;
      const w = (1.3 + hash(i) * .7) * (i % 3 ? 1 : -1), ph0 = hash(i + 3) * TAU;
      const orbit = tt => { const p = ph0 + w * (tt - tSwirl); return [cx + Math.cos(p) * rx * (.55 + .45 * hash(i * 5)), cy + Math.sin(p) * ry + Math.sin(tt * 3 + i) * 10]; };
      const kind = exitKinds[fl][(i >> 1) % 5], te = exitStart[kind] + ((i >> 1) % 5) * .05 + hash(i * 11) * .9 + (i % 4) * .25;
      const r0 = 18 + hash(i * 2) * 10;
      if (t < te) {
        const ka = appear(t, tSwirl + i * .025, .7), src = [1010 + (hash(i) - .5) * 160, bucketTop + 40];
        const o = orbit(t), x = lerp(src[0], o[0], ka), y = lerp(src[1], o[1], ka);
        eau_vap(ctx, x, y, r0 * (.5 + .5 * ka), .9 * clamp(ka * 3));
      } else {
        const p = eau_exitPath(kind, orbit(te), t - te, i);
        if (!p) continue;
        if (p[4] === 'dot') { circle(ctx, p[0], p[1], 7, C.water, '#FFFFFF', 2); continue; }
        if (p[4]) { const [wx, wy, ww, wh] = p[4]; if (t - te > .9) { ctx.save(); ctx.beginPath(); ctx.rect(wx - 14, wy - 12, ww + 28, wh + 24); ctx.clip(); eau_vap(ctx, p[0], p[1], p[2], p[3]); ctx.restore(); continue; } }
        eau_vap(ctx, p[0], p[1], p[2], p[3]);
      }
    }
    // the family keeps living: a modest stream from the sources straight to the exits
    const srcKinds = ['winUR', 'chim', 'chim', 'winUR', 'wallL'];
    EAU_SRC.forEach((s, si) => {
      const kind = srcKinds[si], t0 = Math.max(exitStart[kind], tCh) + .3;
      for (let n = 0; n < 14; n++) {
        const ts = t0 + n * .75 + si * .13; if (ts > t || ts > tBreath + .5) break;
        const p = eau_exitPath(kind, [s.x, s.y], t - ts, n + si * 20); if (!p) continue;
        if (p[4] === 'dot') { circle(ctx, p[0], p[1], 6, C.water, '#FFFFFF', 2); continue; }
        if (p[4] && t - ts > .9) { const [wx, wy, ww, wh] = p[4]; ctx.save(); ctx.beginPath(); ctx.rect(wx - 14, wy - 12, ww + 28, wh + 24); ctx.clip(); eau_vap(ctx, p[0], p[1], p[2], p[3]); ctx.restore(); continue; }
        eau_vap(ctx, p[0], p[1], p[2], p[3] * Math.min(1, (t - ts) * 4));
      }
    });
  }
  // act 5 (walls): moisture crosses the stone and is released outside
  const kLane = appear(t, tWall, .3) * (1 - appear(t, tBreath + .3, .5));
  if (kLane > 0) for (let side = 0; side < 2; side++) for (const ly of [420, 520, 690, 800]) {
    const xin = side ? E.x1 - E.wt : E.x0 + E.wt, xout = side ? E.x1 : E.x0, sg = side ? 1 : -1;
    for (let n = 0; n < 14; n++) {
      const ts = tWall + n * .62 + hash(side * 7 + ly) * .6; if (ts > t) break;
      const age = t - ts;
      if (age < .9) { const k = age / .9; circle(ctx, lerp(xin - sg * 6, xout + sg * 2, k), ly + Math.sin(age * 7 + n) * 3, 6.5, C.water, '#FFFFFF', 2.5); }
      else if (age < 2.5) { const k = (age - .9) / 1.6; eau_vap(ctx, xout + sg * (18 + k * 100), ly - k * 46, lerp(11, 30, k), .95 * (1 - k * k) * kLane); }
    }
  }
  // act 6: breathing — exhale through walls, chimney and windows; fresh air comes in
  if (kb > 0) {
    const P = 2.4;
    for (let c = 0; c < 3; c++) {
      const cyc = Math.floor((t - tBreath) / P) - c; if (cyc < 0) continue;
      const tc = tBreath + cyc * P + P * .45, u = (t - tc) / (P * .95); if (u < 0 || u > 1) continue;
      const a = Math.sin(u * Math.PI) * kb;
      for (let j = 0; j < 8; j++) {
        const side = j % 2, y = 410 + (j >> 1) * 120 + hash(cyc * 13 + j) * 50, x0 = side ? E.x1 + 4 : E.x0 - 4, sg = side ? 1 : -1;
        eau_vap(ctx, x0 + sg * (14 + u * 110), y - u * 40, lerp(12, 32, u), a);
      }
      eau_vap(ctx, 1090 + u * 70, E.chTop - 14 - u * 70, lerp(12, 32, u), .9 * a);
    }
    for (let j = 0; j < 6; j++) {                     // inhale: fresh-air streaks drawn towards the walls
      const u = (((t - tBreath) / P) % 1) / .45; if (u > 1) break;
      const side = j % 2, y = 450 + (j >> 1) * 150, sg = side ? 1 : -1, x0 = side ? E.x1 : E.x0;
      ctx.save(); ctx.globalAlpha = kb * Math.sin(u * Math.PI) * .9; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const xs = x0 + sg * lerp(130, 20, u); ctx.beginPath(); ctx.moveTo(xs + sg * 40, y); ctx.bezierCurveTo(xs + sg * 26, y - 10, xs + sg * 14, y + 10, xs, y); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
  // arrows through the walls while they release moisture
  const kWA = appear(t, tWall + .1, .7) * (1 - appear(t, tBreath, .4));
  if (kWA > 0) for (const [xa, xb] of [[E.x0 + E.wt + 26, E.x0 - 62], [E.x1 - E.wt - 26, E.x1 + 62]]) for (const ya of [470, 750]) {
    ctx.save(); ctx.globalAlpha = .85 + .15 * Math.sin(t * 5); arrow(ctx, xa, ya, xb, ya - 6, { color: C.water, lw: 8, head: 22, k: kWA }); ctx.restore();
  }

  // draughts around the old windows while air passes
  const kDr = appear(t, tWin, .5) * (1 - appear(t, tBreath + .5, .5));
  if (kDr > 0) for (const [wx, wy, ww, wh] of [E.winUR, E.winLR]) for (let j = 0; j < 6; j++) {
    const ph = (t * 1.4 + j * .37) % 1, side = j % 2, yy = wy + 12 + (j >> 1) * (wh - 24) / 2, x0 = side ? wx + ww + 2 : wx - 2, sg = side ? 1 : -1;
    ctx.save(); ctx.globalAlpha = kDr * Math.sin(ph * Math.PI); ctx.beginPath(); const xs = x0 + sg * ph * 12;
    ctx.moveTo(xs, yy); ctx.bezierCurveTo(xs + sg * 10, yy - 7, xs + sg * 16, yy + 7, xs + sg * 26, yy);
    ctx.strokeStyle = '#3E9BDA'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  }
  // chimney draft arrows
  const kDraft = appear(t, tCh, .5) * (1 - appear(t, tBreath + .5, .5));
  if (kDraft > 0) for (let j = 0; j < 3; j++) { const ph = (t * 1.3 + j / 3) % 1, yy = lerp(660, 140, ph); ctx.save(); ctx.globalAlpha = kDraft * Math.sin(ph * Math.PI); arrow(ctx, 1090, yy + 30, 1090, yy - 10, { color: '#FFD9A0', lw: 6, head: 16 }); ctx.restore(); }
  ctx.restore();   // breathing scale

  // ---- badges for the five activities
  EAU_SRC.forEach((s, si) => {
    const k = appear(t, tAct[si] - .05, .45) * (1 - appear(t, tGather, .4));
    const ring = inv(tAct[si], tAct[si] + .7, t);
    eau_icon(ctx, s.id, s.badge[0], s.badge[1], k, t, { r: 40, ring: ring < 1 ? ring : 0 });
  });

  // ---- act 6: like us — small body breathing next to the house (world space)
  const kMe = appear(t, tBreath + .05, .7);
  if (kMe > 0) {
    eau_body(ctx, 1740, E.gy, .45 * easeOutBack(kMe), .6, t, { alpha: clamp(kMe * 3), breathe: .02 * kb * bph });
    const kL = appear(t, A(6, .5), .5);
    eau_icon(ctx, 'lungs', 1740, 480, kL, t, { r: 46 * (1 + .07 * kb * bph) });
    eau_icon(ctx, 'lungs', 876, 282, appear(t, A(6, .5) + .12, .5), t, { r: 42 * (1 + .07 * kb * bph) });
    if (kb > 0) { const u = (((t - tBreath) / 2.4) + .55) % 1; if (u < .7) eau_vap(ctx, 1756 + u * 70, E.gy - 258 - u * 40, lerp(6, 20, u / .7), .85 * Math.sin(u / .7 * Math.PI) * kb); }
  }
  ctx.restore();   // camera
  const CX = x => 1010 + (x - 1010) * z, CY = y => 600 + (y - 600) * z;

  // ---- act 3 card: 10 à 15 L / jour
  const kCard = appear(t, A(3, .46), .55) * (1 - appear(t, tSwirl + .2, .4));
  if (kCard > 0) {
    eau_card(ctx, 1704, 420, 372, 250, kCard);
    // the family of four
    [[-78, 1, '#6FA86A'], [-30, 1, '#C8643B'], [16, .78, '#F2C94C'], [56, .78, '#5F8FA8']].forEach(([px, sc, col], i) => {
      const yb = -58, hop = Math.abs(Math.sin(t * 5 + i * 1.3)) * 4;
      fillRR(ctx, px - 15 * sc, yb - 26 * sc - hop, 30 * sc, 34 * sc, [12 * sc, 12 * sc, 4, 4], col, C.ink, 3);
      circle(ctx, px, yb - 40 * sc - hop, 13 * sc, '#F3C9A2', C.ink, 3);
    });
    text(ctx, '× 4', 112, -76, { size: 34, font: FONT.title, weight: 700, color: C.inkSoft });
    text(ctx, '10 à 15 L', 0, 14, { size: 70, font: FONT.title, weight: 700, color: '#2A78BF' });
    text(ctx, 'par jour', 0, 78, { size: 42, font: FONT.title, weight: 600, alpha: appear(t, A(3, .6), .4) });
    ctx.restore();
  }
  // ---- act 4: big question mark
  const kQ = appear(t, tSwirl + .25, .55) * (1 - appear(t, tCh - .2, .4));
  if (kQ > 0) {
    ctx.save(); ctx.translate(1010, 610); ctx.rotate(Math.sin(t * 2.6) * .08); const sc = easeOutBack(kQ, 2.5); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kQ * 3);
    text(ctx, '?', 8, 12, { size: 300, font: FONT.title, weight: 700, color: 'rgba(0,0,0,.18)' });
    text(ctx, '?', 0, 0, { size: 300, font: FONT.title, weight: 700, color: C.ochre, stroke: C.ink, sw: 14 });
    text(ctx, '?', 0, 0, { size: 300, font: FONT.title, weight: 700, color: C.ochre });
    ctx.restore();
  }
  // ---- act 5: « Autrefois… » and the three exits
  const kAut = appear(t, tExit, .5) * (1 - appear(t, tBreath, .5));
  if (kAut > 0) { ctx.save(); ctx.translate(700, 196); ctx.rotate(-.08); text(ctx, 'Autrefois…', 0, 0, { size: 72, font: FONT.hand, weight: 700, color: C.ink, alpha: kAut, stroke: 'rgba(255,255,255,.7)', sw: 8 }); ctx.restore(); }
  const kOut = 1 - appear(t, tBreath, .45);
  eau_checkLabel(ctx, 'Cheminée', 1690, 170, appear(t, tCh, .5) * kOut, CX(1146), CY(112), appear(t, tCh + .15, .6) * kOut);
  eau_checkLabel(ctx, 'Menuiseries', 1690, 410, appear(t, tWin, .5) * kOut, CX(1252), CY(446), appear(t, tWin + .15, .6) * kOut);
  eau_checkLabel(ctx, 'Murs perspirants', 1690, 650, appear(t, tWall, .5) * kOut, CX(1486), CY(586), appear(t, tWall + .15, .6) * kOut);
}

// ------------------------------------------------------------------ the scene
scene('eau', (ctx, S) => {
  const t = S.t, A = (i, f) => S.cue(i) + f * (S.cueEnd(i) - S.cue(i));
  const tIris = S.cueEnd(1) + .03, kIris = ease(inv(tIris, tIris + .55, t));
  if (kIris < 1) eau_part1(ctx, S, A);
  if (kIris > 0) {
    ctx.save();
    if (kIris < 1) { ctx.beginPath(); ctx.arc(1010, 560, kIris * 1250, 0, TAU); ctx.clip(); }
    eau_part2(ctx, S, A);
    ctx.restore();
    if (kIris < 1) circle(ctx, 1010, 560, kIris * 1250, null, C.ink, 10);
  }
  // Margot
  const pose = poseAt(t, [[0, 'idle'], [S.cue(0), 'explain'], [A(0, .5), 'point'], [S.cue(1), 'explain'], [A(1, .45), 'count'],
    [S.cue(2) - .35, 'point'], [A(2, .5), 'explain'], [S.cue(3), 'count'], [A(3, .46), 'open'], [S.cue(4), 'shrug'],
    [S.cue(5), 'explain'], [A(5, .26), 'pointUp'], [A(5, .42), 'point'], [A(5, .68), 'explain'], [S.cue(6), 'open']]);
  let expr = 'happy';
  if (t > A(3, .46) && t < S.cue(4)) expr = 'surprised';
  else if (t >= S.cue(4) && t < S.cue(5)) expr = 'worried';
  const look = t < S.cue(0) ? .2 : .8;
  const lookY = t > A(5, .26) && t < A(5, .42) ? -.8 : 0;
  presenter(ctx, { x: lerp(420, 255, kIris), y: 1000, s: lerp(1, .9, kIris), T: S.T, pose, expr, look, lookY, bounce: appear(t, A(3, .46), .5, x => x) < 1 ? appear(t, A(3, .46), .5, x => x) : 0 });
});
})();

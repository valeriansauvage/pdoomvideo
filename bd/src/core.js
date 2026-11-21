// bd/src/core.js — the album engine for "Sous un arbre à la campagne".
//
// A page is a stack of rows of panels. Each panel is painted on its own WEBGL canvas with p5.brush
// (watercolour + ink, same look as the P(doom) video), then pasted onto a 2D page canvas. Lettering
// (speech bubbles, captions, sound effects) is drawn on the page afterwards, so it can cross panel borders.
//
// Writing a page (see src/pages/*.js):
//   page(7, [
//     [1.2, [ { draw(w, h) { cam(900, 520, 1.1); sets.fields(); fig('cris', 700, 800, {...}); },
//               cap: [{ t: 'Le lendemain.', at: 'tl' }],
//               bub: [{ s: 'cris', t: 'Ele ainda está vivo!', tr: 'Il est encore vivant !', x: .3, y: .2 }],
//               sfx: [{ t: 'BZZZ', x: .8, y: .2, size: 60 }] } ]],
//     [1, [ {...}, { w: 1.6, ... } ]],      // row height weight, then panels (w = width weight)
//   ]);
// Inside draw(): world units are panel pixels at zoom 1. cam(cx, cy, zoom) puts world point (cx, cy) at the
// panel centre. fig() (people.js) records each speaker's mouth position, so bubble tails find their speaker.

const PW = 1600, PH = 2200;                                  // page size in px (16 × 22 cm at 254 dpi)
const MAR = { l: 72, r: 72, t: 78, b: 104 }, GUT = 24;       // margins and gutter
const TAU = Math.PI * 2;
const PAL = {
  paper: '#F3EBDC', ink: '#2B2233', clay: '#D97757', clayDk: '#A84D33', clayLt: '#F2A283',
  night: '#1F2550', indigo: '#2F3C7A', rose: '#E27A92', ochre: '#E8AA38', sap: '#6E9F58',
  teal: '#3A9C98', violet: '#7B5CA8', cream: '#FFF5E2', sky: '#8EC3E6',
  // album extras
  blood: '#B3263A', gold: '#EDB83C', goldDk: '#A8741C', grass: '#9DBB5C', leaf: '#5F8F45', leafDk: '#3C6638',
  earth: '#8C6442', earthDk: '#5A3D27', stone: '#DCCDB2', stoneDk: '#AE9C80', zinc: '#8FA0B3', wood: '#B87A4B',
  woodDk: '#7C4A2C', wall: '#F2E1C6', dusk: '#F0B27A', smoke: '#C9C3CF', denim: '#4A5F8F', bubble: '#FFFBF1'
};

// ---------- style ----------
// 'noir' (default): colour film noir — muted, contrasted colours, darkness tinted night-blue cut by pools of light around
// the faces and the lamps, venetian-blind light indoors, rain in the city, half-shadowed faces, typewriter captions,
// black page; blood, gold, hearts, wine and the police light stay fully saturated.
// 'noirbw': the same in black & white (only those accents keep their colour). 'aquarelle': the original watercolour.
// Choose with ?style=… (render.mjs --style=…).
const STYLE = new URLSearchParams(location.search).get('style') || 'noir';
const NOIR = STYLE === 'noir' || STYLE === 'noirbw';       // film-noir lighting, black page, typewriter captions
const MONO = STYLE === 'noirbw';                           // … in black & white (otherwise in colour)
const ACCENT = new Set(['#b3263a', '#8e1b2e', '#6a1020', '#7a1424',                 // blood
  '#edb83c', '#a8741c', '#f8dc7a', '#fff6c8', '#fff3c4', '#ffe08a',                 // gold
  '#e2476e', '#8a2234', '#4a8fe0', '#8ec3ff']);                                       // hearts, wine, police light
const isAccent = c => typeof c === 'string' && ACCENT.has(c.toLowerCase());
const TONE = new Map();
// Colour → noir grade (accents pass through). Colour: muted, contrasted, cool shadows and warm highlights.
// Black & white: a grey contrast curve with deep blacks.
function tone(c) {
  if (!NOIR || typeof c !== 'string' || c[0] !== '#' || c.length !== 7) return c;
  const k = c.toLowerCase(); if (ACCENT.has(k)) return k;
  let v = TONE.get(k); if (v) return v;
  const n = parseInt(k.slice(1), 16), r0 = (n >> 16 & 255) / 255, g0 = (n >> 8 & 255) / 255, b0 = (n & 255) / 255;
  const L0 = .2126 * r0 + .7152 * g0 + .0722 * b0;
  const hex = (r, g, b) => '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('');
  if (MONO) {
    const L = Math.max(L0 * .38, Math.min(1, (Math.pow(L0, 1.2) - .5) * 1.5 + .48)), y = L * .973 + .016;
    v = hex(y, y, y + .012);
  } else {
    const Lt = Math.max(L0 * .45, Math.min(1, (Math.pow(L0, 1.12) - .5) * 1.32 + .47));
    const sat = .8, f = L0 > .002 ? Lt / L0 : 0;
    let r = (L0 + (r0 - L0) * sat) * f, g = (L0 + (g0 - L0) * sat) * f, b = (L0 + (b0 - L0) * sat) * f;
    const sh = Math.max(0, Math.min(1, (.5 - Lt) / .5)) * .26, hi = Math.max(0, Math.min(1, (Lt - .62) / .38)) * .1;
    r += (.10 - r) * sh + (1 - r) * hi; g += (.14 - g) * sh + (.92 - g) * hi; b += (.27 - b) * sh + (.78 - b) * hi;
    v = hex(r, g, b);
  }
  TONE.set(k, v); return v;
}

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const jit = a => (random() * 2 - 1) * a;                      // seeded per panel → stable renders
const rnd = (a = 0, b = 1) => lerp(a, b, random());
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
const shade = (c, k = .25) => mixCol(c, PAL.ink, k);          // darker version of a colour
const tint = (c, k = .3) => mixCol(c, PAL.cream, k);          // lighter version

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)],
          [x + w + jit(j) * .5, y + h / 2], [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5],
          [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  r = Math.min(r, w / 2, h / 2);
  const p = [], sg = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= sg; i++) { const a = a0 + i / sg * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .38, n = 4, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
function heartPts(cx, cy, r, n = 22) {
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push([cx + 16 * Math.pow(Math.sin(a), 3) * r / 16, cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 16]); } return p;
}
// Organic blob (bushes, canopies, clouds, smoke): radius r with lumpy variation, stable for a given seed.
function blobPts(cx, cy, rx, ry, n = 18, lump = .18, seed = 1) {
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + lump * (hash(seed * 13.7 + i * 3.1) * 2 - 1); p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return p;
}
// Scalloped cloud/canopy outline: n bumps around an ellipse.
function scallopPts(cx, cy, rx, ry, n = 9, bump = .22, seed = 1) {
  const p = [];
  for (let i = 0; i < n; i++) for (let k = 0; k < 5; k++) {
    const a = (i + k / 5) / n * TAU, b = Math.sin(k / 5 * Math.PI) * bump * (0.75 + .5 * hash(seed + i * 7.3));
    p.push([cx + Math.cos(a) * rx * (1 + b), cy + Math.sin(a) * ry * (1 + b)]);
  }
  return p;
}
// Tapered limb: a capsule from (ax, ay) radius ra to (bx, by) radius rb.
function capsule(ax, ay, bx, by, ra, rb, n = 6) {
  const a = Math.atan2(by - ay, bx - ax), p = [];
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + i / n * Math.PI; p.push([ax + Math.cos(t) * ra, ay + Math.sin(t) * ra]); }
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + i / n * Math.PI; p.push([bx + Math.cos(t) * rb, by + Math.sin(t) * rb]); }
  return p;
}
const polyX = (pts, f) => pts.map(([x, y]) => f(x, y));

// ---------- transform tracking (mirrors p5's matrix so we know where things land in the panel) ----------
let XM = [1, 0, 0, 1, 0, 0]; const XS = [];
const mmul = (M, N) => [M[0] * N[0] + M[2] * N[1], M[1] * N[0] + M[3] * N[1], M[0] * N[2] + M[2] * N[3], M[1] * N[2] + M[3] * N[3], M[0] * N[4] + M[2] * N[5] + M[4], M[1] * N[4] + M[3] * N[5] + M[5]];
function xPush() { push(); XS.push(XM.slice()); }
function xPop() { pop(); XM = XS.pop(); }
function xT(x, y) { translate(x, y); XM = mmul(XM, [1, 0, 0, 1, x, y]); }
function xR(a) { if (!a) return; rotate(a); const c = Math.cos(a), s = Math.sin(a); XM = mmul(XM, [c, s, -s, c, 0, 0]); }
function xS(sx, sy = sx) { scale(sx, sy); XM = mmul(XM, [sx, 0, 0, sy, 0, 0]); }
const xApply = (x, y) => [XM[0] * x + XM[2] * y + XM[4], XM[1] * x + XM[3] * y + XM[5]];
const xScale = () => Math.hypot(XM[0], XM[1]);

// ---------- painting ----------
let SWK = 1;                                   // stroke-weight factor (cameras thin the ink when zooming in)
// Cardinal spline through the points (k = 0: straight segments). p5.brush's own curved shapes do not always fill,
// so curves are sampled here and every shape is painted as a plain polygon.
function smoothPts(pts, k, closed = true) {
  const N = pts.length; if (N < 3 || !k) return pts;
  const out = [], a = Math.min(1, k * 2.2), segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = pts[closed ? (i - 1 + N) % N : Math.max(0, i - 1)], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[closed ? (i + 2) % N : Math.min(N - 1, i + 2)];
    const n = Math.max(2, Math.min(9, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 14)));
    const m1x = a * (p2[0] - p0[0]) / 2, m1y = a * (p2[1] - p0[1]) / 2, m2x = a * (p3[0] - p1[0]) / 2, m2y = a * (p3[1] - p1[1]) / 2;
    for (let s = 0; s < n; s++) {
      const t = s / n, t2 = t * t, t3 = t2 * t, h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
      out.push([h00 * p1[0] + h10 * m1x + h01 * p2[0] + h11 * m2x, h00 * p1[1] + h10 * m1y + h01 * p2[1] + h11 * m2y]);
    }
  }
  if (!closed) out.push(pts[N - 1]);
  return out;
}
function paint(pts, o = {}) {
  if (o.curv) pts = smoothPts(pts, o.curv, !o.open);
  if (o.wash || o.fill || o.hatch) {
    if (o.wash) brush.wash(tone(o.wash), o.washOp ?? 255); else brush.noWash();
    if (o.fill) { brush.fill(tone(o.fill), o.fillOp ?? 170); brush.fillBleed(o.bleed ?? .1); brush.fillTexture(o.tex ?? .4, o.border ?? .35); } else brush.noFill();
    if (o.hatch) { brush.hatch(o.hatch.d, o.hatch.a, o.hatch.o || { rand: .15 }); brush.hatchStyle(o.hatch.b || 'HB', tone(o.hatch.c || PAL.ink), (o.hatch.w || 1) * SWK); } else brush.noHatch();
    brush.noStroke();
    brush.polygon(pts);
  }
  if (o.ink !== null) {
    brush.noWash(); brush.noFill(); brush.noHatch(); brush.set(o.br || 'ink', tone(o.ink || PAL.ink), (o.sw ?? 1) * SWK * (NOIR ? 1.12 : 1));
    brush.beginShape(0); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(o.open ? false : true);
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br, tone(col), sw * SWK * (NOIR ? 1.12 : 1)); brush.spline(pts, curv);
}
// soft watercolour glow / shadow pool
// Soft light: stacked translucent washes (watercolour fills darken, so light is painted as washes).
function glow(cx, cy, rx, ry, col, op = 90, soft = .3) {
  if (NOIR) { light(cx, cy, Math.max(rx, ry) * 1.2, clamp(op / 110, .3, 1), col); if (MONO && !isAccent(col)) col = '#FFFFFF'; }
  const n = 5;
  for (let k = 0; k < n; k++) { const f = 1 - k / n * .82; paint(ellPts(cx, cy, rx * f, ry * f, 28, Math.min(rx, ry) * .03), { wash: col, washOp: op * .3, ink: null }); }
}
// Watercolour shadow / pigment pool (darkens what is under it).
function pool(cx, cy, rx, ry, col, op = 90, bleed = .3) { paint(ellPts(cx, cy, rx, ry, 24), { fill: col, fillOp: op, bleed, tex: .3, border: .2, ink: null }); }
function wash(pts, col, op = 255) { paint(pts, { wash: col, washOp: op, ink: null }); }

// ---------- panel state ----------
let PANEL = null, ANCH = {}, ZOOM = 1, JOB = null, paperC = null, grainC = null, paperG = null;
function cam(cx, cy, zoom = 1, rot = 0) {
  xT(PANEL.w / 2, PANEL.h / 2); xR(rot); xS(zoom); xT(-cx, -cy);
  ZOOM = zoom; SWK = Math.pow(zoom, -.55);
}
// Text painted in the scene (signs, banners, screens). It is drawn into the panel right away (pending brush work is
// flushed first), so anything painted afterwards covers it. o: { font: 'marker' | 'hand', rot, alpha, align, stroke, bold }
let txtG = null;
function brushFlush() {
  push(); resetMatrix(); translate(-PANEL.w / 2, -PANEL.h / 2);
  brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill('#000000', 1); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-50, -50], [-40, -50], [-40, -40]]); brush.noFill();
  pop();
}
function worldText(txt, x, y, size, col = PAL.ink, o = {}) {
  const [px, py] = xApply(x, y), sz = size * xScale(), rot = (o.rot || 0) + Math.atan2(XM[1], XM[0]);
  if (sz < 4 || px < -400 || py < -200 || px > PANEL.w + 400 || py > PANEL.h + 200) return;
  if (!txtG || txtG.width !== PANEL.w || txtG.height !== PANEL.h) { if (txtG) txtG.remove(); txtG = createGraphics(PANEL.w, PANEL.h); txtG.pixelDensity(1); }
  const c = txtG.drawingContext; c.clearRect(0, 0, PANEL.w, PANEL.h);
  c.save(); c.translate(px, py); c.rotate(rot); c.globalAlpha = o.alpha ?? .92;
  c.font = o.font === 'hand' ? `${o.bold ? 800 : 600} ${sz}px ${F_DIAL}` : `${sz}px ${F_FX}`;
  c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = sz * .14; c.strokeStyle = tone(o.stroke); c.strokeText(txt, 0, 0); }
  c.fillStyle = tone(col); c.fillText(txt, 0, 0); c.restore();
  brushFlush();
  push(); resetMatrix(); translate(-PANEL.w / 2, -PANEL.h / 2); image(txtG, 0, 0); pop();
}
// Record where a speaker's mouth is (in panel px) so bubble tails can point at it.
function anchor(name, x, y, r = 0) { const p = xApply(x, y); ANCH[name] = [p[0], p[1], r * xScale()]; }
// Noir lighting: a light source at world (x, y) with radius r (pools of light cut into the panel's darkness).
function light(x, y, r, k = 1, col = null) { if (!PANEL) return; const [px, py] = xApply(x, y); PANEL.lights.push([px, py, r * xScale(), k, col]); }
// Per-panel noir mood, set by the sets: { dark: 0..1 darkness away from the lights, tint: [r, g, b] colour of the darkness,
//   blinds: true | alpha, rain: true | density }
function noirMood(o) { if (PANEL) PANEL.mood = { ...PANEL.mood, ...o }; }
// Full-panel tint (night, flashback, fades) — screen space.
function panelWash(col, op = 255, o = {}) {
  xPush(); XM = [1, 0, 0, 1, 0, 0]; resetMatrix(); translate(-PANEL.w / 2, -PANEL.h / 2);
  paint(rectPts(-40, -40, PANEL.w + 80, PANEL.h + 80), { wash: o.fill ? null : col, washOp: op, fill: o.fill ? col : null, fillOp: op, bleed: .05, tex: o.tex ?? .5, border: .3, ink: null });
  xPop();
}
// Vignette that darkens the panel edges (screen space).
function panelVignette(col = PAL.ink, op = 120, k = .62) {
  xPush(); XM = [1, 0, 0, 1, 0, 0]; resetMatrix(); translate(-PANEL.w / 2, -PANEL.h / 2);
  const w = PANEL.w, h = PANEL.h, cx = w / 2, cy = h / 2, R = Math.hypot(w, h) * .5, pts = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; pts.push([cx + Math.cos(a) * w * k, cy + Math.sin(a) * h * k]); }
  // ring = everything outside the ellipse, built from quads
  for (let i = 0; i < 40; i++) {
    const a = pts[i], b = pts[(i + 1) % 40], out = p => [cx + (p[0] - cx) * 3, cy + (p[1] - cy) * 3];
    paint([a, b, out(b), out(a)], { fill: col, fillOp: op, bleed: .25, tex: .2, border: .1, ink: null });
  }
  xPop();
}

// ---------- pages ----------
const PAGES = {};
function page(n, rows, o = {}) { PAGES[n] = { rows, ...o }; }
// Lay rows of panels into the content box. rows: [[heightWeight, [panel, ...]], ...]
function layout(P) {
  const x0 = MAR.l, y0 = MAR.t, cw = PW - MAR.l - MAR.r, chh = PH - MAR.t - MAR.b;
  if (P.full) return [{ ...P.full, x: 0, y: 0, w: PW, h: PH, border: false }];
  const rows = P.rows, tot = rows.reduce((s, r) => s + r[0], 0), avail = chh - GUT * (rows.length - 1);
  const out = []; let y = y0;
  rows.forEach(([hw, panels], ri) => {
    const rh = Math.round(avail * hw / tot), wt = panels.reduce((s, p) => s + (p.w || 1), 0), aw = cw - GUT * (panels.length - 1);
    let x = x0;
    panels.forEach((p, i) => {
      const pw = i === panels.length - 1 ? x0 + cw - x : Math.round(aw * (p.w || 1) / wt);
      out.push({ ...p, x, y, w: pw, h: rh, row: ri, col: i });
      x += pw + GUT;
    });
    y += rh + GUT;
  });
  return out;
}

// ---------- paper + grain ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makePaper(w, h, seed = 11) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'), r = lcg(seed);
  const tint = NOIR ? '95,95,100' : '160,125,80', fib = NOIR ? '70,70,75' : '110,88,60';
  c.fillStyle = NOIR ? '#ECEBE8' : PAL.paper; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { const x = r() * w, y = r() * h, rr = 120 + r() * 420, gr = c.createRadialGradient(x, y, 0, x, y, rr), a = .045 * r(); gr.addColorStop(0, `rgba(${tint},${a})`); gr.addColorStop(1, `rgba(${tint},0)`); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  c.lineWidth = 1;
  for (let i = 0; i < 2400; i++) { const x = r() * w, y = r() * h, l = 6 + r() * 26, a = r() * TAU; c.strokeStyle = `rgba(${fib},${.03 + r() * .05})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return cv;
}
function makeGrain(w, h) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'), r = lcg(5);
  const id = c.createImageData(w, h), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (r() < .55 ? r() * r() * (NOIR ? 46 : 30) : 0); d[i] = v; d[i + 1] = NOIR ? v : v - 1; d[i + 2] = NOIR ? v : v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(w / 2, h / 2, h * .42, w / 2, h / 2, h * .78); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, NOIR ? 'rgba(40,40,48,.3)' : 'rgba(150,120,90,.22)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  return cv;
}

// ---------- brushes ----------
function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .25, sharpness: .8, grain: 40, opacity: 235, spacing: .2, pressure: [1.15, .75], rotate: 'natural', noise: .15 });
  brush.add('inkfine', { type: 'default', weight: 2.6, scatter: .15, sharpness: .85, grain: 40, opacity: 230, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .1 });
  brush.add('dry', { type: 'default', weight: 14, scatter: 3, sharpness: .3, grain: 6, opacity: 90, spacing: .6, pressure: [1, .6], rotate: 'natural', noise: .4 });
}

// ---------- p5 lifecycle ----------
async function setup() {
  createCanvas(800, 600, WEBGL); pixelDensity(1); noLoop();
  brush.scaleBrushes(5); defineBrushes();
  paperC = makePaper(PW, PH); grainC = makeGrain(PW, PH);
  paperG = createGraphics(PW, PH); paperG.pixelDensity(1); paperG.drawingContext.drawImage(paperC, 0, 0);
  await Promise.all(FONTS.map(f => document.fonts.load(f)));
  window.fontsOk = FONTS.every(f => document.fonts.check(f));
  window.ready = true;
}
function draw() {
  if (!JOB) return;
  brush.load();
  XM = [1, 0, 0, 1, 0, 0]; XS.length = 0; SWK = 1; ZOOM = 1; ANCH = {}; PANEL = JOB; JOB.lights = []; JOB.mood = { dark: .45 };
  push(); translate(-JOB.w / 2, -JOB.h / 2);
  randomSeed(JOB.seed); noiseSeed(JOB.seed % 1000);
  image(paperG, -JOB.x, -JOB.y);
  try { JOB.draw(JOB.w, JOB.h); } catch (e) { console.error('panel ' + JOB.id + ': ' + e.stack); }
  pop();
}

async function paintPanel(pn) {
  resizeCanvas(pn.w, pn.h, true);
  JOB = pn; await redraw(); JOB = null;
  pn.anch = { ...ANCH };
  return drawingContext.canvas;
}

// Film-noir lighting pass on a painted panel: darkness everywhere except pools of light around the faces and the
// light sources, venetian-blind stripes indoors, rain outdoors.
function noirPost(src, pn) {
  const w = pn.w, h = pn.h, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.filter = MONO ? 'contrast(1.12)' : 'contrast(1.1) saturate(.95)'; c.drawImage(src, 0, 0, w, h, 0, 0, w, h); c.filter = 'none';
  const md = pn.mood || {}, dark = md.dark ?? .45, tint = MONO ? [3, 3, 6] : (md.tint || [6, 10, 30]);
  if (dark > 0) {
    const m = document.createElement('canvas'); m.width = w; m.height = h; const d = m.getContext('2d');
    d.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${dark})`; d.fillRect(0, 0, w, h);
    d.globalCompositeOperation = 'destination-out';
    const pools = [], diag = Math.hypot(w, h);
    for (const a of Object.values(pn.anch || {})) {
      const r = a[2] || 30; if (a[0] < -r * 4 || a[1] < -r * 4 || a[0] > w + r * 4 || a[1] > h + r * 4) continue;
      pools.push([a[0], a[1] - r * .7, clamp(r * 6.5, diag * .16, diag * .55), .95]);
    }
    for (const L of pn.lights || []) pools.push([L[0], L[1], Math.min(L[2], diag * 1.2), L[3]]);
    if (!pools.length) pools.push([w * .5, h * .42, diag * .45, .75]);
    for (const [x, y, R, k] of pools) {
      if (R < 4) continue;
      const g = d.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(.42, `rgba(0,0,0,${k * .82})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g; d.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
    d.globalCompositeOperation = 'source-over';
    if (md.blinds) {
      // light through venetian blinds: bright slats cut into the darkness, strongest near the window, fading away
      const gap = md.blindsGap ?? clamp(h / 9, 40, 110), a = md.blinds === true ? .8 : md.blinds;
      const S = document.createElement('canvas'); S.width = w; S.height = h; const sc = S.getContext('2d');
      sc.save(); sc.translate(w / 2, h / 2); sc.rotate(md.blindsAngle ?? -.42); sc.fillStyle = '#000';
      for (let y = -diag; y < diag; y += gap) sc.fillRect(-diag, y, 2 * diag, gap * .5);
      sc.restore();
      const [bx, by] = md.blindsFrom || [w * .12, h * .05];
      const g = sc.createRadialGradient(bx, by, 0, bx, by, diag * .95);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.55, `rgba(0,0,0,${a * .55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      sc.globalCompositeOperation = 'destination-in'; sc.fillStyle = g; sc.fillRect(0, 0, w, h);
      d.globalCompositeOperation = 'destination-out'; d.drawImage(S, 0, 0); d.globalCompositeOperation = 'source-over';
    }
    c.drawImage(m, 0, 0);
  }
  if (!MONO) for (const L of pn.lights || []) {           // coloured lights bloom a little (screen)
    if (!L[4] || L[3] < .3 || L[2] < 8) continue;
    const R = Math.min(L[2], diag * 1.2), g = c.createRadialGradient(L[0], L[1], 0, L[0], L[1], R), col = tone(L[4]);
    const n = parseInt(col.slice(1), 16), rgb = `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`;
    g.addColorStop(0, `rgba(${rgb},${.2 * L[3]})`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(L[0] - R, L[1] - R, 2 * R, 2 * R); c.globalCompositeOperation = 'source-over';
  }
  if (md.rain) {
    const r = lcg(Math.round(pn.x * 7 + pn.y * 3) + 11), n = Math.round(w * h / 2200 * (md.rain === true ? 1 : md.rain));
    c.lineCap = 'round';
    for (const [lw, al] of [[1, .22], [1.8, .32]]) {
      c.strokeStyle = `rgba(225,228,236,${al})`; c.lineWidth = lw; c.beginPath();
      for (let i = 0; i < n / 2; i++) { const x = r() * (w + 120) - 20, y = r() * (h + 60) - 30, l = 16 + r() * 46; c.moveTo(x, y); c.lineTo(x - l * .22, y + l); }
      c.stroke();
    }
  }
  return cv;
}

// Render page n → { url, ms }. o.type 'image/jpeg' | 'image/png', o.q quality, o.only = panel index (debug).
window.renderPage = async (n, o = {}) => {
  const t0 = performance.now(), P = PAGES[n];
  if (!P) throw new Error('no page ' + n);
  const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH; const c = pc.getContext('2d');
  if (NOIR) { c.fillStyle = '#0B0B0E'; c.fillRect(0, 0, PW, PH); } else c.drawImage(paperC, 0, 0);
  if (P.under) P.under(c);
  const rects = layout(P), times = [];
  for (let i = 0; i < rects.length; i++) {
    const pn = rects[i]; pn.id = n + ':' + (i + 1); pn.seed = 1000 + n * 97 + i * 13;
    if (o.only != null && o.only !== i + 1) continue;
    const t1 = performance.now();
    let cv = await paintPanel(pn);
    if (NOIR) cv = noirPost(cv, pn);
    c.drawImage(cv, 0, 0, pn.w, pn.h, pn.x, pn.y, pn.w, pn.h);
    times.push(Math.round(performance.now() - t1));
  }
  for (let i = 0; i < rects.length; i++) if (rects[i].border !== false && (o.only == null || o.only === i + 1)) inkFrame(c, rects[i]);
  for (let i = 0; i < rects.length; i++) if (o.only == null || o.only === i + 1) letterPanel(c, rects[i]);
  if (P.over) P.over(c, rects);
  c.globalCompositeOperation = 'multiply'; c.drawImage(grainC, 0, 0); c.globalCompositeOperation = 'source-over';
  if (!P.full && !P.noFolio) folio(c, n);
  return { url: pc.toDataURL(o.type || 'image/jpeg', o.q ?? .92), ms: Math.round(performance.now() - t0), panels: times };
};
window.pageList = () => Object.keys(PAGES).map(Number).sort((a, b) => a - b);

// ======================================================================================
// Lettering (2D canvas, page coordinates)
// ======================================================================================
const F_DIAL = '"Shantell Sans", "Comic Sans MS", sans-serif', F_FX = '"Permanent Marker", "Comic Sans MS", cursive';
const F_TYPE = '"Special Elite", "Courier New", monospace', F_TITLE = '"Limelight", "Didot", serif';   // noir captions, noir title
const FONTS = ['600 27px "Shantell Sans"', 'italic 400 21px "Shantell Sans"', '800 30px "Shantell Sans"', 'italic 600 24px "Shantell Sans"', '100px "Permanent Marker"',
  '400 24px "Special Elite"', '100px "Limelight"'];
const LET = { size: 26, lh: 1.17, trSize: 20, trLh: 1.15, padX: 20, padY: 15 };

function inkFrame(c, r) {
  const rr = lcg(Math.round(r.x * 7 + r.y * 13) + 3), j = () => (rr() - .5) * 2.2;
  for (const [lw, a] of [[3.6, .95], [1.4, .55]]) {
    c.save(); c.strokeStyle = NOIR ? '#E4E1DA' : PAL.ink; c.globalAlpha = NOIR ? a * .9 : a; c.lineWidth = NOIR ? lw * .7 : lw; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath();
    const pts = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h], [r.x, r.y]];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      for (let k = 0; k <= 6; k++) { const x = lerp(ax, bx, k / 6) + j(), y = lerp(ay, by, k / 6) + j(); if (i === 0 && k === 0) c.moveTo(x, y); else c.lineTo(x, y); }
    }
    c.stroke(); c.restore();
  }
}

function folio(c, n) {
  c.save(); c.font = NOIR ? `400 24px ${F_TYPE}` : `600 22px ${F_DIAL}`; c.fillStyle = NOIR ? '#D9D6CF' : PAL.ink; c.globalAlpha = .75; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(String(n), PW / 2, PH - MAR.b / 2 + 4); c.restore();
}

function wrapLines(c, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(/ +/); let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
    }
    out.push(line);
  }
  return out;
}

// Measure a bubble's text block. Returns { lines: [{txt, font, w, y, h}], w, h }.
function bubbleText(c, b, maxW) {
  const lines = []; let y = 0;
  const main = b.upper === false ? b.t : String(b.t).toUpperCase(), sz = (b.size || 1) * LET.size;
  c.font = `${b.bold ? 800 : 600} ${sz}px ${F_DIAL}`; c.letterSpacing = '0.6px';
  if (b.t) for (const L of wrapLines(c, main, maxW)) { lines.push({ txt: L, font: c.font, w: c.measureText(L).width, y, h: sz * LET.lh, col: PAL.ink, ls: '0.6px' }); y += sz * LET.lh; }
  if (b.tr) {
    const ts = (b.size || 1) * LET.trSize; if (b.t) y += ts * .25;
    c.font = `italic 400 ${ts}px ${F_DIAL}`; c.letterSpacing = '0px';
    for (const L of wrapLines(c, '(' + b.tr + ')', maxW)) { lines.push({ txt: L, font: c.font, w: c.measureText(L).width, y, h: ts * LET.trLh, col: NOIR ? '#55545C' : '#5E5368', ls: '0px' }); y += ts * LET.trLh; }
  }
  c.letterSpacing = '0px';
  return { lines, w: Math.max(...lines.map(l => l.w)), h: y };
}

// superellipse outline around (cx, cy)
function sePts(cx, cy, rx, ry, n = 2.5, k = 64, wob = 0, seed = 1) {
  const p = [];
  for (let i = 0; i < k; i++) {
    const a = i / k * TAU, ca = Math.cos(a), sa = Math.sin(a), w = 1 + wob * Math.sin(a * 3 + seed) * .5 + wob * Math.sin(a * 5 + seed * 2) * .5;
    p.push([cx + Math.sign(ca) * Math.pow(Math.abs(ca), 2 / n) * rx * w, cy + Math.sign(sa) * Math.pow(Math.abs(sa), 2 / n) * ry * w]);
  }
  return p;
}
// Where does the ray from the centre at angle a leave the bubble? (superellipse radius)
function seRadius(rx, ry, n, a) { const ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a)); return 1 / Math.pow(Math.pow(ca / rx, n) + Math.pow(sa / ry, n), 1 / n); }

function pathPts(c, pts, close = true) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (close) c.closePath(); }

function letterPanel(c, r) {
  // captions first (they sit in corners), then bubbles in reading order, then sound effects on top
  for (const cp of r.cap || []) caption(c, r, cp);
  let prev = null;
  for (const b of r.bub || []) { prev = bubble(c, r, b, prev); }
  for (const s of r.sfx || []) sfxText(c, r, s);
}

// A speech bubble. b: { s: speaker, t: text, tr: translation, x, y (fractions of the panel; centre), mw: max text width,
//   kind: 'speech'|'shout'|'whisper'|'thought'|'box', tail: [fx, fy] explicit target | false, link: true (joins previous) ,
//   to: 'top'|'left'|... (tail aims off-panel), size }
function bubble(c, r, b, prev) {
  const kind = b.kind || 'speech';
  const maxW = b.mw || clamp(r.w * .44, 230, 470);
  const tb = bubbleText(c, b, maxW);
  const cx = r.x + (b.x ?? .5) * r.w, cy = r.y + (b.y ?? .2) * r.h, n = kind === 'box' ? 6 : 2.6;
  // grow the superellipse until every line's corners fit inside
  let rx = tb.w / 2 + LET.padX, ry = tb.h / 2 + LET.padY;
  const fits = () => tb.lines.every(L => { const lx = L.w / 2 + 6, top = Math.abs(L.y - tb.h / 2), bot = Math.abs(L.y + L.h - tb.h / 2), ly = Math.max(top, bot) + 2; return Math.pow(lx / rx, n) + Math.pow(ly / ry, n) <= 1; });
  for (let i = 0; i < 60 && !fits(); i++) { rx *= 1.03; ry *= 1.035; }
  if (kind === 'shout') { rx *= 1.12; ry *= 1.18; }
  if (kind === 'thought') { rx *= 1.08; ry *= 1.1; }
  const seed = Math.round(cx * 3 + cy);
  let body = kind === 'shout' ? spikyPts(cx, cy, rx, ry, seed) : kind === 'thought' ? cloudPts(cx, cy, rx, ry, seed) : sePts(cx, cy, rx, ry, n, 72, .012, seed);
  // tail target
  let tgt = null;
  if (b.tail && Array.isArray(b.tail)) tgt = [r.x + b.tail[0] * r.w, r.y + b.tail[1] * r.h];
  else if (b.tail !== false && b.s && r.anch && r.anch[b.s]) tgt = [r.x + r.anch[b.s][0], r.y + r.anch[b.s][1]];
  if (b.link && prev) tgt = null;
  let tail = null;
  if (tgt && kind !== 'box') {
    const a = Math.atan2(tgt[1] - cy, tgt[0] - cx), rad = seRadius(rx, ry, n, a), dist = Math.hypot(tgt[0] - cx, tgt[1] - cy);
    const edge = [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    const gap = b.gap ?? 26, len = clamp(dist - rad - gap, 18, b.maxTail || 230);
    const tip = [edge[0] + Math.cos(a) * len, edge[1] + Math.sin(a) * len];
    const bw = clamp(Math.min(rx, ry) * .34, 14, 30), pa = a + Math.PI / 2;
    const base1 = [cx + Math.cos(a) * rad * .82 + Math.cos(pa) * bw, cy + Math.sin(a) * rad * .82 + Math.sin(pa) * bw];
    const base2 = [cx + Math.cos(a) * rad * .82 - Math.cos(pa) * bw, cy + Math.sin(a) * rad * .82 - Math.sin(pa) * bw];
    const bend = (b.bend ?? .18) * len, mid = [(edge[0] + tip[0]) / 2 + Math.cos(pa) * bend, (edge[1] + tip[1]) / 2 + Math.sin(pa) * bend];
    if (kind === 'thought') tail = { dots: [[lerp(edge[0], tip[0], .35), lerp(edge[1], tip[1], .35), 13], [lerp(edge[0], tip[0], .7), lerp(edge[1], tip[1], .7), 8], [tip[0], tip[1], 5]] };
    else tail = { pts: [base1, [lerp(base1[0], mid[0], .6), lerp(base1[1], mid[1], .6)], tip, [lerp(base2[0], mid[0], .45), lerp(base2[1], mid[1], .45)], base2] };
  }
  // link to previous bubble of the same speaker
  let neck = null;
  if (b.link && prev) {
    const a = Math.atan2(prev.cy - cy, prev.cx - cx), w = 11;
    const p1 = [cx + Math.cos(a) * seRadius(rx, ry, n, a) * .7, cy + Math.sin(a) * seRadius(rx, ry, n, a) * .7];
    const a2 = a + Math.PI, p2 = [prev.cx + Math.cos(a2) * seRadius(prev.rx, prev.ry, prev.n, a2) * .7, prev.cy + Math.sin(a2) * seRadius(prev.rx, prev.ry, prev.n, a2) * .7];
    const pa = a + Math.PI / 2;
    neck = [[p1[0] + Math.cos(pa) * w, p1[1] + Math.sin(pa) * w], [p2[0] + Math.cos(pa) * w, p2[1] + Math.sin(pa) * w], [p2[0] - Math.cos(pa) * w, p2[1] - Math.sin(pa) * w], [p1[0] - Math.cos(pa) * w, p1[1] - Math.sin(pa) * w]];
  }
  // layout checks (printed in the render log): speakers out of the panel, bubbles sitting on a face
  if (b.s && r.anch && r.anch[b.s]) { const [ax, ay] = r.anch[b.s]; if (ax < -10 || ay < -10 || ax > r.w + 10 || ay > r.h + 10) console.warn(`check ${r.id}: speaker ${b.s} is outside the panel`); }
  for (const [who, [ax, ay]] of Object.entries(r.anch || {})) {
    const dx = (r.x + ax - cx) / (rx + 8), dy = (r.y + ay - 30 - cy) / (ry + 8);
    if (dx * dx + dy * dy < 1) console.warn(`check ${r.id}: a bubble covers ${who}'s face`);
  }
  const fillCol = b.fill || (kind === 'box' ? '#F7E7BE' : NOIR ? '#F4F2ED' : PAL.bubble), lw = 3.2;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = PAL.ink;
  // outlines (double width: the fills cover the inner half)
  c.lineWidth = lw * 2;
  if (kind === 'whisper') c.setLineDash([12, 9]);
  if (tail && tail.pts) { pathPts(c, tail.pts); c.stroke(); }
  if (neck) { pathPts(c, neck); c.stroke(); }
  pathPts(c, body); c.stroke();
  c.setLineDash([]);
  c.fillStyle = fillCol;
  if (tail && tail.pts) { pathPts(c, tail.pts); c.fill(); }
  if (neck) { pathPts(c, neck); c.fill(); }
  pathPts(c, body); c.fill();
  if (prev && b.link && prev.body) { pathPts(c, prev.body); c.fill(); prev.redraw && prev.redraw(); }
  if (tail && tail.dots) for (const [x, y, rr] of tail.dots) { c.beginPath(); c.ellipse(x, y, rr, rr * .85, 0, 0, TAU); c.fill(); c.lineWidth = lw; c.stroke(); }
  // text
  const drawText = () => {
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (const L of tb.lines) { c.font = L.font; c.letterSpacing = L.ls; c.fillStyle = b.ink || L.col; c.fillText(L.txt, cx, cy - tb.h / 2 + L.y + (L.h - parseFloat(L.font.match(/(\d+(\.\d+)?)px/)[1])) * .45); }
    c.letterSpacing = '0px';
  };
  drawText();
  c.restore();
  return { cx, cy, rx, ry, n, body, redraw: () => { c.save(); drawText(); c.restore(); } };
}

function spikyPts(cx, cy, rx, ry, seed) {
  const p = [], k = 22;
  for (let i = 0; i < k * 2; i++) {
    const a = i / (k * 2) * TAU, out = i % 2 === 0, f = out ? 1.16 + .08 * hash(seed + i) : .96;
    const ca = Math.cos(a), sa = Math.sin(a);
    p.push([cx + Math.sign(ca) * Math.pow(Math.abs(ca), 2 / 2.6) * rx * f, cy + Math.sign(sa) * Math.pow(Math.abs(sa), 2 / 2.6) * ry * f]);
  }
  return p;
}
function cloudPts(cx, cy, rx, ry, seed) {
  const p = [], n = 11;
  for (let i = 0; i < n; i++) for (let k = 0; k <= 6; k++) {
    const a = (i + k / 6) / n * TAU, b = Math.sin(k / 6 * Math.PI) * .13;
    const ca = Math.cos(a), sa = Math.sin(a);
    p.push([cx + Math.sign(ca) * Math.pow(Math.abs(ca), 2 / 2.4) * rx * (1 + b), cy + Math.sign(sa) * Math.pow(Math.abs(sa), 2 / 2.4) * ry * (1 + b)]);
  }
  return p;
}

// Caption box (récitatif). cp: { t, at: 'tl'|'tr'|'bl'|'br'|'tc'|'bc' | [fx, fy], mw, col }
function caption(c, r, cp) {
  const sz = (cp.size || 23) * (NOIR ? 1.06 : 1), maxW = cp.mw || Math.min(r.w * .6, 520);
  c.save(); c.font = NOIR ? `400 ${sz}px ${F_TYPE}` : `italic 600 ${sz}px ${F_DIAL}`;
  const lines = wrapLines(c, cp.t, maxW), lh = sz * 1.2, w = Math.max(...lines.map(l => c.measureText(l).width)) + 30, h = lines.length * lh + 20;
  let x, y; const at = cp.at || 'tl', inset = 0;
  if (Array.isArray(at)) { x = r.x + at[0] * r.w - w / 2; y = r.y + at[1] * r.h - h / 2; }
  else {
    x = at.includes('l') ? r.x + inset : at.includes('r') ? r.x + r.w - w - inset : r.x + (r.w - w) / 2;
    y = at.includes('t') ? r.y + inset : r.y + r.h - h - inset;
  }
  const rr = lcg(Math.round(x + y) + 7), j = () => (rr() - .5) * 2;
  const pts = [[x + j(), y + j()], [x + w + j(), y + j()], [x + w + j(), y + h + j()], [x + j(), y + h + j()]];
  c.fillStyle = NOIR ? '#E8E3D6' : (cp.col || '#F6E0AE'); pathPts(c, pts); c.fill();
  c.strokeStyle = PAL.ink; c.lineWidth = NOIR ? 2.4 : 3; c.lineJoin = 'round'; pathPts(c, pts); c.stroke();
  c.fillStyle = NOIR ? '#141318' : (cp.ink || PAL.ink); c.textAlign = 'left'; c.textBaseline = 'top';
  lines.forEach((l, i) => c.fillText(l, x + 15, y + 11 + i * lh));
  c.restore();
}

// Sound effect. s: { t, x, y (fractions), size, rot, col, stroke }
function sfxText(c, r, s) {
  const x = r.x + s.x * r.w, y = r.y + s.y * r.h, size = s.size || 70;
  // noir: sound effects in bone white, the violent ones in blood red
  if (NOIR) s = { ...s, col: /BAOUM|PAF|CRAC|BOUM|SPLATCH/.test(s.t) ? '#C3172E' : '#F1EFEA', stroke: PAL.ink };
  const lum = (h => { const v = parseInt(h.slice(1), 16); return ((v >> 16 & 255) * .3 + (v >> 8 & 255) * .59 + (v & 255) * .11) / 255; })(s.col || PAL.ochre);
  if (lum < .35 && !s.stroke) s = { ...s, stroke: PAL.cream };
  c.save(); c.translate(x, y); c.rotate(s.rot ?? -.08); c.font = `${size}px ${F_FX}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round';
  c.lineWidth = size * .16; c.strokeStyle = s.stroke || PAL.ink; c.strokeText(s.t, size * .05, size * .06);
  c.fillStyle = PAL.ink; c.fillText(s.t, size * .05, size * .06);
  c.lineWidth = size * .1; c.strokeStyle = s.stroke || PAL.ink; c.strokeText(s.t, 0, 0);
  c.fillStyle = s.col || PAL.ochre; c.fillText(s.t, 0, 0);
  c.restore();
}

// props.js — objects, animals and vehicles. World-space props take (x, y) = the point resting on the ground (bottom centre)
// and a scale s (s = 1 is life-size next to a 470-unit-tall adult). Hand props take the figure unit u and are drawn in hand
// space: (0, 0) is the wrist, +x runs along the fingers (use them as o.holdN / o.holdF hooks).

// ---------- luggage, loot ----------
function suitcase(x, y, s = 1, o = {}) {
  const col = o.col || '#3E4C6E', w = 104 * s, h = 150 * s, sw = clamp(s, .4, 1.5) * .8;
  xPush(); xT(x, y); xR(o.tilt || 0);
  // telescopic handle
  const hh = (o.handle ?? 0) * 120 * s;
  if (hh > 2) {
    for (const hx of [-26 * s, 26 * s]) paint(rectPts(hx - 4 * s, -h - hh, 8 * s, hh + 10 * s), { wash: '#9AA3B0', ink: PAL.ink, sw: sw * .5 });
    paint(rrPts(-34 * s, -h - hh - 12 * s, 68 * s, 16 * s, 7 * s), { wash: '#3A3640', ink: PAL.ink, sw: sw * .6 });
  }
  // wheels
  for (const wx of [-36 * s, 36 * s]) paint(ellPts(wx, -7 * s, 10 * s, 10 * s, 10), { wash: '#2E2A33', ink: PAL.ink, sw: sw * .5 });
  if (o.open) {
    // lid flipped back, contents visible (seen from above-front)
    paint(rrPts(-w * .55, -h * .62, w * 1.1, h * .62, 12 * s), { wash: shade(col, .25), ink: PAL.ink, sw });
    paint(rrPts(-w * .5, -h * 1.28, w, h * .68, 12 * s), { wash: col, fill: shade(col, .3), fillOp: 60, tex: .5, ink: PAL.ink, sw });
    if (o.open === 'cash') cashPile(0, -h * .32, s * .95); else goldPile(0, -h * .3, s * .9, o.glow ?? 1);
  } else {
    paint(rrPts(-w / 2, -h - 6 * s, w, h, 14 * s), { wash: col, fill: shade(col, .3), fillOp: 70, bleed: .06, tex: .6, border: .5, ink: PAL.ink, sw });
    for (const k of [-.25, 0, .25]) inkLine([[k * w, -h + 6 * s], [k * w, -14 * s]], sw * .35, shade(col, .45), 'inkfine', 0);
    paint(rrPts(-w / 2 + 6 * s, -h * .55, w - 12 * s, 10 * s, 4 * s), { wash: shade(col, .2), ink: PAL.ink, sw: sw * .4 });
    if (o.unzip) {   // zip opened a crack: gold light leaking
      paint([[-w * .42, -h * .58], [w * .42, -h * .58], [w * .3, -h * .45], [-w * .3, -h * .45]], { wash: PAL.gold, ink: PAL.ink, sw: sw * .4 });
      glow(0, -h * .5, w * 1.1, h * .5, PAL.gold, 120, .35);
    }
  }
  xPop();
}
function goldBar(x, y, s, rot = 0) {
  xPush(); xT(x, y); xR(rot);
  paint([[-24 * s, 8 * s], [24 * s, 8 * s], [17 * s, -8 * s], [-17 * s, -8 * s]], { wash: PAL.gold, fill: PAL.goldDk, fillOp: 70, tex: .4, ink: PAL.goldDk, sw: .45 });
  paint([[-17 * s, -8 * s], [17 * s, -8 * s], [14 * s, -3 * s], [-14 * s, -3 * s]], { wash: '#F8DC7A', ink: null });
  xPop();
}
function goldPile(x, y, s = 1, g = 1) {
  if (g > 0) glow(x, y - 10 * s, 120 * s, 70 * s, PAL.gold, 110 * g, .35);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) goldBar(x + (i - (3 - r) / 2) * 44 * s, y - r * 15 * s, s, (hash(r * 7 + i) - .5) * .12);
  for (let i = 0; i < 4; i++) paint(starPts(x + lerp(-60, 60, hash(i * 3.3)) * s, y - lerp(5, 45, hash(i * 5.1)) * s, 9 * s, .3, 4), { wash: '#FFF6C8', ink: null });
}
function cashWad(x, y, s = 1, rot = 0) {
  xPush(); xT(x, y); xR(rot);
  paint(rrPts(-30 * s, -14 * s, 60 * s, 28 * s, 3 * s), { wash: '#B9C9A0', fill: '#7E9468', fillOp: 70, tex: .5, ink: PAL.ink, sw: .45 });
  paint(rectPts(-6 * s, -15 * s, 12 * s, 30 * s), { wash: '#E9DCC0', ink: PAL.ink, sw: .35 });
  paint(ellPts(-18 * s, 0, 5 * s, 5 * s, 8), { wash: '#93A97C', ink: null });
  xPop();
}
function cashPile(x, y, s = 1) { for (let i = 0; i < 7; i++) cashWad(x + lerp(-40, 40, hash(i * 2.7)) * s, y - lerp(0, 30, hash(i * 1.3)) * s, s, (hash(i * 9.1) - .5) * .5); }

// ---------- hand props (hand space, u = figure unit) ----------
function hCoffee(u, sw) {
  xPush(); xT(2.6 * u, -1.0 * u); xR(-Math.PI / 2 + .1);
  paint([[-2.1 * u, -3.6 * u], [2.1 * u, -3.6 * u], [1.6 * u, 3.8 * u], [-1.6 * u, 3.8 * u]], { wash: '#F2EBDD', ink: PAL.ink, sw: sw * .5 });
  paint(rectPts(-1.9 * u, -1 * u, 3.8 * u, 2.4 * u), { wash: PAL.clay, ink: null });
  paint(rrPts(-2.5 * u, -4.6 * u, 5 * u, 1.3 * u, .5 * u), { wash: '#FBF6EC', ink: PAL.ink, sw: sw * .45 });
  xPop();
}
function hCroissant(u, sw) {
  xPush(); xT(3.4 * u, -.6 * u); xR(-.4);
  const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.1 + i / 12 * .8); pts.push([Math.cos(a) * 4.2 * u, Math.sin(a) * 2.6 * u + 2.2 * u]); }
  for (let i = 12; i >= 0; i--) { const a = Math.PI * (1.1 + i / 12 * .8); pts.push([Math.cos(a) * 2.6 * u, Math.sin(a) * 1.0 * u + 2.2 * u]); }
  paint(pts, { wash: '#E0A84E', fill: '#B06F2A', fillOp: 90, tex: .5, ink: PAL.ink, sw: sw * .5, curv: .4 });
  for (const k of [-.45, 0, .45]) inkLine([[k * 3 * u, -.1 * u], [k * 3.2 * u + .3 * u, 1.6 * u]], sw * .4, '#8A5420', 'inkfine', .3);
  xPop();
}
function hKnife(u, sw) {
  paint(rrPts(.6 * u, -.8 * u, 5 * u, 1.6 * u, .6 * u), { wash: '#6B4A33', ink: PAL.ink, sw: sw * .45 });
  paint([[5.4 * u, -.7 * u], [13 * u, -.4 * u], [14.4 * u, .5 * u], [5.4 * u, .8 * u]], { wash: '#D8DEE4', fill: '#9AA6B2', fillOp: 60, ink: PAL.ink, sw: sw * .45 });
}
function hPhone(u, sw, screen = true) {
  xPush(); xT(3 * u, -1.4 * u); xR(-Math.PI / 2 + .15);
  paint(rrPts(-2.4 * u, -4.4 * u, 4.8 * u, 8.8 * u, .8 * u), { wash: '#2E2C36', ink: PAL.ink, sw: sw * .45 });
  if (screen) { paint(rrPts(-2 * u, -3.9 * u, 4 * u, 7.8 * u, .4 * u), { wash: '#F5F2EA', ink: null }); paint(rectPts(-1.6 * u, -3.4 * u, 3.2 * u, 1.2 * u), { wash: '#E2626B', ink: null }); for (let i = 0; i < 4; i++) paint(rectPts(-1.6 * u, (-1.6 + i * 1.1) * u, (i % 2 ? 2 : 3.2) * u, .4 * u), { wash: '#B8B2A8', ink: null }); }
  xPop();
}
function hNotebook(u, sw) {
  xPush(); xT(2.6 * u, -2 * u); xR(-.2);
  paint(rectPts(-3 * u, -4 * u, 6.2 * u, 8 * u), { wash: '#F4EEDC', ink: PAL.ink, sw: sw * .45 });
  paint(rectPts(-3 * u, -4 * u, 6.2 * u, 1.2 * u), { wash: '#C2413A', ink: null });
  for (let i = 0; i < 4; i++) inkLine([[-2.2 * u, (-1.6 + i * 1.4) * u], [2.4 * u, (-1.6 + i * 1.4) * u]], sw * .25, '#8A8FA8', 'inkfine', 0);
  xPop();
}
function hBadge(u, sw) {
  xPush(); xT(3 * u, -2.2 * u); xR(-.1);
  paint(rrPts(-3.2 * u, -4.2 * u, 6.4 * u, 8.2 * u, .8 * u), { wash: '#3B3040', ink: PAL.ink, sw: sw * .45 });
  paint(starPts(0, -1 * u, 2.4 * u, .55, 6), { wash: PAL.gold, fill: PAL.goldDk, fillOp: 60, ink: PAL.ink, sw: sw * .4 });
  paint(rectPts(-2.4 * u, 2 * u, 4.8 * u, 1.2 * u), { wash: '#2E5AA8', ink: null });
  xPop();
}
function hCuffs(u, sw) {
  xPush(); xT(3.4 * u, .6 * u);
  for (const cx of [-1.6, 2.2]) { brush.noFill(); paint(ellPts(cx * u, 2.2 * u, 1.9 * u, 1.9 * u, 16), { ink: '#AEB6C2', sw: sw * 1.3 }); }
  inkLine([[-.2 * u, 1 * u], [.6 * u, .6 * u], [.9 * u, 1 * u]], sw * .6, '#AEB6C2', 'inkfine', .5);
  xPop();
}
function hKeys(u, sw) {
  xPush(); xT(3.4 * u, 1.6 * u);
  paint(ellPts(0, 0, 1.2 * u, 1.2 * u, 12), { ink: '#C9B06A', sw: sw * .6 });
  paint([[.6 * u, .6 * u], [1.2 * u, 4.6 * u], [2 * u, 4.4 * u], [1.6 * u, .6 * u]], { wash: '#C9B06A', ink: PAL.ink, sw: sw * .35 });
  paint([[-.8 * u, .8 * u], [-1.6 * u, 4 * u], [-.8 * u, 4.2 * u], [-.2 * u, 1 * u]], { wash: '#B6BCC6', ink: PAL.ink, sw: sw * .35 });
  xPop();
}
function hWallet(u, sw) { paint(rrPts(1.2 * u, -2.6 * u, 6 * u, 4.4 * u, .6 * u), { wash: '#8A4B3A', fill: '#5E2E24', fillOp: 70, ink: PAL.ink, sw: sw * .45 }); }
function hCash(u, sw) { cashWad(3.6 * u, -.4 * u, u / 9, -.2); }
function hBook(u, sw) { paint(rectPts(.5 * u, -4.5 * u, 6 * u, 8.5 * u), { wash: '#5D7FA6', ink: PAL.ink, sw: sw * .5 }); paint(rectPts(1 * u, -4 * u, 5 * u, 7.5 * u), { wash: '#F3ECDC', ink: null }); }
function hBrush(u, sw) { paint(capsule(1 * u, 0, 10 * u, -2 * u, .4 * u, .3 * u, 3), { wash: '#B98A4F', ink: PAL.ink, sw: sw * .3 }); paint(ellPts(10.6 * u, -2.2 * u, .9 * u, .5 * u, 8), { wash: PAL.rose, ink: null }); }
function hBottle(u, sw) { xPush(); xT(2.4 * u, 0); xR(-Math.PI / 2); paint(rrPts(-1.6 * u, -6 * u, 3.2 * u, 8 * u, 1 * u), { wash: '#5E7A4A', fill: '#3E5A30', fillOp: 70, ink: PAL.ink, sw: sw * .4 }); paint(rectPts(-.6 * u, -9 * u, 1.2 * u, 3.4 * u), { wash: '#5E7A4A', ink: PAL.ink, sw: sw * .35 }); xPop(); }
function hLamp(u, sw) { paint(rectPts(1 * u, -.7 * u, 9 * u, 1.4 * u), { wash: '#C9A66B', ink: PAL.ink, sw: sw * .4 }); paint([[9 * u, -4 * u], [14 * u, -3 * u], [14 * u, 3 * u], [9 * u, 4 * u]], { wash: '#F1DFC0', ink: PAL.ink, sw: sw * .4 }); }
function hAxe(u, sw) { paint(capsule(0, 0, 16 * u, 0, .7 * u, .6 * u, 3), { wash: '#8A6240', ink: PAL.ink, sw: sw * .4 }); paint([[13 * u, -.6 * u], [17 * u, -4 * u], [18.4 * u, .4 * u], [16 * u, .6 * u]], { wash: '#9AA3AE', ink: PAL.ink, sw: sw * .4 }); }
function hFlashlight(u, sw, beam = 1) { if (beam) for (let k = 0; k < 3; k++) paint([[7.6 * u, -1.2 * u], [60 * u, (-10 - k * 5) * u], [60 * u, (10 + k * 5) * u], [7.6 * u, 1.2 * u]], { wash: '#FFF2C0', washOp: 50 * beam, ink: null }); paint(rrPts(.8 * u, -1 * u, 7 * u, 2 * u, .6 * u), { wash: '#4A4A55', ink: PAL.ink, sw: sw * .4 }); }

// ---------- furniture & things ----------
function guitar(x, y, s = 1, rot = 0, o = {}) {
  xPush(); xT(x, y); xR(rot);
  const body = [[-60, -2], [-56, -34], [-30, -44], [-8, -30], [10, -38], [40, -36], [58, -14], [58, 14], [40, 36], [10, 38], [-8, 30], [-30, 44], [-56, 34]].map(([a, b]) => [a * s, b * s]);
  paint(capsule(50 * s, 0, 210 * s, 0, 7 * s, 6 * s, 3), { wash: '#5A3A28', ink: PAL.ink, sw: .6 });
  paint(rrPts(200 * s, -10 * s, 34 * s, 20 * s, 4 * s), { wash: '#4A2E20', ink: PAL.ink, sw: .5 });
  paint(body, { wash: o.col || '#D29A55', fill: '#9C5E2A', fillOp: 90, tex: .6, ink: PAL.ink, sw: .8, curv: .5 });
  paint(ellPts(-4 * s, 0, 14 * s, 14 * s, 14), { wash: '#3A2418', ink: PAL.ink, sw: .4 });
  for (const k of [-3, -1, 1, 3]) inkLine([[-40 * s, k * 1.6 * s], [205 * s, k * 1.2 * s]], .22, '#EDE3CC', 'inkfine', 0);
  xPop();
}
function laptop(x, y, s = 1, o = {}) {
  xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  paint([[-70 * s, 0], [70 * s, 0], [56 * s, -16 * s], [-56 * s, -16 * s]], { wash: '#B9BEC8', ink: PAL.ink, sw: .6 });
  paint([[-56 * s, -16 * s], [56 * s, -16 * s], [62 * s, -104 * s], [-50 * s, -104 * s]], { wash: '#9AA0AC', ink: PAL.ink, sw: .6 });
  paint([[-48 * s, -22 * s], [50 * s, -22 * s], [55 * s, -98 * s], [-43 * s, -98 * s]], { wash: o.screen || '#DCE8EE', fill: '#9EC0D4', fillOp: 60, ink: null });
  xPop();
}
function easel(x, y, s = 1, o = {}) {
  xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  for (const [a, b] of [[[-70, 0], [-10, -420]], [[70, 0], [10, -420]], [[0, -10], [0, -400]]]) inkLine([[a[0] * s, a[1] * s], [b[0] * s, b[1] * s]], 1.4 * s, '#8A5E3A', 'ink', 0);
  paint(rectPts(-70 * s, -215 * s, 140 * s, 10 * s), { wash: '#8A5E3A', ink: PAL.ink, sw: .5 });
  paint(rectPts(-92 * s, -400 * s, 184 * s, 190 * s), { wash: '#F6F1E4', ink: PAL.ink, sw: .7 });
  if (o.portrait) {   // a painted "Greek god" on the canvas
    paint(ellPts(0, -340 * s, 26 * s, 30 * s, 14), { wash: '#E8BA92', ink: PAL.ink, sw: .4 });
    paint(scallopPts(0, -362 * s, 30 * s, 16 * s, 7, .3, 4), { wash: '#2A1F26', ink: null });
    paint([[-50 * s, -228 * s], [-34 * s, -306 * s], [34 * s, -306 * s], [50 * s, -228 * s]], { wash: '#E8BA92', ink: PAL.ink, sw: .4 });
    paint([[-50 * s, -228 * s], [-34 * s, -300 * s], [10 * s, -260 * s], [50 * s, -228 * s]], { wash: '#F7F3EA', ink: PAL.ink, sw: .35 });
    paint(ellPts(55 * s, -380 * s, 14 * s, 9 * s, 8), { wash: PAL.ochre, ink: null });
  }
  xPop();
}
function piano(x, y, s = 1, o = {}) {      // upright piano, three-quarter view, keyboard facing right
  xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  const wood = o.col || '#5A3530';
  paint([[-150 * s, 0], [150 * s, 0], [150 * s, -300 * s], [-150 * s, -300 * s]], { wash: wood, fill: shade(wood, .35), fillOp: 90, tex: .6, ink: PAL.ink, sw: .8 });
  paint([[-160 * s, -300 * s], [160 * s, -300 * s], [160 * s, -318 * s], [-160 * s, -318 * s]], { wash: shade(wood, .2), ink: PAL.ink, sw: .7 });
  paint([[-150 * s, -150 * s], [150 * s, -150 * s], [175 * s, -128 * s], [-125 * s, -128 * s]], { wash: '#F6F1E4', ink: PAL.ink, sw: .5 });
  for (let i = 0; i < 17; i++) { if (i % 7 === 2 || i % 7 === 6) continue; paint(rectPts(-130 * s + i * 17 * s, -150 * s, 8 * s, 12 * s), { wash: '#2B2233', ink: null }); }
  paint([[-125 * s, -128 * s], [175 * s, -128 * s], [175 * s, -110 * s], [-125 * s, -110 * s]], { wash: wood, ink: PAL.ink, sw: .5 });
  for (const lx of [-130, 130]) paint(rectPts(lx * s - 8 * s, -110 * s, 16 * s, 110 * s), { wash: shade(wood, .15), ink: PAL.ink, sw: .5 });
  paint(rectPts(-90 * s, -285 * s, 180 * s, 110 * s), { wash: shade(wood, .1), ink: PAL.ink, sw: .4 });
  if (o.candle !== false) { paint(rectPts(120 * s, -360 * s, 14 * s, 42 * s), { wash: '#F4EEDC', ink: PAL.ink, sw: .35 }); glow(127 * s, -370 * s, 30 * s, 30 * s, PAL.ochre, 100); }
  if (o.score !== false) paint([[-40 * s, -150 * s], [40 * s, -150 * s], [44 * s, -205 * s], [-36 * s, -205 * s]], { wash: '#F6F1E4', ink: PAL.ink, sw: .35 });
  xPop();
}
function bench(x, y, w, s = 1, col = '#9C6B44') {
  paint(rectPts(x - w / 2, y - 120 * s, w, 22 * s), { wash: col, fill: shade(col, .3), fillOp: 60, tex: .5, ink: PAL.ink, sw: .6 });
  for (const lx of [x - w / 2 + 20 * s, x + w / 2 - 34 * s]) paint(rectPts(lx, y - 100 * s, 14 * s, 100 * s), { wash: shade(col, .2), ink: PAL.ink, sw: .5 });
}
function table(x, y, w, s = 1, o = {}) {
  const col = o.col || '#A9774C', top = y - 205 * s;
  paint([[x - w / 2, top], [x + w / 2, top], [x + w / 2 + 30 * s, top + 26 * s], [x - w / 2 - 30 * s, top + 26 * s]], { wash: o.cloth || col, fill: shade(o.cloth || col, .25), fillOp: 60, tex: .5, ink: PAL.ink, sw: .7 });
  paint(rectPts(x - w / 2 - 30 * s, top + 26 * s, w + 60 * s, (o.cloth ? 60 : 16) * s), { wash: shade(o.cloth || col, .15), ink: PAL.ink, sw: .6 });
  if (!o.cloth || true) for (const lx of [x - w / 2 - 10 * s, x + w / 2 - 6 * s]) paint(rectPts(lx, top + 42 * s, 16 * s, 205 * s - 42 * s), { wash: shade(col, .2), ink: PAL.ink, sw: .5 });
  return top;
}
function chair(x, y, s = 1, o = {}) {
  const col = o.col || '#8C5E3C'; xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  paint(rectPts(-40 * s, -118 * s, 90 * s, 16 * s), { wash: col, ink: PAL.ink, sw: .6 });
  for (const lx of [-36, 36]) paint(rectPts(lx * s, -104 * s, 10 * s, 104 * s), { wash: shade(col, .2), ink: PAL.ink, sw: .5 });
  paint(rectPts(-44 * s, -250 * s, 12 * s, 140 * s), { wash: col, ink: PAL.ink, sw: .5 });
  for (const yy of [-240, -205, -170]) paint(rectPts(-44 * s, yy * s, 20 * s, 8 * s), { wash: shade(col, .1), ink: null });
  xPop();
}
function wineGlass(x, y, s = 1, fill = .5) {
  paint([[x - 12 * s, y - 70 * s], [x + 12 * s, y - 70 * s], [x + 9 * s, y - 44 * s], [x, y - 38 * s], [x - 9 * s, y - 44 * s]], { wash: '#EEF3F4', washOp: 150, ink: PAL.ink, sw: .35, curv: .3 });
  if (fill) paint([[x - 10 * s, y - 58 * s], [x + 10 * s, y - 58 * s], [x + 8 * s, y - 45 * s], [x, y - 40 * s], [x - 8 * s, y - 45 * s]], { wash: '#8A2234', ink: null, curv: .3 });
  inkLine([[x, y - 38 * s], [x, y - 3 * s]], .35, PAL.ink, 'inkfine', 0); inkLine([[x - 10 * s, y - 2 * s], [x + 10 * s, y - 2 * s]], .35, PAL.ink, 'inkfine', 0);
}
function candle(x, y, s = 1, lit = true) {
  paint(rectPts(x - 6 * s, y - 60 * s, 12 * s, 60 * s), { wash: '#F4EEDC', ink: PAL.ink, sw: .35 });
  if (lit) { glow(x, y - 72 * s, 50 * s, 50 * s, PAL.ochre, 110); paint([[x, y - 84 * s], [x + 5 * s, y - 68 * s], [x - 5 * s, y - 68 * s]], { wash: '#FFD87A', ink: null, curv: .5 }); }
}
function plate(x, y, s = 1, food = true) {
  paint(ellPts(x, y, 46 * s, 13 * s, 18), { wash: '#F6F2E8', ink: PAL.ink, sw: .4 });
  if (food) { paint(ellPts(x - 8 * s, y - 3 * s, 18 * s, 6 * s, 10), { wash: '#C9783C', ink: null }); paint(ellPts(x + 14 * s, y - 2 * s, 11 * s, 5 * s, 8), { wash: '#6E9F58', ink: null }); }
}
function shovel(x, y, s = 1, rot = 0) {
  xPush(); xT(x, y); xR(rot);
  paint(capsule(0, 0, 0, -260 * s, 5 * s, 5 * s, 3), { wash: '#9C6B44', ink: PAL.ink, sw: .5 });
  paint(rrPts(-18 * s, -284 * s, 36 * s, 16 * s, 6 * s), { wash: '#6B4A33', ink: PAL.ink, sw: .45 });
  paint([[-26 * s, 0], [26 * s, 0], [22 * s, 58 * s], [0, 74 * s], [-22 * s, 58 * s]], { wash: '#8E98A4', fill: '#5E6874', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
  xPop();
}
function bucket(x, y, s = 1, water = true) {
  paint([[x - 40 * s, y - 90 * s], [x + 40 * s, y - 90 * s], [x + 30 * s, y], [x - 30 * s, y]], { wash: '#9AA6B2', fill: '#6E7A88', fillOp: 70, ink: PAL.ink, sw: .6 });
  paint(ellPts(x, y - 90 * s, 40 * s, 9 * s, 14), { wash: water ? '#8EC3E6' : '#5E6874', ink: PAL.ink, sw: .5 });
}
function lampTable(x, y, s = 1, lit = true) {
  if (lit) glow(x, y - 150 * s, 160 * s, 130 * s, '#FFD98A', 110, .35);
  paint(rectPts(x - 6 * s, y - 120 * s, 12 * s, 110 * s), { wash: '#B8925A', ink: PAL.ink, sw: .4 });
  paint(ellPts(x, y - 6 * s, 30 * s, 8 * s, 12), { wash: '#8C6A3E', ink: PAL.ink, sw: .4 });
  paint([[x - 44 * s, y - 112 * s], [x + 44 * s, y - 112 * s], [x + 28 * s, y - 180 * s], [x - 28 * s, y - 180 * s]], { wash: lit ? '#F8E3B4' : '#E2D3B6', ink: PAL.ink, sw: .5 });
}
function musicNotes(x, y, s = 1, n = 3, col = PAL.ink) {
  for (let i = 0; i < n; i++) {
    const nx = x + i * 46 * s, ny = y - (i % 2) * 30 * s + Math.sin(i * 2) * 10 * s;
    paint(ellPts(nx, ny, 9 * s, 7 * s, 10, 0, -.4), { wash: col, ink: null });
    inkLine([[nx + 8 * s, ny - 2 * s], [nx + 8 * s, ny - 40 * s], [nx + 22 * s, ny - 32 * s]], .7 * s, col, 'ink', 0);
  }
}
function fly(x, y, s = 1) {
  paint(ellPts(x, y, 6 * s, 4 * s, 8), { wash: '#2B2233', ink: null });
  for (const k of [-1, 1]) paint(ellPts(x + k * 5 * s, y - 6 * s, 6 * s, 3 * s, 8, 0, k * .6), { wash: '#DDE8F0', washOp: 160, ink: PAL.ink, sw: .25 });
  for (let i = 0; i < 3; i++) inkLine([[x - 30 * s - i * 14 * s, y + Math.sin(i) * 10 * s], [x - 40 * s - i * 14 * s, y - 8 * s + Math.cos(i * 2) * 8 * s]], .3, PAL.ink, 'inkfine', .5);
}

// ---------- animals ----------
function goat(x, y, s = 1, o = {}) {
  const col = o.col || '#F1E9DA', dk = shade(col, .22);
  xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  for (const [lx, a] of [[-46, .1], [-30, -.1], [34, .12], [50, -.08]]) paint(capsule(lx * s, -60 * s, lx * s + a * 30 * s, -2 * s, 6 * s, 5 * s, 3), { wash: lx < 0 && lx > -40 || lx > 40 ? dk : col, ink: PAL.ink, sw: .5 });
  paint(ellPts(0, -82 * s, 66 * s, 32 * s, 18), { wash: col, fill: dk, fillOp: 60, tex: .5, ink: PAL.ink, sw: .7 });
  paint([[-62 * s, -92 * s], [-80 * s, -110 * s], [-74 * s, -84 * s]], { wash: col, ink: PAL.ink, sw: .4 });     // tail
  const hx = 70 * s, hy = (o.graze ? -40 : -118) * s;
  paint([[46 * s, -100 * s], [62 * s, -80 * s], [hx, hy + 22 * s], [hx - 16 * s, hy - 4 * s]], { wash: col, ink: PAL.ink, sw: .5 });   // neck
  paint([[hx - 18 * s, hy - 10 * s], [hx + 4 * s, hy - 18 * s], [hx + 34 * s, hy + 8 * s], [hx + 30 * s, hy + 20 * s], [hx + 4 * s, hy + 16 * s]], { wash: col, fill: dk, fillOp: 50, ink: PAL.ink, sw: .6, curv: .3 });
  paint([[hx - 6 * s, hy - 14 * s], [hx - 22 * s, hy - 40 * s], [hx - 2 * s, hy - 18 * s]], { wash: '#B9A27E', ink: PAL.ink, sw: .4, curv: .3 });    // horn
  paint(ellPts(hx - 12 * s, hy - 4 * s, 10 * s, 4 * s, 8, 0, -.5), { wash: col, ink: PAL.ink, sw: .4 });                                // ear
  paint(ellPts(hx + 8 * s, hy - 2 * s, 2.5 * s, 2 * s, 6), { wash: PAL.ink, ink: null });
  paint([[hx + 20 * s, hy + 18 * s], [hx + 26 * s, hy + 34 * s], [hx + 14 * s, hy + 20 * s]], { wash: shade(col, .1), ink: PAL.ink, sw: .3 });  // beard
  xPop();
}
function chicken(x, y, s = 1, o = {}) {
  const col = o.col || '#C98A4A';
  xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  for (const lx of [-6, 8]) inkLine([[lx * s, -16 * s], [lx * s, 0], [lx * s + 6 * s, 0]], .5, '#D9A23A', 'inkfine', 0);
  paint([[-28 * s, -30 * s], [-12 * s, -50 * s], [14 * s, -44 * s], [22 * s, -26 * s], [6 * s, -14 * s], [-18 * s, -16 * s]], { wash: col, fill: shade(col, .3), fillOp: 60, ink: PAL.ink, sw: .5, curv: .5 });
  paint(ellPts(22 * s, (o.peck ? -18 : -52) * s, 9 * s, 9 * s, 10), { wash: col, ink: PAL.ink, sw: .4 });
  paint([[28 * s, (o.peck ? -18 : -52) * s], [38 * s, (o.peck ? -14 : -49) * s], [28 * s, (o.peck ? -14 : -47) * s]], { wash: PAL.ochre, ink: null });
  paint(ellPts(20 * s, (o.peck ? -27 : -61) * s, 5 * s, 4 * s, 8), { wash: '#D8394E', ink: null });
  xPop();
}

// ---------- vehicles ----------
// Side-view small car. o: col, view 'side' (default, facing right) | 'front', lights, door (open), flip
function car(x, y, s = 1, o = {}) {
  const col = o.col || '#C45A3C', dk = shade(col, .3), glass = o.night ? '#2E3A5E' : '#BFD8E6';
  xPush(); xT(x, y); if (o.flip) xS(-1, 1);
  if (o.view === 'front') {
    if (o.lights) for (const hx of [-120, 120]) for (let k = 0; k < 3; k++) paint([[hx * s, -95 * s], [hx * s * (2.2 + k * .8) - 200 * s, 700 * s], [hx * s * (2.2 + k * .8) + 200 * s, 700 * s]], { wash: '#FFF0B8', washOp: 40, ink: null });
    paint(rrPts(-170 * s, -150 * s, 340 * s, 120 * s, 26 * s), { wash: col, fill: dk, fillOp: 70, tex: .5, ink: PAL.ink, sw: .9 });
    paint([[-130 * s, -150 * s], [130 * s, -150 * s], [100 * s, -250 * s], [-100 * s, -250 * s]], { wash: col, ink: PAL.ink, sw: .8 });
    paint([[-112 * s, -156 * s], [112 * s, -156 * s], [88 * s, -238 * s], [-88 * s, -238 * s]], { wash: glass, fill: '#7FA5BF', fillOp: 60, ink: PAL.ink, sw: .5 });
    for (const hx of [-118, 118]) { paint(ellPts(hx * s, -95 * s, 30 * s, 22 * s, 14), { wash: o.lights ? '#FFF6D0' : '#E6E2D2', ink: PAL.ink, sw: .5 }); if (o.lights) glow(hx * s, -95 * s, 90 * s, 70 * s, '#FFF0B8', 150, .3); }
    paint(rrPts(-60 * s, -80 * s, 120 * s, 30 * s, 6 * s), { wash: '#3A3640', ink: PAL.ink, sw: .5 });
    for (const wx of [-140, 140]) paint(rrPts(wx * s - 24 * s, -40 * s, 48 * s, 42 * s, 10 * s), { wash: '#2B2233', ink: null });
    xPop(); return;
  }
  for (const wx of [-150, 150]) { paint(ellPts(wx * s, -38 * s, 42 * s, 42 * s, 16), { wash: '#2B2233', ink: PAL.ink, sw: .6 }); paint(ellPts(wx * s, -38 * s, 20 * s, 20 * s, 12), { wash: '#A9AFB8', ink: null }); }
  const body = [[-245, -60], [-238, -118], [-150, -130], [-100, -205], [80, -210], [150, -132], [238, -112], [250, -60], [210, -36], [-210, -36]].map(([a, b]) => [a * s, b * s]);
  paint(body, { wash: col, fill: dk, fillOp: 75, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: .9, curv: .2 });
  for (const wx of [-150, 150]) paint(ellPts(wx * s, -38 * s, 50 * s, 50 * s, 16).filter(p => p[1] < -38 * s), { wash: dk, ink: PAL.ink, sw: .5 });
  // windows
  const win1 = [[-138 * s, -132 * s], [-96 * s, -196 * s], [-14 * s, -196 * s], [-14 * s, -132 * s]], win2 = [[0, -132 * s], [0, -196 * s], [74 * s, -198 * s], [130 * s, -132 * s]];
  for (const wpts of [win1, win2]) paint(wpts, { wash: glass, fill: o.night ? '#1F2550' : '#8DB3CC', fillOp: 70, ink: PAL.ink, sw: .5 });
  inkLine([[-8 * s, -200 * s], [-8 * s, -45 * s]], .5, PAL.ink, 'inkfine', 0);
  if (o.door) paint([[0, -205 * s], [150 * s, -230 * s], [160 * s, -60 * s], [10 * s, -45 * s]], { wash: col, fill: dk, fillOp: 60, ink: PAL.ink, sw: .7 });
  paint(rectPts(30 * s, -122 * s, 30 * s, 8 * s), { wash: '#C9CED6', ink: null });
  if (o.siren) { paint(rrPts(-40 * s, -232 * s, 50 * s, 26 * s, 10 * s), { wash: '#4A8FE0', ink: PAL.ink, sw: .45 }); if (o.sirenOn) glow(-15 * s, -220 * s, 70 * s, 50 * s, '#8EC3FF', 140); }
  paint(ellPts(238 * s, -96 * s, 12 * s, 10 * s, 10), { wash: o.lights ? '#FFF6D0' : '#F1E6C8', ink: PAL.ink, sw: .4 });
  paint(rectPts(-250 * s, -84 * s, 14 * s, 18 * s), { wash: '#C8323F', ink: null });
  if (o.lights) for (let k = 0; k < 3; k++) paint([[248 * s, -100 * s], [1400 * s, (-200 - k * 50) * s], [1400 * s, (100 + k * 50) * s], [248 * s, -88 * s]], { wash: '#FFF0B8', washOp: 45, ink: null });
  if (o.dust) for (let i = 0; i < 5; i++) paint(blobPts(-300 * s - i * 70 * s, -40 * s - i * 14 * s, (50 + i * 22) * s, (34 + i * 14) * s, 12, .25, i + 3), { fill: '#D8C6A4', fillOp: 120 - i * 18, bleed: .3, tex: .4, ink: null });
  xPop();
}

function hCoffeeSpill(u, sw) {
  xPush(); xT(2.6 * u, -1.0 * u); xR(.6);
  paint([[-2.1 * u, -3.6 * u], [2.1 * u, -3.6 * u], [1.6 * u, 3.8 * u], [-1.6 * u, 3.8 * u]], { wash: '#F2EBDD', ink: PAL.ink, sw: sw * .5 });
  paint(rectPts(-1.9 * u, -1 * u, 3.8 * u, 2.4 * u), { wash: PAL.clay, ink: null });
  paint(scallopPts(0, -9 * u, 5 * u, 4 * u, 6, .45, 3), { wash: '#7A4A2A', washOp: 220, ink: PAL.ink, sw: sw * .4 });
  for (const [dx, dy, r] of [[-5, -13, 1.1], [4, -15, .9], [7, -10, .7], [-7, -7, .6]]) paint(ellPts(dx * u, dy * u, r * u, r * 1.3 * u, 8), { wash: '#7A4A2A', ink: null });
  xPop();
}
// A walker dragging a rolling suitcase behind them. dir: 1 = going right, -1 = going left.
function dragger(who, x, y, o = {}, dir = 1, cs = 1) {
  const s = (o.s ?? 1) * CAST[who].h / 470, sx = x - dir * 215 * s * cs, t = dir * .62;
  suitcase(sx, y + 4, s * cs, { col: o.case || '#3E4C6E', handle: 1, tilt: t });
  const top = [sx + Math.sin(t) * 278 * s * cs, y + 4 - Math.cos(t) * 278 * s * cs];
  fig(who, x, y, { view: dir > 0 ? 'r' : 'l', pose: 'walk', ph: .2, ...o, reachN: top, handN: 'fist' });
}

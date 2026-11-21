// sets.js — painted backgrounds. Each set paints a large world region; frame it with cam(cx, cy, zoom) in a panel.
// Floors / ground lines and the main landmarks are listed in each set's comment so figures can be placed on them.

// ---------- shared scenery helpers ----------
function skyGrad(x, y, w, h, top, bot, n = 5, tex = true) {
  n = Math.max(n, 10, Math.round(h / 50));
  for (let i = 0; i < n; i++) paint(rectPts(x, y + h * i / n - 3, w, h / n + 6), { wash: mixCol(top, bot, i / (n - 1)), ink: null });
  // watercolour grain; big skies get an oversized layer so its uneven edge stays off-screen
  const e = h > 900 ? 600 : 0;
  if (tex) paint(rectPts(x - e / 3, y - e, w + e * .66, h + e), { fill: bot, fillOp: 45, bleed: .2, tex: .5, border: .2, ink: null });
}
function cloud(x, y, s = 1, col = '#FBF6EE', op = 200) { paint(scallopPts(x, y, 150 * s, 55 * s, 7, .35, Math.round(x)), { fill: col, fillOp: op, bleed: .25, tex: .4, border: .3, ink: null }); }
function hillBand(x0, x1, y, amp, col, seed = 1, ink = false, bottom = 1400) {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const x = lerp(x0, x1, i / 14); pts.push([x, y - amp * (.5 + .5 * Math.sin(i * .9 + seed)) - amp * .3 * Math.sin(i * 2.3 + seed * 2)]); }
  pts.push([x1, bottom], [x0, bottom]);
  paint(pts, { wash: col, fill: shade(col, .2), fillOp: 70, bleed: .08, tex: .6, border: .5, ink: ink ? PAL.ink : null, sw: .6, curv: .4 });
}
function treeRound(x, y, s = 1, o = {}) {
  const leaf = o.col || PAL.leaf, dk = o.dk || PAL.leafDk, flat = o.flat || o.night;
  paint(capsule(x, y, x + 4 * s, y - 120 * s, 12 * s, 8 * s, 4), { wash: o.trunk || '#6B4A33', ink: o.ink === false ? null : PAL.ink, sw: .5 * s });
  paint(scallopPts(x, y - 170 * s, 90 * s, 80 * s, 8, .25, Math.round(x + y)), { wash: leaf, fill: flat ? null : dk, fillOp: 90, bleed: .12, tex: .7, border: .6, ink: o.ink === false ? null : PAL.ink, sw: .6 * s });
  if (s > .5 && !flat) paint(scallopPts(x - 25 * s, y - 195 * s, 40 * s, 32 * s, 6, .3, Math.round(x)), { wash: tint(leaf, .25), washOp: 150, ink: null });
  else if (s > .5) paint(scallopPts(x - 25 * s, y - 195 * s, 46 * s, 34 * s, 6, .3, Math.round(x)), { wash: tint(leaf, .12), washOp: 160, ink: null });
}
function poplar(x, y, s = 1, col = '#4F7E46') { paint(ellPts(x, y - 150 * s, 30 * s, 150 * s, 16), { wash: col, fill: shade(col, .3), fillOp: 80, tex: .6, ink: null }); }
function bush(x, y, s = 1, col = PAL.leaf, ink = true) { paint(scallopPts(x, y - 40 * s, 80 * s, 46 * s, 7, .3, Math.round(x * 3)), { wash: col, fill: shade(col, .3), fillOp: 80, bleed: .1, tex: .6, ink: ink ? PAL.ink : null, sw: .5 }); }
function grassStrokes(x0, x1, y, n, h, col = '#6E9447', sw = .5) {
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(i * 7.31 + x0)), hh = h * (.6 + .6 * hash(i * 3.7 + y)), lean = (hash(i * 1.9) - .5) * h * .5; inkLine([[x, y], [x + lean * .4, y - hh * .5], [x + lean, y - hh]], sw, col, 'inkfine', .5); }
}
function flowers(x0, x1, y0, y1, n, cols = [PAL.cream, PAL.rose, PAL.ochre]) {
  for (let i = 0; i < n; i++) paint(ellPts(lerp(x0, x1, hash(i * 5.3 + x0)), lerp(y0, y1, hash(i * 2.9 + y0)), 5, 4, 6), { wash: cols[i % cols.length], ink: null });
}
function woodFloor(x0, x1, y0, y1, col = '#B98A5E') {
  paint(rectPts(x0, y0, x1 - x0, y1 - y0), { wash: col, fill: shade(col, .25), fillOp: 70, bleed: .05, tex: .7, border: .5, ink: null });
  for (let i = 1; i < 6; i++) { const y = lerp(y0, y1, Math.pow(i / 6, 1.4)); inkLine([[x0, y], [x1, y + jit(3)]], .4, shade(col, .35), 'inkfine', 0); }
  inkLine([[x0, y0], [x1, y0]], .8, PAL.ink, 'ink', 0);
}
function frameArt(x, y, w, h, kind = 'land', o = {}) {
  paint(rectPts(x - 10, y - 10, w + 20, h + 20), { wash: o.frame || '#B08A4E', ink: PAL.ink, sw: .6 });
  if (kind === 'land') { skyGrad(x, y, w, h * .6, '#9FC6E0', '#F1E4C6', 3); hillBand(x, x + w, y + h * .62, h * .12, '#8FB06A', 3, false, y + h); }
  else if (kind === 'sea') { skyGrad(x, y, w, h * .5, '#F0C49A', '#F6E2C0', 3); paint(rectPts(x, y + h * .5, w, h * .5), { wash: '#4F86A8', fill: '#2F5A78', fillOp: 80, tex: .6, ink: null }); }
  else if (kind === 'flowers') { paint(rectPts(x, y, w, h), { wash: '#F3E7CF', ink: null }); for (let i = 0; i < 5; i++) paint(ellPts(x + w * (.25 + .12 * i), y + h * (.35 + .1 * (i % 2)), w * .08, w * .08, 10), { wash: [PAL.rose, PAL.ochre, PAL.clay][i % 3], ink: null }); }
  paint(rectPts(x, y, w, h), { ink: PAL.ink, sw: .4 });
}
function windowFrame(x, y, w, h, o = {}) {   // outer frame + cross bars; paint the view first
  const c = o.col || '#F4EEE2', t = o.t || 16;
  paint(rectPts(x - t, y - t, w + 2 * t, t), { wash: c, ink: PAL.ink, sw: .6 }); paint(rectPts(x - t, y + h, w + 2 * t, t * 1.4), { wash: c, ink: PAL.ink, sw: .6 });
  paint(rectPts(x - t, y, t, h), { wash: c, ink: PAL.ink, sw: .6 }); paint(rectPts(x + w, y, t, h), { wash: c, ink: PAL.ink, sw: .6 });
  if (o.cross !== false) { paint(rectPts(x + w / 2 - 5, y, 10, h), { wash: c, ink: PAL.ink, sw: .4 }); for (const k of [1 / 3, 2 / 3]) paint(rectPts(x, y + h * k - 4, w, 8), { wash: c, ink: PAL.ink, sw: .35 }); }
}
function curtain(x, y, w, h, col = '#F1E9DA', side = 1) {
  const pts = [[x, y], [x + w, y], [x + w * (side > 0 ? .55 : 1.1), y + h * .55], [x + w * .9, y + h], [x, y + h]];
  paint(pts, { wash: col, fill: shade(col, .2), fillOp: 70, tex: .6, ink: PAL.ink, sw: .5, curv: .3 });
  for (let i = 1; i < 4; i++) inkLine([[x + w * i / 4, y + 10], [x + w * i / 4 * .8, y + h - 10]], .3, shade(col, .35), 'inkfine', .3);
}

// =====================================================================================
// PARIS — the bedroom, seen from the foot of the bed. World x -200..2000, floor y 900.
//   Headboard x 560..1340 (top y 380), pillows ~y 640. Sleepers sit up with their hips at about (x, 800), view 'f',
//   and duvet() is painted after them. Window x 110..430 (y 140..700). Door x 1600..1830: o.door (0..1) ajar,
//   o.slabLater leaves the door leaf for doorLeaf() so someone can peek through the gap. o.guitar: guitar against the nightstand.
// =====================================================================================
const BED = { hip: 800, l: 560, r: 1340, door: [1615, 1830] };
function bedroom(o = {}) {
  paint(rectPts(-300, -200, 2500, 1110), { wash: '#EDD8C2', fill: '#D9BEA2', fillOp: 70, bleed: .1, tex: .6, border: .4, ink: null });
  for (const [x, w] of [[-150, 220], [500, 300], [1080, 300]]) paint(rectPts(x, 120, w, 220), { ink: '#CBAE90', sw: .4 });
  woodFloor(-300, 2300, 900, 1250, '#B98A5E');
  // window: dawn over the zinc roofs
  const wx = 110, wy = 140, ww = 320, wh = 560;
  skyGrad(wx, wy, ww, wh, '#BFD6E8', '#F8D7B4', 4);
  glow(wx + ww * .68, wy + wh * .8, 120, 60, '#FFE6B8', 150);
  const ex = wx + ww * .74, ey = wy + wh * .8;
  paint([[ex - 26, ey], [ex - 5, ey - 150], [ex - 2, ey - 210], [ex + 2, ey - 210], [ex + 5, ey - 150], [ex + 26, ey]], { wash: '#9FA8BC', washOp: 210, ink: null });
  for (const [x0, h, w] of [[wx - 20, 120, 150], [wx + 110, 90, 130], [wx + 210, 140, 140]]) {
    const top = wy + wh - h;
    paint([[x0, wy + wh], [x0, top + 30], [x0 + 20, top], [x0 + w - 20, top], [x0 + w, top + 30], [x0 + w, wy + wh]], { wash: '#8E9DB0', fill: '#6E7E94', fillOp: 70, tex: .5, ink: null });
    for (let k = 0; k < 2; k++) paint(rectPts(x0 + 30 + k * 60, top - 26, 18, 30), { wash: '#C9785A', ink: null });
    for (let k = 0; k < 3; k++) paint(rectPts(x0 + 18 + k * 40, top + 46, 16, 26), { wash: '#F6E2B8', ink: null });
  }
  windowFrame(wx, wy, ww, wh);
  curtain(wx - 80, wy - 50, 110, wh + 130, '#F1E9DA', 1); curtain(wx + ww - 30, wy - 50, 110, wh + 130, '#F1E9DA', -1);
  paint([[wx + ww, wy + 40], [wx + ww, wy + wh], [1300, 1250], [900, 1250]], { wash: '#FFF2DA', washOp: 60, ink: null });
  // painting above the bed
  frameArt(830, 190, 240, 150, 'sea');
  // door
  const dk = clamp(o.door ?? 0), [d0, d1] = BED.door;
  paint(rectPts(d0 - 15, 230, d1 - d0 + 30, 680), { wash: '#E3D2BC', ink: PAL.ink, sw: .7 });
  paint(rectPts(d0, 245, (d1 - d0) * dk + 2, 655), { wash: '#2E2A40', ink: null });
  if (!o.slabLater) doorLeaf(dk);
  // nightstands, lamps, guitar
  for (const nx of [390, 1370]) paint(rectPts(nx, 730, 140, 170), { wash: '#9C6B4A', fill: '#7A4E33', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
  lampTable(460, 730, .85, o.lamp ?? false);
  if (o.guitar) guitar(1450, 905, .95, -1.33);
  else lampTable(1440, 730, .85, o.lamp ?? false);
  // headboard (upholstered), mattress, pillows
  paint(rrPts(560, 380, 780, 420, 60), { wash: '#B66E58', fill: '#8E4E3E', fillOp: 80, bleed: .06, tex: .6, border: .5, ink: PAL.ink, sw: .8 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) paint(ellPts(660 + i * 190, 460 + j * 90, 7, 7, 8), { wash: '#6E3A2E', ink: null });
  paint(rectPts(540, 720, 820, 120), { wash: '#F3EEE6', fill: '#C9C6D6', fillOp: 50, ink: PAL.ink, sw: .6 });
  for (const px of [610, 975]) paint(scallopPts(px + 160, 640, 165, 62, 7, .1, px), { wash: '#FBF8F2', fill: '#D6D4E0', fillOp: 60, tex: .4, ink: PAL.ink, sw: .6 });
}
function doorLeaf(k) {
  const [d0, d1] = BED.door, x = d0 + (d1 - d0) * k;
  paint([[x, 245], [d1, 245], [d1, 900], [x, 900]], { wash: '#D2BC9E', fill: '#B59B7B', fillOp: 60, tex: .5, ink: PAL.ink, sw: .6 });
  for (const [yy, hh] of [[290, 250], [580, 270]]) paint(rectPts(x + 22, yy, Math.max(10, d1 - x - 44), hh), { ink: '#A88C6A', sw: .35 });
  paint(ellPts(x + 22, 600, 8, 8, 8), { wash: PAL.gold, ink: PAL.ink, sw: .3 });
}
// Duvet seen from the foot of the bed (paint after the sleepers). y: top edge; bumps: [[x, rise, width], ...]
function duvet(o = {}) {
  const x0 = o.x0 ?? 520, x1 = o.x1 ?? 1380, y = o.y ?? 760, bumps = o.bumps || [];
  const pts = [];
  for (let i = 0; i <= 16; i++) { const x = lerp(x0, x1, i / 16); let yy = y + Math.sin(i * 1.7) * 7; for (const [bx, bh, bw] of bumps) yy -= bh * Math.exp(-Math.pow((x - bx) / (bw || 90), 2)); pts.push([x, yy]); }
  pts.push([x1 + 30, 1000], [x1 + 10, 1070], [x0 - 10, 1070], [x0 - 30, 1000]);
  paint(pts, { wash: o.col || '#E9EFF4', fill: '#AFC2D6', fillOp: 90, bleed: .08, tex: .6, border: .55, ink: PAL.ink, sw: .8, curv: .3 });
  for (let i = 0; i < 5; i++) { const fx = lerp(x0 + 60, x1 - 60, i / 4); inkLine([[fx + jit(20), y + 70], [fx + jit(30), y + 200], [fx + jit(30), 1040]], .35, '#93A6BC', 'inkfine', .4); }
}

// =====================================================================================
// PARIS — the street with the protest. World x -400..2800, street y 900 (sidewalk 860..900, road below).
// =====================================================================================
function parisStreet(o = {}) {
  skyGrad(-500, -500, 3500, 520, '#C9D8E4', '#E9E4DA', 4);
  const bw = 520;
  for (let b = -1; b < 6; b++) {
    const x0 = b * bw - 60, stone = ['#E8DCC2', '#EAD8BA', '#E3D6C0'][((b % 3) + 3) % 3];
    paint([[x0, -160], [x0 + bw, -160], [x0 + bw, 900], [x0, 900]], { wash: stone, fill: '#C9B898', fillOp: 70, bleed: .06, tex: .6, border: .5, ink: PAL.ink, sw: .6 });
    // mansard + dormers + chimneys
    paint([[x0 - 6, -160], [x0 + 30, -300], [x0 + bw - 30, -300], [x0 + bw + 6, -160]], { wash: '#8E9DB0', fill: '#6F7F96', fillOp: 80, tex: .6, ink: PAL.ink, sw: .6 });
    for (let k = 0; k < 3; k++) { const dx = x0 + 70 + k * 150; paint([[dx, -170], [dx, -250], [dx + 35, -275], [dx + 70, -250], [dx + 70, -170]], { wash: '#E3D6C0', ink: PAL.ink, sw: .45 }); paint(rectPts(dx + 14, -240, 42, 62), { wash: '#6E7E98', ink: null }); }
    paint(rectPts(x0 + bw * .7, -360, 50, 70), { wash: '#C8A88A', ink: PAL.ink, sw: .45 });
    // floors of tall windows with balconies
    for (let f = 0; f < 4; f++) {
      const y = -120 + f * 175;
      for (let k = 0; k < 3; k++) {
        const wxx = x0 + 70 + k * 150;
        paint(rectPts(wxx, y, 70, 125), { wash: '#7D8EA6', fill: '#55657E', fillOp: 70, tex: .4, ink: PAL.ink, sw: .45 });
        paint(rectPts(wxx + 6, y + 6, 26, 113), { fill: '#C8D6E2', fillOp: 70, bleed: .1, ink: null });
        if (f === 0 || f === 2) { inkLine([[wxx - 15, y + 112], [wxx + 85, y + 112]], .9, '#3B3644', 'ink', 0); for (let r = 0; r < 7; r++) inkLine([[wxx - 10 + r * 15, y + 112], [wxx - 10 + r * 15, y + 128]], .3, '#3B3644', 'inkfine', 0); inkLine([[wxx - 15, y + 128], [wxx + 85, y + 128]], .5, '#3B3644', 'ink', 0); }
        else paint(rectPts(wxx - 6, y - 14, 82, 10), { wash: shade(stone, .1), ink: null });
      }
      inkLine([[x0, y + 155], [x0 + bw, y + 155]], .35, '#B5A07E', 'inkfine', 0);
    }
    // shop front
    const sc = ['#5E7F6C', '#8A3B3B', '#3E5476', '#7A5A3A'][((b % 4) + 4) % 4];
    paint(rectPts(x0 + 20, 600, bw - 40, 300), { wash: sc, fill: shade(sc, .3), fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
    paint(rectPts(x0 + 45, 650, bw - 90, 230), { wash: '#C9D6DF', fill: '#8FA6B8', fillOp: 60, tex: .3, ink: PAL.ink, sw: .45 });
    paint([[x0 + 10, 600], [x0 + bw - 10, 600], [x0 + bw - 30, 660], [x0 + 30, 660]], { wash: tint(sc, .2), ink: PAL.ink, sw: .45 });
    for (let k = 0; k < 8; k++) inkLine([[x0 + 30 + k * (bw - 60) / 8, 602], [x0 + 38 + k * (bw - 60) / 8, 658]], .35, shade(sc, .4), 'inkfine', 0);
  }
  if (o.gate != null) {   // porte cochère, open onto a dark courtyard
    const gx = o.gate;
    paint([[gx - 150, 900], [gx - 150, 560], [gx - 120, 480], [gx, 450], [gx + 120, 480], [gx + 150, 560], [gx + 150, 900]], { wash: '#2E2A3A', fill: '#1E1A28', fillOp: 80, tex: .6, ink: PAL.ink, sw: .9, curv: .2 });
    paint([[gx - 150, 900], [gx - 150, 560], [gx - 250, 590], [gx - 250, 930]], { wash: '#3E5A4A', fill: '#2A4034', fillOp: 70, tex: .6, ink: PAL.ink, sw: .7 });
    paint([[gx + 150, 900], [gx + 150, 560], [gx + 250, 590], [gx + 250, 930]], { wash: '#3E5A4A', fill: '#2A4034', fillOp: 70, tex: .6, ink: PAL.ink, sw: .7 });
  }
  paint(rectPts(-500, 860, 3500, 45), { wash: '#C2B6A2', ink: PAL.ink, sw: .5 });
  paint(rectPts(-500, 905, 3500, 400), { wash: '#8E8A92', fill: '#6E6A74', fillOp: 70, bleed: .05, tex: .6, border: .3, ink: null });
  if (o.smoke !== false) smokeLayer(o.smoke || 1);
}
function smokeLayer(k = 1, col = '#D9D3DC', y = 560) {
  for (let i = 0; i < 7; i++) paint(blobPts(lerp(-300, 2600, i / 6) + hash(i) * 120, y + hash(i * 3) * 160, 340, 150, 14, .25, i + 11), { fill: col, fillOp: 70 * k, bleed: .35, tex: .3, border: .2, ink: null });
}
// The crowd. o: { rows: [[groundY, scale, count], ...] back to front, x0, x1, banner: [x, width, text], seed, mute, signs }
const SLOGANS = ['NON !', 'ON LÂCHE RIEN', 'TOUS ENSEMBLE', 'SOLIDARITÉ', 'GRÈVE !', 'RETRAITE À 60 ANS', 'RÉSISTANCE'];
function crowd(o = {}) {
  const x0 = o.x0 ?? -300, x1 = o.x1 ?? 2600, rows = o.rows || [[o.y ?? 870, o.s ?? .55, o.n ?? 26]];
  const cols = ['#6B6E86', '#8C7B6E', '#A35B4E', '#4F6A7A', '#7E8C5E', '#9A6E8A', '#C08A4E', '#5A5466', '#3E6E7A', '#B8B0A2', '#D9614C', '#E8C07A'];
  const skins = ['#E8BA92', '#C88E66', '#F2CFB3', '#8E5E40', '#D6A17A', '#F0C7A4'], hairs = ['#2E2428', '#5A3A2A', '#8A6A44', '#C9A060', '#3B3036', '#A6A0A6', '#B0502E'];
  rows.forEach(([gy, s, n], ri) => {
    const mute = o.mute ?? (ri === 0 && rows.length > 1 ? .4 : ri === 1 && rows.length > 2 ? .2 : 0);
    const M = c => mixCol(c, '#C9C3CF', mute);
    for (let i = 0; i < n; i++) {
      const H = k => hash(i * 13.7 + ri * 101 + (o.seed || 0) * 7 + k);
      const x = lerp(x0, x1, (i + .15 + .7 * H(0)) / n), sc = s * (.88 + .24 * H(1)), top = gy - 300 * sc;
      const col = M(cols[Math.floor(H(2) * cols.length)]), skin = M(skins[Math.floor(H(3) * skins.length)]), hair = M(hairs[Math.floor(H(4) * hairs.length)]);
      const sw = clamp(sc * .9, .3, .9), act = o.props === false ? 0 : H(5);
      // props held up go behind the person
      if (act > .8) { paint(capsule(x + 34 * sc, top + 100 * sc, x + 52 * sc, top - 20 * sc, 11 * sc, 9 * sc, 3), { wash: col, ink: PAL.ink, sw }); paint(ellPts(x + 53 * sc, top - 30 * sc, 12 * sc, 13 * sc, 10), { wash: skin, ink: PAL.ink, sw: sw * .8 }); }
      else if (act > .68) { inkLine([[x + 30 * sc, top + 120 * sc], [x + 34 * sc, top - 150 * sc]], 1.2 * sc, '#6B4A33', 'ink', 0); const fc = M(H(6) > .5 ? '#C8423A' : '#E8AA38'); paint([[x + 34 * sc, top - 150 * sc], [x + 150 * sc, top - 140 * sc], [x + 140 * sc, top - 70 * sc], [x + 34 * sc, top - 80 * sc]], { wash: fc, fill: shade(fc, .3), fillOp: 60, ink: PAL.ink, sw: sw * .7, curv: .25 }); }
      else if (act > .56) {
        inkLine([[x - 4 * sc, top + 100 * sc], [x - 4 * sc, top - 60 * sc]], 1.1 * sc, '#6B4A33', 'ink', 0);
        paint(rectPts(x - 80 * sc, top - 170 * sc, 160 * sc, 110 * sc), { wash: M('#E3C796'), fill: M('#C9A86E'), fillOp: 50, ink: PAL.ink, sw: sw * .7 });
        if (o.signs !== false && sc > .3) worldText(SLOGANS[Math.floor(H(7) * SLOGANS.length)], x - 4 * sc, top - 115 * sc, 30 * sc, mute > .3 ? '#6E6470' : '#B5283A', { font: 'hand', bold: true, alpha: .85, rot: (H(8) - .5) * .1 });
      }
      // body
      const shw = (58 + 10 * H(14)) * sc;
      paint([[x - shw * .9, gy + 60 * sc], [x - shw, top + 120 * sc], [x - shw * .82, top + 86 * sc], [x - 16 * sc, top + 70 * sc], [x + 16 * sc, top + 70 * sc], [x + shw * .82, top + 86 * sc], [x + shw, top + 120 * sc], [x + shw * .9, gy + 60 * sc]],
        { wash: col, fill: shade(col, .25), fillOp: 45, tex: .5, ink: PAL.ink, sw, curv: .12 });
      for (const sd of [-1, 1]) if (!(sd > 0 && act > .8)) inkLine([[x + sd * shw * .78, top + 110 * sc], [x + sd * shw * .86, top + 230 * sc]], sw * .5, shade(col, .4), 'inkfine', .2);
      if (H(9) > .55) paint([[x - 16 * sc, top + 72 * sc], [x + 16 * sc, top + 72 * sc], [x, top + 104 * sc]], { wash: M(H(10) > .5 ? '#E9E3D6' : '#3E3946'), ink: null });
      // head, hair / hat, face
      const hx = x + (H(11) - .5) * 10 * sc;
      paint(ellPts(hx, top + 38 * sc, 24 * sc, 29 * sc, 14), { wash: skin, ink: PAL.ink, sw: sw * .8 });
      const hat = H(12);
      if (hat > .82) paint([[hx - 27 * sc, top + 30 * sc], [hx - 22 * sc, top + 2 * sc], [hx, top - 6 * sc], [hx + 22 * sc, top + 2 * sc], [hx + 27 * sc, top + 30 * sc]], { wash: M(['#C8423A', '#3E6E7A', '#E8AA38'][i % 3]), ink: PAL.ink, sw: sw * .7, curv: .3 });
      else paint([[hx - 26 * sc, top + 44 * sc], [hx - 27 * sc, top + 18 * sc], [hx - 12 * sc, top + 2 * sc], [hx + 12 * sc, top + 2 * sc], [hx + 26 * sc, top + 16 * sc], [hx + 24 * sc, top + 30 * sc], [hx, top + 20 * sc], [hx - 18 * sc, top + 28 * sc]], { wash: hair, ink: PAL.ink, sw: sw * .6, curv: .3 });
      if (sc > .45) for (const ex of [-8, 8]) paint(ellPts(hx + ex * sc, top + 40 * sc, 2.6 * sc, 3.4 * sc, 6), { wash: PAL.ink, ink: null });
      if (H(13) > .62) paint([[hx - 25 * sc, top + 46 * sc], [hx + 25 * sc, top + 46 * sc], [hx + 22 * sc, top + 62 * sc], [hx, top + 72 * sc], [hx - 22 * sc, top + 62 * sc]], { wash: M([PAL.teal, '#E8E2D4', '#C8423A', '#3E3946'][i % 4]), ink: PAL.ink, sw: sw * .5, curv: .2 });
      else if (sc > .45) inkLine([[hx - 6 * sc, top + 54 * sc], [hx + 6 * sc, top + 54 * sc]], sw * .6, PAL.ink, 'inkfine', 0);
    }
    if (o.banner && ri === rows.length - 1) {   // banner carried at the front of this row
      const [bx, bw, txt] = o.banner, by = gy - 380 * s, bh = 130 * s;
      for (const px of [bx, bx + bw]) inkLine([[px, gy - 120 * s], [px, by - 30 * s]], 1.1 * s, '#6B4A33', 'ink', 0);
      paint([[bx, by], [bx + bw * .5, by + 14 * s], [bx + bw, by], [bx + bw, by + bh], [bx + bw * .5, by + bh + 12 * s], [bx, by + bh]], { wash: '#F3EEDF', fill: '#D8CFBC', fillOp: 60, tex: .5, ink: PAL.ink, sw: .8, curv: .15 });
      worldText(txt || 'TOUS ENSEMBLE !', bx + bw / 2, by + bh * .55, bh * .5, '#B5283A', { font: 'marker', alpha: .9 });
    }
  });
}

// =====================================================================================
// PARIS — the industrial basement. World x -200..2000, y -100..1100, floor nearest y ~ 1000. Vanishing point o.vp.
// o.blast: [x, y, r] explosion glow; o.daylight: the far end is open to the day; o.corner: x of a wall corner on the right.
// =====================================================================================
function tunnel(o = {}) {
  const [vx, vy] = o.vp || [1150, 470], fw = 170, fh = 210, X0 = -600, X1 = 2600, Y0 = -400, Y1 = 1700;
  const wall = o.wall || '#4A4E68', far = [[vx - fw, vy - fh], [vx + fw, vy - fh], [vx + fw, vy + fh], [vx - fw, vy + fh]];
  if (o.daylight) paint(far, { wash: '#FFF4D8', ink: null }); else paint(far, { wash: '#1A1C2C', ink: null });
  brushFlush();
  paint([[X0, Y0], [far[0][0], far[0][1]], [far[3][0], far[3][1]], [X0, Y1]], { wash: wall, fill: shade(wall, .35), fillOp: 90, bleed: .06, tex: .7, border: .5, ink: null });
  paint([[X1, Y0], [far[1][0], far[1][1]], [far[2][0], far[2][1]], [X1, Y1]], { wash: shade(wall, .12), fill: shade(wall, .4), fillOp: 90, bleed: .06, tex: .7, border: .5, ink: null });
  paint([[X0, Y0], [X1, Y0], [far[1][0], far[1][1]], [far[0][0], far[0][1]]], { wash: shade(wall, .3), fill: shade(wall, .5), fillOp: 80, tex: .6, ink: null });
  paint([[X0, Y1], [X1, Y1], [far[2][0], far[2][1]], [far[3][0], far[3][1]]], { wash: '#3A3C50', fill: '#26283A', fillOp: 90, bleed: .05, tex: .7, border: .5, ink: null });
  if (o.daylight) glow(vx, vy, fw * 2.4, fh * 1.8, '#FFF0C8', 150, .35);
  // edges, pipes and lamps converging on the vanishing point
  for (const [cx, cy] of [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]]) { const fx = cx < vx ? vx - fw : vx + fw, fy = cy < vy ? vy - fh : vy + fh; inkLine([[cx, cy], [fx, fy]], .7, '#1E2032', 'ink', 0); }
  for (const k of [.06, .12]) inkLine([[X0, lerp(Y0, Y1, k)], [vx - fw, lerp(vy - fh, vy + fh, k)]], 3.2 - k * 12, '#6E7488', 'ink', 0);
  inkLine([[X1, lerp(Y0, Y1, .08)], [vx + fw, lerp(vy - fh, vy + fh, .08)]], 2.6, '#7A6A5A', 'ink', 0);
  for (let i = 0; i < 4; i++) {
    const t = Math.pow(i / 4, 1.3), x = lerp(X0 + 200, vx - fw, t), y = lerp(Y0 + 260, vy - fh + 40, t), r = lerp(46, 10, t);
    glow(x, y + r, r * 4, r * 3, '#F2B65A', 120);
    paint(ellPts(x, y, r * .5, r * .65, 10), { wash: '#FFE2A0', ink: PAL.ink, sw: .4 });
  }
  for (let i = 0; i < 6; i++) { const t = i / 6, x = lerp(X0, vx - fw, t), y = lerp(Y1, vy + fh, t); inkLine([[x, y], [lerp(X1, vx + fw, t), y]], .35, '#4A4C62', 'inkfine', 0); }
  if (o.corner) {   // a side passage opening on the right wall (where the blast comes from)
    const cx = o.corner;
    paint([[cx, -400], [cx + 800, -400], [cx + 800, 1700], [cx, 1700]], { wash: '#2E3046', fill: '#1E2032', fillOp: 90, tex: .6, ink: null });
    paint([[cx - 60, -400], [cx, -400], [cx, 1700], [cx - 60, 1700]], { wash: shade(wall, .05), fill: shade(wall, .3), fillOp: 80, tex: .6, ink: PAL.ink, sw: .8 });
  }
  if (o.blast) {
    const [bx, by, br] = o.blast;
    glow(bx, by, br * 2.4, br * 2.0, '#F28C28', 170, .3); glow(bx, by, br * 1.4, br * 1.2, '#FFD86B', 210, .25); glow(bx, by, br * .6, br * .5, '#FFF8DC', 240, .2);
    for (let i = 0; i < 18; i++) { const a = hash(i * 3.3) * TAU, d = br * (.8 + 1.4 * hash(i * 7.1)), px = bx + Math.cos(a) * d, py = by + Math.sin(a) * d * .8; paint([[px, py], [px + 14, py - 6], [px + 8, py + 12]], { wash: '#2B2233', ink: null }); }
    for (let i = 0; i < 5; i++) paint(blobPts(bx + (hash(i) - .5) * br * 2, by - br * (.8 + hash(i * 2)), br * .7, br * .5, 12, .3, i + 4), { fill: '#5A5262', fillOp: 120, bleed: .3, tex: .4, ink: null });
  }
}

// =====================================================================================
// The getaway car, cut away from the side. Facing left. World x 0..1800, y 0..1000.
//   driver seat: hip ~ (430, 640); back seat: hip ~ (1080, 660), seat surface y 680, from x 900 to 1450.
// =====================================================================================
function carInterior(o = {}) {
  paint(rectPts(-200, -200, 2200, 1400), { wash: '#3E4258', ink: null });
  // windows with a blurred landscape
  for (const [x0, x1] of [[120, 640], [720, 1460]]) {
    skyGrad(x0, 170, x1 - x0, 260, '#BFD8EA', '#E8EEE4', 3);
    paint(rectPts(x0, 330, x1 - x0, 100), { wash: '#8DB063', fill: '#5E8C47', fillOp: 80, tex: .6, ink: null });
    for (let i = 0; i < 6; i++) inkLine([[x0 + 20, 340 + i * 14], [x1 - 20, 340 + i * 14 + jit(4)]], .5, ['#6E9447', '#A7C27A', '#5E8C47'][i % 3], 'dry', 0);
    for (let i = 0; i < 3; i++) paint(ellPts(lerp(x0, x1, .2 + i * .3), 320, 50, 30, 12), { fill: '#4F7E46', fillOp: 120, bleed: .3, ink: null });
  }
  // body panels
  paint([[60, 160], [140, 120], [1500, 110], [1640, 170], [1660, 440], [60, 440]], { ink: PAL.ink, sw: 1.2 });
  paint([[40, 430], [1700, 430], [1700, 1100], [40, 1100]], { wash: o.col || '#7A3B30', fill: '#4E241E', fillOp: 90, tex: .6, ink: PAL.ink, sw: 1 });
  inkLine([[680, 120], [690, 440]], 3, '#2B2233', 'ink', 0); inkLine([[1470, 110], [1500, 440]], 3, '#2B2233', 'ink', 0);
  // dashboard + wheel
  paint([[-100, 430], [260, 430], [300, 520], [-100, 560]], { wash: '#2E2C36', ink: PAL.ink, sw: .7 });
  paint(ellPts(300, 470, 22, 90, 18, 0, .25), { ink: '#26242E', sw: 2.4 });
  // seats
  const seat = '#5A5E72';
  paint([[480, 380], [560, 360], [600, 700], [520, 720]], { wash: seat, fill: shade(seat, .3), fillOp: 70, tex: .6, ink: PAL.ink, sw: .7, curv: .2 });
  paint([[360, 650], [560, 640], [570, 720], [350, 730]], { wash: seat, ink: PAL.ink, sw: .6 });
  paint([[1440, 400], [1540, 390], [1560, 700], [1460, 710]], { wash: seat, fill: shade(seat, .3), fillOp: 70, tex: .6, ink: PAL.ink, sw: .7, curv: .2 });
  paint([[880, 680], [1480, 670], [1490, 760], [870, 770]], { wash: seat, fill: shade(seat, .25), fillOp: 60, tex: .5, ink: PAL.ink, sw: .6 });
}

// =====================================================================================
// COUNTRYSIDE. World x -400..2800. o.hy horizon (default 560). o.time: 'day' | 'afternoon' | 'dusk' | 'night' | 'morning'.
// o.farm: [x, y, s] small farmhouse in the distance. o.ground: foreground grass colour.
// =====================================================================================
function countryside(o = {}) {
  const hy = o.hy ?? 560, t = o.time || 'day';
  const skies = { day: ['#8EC3E6', '#EAF1EC'], afternoon: ['#9BC8E4', '#F5E9CF'], dusk: ['#7D86B8', '#F4B98A'], night: ['#151A3C', '#2F3C7A'], morning: ['#A9CDE4', '#F8E6CC'] };
  const [top, bot] = skies[t];
  skyGrad(-500, -600, 3600, hy + 640, top, bot, 5, t !== 'night');
  if (t === 'night') { paint(ellPts(o.moon?.[0] ?? 1700, o.moon?.[1] ?? 80, 46, 46, 20), { wash: '#F3EBC8', ink: null }); glow(o.moon?.[0] ?? 1700, o.moon?.[1] ?? 80, 160, 160, '#9FB0E0', 90); for (let i = 0; i < 40; i++) paint(ellPts(lerp(-400, 2800, hash(i * 3.1)), lerp(-500, hy - 80, hash(i * 7.7)), 3, 3, 5), { wash: '#F6F0D8', ink: null }); }
  else if (o.clouds !== false) { cloud(200, 80, 1.1); cloud(1300, 20, 1.4); cloud(2200, 120, .9); }
  if (t === 'dusk' || t === 'afternoon') glow(o.sun?.[0] ?? 2200, o.sun?.[1] ?? hy - 120, 380, 220, t === 'dusk' ? '#F7B06A' : '#FFF0C8', 110);
  const night = t === 'night', dim = c => night ? mixCol(c, '#1F2550', .7) : t === 'dusk' ? mixCol(c, '#7A5A7A', .25) : c;
  hillBand(-500, 3100, hy - 30, 70, dim('#A8BFC4'), 2, false, hy + 300);
  for (let i = 0; i < 14; i++) treeRound(lerp(-400, 2800, hash(i * 9.3)), hy - 20 + hash(i * 2.1) * 30, .28, { col: dim('#6F9A5A'), dk: dim('#4F7A48'), ink: false });
  hillBand(-500, 3100, hy + 20, 50, dim('#9DB874'), 5, false, hy + 400);
  // field patchwork
  const fields = [dim('#E3C46A'), dim('#A9C46E'), dim('#C9A86A'), dim('#8DB063'), dim('#D8CB7A')];
  for (let i = 0; i < 7; i++) {
    const xa = lerp(-500, 3100, i / 7), xb = lerp(-500, 3100, (i + 1) / 7);
    paint([[xa, hy + 40 + (i % 2) * 15], [xb, hy + 30 + ((i + 1) % 2) * 20], [xb + 120, hy + 160], [xa - 60, hy + 170]], { wash: fields[i % 5], fill: shade(fields[i % 5], .15), fillOp: 60, tex: .6, ink: null });
    for (let r = 0; r < 4; r++) inkLine([[xa, hy + 60 + r * 28], [xb, hy + 55 + r * 28]], .3, shade(fields[i % 5], .25), 'inkfine', 0);
    if (i % 2) bush(xb, hy + 120, .45, dim(PAL.leaf), false);
  }
  for (let i = 0; i < 6; i++) poplar(lerp(-200, 2600, hash(i * 4.4 + 1)), hy + 60, .55, dim('#4F7E46'));
  if (o.farm) farmhouseSmall(...o.farm, night);
  // foreground meadow
  const g = dim(o.ground || '#A3C062');
  paint([[-500, hy + 150], [800, hy + 120], [1800, hy + 140], [3100, hy + 110], [3100, 1500], [-500, 1500]], { wash: g, fill: shade(g, .22), fillOp: 80, bleed: .06, tex: .7, border: .5, ink: null, curv: .3 });
  if (!night) { grassStrokes(-400, 2800, hy + 300, 60, 40, shade(g, .35), .5); flowers(-400, 2800, hy + 200, 1150, 40); }
}
function farmhouseSmall(x, y, s = 1, night = false) {
  const st = night ? '#4A4E6E' : '#E8D8BA', rf = night ? '#5A3E52' : '#C66A4C';
  paint(rectPts(x - 110 * s, y - 120 * s, 220 * s, 120 * s), { wash: st, ink: PAL.ink, sw: .5 });
  paint([[x - 130 * s, y - 115 * s], [x, y - 190 * s], [x + 130 * s, y - 115 * s]], { wash: rf, ink: PAL.ink, sw: .5 });
  for (const wx of [-70, 30]) paint(rectPts(x + wx * s, y - 85 * s, 34 * s, 36 * s), { wash: night ? '#F8D98A' : '#7D8EA6', ink: null });
  treeRound(x + 170 * s, y, .5 * s, { ink: false });
}
// The big oak. (x, y) = foot of the trunk. o.night, o.mound (burial mound), o.hole (open grave), o.shade (shadow pool)
function bigTree(x, y, s = 1, o = {}) {
  const night = o.night, leaf = night ? '#24314E' : '#5E8F45', dk = night ? '#161E38' : '#3A6634', lt = night ? '#33456A' : '#8DB85E', bark = night ? '#262B44' : '#6E4E36';
  if (o.shade !== false && !night) paint(ellPts(x + 40 * s, y + 20 * s, 520 * s, 90 * s, 24), { fill: '#3E5A3A', fillOp: 110, bleed: .25, tex: .4, border: .3, ink: null });
  // roots + trunk + main limbs
  for (const [rx, ry] of [[-150, 18], [-90, 30], [110, 26], [170, 14]]) paint([[x + rx * .3 * s, y - 40 * s], [x + rx * s, y + ry * s], [x + rx * .6 * s, y + (ry + 10) * s]], { wash: bark, ink: PAL.ink, sw: .6 * s, curv: .4 });
  paint([[x - 70 * s, y + 10 * s], [x - 48 * s, y - 180 * s], [x - 40 * s, y - 330 * s], [x + 40 * s, y - 330 * s], [x + 52 * s, y - 160 * s], [x + 80 * s, y + 12 * s]], { wash: bark, fill: shade(bark, .35), fillOp: 90, tex: .7, border: .6, ink: PAL.ink, sw: .9 * s, curv: .35 });
  for (const [a, b, c] of [[[-30, -300], [-210, -470], 22], [[20, -310], [230, -500], 24], [[0, -320], [-20, -560], 20]]) paint(capsule(x + a[0] * s, y + a[1] * s, x + b[0] * s, y + b[1] * s, c * s, c * .55 * s, 4), { wash: bark, ink: PAL.ink, sw: .7 * s });
  for (let i = 0; i < 4; i++) inkLine([[x + (-30 + i * 18) * s, y - 20 * s], [x + (-24 + i * 16) * s, y - 300 * s]], .35 * s, shade(bark, .45), 'inkfine', .4);
  // canopy: big masses, then light clusters, then a few leaf scallops
  const cy = y - 560 * s;
  paint(scallopPts(x, cy, 470 * s, 250 * s, 11, .2, 7), { wash: leaf, fill: night ? null : dk, fillOp: 110, bleed: .12, tex: .7, border: .6, ink: PAL.ink, sw: 1 * s });
  for (const [dx, dy, r] of [[-250, -40, 170], [210, -60, 180], [0, -150, 190], [-90, 60, 150], [130, 70, 150]]) paint(scallopPts(x + dx * s, cy + dy * s, r * s, r * .7 * s, 8, .25, dx + dy), { wash: lt, washOp: night ? 120 : 150, ink: null });
  for (const [dx, dy, r] of [[-300, 60, 110], [330, 40, 120], [60, 150, 140], [-160, 150, 110]]) paint(scallopPts(x + dx * s, cy + dy * s, r * s, r * .6 * s, 7, .3, dx * 3), { wash: dk, washOp: night ? 140 : 120, ink: null });
  for (let i = 0; i < 14; i++) { const a = hash(i * 2.3) * TAU, r = .55 + .4 * hash(i * 5.1), px = x + Math.cos(a) * 430 * s * r, py = cy + Math.sin(a) * 220 * s * r; inkLine([[px - 18 * s, py], [px, py - 12 * s], [px + 18 * s, py]], .4 * s, shade(dk, .2), 'inkfine', .6); }
  if (o.hole) {
    const [hx, hy] = o.hole;
    paint(ellPts(hx, hy, 210 * s, 60 * s, 22), { wash: '#4A3324', fill: '#2E1E14', fillOp: 120, tex: .6, ink: PAL.ink, sw: .7 });
    paint(scallopPts(hx + 260 * s, hy - 10 * s, 110 * s, 46 * s, 6, .25, 3), { wash: PAL.earth, fill: PAL.earthDk, fillOp: 90, tex: .7, ink: PAL.ink, sw: .6 });
  }
  if (o.mound) { const [mx, my] = o.mound; paint(scallopPts(mx, my, 200 * s, 34 * s, 7, .18, 5), { wash: night ? '#2E2A3A' : PAL.earth, fill: night ? '#1E1A2A' : PAL.earthDk, fillOp: 90, tex: .7, ink: PAL.ink, sw: .6 }); if (o.leaves) for (let i = 0; i < 16; i++) paint(ellPts(mx + lerp(-190, 190, hash(i * 3.9)) * s, my + lerp(-26, 14, hash(i * 1.7)) * s, 12 * s, 6 * s, 8, 0, hash(i)), { wash: ['#8A9A4A', '#B9873A', '#6E8A3E'][i % 3], ink: null }); }
}

// =====================================================================================
// THE FARM — exterior. World x -400..2800, ground y 900. House x 200..1500: door x 780..930, kitchen window x 380..560
// (y 470..660), living-room window x 1100..1300 (y 470..660). Garden table at x 1820 (top y ~695). Woods from x 2300.
// =====================================================================================
const FARM = { ground: 900, door: [855, 900], kitchenWin: [380, 470, 180, 190], livingWin: [1100, 470, 200, 190], table: [1820, 900] };
function farmyard(o = {}) {
  countryside({ hy: 620, time: o.time || 'day', clouds: true });
  // woods behind the house and on the right
  for (let i = 0; i < 6; i++) treeRound(1500 + i * 230, 900 - 10 * (i % 2), 1.6 + .3 * hash(i), { col: '#5E8F45', dk: '#3A6634' });
  for (let i = 0; i < 4; i++) treeRound(-350 + i * 170, 880, 1.3 + .2 * hash(i * 3), { col: '#6E9A50', dk: '#46703C' });
  // house
  const st = '#E6D6B8';
  paint(rectPts(200, 160, 1300, 740), { wash: st, fill: '#CDB792', fillOp: 80, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw: .9 });
  for (let i = 0; i < 46; i++) { const sx = lerp(220, 1480, hash(i * 3.7)), sy = lerp(180, 880, hash(i * 9.1)); paint(rrPts(sx, sy, 40 + 30 * hash(i), 22 + 10 * hash(i * 2), 8), { ink: '#B9A27E', sw: .35 }); }
  paint([[160, 170], [380, -40], [1320, -40], [1540, 170]], { wash: '#C66A4C', fill: '#9A4A34', fillOp: 90, tex: .7, border: .5, ink: PAL.ink, sw: .9 });
  for (let i = 1; i < 6; i++) inkLine([[lerp(160, 380, i / 6), lerp(170, -40, i / 6)], [lerp(1540, 1320, i / 6), lerp(170, -40, i / 6)]], .35, '#8A3E2C', 'inkfine', 0);
  paint(rectPts(1150, -140, 70, 120), { wash: '#B99A7A', ink: PAL.ink, sw: .6 });
  // windows (kitchen, living room, upstairs) with blue-grey shutters
  const win = (x, y, w, h, open, inside) => {
    paint(rectPts(x, y, w, h), { wash: inside || '#5E6E86', fill: '#3E4A62', fillOp: 80, tex: .4, ink: PAL.ink, sw: .6 });
    if (open) { glow(x + w / 2, y + h * .6, w * .4, h * .3, '#FFF0C8', 60); }
    windowFrame(x, y, w, h, { t: 10, cross: !open });
    for (const sx of [x - w * .5 - 14, x + w + 14]) { paint(rectPts(sx, y - 6, w * .5, h + 12), { wash: '#8EA8B8', fill: '#6E8898', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 }); for (let k = 1; k < 6; k++) inkLine([[sx + 6, y + k * h / 6], [sx + w * .5 - 6, y + k * h / 6]], .3, '#5E7888', 'inkfine', 0); }
  };
  win(380, 470, 180, 190, o.kitchenOpen, o.kitchenInside); win(1100, 470, 200, 190, o.livingOpen ?? true, o.livingInside);
  win(400, 230, 140, 150, false); win(1130, 230, 140, 150, false); win(770, 240, 160, 140, false);
  // door + step + vine
  paint(rectPts(780, 600, 150, 300), { wash: o.doorOpen ? '#2E2A3A' : '#7E97A6', fill: '#5E7686', fillOp: 70, tex: .5, ink: PAL.ink, sw: .8 });
  if (!o.doorOpen) { paint(rectPts(805, 625, 100, 80), { wash: '#C9D6DF', ink: PAL.ink, sw: .4 }); paint(ellPts(905, 760, 7, 7, 8), { wash: PAL.gold, ink: null }); }
  paint(rectPts(760, 890, 190, 22), { wash: '#B9A88A', ink: PAL.ink, sw: .5 });
  for (let i = 0; i < 9; i++) paint(scallopPts(lerp(700, 1010, i % 2 ? .1 : .9) + jit(20), lerp(880, 560, i / 9), 46, 34, 6, .3, i), { wash: '#5E8F45', fill: '#3A6634', fillOp: 70, ink: null });
  flowers(690, 1020, 560, 880, 16, [PAL.rose, '#E25A7A', PAL.cream]);
  bench(560, 900, 200, .9);
  // yard
  paint([[-500, 900], [3100, 900], [3100, 1500], [-500, 1500]], { wash: '#D8C39C', fill: '#B59A6E', fillOp: 80, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw: .6 });
  for (let i = 0; i < 30; i++) paint(ellPts(lerp(-400, 2800, hash(i * 3.3)), lerp(920, 1200, hash(i * 7.3)), 8 + 8 * hash(i), 4, 6), { wash: '#B59A6E', ink: null });
  grassStrokes(-400, 2800, 905, 70, 26, '#7E9447', .45);
  // fence (goat pen) on the left
  if (o.fence !== false) { for (let i = 0; i < 6; i++) paint(rectPts(-300 + i * 90, 760, 16, 150), { wash: '#9C7A54', ink: PAL.ink, sw: .45 }); for (const fy of [790, 850]) paint(rectPts(-310, fy, 480, 12), { wash: '#A98A60', ink: PAL.ink, sw: .4 }); }
  // garden table + chairs
  if (o.table !== false) { chair(1700, 900, .9); table(1820, 900, 220, .9, { col: '#C9A26E' }); chair(1960, 900, .9, { flip: true }); }
}

// =====================================================================================
// THE FARM — living room. World x -200..2300, floor y 900. Window x 160..460 (y 160..640), piano x 700..1010 (keys face right,
// the pianist sits at ~x 1100 facing left), couch x 1350..1800, fireplace x 1950..2250. o.dinner: table centred at x 1050.
// =====================================================================================
function livingRoom(o = {}) {
  const night = o.night;
  paint(rectPts(-300, -200, 2700, 1110), { wash: night ? '#9C8C86' : '#F0E3CB', fill: night ? '#6E625E' : '#D9C6A6', fillOp: 70, bleed: .08, tex: .6, border: .4, ink: null });
  paint(rectPts(-300, 700, 2700, 200), { wash: night ? '#7A6A60' : '#D8C3A2', fill: '#B9A07C', fillOp: 60, tex: .5, ink: null });
  inkLine([[-300, 700], [2400, 700]], .6, '#9C8460', 'ink', 0);
  woodFloor(-300, 2400, 900, 1300, night ? '#7A5A44' : '#B07E52');
  // window onto the countryside
  const wx = 160, wy = 160, ww = 300, wh = 480;
  if (night) { skyGrad(wx, wy, ww, wh, '#151A3C', '#2F3C7A', 3, false); paint(ellPts(wx + ww * .7, wy + 90, 22, 22, 14), { wash: '#F3EBC8', ink: null }); }
  else { skyGrad(wx, wy, ww, wh * .6, '#9BC8E4', '#F2EBD6', 3); hillBand(wx, wx + ww, wy + wh * .66, 30, '#9DB874', 3, false, wy + wh); treeRound(wx + ww * .3, wy + wh * .8, .35, { ink: false }); }
  windowFrame(wx, wy, ww, wh, { cross: !o.winOpen });
  if (o.winOpen) { paint([[wx, wy], [wx - 90, wy + 30], [wx - 90, wy + wh - 30], [wx, wy + wh]], { wash: '#E6EEF0', washOp: 160, ink: PAL.ink, sw: .5 }); paint([[wx + ww, wy], [wx + ww + 90, wy + 30], [wx + ww + 90, wy + wh - 30], [wx + ww, wy + wh]], { wash: '#E6EEF0', washOp: 160, ink: PAL.ink, sw: .5 }); }
  curtain(wx - 110, wy - 50, 100, wh + 140, '#C9785A', 1); curtain(wx + ww + 10, wy - 50, 100, wh + 140, '#C9785A', -1);
  if (!night) paint([[wx, wy + wh], [wx + ww, wy + wh], [wx + ww + 400, 1250], [wx - 100, 1250]], { fill: '#FFF2D6', fillOp: 55, bleed: .2, ink: null });
  // front door on the far left (o.frontDoor 0..1 open onto the bright yard)
  paint(rectPts(-170, 290, 260, 620), { wash: '#D9C6A6', ink: PAL.ink, sw: .7 });
  const fk = clamp(o.frontDoor ?? 0);
  paint(rectPts(-155, 305, 230, 595), { wash: night ? '#2E3460' : '#F6E8C8', fill: night ? null : '#E8D3A6', fillOp: 60, ink: null });
  if (!night && fk > 0) { paint(rectPts(-155, 700, 230 * fk, 200), { wash: '#D8C39C', ink: null }); glow(-40, 700, 260, 300, '#FFF2D0', 70); }
  paint([[-155 + 230 * fk, 305], [75, 305], [75, 900], [-155 + 230 * fk, 900]], { wash: '#8EA8B8', fill: '#6E8898', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
  // art
  frameArt(1180, 220, 240, 170, 'land'); frameArt(1500, 260, 150, 200, 'flowers');
  // fireplace
  paint(rectPts(1950, 480, 320, 420), { wash: '#D9CBB2', fill: '#B5A488', fillOp: 70, tex: .6, ink: PAL.ink, sw: .7 });
  paint(rectPts(1920, 460, 380, 34), { wash: '#C9B79A', ink: PAL.ink, sw: .6 });
  paint(rrPts(2010, 600, 200, 300, 60), { wash: '#2E2630', ink: PAL.ink, sw: .6 });
  if (o.fire) { glow(2110, 820, 220, 140, '#F28C28', 170); paint([[2050, 880], [2080, 760], [2110, 820], [2140, 720], [2170, 880]], { wash: '#FFB84A', fill: '#F26A28', fillOp: 120, ink: null, curv: .5 }); }
  for (const lx of [2040, 2120]) paint(capsule(lx, 880, lx + 70, 870, 14, 14, 4), { wash: '#7A4E33', ink: PAL.ink, sw: .4 });
  // rug, couch, lamp
  paint(ellPts(1350, 1010, 620, 90, 24), { wash: '#B4503F', fill: '#8A3A2E', fillOp: 80, tex: .6, ink: PAL.ink, sw: .6 });
  paint(ellPts(1350, 1010, 520, 66, 24), { ink: '#E8C07A', sw: .5 });
  if (o.couch !== false) couch(1580, 900, 1);
  lampTable(1880, 900, 1.2, night);
  if (o.piano !== false) piano(855, 900, 1);
  if (o.dinner) dinnerTable(1050, 900, 1, o.dinner === 'night');
}
// Repaint the living-room window frame (and the wall under it) over someone standing outside the window.
function livingWindowFront(o = {}) {
  const wx = 160, wy = 160, ww = 300, wh = 480;
  paint(rectPts(wx - 30, wy + wh + 8, ww + 60, 900 - wy - wh - 8), { wash: '#F0E3CB', ink: null });
  paint(rectPts(wx - 30, 700, ww + 60, 200), { wash: '#D8C3A2', ink: null });
  inkLine([[wx - 30, 700], [wx + ww + 30, 700]], .6, '#9C8460', 'ink', 0);
  windowFrame(wx, wy, ww, wh, { cross: false });
  paint([[wx, wy], [wx - 90, wy + 30], [wx - 90, wy + wh - 30], [wx, wy + wh]], { wash: '#E6EEF0', washOp: 160, ink: PAL.ink, sw: .5 });
  paint([[wx + ww, wy], [wx + ww + 90, wy + 30], [wx + ww + 90, wy + wh - 30], [wx + ww, wy + wh]], { wash: '#E6EEF0', washOp: 160, ink: PAL.ink, sw: .5 });
  curtain(wx - 110, wy - 50, 100, wh + 140, '#C9785A', 1); curtain(wx + ww + 10, wy - 50, 100, wh + 140, '#C9785A', -1);
}
function pianoBench(x, y, s = 1) { paint(rrPts(x - 70 * s, y - 120 * s, 140 * s, 26 * s, 8 * s), { wash: '#5A3530', ink: PAL.ink, sw: .6 }); for (const lx of [-60, 48]) paint(rectPts(x + lx * s, y - 96 * s, 12 * s, 96 * s), { wash: '#4A2A26', ink: PAL.ink, sw: .45 }); }
function bowl(x, y, s = 1) { paint([[x - 50 * s, y - 34 * s], [x + 50 * s, y - 34 * s], [x + 34 * s, y], [x - 34 * s, y]], { wash: '#F2EEE6', fill: '#C9C6D6', fillOp: 50, ink: PAL.ink, sw: .5, curv: .3 }); paint(ellPts(x, y - 34 * s, 50 * s, 10 * s, 14), { wash: '#9EC8E4', ink: PAL.ink, sw: .4 }); }
function couch(x, y, s = 1, col = '#8FA383') {
  paint(rrPts(x - 230 * s, y - 250 * s, 460 * s, 140 * s, 40 * s), { wash: col, fill: shade(col, .3), fillOp: 70, tex: .6, ink: PAL.ink, sw: .7 });
  paint(rrPts(x - 260 * s, y - 140 * s, 520 * s, 110 * s, 30 * s), { wash: tint(col, .1), fill: shade(col, .25), fillOp: 60, tex: .5, ink: PAL.ink, sw: .7 });
  for (const ax of [-270, 220]) paint(rrPts(x + ax * s, y - 190 * s, 50 * s, 160 * s, 22 * s), { wash: col, ink: PAL.ink, sw: .6 });
  for (const px of [-150, 120]) paint(rrPts(x + px * s, y - 220 * s, 90 * s, 70 * s, 20 * s), { wash: px < 0 ? '#E8C07A' : '#C9785A', ink: PAL.ink, sw: .5 });
  for (const lx of [-230, 200]) paint(rectPts(x + lx * s, y - 30 * s, 24 * s, 30 * s), { wash: '#6B4A33', ink: PAL.ink, sw: .4 });
}
function dinnerTable(x, y, s = 1, night = true) {
  const top = table(x, y, 560 * s, s, { cloth: '#F4EEDF' });
  for (const px of [-170, 0, 170]) plate(x + px * s, top + 12 * s, s);
  for (const px of [-110, 60, 220]) wineGlass(x + px * s, top + 14 * s, s);
  candle(x - 40 * s, top + 10 * s, s, true); candle(x + 120 * s, top + 8 * s, s, true);
  paint([[x - 250 * s, top + 6 * s], [x - 236 * s, top - 70 * s], [x - 222 * s, top + 6 * s]], { wash: '#5E7A4A', ink: PAL.ink, sw: .4 });   // bottle
  if (night) glow(x, top - 40 * s, 420 * s, 220 * s, '#FFD98A', 70, .35);
}

// =====================================================================================
// THE FARM — kitchen. World x -200..2300, floor y 900. Counter x 100..1400 (worktop y 640), window above it x 420..780
// (y 170..520), door x 1600..1790. Cutting board x 250..520 (worktop y 690). People at the counter stand at y ~940.
// =====================================================================================
function kitchen(o = {}) {
  paint(rectPts(-300, -200, 2700, 1110), { wash: '#F2E6CF', fill: '#D9C6A6', fillOp: 70, bleed: .08, tex: .6, border: .4, ink: null });
  paint(rectPts(80, 470, 1340, 220), { wash: '#E9EEEC', fill: '#B9C8C8', fillOp: 50, tex: .4, ink: null });
  for (let i = 0; i < 17; i++) for (let j = 0; j < 3; j++) paint(rectPts(80 + i * 79, 470 + j * 73, 79, 73), { ink: '#A9BCC4', sw: .3 });
  for (let i = 0; i < 8; i++) paint(starPts(120 + i * 160, 510 + (i % 2) * 73, 14, .45, 4), { wash: '#6E98B4', ink: null });
  woodFloor(-300, 2400, 900, 1300, '#C8A06E');
  // window with the farmyard outside
  const wx = 420, wy = 170, ww = 360, wh = 330;
  skyGrad(wx, wy, ww, wh * .55, '#9BC8E4', '#F2EBD6', 3);
  paint(rectPts(wx, wy + wh * .55, ww, wh * .45), { wash: '#D8C39C', fill: '#B59A6E', fillOp: 70, tex: .6, ink: null });
  treeRound(wx + ww * .8, wy + wh * .62, .45, { ink: false });
  if (o.outside) o.outside(wx, wy, ww, wh);
  windowFrame(wx, wy, ww, wh, { cross: o.cross ?? true });
  // shelves + hanging pots
  paint(rectPts(940, 250, 380, 18), { wash: '#A9774C', ink: PAL.ink, sw: .5 });
  for (let i = 0; i < 5; i++) paint(rrPts(960 + i * 72, 180, 46, 70, 10), { wash: ['#D9B26A', '#C9785A', '#8FA383', '#E8DCC2', '#B4503F'][i], ink: PAL.ink, sw: .45 });
  inkLine([[100, 130], [380, 130]], .9, '#6B4A33', 'ink', 0);
  for (let i = 0; i < 3; i++) { const px = 140 + i * 90; inkLine([[px, 130], [px, 170]], .5, PAL.ink, 'inkfine', 0); paint(ellPts(px, 210, 34 - i * 4, 34 - i * 4, 14), { wash: '#B87333', fill: '#8A4E22', fillOp: 70, ink: PAL.ink, sw: .5 }); }
  // counter + cabinets + sink
  paint(rectPts(80, 690, 1360, 28), { wash: '#C8975F', fill: '#9C6B44', fillOp: 70, tex: .5, ink: PAL.ink, sw: .7 });
  paint(rectPts(100, 718, 1320, 182), { wash: '#9FB2A3', fill: '#7A8E80', fillOp: 70, tex: .5, ink: PAL.ink, sw: .7 });
  for (let i = 0; i < 5; i++) { paint(rectPts(118 + i * 262, 734, 240, 150), { ink: '#6E8274', sw: .4 }); paint(rectPts(225 + i * 262, 750, 26, 8), { wash: '#C9B06A', ink: null }); }
  paint(rectPts(640, 682, 260, 14), { wash: '#C9CED6', ink: PAL.ink, sw: .4 });
  inkLine([[770, 690], [770, 620], [810, 610]], 1.2, '#AEB6C2', 'ink', .5);
  if (o.board !== false) { paint(rrPts(240, 668, 300, 24, 10), { wash: '#D9B07A', ink: PAL.ink, sw: .5 }); vegetables(390, 670, 1); }
  if (o.groceries) groceries(1150, 690, 1);
  // door
  paint(rectPts(1590, 300, 210, 600), { wash: o.doorOpen ? '#F6EAD0' : '#8EA8B8', fill: o.doorOpen ? '#E8D6AE' : '#6E8898', fillOp: 70, tex: .5, ink: PAL.ink, sw: .8 });
  if (!o.doorOpen) { paint(rectPts(1620, 340, 150, 200), { wash: '#C9D6DF', ink: PAL.ink, sw: .4 }); paint(ellPts(1770, 620, 8, 8, 8), { wash: PAL.gold, ink: null }); }
  // small table
  if (o.table !== false) { table(1250, 1060, 320, 1, { col: '#B88A5A' }); }
}
function vegetables(x, y, s = 1) {
  for (let i = 0; i < 3; i++) paint(capsule(x - 120 * s + i * 30 * s, y - 10 * s, x - 40 * s + i * 30 * s, y - 16 * s, 9 * s, 4 * s, 4), { wash: '#E8862E', ink: PAL.ink, sw: .35 });
  paint(ellPts(x + 30 * s, y - 20 * s, 24 * s, 20 * s, 12), { wash: '#D8394E', fill: '#A82A3A', fillOp: 70, ink: PAL.ink, sw: .4 });
  paint(capsule(x + 70 * s, y - 14 * s, x + 150 * s, y - 20 * s, 12 * s, 10 * s, 4), { wash: '#E8EFD8', ink: PAL.ink, sw: .35 });
  paint(capsule(x + 130 * s, y - 20 * s, x + 170 * s, y - 34 * s, 10 * s, 14 * s, 4), { wash: '#6E9F58', ink: PAL.ink, sw: .35 });
  for (let i = 0; i < 4; i++) paint(ellPts(x - 10 * s + i * 13 * s, y - 6 * s, 6 * s, 5 * s, 8), { wash: '#E8862E', ink: null });
}
function groceries(x, y, s = 1) {
  paint([[x - 70 * s, y], [x + 70 * s, y], [x + 60 * s, y - 150 * s], [x - 60 * s, y - 150 * s]], { wash: '#D9BC8C', fill: '#B5986A', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
  paint(capsule(x - 30 * s, y - 150 * s, x - 10 * s, y - 230 * s, 14 * s, 10 * s, 4), { wash: '#E8D09A', ink: PAL.ink, sw: .4 });   // baguette
  paint(scallopPts(x + 25 * s, y - 165 * s, 34 * s, 24 * s, 6, .3, 2), { wash: '#6E9F58', ink: PAL.ink, sw: .4 });
}

// =====================================================================================
// Night hallway in the farmhouse. World x -200..2200, floor y 900. Thibaut's door x 420..640, Louise's door x 1480..1660.
// o.td (0..1) Thibaut's door ajar; o.ld Louise's door open (warm light).
// =====================================================================================
function hallway(o = {}) {
  paint(rectPts(-300, -200, 2600, 1110), { wash: '#4A4A6E', fill: '#30304E', fillOp: 90, bleed: .08, tex: .6, border: .4, ink: null });
  woodFloor(-300, 2400, 900, 1300, '#5A4A48');
  const door = (x, k, light) => {
    paint(rectPts(x - 14, 290, 248, 620), { wash: '#6A5E7A', ink: PAL.ink, sw: .7 });
    if (k > 0) { paint(rectPts(x, 300, 220 * k, 600), { wash: light ? '#FFE3A0' : '#1E1C30', ink: null }); if (light) glow(x + 110 * k, 700, 300, 260, '#FFD98A', 120); }
    paint([[x + 220 * k, 300], [x + 220, 300], [x + 220, 900], [x + 220 * k, 900]], { wash: '#7A6A8A', fill: '#5A4E6A', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
  };
  door(420, o.td ?? 0, o.tdLight ?? true); door(1480, o.ld ?? 0, true);
  paint(rectPts(1020, 360, 60, 40), { wash: '#C9A66B', ink: PAL.ink, sw: .4 });
  glow(1050, 400, 220, 160, '#F2C46A', o.lamp ?? 90);
  frameArt(760, 360, 160, 120, 'land', { frame: '#6E5A40' });
  paint(rectPts(-300, 880, 2600, 20), { wash: '#3A3050', ink: null });
}

// The closet where Louise hides. World x 0..1200, y 0..1000. Light wedge from the opened door on the left.
function closet(o = {}) {
  paint(rectPts(-200, -200, 1600, 1400), { wash: '#2E2A3E', fill: '#1E1A2C', fillOp: 90, tex: .6, ink: null });
  inkLine([[80, 140], [1120, 140]], 1.6, '#8A7A60', 'ink', 0);
  const coats = ['#7A4E40', '#4F6A7A', '#8A7A5A', '#6E5A7A', '#5E7A5A', '#A9775A'];
  for (let i = 0; i < 6; i++) { const x = 160 + i * 170; inkLine([[x, 140], [x, 175]], .6, '#AEB6C2', 'inkfine', .3); paint([[x - 70, 180], [x + 70, 180], [x + 90, 720], [x - 90, 720]], { wash: mixCol(coats[i], '#2E2A3E', .35), fill: '#1E1A2C', fillOp: 70, tex: .6, ink: PAL.ink, sw: .6, curv: .1 }); }
  paint([[-200, -200], [260, -200], [700, 1200], [-200, 1200]], { fill: '#FFE8B8', fillOp: o.light ?? 110, bleed: .15, tex: .3, ink: null });
  paint(rectPts(-200, 900, 1600, 400), { wash: '#3A3050', ink: null });
}

// =====================================================================================
// NIGHT woods with the big tree. World x -400..2600, ground y 900, big tree at o.tree (default [1200, 900]).
// =====================================================================================
function nightWoods(o = {}) {
  skyGrad(-500, -700, 3400, 1600, '#141834', '#2B3566', 4, false);
  paint(ellPts(o.moon?.[0] ?? 300, o.moon?.[1] ?? 40, 50, 50, 20), { wash: '#F3EBC8', ink: null }); glow(o.moon?.[0] ?? 300, o.moon?.[1] ?? 40, 200, 200, '#8FA0D8', 90);
  for (let i = 0; i < 30; i++) paint(ellPts(lerp(-400, 2600, hash(i * 3.1)), lerp(-600, 300, hash(i * 7.7)), 3, 3, 5), { wash: '#F6F0D8', ink: null });
  for (let i = 0; i < 9; i++) treeRound(lerp(-400, 2600, i / 8), 860 + hash(i) * 30, 1.6 + hash(i * 2) * .6, { col: '#202A48', dk: '#151C34', trunk: '#1A1E34', ink: false, night: true });
  paint([[-500, 880], [3100, 880], [3100, 1500], [-500, 1500]], { wash: '#262C48', ink: null });
  const [tx, ty] = o.tree || [1200, 900];
  if (o.tree !== false) bigTree(tx, ty, o.treeS || 1, { night: true, mound: o.mound, hole: o.hole });
  glow(o.moon?.[0] ?? 300, 700, 900, 300, '#5A6AA8', 50, .4);
}

// Night road: dirt track from the bottom left up to a main road (y ~ 640). World x -400..2800.
function nightRoad(o = {}) {
  skyGrad(-500, -700, 3600, 1260, '#141834', '#2B3566', 4, false);
  for (let i = 0; i < 40; i++) paint(ellPts(lerp(-400, 2800, hash(i * 3.1)), lerp(-600, 450, hash(i * 7.7)), 3, 3, 5), { wash: '#F6F0D8', ink: null });
  paint([[-500, 520], [800, 470], [1700, 500], [3100, 460], [3100, 900], [-500, 900]], { wash: '#1E2646', ink: null, curv: .3 });
  for (let i = 0; i < 8; i++) treeRound(lerp(-300, 2700, hash(i * 5.3)), 560 + hash(i) * 30, .7, { col: '#1A2240', dk: '#121830', trunk: '#141830', ink: false, night: true });
  paint([[-500, 600], [3100, 600], [3100, 1500], [-500, 1500]], { wash: '#262C48', ink: null });
  paint([[-500, 620], [3100, 620], [3100, 700], [-500, 700]], { wash: '#3A3E52', ink: PAL.ink, sw: .5 });
  for (let i = 0; i < 12; i++) paint(rectPts(-400 + i * 280, 655, 120, 8), { wash: '#C9C3A8', ink: null });
  paint([[700, 700], [1100, 700], [1500, 1500], [100, 1500]], { wash: '#4A4058', ink: null });
}

// Flashback bedroom (side view of a bed, lamp, moonlit window). World x -200..2000, floor y 900.
function nightBedroom(o = {}) {
  paint(rectPts(-300, -200, 2500, 1110), { wash: '#2E3460', fill: '#1E2448', fillOp: 90, tex: .6, ink: null });
  woodFloor(-300, 2300, 900, 1300, '#3A3450');
  skyGrad(1300, 160, 300, 400, '#141834', '#2F3C7A', 3, false); paint(ellPts(1450, 260, 36, 36, 16), { wash: '#F3EBC8', ink: null }); windowFrame(1300, 160, 300, 400, { col: '#4A5080' });
  paint(rectPts(300, 640, 900, 140), { wash: '#4A4E78', fill: '#2E3260', fillOp: 70, tex: .5, ink: PAL.ink, sw: .6 });
  paint([[240, 420], [320, 440], [320, 860], [240, 850]], { wash: '#3A2E48', ink: PAL.ink, sw: .6 });
  paint(rectPts(300, 760, 900, 60), { wash: '#2A2440', ink: PAL.ink, sw: .5 });
}
// Barn interior at night (flashback). World x -200..2000, floor y 900. Planks lifted at x 700..1100.
function barnNight(o = {}) {
  paint(rectPts(-300, -200, 2500, 1110), { wash: '#3E3448', fill: '#2A2236', fillOp: 90, tex: .7, ink: null });
  for (let i = 0; i < 16; i++) inkLine([[-300 + i * 160, -200], [-300 + i * 160, 900]], .6, '#1E1828', 'ink', 0);
  inkLine([[-300, 200], [2300, 200]], 3, '#2A2030', 'ink', 0);
  paint(rectPts(-300, 900, 2600, 400), { wash: '#4A3E40', fill: '#2E2428', fillOp: 80, tex: .7, ink: null });
  for (let i = 0; i < 14; i++) inkLine([[-300 + i * 190, 900], [-500 + i * 230, 1300]], .4, '#2A2024', 'inkfine', 0);
  if (o.pit) paint([[700, 960], [1100, 950], [1150, 1060], [650, 1070]], { wash: '#1A1218', ink: PAL.ink, sw: .6 });
  glow(o.lantern?.[0] ?? 300, o.lantern?.[1] ?? 520, 300, 260, '#F2B65A', 120);
  paint(rrPts((o.lantern?.[0] ?? 300) - 20, (o.lantern?.[1] ?? 520) - 30, 40, 60, 8), { wash: '#FFE2A0', ink: PAL.ink, sw: .5 });
}

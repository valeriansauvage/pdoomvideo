// 01_intro.js — Opening (~32 s): title card → Margot → the 1880 house → a century of weather →
// the « rénovation » (plastic paint, insulation, airtight windows) → 15 years later, the damage →
// zoom into the façade, the paint tears open on the old stone wall (match cut into 'mur').
'use strict';

// ---------- shared with 'mur': full-frame rubble-stone close-up (match cut across the boundary) ----------
// The scale depends on absolute time only, so both scenes draw the identical image during the crossfade.
function intro_closeupScale(T) { return 1 + .035 * Math.max(0, T - 29); }
function intro_stoneCloseup(ctx, T, { alpha = 1, vignette = 1, cx = W / 2, cy = H / 2, scale = null } = {}) {
  const sc = scale ?? intro_closeupScale(T);
  const plain = () => stoneTexture(W, H, 11, { size: 150 });
  const vign = () => cached('intro|closeupVignette', W, H, g => {      // texture + vignette baked once
    g.drawImage(plain(), 0, 0);
    const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H);
    v.addColorStop(0, 'rgba(45,35,25,0)'); v.addColorStop(1, 'rgba(45,35,25,.38)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  });
  const x = cx - W / 2 * sc, y = cy - H / 2 * sc, w = W * sc, h = H * sc;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (vignette >= 1) ctx.drawImage(vign(), x, y, w, h);
  else {
    ctx.drawImage(plain(), x, y, w, h);
    if (vignette > 0) { ctx.globalAlpha *= vignette; ctx.drawImage(vign(), x, y, w, h); }
  }
  ctx.restore();
}

// ---------- layout ----------
const INTRO_HOUSE = { cx: 655, gy: 880, w: 780 };
const INTRO_WINS = [[.2, .14], [.5, .14], [.8, .14], [.2, .56], [.8, .56]];   // same as house()
const INTRO_LIME = '#EFD6A8', INTRO_PLASTIC = '#F2F5F1';
const INTRO_FOCUS = [757, 785];                                              // zoom target on the façade
function intro_box() { const { cx, gy, w } = INTRO_HOUSE, h = w * .62; return { x: cx - w / 2, y: gy - h, w, h, gy, cx }; }

// ---------- small drawing helpers ----------
function intro_smoothPath(ctx, pts) {
  const n = pts.length; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    if (!i) { const l = pts[n - 1]; ctx.moveTo((l[0] + p[0]) / 2, (l[1] + p[1]) / 2); }
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}
function intro_stone(ctx, x, y, w, h, seed, col) {   // squarish rubble stone with rounded, irregular edges
  const hw = w / 2, hh = h / 2, j = i => hash(seed * 13 + i) - .5;
  const pts = [[-hw * (1 + j(0) * .1), -hh * (1 + j(1) * .14)], [j(2) * w * .2, -hh * (1.08 + j(3) * .12)],
    [hw * (1 + j(4) * .1), -hh * (1 + j(5) * .14)], [hw * (1.07 + j(6) * .08), j(7) * h * .2],
    [hw * (1 + j(8) * .1), hh * (1 + j(9) * .14)], [j(10) * w * .2, hh * (1.06 + j(11) * .1)],
    [-hw * (1 + j(12) * .1), hh * (1 + j(13) * .14)], [-hw * (1.07 + j(14) * .08), j(15) * h * .2]].map(([a, b]) => [x + a, y + b]);
  intro_smoothPath(ctx, pts);
  ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  ellipse(ctx, x - w * .16, y - h * .22, w * .2, h * .1, 'rgba(255,255,255,.3)', null, 0, -.06);
  for (let i = 0; i < 4; i++) circle(ctx, x + j(20 + i) * w * .7, y + j(30 + i) * h * .5, 2.5, 'rgba(70,60,50,.25)');
}
// odometer digit: float value of the digit at place k (0 = units), rolling like a mechanical counter
function intro_odo(v, k) {
  const p = Math.pow(10, k), q = Math.floor(v / p), r = v - q * p;
  let d = q % 10; if (r > p - 1) d += r - (p - 1); return d;
}

// ---------- title card ----------
const INTRO_TITLE = [['Le vieux bâti', 322], ['doit respirer', 486]];
function intro_title(ctx, t, kOut) {
  if (kOut >= 1 || t < .04) return;
  const size = 158, ko = easeIn(kOut);
  ctx.save();
  const breathe = 1 + .014 * Math.sin(t * 2.3) * smooth(inv(.8, 1.4, t));
  ctx.translate(W / 2, 404 - 640 * ko); ctx.scale((1 - .45 * ko) * breathe, (1 - .45 * ko) * breathe); ctx.translate(-W / 2, -404);
  ctx.globalAlpha *= 1 - smooth(inv(.5, 1, kOut));
  setFont(ctx, size, FONT.title, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const Ls = []; let n = 0;
  INTRO_TITLE.forEach(([s, y], li) => {
    const x0 = W / 2 - ctx.measureText(s).width / 2;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === ' ') continue;
      const xa = ctx.measureText(s.slice(0, i)).width, wch = ctx.measureText(s[i]).width;
      const k = clamp((t - (.05 + n * .017)) / .34);
      Ls.push({ ch: s[i], x: x0 + xa + wch / 2, y: y + Math.sin(t * 2.6 + n * .55) * 4 * smooth(inv(.9, 1.5, t)), k, n, hot: li === 1 && i >= 5 });
      n++;
    }
  });
  for (const pass of [0, 1, 2]) for (const l of Ls) {
    if (l.k <= 0) continue;
    ctx.save(); ctx.translate(l.x, l.y);
    const sc = easeOutBack(l.k, 2.4); ctx.rotate((1 - easeOut(l.k)) * (hash(l.n * 3.1) - .5) * 1.4); ctx.scale(sc, sc);
    ctx.globalAlpha *= clamp(l.k * 4);
    if (pass === 0) { ctx.strokeStyle = 'rgba(70,45,20,.2)'; ctx.lineWidth = 20; ctx.strokeText(l.ch, 8, 12); }
    else if (pass === 1) { ctx.strokeStyle = C.ink; ctx.lineWidth = 18; ctx.strokeText(l.ch, 0, 0); }
    else {
      ctx.fillStyle = l.hot ? C.ochre : '#FFF8EA'; ctx.fillText(l.ch, 0, 0);
      ctx.save(); ctx.globalAlpha *= .35; ctx.fillStyle = l.hot ? '#F6D38B' : '#FFFFFF'; ctx.beginPath(); ctx.rect(-size, -size, size * 2, size * .78); ctx.clip(); ctx.fillText(l.ch, 0, 0); ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}
function intro_tagline(ctx, t, kOut) {
  const kp = inv(.42, .74, t); if (kp <= 0 || kOut >= .7) return;
  const words = ['Chaux', 'Pouzzolane', 'Silicate', 'Ventilation'], size = 48, y = 650;
  ctx.save(); ctx.globalAlpha *= 1 - smooth(inv(0, .6, kOut));
  ctx.translate(W / 2, y + 90 * easeIn(kOut));
  setFont(ctx, size, FONT.title, 600);
  const ws = words.map(w => ctx.measureText(w).width), sep = 62;
  const total = ws.reduce((a, b) => a + b, 0) + sep * (words.length - 1), pw = total + 90, ph = 84;
  const sx = easeOutBack(kp, 1.3);
  ctx.save(); ctx.scale(sx, 1);
  fillRR(ctx, -pw / 2 + 6, -ph / 2 + 8, pw, ph, ph / 2, 'rgba(60,40,20,.2)');
  fillRR(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2, 'rgba(43,38,35,.92)', C.ink, 4);
  ctx.restore();
  let x = -total / 2;
  words.forEach((w, j) => {
    const k = clamp((t - (.6 + j * .11)) / .3);
    if (k > 0) { ctx.save(); ctx.translate(x + ws[j] / 2, 2); const s = easeOutBack(k, 2); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3); text(ctx, w, 0, 0, { size, font: FONT.title, weight: 600, color: '#FFF4DF' }); ctx.restore(); }
    if (j < words.length - 1 && k > .5) circle(ctx, x + ws[j] + sep / 2, 3, 7, C.ochre);
    x += ws[j] + sep;
  });
  ctx.restore();
}
// low stone wall drawn in at the bottom of the title card
let intro_stonesCache = null;
function intro_getStones() {
  if (intro_stonesCache) return intro_stonesCache;
  const r = rng(41), S = [];
  for (const [row, yc, rh] of [[0, 818, 48], [1, 874, 66], [2, 942, 72], [3, 1016, 72]]) {
    let x = -70 - r() * 90;
    while (x < W + 70) {
      const w = row === 0 ? 170 + r() * 90 : 95 + r() * 125;
      const tint = r() < .45 ? C.stoneLight : r() < .6 ? C.stoneDark : C.sand;
      S.push({ x: x + w / 2, y: yc + (r() - .5) * 6, w: w - 14, h: rh - 14 - (row ? r() * 8 : 0), rot: (r() - .5) * .06, row, seed: S.length + 1,
        col: mixColor(row === 0 ? C.stoneLight : C.stone, tint, r() * .55) });
      x += w;
    }
  }
  return (intro_stonesCache = S);
}
function intro_titleWall(ctx, t, kOut) {
  if (kOut >= 1) return;
  ctx.save(); ctx.translate(0, 330 * easeIn(kOut) + 300 * (1 - easeOut(inv(0, .35, t))));
  ctx.fillStyle = C.mortar; ctx.fillRect(-10, 808, W + 20, 420);
  ctx.fillStyle = 'rgba(120,100,70,.14)'; ctx.fillRect(-10, 808, W + 20, 7);
  for (const s of intro_getStones()) {
    const k = clamp((t - (.12 + (s.x / W) * .5 + (3 - s.row) * .07)) / .3); if (k <= 0) continue;
    const sc = easeOutBack(k, 2);
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(sc, sc); intro_stone(ctx, 0, 0, s.w, s.h, s.seed, s.col); ctx.restore();
  }
  // the wall breathes: soft vapour puffs leave its top
  const kb = smooth(inv(1, 1.6, t)) * (1 - smooth(inv(0, .4, kOut)));
  if (kb > 0) for (let j = 0; j < 9; j++) {
    const u = (t * .42 + hash(j * 5.3)) % 1, x = 110 + j * 212 + Math.sin(u * 4 + j) * 16 + u * 30;
    puff(ctx, x, 790 - u * 240, 12 + u * 30, .6 * Math.sin(u * Math.PI) * kb, '#FFFFFF');
  }
  ctx.restore();
}

// ---------- the world: sky, ground, weather ----------
function intro_sky(ctx, t, wx) {
  const g = ctx.createLinearGradient(0, 0, 0, 880);
  g.addColorStop(0, mixColor('#93C6E6', '#8B9BA8', wx.gloom)); g.addColorStop(1, mixColor('#F7EEDC', '#D2D8DB', wx.gloom));
  ctx.fillStyle = g; ctx.fillRect(-400, -500, W + 800, 1380);
  // sun (hides behind the weather)
  if (wx.sun > .02) { ctx.save(); ctx.globalAlpha *= wx.sun; sun(ctx, 1770, 120, 52, t); ctx.restore(); }
  // clouds (they race during the time-lapse)
  const cc = t * 16 + wx.race * 900;
  for (let i = 0; i < 5; i++) {
    const x = ((i * 520 + cc * (1 + i * .25)) % (W + 600)) - 300;
    cloud(ctx, x, 95 + i * 48 + (i % 2) * 36, 50 + i * 9, mixColor('#FFFFFF', '#AEB8C0', wx.gloom * .9), .92);
  }
}
function intro_ground(ctx, wx) {
  ctx.fillStyle = C.grass; ctx.fillRect(-400, 880, W + 800, 700);
  ground(ctx, 880);
  if (wx.snow > 0) { ctx.fillStyle = `rgba(255,255,255,${.75 * wx.snow})`; ctx.fillRect(-400, 872, W + 800, 700); }
}
// time-lapse weather: two cycles of sun → rain → snow between t0 and t1
function intro_weather(t, t0, t1) {
  const env = windowed(t, t0, t1, .35), race = smooth(inv(t0, t1, t));
  if (env <= 0) return { gloom: 0, rain: 0, snow: 0, sun: 1, race };
  const p = (t - t0) / ((t1 - t0) / 2), u = p - Math.floor(p);
  const w = (a, b, f = .07) => Math.min(smooth(inv(a - f, a + f, u)), 1 - smooth(inv(b - f, b + f, u)));
  const rain = w(.28, .56) * env, snow = w(.6, .9) * env;
  const gloom = Math.max(rain, snow * .7);
  return { gloom, rain, snow, sun: 1 - gloom, race };
}
function intro_rain(ctx, t, k) {
  if (k <= .01) return;
  ctx.save(); ctx.strokeStyle = rgba('#3473AD', .75 * k); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 120; i++) {
    const u = (t * 1.3 + hash(i * 3.3)) % 1, x = hash(i * 7.7) * (W + 320) - u * 280, y = -60 + u * 1000;
    ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 36);
  }
  ctx.stroke(); ctx.restore();
}
function intro_snowfall(ctx, t, k) {
  if (k <= .01) return;
  ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(120,150,170,.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 90; i++) {
    const u = (t * .32 + hash(i * 2.9)) % 1, x = hash(i * 5.1) * W + Math.sin(t * 2 + i) * 22, y = -40 + u * 960;
    ctx.beginPath(); ctx.arc(x, y, 4 + hash(i) * 5, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// ---------- the house and its "renovation" ----------
function intro_roofPath(ctx, B) {
  const rh = B.w * .3; ctx.beginPath();
  ctx.moveTo(B.x - B.w * .05, B.y + 4); ctx.lineTo(B.x + B.w * .12, B.y - rh); ctx.lineTo(B.x + B.w * .88, B.y - rh); ctx.lineTo(B.x + B.w * 1.05, B.y + 4); ctx.closePath();
}
function intro_roller(ctx, x, y, col) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(74, 0); ctx.lineTo(74, 78); ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = '#A9AFB4'; ctx.lineWidth = 6; ctx.stroke();
  fillRR(ctx, 61, 72, 26, 120, 12, C.terracotta, C.ink, 4);
  fillRR(ctx, -22, -100, 44, 200, 18, col, C.ink, 5);
  for (let i = 0; i < 6; i++) line(ctx, -12, -78 + i * 31, 12, -70 + i * 31, 'rgba(150,170,175,.45)', 3);
  ctx.restore();
}
function intro_ite(ctx, k, B) {   // external insulation boards appear on both sides of the façade
  if (k <= 0) return;
  const hh = (B.h + 2) * easeOut(k);
  for (const sx of [B.x - 20, B.x + B.w]) {
    fillRR(ctx, sx, B.gy - hh, 20, hh, 3, '#FBFBF7', C.ink, 3);
    for (let j = 0; j < hh / 26; j++) circle(ctx, sx + 6 + (j % 2) * 8, B.gy - 12 - j * 26, 2.5, 'rgba(120,130,140,.45)');
  }
}
function intro_pvcWindows(ctx, t, t0, B) {
  const ww = B.w * .13, wh = B.w * .19;
  INTRO_WINS.forEach(([u, v], i) => {
    const k = appear(t, t0 + i * .07, .42, easeOutBack); if (k <= 0) return;
    const wx = B.x + B.w * u - ww / 2, wy = B.y + B.h * v, cx = wx + ww / 2, cy = wy + wh / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
    fillRR(ctx, wx - 12, wy - 34, ww + 24, 28, 6, '#FDFEFE', C.ink, 3);                     // roller-shutter box
    line(ctx, wx - 4, wy - 13, wx + ww + 4, wy - 13, 'rgba(120,130,140,.5)', 2);
    fillRR(ctx, wx - 9, wy - 9, ww + 18, wh + 18, 6, '#FDFEFE', C.ink, 4);                   // white PVC frame
    const gl = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh); gl.addColorStop(0, '#A8D0E6'); gl.addColorStop(1, '#5B8BAE');
    fillRR(ctx, wx + 3, wy + 3, ww - 6, wh - 6, 3, gl, rgba(C.ink, .55), 2);
    line(ctx, cx, wy + 2, cx, wy + wh - 2, '#FDFEFE', 8); line(ctx, cx, wy + 2, cx, wy + wh - 2, 'rgba(120,130,140,.5)', 1.5);
    line(ctx, wx + ww * .14, wy + wh * .32, wx + ww * .34, wy + wh * .1, 'rgba(255,255,255,.75)', 5);
    ctx.restore();
  });
}
function intro_house(ctx, t, st) {
  const B = intro_box();
  const common = { t, seed: 3, patina: .3, smoke: !st.noSmoke };
  const lime = Object.assign({}, common, { finish: 'lime', color: INTRO_LIME });
  const plast = Object.assign({}, common, { finish: 'plastic', color: INTRO_PLASTIC, shutters: '#CFD6DA', sparkle: st.sparkle }, st.dmg);
  intro_ite(ctx, st.ite, B);
  if (st.wipe <= 0) house(ctx, B.cx, B.gy, B.w, lime);
  else if (st.wipe >= 1) house(ctx, B.cx, B.gy, B.w, plast);
  else {
    house(ctx, B.cx, B.gy, B.w, lime);
    const ex = lerp(B.x - 30, B.x + B.w + 30, st.wipe);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(B.x - 60, B.y - 10);
    for (let i = 0; i <= 24; i++) ctx.lineTo(ex + 12 * Math.sin(i * 1.9 + t * 3), B.y - 10 + (B.h + 20) * i / 24);
    ctx.lineTo(B.x - 60, B.gy + 10); ctx.closePath(); ctx.clip();
    ctx.beginPath(); ctx.rect(B.x - 3, B.y - 2, B.w + 6, B.h + 6); ctx.clip();
    house(ctx, B.cx, B.gy, B.w, plast);
    ctx.restore();
  }
  // weather on the house: wet lime darkens then dries (it breathes); snow on the roof
  if (st.wet > .01 && st.wipe <= 0) { ctx.fillStyle = `rgba(95,70,40,${.16 * st.wet})`; ctx.fillRect(B.x, B.y, B.w, B.h); }
  if (st.snow > .01) { ctx.save(); intro_roofPath(ctx, B); ctx.fillStyle = `rgba(246,250,253,${.96 * st.snow})`; ctx.fill(); ctx.strokeStyle = rgba('#9DB7C9', st.snow); ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  if (st.win > 0) intro_pvcWindows(ctx, t, st.win, B);
  if (st.wipe > 0 && st.wipe < 1) intro_roller(ctx, lerp(B.x - 30, B.x + B.w + 30, st.wipe), B.y + B.h * (.5 + .34 * Math.sin(t * 8)), INTRO_PLASTIC);
}

// The fully damaged house never changes once the zoom starts: pre-render it at 2.5× for the dive into the wall.
const INTRO_HZ = { sc: 2.5, x0: 195, y0: 200, x1: 1115, y1: 912 };
function intro_zoomHouse(ctx, t, st) {
  const { sc, x0, y0, x1, y1 } = INTRO_HZ, B = intro_box();
  ctx.drawImage(cached('intro|zoomHouse', (x1 - x0) * sc, (y1 - y0) * sc, g => {
    g.scale(sc, sc); g.translate(-x0, -y0); intro_house(g, t, Object.assign({}, st, { noSmoke: true }));
  }), x0, y0, x1 - x0, y1 - y0);
  const chx = B.x + B.w * .72, chy = B.y - B.w * .3 * .75;      // chimney smoke stays alive (same as house())
  for (let i = 0; i < 5; i++) { const k = ((t * .35 + i / 5) % 1); puff(ctx, chx + B.w * .035 + Math.sin(k * 5 + i) * 18 + k * 60, chy - 20 - k * 160, 14 + k * 26, .55 * (1 - k)); }
}

// ---------- overlays ----------
function intro_counter(ctx, x, y, v, k, badgeK) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = easeOutBack(k, 1.8); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3);
  const w = 272, h = 158;
  fillRR(ctx, -w / 2 + 6, -h / 2 + 9, w, h, 20, 'rgba(0,0,0,.16)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 20, C.paper, C.ink, 5);
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 20); ctx.clip(); ctx.fillStyle = C.terracotta; ctx.fillRect(-w / 2, -h / 2, w, 40); ctx.restore();
  line(ctx, -w / 2, -h / 2 + 40, w / 2, -h / 2 + 40, C.ink, 4);
  for (const rx of [-70, 70]) { fillRR(ctx, rx - 7, -h / 2 - 16, 14, 34, 7, '#D9DCDE', C.ink, 3); }
  const sw = 52, sh = 84, gap = 7, y0 = 18;
  for (let p = 0; p < 4; p++) {
    const sx = (1.5 - p) * (sw + gap);           // p = 0 → units (rightmost)
    fillRR(ctx, sx - sw / 2, y0 - sh / 2, sw, sh, 9, C.ink);
    ctx.save(); rr(ctx, sx - sw / 2, y0 - sh / 2, sw, sh, 9); ctx.clip();
    const d = intro_odo(v, p), d0 = Math.floor(d), f = d - d0;
    text(ctx, String(d0 % 10), sx, y0 + 3 - f * sh, { size: 66, font: FONT.title, weight: 700, color: '#FFF4DF' });
    text(ctx, String((d0 + 1) % 10), sx, y0 + 3 + (1 - f) * sh, { size: 66, font: FONT.title, weight: 700, color: '#FFF4DF' });
    const g = ctx.createLinearGradient(0, y0 - sh / 2, 0, y0 + sh / 2); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(.25, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = g; ctx.fillRect(sx - sw / 2, y0 - sh / 2, sw, sh);
    ctx.restore();
  }
  if (badgeK > 0) label(ctx, '+15 ans', w / 2 - 4, -h / 2 - 6, { k: badgeK, size: 38, bg: C.danger, color: '#FFFFFF', rot: .14 });
  ctx.restore();
}
// shiny "modern" badge with a check; `bad` flips it to a grey badge with a red cross
function intro_badge(ctx, s, x, y, k, bad = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y);
  const sc = easeOutBack(k) * (1 + .12 * Math.sin(clamp(bad * 1.6) * Math.PI)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, 38, FONT.title, 600);
  const h = 66, w = ctx.measureText(s).width + h + 40, x0 = -w / 2;
  const b = smooth(clamp(bad * 1.6));
  fillRR(ctx, x0 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.16)');
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, mixColor('#4DBAF2', '#C2BCB4', b)); g.addColorStop(1, mixColor('#2178CC', '#8F877F', b));
  fillRR(ctx, x0, -h / 2, w, h, h / 2, g, C.ink, 4);
  fillRR(ctx, x0 + 16, -h / 2 + 6, w - 32, h * .3, h * .15, 'rgba(255,255,255,.3)');
  const ix = x0 + h / 2 + 2;
  circle(ctx, ix, 0, h / 2 - 9, '#FFFFFF', C.ink, 3);
  if (b > .5) cross(ctx, ix, 0, 22, C.danger, 1); else check(ctx, ix - 1, 2, 30, '#2178CC', 1);
  text(ctx, s, ix + h / 2 + 4, 3, { size: 38, font: FONT.title, weight: 600, color: '#FFFFFF', align: 'left' });
  ctx.restore();
}
function intro_okLabel(ctx, s, x, y, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, 36, FONT.title, 600);
  const h = 62, w = ctx.measureText(s).width + h + 34, x0 = -w / 2;
  fillRR(ctx, x0 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, x0, -h / 2, w, h, h / 2, C.paper, C.ink, 4);
  circle(ctx, x0 + h / 2 + 2, 0, h / 2 - 8, C.good, C.ink, 3); check(ctx, x0 + h / 2 + 1, 2, 26, '#FFFFFF', 1);
  text(ctx, s, x0 + h + 8, 3, { size: 36, font: FONT.title, weight: 600, color: C.ink, align: 'left' });
  ctx.restore();
}
function intro_nameTag(ctx, x, y, k1, k2, kOut) {
  if (k1 <= 0 || kOut >= 1) return;
  ctx.save(); ctx.translate(x - 260 * easeIn(kOut), y); ctx.globalAlpha *= 1 - kOut;
  const s = easeOutBack(k1); ctx.scale(s, s);
  const w = 560, h = 172;
  fillRR(ctx, -w / 2 + 7, -h / 2 + 9, w, h, 24, 'rgba(0,0,0,.16)');
  poly(ctx, [[w / 2 - 4, -26], [w / 2 + 34, 0], [w / 2 - 4, 26]], C.paper, C.ink, 4);
  fillRR(ctx, -w / 2, -h / 2, w, h, 24, C.paper, C.ink, 5);
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 24); ctx.clip(); ctx.fillStyle = C.ochre; ctx.fillRect(-w / 2, -h / 2, 26, h); ctx.restore();
  line(ctx, -w / 2 + 26, -h / 2 + 4, -w / 2 + 26, h / 2 - 4, C.ink, 4);
  text(ctx, 'Margot', -w / 2 + 60, -26, { size: 76, font: FONT.title, weight: 700, color: C.ink, align: 'left' });
  if (k2 > 0) text(ctx, 'maçonne du patrimoine', -w / 2 + 62, 46, { size: 54, font: FONT.hand, weight: 700, color: C.terracotta, align: 'left', alpha: clamp(k2 * 2) });
  ctx.restore();
}
// round inset: the room behind the façade, mould growing in the ceiling corner
function intro_moldInset(ctx, x, y, r, k, mold, tail, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  // pointer toward the house
  const a = Math.atan2(tail[1] - y, tail[0] - x), tl = Math.hypot(tail[0] - x, tail[1] - y);
  poly(ctx, [[Math.cos(a - .28) * r * .9, Math.sin(a - .28) * r * .9], [Math.cos(a) * tl, Math.sin(a) * tl], [Math.cos(a + .28) * r * .9, Math.sin(a + .28) * r * .9]], C.paper, C.ink, 5);
  circle(ctx, 6, 10, r, 'rgba(0,0,0,.18)');
  circle(ctx, 0, 0, r, '#EDE4D3');
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, TAU); ctx.clip();
  const cx = 22, cy = -38;
  poly(ctx, [[-r, -r], [r, -r], [r, cy - 26], [cx, cy], [-r, cy - 44]], '#F4EEE3');           // ceiling
  poly(ctx, [[-r, cy - 44], [cx, cy], [cx, r], [-r, r]], '#E8DCC6');                           // left wall
  poly(ctx, [[cx, cy], [r, cy - 26], [r, r], [cx, r]], '#D6C7AC');                             // right wall
  line(ctx, cx, cy, cx, r, rgba(C.ink, .3), 3); line(ctx, -r, cy - 44, cx, cy, rgba(C.ink, .3), 3); line(ctx, cx, cy, r, cy - 26, rgba(C.ink, .3), 3);
  // window with condensation on the left wall
  fillRR(ctx, -92, -10, 66, 92, 4, '#FDFEFE', C.ink, 3);
  const gl = ctx.createLinearGradient(-88, -6, -30, 78); gl.addColorStop(0, '#B9D3E2'); gl.addColorStop(1, '#8DB0C8');
  fillRR(ctx, -86, -4, 54, 80, 2, gl);
  for (let i = 0; i < 9; i++) { const dx = -80 + hash(i * 3.7) * 42, dy = 4 + ((hash(i * 1.3) * 60 + t * 9 * (.4 + hash(i))) % 66); drop(ctx, dx, dy, 3 + hash(i) * 2.5, 'rgba(255,255,255,.85)'); }
  // mould: a dark fuzzy stain spreading from the ceiling corner, with a damp halo and speckles
  if (mold > 0) {
    blob(ctx, cx - 6, cy + 18, 20 + 80 * mold, 5, .22, 10, `rgba(150,128,80,${.28 * Math.min(1, mold * 2)})`);
    const R = rng(17);
    for (let i = 0; i < 60; i++) {
      const edge = R(), s = Math.pow(R(), 1.4), th = s * .75, jit = (R() - .4) * 22, dark = R() < .7;
      let px, py;
      if (edge < .36) { px = lerp(cx, -r, s * .75); py = lerp(cy, cy - 44, s * .75) + jit; }
      else if (edge < .66) { px = lerp(cx, r, s * .75); py = lerp(cy, cy - 26, s * .75) + jit; }
      else { px = cx + jit * .8; py = cy + s * 120; }
      const g = clamp((mold - th) / .3), rad = (7 + R() * 13) * g * (1.35 - s * .7);
      if (rad > .6) blob(ctx, px, py, rad, i + 3, .35, 8, dark ? 'rgba(30,36,24,.85)' : 'rgba(64,82,44,.8)');
    }
    for (let i = 0; i < 40; i++) { const a = R() * TAU, d = (30 + R() * 70) * mold; circle(ctx, cx + Math.cos(a) * d, cy + 14 + Math.sin(a) * d * .8, 1.5 + R() * 3, `rgba(30,36,24,${.6 * clamp(mold * 2 - R())})`); }
  }
  ctx.restore();
  circle(ctx, 0, 0, r, null, C.ink, 6);
  ctx.restore();
  label(ctx, 'moisissure', x, y - r - 30, { k: clamp(k * 1.2 - .2), size: 34, bg: C.paper });
}
function intro_thought(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 3);
  const s = easeOutBack(k, 2);
  circle(ctx, x + 112, y + 112, 12 * s, '#FFFFFF', C.ink, 4); circle(ctx, x + 82, y + 82, 18 * s, '#FFFFFF', C.ink, 4);
  ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 2.2) * .05);
  blob(ctx, 0, 0, 74, 6, .08, 11, '#FFFFFF', C.ink, 5, t);
  text(ctx, '?', 0, 6, { size: 104, font: FONT.title, weight: 700, color: C.terracotta });
  ctx.restore();
}

// ================================================================================================
scene('intro', (ctx, S) => {
  const t = S.t, T = S.T;
  const L = (i, f) => S.cue(i) + (S.cueEnd(i) - S.cue(i)) * f;   // time at fraction f through line i
  const tEnd = S.cueEnd(5) - .05;                                   // the stone fills the frame
  if (t >= tEnd) { intro_stoneCloseup(ctx, T); return; }

  // ---- timeline (all keyed on narration cues) ----
  const kOut = inv(S.cue(0) - .25, S.cue(0) + .55, t);             // title leaves as Margot arrives
  const tHouse = S.cue(1) - .05, t1880 = L(1, .63);
  const tWipe0 = L(3, .12), tWipe1 = L(3, .4), tIso = L(3, .585), tWin = L(3, .715);
  const tZoom = L(5, .26), tIris = L(5, .62);
  const B = intro_box();

  const wx = intro_weather(t, S.cue(2) + .1, L(2, .97));
  const dk = (a, b) => smooth(inv(L(4, a), L(4, b), t));
  const dmg = { blisters: .85 * dk(.14, .42), peel: .7 * dk(.34, .95), moisture: .85 * dk(.37, .62), salt: .7 * dk(.45, .82),
    algae: .65 * dk(.18, 1), cracks: .75 * dk(.5, 1), dirt: .55 * dk(0, 1), faded: .3 * dk(0, 1) };
  const st = { wipe: inv(tWipe0, tWipe1, t), ite: appear(t, tIso, .7, ease), win: t >= tWin ? tWin : 0,
    sparkle: windowed(t, tWipe1, S.cue(4) + .2, .3) * .9, wet: wx.rain, snow: wx.snow, dmg };

  // ---- camera: slow push-in over the house beats, then the dive into the wall ----
  const kz = inv(tZoom, tEnd, t), z = (1 + .025 * smooth(inv(S.cue(1), S.cue(5), t))) * lerp(1, 6.2, easeIn(kz));
  const F = INTRO_FOCUS, A = [lerp(F[0], W / 2, smooth(kz)), lerp(F[1], H / 2 + 20, smooth(kz))];
  // the paint tears open on the stone wall: ragged iris around the focus point
  const kI = inv(tIris, tEnd, t), R = 1260 * ease(kI) + 10, pts = [];
  if (kI > 0) for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, rr2 = R * (1 + .05 * noise(i * .55 + 3)) + 22 * (hash(i * 1.7 + 3) - .5); pts.push([A[0] + Math.cos(a) * rr2, A[1] + Math.sin(a) * rr2]); }
  const irisPath = () => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); };
  const covered = kI > 0 && R * .95 - 12 > Math.hypot(Math.max(A[0], W - A[0]), Math.max(A[1], H - A[1]));
  if (!covered) {
    ctx.save();
    if (kI > 0) { ctx.beginPath(); ctx.rect(0, 0, W, H); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.clip('evenodd'); }
    ctx.translate(A[0], A[1]); ctx.scale(z, z); ctx.translate(-F[0], -F[1]);
    intro_sky(ctx, t, wx);
    intro_ground(ctx, wx);
    const kh = appear(t, tHouse, .85, k => easeOutBack(k, 1.5));
    if (t >= tZoom) intro_zoomHouse(ctx, t, st);
    else if (kh > 0) {
      // house rises out of the ground
      ctx.save();
      ctx.beginPath(); ctx.rect(-400, -600, W + 800, B.gy + 26 + 600); ctx.clip();
      ctx.translate(0, (1 - kh) * 760);
      intro_house(ctx, t, st);
      ctx.restore();
      // dust where it breaks through
      const kd = inv(tHouse + .1, tHouse + 1.1, t);
      if (kd > 0 && kd < 1) for (let i = 0; i < 9; i++) puff(ctx, B.x - 30 + i * (B.w + 60) / 8 + Math.sin(i) * 20, B.gy - 10 - kd * 40 * hash(i), 20 + kd * 40, .55 * (1 - kd), '#E9E0CF');
    }
    intro_rain(ctx, t, wx.rain);
    intro_snowfall(ctx, t, wx.snow);
    intro_titleWall(ctx, t, kOut);
    ctx.restore();
  }
  if (kI > 0) {
    ctx.save(); irisPath(); ctx.clip();
    intro_stoneCloseup(ctx, T);
    irisPath(); ctx.strokeStyle = 'rgba(40,28,18,.4)'; ctx.lineWidth = 34; ctx.stroke();
    ctx.restore();
    if (!covered) { ctx.save(); irisPath(); ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = INTRO_PLASTIC; ctx.lineWidth = 14; ctx.stroke(); ctx.restore(); }
  }

  // ---- title card overlays ----
  intro_title(ctx, t, kOut);
  intro_tagline(ctx, t, kOut);

  // ---- name tag ----
  intro_nameTag(ctx, 660, 560, appear(t, L(0, .22), .5), appear(t, L(0, .52), .4), inv(S.cue(1) - .5, S.cue(1) - .05, t));

  // ---- year counter: 1880 → a century of weather → 1990 → +15 ans → 2005 ----
  const vYear = 1880 + 110 * ease(inv(S.cue(2) + .15, L(2, .82), t)) + 15 * ease(inv(S.cue(4) + .15, L(4, .2), t));
  const fadeHouseUI = 1 - smooth(inv(S.cue(5) - .1, S.cue(5) + .4, t));
  intro_counter(ctx, 1240, 205, vYear, appear(t, t1880, .5) * fadeHouseUI, appear(t, S.cue(4), .5));
  intro_okLabel(ctx, 'aucun gros problème', 1300, 350, appear(t, L(2, .56), .45) * (1 - smooth(inv(S.cue(3) - .1, S.cue(3) + .3, t))));

  // ---- the "renovation" checklist, flipping to ✘ as the damage appears ----
  const bx = 1340;
  intro_badge(ctx, 'Peinture plastique', bx, 362, appear(t, L(3, .34), .45) * fadeHouseUI, inv(L(4, .16), L(4, .3), t));
  intro_badge(ctx, 'Isolant', bx, 446, appear(t, tIso, .45) * fadeHouseUI, inv(L(4, .36), L(4, .5), t));
  intro_badge(ctx, 'Fenêtres étanches', bx, 530, appear(t, tWin, .45) * fadeHouseUI, inv(L(4, .6), L(4, .72), t));

  // ---- inside: mould (inset pointing at the upper-left window) ----
  const winTL = [B.x + B.w * .2 - B.w * .065 + 8, B.y + B.h * .14 + 8];
  intro_moldInset(ctx, 178, 300, 150, appear(t, L(4, .6), .5) * fadeHouseUI, inv(L(4, .64), S.cueEnd(4) + .4, t), winTL, t);

  // ---- Margot ----
  const tIn = S.cue(0) - .15, xIn = lerp(2150, 1180, smooth(inv(tIn, tIn + 1.2, t)));
  const xMove = lerp(0, 500, smooth(inv(S.cue(1) - .55, S.cue(1) + .25, t)));
  const xExit = 700 * easeIn(inv(L(5, .86), tEnd - .1, t));
  const mx = xIn + xMove + xExit;
  const hop = t < tIn + 1.2 ? clamp((t - tIn) / 1.2) * 3 : (t > S.cue(1) - .55 && t < S.cue(1) + .25) ? (t - (S.cue(1) - .55)) / .8 * 2 : 0;
  const pose = poseAt(t, [[0, 'idle'], [S.cue(0), 'wave'], [L(0, .55), 'explain'], [S.cue(1) + .15, 'pointL'], [t1880, 'explain'],
    [S.cue(2), 'open'], [L(2, .55), 'explain'], [S.cue(3), 'pointL'], [L(3, .34), 'count'], [L(3, .9), 'shrug'],
    [S.cue(4), 'pointL'], [L(4, .6), 'open'], [S.cue(5), 'think'], [L(5, .45), 'pointL']]);
  if (t > S.cue(0) && t < L(0, .6)) { const wv = Math.sin(t * 10) * smooth(inv(S.cue(0) + .1, S.cue(0) + .4, t)) * (1 - smooth(inv(L(0, .45), L(0, .6), t))); pose.R = [pose.R[0] + wv * 10, pose.R[1] + wv * 22]; }
  const expr = t < S.cue(3) ? 'happy' : t < L(3, .3) ? 'wink' : t < L(3, .9) ? 'happy' : t < S.cue(4) ? 'serious' : t < L(5, .45) ? 'worried' : 'serious';
  const look = (t > S.cue(1) && t < S.cue(2)) || (t > S.cue(3) && t < L(3, .3)) || t > S.cue(4) ? -.8 : 0;
  if (mx < 2100) presenter(ctx, { x: mx, y: 1000, s: .95, pose, T, look, expr, bounce: hop });
  intro_thought(ctx, mx - 230, 300, appear(t, S.cue(5) + .05, .45) * (1 - smooth(inv(L(5, .42), L(5, .5), t))), t);
});

// 09_vieillir.js — Chapitre 8 « Comment vieilliront nos façades ? »
// Écran partagé : à gauche la rénovation plastique, à droite la rénovation minérale.
// Une « machine à remonter le temps » (compteur en haut au centre) fait des bonds
// Livraison → +10 → +25 → +50 ans ; les saisons défilent pendant les sauts
// et chaque façade vieillit à sa manière (house() : tous les paramètres de dégâts sont animés).
'use strict';

const VIEIL = { gy: 890, w: 580, lx: 480, rx: 1440, seed: 3, plastic: '#F0C468', lime: '#E2B97E', shutters: '#6F8F8A' };

// été, automne, hiver, printemps
const VIEIL_SEASONS = [
  { top: '#86C1E6', bot: '#E6F3F8', grass: '#8DB86B', dark: '#6E9A4F', cloud: '#FFFFFF', sun: 1, rain: 0, snow: 0, leaves: 0, flowers: 0 },
  { top: '#7D8C9A', bot: '#CBD2D7', grass: '#A9A55C', dark: '#86803F', cloud: '#B5BEC6', sun: 0, rain: 1, snow: 0, leaves: 1, flowers: 0 },
  { top: '#A7B8C6', bot: '#EEF2F6', grass: '#F2F5F8', dark: '#C9D4DE', cloud: '#E2E8ED', sun: .2, rain: 0, snow: 1, leaves: 0, flowers: 0 },
  { top: '#93CBEA', bot: '#EEF8EC', grass: '#97C96E', dark: '#73A452', cloud: '#FFFFFF', sun: .85, rain: 0, snow: 0, leaves: 0, flowers: 1 },
];

// ---------- small timing helpers ----------
function vieil_keyed(t, keys, blend = .45) {           // numeric value keyed in time, smoothly blended
  let cur = keys[0][1], prev = cur, t0 = -1e9;
  for (const [kt, v] of keys) if (t >= kt) { prev = cur; cur = v; t0 = kt; }
  return lerp(prev, cur, ease(inv(t0, t0 + blend, t)));
}
function vieil_step(t, keys) { let v = keys[0][1]; for (const [kt, x] of keys) if (t >= kt) v = x; return v; }
const vieil_q = (v, n = 50) => Math.round(v * n) / n;  // quantise (keeps limeTexture cache small)

// time machine: years shown, season phase, jump intensity, clock spin
function vieil_time(S) {
  const t = S.t;
  const J = [
    { t0: S.cue(2) - .15, d: 2.6, from: 0, to: 10 },
    { t0: S.cue(4) - .15, d: 2.6, from: 10, to: 25 },
    { t0: S.cue(7) - .15, d: 2.6, from: 25, to: 50 },
  ];
  const tw = S.cue(0) + .15;                          // opening whoosh
  let years = 0, phase = 0, jk = 0, spin = 0, rush = 0, hop = 0;
  for (const j of J) {
    const k = inv(j.t0, j.t0 + j.d, t);
    if (t >= j.t0) years = lerp(j.from, j.to, ease(k));
    phase += 2 * smooth(k); rush += smooth(k);
    jk = Math.max(jk, Math.sin(Math.PI * k));
    spin += 6 * ease(k);
    const kh = inv(j.t0, j.t0 + .6, t); if (kh > 0 && kh < 1) hop = kh;
  }
  const kw = inv(tw, tw + 1.8, t);
  jk = Math.max(jk, .85 * Math.sin(Math.PI * kw)); spin += 2 * ease(kw);
  return { J, tw, years, phase, jk, spin, rush, hop };
}

function vieil_weather(S, tm) {
  const p = tm.phase * 4, i = Math.floor(p), f = p - i;
  const b = smooth((f - .45) / .55);
  const A = VIEIL_SEASONS[i % 4], B = VIEIL_SEASONS[(i + 1) % 4];
  const m = k => lerp(A[k], B[k], b), mc = k => mixColor(A[k], B[k], b);
  const wx = { top: mc('top'), bot: mc('bot'), grass: mc('grass'), dark: mc('dark'), cloud: mc('cloud'), sun: m('sun'), rain: m('rain'), snow: m('snow'), leaves: m('leaves'), flowers: m('flowers') };
  // a shower during "l'eau s'infiltre et reste piégée"
  const sh = windowed(S.t, S.cue(4) + 2.6, S.cueEnd(4) - 1.1, .8);
  if (sh > 0) {
    wx.rain = Math.max(wx.rain, sh * .9); wx.sun *= 1 - sh;
    wx.top = mixColor(wx.top, '#8795A2', sh * .75); wx.bot = mixColor(wx.bot, '#CED5DA', sh * .75); wx.cloud = mixColor(wx.cloud, '#BFC7CE', sh * .75);
  }
  wx.shower = sh;
  return wx;
}

// ---------- background ----------
function vieil_sky(ctx, t, wx, tm) {
  const g = ctx.createLinearGradient(0, -60, 0, VIEIL.gy);
  g.addColorStop(0, wx.top); g.addColorStop(1, wx.bot);
  ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, VIEIL.gy + 100);
  if (wx.sun > .01) { ctx.save(); ctx.globalAlpha *= wx.sun; sun(ctx, 1808, 106, 44, t); ctx.restore(); }
  const shift = t * 18 + tm.rush * 1300;              // clouds rush by during time jumps
  for (let i = 0; i < 6; i++) {
    const x = ((i * 430 + shift * (.8 + i * .12)) % (W + 520)) - 260, y = 112 + (i % 3) * 62 + (i * 37) % 40;
    cloud(ctx, x, y, 46 + (i % 3) * 12, wx.cloud, .92);
  }
}
function vieil_ground(ctx, wx, t) {
  ctx.fillStyle = wx.grass; ctx.fillRect(-100, VIEIL.gy, W + 200, H - VIEIL.gy + 100);
  ctx.fillStyle = wx.dark; ctx.fillRect(-100, VIEIL.gy, W + 200, 9);
  for (let i = 0; i < 46; i++) {
    const x = hash(i * 3.17 + 1) * W;
    line(ctx, x, VIEIL.gy + 4, x - 6, VIEIL.gy - 13, wx.dark, 4); line(ctx, x + 6, VIEIL.gy + 4, x + 10, VIEIL.gy - 10, wx.dark, 4);
  }
  if (wx.flowers > .02) {
    ctx.save(); ctx.globalAlpha *= wx.flowers;
    for (let i = 0; i < 30; i++) { const x = hash(i * 7.3 + 2) * W, y = VIEIL.gy + 20 + hash(i * 1.9) * 60; circle(ctx, x, y, 6, ['#F6E27A', '#F3A6B8', '#FFFFFF'][i % 3], null); circle(ctx, x, y, 2.5, '#E7943A', null); }
    ctx.restore();
  }
}
function vieil_roofSnow(ctx, cx, w, a) {
  if (a <= .01) return;
  const h = w * .62, x = cx - w / 2, y = VIEIL.gy - h, rh = w * .3;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.moveTo(x - w * .05, y + 4); ctx.lineTo(x + w * .12, y - rh); ctx.lineTo(x + w * .88, y - rh); ctx.lineTo(x + w * 1.05, y + 4); ctx.closePath(); ctx.save(); ctx.clip();
  ctx.beginPath(); ctx.moveTo(x - w * .1, y - rh - 20);
  for (let i = 0; i <= 24; i++) { const u = i / 24; ctx.lineTo(x - w * .1 + u * w * 1.2, y - rh + rh * .42 + Math.sin(i * 1.7) * 8 + (Math.abs(u - .5) * rh * .5)); }
  ctx.lineTo(x + w * 1.1, y - rh - 20); ctx.closePath(); ctx.fillStyle = '#FAFCFE'; ctx.fill(); ctx.restore();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * .05, y + 2); ctx.lineTo(x + w * .12, y - rh - 4); ctx.lineTo(x + w * .88, y - rh - 4); ctx.lineTo(x + w * 1.05, y + 2);
  ctx.strokeStyle = '#FAFCFE'; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = 'rgba(120,140,160,.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function vieil_precip(ctx, t, wx) {
  if (wx.rain > .02) {
    ctx.save(); ctx.strokeStyle = `rgba(70,120,175,${.5 * wx.rain})`; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 140; i++) {
      const sp = 1250 + hash(i * 1.7) * 500, x0 = hash(i * 3.3) * (W + 300) - 100;
      const y = ((t * sp + hash(i * 5.1) * 1000) % 1000) - 60, x = x0 - y * .16;
      ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 32);
    }
    ctx.stroke(); ctx.restore();
  }
  if (wx.snow > .02) {
    ctx.save(); ctx.globalAlpha *= wx.snow;
    for (let i = 0; i < 120; i++) {
      const sp = 60 + hash(i * 2.3) * 70, r = 3 + hash(i * 4.1) * 5;
      const y = ((t * sp + hash(i * 6.7) * 980) % 980) - 40, x = hash(i * 8.9) * W + Math.sin(t * 1.3 + i) * 22;
      circle(ctx, x, y, r, '#FFFFFF', 'rgba(110,130,150,.45)', 1.5);
    }
    ctx.restore();
  }
  if (wx.leaves > .02) {
    ctx.save(); ctx.globalAlpha *= wx.leaves;
    for (let i = 0; i < 16; i++) {
      const u = (t * (.18 + hash(i) * .12) + hash(i * 3.7)) % 1, x = -60 + u * (W + 120), y = 140 + hash(i * 5.5) * 640 + Math.sin(u * 12 + i) * 40 + u * 120;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ellipse(ctx, 0, 0, 13, 6, ['#D9822B', '#C8643B', '#E0A63A'][i % 3], 'rgba(60,40,20,.5)', 2); ctx.restore();
    }
    ctx.restore();
  }
}

// ---------- façade helpers ----------
// wall rectangle with holes for windows (+ shutters, sills) and the door → clip('evenodd')
function vieil_wallPath(ctx, cx, w) {
  const h = w * .62, x = cx - w / 2, y = VIEIL.gy - h, ww = w * .13, wh = w * .19;
  ctx.beginPath(); ctx.rect(x, y, w, h);
  for (const [u, v] of [[.2, .14], [.5, .14], [.8, .14], [.2, .56], [.8, .56]]) { const wx = x + w * u - ww / 2, wy = y + h * v; ctx.rect(wx - ww * .52, wy - 8, ww * 2.04, wh + 28); }
  const dw = w * .14, dh = h * .38; ctx.rect(cx - dw / 2 - 12, VIEIL.gy - dh - 12, dw + 24, dh + 12);
}
// mineral weathering overlay (mottling, run-off under sills, exposed sand grains) — cached
function vieil_weathering(ctx, cx, w, a) {
  if (a <= .01) return;
  const h = Math.ceil(w * .62), x = cx - w / 2, y = VIEIL.gy - w * .62;
  const tex = cached(`vieil_weather|${w}`, w, h, g => {
    const r = rng(17);
    for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(${r() < .5 ? '112,90,60' : '138,126,104'},${.09 + r() * .09})`; g.beginPath(); g.ellipse(r() * w, r() * h, 16 + r() * 70, 10 + r() * 40, r() * 3, 0, TAU); g.fill(); }
    for (const [u, v] of [[.2, .14], [.5, .14], [.8, .14], [.2, .56], [.8, .56]]) {
      const sy = h * v + w * .19 + 18;
      for (let k = 0; k < 5; k++) { const xx = w * u - w * .07 + r() * w * .14, len = h * (.1 + r() * .22); const gr = g.createLinearGradient(0, sy, 0, sy + len); gr.addColorStop(0, 'rgba(100,78,52,.42)'); gr.addColorStop(1, 'rgba(100,78,52,0)'); g.fillStyle = gr; g.fillRect(xx, sy, 4 + r() * 8, len); }
    }
    let gr = g.createLinearGradient(0, 0, 0, h * .2); gr.addColorStop(0, 'rgba(98,80,56,.4)'); gr.addColorStop(1, 'rgba(98,80,56,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h * .2);
    gr = g.createLinearGradient(0, h * .78, 0, h); gr.addColorStop(0, 'rgba(98,80,56,0)'); gr.addColorStop(1, 'rgba(98,80,56,.36)'); g.fillStyle = gr; g.fillRect(0, h * .78, w, h * .22);
    for (let i = 0; i < 1100; i++) { g.fillStyle = r() < .6 ? 'rgba(140,108,70,.5)' : 'rgba(255,250,240,.55)'; const s = 1.5 + r() * 2.5; g.fillRect(r() * w, r() * h, s, s); }
  });
  ctx.save(); vieil_wallPath(ctx, cx, w); ctx.clip('evenodd'); ctx.globalAlpha *= a; ctx.drawImage(tex, x, y); ctx.restore();
}
// crack heads exactly as house() places them (same rng sequence)
function vieil_crackHeads(cx, w, seed) {
  const h = w * .62, x = cx - w / 2, y = VIEIL.gy - h, r = rng(seed + 20), out = [];
  for (let i = 0; i < 7; i++) { const a = x + w * (.08 + r() * .84), b = y + h * (r() * .5), len = h * (.25 + r() * .3); out.push([a, b, len]); }
  return out;
}

// left: rain gets in through micro-cracks and stays trapped (dark wet blotches behind the film)
function vieil_waterLeft(ctx, S, wx, L) {
  const t = S.t, a = wx.shower; if (a <= .01 && L.trapped <= .01) return;
  const heads = vieil_crackHeads(VIEIL.lx, VIEIL.w, VIEIL.seed), h = VIEIL.w * .62, x0 = VIEIL.lx - VIEIL.w / 2, y0 = VIEIL.gy - h;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, VIEIL.w, h); ctx.clip();
  heads.forEach(([x, y, len], i) => {
    const k = clamp(L.trapped * 1.3 - i * .06); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= .6 * k; blob(ctx, x + 4, y + len * .55, 14 + 18 * k, i + 3, .3, 9, 'rgba(40,72,108,.6)'); ctx.restore();
  });
  if (a > .01) heads.forEach(([x, y, len], i) => {
    for (let j = 0; j < 2; j++) {
      const u = (t / 1.5 + hash(i * 7 + j * 3)) % 1;
      if (u < .35) { const k = u / .35; drop(ctx, x + 2, lerp(y - 90, y, easeIn(k)), 10, C.water, C.ink, a); }
      else { const k = (u - .35) / .65; drop(ctx, x + 2 + Math.sin(k * 6) * 3, y + k * len * .6, 10 * (1 - k * .6), mixColor(C.water, '#2C4F70', k), null, a * (1 - k)); }
    }
  });
  ctx.restore();
}
// right: the same rain wets the lime, then simply dries out as vapour
function vieil_waterRight(ctx, S, wx) {
  const t = S.t, a = wx.shower; if (a <= .01) return;
  const h = VIEIL.w * .62, x0 = VIEIL.rx - VIEIL.w / 2, y0 = VIEIL.gy - h;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - 200, VIEIL.w, h + 200); ctx.clip();
  for (let i = 0; i < 8; i++) {
    const px = x0 + VIEIL.w * (.08 + hash(i * 3.3 + 1) * .84), py = y0 + h * (.12 + hash(i * 5.1) * .62);
    const u = (t / 1.7 + hash(i * 9.1)) % 1;
    if (u < .3) { if (py - 90 + u / .3 * 90 > y0) drop(ctx, px, lerp(py - 90, py, easeIn(u / .3)), 10, C.water, C.ink, a); }
    else { const k = (u - .3) / .7; puff(ctx, px + k * 24, py - k * 90, 12 + k * 22, .85 * a * Math.sin(Math.PI * Math.min(1, k * 1.2)), '#FFFFFF'); }
  }
  ctx.restore();
}
// house drawn without the sill run-off spilling into the grass (clip at ground level) + its ground shadow
function vieil_house(ctx, cx, o) {
  ctx.save(); ctx.beginPath(); ctx.rect(-200, VIEIL.gy + 3, W + 400, 200); ctx.clip(); ellipse(ctx, cx, VIEIL.gy + 6, VIEIL.w * .58, 18, 'rgba(0,0,0,.18)'); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(-200, -300, W + 400, VIEIL.gy + 303); ctx.clip(); house(ctx, cx, VIEIL.gy, VIEIL.w, o); ctx.restore();
}

// ---------- props ----------
function vieil_badgeOK(ctx, x, y, kin, kout, t) {
  const k = kin * kout; if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4) * 3); const sc = easeOutBack(clamp(kin * 1.4)) * easeOut(kout); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kout * 2);
  circle(ctx, 5, 8, 50, 'rgba(0,0,0,.18)'); circle(ctx, 0, 0, 50, C.good, '#FFFFFF', 7); circle(ctx, 0, 0, 54, null, C.ink, 4);
  check(ctx, 2, 2, 52, '#FFFFFF', clamp((kin - .3) / .7));
  ctx.restore();
}
function vieil_tag(ctx, s, x, y, t, t0, t1, o = {}) {
  const k = appear(t, t0, .55) * (1 - appear(t, t1, .35));
  label(ctx, s, x, y, Object.assign({ k, size: 34 }, o));
}
function vieil_scaffold(ctx, k, a) {
  if (k <= 0 || a <= 0) return;
  const gy = VIEIL.gy, x0 = VIEIL.lx - VIEIL.w / 2 - 26, x1 = VIEIL.lx + VIEIL.w / 2 + 26, top = gy - VIEIL.w * .62 - 26;
  const hh = (gy - top + 30) * easeOut(k);
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.rect(x0 - 60, gy + 12 - hh, x1 - x0 + 120, hh + 10); ctx.clip();
  const n = 5, levels = [gy - 128, gy - 252, top + 14];
  const px = i => lerp(x0, x1, i / (n - 1));
  // braces
  for (let i = 0; i < n - 1; i++) { const b0 = i % 2 ? gy : levels[0], b1 = i % 2 ? levels[1] : levels[2]; line(ctx, px(i), b0, px(i + 1), b1, 'rgba(85,96,107,.85)', 5); }
  for (let i = 0; i < n; i++) fillRR(ctx, px(i) - 7, top - 30, 14, gy - top + 34, 4, '#A7B0B7', C.ink, 3);
  // guard rail
  line(ctx, x0 - 14, top - 24, x1 + 14, top - 24, '#A7B0B7', 7);
  for (const ly of levels) { fillRR(ctx, x0 - 18, ly, x1 - x0 + 36, 16, 4, C.wood, C.ink, 3); line(ctx, x0 - 10, ly + 8, x1 + 10, ly + 8, 'rgba(110,74,45,.6)', 2); }
  ctx.restore();
}
function vieil_scraper(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.translate(6, 9); poly(ctx, [[-16, -28], [16, -28], [42, 34], [-42, 34]], 'rgba(0,0,0,.18)'); ctx.restore();
  fillRR(ctx, -15, -118, 30, 78, 12, C.wood, C.ink, 4);
  line(ctx, -6, -108, -6, -54, 'rgba(255,255,255,.35)', 4);
  fillRR(ctx, -19, -46, 38, 18, 4, '#B9C0C6', C.ink, 3);
  poly(ctx, [[-16, -28], [16, -28], [42, 34], [-42, 34]], '#D8DDE1', C.ink, 4);
  line(ctx, -30, 20, 30, 20, 'rgba(255,255,255,.75)', 3);
  ctx.restore();
}
function vieil_priceTag(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2.3) * .07 + (1 - clamp(k * 1.5)) * .5);
  line(ctx, 0, -96, 0, -66, C.ink, 3);
  const sc = easeOutBack(clamp(k * 1.3)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  const P = [[0, -78], [80, -40], [80, 62], [-80, 62], [-80, -40]];
  ctx.save(); ctx.translate(7, 9); poly(ctx, P, 'rgba(0,0,0,.2)'); ctx.restore();
  poly(ctx, P, C.danger, C.ink, 5);
  circle(ctx, 0, -48, 9, C.paper, C.ink, 3);
  text(ctx, '€€€', 0, 14, { size: 62, font: FONT.title, weight: 700, color: '#FFFFFF' });
  ctx.restore();
}
function vieil_bag(ctx, x, y, s, k, seed, color) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(clamp(k * 1.3)) * s; ctx.scale(sc, sc);
  ellipse(ctx, 0, 0, 52, 10, 'rgba(0,0,0,.2)');
  blob(ctx, 0, -42, 48, seed, .1, 10, color, C.ink, 4);
  poly(ctx, [[-14, -84], [-24, -104], [-4, -94], [0, -86], [4, -94], [24, -104], [14, -84]], color, C.ink, 3);
  ellipse(ctx, -18, -58, 9, 18, 'rgba(255,255,255,.22)', null, 0, .4);
  line(ctx, -26, -24, -8, -12, 'rgba(255,255,255,.18)', 4);
  ctx.restore();
}
function vieil_sadHeart(ctx, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.8) * 4); ctx.rotate(Math.sin(t * 1.2) * .05);
  const sc = easeOutBack(clamp(k * 1.3)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  const P = () => { ctx.beginPath(); ctx.moveTo(0, 56); ctx.bezierCurveTo(-76, 8, -66, -56, -32, -56); ctx.bezierCurveTo(-14, -57, -3, -46, 0, -32); ctx.bezierCurveTo(3, -46, 14, -57, 32, -56); ctx.bezierCurveTo(66, -56, 76, 8, 0, 56); ctx.closePath(); };
  ctx.save(); ctx.translate(6, 8); P(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fill(); ctx.restore();
  P(); ctx.fillStyle = '#C95256'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); P(); ctx.clip(); ellipse(ctx, -30, -34, 14, 9, 'rgba(255,255,255,.35)', null, 0, -.5); ctx.restore();
  // crack
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(-7, -16); ctx.lineTo(5, -4); ctx.lineTo(-3, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  // sad face
  for (const sd of [-1, 1]) { circle(ctx, sd * 24, -6, 5.5, C.ink); line(ctx, sd * 33, -17, sd * 15, -26, C.ink, 4); }
  ctx.beginPath(); ctx.arc(0, 32, 14, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = C.ink; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.stroke();
  drop(ctx, 34, 8 + ((t * .9) % 1) * 30, 6, C.waterLight, C.ink, 1 - ((t * .9) % 1));
  ctx.restore();
}
function vieil_valueTag(ctx, x, y, k, t) {
  if (k <= 0) return;
  const rise = easeOut(clamp(k * 1.2));
  ctx.save(); ctx.translate(x, y + (1 - rise) * 60 + Math.sin(t * 2) * 4);
  const sc = easeOutBack(clamp(k * 1.4)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  // up arrow behind
  arrow(ctx, 0, -10, 0, -116, { color: C.good, lw: 14, head: 32, k: clamp(k * 1.5 - .2) });
  const P = [[0, -64], [68, -34], [68, 58], [-68, 58], [-68, -34]];
  ctx.save(); ctx.translate(7, 9); poly(ctx, P, 'rgba(0,0,0,.2)'); ctx.restore();
  poly(ctx, P, C.good, C.ink, 5); circle(ctx, 0, -38, 8, C.paper, C.ink, 3);
  text(ctx, '+ de', 0, -4, { size: 30, font: FONT.title, weight: 700, color: '#FFFFFF' });
  text(ctx, 'valeur', 0, 34, { size: 34, font: FONT.title, weight: 700, color: '#FFFFFF' });
  ctx.restore();
  // little sparkles
  for (let i = 0; i < 4; i++) { const u = (t * .8 + i / 4) % 1; ctx.save(); ctx.globalAlpha *= k * Math.sin(u * Math.PI); ctx.translate(x + Math.cos(i * 2.1) * 82, y - 30 + Math.sin(i * 1.7) * 60 - u * 30); ctx.rotate(u * 2); poly(ctx, [[0, -12], [3, -3], [12, 0], [3, 3], [0, 12], [-3, 3], [-12, 0], [-3, -3]], '#FFE9A8', C.ochreDark, 2); ctx.restore(); }
}
function vieil_brush(ctx, x, y, rot, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.translate(7, 9); fillRR(ctx, -64, -30, 128, 50, 10, 'rgba(0,0,0,.18)'); ctx.restore();
  fillRR(ctx, -14, -150, 28, 112, 12, C.wood, C.ink, 4);
  fillRR(ctx, -50, -46, 100, 26, 6, '#B9C0C6', C.ink, 4);
  fillRR(ctx, -62, -24, 124, 46, [4, 4, 14, 14], '#E9DCC0', C.ink, 4);
  for (let i = -50; i <= 50; i += 12) line(ctx, i, -16, i + 2, 16, 'rgba(120,95,60,.45)', 2);
  fillRR(ctx, -60, 8, 120, 16, [0, 0, 12, 12], '#FBF7EF', null);
  ctx.restore();
}
// two-line verdict stamp
function vieil_stamp(ctx, l1, l2, x, y, k, color, rot) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = lerp(2.1, 1, easeOut(k)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.2);
  setFont(ctx, 84, FONT.title, 700); const w2 = ctx.measureText(l2).width; setFont(ctx, 42, FONT.title, 600); const w1 = ctx.measureText(l1).width;
  const w = Math.max(w1, w2) + 76, h = 196;
  fillRR(ctx, -w / 2 + 8, -h / 2 + 10, w, h, 22, 'rgba(0,0,0,.2)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 22, 'rgba(251,246,238,.95)', color, 9);
  rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 14); ctx.strokeStyle = rgba(color, .55); ctx.lineWidth = 3; ctx.stroke();
  text(ctx, l1, 0, -46, { size: 42, font: FONT.title, weight: 600, color });
  text(ctx, l2, 0, 30, { size: 84, font: FONT.title, weight: 700, color });
  ctx.restore();
}

// ---------- UI: time machine panel & headers ----------
function vieil_clock(ctx, x, y, r, tm, t) {
  if (tm.jk > .01) {
    for (let i = 0; i < 3; i++) {
      const rr2 = r + 13 + i * 11, a0 = t * (7 + i * 2.5) * (i % 2 ? -1 : 1) + i;
      ctx.save(); ctx.globalAlpha *= tm.jk * (.85 - i * .2); ctx.strokeStyle = i === 1 ? C.terracotta : C.ochre; ctx.lineWidth = 6 - i; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, y, rr2, a0, a0 + 1.7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, rr2, a0 + Math.PI, a0 + Math.PI + 1.1); ctx.stroke(); ctx.restore();
    }
  }
  circle(ctx, x, y, r, '#FFFFFF', C.ink, 5);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .74, x + Math.cos(a) * r * .88, y + Math.sin(a) * r * .88, C.ink, i % 3 ? 3 : 5); }
  const am = tm.spin * TAU + t * .3 - Math.PI / 2, ah = am / 12 + 1.1;
  line(ctx, x, y, x + Math.cos(ah) * r * .45, y + Math.sin(ah) * r * .45, C.ink, 7);
  line(ctx, x, y, x + Math.cos(am) * r * .7, y + Math.sin(am) * r * .7, C.terracotta, 5);
  circle(ctx, x, y, 6, C.ink);
}
const vieil_label = n => n <= 0 ? 'Livraison' : `+${n} an${n > 1 ? 's' : ''}`;
function vieil_trackU(y) { return y <= 10 ? y / 30 : y <= 25 ? 1 / 3 + (y - 10) / 45 : 2 / 3 + (y - 25) / 75; }
function vieil_panel(ctx, S, tm) {
  const t = S.t, kIn = inv(tm.tw - .05, tm.tw + .6, t); if (kIn <= 0) return;
  const cx = 960, cy = 100, w = 560, h = 172;
  // shock-wave rings (time warp) at the whoosh and at every jump
  for (const ts of [tm.tw, ...tm.J.map(j => j.t0)]) {
    const e = inv(ts, ts + 1.3, t); if (e <= 0 || e >= 1) continue;
    const r = 70 + easeOut(e) * 1500;
    ctx.save(); ctx.globalAlpha = .5 * (1 - e); circle(ctx, cx - 196, cy, r, null, '#FFFFFF', 18 * (1 - e) + 2); circle(ctx, cx - 196, cy, r * .94, null, C.ochre, 6 * (1 - e) + 1); ctx.restore();
  }
  ctx.save();
  const sc = easeOutBack(kIn, 2) * (1 + .02 * tm.jk * Math.sin(t * 31));
  ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kIn * 3);
  fillRR(ctx, -w / 2 + 7, -h / 2 + 9, w, h, 30, 'rgba(0,0,0,.18)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 30, C.paper, C.ink, 5);
  vieil_clock(ctx, -196, 0, 54, tm, t);
  // rolling label
  const n = Math.round(tm.years), f = tm.years - Math.floor(tm.years);
  const pulse = 1 + .12 * Math.max(...tm.J.map(j => Math.sin(Math.PI * inv(j.t0 + j.d - .1, j.t0 + j.d + .35, t))), 0) + .05 * tm.jk * (1 - f);
  ctx.save(); ctx.translate(66, -30 - tm.jk * 4 * Math.sin(f * Math.PI)); ctx.scale(pulse, pulse); text(ctx, vieil_label(n), 0, 0, { size: 66, font: FONT.title, weight: 700, color: n > 0 ? C.terracotta : C.ink }); ctx.restore();
  // timeline
  const x0 = -96, x1 = 230, ty = 42, u = vieil_trackU(tm.years);
  line(ctx, x0, ty, x1, ty, C.limeShade, 12); line(ctx, x0, ty, lerp(x0, x1, u), ty, C.ochre, 12);
  [0, 10, 25, 50].forEach((yv, i) => {
    const sx = lerp(x0, x1, i / 3), on = tm.years >= yv - .01;
    circle(ctx, sx, ty, 10, on ? C.ochre : '#FFFFFF', C.ink, 3);
    text(ctx, i ? '+' + yv : '0', sx, ty + 27, { size: 20, font: FONT.body, weight: 800, color: on ? C.ink : C.inkSoft });
  });
  const mx = lerp(x0, x1, u);
  circle(ctx, mx, ty, 15, C.terracotta, C.ink, 4); circle(ctx, mx - 4, ty - 4, 4, 'rgba(255,255,255,.8)');
  ctx.restore();
}
function vieil_header(ctx, cx, cy, title, sub, accent, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, 46, FONT.title, 700); const tw = ctx.measureText(title).width;
  setFont(ctx, 25, FONT.body, 800); const sw = ctx.measureText(sub).width;
  const w = Math.max(tw, sw) + 64, h = 100;
  fillRR(ctx, -w / 2 + 6, -h / 2 + 8, w, h, 22, 'rgba(0,0,0,.16)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 22, C.paper);
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.clip(); ctx.fillStyle = accent; ctx.fillRect(-w / 2, -h / 2, w, 13); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  text(ctx, title, 0, -8, { size: 46, font: FONT.title, weight: 700 });
  text(ctx, sub, 0, 31, { size: 25, font: FONT.body, weight: 800, color: C.inkSoft });
  ctx.restore();
}

// ---------- the scene ----------
scene('vieillir', (ctx, S) => {
  const t = S.t, c = S.cue, ce = S.cueEnd;
  const tm = vieil_time(S), wx = vieil_weather(S, tm);
  const at = (i, f) => lerp(c(i), ce(i), f);           // time at fraction f of narration line i

  // --- left (plastic) façade state ---
  const bad = appear(t, c(7) - .1, 2.4, smooth);       // +50 ans : tout se dégrade
  const j2 = appear(t, c(4) - .15, 2.6, smooth);
  const L = {
    dirt: lerp(.5 * appear(t, at(2, .14), 2.6, smooth) + .1 * j2, .85, bad),
    faded: lerp(.5 * appear(t, at(2, .45), 1.8, smooth) + .1 * j2, .85, bad),
    algae: lerp(.6 * appear(t, at(2, .66), 2.6, smooth) + .1 * j2, .95, bad),
    cracks: lerp(.7 * appear(t, c(4) + 1.1, 1.8, smooth), 1, bad),
    moisture: lerp(.5 * appear(t, c(4) + 2.9, 2.6, smooth), 1, bad),
    blisters: lerp(.6 * appear(t, at(4, .66), 2.0, smooth), 1, bad),
    peel: lerp(.36 * appear(t, at(4, .74), 1.8, smooth) + .08 * appear(t, at(5, .2), 3, smooth), .85, bad),
    salt: lerp(.12 * j2, .9, bad),
    sparkle: windowed(t, c(1), c(2) + .2, .4),
  };
  L.trapped = appear(t, c(4) + 2.9, 2.6, smooth);
  // --- right (mineral) façade state ---
  const sw0 = at(6, .515), sweepK = inv(sw0, sw0 + 2.9, t);
  const aged = .35 * appear(t, c(3) + .1, 3.2, smooth) + .07 * j2 + .18 * appear(t, c(6) + .3, 4.2, smooth);
  const fresh = .04 + .26 * bad;
  const R = { sparkle: Math.max(windowed(t, c(1), c(2) + .2, .4), windowed(t, at(6, .82), ce(6) + .4, .4), .55 * appear(t, at(7, .55), .8)) };

  // --- camera (gentle drift, kick during time jumps, shake on stamps) ---
  const st1 = c(8) + .15, st2 = at(8, .4);
  let shk = 0; for (const ts of [st1, st2]) { const e = inv(ts + .3, ts + .75, t); if (e > 0 && e < 1) shk = Math.max(shk, 9 * (1 - e)); }
  ctx.save();
  const z = 1.014 + .006 * Math.sin(t * .23) + .012 * tm.jk;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z);
  ctx.translate(-W / 2 + Math.sin(t * .19) * 7 + Math.sin(t * 71) * shk, -H / 2 + Math.sin(t * .27) * 4 + Math.cos(t * 63) * shk);

  vieil_sky(ctx, t, wx, tm);
  // right house glows when it gains value
  const gk = appear(t, at(7, .55), 1.2);
  if (gk > 0) { const g = ctx.createRadialGradient(VIEIL.rx, VIEIL.gy - 260, 40, VIEIL.rx, VIEIL.gy - 260, 520); g.addColorStop(0, `rgba(255,214,120,${.5 * gk})`); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(VIEIL.rx - 560, VIEIL.gy - 800, 1120, 820); }
  vieil_ground(ctx, wx, t);

  // left house
  vieil_house(ctx, VIEIL.lx, Object.assign({ finish: 'rpe', color: VIEIL.plastic, shutters: VIEIL.shutters, seed: VIEIL.seed, t }, L));
  vieil_waterLeft(ctx, S, wx, L);
  // right house (old / fresh with the badigeon brush sweeping between)
  const ro = { finish: 'lime', color: VIEIL.lime, shutters: VIEIL.shutters, seed: VIEIL.seed, t };
  const hR = VIEIL.w * .62, xR = VIEIL.rx - VIEIL.w / 2, yR = VIEIL.gy - hR;
  if (sweepK <= 0) { vieil_house(ctx, VIEIL.rx, Object.assign({}, ro, { patina: vieil_q(aged), sparkle: R.sparkle })); vieil_weathering(ctx, VIEIL.rx, VIEIL.w, aged * 1.15); }
  else {
    if (sweepK < 1) { vieil_house(ctx, VIEIL.rx, Object.assign({}, ro, { patina: vieil_q(aged) })); vieil_weathering(ctx, VIEIL.rx, VIEIL.w, aged * 1.15); }
    const n = 5, bw = VIEIL.w / n, p = sweepK * n, col = Math.min(n - 1, Math.floor(p)), fr = sweepK >= 1 ? 1 : p - col;
    const fs = col > 0 ? smooth(fr / .15) : 1, f = col > 0 ? clamp((fr - .15) / .85) : fr;   // short slide to the next column, then paint
    const down = col % 2 === 0, by = down ? yR + f * hR : yR + hR - f * hR, bxc = xR + bw / 2 + (col - 1 + fs) * bw;
    ctx.save();
    if (sweepK < 1) {
      ctx.beginPath(); if (col > 0) ctx.rect(xR - 3, yR - 3, col * bw + 3, hR + 6);
      if (down) ctx.rect(xR + col * bw, yR - 3, bw + (col === n - 1 ? 3 : 0), by - yR + 3); else ctx.rect(xR + col * bw, by, bw + (col === n - 1 ? 3 : 0), yR + hR - by + 3);
      ctx.clip();
    }
    vieil_house(ctx, VIEIL.rx, Object.assign({}, ro, { patina: vieil_q(fresh), sparkle: R.sparkle, smoke: sweepK >= 1 }));
    vieil_weathering(ctx, VIEIL.rx, VIEIL.w, bad * .35);
    ctx.restore();
    // brush
    const bk = Math.min(appear(t, sw0 - .35, .35), 1 - appear(t, sw0 + 2.95, .45)), lift = easeIn(inv(sw0 + 2.9, sw0 + 3.4, t));
    if (bk > 0) { ctx.save(); ctx.globalAlpha *= bk; vieil_brush(ctx, bxc + Math.sin(t * 22) * 3 * fs + lift * 60, Math.min(by, VIEIL.gy - 30) - 12 - lift * 160, (down ? -.12 : .12) + Math.sin(t * 9) * .04 + lift * .4, .92); ctx.restore(); }
    // fresh limewash sheen just after the brush
    const sk = windowed(t, sw0 + .2, sw0 + 4.2, .8) * .25;
    if (sk > 0) { ctx.save(); vieil_wallPath(ctx, VIEIL.rx, VIEIL.w); ctx.clip('evenodd'); ctx.fillStyle = `rgba(255,252,244,${sk})`; ctx.fillRect(xR, yR, VIEIL.w, hR); ctx.restore(); }
  }
  vieil_waterRight(ctx, S, wx);
  // uniform slow erosion: a few sand grains falling evenly from the mineral wall
  const ek = windowed(t, c(6) + .4, sw0, .6);
  if (ek > 0) {
    ctx.save();
    for (let i = 0; i < 24; i++) {
      const u = (t * .45 + hash(i * 2.7)) % 1, px = xR + VIEIL.w * (.04 + hash(i * 5.3) * .92), py = yR + hR * hash(i * 1.3) * .8;
      ctx.globalAlpha = ek * Math.sin(u * Math.PI); circle(ctx, px + Math.sin(u * 7 + i) * 4, py + u * u * 120, 3.2, C.ochreDark, null);
    }
    ctx.restore();
  }
  vieil_roofSnow(ctx, VIEIL.lx, VIEIL.w, wx.snow); vieil_roofSnow(ctx, VIEIL.rx, VIEIL.w, wx.snow);

  // décapage: scaffolding, scraper, €€€, plastic waste
  const sOut = 1 - appear(t, c(6) + .1, .6);
  const scK = appear(t, c(5) + .05, .9);
  vieil_scaffold(ctx, scK, sOut);
  if (sOut > 0 && scK > 0) {
    const k1 = appear(t, at(5, .17), .5);
    if (k1 > 0) {
      ctx.save(); ctx.globalAlpha *= sOut * clamp(k1 * 2);
      const sx = 610 + Math.sin(t * 5.5) * 60, sy = 680;
      // falling paint flakes
      for (let i = 0; i < 18; i++) {
        const u = (t * 1.1 + hash(i * 3.9)) % 1, x0 = 560 + hash(i * 7.7) * 130;
        ctx.save(); ctx.translate(x0 + u * 30 * (hash(i) - .5), sy + 30 + u * u * 200); ctx.rotate(u * 8 + i);
        poly(ctx, [[-9, -6], [10, -4], [6, 7], [-7, 5]], i % 3 ? mixColor(VIEIL.plastic, '#D8D6D0', .45) : '#FFFFFF', 'rgba(60,50,40,.5)', 1.5); ctx.restore();
      }
      for (let i = 0; i < 3; i++) { const u = (t * .9 + i / 3) % 1; puff(ctx, sx + 30 + u * 50, sy + 30 - u * 40, 14 + u * 22, .5 * (1 - u), '#E6E0D6'); }
      vieil_scraper(ctx, sx, sy + 8, 1.05, -.5 + Math.sin(t * 5.5 + 1.2) * .1);
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha *= sOut;
    vieil_priceTag(ctx, 345, 612, appear(t, at(5, .32), .7), t);
    const bk = i => appear(t, at(5, .66) + i * .22, .5);
    vieil_bag(ctx, 196, VIEIL.gy + 2, 1.0, bk(0), 4, '#3B4149');
    vieil_bag(ctx, 296, VIEIL.gy + 4, .92, bk(1), 7, '#47525C');
    vieil_bag(ctx, 246, VIEIL.gy - 66, .86, bk(2), 9, '#2F353C');
    vieil_bag(ctx, 108, VIEIL.gy + 6, .8, bk(3), 12, '#505B66');
    ctx.restore();
  }

  vieil_precip(ctx, t, wx);

  // divider
  fillRR(ctx, 953, 190, 14, VIEIL.gy - 186, 7, C.paper, C.ink, 3);

  // callouts
  const okIn = i => appear(t, c(1) + .25 + i * .25, .7, x => x), okOut = 1 - appear(t, c(2) - .3, .4, x => x);
  vieil_badgeOK(ctx, VIEIL.lx, 452, okIn(0), okOut, t); vieil_badgeOK(ctx, VIEIL.rx, 452, okIn(1), okOut, t + 1);
  vieil_tag(ctx, 'encrassement', 370, 592, t, at(2, .17), c(4) - .4);
  vieil_tag(ctx, 'couleurs passées', 560, 728, t, at(2, .46), c(4) - .4);
  vieil_tag(ctx, 'algues', 300, 846, t, at(2, .73), c(4) - .4, { bg: '#E3F0D3' });
  vieil_tag(ctx, 'belle patine', VIEIL.rx, 728, t, at(3, .52), c(4) - .4, { bg: '#F7E7C6' });
  vieil_tag(ctx, 'microfissures', 360, 592, t, c(4) + 1.3, c(5) - .2);
  vieil_tag(ctx, 'eau piégée', 600, 700, t, c(4) + 3.3, c(5) - .2, { bg: '#D7EAF8' });
  vieil_tag(ctx, 'cloques', 330, 790, t, at(4, .68), c(5) - .2);
  vieil_tag(ctx, 'plaques décollées', 585, 846, t, at(4, .78), c(5) - .2);
  vieil_tag(ctx, 'déchets plastiques', 236, 732, t, at(5, .7), c(6) + .1, { size: 30 });
  vieil_tag(ctx, 's’érode comme une pierre', VIEIL.rx, 600, t, at(6, .12), sw0 - .3, { bg: '#F7E7C6' });
  vieil_tag(ctx, 'badigeon / silicate', VIEIL.rx, 470, t, sw0 + .2, c(7) - .3, { bg: '#FFFFFF' });
  vieil_tag(ctx, 'comme neuve !', VIEIL.rx, 770, t, at(6, .84), c(7) - .3, { bg: C.goodLight });
  vieil_sadHeart(ctx, 108, 452, appear(t, at(7, .3), .7), t);
  vieil_tag(ctx, 'mur malade', 300, 600, t, at(7, .33), c(8) - .1, { bg: '#F6D5D5', color: '#9E2B2B' });
  vieil_valueTag(ctx, 1818, 470, appear(t, at(7, .56), .8), t);

  // Margot, small, between the two houses
  const aG = at(0, .255), aD = at(0, .593);
  const pose = poseAt(t, [[0, 'idle'], [c(0), 'open'], [aG, 'pointL'], [aD, 'point'], [c(1), 'cheer'], [c(1) + 1.5, 'open'],
    [c(2), 'pointL'], [at(2, .47), 'shrug'], [at(2, .68), 'pointL'],
    [c(3), 'point'], [at(3, .45), 'explain'],
    [c(4), 'pointL'], [at(4, .68), 'shrug'],
    [c(5), 'think'], [at(5, .32), 'shrug'], [at(5, .66), 'pointL'],
    [c(6), 'point'], [at(6, .515), 'explain'], [at(6, .84), 'cheer'],
    [c(7), 'open'], [at(7, .24), 'pointL'], [at(7, .53), 'point'],
    [c(8), 'point'], [at(8, .4), 'pointL'], [ce(8) + .15, 'open']]);
  const look = vieil_keyed(t, [[0, 0], [aG, -1], [aD, 1], [c(1), 0], [c(2), -1], [c(3), 1], [c(4), -1], [c(6), 1], [c(7), 0], [at(7, .24), -1], [at(7, .53), 1], [c(8), 1], [at(8, .4), -1], [ce(8) + .15, 0]]);
  const expr = vieil_step(t, [[0, 'happy'], [c(2), 'worried'], [c(3), 'happy'], [c(4), 'worried'], [c(6), 'happy'], [at(7, .2), 'worried'], [at(7, .53), 'happy'], [at(8, .4), 'serious'], [ce(8) + .15, 'happy']]);
  presenter(ctx, { x: 960 + look * 14, y: 908, s: .58, pose, T: S.T, look, expr, bounce: tm.hop });
  ctx.restore();

  // --- UI (fixed) ---
  vieil_panel(ctx, S, tm);
  vieil_header(ctx, VIEIL.lx, 255, 'Rénovation plastique', 'peinture acrylique / RPE / ITE polystyrène', '#7DB6D3', appear(t, aG - .1, .6));
  vieil_header(ctx, VIEIL.rx, 255, 'Rénovation minérale', 'chaux + silicate', C.ochre, appear(t, aD - .1, .6));
  vieil_stamp(ctx, 'Le minéral', 'VIEILLIT', VIEIL.rx, 640, appear(t, st1, .35), C.good, .06);
  vieil_stamp(ctx, 'Le plastique', 'SE DÉGRADE', VIEIL.lx, 640, appear(t, st2, .35), C.danger, -.06);
});

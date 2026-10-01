// 02_mur.js — Chapter 1 « Comment vit un mur ancien » (~37 s).
// Match cut from the intro's stone close-up → four pre-1948 materials → a big cross-section of an old stone wall
// (interior left, exterior right, soil below). What it does NOT have (✘), where water comes in (rain, soil, vapour),
// how it leaves on both sides, the balance in = out, and finally the « mur perspirant » flow.
'use strict';

const MUR_G = { GY: 790, X0: 830, X1: 1190, P: 22, CX: 1010 };   // ground line, interior/exterior faces, plaster
const MUR_CARD = { y: 470, s: 270, xs: [650, 970, 1290, 1610] };

// ---------- textures (cached) ----------
function mur_wallpaper() {
  return cached('mur|wallpaper', MUR_G.X0, MUR_G.GY, g => {
    const w = MUR_G.X0, h = MUR_G.GY;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#F4E4C8'); gr.addColorStop(1, '#EAD3AC');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let x = 22; x < w; x += 72) { g.fillStyle = 'rgba(196,140,80,.12)'; g.fillRect(x, 0, 26, h); }
    for (let x = 58; x < w; x += 72) for (let y = 40; y < h; y += 70) {
      g.fillStyle = 'rgba(200,100,60,.16)'; g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5, 3, a, 0, TAU); } g.fill();
    }
    const r = rng(3); for (let i = 0; i < 2500; i++) { g.fillStyle = r() < .5 ? 'rgba(90,60,30,.05)' : 'rgba(255,255,255,.08)'; g.fillRect(r() * w, r() * h, 2, 2); }
  });
}
function mur_soilTex() {
  return cached('mur|soil', W, H - MUR_G.GY + 40, g => {
    const w = W, h = H - MUR_G.GY + 40;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9C7652'); gr.addColorStop(1, '#6B4C33');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(19);
    for (let i = 0; i < 220; i++) { const x = r() * w, y = 14 + r() * h, s = 3 + r() * 9; ellipse(g, x, y, s * 1.3, s, mixColor('#7E6A58', '#B9A58C', r()), 'rgba(50,35,25,.35)', 1.5, r() * 3); }
    for (let i = 0; i < 1600; i++) { g.fillStyle = r() < .5 ? 'rgba(40,25,15,.12)' : 'rgba(255,230,200,.08)'; g.fillRect(r() * w, r() * h, 2 + r() * 2, 2); }
  });
}
function mur_brickTex(w, h) {
  return cached(`mur|brick|${w}|${h}`, w, h, g => {
    g.fillStyle = '#E6DBC8'; g.fillRect(0, 0, w, h);
    const bh = 34, bw = 80, j = 7, r = rng(12);
    for (let row = 0, y = -10; y < h; row++, y += bh + j) for (let x = -(row % 2) * (bw / 2 + 3) - 12; x < w; x += bw + j) {
      g.fillStyle = mixColor('#B95A3C', r() < .5 ? '#8C3E2B' : '#D57F55', r() * .5);
      g.beginPath(); g.roundRect(x, y, bw, bh, 5); g.fill(); g.strokeStyle = 'rgba(60,30,20,.35)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = 'rgba(255,220,190,.18)'; g.fillRect(x + 4, y + 3, bw - 8, 5);
      for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(60,25,15,.25)'; g.fillRect(x + r() * bw, y + r() * bh, 3, 3); }
    }
  });
}
function mur_piseTex(w, h) {
  return cached(`mur|pise|${w}|${h}`, w, h, g => {
    const r = rng(7), cols = ['#C99C66', '#B7884F', '#D5AB76', '#AD7D4A'];
    let y = -4;
    while (y < h) {
      const lh = 15 + r() * 16; g.fillStyle = cols[Math.floor(r() * 4)];
      g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 20) g.lineTo(x, y + Math.sin(x * .05 + y) * 2.5); g.lineTo(w, y + lh + 3); g.lineTo(0, y + lh + 3); g.closePath(); g.fill();
      y += lh;
    }
    for (let yy = 70; yy < h; yy += 88) { g.fillStyle = 'rgba(250,245,230,.7)'; g.fillRect(0, yy, w, 4); }
    for (let i = 0; i < 70; i++) ellipse(g, r() * w, r() * h, 2 + r() * 5, 2 + r() * 3.5, mixColor('#8B8073', '#D9CDBA', r()), 'rgba(60,40,25,.3)', 1, r() * 3);
    g.strokeStyle = 'rgba(80,50,25,.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .58, 0); g.lineTo(w * .52, h * .5); g.lineTo(w * .6, h); g.stroke();
  });
}
function mur_timberTex(w, h) {
  return cached(`mur|timber|${w}|${h}`, w, h, g => {
    g.fillStyle = '#EFE2C6'; g.fillRect(0, 0, w, h);
    const r = rng(23); for (let i = 0; i < 500; i++) { g.fillStyle = r() < .5 ? 'rgba(120,90,50,.1)' : 'rgba(255,255,255,.15)'; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 3, 0, TAU); g.fill(); }
    const beam = (x1, y1, x2, y2) => { g.lineCap = 'butt'; g.strokeStyle = C.ink; g.lineWidth = 30; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = '#7A5233'; g.lineWidth = 22; g.stroke(); g.strokeStyle = 'rgba(255,220,170,.18)'; g.lineWidth = 4; g.stroke(); };
    beam(0, h * .52, w, h * .52);
    beam(w * .14, 0, w * .86, h * .52); beam(w * .86, 0, w * .14, h * .52);          // croix de Saint-André
    beam(w * .14, h * .52, w * .5, h); beam(w * .86, h * .52, w * .5, h);
    for (const x of [w * .14, w * .5, w * .86]) beam(x, -5, x, h + 5);
    beam(0, 8, w, 8); beam(0, h - 8, w, h - 8);
  });
}

// ---------- small drawing helpers ----------
function mur_puff(ctx, x, y, r, a) {   // vapour puff readable on both the warm interior and the sky
  if (a <= .01 || r <= .5) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x - r * .72, y + r * .25, r * .7, 0, TAU); ctx.arc(x + r * .75, y + r * .2, r * .65, 0, TAU);
  ctx.fillStyle = '#F2F9FE'; ctx.fill();
  ctx.strokeStyle = 'rgba(48,122,190,.8)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * .97, 0, TAU); ctx.arc(x - r * .72, y + r * .25, r * .68, 0, TAU); ctx.arc(x + r * .75, y + r * .2, r * .63, 0, TAU); ctx.fillStyle = '#F2F9FE'; ctx.fill();
  ellipse(ctx, x - r * .25, y - r * .35, r * .35, r * .18, 'rgba(255,255,255,.9)');
  ctx.restore();
}
function mur_dot(ctx, x, y, r, a, col = C.water) {
  if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a; circle(ctx, x, y, r + 2, 'rgba(255,255,255,.85)'); circle(ctx, x, y, r, col); circle(ctx, x - r * .3, y - r * .3, r * .3, 'rgba(255,255,255,.7)'); ctx.restore();
}
// deterministic particle cycle → [life progress u, cycle index n]
function mur_cyc(t, i, period, seed = 0) { const p = t / period + hash(i * 7.31 + seed); const n = Math.floor(p); return [p - n, n]; }
function mur_noLabel(ctx, s, x, y, k) {        // « Pas de … » pill with a red ✘ badge
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, 38, FONT.title, 600);
  const h = 64, w = ctx.measureText(s).width + h + 36, x0 = -w / 2;
  fillRR(ctx, x0 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, x0, -h / 2, w, h, h / 2, C.paper, C.ink, 4);
  circle(ctx, x0 + h / 2 + 2, 0, h / 2 - 8, C.danger, C.ink, 3); cross(ctx, x0 + h / 2 + 2, 0, 20, '#FFFFFF', 1);
  text(ctx, s, x0 + h + 8, 3, { size: 38, font: FONT.title, weight: 600, color: C.ink, align: 'left' });
  ctx.restore();
}
function mur_tagLabel(ctx, s, x, y, k, { color = C.ink, bg = C.paper, icon = null, size = 40 } = {}) {   // pill with optional icon
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, size, FONT.title, 600);
  const h = size * 1.6, iw = icon ? h - 8 : 0, w = ctx.measureText(s).width + 40 + iw, x0 = -w / 2;
  fillRR(ctx, x0 + 5, -h / 2 + 7, w, h, h / 2, 'rgba(0,0,0,.15)');
  fillRR(ctx, x0, -h / 2, w, h, h / 2, bg, C.ink, 4);
  if (icon) icon(ctx, x0 + h / 2 + 2, 0, h / 2 - 8);
  text(ctx, s, x0 + 20 + iw + (w - 40 - iw) / 2, 3, { size, font: FONT.title, weight: 600, color });
  ctx.restore();
}
const mur_iconCheck = (ctx, x, y, r) => { circle(ctx, x, y, r, C.good, C.ink, 3); check(ctx, x - 1, y + 2, r * 1.05, '#FFFFFF', 1); };
const mur_iconDrop = (ctx, x, y, r) => { circle(ctx, x, y, r, '#DCEFFB', C.ink, 3); drop(ctx, x, y + r * .22, r * .5, C.water); };
const mur_iconPuff = (ctx, x, y, r) => { circle(ctx, x, y, r, '#FFFFFF', C.ink, 3); puff(ctx, x + 2, y + 2, r * .42, 1, '#9CCBEB'); };

// ---------- the section: interior | wall | exterior, soil below ----------
function mur_interior(ctx) {   // the room — everything in it is static, so it is baked once
  const { X0, GY } = MUR_G;
  ctx.drawImage(cached('mur|interior', X0, GY + 20, g => {
    g.drawImage(mur_wallpaper(), 0, 0);
    // warm glow from the pendant lamp
    const lg = g.createRadialGradient(660, 190, 10, 660, 190, 460); lg.addColorStop(0, 'rgba(255,214,140,.42)'); lg.addColorStop(1, 'rgba(255,214,140,0)');
    g.fillStyle = lg; g.fillRect(0, 0, X0, GY);
    // picture frame
    fillRR(g, 118 + 6, 182 + 8, 170, 128, 6, 'rgba(0,0,0,.14)');
    fillRR(g, 118, 182, 170, 128, 6, C.wood, C.ink, 4);
    const pg = g.createLinearGradient(0, 196, 0, 296); pg.addColorStop(0, '#BFE0F0'); pg.addColorStop(1, '#F2E6C8');
    fillRR(g, 134, 198, 138, 96, 3, pg, C.ink, 3);
    g.save(); rr(g, 134, 198, 138, 96, 3); g.clip(); ellipse(g, 170, 300, 70, 40, '#8DB86B'); ellipse(g, 250, 305, 60, 46, '#6E9A4F'); circle(g, 245, 225, 11, '#F6C84C'); g.restore();
    // pendant lamp
    line(g, 660, -10, 660, 112, C.ink, 4);
    ellipse(g, 660, 172, 30, 12, 'rgba(255,240,190,.9)');
    poly(g, [[626, 112], [694, 112], [716, 166], [604, 166]], '#F2C46B', C.ink, 4);
    line(g, 632, 120, 688, 120, 'rgba(255,255,255,.5)', 3);
    // skirting board + tiled floor
    fillRR(g, -10, GY - 34, X0 + 10, 34, 0, '#B98A5E', C.ink, 3);
    g.fillStyle = C.terracotta; g.fillRect(0, GY, X0, 18); for (let x = 20; x < X0; x += 46) line(g, x, GY, x, GY + 18, 'rgba(90,35,20,.5)', 2);
    line(g, 0, GY, X0, GY, C.ink, 4); line(g, 0, GY + 18, X0, GY + 18, C.ink, 3);
    // side table with a teapot (a source of indoor vapour)
    fillRR(g, 612, 650, 18, 140, 4, '#8A5E3B', C.ink, 3);
    ellipse(g, 621, 788, 60, 9, '#8A5E3B', C.ink, 3);
    ellipse(g, 621, 648, 96, 16, '#A87449', C.ink, 4);
    g.save(); g.translate(615, 600);
    g.beginPath(); g.moveTo(36, 10); g.quadraticCurveTo(62, 6, 74, -26); g.lineTo(80, -24); g.quadraticCurveTo(72, 14, 40, 26); g.closePath(); g.fillStyle = '#5F8FA8'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
    g.beginPath(); g.arc(-44, 6, 20, Math.PI * .5, Math.PI * 1.5); g.strokeStyle = C.ink; g.lineWidth = 12; g.stroke(); g.strokeStyle = '#5F8FA8'; g.lineWidth = 6; g.stroke();
    ellipse(g, 0, 10, 46, 38, '#5F8FA8', C.ink, 4);
    ellipse(g, -14, -2, 14, 8, 'rgba(255,255,255,.35)');
    fillRR(g, -22, -32, 44, 10, 5, '#4E7A92', C.ink, 3); circle(g, 0, -37, 6, '#E3B54B', C.ink, 3);
    g.restore();
  }), 0, 0);
}
function mur_exteriorTex(gl) {
  const { X1, GY } = MUR_G, w = W - X1, h = GY + 12;
  return cached('mur|ext|' + gl, w, h, ctx => {   // (ctx here is the offscreen canvas)
    ctx.translate(-X1, 0);
    const g = ctx.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, mixColor('#93C6E6', '#7F93A3', gl)); g.addColorStop(1, mixColor('#E9F4F8', '#C9D3D9', gl));
    ctx.fillStyle = g; ctx.fillRect(X1, 0, w, GY);
    ctx.save(); ctx.beginPath(); ctx.rect(X1, 0, w, GY); ctx.clip();
    ellipse(ctx, 1560, GY + 30, 420, 120, mixColor('#B5D39A', '#9FB49A', gl));
    ellipse(ctx, 1900, GY + 40, 300, 150, mixColor('#A6C98A', '#93A98E', gl));
    fillRR(ctx, 1772, 560, 22, 230, 6, C.woodDark, C.ink, 3);
    blob(ctx, 1783, 520, 82, 4, .14, 10, mixColor('#7FAE5A', '#6E8F63', gl), C.ink, 4, 0);
    ctx.restore();
    ctx.fillStyle = C.grass; ctx.fillRect(X1, GY - 6, w, 18); line(ctx, X1, GY - 6, W, GY - 6, C.grassDark, 4);
    for (let i = 0; i < 18; i++) { const x = X1 + 30 + hash(i * 3.3) * (w - 40); line(ctx, x, GY, x - 6, GY - 20, C.grassDark, 4); line(ctx, x + 6, GY, x + 10, GY - 17, C.grassDark, 4); }
  });
}
function mur_exterior(ctx, t, wx) {
  const { X1, GY } = MUR_G;
  ctx.drawImage(mur_exteriorTex(0), X1, 0);
  if (wx.gloom > .01) { ctx.save(); ctx.globalAlpha *= wx.gloom; ctx.drawImage(mur_exteriorTex(1), X1, 0); ctx.restore(); }
  if (wx.sun > .02) { ctx.save(); ctx.globalAlpha *= wx.sun; sun(ctx, 1790, 150, 54, t); ctx.restore(); }
  ctx.save(); ctx.beginPath(); ctx.rect(X1, 0, W - X1, GY - 120); ctx.clip();
  for (let i = 0; i < 4; i++) {
    const x = X1 + 40 + ((i * 260 + t * (12 + i * 4)) % 900);
    cloud(ctx, x, 120 + (i % 2) * 50, 70 + (i % 3) * 14, mixColor('#FFFFFF', '#8E9AA4', wx.gloom), .95);
  }
  ctx.restore();
}
function mur_soil(ctx, wet) {
  ctx.drawImage(mur_soilTex(), 0, MUR_G.GY + 4);
  if (wet > 0) {
    const g = ctx.createLinearGradient(0, MUR_G.GY, 0, H); g.addColorStop(0, `rgba(35,55,85,${.12 * wet})`); g.addColorStop(1, `rgba(35,55,85,${.38 * wet})`);
    ctx.fillStyle = g; ctx.fillRect(0, MUR_G.GY + 4, W, H);
  }
}
function mur_wall(ctx, top) {
  const { X0, X1, P, GY } = MUR_G;
  ctx.save(); ctx.beginPath(); ctx.rect(X0 - 30, top, X1 - X0 + 60, H - top + 20); ctx.clip();
  // foundation (wider footing in the soil)
  ctx.save(); ctx.beginPath(); ctx.moveTo(X0, GY); ctx.lineTo(X0, 960); ctx.lineTo(X0 - 22, 990); ctx.lineTo(X0 - 22, H + 20); ctx.lineTo(X1 + 22, H + 20); ctx.lineTo(X1 + 22, 990); ctx.lineTo(X1, 960); ctx.lineTo(X1, GY); ctx.closePath();
  ctx.clip(); ctx.drawImage(stoneTexture(X1 - X0 + 60, 330, 6, { size: 62, mortar: '#D9CCB5', stone: '#A39480' }), X0 - 30, GY - 10); ctx.restore();
  ctx.beginPath(); ctx.moveTo(X0, GY); ctx.lineTo(X0, 960); ctx.lineTo(X0 - 22, 990); ctx.lineTo(X0 - 22, H + 20); ctx.moveTo(X1, GY); ctx.lineTo(X1, 960); ctx.lineTo(X1 + 22, 990); ctx.lineTo(X1 + 22, H + 20); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  // stone core above ground
  ctx.drawImage(stoneTexture(X1 - X0 - 2 * P, GY + 30, 5, { size: 62, mortar: '#E3D8C4', stone: '#AFA08A' }), X0 + P, -20);
  // lime plaster inside, lime render outside
  ctx.drawImage(limeTexture(P, GY + 30, '#F6F0E4', 8), X0, -20);
  ctx.drawImage(limeTexture(P, GY + 30, '#E9DDC5', 9), X1 - P, -20);
  line(ctx, X0 + P, -20, X0 + P, GY, 'rgba(60,50,40,.45)', 2); line(ctx, X1 - P, -20, X1 - P, GY, 'rgba(60,50,40,.45)', 2);
  line(ctx, X0, -20, X0, GY, C.ink, 5, 'butt'); line(ctx, X1, -20, X1, GY, C.ink, 5, 'butt');
  ctx.restore();
  if (top > -10) line(ctx, X0 - 4, top, X1 + 4, top, C.ink, 5);
}
// water inside the wall: capillary rise from the base, rain-wetted outer skin, vapour near the inner face
function mur_wetness(ctx, t, { cap, riseH, rainWet, vapWet }) {
  const { X0, X1, GY } = MUR_G;
  ctx.save(); ctx.beginPath(); ctx.rect(X0, -20, X1 - X0, H + 40); ctx.clip();
  if (cap > 0 && riseH > 2) {
    const top = GY - riseH;
    ctx.beginPath(); ctx.moveTo(X0, H + 20);
    for (let i = 0; i <= 24; i++) { const x = X0 + (X1 - X0) * i / 24; ctx.lineTo(x, top + 12 * Math.sin(i * 1.3 + t * 1.3) + 7 * Math.sin(i * 2.9 - t)); }
    ctx.lineTo(X1, H + 20); ctx.closePath();
    const g = ctx.createLinearGradient(0, top - 15, 0, H); g.addColorStop(0, 'rgba(62,155,218,0)'); g.addColorStop(.2, `rgba(62,155,218,${.22 * cap})`); g.addColorStop(1, `rgba(40,110,180,${.46 * cap})`);
    ctx.fillStyle = g; ctx.fill();
  }
  // soft-topped bands along each face: rain soaks the outer render, vapour the inner plaster
  const band = (x, dir, depth, col, a) => {
    const g = ctx.createLinearGradient(x, 0, x + dir * depth, 0); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g; const x0 = dir > 0 ? x : x - depth;
    for (let y = 150; y < 330; y += 10) { ctx.globalAlpha = smooth(inv(150, 330, y + 5)); ctx.fillRect(x0, y, depth, 10); }
    ctx.globalAlpha = 1; ctx.fillRect(x0, 330, depth, GY - 330);
  };
  if (rainWet > 0) band(X1, -1, 95, '#3E9BDA', .36 * rainWet);
  if (vapWet > 0) band(X0, 1, 70, '#78B9E6', .3 * vapWet);
  ctx.restore();
}

// ---------- particles ----------
function mur_rain(ctx, t, k) {
  if (k <= .01) return;
  const { X1, GY } = MUR_G, vx = -.3, sp = 1150, P = 1.5;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < 80; i++) {
    const a = clamp((k - hash(i * 3.7 + 1)) * 5); if (a <= 0) continue;
    const [u, c] = mur_cyc(t, i, P, 11);
    const x0 = X1 + 30 + hash(i * 5.3 + c * 1.7) * 760, y0 = 175, tau = u * P;
    const yWall = y0 + (x0 - X1 - 3) / -vx, hitsWall = yWall < GY - 4, yHit = hitsWall ? yWall : GY + 2;
    const tHit = (yHit - y0) / sp;
    if (tau < tHit) {
      const y = y0 + tau * sp, x = x0 + vx * (y - y0);
      ctx.strokeStyle = rgba('#2F7FC8', .8 * a); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx * 30, y - 30); ctx.stroke();
    } else {
      const th = tau - tHit, xh = x0 + vx * (yHit - y0);
      if (th < .28) {          // splash
        const s = th / .28; ctx.strokeStyle = rgba('#2F7FC8', .7 * a * (1 - s)); ctx.lineWidth = 3;
        for (const d of [-1, 1]) { ctx.beginPath(); if (hitsWall) ctx.arc(xh + 6, yHit, 6 + s * 16, d > 0 ? -.2 : -1.6, d > 0 ? .9 : -.7); else ctx.arc(xh, yHit, 6 + s * 16, d > 0 ? -1.2 : -2.9, d > 0 ? -.3 : -1.9); ctx.stroke(); }
      }
      if (th < 1.1) {          // the water soaks in (into the render, or into the soil)
        const s = th / 1.1, depth = 30 + hash(i * 9.1 + c) * 80;
        if (hitsWall) mur_dot(ctx, X1 - 4 - easeOut(s) * depth, yHit + s * 12, 6, a * Math.sin(Math.min(1, s * 1.4) * Math.PI) * .95);
        else mur_dot(ctx, xh, GY + 12 + easeOut(s) * depth * .6, 4.5, a * Math.sin(Math.min(1, s * 1.4) * Math.PI) * .8);
      }
    }
  }
  ctx.restore();
}
function mur_soilWater(ctx, t, k, riseH) {   // soil water converges to the foundation and climbs (capillarity)
  if (k <= .01) return;
  const { X0, X1, GY } = MUR_G;
  for (let i = 0; i < 46; i++) {
    const a = clamp((k - hash(i * 2.1 + 5) * .9) * 5); if (a <= 0) continue;
    const [u, c] = mur_cyc(t, i, 4.4, 21), h1 = hash(i * 3.3 + c * 1.9), h2 = hash(i * 5.7 + c * 2.3), h3 = hash(i * 1.1 + c * 3.1);
    const left = h1 < .45, sx = left ? 560 + h2 * 230 : 1230 + h2 * 330, sy = GY + 30 + h3 * 80;
    const wx = X0 + 40 + h2 * (X1 - X0 - 80), topY = GY - riseH * (.5 + .5 * h3);
    let x, y;
    if (u < .3) { const v = smooth(u / .3); x = lerp(sx, wx, v); y = lerp(sy, GY + 70, v); }
    else { const v = (u - .3) / .7; x = wx + Math.sin(v * 9 + i) * 6; y = lerp(GY + 70, topY, easeOut(v)); }
    mur_dot(ctx, x, y, 6.5, a * Math.min(1, u * 8) * (1 - smooth(inv(.82, 1, u))));
  }
}
function mur_vaporIn(ctx, t, k) {   // vapour from the room drifts to the inner face and diffuses into the wall
  if (k <= .01) return;
  const { X0, P } = MUR_G;
  for (let i = 0; i < 16; i++) {
    const a = clamp((k - hash(i * 4.4 + 2) * .9) * 5); if (a <= 0) continue;
    const [u, c] = mur_cyc(t, i, 3.2, 31), pot = i < 7, h1 = hash(i * 5.1 + c), h2 = hash(i * 7.3 + c * 1.3);
    const sx = pot ? 700 : 520 + h1 * 160, sy = pot ? 566 : 160 + h2 * 380;
    const ey = pot ? 380 + h2 * 230 : sy + 20;
    const x = lerp(sx, X0 + 4, u), y = lerp(sy, ey, smooth(u)) + Math.sin(u * 6 + i) * 9;
    mur_puff(ctx, x, y, lerp(9, 21, Math.min(1, u * 1.6)) * (1 - .5 * smooth(inv(.8, 1, u))), a * .95 * Math.min(1, u * 6) * (1 - smooth(inv(.82, 1, u))));
  }
  for (let i = 0; i < 26; i++) {
    const a = clamp((k - hash(i * 6.2 + 9) * .9) * 5); if (a <= 0) continue;
    const [u, c] = mur_cyc(t, i, 2.6, 33), y = 150 + hash(i * 2.9 + c) * 600;
    mur_dot(ctx, X0 + P - 4 + easeOut(u) * (35 + hash(i * 8.3 + c) * 110), y + Math.sin(u * 5 + i) * 5, 5.5, a * Math.sin(u * Math.PI), '#6DB6E8');
  }
}
function mur_evap(ctx, t, k, sides = [-1, 1]) {   // moisture walks to both faces and leaves as vapour
  if (k <= .01) return;
  const { X0, X1 } = MUR_G;
  for (let i = 0; i < 48; i++) {
    const a = clamp((k - hash(i * 6.6 + 3) * .9) * 5); if (a <= 0) continue;
    const side = i % 2 ? 1 : -1; if (!sides.includes(side)) continue;
    const [u, c] = mur_cyc(t, i, 3.6, 41), h1 = hash(i * 3.1 + c), h2 = hash(i * 2.3 + c * 1.7);
    const y0 = 170 + h1 * 580, x0 = X0 + 70 + h2 * (X1 - X0 - 140), face = side > 0 ? X1 : X0;
    if (u < .5) { const v = smooth(u / .5); mur_dot(ctx, lerp(x0, face - side * 8, v), y0 - v * 10, 6, a * Math.min(1, u * 10), side > 0 ? C.water : '#5AAEE3'); }
    else { const v = (u - .5) / .5; mur_puff(ctx, face + side * (14 + easeOut(v) * 200), y0 - 10 - easeOut(v) * 110 - v * v * 50, 9 + v * 24, a * (1 - smooth(v))); }
  }
}
function mur_through(ctx, t, k) {   // perspiring wall: vapour crosses from the room to the outside, damp from the base too
  if (k <= .01) return;
  const { X0, X1, P, GY } = MUR_G;
  for (let i = 0; i < 44; i++) {
    const a = clamp((k - hash(i * 8.8 + 4) * .9) * 5); if (a <= 0) continue;
    const [u, c] = mur_cyc(t, i, 4.2, 51), h1 = hash(i * 2.7 + c), h2 = hash(i * 1.9 + c * 2.1);
    const base = h2 < .28, yExit = base ? GY - 60 - h1 * 200 : 170 + h1 * 560;
    if (!base && u < .2) { const v = u / .2; mur_puff(ctx, lerp(690, X0 + 2, v), yExit + 18 * (1 - v), 15 - v * 6, a * Math.min(1, u * 15) * (1 - v * .6)); }
    else if (u < .72) {
      const v = base ? u / .72 : (u - .2) / .52;
      const x = base ? lerp(X0 + 60 + h1 * 200, X1 - 6, smooth(v)) : lerp(X0 + P, X1 - 6, v);
      const y = base ? lerp(GY + 50, yExit, easeOut(v)) : yExit + Math.sin(v * 7 + i) * 10;
      mur_dot(ctx, x, y, 6, a * Math.min(1, (base ? u * 8 : 1)), base ? C.water : '#5AAEE3');
    } else { const v = (u - .72) / .28; mur_puff(ctx, X1 + 14 + easeOut(v) * 260, yExit - easeOut(v) * 140, 11 + v * 30, a * (1 - smooth(v))); }
  }
}

// ---------- beat props ----------
function mur_card(ctx, kind, x, y, s, k, T) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k, 1.6) * s / MUR_CARD.s; ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  const c = MUR_CARD.s, hc = c / 2;
  fillRR(ctx, -hc + 8, -hc + 10, c, c, 26, 'rgba(0,0,0,.18)');
  ctx.save(); rr(ctx, -hc, -hc, c, c, 26); ctx.clip();
  if (kind === 'stone') intro_stoneCloseup(ctx, T, { cx: 0, cy: 0, scale: .3, vignette: 0 });
  else ctx.drawImage(kind === 'brick' ? mur_brickTex(c, c) : kind === 'pise' ? mur_piseTex(c, c) : mur_timberTex(c, c), -hc, -hc);
  ctx.restore();
  fillRR(ctx, -hc, -hc, c, c, 26, null, C.ink, 6);
  ctx.restore();
}
function mur_ghost(ctx, which, k, crossK) {   // the "modern" layers an old wall does not have, crossed out
  if (k <= 0) return;
  const { X0, X1, GY } = MUR_G, g = easeOut(k);
  ctx.save(); ctx.globalAlpha *= clamp(k * 3) * (1 - .55 * crossK);
  ctx.setLineDash([12, 8]); ctx.lineDashOffset = -k * 40;
  let cx, cy;
  if (which === 0) {          // damp-proof course (coupure de capillarité): slides in across the base
    const w = (X1 - X0 + 28) * g;
    fillRR(ctx, X0 - 14, GY - 36, w, 22, 4, '#3C3B3A', C.ink, 3);
    ctx.save(); ctx.beginPath(); ctx.rect(X0 - 14, GY - 36, w, 22); ctx.clip();
    for (let x = X0 - 6; x < X1 + 10; x += 22) line(ctx, x, GY - 32, x + 12, GY - 18, 'rgba(255,255,255,.28)', 3);
    ctx.restore();
    cx = MUR_G.CX; cy = GY - 25;
  } else {                    // vapour barrier (inner face) / plastic film (outer face): unrolls from the top
    const x = which === 1 ? X0 - 18 : X1 + 2, h = (GY - 100) * g;
    fillRR(ctx, x, 70, 16, h, 5, which === 1 ? 'rgba(160,192,210,.97)' : 'rgba(225,240,247,.97)', C.ink, 3);
    ctx.setLineDash([]);
    line(ctx, x + 6, 84, x + 6, 70 + h - 14, 'rgba(255,255,255,.85)', 3);
    for (let y = 120; y < 70 + h - 20; y += 90) line(ctx, x + 3, y, x + 13, y + 10, 'rgba(255,255,255,.6)', 2);
    cx = x + 8; cy = 330;
  }
  ctx.setLineDash([]);
  ctx.restore();
  if (crossK > 0) { ctx.save(); ctx.globalAlpha *= clamp(k * 3); circle(ctx, cx, cy, 34 * easeOutBack(crossK), 'rgba(255,255,255,.92)', C.danger, 5); cross(ctx, cx, cy, 30, C.danger, crossK); ctx.restore(); }
}
function mur_balance(ctx, x, y, k, ang) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = easeOutBack(k); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3);
  const w = 540, h = 250;
  fillRR(ctx, -w / 2 + 7, -h / 2 + 9, w, h, 26, 'rgba(0,0,0,.17)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 26, C.paper, C.ink, 5);
  // stand
  poly(ctx, [[-56, 108], [56, 108], [12, 84], [-12, 84]], C.wood, C.ink, 4);
  fillRR(ctx, -8, -66, 16, 156, 6, C.woodDark, C.ink, 4);
  const pv = [0, -66], L = 190, ca = Math.cos(ang), sa = Math.sin(ang);
  for (const sd of [-1, 1]) {
    const ex = pv[0] + sd * L * ca, ey = pv[1] + sd * L * sa, py = ey + 92;
    line(ctx, ex, ey, ex - 52, py, rgba(C.ink, .8), 3); line(ctx, ex, ey, ex + 52, py, rgba(C.ink, .8), 3);
    ctx.beginPath(); ctx.moveTo(ex - 66, py); ctx.quadraticCurveTo(ex, py + 50, ex + 66, py); ctx.closePath(); ctx.fillStyle = sd < 0 ? '#CFE8F8' : '#EEF6FB'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    if (sd < 0) { drop(ctx, ex - 24, py + 4, 11, C.water, C.ink); drop(ctx, ex + 2, py + 1, 13, C.water, C.ink); drop(ctx, ex + 28, py + 5, 10, C.water, C.ink); }
    else { mur_puff(ctx, ex - 16, py - 6, 15, 1); mur_puff(ctx, ex + 22, py - 10, 13, 1); }
    text(ctx, sd < 0 ? 'entre' : 'sort', ex, py + 50, { size: 30, font: FONT.title, weight: 600, color: sd < 0 ? C.water : '#4C86B0' });
  }
  ctx.save(); ctx.translate(pv[0], pv[1]); ctx.rotate(ang); fillRR(ctx, -L - 10, -10, 2 * L + 20, 20, 10, C.wood, C.ink, 4); ctx.restore();
  circle(ctx, pv[0], pv[1], 13, '#E3B54B', C.ink, 4);
  ctx.restore();
}
function mur_banner(ctx, s, x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 3); const sc = easeOutBack(k, 1.8); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  setFont(ctx, 84, FONT.title, 700);
  const w = ctx.measureText(s).width + 110, h = 124;
  for (const sd of [-1, 1]) {
    poly(ctx, [[sd * (w / 2 - 30), -h / 2 + 30], [sd * (w / 2 + 70), -h / 2 + 30], [sd * (w / 2 + 40), 18], [sd * (w / 2 + 70), h / 2 + 30], [sd * (w / 2 - 30), h / 2 + 30]], '#2F7A47', C.ink, 5);
  }
  fillRR(ctx, -w / 2 + 7, -h / 2 + 10, w, h, 22, 'rgba(0,0,0,.18)');
  fillRR(ctx, -w / 2, -h / 2, w, h, 22, C.good, C.ink, 6);
  fillRR(ctx, -w / 2 + 16, -h / 2 + 10, w - 32, 20, 10, 'rgba(255,255,255,.18)');
  text(ctx, s, 0, 6, { size: 84, font: FONT.title, weight: 700, color: '#FFFFFF', stroke: C.ink, sw: 10 });
  ctx.restore();
}

// ================================================================================================
scene('mur', (ctx, S) => {
  const t = S.t, T = S.T, G = MUR_G;
  const L = (i, f) => S.cue(i) + (S.cueEnd(i) - S.cue(i)) * f;   // time at fraction f through line i

  // ---- timeline (keyed on the narration; fractions from the voice's pauses) ----
  const tCard = 2.3, tPierre = L(0, .355), tBrique = L(0, .456), tPise = L(0, .54), tBois = L(0, .615), tMortier = L(0, .755);
  const tMerge = L(0, .9);
  const tNo = [S.cue(1) + .05, L(1, .43), L(1, .69)];
  const tRain = L(2, .28), tSoil = L(2, .4), tVap = L(2, .6);
  const tOut = S.cue(3), tBoth = L(3, .45), tEq = S.cue(4), tEqWord = L(4, .66), tPersp = L(5, .14), tPass = L(5, .32), tExt = L(5, .55);

  // ---- 0. close-up of the stone (continues the intro), shrinking into the « Pierre » card ----
  const kc = ease(inv(tCard, tCard + 1, t));
  if (kc <= 0) { intro_stoneCloseup(ctx, T); return; }

  const kSec = smooth(inv(tMerge, tMerge + .8, t));                       // the section fades in
  const wallTop = lerp(H + 20, -20, easeOut(inv(tMerge + .1, tMerge + 1.15, t)));
  // camera: a slow push-in on the wall once the section is there
  const zc = 1;   // (no camera push-in: resampling every cached layer would double the frame cost)

  // ---- intensities ----
  const rainK = appear(t, tRain - .3, .8) * (1 - .72 * smooth(inv(tOut + .3, tOut + 1.6, t))) * (1 - smooth(inv(S.cue(5), S.cue(5) + 1.2, t)));
  const gloom = .85 * appear(t, S.cue(2), 1.2) * (1 - .75 * smooth(inv(tOut, tOut + 1.5, t))) * (1 - smooth(inv(S.cue(5), S.cue(5) + 1.5, t)));
  const wx = { gloom, sun: smooth(inv(tOut + .3, tOut + 1.5, t)) };
  const soilK = appear(t, tSoil, 1.2), vapK = appear(t, tVap, 1) * (1 - .7 * windowed(t, tOut, tEq + .4, .6)) * (1 - .6 * smooth(inv(S.cue(5), S.cue(5) + 1, t)));
  const outK = appear(t, tOut + .1, 1) * (1 - .5 * smooth(inv(S.cue(5), S.cue(5) + 1, t)));
  const thruK = appear(t, S.cue(5) + .2, 1.4);
  const riseH = 300 * easeOut(inv(tSoil, tSoil + 2.6, t)) * (1 - .22 * smooth(inv(tOut, tOut + 2.5, t))) + 8 * Math.sin(t * 1.1) * soilK;
  const wet = { cap: soilK, riseH, rainWet: appear(t, tRain + .3, 1.6) * (1 - .55 * smooth(inv(tOut, tOut + 2.5, t))), vapWet: vapK * .8 };

  // ---- background: paper (beat 0) under the section ----
  if (kSec < 1) paperBg(ctx);
  if (kSec > 0) {
    ctx.save(); ctx.globalAlpha *= kSec;
    ctx.translate(G.CX, 470); ctx.scale(zc, zc); ctx.translate(-G.CX, -470);
    mur_interior(ctx);
    mur_exterior(ctx, t, wx);
    mur_soil(ctx, soilK);
    ctx.restore();
  }
  // ---- the section's wall and everything happening in it (camera) ----
  ctx.save();
  ctx.translate(G.CX, 470); ctx.scale(zc, zc); ctx.translate(-G.CX, -470);
  if (wallTop < H) {
    mur_wall(ctx, wallTop);
    ctx.save(); ctx.beginPath(); ctx.rect(0, wallTop, W, H); ctx.clip();
    mur_wetness(ctx, t, wet);
    ctx.restore();
  }
  // 1. what an old wall does NOT have
  const fadeNo = 1 - smooth(inv(S.cue(2) - .25, S.cue(2) + .25, t));
  for (let i = 0; i < 3; i++) mur_ghost(ctx, i, appear(t, tNo[i], .4) * fadeNo, appear(t, tNo[i] + .45, .45));
  // 2-5. water in, water out
  mur_soilWater(ctx, t, soilK, riseH);
  mur_vaporIn(ctx, t, vapK);
  mur_evap(ctx, t, outK);
  mur_through(ctx, t, thruK);
  mur_rain(ctx, t, rainK);
  // source arrows (beat 2)
  const fadeSrc = 1 - smooth(inv(tOut - .1, tOut + .4, t));
  arrow(ctx, 1520, 330, 1232, 470, { color: '#2F7FC8', lw: 9, head: 28, k: appear(t, tRain, .6) * fadeSrc, curve: -.12 });
  for (let i = 0; i < 3; i++) arrow(ctx, 925 + i * 85, G.GY + 70, 925 + i * 85, G.GY - 90, { color: '#2F7FC8', lw: 9, head: 26, k: appear(t, tSoil + .15 + i * .12, .6) * fadeSrc });
  arrow(ctx, 700, 520, 812, 455, { color: '#5AAEE3', lw: 9, head: 26, k: appear(t, tVap + .1, .6) * fadeSrc, curve: .2 });
  // out arrows (beat 3)
  const kA = appear(t, tOut + .2, .7) * (1 - smooth(inv(tEq - .2, tEq + .3, t)));
  arrow(ctx, G.X1 + 22, 420, G.X1 + 250, 330, { color: C.good, lw: 12, head: 32, k: kA, curve: -.18 });
  arrow(ctx, G.X0 - 22, 420, G.X0 - 250, 330, { color: C.good, lw: 12, head: 32, k: kA, curve: .18 });
  // beat 5: the flow across the wall
  const kFlow = appear(t, tPass, .9);
  if (kFlow > 0) {
    ctx.save(); ctx.globalAlpha *= .26 * kFlow; arrow(ctx, 660, 470, 1480, 470, { color: '#3E9BDA', lw: 70, head: 90, k: kFlow }); ctx.restore();
    ctx.save(); ctx.globalAlpha *= .8 * kFlow; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 7; i++) { const x = 690 + ((i * 120 + t * 90) % 760); if (x > 660 + 800 * kFlow - 40) continue; ctx.globalAlpha = .8 * kFlow * Math.sin(Math.PI * (x - 690) / 760); ctx.beginPath(); ctx.moveTo(x - 12, 452); ctx.lineTo(x + 6, 470); ctx.lineTo(x - 12, 488); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();

  // ---- labels (screen space) ----
  // beat 1
  mur_noLabel(ctx, 'Pas de coupure de capillarité', 1555, 690, appear(t, tNo[0] + .1, .45) * fadeNo);
  mur_noLabel(ctx, 'Pas de pare-vapeur', 545, 330, appear(t, tNo[1] + .1, .45) * fadeNo);
  mur_noLabel(ctx, 'Pas de film plastique', 1555, 330, appear(t, tNo[2] + .1, .45) * fadeNo);
  // beat 2
  const fadeSrcL = 1 - smooth(inv(tOut - .1, tOut + .4, t));
  mur_tagLabel(ctx, 'pluie', 1615, 285, appear(t, tRain, .45) * fadeSrcL, { icon: mur_iconDrop, color: '#1F6FB5' });
  mur_tagLabel(ctx, 'remontées du sol', 1545, 868, appear(t, tSoil, .45) * fadeSrcL, { icon: mur_iconDrop, color: '#1F6FB5' });
  mur_tagLabel(ctx, 'vapeur intérieure', 560, 420, appear(t, tVap, .45) * fadeSrcL, { icon: mur_iconPuff, color: '#2F6E9B' });
  // beat 3
  const kOutL = appear(t, tBoth, .45) * (1 - smooth(inv(tEq - .2, tEq + .3, t)));
  mur_tagLabel(ctx, "s'évapore", 1480, 250, kOutL, { icon: mur_iconCheck, color: C.good });
  mur_tagLabel(ctx, "s'évapore", 560, 250, kOutL, { icon: mur_iconCheck, color: C.good });
  // beat 4: balance
  const kBal = appear(t, tEq + .1, .6) * (1 - smooth(inv(S.cue(5) - .2, S.cue(5) + .3, t)));
  const te = t - (tEq + .1), ang = (te > 0 ? .26 * Math.exp(-1.25 * te) * Math.cos(3.4 * te) : .26) + .025 * Math.sin(t * 2.3) * smooth(inv(1.5, 2.5, te));
  mur_balance(ctx, G.CX, 175, kBal, ang);
  mur_tagLabel(ctx, 'Équilibre', G.CX, 336, appear(t, tEqWord - .15, .45) * (1 - smooth(inv(S.cue(5) - .2, S.cue(5) + .3, t))), { icon: mur_iconCheck, size: 46 });
  // beat 5
  mur_banner(ctx, 'MUR PERSPIRANT', G.CX, 150, appear(t, tPersp, .6), t);
  mur_tagLabel(ctx, "laisse passer la vapeur d'eau", G.CX, 290, appear(t, tPass, .45), { icon: mur_iconPuff, size: 36, color: '#2F6E9B' });
  mur_tagLabel(ctx, "vers l'extérieur", 1560, 560, appear(t, tExt, .45), { icon: mur_iconCheck, size: 38, color: C.good });

  // ---- beat 0: the four materials (over the paper), then they merge into the wall ----
  const cardT = [tCard, tBrique - .15, tPise - .15, tBois - .15], kinds = ['stone', 'brick', 'pise', 'timber'];
  const names = ['Pierre', 'Brique', 'Pisé', 'Pan de bois'], nameT = [tPierre, tBrique, tPise, tBois];
  for (let i = 0; i < 4; i++) {
    const m = inv(tMerge + i * .08, tMerge + .7 + i * .08, t), km = easeIn(m);       // flight into the wall
    const tx = G.CX, ty = 250 + i * 150;
    if (m >= 1) {   // landed: a little poof of lime dust
      const kp = inv(tMerge + .7 + i * .08, tMerge + 1.3 + i * .08, t);
      if (kp < 1) for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + i; puff(ctx, tx + Math.cos(a) * (40 + 90 * kp), ty + Math.sin(a) * (30 + 60 * kp), 14 + 16 * kp, .8 * (1 - kp), '#FFFFFF'); }
      continue;
    }
    const x = lerp(MUR_CARD.xs[i], tx, km), y = lerp(MUR_CARD.y + Math.sin(t * 2.1 + i * 1.3) * 5, ty, km) - Math.sin(m * Math.PI) * 60, s = lerp(MUR_CARD.s, 90, km);
    ctx.save(); ctx.globalAlpha *= 1 - smooth(inv(.75, 1, m));
    if (i === 0 && kc < 1) {
      // the close-up rectangle shrinks into the first card
      const cx = lerp(W / 2, x, kc), cy = lerp(H / 2, y, kc), w = lerp(W, s, kc), h = lerp(H, s, kc);
      ctx.save(); rr(ctx, cx - w / 2, cy - h / 2, w, h, 26 * kc); ctx.clip();
      intro_stoneCloseup(ctx, T, { cx, cy, scale: lerp(intro_closeupScale(T), .3, kc), vignette: 1 - kc });
      ctx.restore();
      fillRR(ctx, cx - w / 2, cy - h / 2, w, h, 26 * kc, null, rgba(C.ink, kc), 6);
    } else mur_card(ctx, kinds[i], x, y, s, i === 0 ? 1 : appear(t, cardT[i], .5), T);
    ctx.restore();
    label(ctx, names[i], MUR_CARD.xs[i], MUR_CARD.y + 196, { k: appear(t, nameT[i], .45) * (1 - smooth(inv(0, .3, m))), size: 46 });
  }
  const kStamp = appear(t, 2.95, .45), aStamp = 1 - smooth(inv(tMerge - .2, tMerge + .3, t));
  if (kStamp > 0 && aStamp > 0) { ctx.save(); ctx.globalAlpha *= aStamp; stamp(ctx, 'AVANT 1948', 1130, 190, { k: kStamp, color: C.terracotta, size: 72, rot: -.05 }); ctx.restore(); }
  const kMort = appear(t, tMortier, .5) * (1 - smooth(inv(tMerge - .2, tMerge + .3, t)));
  mur_tagLabel(ctx, 'mortiers de chaux ou de terre', 1130, 790, kMort, { icon: (c, x, y, r) => { circle(c, x, y, r, '#F3EEE3', C.ink, 3); circle(c, x + r * .25, y + r * .1, r * .45, '#B98A5E'); }, size: 38 });

  // ---- Margot ----
  const mx = lerp(-260, 215, easeOut(inv(2.45, 3.3, t)));
  const pose = poseAt(t, [[0, 'idle'], [2.5, 'wave'], [3.2, 'explain'], [tPierre - .15, 'count'], [tMortier - .1, 'open'], [tMerge, 'explain'],
    [S.cue(1), 'stop'], [L(1, .45), 'shrug'], [L(1, .7), 'stop'],
    [S.cue(2), 'explain'], [tRain - .1, 'point'], [tSoil, 'pointDown'], [tVap, 'open'],
    [tOut, 'open'], [tEq, 'shrug'], [tEqWord - .2, 'hold'],
    [tPersp - .3, 'cheer'], [tPass, 'explain'], [tExt, 'point']]);
  const expr = t < S.cue(2) ? 'happy' : t < tOut ? 'surprised' : 'happy';
  const look = t < tMerge ? .5 : .85;
  presenter(ctx, { x: mx, y: 1010, s: .8, pose, T, look, expr });
});

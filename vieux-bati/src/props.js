// props.js — reusable building pieces: masonry textures, the house façade, wall sections.
'use strict';

// Irregular rubble-stone masonry with lime joints, cached. Returns a canvas w×h.
function stoneTexture(w, h, seed = 1, { mortar = C.mortar, stone = C.stone, size = 70 } = {}) {
  return cached(`stone|${w}|${h}|${seed}|${mortar}|${stone}|${size}`, w, h, g => {
    g.fillStyle = mortar; g.fillRect(0, 0, w, h);
    const r = rng(seed * 7 + 3);
    let y = -size * .3;
    while (y < h + size) {
      const rowH = size * (.65 + r() * .5); let x = -r() * size;
      while (x < w + size) {
        const sw = size * (.8 + r() * .9), sh = rowH * (.8 + r() * .15);
        const cx = x + sw / 2, cy = y + rowH / 2;
        const shade = mixColor(stone, r() < .5 ? C.stoneDark : C.stoneLight, r() * .55);
        g.save(); g.translate(cx, cy); g.rotate((r() - .5) * .12);
        // stone: rounded irregular polygon
        g.beginPath(); const n = 7; const pts = [];
        for (let i = 0; i < n; i++) { const a = i / n * TAU + r() * .3; pts.push([Math.cos(a) * sw * .46 * (.86 + r() * .14), Math.sin(a) * sh * .44 * (.86 + r() * .14)]); }
        pts.forEach((p, i) => { const q = pts[(i + 1) % n]; const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; if (!i) { const l = pts[n - 1]; g.moveTo((l[0] + p[0]) / 2, (l[1] + p[1]) / 2); } g.quadraticCurveTo(p[0], p[1], m[0], m[1]); });
        g.closePath(); g.fillStyle = shade; g.fill();
        g.strokeStyle = 'rgba(60,50,40,.35)'; g.lineWidth = 3; g.stroke();
        // highlight & speckles
        g.globalAlpha = .25; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-sw * .12, -sh * .14, sw * .18, sh * .1, -.2, 0, TAU); g.fill(); g.globalAlpha = 1;
        for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(70,60,50,.18)'; g.fillRect((r() - .5) * sw * .7, (r() - .5) * sh * .6, 3, 3); }
        g.restore();
        x += sw + size * .08;
      }
      y += rowH + size * .06;
    }
  });
}
// Lime render surface texture (soft mottled), cached
function limeTexture(w, h, color = C.lime, seed = 2, patina = 0) {
  return cached(`lime|${w}|${h}|${color}|${seed}|${patina.toFixed(2)}`, w, h, g => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    const r = rng(seed);
    for (let i = 0; i < w * h / 900; i++) { g.fillStyle = r() < .5 ? 'rgba(120,100,70,.05)' : 'rgba(255,255,255,.07)'; const s = 2 + r() * 10; g.beginPath(); g.arc(r() * w, r() * h, s, 0, TAU); g.fill(); }
    if (patina > 0) {
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${r() < .5 ? '120,95,60' : '150,140,120'},${.05 * patina})`; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 90, 15 + r() * 60, r() * 3, 0, TAU); g.fill(); }
      // gentle vertical weathering under sills is handled by the house itself
    }
  });
}
// Plastic paint: flat, uniform, glossy diagonal sheen
function plasticFill(ctx, x, y, w, h, color, { gloss = 1, textured = false, seed = 3 } = {}) {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  if (textured) {
    ctx.drawImage(cached(`rpe|${Math.round(w)}|${Math.round(h)}|${seed}`, w, h, g => { const r = rng(seed); for (let i = 0; i < w * h / 160; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 3, 0, TAU); g.fill(); } }), x, y);
  }
  if (gloss > 0) {
    const gr = ctx.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, `rgba(255,255,255,${.0})`); gr.addColorStop(.35, `rgba(255,255,255,${.28 * gloss})`); gr.addColorStop(.42, `rgba(255,255,255,${.0})`);
    gr.addColorStop(.62, `rgba(255,255,255,${.16 * gloss})`); gr.addColorStop(.66, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  }
}

// A blister (cloque) on a painted surface. s = size, k = growth 0..1
function blister(ctx, x, y, s, k, color) {
  if (k <= 0) return; const r = s * k;
  ctx.save();
  ellipse(ctx, x + r * .12, y + r * .18, r * 1.05, r * .85, 'rgba(0,0,0,.18)');
  const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(.5, color); g.addColorStop(1, mixColor(color, '#000000', .18));
  ellipse(ctx, x, y, r, r * .82, g, 'rgba(0,0,0,.25)', 2);
  ctx.restore();
}
// Peeled patch: irregular hole in the paint showing what's beneath (`under` color/texture fn)
function peelPatch(ctx, x, y, s, k, seed, under = C.stone, paint = '#fff') {
  if (k <= 0) return; const r = s * k;
  ctx.save();
  blob(ctx, x, y, r, seed, .35, 9, under, 'rgba(60,40,30,.35)', 3);
  // curled paint flake on the edge
  ctx.translate(x + r * .7, y - r * .5); ctx.rotate(-.6 + hash(seed) * .8);
  poly(ctx, [[0, 0], [r * .6, -r * .15], [r * .45, r * .35]], paint, 'rgba(0,0,0,.3)', 2);
  ctx.restore();
}
// Hairline crack polyline from (x,y) growing downward. k = 0..1
function crack(ctx, x, y, len, k, seed = 1, color = 'rgba(50,40,35,.75)', lw = 3) {
  if (k <= 0) return; const r = rng(seed); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y);
  const n = 9; let px = x, py = y;
  for (let i = 1; i <= n * k; i++) { px += (r() - .5) * len * .25; py += len / n; ctx.lineTo(px, py); if (r() < .3) { ctx.moveTo(px, py); ctx.lineTo(px + (r() - .5) * len * .3, py + len * .12); ctx.moveTo(px, py); } }
  ctx.stroke(); ctx.restore();
}

// ---------- the house ----------
// house(ctx, cx, groundY, w, opts) draws a 2-storey 19th-century village house, centred on cx, standing on groundY.
// opts.finish: 'stone' | 'lime' | 'plastic' | 'rpe' | 'cement'
// damage params (0..1): blisters, peel, dirt, algae, cracks, moisture, salt, faded, patina, mold (inside view not here)
// opts.color: finish colour; opts.shutters: shutter colour
function house(ctx, cx, gy, w, o = {}) {
  const f = Object.assign({ finish: 'lime', color: C.lime, shutters: '#6F8F8A', blisters: 0, peel: 0, dirt: 0, algae: 0, cracks: 0, moisture: 0, salt: 0, faded: 0, patina: 0, t: 0, seed: 1, smoke: true, sparkle: 0 }, o);
  const h = w * .62, x = cx - w / 2, y = gy - h, rh = w * .3;
  ctx.save();
  // shadow
  ellipse(ctx, cx, gy + 6, w * .58, 18, 'rgba(0,0,0,.18)');
  // chimney
  const chx = x + w * .72, chy = y - rh * .75;
  fillRR(ctx, chx, chy, w * .07, rh * .8, 4, C.terracotta, C.ink, 4);
  fillRR(ctx, chx - 6, chy - 10, w * .07 + 12, 18, 4, C.roofDark, C.ink, 4);
  if (f.smoke) for (let i = 0; i < 5; i++) { const k = ((f.t * .35 + i / 5) % 1); puff(ctx, chx + w * .035 + Math.sin(k * 5 + i) * 18 + k * 60, chy - 20 - k * 160, 14 + k * 26, .55 * (1 - k)); }
  // roof
  poly(ctx, [[x - w * .05, y + 4], [x + w * .12, y - rh], [x + w * .88, y - rh], [x + w * 1.05, y + 4]], C.roof, C.ink, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - w * .05, y + 4); ctx.lineTo(x + w * .12, y - rh); ctx.lineTo(x + w * .88, y - rh); ctx.lineTo(x + w * 1.05, y + 4); ctx.closePath(); ctx.clip();
  for (let i = 1; i < 7; i++) line(ctx, x - w * .1, y - rh + i * rh / 7, x + w * 1.1, y - rh + i * rh / 7, C.roofDark, 3);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 30; j++) { const xx = x - w * .1 + j * w / 24 + (i % 2) * w / 48; line(ctx, xx, y - rh + i * rh / 7, xx, y - rh + (i + 1) * rh / 7, rgba(C.roofDark, .5), 2); }
  ctx.restore();
  // walls
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const fin = f.finish;
  const baseColor = f.faded > 0 ? mixColor(f.color, '#D8D6D0', f.faded * .7) : f.color;
  if (fin === 'stone') ctx.drawImage(stoneTexture(Math.round(w), Math.round(h), f.seed, { size: w * .085 }), x, y);
  else if (fin === 'lime') ctx.drawImage(limeTexture(Math.round(w), Math.round(h), baseColor, f.seed, f.patina), x, y);
  else if (fin === 'cement') { ctx.fillStyle = mixColor(C.cement, baseColor, .3); ctx.fillRect(x, y, w, h); ctx.drawImage(cached(`cem|${Math.round(w)}|${Math.round(h)}`, w, h, g => { const r = rng(9); for (let i = 0; i < w * h / 200; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.1)'; g.fillRect(r() * w, r() * h, 2, 2); } }), x, y); }
  else plasticFill(ctx, x, y, w, h, baseColor, { gloss: 1 - f.faded * .8 - f.dirt * .5, textured: fin === 'rpe', seed: f.seed });
  // lime patina: soft darker weathering down from sills & roof
  if (f.patina > 0 && fin === 'lime') {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, `rgba(110,90,60,${.16 * f.patina})`); g.addColorStop(.25, 'rgba(110,90,60,0)'); g.addColorStop(.85, 'rgba(110,90,60,0)'); g.addColorStop(1, `rgba(110,90,60,${.14 * f.patina})`);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  // rising damp band
  if (f.moisture > 0) { const g = ctx.createLinearGradient(0, gy - h * .45, 0, gy); g.addColorStop(0, 'rgba(70,60,50,0)'); g.addColorStop(.5, `rgba(70,60,50,${.25 * f.moisture})`); g.addColorStop(1, `rgba(60,50,40,${.5 * f.moisture})`); ctx.fillStyle = g; ctx.fillRect(x, gy - h * .45, w, h * .45);
    // tide line
    ctx.strokeStyle = `rgba(80,65,50,${.5 * f.moisture})`; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const xx = x + i * w / 40, yy = gy - h * .3 * f.moisture - 20 * Math.sin(i * 1.3 + f.seed) * f.moisture; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  // salt efflorescence
  if (f.salt > 0) { const r = rng(f.seed + 50); for (let i = 0; i < 70; i++) { const xx = x + r() * w, yy = gy - r() * h * .35; ctx.fillStyle = `rgba(255,255,255,${.75 * f.salt})`; blob(ctx, xx, yy, (4 + r() * 12) * f.salt, i, .5, 7, `rgba(255,255,255,${.8 * f.salt})`); } }
  // dirt streaks (plastic attracts dust; streaks under sills)
  if (f.dirt > 0) {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, `rgba(80,80,80,${.25 * f.dirt})`); g.addColorStop(.3, `rgba(80,80,80,${.08 * f.dirt})`); g.addColorStop(1, `rgba(80,80,80,${.18 * f.dirt})`); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  // algae (green streaks from bottom & corners & under sills)
  if (f.algae > 0) {
    const r = rng(f.seed + 80);
    for (let i = 0; i < 26; i++) { const xx = x + r() * w, len = h * (.15 + r() * .35) * f.algae; const g = ctx.createLinearGradient(0, gy - len, 0, gy); g.addColorStop(0, 'rgba(90,130,60,0)'); g.addColorStop(1, `rgba(80,120,50,${.55 * f.algae})`); ctx.fillStyle = g; ctx.fillRect(xx, gy - len, 14 + r() * 30, len); }
    for (const side of [0, 1]) { const g = ctx.createLinearGradient(side ? x + w : x, 0, side ? x + w - 90 : x + 90, 0); g.addColorStop(0, `rgba(80,120,50,${.45 * f.algae})`); g.addColorStop(1, 'rgba(80,120,50,0)'); ctx.fillStyle = g; ctx.fillRect(side ? x + w - 90 : x, y, 90, h); }
  }
  ctx.restore();
  // windows & door
  const ww = w * .13, wh = w * .19;
  const wins = [[.2, .14], [.5, .14], [.8, .14], [.2, .56], [.8, .56]];
  wins.forEach(([u, v], i) => {
    const wx = x + w * u - ww / 2, wy = y + h * v;
    // shutters
    fillRR(ctx, wx - ww * .48, wy, ww * .45, wh, 3, mixColor(f.shutters, '#C8C8C8', f.faded * .6), C.ink, 3);
    fillRR(ctx, wx + ww * 1.03, wy, ww * .45, wh, 3, mixColor(f.shutters, '#C8C8C8', f.faded * .6), C.ink, 3);
    for (let k = 1; k < 6; k++) { line(ctx, wx - ww * .44, wy + k * wh / 6, wx - ww * .07, wy + k * wh / 6, rgba(C.ink, .3), 2); line(ctx, wx + ww * 1.07, wy + k * wh / 6, wx + ww * 1.44, wy + k * wh / 6, rgba(C.ink, .3), 2); }
    // frame
    fillRR(ctx, wx - 6, wy - 6, ww + 12, wh + 12, 4, C.limeShade, C.ink, 3);
    const gl = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh); gl.addColorStop(0, '#8FB9D3'); gl.addColorStop(1, '#5D8DAE');
    fillRR(ctx, wx, wy, ww, wh, 2, gl, C.ink, 3);
    line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, '#F3EEE6', 5); line(ctx, wx, wy + wh * .45, wx + ww, wy + wh * .45, '#F3EEE6', 5);
    line(ctx, wx + ww * .2, wy + wh * .12, wx + ww * .35, wy + wh * .05, 'rgba(255,255,255,.6)', 4);
    // sill
    fillRR(ctx, wx - 14, wy + wh + 4, ww + 28, 14, 3, C.stoneLight, C.ink, 3);
    if (f.dirt > 0 || f.algae > 0) { const g = ctx.createLinearGradient(0, wy + wh + 18, 0, wy + wh + 18 + h * .22); g.addColorStop(0, `rgba(${f.algae > f.dirt ? '80,110,55' : '70,70,70'},${.5 * Math.max(f.dirt, f.algae)})`); g.addColorStop(1, 'rgba(70,70,70,0)'); ctx.fillStyle = g; ctx.fillRect(wx + 6, wy + wh + 18, 12, h * .22); ctx.fillRect(wx + ww - 18, wy + wh + 18, 12, h * .22); }
    if (f.patina > 0 && fin === 'lime') { const g = ctx.createLinearGradient(0, wy + wh + 18, 0, wy + wh + 18 + h * .12); g.addColorStop(0, `rgba(120,95,60,${.18 * f.patina})`); g.addColorStop(1, 'rgba(120,95,60,0)'); ctx.fillStyle = g; ctx.fillRect(wx, wy + wh + 18, ww, h * .12); }
  });
  // door
  const dw = w * .14, dh = h * .38, dx = cx - dw / 2, dy = gy - dh;
  fillRR(ctx, dx - 10, dy - 10, dw + 20, dh + 10, [dw, dw, 0, 0], C.stoneLight, C.ink, 4);
  fillRR(ctx, dx, dy, dw, dh, [dw * .9, dw * .9, 0, 0], C.wood, C.ink, 4);
  line(ctx, cx, dy + 10, cx, gy, C.woodDark, 3); circle(ctx, cx + dw * .3, dy + dh * .6, 5, '#E3B54B', C.ink, 2);
  // damage on top
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (f.cracks > 0) { const r = rng(f.seed + 20); for (let i = 0; i < 7; i++) crack(ctx, x + w * (.08 + r() * .84), y + h * (r() * .5), h * (.25 + r() * .3), f.cracks, f.seed * 10 + i); }
  if (f.blisters > 0) { const r = rng(f.seed + 30); for (let i = 0; i < 26; i++) { const bx = x + r() * w, by = y + h * (.3 + r() * .7), s = 8 + r() * 18, d = r(); blister(ctx, bx, by, s, clamp((f.blisters - d * .6) / .4), baseColor); } }
  if (f.peel > 0) { const r = rng(f.seed + 40); for (let i = 0; i < 12; i++) { const px = x + r() * w, py = y + h * (.35 + r() * .62), s = 28 + r() * 55, d = r(); peelPatch(ctx, px, py, s, clamp((f.peel - d * .6) / .4), f.seed + i, i % 3 ? '#CFC3AE' : C.stone, baseColor); } }
  if (f.sparkle > 0) { for (let i = 0; i < 5; i++) { const k = (f.t * .7 + i * .37) % 1; const sx = x + w * hash(i * 7 + 1), sy = y + h * hash(i * 3 + 2) * .8; ctx.save(); ctx.globalAlpha = f.sparkle * Math.sin(k * Math.PI); ctx.translate(sx, sy); ctx.rotate(k); poly(ctx, [[0, -22], [5, -5], [22, 0], [5, 5], [0, 22], [-5, 5], [-22, 0], [-5, -5]], '#FFFFFF'); ctx.restore(); } }
  ctx.restore();
  // outline
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

// ground strip with grass tufts
function ground(ctx, gy, { color = C.grass, dark = C.grassDark, x0 = 0, x1 = W } = {}) {
  ctx.fillStyle = color; ctx.fillRect(x0, gy, x1 - x0, H - gy); ctx.fillStyle = dark; ctx.fillRect(x0, gy, x1 - x0, 8);
  for (let i = 0; i < 40; i++) { const x = x0 + hash(i) * (x1 - x0); line(ctx, x, gy + 4, x - 6, gy - 14, dark, 4); line(ctx, x + 6, gy + 4, x + 10, gy - 12, dark, 4); }
}

// Thermometer / gauge helper: vertical bar with fill level k (0..1)
function gauge(ctx, x, y, h, k, color = C.water, labelTxt = '') {
  fillRR(ctx, x - 22, y, 44, h, 22, '#FFFFFF', C.ink, 4);
  fillRR(ctx, x - 14, y + 8 + (h - 16) * (1 - k), 28, (h - 16) * k, 14, color);
  if (labelTxt) text(ctx, labelTxt, x, y + h + 40, { size: 34, font: FONT.title, weight: 600 });
}

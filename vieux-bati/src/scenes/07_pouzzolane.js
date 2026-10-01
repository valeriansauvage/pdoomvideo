// 07_pouzzolane.js — Chapitre 6 « Les enduits pouzzolaniques » (~45 s)
// Beats keyed on narration cues:
//   0 coffre au trésor → parchemin « 2000 ans »      1 baie de Naples : Vésuve, Pouzzoles, roche volcanique, Italie
//   2 bâtisseur romain : chaux + pouzzolane, prise sous l'eau      3 Panthéon + port romain, toujours debout
//   4 microscope : réaction pouzzolanique (SiO₂, Al₂O₃ + Ca(OH)₂ → cristaux)      5 jauges : dureté, eau & sels, perspirance
//   6 maison : soubassement, pluie battante, climat rude
'use strict';
(() => {
  const PZ = {
    rock: '#9A4B33', rockL: '#C7744F', rockD: '#64291C', hole: '#3E1910',
    tunic: '#B5452F', tunicD: '#86301F', skin: '#E3AE85', skinD: '#C48A62', hair: '#3B2A20',
    laurel: '#7DA34E', laurelD: '#557A33',
    marble: '#F1ECE1', marbleD: '#D9D0BE', granite: '#A39A8E', graniteD: '#81786D',
    brick: '#D2B999', brickD: '#B79C7B', dome: '#AEB3B7', domeD: '#858B90',
    skyT: '#8CC4E6', skyB: '#FBE9CF', sea: '#5AA8D6', seaD: '#2B73A6', seaFar: '#86C3E4',
    wet: '#8E837B', set: '#D3C4AC', mix: '#B79E90', lime: '#F4F0E6', pzPowder: '#A9553A',
    csh: '#F5F9FF', cshLine: '#5E86A3',
  };

  // ---------- small utilities ----------
  // keyframe interpolation: keys = [[t, value|array], ...]
  function pz_key(t, keys, fn = ease) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t < keys[i][0]) {
        const [t0, a] = keys[i - 1], [t1, b] = keys[i], k = fn(inv(t0, t1, t));
        return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k);
      }
    }
    return keys[keys.length - 1][1];
  }
  function pz_drift(ctx, t, t0, t1, cx = W / 2, cy = H / 2, amt = .03) {
    const s = 1 + amt * smooth(inv(t0, t1, t));
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  }
  function pz_at(ctx, dx, dy, fn) {
    if (Math.abs(dx) >= W || Math.abs(dy) >= H) return;
    ctx.save(); ctx.beginPath(); ctx.rect(dx, dy, W, H); ctx.clip(); ctx.translate(dx, dy); fn(); ctx.restore();
  }
  // shot sequencer with transitions ('pan' | 'up' | 'iris')
  function pz_run(ctx, t, shots) {
    let i = 0; for (let k = 1; k < shots.length; k++) if (t >= shots[k].t0) i = k;
    const cur = shots[i], dur = cur.dur || .9, q = i ? inv(cur.t0, cur.t0 + dur, t) : 1, p = ease(q);
    if (q >= 1) { cur.draw(); return; }
    const prev = shots[i - 1];
    if (cur.tr === 'pan') { pz_at(ctx, -p * W, 0, prev.draw); pz_at(ctx, (1 - p) * W, 0, cur.draw); }
    else if (cur.tr === 'up') { pz_at(ctx, 0, -p * H, prev.draw); pz_at(ctx, 0, (1 - p) * H, cur.draw); }
    else if (cur.tr === 'iris') {
      const R = lerp(cur.r0, 2300, Math.pow(q, 2.2));
      ctx.save(); const z = 1 + 1.6 * easeIn(q); ctx.translate(cur.ix, cur.iy); ctx.scale(z, z); ctx.translate(-cur.ix, -cur.iy); prev.draw(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(cur.ix, cur.iy, R, 0, TAU); ctx.clip();
      const z2 = lerp(1.3, 1, ease(q)); ctx.translate(cur.ix, cur.iy); ctx.scale(z2, z2); ctx.translate(-cur.ix, -cur.iy); cur.draw(); ctx.restore();
      circle(ctx, cur.ix, cur.iy, R + 6, null, '#4A423D', 18); circle(ctx, cur.ix, cur.iy, R - 6, null, 'rgba(255,255,255,.55)', 4);
    }
  }
  function pz_sparkle(ctx, x, y, s, a = 1, color = '#FFF3C4') {
    if (a <= 0 || s <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y);
    poly(ctx, [[0, -s], [s * .2, -s * .2], [s, 0], [s * .2, s * .2], [0, s], [-s * .2, s * .2], [-s, 0], [-s * .2, -s * .2]], color);
    ctx.restore();
  }
  function pz_okBadge(ctx, x, y, k, r = 26, color = C.good) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); const s = easeOutBack(k); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3);
    circle(ctx, 4, 6, r, 'rgba(0,0,0,.15)'); circle(ctx, 0, 0, r, color, C.ink, 4); check(ctx, -1, 2, r * 1.05, '#FFFFFF', 1);
    ctx.restore();
  }
  function pz_sky(ctx, hy) {
    const g = ctx.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, PZ.skyT); g.addColorStop(1, PZ.skyB);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
  }
  function pz_clouds(ctx, t, seed = 0) {
    for (let i = 0; i < 3; i++) cloud(ctx, ((i * 760 + seed * 300 + t * 11) % 2500) - 250, 135 + i * 48, 46 + i * 9, '#FFFFFF', .85);
  }
  // hand-drawn style arrow with a white halo
  function pz_arrow(ctx, x1, y1, x2, y2, k, curve = 0, color = C.ink) {
    if (k <= 0) return;
    arrow(ctx, x1, y1, x2, y2, { color: 'rgba(255,255,255,.75)', lw: 13, head: 30, k, curve });
    arrow(ctx, x1, y1, x2, y2, { color, lw: 6, head: 24, k, curve });
  }

  // ---------- volcanic rock (pouzzolane) ----------
  function pz_rockImg(r, seed, wob = .22) {
    const s = Math.ceil(r * 2.7);
    return cached(`pz_rock|${r}|${seed}|${wob}`, s, s, g => {
      const cx = s / 2, cy = s / 2;
      blob(g, cx, cy, r, seed, wob, 11);
      const gr = g.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r * 1.15);
      gr.addColorStop(0, PZ.rockL); gr.addColorStop(.55, PZ.rock); gr.addColorStop(1, PZ.rockD);
      g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      const R = rng(seed * 13 + 7);
      for (let i = 0; i < r * 1.6; i++) { g.fillStyle = R() < .5 ? 'rgba(255,225,195,.16)' : 'rgba(40,10,5,.16)'; g.fillRect(cx + (R() - .5) * 2 * r, cy + (R() - .5) * 2 * r, 2 + R() * 3, 2 + R() * 3); }
      const nh = Math.round(r * .42);
      for (let i = 0; i < nh; i++) { // vesicles (the holes of the porous rock)
        const a = R() * TAU, d = Math.sqrt(R()) * r * .95, hx = cx + Math.cos(a) * d, hy = cy + Math.sin(a) * d, hr = 2.5 + R() * r * .085;
        ellipse(g, hx, hy + hr * .28, hr * 1.02, hr * .82, 'rgba(255,205,170,.32)');
        ellipse(g, hx, hy, hr, hr * .76, PZ.hole);
      }
      g.restore();
      blob(g, cx, cy, r, seed, wob, 11, null, C.ink, Math.max(3, r * .035));
    });
  }
  function pz_rock(ctx, x, y, r, seed, rot = 0, k = 1, wob = .22) {
    if (k <= 0) return;
    const img = pz_rockImg(r, seed, wob);
    ctx.save(); ctx.translate(x, y); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
    ellipse(ctx, 10, r * .82, r * .95, r * .2, 'rgba(0,0,0,.18)');
    ctx.rotate(rot); ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
  }

  // ---------- beat 0: the treasure chest + scroll ----------
  function pz_scroll(ctx, x, y, open, t) {
    const pw = lerp(26, 600, open), ph = 176, rh = 222;
    fillRR(ctx, x - pw / 2 + 9, y - ph / 2 + 11, pw, ph, 6, 'rgba(0,0,0,.16)');
    const g = ctx.createLinearGradient(0, y - ph / 2, 0, y + ph / 2); g.addColorStop(0, '#FCF2D6'); g.addColorStop(1, '#EDD6A2');
    fillRR(ctx, x - pw / 2, y - ph / 2, pw, ph, 4, g, C.ink, 4);
    if (open > .15) {
      ctx.save(); rr(ctx, x - pw / 2, y - ph / 2, pw, ph, 4); ctx.clip();
      line(ctx, x - 250, y - 62, x + 250, y - 62, 'rgba(160,110,50,.35)', 3); line(ctx, x - 250, y + 62, x + 250, y + 62, 'rgba(160,110,50,.35)', 3);
      ctx.shadowColor = 'rgba(255,184,60,.95)'; ctx.shadowBlur = 26 + 10 * Math.sin(t * 4);
      text(ctx, '2000 ans', x, y + 6, { size: 104, font: FONT.title, weight: 700, color: '#C47F22', stroke: '#FFF7DC', sw: 12 });
      ctx.restore();
    }
    for (const sd of [-1, 1]) {
      const rx = x + sd * pw / 2;
      fillRR(ctx, rx - 18, y - rh / 2, 36, rh, 16, '#E7CE96', C.ink, 4);
      line(ctx, rx - 7, y - rh / 2 + 14, rx - 7, y + rh / 2 - 14, 'rgba(255,255,255,.55)', 5);
      fillRR(ctx, rx - 12, y - rh / 2 - 24, 24, 28, 9, C.wood, C.ink, 4);
      fillRR(ctx, rx - 12, y + rh / 2 - 4, 24, 28, 9, C.wood, C.ink, 4);
    }
  }
  function pz_chest(ctx, x, y, w, open, t, shake, inner) {
    const bh = w * .42, lh = w * .25, x0 = x - w / 2, top = y - bh, d = w * .1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(shake); ctx.translate(-x, -y);
    ellipse(ctx, x + 12, y + 8, w * .6, 22, 'rgba(0,0,0,.18)');
    // light pouring out of the chest
    if (open > 0) {
      ctx.save(); ctx.translate(x, top - d * .4); ctx.globalAlpha = .5 * open;
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI / 2 + (i - 5) * .2 + Math.sin(t * .7 + i) * .05, len = w * (1.05 + .22 * Math.sin(t * 1.6 + i * 2.1));
        ctx.beginPath(); ctx.moveTo(-w * .32 * Math.cos(a + Math.PI / 2) * .2, 0);
        ctx.lineTo(Math.cos(a - .055) * len, Math.sin(a - .055) * len); ctx.lineTo(Math.cos(a + .055) * len, Math.sin(a + .055) * len); ctx.closePath();
        ctx.fillStyle = '#FFE7A0'; ctx.fill();
      }
      ctx.restore();
      const g = ctx.createRadialGradient(x, top, 10, x, top, w);
      g.addColorStop(0, `rgba(255,240,180,${.95 * open})`); g.addColorStop(.35, `rgba(255,214,110,${.4 * open})`); g.addColorStop(1, 'rgba(255,214,110,0)');
      ctx.fillStyle = g; ctx.fillRect(x - w * 1.1, top - w, w * 2.2, w * 1.2);
    }
    // lid inner face (lid tilted back)
    const k1 = clamp(open * 2), k2 = clamp(open * 2 - 1);
    if (k2 > 0) {
      const hIn = lh * 1.45 * k2, yb = top - d;
      poly(ctx, [[x0 + 4, yb], [x0 + w - 4, yb], [x0 + w + 14 * k2, yb - hIn], [x0 - 14 * k2, yb - hIn]], '#5B3920', C.ink, 5);
      poly(ctx, [[x0 + 22, yb - 6], [x0 + w - 22, yb - 6], [x0 + w - 12 + 14 * k2, yb - hIn + 12], [x0 + 12 - 14 * k2, yb - hIn + 12]], '#7A4D2C');
      for (const u of [.18, .82]) { const bx = x0 + w * u; poly(ctx, [[bx - 15, yb], [bx + 15, yb], [bx + 15 + (u - .5) * 30 * k2, yb - hIn], [bx - 15 + (u - .5) * 30 * k2, yb - hIn]], '#D6A63C', C.ink, 3); }
    }
    // chest opening (top of the body)
    if (open > 0) {
      fillRR(ctx, x0 + 6, top - d, w - 12, d + 6, 6, '#3B2414', C.ink, 4);
      const g = ctx.createLinearGradient(0, top - d, 0, top); g.addColorStop(0, `rgba(255,236,160,${open})`); g.addColorStop(1, `rgba(255,190,70,${.6 * open})`);
      fillRR(ctx, x0 + 16, top - d + 6, w - 32, d - 4, 5, g);
    }
    if (inner) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, top + 2); ctx.clip(); inner(); ctx.restore(); }
    // body front
    fillRR(ctx, x0, top, w, bh, 12, C.wood, C.ink, 5);
    for (let i = 1; i < 4; i++) line(ctx, x0 + 8, top + i * bh / 4, x0 + w - 8, top + i * bh / 4, C.woodDark, 3);
    for (const u of [.18, .82]) { const bx = x0 + w * u; fillRR(ctx, bx - 15, top, 30, bh, 4, '#D6A63C', C.ink, 4); for (let j = 0; j < 3; j++) circle(ctx, bx, top + 22 + j * (bh - 44) / 2, 4, '#8A6A20'); }
    fillRR(ctx, x0 - 6, y - 22, w + 12, 22, 6, C.woodDark, C.ink, 4);
    // lock plate
    fillRR(ctx, x - 30, top + 6, 60, 70, 10, '#E3B54B', C.ink, 4);
    circle(ctx, x, top + 34, 8, '#2B2623'); poly(ctx, [[x - 5, top + 36], [x + 5, top + 36], [x + 3, top + 58], [x - 3, top + 58]], '#2B2623');
    // closed lid (squashes as it swings back)
    if (k1 < 1) {
      const by = lerp(top, top - d, k1), sy = 1 - k1;
      ctx.save(); ctx.translate(0, by); ctx.scale(1, sy); ctx.translate(0, -top);
      ctx.beginPath(); ctx.moveTo(x0 - 8, top); ctx.lineTo(x0 - 8, top - lh * .3); ctx.ellipse(x, top - lh * .3, w / 2 + 8, lh * .7, 0, Math.PI, TAU); ctx.lineTo(x0 + w + 8, top); ctx.closePath();
      ctx.fillStyle = '#A8754A'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
      ctx.save(); ctx.clip(); line(ctx, x0, top - lh * .45, x0 + w, top - lh * .45, C.woodDark, 3);
      for (const u of [.18, .82]) fillRR(ctx, x0 + w * u - 15, top - lh * 1.1, 30, lh * 1.2, 2, '#D6A63C', C.ink, 4);
      ctx.restore();
      fillRR(ctx, x - 22, top - 30, 44, 38, 8, '#E3B54B', C.ink, 4);
      ctx.restore();
    }
    ctx.restore();
  }
  function pz_shotA(ctx, S) {
    const t = S.t, c0 = S.cue(0), e0 = S.cueEnd(0), f = k => lerp(c0, e0, k);
    const tShake = f(.38), tOpen = f(.5), tScroll = f(.6);
    paperBg(ctx);
    ctx.save(); pz_drift(ctx, t, 0, S.cue(1), 760, 560, .05);
    const open = easeOut(inv(tOpen, tOpen + .55, t));
    // soft warm halo + faint rotating rays on the paper
    if (open > 0) {
      const g = ctx.createRadialGradient(760, 520, 20, 760, 520, 760); g.addColorStop(0, `rgba(255,214,120,${.55 * open})`); g.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const shk = t > tShake && t < tOpen ? Math.sin(t * 55) * .022 * smooth(inv(tShake, tOpen, t)) : 0;
    const rise = easeOutBack(inv(tScroll, tScroll + .75, t), 1.3), unroll = ease(inv(tScroll + .6, tScroll + 1.3, t));
    pz_chest(ctx, 760, 820, 440, open, t, shk, () => { if (rise > 0) pz_scroll(ctx, 760, lerp(760, 420, rise) + Math.sin(t * 2) * 6 * unroll, unroll, t); });
    // sparkles around the scroll
    if (unroll > 0) for (let i = 0; i < 9; i++) { const k = (t * .55 + i * .37) % 1; pz_sparkle(ctx, 760 + Math.cos(i * 2.4) * (330 + 40 * hash(i)), 420 + Math.sin(i * 2.4) * 150, 20 * Math.sin(k * Math.PI), unroll * Math.sin(k * Math.PI)); }
    ctx.restore();
    // « arme secrète ! » handwritten note
    const kn = appear(t, f(.42), .5);
    if (kn > 0) {
      ctx.save(); ctx.globalAlpha = kn; ctx.translate(330, 600); ctx.rotate(-.1);
      text(ctx, 'arme secrète !', 0, 0, { size: 72, font: FONT.hand, weight: 700, color: C.terracotta });
      ctx.restore();
      pz_arrow(ctx, 380, 650, 510, 720, kn, -.25, C.terracotta);
    }
  }

  // ---------- beat 1: Bay of Naples ----------
  const PZ_ITALY = [[7.5, 43.8], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [10.5, 42.9], [11.2, 42.4], [11.8, 42.1], [12.3, 41.7], [12.6, 41.45], [13.05, 41.2], [13.6, 41.2], [14.1, 40.8], [14.3, 40.6], [14.75, 40.68], [14.9, 40.25], [15.5, 40.05], [15.7, 39.95], [16.0, 39.4], [15.85, 38.65], [15.65, 38.1], [16.06, 37.92], [16.55, 38.4], [17.1, 38.9], [17.13, 39.1], [16.6, 39.6], [16.5, 39.75], [17.25, 40.47], [17.98, 40.05], [18.36, 39.8], [18.49, 40.15], [17.95, 40.64], [16.87, 41.13], [15.92, 41.63], [16.18, 41.88], [15.9, 41.93], [15.0, 42.0], [14.2, 42.46], [13.5, 43.62], [12.57, 44.06], [12.28, 44.42], [12.5, 44.95], [12.33, 45.44], [13.0, 45.7], [13.76, 45.65], [13.7, 46.5], [12.5, 47.0], [11.0, 46.9], [10.4, 46.6], [9.3, 46.5], [8.4, 46.3], [7.0, 45.9], [6.7, 45.1], [7.0, 44.2]];
  const PZ_SICILY = [[12.4, 37.8], [13.3, 38.2], [14.5, 38.05], [15.6, 38.27], [15.1, 37.5], [15.2, 37.0], [15.1, 36.65], [14.4, 36.8], [12.7, 37.55]];
  const PZ_SARDINIA = [[8.2, 41.0], [9.25, 41.25], [9.65, 40.6], [9.6, 39.15], [9.0, 39.1], [8.6, 38.87], [8.4, 39.1], [8.4, 40.0], [8.15, 40.6]];
  function pz_inset(ctx, x, y, k, t) {
    if (k <= 0) return;
    const w = 300, h = 360;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.rotate(-.03); ctx.globalAlpha *= clamp(k * 3); ctx.translate(-w / 2, -h / 2);
    fillRR(ctx, 8, 10, w, h, 22, 'rgba(0,0,0,.16)');
    fillRR(ctx, 0, 0, w, h, 22, '#D9EEF8', C.ink, 5);
    const kk = 26, P = ([lo, la]) => [22 + (lo - 6.4) * kk * .75, 22 + (47.3 - la) * kk];
    for (const shape of [PZ_ITALY, PZ_SICILY, PZ_SARDINIA]) poly(ctx, shape.map(P), '#EBD9B0', C.ink, 3);
    const [nx, ny] = P([14.15, 40.83]);
    const pr = (t * .8) % 1; circle(ctx, nx, ny, 8 + pr * 26, null, rgba(C.danger, 1 - pr), 4);
    circle(ctx, nx, ny, 9, C.danger, C.ink, 3);
    text(ctx, 'ITALIE', w * .66, h - 34, { size: 32, font: FONT.title, weight: 700, color: C.inkSoft });
    ctx.restore();
  }
  function pz_vesuvius(ctx, cx, by, w, t) {
    const h = w * .41;
    const P = [[-.56, 0], [-.42, .16], [-.29, .46], [-.19, .72], [-.13, .8], [-.07, .76], [-.01, .66], [.04, .66], [.08, .8], [.12, .96], [.15, 1], [.21, 1], [.24, .95], [.31, .68], [.42, .28], [.56, 0]].map(([u, v]) => [cx + u * w, by - v * h]);
    const path = () => { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) { const m = [(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2]; ctx.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); } ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]); ctx.closePath(); };
    path(); const g = ctx.createLinearGradient(0, by - h, 0, by); g.addColorStop(0, '#6E5C54'); g.addColorStop(1, '#54443E'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); path(); ctx.clip();
    ctx.fillStyle = 'rgba(25,15,15,.2)'; ctx.beginPath(); ctx.moveTo(cx + .18 * w, by - h * 1.1); ctx.lineTo(cx + .8 * w, by - h); ctx.lineTo(cx + .8 * w, by); ctx.lineTo(cx + .05 * w, by); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 10; i++) { const u = -.36 + i * .075, top = by - h * (.62 + .3 * Math.exp(-Math.pow((u - .17) / .14, 2))); ctx.beginPath(); ctx.moveTo(cx + u * w, top); ctx.quadraticCurveTo(cx + (u + .02 * (i % 2 ? 1 : -1)) * w, top + h * .3, cx + (u * 1.25) * w, by); ctx.strokeStyle = 'rgba(30,20,15,.22)'; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.fillStyle = '#7D8C55'; ctx.beginPath(); ctx.moveTo(cx - w, by + 5); for (let i = 0; i <= 40; i++) { const x = cx - .62 * w + i * w * 1.24 / 40; ctx.lineTo(x, by - h * (.2 + .05 * Math.sin(i * 1.7) + .03 * Math.sin(i * .6))); } ctx.lineTo(cx + w, by + 5); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 70; i++) { const x = cx - .55 * w + hash(i + 3) * w * 1.1, y = by - h * .16 * hash(i * 7 + 1) - 4; line(ctx, x - 6, y, x + 6, y, 'rgba(70,90,45,.55)', 3); }
    ctx.restore();
    path(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    const crx = cx + .18 * w, cry = by - h + 6;
    ellipse(ctx, crx, cry, w * .045, 7, '#3B2F2B');
    // gentle smoke
    for (let i = 0; i < 8; i++) { const k = (t * .11 + i / 8) % 1; puff(ctx, crx + k * 150 + Math.sin(k * 6 + i) * 14, cry - 14 - k * 250, 16 + k * 46, .62 * (1 - k) * clamp(k * 8), '#EFEAE5'); }
  }
  function pz_town(ctx, x0, x1, y, seed, scale = 1) {
    const r = rng(seed); let x = x0;
    while (x < x1) {
      const w = (26 + r() * 22) * scale, h = (20 + r() * 26) * scale, col = ['#F4EEE2', '#EAD3A6', '#E7BF96', '#F7E2C4', '#E9D8C0'][Math.floor(r() * 5)];
      fillRR(ctx, x, y - h, w, h, 2, col, C.ink, 2.5);
      poly(ctx, [[x - 3, y - h], [x + w / 2, y - h - 9 * scale], [x + w + 3, y - h]], C.roof, C.ink, 2.5);
      ctx.fillStyle = 'rgba(60,80,110,.6)'; ctx.fillRect(x + w * .3, y - h * .62, 5 * scale, 6 * scale);
      x += w + 4 + r() * 10;
    }
  }
  function pz_pin(ctx, x, y, k) {
    if (k <= 0) return;
    const dy = lerp(-260, 0, easeOutBack(k, 2.2));
    ctx.save(); ctx.globalAlpha *= clamp(k * 4);
    ellipse(ctx, x, y + 2, 22 * clamp(k * 2), 7 * clamp(k * 2), 'rgba(0,0,0,.25)');
    ctx.translate(x, y + dy);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-10, -26, -34, -40, -34, -66); ctx.arc(0, -66, 34, Math.PI, 0); ctx.bezierCurveTo(34, -40, 10, -26, 0, 0); ctx.closePath();
    ctx.fillStyle = C.danger; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    circle(ctx, 0, -66, 13, '#FFFFFF', C.ink, 3);
    ctx.restore();
  }
  function pz_shotB(ctx, S) {
    const t = S.t, c1 = S.cue(1), e1 = S.cueEnd(1), f = k => lerp(c1, e1, k);
    ctx.save(); pz_drift(ctx, t, c1 - .5, S.cue(2), 900, 560, .035);
    pz_sky(ctx, 640); pz_clouds(ctx, t, 1);
    // far hills
    ctx.fillStyle = '#B9C7CF'; ctx.beginPath(); ctx.moveTo(0, 610); for (let i = 0; i <= 24; i++) ctx.lineTo(i * 80, 560 - 30 * Math.abs(Math.sin(i * .9)) - 18 * Math.sin(i * 2.3)); ctx.lineTo(W, 610); ctx.closePath(); ctx.fill();
    pz_vesuvius(ctx, 1120, 606, 800, t);
    // shore with towns
    ctx.fillStyle = '#C9BD84'; ctx.fillRect(0, 590, W, 30); ctx.fillStyle = '#A99C62'; ctx.fillRect(0, 590, W, 4);
    pz_town(ctx, 470, 760, 606, 3, .9); pz_town(ctx, 820, 1010, 606, 7, .85); pz_town(ctx, 1450, 1880, 606, 11, .8);
    // sea
    const sg = ctx.createLinearGradient(0, 612, 0, H); sg.addColorStop(0, '#79BDE3'); sg.addColorStop(1, '#2E78AE');
    ctx.fillStyle = sg; ctx.fillRect(0, 612, W, H - 612);
    for (let j = 0; j < 9; j++) { const y = 636 + j * j * 6 + j * 22, sp = 200 + j * 25, dir = j % 2 ? 1 : -1; for (let i = -1; i < 12; i++) { const x = ((i * sp + j * 97 + t * (12 + j * 3) * dir) % (W + 2 * sp) + W + 2 * sp) % (W + 2 * sp) - sp; ctx.beginPath(); ctx.arc(x, y + 10, 14 + j * 3, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3; ctx.stroke(); } }
    // foreground rocky shore with chunks of pouzzolane
    const kr = appear(t, c1 - .1, .6);
    ctx.save(); ctx.translate(0, (1 - easeOut(kr)) * 160);
    poly(ctx, [[-30, H + 10], [-30, 860], [80, 818], [250, 796], [420, 806], [590, 830], [740, 872], [860, 940], [880, H + 10]], '#6E4335', C.ink, 5);
    for (let i = 0; i < 26; i++) circle(ctx, 40 + hash(i * 5) * 760, 860 + hash(i * 9) * 200, 3 + hash(i) * 6, 'rgba(30,10,5,.35)');
    pz_rock(ctx, 190, 790, 74, 4, .2, appear(t, c1, .5));
    pz_rock(ctx, 400, 772, 96, 8, -.3, appear(t, c1 + .15, .5));
    pz_rock(ctx, 600, 806, 62, 12, .5, appear(t, c1 + .3, .5));
    pz_rock(ctx, 300, 852, 40, 15, 0, appear(t, c1 + .4, .5));
    ctx.restore();
    // labels
    label(ctx, 'roche volcanique', 400, 640, { k: appear(t, f(.18), .5), size: 40, bg: '#F6E1D4' });
    pz_pin(ctx, 640, 600, appear(t, f(.42), .6));
    label(ctx, 'Pouzzoles (Pozzuoli)', 640, 470, { k: appear(t, f(.47), .5), size: 40 });
    label(ctx, 'Vésuve', 1440, 300, { k: appear(t, f(.64), .5), size: 40 });
    pz_arrow(ctx, 1380, 330, 1300, 360, appear(t, f(.68), .4), .2);
    ctx.restore();
    // title + Italy inset
    label(ctx, 'La pouzzolane', 960, 170, { k: appear(t, c1 - .1, .6), size: 64, bg: '#F2D3C2', color: PZ.rockD });
    pz_inset(ctx, 70, 115, appear(t, f(.8), .6), t);
  }

  // ---------- beat 2: Roman builder, mortar setting under water ----------
  function pz_roman(ctx, x, y, s, t, mix, look) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ellipse(ctx, 0, 4, 85, 14, 'rgba(0,0,0,.16)');
    for (const sd of [-1, 1]) {
      fillRR(ctx, sd * 28 - 15, -124, 30, 116, 12, PZ.skin, C.ink, 4);
      fillRR(ctx, sd * 28 - 22, -16, 50, 18, [10, 10, 5, 5], '#7A4B2A', C.ink, 4);
      line(ctx, sd * 28 - 13, -46, sd * 28 + 13, -38, '#7A4B2A', 5); line(ctx, sd * 28 - 13, -72, sd * 28 + 13, -64, '#7A4B2A', 5);
    }
    const m = Math.sin(t * 4.6) * mix, sway = m * .035;
    ctx.save(); ctx.rotate(sway);
    // hoe geometry
    const bx = 255 + 48 * m, by = -66, E = [bx - 200, by - 270];
    const H1 = [lerp(E[0], bx, .16), lerp(E[1], by, .16)], H2 = [lerp(E[0], bx, .44), lerp(E[1], by, .44)];
    // arms (noodle style, like Margot's)
    const arm = (sx, sy, hx, hy, bend) => {
      const mx = (sx + hx) / 2 + bend, my = (sy + hy) / 2 + Math.abs(bend) * .8;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, hx, hy); ctx.strokeStyle = C.ink; ctx.lineWidth = 36; ctx.stroke(); ctx.strokeStyle = PZ.skin; ctx.lineWidth = 27; ctx.stroke();
    };
    // far arm goes behind the body
    arm(-40, -268, H1[0], H1[1], 14);
    // tunic
    ctx.beginPath(); ctx.moveTo(-60, -294); ctx.lineTo(60, -294); ctx.quadraticCurveTo(78, -200, 86, -112); ctx.quadraticCurveTo(0, -98, -86, -112); ctx.quadraticCurveTo(-78, -200, -60, -294); ctx.closePath();
    ctx.fillStyle = PZ.tunic; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-82, -124); ctx.quadraticCurveTo(0, -110, 82, -124); ctx.strokeStyle = '#E3B54B'; ctx.lineWidth = 6; ctx.stroke();
    line(ctx, -20, -290, -26, -130, PZ.tunicD, 3); line(ctx, 24, -290, 30, -130, PZ.tunicD, 3);
    fillRR(ctx, -74, -208, 148, 18, 6, '#6B4226', C.ink, 3); circle(ctx, 0, -199, 8, '#E3B54B', C.ink, 3);
    fillRR(ctx, -80, -296, 44, 44, 16, PZ.tunic, C.ink, 4);
    // hoe
    line(ctx, E[0], E[1], bx, by, C.ink, 14); line(ctx, E[0], E[1], bx, by, C.wood, 8);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.atan2(by - E[1], bx - E[0])); poly(ctx, [[-8, -26], [16, -30], [22, 30], [-6, 26]], '#8E9499', C.ink, 4); ctx.restore();
    circle(ctx, H1[0], H1[1], 18, PZ.skin, C.ink, 4);
    // near arm in front
    arm(50, -268, H2[0], H2[1], 18); circle(ctx, H2[0], H2[1], 18, PZ.skin, C.ink, 4);
    fillRR(ctx, 34, -296, 44, 44, 16, PZ.tunic, C.ink, 4);
    // head
    ctx.save(); ctx.translate(0, -346); ctx.rotate(Math.sin(t * 1.3) * .04);
    ellipse(ctx, -44, 4, 10, 14, PZ.skin, C.ink, 4); ellipse(ctx, 44, 4, 10, 14, PZ.skin, C.ink, 4);
    circle(ctx, 0, 0, 46, PZ.skin, C.ink, 5);
    // beard
    ctx.beginPath(); ctx.moveTo(-45, 2); ctx.quadraticCurveTo(-42, 52, 0, 58); ctx.quadraticCurveTo(42, 52, 45, 2); ctx.quadraticCurveTo(34, 18, 22, 22); ctx.quadraticCurveTo(0, 14, -22, 22); ctx.quadraticCurveTo(-34, 18, -45, 2); ctx.closePath();
    ctx.fillStyle = PZ.hair; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, 33); ctx.quadraticCurveTo(0, 41, 12, 33); ctx.strokeStyle = '#E9A08E'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
    // hair cap with curls
    ctx.beginPath(); ctx.arc(0, -2, 47, Math.PI * 1.03, Math.PI * 1.97); ctx.quadraticCurveTo(26, -30, 0, -26); ctx.quadraticCurveTo(-26, -30, -47, -5); ctx.closePath(); ctx.fillStyle = PZ.hair; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    // eyes
    const lx = look * 5;
    for (const sd of [-1, 1]) { circle(ctx, sd * 17 + lx, -4, 6, '#1B120C'); circle(ctx, sd * 17 + lx + 2, -6, 2, '#FFFFFF'); line(ctx, sd * 17 - 9, -19, sd * 17 + 9, -21 + sd * 2, PZ.hair, 5); }
    ctx.beginPath(); ctx.moveTo(-2, 2); ctx.quadraticCurveTo(-8, 14, 3, 16); ctx.strokeStyle = PZ.skinD; ctx.lineWidth = 4; ctx.stroke();
    // laurel wreath
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1.08 + i * .105), rx = Math.cos(a) * 49, ry = -4 + Math.sin(a) * 49;
      for (const off of [-.5, .5]) { ctx.save(); ctx.translate(rx, ry); ctx.rotate(a + Math.PI / 2 + off); ellipse(ctx, 0, -9, 6, 12, i % 2 ? PZ.laurel : PZ.laurelD, C.ink, 2.5); ctx.restore(); }
    }
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }
  function pz_trough(ctx, x, y, w, level, color, t, stir) {
    const h = 92, wb = w * .86;
    fillRR(ctx, x - w / 2 + 6, y - h - 34, w - 12, 42, 8, '#4E321E', C.ink, 4);
    if (level > 0) {
      const top = lerp(y - h - 2, y - h - 30, clamp(level));
      ctx.save(); rr(ctx, x - w / 2 + 12, top, w - 24, y - h + 4 - top, 6); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(43,38,35,.5)'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.clip(); for (let i = 0; i < 4; i++) { const sx = x - w / 2 + 50 + i * 62 + Math.sin(t * 3 + i) * 14 * stir; ctx.beginPath(); ctx.ellipse(sx, top + 12, 20, 5, 0, 0, Math.PI); ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x - w / 2 + 12, top, w - 24, 5); ctx.restore();
    }
    poly(ctx, [[x - w / 2, y - h], [x + w / 2, y - h], [x + wb / 2, y], [x - wb / 2, y]], C.wood, C.ink, 5);
    for (let i = 1; i < 3; i++) line(ctx, x - w / 2 + 10, y - h + i * h / 3, x + w / 2 - 10, y - h + i * h / 3, C.woodDark, 3);
    fillRR(ctx, x - w / 2 - 8, y - h - 6, w + 16, 14, 4, '#B07D52', C.ink, 4);
  }
  function pz_sackPath(ctx) { ctx.beginPath(); ctx.moveTo(-30, -58); ctx.quadraticCurveTo(-76, -4, -60, 48); ctx.quadraticCurveTo(0, 78, 60, 48); ctx.quadraticCurveTo(76, -4, 30, -58); ctx.closePath(); }
  function pz_sack(ctx, x, y, tilt, powder, k) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
    ellipse(ctx, 6, 62, 50, 10, 'rgba(0,0,0,.12)');
    pz_sackPath(ctx); ctx.fillStyle = '#D9C29A'; ctx.fill();
    ctx.save(); ctx.clip();
    for (let i = -7; i < 8; i++) { line(ctx, i * 14 - 40, -80, i * 14 + 40, 80, 'rgba(120,90,50,.16)', 2); line(ctx, i * 14 + 40, -80, i * 14 - 40, 80, 'rgba(120,90,50,.1)', 2); }
    ellipse(ctx, -22, -6, 14, 30, 'rgba(255,255,255,.18)');
    ctx.restore();
    pz_sackPath(ctx); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    fillRR(ctx, -32, -52, 64, 12, 6, '#A0784A', C.ink, 3);
    ellipse(ctx, 0, -62, 34, 11, powder, C.ink, 4);
    ctx.restore();
  }
  // a falling stream of powder / mortar from (x, y0) to y1
  function pz_stream(ctx, x, y0, y1, t, color, wd, k) {
    if (k <= 0 || y1 <= y0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 4);
    ctx.beginPath(); ctx.moveTo(x - wd * .3, y0); for (let i = 0; i <= 10; i++) { const y = lerp(y0, y1, i / 10); ctx.lineTo(x - wd * (.3 + .2 * i / 10) + Math.sin(t * 9 + i) * 2, y); }
    for (let i = 10; i >= 0; i--) { const y = lerp(y0, y1, i / 10); ctx.lineTo(x + wd * (.3 + .2 * i / 10) + Math.sin(t * 8 + i * 1.3) * 2, y); }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(43,38,35,.45)'; ctx.lineWidth = 2.5; ctx.stroke();
    for (let i = 0; i < 10; i++) { const yy = y0 + ((t * 420 + i * 53) % Math.max(1, y1 - y0)); circle(ctx, x + Math.sin(i * 7 + t * 5) * wd * .6, yy, wd * .2, color, 'rgba(43,38,35,.35)', 1.5); }
    ctx.restore();
  }
  function pz_amphora(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ellipse(ctx, 6, 2, 34, 8, 'rgba(0,0,0,.15)');
    ctx.beginPath(); ctx.moveTo(-12, -118); ctx.lineTo(12, -118); ctx.lineTo(12, -100); ctx.quadraticCurveTo(46, -86, 40, -40); ctx.quadraticCurveTo(30, -6, 0, 0); ctx.quadraticCurveTo(-30, -6, -40, -40); ctx.quadraticCurveTo(-46, -86, -12, -100); ctx.closePath();
    ctx.fillStyle = '#C47A4E'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 12, -112); ctx.quadraticCurveTo(sd * 34, -114, sd * 26, -88); ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = '#C47A4E'; ctx.lineWidth = 4; ctx.stroke(); }
    line(ctx, -36, -62, 36, -62, 'rgba(90,40,20,.35)', 4); ellipse(ctx, -16, -60, 7, 20, 'rgba(255,255,255,.22)');
    ctx.restore();
  }
  function pz_shotC(ctx, S) {
    const t = S.t, c2 = S.cue(2), e2 = S.cueEnd(2), f = k => lerp(c2, e2, k);
    const quayY = 640, qx = 1000, seaY = 690, bedY = 900, fx0 = 1260, fx1 = 1560, fy0 = 596, trX = 770, trW = 300;
    ctx.save(); pz_drift(ctx, t, c2 - .5, S.cue(3), 900, 600, .025);
    pz_sky(ctx, 640); pz_clouds(ctx, t, 2);
    ctx.fillStyle = PZ.seaFar; ctx.fillRect(0, 600, W, 120); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 600, W, 4);
    ctx.fillStyle = '#AFC2B6'; ctx.beginPath(); ctx.moveTo(0, 604); ctx.quadraticCurveTo(300, 560, 640, 590); ctx.quadraticCurveTo(820, 600, 900, 604); ctx.closePath(); ctx.fill();
    // under water (cut-away)
    const wg = ctx.createLinearGradient(0, seaY, 0, bedY); wg.addColorStop(0, '#6AB3DE'); wg.addColorStop(1, '#2C6E9F');
    ctx.fillStyle = wg; ctx.fillRect(qx, seaY, W - qx, bedY - seaY + 1);
    for (let i = 0; i < 6; i++) { const x = qx + 60 + i * 170 + Math.sin(t * .8 + i) * 30; ctx.save(); ctx.globalAlpha = .1; poly(ctx, [[x, seaY], [x + 60, seaY], [x - 40, bedY], [x - 110, bedY]], '#FFFFFF'); ctx.restore(); }
    ctx.fillStyle = '#C9B58A'; ctx.fillRect(qx, bedY, W - qx, H - bedY);
    for (let i = 0; i < 18; i++) ellipse(ctx, qx + 40 + hash(i * 3) * (W - qx - 60), bedY + 16 + hash(i * 5) * 120, 8 + hash(i) * 14, 5 + hash(i) * 6, '#B09C70');
    for (let i = 0; i < 4; i++) { const x = qx + 120 + i * 230 + (i % 2) * 60; ctx.beginPath(); ctx.moveTo(x, bedY + 4); ctx.quadraticCurveTo(x - 14 + Math.sin(t * 1.4 + i) * 10, bedY - 40, x + Math.sin(t * 1.2 + i) * 16, bedY - 80); ctx.strokeStyle = '#4E8A55'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke(); }
    // formwork + mortar
    const fade = 1 - appear(t, f(.9), .45);
    if (fade > 0) {
      ctx.save(); ctx.globalAlpha = fade;
      fillRR(ctx, fx0, fy0, fx1 - fx0, bedY - fy0, 2, '#7E5536', C.ink, 4);
      for (let y = fy0 + 34; y < bedY; y += 34) line(ctx, fx0 + 4, y, fx1 - 4, y, '#5E3D24', 3);
      ctx.restore();
    }
    const fillK = ease(inv(f(.72), f(.86), t)), hard = smooth(inv(f(.8), f(.9), t));
    const topY = lerp(bedY, seaY - 26, fillK);
    if (fillK > 0) {
      const col = mixColor(PZ.wet, PZ.set, hard);
      ctx.save(); ctx.beginPath(); ctx.moveTo(fx0 + 6, bedY); ctx.lineTo(fx0 + 6, topY);
      for (let i = 0; i <= 12; i++) ctx.lineTo(lerp(fx0 + 6, fx1 - 6, i / 12), topY + Math.sin(t * 5 + i * 1.3) * 5 * (1 - hard));
      ctx.lineTo(fx1 - 6, bedY); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      ctx.save(); ctx.clip();
      for (let i = 0; i < 70; i++) { const xx = fx0 + 12 + hash(i * 3 + 1) * (fx1 - fx0 - 24), yy = bedY - hash(i * 7 + 2) * (bedY - topY); circle(ctx, xx, yy, 2 + hash(i) * 4, i % 3 ? 'rgba(150,70,45,.5)' : 'rgba(255,255,255,.45)'); }
      if (hard > 0) {
        ctx.globalAlpha = hard; const rows = 4, rh = (bedY - topY) / rows;
        for (let r = 1; r < rows; r++) line(ctx, fx0, topY + r * rh, fx1, topY + r * rh, 'rgba(110,90,70,.45)', 3);
        for (let r = 0; r < rows; r++) for (let i = 0; i < 3; i++) { const x = fx0 + (r % 2 ? 50 : 100) + i * 100; line(ctx, x, topY + r * rh, x, topY + (r + 1) * rh, 'rgba(110,90,70,.45)', 3); }
        const hg = ctx.createLinearGradient(fx0, 0, fx1, 0); hg.addColorStop(0, 'rgba(255,255,255,.25)'); hg.addColorStop(.4, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(0,0,0,.12)'); ctx.fillStyle = hg; ctx.fillRect(fx0, topY, fx1 - fx0, bedY - topY);
      }
      ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = lerp(3, 5, hard); ctx.stroke();
      ctx.restore();
    }
    if (fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.translate(0, -60 * (1 - fade)); for (const px of [fx0 - 12, fx1 + 12]) fillRR(ctx, px - 14, fy0 - 20, 28, bedY - fy0 + 24, 4, C.wood, C.ink, 4); fillRR(ctx, fx0 - 26, fy0 - 2, fx1 - fx0 + 52, 18, 4, '#A87A50', C.ink, 4); ctx.restore(); }
    // the formwork stands under water: light tint + surface
    ctx.fillStyle = 'rgba(60,150,210,.16)'; ctx.fillRect(qx, seaY, W - qx, bedY - seaY);
    ctx.beginPath(); ctx.moveTo(qx, seaY); for (let i = 0; i <= 48; i++) ctx.lineTo(qx + i * (W - qx) / 48, seaY + Math.sin(t * 2.4 + i * .8) * 4); ctx.strokeStyle = '#E8F6FF'; ctx.lineWidth = 5; ctx.stroke();
    if (fillK > 0 && fillK < 1) for (let i = 0; i < 14; i++) { const k = (t * .9 + i / 14) % 1; circle(ctx, lerp(fx0 + 30, fx1 - 30, hash(i * 5)) + Math.sin(k * 9 + i) * 8, lerp(topY, seaY + 6, k), 4 + hash(i) * 5, null, 'rgba(255,255,255,.8)', 2.5); }
    if (hard > 0) for (let i = 0; i < 8; i++) { const k = (t * .8 + i * .31) % 1; pz_sparkle(ctx, fx0 + 30 + hash(i * 11) * (fx1 - fx0 - 60), topY + 16 + hash(i * 13) * (bedY - topY - 40), 18 * Math.sin(k * Math.PI), hard * Math.sin(k * Math.PI), '#FFFFFF'); }
    // quay
    ctx.fillStyle = '#D6C7A6'; ctx.fillRect(0, quayY, qx, H - quayY);
    ctx.fillStyle = '#E6DAC0'; ctx.fillRect(0, quayY, qx, 14);
    for (let r = 0; r < 7; r++) { const y = quayY + 14 + r * 62; line(ctx, 0, y, qx, y, 'rgba(110,90,60,.45)', 3); for (let i = 0; i < 9; i++) { const x = ((r % 2) * 80 + i * 160) % qx; line(ctx, x, y, x, y + 62, 'rgba(110,90,60,.45)', 3); } }
    line(ctx, 0, quayY, qx, quayY, C.ink, 5); line(ctx, qx, quayY, qx, H, C.ink, 5);
    pz_amphora(ctx, 110, 646, 1, -.04); pz_amphora(ctx, 190, 650, .82, .06);
    // chute from the trough to the formwork
    const A = [trX + trW / 2 - 6, 556], B = [fx0 + 80, 584];
    const ca = Math.atan2(B[1] - A[1], B[0] - A[0]), cl = Math.hypot(B[0] - A[0], B[1] - A[1]);
    ctx.save(); ctx.translate(A[0], A[1]); ctx.rotate(ca);
    fillRR(ctx, 0, -8, cl, 22, 4, '#B07D52', C.ink, 4); line(ctx, 6, -8, cl - 6, -8, C.woodDark, 4);
    const pour = windowed(t, f(.7), f(.85), .1);
    if (pour > 0) {
      ctx.globalAlpha = pour; fillRR(ctx, 4, -16, cl - 8, 12, 6, PZ.mix, 'rgba(43,38,35,.5)', 2.5);
      for (let i = 0; i < 6; i++) { const u = (t * 1.1 + i / 6) % 1; circle(ctx, 10 + u * (cl - 20), -16, 9, PZ.mix, 'rgba(43,38,35,.45)', 2); }
    }
    ctx.restore();
    // support trestle under the chute
    line(ctx, qx - 30, quayY, qx + 20, 566, C.woodDark, 9); line(ctx, qx + 40, seaY + 40, qx + 30, 568, C.woodDark, 9);
    if (pour > 0) pz_stream(ctx, B[0] + 8, B[1] - 4, topY, t, PZ.mix, 28, pour);
    // trough, builder, sacks
    const kChaux = appear(t, f(.18), .45), kPz = appear(t, f(.38), .45);
    const pourC = windowed(t, f(.27), f(.42), .08), pourP = windowed(t, f(.47), f(.6), .08);
    const level = .45 * smooth(inv(f(.27), f(.4), t)) + .45 * smooth(inv(f(.47), f(.58), t)) - .55 * smooth(inv(f(.72), f(.86), t));
    const mixK = smooth(inv(f(.5), f(.66), t));
    const mixing = windowed(t, f(.05), f(.86), .3);
    pz_roman(ctx, 470, 646, 1, t, mixing, t > f(.7) ? 1 : .6);
    pz_trough(ctx, trX, 646, trW, level, mixColor(PZ.lime, PZ.mix, mixK), t, mixing);
    pz_sack(ctx, 700, 340, lerp(0, 2.25, ease(inv(f(.25), f(.3), t))) * (1 - ease(inv(f(.42), f(.46), t))), PZ.lime, kChaux * (1 - appear(t, f(.45), .3)));
    pz_sack(ctx, 850, 340, lerp(0, -2.25, ease(inv(f(.45), f(.5), t))) * (1 - ease(inv(f(.6), f(.64), t))), PZ.pzPowder, kPz * (1 - appear(t, f(.63), .3)));
    pz_stream(ctx, 748, 384, 556, t, '#FFFFFF', 28, pourC);
    pz_stream(ctx, 802, 384, 556, t, PZ.pzPowder, 28, pourP);
    ctx.restore();
    // labels
    const kl = 1 - appear(t, f(.52), .3);
    label(ctx, 'Chaux', 630, 228, { k: kChaux * kl, size: 44 });
    label(ctx, 'Pouzzolane', 930, 228, { k: kPz * kl, size: 44, bg: '#F2D3C2', color: PZ.rockD });
    label(ctx, 'Chaux + Pouzzolane', 780, 240, { k: appear(t, f(.52), .5), size: 48 });
    label(ctx, 'prise sous l\'eau', 1400, 500, { k: appear(t, f(.86), .5), size: 46, bg: C.goodLight });
    pz_okBadge(ctx, 1612, 498, appear(t, f(.89), .5), 30);
  }

  // ---------- beat 3: Pantheon + Roman harbour ----------
  function pz_pantheonImg(s) {
    const w = 1020 * s, h = 700 * s;
    return cached(`pz_pantheon|${s}`, w, h, g => {
      g.translate(w / 2, h - 30 * s); g.scale(s, s);
      ellipse(g, 0, 6, 500, 22, 'rgba(0,0,0,.16)');
      // rotunda (drum)
      const rg = g.createLinearGradient(-470, 0, 470, 0); rg.addColorStop(0, '#C2A685'); rg.addColorStop(.32, '#DCC6A6'); rg.addColorStop(1, '#B3967A');
      fillRR(g, -470, -392, 940, 392, 4, rg, C.ink, 5);
      for (let y = -380; y < 0; y += 16) line(g, -466, y, 466, y, 'rgba(120,90,60,.12)', 2);
      fillRR(g, -482, -404, 964, 18, 3, PZ.marbleD, C.ink, 4);
      fillRR(g, -474, -262, 948, 10, 2, PZ.marbleD, C.ink, 3);
      // dome steps + dome
      fillRR(g, -440, -428, 880, 26, 4, '#D3C3A8', C.ink, 4);
      fillRR(g, -410, -452, 820, 26, 4, '#CDBDA2', C.ink, 4);
      const dg = g.createLinearGradient(-300, -640, 300, -460); dg.addColorStop(0, '#C9CED2'); dg.addColorStop(1, PZ.domeD);
      g.beginPath(); g.ellipse(0, -452, 392, 186, 0, Math.PI, TAU); g.closePath(); g.fillStyle = dg; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke();
      g.save(); g.beginPath(); g.ellipse(0, -452, 392, 186, 0, Math.PI, TAU); g.clip();
      for (let i = 1; i < 5; i++) { g.beginPath(); g.ellipse(0, -452, 392 * (1 - i * .19), 186 * (1 - i * .19) + 10, 0, Math.PI, TAU); g.strokeStyle = 'rgba(70,75,80,.2)'; g.lineWidth = 3; g.stroke(); }
      g.restore();
      fillRR(g, -34, -646, 68, 12, 4, '#B9BEC2', C.ink, 3);
      // intermediate block with its upper pediment
      fillRR(g, -262, -478, 524, 478, 3, '#DCCAAD', C.ink, 4);
      poly(g, [[-282, -478], [282, -478], [0, -556]], PZ.marbleD, C.ink, 4);
      // portico interior
      fillRR(g, -292, -310, 584, 262, 2, '#6F6253', null);
      fillRR(g, -60, -258, 120, 208, [56, 56, 2, 2], '#5A4632', C.ink, 3);
      line(g, 0, -254, 0, -52, '#3F3022', 3);
      // columns
      for (let i = 0; i < 8; i++) {
        const cx = -262 + i * 74.85;
        fillRR(g, cx - 25, -66, 50, 14, 3, PZ.marble, C.ink, 3);
        const cg = g.createLinearGradient(cx - 18, 0, cx + 18, 0); cg.addColorStop(0, '#BDB5A9'); cg.addColorStop(1, '#857C70');
        poly(g, [[cx - 18, -66], [cx + 18, -66], [cx + 15, -280], [cx - 15, -280]], cg, C.ink, 3);
        poly(g, [[cx - 16, -280], [cx + 16, -280], [cx + 28, -306], [cx - 28, -306]], PZ.marble, C.ink, 3);
        for (const dx of [-14, 0, 14]) { g.beginPath(); g.arc(cx + dx, -284, 6, Math.PI, TAU); g.strokeStyle = 'rgba(80,70,60,.5)'; g.lineWidth = 2; g.stroke(); }
        fillRR(g, cx - 31, -314, 62, 9, 2, PZ.marble, C.ink, 3);
      }
      // entablature + inscription
      fillRR(g, -304, -338, 608, 26, 2, PZ.marble, C.ink, 4);
      g.fillStyle = '#5B514A'; g.font = `800 17px ${FONT.body}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M·AGRIPPA·L·F·COS·TERTIVM·FECIT', 0, -325);
      fillRR(g, -322, -356, 644, 20, 3, PZ.marbleD, C.ink, 4);
      // pediment
      poly(g, [[-322, -356], [322, -356], [0, -454]], PZ.marble, C.ink, 5);
      poly(g, [[-282, -366], [282, -366], [0, -438]], '#E4DCCB', null);
      // steps
      fillRR(g, -322, -52, 644, 18, 2, PZ.marble, C.ink, 4);
      fillRR(g, -342, -34, 684, 18, 2, '#E9E2D4', C.ink, 4);
      fillRR(g, -362, -16, 724, 18, 2, '#E1D9C9', C.ink, 4);
    });
  }
  function pz_ship(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 1.6) * 5); ctx.rotate(Math.sin(t * 1.2) * .03); ctx.scale(s, s);
    line(ctx, 0, -40, 0, -262, C.woodDark, 11);
    line(ctx, -122, -238, 122, -238, C.woodDark, 8);
    const bil = Math.sin(t * 1.5) * 6;
    ctx.beginPath(); ctx.moveTo(-114, -232); ctx.quadraticCurveTo(-130 - bil, -160, -108, -92); ctx.quadraticCurveTo(0, -74 + bil, 108, -92); ctx.quadraticCurveTo(130 + bil, -160, 114, -232); ctx.closePath();
    ctx.fillStyle = '#F5E9D0'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(181,69,47,.9)'; ctx.fillRect(-140, -176, 280, 34); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    line(ctx, 150, -62, 214, -150, C.woodDark, 7);
    poly(ctx, [[205, -146], [236, -112], [196, -96]], '#F5E9D0', C.ink, 4);
    ctx.beginPath(); ctx.moveTo(-172, -66); ctx.quadraticCurveTo(-164, 22, 0, 28); ctx.quadraticCurveTo(150, 24, 204, -62); ctx.lineTo(-172, -66); ctx.closePath();
    ctx.fillStyle = C.wood; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(181,69,47,.85)'; ctx.fillRect(-200, -50, 420, 14); for (let i = 0; i < 3; i++) line(ctx, -190, -24 + i * 16, 210, -24 + i * 16, C.woodDark, 3); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-166, -62); ctx.quadraticCurveTo(-214, -104, -178, -138); ctx.quadraticCurveTo(-160, -150, -156, -130);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 17; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = C.wood; ctx.lineWidth = 9; ctx.stroke();
    ctx.restore();
  }
  function pz_lighthouse(ctx, x, by, t, s = 1) {
    ctx.save(); ctx.translate(x, by); ctx.scale(s, s); ctx.translate(-x, -by);
    let y = by;
    [[100, 112], [78, 86], [56, 58]].forEach(([w, h], i) => {
      fillRR(ctx, x - w / 2, y - h, w, h, 3, i % 2 ? '#E9E1D0' : PZ.marble, C.ink, 4);
      if (i < 2) for (const dx of [-14, 14]) fillRR(ctx, x + dx - 6, y - h * .7, 12, 22, [6, 6, 0, 0], '#5A4632');
      fillRR(ctx, x - w / 2 - 6, y - h - 9, w + 12, 11, 3, PZ.marbleD, C.ink, 3);
      y -= h + 9;
    });
    const fl = 1 + .12 * Math.sin(t * 9) + .08 * Math.sin(t * 13.7);
    const g = ctx.createRadialGradient(x, y - 20, 4, x, y - 20, 90); g.addColorStop(0, 'rgba(255,214,110,.75)'); g.addColorStop(1, 'rgba(255,214,110,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 90, y - 110, 180, 180);
    ctx.save(); ctx.translate(x, y); ctx.scale(fl, fl);
    ctx.beginPath(); ctx.moveTo(0, -56); ctx.quadraticCurveTo(26, -22, 18, 0); ctx.lineTo(-18, 0); ctx.quadraticCurveTo(-26, -22, 0, -56); ctx.closePath(); ctx.fillStyle = '#F08A2E'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(12, -14, 8, 0); ctx.lineTo(-8, 0); ctx.quadraticCurveTo(-12, -14, 0, -34); ctx.closePath(); ctx.fillStyle = '#FFD45C'; ctx.fill();
    ctx.restore(); ctx.restore();
  }
  function pz_jetty(ctx, x0, x1, deckY, seaY, t) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, deckY, x1 - x0, 420);
    const span = 190; for (let ax = x0 + 70; ax + 110 < x1 + 200; ax += span) { ctx.moveTo(ax, deckY + 420); ctx.lineTo(ax, deckY + 96); ctx.arc(ax + 56, deckY + 96, 56, Math.PI, 0); ctx.lineTo(ax + 112, deckY + 420); ctx.closePath(); }
    ctx.fillStyle = '#D8C9A9'; ctx.fill('evenodd'); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.clip('evenodd');
    for (let y = deckY + 36; y < deckY + 420; y += 34) line(ctx, x0, y, x1, y, 'rgba(110,90,60,.35)', 3);
    for (let ax = x0 + 70; ax < x1 + 200; ax += span) { const g = ctx.createLinearGradient(ax - 78, 0, ax, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)'); ctx.fillStyle = g; ctx.fillRect(ax - 78, deckY, 78, 420); }
    ctx.restore();
    fillRR(ctx, x0 - 10, deckY - 8, x1 - x0 + 20, 34, 4, '#E6DAC0', C.ink, 5);
  }
  function pz_shotD(ctx, S, lens) {
    const t = S.t, c3 = S.cue(3), e3 = S.cueEnd(3), f = k => lerp(c3, e3, k);
    ctx.save(); pz_drift(ctx, t, c3 - .5, S.cue(4), 700, 560, .03);
    pz_sky(ctx, 720); pz_clouds(ctx, t, 3);
    // sea (behind everything on the right)
    const sg = ctx.createLinearGradient(0, 700, 0, H); sg.addColorStop(0, '#86C6E8'); sg.addColorStop(1, '#3A86BA');
    ctx.fillStyle = sg; ctx.fillRect(960, 700, W - 960, H - 700);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(960, 700, W - 960, 4);
    // distant hills, aqueduct and far ground
    ctx.fillStyle = '#C5D0C6'; ctx.beginPath(); ctx.moveTo(0, 702); ctx.quadraticCurveTo(260, 630, 560, 676); ctx.quadraticCurveTo(820, 640, 1010, 702); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(-10, 640, 330, 64); for (let i = 0; i < 6; i++) { const ax = 6 + i * 54; ctx.moveTo(ax, 704); ctx.lineTo(ax, 668); ctx.arc(ax + 18, 668, 18, Math.PI, 0); ctx.lineTo(ax + 36, 704); ctx.closePath(); } ctx.fillStyle = '#C9BC9C'; ctx.fill('evenodd'); ctx.restore();
    ctx.fillStyle = '#DACDAF'; ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(1000, 700); ctx.lineTo(1036, 790); ctx.lineTo(0, 790); ctx.closePath(); ctx.fill();
    // harbour: jetty with arches, lighthouse, ship
    pz_jetty(ctx, 1190, 1990, 606, 706, t);
    pz_lighthouse(ctx, 1520, 600, t, .8);
    ctx.fillStyle = 'rgba(60,140,200,.5)'; ctx.fillRect(1000, 708, W - 1000, H - 708);
    ctx.beginPath(); ctx.moveTo(1000, 708); for (let i = 0; i <= 40; i++) ctx.lineTo(1000 + i * (W - 1000) / 40, 708 + Math.sin(t * 2.2 + i * .9) * 4); ctx.strokeStyle = '#E8F6FF'; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 0; i < 4; i++) { const k = (t * .55 + i * .27) % 1, px = 1316 + i * 190; for (let j = 0; j < 4; j++) circle(ctx, px + (j - 1.5) * 16 * (1 + k), 704 - Math.sin(k * Math.PI) * (26 + j * 8), 7 * (1 - k), 'rgba(255,255,255,.9)'); }
    pz_ship(ctx, 1725, 760, .72, t);
    // plaza in front of the Pantheon
    ctx.fillStyle = '#E2D4B6'; ctx.beginPath(); ctx.moveTo(0, 790); ctx.lineTo(1036, 790); ctx.lineTo(1110, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    line(ctx, 0, 790, 1036, 790, C.ink, 4); line(ctx, 1000, 700, 1036, 790, C.ink, 4); line(ctx, 1036, 790, 1110, H, C.ink, 4);
    for (let i = 0; i < 8; i++) line(ctx, i * 150, 790, i * 180 - 60, H, 'rgba(120,100,70,.22)', 3);
    for (let j = 1; j < 4; j++) line(ctx, 0, 790 + j * j * 22, 1060, 790 + j * j * 22, 'rgba(120,100,70,.22)', 3);
    const img = pz_pantheonImg(.86);
    ctx.drawImage(img, 600 - img.width / 2, 820 - img.height + 30 * .86);
    ctx.restore();
    // labels
    label(ctx, 'Panthéon — an 125', 600, 180, { k: appear(t, f(.18), .5), size: 46 });
    label(ctx, 'Ports romains', 1240, 500, { k: appear(t, f(.42), .5), size: 46 });
    pz_okBadge(ctx, 870, 178, appear(t, f(.66), .5), 28);
    pz_okBadge(ctx, 1436, 498, appear(t, f(.72), .5), 28);
    if (lens) lens();
  }
  // magnifying glass that flies over the Pantheon dome before the iris transition
  function pz_lens(ctx, x, y, r, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 3);
    ctx.save(); ctx.translate(x, y); ctx.rotate(.75); fillRR(ctx, r - 4, -18, r * 1.5, 36, 14, C.wood, C.ink, 5); ctx.restore();
    circle(ctx, x + 6, y + 8, r, 'rgba(0,0,0,.12)');
    circle(ctx, x, y, r, 'rgba(210,235,250,.35)', '#4A423D', 14);
    ctx.beginPath(); ctx.arc(x, y, r * .7, Math.PI * 1.1, Math.PI * 1.45); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.restore();
  }

  // ---------- beat 4: the pozzolanic reaction under the microscope ----------
  const PZ_GR = [[470, 380, 125, 3], [830, 610, 148, 7], [1190, 372, 116, 11], [1215, 772, 98, 5], [420, 782, 92, 9]];
  const PZ_BR = [[0, 1, 0], [1, 2, .15], [1, 3, .45], [1, 4, .3], [0, 4, .6], [2, 3, .75]];
  const PZ_NEEDLES = (() => {
    const out = [];
    PZ_BR.forEach(([a, b, d], bi) => {
      const A = PZ_GR[a], B = PZ_GR[b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, ang = Math.atan2(dy, dx);
      const gap = L - A[2] - B[2];
      for (const [G, dir] of [[A, 0], [B, Math.PI]]) {
        for (let i = 0; i < 7; i++) {
          const h1 = hash(bi * 31 + i * 7 + dir * 3), h2 = hash(bi * 17 + i * 13 + dir * 5 + 1);
          const off = (i - 3) * .12 + (h1 - .5) * .08, a2 = ang + dir + off * 2;
          const bxp = G[0] + Math.cos(ang + dir + off) * G[2] * .86, byp = G[1] + Math.sin(ang + dir + off) * G[2] * .86;
          out.push({ b: bi, x: bxp, y: byp, a: a2, L: (gap / 2 + G[2] * .14 + 22) * (.85 + .4 * h2) / Math.max(.6, Math.cos(off * 2)), w: 11 + h1 * 6, d: h2 * .3 });
        }
      }
    });
    // short fuzz around each grain
    PZ_GR.forEach((G, gi) => { for (let i = 0; i < 13; i++) { const a = i / 13 * TAU + hash(gi * 9 + i) * .3; out.push({ b: -1 - gi, x: G[0] + Math.cos(a) * G[2] * .88, y: G[1] + Math.sin(a) * G[2] * .88, a: a + (hash(i + gi) - .5) * .5, L: 18 + hash(i * 3 + gi) * 22, w: 7 + hash(i * 5 + gi) * 3, d: hash(i * 7 + gi) * .4 }); } });
    return out;
  })();
  const PZ_BMID = PZ_BR.map(([a, b]) => { const A = PZ_GR[a], B = PZ_GR[b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy); const pa = A[2] / L, pb = 1 - B[2] / L, m = (pa + pb) / 2; return [A[0] + dx * m, A[1] + dy * m]; });
  function pz_needlePath(ctx, x, y, a, L, wd) {
    const dx = Math.cos(a), dy = Math.sin(a), px = -dy * wd / 2, py = dx * wd / 2;
    ctx.moveTo(x, y); ctx.lineTo(x + dx * L * .14 + px, y + dy * L * .14 + py); ctx.lineTo(x + dx * L * .84 + px, y + dy * L * .84 + py);
    ctx.lineTo(x + dx * L, y + dy * L); ctx.lineTo(x + dx * L * .84 - px, y + dy * L * .84 - py); ctx.lineTo(x + dx * L * .14 - px, y + dy * L * .14 - py); ctx.closePath();
  }
  function pz_shotE(ctx, S) {
    const t = S.t, c4 = S.cue(4), e4 = S.cueEnd(4), f = k => lerp(c4, e4, k);
    const bg = ctx.createRadialGradient(860, 540, 80, 860, 540, 1150); bg.addColorStop(0, '#F1F9FC'); bg.addColorStop(1, '#BBD9E7');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.save(); pz_drift(ctx, t, c4 - .6, S.cue(5), 860, 560, .04);
    // pore water: drifting tiny molecules
    for (let i = 0; i < 70; i++) { const x = (hash(i * 3) * W + t * (8 + hash(i) * 14)) % W, y = (hash(i * 7) * H + Math.sin(t * .7 + i) * 14); circle(ctx, x, y, 3 + hash(i * 11) * 4, 'rgba(90,150,190,.22)'); }
    // bridge start times
    const tb = PZ_BR.map(([, , d]) => lerp(f(.47), f(.74), d));
    const grow = b => b >= 0 ? easeOut(inv(tb[b], tb[b] + 1.7, t)) : 0;
    const grainStart = gi => Math.min(...PZ_BR.map(([a, b2], i) => (a === gi || b2 === gi) ? tb[i] : 1e9));
    // crystals (drawn under the grains so they sprout from inside)
    const gn = PZ_NEEDLES.map(n => {
      if (n.b >= 0) return clamp((grow(n.b) - n.d * .5) / (1 - n.d * .5));
      const ts = grainStart(-1 - n.b); return easeOut(inv(ts + .3 + n.d, ts + 2 + n.d, t));
    });
    // soft glow along the bridges as they form
    PZ_BR.forEach((br, bi) => { const g = grow(bi); if (g <= 0) return; const [mx, my] = PZ_BMID[bi]; const rg = ctx.createRadialGradient(mx, my, 5, mx, my, 120); rg.addColorStop(0, `rgba(255,255,255,${.7 * g})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(mx - 120, my - 120, 240, 240); });
    ctx.beginPath(); let any = false;
    PZ_NEEDLES.forEach((n, i) => { const g = gn[i]; if (g <= 0) return; any = true; pz_needlePath(ctx, n.x, n.y, n.a, n.L * g, n.w * (.4 + .6 * g)); });
    if (any) {
      ctx.fillStyle = PZ.csh; ctx.fill(); ctx.strokeStyle = PZ.cshLine; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.beginPath(); PZ_NEEDLES.forEach((n, i) => { const g = gn[i]; if (g <= .2 || n.b < 0) return; const L = n.L * g, ca = Math.cos(n.a), sa = Math.sin(n.a); ctx.moveTo(n.x + ca * L * .25, n.y + sa * L * .25); ctx.lineTo(n.x + ca * L * .8, n.y + sa * L * .8); });
      ctx.strokeStyle = 'rgba(160,190,215,.55)'; ctx.lineWidth = 2; ctx.stroke();
    }
    // grains
    PZ_GR.forEach(([x, y, r, seed], i) => {
      const k = appear(t, c4 - .6 + i * .08, .5);
      pz_rock(ctx, x, y + Math.sin(t * .9 + i) * 3, r, seed + 20, i * .7, k, .1);
    });
    // twinkles on the finished crystal bridges
    PZ_BR.forEach((br, bi) => { const g = grow(bi); if (g < .8) return; const [mx, my] = PZ_BMID[bi]; for (let j = 0; j < 2; j++) { const k = (t * .7 + bi * .37 + j * .5) % 1; pz_sparkle(ctx, mx + (hash(bi * 5 + j) - .5) * 90, my + (hash(bi * 7 + j) - .5) * 70, 16 * Math.sin(k * Math.PI), Math.sin(k * Math.PI), '#FFFFFF'); } });
    // grain labels
    const lab = [['SiO₂', 0, 0, .06], ['Al₂O₃', 1, 0, .2], ['SiO₂', 2, 0, .1], ['SiO₂', 3, 0, .14], ['Al₂O₃', 4, 0, .24], ['SiO₂', 1, 1, .1]];
    lab.forEach(([s, gi, row, d]) => { const G = PZ_GR[gi], k = appear(t, f(d), .4); if (k <= 0) return; ctx.save(); ctx.translate(G[0], G[1] + (row ? 46 : (gi === 1 ? -36 : 0)) + Math.sin(t * .9 + gi) * 3); const sc = easeOutBack(k); ctx.scale(sc, sc); text(ctx, s, 0, 0, { size: gi === 1 ? 50 : 44, font: FONT.title, weight: 700, color: '#FFFFFF', stroke: C.ink, sw: 9 }); ctx.restore(); });
    // Ca(OH)₂ particles travelling to each bridge, then dissolving
    PZ_BR.forEach((br, bi) => {
      const [mx, my] = PZ_BMID[bi];
      for (let j = 0; j < 3; j++) {
        const sx = 1560 + hash(bi * 7 + j) * 200, sy = 120 + hash(bi * 11 + j * 3) * 420, ex = mx + (j - 1) * 30 + (hash(bi + j * 5) - .5) * 20, ey = my + (hash(bi * 3 + j) - .5) * 50;
        const t0 = tb[bi] - 1.8 - j * .15, k = ease(inv(t0, tb[bi], t)), gone = inv(tb[bi], tb[bi] + .7, t);
        if (k <= 0 || gone >= 1) continue;
        const x = lerp(sx, ex, k) + Math.sin(t * 3 + j + bi) * 10 * (1 - k), y = lerp(sy, ey, k) + Math.cos(t * 2.6 + j) * 10 * (1 - k), r = 17 * (1 - gone);
        ctx.save(); ctx.globalAlpha *= 1 - gone;
        const pg = ctx.createRadialGradient(x - r * .35, y - r * .35, 1, x, y, r); pg.addColorStop(0, '#FFFFFF'); pg.addColorStop(1, '#DCE3E8');
        circle(ctx, x, y, r, pg, C.ink, 3);
        if (j === 1 && bi < 3) label(ctx, 'Ca(OH)₂', x, y - 44, { k: clamp(k * 4) * (1 - gone), size: 30, bg: '#FFFFFF' });
        ctx.restore();
      }
    });
    ctx.restore();
    // labels / title
    const kt = appear(t, f(.76), .6, easeOutBack);
    label(ctx, 'au microscope', 860, 150, { k: appear(t, c4 - .2, .5) * (1 - appear(t, f(.72), .3)), size: 40, font: FONT.title, bg: '#FFFFFF' });
    if (kt > 0) { ctx.save(); ctx.translate(860, 150); const pulse = 1 + .04 * Math.sin(t * 5) * appear(t, f(.8), .4); ctx.scale(pulse, pulse); label(ctx, 'Réaction pouzzolanique', 0, 0, { k: kt, size: 60, bg: '#FFE7B8' }); ctx.restore(); }
    const kf = appear(t, f(.84), .6);
    if (kf > 0) {
      ctx.save(); ctx.translate(1640, 390); const sc = easeOutBack(kf); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kf * 3);
      fillRR(ctx, -168 + 7, -96 + 9, 336, 192, 24, 'rgba(0,0,0,.14)'); fillRR(ctx, -168, -96, 336, 192, 24, '#FFFFFF', C.ink, 5);
      text(ctx, 'Ca(OH)₂ + SiO₂', 0, -52, { size: 38, font: FONT.title, weight: 600 });
      arrow(ctx, 0, -24, 0, 18, { color: C.ink, lw: 7, head: 20 });
      text(ctx, 'C‑S‑H', 0, 56, { size: 50, font: FONT.title, weight: 700, color: PZ.cshLine });
      ctx.restore();
    }
    const kc = appear(t, f(.6), .5);
    label(ctx, 'silicates de calcium hydratés', 830, 292, { k: kc, size: 36, bg: PZ.csh });
    pz_arrow(ctx, 720, 322, 650, 452, appear(t, f(.63), .4), .15);
    pz_arrow(ctx, 940, 322, 1010, 446, appear(t, f(.65), .4), -.15);
  }

  // ---------- beat 5: gauges ----------
  function pz_icon(ctx, kind, x, y, t) {
    circle(ctx, x + 5, y + 7, 58, 'rgba(0,0,0,.14)');
    circle(ctx, x, y, 58, '#FFFFFF', C.ink, 5);
    if (kind === 'hammer') {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-.6 + Math.sin(t * 3) * .1);
      fillRR(ctx, -6, -14, 12, 54, 5, C.wood, C.ink, 3); fillRR(ctx, -28, -32, 56, 22, 5, '#8E9499', C.ink, 3);
      ctx.restore();
    } else if (kind === 'drop') {
      drop(ctx, x - 14, y + 6, 18, C.water, C.ink);
      ctx.save(); ctx.translate(x + 22, y + 12); ctx.rotate(.3); fillRR(ctx, -12, -12, 24, 24, 3, '#FFFFFF', C.ink, 3); line(ctx, -6, -4, 4, -4, 'rgba(0,0,0,.2)', 2); ctx.restore();
    } else {
      for (let i = 0; i < 3; i++) { ctx.beginPath(); const xx = x - 22 + i * 22; for (let j = 0; j <= 12; j++) { const yy = y + 32 - j * 5.5; ctx.lineTo(xx + Math.sin(j * .9 - t * 4 + i) * 6, yy); } ctx.strokeStyle = '#6FA8D3'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); }
    }
  }
  function pz_shotF(ctx, S) {
    const t = S.t, c5 = S.cue(5), e5 = S.cueEnd(5), f = k => lerp(c5, e5, k);
    paperBg(ctx);
    ctx.save(); pz_drift(ctx, t, c5 - .5, S.cue(6), 760, 540, .025);
    label(ctx, 'Enduit chaux + pouzzolane', 760, 170, { k: appear(t, c5 - .3, .5), size: 50, bg: '#F2D3C2', color: PZ.rockD });
    const rows = [
      { y: 330, name: 'Dureté', v: .9, base: .5, tk: f(.12), icon: 'hammer', col: '#B5573A', end: 'up' },
      { y: 530, name: 'Résistance eau & sels', v: .86, base: .42, tk: f(.34), icon: 'drop', col: C.water, end: 'up' },
      { y: 730, name: 'Perspirance', v: .86, base: .86, tk: f(.7), icon: 'vapor', col: '#7FB7D9', end: 'ok' },
    ];
    const bx = 320, bw = 860, bh = 52;
    rows.forEach((r, i) => {
      const k = appear(t, r.tk - .25, .45); if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(k * 2); ctx.translate(lerp(-60, 0, easeOut(k)), 0);
      pz_icon(ctx, r.icon, 200, r.y + 6, t);
      text(ctx, r.name, bx, r.y - 30, { size: 46, font: FONT.title, weight: 600, align: 'left' });
      fillRR(ctx, bx, r.y + 6, bw, bh, bh / 2, '#FFFFFF', C.ink, 4);
      const v = r.v * easeOutBack(inv(r.tk, r.tk + .9, t), 1.2), bl = (bw - 8) * r.base;
      if (v > 0) {
        ctx.save(); rr(ctx, bx + 4, r.y + 10, Math.max(bh - 8, (bw - 8) * v), bh - 8, (bh - 8) / 2); ctx.fillStyle = r.col; ctx.fill(); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(bx, r.y, bl + 4, bh + 20);
        for (let i = -bh; i < bl; i += 16) line(ctx, bx + 4 + i, r.y + bh + 6, bx + 4 + i + bh, r.y + 6, 'rgba(255,255,255,.55)', 4, 'butt');
        ctx.restore();
      }
      line(ctx, bx + 4 + bl, r.y - 2, bx + 4 + bl, r.y + bh + 14, C.ink, 4);
      const ke = appear(t, r.tk + .7, .4);
      if (r.end === 'up') { if (ke > 0) { ctx.save(); ctx.translate(bx + bw + 58, r.y + 32); const s = easeOutBack(ke); ctx.scale(s, s); circle(ctx, 0, 0, 34, C.good, C.ink, 4); arrow(ctx, 0, 18, 0, -18, { color: '#FFFFFF', lw: 9, head: 20 }); ctx.restore(); } }
      else pz_okBadge(ctx, bx + bw + 58, r.y + 32, ke, 34);
      ctx.restore();
    });
    // legend
    const kl = appear(t, f(.12), .5);
    if (kl > 0) {
      ctx.save(); ctx.globalAlpha = kl;
      ctx.save(); rr(ctx, 330, 846, 60, 30, 15); ctx.fillStyle = '#B5573A'; ctx.fill(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(330, 846, 60, 30); for (let i = -30; i < 60; i += 16) line(ctx, 330 + i, 876, 360 + i, 846, 'rgba(255,255,255,.55)', 4, 'butt'); ctx.restore(); fillRR(ctx, 330, 846, 60, 30, 15, null, C.ink, 3);
      text(ctx, 'chaux seule', 404, 862, { size: 32, font: FONT.body, weight: 800, align: 'left', color: C.inkSoft });
      fillRR(ctx, 660, 846, 60, 30, 15, '#B5573A', C.ink, 3);
      text(ctx, 'chaux + pouzzolane', 734, 862, { size: 32, font: FONT.body, weight: 800, align: 'left', color: C.inkSoft });
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------- beat 6: where to use it ----------
  function pz_renderTex(w, h) {
    return cached(`pz_rend|${w}|${h}`, w, h, g => {
      g.fillStyle = '#CDB5A2'; g.fillRect(0, 0, w, h); const r = rng(77);
      for (let i = 0; i < w * h / 50; i++) { g.fillStyle = r() < .45 ? 'rgba(150,70,45,.5)' : r() < .7 ? 'rgba(90,60,50,.25)' : 'rgba(255,255,255,.4)'; const s = 1 + r() * 3; g.fillRect(r() * w, r() * h, s, s); }
    });
  }
  function pz_shotG(ctx, S) {
    const t = S.t, c6 = S.cue(6), e6 = S.cueEnd(6), f = k => lerp(c6, e6, k);
    const gy = 880, hw = 760, hx = 800, hh = hw * .62;
    ctx.save(); pz_drift(ctx, t, c6 - .5, S.d, 900, 600, .03);
    skyBg(ctx, t, { groundY: gy, clouds: false });
    for (let i = 0; i < 2; i++) cloud(ctx, ((i * 900 + t * 10) % 2300) - 200, 150 + i * 60, 52, '#FFFFFF', .85);
    ground(ctx, gy);
    // rain (wet façade)
    const kr = appear(t, f(.32), .8);
    house(ctx, hx, gy, hw, { finish: 'lime', color: '#EBD8B2', shutters: '#6F8F8A', t, patina: .3 });
    // soubassement band (lime + pouzzolane render)
    const x0 = hx - hw / 2, bandH = hw * .0828 - 26, by0 = gy - bandH, dw = hw * .14;
    const kb = appear(t, f(.06), .6);
    if (kb > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(x0, by0, hw * kb, bandH); ctx.rect(hx - dw / 2 - 14, by0 - 2, dw + 28, bandH + 4); ctx.clip('evenodd');
      ctx.drawImage(pz_renderTex(Math.round(hw), Math.round(bandH)), x0, by0);
      line(ctx, x0, by0, x0 + hw, by0, C.ink, 4);
      ctx.restore();
      const pulse = .5 + .5 * Math.sin(t * 5);
      ctx.save(); ctx.globalAlpha = kb * (.55 + .45 * pulse); ctx.shadowColor = '#FFC94A'; ctx.shadowBlur = 20;
      rr(ctx, x0 - 8, by0 - 8, hw + 16, bandH + 16, 10); ctx.strokeStyle = '#F2B843'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    }
    if (kr > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(x0, gy - hh, hw, hh); ctx.clip();
      const g = ctx.createLinearGradient(x0 + hw * .35, 0, x0 + hw, 0); g.addColorStop(0, 'rgba(70,90,110,0)'); g.addColorStop(1, `rgba(70,90,110,${.22 * kr})`); ctx.fillStyle = g; ctx.fillRect(x0, gy - hh, hw, hh);
      for (let i = 0; i < 16; i++) { const k = (t * 1.3 + hash(i * 3)) % 1, sx = x0 + hw * (.45 + .53 * hash(i * 7)), sy = gy - hh * (.1 + .85 * hash(i * 5)); ctx.save(); ctx.globalAlpha = kr * Math.sin(k * Math.PI); for (let j = 0; j < 4; j++) { const a = -Math.PI / 2 - .9 + j * .6; line(ctx, sx, sy, sx + Math.cos(a) * 16 * k, sy + Math.sin(a) * 16 * k, '#FFFFFF', 3); } ctx.restore(); }
      ctx.restore();
      cloud(ctx, 1260, 150, 70, '#8D97A2', kr); cloud(ctx, 1080, 120, 54, '#9AA3AD', kr);
      ctx.save(); ctx.globalAlpha = kr;
      for (let i = 0; i < 70; i++) { const k = (t * 1.5 + hash(i * 13)) % 1, x = 900 + hash(i * 7) * 620 - k * 300, y = 190 + k * 700; line(ctx, x, y, x - 12, y + 34, 'rgba(62,155,218,.75)', 4); }
      ctx.restore();
    }
    ctx.restore();
    // labels
    label(ctx, 'soubassement', 250, 720, { k: appear(t, f(.1), .5), size: 44, bg: '#F2D3C2', color: PZ.rockD });
    pz_arrow(ctx, 300, 762, 450, 848, appear(t, f(.14), .4), -.25);
    label(ctx, 'pluie battante', 1330, 440, { k: appear(t, f(.38), .5), size: 44, bg: '#DCEFFB' });
    // harsh climate badge
    const km = appear(t, f(.68), .6);
    if (km > 0) {
      ctx.save(); ctx.translate(1690, 200); const s = easeOutBack(km); ctx.scale(s, s);
      circle(ctx, 6, 9, 104, 'rgba(0,0,0,.16)'); circle(ctx, 0, 0, 104, '#CFE5F3', C.ink, 6);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.clip();
      poly(ctx, [[-120, 80], [-40, -40], [10, 20], [50, -10], [130, 80]], '#7D8C9C', C.ink, 4);
      poly(ctx, [[-40, -40], [-62, -8], [-48, -14], [-36, -2], [-22, -14], [-12, -6]], '#FFFFFF', C.ink, 3);
      poly(ctx, [[50, -10], [36, 8], [48, 4], [58, 12], [68, 2]], '#FFFFFF', C.ink, 3);
      ctx.fillStyle = '#E8F1F7'; ctx.fillRect(-110, 62, 220, 50);
      for (let i = 0; i < 14; i++) { const k = (t * .35 + hash(i * 3)) % 1, x = -90 + hash(i * 7) * 180 + Math.sin(k * 6 + i) * 8, y = -100 + k * 190; text(ctx, '❄', x, y, { size: 18 + hash(i) * 10, color: '#FFFFFF', font: FONT.body }); }
      ctx.restore(); ctx.restore();
      label(ctx, 'climat rude', 1690, 345, { k: appear(t, f(.72), .5), size: 44, bg: '#FFFFFF' });
    }
  }

  // ---------- the scene ----------
  scene('pouzzolane', (ctx, S) => {
    const t = S.t, c = S.cue, ce = S.cueEnd;
    const T1 = c(1) - .5, T2 = c(2) - .5, T3 = c(3) - .5, T4 = c(4) - .55, T5 = c(5) - .5, T6 = c(6) - .5;
    const LX = 560, LY = 330; // lens / iris centre (Pantheon dome)
    const lensK = appear(t, T4 - 1.1, .7);
    const lensPos = pz_key(t, [[T4 - 1.1, [880, 760]], [T4 - .3, [LX, LY]]]);
    pz_run(ctx, t, [
      { t0: -1e9, draw: () => pz_shotA(ctx, S) },
      { t0: T1, tr: 'pan', draw: () => pz_shotB(ctx, S) },
      { t0: T2, tr: 'pan', draw: () => pz_shotC(ctx, S) },
      { t0: T3, tr: 'pan', draw: () => pz_shotD(ctx, S, () => pz_lens(ctx, lensPos[0], lensPos[1], 70, lensK)) },
      { t0: T4, tr: 'iris', dur: 1.0, ix: LX, iy: LY, r0: 64, draw: () => pz_shotE(ctx, S) },
      { t0: T5, tr: 'up', draw: () => pz_shotF(ctx, S) },
      { t0: T6, tr: 'pan', draw: () => pz_shotG(ctx, S) },
    ]);

    // ---- Margot ----
    const f0 = k => lerp(c(0), ce(0), k), f1 = k => lerp(c(1), ce(1), k), f2 = k => lerp(c(2), ce(2), k), f4 = k => lerp(c(4), ce(4), k), f6 = k => lerp(c(6), ce(6), k);
    const pose = poseAt(t, [[0, 'idle'], [c(0) + .1, 'explain'], [f0(.45), 'pointL'], [f0(.8), 'open'],
      [c(1) - .2, 'pointL'], [f1(.6), 'explain'], [c(2), 'explain'], [f2(.6), 'pointL'], [c(3), 'pointL'], [lerp(c(3), ce(3), .6), 'open'],
      [c(4), 'think'], [f4(.5), 'explain'], [f4(.78), 'cheer'], [c(5), 'count'], [lerp(c(5), ce(5), .7), 'open'],
      [c(6), 'pointL'], [f6(.65), 'pointUp'], [ce(6), 'open']]);
    let expr = 'happy';
    if (t > f0(.45) && t < c(1) - .2) expr = 'wink';
    else if (t > f2(.82) && t < c(3)) expr = 'surprised';
    else if (t > f4(.5) && t < f4(.75)) expr = 'surprised';
    const look = t < T2 ? -.7 : t < T5 ? -.5 : t < T6 ? -.6 : -.5;
    const fullX = pz_key(t, [[0, 1480], [T1, 1480], [T1 + .9, 1660], [T2 - .05, 1660], [T2 + .6, 2320], [T5 - .1, 2320], [T5 + .8, 1690], [T6, 1690], [T6 + .9, 1715]]);
    if (fullX < 2300) presenter(ctx, { x: fullX, y: 1010, s: .92, T: S.T, pose, expr, look });
    const bk = appear(t, T2 + .4, .5) * (1 - appear(t, T5 - .15, .4));
    if (bk > 0) {
      const [bx, by] = pz_key(t, [[T2, [1745, 238]], [T4, [1745, 238]], [T4 + .9, [1748, 735]]]);
      presenterBubble(ctx, { x: bx, y: by, r: 128, k: bk, T: S.T, pose, expr, look: -.6 });
    }
  });
})();

// 08_keim.js — Chapitre 7 « Les peintures minérales KEIM » (~62 s)
// Beats keyed on narration cues:
//   0 palette de couleurs minérales → façades colorées      1 brevet 1878, A. W. Keim, silicate de potassium = verre liquide
//   2 coupes côte à côte : film plastique « autocollant » / silicate qui fait corps      3 zoom : silicatisation (liaisons cristallines)
//   4 la vapeur passe (silicate) / bloquée → cloque (plastique)      5 UV : pigments organiques passent, oxydes minéraux tiennent
//   6 façade peinte vers 1890 (Suisse, Norvège), toujours là      7 sol-silicate et badigeon de chaux sur enduit récent
'use strict';
(() => {
  const KM = {
    terra: C.keim[0], ochre: C.keim[1], blue: C.keim[2], green: C.keim[3], rose: C.keim[4],
    paint: '#C9643F', paintL: '#E1997A',
    glassL: '#D9F6F1', glass: '#9FE3D7', glassD: '#4FA99A',
    paper: '#F5E8C8', paperD: '#E3CB98', brown: '#6B4429', seal: '#B23A2A',
    uv: '#8A5CC7', uvL: '#C9B3EC',
    cryst: '#EFFFFA', crystLine: '#3F8F7C',
  };

  // ---------- utilities ----------
  function km_key(t, keys, fn = ease) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t < keys[i][0]) {
        const [t0, a] = keys[i - 1], [t1, b] = keys[i], k = fn(inv(t0, t1, t));
        return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k);
      }
    }
    return keys[keys.length - 1][1];
  }
  function km_drift(c, t, t0, t1, cx = W / 2, cy = H / 2, amt = .03) {
    const s = 1 + amt * smooth(inv(t0, t1, t));
    c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy);
  }
  function km_at(c, dx, dy, fn) {
    if (Math.abs(dx) >= W || Math.abs(dy) >= H) return;
    c.save(); c.beginPath(); c.rect(dx, dy, W, H); c.clip(); c.translate(dx, dy); fn(c); c.restore();
  }
  let km_buf = null;
  // draw fn into an offscreen layer and composite it with alpha a
  function km_layer(c, a, fn) {
    if (a <= 0) return;
    if (!km_buf) { km_buf = document.createElement('canvas'); km_buf.width = W; km_buf.height = H; }
    const b = km_buf.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, W, H);
    b.save(); fn(b); b.restore();
    c.save(); c.globalAlpha *= a; c.drawImage(km_buf, 0, 0); c.restore();
  }
  // shot sequencer: 'pan' | 'zoomIn' | 'zoomOut' (camera dives into / out of point P)
  function km_run(c, t, shots) {
    let i = 0; for (let k = 1; k < shots.length; k++) if (t >= shots[k].t0) i = k;
    const cur = shots[i], dur = cur.dur || .9, q = i ? inv(cur.t0, cur.t0 + dur, t) : 1, p = ease(q);
    if (q >= 1) { cur.draw(c); return; }
    const prev = shots[i - 1];
    if (cur.tr === 'pan') { km_at(c, -p * W, 0, prev.draw); km_at(c, (1 - p) * W, 0, cur.draw); }
    else if (cur.tr === 'zoomIn') {
      const P = cur.P, Z = cur.Z || 4, z = Math.pow(Z, p);
      c.save(); c.translate(lerp(P[0], W / 2, p), lerp(P[1], H / 2, p)); c.scale(z, z); c.translate(-P[0], -P[1]); prev.draw(c); c.restore();
      km_layer(c, smooth(inv(.25, .8, q)), b => { const s = z / Z; b.translate(W / 2, H / 2); b.scale(s, s); b.translate(-W / 2, -H / 2); cur.draw(b); });
    } else if (cur.tr === 'zoomOut') {
      const P = cur.P, Z = cur.Z || 4, z = Math.pow(Z, 1 - p);
      c.save(); c.translate(lerp(W / 2, P[0], p), lerp(H / 2, P[1], p)); c.scale(z, z); c.translate(-P[0], -P[1]); cur.draw(c); c.restore();
      km_layer(c, 1 - smooth(inv(.2, .75, q)), b => { const s = z / Z; b.translate(W / 2, H / 2); b.scale(s, s); b.translate(-W / 2, -H / 2); prev.draw(b); });
    }
  }
  function km_sparkle(c, x, y, s, a = 1, color = '#FFFFFF') {
    if (a <= 0 || s <= 0) return;
    c.save(); c.globalAlpha *= clamp(a); c.translate(x, y);
    poly(c, [[0, -s], [s * .2, -s * .2], [s, 0], [s * .2, s * .2], [0, s], [-s * .2, s * .2], [-s, 0], [-s * .2, -s * .2]], color);
    c.restore();
  }
  function km_badge(c, x, y, k, ok, r = 30) {
    if (k <= 0) return;
    c.save(); c.translate(x, y); const s = easeOutBack(k); c.scale(s, s); c.globalAlpha *= clamp(k * 3);
    circle(c, 4, 6, r, 'rgba(0,0,0,.15)'); circle(c, 0, 0, r, ok ? C.good : C.danger, C.ink, 4);
    if (ok) check(c, -1, 2, r * 1.05, '#FFFFFF', 1); else cross(c, 0, 0, r * .8, '#FFFFFF', 1);
    c.restore();
  }
  function km_arrow(c, x1, y1, x2, y2, k, curve = 0, color = C.ink) {
    if (k <= 0) return;
    arrow(c, x1, y1, x2, y2, { color: 'rgba(255,255,255,.75)', lw: 13, head: 30, k, curve });
    arrow(c, x1, y1, x2, y2, { color, lw: 6, head: 24, k, curve });
  }
  // smooth wobbly closed path (appends to the current path)
  function km_wob(c, x, y, r, seed, wob = .16, n = 12) {
    const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr2 = r * (1 + wob * (hash(seed * 31 + i) * 2 - 1)); pts.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); }
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (!i) { const l = pts[n - 1]; c.moveTo((l[0] + p[0]) / 2, (l[1] + p[1]) / 2); } c.quadraticCurveTo(p[0], p[1], mx, my); }
    c.closePath();
  }
  function km_vapor(c, x, y, r, a) {
    if (a <= 0) return;
    puff(c, x, y, r + 4, .55 * a, '#6FA8D3'); puff(c, x, y, r, .95 * a, '#E6F3FC');
  }
  // world position of Margot's hand (mirrors presenter.js arm maths) → [x, y, forearmAngle]
  function km_hand(o, side) {
    const pose = o.pose, T = o.T, s = o.s, talk = talkAt(T);
    const breathe = Math.sin(T * 2.1) * 3, sway = Math.sin(T * .9) * .015 + talk * Math.sin(T * 7) * .01;
    const [u, b] = side < 0 ? pose.L : pose.R;
    const sx = side * 82, sy = -362 - pose.sh + 22, wig = talk * 6 * Math.sin(T * 6 + side);
    const ua = (u + wig) * Math.PI / 180, fa = (u + b + wig * 1.6) * Math.PI / 180;
    const ex = sx + side * Math.sin(ua) * 100, ey = sy + Math.cos(ua) * 100;
    const hx = ex + side * Math.sin(fa) * 96, hy = ey + Math.cos(fa) * 96 + breathe * .4;
    const cs = Math.cos(sway), sn = Math.sin(sway);
    return [o.x + s * (hx * cs - hy * sn), o.y + s * (hx * sn + hy * cs), fa];
  }
  // pose blending that accepts pose names or pose objects
  function km_poseAt(t, keys, blend = .45) {
    const P = x => typeof x === 'string' ? POSES[x] : x;
    let cur = P(keys[0][1]), prev = cur, t0 = -1e9;
    for (const [kt, name] of keys) if (t >= kt) { prev = cur; cur = P(name); t0 = kt; }
    const k = ease(inv(t0, t0 + blend, t)), mix = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R), sh: lerp(prev.sh, cur.sh, k) };
  }
  const KM_HOLD = { L: [30, 95], R: [14, -18], sh: 0 }, KM_HOLD_UP = { L: [30, 95], R: [128, 30], sh: 0 }, KM_HOLD_OPEN = { L: [30, 95], R: [62, 40], sh: 0 };

  // ---------- beat 0: palette → coloured façades ----------
  const KM_HOUSES = [
    { x: 1080, col: '#86A9BD', sh: '#EFE6D2', blob: 2, seed: 3, ty: 700 },
    { x: 660, col: '#E3B15A', sh: '#5F8FA8', blob: 1, seed: 2, ty: 690 },
    { x: 240, col: '#D47B55', sh: '#6F8F8A', blob: 0, seed: 1, ty: 700 },
  ];
  const KM_DABS = [[-210, -30], [-168, -84], [-96, -104], [-26, -86], [-200, 46]];
  function km_palette(c, x, y, rot, used, t) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.save(); c.translate(-110, -10);
    c.beginPath(); c.ellipse(0, 0, 168, 112, -.08, 0, TAU); c.moveTo(110 + 20, 10); c.arc(110, 10, 20, 0, TAU);
    ellipse(c, 8, 12, 168, 112, 'rgba(0,0,0,.18)', null, 0, -.08);
    c.beginPath(); c.ellipse(0, 0, 168, 112, -.08, 0, TAU); c.moveTo(130, 10); c.arc(110, 10, 20, 0, TAU);
    c.fillStyle = '#CFA06A'; c.fill('evenodd'); c.strokeStyle = C.ink; c.lineWidth = 5; c.stroke();
    c.save(); c.clip('evenodd'); for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-20, 10, 150 - i * 22, 90 - i * 14, -.08, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = 'rgba(120,80,40,.18)'; c.lineWidth = 3; c.stroke(); } c.restore();
    c.restore();
    KM_DABS.forEach(([dx, dy], i) => {
      const s = 1 - .45 * (used[i] || 0), col = C.keim[i];
      c.beginPath(); km_wob(c, dx, dy, 24 * s, i + 3, .2, 9); c.fillStyle = col; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke();
      ellipse(c, dx - 8 * s, dy - 8 * s, 6 * s, 4 * s, 'rgba(255,255,255,.55)');
    });
    c.restore();
  }
  function km_dabPos(hand, rot, i) { const [dx, dy] = KM_DABS[i], cs = Math.cos(rot), sn = Math.sin(rot); return [hand[0] + dx * cs - dy * sn, hand[1] + dx * sn + dy * cs]; }
  function km_splash(c, x, y, r, col, k, seed) {
    if (k <= 0) return;
    c.save(); c.globalAlpha *= clamp(k * 4);
    const s = easeOutBack(clamp(k * 1.6));
    c.beginPath(); km_wob(c, x, y, r * s, seed, .3, 11); c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(43,38,35,.6)'; c.lineWidth = 3; c.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + hash(seed + i), d = r * (1.25 + .5 * hash(seed * 3 + i)) * s; circle(c, x + Math.cos(a) * d, y + Math.sin(a) * d, (5 + 6 * hash(seed + i * 7)) * s, col, 'rgba(43,38,35,.5)', 2); }
    c.restore();
  }
  function km_shotA(c, S, M) {
    const t = S.t, c0 = S.cue(0), e0 = S.cueEnd(0), f = k => lerp(c0, e0, k), gy = 870, hw = 400, hh = hw * .62;
    c.save(); km_drift(c, t, 0, S.cue(1), 700, 640, .035);
    skyBg(c, t, { groundY: gy });
    ground(c, gy);
    KM_HOUSES.forEach((h, i) => {
      house(c, h.x, gy, hw, { finish: 'lime', color: '#EEE8DC', shutters: '#A9ADAA', t, seed: h.seed, smoke: i === 1 });
      const tl = f(.3 + i * .1) + .6, sp = easeOut(inv(tl + .05, tl + 1.1, t));
      if (sp > 0) {
        c.save(); c.beginPath(); c.rect(h.x - hw / 2, gy - hh, hw, hh); c.clip();
        c.beginPath(); km_wob(c, h.x + 10, h.ty - 10, 330 * sp, h.seed * 5 + 1, .22, 12); c.clip();
        house(c, h.x, gy, hw, { finish: 'lime', color: h.col, shutters: h.sh, t, seed: h.seed, smoke: false });
        c.restore();
      }
      km_splash(c, h.x + 10, h.ty - 10, 46, C.keim[h.blob], inv(tl, tl + .25, t) * (1 - smooth(inv(tl + .9, tl + 1.5, t))), h.seed * 9);
    });
    c.restore();
    // flying paint blobs (screen space, from the palette held by Margot)
    if (M && M.hand) KM_HOUSES.forEach((h, i) => {
      const tl0 = f(.3 + i * .1), u = inv(tl0, tl0 + .6, t);
      if (u <= 0 || u >= 1) return;
      const [sx, sy] = km_dabPos(M.hand, M.rot, h.blob), ex = h.x + 10, ey = h.ty - 10;
      const ue = ease(u), x = lerp(sx, ex, ue), y = lerp(sy, ey, ue) - Math.sin(u * Math.PI) * 230;
      for (let j = 3; j >= 1; j--) { const uu = Math.max(0, u - j * .05), ue2 = ease(uu); circle(c, lerp(sx, ex, ue2), lerp(sy, ey, ue2) - Math.sin(uu * Math.PI) * 230, 20 - j * 4, rgba(C.keim[h.blob], .5)); }
      circle(c, x, y, 24, C.keim[h.blob], C.ink, 4); ellipse(c, x - 8, y - 8, 7, 5, 'rgba(255,255,255,.6)');
    });
    // texts
    const kq = appear(t, Math.max(2.75, f(.25)), .5);
    if (kq > 0) { c.save(); c.globalAlpha = kq; c.translate(1330, 360); c.rotate(-.06); text(c, 'De la couleur ?', 0, 0, { size: 64, font: FONT.hand, weight: 700, color: C.terracotta }); c.restore(); }
    label(c, 'Peintures au silicate', 680, 175, { k: appear(t, f(.68), .6), size: 64, bg: '#FFF1DA' });
    const km2 = appear(t, f(.42), .5);
    if (km2 > 0) { c.save(); c.globalAlpha = km2; text(c, 'une solution minérale', 680, 262, { size: 56, font: FONT.hand, weight: 700, color: C.inkSoft }); c.restore(); }
  }

  // ---------- beat 1: the 1878 patent ----------
  function km_deskBg(c) {
    c.drawImage(cached('km_desk', W, H, g => {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#A9774E'); gr.addColorStop(1, '#8A5D3B'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const r = rng(17);
      for (let i = 0; i < 70; i++) { const y = r() * H; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 60) g.lineTo(x, y + Math.sin(x * .004 + i) * 14 + (r() - .5) * 4); g.strokeStyle = r() < .5 ? 'rgba(70,40,20,.13)' : 'rgba(255,220,180,.08)'; g.lineWidth = 2 + r() * 4; g.stroke(); }
      for (let i = 0; i < 6; i++) { const y = 120 + i * 180; g.fillStyle = 'rgba(60,35,18,.18)'; g.fillRect(0, y, W, 3); }
      const v = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,15,5,.35)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    }), 0, 0);
  }
  function km_patentImg() {
    return cached('km_patent', 620, 780, g => {
      const w = 560, h = 720, x0 = 30, y0 = 30, r = rng(23);
      g.save(); g.translate(x0, y0);
      const edge = []; for (let i = 0; i <= 20; i++) edge.push([i * w / 20, (r() - .5) * 6]);
      g.beginPath(); edge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = 0; i <= 26; i++) g.lineTo(w + (r() - .5) * 6, i * h / 26); for (let i = 20; i >= 0; i--) g.lineTo(i * w / 20, h + (r() - .5) * 6); for (let i = 26; i >= 0; i--) g.lineTo((r() - .5) * 6, i * h / 26); g.closePath();
      g.save(); g.translate(10, 12); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); g.restore();
      const pg = g.createLinearGradient(0, 0, w, h); pg.addColorStop(0, '#F8EDCF'); pg.addColorStop(1, '#E6CF9E'); g.fillStyle = pg; g.fill();
      g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
      g.save(); g.clip();
      for (let i = 0; i < 9; i++) { const sx = r() * w, sy = r() * h, sr = 30 + r() * 80; const sg = g.createRadialGradient(sx, sy, 2, sx, sy, sr); sg.addColorStop(0, 'rgba(170,120,60,.16)'); sg.addColorStop(1, 'rgba(170,120,60,0)'); g.fillStyle = sg; g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); }
      g.restore();
      g.strokeStyle = 'rgba(107,68,41,.8)'; g.lineWidth = 3; g.strokeRect(24, 24, w - 48, h - 48); g.lineWidth = 1.5; g.strokeRect(34, 34, w - 68, h - 68);
      for (const [cx, cy] of [[24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]]) { circle(g, cx, cy, 9, '#E9D3A2', 'rgba(107,68,41,.8)', 3); }
      g.fillStyle = KM.brown; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `700 34px ${FONT.title}`; g.fillText('BREVET  D\'INVENTION', w / 2, 92);
      line(g, 120, 122, w - 120, 122, 'rgba(107,68,41,.7)', 3);
      g.font = `700 124px ${FONT.title}`; g.fillStyle = '#8E3B22'; g.fillText('1878', w / 2, 210);
      g.fillStyle = KM.brown; g.font = `700 46px ${FONT.hand}`; g.fillText('Peinture minérale', w / 2, 300); g.font = `700 40px ${FONT.hand}`; g.fillText('au silicate de potassium', w / 2, 344);
      for (let i = 0; i < 6; i++) { const y = 404 + i * 34, x1 = 70, x2 = w - 70 - (i === 5 ? 160 : r() * 40); g.beginPath(); g.moveTo(x1, y); for (let x = x1; x < x2; x += 8) g.lineTo(x, y + Math.sin(x * .25 + i * 3) * 3 + (r() - .5) * 2); g.strokeStyle = 'rgba(91,58,38,.55)'; g.lineWidth = 3; g.stroke(); }
      g.font = `700 60px ${FONT.hand}`; g.fillStyle = '#3E2A1C'; g.textAlign = 'right'; g.fillText('A. W. Keim', w - 66, 640);
      g.beginPath(); g.moveTo(w - 300, 668); g.bezierCurveTo(w - 220, 690, w - 140, 650, w - 60, 672); g.strokeStyle = '#3E2A1C'; g.lineWidth = 3; g.stroke();
      // wax seal + ribbon
      poly(g, [[96, 640], [80, 712], [102, 700], [116, 716], [118, 646]], '#9C2E22', C.ink, 3);
      poly(g, [[118, 646], [146, 708], [152, 690], [174, 694], [134, 636]], '#B23A2A', C.ink, 3);
      g.beginPath(); km_wob(g, 120, 620, 46, 5, .1, 14); g.fillStyle = KM.seal; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
      circle(g, 120, 620, 30, null, 'rgba(255,255,255,.35)', 4); km_sparkle(g, 120, 620, 16, 1, 'rgba(255,255,255,.45)');
      g.restore();
    });
  }
  function km_portrait(c, x, y, k) {
    if (k <= 0) return;
    c.save(); c.translate(x, y); const s = easeOutBack(k); c.scale(s, s); c.rotate(.03); c.globalAlpha *= clamp(k * 3);
    ellipse(c, 10, 14, 152, 188, 'rgba(0,0,0,.28)');
    ellipse(c, 0, 0, 152, 188, '#D9A93F', C.ink, 5);
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; circle(c, Math.cos(a) * 142, Math.sin(a) * 177, 5, '#F0CF73'); }
    ellipse(c, 0, 0, 128, 162, '#B8862A', C.ink, 3);
    ellipse(c, 0, 0, 118, 152, '#E8D5AE', C.ink, 3);
    c.save(); c.beginPath(); c.ellipse(0, 0, 116, 150, 0, 0, TAU); c.clip();
    const vg = c.createRadialGradient(0, -20, 20, 0, 0, 170); vg.addColorStop(0, 'rgba(255,245,220,.6)'); vg.addColorStop(1, 'rgba(120,80,40,.35)'); c.fillStyle = vg; c.fillRect(-130, -160, 260, 320);
    const D = '#4B3426', D2 = '#38261B';
    c.beginPath(); c.moveTo(-150, 170); c.quadraticCurveTo(-136, 92, -64, 80); c.lineTo(64, 80); c.quadraticCurveTo(136, 92, 150, 170); c.closePath(); c.fillStyle = D2; c.fill();
    poly(c, [[-34, 78], [34, 78], [0, 150]], '#F4EBDA');
    poly(c, [[-26, 80], [-4, 96], [-26, 112]], D); poly(c, [[26, 80], [4, 96], [26, 112]], D);
    fillRR(c, -22, 24, 44, 60, 10, D);
    ellipse(c, -50, -24, 10, 18, D); ellipse(c, 50, -24, 10, 18, D);
    ellipse(c, 0, -26, 50, 62, D);
    c.beginPath(); c.moveTo(-52, -34); c.quadraticCurveTo(-58, -100, 0, -96); c.quadraticCurveTo(58, -100, 52, -34); c.quadraticCurveTo(40, -70, 0, -66); c.quadraticCurveTo(-40, -70, -52, -34); c.closePath(); c.fillStyle = D2; c.fill();
    c.beginPath(); c.moveTo(-50, -20); c.quadraticCurveTo(-60, 40, -30, 62); c.quadraticCurveTo(-14, 80, 0, 72); c.quadraticCurveTo(14, 80, 30, 62); c.quadraticCurveTo(60, 40, 50, -20); c.quadraticCurveTo(30, 10, 0, 6); c.quadraticCurveTo(-30, 10, -50, -20); c.closePath(); c.fillStyle = D2; c.fill();
    c.restore();
    c.restore();
  }
  function km_flaskPath(c, x, by) {
    c.beginPath(); c.moveTo(x - 30, by - 330); c.lineTo(x - 30, by - 238); c.lineTo(x - 134, by - 40); c.quadraticCurveTo(x - 144, by, x - 102, by); c.lineTo(x + 102, by); c.quadraticCurveTo(x + 144, by, x + 134, by - 40); c.lineTo(x + 30, by - 238); c.lineTo(x + 30, by - 330); c.closePath();
  }
  function km_flask(c, x, by, k, t, glow) {
    if (k <= 0) return;
    c.save(); c.translate(x, by); const s = easeOutBack(k); c.scale(s, s); c.translate(-x, -by); c.globalAlpha *= clamp(k * 3);
    const gl = .55 + .25 * glow + .08 * Math.sin(t * 3);
    const g = c.createRadialGradient(x, by - 110, 10, x, by - 110, 300); g.addColorStop(0, `rgba(210,255,245,${gl})`); g.addColorStop(1, 'rgba(210,255,245,0)');
    c.fillStyle = g; c.fillRect(x - 300, by - 420, 600, 560);
    ellipse(c, x + 10, by + 6, 150, 18, 'rgba(0,0,0,.25)');
    km_flaskPath(c, x, by); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
    c.save(); km_flaskPath(c, x, by); c.clip();
    const ly = by - 168;
    c.beginPath(); c.moveTo(x - 160, by + 4); c.lineTo(x - 160, ly); for (let i = 0; i <= 20; i++) c.lineTo(x - 160 + i * 16, ly + Math.sin(t * 2.5 + i * .7) * 4); c.lineTo(x + 160, by + 4); c.closePath();
    const lg = c.createLinearGradient(0, ly, 0, by); lg.addColorStop(0, '#E4FFF9'); lg.addColorStop(1, KM.glass); c.fillStyle = lg; c.fill();
    for (let i = 0; i < 4; i++) { const yy = ly + 24 + i * 36, ph = Math.sin(t * 1.4 + i * 1.7); c.beginPath(); c.moveTo(x - 140, yy); c.quadraticCurveTo(x + ph * 40, yy - 12, x + 140, yy + 6); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; c.stroke(); }
    for (let i = 0; i < 9; i++) { const q = (t * .45 + hash(i * 3)) % 1; circle(c, x - 90 + hash(i * 7) * 180 + Math.sin(q * 7 + i) * 6, lerp(by - 14, ly + 6, q), 3 + hash(i) * 5, null, 'rgba(255,255,255,.9)', 2.5); }
    c.restore();
    km_flaskPath(c, x, by); c.strokeStyle = C.ink; c.lineWidth = 5; c.lineJoin = 'round'; c.stroke();
    line(c, x - 18, by - 320, x - 18, by - 246, 'rgba(255,255,255,.85)', 6); line(c, x - 112, by - 50, x - 40, by - 196, 'rgba(255,255,255,.75)', 7);
    fillRR(c, x - 40, by - 348, 80, 22, 8, 'rgba(255,255,255,.6)', C.ink, 4);
    for (let i = 0; i < 5; i++) { const q = (t * .6 + i * .21) % 1; km_sparkle(c, x - 120 + hash(i * 9) * 240, by - 130 - hash(i * 5) * 220, 16 * Math.sin(q * Math.PI), glow * Math.sin(q * Math.PI)); }
    c.restore();
  }
  function km_shotB(c, S) {
    const t = S.t, c1 = S.cue(1), e1 = S.cueEnd(1), f = k => lerp(c1, e1, k);
    km_deskBg(c);
    c.save(); km_drift(c, t, c1 - .5, S.cue(2), 820, 520, .03);
    km_portrait(c, 330, 380, appear(t, f(.1), .6));
    const kp = appear(t, f(.13), .5);
    if (kp > 0) { c.save(); c.globalAlpha = clamp(kp * 3); fillRR(c, 175 + 6, 600 + 8, 310, 56, 10, 'rgba(0,0,0,.25)'); fillRR(c, 175, 600, 310, 56, 10, '#E3B54B', C.ink, 4); text(c, 'Adolf Wilhelm Keim', 330, 630, { size: 30, font: FONT.title, weight: 600, color: '#4A3018', maxW: 280 }); c.restore(); }
    // the patent document
    const kd = appear(t, c1 - .4, .7);
    c.save(); c.translate(870, 520 + (1 - easeOut(kd)) * 80); c.rotate(-.035); c.globalAlpha *= clamp(kd * 2);
    const img = km_patentImg(); c.drawImage(img, -img.width / 2, -img.height / 2);
    const k18 = appear(t, f(.02), .5); if (k18 > 0 && k18 < 1) { c.save(); c.globalAlpha *= 1 - k18; ellipse(c, 0, -160, 170 + 60 * k18, 80 + 30 * k18, null, '#E7943A', 8); c.restore(); }
    stamp(c, 'BREVETÉ', 120, 110, { k: appear(t, f(.3), .35), color: KM.seal, size: 66, rot: -.2 });
    c.restore();
    km_flask(c, 1345, 860, appear(t, f(.42), .6), t, appear(t, f(.72), .8));
    c.restore();
    label(c, 'silicate de potassium', 1345, 445, { k: appear(t, f(.52), .5), size: 42, bg: '#E6FBF6' });
    label(c, '= verre liquide', 1345, 360, { k: appear(t, f(.74), .5), size: 46, bg: '#FFFFFF' });
  }

  // ---------- beats 2–4: side-by-side cross-sections ----------
  const KM_PL = { x: 110, w: 740 }, KM_PR = { x: 1070, w: 740 }, KM_Y0 = 300, KM_YS = 488, KM_Y1 = 840;
  function km_substrate(w, h, seed) {
    return cached(`km_sub|${w}|${h}|${seed}`, w, h, g => {
      g.fillStyle = '#E6DCCB'; g.fillRect(0, 0, w, h);
      const r = rng(seed);
      for (let i = 0; i < w * h / 900; i++) {
        const x = r() * w, y = r() * h, s = 9 + r() * 20, col = ['#CBBDA5', '#B9AD9B', '#D8CCB6', '#A99C88', '#C7B49A'][Math.floor(r() * 5)];
        g.save(); g.translate(x, y); g.rotate(r() * TAU); g.beginPath();
        for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr2 = s * (.75 + r() * .35); k ? g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * .8) : g.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * .8); }
        g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(80,65,50,.35)'; g.lineWidth = 2; g.stroke(); g.restore();
      }
      for (let i = 0; i < w * h / 2200; i++) ellipse(g, r() * w, r() * h, 3 + r() * 6, 2 + r() * 4, 'rgba(70,58,46,.5)');
    });
  }
  // the same substrate, tinted by the paint and fading with depth (silicate penetration)
  function km_substrateTint(w, seed, col) {
    const h = 150;
    return cached(`km_subt|${w}|${seed}|${col}`, w, h, g => {
      g.drawImage(km_substrate(w, KM_Y1 - KM_YS, seed), 0, 0);
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = rgba(col, .72); g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'destination-in';
      const m = g.createLinearGradient(0, 0, 0, h); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(.45, 'rgba(0,0,0,.9)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = m; g.fillRect(0, 0, w, h);
    });
  }
  function km_depth(u) { return 64 + 22 * Math.sin(u * .043) + 40 * Math.pow(Math.max(0, Math.sin(u * .11 + 1)), 3) + 10 * noise(u * .05); }
  const km_bump = (x, bx, B) => B * Math.exp(-Math.pow((x - bx) / 74, 2));
  function km_film(c, x, w, ys, st, t) {
    if (st.film <= 0) return;
    const th = 24, drop = (1 - easeOut(st.film)) * -170, hinge = x + w - 220, bx = x + w * .4, B = st.blister * 54;
    c.save(); c.globalAlpha *= clamp(st.film * 3); c.translate(0, drop);
    const top = xx => ys - th - km_bump(xx, bx, B);
    if (B > 1) {
      c.beginPath(); c.moveTo(bx - 140, ys); for (let i = 0; i <= 40; i++) { const xx = bx - 140 + i * 7; c.lineTo(xx, top(xx) + th); } c.closePath();
      c.fillStyle = 'rgba(169,214,245,.95)'; c.fill();
      for (let i = 0; i < 5; i++) { const xx = bx - 40 + i * 20 + Math.sin(t * 2 + i) * 6; drop2(c, xx, ys - km_bump(xx, bx, B) * .45 + 4, 5 + 3 * st.blister); }
    }
    c.beginPath(); const N = 70;
    for (let i = 0; i <= N; i++) { const xx = lerp(x - 10, hinge, i / N); i ? c.lineTo(xx, top(xx)) : c.moveTo(xx, top(xx)); }
    for (let i = N; i >= 0; i--) { const xx = lerp(x - 10, hinge, i / N); c.lineTo(xx, top(xx) + th); }
    c.closePath(); c.fillStyle = KM.paint; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke();
    c.beginPath(); for (let i = 0; i <= N; i++) { const xx = lerp(x, hinge - 10, i / N); i ? c.lineTo(xx, top(xx) + 7) : c.moveTo(xx, top(xx) + 7); } c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; c.stroke();
    if (st.crack > 0) { const cx0 = bx, cy0 = top(bx); c.save(); c.globalAlpha *= clamp(st.crack * 3); poly(c, [[cx0 - 26, cy0 + 4], [cx0 - 10, cy0 - 8], [cx0 + 2, cy0 + 2], [cx0 + 18, cy0 - 10], [cx0 + 30, cy0 + 2]], null, C.ink, 4); c.restore(); }
    // peeling flap (sticker corner)
    const L = x + w + 20 - hinge, a = -st.peel * .5;
    c.save(); c.translate(hinge, ys); c.rotate(a);
    if (st.peel > 0) { c.save(); c.rotate(-a); c.beginPath(); c.moveTo(0, 0); c.lineTo(L * Math.cos(a), L * Math.sin(a)); c.lineTo(L, 0); c.closePath(); c.fillStyle = 'rgba(60,40,30,.18)'; c.fill(); c.restore(); }
    fillRR(c, -2, -th, L, th, [0, 0, 10, 0], KM.paint, C.ink, 4);
    if (st.peel > 0) fillRR(c, 0, -6, L - 6, 6, 3, '#EBC2AE');
    line(c, 6, -th + 7, L - 16, -th + 7, 'rgba(255,255,255,.55)', 4);
    c.restore();
    c.restore();
  }
  function drop2(c, x, y, s) { drop(c, x, y, s, C.water, C.ink, 1); }
  function km_silicate(c, x, w, ys, st, t) {
    const img = km_substrateTint(w, 5, KM.paint);
    if (st.pen) {
      c.save(); c.beginPath(); c.moveTo(x, ys - 1); c.lineTo(x + w, ys - 1);
      const N = 74; for (let i = N; i >= 0; i--) { const xx = x + i * w / N; c.lineTo(xx, ys + st.pen(xx) * km_depth(xx - x)); }
      c.closePath(); c.clip(); c.drawImage(img, x, ys); c.restore();
      // matte coloured surface line (no thickness: it is the stone itself)
      c.save(); c.beginPath(); c.rect(x, ys - 6, w, 12); c.clip();
      for (let i = 0; i < 74; i++) { const xx = x + i * w / 74, p = st.pen(xx); if (p > 0) { c.fillStyle = rgba(KM.paint, .9 * clamp(p * 3)); c.fillRect(xx, ys - 2, w / 74 + 1, 6); } }
      c.restore();
    }
    if (st.brush > 0 && st.brush < 1) {
      const bxp = lerp(x + 40, x + w - 40, st.brush);
      c.save(); c.translate(bxp, ys - 4); c.rotate(.35);
      fillRR(c, -40, -26, 80, 30, 6, KM.paint, C.ink, 4);
      for (let i = -32; i <= 32; i += 10) line(c, i, -20, i, 2, 'rgba(0,0,0,.18)', 2);
      fillRR(c, -36, -58, 72, 34, 6, '#B9BEC2', C.ink, 4);
      fillRR(c, -12, -190, 24, 136, 10, C.wood, C.ink, 4);
      c.restore();
    }
  }
  function km_panelVapor(c, P, kind, st, t) {
    const x = P.x, w = P.w, ys = KM_YS, y1 = KM_Y1, bx = x + w * .4;
    for (let i = 0; i < 10; i++) {
      const sp = .17 + hash(i * 3 + 1) * .06, ph = (t * sp + hash(i * 7 + (kind === 'plastic' ? 0 : 3))) % 1;
      let px = x + 70 + (w - 140) * hash(i * 11 + (kind === 'plastic' ? 0 : 5)), py, r = 15, a = st.vapor * clamp(ph * 6);
      if (kind === 'silicate') {
        py = lerp(y1 + 30, KM_Y0 + 10, ph); px += Math.sin(t * 1.5 + i) * 12; r = 14 + 8 * ph; a *= 1 - smooth(inv(.75, 1, ph));
      } else {
        const ystop = ys + 22, yy = lerp(y1 + 30, ys - 60, ph);
        if (yy > ystop) { py = yy; px += Math.sin(t * 1.5 + i) * 10; }
        else { const k = inv(ystop, ys - 60, yy); py = ystop - 6 * k; px = lerp(px, bx + (hash(i) - .5) * 80, smooth(k)); r = 15 * (1 - .5 * k); a *= 1 - k; }
      }
      km_vapor(c, px, py, r, a);
    }
  }
  function km_panel(c, P, kind, st, t) {
    const x = P.x, w = P.w, h = KM_Y1 - KM_Y0;
    fillRR(c, x + 8, KM_Y0 + 10, w, h, 20, 'rgba(0,0,0,.15)');
    c.save(); rr(c, x, KM_Y0, w, h, 20); c.clip();
    const sky = c.createLinearGradient(0, KM_Y0, 0, KM_YS); sky.addColorStop(0, '#CDE6F5'); sky.addColorStop(1, '#F3F9FC'); c.fillStyle = sky; c.fillRect(x, KM_Y0, w, KM_YS - KM_Y0);
    c.drawImage(km_substrate(w, KM_Y1 - KM_YS, kind === 'plastic' ? 4 : 5), x, KM_YS);
    const dg = c.createLinearGradient(0, KM_YS, 0, KM_Y1); dg.addColorStop(0, 'rgba(60,40,20,0)'); dg.addColorStop(1, 'rgba(60,40,20,.18)'); c.fillStyle = dg; c.fillRect(x, KM_YS, w, KM_Y1 - KM_YS);
    line(c, x, KM_YS, x + w, KM_YS, 'rgba(43,38,35,.5)', 3);
    if (st.vapor > 0) km_panelVapor(c, P, kind, st, t);
    if (kind === 'plastic') km_film(c, x, w, KM_YS, st, t); else km_silicate(c, x, w, KM_YS, st, t);
    text(c, 'extérieur', x + 22, KM_Y0 + 32, { size: 28, font: FONT.body, weight: 800, color: 'rgba(43,38,35,.5)', align: 'left' });
    text(c, 'mur', x + 22, KM_Y1 - 30, { size: 28, font: FONT.body, weight: 800, color: 'rgba(43,38,35,.55)', align: 'left' });
    c.restore();
    rr(c, x, KM_Y0, w, h, 20); c.strokeStyle = C.ink; c.lineWidth = 5; c.stroke();
  }
  function km_sideBySide(c, S, mode) {
    const t = S.t;
    paperBg(c);
    const c2 = S.cue(2), e2 = S.cueEnd(2), f2 = k => lerp(c2, e2, k), c4 = S.cue(4), e4 = S.cueEnd(4), f4 = k => lerp(c4, e4, k);
    c.save(); km_drift(c, t, mode === 'C' ? c2 - .5 : c4 - .9, mode === 'C' ? S.cue(3) : S.cue(5), W / 2, 560, .02);
    const brushT0 = f2(.55), brushT1 = f2(.74);
    const pen = xx => { const tx = lerp(brushT0, brushT1, inv(KM_PR.x + 40, KM_PR.x + KM_PR.w - 40, xx)); return easeOut(inv(tx, tx + 1.3, t)); };
    const stL = { film: appear(t, c2 - .2, .7), peel: easeOutBack(inv(f2(.24), f2(.42), t)), blister: mode === 'E' ? smooth(inv(f4(.18), f4(.66), t)) : 0, crack: mode === 'E' ? appear(t, f4(.78), .4) : 0, vapor: mode === 'E' ? appear(t, c4 - .3, .8) : 0 };
    const stR = { pen, brush: inv(brushT0, brushT1, t), vapor: stL.vapor };
    km_panel(c, KM_PL, 'plastic', stL, t);
    km_panel(c, KM_PR, 'silicate', stR, t);
    c.restore();
    // headers
    const kh = appear(t, c2 - .3, .5);
    label(c, 'Peinture plastique', KM_PL.x + KM_PL.w / 2, 232, { k: kh, size: 48, bg: '#FBE3D9' });
    label(c, 'Peinture KEIM', KM_PR.x + KM_PR.w / 2, 232, { k: appear(t, c2 - .1, .5), size: 48, bg: '#E3F3E7' });
    if (mode === 'C') {
      label(c, 'Film : autocollant', KM_PL.x + KM_PL.w * .42, 392, { k: appear(t, f2(.3), .5), size: 40, bg: '#FFFFFF' });
      label(c, 'Fait corps avec le support', KM_PR.x + KM_PR.w / 2, 392, { k: appear(t, f2(.72), .5), size: 40, bg: '#FFFFFF' });
    } else {
      label(c, 'la vapeur est bloquée', KM_PL.x + KM_PL.w * .42, 380, { k: appear(t, f4(.36), .5), size: 40, bg: '#FFFFFF' });
      label(c, 'la vapeur passe', KM_PR.x + KM_PR.w / 2, 392, { k: appear(t, f4(.24), .5), size: 40, bg: '#FFFFFF' });
      km_badge(c, KM_PL.x + KM_PL.w - 40, 232, appear(t, f4(.8), .5), false, 34);
      km_badge(c, KM_PR.x + KM_PR.w - 40, 232, appear(t, f4(.3), .5), true, 34);
      const kc = appear(t, f4(.62), .5);
      if (kc > 0) { c.save(); c.globalAlpha = kc; c.translate(KM_PL.x + KM_PL.w * .4, 600); c.rotate(-.05); text(c, 'cloque !', 0, 0, { size: 56, font: FONT.hand, weight: 700, color: C.danger, stroke: '#FFFFFF', sw: 8 }); c.restore(); }
    }
  }

  // ---------- beat 3: silicatisation, zoomed in ----------
  const KM_MG = (() => { const out = [], r = rng(42); let row = 0; for (let y = 470; y < 1180; y += 148, row++) for (let x = (row % 2) * 86 - 40; x < W + 120; x += 172) out.push([x + (r() - .5) * 36, y + (r() - .5) * 26, 70 + r() * 14, 100 + Math.floor(r() * 900)]); return out; })();
  const KM_PORES = (() => { const out = []; for (let i = 0; i < KM_MG.length; i++) for (let j = i + 1; j < KM_MG.length; j++) { const A = KM_MG[i], B = KM_MG[j], d = Math.hypot(B[0] - A[0], B[1] - A[1]); if (d < A[2] + B[2] + 40) { const u = (A[2] + (d - A[2] - B[2]) / 2) / d; const px = A[0] + (B[0] - A[0]) * u, py = A[1] + (B[1] - A[1]) * u; if (py < 860 && px > 30 && px < 1540) out.push({ x: px, y: py, a: i, b: j }); } } return out; })();
  const KM_PIG = Array.from({ length: 34 }, (_, i) => ({ x: 30 + hash(i * 5 + 1) * 1860, y: 318 + hash(i * 9 + 2) * 52, s: 9 + hash(i * 3) * 6, col: i % 3 === 0 ? KM.ochre : i % 3 === 1 ? KM.paint : '#A84A2C', pore: i < KM_PORES.length * 2 && i % 2 === 0 ? KM_PORES[(i / 2 * 7) % KM_PORES.length] : null }));
  function km_grainImg(r, seed) {
    const s = Math.ceil(r * 2.4);
    return cached(`km_grain|${r.toFixed(1)}|${seed}`, s, s, g => {
      const cx = s / 2, cy = s / 2; const col = ['#CBBDA5', '#BDB09C', '#D6C9B2', '#B3A58E'][seed % 4];
      g.beginPath(); km_wob(g, cx, cy, r, seed, .1, 11);
      const gr = g.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r * 1.1); gr.addColorStop(0, mixColor(col, '#FFFFFF', .35)); gr.addColorStop(1, mixColor(col, '#000000', .12));
      g.fillStyle = gr; g.fill(); g.save(); g.clip(); const R = rng(seed);
      for (let i = 0; i < r * 1.4; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,255,.18)' : 'rgba(70,55,40,.14)'; g.fillRect(cx + (R() - .5) * 2 * r, cy + (R() - .5) * 2 * r, 2 + R() * 4, 2 + R() * 3); }
      g.restore(); g.beginPath(); km_wob(g, cx, cy, r, seed, .1, 11); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
    });
  }
  function km_crystalPath(c, x, y, a, L, wd) {
    const dx = Math.cos(a), dy = Math.sin(a), px = -dy * wd / 2, py = dx * wd / 2;
    c.moveTo(x, y); c.lineTo(x + dx * L * .2 + px, y + dy * L * .2 + py); c.lineTo(x + dx * L * .8 + px, y + dy * L * .8 + py); c.lineTo(x + dx * L, y + dy * L); c.lineTo(x + dx * L * .8 - px, y + dy * L * .8 - py); c.lineTo(x + dx * L * .2 - px, y + dy * L * .2 - py); c.closePath();
  }
  function km_shotD(c, S) {
    const t = S.t, c3 = S.cue(3), e3 = S.cueEnd(3), f = k => lerp(c3, e3, k);
    const tPen0 = c3 + .1, tPen1 = f(.33), tCry0 = f(.3), tCry1 = f(.52), tSolid = f(.66);
    const sky = c.createLinearGradient(0, 0, 0, 400); sky.addColorStop(0, '#CDE6F5'); sky.addColorStop(1, '#F3F9FC'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
    c.save(); km_drift(c, t, c3 - .9, S.cue(4), 800, 520, .035);
    // substrate background (lime binder between grains)
    c.fillStyle = '#E8DFCF'; c.fillRect(0, 380, W, H - 380);
    // silicate liquid filling the pores from the top
    const pen = ease(inv(tPen0, tPen1, t)), front = 380 + pen * 560, solid = smooth(inv(tSolid, tSolid + 1.2, t));
    const liq = mixColor('#9FE3D7', '#C7D9CF', solid);
    c.save(); c.beginPath(); c.moveTo(0, 300); for (let i = 0; i <= 48; i++) { const x = i * W / 48; c.lineTo(x, 300); } for (let i = 48; i >= 0; i--) { const x = i * W / 48; c.lineTo(x, front + 30 * Math.sin(x * .013 + 1) + 40 * Math.pow(Math.max(0, Math.sin(x * .021)), 3)); } c.closePath();
    c.fillStyle = liq; c.fill(); c.restore();
    // top paint layer (liquid silicate + pigments), thinning as it soaks in
    const layerTop = 300 + pen * 46;
    c.fillStyle = rgba(liq, .85); c.fillRect(0, layerTop, W, 400 - layerTop);
    c.beginPath(); c.moveTo(0, layerTop); for (let i = 0; i <= 48; i++) c.lineTo(i * W / 48, layerTop + Math.sin(t * 2 + i * .8) * 3 * (1 - solid)); c.strokeStyle = rgba(KM.glassD, .9); c.lineWidth = 4; c.stroke();
    // crystals (bonds) — drawn below the grains so they sprout from their surfaces
    const cg = k => easeOut(inv(lerp(tCry0, tCry1, k), lerp(tCry0, tCry1, k) + 1.1, t));
    c.beginPath(); let anyC = false;
    KM_PORES.forEach((p, i) => {
      const g = cg(hash(i * 13) * .8); if (g <= 0) return; anyC = true;
      for (const gi of [p.a, p.b]) { const G = KM_MG[gi], a0 = Math.atan2(p.y - G[1], p.x - G[0]); for (let j = -1; j <= 1; j++) { const a = a0 + j * .28, bx = G[0] + Math.cos(a) * G[2] * .9, by = G[1] + Math.sin(a) * G[2] * .9; const L = (Math.hypot(p.x - bx, p.y - by) + 14) * g * (.8 + .3 * hash(i + j + gi)); km_crystalPath(c, bx, by, Math.atan2(p.y - by, p.x - bx) + j * .12, L, 9); } }
    });
    if (anyC) { c.fillStyle = KM.cryst; c.fill(); c.strokeStyle = KM.crystLine; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke(); }
    // grains
    KM_MG.forEach(([x, y, r, seed]) => { if (y - r > H) return; const img = km_grainImg(r, seed); c.drawImage(img, x - img.width / 2, y - img.height / 2); });
    // pigments: in the top layer, some carried down into the pores
    c.beginPath();
    KM_PIG.forEach((p, i) => {
      let x = p.x, y = p.y + pen * 30;
      if (p.pore) { const k = ease(inv(lerp(tPen0, tPen1, (p.pore.y - 380) / 560) - .3, lerp(tPen0, tPen1, (p.pore.y - 380) / 560) + .5, t)); x = lerp(p.x, p.pore.x, k); y = lerp(p.y, p.pore.y, k); }
      p.wx = x; p.wy = y;
    });
    KM_PIG.forEach((p, i) => { c.save(); c.translate(p.wx, p.wy); c.rotate(i); c.beginPath(); km_wob(c, 0, 0, p.s, i + 7, .2, 6); c.fillStyle = p.col; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 2.5; c.stroke(); c.restore(); });
    // pigment ↔ grain bonds (small crystals around each pigment once the reaction starts)
    c.beginPath(); let anyB = false;
    KM_PIG.forEach((p, i) => { const g = cg(.2 + hash(i * 3) * .8); if (g <= 0) return; anyB = true; for (let j = 0; j < 3; j++) { const a = j / 3 * TAU + i + Math.PI / 2; km_crystalPath(c, p.wx + Math.cos(a) * p.s * .8, p.wy + Math.sin(a) * p.s * .8, a, 16 * g, 6); } });
    if (anyB) { c.fillStyle = KM.cryst; c.fill(); c.strokeStyle = KM.crystLine; c.lineWidth = 2; c.stroke(); }
    // "one stone" glint sweep
    if (solid > 0 && solid < 1) { const gx = lerp(-300, W + 300, solid); const gg = c.createLinearGradient(gx - 160, 0, gx + 160, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(gx - 160, 300, 320, H - 300); }
    if (t > tCry1) for (let i = 0; i < 7; i++) { const q = (t * .7 + i * .29) % 1, p = KM_PORES[(i * 5) % KM_PORES.length]; km_sparkle(c, p.x, p.y, 16 * Math.sin(q * Math.PI), Math.sin(q * Math.PI)); }
    c.restore();
    // labels
    const kOut = 1 - appear(t, f(.4), .3);
    label(c, 'silicate liquide + pigments', 520, 220, { k: appear(t, c3 + .4, .5) * kOut, size: 40, bg: '#E6FBF6' });
    km_arrow(c, 520, 252, 560, 320, appear(t, c3 + .6, .4) * kOut, .2);
    label(c, 'support minéral', 1220, 220, { k: appear(t, c3 + 1.2, .5) * kOut, size: 40, bg: '#FFFFFF' });
    km_arrow(c, 1220, 252, 1250, 420, appear(t, c3 + 1.4, .4) * kOut, -.2);
    const kt = appear(t, f(.44), .6);
    if (kt > 0) { c.save(); c.translate(800, 150); const pulse = 1 + .035 * Math.sin(t * 5) * appear(t, f(.5), .4); c.scale(pulse, pulse); label(c, 'Silicatisation', 0, 0, { k: kt, size: 64, bg: '#FFE7B8' }); c.restore(); }
    label(c, 'liaisons cristallines', 520, 600, { k: appear(t, f(.36), .5) * (1 - appear(t, f(.62), .3)), size: 36, bg: KM.cryst });
    const kf = appear(t, f(.66), .6);
    label(c, 'la couleur fait partie de la pierre', 800, 246, { k: kf, size: 42, bg: '#FFFFFF' });
    km_badge(c, 800 + 376, 244, appear(t, f(.72), .5), true, 30);
  }

  // ---------- beat 5: UV and mineral pigments ----------
  function km_chalk(w, h) { return cached(`km_chalk|${w}|${h}`, w, h, g => { const r = rng(61); for (let i = 0; i < w * h / 40; i++) { g.fillStyle = r() < .6 ? 'rgba(255,255,255,.55)' : 'rgba(200,195,185,.4)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); } }); }
  function km_swatch(c, x, y, w, h, fade, gloss, t) {
    const cols = [KM.paint, KM.ochre, KM.blue];
    fillRR(c, x + 8, y + 10, w, h, 18, 'rgba(0,0,0,.16)');
    c.save(); rr(c, x, y, w, h, 18); c.clip();
    cols.forEach((col, i) => { c.fillStyle = mixColor(col, '#ECE8E0', fade * .78); c.fillRect(x + i * w / 3, y, w / 3 + 1, h); });
    if (fade > 0) { c.globalAlpha = fade; c.drawImage(km_chalk(Math.round(w), Math.round(h)), x, y); c.globalAlpha = 1; }
    if (gloss) { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.35, `rgba(255,255,255,${.35 * (1 - fade * .6)})`); g.addColorStop(.42, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); }
    c.restore();
    rr(c, x, y, w, h, 18); c.strokeStyle = C.ink; c.lineWidth = 5; c.stroke();
    for (let i = 1; i < 3; i++) line(c, x + i * w / 3, y, x + i * w / 3, y + h, 'rgba(43,38,35,.35)', 3);
  }
  function km_uvRay(c, x1, y1, x2, y2, k, t) {
    if (k <= 0) return;
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, n = 60;
    c.save(); c.beginPath();
    for (let i = 0; i <= n * k; i++) { const s = i / n, w = Math.sin(s * L / 30 - t * 9) * 11; const px = x1 + ux * L * s - uy * w, py = y1 + uy * L * s + ux * w; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 11; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.strokeStyle = KM.uv; c.lineWidth = 5; c.stroke();
    c.restore();
  }
  function km_heap(c, x, y, w, col, k) {
    if (k <= 0) return;
    c.save(); c.translate(x, y); const s = easeOutBack(k); c.scale(s, s);
    ellipse(c, 4, 4, w * .55, 8, 'rgba(0,0,0,.15)');
    c.beginPath(); c.moveTo(-w / 2, 0); c.quadraticCurveTo(-w * .2, -w * .7, 0, -w * .62); c.quadraticCurveTo(w * .2, -w * .7, w / 2, 0); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3.5; c.stroke();
    for (let i = 0; i < 6; i++) circle(c, (hash(i + x) - .5) * w * .6, -hash(i * 3 + x) * w * .4 - 4, 2.5, 'rgba(255,255,255,.35)');
    c.restore();
  }
  function km_shotF(c, S) {
    const t = S.t, c5 = S.cue(5), e5 = S.cueEnd(5), f = k => lerp(c5, e5, k);
    const tUV = f(.47), tY0 = f(.52), tY1 = f(.9), yr = inv(tY0, tY1, t), fade = smooth(yr);
    c.save(); km_drift(c, t, c5 - .5, S.cue(6), 860, 500, .025);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9FD0EE'); g.addColorStop(1, '#F6EEDC'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.drawImage(GRAIN(), 0, 0);
    sun(c, 860, 180, 74, t);
    const kU = appear(t, tUV, .6);
    if (kU > 0) {
      const sw = Math.sin(t * 3) * .5 + .5;
      c.save(); c.globalAlpha = .25 * kU * (.7 + .3 * sw); circle(c, 860, 180, 150, KM.uvL); c.restore();
      for (const [x2, y2] of [[380, 360], [470, 350], [1250, 350], [1340, 360]]) km_uvRay(c, 860 + (x2 - 860) * .12, 180 + 70, x2, y2, appear(t, tUV + .1, .7), t);
    }
    km_swatch(c, 230, 380, 460, 300, fade, true, t);
    km_swatch(c, 1030, 380, 460, 300, 0, false, t);
    // pigments: earths & oxides
    const hc = [KM.ochre, '#A84A2C', KM.green, '#7A5A3A', KM.paint];
    hc.forEach((col, i) => km_heap(c, 1090 + i * 86, 856, 76, col, appear(t, c5 + .1 + i * .12, .4)));
    c.restore();
    label(c, 'pigments organiques', 460, 730, { k: appear(t, c5 - .2, .5), size: 40 });
    label(c, 'terres & oxydes minéraux', 1260, 730, { k: appear(t, c5 + .2, .5), size: 40, bg: '#FFF1DA' });
    label(c, 'UV', 860, 330, { k: kU, size: 48, bg: KM.uvL, color: '#3E2370' });
    // years counter
    const ky = appear(t, tY0 - .3, .5);
    if (ky > 0) {
      c.save(); c.translate(860, 540); const s = easeOutBack(ky); c.scale(s, s);
      circle(c, 6, 8, 84, 'rgba(0,0,0,.15)'); circle(c, 0, 0, 84, '#FFFFFF', C.ink, 5);
      const n = Math.round(30 * clamp(yr));
      text(c, String(n), 0, -12, { size: 62, font: FONT.title, weight: 700 }); text(c, n > 1 ? 'ans' : 'an', 0, 40, { size: 32, font: FONT.title, weight: 600, color: C.inkSoft });
      c.restore();
    }
    km_badge(c, 690 - 16, 396, appear(t, f(.86), .5), false, 32);
    km_badge(c, 1490 - 16, 396, appear(t, f(.9), .5), true, 32);
  }

  // ---------- beat 6: façades painted around 1890, still there ----------
  function km_flagImg(kind) {
    return cached(`km_flag|${kind}`, kind === 'CH' ? 84 : 112, 82, g => {
      if (kind === 'CH') { g.fillStyle = '#D52B1E'; g.fillRect(0, 0, 84, 82); const u = 84 / 32; g.fillStyle = '#FFFFFF'; g.fillRect(13 * u, 6 * u, 6 * u, 20 * u); g.fillRect(6 * u, 13 * u, 20 * u, 6 * u); }
      else { const u = 112 / 22; g.fillStyle = '#BA0C2F'; g.fillRect(0, 0, 112, 82); g.fillStyle = '#FFFFFF'; g.fillRect(6 * u, 0, 4 * u, 82); g.fillRect(0, 6 * u, 112, 4 * u); g.fillStyle = '#00205B'; g.fillRect(7 * u, 0, 2 * u, 82); g.fillRect(0, 7 * u, 112, 2 * u); }
    });
  }
  function km_flag(c, x, gy, kind, t, k) {
    if (k <= 0) return;
    c.save(); c.translate(x, gy); const s = easeOutBack(k); c.scale(s, s); c.globalAlpha *= clamp(k * 3);
    ellipse(c, 0, 4, 22, 6, 'rgba(0,0,0,.18)');
    line(c, 0, 0, 0, -280, C.ink, 11); line(c, 0, 0, 0, -280, '#C9CED2', 6); circle(c, 0, -284, 9, '#E3B54B', C.ink, 3);
    const img = km_flagImg(kind), fw = img.width, fh = img.height, N = 16;
    for (let i = 0; i < N; i++) { const u = i / N, sw = fw / N, dy = Math.sin(u * 4 - t * 5) * 7 * u; c.drawImage(img, i * sw, 0, sw, fh, 4 + i * sw, -276 + dy, sw + .8, fh); }
    c.beginPath(); for (let i = 0; i <= N; i++) { const u = i / N; c.lineTo(4 + u * fw, -276 + Math.sin(u * 4 - t * 5) * 7 * u); } for (let i = N; i >= 0; i--) { const u = i / N; c.lineTo(4 + u * fw, -276 + fh + Math.sin(u * 4 - t * 5) * 7 * u); } c.closePath();
    c.strokeStyle = C.ink; c.lineWidth = 3.5; c.stroke();
    c.restore();
  }
  function km_shotG(c, S) {
    const t = S.t, c6 = S.cue(6), e6 = S.cueEnd(6), f = k => lerp(c6, e6, k), gy = 880;
    const ty0 = f(.12), ty1 = f(.58), yk = inv(ty0, ty1, t);
    c.save(); km_drift(c, t, c6 - .5, S.cue(7), 860, 560, .03);
    const tl = t + 9 * smooth(yk) * (ty1 - ty0); // time-lapse: clouds race while the years roll
    skyBg(c, tl * 2.2, { groundY: gy, clouds: true });
    // distant snowy mountains
    c.fillStyle = '#A9B9C8'; c.beginPath(); c.moveTo(0, 700); [[120, 520], [260, 610], [420, 470], [600, 600], [760, 500], [930, 620], [1130, 480], [1330, 600], [1520, 470], [1720, 590], [1920, 520], [1920, 700]].forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); c.fill();
    c.fillStyle = '#FFFFFF'; [[120, 520, 40], [420, 470, 46], [760, 500, 40], [1130, 480, 46], [1520, 470, 46], [1920, 520, 40]].forEach(([x, y, s]) => poly(c, [[x, y], [x - s, y + s * .8], [x - s * .4, y + s * .6], [x, y + s * .9], [x + s * .45, y + s * .6], [x + s, y + s * .8]], '#F7FBFF'));
    c.fillStyle = '#9CC27A'; c.beginPath(); c.moveTo(0, 760); c.quadraticCurveTo(480, 640, 960, 740); c.quadraticCurveTo(1440, 640, W, 730); c.lineTo(W, gy); c.lineTo(0, gy); c.closePath(); c.fill();
    ground(c, gy);
    house(c, 860, gy, 700, { finish: 'lime', color: '#D9844F', shutters: '#5F8FA8', patina: .65, t, seed: 4, sparkle: appear(t, f(.62), .6) * .9 });
    km_flag(c, 250, gy, 'CH', t, appear(t, f(.3), .5));
    km_flag(c, 380, gy, 'NO', t, appear(t, f(.42), .5));
    c.restore();
    // year counter 1890 → 2026
    const kc = appear(t, ty0 - .3, .5);
    if (kc > 0) {
      c.save(); c.translate(1500, 250); const s = easeOutBack(kc); c.scale(s, s);
      fillRR(c, -150 + 6, -64 + 8, 300, 128, 22, 'rgba(0,0,0,.15)'); fillRR(c, -150, -64, 300, 128, 22, '#FFFFFF', C.ink, 5);
      fillRR(c, -150, -64, 300, 34, [22, 22, 0, 0], C.terracotta, C.ink, 5);
      const yv = Math.round(lerp(1890, 2026, smooth(yk)));
      text(c, String(yv), 0, 22, { size: 72, font: FONT.title, weight: 700 });
      c.restore();
    }
    label(c, 'peintes vers 1890 — toujours là', 860, 140, { k: appear(t, f(.66), .6), size: 50, bg: '#FFF1DA' });
    label(c, 'Suisse', 250, 535, { k: appear(t, f(.34), .4), size: 32 });
    label(c, 'Norvège', 400, 535, { k: appear(t, f(.46), .4), size: 32 });
  }

  // ---------- beat 7: sol-silicate & lime wash on a fresh lime render ----------
  function km_pot(c, x, by, w, h, lines, col, lid, k, t) {
    if (k <= 0) return;
    c.save(); c.translate(x, by); const s = easeOutBack(k); c.scale(s, s); c.globalAlpha *= clamp(k * 3);
    ellipse(c, 8, 6, w * .6, 14, 'rgba(0,0,0,.18)');
    c.beginPath(); c.arc(0, -h - 10, w * .52, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = C.ink; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#B9BEC2'; c.lineWidth = 3; c.stroke();
    poly(c, [[-w / 2, -h], [w / 2, -h], [w * .44, 0], [-w * .44, 0]], '#E9EDF0', C.ink, 5);
    ellipse(c, 0, -h, w / 2, 16, col, C.ink, 5);
    fillRR(c, -w * .44, -h * .78, w * .88, h * .56, 8, '#FFFFFF', C.ink, 3);
    circle(c, -w * .3, -h * .5, 15, col, C.ink, 3);
    lines.forEach((s2, i) => text(c, s2, w * .07, -h * .5 + (i - (lines.length - 1) / 2) * 38, { size: 34, font: FONT.title, weight: 700, maxW: w * .6 }));
    line(c, -w * .46, -h * .1, w * .46, -h * .1, 'rgba(43,38,35,.25)', 3);
    c.restore();
  }
  function km_stroke(c, x0, x1, y, wd, col, k, seed, alpha = .92) {
    if (k <= 0) return;
    const xe = lerp(x0, x1, k);
    c.save(); c.globalAlpha *= alpha; c.beginPath(); c.moveTo(x0, y - wd / 2);
    for (let i = 0; i <= 30; i++) { const x = lerp(x0, xe, i / 30); c.lineTo(x, y - wd / 2 + Math.sin(x * .05 + seed) * 5); }
    for (let i = 30; i >= 0; i--) { const x = lerp(x0, xe, i / 30); c.lineTo(x, y + wd / 2 + Math.sin(x * .04 + seed * 2) * 6); }
    c.closePath(); c.fillStyle = col; c.fill(); c.clip();
    for (let i = 0; i < 9; i++) { const yy = y - wd / 2 + 8 + i * (wd - 16) / 8; line(c, x0, yy, xe, yy + Math.sin(i) * 2, i % 2 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.07)', 3); }
    c.restore();
  }
  function km_brush(c, x, y, col) {
    c.save(); c.translate(x, y); c.rotate(-.5);
    fillRR(c, -46, -10, 92, 40, 8, col, C.ink, 4);
    for (let i = -38; i <= 38; i += 11) line(c, i, -4, i, 26, 'rgba(0,0,0,.15)', 2);
    fillRR(c, -44, -44, 88, 36, 6, '#B9BEC2', C.ink, 4);
    fillRR(c, -14, -170, 28, 128, 12, C.wood, C.ink, 4);
    c.restore();
  }
  function km_shotH(c, S) {
    const t = S.t, c7 = S.cue(7), e7 = S.cueEnd(7), f = k => lerp(c7, e7, k);
    c.save(); km_drift(c, t, c7 - .5, S.d, 800, 520, .025);
    c.drawImage(limeTexture(W, 800, '#F1EADB', 11, .25), 0, 0);
    const vg = c.createRadialGradient(W / 2, 420, 300, W / 2, 420, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,70,40,.18)'); c.fillStyle = vg; c.fillRect(0, 0, W, 800);
    // floor / scaffold plank
    c.fillStyle = '#CDB89A'; c.fillRect(0, 800, W, H - 800); line(c, 0, 800, W, 800, C.ink, 5);
    fillRR(c, 150, 796, 1300, 36, 6, C.wood, C.ink, 5); line(c, 160, 812, 1440, 812, C.woodDark, 3);
    const s1a = f(.33), s1b = f(.52), s2a = f(.64), s2b = f(.84);
    const k1 = ease(inv(s1a, s1b, t)), k2 = ease(inv(s2a, s2b, t));
    km_stroke(c, 240, 880, 380, 110, '#C77E66', k1, 1);
    km_stroke(c, 700, 1340, 560, 110, '#EAD39E', k2, 2, .85);
    km_pot(c, 520, 800, 250, 230, ['Sol-', 'silicate'], '#C77E66', null, appear(t, f(.28), .5), t);
    km_pot(c, 1000, 800, 250, 230, ['Badigeon', 'de chaux'], '#F3EEE3', null, appear(t, f(.58), .5), t);
    // the brush travels along the strokes
    let bxy = null, bcol = '#C77E66';
    if (t > s1a - .4 && t < s1b + .3) bxy = [lerp(240, 880, k1), 380 + Math.sin(t * 8) * 4];
    else if (t > s2a - .4 && t < s2b + .3) { bxy = [lerp(700, 1340, k2), 560 + Math.sin(t * 8) * 4]; bcol = '#EAD39E'; }
    if (bxy) km_brush(c, bxy[0] + 20, bxy[1] - 10, bcol);
    c.restore();
    label(c, 'enduit chaux récent', 520, 190, { k: appear(t, c7 - .2, .5), size: 46, bg: '#FFFFFF' });
  }

  // ---------- the scene ----------
  scene('keim', (ctx, S) => {
    const t = S.t, c = S.cue, ce = S.cueEnd;
    const T1 = c(1) - .5, T2 = c(2) - .5, T3 = c(3) - .45, T4 = c(4) - .45, T5 = c(5) - .5, T6 = c(6) - .5, T7 = c(7) - .5;
    const PZ = [KM_PR.x + KM_PR.w / 2, KM_YS + 20];
    const f = (i, k) => lerp(c(i), ce(i), k);

    // ---- Margot (computed first: beat 0 needs her palette hand) ----
    const usePal = t < T1 + .3;
    const pose = km_poseAt(t, [[0, KM_HOLD], [c(0) + .3, KM_HOLD_OPEN], [f(0, .28), KM_HOLD_UP], [f(0, .36), KM_HOLD_OPEN], [f(0, .5), KM_HOLD_UP], [f(0, .6), KM_HOLD_OPEN],
      [T1 - .2, 'explain'], [f(1, .1), 'pointL'], [f(1, .36), 'explain'], [f(1, .45), 'pointL'], [f(1, .8), 'open'],
      [c(2), 'pointL'], [f(2, .52), 'point'], [c(3), 'explain'], [f(3, .45), 'cheer'], [f(3, .66), 'open'],
      [c(4), 'explain'], [f(4, .5), 'stop'], [c(5), 'pointL'], [f(5, .5), 'pointUpL'], [f(5, .85), 'explain'],
      [c(6), 'pointL'], [f(6, .6), 'cheer'], [c(7), 'explain'], [f(7, .3), 'pointL'], [f(7, .85), 'open']]);
    let expr = 'happy';
    if (t > c(2) && t < f(2, .45)) expr = 'worried';
    else if (t > f(3, .4) && t < f(3, .55)) expr = 'surprised';
    else if (t > f(4, .6) && t < ce(4)) expr = 'serious';
    else if (t > f(1, .7) && t < c(2) - .4) expr = 'surprised';
    const fullX = km_key(t, [[0, 1640], [T1, 1640], [T1 + .9, 1710], [T2 - .05, 1710], [T2 + .6, 2330], [T5 - .1, 2330], [T5 + .8, 1730], [T6, 1730], [T6 + .9, 1700]]);
    const M = { x: fullX, y: 1010, s: .92, T: S.T, pose, expr, look: -.6, trowel: !usePal && t > T5 };
    const palK = 1 - appear(t, T1 - .25, .4);
    if (usePal && palK > 0) { M.hand = km_hand(M, -1); M.rot = -.25 + Math.sin(t * 1.3) * .03; }

    km_run(ctx, t, [
      { t0: -1e9, draw: g => km_shotA(g, S, M) },
      { t0: T1, tr: 'pan', draw: g => km_shotB(g, S) },
      { t0: T2, tr: 'pan', draw: g => km_sideBySide(g, S, 'C') },
      { t0: T3, tr: 'zoomIn', dur: 1.1, P: PZ, Z: 4, draw: g => km_shotD(g, S) },
      { t0: T4, tr: 'zoomOut', dur: 1.1, P: PZ, Z: 4, draw: g => km_sideBySide(g, S, 'E') },
      { t0: T5, tr: 'pan', draw: g => km_shotF(g, S) },
      { t0: T6, tr: 'pan', draw: g => km_shotG(g, S) },
      { t0: T7, tr: 'pan', draw: g => km_shotH(g, S) },
    ]);

    if (fullX < 2300) {
      presenter(ctx, M);
      if (M.hand && palK > 0) {
        ctx.save(); ctx.globalAlpha *= palK; const used = KM_HOUSES.map(h => appear(t, f(0, .3 + KM_HOUSES.indexOf(h) * .1), .2));
        const u5 = [0, 0, 0, 0, 0]; KM_HOUSES.forEach((h, i) => u5[h.blob] = used[i]);
        km_palette(ctx, M.hand[0], M.hand[1], M.rot, u5, t);
        circle(ctx, M.hand[0], M.hand[1], 23 * M.s, MARGOT.skin, C.ink, 5);
        ctx.restore();
      }
    }
    const bk = appear(t, T2 + .4, .5) * (1 - appear(t, T5 - .15, .4));
    if (bk > 0) {
      const [bx, by, br] = km_key(t, [[T3, [960, 590, 98]], [T3 + 1.1, [1748, 735, 128]], [T4, [1748, 735, 128]], [T4 + 1.1, [960, 590, 98]]]);
      presenterBubble(ctx, { x: bx, y: by, r: br, k: bk, T: S.T, pose, expr, look: t < f(2, .5) || (t > c(4) && t < f(4, .5)) ? -.7 : .7 });
    }
  });
})();

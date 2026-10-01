// presenter.js — Margot, maçonne du patrimoine. Drawn around her feet at (0,0); ~560 px tall at scale 1.
'use strict';

// Arm poses: [upper angle, elbow bend] in degrees for the viewer-left (L) and viewer-right (R) arm.
// upper: 0 = hanging down, 90 = horizontal outward, 180 = straight up. bend: added to upper for the forearm.
const POSES = {
  idle:      { L: [14, -18], R: [14, -18], sh: 0 },
  explain:   { L: [38, 75], R: [38, 75], sh: 0 },
  open:      { L: [62, 40], R: [62, 40], sh: 0 },
  point:     { L: [14, -18], R: [95, 4], sh: 0 },           // points to viewer-right
  pointL:    { L: [95, 4], R: [14, -18], sh: 0 },           // points to viewer-left
  pointUp:   { L: [14, -18], R: [150, 8], sh: 0 },
  pointUpL:  { L: [150, 8], R: [14, -18], sh: 0 },
  pointDown: { L: [14, -18], R: [55, -10], sh: 0 },
  wave:      { L: [14, -18], R: [140, 25], sh: 0 },
  think:     { L: [18, -60], R: [40, -175], sh: 0 },
  shrug:     { L: [58, 85], R: [58, 85], sh: 12 },
  cheer:     { L: [150, 15], R: [150, 15], sh: 0 },
  hold:      { L: [30, 95], R: [30, 95], sh: 0 },          // presenting something in front
  count:     { L: [14, -18], R: [125, 30], sh: 0 },          // raised hand for counting
  stop:      { L: [14, -18], R: [80, 85], sh: 0 },
};

// Blend between keyed poses. keys: [[time, 'pose'], ...] sorted; returns pose object.
function poseAt(t, keys, blend = .45) {
  let cur = POSES[keys[0][1]], prev = cur, t0 = -1e9;
  for (const [kt, name] of keys) { if (t >= kt) { prev = cur; cur = POSES[name]; t0 = kt; } }
  const k = ease(inv(t0, t0 + blend, t));
  const mix = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R), sh: lerp(prev.sh, cur.sh, k) };
}
// global talking amplitude at absolute time T (0..1) from the narration envelope
function talkAt(T) { const e = window.TIMING.env, i = Math.floor(T * window.TIMING.fps); return e[i] || 0; }

const MARGOT = { skin: '#F3C9A2', skinDark: '#D9A47F', cheek: '#EC9C88', hair: '#5A3825', hairDark: '#3F2618', bandana: '#C8643B',
  shirt: '#F2DDB0', shirtDark: '#D9BF8C', overall: '#3F6E8C', overallDark: '#2E5570', boot: '#5B3A26', ink: '#2B2623' };

// presenter(ctx, {x, y, s, pose, T, look, expr, flip, trowel, alpha, tilt})
//   pose: name or pose object (from poseAt). T: absolute time (drives talk, blink, idle motion).
//   look: -1..1 horizontal gaze. expr: 'happy' | 'worried' | 'surprised' | 'serious' | 'wink'
function presenter(ctx, o) {
  const p = Object.assign({ x: 1600, y: 1000, s: 1, pose: 'idle', T: 0, look: 0, lookY: 0, expr: 'happy', flip: false, trowel: true, alpha: 1, tilt: 0, talk: null, bounce: 0 }, o);
  const pose = typeof p.pose === 'string' ? POSES[p.pose] : p.pose;
  const T = p.T, talk = p.talk ?? talkAt(T), M = MARGOT;
  ctx.save(); ctx.globalAlpha *= p.alpha; ctx.translate(p.x, p.y); ctx.scale(p.s * (p.flip ? -1 : 1), p.s);
  const breathe = Math.sin(T * 2.1) * 3, sway = Math.sin(T * .9) * .015 + talk * Math.sin(T * 7) * .01;
  const hop = -Math.abs(Math.sin(p.bounce * Math.PI)) * 40;
  ctx.translate(0, hop);
  // ground shadow
  ellipse(ctx, 0, 4 - hop, 105, 16, 'rgba(0,0,0,.16)');
  // legs + boots
  fillRR(ctx, -58, -205, 52, 190, 14, M.overall, M.ink, 5);
  fillRR(ctx, 6, -205, 52, 190, 14, M.overall, M.ink, 5);
  fillRR(ctx, -70, -30, 70, 34, [16, 16, 6, 6], M.boot, M.ink, 5);
  fillRR(ctx, 2, -30, 70, 34, [16, 16, 6, 6], M.boot, M.ink, 5);
  // lime splashes on trousers
  [[-40, -90, 7], [-22, -150, 5], [30, -60, 6], [40, -130, 4], [18, -175, 5]].forEach(([a, b, r]) => circle(ctx, a, b, r, 'rgba(255,255,255,.75)'));
  ctx.save(); ctx.rotate(sway); ctx.translate(0, breathe * .4);
  const shY = -362 - pose.sh;
  // arms behind? no — torso first, arms after
  // torso (shirt)
  fillRR(ctx, -88, -385, 176, 200, 40, M.shirt, M.ink, 5);
  // overall bib + straps
  fillRR(ctx, -66, -318, 132, 128, 14, M.overall, M.ink, 5);
  line(ctx, -50, -318, -64, -382, M.overall, 16); line(ctx, 50, -318, 64, -382, M.overall, 16);
  circle(ctx, -50, -312, 7, '#E3B54B', M.ink, 3); circle(ctx, 50, -312, 7, '#E3B54B', M.ink, 3);
  fillRR(ctx, -30, -292, 60, 44, 8, M.overallDark, M.ink, 4); // pocket
  line(ctx, -8, -300, -8, -268, '#E8E2D2', 5); // pencil in pocket
  fillRR(ctx, -94, -212, 188, 34, 10, M.overall, M.ink, 5); // waist
  // neck
  fillRR(ctx, -20, -405, 40, 30, 8, M.skinDark, null);
  // arms
  const arm = (side, [u, b]) => {
    const sx = side * 82, sy = shY + 22;
    const wig = talk * 6 * Math.sin(T * 6 + side);
    const ua = (u + wig) * Math.PI / 180, fa = (u + b + wig * 1.6) * Math.PI / 180;
    const ex = sx + side * Math.sin(ua) * 100, ey = sy + Math.cos(ua) * 100;
    const hx = ex + side * Math.sin(fa) * 96, hy = ey + Math.cos(fa) * 96;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.strokeStyle = M.ink; ctx.lineWidth = 50; ctx.stroke();
    ctx.strokeStyle = M.shirt; ctx.lineWidth = 40; ctx.stroke();
    // rolled cuff
    const cx = lerp(ex, hx, .72), cy = lerp(ey, hy, .72);
    ctx.beginPath(); ctx.moveTo(lerp(ex, hx, .5), lerp(ey, hy, .5)); ctx.lineTo(cx, cy); ctx.strokeStyle = M.shirtDark; ctx.lineWidth = 42; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(hx, hy); ctx.strokeStyle = M.ink; ctx.lineWidth = 36; ctx.stroke(); ctx.strokeStyle = M.skin; ctx.lineWidth = 27; ctx.stroke();
    circle(ctx, hx, hy, 23, M.skin, M.ink, 5);
    return [hx, hy, fa];
  };
  const hl = arm(-1, pose.L), hr = arm(1, pose.R);
  // trowel in the viewer-left hand
  if (p.trowel) {
    ctx.save(); ctx.translate(hl[0], hl[1]); ctx.rotate(hl[2]);
    fillRR(ctx, -7, -6, 14, 46, 6, C.wood, M.ink, 4);
    line(ctx, 0, 40, 0, 56, '#8E9499', 6);
    poly(ctx, [[-26, 56], [26, 56], [0, 130]], '#C9CED2', M.ink, 4);
    line(ctx, -14, 66, 8, 66, 'rgba(255,255,255,.7)', 4);
    ctx.restore();
    circle(ctx, hl[0], hl[1], 23, M.skin, M.ink, 5);
  }
  // head
  const hy = -478, tilt = p.tilt + Math.sin(T * 1.3) * .03 + talk * Math.sin(T * 5.3) * .025;
  ctx.save(); ctx.translate(0, hy + talk * Math.sin(T * 9) * 2); ctx.rotate(tilt); ctx.scale(1.12, 1.12);
  // bun
  circle(ctx, 0, -98, 34, M.hair, M.ink, 5);
  // hair back
  blob(ctx, 0, 0, 88, 3, .05, 12, M.hair, M.ink, 5);
  // ears
  ellipse(ctx, -80, 8, 14, 20, M.skin, M.ink, 4); ellipse(ctx, 80, 8, 14, 20, M.skin, M.ink, 4);
  circle(ctx, -82, 30, 5, '#E3B54B'); circle(ctx, 82, 30, 5, '#E3B54B');
  // face
  ellipse(ctx, 0, 12, 76, 80, M.skin, M.ink, 5);
  // fringe
  ctx.beginPath(); ctx.moveTo(-78, -2); ctx.quadraticCurveTo(-70, -66, 0, -72); ctx.quadraticCurveTo(70, -66, 78, -2); ctx.quadraticCurveTo(40, -40, 10, -30); ctx.quadraticCurveTo(-30, -45, -78, -2); ctx.closePath(); ctx.fillStyle = M.hair; ctx.fill(); ctx.strokeStyle = M.ink; ctx.lineWidth = 4; ctx.stroke();
  // bandana
  ctx.beginPath(); ctx.moveTo(-84, -16); ctx.quadraticCurveTo(0, -92, 84, -16); ctx.lineTo(80, -38); ctx.quadraticCurveTo(0, -112, -80, -38); ctx.closePath(); ctx.fillStyle = M.bandana; ctx.fill(); ctx.strokeStyle = M.ink; ctx.lineWidth = 4; ctx.stroke();
  [[-50, -48], [-18, -66], [18, -66], [50, -48], [0, -78]].forEach(([a, b]) => circle(ctx, a, b, 4, '#F6E6D6'));
  poly(ctx, [[78, -30], [112, -46], [104, -14]], M.bandana, M.ink, 4);
  // eyes
  const bi = Math.floor(T / 3.7), bt = T - bi * 3.7 - hash(bi) * 1.5;
  let open = (bt > 0 && bt < .16) ? Math.abs(bt - .08) / .08 : 1;
  if (p.expr === 'wink') open = 1;
  const lx = p.look * 7, ly = p.lookY * 6;
  for (const sd of [-1, 1]) {
    const ex = sd * 30, ey = 4;
    const o2 = (p.expr === 'wink' && sd === 1) ? 0 : open;
    if (o2 > .15) {
      ellipse(ctx, ex, ey, 17, 21 * o2, '#FFFFFF', M.ink, 3.5);
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 17, 21 * o2, 0, 0, TAU); ctx.clip();
      circle(ctx, ex + lx, ey + 3 + ly, 11, '#4A3020'); circle(ctx, ex + lx, ey + 3 + ly, 6, '#1B120C'); circle(ctx, ex + lx + 4, ey - 2 + ly, 3.5, '#FFFFFF');
      ctx.restore();
    } else { ctx.beginPath(); ctx.moveTo(ex - 16, ey); ctx.quadraticCurveTo(ex, ey + 9, ex + 16, ey); ctx.strokeStyle = M.ink; ctx.lineWidth = 4; ctx.stroke(); }
    // eyebrows
    const by = ey - 27 - (p.expr === 'surprised' ? 10 : 0) - talk * 3;
    const inner = p.expr === 'worried' ? -9 : p.expr === 'serious' ? 7 : 0;
    line(ctx, ex - sd * 14, by + inner, ex + sd * 14, by - 3, M.hairDark, 6);
  }
  // cheeks + nose
  circle(ctx, -48, 36, 12, rgba(M.cheek, .55)); circle(ctx, 48, 36, 12, rgba(M.cheek, .55));
  ctx.beginPath(); ctx.moveTo(-3, 18); ctx.quadraticCurveTo(-10, 34, 2, 36); ctx.strokeStyle = M.skinDark; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
  // mouth
  const mo = clamp(talk * 1.15 + (p.expr === 'surprised' ? .5 : 0));
  const mw = 24 - mo * 6 + (p.expr === 'happy' ? 4 : 0), my = 54;
  if (mo > .06) {
    ctx.beginPath(); ctx.moveTo(-mw, my - 3); ctx.quadraticCurveTo(0, my + 3, mw, my - 3); ctx.quadraticCurveTo(mw * .8, my + 8 + mo * 30, 0, my + 8 + mo * 32); ctx.quadraticCurveTo(-mw * .8, my + 8 + mo * 30, -mw, my - 3); ctx.closePath();
    ctx.fillStyle = '#7A2E2A'; ctx.fill(); ctx.save(); ctx.clip(); ellipse(ctx, 0, my + 10 + mo * 30, 15, 11, '#E07A72'); if (mo > .35) ellipse(ctx, 0, my - 3, mw * .8, 6, '#FFFFFF'); ctx.restore();
    ctx.strokeStyle = M.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  } else {
    ctx.beginPath(); const smile = p.expr === 'worried' ? -8 : p.expr === 'serious' ? 0 : 12;
    ctx.moveTo(-22, my - smile * .3); ctx.quadraticCurveTo(0, my + smile, 22, my - smile * .3); ctx.strokeStyle = M.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore(); // head
  ctx.restore(); // torso sway
  ctx.restore();
}

// Margot in a round "picture-in-picture" bubble (for busy diagram scenes)
function presenterBubble(ctx, o) {
  const p = Object.assign({ x: 1740, y: 880, r: 150, k: 1, bg: '#FFFFFF' }, o);
  if (p.k <= 0) return;
  ctx.save(); ctx.translate(p.x, p.y); const sc = easeOutBack(p.k); ctx.scale(sc, sc);
  circle(ctx, 6, 10, p.r, 'rgba(0,0,0,.18)');
  circle(ctx, 0, 0, p.r, p.bg, C.ink, 6);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, p.r - 3, 0, TAU); ctx.clip();
  presenter(ctx, Object.assign({}, o, { x: 0, y: p.r * 2.25, s: p.r / 175, alpha: 1 }));
  ctx.restore(); ctx.restore();
}

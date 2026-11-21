// people.js — posable, painted humans (watercolour wash + ink), and the cast of the album.
//
// fig(who, x, y, o) paints one character in world space.
//   who: a CAST key ('cris', 'thibaut', 'jose', 'valerian', 'vlad', 'louise', 'mari').
//   Placement o.at: 'ground' (default: the lowest point of the body rests on y, pelvis at x), 'hip' (pelvis at x, y),
//     'head' (head centre at x, y — handy for close-ups). o.s scales the character's height CAST[who].h.
//   View o.view: 'r' | 'l' (three-quarter, facing right / left), 'pr' | 'pl' (profile), 'f' (front), 'b' (back).
//   Pose o.pose: 'stand' | 'walk' | 'run' | 'sit' | 'sitFloor' | 'kneel' | 'crouch' | 'lie' (o.ph = walk / run phase 0..1).
//     Joint overrides in radians, in the character's own frame (0 = hanging down, + = forward / outward in front view):
//     tor (torso lean), nk (head tilt), armN / armF = [shoulder, elbow] (near / far arm), legN / legF = [hip, knee],
//     rot (whole body), handN / handF ('open' | 'fist').
//   Face o.ex: preset ('neutral','talk','smile','happy','laugh','sad','cry','angry','shout','shock','scared','pain','tired',
//     'sleep','love','kiss','suspicious','smirk','blank','worried','determined','sly'), or parts o.eyes / o.brows / o.mouth;
//     o.look = [x, y] in -1..1. Extras: blush, tears, sweat, blackEye, dirt, blood, bandana, crumbs, bruise.
//   Clothes: o.outfit = a key of CAST[who].outfits, plus direct overrides (top, topStyle, pants, legStyle, ...).
//   Props: o.holdN / o.holdF = fn(u, sw) drawn at the hand (x runs along the forearm). o.draw(u, J, sw) runs in body space.
//   Layering: o.skip = ['armN', ...] or o.only = ['armN'] paints part of a figure (an arm over someone else in a hug).
// The mouth position is recorded with anchor(name) so speech bubbles point at the speaker.

const CAST = {
  cris: { key: 'cris', f: true, h: 432, skin: '#D6A17A', hair: '#2F1F1D', hairHi: '#5C3A2E', style: 'long', lips: '#B1505A', brow: '#2F1F1D',
    top: '#D5523F', topStyle: 'tee', pants: '#41598A', shoes: '#4A3428', build: 1,
    outfits: {
      bed: { topStyle: 'cami', top: '#F2E6D8' },
      heist: { top: '#3D3946', topStyle: 'hoodie', pants: '#2F3345', shoes: '#2B2530' },
      manif: { top: '#3D3946', topStyle: 'hoodie', pants: '#2F3345', shoes: '#2B2530', bandana: true },
      farm: { top: '#E7D9B8', topStyle: 'blouse', pants: '#7C6A9C', legStyle: 'skirt', skirtLen: 1.05, shoes: '#6B4A33', apron: '#F4EEE2' },
      farm2: { top: '#9BB7C9', topStyle: 'blouse', pants: '#41598A', shoes: '#6B4A33' },
      night: { top: '#EFE4F2', topStyle: 'nightie', legStyle: 'skirt', pants: '#EFE4F2', skirtLen: 1.25, shoes: null },
    } },
  thibaut: { key: 'thibaut', h: 478, skin: '#E8BA92', hair: '#2A1F26', hairHi: '#4B3A44', style: 'curly', stubble: true, brow: '#2A1F26',
    top: '#C9892F', topStyle: 'jacket', under: '#E9E3D6', pants: '#363B52', shoes: '#2E2A30', build: 1.02,
    outfits: {
      bed: { topStyle: 'bare', legStyle: 'bare' },
      heist: { top: '#2F2C36', topStyle: 'jacket', under: '#45414F', pants: '#2C2F40' },
      farm: { top: '#EDE6D8', topStyle: 'shirt', pants: '#4A5578', shoes: '#5A3D2C' },
      towel: { topStyle: 'bare', legStyle: 'towel', towel: '#F4F1EA', shoes: null },
      sheet: { topStyle: 'sheet', legStyle: 'sheet', sheet: '#F7F3EA', shoes: null },
      night: { top: '#D9D4CC', topStyle: 'tee', pants: '#5B6A8A', shoes: null },
    } },
  jose: { key: 'jose', h: 452, skin: '#C88E66', hair: '#1D1920', hairHi: '#3B3440', style: 'messy', brow: '#1D1920',
    top: '#5E9454', topStyle: 'hoodie', pants: '#B49E79', shoes: '#ECE5D8', build: .95,
    outfits: { bed: { topStyle: 'tee', top: '#E6D9C3', pants: '#5E7FB0' }, heist: { top: '#4C6E45', topStyle: 'hoodie', pants: '#3B3A40' } } },
  valerian: { key: 'valerian', h: 468, skin: '#EFC6A2', hair: '#6A4630', hairHi: '#8C6446', style: 'side', brow: '#5A3B28',
    top: '#2E3B74', topStyle: 'blouson', under: '#D7E2EE', pants: '#5A5E6E', shoes: '#2B2233', armband: '#F07F22', build: 1 },
  vlad: { key: 'vlad', h: 500, skin: '#ECC09D', hair: '#C9995A', hairHi: '#E0BA7C', style: 'buzz', beard: '#A8783F', brow: '#9A6E3C',
    top: '#7B4F34', topStyle: 'jacket', under: '#3B3843', pants: '#384463', shoes: '#2B2233', armband: '#F07F22', build: 1.16,
    outfits: { farm: { armband: null }, plain: { armband: null } } },
  louise: { key: 'louise', f: true, h: 440, skin: '#F2CFB3', hair: '#B0502E', hairHi: '#D9784A', style: 'bun', lips: '#C0535E', brow: '#8E4026',
    top: '#7D69AD', topStyle: 'dress', legStyle: 'skirt', skirtLen: 1.15, pants: '#7D69AD', cardigan: '#EFE3CC', shoes: '#6B3E3A', build: .98,
    outfits: {
      smock: { smock: '#F1EADB' },
      robe: { top: '#C77B8E', topStyle: 'robe', legStyle: 'skirt', skirtLen: 1.55, pants: '#C77B8E', cardigan: null, shoes: '#E9DCCB' },
      night: { top: '#E9DDEB', topStyle: 'nightie', legStyle: 'skirt', skirtLen: 1.5, pants: '#E9DDEB', cardigan: null, shoes: null },
    } },
  mari: { key: 'mari', h: 492, skin: '#D7A584', hair: '#4A3B33', hairHi: '#6A5848', style: 'bald', stubble: true, brow: '#3A2E28',
    top: '#CFC6AE', topStyle: 'tank', pants: '#4B4C55', shoes: '#2B2233', build: 1.22 },
};

const EX = {
  neutral: ['dot', 'neutral', 'neutral'], talk: ['dot', 'neutral', 'open'], smile: ['dot', 'neutral', 'smile'],
  happy: ['happy', 'up', 'grin'], laugh: ['happy', 'up', 'laugh'], sad: ['dot', 'worried', 'frown'], cry: ['shut', 'worried', 'wobble'],
  angry: ['narrow', 'angry', 'teeth'], shout: ['dot', 'angry', 'shout'], shock: ['wide', 'up', 'O'], scared: ['wide', 'worried', 'wobble'],
  pain: ['shut', 'worried', 'teeth'], tired: ['half', 'flat', 'flat'], sleep: ['closed', 'neutral', 'neutral'], love: ['half', 'up', 'smile'],
  kiss: ['closed', 'neutral', 'kiss'], suspicious: ['half', 'raise', 'flat'], smirk: ['half', 'raise', 'smirk'], blank: ['dot', 'flat', 'flat'],
  worried: ['dot', 'worried', 'flat'], determined: ['narrow', 'angry', 'flat'], sly: ['half', 'neutral', 'smirk'], sadtalk: ['dot', 'worried', 'open'],
  angrytalk: ['narrow', 'angry', 'open'], surprised: ['wide', 'up', 'open'], dreamy: ['closed', 'up', 'smile'],
};

function poseOf(o) {
  const P = { tor: 0, nk: 0, armN: [-.05, .28], armF: [.1, .3], legN: [.03, 0], legF: [-.03, 0], rot: 0, legsFront: false };
  const ph = (o.ph ?? 0) * TAU, s = Math.sin(ph), c = Math.cos(ph);
  switch (o.pose) {
    case 'walk': P.legN = [.36 * s, .15 + .45 * Math.max(0, -c)]; P.legF = [-.36 * s, .15 + .45 * Math.max(0, c)]; P.armN = [-.32 * s, .25]; P.armF = [.32 * s, .3]; P.tor = .04; break;
    case 'run': P.legN = [.75 * s, .5 + .8 * Math.max(0, -c)]; P.legF = [-.75 * s, .5 + .8 * Math.max(0, c)]; P.armN = [-.9 * s, 1.5]; P.armF = [.9 * s, 1.5]; P.tor = .25; break;
    case 'sit': P.legN = [1.5, 1.45]; P.legF = [1.42, 1.38]; P.armN = [.25, .9]; P.armF = [.3, .95]; P.legsFront = true; break;
    case 'sitFloor': P.legN = [1.45, .25]; P.legF = [1.35, .55]; P.armN = [-.35, .1]; P.armF = [-.2, .2]; P.tor = -.12; P.legsFront = true; break;
    case 'kneel': P.legN = [1.35, 1.75]; P.legF = [-.05, 1.62]; P.tor = .05; P.legsFront = true; break;
    case 'kneel2': P.legN = [.0, 1.62]; P.legF = [-.05, 1.6]; P.tor = .05; break;
    case 'crouch': P.legN = [2.0, 2.55]; P.legF = [1.75, 2.45]; P.tor = .55; P.armN = [.7, .6]; P.armF = [.8, .5]; P.legsFront = true; break;
    case 'lie': P.legN = [.02, .05]; P.legF = [-.02, .05]; P.armN = [-.1, .1]; P.armF = [.1, .1]; break;
  }
  for (const k of ['tor', 'nk', 'armN', 'armF', 'legN', 'legF', 'rot', 'legsFront', 'footN', 'footF']) if (o[k] != null) P[k] = o[k];
  if (o.pose === 'lie' && o.rot == null) P.rot = -Math.PI / 2;
  return P;
}

function outfitOf(C, o) {
  const D = { skin: C.skin, hair: C.hair, hairHi: C.hairHi, top: C.top, topStyle: C.topStyle, under: C.under, pants: C.pants,
    legStyle: C.legStyle || 'pants', skirtLen: C.skirtLen || 1, shoes: C.shoes, armband: C.armband, cardigan: C.cardigan, beard: C.beard,
    stubble: C.stubble, lips: C.lips, brow: C.brow, towel: C.towel, sheet: C.sheet, smock: C.smock, apron: C.apron, bandana: false };
  Object.assign(D, (C.outfits && o.outfit && C.outfits[o.outfit]) || {});
  for (const k of Object.keys(D)) if (o[k] !== undefined && k !== 'skin') D[k] = o[k];
  if (o.skinTone) D.skin = o.skinTone;
  if (['dress', 'robe', 'nightie'].includes(D.topStyle) && D.legStyle === 'pants') D.legStyle = 'skirt';
  return D;
}

const V2 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, k) => [a[0] * k, a[1] * k],
  rot: (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)], dir: a => [Math.sin(a), Math.cos(a)],
  lerp: (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)],
};

// Joint positions in body space: pelvis at (0, 0), facing +x, y down.
function joints(C, V, P, u) {
  const { add, rot, dir } = V2, b = C.build || 1, T = 31 * u;
  const sh = (C.f ? 9.0 : 11.0) * u * b;
  const N = rot([0, -T], P.tor);
  const shX = V === 'q' ? [-.6 * sh, .42 * sh] : V === 'p' ? [-.5 * u, .9 * u] : [-.86 * sh, .86 * sh];
  const Sn = add(N, rot([shX[0], 4.2 * u], P.tor)), Sf = add(N, rot([shX[1], 4.2 * u], P.tor));
  const L1 = 15.5 * u, L2 = 13.5 * u;
  const sxN = (V === 'f' || V === 'b') ? -1 : 1;
  const arm = (S, a, sx) => {
    const a1 = P.tor * sx + a[0], E = add(S, [Math.sin(a1) * L1 * sx, Math.cos(a1) * L1]), a2 = a1 + a[1], W = add(E, [Math.sin(a2) * L2 * sx, Math.cos(a2) * L2]);
    return { S, E, W, a1, a2, sx, ang: Math.atan2(Math.cos(a2), Math.sin(a2) * sx) };
  };
  const hx = V === 'q' ? [-3.2 * u, 2.6 * u] : V === 'p' ? [-.6 * u, .6 * u] : [-4.4 * u, 4.4 * u];
  const T1 = 24 * u, T2 = 23 * u;
  const leg = (x, a, sx, fo = 0) => {
    const Hj = [x, 1.5 * u], K = add(Hj, [Math.sin(a[0]) * T1 * sx, Math.cos(a[0]) * T1]), a2 = a[0] - a[1];
    const F = add(K, [Math.sin(a2) * T2 * sx, Math.cos(a2) * T2]);
    const fd = (V === 'f' || V === 'b') ? [.25 * sx, 1] : [Math.cos(a2 + fo) * sx, -Math.sin(a2 + fo)];
    return { H: Hj, K, F, a1: a[0], a2, fd, sx };
  };
  const hfx = V === 'q' ? .9 * u : V === 'p' ? 1.6 * u : 0;
  const Hc = add(N, rot([hfx, -(C.f ? 11.0 : 11.5) * u], P.tor + P.nk));
  return { N, Sn, Sf, armN: arm(Sn, P.armN, sxN), armF: arm(Sf, P.armF, 1), legN: leg(hx[0], P.legN, sxN, P.footN || 0), legF: leg(hx[1], P.legF, 1, P.footF || 0),
    Hc, headA: P.tor + P.nk, T, sh, u };
}

// Two-bone IK for an arm: angles [shoulder, elbow] (torso-relative) that put the hand on target T (body space).
function ikArm(S, T, sx, tor, u, bendSign = 1) {
  const L1 = 15.5 * u, L2 = 13.5 * u, dx = T[0] - S[0], dy = T[1] - S[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + .01 * u, L1 + L2 - .01 * u);
  const th = Math.atan2(dx * sx, dy);
  const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), be = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  return [th - al * bendSign - tor * sx, be * bendSign];
}
// Named reach targets in body space: 'ear', 'earF', 'mouth', 'eye', 'chest', 'belly', 'hip', 'head'
function namedTarget(J, name, u, V) {
  const H = (x, y) => V2.add(J.Hc, V2.rot([x * u, y * u], J.headA));
  switch (name) {
    case 'ear': return H(V === 'f' ? -7 : -5.2, 1.4); case 'earF': return H(V === 'f' ? 7 : 6.2, 1.4);
    case 'mouth': return H(V === 'q' ? 3.2 : V === 'p' ? 6.2 : 0, 8.6); case 'eye': return H(V === 'q' ? 1.2 : V === 'p' ? 5.5 : -2.8, 1.4);
    case 'head': return H(0, -7); case 'chest': return V2.add(J.N, V2.rot([V === 'p' ? 5 * u : 2.5 * u, 11 * u], 0));
    case 'belly': return [V === 'p' ? 6 * u : 3 * u, -9 * u]; case 'hip': return [V === 'f' ? -7 * u : 3 * u, -2 * u];
  }
  return null;
}

function fig(who, x, y, o = {}) {
  const C = typeof who === 'string' ? CAST[who] : who, name = o.as || C.key;
  const H = C.h * (o.s ?? 1), u = H / 100;
  const view = o.view || 'r', V = view === 'f' ? 'f' : view === 'b' ? 'b' : (view === 'pr' || view === 'pl') ? 'p' : 'q';
  const flip = view === 'l' || view === 'pl' || (o.flip && (V === 'f' || V === 'b'));
  const P = poseOf(o), D = outfitOf(C, o), J = joints(C, V, P, u);
  ctxJ = J;
  const sw = clamp(H / 470, .3, 2.2) * (o.swk ?? .85);
  const fl = flip ? -1 : 1, rot = P.rot || 0;
  const q = p => V2.rot([p[0] * fl, p[1]], rot);
  // placement
  let tx = x, ty = y;
  if (o.at === 'hip') { /* pelvis at x, y */ }
  else if (o.at === 'head') { const h = q(J.Hc); tx = x - h[0]; ty = y - h[1]; }
  else {
    const circ = [[J.legN.F, 1.9 * u], [J.legF.F, 1.9 * u], [V2.add(J.legN.F, V2.mul(J.legN.fd, 6 * u)), 1.5 * u], [V2.add(J.legF.F, V2.mul(J.legF.fd, 6 * u)), 1.5 * u],
      [J.legN.K, 3.4 * u], [J.legF.K, 3.4 * u], [[0, 2 * u], 6.5 * u], [J.Sn, 3 * u], [J.Sf, 3 * u], [J.Hc, 8.6 * u], [J.N, 4 * u]];
    let m = -1e9; for (const [p, r] of circ) m = Math.max(m, q(p)[1] + r);
    ty = y - m;
  }
  // hand targets: o.reachN / o.reachF = [worldX, worldY] or a named spot on the body ('ear', 'mouth', 'chest', ...)
  if (o.reachN || o.reachF) {
    const toBody = ([wx, wy]) => { const dx = wx - tx, dy = wy - ty, c = Math.cos(-rot), sn = Math.sin(-rot); return [(dx * c - dy * sn) * fl, dx * sn + dy * c]; };
    const tgt = r => typeof r === 'string' ? namedTarget(J, r, u, V) : r.body ? [r.body[0] * u, r.body[1] * u] : toBody(r);
    const sxN = (V === 'f' || V === 'b') ? -1 : 1;
    if (o.reachN) P.armN = ikArm(J.Sn, tgt(o.reachN), sxN, P.tor, u, o.bendN ?? 1);
    if (o.reachF) P.armF = ikArm(J.Sf, tgt(o.reachF), 1, P.tor, u, o.bendF ?? 1);
    Object.assign(J, joints(C, V, P, u));
  }
  const want = part => (!o.only || o.only.includes(part)) && !(o.skip && o.skip.includes(part));
  xPush(); xT(tx, ty); xR(rot); xS(fl, 1);
  if (o.shadow !== false && !rot && o.at !== 'head' && want('shadow')) {
    const gy = Math.max(J.legN.F[1], J.legF.F[1]) + 1.6 * u;
    paint(ellPts((J.legN.F[0] + J.legF.F[0]) / 2 + 2 * u, gy, 15 * u, 2.4 * u, 18), { fill: PAL.ink, fillOp: 55, bleed: .2, tex: .2, border: .1, ink: null });
  }
  const ctx = { C, D, V, P, J, u, sw, o, name, flip };
  if (want('backHair')) inHead(ctx, () => hairBack(ctx));
  const frontArms = V === 'f' || V === 'b';
  if (!frontArms && !o.farArmFront && want('armF')) drawArm(ctx, J.armF, 'F');
  if (want('legF') && !(P.legsFront && o.legsAllFront)) drawLeg(ctx, J.legF, 'F');
  if (want('hips')) drawHips(ctx);
  if (want('legN') && !P.legsFront) drawLeg(ctx, J.legN, 'N');
  if (want('skirt') && !P.legsFront) drawSkirt(ctx);
  if (want('neck')) drawNeck(ctx);
  if (want('torso')) drawTorso(ctx);
  if (P.legsFront) { if (want('legF') && o.legsAllFront) drawLeg(ctx, J.legF, 'F'); if (want('legN')) drawLeg(ctx, J.legN, 'N'); if (want('skirt')) drawSkirt(ctx); }
  if (frontArms && want('armF')) drawArm(ctx, J.armF, 'F');
  if (want('head')) inHead(ctx, () => drawHead(ctx));
  else if (o.anchorAlways !== false) inHead(ctx, () => anchor(name, ...mouthPos(ctx)));
  if (frontArms && want('armN')) drawArm(ctx, J.armN, 'N');
  else if (!frontArms && want('armN')) drawArm(ctx, J.armN, 'N');
  if (!frontArms && o.farArmFront && want('armF')) drawArm(ctx, J.armF, 'F');
  if (o.draw && want('extra')) o.draw(u, J, sw);
  xPop();
  return J;
}

let ctxJ = null;
function inHead(ctx, f) { const { J } = ctx; xPush(); xT(J.Hc[0], J.Hc[1]); xR(J.headA); f(); xPop(); }

// ---------- body parts ----------
const farCol = (c, side) => side === 'F' ? shade(c, .16) : c;

// One smooth outline for a two-segment limb A→B→C (round outer joint, mitred inner joint, round end caps).
function limbPts(A, B, C, ra, rb, rc) {
  const nrm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const d1 = nrm([B[0] - A[0], B[1] - A[1]]), d2 = nrm([C[0] - B[0], C[1] - B[1]]), n1 = [-d1[1], d1[0]], n2 = [-d2[1], d2[0]];
  const join = s => {
    const pts = [], outer = (n1[0] * d2[0] + n1[1] * d2[1]) * s < 0;
    const a1 = Math.atan2(n1[1] * s, n1[0] * s), a2 = Math.atan2(n2[1] * s, n2[0] * s);
    let da = a2 - a1; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    if (outer && Math.abs(da) > .12) { const k = Math.ceil(Math.abs(da) / .3); for (let i = 0; i <= k; i++) { const a = a1 + da * i / k; pts.push([B[0] + Math.cos(a) * rb, B[1] + Math.sin(a) * rb]); } }
    else { const nb = nrm([n1[0] + n2[0], n1[1] + n2[1]]), c = Math.max(.55, nb[0] * n1[0] + nb[1] * n1[1]); pts.push([B[0] + nb[0] * s * rb / c, B[1] + nb[1] * s * rb / c]); }
    return pts;
  };
  const out = [[A[0] + n1[0] * ra, A[1] + n1[1] * ra], ...join(1), [C[0] + n2[0] * rc, C[1] + n2[1] * rc]];
  const ac = Math.atan2(n2[1], n2[0]); for (let i = 1; i < 6; i++) { const a = ac - Math.PI * i / 6; out.push([C[0] + Math.cos(a) * rc, C[1] + Math.sin(a) * rc]); }
  out.push([C[0] - n2[0] * rc, C[1] - n2[1] * rc], ...join(-1).reverse(), [A[0] - n1[0] * ra, A[1] - n1[1] * ra]);
  const aa = Math.atan2(-n1[1], -n1[0]); for (let i = 1; i < 6; i++) { const a = aa - Math.PI * i / 6; out.push([A[0] + Math.cos(a) * ra, A[1] + Math.sin(a) * ra]); }
  return out;
}

function drawLeg(ctx, L, side) {
  const { D, u, sw } = ctx, ls = D.legStyle, b = ctx.C.build || 1;
  const bare = ls === 'bare' || ls === 'towel' || ls === 'sheet' || ls === 'skirt';
  const legCol = farCol(bare ? D.skin : D.pants, side);
  const rt = 4.3 * u * Math.sqrt(b) * (ctx.C.f ? 1.02 : 1), rk = 3.0 * u * Math.sqrt(b), ra = 2.0 * u;
  // shoe first (under the trouser hem)
  const heel = V2.add(L.F, V2.mul(L.fd, -1.6 * u)), toe = V2.add(L.F, V2.mul(L.fd, 6.4 * u)), dn = [-L.fd[1] * 0, 0];
  if (D.shoes) paint(capsule(heel[0], heel[1] + .6 * u, toe[0], toe[1] + .5 * u, 2.2 * u, 1.7 * u), { wash: farCol(D.shoes, side), fill: shade(D.shoes, .3), fillOp: 40, tex: .4, ink: PAL.ink, sw: sw * .8 });
  else paint(capsule(heel[0], heel[1] + .2 * u, toe[0], toe[1] + .2 * u, 1.7 * u, 1.3 * u), { wash: farCol(D.skin, side), ink: PAL.ink, sw: sw * .7 });
  paint(limbPts(L.H, L.K, L.F, rt, rk, ra), { wash: legCol, fill: shade(legCol, .25), fillOp: 65, tex: .6, border: .55, ink: PAL.ink, sw: sw * .85, curv: .25 });
  if (!bare && ls !== 'shorts') {
    inkLine([V2.lerp(L.H, L.K, .45), V2.lerp(L.H, L.K, .9)], sw * .3, shade(D.pants, .35), 'inkfine', 0);
    inkLine([V2.lerp(L.K, L.F, .2), V2.lerp(L.K, L.F, .8)], sw * .3, shade(D.pants, .35), 'inkfine', 0);
  }
}

function drawHips(ctx) {
  const { D, u, sw, J } = ctx, ls = D.legStyle;
  const col = ls === 'pants' || ls === 'shorts' ? D.pants : ls === 'skirt' ? D.pants : D.skin;
  const hw = (ctx.C.f ? 7.6 : 7.0) * u * (ctx.C.build || 1);
  paint(rrPts(-hw * (ctx.V === 'p' ? .7 : .95), -5 * u, hw * 2 * (ctx.V === 'p' ? .7 : .95), 9.5 * u, 4.5 * u), { wash: col, ink: PAL.ink, sw: sw * .8 });
  if (ls === 'towel') paint([[-hw * 1.08, -3 * u], [hw * 1.08, -4 * u], [hw * 1.2, 15 * u], [-hw * 1.15, 14 * u]], { wash: D.towel || '#F4F1EA', fill: '#D8D2C4', fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .8, curv: .15 });
}

function drawSkirt(ctx) {
  const { D, u, sw, J } = ctx, ls = D.legStyle;
  if (ls !== 'skirt' && ls !== 'sheet') return;
  const hw = 7.8 * u * (ctx.C.build || 1), len = ls === 'sheet' ? 1.45 : (D.skirtLen || 1);
  const hem = L => len <= 1 ? V2.lerp(L.H, L.K, len) : V2.lerp(L.K, L.F, clamp((len - 1) / .7));
  const hn = hem(J.legN), hf = hem(J.legF), pad = 4.8 * u;
  const hull = convexHull([[-hw, -5 * u], [hw, -5 * u], [hn[0] - pad, hn[1] + u], [hn[0] + pad, hn[1] + u], [hf[0] - pad, hf[1] + u], [hf[0] + pad, hf[1] + u]]);
  const col = ls === 'sheet' ? (D.sheet || '#F7F3EA') : D.pants;
  paint(hull, { wash: col, fill: shade(col, .22), fillOp: 55, tex: .55, border: .5, ink: PAL.ink, sw: sw * .85, curv: .12 });
  const hy = (hn[1] + hf[1]) / 2, hx = (hn[0] + hf[0]) / 2;
  for (const k of [-.5, 0, .5]) inkLine([[k * hw * .5, -2 * u], [hx + k * hw * .9, hy - 1 * u]], sw * .3, shade(col, .35), 'inkfine', .2);
  if (D.apron) paint([[-hw * .5, -4 * u], [hw * .75, -4 * u], [hx + hw * .7, hy - 3 * u], [hx - hw * .45, hy - 3 * u]], { wash: D.apron, ink: PAL.ink, sw: sw * .6, curv: .1 });
}

function convexHull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop(); return lo.concat(up);
}

function drawNeck(ctx) {
  const { D, u, sw, J } = ctx, top = V2.add(J.Hc, V2.rot([-.6 * u, 6.2 * u], J.headA));
  paint(capsule(J.N[0], J.N[1] + 2 * u, top[0], top[1], 2.6 * u, 2.4 * u), { wash: shade(D.skin, .08), ink: PAL.ink, sw: sw * .7 });
}

// torso outline in torso space (pelvis origin, neck at (0, -T)), facing +x
function torsoPts(ctx) {
  const { u, V, C, J } = ctx, T = J.T, b = C.build || 1, sh = J.sh, ww = (C.f ? 5.9 : 7.0) * u * b, hw = (C.f ? 7.9 : 6.9) * u * b;
  const bust = C.f ? 1.7 * u : .4 * u;
  if (V === 'q') return [[-1.9 * u, -T - .6 * u], [-.5 * sh, -T + .2 * u], [-.86 * sh, -T + 2.6 * u], [-.94 * sh, -T + 6 * u], [-.86 * sh, -T + 10 * u],
    [-.92 * ww, -T + 19 * u], [-.98 * hw, -2 * u], [-.9 * hw, 3.6 * u], [.86 * hw, 3.6 * u], [.92 * hw, -2 * u], [.9 * ww, -T + 19.5 * u],
    [.6 * sh + bust, -T + 11.5 * u], [.62 * sh, -T + 4.5 * u], [.5 * sh, -T + 1.6 * u], [.2 * sh, -T + .2 * u], [2.3 * u, -T - .4 * u]];
  if (V === 'p') { const k = b; return [[-1.8 * u, -T - .6 * u], [-3.6 * u * k, -T + 1.2 * u], [-4.8 * u * k, -T + 6 * u], [-4.6 * u * k, -T + 12 * u], [-4.0 * u * k, -T + 19 * u],
    [-5.2 * u * k, -2 * u], [-5 * u * k, 3.6 * u], [4.6 * u * k, 3.6 * u], [4.8 * u * k, -2 * u], [4.4 * u * k, -T + 19.5 * u], [4.8 * u * k + bust * 1.2, -T + 11.5 * u],
    [3.8 * u * k, -T + 4 * u], [2.6 * u, -T - .3 * u]]; }
  const half = [[-1.8 * u, -T - .6 * u], [-.55 * sh, -T + .2 * u], [-.92 * sh, -T + 2.6 * u], [-sh, -T + 6 * u], [-.92 * sh, -T + 10 * u], [-ww, -T + 19 * u], [-hw, -2 * u], [-.95 * hw, 3.6 * u]];
  return half.concat(half.slice().reverse().map(([x, y]) => [-x, y]));
}

function drawTorso(ctx) {
  const { D, u, sw, J, V, P } = ctx, T = J.T, ts = D.topStyle;
  xPush(); xR(P.tor);
  const pts = torsoPts(ctx);
  const bareTop = ts === 'bare' || ts === 'sheet';
  const col = bareTop ? D.skin : D.top;
  paint(pts, { wash: col, fill: shade(col, .25), fillOp: bareTop ? 40 : 75, bleed: .07, tex: .65, border: .6, ink: PAL.ink, sw: sw * .9, curv: .3 });
  const fx = V === 'q' ? 2.6 * u : V === 'p' ? 3.4 * u : 0, back = V === 'b';
  if (back) { inkLine([[0, -T + 2 * u], [0, -2 * u]], sw * .3, shade(col, .3), 'inkfine', 0); xPop(); return; }
  if (ts === 'bare') {
    inkLine([[fx - 5 * u, -T + 12 * u], [fx - 1 * u, -T + 13.5 * u], [fx + 2.5 * u, -T + 12.5 * u]], sw * .35, shade(D.skin, .35), 'inkfine', .5);
    paint(ellPts(fx - .5 * u, -8 * u, .5 * u, .7 * u, 8), { wash: shade(D.skin, .3), ink: null });
  } else if (ts === 'sheet') {
    paint([[-J.sh * .9, -T + 2 * u], [-J.sh * .3, -T + .5 * u], [J.sh * .7, -6 * u], [J.sh * .8, 4 * u], [-J.sh * .2, 4 * u], [-J.sh, -T + 14 * u]], { wash: D.sheet || '#F7F3EA', fill: '#D9D3C6', fillOp: 70, tex: .5, ink: PAL.ink, sw: sw * .7, curv: .2 });
    for (let k = 0; k < 3; k++) inkLine([[-J.sh * (.7 - k * .25), -T + (4 + k * 4) * u], [J.sh * (.4 + k * .1), -T + (16 + k * 4) * u]], sw * .3, '#B9B2A4', 'inkfine', .3);
  } else if (ts === 'jacket' || ts === 'blouson') {
    // open front showing the shirt, lapels
    const op = ts === 'jacket' ? 1 : .45, x0 = fx - 1.2 * u;
    paint([[x0 - 1.6 * u * op, -T + .8 * u], [x0 + 2.4 * u * op, -T + .6 * u], [x0 + 1.9 * u * op, 2 * u], [x0 - 1.3 * u * op, 2 * u]], { wash: D.under || PAL.cream, ink: null });
    inkLine([[x0 - 1.6 * u * op, -T + .8 * u], [x0 - 1.3 * u * op, 2.5 * u]], sw * .55, PAL.ink, 'inkfine', 0);
    inkLine([[x0 + 2.4 * u * op, -T + .6 * u], [x0 + 1.9 * u * op, 2.5 * u]], sw * .55, PAL.ink, 'inkfine', 0);
    paint([[x0 - 1.7 * u, -T + .2 * u], [x0 - 3.8 * u, -T + 1.5 * u], [x0 - 1.6 * u * op - .2 * u, -T + 8 * u]], { wash: shade(D.top, .12), ink: PAL.ink, sw: sw * .5 });
    if (ts === 'blouson') { paint(rectPts(-J.sh * .95, -1 * u, J.sh * 1.75, 3.2 * u), { wash: shade(D.top, .18), ink: PAL.ink, sw: sw * .5 }); }
  } else if (ts === 'hoodie') {
    paint(rrPts(fx - 5 * u, -11 * u, 9 * u, 6 * u, 2 * u), { wash: shade(D.top, .1), ink: PAL.ink, sw: sw * .5 });
    inkLine([[fx - .6 * u, -T + 1 * u], [fx - .9 * u, -T + 8 * u]], sw * .4, PAL.cream, 'inkfine', 0);
    inkLine([[fx + 1.0 * u, -T + 1 * u], [fx + 1.2 * u, -T + 7 * u]], sw * .4, PAL.cream, 'inkfine', 0);
  } else if (ts === 'shirt' || ts === 'blouse') {
    inkLine([[fx - .2 * u, -T + 1 * u], [fx, 2 * u]], sw * .35, shade(col, .4), 'inkfine', 0);
    for (let k = 0; k < 4; k++) paint(ellPts(fx + .4 * u, -T + (5 + k * 6) * u, .35 * u, .35 * u, 6), { wash: shade(col, .45), ink: null });
    paint([[fx - .6 * u, -T - .2 * u], [fx - 3.4 * u, -T + 1.2 * u], [fx - 1.2 * u, -T + 3.4 * u]], { wash: col, ink: PAL.ink, sw: sw * .5 });
    paint([[fx + .6 * u, -T - .2 * u], [fx + 3 * u, -T + 1.0 * u], [fx + 1.2 * u, -T + 3.2 * u]], { wash: col, ink: PAL.ink, sw: sw * .5 });
  } else if (ts === 'tee' || ts === 'tank' || ts === 'cami' || ts === 'nightie') {
    const deep = ts === 'cami' || ts === 'nightie' ? 4.5 * u : ts === 'tank' ? 3 * u : 1.6 * u;
    paint([[fx - 3.2 * u, -T + .2 * u], [fx + 3.0 * u, -T + .1 * u], [fx, -T + deep]], { wash: D.skin, ink: null });
    inkLine([[fx - 3.2 * u, -T + .2 * u], [fx, -T + deep], [fx + 3.0 * u, -T + .1 * u]], sw * .5, PAL.ink, 'inkfine', .5);
  } else if (ts === 'dress' || ts === 'robe') {
    paint([[fx - 2.6 * u, -T + .2 * u], [fx + 2.8 * u, -T + .2 * u], [fx + .2 * u, -T + 6 * u]], { wash: D.skin, ink: null });
    inkLine([[fx - 2.6 * u, -T + .2 * u], [fx + .2 * u, -T + 6 * u], [fx + 2.8 * u, -T + .2 * u]], sw * .5, PAL.ink, 'inkfine', .3);
    if (ts === 'robe') { paint(rectPts(-J.sh * .9, -12 * u, J.sh * 1.7, 2.4 * u), { wash: shade(D.top, .2), ink: PAL.ink, sw: sw * .4 }); }
    else paint(rectPts(-J.sh * .8, -11 * u, J.sh * 1.6, 1.6 * u), { wash: shade(D.top, .25), ink: null });
  }
  if (D.cardigan && ts === 'dress') {
    paint([[-J.sh * .95, -T + 1 * u], [fx - 2.8 * u, -T + .4 * u], [fx - 1.6 * u, 3 * u], [-J.sh * .85, 3.5 * u]], { wash: D.cardigan, fill: shade(D.cardigan, .2), fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .7 });
    if (V !== 'p') paint([[fx + 3 * u, -T + .4 * u], [J.sh * .7, -T + 1.5 * u], [J.sh * .75, 3 * u], [fx + 2.2 * u, 3 * u]], { wash: D.cardigan, ink: PAL.ink, sw: sw * .6 });
  }
  if (D.smock) {
    paint([[-J.sh * .9, -T + 2 * u], [J.sh * .7, -T + 2 * u], [J.sh * .95, 12 * u], [-J.sh * 1.05, 12 * u]], { wash: D.smock, fill: '#D8CFBE', fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .7, curv: .1 });
    for (const [px, py, c] of [[-2, -14, PAL.rose], [3, -6, PAL.teal], [-4, 2, PAL.ochre], [1, 6, PAL.sap]]) paint(blobPts(px * u, py * u, 1.1 * u, .9 * u, 8, .3, px * 3 + py), { wash: c, ink: null });
  }
  if (D.apron && D.legStyle !== 'skirt') paint([[fx - 5 * u, -14 * u], [fx + 4 * u, -14 * u], [fx + 5 * u, 6 * u], [fx - 6 * u, 6 * u]], { wash: D.apron, ink: PAL.ink, sw: sw * .6 });
  if (ctx.o.blood) {   // chest wound
    const k = ctx.o.blood === true ? 1 : ctx.o.blood;
    const cx0 = fx - .5 * u, cy0 = -T + 14 * u;
    paint(scallopPts(cx0, cy0, 4.6 * u * k, 5.6 * u * k, 7, .28, 5), { fill: '#8E1B2E', fillOp: 150, bleed: .25, tex: .7, border: .7, ink: null });
    paint(scallopPts(cx0, cy0 - .5 * u, 2.8 * u * k, 3.4 * u * k, 6, .3, 9), { wash: PAL.blood, washOp: 235, fill: '#6A1020', fillOp: 120, bleed: .15, tex: .6, ink: null });
    for (let i = 0; i < 3; i++) { const x0 = cx0 + (i - 1) * 2.2 * u * k, y0 = cy0 + 3.5 * u * k, l = (4 + i * 2.5) * u * k;
      paint([[x0 - .7 * u, y0], [x0 + .7 * u, y0], [x0 + .45 * u, y0 + l], [x0, y0 + l + .9 * u], [x0 - .45 * u, y0 + l]], { wash: PAL.blood, washOp: 225, ink: null, curv: .4 }); }
  }
  if (ctx.o.dirt) for (let i = 0; i < 5; i++) paint(blobPts(lerp(-J.sh * .7, J.sh * .5, hash(i * 3.3)), lerp(-T + 6 * u, 0, hash(i * 7.1)), 2 * u, 1.4 * u, 8, .4, i), { fill: PAL.earth, fillOp: 90, bleed: .2, tex: .6, ink: null });
  xPop();
}

function drawArm(ctx, A, side) {
  const { D, u, sw, o } = ctx, ts = D.topStyle, b = Math.sqrt(ctx.C.build || 1);
  const sleeveLong = ['jacket', 'blouson', 'hoodie', 'shirt', 'blouse', 'robe', 'long'].includes(ts) || (D.cardigan && ts === 'dress');
  const sleeveShort = ts === 'tee' || ts === 'nightie';
  const sleeveCol = D.cardigan && ts === 'dress' ? D.cardigan : D.top;
  const ra = 2.9 * u * b, re = 2.35 * u * b, rw = 1.75 * u * b;
  const skin = farCol(D.skin, side), sc = farCol(sleeveCol, side), col = sleeveLong ? sc : skin;
  paint(limbPts(A.S, A.E, A.W, ra, re, rw), { wash: col, fill: shade(col, .25), fillOp: sleeveLong ? 65 : 35, tex: .6, border: .55, ink: PAL.ink, sw: sw * .85, curv: .25 });
  if (sleeveLong) { const c0 = V2.lerp(A.E, A.W, .84); paint(capsule(c0[0], c0[1], A.W[0], A.W[1], rw * 1.12, rw * 1.08, 4), { wash: shade(sc, .12), ink: PAL.ink, sw: sw * .5 }); }
  if (sleeveShort) { const m = V2.lerp(A.S, A.E, .52); paint(capsule(A.S[0], A.S[1], m[0], m[1], ra * 1.14, ra * 1.08, 5), { wash: sc, fill: shade(sc, .2), fillOp: 40, ink: PAL.ink, sw: sw * .7 }); }
  if (D.armband && side === 'N') { const a = V2.lerp(A.S, A.E, .34), c = V2.lerp(A.S, A.E, .58), d = [A.E[0] - A.S[0], A.E[1] - A.S[1]], l = Math.hypot(d[0], d[1]), n = [-d[1] / l, d[0] / l], r1 = ra * 1.06, r2 = ra * 1.0;
    paint([[a[0] + n[0] * r1, a[1] + n[1] * r1], [c[0] + n[0] * r2, c[1] + n[1] * r2], [c[0] - n[0] * r2, c[1] - n[1] * r2], [a[0] - n[0] * r1, a[1] - n[1] * r1]], { wash: D.armband, fill: shade(D.armband, .2), fillOp: 50, ink: PAL.ink, sw: sw * .55 });
    const m = V2.lerp(a, c, .5); inkLine([[m[0] + n[0] * r1 * .6, m[1] + n[1] * r1 * .6], [m[0] - n[0] * r1 * .6, m[1] - n[1] * r1 * .6]], sw * .5, PAL.cream, 'inkfine', 0); }
  const hs = side === 'N' ? (o.handN || 'relaxed') : (o.handF || 'relaxed');
  xPush(); xT(A.W[0], A.W[1]); xR(A.ang);
  if (!(side === 'N' ? o.noHandN : o.noHandF)) drawHand(ctx, hs, side);
  const hook = side === 'N' ? o.holdN : o.holdF;
  if (hook) hook(u, sw);
  xPop();
}

function drawHand(ctx, hs, side) {
  const { D, u, sw } = ctx, skin = farCol(D.skin, side), bloodyHands = ctx.o.bloodyHands;
  const col = bloodyHands ? mixCol(skin, PAL.blood, .45) : skin;
  if (hs === 'fist') paint(ellPts(1.8 * u, 0, 2.5 * u, 2.3 * u, 12), { wash: col, ink: PAL.ink, sw: sw * .7 });
  else if (hs === 'open') {
    paint(ellPts(1.9 * u, 0, 2.4 * u, 1.9 * u, 12), { wash: col, ink: PAL.ink, sw: sw * .7 });
    for (const k of [-1.2, -.4, .4, 1.2]) paint(capsule(3.6 * u, k * u, 5.6 * u, k * 1.3 * u, .55 * u, .5 * u, 3), { wash: col, ink: PAL.ink, sw: sw * .5 });
    paint(capsule(1.6 * u, -1.6 * u, 3 * u, -3.2 * u, .6 * u, .55 * u, 3), { wash: col, ink: PAL.ink, sw: sw * .5 });
  } else {
    paint([[-.2 * u, -1.8 * u], [3.4 * u, -1.8 * u], [5.2 * u, -.6 * u], [5.1 * u, 1.3 * u], [2.8 * u, 2.2 * u], [-.2 * u, 1.8 * u]], { wash: col, ink: PAL.ink, sw: sw * .7, curv: .5 });
    paint(ellPts(2.2 * u, -1.9 * u, 1.5 * u, .85 * u, 8, 0, -.45), { wash: col, ink: PAL.ink, sw: sw * .5 });
  }
}

// ---------- head ----------
function faceGeom(ctx) {
  const { u, V, C } = ctx, rx = (C.f ? 7.3 : 7.7) * u, ry = (C.f ? 8.8 : 9.3) * u;
  const fx = V === 'q' ? 2.8 * u : V === 'p' ? 4.8 * u : 0;
  const eyes = V === 'q' ? [[fx - 2.7 * u, .3 * u, 1], [fx + 2.6 * u, .3 * u, .8]] : V === 'p' ? [[4.6 * u, .3 * u, .85]] : V === 'f' ? [[-2.9 * u, .3 * u, 1], [2.9 * u, .3 * u, 1]] : [];
  const mouth = V === 'q' ? [fx + .6 * u, 5.3 * u, 2.6 * u] : V === 'p' ? [5.9 * u, 5.4 * u, 1.5 * u] : [0, 5.3 * u, 3 * u];
  return { rx, ry, fx, eyes, mouth };
}
function mouthPos(ctx) { const g = faceGeom(ctx); return [g.mouth[0] + (ctx.V === 'b' ? 0 : 0), g.mouth[1]]; }

function headPts(ctx, g) {
  const { V, u } = ctx, pts = [];
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * TAU; let x = Math.cos(a) * g.rx, y = Math.sin(a) * g.ry;
    if (y > 0) {
      const k = Math.pow(y / g.ry, 1.7);
      if (V === 'f' || V === 'b') x *= 1 - .25 * k;
      else if (x < 0) x *= 1 - .34 * k;
      else x = x * (1 - .16 * k) + (V === 'p' ? 1.4 : .8) * u * k;
    }
    pts.push([x, y]);
  }
  return pts;
}

function drawHead(ctx) {
  const { D, u, sw, V, o, C, name } = ctx, g = faceGeom(ctx);
  const ex = EX[o.ex || 'neutral'] || EX.neutral;
  const eyesK = o.eyes || ex[0], browK = o.brows || ex[1], mouthK = o.mouth || ex[2];
  const hp = headPts(ctx, g);
  // ears (behind the head outline on the far side in front view)
  const ear = (x, y, s) => { paint(ellPts(x, y, 1.0 * u * Math.abs(s), 1.65 * u, 10), { wash: shade(D.skin, .06), ink: PAL.ink, sw: sw * .42 }); inkLine([[x + .2 * u * s, y - 1 * u], [x - .5 * u * s, y + .2 * u], [x + .1 * u * s, y + 1 * u]], sw * .35, shade(D.skin, .4), 'inkfine', .5); };
  if (V === 'f') { ear(-g.rx * .98, 1 * u, 1); ear(g.rx * .98, 1 * u, -1); }
  if (V === 'b') { ear(-g.rx * .96, 1 * u, 1); ear(g.rx * .96, 1 * u, -1); }
  paint(hp, { wash: D.skin, fill: shade(D.skin, .14), fillOp: 45, bleed: .08, tex: .55, border: .55, ink: PAL.ink, sw: sw * .9, curv: .3 });
  if (V === 'q') ear(-5.5 * u, 1.6 * u, .9);
  if (V === 'p') ear(-2.4 * u, 1.3 * u, .9);
  if (V === 'b') { hairFront(ctx, g); anchor(name, 0, 4 * u); return; }
  // stubble / beard base
  if (D.stubble) paint(jawPts(ctx, g, .45), { fill: '#3A4A60', fillOp: 55, bleed: .1, tex: .8, border: .3, ink: null });
  if (D.beard) { paint(jawPts(ctx, g, 0), { wash: D.beard, fill: shade(D.beard, .3), fillOp: 70, tex: .7, ink: PAL.ink, sw: sw * .55, curv: .2 }); }
  if (o.blush) for (const [x, y, s] of g.eyes) paint(ellPts(x - .2 * u, y + 2.6 * u, 1.5 * u * s, .8 * u, 10), { fill: PAL.rose, fillOp: 140, bleed: .2, ink: null });
  if (o.blackEye) { const [x, y, s] = g.eyes[0]; paint(ellPts(x, y + .3 * u, 2.1 * u * s, 1.9 * u, 14), { wash: '#6F5A8E', washOp: 200, fill: '#3E2E5A', fillOp: 90, bleed: .2, ink: null }); }
  if (o.dirt) for (let i = 0; i < 3; i++) paint(blobPts(lerp(-g.rx * .5, g.rx * .6, hash(i * 5.7)), lerp(-g.ry * .4, g.ry * .6, hash(i * 2.9)), 1.4 * u, 1 * u, 8, .4, i + 4), { fill: PAL.earth, fillOp: 80, bleed: .2, ink: null });
  if (o.bruise) paint(ellPts(g.fx + 2.6 * u, 3.4 * u, 1.6 * u, 1.2 * u, 10), { fill: '#8A5A7A', fillOp: 110, bleed: .2, ink: null });
  drawEyes(ctx, g, eyesK);
  drawBrows(ctx, g, browK);
  drawNose(ctx, g);
  if (!D.bandana) drawMouth(ctx, g, mouthK);
  if (D.beard) paint([[g.mouth[0] - 2.1 * u, g.mouth[1] - .2 * u], [g.mouth[0] - .6 * u, g.mouth[1] - 1.5 * u], [g.mouth[0] + .6 * u, g.mouth[1] - 1.5 * u], [g.mouth[0] + 2.1 * u, g.mouth[1] - .3 * u], [g.mouth[0], g.mouth[1] - .7 * u]], { wash: D.beard, ink: PAL.ink, sw: sw * .4, curv: .4 });
  if (o.tears) for (const [x, y, s] of g.eyes) {
    inkLine([[x, y + 1.2 * u], [x - .2 * u, y + 3.6 * u], [x + .1 * u, y + 5.4 * u]], sw * .7, '#6FA8D8', 'ink', .5);
    paint([[x + .1 * u, y + 5 * u], [x + .7 * u, y + 6.2 * u], [x + .1 * u, y + 6.9 * u], [x - .5 * u, y + 6.2 * u]], { wash: '#8EC3E6', ink: '#4A7FAF', sw: sw * .35, curv: .6 });
  }
  if (o.sweat) paint([[g.rx * .55, -4 * u], [g.rx * .55 + 1 * u, -1.8 * u], [g.rx * .55, -.8 * u], [g.rx * .55 - 1 * u, -1.8 * u]], { wash: '#BFE0F4', ink: '#4A7FAF', sw: sw * .4, curv: .6 });
  if (o.crumbs) for (let i = 0; i < 6; i++) paint(ellPts(g.mouth[0] + lerp(-2.5, 3, hash(i * 9.1)) * u, g.mouth[1] + lerp(-2.6, 1.5, hash(i * 4.3)) * u, .45 * u, .35 * u, 6), { wash: '#D9A048', ink: '#8A5A20', sw: sw * .2 });
  if (o.faceBlood) { inkLine([[g.fx + 1.4 * u, 3 * u], [g.fx + 1.6 * u, 4.4 * u], [g.fx + 1.2 * u, 6.2 * u]], sw * .9, PAL.blood, 'ink', .4); }
  if (D.bandana) drawBandana(ctx, g);
  if (o.scarfDown) { const col = typeof o.scarfDown === 'string' ? o.scarfDown : PAL.teal; paint([[-g.rx * .72, g.ry * .92], [g.rx * .9, g.ry * .84], [g.rx * .86, g.ry * 1.32], [g.fx, g.ry * 1.55], [-g.rx * .7, g.ry * 1.3]], { wash: col, fill: shade(col, .25), fillOp: 70, ink: PAL.ink, sw: sw * .7, curv: .3 }); }
  hairFront(ctx, g);
  anchor(name, g.mouth[0], g.mouth[1]);
}

function jawPts(ctx, g, k) {
  const { u, V } = ctx, hp = headPts(ctx, g);
  const outline = hp.slice(1, 16).filter(p => p[1] > g.ry * .12);          // along the jaw, front → back
  let inner;
  if (V === 'q') inner = [[-3.2 * u, 1.8 * u], [-1.2 * u, 3.0 * u], [g.fx - .5 * u, 3.3 * u], [g.fx + 2.5 * u, 3.1 * u], [g.rx * .9, 1.8 * u]];
  else if (V === 'p') inner = [[-.4 * u, 2 * u], [2.5 * u, 3.3 * u], [g.rx * .95, 3.4 * u]];
  else inner = [[-g.rx * .85, 1.6 * u], [-2.2 * u, 3.0 * u], [2.2 * u, 3.0 * u], [g.rx * .85, 1.6 * u]];
  return outline.concat(inner.map(([x, y]) => [x, y + 1.6 * u - k * 2.6 * u]));        // k: how far up the cheeks
}

function drawEyes(ctx, g, kind) {
  const { u, sw, o, C } = ctx, look = o.look || [0, 0];
  for (const [x, y, s] of g.eyes) {
    const lx = look[0] * .55 * u, ly = look[1] * .45 * u;
    if (kind === 'dot' || kind === 'half' || kind === 'narrow') {
      if (kind !== 'narrow' && u > 2.2) paint(ellPts(x + lx * .3, y, 1.4 * u * s, 1.1 * u, 12), { wash: '#FBF6EC', ink: null });
      paint(ellPts(x + lx, y + ly + (kind === 'narrow' ? .25 * u : 0), .7 * u * s, (kind === 'narrow' ? .55 : .95) * u, 10), { wash: PAL.ink, ink: null });
      if (u > 3.2) paint(ellPts(x + lx + .22 * u * s, y + ly - .28 * u, .2 * u, .2 * u, 6), { wash: PAL.cream, ink: null });
      // upper lid
      const lidY = kind === 'half' ? y - .1 * u : kind === 'narrow' ? y - .2 * u : y - 1.15 * u;
      inkLine([[x - 1.3 * u * s, lidY + .35 * u], [x, lidY - .15 * u], [x + 1.3 * u * s, lidY + .25 * u]], sw * (C.f ? .75 : .5), PAL.ink, 'ink', .5);
      if (kind === 'half') paint([[x - 1.3 * u * s, lidY + .35 * u], [x, lidY - .2 * u], [x + 1.3 * u * s, lidY + .25 * u], [x + 1.2 * u * s, y - 1.1 * u], [x - 1.2 * u * s, y - 1.1 * u]], { wash: shade(ctx.D.skin, .1), ink: null });
      if (C.f) inkLine([[x + 1.2 * u * s, lidY + .2 * u], [x + 1.9 * u * s, lidY - .45 * u]], sw * .5, PAL.ink, 'inkfine', 0);
    } else if (kind === 'wide') {
      paint(ellPts(x, y, 1.35 * u * s, 1.35 * u, 14), { wash: '#FBF6EC', ink: PAL.ink, sw: sw * .45 });
      paint(ellPts(x + lx, y + ly, .5 * u * s, .6 * u, 10), { wash: PAL.ink, ink: null });
    } else if (kind === 'closed') {
      inkLine([[x - 1.2 * u * s, y - .1 * u], [x, y + .5 * u], [x + 1.2 * u * s, y - .1 * u]], sw * .7, PAL.ink, 'ink', .5);
      if (C.f) inkLine([[x + 1.1 * u * s, y - .05 * u], [x + 1.6 * u * s, y + .3 * u]], sw * .4, PAL.ink, 'inkfine', 0);
    } else if (kind === 'happy') {
      inkLine([[x - 1.2 * u * s, y + .5 * u], [x, y - .4 * u], [x + 1.2 * u * s, y + .5 * u]], sw * .75, PAL.ink, 'ink', .5);
    } else if (kind === 'shut') {
      inkLine([[x - 1.3 * u * s, y + .1 * u], [x + 1.2 * u * s, y - .2 * u]], sw * .75, PAL.ink, 'ink', 0);
      inkLine([[x - 1.4 * u * s, y + .9 * u], [x - .8 * u * s, y + .5 * u]], sw * .35, PAL.ink, 'inkfine', 0);
    }
  }
}

function drawBrows(ctx, g, kind) {
  const { u, sw, D, V } = ctx, col = D.brow || PAL.ink;
  g.eyes.forEach(([x, y, s], i) => {
    // inner end points toward the face centre line
    const innerRight = V === 'p' ? false : (x < g.fx);
    let yi = y - 2.6 * u, yo = y - 2.4 * u, xi = x + (innerRight ? 1.2 : -1.2) * u * s, xo = x + (innerRight ? -1.3 : 1.3) * u * s;
    if (V === 'p') { xi = x + 1.2 * u * s; xo = x - 1.3 * u * s; }
    if (kind === 'up') { yi -= .9 * u; yo -= .7 * u; }
    else if (kind === 'worried' || kind === 'sad') { yi -= .9 * u; yo += .2 * u; }
    else if (kind === 'angry') { yi += .7 * u; yo -= .4 * u; }
    else if (kind === 'flat') { yi += .3 * u; yo += .3 * u; }
    else if (kind === 'raise') { if (i === g.eyes.length - 1) { yi -= .9 * u; yo -= 1 * u; } else { yi += .3 * u; } }
    const mid = [(xi + xo) / 2, Math.min(yi, yo) - (kind === 'angry' ? 0 : .3 * u)];
    inkLine([[xo, yo], mid, [xi, yi]], sw * (ctx.C.f ? .65 : 1.15), col, 'ink', .4);
  });
}

function drawNose(ctx, g) {
  const { u, sw, D, V } = ctx;
  if (V === 'q') { inkLine([[g.fx + 1.0 * u, 1.9 * u], [g.fx + 1.9 * u, 3.2 * u], [g.fx + .8 * u, 3.6 * u]], sw * .5, shade(D.skin, .5), 'ink', .4); paint(ellPts(g.fx - .2 * u, 3.2 * u, 1.0 * u, .5 * u, 8), { fill: shade(D.skin, .25), fillOp: 70, bleed: .2, ink: null }); }
  else if (V === 'f') { inkLine([[-.7 * u, 2.6 * u], [0, 2.95 * u], [.7 * u, 2.6 * u]], sw * .45, shade(D.skin, .5), 'ink', .5); inkLine([[.3 * u, .5 * u], [.6 * u, 2 * u]], sw * .3, shade(D.skin, .35), 'inkfine', .3); }
  else if (V === 'p') {
    const n = [[g.rx - 1.4 * u, 0], [g.rx + 1.5 * u, 3.0 * u], [g.rx + .1 * u, 3.7 * u], [g.rx - 1.6 * u, 3.2 * u]];
    paint(n, { wash: D.skin, ink: null });
    inkLine([[g.rx - .4 * u, 0], [g.rx + 1.5 * u, 3.0 * u], [g.rx + .1 * u, 3.7 * u]], sw * .8, PAL.ink, 'ink', .3);
  }
}

function drawMouth(ctx, g, kind) {
  const { u, sw, D, C, V } = ctx, [mx, my, mw] = g.mouth, lc = C.lips ? mixCol(C.lips, PAL.ink, .35) : PAL.ink;
  const s = mw / (2.6 * u), dark = '#5E2230', tooth = '#FBF6EC';
  if (kind === 'neutral') { inkLine([[mx - 1.1 * u * s, my], [mx, my + .2 * u], [mx + 1.1 * u * s, my - .1 * u]], sw * .6, lc, 'ink', .4); if (C.lips) paint(ellPts(mx, my + .75 * u, .8 * u * s, .35 * u, 8), { wash: C.lips, washOp: 170, ink: null }); }
  else if (kind === 'smile') { inkLine([[mx - 1.5 * u * s, my - .5 * u], [mx, my + .5 * u], [mx + 1.5 * u * s, my - .6 * u]], sw * .65, lc, 'ink', .5); if (C.lips) paint(ellPts(mx, my + .95 * u, .7 * u * s, .3 * u, 8), { wash: C.lips, washOp: 160, ink: null }); }
  else if (kind === 'flat') inkLine([[mx - 1.2 * u * s, my], [mx + 1.2 * u * s, my]], sw * .6, lc, 'ink', 0);
  else if (kind === 'frown') inkLine([[mx - 1.3 * u * s, my + .5 * u], [mx, my - .2 * u], [mx + 1.3 * u * s, my + .5 * u]], sw * .6, lc, 'ink', .5);
  else if (kind === 'smirk') inkLine([[mx - 1.2 * u * s, my + .2 * u], [mx + .3 * u * s, my + .2 * u], [mx + 1.4 * u * s, my - .7 * u]], sw * .6, lc, 'ink', .4);
  else if (kind === 'wobble') inkLine([[mx - 1.4 * u * s, my + .3 * u], [mx - .7 * u * s, my - .1 * u], [mx, my + .3 * u], [mx + .7 * u * s, my - .1 * u], [mx + 1.4 * u * s, my + .3 * u]], sw * .55, lc, 'ink', .3);
  else if (kind === 'kiss') paint(ellPts(mx + .3 * u, my, .7 * u, .65 * u, 10), { wash: C.lips || '#C8707A', ink: PAL.ink, sw: sw * .45 });
  else if (kind === 'open' || kind === 'O' || kind === 'shout' || kind === 'laugh' || kind === 'grin' || kind === 'teeth') {
    let pts;
    if (kind === 'open') pts = [[mx - 1.1 * u * s, my - .2 * u], [mx + 1.1 * u * s, my - .3 * u], [mx + .6 * u * s, my + 1 * u], [mx - .5 * u * s, my + 1 * u]];
    else if (kind === 'O') pts = ellPts(mx, my + .5 * u, .9 * u * s, 1.25 * u, 12);
    else if (kind === 'shout') pts = [[mx - 1.8 * u * s, my - .8 * u], [mx + 1.8 * u * s, my - .9 * u], [mx + 1.2 * u * s, my + 2.2 * u], [mx - 1.1 * u * s, my + 2.2 * u]];
    else if (kind === 'teeth') pts = [[mx - 1.6 * u * s, my - .4 * u], [mx + 1.6 * u * s, my - .5 * u], [mx + 1.4 * u * s, my + .7 * u], [mx - 1.4 * u * s, my + .7 * u]];
    else pts = [[mx - 1.8 * u * s, my - .6 * u], [mx + 1.8 * u * s, my - .8 * u], [mx + .9 * u * s, my + 1.5 * u], [mx - .9 * u * s, my + 1.5 * u]];
    paint(pts, { wash: kind === 'teeth' ? tooth : dark, ink: PAL.ink, sw: sw * .5, curv: kind === 'O' ? 0 : .35 });
    if (kind === 'grin' || kind === 'laugh' || kind === 'shout') paint([[pts[0][0] + .2 * u, pts[0][1] + .1 * u], [pts[1][0] - .2 * u, pts[1][1] + .1 * u], [pts[1][0] - .5 * u, pts[1][1] + .7 * u], [pts[0][0] + .5 * u, pts[0][1] + .7 * u]], { wash: tooth, ink: null });
    if (kind === 'teeth') for (const k of [-.8, 0, .8]) inkLine([[mx + k * u * s, my - .4 * u], [mx + k * u * s, my + .7 * u]], sw * .3, PAL.ink, 'inkfine', 0);
    if (kind === 'laugh' || kind === 'shout' || kind === 'O') paint(ellPts(mx, my + (kind === 'O' ? 1 : 1.3) * u, .6 * u * s, .35 * u, 8), { wash: '#C25A6A', ink: null });
  }
}

function drawBandana(ctx, g) {
  const { u, sw, V } = ctx, col = typeof ctx.D.bandana === 'string' ? ctx.D.bandana : PAL.teal;
  const top = 1.6 * u, pts = V === 'q' ? [[-3.6 * u, top + .6 * u], [g.fx + 4.8 * u, top - .2 * u], [g.rx + .9 * u, 4 * u], [g.fx + 3 * u, 9.8 * u], [g.fx - 1 * u, 12 * u], [-3 * u, 8 * u]]
    : V === 'p' ? [[-.5 * u, top + .6 * u], [g.rx + 1.2 * u, top], [g.rx + 1 * u, 5 * u], [3 * u, 11 * u], [-.8 * u, 8 * u]]
    : [[-g.rx * .95, top], [g.rx * .95, top], [g.rx * .8, 6 * u], [0, 11.5 * u], [-g.rx * .8, 6 * u]];
  paint(pts, { wash: col, fill: shade(col, .25), fillOp: 70, tex: .6, ink: PAL.ink, sw: sw * .7, curv: .25 });
  for (let i = 0; i < 6; i++) paint(ellPts(lerp(pts[0][0], pts[1][0], hash(i * 2.1)) * .8, top + lerp(1.5, 6.5, hash(i * 3.7)) * u, .35 * u, .35 * u, 6), { wash: PAL.cream, ink: null });
}

// ---------- hair ----------
function hairBack(ctx) {
  const { D, u, sw, C, V } = ctx, g = faceGeom(ctx), st = C.style, rx = g.rx, ry = g.ry;
  const col = D.hair, opt = { wash: col, fill: D.hairHi, fillOp: 60, bleed: .1, tex: .7, border: .6, ink: PAL.ink, sw: sw * .8, curv: .35 };
  if (st === 'long') {
    const pts = V === 'b' || V === 'f'
      ? [[-rx * 1.12, -ry * .4], [-rx * 1.3, ry * .7], [-rx * 1.38, ry * 1.6], [-rx * 1.0, ry * 1.95], [-rx * .2, ry * 2.0], [rx * .5, ry * 1.98], [rx * 1.1, ry * 1.85], [rx * 1.38, ry * 1.5], [rx * 1.3, ry * .7], [rx * 1.12, -ry * .4], [0, -ry * 1.12]]
      : [[-rx * 1.05, -ry * .6], [-rx * 1.3, ry * .4], [-rx * 1.42, ry * 1.3], [-rx * 1.18, ry * 1.9], [-rx * .55, ry * 2.05], [rx * .05, ry * 1.75], [rx * .45, ry * 1.2], [rx * .8, ry * .2], [rx * .85, -ry * .7], [0, -ry * 1.12]];
    paint(pts, opt);
    for (let i = 0; i < 4; i++) inkLine([[-rx * (.9 - i * .25), ry * .2], [-rx * (1.15 - i * .3), ry * 1.1], [-rx * (.95 - i * .28), ry * 1.8]], sw * .35, shade(col, .4), 'inkfine', .5);
  } else if (st === 'bun') {
    paint(ellPts(-rx * .78, -ry * .72, 3.6 * u, 3.3 * u, 14), opt);
    inkLine([[-rx * .95, -ry * .9], [-rx * .6, -ry * .5]], sw * .4, shade(col, .4), 'inkfine', .5);
  } else if (st === 'curly' || st === 'messy') {
    // nothing behind
  }
}

function hairFront(ctx, g) {
  const { D, u, sw, C, V } = ctx, st = C.style, rx = g.rx, ry = g.ry, fx = g.fx;
  const col = D.hair, hi = D.hairHi || tint(col, .3);
  const opt = { wash: col, fill: hi, fillOp: 70, bleed: .1, tex: .7, border: .6, ink: PAL.ink, sw: sw * .8, curv: .35 };
  const back = V === 'b';
  if (back) {
    if (st === 'bald') { paint([[-rx * 1.02, -ry * .1], [-rx * .9, ry * .55], [rx * .9, ry * .55], [rx * 1.02, -ry * .1], [rx * .7, ry * .1], [-rx * .7, ry * .1]], { ...opt, curv: .3 }); return; }
    const pts = ellPts(0, -ry * .12, rx * 1.06, ry * 1.0, 22);
    if (st === 'long') pts.push(); // back hair already covers
    paint(st === 'buzz' ? ellPts(0, -ry * .2, rx * 1.02, ry * .9, 22) : pts, opt);
    if (st === 'bun') paint(ellPts(0, -ry * .55, 3.6 * u, 3.3 * u, 14), opt);
    return;
  }
  if (st === 'long') {
    // cap with a side part, strands framing the face
    const pts = V === 'f'
      ? [[-rx * 1.08, ry * .55], [-rx * 1.12, -ry * .3], [-rx * .7, -ry * .95], [0, -ry * 1.12], [rx * .7, -ry * .95], [rx * 1.12, -ry * .3], [rx * 1.08, ry * .55], [rx * .82, ry * .1], [rx * .55, -ry * .45], [-rx * .15, -ry * .62], [-rx * .7, -ry * .3], [-rx * .82, ry * .1]]
      : [[-rx * 1.15, ry * .8], [-rx * 1.22, -ry * .25], [-rx * .8, -ry * .98], [0, -ry * 1.2], [rx * .75, -ry * 1.02], [rx * 1.12, -ry * .4], [rx * 1.16, ry * .3], [rx * 1.02, ry * .62],
         [rx * .9, ry * .1], [fx + 2.8 * u, -ry * .42], [fx + .4 * u, -ry * .62], [fx - 1.6 * u, -ry * .5], [-rx * .42, -ry * .2], [-rx * .5, ry * .3], [-rx * .72, ry * .85]];
    paint(pts, opt);
    inkLine([[rx * .95, -ry * .3], [rx * 1.05, ry * .2], [rx * .98, ry * .55]], sw * .35, shade(col, .45), 'inkfine', .5);
    inkLine([[fx - 1.2 * u, -ry * .62], [-rx * .1, -ry * .95], [-rx * .55, -ry * .85]], sw * .35, shade(col, .4), 'inkfine', .5);
  } else if (st === 'curly') {
    const pts = [];
    const n = 15, a0 = V === 'f' ? Math.PI * 1.0 : Math.PI * .95, a1 = V === 'f' ? Math.PI * 2.0 : Math.PI * 2.08;
    for (let i = 0; i <= n; i++) {
      const a = lerp(a0, a1, i / n), r = 1.08 + .08 * Math.sin(i * 2.3);
      for (let k = 0; k < 3; k++) { const aa = a + k / 3 * (a1 - a0) / n, b = Math.sin(k / 3 * Math.PI) * .07; pts.push([Math.cos(aa) * rx * (r + b), Math.sin(aa) * ry * (r + b) * .98]); }
    }
    const hl = V === 'f' ? [[rx * .8, -ry * .2], [rx * .4, -ry * .55], [0, -ry * .5], [-rx * .4, -ry * .55], [-rx * .8, -ry * .2]] : [[rx * .75, -ry * .3], [fx + 1.5 * u, -ry * .52], [fx - 1.5 * u, -ry * .48], [-rx * .3, -ry * .45], [-rx * .62, -ry * .1], [-rx * .7, ry * .25], [-rx * .95, ry * .3]];
    paint(pts.concat(hl), { ...opt, curv: .2 });
    for (let i = 0; i < 7; i++) { const cx = lerp(-rx * .7, rx * .6, hash(i * 3.1 + 1)), cy = lerp(-ry * 1.0, -ry * .55, hash(i * 5.3 + 2)); inkLine([[cx - .8 * u, cy], [cx, cy - .8 * u], [cx + .7 * u, cy - .1 * u], [cx, cy + .5 * u]], sw * .35, shade(col, .45), 'inkfine', .6); }
  } else if (st === 'messy') {
    const pts = V === 'f'
      ? [[-rx * 1.1, ry * .1], [-rx * 1.15, -ry * .5], [-rx * .6, -ry * 1.15], [0, -ry * 1.22], [rx * .6, -ry * 1.15], [rx * 1.15, -ry * .5], [rx * 1.1, ry * .1], [rx * .7, -ry * .3], [rx * .4, -ry * .1], [rx * .1, -ry * .38], [-rx * .3, -ry * .12], [-rx * .6, -ry * .35]]
      : [[-rx * 1.12, ry * .35], [-rx * 1.22, -ry * .3], [-rx * 1.0, -ry * .85], [-rx * .4, -ry * 1.2], [rx * .3, -ry * 1.18], [rx * .95, -ry * .85], [rx * 1.2, -ry * .35], [rx * .95, -ry * .3], [fx + 2.2 * u, -ry * .2], [fx + 1.4 * u, -ry * .45], [fx, -ry * .1], [fx - 1.2 * u, -ry * .42], [-rx * .3, -ry * .2], [-rx * .55, ry * .1], [-rx * .8, ry * .45]];
    paint(pts, { ...opt, curv: .1 });
    for (let i = 0; i < 4; i++) inkLine([[lerp(-rx * .6, rx * .5, i / 3), -ry * 1.05], [lerp(-rx * .4, rx * .7, i / 3), -ry * .55]], sw * .35, shade(col, .5), 'inkfine', .3);
  } else if (st === 'side') {
    const pts = V === 'f'
      ? [[-rx * 1.06, ry * .1], [-rx * 1.1, -ry * .55], [-rx * .55, -ry * 1.12], [rx * .45, -ry * 1.16], [rx * 1.1, -ry * .7], [rx * 1.06, ry * .05], [rx * .9, -ry * .3], [rx * .5, -ry * .52], [-rx * .3, -ry * .66], [-rx * .85, -ry * .35]]
      : [[-rx * 1.06, ry * .35], [-rx * 1.12, -ry * .4], [-rx * .55, -ry * 1.1], [rx * .25, -ry * 1.2], [rx * .9, -ry * 1.02], [rx * 1.18, -ry * .66], [rx * 1.0, -ry * .58],
         [fx + 3.2 * u, -ry * .5], [fx + 1.4 * u, -ry * .64], [fx - 1.2 * u, -ry * .55], [-rx * .22, -ry * .42], [-rx * .34, ry * .02], [-rx * .44, ry * .36], [-rx * .7, ry * .4]];
    paint(pts, { ...opt, curv: .35 });
    for (let i = 0; i < 3; i++) inkLine([[-rx * (.55 - i * .1), -ry * (.95 - i * .06)], [rx * (.2 + i * .1), -ry * (1.08 - i * .1)], [rx * (.95 - i * .08), -ry * (.8 - i * .05)]], sw * .35, shade(col, .45), 'inkfine', .5);
  } else if (st === 'buzz') {
    const pts = [];
    const a0 = V === 'f' ? Math.PI * 1.02 : Math.PI * .92, a1 = V === 'f' ? Math.PI * 1.98 : Math.PI * 1.86;
    for (let i = 0; i <= 16; i++) { const a = lerp(a0, a1, i / 16); pts.push([Math.cos(a) * rx * 1.03, Math.sin(a) * ry * 1.02]); }
    // jagged hairline back to the start
    const hl = V === 'f' ? [[rx * .82, -ry * .42], [rx * .4, -ry * .55], [0, -ry * .5], [-rx * .4, -ry * .55], [-rx * .82, -ry * .42]]
      : [[fx + 3.4 * u, -ry * .56], [fx + 1.8 * u, -ry * .7], [fx + .4 * u, -ry * .62], [fx - 1.4 * u, -ry * .66], [-rx * .3, -ry * .5], [-rx * .42, -ry * .1], [-rx * .5, ry * .22], [-rx * .82, ry * .3]];
    paint(pts.concat(hl), { ...opt, fillOp: 60, sw: sw * .45, curv: .2 });
    for (let i = 0; i < 18; i++) { const a = lerp(a0 + .15, a1 - .1, hash(i * 3.7)), r = lerp(.6, .97, hash(i * 1.9)), x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
      if (V !== 'f' && x > fx + 2.6 * u && y > -ry * .7) continue; inkLine([[x, y], [x - .4 * u, y + .6 * u]], sw * .28, shade(col, .45), 'inkfine', 0); }
  } else if (st === 'bun') {
    paint(ellPts(-rx * .78, -ry * .72, 3.6 * u, 3.3 * u, 14), opt);
    inkLine([[-rx * .95, -ry * .9], [-rx * .6, -ry * .5]], sw * .4, shade(col, .4), 'inkfine', .5);
  } else if (st === 'curly' || st === 'messy') {
    // nothing behind
  }
}

function hairFront(ctx, g) {
  const { D, u, sw, C, V } = ctx, st = C.style, rx = g.rx, ry = g.ry, fx = g.fx;
  const col = D.hair, hi = D.hairHi || tint(col, .3);
  const opt = { wash: col, fill: hi, fillOp: 70, bleed: .1, tex: .7, border: .6, ink: PAL.ink, sw: sw * .8, curv: .35 };
  const back = V === 'b';
  if (back) {
    if (st === 'bald') { paint([[-rx * 1.02, -ry * .1], [-rx * .9, ry * .55], [rx * .9, ry * .55], [rx * 1.02, -ry * .1], [rx * .7, ry * .1], [-rx * .7, ry * .1]], { ...opt, curv: .3 }); return; }
    const pts = ellPts(0, -ry * .12, rx * 1.06, ry * 1.0, 22);
    if (st === 'long') pts.push(); // back hair already covers
    paint(st === 'buzz' ? ellPts(0, -ry * .2, rx * 1.02, ry * .9, 22) : pts, opt);
    if (st === 'bun') paint(ellPts(0, -ry * .55, 3.6 * u, 3.3 * u, 14), opt);
    return;
  }
  if (st === 'long') {
    // cap with a side part, strands framing the face
    const pts = V === 'f'
      ? [[-rx * 1.08, ry * .55], [-rx * 1.12, -ry * .3], [-rx * .7, -ry * .95], [0, -ry * 1.12], [rx * .7, -ry * .95], [rx * 1.12, -ry * .3], [rx * 1.08, ry * .55], [rx * .82, ry * .1], [rx * .55, -ry * .45], [-rx * .15, -ry * .62], [-rx * .7, -ry * .3], [-rx * .82, ry * .1]]
      : [[-rx * 1.15, ry * .8], [-rx * 1.22, -ry * .25], [-rx * .8, -ry * .98], [0, -ry * 1.2], [rx * .75, -ry * 1.02], [rx * 1.12, -ry * .4], [rx * 1.16, ry * .3], [rx * 1.02, ry * .62],
         [rx * .9, ry * .1], [fx + 2.8 * u, -ry * .42], [fx + .4 * u, -ry * .62], [fx - 1.6 * u, -ry * .5], [-rx * .42, -ry * .2], [-rx * .5, ry * .3], [-rx * .72, ry * .85]];
    paint(pts, opt);
    inkLine([[rx * .95, -ry * .3], [rx * 1.05, ry * .2], [rx * .98, ry * .55]], sw * .35, shade(col, .45), 'inkfine', .5);
    inkLine([[fx - 1.2 * u, -ry * .62], [-rx * .1, -ry * .95], [-rx * .55, -ry * .85]], sw * .35, shade(col, .4), 'inkfine', .5);
  } else if (st === 'curly') {
    const pts = [];
    const n = 15, a0 = V === 'f' ? Math.PI * 1.0 : Math.PI * .95, a1 = V === 'f' ? Math.PI * 2.0 : Math.PI * 2.08;
    for (let i = 0; i <= n; i++) {
      const a = lerp(a0, a1, i / n), r = 1.08 + .08 * Math.sin(i * 2.3);
      for (let k = 0; k < 3; k++) { const aa = a + k / 3 * (a1 - a0) / n, b = Math.sin(k / 3 * Math.PI) * .07; pts.push([Math.cos(aa) * rx * (r + b), Math.sin(aa) * ry * (r + b) * .98]); }
    }
    const hl = V === 'f' ? [[rx * .8, -ry * .2], [rx * .4, -ry * .55], [0, -ry * .5], [-rx * .4, -ry * .55], [-rx * .8, -ry * .2]] : [[rx * .75, -ry * .3], [fx + 1.5 * u, -ry * .52], [fx - 1.5 * u, -ry * .48], [-rx * .3, -ry * .45], [-rx * .62, -ry * .1], [-rx * .7, ry * .25], [-rx * .95, ry * .3]];
    paint(pts.concat(hl), { ...opt, curv: .2 });
    for (let i = 0; i < 7; i++) { const cx = lerp(-rx * .7, rx * .6, hash(i * 3.1 + 1)), cy = lerp(-ry * 1.0, -ry * .55, hash(i * 5.3 + 2)); inkLine([[cx - .8 * u, cy], [cx, cy - .8 * u], [cx + .7 * u, cy - .1 * u], [cx, cy + .5 * u]], sw * .35, shade(col, .45), 'inkfine', .6); }
  } else if (st === 'messy') {
    const pts = V === 'f'
      ? [[-rx * 1.1, ry * .1], [-rx * 1.15, -ry * .5], [-rx * .6, -ry * 1.15], [0, -ry * 1.22], [rx * .6, -ry * 1.15], [rx * 1.15, -ry * .5], [rx * 1.1, ry * .1], [rx * .7, -ry * .3], [rx * .4, -ry * .1], [rx * .1, -ry * .38], [-rx * .3, -ry * .12], [-rx * .6, -ry * .35]]
      : [[-rx * 1.12, ry * .35], [-rx * 1.22, -ry * .3], [-rx * 1.0, -ry * .85], [-rx * .4, -ry * 1.2], [rx * .3, -ry * 1.18], [rx * .95, -ry * .85], [rx * 1.2, -ry * .35], [rx * .95, -ry * .3], [fx + 2.2 * u, -ry * .2], [fx + 1.4 * u, -ry * .45], [fx, -ry * .1], [fx - 1.2 * u, -ry * .42], [-rx * .3, -ry * .2], [-rx * .55, ry * .1], [-rx * .8, ry * .45]];
    paint(pts, { ...opt, curv: .1 });
    for (let i = 0; i < 4; i++) inkLine([[lerp(-rx * .6, rx * .5, i / 3), -ry * 1.05], [lerp(-rx * .4, rx * .7, i / 3), -ry * .55]], sw * .35, shade(col, .5), 'inkfine', .3);
  } else if (st === 'side') {
    const pts = V === 'f'
      ? [[-rx * 1.06, ry * .1], [-rx * 1.1, -ry * .55], [-rx * .55, -ry * 1.12], [rx * .45, -ry * 1.16], [rx * 1.1, -ry * .7], [rx * 1.06, ry * .05], [rx * .9, -ry * .3], [rx * .5, -ry * .52], [-rx * .3, -ry * .66], [-rx * .85, -ry * .35]]
      : [[-rx * 1.06, ry * .35], [-rx * 1.12, -ry * .4], [-rx * .55, -ry * 1.1], [rx * .25, -ry * 1.2], [rx * .9, -ry * 1.02], [rx * 1.18, -ry * .66], [rx * 1.0, -ry * .58],
         [fx + 3.2 * u, -ry * .5], [fx + 1.4 * u, -ry * .64], [fx - 1.2 * u, -ry * .55], [-rx * .22, -ry * .42], [-rx * .34, ry * .02], [-rx * .44, ry * .36], [-rx * .7, ry * .4]];
    paint(pts, { ...opt, curv: .35 });
    for (let i = 0; i < 3; i++) inkLine([[-rx * (.55 - i * .1), -ry * (.95 - i * .06)], [rx * (.2 + i * .1), -ry * (1.08 - i * .1)], [rx * (.95 - i * .08), -ry * (.8 - i * .05)]], sw * .35, shade(col, .45), 'inkfine', .5);
  } else if (st === 'buzz') {
    const pts = V === 'f'
      ? [[-rx * 1.02, -ry * .05], [-rx * .95, -ry * .62], [0, -ry * 1.05], [rx * .95, -ry * .62], [rx * 1.02, -ry * .05], [rx * .8, -ry * .45], [0, -ry * .55], [-rx * .8, -ry * .45]]
      : [[-rx * 1.03, ry * .2], [-rx * 1.0, -ry * .55], [-rx * .3, -ry * 1.05], [rx * .55, -ry * 1.0], [rx * .98, -ry * .55], [fx + 2.6 * u, -ry * .55], [-rx * .3, -ry * .45], [-rx * .55, ry * .05], [-rx * .78, ry * .3]];
    paint(pts, { ...opt, fillOp: 50, sw: sw * .5, curv: .3 });
    for (let i = 0; i < 14; i++) { const a = lerp(Math.PI * 1.05, Math.PI * 1.95, hash(i * 3.7)), r = lerp(.62, .95, hash(i * 1.9)), x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r * .95;
      if (V !== 'f' && x > fx + 2 * u) continue; inkLine([[x, y], [x - .5 * u, y + .7 * u]], sw * .3, shade(col, .4), 'inkfine', 0); }
  } else if (st === 'bun') {
    const pts = V === 'f'
      ? [[-rx * 1.05, ry * .2], [-rx * 1.08, -ry * .45], [-rx * .5, -ry * 1.05], [rx * .5, -ry * 1.05], [rx * 1.08, -ry * .45], [rx * 1.05, ry * .2], [rx * .8, -ry * .3], [rx * .1, -ry * .58], [-rx * .75, -ry * .25]]
      : [[-rx * 1.08, ry * .35], [-rx * 1.12, -ry * .4], [-rx * .55, -ry * 1.05], [rx * .4, -ry * 1.1], [rx * .98, -ry * .7], [rx * 1.05, -ry * .3], [fx + 2.8 * u, -ry * .55], [fx - .2 * u, -ry * .55], [-rx * .3, -ry * .35], [-rx * .5, ry * .05], [-rx * .8, ry * .45]];
    paint(pts, opt);
    for (let i = 0; i < 3; i++) inkLine([[fx + (1 - i) * 1.5 * u, -ry * .62], [-rx * (.1 + i * .2), -ry * (1.0 - i * .05)], [-rx * .7, -ry * .75]], sw * .35, shade(col, .4), 'inkfine', .6);
    inkLine([[fx + 3.4 * u, -ry * .35], [fx + 4 * u, ry * .2], [fx + 3.5 * u, ry * .6]], sw * .5, col, 'ink', .6);  // loose strand
  } else if (st === 'bald') {
    const pts = V === 'f' ? [[-rx * 1.04, ry * .1], [-rx * 1.0, -ry * .4], [-rx * .75, -ry * .3], [-rx * .82, ry * .2]] : [[-rx * 1.04, ry * .25], [-rx * 1.05, -ry * .45], [-rx * .55, -ry * .75], [-rx * .45, -ry * .4], [-rx * .55, ry * .3]];
    paint(pts, { ...opt, curv: .3 });
    if (V === 'f') paint([[rx * 1.04, ry * .1], [rx * 1.0, -ry * .4], [rx * .75, -ry * .3], [rx * .82, ry * .2]], { ...opt, curv: .3 });
  }
}

// ---------- quick helpers for common acting ----------
// Two characters kissing in profile: returns nothing, paints both. a faces right at x, b faces left.
function kissPair(a, b, x, y, oa = {}, ob = {}) {
  fig(a, x - CAST[a].h * .075, y, { view: 'pr', ex: 'kiss', armN: [.9, .9], armF: [.8, .9], ...oa });
  fig(b, x + CAST[b].h * .075, y, { view: 'pl', ex: 'kiss', armN: [1.0, .8], armF: [.9, .8], ...ob });
}

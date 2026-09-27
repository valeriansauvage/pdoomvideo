// cast.js : les personnages. Tous peints en aplats + encre (rapides), donc utilisables dans les plans animés.
//
// goutte(x, y, s, o) : une goutte d'eau. (x, y) = centre de la partie ronde, s = rayon. Hauteur ≈ 3s (pointe en haut).
//   o : { mood: 'normal'|'happy'|'worried'|'surprised'|'squish'|'love'|'sleep', look: [lx, ly] (-1..1),
//         sq (écrasement, négatif = étirée), rot, alpha, sweat (0..1), col (teinte du corps), shiver (0..1) }
// vapeur(x, y, s, o) : un petit nuage de vapeur. o : { alpha, face: bool, mood }
// artisan(x, y, s, o) : l'artisan façadier, debout. (x, y) = sol entre les pieds, s = unité (hauteur ≈ 15.5s).
//   o : { aL, aR (angle des bras : 0 = à l'horizontale, positif = levé), walk (phase), dy, sq, flip, rot,
//         eyes: 'normal'|'happy'|'closed'|'wink', mouth: 'smile'|'grin'|'o'|'flat', look: [lx, ly],
//         handL(s, sw) / handR(s, sw) : accroches pour tenir un outil (repère du bras, x vers l'extérieur) }

const SKIN = '#F0C6A2', SKIN_DK = '#D99E78', CAP = '#C9803F', OVERALL = '#46678C', OVERALL_DK = '#30496A', SHIRT = '#FBF5EA', BOOT = '#5A3E2E';

function gouttePts(s) {
  const p = [[0, -2.05 * s]];
  for (let i = 0; i <= 18; i++) { const a = -Math.PI / 6 + i / 18 * (Math.PI * 4 / 3); p.push([Math.cos(a) * s, Math.sin(a) * s]); }
  return p;
}
function goutte(x, y, s, o = {}) {
  const a = o.alpha ?? 1; if (a < .02 || s < 1) return;
  const sw = clamp(s / 26, .4, 1.3), J = s * .025;
  push(); translate(x, y);
  if (o.shiver) translate(Math.sin(T * 60) * s * .06 * o.shiver, 0);
  if (o.rot) rotate(o.rot);
  const sq = o.sq || 0; scale(1 + sq * .45, 1 - sq); translate(0, sq * s * .5);
  const col = o.col || PAL.eau;
  paint(gouttePts(s).map(([px, py]) => [px + jit(J), py + jit(J)]), { wash: col, washOp: 240 * a, ink: a > .45 ? PAL.ink : null, sw, curv: .3 });
  paint(ellPts(-.12 * s, .2 * s, .6 * s, .52 * s, 14), { wash: mixCol(col, '#FFFFFF', .45), washOp: 120 * a, ink: null });
  paint(ellPts(-.46 * s, -.52 * s, .14 * s, .3 * s, 10, 0, -.45), { wash: '#FFFFFF', washOp: 215 * a, ink: null });
  if (a > .3) gouteFace(s, o, sw, a);
  pop();
}
function gouteFace(s, o, sw, a) {
  const m = o.mood || 'normal', [lx, ly] = o.look || [0, 0], ex = lx * .12 * s, ey = ly * .1 * s;
  const eye = (side) => {
    const cx = side * .34 * s + ex, cy = .02 * s + ey;
    if (m === 'happy' || m === 'love') inkLine([[cx - .15 * s, cy + .05 * s], [cx, cy - .1 * s], [cx + .15 * s, cy + .05 * s]], sw * .9, PAL.ink, 'inkfine', .6);
    else if (m === 'squish') inkLine([[cx - .13 * s * side, cy - .1 * s], [cx + .1 * s * side, cy], [cx - .13 * s * side, cy + .1 * s]], sw * .9, PAL.ink, 'inkfine', 0);
    else if (m === 'sleep') inkLine([[cx - .14 * s, cy], [cx, cy + .07 * s], [cx + .14 * s, cy]], sw * .8, PAL.ink, 'inkfine', .6);
    else {
      const r = m === 'surprised' ? .15 : .12;
      paint(ellPts(cx, cy, r * s, (r + .04) * s, 10), { wash: PAL.ink, washOp: 255 * a, ink: null });
      paint(ellPts(cx + .04 * s, cy - .06 * s, .045 * s, .045 * s, 6), { wash: '#FFFFFF', washOp: 230 * a, ink: null });
      if (m === 'worried') inkLine([[cx - .16 * s * side * -1, cy - .3 * s], [cx + .14 * s * side, cy - .2 * s]].map(p => [p[0], p[1]]), sw * .8, PAL.ink, 'inkfine', 0);
    }
  };
  eye(-1); eye(1);
  const my = .36 * s + ey;
  if (m === 'surprised') paint(ellPts(ex, my + .02 * s, .09 * s, .12 * s, 10), { wash: '#6A3040', ink: null });
  else if (m === 'worried') inkLine([[ex - .16 * s, my + .04 * s], [ex - .06 * s, my - .02 * s], [ex + .05 * s, my + .04 * s], [ex + .16 * s, my - .01 * s]], sw * .8, PAL.ink, 'inkfine', .5);
  else if (m === 'squish') inkLine([[ex - .14 * s, my], [ex + .14 * s, my]], sw * .8, PAL.ink, 'inkfine', 0);
  else if (m === 'sleep') paint(ellPts(ex, my, .06 * s, .05 * s, 8), { wash: PAL.ink, ink: null });
  else {
    const wide = m === 'happy' || m === 'love' ? .2 : .14;
    paint([[ex - wide * s, my - .03 * s], [ex + wide * s, my - .03 * s], [ex + wide * .6 * s, my + .12 * s], [ex, my + .17 * s], [ex - wide * .6 * s, my + .12 * s]], { wash: '#8A3A4A', washOp: 230 * a, ink: PAL.ink, sw: sw * .6, curv: .5 });
  }
  if (m !== 'worried' && m !== 'squish') for (const side of [-1, 1]) paint(ellPts(side * .62 * s + ex, .28 * s + ey, .15 * s, .09 * s, 10), { wash: PAL.rose, washOp: 150 * a, ink: null });
  if (o.sweat) { const k = clamp(o.sweat); push(); translate(.95 * s, -.55 * s + (1 - k) * .2 * s); scale(.28 * k); paint(gouttePts(s), { wash: '#FFFFFF', washOp: 230, ink: PAL.eauDk, sw: sw * 1.4 }); pop(); }
  if (m === 'love') heart(0, -2.7 * s, .5 * s, PAL.rose, a);
}
function heart(x, y, r, col, a = 1) {
  const p = []; for (let i = 0; i < 24; i++) { const t = i / 24 * TAU; p.push([x + r * .062 * 16 * Math.pow(Math.sin(t), 3), y - r * .062 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  paint(p, { wash: col, washOp: 240 * a, ink: PAL.ink, sw: clamp(r / 30, .4, 1) });
}

// nuage bosselé (vapeur, nuages du ciel)
function cloudPts(cx, cy, rx, ry, bumps = 6, j = 0, seed = 0) {
  const p = [], n = 40;
  for (let i = 0; i < n; i++) {
    const th = i / n * TAU, below = Math.sin(th) > .15;
    const k = below ? 1 : 1 + .2 * Math.pow(Math.abs(Math.sin(th * bumps / 2 + seed)), .55);
    p.push([cx + Math.cos(th) * rx * k + jit(j), cy + Math.sin(th) * ry * (below ? .8 : k) + jit(j)]);
  }
  return p;
}
function vapeur(x, y, s, o = {}) {
  const a = o.alpha ?? 1; if (a < .02 || s < 1) return;
  const sw = clamp(s / 30, .35, 1);
  paint(cloudPts(x, y, 1.25 * s, .8 * s, 5, s * .03, o.seed || 0), { wash: '#FFFFFF', washOp: 205 * a, ink: a > .35 ? PAL.eauDk : null, sw, curv: .4 });
  paint(ellPts(x - .2 * s, y - .15 * s, .7 * s, .35 * s, 12), { wash: PAL.eauLt, washOp: 70 * a, ink: null });
  if (o.face && a > .4) {
    for (const side of [-1, 1]) {
      if (o.mood === 'happy') inkLine([[x + side * .32 * s - .1 * s, y + .02 * s], [x + side * .32 * s, y - .08 * s], [x + side * .32 * s + .1 * s, y + .02 * s]], sw * .8, PAL.ink, 'inkfine', .6);
      else paint(ellPts(x + side * .32 * s, y - .02 * s, .07 * s, .09 * s, 8), { wash: PAL.ink, washOp: 255 * a, ink: null });
      paint(ellPts(x + side * .55 * s, y + .18 * s, .12 * s, .07 * s, 8), { wash: PAL.rose, washOp: 130 * a, ink: null });
    }
    inkLine([[x - .13 * s, y + .2 * s], [x, y + .28 * s], [x + .13 * s, y + .2 * s]], sw * .8, PAL.ink, 'inkfine', .6);
  }
}

// ---------- l'artisan ----------
function artisan(x, y, s, o = {}) {
  const sw = clamp(s / 12, .5, 2), J = s * .04, sq = o.sq || 0;
  if (!o.noShadow) paint(ellPts(x, y + s * .15, s * 3.4, s * .65, 18), { wash: PAL.ink, washOp: 40, ink: null });
  push(); translate(x, y + (o.dy || 0) * s);
  if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (1 + sq * .4), 1 - sq);

  // jambes (salopette) et chaussures
  const leg = (side, i) => {
    let lift = 0; if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) lift = ph * .9; }
    const hx = side * .95 * s;
    paint(rectPts(hx - .82 * s, -6.6 * s, 1.64 * s, (6.2 - lift) * s, J), { wash: OVERALL, washOp: 255, ink: PAL.ink, sw: sw * .8 });
    inkLine([[hx + side * .2 * s, -5 * s], [hx + side * .25 * s, -1.2 * s - lift * s]], sw * .4, OVERALL_DK, 'inkfine', 0);
    paint(ellPts(hx + side * .25 * s, -.35 * s - lift * s, 1.15 * s, .52 * s, 14, J * .5), { wash: BOOT, washOp: 255, ink: PAL.ink, sw: sw * .7 });
  };
  leg(-1, 0); leg(1, 1);

  // bras (derrière le buste pour l'épaule, devant pour la main)
  const arm = (side, ang, hook) => {
    push(); translate(side * 2.35 * s, -10.9 * s); rotate(side < 0 ? ang : -ang);
    const d = side;                                              // vers l'extérieur
    paint(rrPts(d < 0 ? -2.1 * s : 0, -.72 * s, 2.1 * s, 1.44 * s, .6 * s, J * .5), { wash: SHIRT, washOp: 255, ink: PAL.ink, sw: sw * .7 });   // manche
    paint(rrPts(d < 0 ? -4 * s : 1.8 * s, -.52 * s, 2.2 * s, 1.04 * s, .5 * s, J * .5), { wash: SKIN, washOp: 255, ink: PAL.ink, sw: sw * .65 });   // avant-bras
    translate(d * 4.25 * s, 0);
    paint(ellPts(0, 0, .72 * s, .66 * s, 12, J * .4), { wash: SKIN, washOp: 255, ink: PAL.ink, sw: sw * .65 });
    if (hook) { if (d < 0) scale(-1, 1); hook(s, sw); }
    pop();
  };
  arm(-1, o.aL ?? -1.2, o.handL);
  arm(1, o.aR ?? -1.2, o.handR);

  // buste : tee-shirt + bavette de salopette + bretelles
  paint([[-2.5 * s, -11.6 * s], [2.5 * s, -11.6 * s], [2.7 * s, -6.2 * s], [-2.7 * s, -6.2 * s]].map(p => [p[0] + jit(J), p[1] + jit(J)]), { wash: SHIRT, washOp: 255, ink: PAL.ink, sw: sw * .8, curv: .15 });
  paint(rectPts(-1.65 * s, -9.6 * s, 3.3 * s, 3.3 * s, J), { wash: OVERALL, washOp: 255, ink: PAL.ink, sw: sw * .7 });
  paint(rectPts(-2.75 * s, -6.8 * s, 5.5 * s, 1.1 * s, J), { wash: OVERALL, washOp: 255, ink: null });
  for (const side of [-1, 1]) {
    inkLine([[side * 1.4 * s, -9.5 * s], [side * 1.9 * s, -11.5 * s]], sw * 1.6, OVERALL_DK, 'ink', 0);
    paint(ellPts(side * 1.3 * s, -9.25 * s, .2 * s, .2 * s, 8), { wash: PAL.ocre, ink: PAL.ink, sw: sw * .4 });
  }
  paint(rectPts(-.9 * s, -8.9 * s, 1.8 * s, 1.2 * s, J * .5), { wash: OVERALL_DK, washOp: 140, ink: PAL.ink, sw: sw * .45 });  // poche
  inkLine([[-.55 * s, -8.95 * s], [-.5 * s, -9.9 * s]], sw * .9, PAL.tuile, 'inkfine', 0);                                      // crayon de maçon

  // tête
  push(); translate(0, -13.55 * s); if (o.headRot) rotate(o.headRot);
  paint(rectPts(-.55 * s, 1.2 * s, 1.1 * s, 1.1 * s, J * .3), { wash: SKIN_DK, washOp: 255, ink: null });                    // cou
  paint(ellPts(0, 0, 2.05 * s, 2.2 * s, 22, J * .5), { wash: SKIN, washOp: 255, ink: PAL.ink, sw: sw * .85 });
  for (const side of [-1, 1]) paint(ellPts(side * 2.05 * s, .15 * s, .38 * s, .55 * s, 10), { wash: SKIN, washOp: 255, ink: PAL.ink, sw: sw * .6 });  // oreilles
  // cheveux sur les côtés, barbe de quelques jours
  for (const side of [-1, 1]) paint([[side * 1.95 * s, -.9 * s], [side * 1.25 * s, -1.25 * s], [side * 1.55 * s, -.2 * s], [side * 2.05 * s, -.1 * s]], { wash: '#5B4031', washOp: 255, ink: null });
  paint([[-1.75 * s, .5 * s], [-1.2 * s, 1.55 * s], [0, 2.15 * s], [1.2 * s, 1.55 * s], [1.75 * s, .5 * s], [1.1 * s, 1.1 * s], [0, 1.3 * s], [-1.1 * s, 1.1 * s]], { wash: '#8C6A55', washOp: 110, ink: null, curv: .4 });
  // visage
  const [lx, ly] = o.look || [0, 0], ex = lx * .3 * s, ey = ly * .2 * s, ev = o.eyes || 'normal';
  for (const side of [-1, 1]) {
    const cx = side * .72 * s + ex, cy = -.2 * s + ey;
    if (ev === 'happy' || (ev === 'wink' && side > 0)) inkLine([[cx - .25 * s, cy + .08 * s], [cx, cy - .16 * s], [cx + .25 * s, cy + .08 * s]], sw * .8, PAL.ink, 'inkfine', .6);
    else if (ev === 'closed') inkLine([[cx - .25 * s, cy], [cx, cy + .12 * s], [cx + .25 * s, cy]], sw * .8, PAL.ink, 'inkfine', .6);
    else { paint(ellPts(cx, cy, .17 * s, .22 * s, 10), { wash: PAL.ink, ink: null }); paint(ellPts(cx + .06 * s, cy - .08 * s, .06 * s, .06 * s, 6), { wash: '#FFFFFF', ink: null }); }
    inkLine([[cx - .3 * s, cy - .55 * s], [cx + .28 * s, cy - .6 * s + side * .04 * s]], sw * .9, '#5B4031', 'ink', 0);        // sourcils
    paint(ellPts(side * 1.25 * s, .55 * s, .32 * s, .18 * s, 10), { wash: PAL.rose, washOp: 120, ink: null });
  }
  inkLine([[.05 * s + ex, .05 * s], [.25 * s + ex, .6 * s], [-.1 * s + ex, .72 * s]], sw * .6, SKIN_DK, 'inkfine', .5);            // nez
  const mo = o.mouth || 'smile', my = 1.15 * s + ey;
  if (mo === 'o') paint(ellPts(ex, my, .22 * s, .28 * s, 10), { wash: '#7A3240', ink: PAL.ink, sw: sw * .5 });
  else if (mo === 'flat') inkLine([[ex - .4 * s, my], [ex + .4 * s, my]], sw * .8, PAL.ink, 'inkfine', 0);
  else if (mo === 'grin') paint([[ex - .75 * s, my - .15 * s], [ex + .75 * s, my - .15 * s], [ex + .4 * s, my + .38 * s], [ex - .4 * s, my + .38 * s]], { wash: '#7A3240', ink: PAL.ink, sw: sw * .55, curv: .5 });
  else inkLine([[ex - .6 * s, my - .1 * s], [ex, my + .25 * s], [ex + .6 * s, my - .1 * s]], sw * .85, PAL.ink, 'inkfine', .6);
  // casquette
  paint([[-2.15 * s, -.95 * s], [-1.9 * s, -2.1 * s], [-.9 * s, -2.75 * s], [.9 * s, -2.75 * s], [1.9 * s, -2.1 * s], [2.15 * s, -.95 * s]].map(p => [p[0] + jit(J), p[1] + jit(J)]), { wash: CAP, washOp: 255, ink: PAL.ink, sw: sw * .8, curv: .4 });
  paint([[-2.3 * s, -1.05 * s], [2.3 * s, -1.05 * s], [1.9 * s, -.6 * s], [-1.9 * s, -.6 * s]], { wash: mixCol(CAP, PAL.ink, .25), washOp: 255, ink: PAL.ink, sw: sw * .7, curv: .3 });
  paint(ellPts(-.7 * s, -2.1 * s, .7 * s, .3 * s, 10), { wash: '#FFFFFF', washOp: 60, ink: null });
  pop();
  if (o.draw) o.draw(s, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3.2 * s, y + (o.dy || 0) * s - 16.5 * s, s * .9, o.emoteK ?? 1);
}

// petits signes au-dessus d'un personnage : 'coeur', 'etoile', '!', '?', 'note', 'goutte'
function emote(kind, x, y, s, k = 1) {
  if (k < .02) return;
  const p = backOut(k);
  push(); translate(x, y); scale(p);
  if (kind === 'coeur') heart(0, 0, s * .9, PAL.rose);
  else if (kind === 'etoile') paint(starPts(0, 0, s, .45, 5), { wash: PAL.ocre, ink: PAL.ink, sw: .8 });
  else if (kind === 'goutte') { scale(.35); paint(gouttePts(s * 2), { wash: '#FFFFFF', ink: PAL.eauDk, sw: 1 }); }
  else if (kind === 'note') { inkLine([[0, 0], [0, -s * 1.3], [s * .7, -s * 1.1]], 1.2, PAL.ink, 'ink', 0); paint(ellPts(-s * .25, 0, s * .32, s * .24, 10, 0, -.4), { wash: PAL.ink, ink: null }); }
  pop();
  if (kind === '!' || kind === '?') letter(kind, x, y, s * 2.2 * p, PAL.tuile, { font: 'title', halo: PAL.cream });
}

// ---------- outils ----------
// truelle : lame en losange (acier) + manche en bois ; dessinée à l'origine de la main, lame vers +x
function truelle(s, sw, o = {}) {
  push(); rotate(o.rot ?? -.3);
  paint(rrPts(-.3 * s, -.35 * s, 1.7 * s, .7 * s, .3 * s), { wash: PAL.bois, washOp: 255, ink: PAL.ink, sw: sw * .6 });
  inkLine([[1.3 * s, 0], [2 * s, -.5 * s], [2.4 * s, -.3 * s]], sw * .8, PAL.ink, 'inkfine', 0);
  paint([[2.3 * s, -.3 * s], [3.4 * s, -1.4 * s], [5.2 * s, -.2 * s], [3.4 * s, .7 * s]], { wash: '#C8CED3', washOp: 255, ink: PAL.ink, sw: sw * .7 });
  inkLine([[2.6 * s, -.3 * s], [4.9 * s, -.25 * s]], sw * .4, '#FFFFFF', 'inkfine', 0);
  if (o.load) paint(ellPts(3.8 * s, -.6 * s, 1 * s * o.load, .45 * s * o.load, 12), { wash: o.loadCol || PAL.chaux, washOp: 250, ink: PAL.ink, sw: sw * .4 });
  pop();
}
// taloche : planche carrée tenue par dessous
function taloche(s, sw, o = {}) {
  push(); rotate(o.rot ?? 0);
  paint(rrPts(-.3 * s, -.3 * s, .6 * s, 1.6 * s, .25 * s), { wash: PAL.bois, washOp: 255, ink: PAL.ink, sw: sw * .6 });
  paint(rectPts(-2.4 * s, -.9 * s, 4.8 * s, .55 * s, s * .03), { wash: '#D9B98C', washOp: 255, ink: PAL.ink, sw: sw * .7 });
  if (o.load) paint(ellPts(0, -1.2 * s, 1.6 * s * o.load, .55 * s * o.load, 14), { wash: o.loadCol || PAL.chaux, washOp: 250, ink: PAL.ink, sw: sw * .5 });
  pop();
}

// c5_savoir_faire : 47.5 – 55 s. L'artisan arrive devant un vieux mur en pierre et l'enduit à la chaux en trois
// couches (gobetis, corps d'enduit, finition), cochées au fur et à mesure sur son carnet de chantier.
(() => {
  const AX = 470, AY = 872, AS = 30;                                     // l'artisan
  const R = { x0: 522, x1: W + 40, y0: -60, y1: 866 };                   // zone enduite : tout le mur à droite des chaînes d'angle
  const COATS = [[49.0, 50.4], [50.6, 52.0], [52.2, 53.6]];
  const WIN = { x: 1440, y: 250, w: 190, h: 230 };

  function facade() {
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: PAL.ciel, washOp: 255, ink: null });
    paint(rectPts(-40, -40, 440, 900), { fill: '#A8CBE0', fillOp: 70, bleed: .25, tex: .4, border: .2, ink: null });
    paint([[-40, 700], [200, 650], [400, 680], [400, 870], [-40, 870]], { wash: '#C5D6A6', washOp: 255, fill: PAL.sauge, fillOp: 90, bleed: .08, tex: .6, ink: null });
    arbre(150, 870, 1.4, { tex: true, seed: 11 });
    // la façade en pierre
    paint(rectPts(400, 20, W - 400 + 40, 850, 1), { wash: '#E3D8C4', washOp: 255, ink: null });
    paint(rectPts(400, 20, W - 400 + 40, 850, 1), { fill: PAL.pierreDk, fillOp: 60, bleed: .01, tex: .9, border: .3, ink: null });
    stoneWallArea(400, 20, W - 400 + 40, 850, 1.7, 23, [{ x: WIN.x - 20, y: WIN.y - 20, w: WIN.w + 40, h: WIN.h + 40 }, { x: 400, y: 0, w: 120, h: 900 }]);
    for (let i = 0; i < 10; i++) { const bw = (i % 2 ? 70 : 118), by = 870 - (i + 1) * 76; paint(rectPts(400, by + 3, bw, 70, 1), { wash: PAL.pierreLt, washOp: 255, ink: PAL.ink, sw: .8 }); }
    // sol : allée gravillonnée
    paint(rectPts(-40, 866, W + 80, 260), { wash: '#E2D5BA', washOp: 255, fill: '#BFAE8C', fillOp: 90, bleed: .05, tex: .8, border: .4, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 70; i++) paint(ellPts(hash(i * 1.7) * W, 890 + hash(i * 3.1) * 180, 4 + hash(i) * 5, 3 + hash(i + 1) * 3, 7), { wash: pick(['#B7A585', '#CFC1A3', '#9E8E72'], i), washOp: 255, ink: null });
    // matériel : auge de chaux et seau
    paint([[150, 930], [330, 930], [310, 1000], [170, 1000]], { wash: '#6E7B84', washOp: 255, ink: PAL.ink, sw: 1 });
    paint(ellPts(240, 932, 92, 14, 18), { wash: PAL.chaux, washOp: 255, ink: PAL.ink, sw: .7 });
    seau(1720, 1010, .9, { label: 'CHAUX', col: '#EFEBE3', fill: PAL.chaux, heap: true });
  }
  // couches d'enduit : bord qui avance de gauche à droite (p = 0..1)
  function bord(p, seed) { const pts = [], x = lerp(R.x0 - 30, R.x1 + 40, p); for (let i = 0; i <= 14; i++) pts.push([x + Math.sin(i * 1.7 + seed) * 22 + hash(seed + i) * 18, lerp(R.y0, R.y1, i / 14)]); return pts; }
  function couche(p, col, seed, op = 255) {
    if (p <= 0) return;
    const e = bord(p, seed);
    const pts = [[R.x0, R.y0], ...e, [R.x0, R.y1]].map(([x, y]) => [clamp(x, R.x0, R.x1), y]);
    paint(pts, { wash: col, washOp: op, ink: null });
  }
  function gobetis(p) {
    if (p <= 0) return;
    const xe = lerp(R.x0 - 30, R.x1 + 40, p);
    for (let i = 0; i < 260; i++) {
      const x = lerp(R.x0 + 8, R.x1 - 8, hash(i * 1.37)), y = lerp(R.y0 + 8, R.y1 - 8, hash(i * 2.71));
      if (x > xe) continue;
      const r = 10 + hash(i * 3.3) * 16;
      paint(stonePts(x, y, r, r * .8, i + 300, 8), { wash: '#D8CDB6', washOp: 245, ink: null });
    }
  }
  function traces(p, col, seed, n = 14) {
    const xe = lerp(R.x0 - 30, R.x1 + 40, p);
    for (let i = 0; i < n; i++) {
      const x = lerp(R.x0 + 40, R.x1 - 60, hash(seed + i * 1.9)), y = lerp(R.y0 + 30, R.y1 - 30, hash(seed + i * 4.3));
      if (x + 60 > xe) continue;
      inkLine([[x - 50, y + 8], [x, y - 6], [x + 55, y + 6]], .6, col, 'inkfine', .6);
    }
  }
  function carnet(t) {
    const k = backOut(seg(t, 48.0, 48.5)); if (k <= .01) return;
    push(); translate(215, 190); rotate(-.04); scale(k);
    paint(rectPts(-175, -125, 350, 285, 2), { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 5; i++) inkLine([[-150, -50 + i * 48], [150, -50 + i * 48]], .4, PAL.eauLt, 'inkfine', 0);
    paint(ellPts(0, -118, 12, 12, 10), { wash: PAL.tuile, washOp: 255, ink: PAL.ink, sw: .6 });
    pop();
    if (k < .9) return;
    letter('Au programme', 215, 110, 46, PAL.ocreDk, { font: 'hand', rot: -.04 });
    ['1. Gobetis', '2. Corps d’enduit', '3. Finition'].forEach((txt, i) => {
      const [a, b] = COATS[i], y = 172 + i * 56;
      letter(txt, 95, y, 44, PAL.ink, { font: 'hand', align: 'left', pop: seg(t, a - .3, a) * 1.3, rot: -.04 });
      const u = ease(seg(t, b - .1, b + .35));
      if (u > 0) inkLine(partial([[330, y - 2], [345, y + 14], [372, y - 22]], u), 2.4, PAL.olive, 'ink', 0);
    });
  }
  function artisanPose(t) {
    // arrive en marchant, puis gestes d'application selon la couche en cours
    const walkIn = seg(t, 47.5, 48.4), x = lerp(-160, AX, easeOut(walkIn)) - 70 * ease(seg(t, 53.7, 54.3));
    const o = { handR: (s, sw) => truelle(s, sw, { rot: -.2, load: t < 53.6 ? .7 : 0, loadCol: t < 50.6 ? '#D8CDB6' : t < 52.2 ? '#E3D3B3' : PAL.sable }),
      handL: (s, sw) => taloche(s, sw, { rot: .1, load: t < 53.6 ? .9 : 0, loadCol: PAL.chaux }), aL: .15, eyes: 'normal', mouth: 'smile', look: [.8, 0] };
    if (walkIn < 1) o.walk = t * 1.8;
    const c = COATS.findIndex(([a, b]) => t >= a - .1 && t < b);
    if (c === 0) { o.aR = .2 + .45 * Math.abs(Math.sin((t - 49) * 9)); o.mouth = 'o'; }
    else if (c === 1) { o.aR = .1 + .75 * (.5 + .5 * Math.sin((t - 50.6) * 6)); }
    else if (c === 2) { o.aR = .35 + .25 * Math.sin((t - 52.2) * 10); o.eyes = 'happy'; }
    else if (t >= 53.6) { o.aR = lerp(.1, 1.5, backOut(seg(t, 53.8, 54.2))); o.eyes = 'happy'; o.mouth = 'grin'; o.look = [0, 0]; o.emote = 'coeur'; o.emoteK = seg(t, 54.0, 54.3); }
    else o.aR = -.2;
    o.dy = walkIn < 1 ? -Math.abs(Math.sin(t * 1.8 * Math.PI)) * .15 : -.08 * pulse(t, 5);
    return [x, o];
  }
  function chantier(t, lt) {
    camBegin(960, 540, 1.02 - .02 * ease(seg(t, 53.6, 55)), 0);
    drawLayer('c5_facade', facade);
    const p = COATS.map(([a, b]) => easeOut(seg(t, a, b)));
    gobetis(p[0]);
    couche(p[1], '#E4D5B6', 3);
    if (p[1] > 0) traces(p[1], '#CDB995', 5);
    couche(p[2], PAL.sable, 7);
    if (p[2] > 0) { traces(p[2], PAL.ocre, 9, 10); couche(p[2], '#FFFFFF', 7, 40); }
    fenetre(WIN, 1.7, 1.2, {});                                          // la fenêtre reste par-dessus l'enduit
    const done = seg(t, 53.6, 54.2);
    if (done > 0) for (let i = 0; i < 9; i++) { const x = lerp(R.x0 + 60, 1880, hash(i * 5.5)), y = lerp(60, R.y1 - 80, hash(i * 8.1)), k = .5 + .5 * Math.sin(t * 6 + i); paint(starPts(x, y, (10 + 12 * k) * done, .3, 4), { wash: '#FFFFFF', washOp: 240, ink: PAL.ocre, sw: .5 }); }
    const [x, o] = artisanPose(t);
    artisan(x, AY, AS, o);
    carnet(t);
    camEnd();
  }

  chapter('savoir-faire', 47.5, 55, [[47.5, chantier]]);
})();

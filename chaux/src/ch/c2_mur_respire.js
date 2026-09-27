// c2_mur_respire : 10 – 22.5 s. La coupe du mur : pierres, mortier de chaux, sol humide. L'eau du sol monte dans
// le mur puis s'évapore librement par les deux faces : le mur respire. Puis la question : ciment ou chaux ?
(() => {
  const coupeLayer = () => { coupeDecor({}); enduitExt('#EFE6D2'); };
  const N = 10, T0 = 10.9, EVERY = .58, CLIMB = 2.6, GS = 25;

  function sideOf(i) { return hash(i * 7.7 + 3) < .68 ? -1 : 1; }
  function flot(t, tStop = 99) {
    for (let i = 0; i < N; i++) {
      const st = T0 + i * EVERY, a = t - st; if (a < 0 || st > tStop) continue;
      const side = sideOf(i), path = trajet(i, 21, side);
      if (a < CLIMB + .25) goutteSurTrajet(path, a, CLIMB, GS, { mood: a < .5 ? 'surprised' : 'happy', look: [side * .8, -.3] });
      else if (a < CLIMB + .6) {                                       // la goutte passe l'enduit et devient vapeur
        const k = seg(a, CLIMB + .25, CLIMB + .6), [x, y] = path[path.length - 1];
        goutte(x + side * 14 * k, y - 6 * k, GS * (1 - .5 * k), { alpha: 1 - k, mood: 'happy' });
      }
      const [fx, fy] = path[path.length - 1];
      evasion(fx, fy, side, (a - CLIMB - .3) / 2.6, 34 + hash(i) * 10, { seed: i, face: i % 3 !== 2 });
    }
  }
  function etiquettes(t, fade = 1) {
    const k = f => seg(t, f, f + .5) * fade;
    etiquette('Extérieur', 450, 86, null, null, k(10.45), { size: 64 });
    etiquette('Intérieur', 1570, 86, null, null, k(10.55), { size: 64 });
    etiquette('pierre', 540, 330, 790, 352, k(10.9), { bend: -20, size: 54 });
    etiquette('mortier de chaux', 1470, 260, 1150, 252, k(11.3), { bend: 20, fromX: -170, fromY: 10, size: 54 });
    etiquette('sol humide', 330, 912, 752, 915, k(11.7), { bend: 0, bendY: -18, fromX: 120, fromY: 0, size: 54 });
  }
  function solHumide(t, k = 1) {
    // halo bleuté de l'eau dans le sol, sous le mur
    for (let i = 0; i < 3; i++) paint(ellPts(960 + i * 40 - 40, 922, 360 - i * 80, 40 - i * 8, 20), { wash: PAL.eau, washOp: (60 + 16 * Math.sin(t * 2 + i)) * k, ink: null });
  }
  function fleches(t) {
    const k = ease(seg(t, 15.1, 16.1));
    if (k <= 0) return;
    const col = PAL.eauDk;
    const A = [[700, 470], [610, 420], [520, 330], [470, 230]], B = [[1214, 520], [1290, 470], [1350, 380]];
    inkLine(partial(A, k), 2.2, col, 'ink', .7);
    inkLine(partial(B, k), 1.6, col, 'ink', .7);
    if (k > .97) {
      for (const [p, q] of [[A[2], A[3]], [B[1], B[2]]]) { const ang = Math.atan2(q[1] - p[1], q[0] - p[0]), L = 20; inkLine([[q[0] + Math.cos(ang + 2.6) * L, q[1] + Math.sin(ang + 2.6) * L], q, [q[0] + Math.cos(ang - 2.6) * L, q[1] + Math.sin(ang - 2.6) * L]], 2, col, 'ink', 0); }
    }
    etiquette('vapeur d’eau', 330, 200, null, null, seg(t, 15.8, 16.3), { col: PAL.eauDk, size: 50 });
  }

  // 2A · 10 – 18.6 : le mur respire
  function respire(t, lt) {
    const zoom = lerp(1.07, 1.0, ease(lt / 2.2));
    camBegin(960, 530, zoom, 0);
    drawLayer('c2_coupe', coupeLayer);
    soleil(150, 175, 60, t, { rays: true });
    solHumide(t);
    flot(t);
    fleches(t);
    etiquettes(t);
    camEnd();
  }

  // 2B · 18.6 – 22.5 : ciment ou chaux ?
  function question(t, lt) {
    const k = ease(seg(t, 18.6, 19.6));
    camBegin(lerp(960, 900, k), 530, lerp(1.0, 1.03, k), 0);
    drawLayer('c2_coupe', coupeLayer);
    soleil(150, 175, 60, t, { rays: true });
    solHumide(t);
    flot(t, 16.5);
    etiquettes(t, 1 - seg(t, 18.6, 19.0));
    // trois gouttes restées dans le mur regardent les seaux
    [[850, 420], [1010, 600], [890, 770]].forEach(([x, y], i) => {
      const a = seg(t, 18.9 + i * .15, 19.3 + i * .15);
      if (a > 0) goutte(x, y + Math.sin(t * 3 + i) * 4, GS * backOut(a), { mood: t > 19.9 ? 'surprised' : 'normal', look: [-1, .2] });
    });
    const b1 = seg(t, 19.0, 19.45), b2 = seg(t, 19.3, 19.75);
    const dip = seg(t, 21.8, 22.5);
    if (b1 > 0) seau(330, 850 + (1 - backOut(b1)) * 60, 1.05 * backOut(b1), { label: 'CIMENT', col: '#9AA0A4', fill: PAL.ciment, labelCol: '#E4E6E7' });
    if (b2 > 0) seau(575, 850 + (1 - backOut(b2)) * 60, 1.05 * backOut(b2), { label: 'CHAUX', col: '#ECE8E0', fill: PAL.chaux, heap: true });
    const q = seg(t, 19.8, 20.2);
    if (q > 0) letter('?', 452, 560 + Math.sin(t * 4) * 8, 150, PAL.ocreDk, { font: 'title', pop: q, rot: Math.sin(t * 3) * .08, halo: 'rgba(251,247,239,.8)' });
    // la truelle arrive et plonge dans le ciment
    if (dip > 0) {
      const x = lerp(80, 300, ease(dip)), y = lerp(420, 690, ease(dip)) - Math.sin(dip * Math.PI) * 40;
      push(); translate(x, y); rotate(lerp(-.2, .7, ease(dip))); truelle(40, 1.3, { rot: 0 }); pop();
    }
    camEnd();
  }

  chapter('respire', 10, 22.5, [[10, respire], [18.6, question]]);
})();

// c4_chaux : 35 – 47.5 s. La chaux entre en scène (seau lumineux), son cycle (née de la pierre, elle redevient
// pierre en captant le CO₂ de l'air), puis le mur enduit à la chaux respire de nouveau.
(() => {
  const coupeLayer = () => { coupeDecor({}); enduitExt('#EFE6D2'); };
  const RC = [960, 470], RR = 300;                                        // l'anneau du cycle
  const ST = [                                                            // stations : angle, libellé
    { a: -Math.PI / 2, label: 'pierre calcaire', lx: 0, ly: -128 },
    { a: 0, label: 'cuisson ~900 °C', lx: 250, ly: 8 },
    { a: Math.PI / 2, label: 'chaux', lx: 0, ly: 130 },
    { a: Math.PI, label: 'redevient pierre', lx: -250, ly: 8 },
  ];
  const stPos = i => [RC[0] + Math.cos(ST[i].a) * RR, RC[1] + Math.sin(ST[i].a) * RR];
  const POP = i => 38.55 + i * .8;

  // ---------- 4A · la chaux ----------
  function rayons(t, cx, cy, k = 1) {
    for (let i = 0; i < 18; i++) {
      const a0 = t * .08 + i * TAU / 18, a1 = a0 + TAU / 18 * .55, r = 1500;
      paint([[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], { wash: i % 2 ? PAL.ocreLt : PAL.aube, washOp: 90 * k, ink: null });
    }
    paint(ellPts(cx, cy, 380, 380, 30), { wash: PAL.cream, washOp: 150 * k, ink: null });
  }
  function eclat(x, y, r, t, ph) {
    const k = .5 + .5 * Math.sin(t * 5 + ph);
    paint(starPts(x, y, r * (.6 + .5 * k), .3, 4), { wash: '#FFFFFF', washOp: 240, ink: PAL.ocre, sw: .5 });
  }
  function heros(t, lt) {
    camBegin(960, 540, 1 + .04 * ease(lt / 3.3), 0);
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: PAL.chaux, washOp: 255, ink: null });
    rayons(t, 960, 640);
    const b = backOut(seg(t, 35.15, 35.7));
    seau(960, 880, 2.0 * b, { label: 'CHAUX', col: '#EFEBE3', fill: PAL.chaux, heap: true, shine: 1 });
    [[700, 520, 26, 0], [1230, 470, 30, 1], [640, 780, 20, 2], [1290, 760, 24, 3], [960, 330, 18, 4], [820, 400, 14, 5], [1120, 380, 16, 6]].forEach(([x, y, r, i]) => { if (t > 35.5 + i * .1) eclat(x, y, r, t, i); });
    // des bouffées de vapeur heureuses tournent autour
    for (let i = 0; i < 3; i++) {
      const a = t * .9 + i * TAU / 3, x = 960 + Math.cos(a) * 470, y = 560 + Math.sin(a) * 150;
      vapeur(x, y, 40, { alpha: seg(t, 35.8 + i * .2, 36.3 + i * .2), face: true, mood: 'happy', seed: i });
    }
    letter('La chaux', 960, 200, 150, PAL.ink, { font: 'title', pop: seg(t, 35.35, 35.8) });
    letter('le liant de nos anciens', 960, 305, 70, PAL.ocreDk, { font: 'hand', pop: seg(t, 35.8, 36.2), rot: -.02 });
    camEnd();
  }

  // ---------- 4B · le cycle ----------
  function cycleLayer() {
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: PAL.chaux, washOp: 255, ink: null });
    paint(ellPts(RC[0], RC[1], 520, 470, 40), { fill: PAL.ocreLt, fillOp: 110, bleed: .2, tex: .5, border: .3, ink: null });
    paint(ellPts(RC[0], RC[1], RR + 22, RR + 22, 60), { wash: PAL.sable, washOp: 120, ink: null });
    paint(ellPts(RC[0], RC[1], RR - 22, RR - 22, 60), { wash: PAL.chaux, washOp: 255, ink: null });
    for (let i = 0; i < 4; i++) { const [x, y] = stPos(i); paint(ellPts(x, y, 92, 92, 30), { wash: '#FFFFFF', washOp: 255, fill: [PAL.pierreLt, PAL.tuileLt, PAL.eauLt, PAL.sable][i], fillOp: 120, bleed: .1, tex: .5, ink: PAL.ink, sw: 1 }); }
  }
  function iconePierre(x, y, k) {
    push(); translate(x, y); scale(k);
    paint(stonePts(0, 10, 62, 42, 3, 11), { wash: '#D3C6AE', washOp: 255, ink: PAL.ink, sw: 1, curv: .3 });
    for (let i = 0; i < 3; i++) inkLine([[-48 + i * 6, -8 + i * 16], [0, -12 + i * 17], [46 - i * 8, -6 + i * 16]], .6, PAL.pierreDk, 'inkfine', .5);
    pop();
  }
  function iconeFour(x, y, k, t) {
    push(); translate(x, y); scale(k);
    paint([[-50, 60], [-36, -40], [36, -40], [50, 60]], { wash: '#C7704B', washOp: 255, ink: PAL.ink, sw: 1 });
    for (let r = 0; r < 4; r++) inkLine([[-46 + r * 3, 40 - r * 24], [46 - r * 3, 40 - r * 24]], .5, PAL.tuileDk, 'inkfine', 0);
    paint(rrPts(-22, 8, 44, 44, 20), { wash: '#3A2A2A', washOp: 255, ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 3; i++) {
      const f = .75 + .25 * Math.sin(t * 17 + i * 2);
      paint([[-16 + i * 16 - 9, 50], [-16 + i * 16, 50 - 34 * f], [-16 + i * 16 + 9, 50]], { wash: i === 1 ? '#F6C04A' : '#E8743B', washOp: 255, ink: null });
    }
    pop();
  }
  function iconeSeau(x, y, k, t) {
    push(); translate(x, y + 55); scale(k * .62); seau(0, 0, 1, { col: '#EFEBE3', fill: PAL.chaux, heap: true }); pop();
    for (let i = 0; i < 3; i++) { const a = frac(t * 1.2 + i / 3); goutte(x - 30 + i * 30, y - 90 + a * 60, 9, { alpha: k * (1 - a), mood: 'happy' }); }
  }
  function iconeMur(x, y, k) {
    push(); translate(x, y); scale(k);
    paint(rectPts(-58, -46, 116, 92, 1), { wash: '#F4EAD5', washOp: 255, ink: PAL.ink, sw: 1 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) paint(stonePts(-38 + c * 38 + (r % 2) * 10, -26 + r * 28, 15, 10, r * 3 + c + 90, 8), { wash: pick(STONES, r * 3 + c), washOp: 255, ink: PAL.ink, sw: .45 });
    pop();
  }
  function co2(x, y, a) { if (a <= 0 || a >= 1) return; const k = inOut(a, 0, 1, .2); paint(ellPts(x, y, 34, 24, 16), { wash: '#FFFFFF', washOp: 220 * k, ink: PAL.eauDk, sw: .5 }); letter('CO₂', x, y + 1, 26, PAL.eauDk, { font: 'text', weight: 800, alpha: k }); }
  function cycle(t, lt) {
    camBegin(960, 520, 1.0 + .03 * ease(lt / 4), 0);
    drawLayer('c4_cycle', cycleLayer);
    // flèches de l'anneau, dans le sens des aiguilles d'une montre
    for (let i = 0; i < 4; i++) {
      const u = ease(seg(t, POP(i) + .25, POP(i) + .8)); if (u <= 0) continue;
      const a0 = ST[i].a + .38, a1 = ST[i].a + Math.PI / 2 - .38, pts = [];
      for (let j = 0; j <= 16; j++) { const a = lerp(a0, a1, j / 16); pts.push([RC[0] + Math.cos(a) * RR, RC[1] + Math.sin(a) * RR]); }
      inkLine(partial(pts, u), 2.4, PAL.ocreDk, 'ink', .5);
      if (u > .97) { const p = pts[15], q = pts[16], ang = Math.atan2(q[1] - p[1], q[0] - p[0]), L = 22; inkLine([[q[0] + Math.cos(ang + 2.6) * L, q[1] + Math.sin(ang + 2.6) * L], q, [q[0] + Math.cos(ang - 2.6) * L, q[1] + Math.sin(ang - 2.6) * L]], 2.4, PAL.ocreDk, 'ink', 0); }
    }
    // stations
    for (let i = 0; i < 4; i++) {
      const k = backOut(seg(t, POP(i), POP(i) + .4)); if (k <= .01) continue;
      const [x, y] = stPos(i);
      if (i === 0) iconePierre(x, y, k);
      if (i === 1) iconeFour(x, y, k, t);
      if (i === 2) iconeSeau(x, y, k, t);
      if (i === 3) iconeMur(x, y, k);
      etiquette(ST[i].label, x + ST[i].lx, y + ST[i].ly, null, null, seg(t, POP(i) + .15, POP(i) + .5), { size: 50 });
    }
    // le CO₂ quitte le four… et revient se fixer dans le mur
    for (let j = 0; j < 3; j++) { const a = (t - POP(1) - .3 - j * .45) / 1.6; co2(1300 + j * 30 + a * 80, 390 - a * 170, a); }
    for (let j = 0; j < 3; j++) { const a = (t - POP(3) - .2 - j * .4) / 1.4; co2(lerp(360, 600, a), lerp(250 + j * 40, 380, a) + Math.sin(a * 6) * 10, a); }
    // au centre
    letter('Le cycle', 960, 432, 74, PAL.ink, { font: 'title', pop: seg(t, 38.35, 38.8) });
    letter('de la chaux', 960, 512, 64, PAL.ocreDk, { font: 'hand', pop: seg(t, 38.6, 39.0) });
    camEnd();
    revealBlob(t, 38.3, .5, 960, 470, PAL.chaux, 2);
    camBegin(960, 520, 1.0 + .03 * ease(lt / 4), 0);
    // un point lumineux fait le tour une fois l'anneau complet
    const g = seg(t, 41.4, 42.3);
    if (g > 0 && g < 1) { const a = -Math.PI / 2 + g * TAU; paint(starPts(RC[0] + Math.cos(a) * RR, RC[1] + Math.sin(a) * RR, 22, .35, 4), { wash: '#FFFFFF', washOp: 250, ink: PAL.ocre, sw: .6 }); }
    camEnd();
  }

  // ---------- 4C · le mur respire à nouveau ----------
  const LX0 = 690, LX1 = 742;
  function enduitChaux(t) {
    const g = easeOut(seg(t, 42.35, 42.9)), top = lerp(470, -60, g), bot = lerp(500, 860, g);
    paint(rectPts(LX0, top, LX1 - LX0, bot - top, 1), { wash: '#F8F2E4', washOp: 255, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 18; i++) { const y = lerp(top + 10, bot - 10, hash(i * 2.9)); inkLine([[LX0 + 6 + hash(i) * 20, y], [LX0 + 22 + hash(i) * 20, y + 3]], .45, PAL.ocre, 'inkfine', 0); }
  }
  function lampe(t) { paint(ellPts(1720, 480, 150, 130, 24), { wash: '#FFE3A0', washOp: 70 + 15 * Math.sin(t * 2), ink: null }); }
  function coche(txt, x, y, k) {
    if (k <= 0) return;
    const u = ease(seg(k, .2, .8));
    if (u > 0) inkLine(partial([[x - 22, y], [x - 8, y + 16], [x + 20, y - 18]], u), 2.4, PAL.olive, 'ink', 0);
    letter(txt, x + 34, y, 54, PAL.ink, { font: 'hand', align: 'left', pop: k * 1.4, halo: 'rgba(251,247,239,.85)' });
  }
  const N = 9, T0 = 42.8, EVERY = .5, CLIMB = 2.2, GS = 25;
  function respireEncore(t, lt) {
    camBegin(960, 530, 1.02 - .02 * ease(lt / 5), 0);
    drawLayer('c2_coupe', coupeLayer);
    soleil(150, 175, 60, t, { rays: true });
    lampe(t);
    enduitChaux(t);
    etiquette('enduit chaux', 470, 590, 700, 640, seg(t, 42.9, 43.4), { bend: -10, size: 56, fromX: 60 });
    for (let i = 0; i < N; i++) {
      const st = T0 + i * EVERY, a = t - st; if (a < 0) continue;
      const side = hash(i * 7.7 + 3) < .72 ? -1 : 1, path = trajet(i, 45, side, side < 0 ? LX0 + 10 : undefined);
      if (a < CLIMB + .25) goutteSurTrajet(path, a, CLIMB, GS, { mood: 'happy', look: [side * .8, -.3] });
      else if (a < CLIMB + .6) { const k = seg(a, CLIMB + .25, CLIMB + .6), [x, y] = path[path.length - 1]; goutte(x + side * 14 * k, y - 6 * k, GS * (1 - .5 * k), { alpha: 1 - k, mood: 'love' }); }
      const [fx, fy] = path[path.length - 1];
      evasion(side < 0 ? LX0 - 4 : fx, fy, side, (a - CLIMB - .3) / 2.6, 36 + hash(i) * 10, { seed: i, face: true });
    }
    coche('perspirante', 250, 330, seg(t, 43.4, 43.9));
    coche('souple', 250, 410, seg(t, 44.3, 44.8));
    coche('saine', 250, 490, seg(t, 45.2, 45.7));
    camEnd();
    revealBlob(t, 42.3, .5, 960, 470, PAL.chaux, 3);
  }

  chapter('chaux', 35, 47.5, [[35, heros], [38.3, cycle], [42.3, respireEncore]]);
})();
